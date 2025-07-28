import { NextResponse } from 'next/server';

export async function GET() {
  // Test basic cookie setting
  const response = NextResponse.json({
    message: 'Cookie test',
    timestamp: new Date().toISOString(),
  });

  // Try to set a test cookie
  response.cookies.set('test-cookie', 'test-value', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
