/**
 * 이메일 지능형 분석 라이브러리
 * 고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
 */

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/**
 * 날짜 문자열을 표준 형식으로 정규화
 */
export function normalizeDateString(dateStr: string): string | null {
  if (!dateStr) return null
  
  // 다양한 날짜 형식을 ISO 형식으로 변환
  const dateFormats = [
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // MM/DD/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // DD/MM/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // YYYY년 MM월 DD일
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
    // MMM DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
    // DD MMM YYYY
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
  ]
  
  const monthMap: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  }
  
  for (const format of dateFormats) {
    const match = dateStr.match(format)
    if (match) {
      if (format === dateFormats[0]) { // YYYY-MM-DD
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      } else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
        return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
      } else if (format === dateFormats[3]) { // 한국어 형식
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      } else if (format === dateFormats[4]) { // MMM DD, YYYY
        const month = monthMap[match[1].toLowerCase().substring(0, 3)]
        return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
      } else if (format === dateFormats[5]) { // DD MMM YYYY
        const month = monthMap[match[2].toLowerCase().substring(0, 3)]
        return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
      }
    }
  }
  
  return null
}

/**
 * 항공편 번호의 유효성 검증
 */
export function validateFlightNumber(flightNumber: string): boolean {
  if (!flightNumber) return false
  
  const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
  const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)
  
  if (!match) return false
  
  const [, airlineCode, flightNum] = match
  
  // 항공사 코드 검증
  if (!(airlineCode in airlineCodes)) return false
  
  // 항공편 번호 범위 검증 (일반적으로 1-9999)
  const num = parseInt(flightNum)
  return num >= 1 && num <= 9999
}

/**
 * 공항 코드의 유효성 검증
 */
export function validateAirportCode(airportCode: string): boolean {
  if (!airportCode) return false
  
  const normalizedCode = airportCode.toUpperCase()
  return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/**
 * 예약 번호의 유효성 검증
 */
export function validateBookingReference(bookingRef: string): boolean {
  if (!bookingRef) return false
  
  // 일반적인 예약 번호 패턴 (6-8자리 영숫자)
  return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/**
 * 컨텍스트 기반 신뢰도 조정
 */
export function adjustConfidenceByContext(
  travelInfo: ExtractedTravelInfo,
  emailContext: {
    senderDomain: string
    hasMultipleBookings: boolean
    isForwardedEmail: boolean
    hasAttachments: boolean
  }
): number {
  let adjustedConfidence = travelInfo.confidence
  
  // 신뢰할 수 있는 발신자 도메인 보너스
  const trustedDomains = [
    'koreanair.com', 'flyasiana.com', 'jejuair.net',
    'united.com', 'delta.com', 'jal.com',
    'booking.com', 'expedia.com', 'agoda.com',
    'hotels.com', 'airbnb.com'
  ]
  
  if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
    adjustedConfidence += 0.15
  }
  
  // 첨부파일이 있는 경우 (e-ticket 등)
  if (emailContext.hasAttachments) {
    adjustedConfidence += 0.1
  }
  
  // 전달된 이메일의 경우 신뢰도 감소
  if (emailContext.isForwardedEmail) {
    adjustedConfidence -= 0.1
  }
  
  // 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
  if (emailContext.hasMultipleBookings) {
    adjustedConfidence -= 0.05
  }
  
  return Math.max(0, Math.min(1, adjustedConfidence))
}

/**
 * 추출된 데이터의 일관성 검증
 */
export function validateDataConsistency(travelInfo: ExtractedTravelInfo): {
  isConsistent: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // 날짜 일관성 검증
  if (travelInfo.departureDate && travelInfo.returnDate) {
    const depDate = new Date(normalizeDateString(travelInfo.departureDate) || '')
    const retDate = new Date(normalizeDateString(travelInfo.returnDate) || '')
    
    if (depDate >= retDate) {
      issues.push('Return date must be after departure date')
    }
    
    // 과거 날짜 확인 (30일 이전)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (depDate < thirtyDaysAgo) {
      issues.push('Departure date is more than 30 days in the past')
    }
    
    // 너무 먼 미래 날짜 확인 (2년 이후)
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)
    
    if (depDate > twoYearsLater) {
      issues.push('Departure date is more than 2 years in the future')
    }
  }
  
  // 항공편 번호 검증
  if (travelInfo.flightNumber && !validateFlightNumber(travelInfo.flightNumber)) {
    issues.push(`Invalid flight number: ${travelInfo.flightNumber}`)
  }
  
  // 공항 코드 검증
  if (travelInfo.departure && !validateAirportCode(travelInfo.departure)) {
    issues.push(`Invalid departure airport code: ${travelInfo.departure}`)
  }
  
  if (travelInfo.destination && !validateAirportCode(travelInfo.destination)) {
    issues.push(`Invalid destination airport code: ${travelInfo.destination}`)
  }
  
  // 같은 출발지와 목적지 확인
  if (travelInfo.departure && travelInfo.destination && 
      travelInfo.departure === travelInfo.destination) {
    issues.push('Departure and destination airports cannot be the same')
  }
  
  // 예약 번호 검증
  if (travelInfo.bookingReference && !validateBookingReference(travelInfo.bookingReference)) {
    issues.push(`Invalid booking reference format: ${travelInfo.bookingReference}`)
  }
  
  return {
    isConsistent: issues.length === 0,
    issues
  }
}

