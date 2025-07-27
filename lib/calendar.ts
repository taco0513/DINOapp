/**
 * Google Calendar API 통합 라이브러리
 * Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
 */

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: { email: string }[]
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  colorId?: string
  source?: {
    title: string
    url: string
  }
}

export interface TravelCalendarEvent extends CalendarEvent {
  travelType: 'departure' | 'return' | 'stay'
  flightNumber?: string
  bookingReference?: string
  confidence: number
  originalEmailId: string
}

/**
 * Google Calendar API 클라이언트 생성
 */
export function createCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  
  oauth2Client.setCredentials({
    access_token: accessToken
  })
  
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Calendar API 연결 상태 확인
 */
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
  try {
    const calendar = createCalendarClient(accessToken)
    
    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })
    
    return true
  } catch (error) {
    // Calendar connection failed
    return false
  }
}

/**
 * 사용자의 캘린더 목록 가져오기
 */
export async function getUserCalendars(accessToken: string) {
  try {
    const calendar = createCalendarClient(accessToken)
    
    const response = await calendar.calendarList.list({
      maxResults: 50
    })
    
    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []
    
  } catch (error) {
    // Error fetching calendars
    throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
  }
}

/**
 * 여행 정보를 기반으로 캘린더 이벤트 생성
 */
export function createTravelEvents(travelInfo: TravelInfo): TravelCalendarEvent[] {
  const events: TravelCalendarEvent[] = []
  const airportCodes = {
    'ICN': '인천국제공항', 'GMP': '김포국제공항', 'CJU': '제주국제공항',
    'NRT': '나리타국제공항', 'HND': '하네다공항', 'LAX': '로스앤젤레스국제공항'
    // 더 많은 공항 코드 매핑은 travel-patterns.ts에서 가져올 수 있음
  }
  
  // 출발 이벤트
  if (travelInfo.departureDate) {
    const departureDate = normalizeDateString(travelInfo.departureDate)
    
    if (departureDate) {
      const departureLocation = travelInfo.departure ? 
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) : 
        '출발지'
      
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'
      
      events.push({
        summary: `✈️ ${destinationLocation} 출발`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${departureLocation}`,
          `목적지: ${destinationLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        location: departureLocation,
        colorId: '11', // 빨간색 (출발)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
            { method: 'email', minutes: 24 * 60 }  // 1일 전 이메일
          ]
        },
        travelType: 'departure',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }
  }
  
  // 귀국 이벤트
  if (travelInfo.returnDate) {
    const returnDate = normalizeDateString(travelInfo.returnDate)
    
    if (returnDate) {
      const departureLocation = travelInfo.departure ? 
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) : 
        '출발지'
      
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'
      
      events.push({
        summary: `🏠 ${departureLocation} 귀국`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${destinationLocation}`,
          `도착지: ${departureLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        location: destinationLocation,
        colorId: '10', // 초록색 (귀국)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
          ]
        },
        travelType: 'return',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }
  }
  
  // 숙박 기간 이벤트 (호텔이 있고 출발일과 귀국일이 모두 있는 경우)
  if (travelInfo.hotelName && travelInfo.departureDate && travelInfo.returnDate) {
    const depDate = normalizeDateString(travelInfo.departureDate)
    const retDate = normalizeDateString(travelInfo.returnDate)
    
    if (depDate && retDate) {
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'
      
      events.push({
        summary: `🏨 ${travelInfo.hotelName}`,
        description: [
          `호텔: ${travelInfo.hotelName}`,
          `위치: ${destinationLocation}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: depDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: retDate,
          timeZone: 'Asia/Seoul'
        },
        location: `${travelInfo.hotelName}, ${destinationLocation}`,
        colorId: '9', // 파란색 (숙박)
        travelType: 'stay',
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }
  }
  
  return events
}

/**
 * 캘린더에 이벤트 생성
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: TravelCalendarEvent
): Promise<string | null> {
  try {
    const calendar = createCalendarClient(accessToken)
    
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        reminders: event.reminders,
        colorId: event.colorId,
        source: event.source
      }
    })
    
    return response.data.id || null
  } catch (error) {
    // Error creating calendar event
    throw new Error('캘린더 이벤트 생성 중 오류가 발생했습니다.')
  }
}

/**
 * 여행 정보를 캘린더에 동기화
 */
export async function syncTravelToCalendar(
  accessToken: string,
  calendarId: string,
  travelInfos: TravelInfo[]
): Promise<{
  success: boolean
  created: number
  errors: string[]
  eventIds: string[]
}> {
  const result = {
    success: true,
    created: 0,
    errors: [] as string[],
    eventIds: [] as string[]
  }
  
  try {
    for (const travelInfo of travelInfos) {
      // 신뢰도가 낮은 여행 정보는 건너뛰기
      if (travelInfo.confidence < 0.4) {
        result.errors.push(`낮은 신뢰도로 인해 건너뜀: ${travelInfo.subject} (${Math.round(travelInfo.confidence * 100)}%)`)
        continue
      }
      
      const events = createTravelEvents(travelInfo)
      
      for (const event of events) {
        try {
          const eventId = await createCalendarEvent(accessToken, calendarId, event)
          if (eventId) {
            result.eventIds.push(eventId)
            result.created++
          }
        } catch (error) {
          result.success = false
          result.errors.push(`이벤트 생성 실패: ${event.summary} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        }
      }
    }
    
  } catch (error) {
    result.success = false
    result.errors.push(`동기화 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
  
  return result
}

/**
 * 기존 여행 이벤트 검색 (중복 방지)
 */
export async function findExistingTravelEvents(
  accessToken: string,
  calendarId: string,
  emailId: string
): Promise<CalendarEvent[]> {
  try {
    const calendar = createCalendarClient(accessToken)
    
    // 최근 6개월 범위에서 검색
    const timeMin = new Date()
    timeMin.setMonth(timeMin.getMonth() - 6)
    
    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      q: emailId, // 이벤트 설명에서 emailId 검색
      maxResults: 100
    })
    
    return response.data.items?.filter(event => 
      event.description?.includes(emailId)
    ).map(event => ({
      id: event.id || undefined,
      summary: event.summary || '',
      description: event.description || undefined,
      start: {
        dateTime: event.start?.dateTime || undefined,
        date: event.start?.date || undefined,
        timeZone: event.start?.timeZone || undefined
      },
      end: {
        dateTime: event.end?.dateTime || undefined,
        date: event.end?.date || undefined,
        timeZone: event.end?.timeZone || undefined
      },
      location: event.location || undefined
    })) || []
    
  } catch (error) {
    // Error finding existing events
    return []
  }
}

/**
 * 캘린더 이벤트 삭제
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = createCalendarClient(accessToken)
    
    await calendar.events.delete({
      calendarId,
      eventId
    })
    
    return true
  } catch (error) {
    // Error deleting calendar event
    return false
  }
}