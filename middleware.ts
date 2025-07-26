import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Enhanced middleware for DiNoCal with security headers and CORS
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://dino-app-psi.vercel.app',
  'https://dinoapp.net'
]

const RATE_LIMIT_MAP = new Map()

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Apply security headers to all routes
  applySecurityHeaders(response)

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    handleCORS(request, response)
    
    // Apply rate limiting for API routes
    const rateLimitResult = await applyRateLimit(request)
    if (!rateLimitResult.allowed) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000)
        }
      })
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime))
  }

  // Protected routes authentication
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/trips') || 
      pathname.startsWith('/schengen') ||
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/gmail')) {
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Don't redirect root to dashboard - let the page handle it
  // This was causing issues with auth flow
  // if (pathname === '/') {
  //   const token = await getToken({ req: request })
  //   if (token) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url))
  //   }
  // }

  return response
}

/**
 * Apply comprehensive security headers
 */
function applySecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://lh3.googleusercontent.com https://*.vercel-insights.com",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.vercel-insights.com",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  
  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  
  // HSTS for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Remove server identification
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
}

/**
 * Handle CORS for API routes
 */
function handleCORS(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin')
  
  // Allow requests from allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // Allow same-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 })
  }
  
  return response
}

/**
 * Simple in-memory rate limiting
 */
async function applyRateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 100

  const key = `${ip}`
  const requestLog = RATE_LIMIT_MAP.get(key) || []
  
  // Remove old entries
  const validRequests = requestLog.filter((timestamp: number) => now - timestamp < windowMs)
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + windowMs
    }
  }
  
  // Add current request
  validRequests.push(now)
  RATE_LIMIT_MAP.set(key, validRequests)
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupRateLimit()
  }
  
  return {
    allowed: true,
    remaining: maxRequests - validRequests.length,
    resetTime: now + windowMs
  }
}

/**
 * Cleanup old rate limit entries
 */
function cleanupRateLimit() {
  const now = Date.now()
  const windowMs = 60 * 1000
  
  for (const [key, requests] of RATE_LIMIT_MAP.entries()) {
    const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs)
    if (validRequests.length === 0) {
      RATE_LIMIT_MAP.delete(key)
    } else {
      RATE_LIMIT_MAP.set(key, validRequests)
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}