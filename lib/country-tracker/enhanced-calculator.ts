/**
 * DINO v2.0 - Enhanced Calculator with Special Cases
 * Supports custom visa types and special statuses
 */

import {
  calculateRealisticCountryStatus
  // calculateMultiCountryRealisticStatus
} from './real-calculator';
import {
  type UserProfile,
  type CustomStayPolicy,
  // type SpecialVisaType,
  KOREA_SPECIAL_CASES,
  SPECIAL_VISA_POLICIES
} from '@/types/user-profile';
import {
  type StayRecord,
  type CountryTrackerResult,
  type StayStatus,
  // COUNTRY_STAY_POLICIES
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
 * Get applicable policy for a country considering user's special statuses
 */
function getApplicablePolicy(
  countryCode: string,
  userProfile: UserProfile,
  referenceDate: Date = new Date()
): CustomStayPolicy | null {
  // Check user's special statuses first
  const specialPolicy = userProfile.specialStatuses.find(policy => 
    policy.countryCode === countryCode &&
    (!policy.validFrom || policy.validFrom <= referenceDate) &&
    (!policy.validUntil || policy.validUntil >= referenceDate)
  );

  if (specialPolicy) {
    return specialPolicy;
  }

  // Check predefined special cases (한국 거주자 등)
  const koreaSpecial = Object.values(KOREA_SPECIAL_CASES).find(policy =>
    policy.countryCode === countryCode
  );

  if (koreaSpecial) {
    return koreaSpecial;
  }

  // Check other special visa policies
  const countrySpecialPolicies = SPECIAL_VISA_POLICIES[countryCode];
  if (countrySpecialPolicies) {
    const validPolicy = countrySpecialPolicies.find(policy =>
      (!policy.validFrom || policy.validFrom <= referenceDate) &&
      (!policy.validUntil || policy.validUntil >= referenceDate)
    );
    
    if (validPolicy) {
      return validPolicy;
    }
  }

  return null;
}

/**
 * Calculate days using custom policy
 */
function calculateDaysWithCustomPolicy(
  stays: readonly StayRecord[],
  policy: CustomStayPolicy,
  referenceDate: Date
): { daysUsed: number; periodStart?: Date; periodEnd?: Date; relevantStays: StayRecord[] } {
  const countryStays = stays.filter(stay => stay.countryCode === policy.countryCode);

  switch (policy.calculationMethod) {
    case 'rolling_window': {
      const periodDays = policy.periodDays || 365;
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

    case 'calendar_year': {
      const year = referenceDate.getFullYear();
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      
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

    case 'visa_validity': {
      if (policy.validFrom && policy.validUntil) {
        const relevantStays = countryStays.filter(stay => 
          stay.entryDate >= policy.validFrom! && stay.entryDate <= policy.validUntil!
        );

        const daysUsed = relevantStays.reduce((total, stay) => {
          const exitDate = stay.exitDate || referenceDate;
          const exitInValidity = exitDate <= policy.validUntil! ? exitDate : policy.validUntil!;
          
          if (stay.entryDate <= exitInValidity) {
            return total + calculateDaysBetween(stay.entryDate, exitInValidity);
          }
          return total;
        }, 0);

        return { 
          daysUsed, 
          relevantStays, 
          periodStart: policy.validFrom, 
          periodEnd: policy.validUntil 
        };
      }
      break;
    }

    default: {
      // Fall back to per_entry calculation
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
    }
  }

  return { daysUsed: 0, relevantStays: [] };
}

/**
 * Calculate country status with user profile consideration
 */
export function calculateEnhancedCountryStatus(
  stays: readonly StayRecord[],
  countryCode: string,
  userProfile: UserProfile,
  referenceDate: Date = new Date()
): CountryTrackerResult | null {
  // Check for custom/special policy first
  const customPolicy = getApplicablePolicy(countryCode, userProfile, referenceDate);
  
  if (customPolicy) {
    const calculation = calculateDaysWithCustomPolicy(stays, customPolicy, referenceDate);
    
    const maxDays = customPolicy.maxDaysPerPeriod || customPolicy.maxDaysPerStay;
    const warningLevel = getWarningLevel(
      calculation.daysUsed, 
      maxDays, 
      userProfile.preferences.warningThresholds
    );

    const status: StayStatus = {
      countryCode,
      calculationMethod: customPolicy.calculationMethod,
      daysUsedThisPeriod: calculation.daysUsed,
      daysRemainingThisPeriod: Math.max(0, maxDays - calculation.daysUsed),
      maxDaysPerStay: customPolicy.maxDaysPerStay,
      maxDaysPerPeriod: customPolicy.maxDaysPerPeriod,
      currentPeriodStart: calculation.periodStart,
      currentPeriodEnd: calculation.periodEnd,
      warningLevel
    };

    const recommendations = generateCustomRecommendations(customPolicy, status);
    const violations = calculation.daysUsed > maxDays ? [{
      type: 'exceeds_limit' as const,
      severity: 'major' as const,
      description: `${customPolicy.description}: ${maxDays}일 한도 초과 (${calculation.daysUsed}일 사용)`,
      date: referenceDate,
      daysOver: calculation.daysUsed - maxDays
    }] : [];

    return {
      status,
      recentStays: calculation.relevantStays,
      violations,
      recommendations
    };
  }

  // Fall back to standard calculation
  return calculateRealisticCountryStatus(
    stays, 
    countryCode, 
    userProfile.primaryNationality, 
    referenceDate
  );
}

/**
 * Get warning level based on user preferences
 */
function getWarningLevel(
  daysUsed: number,
  maxDays: number,
  thresholds: UserProfile['preferences']['warningThresholds']
): 'safe' | 'caution' | 'warning' | 'danger' {
  const percentage = (daysUsed / maxDays) * 100;
  
  if (percentage >= thresholds.danger) return 'danger';
  if (percentage >= thresholds.warning) return 'warning';
  if (percentage >= thresholds.caution) return 'caution';
  return 'safe';
}

/**
 * Generate recommendations for custom policies
 */
function generateCustomRecommendations(
  policy: CustomStayPolicy,
  status: StayStatus
): string[] {
  const recommendations: string[] = [];

  // Add status-specific recommendations
  switch (status.warningLevel) {
    case 'danger':
      recommendations.push(`🚨 ${policy.description} 한도를 초과했습니다!`);
      break;
    case 'warning':
      recommendations.push(`⚠️ ${policy.description} 한도에 근접했습니다.`);
      break;
    case 'caution':
      recommendations.push(`⚡ ${policy.description} 상태를 주의깊게 모니터링하세요.`);
      break;
    default:
      recommendations.push(`✅ ${policy.description} 상태가 안전합니다.`);
  }

  // Add policy-specific restrictions
  if (policy.restrictions) {
    recommendations.push('');
    recommendations.push('📋 특수 정책 주의사항:');
    policy.restrictions.forEach(restriction => {
      recommendations.push(`• ${restriction}`);
    });
  }

  // Add document requirements
  if (policy.documents) {
    recommendations.push('');
    recommendations.push('📄 필요 서류:');
    policy.documents.forEach(document => {
      recommendations.push(`• ${document}`);
    });
  }

  return recommendations;
}

/**
 * Calculate multiple countries with enhanced support
 */
export function calculateEnhancedMultiCountryStatus(
  stays: readonly StayRecord[],
  userProfile: UserProfile,
  referenceDate: Date = new Date()
): Record<string, CountryTrackerResult> {
  const results: Record<string, CountryTrackerResult> = {};
  
  // Get all countries from stays and special statuses
  const stayCountries = [...new Set(stays.map(stay => stay.countryCode))];
  const specialCountries = userProfile.specialStatuses.map(policy => policy.countryCode);
  const allCountries = [...new Set([...stayCountries, ...specialCountries])];
  
  for (const countryCode of allCountries) {
    const result = calculateEnhancedCountryStatus(stays, countryCode, userProfile, referenceDate);
    if (result) {
      results[countryCode] = result;
    }
  }

  return results;
}

/**
 * Create default user profile
 */
export function createDefaultUserProfile(
  email: string,
  primaryNationality: string = 'KR'
): UserProfile {
  return {
    id: `user-${Date.now()}`,
    email,
    primaryNationality,
    specialStatuses: [],
    preferences: {
      defaultCalculationMethod: 'realistic',
      warningThresholds: {
        caution: 60,
        warning: 80,
        danger: 95
      },
      reminderDays: 7
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}