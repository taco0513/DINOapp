import type { CountryVisit, SchengenStatus, SchengenViolation } from '@/types/global'

const SCHENGEN_COUNTRIES = [
  'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
  'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
  'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
]

export interface SchengenVisit {
  country: string
  entryDate: Date
  exitDate: Date | null
  days: number
}

export function isSchengenCountry(country: string): boolean {
  return SCHENGEN_COUNTRIES.includes(country)
}

// Helper function to calculate days between two dates (inclusive)
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export function calculateSchengenStatus(visits: CountryVisit[]): SchengenStatus {
  const today = new Date()
  const currentPeriodStart = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)
  
  // Filter only Schengen visits within the 180-day window
  const relevantVisits = visits
    .filter(visit => isSchengenCountry(visit.country))
    .map(visit => ({
      entryDate: new Date(visit.entryDate),
      exitDate: visit.exitDate ? new Date(visit.exitDate) : null,
      country: visit.country
    }))
    .filter(visit => {
      // Include visits that overlap with the 180-day window
      const visitEnd = visit.exitDate || today
      return visitEnd >= currentPeriodStart && visit.entryDate <= today
    })

  let currentUsedDays = 0
  const violations: SchengenViolation[] = []
  
  // Calculate days used in current 180-day period
  for (const visit of relevantVisits) {
    const visitStart = visit.entryDate > currentPeriodStart ? visit.entryDate : currentPeriodStart
    const visitEnd = visit.exitDate && visit.exitDate < today ? visit.exitDate : today
    
    if (visitStart <= visitEnd) {
      currentUsedDays += calculateDaysBetween(visitStart, visitEnd)
    }
  }

  // Calculate next reset date
  let nextResetDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)
  if (relevantVisits.length > 0) {
    const earliestVisit = relevantVisits
      .filter(visit => visit.entryDate >= currentPeriodStart)
      .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime())[0]
    
    if (earliestVisit) {
      nextResetDate = new Date(earliestVisit.entryDate.getTime() + 180 * 24 * 60 * 60 * 1000)
    }
  }

  // Check for violations
  if (currentUsedDays > 90) {
    violations.push({
      date: today.toISOString().split('T')[0],
      daysOverLimit: currentUsedDays - 90,
      description: `${currentUsedDays} days used in current 180-day period (limit: 90 days)`
    })
  }

  return {
    usedDays: currentUsedDays,
    remainingDays: Math.max(0, 90 - currentUsedDays),
    nextResetDate: nextResetDate.toISOString().split('T')[0],
    isCompliant: violations.length === 0,
    violations
  }
}

export function getSchengenWarnings(status: SchengenStatus): string[] {
  const warnings: string[] = []
  
  if (!status.isCompliant) {
    warnings.push('⚠️ 셰겐 규정 위반: 90/180일 규칙을 초과했습니다.')
  }
  
  if (status.remainingDays <= 10 && status.remainingDays > 0) {
    warnings.push(`⚠️ 주의: 셰겐 지역 체류 가능일이 ${status.remainingDays}일 남았습니다.`)
  }
  
  if (status.remainingDays === 0 && status.isCompliant) {
    warnings.push('⚠️ 셰겐 지역 체류 한도에 도달했습니다. 추가 체류는 불가능합니다.')
  }
  
  return warnings
}

export function calculateMaxStayDays(status: SchengenStatus): number {
  if (!status.isCompliant) {
    return 0 // Already violated, cannot stay
  }
  
  return status.remainingDays
}

export function getNextEntryDate(visits: CountryVisit[]): Date | null {
  const status = calculateSchengenStatus(visits)
  
  if (status.isCompliant && status.remainingDays > 0) {
    return new Date() // Can enter immediately
  }
  
  return new Date(status.nextResetDate)
}

export interface FutureTripValidation {
  canTravel: boolean
  warnings: string[]
  suggestions: string[]
  maxStayDays: number
  violatesRule: boolean
  daysUsedAfterTrip: number
  remainingDaysAfterTrip: number
}