/**
 * 여행 정보 우선순위 결정
 * 여러 개의 여행 정보가 추출된 경우 가장 신뢰할 수 있는 것을 선택
 */
export function prioritizeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
  return travelInfos
    .map(info => {
      // 데이터 일관성 검증
      const validation = validateDataConsistency(info)
      
      // 일관성이 없는 데이터의 신뢰도 감소
      if (!validation.isConsistent) {
        info.confidence = Math.max(0, info.confidence - (validation.issues.length * 0.1))
      }
      
      return info
    })
    .filter(info => info.confidence >= 0.2) // 최소 신뢰도 필터링
    .sort((a, b) => {
      // 1차: 신뢰도 순
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence
      }
      
      // 2차: 추출된 데이터 완성도 순
      const aCompleteness = getDataCompleteness(a)
      const bCompleteness = getDataCompleteness(b)
      
      return bCompleteness - aCompleteness
    })
}

/**
 * 데이터 완성도 계산
 */
function getDataCompleteness(travelInfo: ExtractedTravelInfo): number {
  let score = 0
  const fields = [
    'departureDate', 'returnDate', 'destination', 'departure',
    'flightNumber', 'bookingReference', 'hotelName', 'passengerName'
  ]
  
  for (const field of fields) {
    if (travelInfo[field as keyof ExtractedTravelInfo]) {
      score += 1
    }
  }
  
  return score / fields.length
}

/**
 * 스마트 중복 제거
 * 같은 여행에 대한 여러 이메일에서 추출된 정보를 병합
 */
export function deduplicateAndMergeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
  const merged: ExtractedTravelInfo[] = []
  
  for (const current of travelInfos) {
    let foundDuplicate = false
    
    for (let i = 0; i < merged.length; i++) {
      const existing = merged[i]
      
      // 중복 판정 기준: 같은 항공편 번호 또는 같은 예약 번호 또는 같은 날짜+공항 조합
      const isSameTrip = 
        (current.flightNumber && existing.flightNumber && current.flightNumber === existing.flightNumber) ||
        (current.bookingReference && existing.bookingReference && current.bookingReference === existing.bookingReference) ||
        (current.departureDate && existing.departureDate && current.departure && existing.departure &&
         normalizeDateString(current.departureDate) === normalizeDateString(existing.departureDate) &&
         current.departure === existing.departure)
      
      if (isSameTrip) {
        // 더 신뢰도가 높은 정보로 병합
        merged[i] = mergeTravelInfos(existing, current)
        foundDuplicate = true
        break
      }
    }
    
    if (!foundDuplicate) {
      merged.push(current)
    }
  }
  
  return merged
}

/**
 * 두 여행 정보를 병합
 */
function mergeTravelInfos(info1: ExtractedTravelInfo, info2: ExtractedTravelInfo): ExtractedTravelInfo {
  const merged = { ...info1 }
  
  // 더 신뢰도가 높은 정보 우선
  const primary = info1.confidence >= info2.confidence ? info1 : info2
  const secondary = info1.confidence >= info2.confidence ? info2 : info1
  
  // 누락된 필드를 보조 정보로 채움
  const fields: (keyof ExtractedTravelInfo)[] = [
    'departureDate', 'returnDate', 'destination', 'departure',
    'flightNumber', 'bookingReference', 'hotelName', 'passengerName'
  ]
  
  for (const field of fields) {
    if (!merged[field] && secondary[field]) {
      ;(merged as any)[field] = secondary[field]
    }
  }
  
  // 추출된 데이터 병합
  merged.extractedData = {
    dates: [...new Set([...primary.extractedData.dates, ...secondary.extractedData.dates])],
    airports: [...new Set([...primary.extractedData.airports, ...secondary.extractedData.airports])],
    flights: [...new Set([...primary.extractedData.flights, ...secondary.extractedData.flights])],
    bookingCodes: [...new Set([...primary.extractedData.bookingCodes, ...secondary.extractedData.bookingCodes])]
  }
  
  // 신뢰도는 더 높은 값 사용하되, 병합 보너스 추가
  merged.confidence = Math.min(1.0, Math.max(info1.confidence, info2.confidence) + 0.05)
  
  return merged
}