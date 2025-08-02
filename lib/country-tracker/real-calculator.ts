/**
 * DINO v2.0 - Realistic Country Stay Calculator
 * Implements actual immigration policies for each country
 * 
 * Features:
 * - Country-specific calculation methods
 * - Real immigration law compliance
 * - Accurate policy interpretation
 * - Multiple calculation strategies
 */

import {
  type CountryStayPolicy,
  type StayRecord,
  type StayStatus,
  type CountryTrackerResult,
  type StayViolation,
  type CalculationMethod,
  COUNTRY_STAY_POLICIES
} from '@/types/country-tracker';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate days between two dates (inclusive)
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / MS_PER_DAY) + 1;
}

/**
 * Get calendar year start and end dates
 */
function getCalendarYearPeriod(referenceDate: Date): { start: Date; end: Date } {
  const year = referenceDate.getFullYear();
  return {
    start: new Date(year, 0, 1), // January 1st
    end: new Date(year, 11, 31)  // December 31st
  };
}

/**
 * Get entry-based period (365 days from first entry)
 */
function getEntryBasedPeriod(stays: readonly StayRecord[], countryCode: string, _referenceDate: Date): { start: Date; end: Date } | null {
  const countryStays = stays
    .filter(stay => stay.countryCode === countryCode)
    .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

  if (countryStays.length === 0) return null;

  const firstEntry = countryStays[0].entryDate;
  const end = new Date(firstEntry);
  end.setDate(end.getDate() + 364); // 365 days total

  return { start: firstEntry, end };
}

/**
 * Calculate days spent using different methods
 */
function calculateDaysByMethod(
  stays: readonly StayRecord[],
  countryCode: string,
  method: CalculationMethod,
  referenceDate: Date,
  periodDays?: number
): { daysUsed: number; periodStart?: Date; periodEnd?: Date; relevantStays: StayRecord[] } {
  const countryStays = stays.filter(stay => stay.countryCode === countryCode);

  switch (method) {
    case 'per_entry': {
      // Each entry is independent - check current/last stay only
      const currentStay = countryStays.find(stay => 
        stay.entryDate <= referenceDate && 
        (!stay.exitDate || stay.exitDate >= referenceDate)
      );
      
      if (currentStay) {
        const exitDate = currentStay.exitDate || referenceDate;
        const daysUsed = calculateDaysBetween(currentStay.entryDate, exitDate);
        return { 
          daysUsed, 
          relevantStays: [currentStay],
          periodStart: currentStay.entryDate,
          periodEnd: exitDate
        };
      }
      return { daysUsed: 0, relevantStays: [] };
    }

    case 'calendar_year': {
      const { start, end } = getCalendarYearPeriod(referenceDate);
      const relevantStays = countryStays.filter(stay => 
        stay.entryDate <= end && (!stay.exitDate || stay.exitDate >= start)
      );

      const daysUsed = relevantStays.reduce((total, stay) => {
        const entryInPeriod = stay.entryDate >= start ? stay.entryDate : start;
        const exitInPeriod = (stay.exitDate && stay.exitDate <= end) ? stay.exitDate : 
                            (!stay.exitDate && referenceDate <= end) ? referenceDate : end;
        
        if (entryInPeriod <= exitInPeriod) {
          return total + calculateDaysBetween(entryInPeriod, exitInPeriod);
        }
        return total;
      }, 0);

      return { 
        daysUsed, 
        relevantStays, 
        periodStart: start, 
        periodEnd: end 
      };
    }

    case 'entry_based': {
      const period = getEntryBasedPeriod(countryStays, countryCode, referenceDate);
      if (!period) return { daysUsed: 0, relevantStays: [] };

      const relevantStays = countryStays.filter(stay => 
        stay.entryDate >= period.start && stay.entryDate <= period.end
      );

      const daysUsed = relevantStays.reduce((total, stay) => {
        const exitDate = stay.exitDate || referenceDate;
        const exitInPeriod = exitDate <= period.end ? exitDate : period.end;
        
        if (stay.entryDate <= exitInPeriod) {
          return total + calculateDaysBetween(stay.entryDate, exitInPeriod);
        }
        return total;
      }, 0);

      return { 
        daysUsed, 
        relevantStays, 
        periodStart: period.start, 
        periodEnd: period.end 
      };
    }

    case 'rolling_window': {
      // Schengen-style rolling window
      if (!periodDays) periodDays = 180;
      
      const windowStart = new Date(referenceDate);
      windowStart.setDate(windowStart.getDate() - periodDays);

      const relevantStays = countryStays.filter(stay => 
        stay.entryDate >= windowStart && stay.entryDate <= referenceDate
      );

      const daysUsed = relevantStays.reduce((total, stay) => {
        const entryInWindow = stay.entryDate >= windowStart ? stay.entryDate : windowStart;
        const exitInWindow = (stay.exitDate && stay.exitDate <= referenceDate) ? 
                             stay.exitDate : referenceDate;
        
        if (entryInWindow <= exitInWindow) {
          return total + calculateDaysBetween(entryInWindow, exitInWindow);
        }
        return total;
      }, 0);

      return { 
        daysUsed, 
        relevantStays, 
        periodStart: windowStart, 
        periodEnd: referenceDate 
      };
    }

    case 'visa_validity':
    case 'custom':
    default:
      // For visa-required countries or custom rules
      return { daysUsed: 0, relevantStays: [] };
  }
}

