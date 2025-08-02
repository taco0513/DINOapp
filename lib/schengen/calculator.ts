/**
 * DINO v2.0 - Schengen Calculator
 * Clean, type-safe implementation of Schengen 90/180 day rule
 * 
 * Key improvements from v1:
 * - Zero technical debt
 * - Immutable data structures
 * - Pure functions only
 * - 100% type safety
 * - Comprehensive edge case handling
 */

import type {
  CountryVisit,
  SchengenStatus,
  SchengenViolation,
  FutureTripValidation,
  SafeTravelDates,
  SchengenCalculationResult
} from '@/types/schengen';
import { isSchengenCountryName } from '@/data/schengen-countries';

/**
 * Constants for Schengen calculations
 */
const SCHENGEN_LIMITS = {
  MAX_DAYS: 90,
  PERIOD_DAYS: 180,
  MS_PER_DAY: 24 * 60 * 60 * 1000
} as const;

/**
 * Represents a processed visit with Date objects
 */
interface ProcessedVisit {
  readonly country: string;
  readonly entryDate: Date;
  readonly exitDate: Date | null;
  readonly isSchengen: boolean;
}

/**
 * Calculates the number of days between two dates (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days including both start and end dates
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / SCHENGEN_LIMITS.MS_PER_DAY) + 1;
}

/**
 * Processes raw visits into typed visit objects
 * @param visits - Raw country visits
 * @returns Processed visits with Date objects and Schengen flag
 */
function processVisits(visits: readonly CountryVisit[]): readonly ProcessedVisit[] {
  return visits.map(visit => ({
    country: visit.country,
    entryDate: new Date(visit.entryDate),
    exitDate: visit.exitDate ? new Date(visit.exitDate) : null,
    isSchengen: isSchengenCountryName(visit.country)
  }));
}

/**
 * Filters visits to only include those relevant to Schengen calculations
 * @param visits - Processed visits
 * @param referenceDate - Reference date for the 180-day window
 * @returns Visits that overlap with the 180-day window
 */
