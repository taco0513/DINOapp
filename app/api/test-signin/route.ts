import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = request.url.replace('/api/test-signin', '')
  
  return NextResponse.json({
    message: 'NextAuth signin test',
    baseUrl,
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET'
    },
    authUrls: {
      signin: `${baseUrl}/api/auth/signin`,
      signinGoogle: `${baseUrl}/api/auth/signin/google`,
      callback: `${baseUrl}/api/auth/callback/google`,
      session: `${baseUrl}/api/auth/session`
    },
    timestamp: new Date().toISOString()
  })
}