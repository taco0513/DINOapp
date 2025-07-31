/**
 * Environment configuration for DiNoCal
 * Handles development, staging, and production environments
 */

export const env = {
  // Environment detection
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // Gmail API
  GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
  GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

  // Public features
  ENABLE_GMAIL_INTEGRATION:
    process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

  // API Configuration
  API_RATE_LIMIT_REQUESTS: parseInt(
    process.env.API_RATE_LIMIT_REQUESTS || '100'
  ),
  API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

  // Cache Configuration
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
  ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
  REDIS_URL: process.env.REDIS_URL || '',

  // Security
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

  // Monitoring
  ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required in production
  if (env.isProduction) {
    if (!env.NEXTAUTH_SECRET) {
      errors.push('NEXTAUTH_SECRET is required in production');
    }

    if (!env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required');
    }

    if (!env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required');
    }

    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required');
    }

    if (env.ENABLE_GMAIL_INTEGRATION && !env.GMAIL_CREDENTIALS_PATH) {
      errors.push(
        'GMAIL_CREDENTIALS_PATH is required when Gmail integration is enabled'
      );
    }
  }

  // Always required
  if (!env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get database configuration based on environment
 */
export function getDatabaseConfig() {
  if (env.isProduction) {
    return {
      url: env.DATABASE_URL,
      // Production optimizations
      connectionLimit: 20,
      idleTimeout: 30000,
      acquireTimeout: 60000,
      ssl: env.DATABASE_URL.includes('postgresql')
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  return {
    url: env.DATABASE_URL,
    connectionLimit: 5,
    idleTimeout: 10000,
  };
}

/**
 * Get cache configuration
 */
export function getCacheConfig() {
  return {
    ttl: env.CACHE_TTL_SECONDS * 1000, // Convert to milliseconds
    useRedis: env.ENABLE_REDIS_CACHE && env.isProduction,
    redisUrl: env.REDIS_URL,
    memoryLimit: env.isProduction ? 100 : 50, // MB
    cleanupInterval: 60000, // 1 minute
  };
}

/**
 * Get API rate limiting configuration
 */
export function getRateLimitConfig() {
  return {
    requests: env.API_RATE_LIMIT_REQUESTS,
    window: env.API_RATE_LIMIT_WINDOW,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyPrefix: 'dinocal:ratelimit:',
    // More lenient in development
    multiplier: env.isDevelopment ? 10 : 1,
  };
}

/**
 * Get security headers configuration
 */
export function getSecurityConfig() {
  const baseUrl = env.NEXTAUTH_URL;

  return {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://accounts.google.com',
        'https://apis.google.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': [
        "'self'",
        'data:',
        'https://lh3.googleusercontent.com',
        'https://*.vercel-insights.com',
      ],
      'connect-src': [
        "'self'",
        'https://accounts.google.com',
        'https://www.googleapis.com',
        'https://*.vercel-insights.com',
      ],
      'frame-src': ['https://accounts.google.com'],
    },
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  };
}

/**
 * Export configuration for different environments
 */
export const config = {
  env,
  database: getDatabaseConfig(),
  cache: getCacheConfig(),
  rateLimit: getRateLimitConfig(),
  security: getSecurityConfig(),
  validate: validateEnvironment,
};
