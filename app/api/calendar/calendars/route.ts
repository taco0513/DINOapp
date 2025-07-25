import { NextRequest, NextResponse } from 'next/server'
import { withGmailAuth } from '@/lib/gmail-middleware'
import { getUserCalendars } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async (session) => {
    try {
      const calendars = await getUserCalendars(session.accessToken as string)
      
      return NextResponse.json({
        success: true,
        calendars
      })
    } catch (error) {
      console.error('Error fetching calendars:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch calendars',
          message: error instanceof Error ? error.message : '캘린더 목록 조회 중 오류가 발생했습니다.'
        },
        { status: 500 }
      )
    }
  })
}