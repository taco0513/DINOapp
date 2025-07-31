// Travel Manager Tests - Core Business Logic Testing

import {
  calculateSchengenStatus,
  validateFutureTrip,
} from '@/lib/schengen-calculator';
import { getCountryByName, VISA_TYPES } from '@/data/countries';

// Mock Prisma first
const mockCountryVisit = {
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteMany: jest.fn(),
  findFirst: jest.fn(),
};

const mockVisaRequirement = {
  findUnique: jest.fn(),
};

const mockTravelAlert = {
  findMany: jest.fn(),
};

const mockTravelPreferences = {
  findUnique: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
};

const mockPrismaClient = {
  countryVisit: mockCountryVisit,
  visaRequirement: mockVisaRequirement,
  travelAlert: mockTravelAlert,
  travelPreferences: mockTravelPreferences,
};

jest.mock('@/lib/database/dev-prisma', () => ({
  getPrismaClient: () => mockPrismaClient,
}));

jest.mock('@/lib/schengen-calculator', () => ({
  calculateSchengenStatus: jest.fn(),
  validateFutureTrip: jest.fn(),
}));

jest.mock('@/data/countries', () => ({
  getCountryByName: jest.fn(),
  VISA_TYPES: ['Tourist', 'Business', 'Work', 'Student', 'Transit'],
  COUNTRIES: [],
}));

// Import after mocks are set up
import {
  TravelManager,
  createTravelManager,
  getUserTravelSummary,
  validateUserTrip,
} from '@/lib/travel-manager';

