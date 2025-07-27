import { NextRequest, NextResponse } from 'next/server'
import { withGmailAuth } from '@/lib/gmail-middleware'
import { syncTravelToCalendar, findExistingTravelEvents } from '@/lib/calendar'
import { TravelInfo } from '@/lib/gmail'
import { csrfProtection } from '@/lib/security/csrf-protection'

export async function POST(request: NextRequest) {
  // CSRF 보호
  const csrfResult = await csrfProtection(request, {
    requireDoubleSubmit: true
  })
  if (!csrfResult.protected) {
    return csrfResult.response!
  }

  return withGmailAuth(request, async (session, request) => {
    try {
      const body = await request.json()
      const { calendarId, travelInfos, preventDuplicates = true } = body
      
      if (!calendarId) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing calendarId',
            message: '캘린더 ID가 필요합니다.' 
          },
          { status: 400 }
        )
      }
      
      if (!travelInfos || !Array.isArray(travelInfos)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid travelInfos',
            message: '여행 정보가 올바르지 않습니다.' 
          },
          { status: 400 }
        )
      }
      
      // 중복 방지가 활성화된 경우 기존 이벤트 확인
      let filteredTravelInfos = travelInfos as TravelInfo[]
      
      if (preventDuplicates) {
        const duplicateChecks = await Promise.all(
          travelInfos.map(async (travelInfo: TravelInfo) => {
            const existingEvents = await findExistingTravelEvents(
              session.accessToken as string,
              calendarId,
              travelInfo.emailId
            )
            return {
              travelInfo,
              hasDuplicates: existingEvents.length > 0
            }
          })
        )
        
        filteredTravelInfos = duplicateChecks
          .filter(check => !check.hasDuplicates)
          .map(check => check.travelInfo)
        
        const duplicateCount = duplicateChecks.filter(check => check.hasDuplicates).length
        
        if (duplicateCount > 0) {
          // Skipped duplicate travel info entries
        }
      }
      
      // 여행 정보를 캘린더에 동기화
      const result = await syncTravelToCalendar(
        session.accessToken as string,
        calendarId,
        filteredTravelInfos
      )
      
      return NextResponse.json({
        success: result.success,
        created: result.created,
        skipped: preventDuplicates ? travelInfos.length - filteredTravelInfos.length : 0,
        errors: result.errors,
        eventIds: result.eventIds,
        message: result.success 
          ? `${result.created}개의 여행 일정이 캘린더에 추가되었습니다.`
          : '일부 일정 추가 중 오류가 발생했습니다.'
      })
      
    } catch (error) {
      // Error syncing to calendar
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed',
          message: error instanceof Error ? error.message : '캘린더 동기화 중 오류가 발생했습니다.'
        },
        { status: 500 }
      )
    }
  })
}