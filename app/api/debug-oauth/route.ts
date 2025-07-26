import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const environment = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
  }

  const requestInfo = {
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'user-agent': request.headers.get('user-agent')
    }
  }

  const authUrls = {
    signin: `${request.url.replace('/api/debug-oauth', '')}/api/auth/signin`,
    callback: `${request.url.replace('/api/debug-oauth', '')}/api/auth/callback/google`,
    session: `${request.url.replace('/api/debug-oauth', '')}/api/auth/session`
  }

  return NextResponse.json({
    environment,
    request: requestInfo,
    authUrls,
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}