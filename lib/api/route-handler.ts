/**
 * Secure API Route Handler
 * Wraps API routes with validation, authentication, and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import { validateRequest } from '@/lib/security/input-validation'
import { CSRFProtection } from '@/lib/security/auth-security'

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Route handler options
interface RouteHandlerOptions<TBody = any, TQuery = any> {
  // Validation schemas
  bodySchema?: z.ZodSchema<TBody>
  querySchema?: z.ZodSchema<TQuery>
  
  // Security options
  requireAuth?: boolean
  requireCSRF?: boolean
  allowedRoles?: string[]
  
  // Rate limiting
  rateLimit?: 'general' | 'auth' | 'mutation'
}

// Route handler type
type RouteHandler<TBody = any, TQuery = any> = (
  req: NextRequest,
  context: {
    session: any | null
    body?: TBody
    query?: TQuery
    params?: Record<string, string>
  }
) => Promise<NextResponse | Response>

// Create secure route handler
export function createRouteHandler<TBody = any, TQuery = any>(
  options: RouteHandlerOptions<TBody, TQuery>,
  handler: RouteHandler<TBody, TQuery>
) {
  return async (req: NextRequest, params?: any) => {
    try {
      // Check authentication if required
      let session = null
      if (options.requireAuth) {
        session = await getServerSession(authOptions)
        
        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }
        
        // Check role authorization
        if (options.allowedRoles && options.allowedRoles.length > 0) {
          const userRole = session.user?.role || 'user'
          if (!options.allowedRoles.includes(userRole)) {
            return NextResponse.json(
              { error: 'Forbidden' },
              { status: 403 }
            )
          }
        }
      }
      
      // CSRF validation for mutations
      if (options.requireCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const csrfToken = req.headers.get('X-CSRF-Token')
        const userId = session?.user?.id || ''
        
        if (!csrfToken || !CSRFProtection.validateToken(csrfToken, userId)) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          )
        }
      }
      
      // Parse and validate request body
      let body: TBody | undefined
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const rawBody = await req.json()
          const validation = await validateRequest(rawBody, options.bodySchema)
          
          if (!validation.success) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                details: validation.errors.format()
              },
              { status: 400 }
            )
          }
          
          body = validation.data
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          )
        }
      }
      
      // Parse and validate query parameters
      let query: TQuery | undefined
      if (options.querySchema) {
        const searchParams = req.nextUrl.searchParams
        const queryObject: Record<string, any> = {}
        
        searchParams.forEach((value, key) => {
          // Handle array parameters
          if (queryObject[key]) {
            if (Array.isArray(queryObject[key])) {
              queryObject[key].push(value)
            } else {
              queryObject[key] = [queryObject[key], value]
            }
          } else {
            queryObject[key] = value
          }
        })
        
        const validation = await validateRequest(queryObject, options.querySchema)
        
        if (!validation.success) {
          return NextResponse.json(
            {
              error: 'Invalid query parameters',
              details: validation.errors.format()
            },
            { status: 400 }
          )
        }
        
        query = validation.data
      }
      
      // Call the actual handler
      const response = await handler(req, {
        session,
        body,
        query,
        params: params?.params
      })
      
      // Add security headers to response
      if (response instanceof NextResponse) {
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
      }
      
      return response
      
    } catch (error) {
      // Log error
      console.error('API Error:', error)
      
      // Handle known errors
      if (error instanceof APIError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      
      // Handle Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as any
        
        if (prismaError.code === 'P2002') {
          return NextResponse.json(
            { error: 'Duplicate entry' },
            { status: 409 }
          )
        }
        
        if (prismaError.code === 'P2025') {
          return NextResponse.json(
            { error: 'Record not found' },
            { status: 404 }
          )
        }
      }
      
      // Generic error response
      const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error ? error.message : 'Unknown error'
      
      return NextResponse.json(
        { error: message },
        { status: 500 }
      )
    }
  }
}

// Helper functions for common responses
export const responses = {
  success: (data: any, status = 200) => 
    NextResponse.json(data, { status }),
  
  created: (data: any) => 
    NextResponse.json(data, { status: 201 }),
  
  noContent: () => 
    new NextResponse(null, { status: 204 }),
  
  badRequest: (message = 'Bad request') => 
    NextResponse.json({ error: message }, { status: 400 }),
  
  unauthorized: (message = 'Unauthorized') => 
    NextResponse.json({ error: message }, { status: 401 }),
  
  forbidden: (message = 'Forbidden') => 
    NextResponse.json({ error: message }, { status: 403 }),
  
  notFound: (message = 'Not found') => 
    NextResponse.json({ error: message }, { status: 404 }),
  
  conflict: (message = 'Conflict') => 
    NextResponse.json({ error: message }, { status: 409 }),
  
  serverError: (message = 'Internal server error') => 
    NextResponse.json({ error: message }, { status: 500 }),
}