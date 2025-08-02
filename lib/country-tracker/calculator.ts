/**
 * DINO v2.0 - Multi-Country Stay Tracker
 * Universal calculator for tracking stay limits across any country
 * 
 * Features:
 * - Generic country policy support
 * - Multiple rolling window calculations
 * - Nationality-specific rules
 * - Warning and violation detection
 */

import {
  type CountryStayPolicy,
  type StayRecord,
  type StayStatus,
  type CountryTrackerResult,
  type StayViolation,
  COUNTRY_STAY_POLICIES
} from '@/types/country-tracker';

/**
 * Constants for calculations
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate days between two dates (inclusive)
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / MS_PER_DAY) + 1;
}

/**
 * Get stay policy for a country and nationality
 */
function getStayPolicy(countryCode: string, nationality: string = 'KR'): CountryStayPolicy | null {
  const policy = COUNTRY_STAY_POLICIES[countryCode];
  if (!policy) return null;

  // Check if there's nationality-specific policy
  if (policy.nationalitySpecific?.[nationality]) {
    const specificPolicy = policy.nationalitySpecific[nationality];
    return {
      ...policy,
      maxDays: specificPolicy.maxDays,
      rollingPeriodDays: specificPolicy.rollingPeriodDays,
      description: specificPolicy.description
    };
  }

  return policy;
}

/**
 * Calculate days spent in a country within a rolling period
 */
function calculateDaysInPeriod(
  stays: readonly StayRecord[],
  countryCode: string,
  referenceDate: Date,
  rollingPeriodDays: number
): { daysUsed: number; relevantStays: StayRecord[] } {
  const periodStart = new Date(referenceDate);
  periodStart.setDate(periodStart.getDate() - rollingPeriodDays);

  const relevantStays = stays.filter(stay => 
    stay.countryCode === countryCode &&
    stay.entryDate >= periodStart &&
    stay.entryDate <= referenceDate
  );

  const daysUsed = relevantStays.reduce((total, stay) => {
    const exitDate = stay.exitDate || referenceDate;
    const entryInPeriod = stay.entryDate >= periodStart ? stay.entryDate : periodStart;
    const exitInPeriod = exitDate <= referenceDate ? exitDate : referenceDate;
    
    if (entryInPeriod <= exitInPeriod) {
      return total + calculateDaysBetween(entryInPeriod, exitInPeriod);
    }
    return total;
  }, 0);

  return { daysUsed, relevantStays };
}

/**
 * Determine warning level based on usage percentage
 */
function getWarningLevel(daysUsed: number, maxDays: number): StayStatus['warningLevel'] {
  const percentage = (daysUsed / maxDays) * 100;
  
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  if (percentage >= 60) return 'caution';
  return 'safe';
}

/**
 * Calculate when user can next enter a country
 */
function calculateNextAvailableDate(
  stays: readonly StayRecord[],
  countryCode: string,
  policy: CountryStayPolicy,
  currentDate: Date = new Date()
): Date | undefined {
  const { daysUsed } = calculateDaysInPeriod(stays, countryCode, currentDate, policy.rollingPeriodDays);
  
  if (daysUsed < policy.maxDays) {
    return undefined; // Can enter now
  }

  // Find the earliest stay that will fall outside the rolling window
  const periodStart = new Date(currentDate);
  periodStart.setDate(periodStart.getDate() - policy.rollingPeriodDays);

  const relevantStays = stays
    .filter(stay => stay.countryCode === countryCode && stay.entryDate >= periodStart)
    .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

  if (relevantStays.length === 0) return undefined;

  // Calculate when enough days will be freed up
  let runningDays = 0;
  for (const stay of relevantStays) {
    const stayDays = calculateDaysBetween(
      stay.entryDate,
      stay.exitDate || currentDate
    );
    runningDays += stayDays;

    if (runningDays >= (daysUsed - policy.maxDays + 1)) {
      const nextAvailable = new Date(stay.entryDate);
      nextAvailable.setDate(nextAvailable.getDate() + policy.rollingPeriodDays + 1);
      return nextAvailable;
    }
  }

  return undefined;
}

/**
 * Detect violations in stay records
 */
function detectViolations(
  stays: readonly StayRecord[],
  countryCode: string,
  policy: CountryStayPolicy
): StayViolation[] {
  const violations: StayViolation[] = [];
  const sortedStays = [...stays]
    .filter(stay => stay.countryCode === countryCode)
    .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

  for (const stay of sortedStays) {
    const checkDate = stay.exitDate || new Date();
    const { daysUsed } = calculateDaysInPeriod(stays, countryCode, checkDate, policy.rollingPeriodDays);

    if (daysUsed > policy.maxDays) {
      violations.push({
        type: 'exceeds_limit',
        severity: daysUsed > policy.maxDays * 1.2 ? 'critical' : 'major',
        description: `${policy.countryName}에서 ${policy.rollingPeriodDays}일 기간 중 ${policy.maxDays}일 한도 초과 (${daysUsed}일 체류)`,
        date: stay.entryDate,
        daysOver: daysUsed - policy.maxDays
      });
    }
  }

  return violations;
}

