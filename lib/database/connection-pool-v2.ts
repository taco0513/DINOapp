// Simplified connection pool for testing

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeout?: number;
  acquireTimeout?: number;
  createTimeout?: number;
  destroyTimeout?: number;
  createRetries?: number;
  propagateCreateError?: boolean;
  log?: boolean;
  events?: {
    createConnection?: () => void;
    destroyConnection?: () => void;
    acquireConnection?: () => void;
    releaseConnection?: () => void;
  };
}

export interface PoolStats {
  size: number;
  available: number;
  borrowed: number;
  pending: number;
  max: number;
  min: number;
  created: number;
  destroyed: number;
  draining: boolean;
}

export enum ConnectionState {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  INVALID = 'invalid',
}

export class ConnectionPool {
  private config: PoolConfig;
  private connections: Set<any> = new Set();
  private availableConnections: any[] = [];
  private borrowedConnections: Set<any> = new Set();
  private pendingAcquires: Array<{
    resolve: (conn: any) => void;
    reject: (err: Error) => void;
  }> = [];
  private isDraining = false;
  private stats = {
    created: 0,
    destroyed: 0,
  };

  constructor(config: PoolConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    // Create minimum connections
    const promises = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }
    await Promise.all(promises);
  }

  private async createConnection(): Promise<any> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const connection = new PrismaClient();

      // Add pool ID for tracking
      (connection as any).__poolId = Math.random().toString(36).substr(2, 9);

      await connection.$connect();

      this.connections.add(connection);
      this.availableConnections.push(connection);
      this.stats.created++;

      if (this.config.events?.createConnection) {
        this.config.events.createConnection();
      }

      return connection;
    } catch (__error) {
      if (this.config.createRetries && this.config.createRetries > 0) {
        // Retry logic would go here
      }
      throw error;
    }
  }

  async acquire(): Promise<any> {
    if (this.isDraining) {
      throw new Error('Pool is draining');
    }

    // Check available connections
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.pop()!;
      this.borrowedConnections.add(connection);

      if (this.config.events?.acquireConnection) {
        this.config.events.acquireConnection();
      }

      return connection;
    }

    // Create new connection if under max
    if (this.connections.size < this.config.maxConnections) {
      const connection = await this.createConnection();
      this.availableConnections.pop(); // Remove from available
      this.borrowedConnections.add(connection);

      if (this.config.events?.acquireConnection) {
        this.config.events.acquireConnection();
      }

      return connection;
    }

    // Wait for connection
    return new Promise((resolve, reject) => {
      this.pendingAcquires.push({ resolve, reject });

      if (this.config.acquireTimeout) {
        setTimeout(() => {
          const index = this.pendingAcquires.findIndex(
            p => p.resolve === resolve
          );
          if (index !== -1) {
            this.pendingAcquires.splice(index, 1);
            reject(new Error('Acquire timeout'));
          }
        }, this.config.acquireTimeout);
      }
    });
  }

  async release(connection: any): Promise<void> {
    if (!this.borrowedConnections.has(connection)) {
      return;
    }

    this.borrowedConnections.delete(connection);

    // Validate connection
    try {
      await connection.$queryRaw`SELECT 1`;

      // Check pending acquires
      if (this.pendingAcquires.length > 0) {
        const { resolve } = this.pendingAcquires.shift()!;
        this.borrowedConnections.add(connection);
        resolve(connection);
      } else {
        this.availableConnections.push(connection);
      }

      if (this.config.events?.releaseConnection) {
        this.config.events.releaseConnection();
      }
    } catch (__error) {
      // Connection is invalid, destroy it
      await this.destroy(connection);
    }
  }

  async destroy(connection: any): Promise<void> {
    this.connections.delete(connection);
    this.borrowedConnections.delete(connection);
    const index = this.availableConnections.indexOf(connection);
    if (index !== -1) {
      this.availableConnections.splice(index, 1);
    }

    try {
      await connection.$disconnect();
    } catch (__error) {
      // Ignore disconnect errors
    }

    this.stats.destroyed++;

    if (this.config.events?.destroyConnection) {
      this.config.events.destroyConnection();
    }

    // Create replacement if below minimum
    if (
      !this.isDraining &&
      this.connections.size < this.config.minConnections
    ) {
      this.createConnection().catch(() => {});
    }
  }

  async drain(): Promise<void> {
    this.isDraining = true;

    // Reject pending acquires
    for (const { reject } of this.pendingAcquires) {
      reject(new Error('Pool is draining'));
    }
    this.pendingAcquires = [];
  }

  async clear(): Promise<void> {
    const allConnections = [...this.connections];
    this.connections.clear();
    this.availableConnections = [];
    this.borrowedConnections.clear();

    await Promise.all(
      allConnections.map(conn => conn.$disconnect().catch(() => {}))
    );
  }

  getStats(): PoolStats {
    return {
      size: this.connections.size,
      available: this.availableConnections.length,
      borrowed: this.borrowedConnections.size,
      pending: this.pendingAcquires.length,
      max: this.config.maxConnections,
      min: this.config.minConnections,
      created: this.stats.created,
      destroyed: this.stats.destroyed,
      draining: this.isDraining,
    };
  }

  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const connection = await this.acquire();
    try {
      return await connection.$transaction(fn);
    } finally {
      await this.release(connection);
    }
  }
}
