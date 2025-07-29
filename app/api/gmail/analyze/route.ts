import { NextRequest, NextResponse } from 'next/server';
import { withGmailAuth, sanitizeGmailResponse } from '@/lib/gmail-middleware';
import { analyzeTravelEmails } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async (session, request) => {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '365', 10);

    // maxResults 제한 (1년치 여행 기록을 위해 최대 365개로 확장)
    const limitedMaxResults = Math.min(Math.max(maxResults, 1), 365);

    const travelInfos = await analyzeTravelEmails(
      session.accessToken as string,
      limitedMaxResults
    );

    // 개인정보 보호를 위한 데이터 정리
    const sanitizedTravelInfos = travelInfos.map(info => ({
      emailId: info.emailId,
      subject: info.subject,
      from: sanitizeGmailResponse({ from: info.from }).from,
      departureDate: info.departureDate,
      returnDate: info.returnDate,
      destination: info.destination,
      departure: info.departure,
      flightNumber: info.flightNumber,
      bookingReference: info.bookingReference,
      confidence: Math.round(info.confidence * 100), // 백분율로 표시
    }));

    return NextResponse.json({
      success: true,
      count: sanitizedTravelInfos.length,
      travelInfos: sanitizedTravelInfos,
    });
  });
}
