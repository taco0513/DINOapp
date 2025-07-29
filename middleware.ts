import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { CSRFProtection } from '@/lib/security/auth-security';
import { errorRecoveryMiddleware } from '@/middleware/error-recovery';
import { httpMetrics } from '@/lib/monitoring/metrics-collector';

/**
 * Enhanced middleware for DiNoCal with comprehensive security
 * Includes CSRF protection, enhanced rate limiting, and security headers
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://dino-app-psi.vercel.app',
  'https://dinoapp.net',
  'https://www.dinoapp.net',
];

const RATE_LIMIT_MAP = new Map();

// Enhanced rate limit configurations
const RATE_LIMITS = {
  general: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { requests: 10, windowMs: 900000 }, // 10 auth attempts per 15 minutes
  mutation: { requests: 50, windowMs: 60000 }, // 50 mutations per minute
};

export async function middleware(request: NextRequest) {
  const start = Date.now();
  let response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Error recovery middleware (database health, circuit breaker, etc.)
  const recoveryResponse = await errorRecoveryMiddleware(request, {
    enableDbHealthCheck: true,
    enableCircuitBreaker: true,
    enableGracefulDegradation: true,
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  });
  
  if (recoveryResponse) {
    const duration = Date.now() - start;
    httpMetrics.requestEnd(method, pathname, 503);
    httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
    httpMetrics.requestError(method, pathname, 'recovery-middleware');
    return recoveryResponse;
  }

  // Apply security headers to all routes
  applySecurityHeaders(response);
  
  // Generate CSRF token for authenticated users
  if (process.env.ENABLE_CSRF_PROTECTION === 'true') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (token && token.sub) {
      const csrfToken = CSRFProtection.generateToken(token.sub);
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    handleCORS(request, response);

    // Apply rate limiting for API routes
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.allowed) {
      const duration = Date.now() - start;
      httpMetrics.requestEnd(method, pathname, 429);
      httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
      httpMetrics.increment('http.rate_limit.exceeded', 1, { method, path: pathname });
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        },
      });
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimitResult.remaining)
    );
    response.headers.set(
      'X-RateLimit-Reset',
      String(rateLimitResult.resetTime)
    );
  }

  // Skip authentication check for auth pages and logout
  if (pathname.startsWith('/auth/') || pathname === '/logout') {
    // Record metrics before returning
    const duration = Date.now() - start;
    httpMetrics.requestEnd(method, pathname, 200);
    httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
    return response;
  }

  // Protected routes authentication
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/trips') ||
    pathname.startsWith('/schengen') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/gmail')
  ) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: '__Secure-next-auth.session-token',
      });

      // Checking auth for protected route

      if (!token) {
        // No token, redirecting to signin
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', encodeURIComponent(request.url));
        const duration = Date.now() - start;
        httpMetrics.requestEnd(method, pathname, 302);
        httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Error checking token
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(request.url));
      const duration = Date.now() - start;
      httpMetrics.requestEnd(method, pathname, 302);
      httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
      httpMetrics.requestError(method, pathname, 'auth-token-error');
      return NextResponse.redirect(url);
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

  // Record metrics for successful requests
  const duration = Date.now() - start;
  httpMetrics.requestEnd(method, pathname, 200);
  httpMetrics.histogram('http.request.duration', duration, { method, path: pathname });
  
  return response;
}

/**
 * Apply comprehensive security headers
 */
function applySecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://*.sentry.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://lh3.googleusercontent.com https://*.vercel-insights.com https://*.stripe.com blob:",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.vercel-insights.com https://api.stripe.com https://*.sentry.io wss://localhost:* ws://localhost:*",
    'frame-src https://accounts.google.com https://js.stripe.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  // Development environment CSP adjustments
  if (process.env.NODE_ENV === 'development') {
    const devCsp = csp.replace(
      "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.vercel-insights.com https://api.stripe.com https://*.sentry.io wss://localhost:* ws://localhost:*",
      "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.vercel-insights.com https://api.stripe.com https://*.sentry.io http://localhost:* ws://localhost:* wss://localhost:*"
    );
    response.headers.set('Content-Security-Policy', devCsp);
  } else {
    response.headers.set('Content-Security-Policy', csp);
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self), usb=()'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // HSTS for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Remove server identification
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
}

/**
 * Handle CORS for API routes
 */
function handleCORS(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');

  // Allow requests from allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow same-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }
}

/**
 * Simple in-memory rate limiting
 */
async function applyRateLimit(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100;

  const key = `${ip}`;
  const requestLog = RATE_LIMIT_MAP.get(key) || [];

  // Remove old entries
  const validRequests = requestLog.filter(
    (timestamp: number) => now - timestamp < windowMs
  );

  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + windowMs,
    };
  }

  // Add current request
  validRequests.push(now);
  RATE_LIMIT_MAP.set(key, validRequests);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    cleanupRateLimit();
  }

  return {
    allowed: true,
    remaining: maxRequests - validRequests.length,
    resetTime: now + windowMs,
  };
}

/**
 * Cleanup old rate limit entries
 */
function cleanupRateLimit() {
  const now = Date.now();
  const windowMs = 60 * 1000;

  for (const [key, requests] of RATE_LIMIT_MAP.entries()) {
    const validRequests = requests.filter(
      (timestamp: number) => now - timestamp < windowMs
    );
    if (validRequests.length === 0) {
      RATE_LIMIT_MAP.delete(key);
    } else {
      RATE_LIMIT_MAP.set(key, validRequests);
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes including logout)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