/**
 * Get country policy with nationality consideration
 */
function getCountryPolicy(countryCode: string, nationality: string = 'KR'): CountryStayPolicy | null {
  const basePolicy = COUNTRY_STAY_POLICIES[countryCode];
  if (!basePolicy) return null;

  const specificPolicy = basePolicy.nationalitySpecific?.[nationality];
  if (specificPolicy) {
    return {
      ...basePolicy,
      calculationMethod: specificPolicy.calculationMethod,
      maxDaysPerStay: specificPolicy.maxDaysPerStay,
      maxDaysPerPeriod: specificPolicy.maxDaysPerPeriod,
      periodDays: specificPolicy.periodDays,
      description: specificPolicy.description,
      restrictions: specificPolicy.restrictions || basePolicy.restrictions
    };
  }

  return basePolicy;
}

/**
 * Determine warning level
 */
function getWarningLevel(
  daysUsed: number, 
  maxDays: number, 
  method: CalculationMethod
): 'safe' | 'caution' | 'warning' | 'danger' {
  if (method === 'per_entry') {
    // For per-entry, only warn about current stay
    const percentage = (daysUsed / maxDays) * 100;
    if (percentage >= 95) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'caution';
    return 'safe';
  }

  // For period-based calculations
  const percentage = (daysUsed / maxDays) * 100;
  if (percentage >= 100) return 'danger';
  if (percentage >= 85) return 'warning';
  if (percentage >= 70) return 'caution';
  return 'safe';
}

/**
 * Generate realistic recommendations
 */
function generateRecommendations(
  policy: CountryStayPolicy,
  status: StayStatus,
  // currentStay?: StayRecord
): string[] {
  const recommendations: string[] = [];
  const { calculationMethod, maxDaysPerStay, maxDaysPerPeriod } = policy;

  switch (calculationMethod) {
    case 'per_entry':
      if (status.warningLevel === 'danger') {
        recommendations.push('🚨 현재 체류 한도를 초과했습니다. 즉시 출국하세요.');
      } else if (status.warningLevel === 'warning') {
        const remaining = maxDaysPerStay - status.daysUsedThisPeriod;
        recommendations.push(`⚠️ 체류 한도에 근접했습니다. ${remaining}일 후 출국해야 합니다.`);
      } else if (status.warningLevel === 'caution') {
        recommendations.push('⚡ 체류 기간을 주의깊게 모니터링하세요.');
      } else {
        recommendations.push(`✅ 현재 체류가 안전합니다. 출국 후 재입국 시 다시 ${maxDaysPerStay}일 가능합니다.`);
      }
      break;

    case 'calendar_year':
      if (maxDaysPerPeriod) {
        const annualUsed = status.daysUsedThisPeriod;
        const annualRemaining = maxDaysPerPeriod - annualUsed;
        
        if (status.warningLevel === 'danger') {
          recommendations.push('🚨 연간 한도를 초과했습니다. 다음 연도까지 입국이 제한될 수 있습니다.');
        } else if (annualRemaining <= 30) {
          recommendations.push(`⚠️ 올해 ${annualRemaining}일만 더 체류 가능합니다.`);
        }
        
        const nextYear = new Date().getFullYear() + 1;
        recommendations.push(`📅 ${nextYear}년 1월 1일부터 새로운 한도가 적용됩니다.`);
      }
      break;

    case 'entry_based':
      if (status.currentPeriodEnd) {
        const resetDate = new Date(status.currentPeriodEnd);
        resetDate.setDate(resetDate.getDate() + 1);
        recommendations.push(`📅 ${resetDate.toLocaleDateString('ko-KR')}부터 새로운 365일 기간이 시작됩니다.`);
      }
      break;

    case 'rolling_window':
      if (status.nextAvailableDate) {
        const daysUntil = Math.ceil(
          (status.nextAvailableDate.getTime() - new Date().getTime()) / MS_PER_DAY
        );
        recommendations.push(`📅 ${daysUntil}일 후 재입국 가능: ${status.nextAvailableDate.toLocaleDateString('ko-KR')}`);
      }
      break;
  }

  // Add policy-specific restrictions
  if (policy.restrictions) {
    recommendations.push('');
    recommendations.push('📋 정책 주의사항:');
    policy.restrictions.forEach(restriction => {
      recommendations.push(`• ${restriction}`);
    });
  }

  return recommendations;
}

