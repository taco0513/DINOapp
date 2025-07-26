import { NextRequest } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

// Default rate limit: 100 requests per 15 minutes
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
}

// Strict rate limit for sensitive operations: 10 requests per 5 minutes
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10
}

/**
 * Rate limiting middleware
 */
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
  const ip = getClientIP(request)
  const key = `rate_limit:${ip}`
  const now = Date.now()
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return true
  }
  
  if (existing.count >= config.maxRequests) {
    return false // Rate limit exceeded
  }
  
  // Increment count
  existing.count += 1
  rateLimitStore.set(key, existing)
  return true
}

/**
 * Extract client IP address
 */
export function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  return request.ip || 'unknown'
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Only use DOMPurify in browser environment
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    })
  }
  
  // Server-side fallback: simple HTML tag removal
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize and validate text input
 */
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove dangerous characters and limit length
  const sanitized = input
    .replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength)
  
  return sanitized
}

/**
 * Validate request content type
 */
export function validateContentType(request: NextRequest, allowedTypes: string[] = ['application/json']): boolean {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return false
  }
  
  return allowedTypes.some(type => contentType.includes(type))
}

/**
 * Check request size limit
 */
export function checkRequestSize(request: NextRequest, maxSizeBytes: number = 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (!contentLength) {
    return true // Allow requests without content-length
  }
  
  return parseInt(contentLength) <= maxSizeBytes
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

/**
 * Validate and sanitize trip data
 */
export function sanitizeTripData(data: any) {
  return {
    country: sanitizeText(data.country, 100),
    entryDate: data.entryDate, // Date validation handled by Zod
    exitDate: data.exitDate,
    visaType: sanitizeText(data.visaType, 50),
    maxDays: typeof data.maxDays === 'number' ? Math.max(1, Math.min(365, data.maxDays)) : 30,
    passportCountry: sanitizeText(data.passportCountry, 10),
    notes: data.notes ? sanitizeHTML(data.notes).slice(0, 2000) : null
  }
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: any, request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  console.warn(`[SECURITY] ${event}`, {
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    details
  })
}