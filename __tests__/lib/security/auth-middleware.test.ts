import {
  AuthMiddleware,
  requireAuth,
  requireRole,
  requirePermission,
  validateSession,
  refreshToken,
  createSession,
  destroySession,
  SessionData,
} from '@/lib/security/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mock database
jest.mock('@/lib/database/db-client', () => ({
  db: {
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const _mockDb = require('@/lib/database/db-client').db;
const mockGetServerSession = getServerSession as jest.Mock;
const _mockJwtSign = jwt.sign as jest.Mock;
const _mockJwtVerify = jwt.verify as jest.Mock;

describe('AuthMiddleware', () => {
  let mockRequest: NextRequest;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/test');
    mockNext = jest.fn().mockResolvedValue(new NextResponse());
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('requireAuth', () => {
    it('should allow authenticated requests', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '123', email: 'test@example.com' },
        expires: '2025-12-31',
      });

      const middleware = requireAuth();
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const middleware = requireAuth();
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: 'Authentication required',
      });
    });

    it('should handle session validation errors', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Session error'));

      const middleware = requireAuth();
      const response = await middleware(mockRequest, mockNext);

      expect(response.status).toBe(401);
    });

    it('should validate JWT token from header', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const requestWithToken = new NextRequest(
        'http://localhost:3000/api/test',
        {
          headers: {
            Authorization: 'Bearer valid-jwt-token',
          },
        }
      );

      mockJwtVerify.mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });

      mockDb.user.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        active: true,
      });

      const middleware = requireAuth();
      const response = await middleware(requestWithToken, mockNext);

      expect(mockJwtVerify).toHaveBeenCalledWith(
        'valid-jwt-token',
        'test-jwt-secret'
      );
      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('requireRole', () => {
    it('should allow users with required role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['admin', 'user'],
        },
      });

      const middleware = requireRole(['admin']);
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject users without required role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['user'],
        },
      });

      const middleware = requireRole(['admin']);
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Insufficient permissions',
      });
    });

    it('should handle multiple required roles (OR logic)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['moderator'],
        },
      });

      const middleware = requireRole(['admin', 'moderator']);
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should require authentication first', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const middleware = requireRole(['admin']);
      const response = await middleware(mockRequest, mockNext);

      expect(response.status).toBe(401);
    });
  });

  describe('requirePermission', () => {
    it('should allow users with required permission', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          permissions: ['read:users', 'write:users'],
        },
      });

      const middleware = requirePermission('read:users');
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject users without required permission', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          permissions: ['read:posts'],
        },
      });

      const middleware = requirePermission('write:users');
      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });

    it('should allow admin users regardless of permissions', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['admin'],
          permissions: [],
        },
      });

      const middleware = requirePermission('any:permission');
      const _response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateSession', () => {
    it('should validate an active session', async () => {
      const sessionId = 'session-123';
      mockDb.session.findUnique.mockResolvedValue({
        id: sessionId,
        userId: '123',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        active: true,
      });

      const result = await validateSession(sessionId);

      expect(result.isValid).toBe(true);
      expect(result.userId).toBe('123');
    });

    it('should reject an expired session', async () => {
      const sessionId = 'session-123';
      mockDb.session.findUnique.mockResolvedValue({
        id: sessionId,
        userId: '123',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        active: true,
      });

      const result = await validateSession(sessionId);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Session expired');
    });

    it('should reject an inactive session', async () => {
      const sessionId = 'session-123';
      mockDb.session.findUnique.mockResolvedValue({
        id: sessionId,
        userId: '123',
        expiresAt: new Date(Date.now() + 3600000),
        active: false,
      });

      const result = await validateSession(sessionId);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Session inactive');
    });

    it('should update last activity timestamp', async () => {
      const sessionId = 'session-123';
      mockDb.session.findUnique.mockResolvedValue({
        id: sessionId,
        userId: '123',
        expiresAt: new Date(Date.now() + 3600000),
        active: true,
      });

      await validateSession(sessionId);

      expect(mockDb.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { lastActivity: expect.any(Date) },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      const oldToken = 'old-token';
      mockJwtVerify.mockReturnValue({
        userId: '123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
      });

      mockDb.user.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        active: true,
      });

      mockJwtSign.mockReturnValue('new-token');

      const result = await refreshToken(oldToken);

      expect(result.success).toBe(true);
      expect(result.token).toBe('new-token');
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '123',
          email: 'test@example.com',
        }),
        'test-jwt-secret',
        expect.any(Object)
      );
    });

    it('should reject an invalid token', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await refreshToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should reject token for inactive user', async () => {
      mockJwtVerify.mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });

      mockDb.user.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        active: false,
      });

      const result = await refreshToken('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User account inactive');
    });
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const sessionData: SessionData = {
        userId: '123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockDb.session.create.mockResolvedValue({
        id: 'session-new-123',
        ...sessionData,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      });

      const session = await createSession(sessionData);

      expect(session.id).toBe('session-new-123');
      expect(mockDb.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: sessionData.userId,
          userAgent: sessionData.userAgent,
          ipAddress: sessionData.ipAddress,
          active: true,
        }),
      });
    });

    it('should set custom expiration time', async () => {
      const sessionData: SessionData = {
        userId: '123',
        expiresIn: 7200, // 2 hours in seconds
      };

      await createSession(sessionData);

      expect(mockDb.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
    });
  });

  describe('destroySession', () => {
    it('should destroy an existing session', async () => {
      const sessionId = 'session-123';
      mockDb.session.update.mockResolvedValue({
        id: sessionId,
        active: false,
      });

      await destroySession(sessionId);

      expect(mockDb.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          active: false,
          destroyedAt: expect.any(Date),
        },
      });
    });

    it('should handle non-existent sessions gracefully', async () => {
      mockDb.session.update.mockRejectedValue(new Error('Session not found'));

      await expect(destroySession('non-existent')).resolves.not.toThrow();
    });
  });

  describe('AuthMiddleware class', () => {
    it('should chain multiple middleware functions', async () => {
      const auth = new AuthMiddleware();

      mockGetServerSession.mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['admin'],
          permissions: ['manage:all'],
        },
      });

      const middleware = auth
        .requireAuth()
        .requireRole(['admin'])
        .requirePermission('manage:all')
        .build();

      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should short-circuit on first failure', async () => {
      const auth = new AuthMiddleware();

      mockGetServerSession.mockResolvedValue(null); // No session

      const middleware = auth.requireAuth().requireRole(['admin']).build();

      const response = await middleware(mockRequest, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(401); // Auth failed, didn't check role
    });
  });
});
