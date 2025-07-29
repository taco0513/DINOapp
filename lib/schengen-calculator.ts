import type { CountryVisit, SchengenStatus, SchengenViolation } from '@/types/global'
import { getSchengenCountries } from '@/data/countries'

/**
 * Schengen Zone Calculator Module
 * 
 * Provides comprehensive calculations and validations for Schengen Area travel compliance.
 * Implements the 90/180 day rule with support for:
 * - Current status calculation
 * - Future trip validation
 * - Safe travel date suggestions
 * - Violation detection and warnings
 * 
 * @module schengen-calculator
 */

// Get Schengen country names from the countries data
const SCHENGEN_COUNTRIES = getSchengenCountries().map(country => country.name)

/**
 * Represents a visit to a Schengen country with calculated days
 */
export interface SchengenVisit {
  /** Country name */
  country: string
  /** Entry date to the country */
  entryDate: Date
  /** Exit date from the country (null if ongoing) */
  exitDate: Date | null
  /** Number of days spent in the country */
  days: number
}

/**
 * Checks if a country is part of the Schengen Area
 * @param country - Country name to check
 * @returns true if the country is in the Schengen Area
 * 
 * @example
 * ```typescript
 * if (isSchengenCountry('France')) {
 *   console.log('France is in the Schengen Area');
 * }
 * ```
 */
export function isSchengenCountry(country: string): boolean {
  return SCHENGEN_COUNTRIES.includes(country)
}

/**
 * Calculates the number of days between two dates (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days including both start and end dates
 * @private
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

/**
 * Calculates current Schengen zone compliance status
 * Implements the 90/180 day rule by analyzing all visits within the last 180 days
 * 
 * @param visits - Array of country visits to analyze
 * @returns SchengenStatus object with usage details and compliance status
 * 
 * @example
 * ```typescript
 * const visits = [
 *   { country: 'France', entryDate: '2024-01-01', exitDate: '2024-01-15', ... },
 *   { country: 'Germany', entryDate: '2024-02-01', exitDate: '2024-02-10', ... }
 * ];
 * 
 * const status = calculateSchengenStatus(visits);
 * console.log(`Used: ${status.usedDays}/90 days`);
 * console.log(`Remaining: ${status.remainingDays} days`);
 * console.log(`Compliant: ${status.isCompliant}`);
 * ```
 */
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

/**
 * Generates user-friendly warnings based on Schengen status
 * @param status - Current Schengen status
 * @returns Array of warning messages in Korean
 * 
 * @example
 * ```typescript
 * const warnings = getSchengenWarnings(status);
 * if (warnings.length > 0) {
 *   warnings.forEach(warning => console.log(warning));
 * }
 * ```
 */
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

/**
 * Calculates maximum days that can be stayed in Schengen area
 * @param status - Current Schengen status
 * @returns Maximum number of days available for stay (0 if already violated)
 */
export function calculateMaxStayDays(status: SchengenStatus): number {
  if (!status.isCompliant) {
    return 0 // Already violated, cannot stay
  }
  
  return status.remainingDays
}

/**
 * Determines the next date when entry to Schengen area will be allowed
 * @param visits - Array of country visits
 * @returns Date when entry is allowed, or null if can enter immediately
 * 
 * @example
 * ```typescript
 * const nextEntry = getNextEntryDate(visits);
 * if (nextEntry) {
 *   console.log(`Can enter Schengen area from: ${nextEntry.toLocaleDateString()}`);
 * } else {
 *   console.log('Can enter Schengen area immediately');
 * }
 * ```
 */
export function getNextEntryDate(visits: CountryVisit[]): Date | null {
  const status = calculateSchengenStatus(visits)
  
  if (status.isCompliant && status.remainingDays > 0) {
    return new Date() // Can enter immediately
  }
  
  return new Date(status.nextResetDate)
}

/**
 * Result of future trip validation
 */
export interface FutureTripValidation {
  /** Whether the trip is allowed under Schengen rules */
  canTravel: boolean
  /** Warning messages about potential issues */
  warnings: string[]
  /** Helpful suggestions for the traveler */
  suggestions: string[]
  /** Maximum days that can be stayed on entry date */
  maxStayDays: number
  /** Whether the trip would violate 90/180 rule */
  violatesRule: boolean
  /** Total days used after the planned trip */
  daysUsedAfterTrip: number
  /** Days remaining after the planned trip */
  remainingDaysAfterTrip: number
}

/**
 * Validates a future trip against Schengen 90/180 day rule
 * Provides detailed analysis including warnings and suggestions
 * 
 * @param visits - Existing country visits
 * @param plannedEntry - Planned entry date
 * @param plannedExit - Planned exit date
 * @param plannedCountry - Planned destination country
 * @returns Validation result with warnings and suggestions
 * 
 * @example
 * ```typescript
 * const validation = validateFutureTrip(
 *   existingVisits,
 *   new Date('2024-06-01'),
 *   new Date('2024-06-15'),
 *   'France'
 * );
 * 
 * if (!validation.canTravel) {
 *   console.log('Trip not allowed:', validation.warnings);
 *   console.log('Suggestions:', validation.suggestions);
 * }
 * ```
 */
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

/**
 * Calculates Schengen status as of a specific date
 * Used for future trip planning and historical analysis
 * 
 * @param visits - Array of country visits
 * @param checkDate - Date to calculate status for
 * @returns Schengen status as of the specified date
 * @private
 */
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

/**
 * Finds the earliest safe travel dates for a desired duration
 * Searches up to 1 year ahead for compliant travel dates
 * 
 * @param visits - Existing country visits
 * @param desiredDuration - Desired trip duration in days
 * @param earliestDate - Earliest date to start searching from (default: today)
 * @returns Object with safe start and end dates, or null if not found within 1 year
 * 
 * @example
 * ```typescript
 * const safeDates = getSafeTravelDates(visits, 14); // 14-day trip
 * if (safeDates) {
 *   console.log(`Safe to travel from ${safeDates.startDate} to ${safeDates.endDate}`);
 * } else {
 *   console.log('No safe dates found within the next year');
 * }
 * ```
 */
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