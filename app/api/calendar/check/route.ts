import { NextRequest, NextResponse } from 'next/server';
import { withGmailAuth, getRateLimitStatus } from '@/lib/gmail-middleware';
import { checkCalendarConnection } from '@/lib/calendar';

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async session => {
    const isConnected = await checkCalendarConnection(
      session.accessToken as string
    );
    const rateLimitStatus = getRateLimitStatus(session.user?.id || '');

    return NextResponse.json({
      connected: isConnected,
      message: isConnected
        ? 'Google Calendar 연결이 정상입니다.'
        : 'Google Calendar 연결에 실패했습니다.',
      rateLimitStatus,
    });
  });
}
