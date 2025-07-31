import {
  ConnectionPool,
  PoolConfig,
  ConnectionState,
  PoolStats,
} from '@/lib/database/connection-pool-v2';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ now: new Date() }]),
    $transaction: jest.fn(),
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('ConnectionPool', () => {
  let pool: ConnectionPool;
  let config: PoolConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      minConnections: 2,
      maxConnections: 10,
      idleTimeout: 30000,
      acquireTimeout: 5000,
      createTimeout: 10000,
      destroyTimeout: 5000,
      createRetries: 3,
      propagateCreateError: false,
      log: false,
    };

    pool = new ConnectionPool(config);
  });

  afterEach(async () => {
    await pool.drain();
    await pool.clear();
  });

  describe('Connection lifecycle', () => {
    it('should create minimum connections on start', async () => {
      await pool.start();

      const stats = pool.getStats();
      expect(stats.size).toBeGreaterThanOrEqual(config.minConnections);
      expect(stats.available).toBeGreaterThanOrEqual(config.minConnections);
    });

    it('should acquire and release connections', async () => {
      await pool.start();

      const connection = await pool.acquire();
      expect(connection).toBeDefined();
      expect(connection.$connect).toBeDefined();

      const statsAfterAcquire = pool.getStats();
      expect(statsAfterAcquire.available).toBe(config.minConnections - 1);
      expect(statsAfterAcquire.borrowed).toBe(1);

      await pool.release(connection);

      const statsAfterRelease = pool.getStats();
      expect(statsAfterRelease.available).toBe(config.minConnections);
      expect(statsAfterRelease.borrowed).toBe(0);
    });

    it('should create new connections when needed', async () => {
      await pool.start();

      // Acquire all minimum connections
      const connections = [];
      for (let i = 0; i < config.minConnections; i++) {
        connections.push(await pool.acquire());
      }

      // Acquire one more - should create new connection
      const extraConnection = await pool.acquire();
      expect(extraConnection).toBeDefined();

      const stats = pool.getStats();
      expect(stats.size).toBe(config.minConnections + 1);

      // Release all
      for (const conn of [...connections, extraConnection]) {
        await pool.release(conn);
      }
    });

    it('should respect maximum connections limit', async () => {
      await pool.start();

      // Try to acquire more than max connections
      const connections = [];
      for (let i = 0; i < config.maxConnections; i++) {
        connections.push(await pool.acquire());
      }

      // This should timeout or wait
      const acquirePromise = pool.acquire();

      // Should be pending
      const stats = pool.getStats();
      expect(stats.size).toBe(config.maxConnections);
      expect(stats.pending).toBe(1);

      // Release one connection
      await pool.release(connections[0]);

      // Now the pending acquire should complete
      const connection = await acquirePromise;
      expect(connection).toBeDefined();

      // Cleanup
      for (let i = 1; i < connections.length; i++) {
        await pool.release(connections[i]);
      }
      await pool.release(connection);
    });

    it('should handle connection errors', async () => {
      // Mock connection failure
      const mockPrismaClient = PrismaClient as jest.MockedClass<
        typeof PrismaClient
      >;
      mockPrismaClient.mockImplementationOnce(
        () =>
          ({
            $connect: jest
              .fn()
              .mockRejectedValue(new Error('Connection failed')),
          }) as any
      );

      await pool.start();

      // Should handle the error and retry
      const stats = pool.getStats();
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Connection validation', () => {
    it('should validate connections before use', async () => {
      await pool.start();

      const connection = await pool.acquire();

      // Mock a failed validation
      connection.$queryRaw = jest
        .fn()
        .mockRejectedValue(new Error('Connection lost'));

      await pool.release(connection);

      // Next acquire should get a different connection
      const newConnection = await pool.acquire();
      expect(newConnection).not.toBe(connection);

      await pool.release(newConnection);
    });

    it('should remove invalid connections from pool', async () => {
      await pool.start();

      const connection = await pool.acquire();
      const initialSize = pool.getStats().size;

      // Mark connection as invalid
      await pool.destroy(connection);

      const finalSize = pool.getStats().size;
      expect(finalSize).toBe(initialSize - 1);
    });
  });

  describe('Pool management', () => {
    it('should drain pool (stop accepting new acquires)', async () => {
      await pool.start();

      await pool.drain();

      // Should reject new acquires
      await expect(pool.acquire()).rejects.toThrow();

      const stats = pool.getStats();
      expect(stats.draining).toBe(true);
    });

    it('should clear pool (remove all connections)', async () => {
      await pool.start();

      const initialStats = pool.getStats();
      expect(initialStats.size).toBeGreaterThan(0);

      await pool.clear();

      const finalStats = pool.getStats();
      expect(finalStats.size).toBe(0);
      expect(finalStats.available).toBe(0);
    });

    it('should handle idle timeout', async () => {
      jest.useFakeTimers();

      const shortIdleConfig = {
        ...config,
        idleTimeout: 1000, // 1 second
        minConnections: 1,
        maxConnections: 5,
      };

      const shortIdlePool = new ConnectionPool(shortIdleConfig);
      await shortIdlePool.start();

      // Create extra connections
      const connections = [];
      for (let i = 0; i < 3; i++) {
        connections.push(await shortIdlePool.acquire());
      }

      // Release them all
      for (const conn of connections) {
        await shortIdlePool.release(conn);
      }

      const statsBeforeTimeout = shortIdlePool.getStats();
      expect(statsBeforeTimeout.size).toBe(3);

      // Fast forward past idle timeout
      jest.advanceTimersByTime(2000);

      // Pool should have evicted idle connections
      const statsAfterTimeout = shortIdlePool.getStats();
      expect(statsAfterTimeout.size).toBe(shortIdleConfig.minConnections);

      await shortIdlePool.drain();
      await shortIdlePool.clear();
      jest.useRealTimers();
    });
  });

  describe('Transaction support', () => {
    it('should handle transactions', async () => {
      await pool.start();

      const connection = await pool.acquire();

      const mockTransaction = jest.fn().mockImplementation(async fn => {
        return fn(connection);
      });
      connection.$transaction = mockTransaction;

      const result = await pool.transaction(async tx => {
        await tx.user.findMany();
        return 'success';
      });

      expect(result).toBe('success');
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should handle transaction rollback', async () => {
      await pool.start();

      const connection = await pool.acquire();

      const mockTransaction = jest.fn().mockImplementation(async fn => {
        try {
          return await fn(connection);
        } catch (error) {
          throw error;
        }
      });
      connection.$transaction = mockTransaction;

      await expect(
        pool.transaction(async tx => {
          await tx.user.findMany();
          throw new Error('Rollback');
        })
      ).rejects.toThrow('Rollback');

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  describe('Statistics and monitoring', () => {
    it('should track pool statistics', async () => {
      await pool.start();

      const stats = pool.getStats();

      expect(stats).toMatchObject({
        size: expect.any(Number),
        available: expect.any(Number),
        borrowed: expect.any(Number),
        pending: expect.any(Number),
        max: config.maxConnections,
        min: config.minConnections,
      });
    });

    it('should track connection creation/destruction', async () => {
      await pool.start();

      const initialStats = pool.getStats();
      const created = initialStats.created;

      // Force new connection creation
      const connections = [];
      for (let i = 0; i < config.minConnections + 2; i++) {
        connections.push(await pool.acquire());
      }

      const afterCreateStats = pool.getStats();
      expect(afterCreateStats.created).toBeGreaterThan(created);

      // Release all
      for (const conn of connections) {
        await pool.release(conn);
      }
    });

    it('should emit events', async () => {
      const events = {
        createConnection: jest.fn(),
        destroyConnection: jest.fn(),
        acquireConnection: jest.fn(),
        releaseConnection: jest.fn(),
      };

      const eventPool = new ConnectionPool({
        ...config,
        events,
      });

      await eventPool.start();

      expect(events.createConnection).toHaveBeenCalled();

      const connection = await eventPool.acquire();
      expect(events.acquireConnection).toHaveBeenCalled();

      await eventPool.release(connection);
      expect(events.releaseConnection).toHaveBeenCalled();

      await eventPool.drain();
      await eventPool.clear();
    });
  });

  describe('Error handling', () => {
    it('should retry connection creation on failure', async () => {
      let attemptCount = 0;
      const mockPrismaClient = PrismaClient as jest.MockedClass<
        typeof PrismaClient
      >;

      mockPrismaClient.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return {
            $connect: jest
              .fn()
              .mockRejectedValue(new Error('Connection failed')),
          } as any;
        }
        return {
          $connect: jest.fn().mockResolvedValue(undefined),
          $disconnect: jest.fn().mockResolvedValue(undefined),
          $queryRaw: jest.fn().mockResolvedValue([{ now: new Date() }]),
        } as any;
      });

      await pool.start();

      // Should eventually succeed after retries
      const stats = pool.getStats();
      expect(stats.size).toBeGreaterThanOrEqual(config.minConnections);
    });

    it('should handle acquire timeout', async () => {
      const timeoutConfig = {
        ...config,
        acquireTimeout: 100, // 100ms timeout
        maxConnections: 1,
      };

      const timeoutPool = new ConnectionPool(timeoutConfig);
      await timeoutPool.start();

      // Acquire the only connection
      const connection = await timeoutPool.acquire();

      // Try to acquire another - should timeout
      await expect(timeoutPool.acquire()).rejects.toThrow(/timeout/i);

      await timeoutPool.release(connection);
      await timeoutPool.drain();
      await timeoutPool.clear();
    });

    it('should handle connection destroy errors gracefully', async () => {
      await pool.start();

      const connection = await pool.acquire();

      // Mock disconnect error
      connection.$disconnect = jest
        .fn()
        .mockRejectedValue(new Error('Disconnect failed'));

      // Should not throw
      await expect(pool.destroy(connection)).resolves.not.toThrow();
    });
  });

  describe('Performance optimizations', () => {
    it('should reuse connections efficiently', async () => {
      await pool.start();

      const connection1 = await pool.acquire();
      const id1 = (connection1 as any).__poolId;

      await pool.release(connection1);

      const connection2 = await pool.acquire();
      const id2 = (connection2 as any).__poolId;

      // Should reuse the same connection
      expect(id2).toBe(id1);

      await pool.release(connection2);
    });

    it('should handle concurrent acquires efficiently', async () => {
      await pool.start();

      const startTime = Date.now();

      // Acquire many connections concurrently
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          pool.acquire().then(async conn => {
            // Simulate some work
            await new Promise(resolve => setTimeout(resolve, 10));
            await pool.release(conn);
          })
        );
      }

      await Promise.all(promises);

      const duration = Date.now() - startTime;

      // Should complete reasonably fast despite connection limit
      expect(duration).toBeLessThan(1000);
    });
  });
});