function getRelevantVisits(
  visits: readonly ProcessedVisit[],
  referenceDate: Date
): readonly ProcessedVisit[] {
  const windowStart = new Date(referenceDate.getTime() - SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
  
  return visits
    .filter(visit => visit.isSchengen)
    .filter(visit => {
      const visitEnd = visit.exitDate ?? referenceDate;
      return visitEnd >= windowStart && visit.entryDate <= referenceDate;
    });
}

/**
 * Calculates days used in Schengen area within the 180-day window
 * @param relevantVisits - Visits within the relevant period
 * @param referenceDate - Reference date for calculations
 * @returns Number of days used in current 180-day period
 */
function calculateUsedDays(
  relevantVisits: readonly ProcessedVisit[],
  referenceDate: Date
): number {
  const windowStart = new Date(referenceDate.getTime() - SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
  
  let totalDays = 0;
  
  for (const visit of relevantVisits) {
    const visitStart = visit.entryDate > windowStart ? visit.entryDate : windowStart;
    const visitEnd = visit.exitDate && visit.exitDate < referenceDate ? visit.exitDate : referenceDate;
    
    if (visitStart <= visitEnd) {
      totalDays += calculateDaysBetween(visitStart, visitEnd);
    }
  }
  
  return totalDays;
}

/**
 * Calculates the next reset date for the 180-day window
 * @param relevantVisits - Visits within the relevant period
 * @param referenceDate - Reference date for calculations
 * @returns Date when the 180-day window resets
 */
function calculateNextResetDate(
  relevantVisits: readonly ProcessedVisit[],
  referenceDate: Date
): Date {
  if (relevantVisits.length === 0) {
    return new Date(referenceDate.getTime() + SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
  }
  
  const windowStart = new Date(referenceDate.getTime() - SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
  const visitsInWindow = relevantVisits.filter(visit => visit.entryDate >= windowStart);
  
  if (visitsInWindow.length === 0) {
    return new Date(referenceDate.getTime() + SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
  }
  
  const earliestEntry = visitsInWindow.reduce((earliest, visit) => 
    visit.entryDate < earliest.entryDate ? visit : earliest
  );
  
  return new Date(earliestEntry.entryDate.getTime() + SCHENGEN_LIMITS.PERIOD_DAYS * SCHENGEN_LIMITS.MS_PER_DAY);
}

/**
 * Detects violations of the 90/180 day rule
 * @param usedDays - Days used in current period
 * @param referenceDate - Reference date for violations
 * @returns Array of violations (empty if compliant)
 */
function detectViolations(usedDays: number, referenceDate: Date): readonly SchengenViolation[] {
  if (usedDays <= SCHENGEN_LIMITS.MAX_DAYS) {
    return [];
  }
  
  return [{
    date: referenceDate.toISOString().split('T')[0],
    daysOverLimit: usedDays - SCHENGEN_LIMITS.MAX_DAYS,
    description: `${usedDays} days used in current 180-day period (limit: ${SCHENGEN_LIMITS.MAX_DAYS} days)`
  }];
}

/**
 * Calculates current Schengen zone compliance status
 * Implements the 90/180 day rule with full type safety
 * 
 * @param visits - Array of country visits to analyze
 * @param referenceDate - Date to calculate status for (defaults to today)
 * @returns SchengenStatus object with usage details and compliance status
 */
export function calculateSchengenStatus(
  visits: readonly CountryVisit[],
  referenceDate: Date = new Date()
): SchengenStatus {
  const processedVisits = processVisits(visits);
  const relevantVisits = getRelevantVisits(processedVisits, referenceDate);
  const usedDays = calculateUsedDays(relevantVisits, referenceDate);
  const nextResetDate = calculateNextResetDate(relevantVisits, referenceDate);
  const violations = detectViolations(usedDays, referenceDate);
  
  return {
    usedDays,
    remainingDays: Math.max(0, SCHENGEN_LIMITS.MAX_DAYS - usedDays),
    nextResetDate: nextResetDate.toISOString().split('T')[0],
    isCompliant: violations.length === 0,
    violations
  };
}

/**
 * Generates user-friendly warnings based on Schengen status
 * @param status - Current Schengen status
 * @returns Array of warning messages in Korean
 */
export function generateWarnings(status: SchengenStatus): readonly string[] {
  const warnings: string[] = [];
  
  if (!status.isCompliant) {
    warnings.push('⚠️ 셰겐 규정 위반: 90/180일 규칙을 초과했습니다.');
  }
  
  if (status.remainingDays <= 10 && status.remainingDays > 0) {
    warnings.push(`⚠️ 주의: 셰겐 지역 체류 가능일이 ${status.remainingDays}일 남았습니다.`);
  }
  
  if (status.remainingDays === 0 && status.isCompliant) {
    warnings.push('⚠️ 셰겐 지역 체류 한도에 도달했습니다. 추가 체류는 불가능합니다.');
  }
  
  return warnings;
}

/**
 * Validates a future trip against Schengen 90/180 day rule
 * @param visits - Existing country visits
 * @param plannedEntry - Planned entry date
 * @param plannedExit - Planned exit date
 * @param plannedCountry - Planned destination country
 * @returns Validation result with warnings and suggestions
 */
export function validateFutureTrip(
  visits: readonly CountryVisit[],
  plannedEntry: Date,
  plannedExit: Date,
  plannedCountry: string
): FutureTripValidation {
  // Check if destination is Schengen
  if (!isSchengenCountryName(plannedCountry)) {
    return {
      canTravel: true,
      warnings: [],
      suggestions: [`${plannedCountry}는 셰겐 지역이 아니므로 90/180일 규칙이 적용되지 않습니다.`],
      maxStayDays: 365,
      violatesRule: false,
      daysUsedAfterTrip: 0,
      remainingDaysAfterTrip: 90
    };
  }

  const plannedDays = calculateDaysBetween(plannedEntry, plannedExit);
  
  // Create hypothetical visit list including the planned trip
  const hypotheticalVisits: CountryVisit[] = [
    ...visits,
    {
      id: 'planned-trip',
      userId: 'current-user',
      country: plannedCountry,
      entryDate: plannedEntry.toISOString().split('T')[0],
      exitDate: plannedExit.toISOString().split('T')[0],
      visaType: 'Tourist',
      maxDays: 90,
      notes: 'Planned trip validation',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const statusOnEntry = calculateSchengenStatus(visits, plannedEntry);
  const statusAfterTrip = calculateSchengenStatus(hypotheticalVisits, plannedExit);
  
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check if can enter on planned date
  if (statusOnEntry.remainingDays === 0) {
    warnings.push('⚠️ 계획된 입국일에 이미 90일 한도에 도달합니다.');
    suggestions.push(`다음 날짜 이후 입국 가능: ${statusOnEntry.nextResetDate}`);
  }
  
  // Check if planned stay exceeds available days
  if (plannedDays > statusOnEntry.remainingDays) {
    warnings.push(`⚠️ 계획된 ${plannedDays}일 체류는 가능한 ${statusOnEntry.remainingDays}일을 초과합니다.`);
    suggestions.push(`최대 ${statusOnEntry.remainingDays}일까지만 체류 가능합니다.`);
  }
  
  // Check if would violate rule
  if (!statusAfterTrip.isCompliant) {
    warnings.push('🚫 이 여행은 셰겐 90/180일 규칙을 위반하게 됩니다.');
    
    if (statusOnEntry.remainingDays > 0) {
      const safeExitDate = new Date(plannedEntry.getTime() + (statusOnEntry.remainingDays - 1) * SCHENGEN_LIMITS.MS_PER_DAY);
      suggestions.push(`안전한 체류 기간: ${plannedEntry.toLocaleDateString('ko-KR')}부터 ${safeExitDate.toLocaleDateString('ko-KR')}까지 (${statusOnEntry.remainingDays}일)`);
    }
  }
  
  // Provide positive feedback for compliant trips
  if (warnings.length === 0) {
    suggestions.push('✅ 계획된 여행은 셰겐 규정을 준수합니다.');
    suggestions.push(`여행 후 남은 일수: ${statusAfterTrip.remainingDays}일`);
  }
  
  return {
    canTravel: warnings.length === 0,
    warnings,
    suggestions,
    maxStayDays: statusOnEntry.remainingDays,
    violatesRule: !statusAfterTrip.isCompliant,
    daysUsedAfterTrip: statusAfterTrip.usedDays,
    remainingDaysAfterTrip: statusAfterTrip.remainingDays
  };
}

/**
 * Finds safe travel dates for a desired duration
 * @param visits - Existing country visits
 * @param desiredDuration - Desired trip duration in days
 * @param earliestDate - Earliest date to start searching from
 * @returns Safe travel dates or null if not found within reasonable time
 */
export function findSafeTravelDates(
  visits: readonly CountryVisit[],
  desiredDuration: number,
  earliestDate: Date = new Date()
): SafeTravelDates | null {
  const maxSearchDays = 365; // Search up to 1 year ahead
  
  for (let dayOffset = 0; dayOffset < maxSearchDays; dayOffset++) {
    const testStartDate = new Date(earliestDate.getTime() + dayOffset * SCHENGEN_LIMITS.MS_PER_DAY);
    const testEndDate = new Date(testStartDate.getTime() + (desiredDuration - 1) * SCHENGEN_LIMITS.MS_PER_DAY);
    
    const validation = validateFutureTrip(
      visits,
      testStartDate,
      testEndDate,
      'Germany' // Use any Schengen country for validation
    );
    
    if (validation.canTravel && !validation.violatesRule) {
      return {
        startDate: testStartDate,
        endDate: testEndDate
      };
    }
  }
  
  return null;
}

/**
 * Comprehensive Schengen calculation with all information
 * @param visits - Country visits to analyze
 * @param referenceDate - Date to calculate status for
 * @returns Complete calculation result
 */
export function calculateComprehensiveStatus(
  visits: readonly CountryVisit[],
  referenceDate: Date = new Date()
): SchengenCalculationResult {
  const status = calculateSchengenStatus(visits, referenceDate);
  const warnings = generateWarnings(status);
  
  const recommendations: string[] = [];
  
  if (status.remainingDays > 0 && status.remainingDays <= 30) {
    recommendations.push('출국 계획을 세우거나 체류 연장을 검토하세요.');
  }
  
  if (status.remainingDays > 60) {
    recommendations.push('현재 안전한 체류 상태입니다.');
  }
  
  if (!status.isCompliant) {
    recommendations.push('즉시 출국하거나 관련 당국에 문의하세요.');
  }
  
  return {
    status,
    warnings,
    recommendations,
    nextAllowedEntry: !status.isCompliant ? status.nextResetDate : undefined,
    maxStayDays: status.remainingDays
  };
}

/**
 * Simple helper to calculate Schengen days from Trip records
 * @param trips - Array of Trip records from database
 * @param referenceDate - Date to calculate for
 * @returns Number of days used in current 180-day period
 */
export function calculateSchengenDays(
  trips: Array<{ entryDate: Date | string; exitDate: Date | string | null; isSchengen: boolean }>,
  referenceDate: Date = new Date()
): number {
  const visits: CountryVisit[] = trips
    .filter(trip => trip.isSchengen)
    .map((trip, index) => ({
      id: `trip-${index}`,
      userId: 'current-user',
      country: 'Schengen',
      entryDate: typeof trip.entryDate === 'string' ? trip.entryDate : trip.entryDate.toISOString().split('T')[0],
      exitDate: trip.exitDate ? (typeof trip.exitDate === 'string' ? trip.exitDate : trip.exitDate.toISOString().split('T')[0]) : null,
      visaType: 'Tourist',
      maxDays: 90,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  
  const status = calculateSchengenStatus(visits, referenceDate);
  return status.usedDays;
}