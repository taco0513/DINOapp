/**
 * Comprehensive API Tests for /api/trips
 * Trips 관리 API 테스트 스위트
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/trips/route';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import { createTravelManager } from '@/lib/travel-manager';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/database/dev-prisma');
jest.mock('@/lib/travel-manager');
jest.mock('@/lib/security/rate-limiter');
jest.mock('@/lib/security/auth-middleware');
jest.mock('@/lib/security/csrf-protection');
jest.mock('@/lib/security/input-sanitizer');
jest.mock('@/lib/monitoring/metrics-collector');
jest.mock('@/lib/monitoring/logger');

const _mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const _mockGetPrismaClient = getPrismaClient as jest.MockedFunction<
  typeof getPrismaClient
>;
const _mockCreateTravelManager = createTravelManager as jest.MockedFunction<
  typeof createTravelManager
>;

// Mock data
const _mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
};

const _mockTrips = [
  {
    id: '1',
    userId: '1',
    country: 'France',
    entryDate: '2024-01-01T00:00:00Z',
    exitDate: '2024-01-15T00:00:00Z',
    visaType: 'Tourist',
    maxDays: 90,
    passportCountry: 'US',
    status: 'completed',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '1',
    country: 'Germany',
    entryDate: '2024-02-01T00:00:00Z',
    exitDate: null,
    visaType: 'Business',
    maxDays: 90,
    passportCountry: 'US',
    status: 'ongoing',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockTravelManager = {
  getTrips: jest.fn(),
  createTrip: jest.fn(),
};

describe('/api/trips API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockGetPrismaClient.mockReturnValue(mockPrisma as any);
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockCreateTravelManager.mockReturnValue(mockTravelManager as any);

    // Mock security middleware to pass
    require('@/lib/security/rate-limiter').applyRateLimit.mockResolvedValue(
      null
    );
    require('@/lib/security/auth-middleware').securityMiddleware.mockResolvedValue(
      {
        proceed: true,
      }
    );
    require('@/lib/security/csrf-protection').csrfProtection.mockResolvedValue({
      protected: true,
    });
    require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
      {}
    );

    // Mock metrics
    const mockMetrics = {
      requestStart: jest.fn(() => jest.fn()),
      requestEnd: jest.fn(),
      requestError: jest.fn(),
      queryStart: jest.fn(() => jest.fn()),
      queryError: jest.fn(),
    };
    require('@/lib/monitoring/metrics-collector').httpMetrics = mockMetrics;
    require('@/lib/monitoring/metrics-collector').dbMetrics = mockMetrics;
    require('@/lib/monitoring/metrics-collector').businessMetrics = {
      tripCreated: jest.fn(),
    };

    // Mock logger
    require('@/lib/monitoring/logger').createRequestLogger.mockReturnValue(
      () => ({
        logger: { info: jest.fn(), error: jest.fn() },
        end: jest.fn(),
      })
    );
  });

  describe('GET /api/trips', () => {
    it('should return trips for authenticated user', async () => {
      mockTravelManager.getTrips.mockResolvedValue(mockTrips);

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTrips);
      expect(data.count).toBe(2);
      expect(mockTravelManager.getTrips).toHaveBeenCalledWith({
        includeCompleted: true,
        includePlanned: true,
        includeOngoing: true,
        limit: 100,
        sortBy: 'entryDate',
        sortOrder: 'desc',
      });
    });

    it('should handle query parameters correctly', async () => {
      mockTravelManager.getTrips.mockResolvedValue([mockTrips[0]]);

      const request = new NextRequest(
        'http://localhost:3000/api/trips?includeCompleted=true&includePlanned=false&limit=50&sortBy=country&sortOrder=asc'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockTravelManager.getTrips).toHaveBeenCalledWith({
        includeCompleted: true,
        includePlanned: false,
        includeOngoing: true,
        limit: 50,
        sortBy: 'country',
        sortOrder: 'asc',
      });
    });

    it('should return 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });

    it('should handle rate limiting', async () => {
      const rateLimitResponse = new Response('Rate limited', { status: 429 });
      require('@/lib/security/rate-limiter').applyRateLimit.mockResolvedValue(
        rateLimitResponse
      );

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });

    it('should handle security middleware rejection', async () => {
      const securityResponse = new Response('Forbidden', { status: 403 });
      require('@/lib/security/auth-middleware').securityMiddleware.mockResolvedValue(
        {
          proceed: false,
          response: securityResponse,
        }
      );

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('should handle database errors', async () => {
      mockTravelManager.getTrips.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/trips', () => {
    const validTripData = {
      country: 'Spain',
      entryDate: '2024-03-01T00:00:00Z',
      exitDate: '2024-03-15T00:00:00Z',
      visaType: 'Tourist',
      maxDays: 90,
      passportCountry: 'US',
      notes: 'Vacation trip',
      status: 'completed',
      purpose: 'Tourism',
      accommodation: 'Hotel',
      cost: 2000,
      isEmergency: false,
    };

    it('should create a new trip successfully', async () => {
      const mockCreatedTrip = { ...validTripData, id: '3', userId: '1' };
      mockTravelManager.createTrip.mockResolvedValue(mockCreatedTrip);
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        validTripData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCreatedTrip);
      expect(data.message).toBe('Trip created successfully');
      expect(mockTravelManager.createTrip).toHaveBeenCalledWith(validTripData);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validTripData };
      delete invalidData.country;
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        invalidData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.validationErrors).toBeDefined();
    });

    it('should validate visa type enum', async () => {
      const invalidData = { ...validTripData, visaType: 'InvalidType' };
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        invalidData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.validationErrors).toBeDefined();
    });

    it('should validate date formats', async () => {
      const invalidData = { ...validTripData, entryDate: 'invalid-date' };
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        invalidData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.validationErrors).toBeDefined();
    });

    it('should validate maxDays range', async () => {
      const invalidData = { ...validTripData, maxDays: 400 };
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        invalidData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.validationErrors).toBeDefined();
    });

    it('should handle rate limiting for mutations', async () => {
      const rateLimitResponse = new Response('Rate limited', { status: 429 });
      require('@/lib/security/rate-limiter').applyRateLimit.mockResolvedValue(
        rateLimitResponse
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);
    });

    it('should handle CSRF protection failure', async () => {
      const csrfResponse = new Response('CSRF Failed', { status: 403 });
      require('@/lib/security/csrf-protection').csrfProtection.mockResolvedValue(
        {
          protected: false,
          response: csrfResponse,
        }
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('should handle invalid request body', async () => {
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        null
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request body');
    });

    it('should handle database creation errors', async () => {
      mockTravelManager.createTrip.mockRejectedValue(
        new Error('Database error')
      );
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        validTripData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should record business metrics on successful creation', async () => {
      const mockCreatedTrip = { ...validTripData, id: '3', userId: '1' };
      mockTravelManager.createTrip.mockResolvedValue(mockCreatedTrip);
      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        validTripData
      );

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      expect(
        require('@/lib/monitoring/metrics-collector').businessMetrics
          .tripCreated
      ).toHaveBeenCalledWith('Spain', 'Tourist');
    });
  });

  describe('Edge Cases & Security', () => {
    it('should handle unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips');

      // This should be handled by security middleware
      require('@/lib/security/auth-middleware').securityMiddleware.mockResolvedValue(
        {
          proceed: false,
          response: new Response('Unauthorized', { status: 401 }),
        }
      );

      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should sanitize input data correctly', async () => {
      const maliciousData = {
        ...validTripData,
        notes: '<script>alert("xss")</script>Clean notes',
        country: '<img src="x" onerror="alert(1)">France',
      };

      const sanitizedData = {
        ...validTripData,
        notes: 'Clean notes',
        country: 'France',
      };

      require('@/lib/security/input-sanitizer').sanitizeRequestBody.mockResolvedValue(
        sanitizedData
      );
      mockTravelManager.createTrip.mockResolvedValue({
        ...sanitizedData,
        id: '3',
        userId: '1',
      });

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      expect(mockTravelManager.createTrip).toHaveBeenCalledWith(sanitizedData);
    });

    it('should handle concurrent requests gracefully', async () => {
      mockTravelManager.getTrips.mockResolvedValue(mockTrips);

      const request1 = new NextRequest('http://localhost:3000/api/trips');
      const request2 = new NextRequest('http://localhost:3000/api/trips');

      const [response1, response2] = await Promise.all([
        GET(request1),
        GET(request2),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });
});

// Performance and Load Testing Scenarios
describe('Performance Tests', () => {
  it('should handle large trip datasets efficiently', async () => {
    const largeTripData = Array.from({ length: 1000 }, (_, i) => ({
      ...mockTrips[0],
      id: `trip-${i}`,
      country: `Country-${i}`,
    }));

    mockTravelManager.getTrips.mockResolvedValue(largeTripData);

    const start = Date.now();
    const request = new NextRequest('http://localhost:3000/api/trips');
    const response = await GET(request);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

    const data = await response.json();
    expect(data.count).toBe(1000);
  });

  it('should handle pagination parameters correctly', async () => {
    const paginatedTrips = mockTrips.slice(0, 1);
    mockTravelManager.getTrips.mockResolvedValue(paginatedTrips);

    const request = new NextRequest(
      'http://localhost:3000/api/trips?limit=1&sortBy=createdAt&sortOrder=asc'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(1);
    expect(mockTravelManager.getTrips).toHaveBeenCalledWith({
      includeCompleted: true,
      includePlanned: true,
      includeOngoing: true,
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
  });
});
