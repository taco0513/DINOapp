/**
 * Environment Variable Security Validator
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.string().regex(/^\d+$/).optional(),
  DATABASE_CONNECTION_TIMEOUT: z.string().regex(/^\d+$/).optional(),

  // Authentication & Security
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(64).optional(),
  CSRF_SECRET: z.string().min(32).optional(),

  // Session
  SESSION_MAX_AGE: z.string().regex(/^\d+$/).optional(),
  SESSION_UPDATE_AGE: z.string().regex(/^\d+$/).optional(),

  // Rate Limiting
  RATE_LIMIT_GENERAL_REQUESTS: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_GENERAL_WINDOW: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_AUTH_REQUESTS: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_AUTH_WINDOW: z.string().regex(/^\d+$/).optional(),

  // Security Features
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).optional(),
  ENABLE_CSRF_PROTECTION: z.enum(['true', 'false']).optional(),
  ENABLE_INPUT_SANITIZATION: z.enum(['true', 'false']).optional(),
  ENABLE_SECURITY_HEADERS: z.enum(['true', 'false']).optional(),

  // Monitoring (optional in development)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_PWA: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_DEBUG_MODE: z.enum(['true', 'false']).optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  ENABLE_QUERY_LOGGING: z.enum(['true', 'false']).optional(),
  ENABLE_PERFORMANCE_LOGGING: z.enum(['true', 'false']).optional(),
  ENABLE_SECURITY_LOGGING: z.enum(['true', 'false']).optional(),
});

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>;

// Validation function
export function validateEnv(): ValidatedEnv {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });

      // In production, fail fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed. Check the logs above.');
      }
    }
    throw error;
  }
}

// Helper to check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper to check if debug mode is enabled
export function isDebugMode(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true';
}

// Helper to get safe environment variables (no secrets)
export function getSafeEnv() {
  const env = validateEnv();
  const {
    NEXTAUTH_SECRET,
    GOOGLE_CLIENT_SECRET,
    DATABASE_URL,
    ENCRYPTION_KEY,
    CSRF_SECRET,
    SENTRY_DSN,
    ...safeEnv
  } = env;

  return safeEnv;
}

// Initialize validation on module load
if (typeof window === 'undefined') {
  // Server-side only
  validateEnv();
}
