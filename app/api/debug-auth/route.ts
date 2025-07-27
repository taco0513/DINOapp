import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    // Get server session
    const session = await getServerSession(authOptions)
    
    // Get environment info
    const envInfo = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    }
    
    // Get request info
    const requestInfo = {
      url: request.url,
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    }
    
    return NextResponse.json({
      environment: envInfo,
      request: requestInfo,
      jwt: token ? {
        id: token.id,
        email: token.email,
        name: token.name,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
      } : null,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Debug auth error
    return NextResponse.json({
      error: 'Debug auth failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}