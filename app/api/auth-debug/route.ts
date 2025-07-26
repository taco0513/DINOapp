import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  const headersList = headers()
  const host = headersList.get('host')
  const referer = headersList.get('referer')
  
  // Get all cookies
  const cookieHeader = headersList.get('cookie') || ''
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key) acc[key] = value || ''
    return acc
  }, {} as Record<string, string>)
  
  // Check for NextAuth cookies
  const sessionToken = cookies['next-auth.session-token'] || 
                      cookies['__Secure-next-auth.session-token'] || 
                      'Not found'
  
  const csrfToken = cookies['next-auth.csrf-token'] || 
                    cookies['__Host-next-auth.csrf-token'] || 
                    'Not found'
  
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    },
    request: {
      host,
      referer,
      url: request.url,
      origin: request.headers.get('origin'),
    },
    cookies: {
      all: cookies,
      sessionToken,
      csrfToken,
      count: Object.keys(cookies).length,
    },
    auth: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    }
  })
}