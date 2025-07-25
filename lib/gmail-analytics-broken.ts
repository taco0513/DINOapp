/**
 * Gmail 여행 이메일 분석 및 통계 라이브러리
 * 사용자의 여행 패턴 분석, 통계 생성, 인사이트 제공
 */

import { TravelInfo } from './gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

export interface TravelStats {
  totalTrips: number
  totalAirlines: number
  totalDestinations: number
  mostVisitedDestinations: { code: string; name: string; count: number }[]
  preferredAirlines: { code: string; name: string; count: number }[]
  travelFrequency: {
    domestic: number
    international: number
    averageTripsPerMonth: number
  }
  upcomingTrips: TravelInfo[]
  recentTrips: TravelInfo[]
  travelPattern: {
    busyMonths: string[]
    quietMonths: string[]
    averageTripDuration: number
  }
}

export interface TravelInsight {
  type: 'tip' | 'warning' | 'info' | 'achievement'
  title: string
  description: string
  actionable?: boolean
  action?: string
}

/**
 * 여행 데이터에서 통계 생성
 */
export function generateTravelStats(travelInfos: TravelInfo[]): TravelStats {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // 기본 통계
  const totalTrips = travelInfos.length
  const destinations = new Map<string, number>()
  const airlines = new Map<string, number>()
  
  // 날짜별 분류
  const upcomingTrips: TravelInfo[] = []
  const recentTrips: TravelInfo[] = []
  const monthlyTrips = new Map<string, number>()

  for (const trip of travelInfos) {
    // 목적지 통계
    if (trip.destination) {
      destinations.set(trip.destination, (destinations.get(trip.destination) || 0) + 1)
    }
    
    // 항공사 통계
    if (trip.flightNumber) {
      const airlineCode = trip.flightNumber.match(/^([A-Z]{2,3})/)?.[1]
      if (airlineCode) {
        airlines.set(airlineCode, (airlines.get(airlineCode) || 0) + 1)
      }
    }
    
    // 날짜 분석
    if (trip.departureDate) {
      try {
        const departureDate = new Date(trip.departureDate)
        
        // 예정된 여행
        if (departureDate > now && departureDate <= oneMonthFromNow) {
          upcomingTrips.push(trip)
        }
        
        // 최근 여행
        if (departureDate >= sixMonthsAgo && departureDate <= now) {
          recentTrips.push(trip)
        }
        
        // 월별 통계
        const monthKey = `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyTrips.set(monthKey, (monthlyTrips.get(monthKey) || 0) + 1)
        
      } catch (error) {
        console.warn('Invalid date format:', trip.departureDate)
      }
    }
  }

  // 상위 목적지
  const mostVisitedDestinations = Array.from(destinations.entries())
    .map(([code, count]) => ({
      code,
      name: airportCodes[code as keyof typeof airportCodes] || code,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 선호 항공사
  const preferredAirlines = Array.from(airlines.entries())
    .map(([code, count]) => ({
      code,
      name: airlineCodes[code as keyof typeof airlineCodes] || code,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 여행 빈도
  const domesticAirports = ['ICN', 'GMP', 'CJU', 'PUS', 'TAE'] // 한국 주요 공항
  const domesticTrips = travelInfos.filter(trip => 
    trip.destination && domesticAirports.includes(trip.destination)
  ).length
  const internationalTrips = totalTrips - domesticTrips
  
  const averageTripsPerMonth = monthlyTrips.size > 0 ? 
    Array.from(monthlyTrips.values()).reduce((sum, count) => sum + count, 0) / monthlyTrips.size : 0

  // 여행 패턴 분석
  const monthCounts = new Map<number, number>()
  for (const trip of travelInfos) {
    if (trip.departureDate) {
      try {
        const date = new Date(trip.departureDate)
        const month = date.getMonth()
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
      } catch (error) {
        // 잘못된 날짜 형식 무시
      }
    }
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const sortedMonths = Array.from(monthCounts.entries())
    .sort((a, b) => b[1] - a[1])

  const busyMonths = sortedMonths.slice(0, 3).map(([month]) => monthNames[month])
  const quietMonths = sortedMonths.slice(-3).map(([month]) => monthNames[month])

  // 평균 여행 기간 계산 (왕복 여행 기준)
  let totalDuration = 0
  let tripWithDuration = 0
  
  for (const trip of travelInfos) {
    if (trip.departureDate && trip.returnDate) {
      try {
        const depDate = new Date(trip.departureDate)
        const retDate = new Date(trip.returnDate)
        const duration = (retDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (duration > 0 && duration < 365) { // 유효한 기간만
          totalDuration += duration
          tripWithDuration++
        }
      } catch (error) {
        // 잘못된 날짜 형식 무시
      }
    }
  }
  
  const averageTripDuration = tripWithDuration > 0 ? Math.round(totalDuration / tripWithDuration) : 0

  return {
    totalTrips,
    totalAirlines: airlines.size,
    totalDestinations: destinations.size,
    mostVisitedDestinations,
    preferredAirlines,
    travelFrequency: {
      domestic: domesticTrips,
      international: internationalTrips,
      averageTripsPerMonth: Math.round(averageTripsPerMonth * 10) / 10
    },
    upcomingTrips: upcomingTrips.sort((a, b) => 
      new Date(a.departureDate || '').getTime() - new Date(b.departureDate || '').getTime()
    ),
    recentTrips: recentTrips.sort((a, b) => 
      new Date(b.departureDate || '').getTime() - new Date(a.departureDate || '').getTime()
    ).slice(0, 5),
    travelPattern: {
      busyMonths,
      quietMonths,
      averageTripDuration
    }
  }
}

/**
 * 개인화된 여행 인사이트 생성
 */
export function generateTravelInsights(stats: TravelStats, travelInfos: TravelInfo[]): TravelInsight[] {
  const insights: TravelInsight[] = []
  const now = new Date()

  // 예정된 여행 알림
  if (stats.upcomingTrips.length > 0) {
    const nextTrip = stats.upcomingTrips[0]
    const daysUntilTrip = Math.ceil(
      (new Date(nextTrip.departureDate || '').getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    insights.push({
      type: 'info',
      title: '다가오는 여행',
      description: `${daysUntilTrip}일 후 ${nextTrip.destination ? airportCodes[nextTrip.destination as keyof typeof airportCodes] || nextTrip.destination : '목적지'}로 출발 예정입니다.`,
      actionable: true,
      action: '체크인 준비하기'
    })
  }\n\n  // 여행 빈도 분석\n  if (stats.travelFrequency.averageTripsPerMonth > 2) {\n    insights.push({\n      type: 'achievement',\n      title: '여행 애호가',\n      description: `월평균 ${stats.travelFrequency.averageTripsPerMonth}회 여행을 다니시는 활발한 여행자입니다!`\n    })\n  }\n\n  // 선호 항공사 분석\n  if (stats.preferredAirlines.length > 0) {\n    const topAirline = stats.preferredAirlines[0]\n    if (topAirline.count >= 3) {\n      insights.push({\n        type: 'tip',\n        title: '마일리지 최적화',\n        description: `${topAirline.name}을(를) 자주 이용하시네요. 마일리지 프로그램을 확인해보세요.`,\n        actionable: true,\n        action: '마일리지 조회하기'\n      })\n    }\n  }\n\n  // 목적지 다양성 분석\n  if (stats.totalDestinations >= 10) {\n    insights.push({\n      type: 'achievement',\n      title: '세계 여행가',\n      description: `${stats.totalDestinations}개 도시를 방문하셨습니다. 정말 다양한 경험을 쌓고 계시네요!`\n    })\n  }\n\n  // 계절별 여행 패턴\n  if (stats.travelPattern.busyMonths.length > 0) {\n    insights.push({\n      type: 'info',\n      title: '여행 패턴 분석',\n      description: `${stats.travelPattern.busyMonths.join(', ')}에 주로 여행을 다니시는 경향이 있습니다.`\n    })\n  }\n\n  // 평균 여행 기간 분석\n  if (stats.travelPattern.averageTripDuration > 0) {\n    let tripTypeDescription = ''\n    if (stats.travelPattern.averageTripDuration <= 3) {\n      tripTypeDescription = '주로 단기 여행을 선호하시네요.'\n    } else if (stats.travelPattern.averageTripDuration <= 7) {\n      tripTypeDescription = '일주일 내외의 적당한 길이 여행을 즐기시네요.'\n    } else {\n      tripTypeDescription = '장기 여행을 즐기는 여유로운 여행자시네요.'\n    }\n    \n    insights.push({\n      type: 'info',\n      title: '여행 스타일',\n      description: `평균 ${stats.travelPattern.averageTripDuration}일간 여행하시며, ${tripTypeDescription}`\n    })\n  }\n\n  // 국내/해외 여행 비율\n  const totalTrips = stats.travelFrequency.domestic + stats.travelFrequency.international\n  if (totalTrips > 0) {\n    const internationalRatio = Math.round((stats.travelFrequency.international / totalTrips) * 100)\n    \n    if (internationalRatio >= 70) {\n      insights.push({\n        type: 'tip',\n        title: '해외여행 전문가',\n        description: `해외여행 비율이 ${internationalRatio}%입니다. 여행자 보험과 비자 관리에 신경쓰세요.`,\n        actionable: true,\n        action: '비자 현황 확인하기'\n      })\n    } else if (internationalRatio <= 30) {\n      insights.push({\n        type: 'tip',\n        title: '국내여행 마니아',\n        description: `국내여행을 많이 다니시네요. 숨겨진 국내 명소를 더 탐험해보세요!`\n      })\n    }\n  }\n\n  // 데이터 품질 경고\n  const lowConfidenceTrips = travelInfos.filter(trip => trip.confidence < 0.5).length\n  if (lowConfidenceTrips > 0) {\n    insights.push({\n      type: 'warning',\n      title: '데이터 정확성',\n      description: `${lowConfidenceTrips}개의 여행 정보가 불완전합니다. 수동으로 확인해보세요.`,\n      actionable: true,\n      action: '데이터 검토하기'\n    })\n  }\n\n  return insights\n}\n\n/**\n * 여행 달력 데이터 생성 (월별 뷰)\n */\nexport function generateTravelCalendar(travelInfos: TravelInfo[], year?: number, month?: number) {\n  const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()))\n  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)\n  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)\n\n  const calendarEvents = []\n\n  for (const trip of travelInfos) {\n    if (trip.departureDate) {\n      try {\n        const depDate = new Date(trip.departureDate)\n        \n        // 해당 월에 포함되는 여행만 필터링\n        if (depDate >= startOfMonth && depDate <= endOfMonth) {\n          calendarEvents.push({\n            date: depDate.toISOString().split('T')[0],\n            type: 'departure',\n            title: `출발: ${trip.destination ? airportCodes[trip.destination as keyof typeof airportCodes] || trip.destination : '목적지 미상'}`,\n            flightNumber: trip.flightNumber,\n            confidence: trip.confidence,\n            trip\n          })\n        }\n        \n        // 귀국 날짜도 추가\n        if (trip.returnDate) {\n          const retDate = new Date(trip.returnDate)\n          if (retDate >= startOfMonth && retDate <= endOfMonth) {\n            calendarEvents.push({\n              date: retDate.toISOString().split('T')[0],\n              type: 'return',\n              title: `귀국: ${trip.departure ? airportCodes[trip.departure as keyof typeof airportCodes] || trip.departure : '출발지 미상'}`,\n              flightNumber: trip.flightNumber,\n              confidence: trip.confidence,\n              trip\n            })\n          }\n        }\n      } catch (error) {\n        console.warn('Invalid date in trip:', trip.departureDate)\n      }\n    }\n  }\n\n  return calendarEvents.sort((a, b) => a.date.localeCompare(b.date))\n}\n\n/**\n * 여행 비용 예측 (기본적인 추정)\n */\nexport function estimateTravelCosts(stats: TravelStats) {\n  // 매우 기본적인 비용 추정 (실제 비용은 매우 다를 수 있음)\n  const domesticAvgCost = 300000 // 원\n  const internationalAvgCost = 1200000 // 원\n  \n  const estimatedDomesticCost = stats.travelFrequency.domestic * domesticAvgCost\n  const estimatedInternationalCost = stats.travelFrequency.international * internationalAvgCost\n  \n  return {\n    domestic: estimatedDomesticCost,\n    international: estimatedInternationalCost,\n    total: estimatedDomesticCost + estimatedInternationalCost,\n    disclaimer: '이 비용은 매우 기본적인 추정치이며, 실제 비용과 차이가 클 수 있습니다.'\n  }\n}