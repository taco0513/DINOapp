import {
  CSRFProtection,
  generateToken,
  validateToken,
  getTokenFromRequest,
  CSRFMiddleware,
  DoubleSubmitCookie,
  SynchronizerToken,
  CSRFConfig,
} from '@/lib/security/csrf-protection';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock session storage
jest.mock('@/lib/session-store', () => ({
  sessionStore: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock crypto for deterministic tests
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(),
  timingSafeEqual: jest.fn(),
}));

const mockSessionStore = require('@/lib/session-store').sessionStore;
const mockRandomBytes = crypto.randomBytes as jest.Mock;
const mockTimingSafeEqual = crypto.timingSafeEqual as jest.Mock;

describe('CSRF Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock for randomBytes
    mockRandomBytes.mockImplementation((size: number) =>
      Buffer.from('a'.repeat(size))
    );
    // Setup default mock for timingSafeEqual
    mockTimingSafeEqual.mockImplementation((a: Buffer, b: Buffer) =>
      a.equals(b)
    );
  });

  describe('generateToken', () => {
    it('should generate a token of default length', () => {
      const token = generateToken();

      expect(token).toHaveLength(64); // 32 bytes * 2 (hex)
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
    });

    it('should generate a token of custom length', () => {
      const token = generateToken(16);

      expect(token).toHaveLength(32); // 16 bytes * 2 (hex)
      expect(mockRandomBytes).toHaveBeenCalledWith(16);
    });

    it('should generate unique tokens', () => {
      let callCount = 0;
      mockRandomBytes.mockImplementation((size: number) =>
        Buffer.from((callCount++).toString().padEnd(size, '0'))
      );

      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateToken', () => {
    it('should validate matching tokens', () => {
      const token = 'test-token-123';
      const result = validateToken(token, token);

      expect(result).toBe(true);
      expect(mockTimingSafeEqual).toHaveBeenCalled();
    });

    it('should reject non-matching tokens', () => {
      mockTimingSafeEqual.mockReturnValue(false);

      const result = validateToken('token1', 'token2');

      expect(result).toBe(false);
    });

    it('should handle empty tokens', () => {
      expect(validateToken('', '')).toBe(false);
      expect(validateToken('token', '')).toBe(false);
      expect(validateToken('', 'token')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      validateToken('token1', 'token2');

      expect(mockTimingSafeEqual).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.any(Buffer)
      );
    });
  });

  describe('getTokenFromRequest', () => {
    it('should extract token from header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'X-CSRF-Token': 'header-token',
        },
      });

      const token = getTokenFromRequest(request);
      expect(token).toBe('header-token');
    });

    it('should extract token from form data', async () => {
      const formData = new FormData();
      formData.append('csrf_token', 'form-token');

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: formData,
      });

      // Mock the formData method
      request.formData = jest.fn().mockResolvedValue(formData);

      const token = await getTokenFromRequest(request);
      expect(token).toBe('form-token');
    });

    it('should extract token from JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csrf_token: 'json-token' }),
      });

      // Mock the json method
      request.json = jest.fn().mockResolvedValue({ csrf_token: 'json-token' });

      const token = await getTokenFromRequest(request);
      expect(token).toBe('json-token');
    });

    it('should prefer header over body token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'header-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csrf_token: 'body-token' }),
      });

      const token = await getTokenFromRequest(request);
      expect(token).toBe('header-token');
    });

    it('should return null if no token found', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const token = await getTokenFromRequest(request);
      expect(token).toBeNull();
    });
  });

  describe('CSRFMiddleware', () => {
    let middleware: CSRFMiddleware;
    let mockNext: jest.Mock;

    beforeEach(() => {
      middleware = new CSRFMiddleware();
      mockNext = jest.fn().mockResolvedValue(new NextResponse());
    });

    it('should skip safe methods', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await middleware.protect(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should validate token for unsafe methods', async () => {
      const token = 'valid-csrf-token';
      mockSessionStore.get.mockResolvedValue({ csrfToken: token });

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
          Cookie: 'sessionId=test-session',
        },
      });

      const response = await middleware.protect(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject requests with invalid token', async () => {
      mockSessionStore.get.mockResolvedValue({ csrfToken: 'stored-token' });

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'wrong-token',
          Cookie: 'sessionId=test-session',
        },
      });

      const response = await middleware.protect(request, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Invalid CSRF token',
      });
    });

    it('should reject requests without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });

      const response = await middleware.protect(request, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });

    it('should handle custom configuration', async () => {
      const config: CSRFConfig = {
        tokenLength: 16,
        headerName: 'X-Custom-CSRF',
        skipPaths: ['/api/webhook'],
      };

      const customMiddleware = new CSRFMiddleware(config);

      // Test skip path
      const webhookRequest = new NextRequest(
        'http://localhost:3000/api/webhook',
        {
          method: 'POST',
        }
      );

      const response = await customMiddleware.protect(webhookRequest, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('DoubleSubmitCookie', () => {
    let doubleSubmit: DoubleSubmitCookie;

    beforeEach(() => {
      doubleSubmit = new DoubleSubmitCookie();
    });

    it('should generate and set cookie', () => {
      const response = new NextResponse();
      const token = doubleSubmit.generateToken(response);

      expect(token).toBeDefined();
      expect(response.cookies.get('csrf_token')).toBeDefined();
    });

    it('should validate cookie and header token', () => {
      const token = 'test-token-123';
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'X-CSRF-Token': token,
          Cookie: `csrf_token=${token}`,
        },
      });

      const isValid = doubleSubmit.validateToken(request);
      expect(isValid).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'X-CSRF-Token': 'header-token',
          Cookie: 'csrf_token=cookie-token',
        },
      });

      const isValid = doubleSubmit.validateToken(request);
      expect(isValid).toBe(false);
    });

    it('should handle HttpOnly cookie option', () => {
      const httpOnlyDoubleSubmit = new DoubleSubmitCookie({ httpOnly: true });
      const response = new NextResponse();

      httpOnlyDoubleSubmit.generateToken(response);

      const cookie = response.cookies.get('csrf_token');
      expect(cookie?.httpOnly).toBe(true);
    });
  });

  describe('SynchronizerToken', () => {
    let synchronizer: SynchronizerToken;

    beforeEach(() => {
      synchronizer = new SynchronizerToken();
    });

    it('should generate and store token in session', async () => {
      const sessionId = 'test-session-123';
      const token = await synchronizer.generateToken(sessionId);

      expect(token).toBeDefined();
      expect(mockSessionStore.set).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({ csrfToken: token })
      );
    });

    it('should validate token from session', async () => {
      const sessionId = 'test-session-123';
      const token = 'stored-token';

      mockSessionStore.get.mockResolvedValue({ csrfToken: token });

      const isValid = await synchronizer.validateToken(sessionId, token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid token', async () => {
      const sessionId = 'test-session-123';

      mockSessionStore.get.mockResolvedValue({ csrfToken: 'stored-token' });

      const isValid = await synchronizer.validateToken(
        sessionId,
        'wrong-token'
      );
      expect(isValid).toBe(false);
    });

    it('should handle missing session', async () => {
      mockSessionStore.get.mockResolvedValue(null);

      const isValid = await synchronizer.validateToken('session-123', 'token');
      expect(isValid).toBe(false);
    });

    it('should rotate token on generation', async () => {
      const sessionId = 'test-session-123';

      // Generate first token
      const token1 = await synchronizer.generateToken(sessionId);

      // Change mock behavior for second generation
      mockRandomBytes.mockImplementationOnce((size: number) =>
        Buffer.from('b'.repeat(size))
      );

      // Generate second token
      const token2 = await synchronizer.generateToken(sessionId);

      expect(token1).not.toBe(token2);
      expect(mockSessionStore.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration tests', () => {
    it('should protect API endpoints end-to-end', async () => {
      const middleware = new CSRFMiddleware();
      const mockHandler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      // First request to get token
      const getRequest = new NextRequest(
        'http://localhost:3000/api/csrf-token'
      );
      const tokenResponse = await middleware.getToken(getRequest);
      const { token } = await tokenResponse.json();

      // Store token in session
      mockSessionStore.get.mockResolvedValue({ csrfToken: token });

      // Make protected request with token
      const postRequest = new NextRequest(
        'http://localhost:3000/api/protected',
        {
          method: 'POST',
          headers: {
            'X-CSRF-Token': token,
            Cookie: 'sessionId=test-session',
          },
        }
      );

      const response = await middleware.protect(postRequest, mockHandler);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
