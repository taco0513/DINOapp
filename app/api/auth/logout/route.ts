import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Get all cookies and clear auth-related ones
    const allCookies = cookieStore.getAll()
    
    // Clear specific auth cookies
    const authCookiePatterns = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'csrf-token',
      'sessionToken'
    ]
    
    // Also clear any cookies that contain 'next-auth'
    allCookies.forEach(cookie => {
      if (cookie.name.includes('next-auth') || authCookiePatterns.includes(cookie.name)) {
        cookieStore.delete(cookie.name)
      }
    })
    
    // Create response with explicit cookie clearing
    const response = NextResponse.json({ success: true })
    
    // Double-clear with different methods
    authCookiePatterns.forEach(cookieName => {
      // Method 1: Using response.cookies.set
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      })
      
      // Method 2: Using response.cookies.delete
      response.cookies.delete(cookieName)
    })
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Support GET method for direct navigation
  const response = await POST(request)
  return response
}