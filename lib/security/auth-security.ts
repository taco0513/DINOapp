/**
 * Authentication Security Enhancements
 * CSRF protection, session management, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createHash, randomBytes } from 'crypto'
import { headers } from 'next/headers'

// CSRF Token Management
export class CSRFProtection {
  private static SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
  
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}-${timestamp}`
    const hash = createHash('sha256')
      .update(data + this.SECRET)
      .digest('hex')
    
    return `${timestamp}.${hash}`
  }
  
  static validateToken(token: string, sessionId: string): boolean {
    if (!token) return false
    
    const [timestamp, hash] = token.split('.')
    if (!timestamp || !hash) return false
    
    // Check token age (1 hour max)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 60 * 60 * 1000) return false
    
    // Validate hash
    const expectedHash = createHash('sha256')
      .update(`${sessionId}-${timestamp}${this.SECRET}`)
      .digest('hex')
    
    return hash === expectedHash
  }
}

// Session Security Configuration
export const sessionConfig = {
  maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800'), // 7 days
  updateAge: parseInt(process.env.SESSION_UPDATE_AGE || '86400'), // 24 hours
  
  // Security options
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Rate Limiting Implementation
interface RateLimitConfig {
  requests: number
  windowMs: number
  identifier: (req: NextRequest) => string
}

class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>()
  
  constructor(private config: RateLimitConfig) {}
  
  async check(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const identifier = this.config.identifier(req)
    const now = Date.now()
    
    // Get or create attempt record
    let record = this.attempts.get(identifier)
    
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs
      }
      this.attempts.set(identifier, record)
    }
    
    // Check if limit exceeded
    if (record.count >= this.config.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }
    
    // Increment and allow
    record.count++
    return {
      allowed: true,
      remaining: this.config.requests - record.count,
      resetTime: record.resetTime
    }
  }
  
  // Clean up old entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Rate limiters for different endpoints
export const rateLimiters = {
  general: new RateLimiter({
    requests: parseInt(process.env.RATE_LIMIT_GENERAL_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW || '900000'),
    identifier: (req) => req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  }),
  
  auth: new RateLimiter({
    requests: parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '900000'),
    identifier: (req) => req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  }),
  
  mutation: new RateLimiter({
    requests: parseInt(process.env.RATE_LIMIT_MUTATION_REQUESTS || '50'),
    windowMs: parseInt(process.env.RATE_LIMIT_MUTATION_WINDOW || '900000'),
    identifier: (req) => {
      // Use user ID if authenticated, otherwise IP
      const token = req.cookies.get('next-auth.session-token')
      return token?.value || req.ip || 'unknown'
    }
  })
}

// Middleware to check authentication and apply security
export async function withAuth(
  req: NextRequest,
  options?: {
    requireAuth?: boolean
    rateLimit?: keyof typeof rateLimiters
    csrfProtect?: boolean
  }
) {
  const { requireAuth = true, rateLimit = 'general', csrfProtect = true } = options || {}
  
  // Check rate limit
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    const limiter = rateLimiters[rateLimit]
    const { allowed, remaining, resetTime } = await limiter.check(req)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': process.env[`RATE_LIMIT_${rateLimit.toUpperCase()}_REQUESTS`] || '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    // Add rate limit headers to successful responses
    req.headers.set('X-RateLimit-Remaining', remaining.toString())
  }
  
  // Check authentication
  if (requireAuth) {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Add user info to request
    req.headers.set('X-User-Id', token.sub || '')
    req.headers.set('X-User-Email', token.email || '')
  }
  
  // CSRF Protection for mutations
  if (csrfProtect && process.env.ENABLE_CSRF_PROTECTION === 'true') {
    const method = req.method
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = req.headers.get('X-CSRF-Token')
      const sessionToken = req.cookies.get('next-auth.session-token')?.value || ''
      
      if (!csrfToken || !CSRFProtection.validateToken(csrfToken, sessionToken)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
  }
  
  return null // Continue to handler
}

// Clean up rate limiters periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
  }, 60 * 1000) // Every minute
}