// Setup for API route testing
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Request/Response/Headers if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers || {});
      this.body = init.body;
      this._bodyUsed = false;
    }

    async json() {
      if (this._bodyUsed) throw new Error('Body already read');
      this._bodyUsed = true;
      return JSON.parse(this.body);
    }

    async text() {
      if (this._bodyUsed) throw new Error('Body already read');
      this._bodyUsed = true;
      return this.body;
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Headers(init.headers || {});
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = {};
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value;
        });
      }
    }

    get(name) {
      return this._headers[name.toLowerCase()] || null;
    }

    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }

    has(name) {
      return name.toLowerCase() in this._headers;
    }

    delete(name) {
      delete this._headers[name.toLowerCase()];
    }
  };
}

// Set test environment variable
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';

// Mock security modules
jest.mock('@/lib/security/rate-limiter', () => ({
  applyRateLimit: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/security/auth-middleware', () => ({
  securityMiddleware: jest.fn().mockResolvedValue({ proceed: true }),
}));

jest.mock('@/lib/security/csrf-protection', () => ({
  csrfProtection: jest.fn().mockResolvedValue({ protected: true }),
}));

jest.mock('@/lib/security/input-sanitizer', () => ({
  sanitizeRequestBody: jest.fn().mockImplementation(async request => {
    try {
      const body = await request.json();
      return body;
    } catch {
      return null;
    }
  }),
  InputSanitizer: class InputSanitizer {},
}));

// Mock database module
jest.mock('@/lib/database/dev-prisma', () => ({
  getPrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
    },
    countryVisit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
  devPrisma: {
    user: {
      findUnique: jest.fn(),
    },
    countryVisit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  isDevelopment: true,
}));

// Mock query optimizer
jest.mock('@/lib/database/query-optimizer', () => ({
  getUserTripsOptimized: jest.fn().mockResolvedValue([]),
}));
