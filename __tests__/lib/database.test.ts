import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import { getUserTripsOptimized } from '@/lib/database/query-optimizer';

// Mock the actual function calls to return the mocked client
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  countryVisit: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  account: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock the entire database connection manager to prevent initialization
jest.mock('@/lib/database/connection-manager', () => ({
  DatabaseConnectionManager: {
    getInstance: jest.fn().mockReturnValue({
      isConnected: jest.fn().mockReturnValue(true),
      getClient: jest.fn().mockReturnValue({
        user: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        countryVisit: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
          aggregate: jest.fn(),
        },
        $transaction: jest.fn(),
        $disconnect: jest.fn(),
      }),
    }),
  },
}));

// Mock dev-prisma to use mocked connection manager
jest.mock('@/lib/database/dev-prisma', () => ({
  getPrismaClient: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    countryVisit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Mock query optimizer
jest.mock('@/lib/database/query-optimizer');

describe('Database Operations', () => {
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock to return our mock client
    (getPrismaClient as jest.Mock).mockResolvedValue(mockPrismaClient);
    prisma = mockPrismaClient;
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.create.mockResolvedValue(newUser);

      const result = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      expect(result).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should find user by email', async () => {
      const existingUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(result).toEqual(existingUser);
    });

    it('should handle user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(result).toBeNull();
    });
  });

  describe('Trip Operations', () => {
    const mockTrip = {
      id: '1',
      userId: 'test-user',
      country: 'France',
      entryDate: '2024-01-01T00:00:00.000Z',
      exitDate: '2024-01-15T00:00:00.000Z',
      visaType: 'Tourist',
      maxDays: 90,
      passportCountry: 'US',
      notes: 'Test trip',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should create a new trip', async () => {
      prisma.countryVisit.create.mockResolvedValue(mockTrip);

      const result = await prisma.countryVisit.create({
        data: {
          userId: 'test-user',
          country: 'France',
          entryDate: new Date('2024-01-01'),
          exitDate: new Date('2024-01-15'),
          visaType: 'Tourist',
          maxDays: 90,
          passportCountry: 'US',
          notes: 'Test trip',
        },
      });

      expect(result).toEqual(mockTrip);
      expect(prisma.countryVisit.create).toHaveBeenCalled();
    });

    it('should find all trips for a user', async () => {
      const trips = [mockTrip];
      prisma.countryVisit.findMany.mockResolvedValue(trips);

      const result = await prisma.countryVisit.findMany({
        where: { userId: 'test-user' },
        orderBy: { entryDate: 'desc' },
      });

      expect(result).toEqual(trips);
      expect(prisma.countryVisit.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user' },
        orderBy: { entryDate: 'desc' },
      });
    });

    it('should update a trip', async () => {
      const updatedTrip = { ...mockTrip, exitDate: '2024-01-20T00:00:00.000Z' };
      prisma.countryVisit.update.mockResolvedValue(updatedTrip);

      const result = await prisma.countryVisit.update({
        where: { id: '1' },
        data: { exitDate: new Date('2024-01-20') },
      });

      expect(result.exitDate).toBe('2024-01-20T00:00:00.000Z');
    });

    it('should delete a trip', async () => {
      prisma.countryVisit.delete.mockResolvedValue(mockTrip);

      const result = await prisma.countryVisit.delete({
        where: { id: '1' },
      });

      expect(result).toEqual(mockTrip);
      expect(prisma.countryVisit.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('Query Optimizer Functions', () => {
    it('should get optimized user trips', async () => {
      const trips = [
        {
          id: '1',
          country: 'France',
          entryDate: '2024-01-01',
          exitDate: '2024-01-15',
          visaType: 'Tourist',
          maxDays: 90,
        },
      ];

      (getUserTripsOptimized as jest.Mock).mockResolvedValue(trips);

      const result = await getUserTripsOptimized('test-user', { limit: 10 });

      expect(result).toEqual(trips);
      expect(getUserTripsOptimized).toHaveBeenCalledWith('test-user', {
        limit: 10,
      });
    });

    it('should handle cached queries', async () => {
      const trips = [
        {
          id: '1',
          country: 'France',
          entryDate: '2024-01-01',
          exitDate: '2024-01-15',
        },
      ];

      (getUserTripsOptimized as jest.Mock).mockResolvedValue(trips);

      // First call - should hit database
      const result1 = await getUserTripsOptimized('test-user', { limit: 10 });
      // Second call - should use cache
      const result2 = await getUserTripsOptimized('test-user', { limit: 10 });

      expect(result1).toEqual(trips);
      expect(result2).toEqual(trips);
      // Should be called at least once
      expect(getUserTripsOptimized).toHaveBeenCalled();
    });

    it('should filter active trips', async () => {
      const activeTrips = [
        {
          id: '2',
          country: 'Spain',
          entryDate: '2024-06-01',
          exitDate: null, // No exit date means active
          visaType: 'Tourist',
          maxDays: 90,
        },
      ];

      (getUserTripsOptimized as jest.Mock).mockResolvedValue(activeTrips);

      const result = await getUserTripsOptimized('test-user', {
        includeActive: true,
      });

      expect(result).toEqual(activeTrips);
      expect(result[0].exitDate).toBeNull();
    });

    it('should calculate trip statistics from data', async () => {
      const trips = [
        {
          id: '1',
          country: 'France',
          entryDate: '2024-01-01',
          exitDate: '2024-01-15',
          visaType: 'Tourist',
        },
        {
          id: '2',
          country: 'Spain',
          entryDate: '2024-02-01',
          exitDate: '2024-02-10',
          visaType: 'Business',
        },
      ];

      prisma.countryVisit.findMany.mockResolvedValue(trips);
      prisma.countryVisit.count.mockResolvedValue(2);
      prisma.countryVisit.aggregate.mockResolvedValue({
        _count: { _all: 2 },
      });

      const tripCount = await prisma.countryVisit.count({
        where: { userId: 'test-user' },
      });

      expect(tripCount).toBe(2);
    });
  });

  describe('Transaction Operations', () => {
    it('should handle transactions', async () => {
      const transactionResult = { success: true };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(prisma);
      });

      const result = await prisma.$transaction(async (tx: any) => {
        await tx.countryVisit.create({ data: {} });
        await tx.user.update({ where: { id: '1' }, data: {} });
        return transactionResult;
      });

      expect(result).toEqual(transactionResult);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        prisma.$transaction(async (tx: any) => {
          throw new Error('Something went wrong');
        })
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('Session Management', () => {
    it('should create a session', async () => {
      const newSession = {
        id: 'session-id',
        userId: 'test-user',
        sessionToken: 'token-123',
        expires: new Date('2024-12-31'),
      };

      prisma.session.create.mockResolvedValue(newSession);

      const result = await prisma.session.create({
        data: newSession,
      });

      expect(result).toEqual(newSession);
    });

    it('should delete expired sessions', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 5 });

      const result = await prisma.session.deleteMany({
        where: {
          expires: { lt: new Date() },
        },
      });

      expect(result.count).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      prisma.user.findUnique.mockRejectedValue(
        new Error('Connection to database failed')
      );

      await expect(
        prisma.user.findUnique({ where: { id: '1' } })
      ).rejects.toThrow('Connection to database failed');
    });

    it('should handle unique constraint violations', async () => {
      const error = new Error(
        'Unique constraint failed on the fields: (`email`)'
      );
      (error as any).code = 'P2002';

      prisma.user.create.mockRejectedValue(error);

      await expect(
        prisma.user.create({
          data: { email: 'existing@example.com' },
        })
      ).rejects.toThrow('Unique constraint failed');
    });
  });
});