/**
 * Main calculation function with realistic policies
 */
export function calculateRealisticCountryStatus(
  stays: readonly StayRecord[],
  countryCode: string,
  nationality: string = 'KR',
  referenceDate: Date = new Date()
): CountryTrackerResult | null {
  const policy = getCountryPolicy(countryCode, nationality);
  if (!policy) return null;

  // Calculate days based on the country's actual method
  const calculation = calculateDaysByMethod(
    stays,
    countryCode,
    policy.calculationMethod,
    referenceDate,
    policy.periodDays
  );

  // Determine the relevant limit
  const maxDays = policy.calculationMethod === 'per_entry' ? 
    policy.maxDaysPerStay : 
    (policy.maxDaysPerPeriod || policy.maxDaysPerStay);

  // Find current stay if applicable
  const currentStay = calculation.relevantStays.find(stay =>
    stay.entryDate <= referenceDate && 
    (!stay.exitDate || stay.exitDate >= referenceDate)
  );

  const status: StayStatus = {
    countryCode,
    calculationMethod: policy.calculationMethod,
    daysUsedThisPeriod: calculation.daysUsed,
    daysRemainingThisPeriod: Math.max(0, maxDays - calculation.daysUsed),
    maxDaysPerStay: policy.maxDaysPerStay,
    maxDaysPerPeriod: policy.maxDaysPerPeriod,
    currentPeriodStart: calculation.periodStart,
    currentPeriodEnd: calculation.periodEnd,
    warningLevel: getWarningLevel(calculation.daysUsed, maxDays, policy.calculationMethod),
    additionalInfo: {
      daysInCurrentStay: currentStay ? 
        calculateDaysBetween(currentStay.entryDate, referenceDate) : 0
    }
  };

  const violations: StayViolation[] = [];
  if (calculation.daysUsed > maxDays) {
    violations.push({
      type: 'exceeds_limit',
      severity: calculation.daysUsed > maxDays * 1.2 ? 'critical' : 'major',
      description: `${policy.countryName} ${policy.calculationMethod} 방식으로 ${maxDays}일 한도 초과 (${calculation.daysUsed}일 사용)`,
      date: referenceDate,
      daysOver: calculation.daysUsed - maxDays
    });
  }

  const recommendations = generateRecommendations(policy, status, currentStay);

  return {
    status,
    recentStays: calculation.relevantStays,
    violations,
    recommendations
  };
}

/**
 * Calculate for multiple countries
 */
export function calculateMultiCountryRealisticStatus(
  stays: readonly StayRecord[],
  nationality: string = 'KR',
  referenceDate: Date = new Date()
): Record<string, CountryTrackerResult> {
  const results: Record<string, CountryTrackerResult> = {};
  
  const countries = [...new Set(stays.map(stay => stay.countryCode))];
  
  for (const countryCode of countries) {
    const result = calculateRealisticCountryStatus(stays, countryCode, nationality, referenceDate);
    if (result) {
      results[countryCode] = result;
    }
  }

  return results;
}

/**
 * Validate if a future trip is within allowed stay limits
 */
export function validateFutureTrip(
  plannedTrip: {
    countryCode: string;
    entryDate: Date;
    exitDate: Date;
  },
  existingStays: readonly StayRecord[],
  nationality: string = 'KR'
): {
  isValid: boolean;
  remainingDays: number;
  message: string;
  violations?: StayViolation[];
} {
  // Create a temporary stay record for the planned trip
  const futureStay: StayRecord = {
    countryCode: plannedTrip.countryCode,
    entryDate: plannedTrip.entryDate,
    exitDate: plannedTrip.exitDate,
    duration: calculateDaysBetween(plannedTrip.entryDate, plannedTrip.exitDate),
    purpose: 'tourism'
  };

  // Combine existing stays with the planned trip
  const allStays = [...existingStays, futureStay];

  // Calculate status with the future trip included
  const result = calculateRealisticCountryStatus(
    allStays,
    plannedTrip.countryCode,
    nationality,
    plannedTrip.entryDate
  );

  if (!result) {
    return {
      isValid: true,
      remainingDays: 90,
      message: '✅ 정책 정보가 없는 국가입니다. 개별 확인이 필요합니다.'
    };
  }

  const isValid = result.violations.length === 0;
  const remainingDays = result.remainingDays;

  let message = '';
  if (isValid) {
    message = `✅ 유효: ${remainingDays}일 중 ${futureStay.duration}일 사용 예정`;
  } else {
    const violation = result.violations[0];
    if (violation) {
      message = `❌ ${violation.message}`;
    } else {
      message = `❌ 체류 한도 초과: ${remainingDays}일 가능, ${futureStay.duration}일 요청됨`;
    }
  }

  return {
    isValid,
    remainingDays,
    message,
    violations: result.violations
  };
}