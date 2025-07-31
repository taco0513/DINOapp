// DB Utils Tests - Database Utility Functions Testing

import {
  getUserByEmail,
  getUserById,
  createCountryVisit,
  updateCountryVisit,
  deleteCountryVisit,
  getUserCountryVisits,
  getSchengenCountryVisits,
  updateNotificationSettings,
  getUserTravelStats,
  invalidateUserCache,
} from '@/lib/db-utils';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    countryVisit: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    notificationSettings: {
      upsert: jest.fn(),
    },
  },
}));

const mockPrisma = require('@/lib/prisma').prisma;

// Mock performance monitor
jest.mock('@/lib/db-performance', () => ({
  dbPerformanceMonitor: {
    trackQuery: jest.fn(),
  },
  OptimizedQueries: {
    getUserWithTrips: jest.fn(),
    getSchengenVisitsOptimized: jest.fn(),
    getCountryStatistics: jest.fn(),
    clearUserCache: jest.fn(),
  },
}));

const mockDbPerformanceMonitor =
  require('@/lib/db-performance').dbPerformanceMonitor;

describe('DB Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User operations', () => {
    describe('getUserByEmail', () => {
      it('should get user by email with related data', async () => {
        const mockUser = {
          id: 'user1',
          email: 'test@example.com',
          countryVisits: [],
          notificationSettings: { emailEnabled: true },
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await getUserByEmail('test@example.com');

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          include: {
            countryVisits: {
              orderBy: { entryDate: 'desc' },
              take: 50,
            },
            notificationSettings: true,
          },
        });
        expect(result).toEqual(mockUser);
        expect(mockDbPerformanceMonitor.trackQuery).toHaveBeenCalledWith(
          'getUserByEmail',
          expect.any(Number),
          { email: 'test@example.com' }
        );
      });

      it('should return null for non-existent user', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const result = await getUserByEmail('nonexistent@example.com');

        expect(result).toBeNull();
      });
    });

    describe('getUserById', () => {
      it('should use optimized query to get user by ID', async () => {
        const mockUser = { id: 'user1', email: 'test@example.com' };
        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getUserWithTrips.mockResolvedValue(mockUser);

        const result = await getUserById('user1');

        expect(OptimizedQueries.getUserWithTrips).toHaveBeenCalledWith(
          mockPrisma,
          'user1',
          50
        );
        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('Country visit operations', () => {
    describe('createCountryVisit', () => {
      it('should create country visit with proper date conversion', async () => {
        const visitData = {
          userId: 'user1',
          country: 'France',
          entryDate: new Date('2024-01-01'),
          exitDate: new Date('2024-01-10'),
          visaType: 'Tourist' as const,
          maxDays: 90,
          passportCountry: 'Korea' as const,
          notes: 'Business trip',
        };

        const createdVisit = { id: 'visit1', ...visitData };
        mockPrisma.countryVisit.create.mockResolvedValue(createdVisit);

        const result = await createCountryVisit(visitData);

        expect(mockPrisma.countryVisit.create).toHaveBeenCalledWith({
          data: {
            ...visitData,
            entryDate: new Date(visitData.entryDate),
            exitDate: new Date(visitData.exitDate),
          },
        });
        expect(result).toEqual(createdVisit);
      });

      it('should handle null exit date', async () => {
        const visitData = {
          userId: 'user1',
          country: 'Germany',
          entryDate: new Date('2024-02-01'),
          exitDate: null,
          visaType: 'Business' as const,
          maxDays: 90,
          passportCountry: 'Korea' as const,
        };

        await createCountryVisit(visitData);

        expect(mockPrisma.countryVisit.create).toHaveBeenCalledWith({
          data: {
            ...visitData,
            entryDate: new Date(visitData.entryDate),
            exitDate: null,
          },
        });
      });
    });

    describe('updateCountryVisit', () => {
      it('should update country visit with date conversion', async () => {
        const updateData = {
          country: 'Spain',
          entryDate: new Date('2024-03-01'),
          exitDate: new Date('2024-03-10'),
          notes: 'Updated notes',
        };

        const updatedVisit = { id: 'visit1', ...updateData };
        mockPrisma.countryVisit.update.mockResolvedValue(updatedVisit);

        const result = await updateCountryVisit('visit1', updateData);

        expect(mockPrisma.countryVisit.update).toHaveBeenCalledWith({
          where: { id: 'visit1' },
          data: {
            ...updateData,
            entryDate: new Date(updateData.entryDate),
            exitDate: new Date(updateData.exitDate),
          },
        });
        expect(result).toEqual(updatedVisit);
      });

      it('should handle partial updates', async () => {
        const updateData = { notes: 'Updated notes only' };

        await updateCountryVisit('visit1', updateData);

        expect(mockPrisma.countryVisit.update).toHaveBeenCalledWith({
          where: { id: 'visit1' },
          data: {
            notes: 'Updated notes only',
            entryDate: undefined,
            exitDate: undefined,
          },
        });
      });
    });

    describe('deleteCountryVisit', () => {
      it('should delete country visit by ID', async () => {
        const deletedVisit = { id: 'visit1' };
        mockPrisma.countryVisit.delete.mockResolvedValue(deletedVisit);

        const result = await deleteCountryVisit('visit1');

        expect(mockPrisma.countryVisit.delete).toHaveBeenCalledWith({
          where: { id: 'visit1' },
        });
        expect(result).toEqual(deletedVisit);
      });
    });

    describe('getUserCountryVisits', () => {
      it('should get user country visits with performance tracking', async () => {
        const mockVisits = [
          { id: 'visit1', country: 'France' },
          { id: 'visit2', country: 'Germany' },
        ];

        mockPrisma.countryVisit.findMany.mockResolvedValue(mockVisits);

        const result = await getUserCountryVisits('user1', 50);

        expect(mockPrisma.countryVisit.findMany).toHaveBeenCalledWith({
          where: { userId: 'user1' },
          orderBy: { entryDate: 'desc' },
          take: 50,
        });
        expect(result).toEqual(mockVisits);
        expect(mockDbPerformanceMonitor.trackQuery).toHaveBeenCalledWith(
          'getUserCountryVisits',
          expect.any(Number),
          { userId: 'user1', limit: 50 }
        );
      });

      it('should use default limit when not specified', async () => {
        mockPrisma.countryVisit.findMany.mockResolvedValue([]);

        await getUserCountryVisits('user1');

        expect(mockPrisma.countryVisit.findMany).toHaveBeenCalledWith({
          where: { userId: 'user1' },
          orderBy: { entryDate: 'desc' },
          take: 100,
        });
      });
    });

    describe('getSchengenCountryVisits', () => {
      it('should use optimized Schengen query', async () => {
        const fromDate = new Date('2024-01-01');
        const toDate = new Date('2024-12-31');
        const mockVisits = [{ id: 'visit1', country: 'France' }];

        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getSchengenVisitsOptimized.mockResolvedValue(
          mockVisits
        );

        const result = await getSchengenCountryVisits(
          'user1',
          fromDate,
          toDate
        );

        expect(
          OptimizedQueries.getSchengenVisitsOptimized
        ).toHaveBeenCalledWith(mockPrisma, 'user1', fromDate, toDate);
        expect(result).toEqual(mockVisits);
      });

      it('should use current date as default toDate', async () => {
        const fromDate = new Date('2024-01-01');
        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getSchengenVisitsOptimized.mockResolvedValue([]);

        await getSchengenCountryVisits('user1', fromDate);

        expect(
          OptimizedQueries.getSchengenVisitsOptimized
        ).toHaveBeenCalledWith(mockPrisma, 'user1', fromDate, expect.any(Date));
      });
    });
  });

  describe('Notification settings', () => {
    describe('updateNotificationSettings', () => {
      it('should upsert notification settings with JSON serialization', async () => {
        const settings = {
          visaExpiryDays: [7, 14, 30],
          schengenWarningDays: 30,
          emailEnabled: true,
          pushEnabled: false,
        };

        const updatedSettings = { userId: 'user1', ...settings };
        mockPrisma.notificationSettings.upsert.mockResolvedValue(
          updatedSettings
        );

        const result = await updateNotificationSettings('user1', settings);

        expect(mockPrisma.notificationSettings.upsert).toHaveBeenCalledWith({
          where: { userId: 'user1' },
          update: {
            ...settings,
            visaExpiryDays: JSON.stringify(settings.visaExpiryDays),
          },
          create: {
            userId: 'user1',
            ...settings,
            visaExpiryDays: JSON.stringify(settings.visaExpiryDays),
          },
        });
        expect(result).toEqual(updatedSettings);
      });

      it('should use default visa expiry days when creating new settings', async () => {
        const settings = {
          emailEnabled: true,
          pushEnabled: true,
        };

        await updateNotificationSettings('user1', settings);

        const expectedCall =
          mockPrisma.notificationSettings.upsert.mock.calls[0][0];
        expect(expectedCall.create.visaExpiryDays).toBe('7,14,30');
      });
    });
  });

  describe('Analytics', () => {
    describe('getUserTravelStats', () => {
      it('should calculate comprehensive travel statistics', async () => {
        const mockCountryStats = [
          { country: 'France', total_days: '15', visit_count: '2' },
          { country: 'Germany', total_days: '10', visit_count: '1' },
          { country: 'Japan', total_days: '7', visit_count: '1' },
        ];

        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getCountryStatistics.mockResolvedValue(
          mockCountryStats
        );

        const result = await getUserTravelStats('user1');

        expect(OptimizedQueries.getCountryStatistics).toHaveBeenCalledWith(
          mockPrisma,
          'user1'
        );
        expect(result).toEqual({
          totalCountries: 3,
          totalDays: 32,
          schengenDays: 25, // France + Germany
          totalVisits: 4,
          countryBreakdown: mockCountryStats,
        });
      });

      it('should handle empty statistics', async () => {
        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getCountryStatistics.mockResolvedValue([]);

        const result = await getUserTravelStats('user1');

        expect(result).toEqual({
          totalCountries: 0,
          totalDays: 0,
          schengenDays: 0,
          totalVisits: 0,
          countryBreakdown: [],
        });
      });

      it('should handle null values in statistics', async () => {
        const mockCountryStats = [
          { country: 'France', total_days: null, visit_count: '1' },
          { country: 'Germany', total_days: '10', visit_count: null },
        ];

        const { OptimizedQueries } = require('@/lib/db-performance');
        OptimizedQueries.getCountryStatistics.mockResolvedValue(
          mockCountryStats
        );

        const result = await getUserTravelStats('user1');

        expect(result.totalDays).toBe(10);
        expect(result.totalVisits).toBe(1);
        expect(result.schengenDays).toBe(10);
      });
    });
  });

  describe('Cache management', () => {
    describe('invalidateUserCache', () => {
      it('should clear user cache', () => {
        const { OptimizedQueries } = require('@/lib/db-performance');

        invalidateUserCache('user1');

        expect(OptimizedQueries.clearUserCache).toHaveBeenCalledWith('user1');
      });
    });
  });
});
