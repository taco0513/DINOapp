/**
 * DINO v2.0 - Authentication Middleware
 * Protects routes that require authentication
 */

import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    console.log('Authenticated user accessing:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which routes require authentication
        const protectedPaths = ['/dashboard', '/profile', '/settings'];
        const isProtectedRoute = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        );
        
        // Allow access if not a protected route
        if (!isProtectedRoute) {
          return true;
        }
        
        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};