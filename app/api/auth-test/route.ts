import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const headers = Object.fromEntries(request.headers.entries())
  
  return NextResponse.json({
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV,
    },
    request: {
      url: request.url,
      headers: {
        host: headers.host,
        'x-forwarded-host': headers['x-forwarded-host'],
        'x-forwarded-proto': headers['x-forwarded-proto'],
      }
    },
    timestamp: new Date().toISOString()
  })
}