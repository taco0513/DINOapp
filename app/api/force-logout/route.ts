import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))
  
  // Clear all possible auth cookies
  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'sessionToken',
    'csrf-token'
  ]
  
  // Clear each cookie with all possible domain variations
  cookiesToClear.forEach(cookieName => {
    // Basic cookie clear
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax'
    })
    
    // Clear with secure flag
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      secure: true,
      sameSite: 'lax'
    })
    
    // Clear with httpOnly
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    })
    
    // Delete method
    response.cookies.delete(cookieName)
  })
  
  // Add cache prevention headers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  
  return response
}