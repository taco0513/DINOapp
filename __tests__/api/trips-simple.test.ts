import { GET, POST } from '@/app/api/trips/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import { getUserTripsOptimized } from '@/lib/database/query-optimizer';

// Get mocked prisma client
const prisma = getPrismaClient();

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

const mockTrip = {
  id: '1',
  userId: 'test-user',
  country: 'France',
  entryDate: '2024-01-01',
  exitDate: '2024-01-15',
  visaType: 'Tourist',
  maxDays: 90,
  passportCountry: 'US',
  notes: 'Test trip 1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockSession = {
  user: {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
  },
};

const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
};

describe('/api/trips API Integration Tests (Simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/trips', () => {
    it('should return trips for authenticated user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (getUserTripsOptimized as jest.Mock).mockResolvedValue([mockTrip]);

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        id: '1',
        country: 'France',
        entryDate: '2024-01-01',
        exitDate: '2024-01-15',
      });
    });

    it('should handle user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should handle database errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (getUserTripsOptimized as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/trips', () => {
    const validTripData = {
      country: 'Italy',
      entryDate: '2024-07-01',
      exitDate: '2024-07-15',
      visaType: 'Tourist' as const,
      maxDays: 90,
      passportCountry: 'US' as const,
      notes: 'Summer vacation',
    };

    it('should create a new trip', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const createdTrip = {
        ...mockTrip,
        ...validTripData,
        id: '3',
        entryDate: new Date(validTripData.entryDate).toISOString(),
        exitDate: new Date(validTripData.exitDate).toISOString(),
      };
      (prisma.countryVisit.create as jest.Mock).mockResolvedValue(createdTrip);

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        country: 'Italy',
      });
    });

    it('should validate required fields', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const invalidData = {
        country: '', // Empty country
        entryDate: '2024-07-01',
        visaType: 'Tourist' as const,
        passportCountry: 'US' as const,
        // Missing maxDays
      };

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.error).toContain('Validation');
    });

    it('should handle user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
