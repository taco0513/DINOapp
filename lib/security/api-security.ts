import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * API Security utilities for DiNoCal
 * Provides authentication, authorization, and input validation
 */

export interface ApiSecurityOptions {
  requireAuth?: boolean
  allowedMethods?: string[]
  rateLimitKey?: string
  validateInput?: boolean
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
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
      validateInput = true
    } = options

    try {
      // Method validation
      if (!allowedMethods.includes(req.method || '')) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }
        
        // Add user to context
        context = { ...context, user: session.user }
      }

      // Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // CSRF protection for state-changing operations
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

      // Call the actual handler
      return await handler(req, context)

    } catch (error) {
      console.error('API Security Error:', error)
      
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
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/)
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