export function validateFutureTrip(
  visits: CountryVisit[],
  plannedEntry: Date,
  plannedExit: Date,
  plannedCountry: string
): FutureTripValidation {
  // Check if it's a Schengen country
  if (!isSchengenCountry(plannedCountry)) {
    return {
      canTravel: true,
      warnings: [],
      suggestions: [`${plannedCountry}는 셰겐 지역이 아니므로 90/180일 규칙이 적용되지 않습니다.`],
      maxStayDays: 90,
      violatesRule: false,
      daysUsedAfterTrip: 0,
      remainingDaysAfterTrip: 90
    }
  }

  // Calculate planned trip duration
  const plannedDays = Math.ceil((plannedExit.getTime() - plannedEntry.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Create a hypothetical visit list including the planned trip
  const hypotheticalVisits: CountryVisit[] = [
    ...visits,
    {
      id: 'planned',
      userId: 'current',
      country: plannedCountry,
      entryDate: plannedEntry.toISOString().split('T')[0],
      exitDate: plannedExit.toISOString().split('T')[0],
      visaType: 'Tourist',
      maxDays: 90,
      notes: 'Planned trip',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // Calculate status with the planned trip
  const futureStatus = calculateSchengenStatus(hypotheticalVisits)
  
  // Calculate status on the planned entry date
  const statusOnEntry = calculateSchengenStatusOnDate(visits, plannedEntry)
  
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Check if already at limit on entry date
  if (statusOnEntry.remainingDays === 0) {
    warnings.push('⚠️ 계획된 입국일에 이미 90일 한도에 도달합니다.')
    suggestions.push(`다음 날짜 이후 입국 가능: ${statusOnEntry.nextResetDate}`)
  }
  
  // Check if planned stay exceeds available days
  if (plannedDays > statusOnEntry.remainingDays) {
    warnings.push(`⚠️ 계획된 ${plannedDays}일 체류는 가능한 ${statusOnEntry.remainingDays}일을 초과합니다.`)
    suggestions.push(`최대 ${statusOnEntry.remainingDays}일까지만 체류 가능합니다.`)
  }
  
  // Check if it would violate the rule
  if (!futureStatus.isCompliant) {
    warnings.push('🚫 이 여행은 셰겐 90/180일 규칙을 위반하게 됩니다.')
    
    // Calculate safe duration
    const safeDays = statusOnEntry.remainingDays
    if (safeDays > 0) {
      const safeExitDate = new Date(plannedEntry.getTime() + (safeDays - 1) * 24 * 60 * 60 * 1000)
      suggestions.push(`${plannedEntry.toLocaleDateString('ko-KR')}부터 ${safeExitDate.toLocaleDateString('ko-KR')}까지 (${safeDays}일) 체류 가능`)
    }
  }
  
  // Provide recommendations
  if (warnings.length === 0) {
    suggestions.push('✅ 계획된 여행은 셰겐 규정을 준수합니다.')
    suggestions.push(`여행 후 남은 일수: ${futureStatus.remainingDays}일`)
  }
  
  return {
    canTravel: warnings.length === 0,
    warnings,
    suggestions,
    maxStayDays: statusOnEntry.remainingDays,
    violatesRule: !futureStatus.isCompliant,
    daysUsedAfterTrip: futureStatus.usedDays,
    remainingDaysAfterTrip: futureStatus.remainingDays
  }
}

// Helper function to calculate status on a specific date
function calculateSchengenStatusOnDate(visits: CountryVisit[], checkDate: Date): SchengenStatus {
  // Filter visits that are before or on the check date
  const relevantVisits = visits.filter(visit => new Date(visit.entryDate) <= checkDate)
  
  // For ongoing visits, adjust exit date to check date
  const adjustedVisits = relevantVisits.map(visit => {
    if (!visit.exitDate || new Date(visit.exitDate) > checkDate) {
      return {
        ...visit,
        exitDate: checkDate.toISOString().split('T')[0]
      }
    }
    return visit
  })
  
  return calculateSchengenStatus(adjustedVisits)
}

export function getSafeTravelDates(
  visits: CountryVisit[],
  desiredDuration: number,
  earliestDate: Date = new Date()
): { startDate: Date; endDate: Date } | null {
  const maxAttempts = 365 // Check up to 1 year ahead
  
  for (let i = 0; i < maxAttempts; i++) {
    const testStartDate = new Date(earliestDate.getTime() + i * 24 * 60 * 60 * 1000)
    const testEndDate = new Date(testStartDate.getTime() + (desiredDuration - 1) * 24 * 60 * 60 * 1000)
    
    const validation = validateFutureTrip(
      visits,
      testStartDate,
      testEndDate,
      'France' // Use any Schengen country for testing
    )
    
    if (validation.canTravel && !validation.violatesRule) {
      return {
        startDate: testStartDate,
        endDate: testEndDate
      }
    }
  }
  
  return null
}