/**
 * Generate recommendations based on current status
 */
function generateRecommendations(
  status: StayStatus,
  violations: readonly StayViolation[]
): string[] {
  const recommendations: string[] = [];
  
  if (status.warningLevel === 'danger') {
    recommendations.push('⚠️ 체류 한도를 초과했습니다. 즉시 출국을 고려하세요.');
  } else if (status.warningLevel === 'warning') {
    recommendations.push('🚨 체류 한도에 근접했습니다. 출국 계획을 세우세요.');
  } else if (status.warningLevel === 'caution') {
    recommendations.push('⚡ 체류 기간을 주의깊게 모니터링하세요.');
  }

  if (status.nextAvailableDate) {
    const daysUntil = Math.ceil(
      (status.nextAvailableDate.getTime() - new Date().getTime()) / MS_PER_DAY
    );
    recommendations.push(`📅 다음 입국 가능일: ${status.nextAvailableDate.toLocaleDateString('ko-KR')} (${daysUntil}일 후)`);
  }

  if (violations.length === 0 && status.warningLevel === 'safe') {
    recommendations.push('✅ 현재 체류 상태가 안전합니다.');
  }

  return recommendations;
}

/**
 * Main function: Calculate country stay status
 */
export function calculateCountryStatus(
  stays: readonly StayRecord[],
  countryCode: string,
  nationality: string = 'KR',
  referenceDate: Date = new Date()
): CountryTrackerResult | null {
  const policy = getStayPolicy(countryCode, nationality);
  if (!policy) return null;

  // Calculate current period
  const currentPeriodStart = new Date(referenceDate);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - policy.rollingPeriodDays);

  const { daysUsed, relevantStays } = calculateDaysInPeriod(
    stays,
    countryCode,
    referenceDate,
    policy.rollingPeriodDays
  );

  const status: StayStatus = {
    countryCode,
    daysUsed,
    daysRemaining: Math.max(0, policy.maxDays - daysUsed),
    maxAllowedDays: policy.maxDays,
    rollingPeriodDays: policy.rollingPeriodDays,
    currentPeriodStart,
    currentPeriodEnd: referenceDate,
    warningLevel: getWarningLevel(daysUsed, policy.maxDays),
    nextAvailableDate: calculateNextAvailableDate(stays, countryCode, policy, referenceDate)
  };

  const violations = detectViolations(stays, countryCode, policy);
  const recommendations = generateRecommendations(status, violations);

  return {
    status,
    recentStays: relevantStays,
    violations,
    recommendations
  };
}

/**
 * Calculate status for multiple countries
 */
export function calculateMultiCountryStatus(
  stays: readonly StayRecord[],
  nationality: string = 'KR',
  referenceDate: Date = new Date()
): Record<string, CountryTrackerResult> {
  const results: Record<string, CountryTrackerResult> = {};
  
  // Get unique countries from stays
  const countries = [...new Set(stays.map(stay => stay.countryCode))];
  
  for (const countryCode of countries) {
    const result = calculateCountryStatus(stays, countryCode, nationality, referenceDate);
    if (result) {
      results[countryCode] = result;
    }
  }

  return results;
}

/**
 * Get all supported countries
 */
export function getSupportedCountries(): CountryStayPolicy[] {
  return Object.values(COUNTRY_STAY_POLICIES);
}

/**
 * Check if a future trip is valid
 */
export function validateFutureTrip(
  existingStays: readonly StayRecord[],
  plannedEntry: Date,
  plannedExit: Date,
  countryCode: string,
  nationality: string = 'KR'
): { isValid: boolean; warnings: string[]; daysUsedAfter: number } {
  const policy = getStayPolicy(countryCode, nationality);
  if (!policy) {
    return { isValid: false, warnings: ['지원되지 않는 국가입니다.'], daysUsedAfter: 0 };
  }

  const plannedStay: StayRecord = {
    id: 'temp',
    countryCode,
    entryDate: plannedEntry,
    exitDate: plannedExit
  };

  const allStays = [...existingStays, plannedStay];
  const { daysUsed } = calculateDaysInPeriod(allStays, countryCode, plannedExit, policy.rollingPeriodDays);
  
  const warnings: string[] = [];
  const isValid = daysUsed <= policy.maxDays;

  if (!isValid) {
    warnings.push(`계획된 여행 후 ${policy.rollingPeriodDays}일 기간 중 ${daysUsed}일로 ${policy.maxDays}일 한도를 초과합니다.`);
  } else if (daysUsed > policy.maxDays * 0.8) {
    warnings.push('계획된 여행 후 체류 한도에 근접하게 됩니다.');
  }

  return { isValid, warnings, daysUsedAfter: daysUsed };
}