describe('TravelManager', () => {
  let travelManager: TravelManager;
  const mockUserId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
    travelManager = new TravelManager(mockUserId);
  });

  describe('Constructor and basic setup', () => {
    it('should create TravelManager instance with userId', () => {
      expect(travelManager).toBeDefined();
      expect(travelManager['userId']).toBe(mockUserId);
    });
  });

  describe('getTrips', () => {
    const mockTrips = [
      {
        id: 'trip1',
        userId: 'user123',
        country: 'France',
        entryDate: '2024-01-01T00:00:00.000Z',
        exitDate: '2024-01-10T00:00:00.000Z',
        status: 'completed',
        visaType: 'Tourist',
      },
      {
        id: 'trip2',
        userId: 'user123',
        country: 'Germany',
        entryDate: '2024-02-01T00:00:00.000Z',
        exitDate: null,
        status: 'ongoing',
        visaType: 'Business',
      },
    ];

    it('should get trips with default options', async () => {
      mockCountryVisit.findMany.mockResolvedValue(mockTrips);

      const result = await travelManager.getTrips();

      expect(mockCountryVisit.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: { in: ['completed', 'planned', 'ongoing'] },
        },
        orderBy: { entryDate: 'desc' },
        take: 100,
      });
      expect(result).toEqual(mockTrips);
    });

    it('should filter by specific statuses', async () => {
      mockCountryVisit.findMany.mockResolvedValue([mockTrips[0]]);

      const _result = await travelManager.getTrips({
        includeCompleted: true,
        includePlanned: false,
        includeOngoing: false,
      });

      expect(mockCountryVisit.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: { in: ['completed'] },
        },
        orderBy: { entryDate: 'desc' },
        take: 100,
      });
    });

    it('should apply sorting and limit options', async () => {
      mockCountryVisit.findMany.mockResolvedValue(mockTrips);

      await travelManager.getTrips({
        sortBy: 'createdAt',
        sortOrder: 'asc',
        limit: 50,
      });

      expect(mockCountryVisit.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: { in: ['completed', 'planned', 'ongoing'] },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
    });
  });

  describe('createTrip', () => {
    const validTripData = {
      country: 'France',
      entryDate: '2024-01-01',
      exitDate: '2024-01-10',
      visaType: 'Tourist',
      maxDays: 90,
      passportCountry: 'Korea',
      notes: 'Business trip',
      purpose: 'conference',
    };

    beforeEach(() => {
      (getCountryByName as jest.Mock).mockReturnValue({
        name: 'France',
        code: 'FR',
      });
    });

    it('should create a trip successfully', async () => {
      const createdTrip = { id: 'trip123', ...validTripData };
      mockCountryVisit.create.mockResolvedValue(createdTrip);

      const result = await travelManager.createTrip(validTripData);

      expect(mockCountryVisit.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          country: 'France',
          entryDate: '2024-01-01T00:00:00.000Z',
          exitDate: '2024-01-10T00:00:00.000Z',
          visaType: 'Tourist',
          maxDays: 90,
          passportCountry: 'Korea',
          notes: 'Business trip',
          status: 'completed',
          purpose: 'conference',
          accommodation: null,
          cost: null,
          isEmergency: false,
        },
      });
      expect(result).toEqual(createdTrip);
    });

    it('should throw error for invalid country', async () => {
      (getCountryByName as jest.Mock).mockReturnValue(null);

      await expect(
        travelManager.createTrip({
          ...validTripData,
          country: 'InvalidCountry',
        })
      ).rejects.toThrow('Country "InvalidCountry" not found');
    });

    it('should throw error for invalid visa type', async () => {
      await expect(
        travelManager.createTrip({ ...validTripData, visaType: 'InvalidVisa' })
      ).rejects.toThrow('Invalid visa type: InvalidVisa');
    });

    it('should throw error for invalid date logic', async () => {
      await expect(
        travelManager.createTrip({
          ...validTripData,
          entryDate: '2024-01-10',
          exitDate: '2024-01-01',
        })
      ).rejects.toThrow('Exit date must be after entry date');
    });

    it('should handle trip without exit date', async () => {
      const tripData = { ...validTripData, exitDate: undefined };
      const createdTrip = { id: 'trip123', ...tripData };
      mockCountryVisit.create.mockResolvedValue(createdTrip);

      await travelManager.createTrip(tripData);

      expect(mockCountryVisit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          exitDate: null,
        }),
      });
    });
  });

  describe('updateTrip', () => {
    const tripId = 'trip123';
    const existingTrip = {
      id: tripId,
      userId: mockUserId,
      country: 'France',
      entryDate: '2024-01-01T00:00:00.000Z',
    };

    it('should update trip successfully', async () => {
      mockCountryVisit.findFirst.mockResolvedValue(existingTrip);
      const updatedTrip = { ...existingTrip, notes: 'Updated notes' };
      mockCountryVisit.update.mockResolvedValue(updatedTrip);

      const result = await travelManager.updateTrip(tripId, {
        notes: 'Updated notes',
        cost: 1000,
      });

      expect(mockCountryVisit.findFirst).toHaveBeenCalledWith({
        where: { id: tripId, userId: mockUserId },
      });
      expect(mockCountryVisit.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: {
          notes: 'Updated notes',
          cost: 1000,
        },
      });
      expect(result).toEqual(updatedTrip);
    });

    it('should throw error for unauthorized trip', async () => {
      mockCountryVisit.findFirst.mockResolvedValue(null);

      await expect(
        travelManager.updateTrip(tripId, { notes: 'Updated' })
      ).rejects.toThrow('Trip not found or unauthorized');
    });

    it('should handle date updates', async () => {
      mockCountryVisit.findFirst.mockResolvedValue(existingTrip);
      mockCountryVisit.update.mockResolvedValue(existingTrip);

      await travelManager.updateTrip(tripId, {
        entryDate: '2024-02-01',
        exitDate: '2024-02-10',
      });

      expect(mockCountryVisit.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: {
          entryDate: '2024-02-01T00:00:00.000Z',
          exitDate: '2024-02-10T00:00:00.000Z',
        },
      });
    });

    it('should handle null exit date update', async () => {
      mockCountryVisit.findFirst.mockResolvedValue(existingTrip);
      mockCountryVisit.update.mockResolvedValue(existingTrip);

      await travelManager.updateTrip(tripId, {
        exitDate: null,
      });

      expect(mockCountryVisit.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: {
          exitDate: null,
        },
      });
    });
  });

  describe('deleteTrip', () => {
    it('should delete trip successfully', async () => {
      mockCountryVisit.deleteMany.mockResolvedValue({ count: 1 });

      const result = await travelManager.deleteTrip('trip123');

      expect(mockCountryVisit.deleteMany).toHaveBeenCalledWith({
        where: { id: 'trip123', userId: mockUserId },
      });
      expect(result).toBe(true);
    });

    it('should return false for non-existent trip', async () => {
      mockCountryVisit.deleteMany.mockResolvedValue({ count: 0 });

      const result = await travelManager.deleteTrip('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getTravelInsights', () => {
    const mockTrips = [
      {
        id: '1',
        country: 'France',
        entryDate: '2024-01-01T00:00:00.000Z',
        exitDate: '2024-01-10T00:00:00.000Z',
        status: 'completed',
        visaType: 'Tourist',
        cost: 1000,
      },
      {
        id: '2',
        country: 'Germany',
        entryDate: '2024-02-01T00:00:00.000Z',
        exitDate: '2024-02-05T00:00:00.000Z',
        status: 'completed',
        visaType: 'Business',
        cost: 500,
      },
      {
        id: '3',
        country: 'France',
        entryDate: '2024-03-01T00:00:00.000Z',
        exitDate: null,
        status: 'ongoing',
        visaType: 'Tourist',
        cost: null,
      },
      {
        id: '4',
        country: 'Spain',
        entryDate: '2024-04-01T00:00:00.000Z',
        exitDate: null,
        status: 'planned',
        visaType: 'Tourist',
        cost: null,
      },
    ];

    beforeEach(() => {
      mockCountryVisit.findMany.mockResolvedValue(mockTrips);
      (calculateSchengenStatus as jest.Mock).mockReturnValue({
        usedDays: 15,
        remainingDays: 75,
        isCompliant: true,
      });
    });

    it('should calculate travel insights correctly', async () => {
      const result = await travelManager.getTravelInsights();

      expect(result.summary.totalTrips).toBe(4);
      expect(result.summary.completedTrips).toBe(2);
      expect(result.summary.ongoingTrips).toBe(1);
      expect(result.summary.plannedTrips).toBe(1);
      expect(result.summary.countriesVisited).toBe(3); // France, Germany, Spain
      expect(result.summary.totalDaysAbroad).toBe(15); // 10 + 5 days from completed trips
      expect(result.summary.schengenDaysUsed).toBe(15);
      expect(result.summary.schengenDaysRemaining).toBe(75);
    });

    it('should identify popular destinations', async () => {
      const result = await travelManager.getTravelInsights();

      expect(result.popularDestinations).toEqual([
        { country: 'France', visits: 2, totalDays: 10 },
        { country: 'Spain', visits: 1, totalDays: 0 },
        { country: 'Germany', visits: 1, totalDays: 5 },
      ]);
    });

    it('should calculate travel patterns', async () => {
      const result = await travelManager.getTravelInsights();

      expect(result.travelPatterns.averageTripDuration).toBe(8); // (10 + 5) / 2 = 7.5, rounded to 8
      expect(result.travelPatterns.longestTrip).toBe(10);
      expect(result.travelPatterns.shortestTrip).toBe(5);
      expect(result.travelPatterns.mostCommonVisaType).toBe('Tourist');
      expect(result.travelPatterns.totalSpent).toBe(1500);
    });

    it('should generate recommendations based on Schengen status', async () => {
      (calculateSchengenStatus as jest.Mock).mockReturnValue({
        usedDays: 70,
        remainingDays: 20,
        isCompliant: true,
      });

      const result = await travelManager.getTravelInsights();

      expect(result.recommendations[0]).toContain(
        '셰겐 지역 체류 가능일이 20일 남았습니다'
      );
    });

    it('should warn about Schengen violations', async () => {
      (calculateSchengenStatus as jest.Mock).mockReturnValue({
        usedDays: 95,
        remainingDays: -5,
        isCompliant: false,
      });

      const result = await travelManager.getTravelInsights();

      expect(result.recommendations[0]).toContain('셰겐 규정을 위반했습니다');
    });

    it('should handle empty trips', async () => {
      mockCountryVisit.findMany.mockResolvedValue([]);

      const result = await travelManager.getTravelInsights();

      expect(result.summary.totalTrips).toBe(0);
      expect(result.popularDestinations).toEqual([]);
      expect(result.travelPatterns.averageTripDuration).toBe(0);
    });
  });

  describe('validatePlannedTrip', () => {
    it('should validate planned trip', async () => {
      const mockTrips = [{ id: '1', country: 'France' }];
      const mockValidation = {
        isValid: true,
        violations: [],
        schengenDaysAfter: 15,
      };

      mockCountryVisit.findMany.mockResolvedValue(mockTrips);
      (validateFutureTrip as jest.Mock).mockReturnValue(mockValidation);

      const result = await travelManager.validatePlannedTrip(
        'Germany',
        '2024-06-01',
        '2024-06-10'
      );

      expect(validateFutureTrip).toHaveBeenCalledWith(
        mockTrips,
        new Date('2024-06-01'),
        new Date('2024-06-10'),
        'Germany'
      );
      expect(result).toEqual(mockValidation);
    });
  });

  describe('getVisaRequirements', () => {
    it('should return visa requirements when found', async () => {
      const mockRequirement = {
        fromCountry: 'Korea',
        toCountry: 'France',
        visaRequired: false,
        visaFreeStay: 90,
        visaTypes: '["Tourist", "Business"]',
        requirements: '["Valid passport", "Return ticket"]',
      };
      mockVisaRequirement.findUnique.mockResolvedValue(mockRequirement);

      const result = await travelManager.getVisaRequirements('Korea', 'France');

      expect(result).toEqual({
        ...mockRequirement,
        visaTypes: ['Tourist', 'Business'],
        requirements: ['Valid passport', 'Return ticket'],
      });
    });

    it('should return default when not found', async () => {
      mockVisaRequirement.findUnique.mockResolvedValue(null);

      const result = await travelManager.getVisaRequirements(
        'Korea',
        'UnknownCountry'
      );

      expect(result).toEqual({
        fromCountry: 'Korea',
        toCountry: 'UnknownCountry',
        visaRequired: null,
        visaFreeStay: null,
        visaTypes: [],
        requirements: [],
        note: 'Visa information not available. Please check with relevant embassy.',
      });
    });

    it('should handle database errors', async () => {
      mockVisaRequirement.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(
        travelManager.getVisaRequirements('Korea', 'France')
      ).rejects.toThrow('Failed to fetch visa requirements');
    });
  });

  describe('getTravelAlerts', () => {
    it('should get active travel alerts for country', async () => {
      const mockAlerts = [
        {
          id: '1',
          country: 'France',
          severity: 'high',
          message: 'Security alert',
          isActive: true,
          createdAt: new Date(),
        },
      ];
      mockTravelAlert.findMany.mockResolvedValue(mockAlerts);

      const result = await travelManager.getTravelAlerts('France');

      expect(mockTravelAlert.findMany).toHaveBeenCalledWith({
        where: {
          country: 'France',
          isActive: true,
          OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
        },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('Travel Preferences', () => {
    const mockPreferences = {
      userId: mockUserId,
      preferredRegions: '["Europe", "Asia"]',
      budgetRange: 'medium',
      travelStyle: 'adventure',
      languageSpoken: '["English", "Korean"]',
    };

    describe('getTravelPreferences', () => {
      it('should return parsed preferences when found', async () => {
        mockTravelPreferences.findUnique.mockResolvedValue(mockPreferences);

        const result = await travelManager.getTravelPreferences();

        expect(result).toEqual({
          ...mockPreferences,
          preferredRegions: ['Europe', 'Asia'],
          languageSpoken: ['English', 'Korean'],
        });
      });

      it('should return null when not found', async () => {
        mockTravelPreferences.findUnique.mockResolvedValue(null);

        const result = await travelManager.getTravelPreferences();

        expect(result).toBeNull();
      });
    });

    describe('updateTravelPreferences', () => {
      it('should update existing preferences', async () => {
        mockTravelPreferences.findUnique.mockResolvedValue(mockPreferences);
        mockTravelPreferences.update.mockResolvedValue({
          ...mockPreferences,
          budgetRange: 'high',
        });

        const _result = await travelManager.updateTravelPreferences({
          budgetRange: 'high',
          preferredRegions: ['Europe'],
        });

        expect(mockTravelPreferences.update).toHaveBeenCalledWith({
          where: { userId: mockUserId },
          data: {
            userId: mockUserId,
            budgetRange: 'high',
            preferredRegions: '["Europe"]',
          },
        });
      });

      it('should create new preferences when none exist', async () => {
        mockTravelPreferences.findUnique.mockResolvedValue(null);
        mockTravelPreferences.create.mockResolvedValue(mockPreferences);

        await travelManager.updateTravelPreferences({
          budgetRange: 'medium',
          travelStyle: 'culture',
        });

        expect(mockTravelPreferences.create).toHaveBeenCalledWith({
          data: {
            userId: mockUserId,
            budgetRange: 'medium',
            travelStyle: 'culture',
          },
        });
      });
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTravelManager', () => {
    it('should create TravelManager instance', () => {
      const manager = createTravelManager('user456');
      expect(manager).toBeInstanceOf(TravelManager);
      expect(manager['userId']).toBe('user456');
    });
  });

  describe('getUserTravelSummary', () => {
    it('should return user travel summary', async () => {
      const mockSummary = {
        totalTrips: 5,
        completedTrips: 3,
        ongoingTrips: 1,
        plannedTrips: 1,
        countriesVisited: 3,
        totalDaysAbroad: 25,
        schengenDaysUsed: 15,
        schengenDaysRemaining: 75,
      };

      mockCountryVisit.findMany.mockResolvedValue([]);
      (calculateSchengenStatus as jest.Mock).mockReturnValue({
        usedDays: 15,
        remainingDays: 75,
        isCompliant: true,
      });

      // Mock the getTravelInsights method result
      jest
        .spyOn(TravelManager.prototype, 'getTravelInsights')
        .mockResolvedValue({
          summary: mockSummary,
          popularDestinations: [],
          travelPatterns: {
            averageTripDuration: 5,
            longestTrip: 10,
            shortestTrip: 2,
            mostCommonVisaType: 'Tourist',
          },
          upcomingExpirations: [],
          recommendations: [],
        });

      const result = await getUserTravelSummary('user123');
      expect(result).toEqual(mockSummary);
    });
  });

  describe('validateUserTrip', () => {
    it('should validate user trip', async () => {
      const mockValidation = {
        isValid: true,
        violations: [],
        schengenDaysAfter: 20,
      };

      mockCountryVisit.findMany.mockResolvedValue([]);
      (validateFutureTrip as jest.Mock).mockReturnValue(mockValidation);

      const result = await validateUserTrip(
        'user123',
        'France',
        '2024-06-01',
        '2024-06-10'
      );

      expect(result).toEqual(mockValidation);
    });
  });
});
