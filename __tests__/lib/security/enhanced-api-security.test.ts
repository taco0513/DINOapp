import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withApiSecurity, SecurityPresets } from '@/lib/security/api-security';
// TODO: Remove unused logger import

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/logger');
jest.mock('@/lib/auth');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Enhanced API Security', () => {
  let mockHandler: jest.MockedFunction<any>;
  let request: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    
    // Create a basic request
    request = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000'
      }
    });

    // Mock logger methods
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
  });

  describe('withApiSecurity middleware', () => {
    describe('Method validation', () => {
      it('should allow valid HTTP methods', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          allowedMethods: ['GET', 'POST'],
          requireAuth: false
        });

        const response = await securedHandler(request);
        
        expect(mockHandler).toHaveBeenCalled();
        expect(response.status).toBe(200);
      });

      it('should reject invalid HTTP methods', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          allowedMethods: ['POST'],
          requireAuth: false
        });

        const response = await securedHandler(request);
        
        expect(mockHandler).not.toHaveBeenCalled();
        expect(response.status).toBe(405);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Method not allowed',
          expect.objectContaining({
            method: 'GET',
            url: 'http://localhost:3000/api/test',
            ip: '127.0.0.1'
          })
        );
      });
    });

    describe('Authentication', () => {
      it('should allow requests when auth is disabled', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: false
        });

        const response = await securedHandler(request);
        
        expect(mockGetServerSession).not.toHaveBeenCalled();
        expect(mockHandler).toHaveBeenCalled();
        expect(response.status).toBe(200);
      });

      it('should reject unauthenticated requests when auth is required', async () => {
        mockGetServerSession.mockResolvedValue(null);
        
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: true
        });

        const response = await securedHandler(request);
        
        expect(mockGetServerSession).toHaveBeenCalled();
        expect(mockHandler).not.toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Unauthorized access attempt',
          expect.objectContaining({
            url: 'http://localhost:3000/api/test',
            ip: '127.0.0.1'
          })
        );
      });

      it('should allow authenticated requests', async () => {
        const mockSession = {
          user: { id: '1', email: 'user@example.com', role: 'USER' }
        };
        mockGetServerSession.mockResolvedValue(mockSession);
        
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: true
        });

        const response = await securedHandler(request);
        
        expect(mockHandler).toHaveBeenCalledWith(request, expect.objectContaining({
          user: mockSession.user,
          session: mockSession
        }));
        expect(response.status).toBe(200);
      });
    });

    describe('Admin authorization', () => {
      it('should reject non-admin users when admin is required', async () => {
        const mockSession = {
          user: { id: '1', email: 'user@example.com', role: 'USER' }
        };
        mockGetServerSession.mockResolvedValue(mockSession);
        
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: true,
          requireAdmin: true
        });

        const response = await securedHandler(request);
        
        expect(mockHandler).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Admin access denied',
          expect.objectContaining({
            userId: '1',
            url: 'http://localhost:3000/api/test',
            ip: '127.0.0.1'
          })
        );
      });

      it('should allow admin users when admin is required', async () => {
        const mockSession = {
          user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
        };
        mockGetServerSession.mockResolvedValue(mockSession);
        
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: true,
          requireAdmin: true
        });

        const response = await securedHandler(request);
        
        expect(mockHandler).toHaveBeenCalled();
        expect(response.status).toBe(200);
      });
    });

    describe('Rate limiting', () => {
      it('should allow requests within rate limit', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: false,
          rateLimit: { windowMs: 60000, maxRequests: 5 }
        });

        // Make multiple requests within limit
        for (let i = 0; i < 3; i++) {
          const response = await securedHandler(request);
          expect(response.status).toBe(200);
        }

        expect(mockHandler).toHaveBeenCalledTimes(3);
      });

      it('should reject requests exceeding rate limit', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: false,
          rateLimit: { windowMs: 60000, maxRequests: 2 }
        });

        // Make requests to exceed limit
        await securedHandler(request);
        await securedHandler(request);
        const response = await securedHandler(request);

        expect(response.status).toBe(429);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Rate limit exceeded',
          expect.objectContaining({
            ip: '127.0.0.1',
            url: 'http://localhost:3000/api/test'
          })
        );
      });

      it('should use predefined rate limit presets', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: false,
          rateLimit: 'auth'  // 5 requests per 15 minutes
        });

        // Make requests up to limit
        for (let i = 0; i < 5; i++) {
          const response = await securedHandler(request);
          expect(response.status).toBe(200);
        }

        // Next request should be rate limited
        const response = await securedHandler(request);
        expect(response.status).toBe(429);
      });
    });

    describe('Request logging', () => {
      it('should log completed requests when enabled', async () => {
        const mockSession = {
          user: { id: '1', email: 'user@example.com' }
        };
        mockGetServerSession.mockResolvedValue(mockSession);
        
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: true,
          logRequests: true
        });

        const response = await securedHandler(request);
        
        expect(mockLogger.info).toHaveBeenCalledWith(
          'API request completed',
          expect.objectContaining({
            method: 'GET',
            url: 'http://localhost:3000/api/test',
            status: 200,
            userId: '1',
            ip: '127.0.0.1',
            duration: expect.any(Number)
          })
        );
      });

      it('should not log when disabled', async () => {
        const securedHandler = withApiSecurity(mockHandler, {
          requireAuth: false,
          logRequests: false
        });

        await securedHandler(request);
        
        expect(mockLogger.info).not.toHaveBeenCalled();
      });
    });

    describe('Error handling', () => {
      it('should handle handler errors gracefully', async () => {
        const errorHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
        const securedHandler = withApiSecurity(errorHandler, {
          requireAuth: false
        });

        const response = await securedHandler(request);
        
        expect(response.status).toBe(500);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'API security middleware error',
          expect.objectContaining({
            error: expect.any(Error),
            url: 'http://localhost:3000/api/test',
            method: 'GET',
            ip: '127.0.0.1'
          })
        );
      });
    });
  });

  describe('Security presets', () => {
    it('should apply PUBLIC preset correctly', async () => {
      const securedHandler = withApiSecurity(mockHandler, SecurityPresets.PUBLIC);
      
      const response = await securedHandler(request);
      
      expect(mockGetServerSession).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should apply ADMIN_ONLY preset correctly', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const securedHandler = withApiSecurity(mockHandler, SecurityPresets.ADMIN_ONLY);
      
      const response = await securedHandler(request);
      
      expect(response.status).toBe(401);
    });

    it('should apply AUTHENTICATED preset correctly', async () => {
      const mockSession = {
        user: { id: '1', email: 'user@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession);
      
      const securedHandler = withApiSecurity(mockHandler, SecurityPresets.AUTHENTICATED);
      
      const response = await securedHandler(request);
      
      expect(response.status).toBe(200);
    });

    it('should apply ANALYTICS preset with correct rate limiting', async () => {
      const mockSession = {
        user: { id: '1', email: 'user@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession);
      
      const securedHandler = withApiSecurity(mockHandler, SecurityPresets.ANALYTICS);
      
      // Make requests up to analytics limit (30 per minute)
      for (let i = 0; i < 30; i++) {
        const response = await securedHandler(request);
        expect(response.status).toBe(200);
      }

      // Next request should be rate limited
      const response = await securedHandler(request);
      expect(response.status).toBe(429);
    });

    it('should apply AUTH_ENDPOINT preset with POST only', async () => {
      const getHandler = withApiSecurity(mockHandler, SecurityPresets.AUTH_ENDPOINT);
      
      const getResponse = await getHandler(request);
      expect(getResponse.status).toBe(405); // Method not allowed

      const postRequest = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'origin': 'http://localhost:3000',
          'host': 'localhost:3000'
        }
      });

      const postResponse = await getHandler(postRequest);
      expect(postResponse.status).toBe(200);
    });
  });

  describe('CSRF protection', () => {
    it('should allow same-origin requests', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3000',
          'host': 'localhost:3000',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      const securedHandler = withApiSecurity(mockHandler, {
        requireAuth: false,
        allowedMethods: ['POST']
      });

      const response = await securedHandler(postRequest);
      
      expect(response.status).toBe(200);
    });

    it('should reject cross-origin requests from unauthorized origins', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://malicious-site.com',
          'host': 'localhost:3000',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      const securedHandler = withApiSecurity(mockHandler, {
        requireAuth: false,
        allowedMethods: ['POST']
      });

      const response = await securedHandler(postRequest);
      
      expect(response.status).toBe(403);
    });
  });

  describe('Input validation', () => {
    it('should validate content-type for POST requests', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3000',
          'host': 'localhost:3000',
          'content-type': 'text/plain'
        },
        body: 'plain text'
      });

      const securedHandler = withApiSecurity(mockHandler, {
        requireAuth: false,
        allowedMethods: ['POST'],
        validateInput: true
      });

      const response = await securedHandler(postRequest);
      
      expect(response.status).toBe(400);
    });

    it('should accept JSON content-type for POST requests', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3000',
          'host': 'localhost:3000',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      const securedHandler = withApiSecurity(mockHandler, {
        requireAuth: false,
        allowedMethods: ['POST'],
        validateInput: true
      });

      const response = await securedHandler(postRequest);
      
      expect(response.status).toBe(200);
    });
  });
});