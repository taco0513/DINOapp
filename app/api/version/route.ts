import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    features: [
      'Enhanced offline support',
      'Push notifications',
      'Background sync',
      'Improved caching strategies',
    ],
  });
}
