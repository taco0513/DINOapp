import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

/**
 * API Security utilities for DINO
 * Provides authentication, authorization, input validation, and rate limiting
 */

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 login attempts per 15 minutes
  admin: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 admin requests per minute
  analytics: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 analytics requests per minute
};

// Simple in-memory rate limiter (production should use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return true;
  }

  if (record.count >= config.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export interface ApiSecurityOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  allowedMethods?: string[]
  rateLimit?: keyof typeof DEFAULT_RATE_LIMITS | RateLimitConfig
  validateInput?: boolean
  logRequests?: boolean
}

/**
 * Secure API route wrapper with comprehensive security checks
 */
export function withApiSecurity(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: ApiSecurityOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    const {
      requireAuth = true,
      requireAdmin = false,
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
      rateLimit = 'default',
      validateInput = true,
      logRequests = true
    } = options

    const startTime = Date.now();
    let session = null;

    try {
      // 1. Method validation
      if (!allowedMethods.includes(req.method || '')) {
        if (logRequests) {
          logger.warn('Method not allowed', {
            method: req.method,
            url: req.url,
            ip: req.ip || req.headers.get('x-forwarded-for')
          });
        }
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // 2. Rate limiting
      if (rateLimit) {
        const rateLimitConfig = typeof rateLimit === 'string' 
          ? DEFAULT_RATE_LIMITS[rateLimit]
          : rateLimit;
        
        const clientKey = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = `${clientKey}:${req.nextUrl.pathname}`;
        
        if (!checkRateLimit(rateLimitKey, rateLimitConfig)) {
          logger.warn('Rate limit exceeded', {
            ip: clientKey,
            url: req.url,
            config: rateLimitConfig
          });
          return NextResponse.json(
            { success: false, error: rateLimitConfig.message || 'Too many requests' },
            { status: 429 }
          );
        }
      }

      // 3. Authentication check
      if (requireAuth || requireAdmin) {
        session = await getServerSession(authOptions)
        if (!session?.user) {
          if (logRequests) {
            logger.warn('Unauthorized access attempt', {
              url: req.url,
              ip: req.ip || req.headers.get('x-forwarded-for')
            });
          }
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }
        
        // Add user to context
        context = { ...context, user: session.user, session }
      }

      // 4. Admin authorization check
      if (requireAdmin) {
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
          logger.warn('Admin access denied', {
            userId: session?.user?.id,
            url: req.url,
            ip: req.ip || req.headers.get('x-forwarded-for')
          });
          return NextResponse.json(
            { success: false, error: 'Forbidden - Admin access required' },
            { status: 403 }
          );
        }
      }

      // 5. Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // 6. CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')
        
        if (origin && !isAllowedOrigin(origin, host)) {
          return NextResponse.json(
            { success: false, error: 'Invalid origin' },
            { status: 403 }
          )
        }
      }

      // 7. Call the actual handler
      const response = await handler(req, context)

      // 8. Request logging
      if (logRequests) {
        const duration = Date.now() - startTime;
        logger.info('API request completed', {
          method: req.method,
          url: req.url,
          status: response.status,
          duration,
          userId: session?.user?.id,
          ip: req.ip || req.headers.get('x-forwarded-for')
        });
      }

      return response;

    } catch (error) {
      logger.error('API security middleware error', {
        error,
        url: req.url,
        method: req.method,
        ip: req.ip || req.headers.get('x-forwarded-for')
      });
      
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Input validation helpers
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  date: (dateString: string): boolean => {
    const date = new Date(dateString)
    return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
  },

  visaType: (type: string): boolean => {
    const allowedTypes = [
      'Tourist', 'Business', 'Student', 'Work', 'Transit', 'Diplomatic',
      'Official', 'Journalist', 'Medical', 'Family', 'Investor', 'Artist',
      'Researcher', 'Other'
    ]
    return allowedTypes.includes(type)
  },

  country: (country: string): boolean => {
    return typeof country === 'string' && country.length > 0 && country.length < 100
  },

  passportCountry: (code: string): boolean => {
    const allowedCodes = ['KR', 'US', 'JP', 'CN', 'DE', 'FR', 'GB', 'CA', 'AU', 'OTHER']
    return allowedCodes.includes(code)
  },

  maxDays: (days: number): boolean => {
    return Number.isInteger(days) && days > 0 && days <= 365
  },

  notes: (notes: string): boolean => {
    return typeof notes === 'string' && notes.length <= 500
  }
}

/**
 * Validate trip form data
 */
export function validateTripData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.country || !validators.country(data.country)) {
    errors.push('Valid country is required')
  }

  if (!data.entryDate || !validators.date(data.entryDate)) {
    errors.push('Valid entry date is required')
  }

  if (data.exitDate && !validators.date(data.exitDate)) {
    errors.push('Exit date must be a valid date')
  }

  if (!data.visaType || !validators.visaType(data.visaType)) {
    errors.push('Valid visa type is required')
  }

  if (!data.maxDays || !validators.maxDays(data.maxDays)) {
    errors.push('Max days must be between 1 and 365')
  }

  if (!data.passportCountry || !validators.passportCountry(data.passportCountry)) {
    errors.push('Valid passport country is required')
  }

  if (data.notes && !validators.notes(data.notes)) {
    errors.push('Notes must be 500 characters or less')
  }

  // Date logic validation
  if (data.entryDate && data.exitDate) {
    const entry = new Date(data.entryDate)
    const exit = new Date(data.exitDate)
    if (exit <= entry) {
      errors.push('Exit date must be after entry date')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '')
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string, host: string | null): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://dinocal.vercel.app',
    'https://dinocal.app'
  ]
  
  // Allow same-origin requests
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
    return true
  }
  
  return allowedOrigins.includes(origin)
}

/**
 * Generate secure API response
 */
export function createApiResponse<T>(
  data: T,
  success = true,
  message?: string,
  status = 200
): NextResponse {
  const response = NextResponse.json(
    {
      success,
      data: success ? data : undefined,
      error: success ? undefined : data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  
  return response
}

/**
 * Error response helper
 */
export function createErrorResponse(
  error: string,
  status = 400,
  details?: any
): NextResponse {
  return createApiResponse(
    {
      error,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    false,
    undefined,
    status
  )
}

/**
 * Predefined security configurations for common use cases
 */
export const SecurityPresets = {
  PUBLIC: {
    requireAuth: false,
    requireAdmin: false,
    rateLimit: 'default',
  } as ApiSecurityOptions,

  AUTHENTICATED: {
    requireAuth: true,
    requireAdmin: false,
    rateLimit: 'default',
  } as ApiSecurityOptions,

  ADMIN_ONLY: {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'admin',
  } as ApiSecurityOptions,

  ANALYTICS: {
    requireAuth: true,
    requireAdmin: false,
    rateLimit: 'analytics',
  } as ApiSecurityOptions,

  AUTH_ENDPOINT: {
    requireAuth: false,
    requireAdmin: false,
    rateLimit: 'auth',
    allowedMethods: ['POST'],
  } as ApiSecurityOptions,
} as const;