import type { CountryVisit, SchengenStatus, SchengenViolation } from '@/types/global';
import { getSchengenCountries } from '@/data/countries';
import { calculateSchengenStatus, validateFutureTrip } from '@/lib/schengen-calculator';

/**
 * Enhanced Schengen Calculator with User Visa Integration
 * 
 * Extends the basic calculator to work with actual user visa data,
 * providing more accurate calculations based on visa limitations
 * and entry/exit records.
 */

export interface UserVisaEntry {
  id: string;
  userVisaId: string;
  entryDate: Date;
  exitDate?: Date;
  stayDays?: number;
  purpose?: string;
  userVisa: {
    countryCode: string;
    countryName: string;
    visaType: string;
    maxStayDays?: number;
    expiryDate: Date;
  };
}

export interface EnhancedSchengenStatus extends SchengenStatus {
  /** Current active stays in Schengen countries */
  currentStays: Array<{
    countryCode: string;
    countryName: string;
    entryDate: Date;
    daysInCountry: number;
    remainingDays: number | null;
    visaExpiry: Date;
  }>;
  /** Visa-specific limitations that may apply */
  visaLimitations: Array<{
    countryCode: string;
    visaType: string;
    maxStayDays: number;
    usedDays: number;
    remainingDays: number;
  }>;
  /** Warnings about visa expiry */
  visaExpiryWarnings: string[];
}

/**
 * Calculate enhanced Schengen status using both travel history and visa data
 */
export function calculateEnhancedSchengenStatus(
  countryVisits: CountryVisit[],
  visaEntries: UserVisaEntry[]
): EnhancedSchengenStatus {
  // Start with basic Schengen calculation
  const basicStatus = calculateSchengenStatus(countryVisits);
  
  const schengenCountries = getSchengenCountries().map(c => c.name);
  const currentStays: EnhancedSchengenStatus['currentStays'] = [];
  const visaLimitations: EnhancedSchengenStatus['visaLimitations'] = [];
  const visaExpiryWarnings: string[] = [];
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Process current active stays
  const activeEntries = visaEntries.filter(entry => 
    !entry.exitDate && schengenCountries.includes(entry.userVisa.countryName)
  );
  
  for (const entry of activeEntries) {
    const daysInCountry = Math.ceil(
      (today.getTime() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    const remainingDays = entry.userVisa.maxStayDays 
      ? entry.userVisa.maxStayDays - daysInCountry
      : null;
    
    currentStays.push({
      countryCode: entry.userVisa.countryCode,
      countryName: entry.userVisa.countryName,
      entryDate: entry.entryDate,
      daysInCountry,
      remainingDays,
      visaExpiry: entry.userVisa.expiryDate,
    });
    
    // Check for visa expiry warnings
    if (entry.userVisa.expiryDate <= thirtyDaysFromNow) {
      const daysUntilExpiry = Math.ceil(
        (entry.userVisa.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 0) {
        visaExpiryWarnings.push(
          `🚨 ${entry.userVisa.countryName} 비자가 만료되었습니다. 즉시 출국해야 합니다.`
        );
      } else if (daysUntilExpiry <= 7) {
        visaExpiryWarnings.push(
          `⚠️ ${entry.userVisa.countryName} 비자가 ${daysUntilExpiry}일 후 만료됩니다.`
        );
      }
    }
    
    // Check for stay limit warnings
    if (remainingDays !== null && remainingDays <= 0) {
      visaExpiryWarnings.push(
        `🚨 ${entry.userVisa.countryName}에서 비자 허용 체류기간을 초과했습니다.`
      );
    } else if (remainingDays !== null && remainingDays <= 3) {
      visaExpiryWarnings.push(
        `⚠️ ${entry.userVisa.countryName}에서 ${remainingDays}일 후 비자 체류기간이 만료됩니다.`
      );
    }
  }
  
  // Calculate visa-specific limitations
  const visasByCountry = new Map<string, UserVisaEntry[]>();
  
  for (const entry of visaEntries) {
    if (schengenCountries.includes(entry.userVisa.countryName)) {
      const countryCode = entry.userVisa.countryCode;
      if (!visasByCountry.has(countryCode)) {
        visasByCountry.set(countryCode, []);
      }
      visasByCountry.get(countryCode)!.push(entry);
    }
  }
  
  // Calculate per-visa usage within the 180-day window
  const windowStart = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  for (const [countryCode, entries] of visasByCountry) {
    const activeVisa = entries.find(e => 
      e.userVisa.expiryDate > today && 
      ['active'].includes('active') // assuming status would be available
    );
    
    if (activeVisa && activeVisa.userVisa.maxStayDays) {
      const recentEntries = entries.filter(entry => 
        entry.entryDate >= windowStart || (entry.exitDate && entry.exitDate >= windowStart)
      );
      
      let totalUsedDays = 0;
      for (const entry of recentEntries) {
        const entryStart = entry.entryDate > windowStart ? entry.entryDate : windowStart;
        const entryEnd = entry.exitDate && entry.exitDate < today ? entry.exitDate : today;
        
        if (entryStart <= entryEnd) {
          totalUsedDays += Math.ceil(
            (entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        }
      }
      
      visaLimitations.push({
        countryCode,
        visaType: activeVisa.userVisa.visaType,
        maxStayDays: activeVisa.userVisa.maxStayDays,
        usedDays: totalUsedDays,
        remainingDays: Math.max(0, activeVisa.userVisa.maxStayDays - totalUsedDays),
      });
    }
  }
  
  return {
    ...basicStatus,
    currentStays,
    visaLimitations,
    visaExpiryWarnings,
  };
}

/**
 * Validate future trip with visa-specific considerations
 */
export function validateFutureTripWithVisas(
  countryVisits: CountryVisit[],
  visaEntries: UserVisaEntry[],
  plannedEntry: Date,
  plannedExit: Date,
  plannedCountry: string,
  visaId?: string
): {
  schengenValidation: ReturnType<typeof validateFutureTrip>;
  visaValidation: {
    hasValidVisa: boolean;
    visaExpiry?: Date;
    maxStayDays?: number;
    remainingDays?: number;
    warnings: string[];
    suggestions: string[];
  };
} {
  // Basic Schengen validation
  const schengenValidation = validateFutureTrip(
    countryVisits,
    plannedEntry,
    plannedExit,
    plannedCountry
  );
  
  // Visa-specific validation
  const visaValidation = {
    hasValidVisa: false,
    warnings: [] as string[],
    suggestions: [] as string[],
  };
  
  if (!visaId) {
    visaValidation.warnings.push('비자가 지정되지 않았습니다.');
    visaValidation.suggestions.push('해당 국가의 유효한 비자를 먼저 추가해주세요.');
    
    return { schengenValidation, visaValidation };
  }
  
  // Find the specified visa
  const relevantEntries = visaEntries.filter(entry => entry.userVisaId === visaId);
  if (relevantEntries.length === 0) {
    visaValidation.warnings.push('지정된 비자를 찾을 수 없습니다.');
    return { schengenValidation, visaValidation };
  }
  
  const visa = relevantEntries[0].userVisa;
  
  // Check visa validity period
  if (visa.expiryDate < plannedExit) {
    visaValidation.warnings.push(
      `비자가 여행 중 만료됩니다 (만료일: ${visa.expiryDate.toLocaleDateString('ko-KR')})`
    );
    visaValidation.suggestions.push('비자를 갱신하거나 여행 일정을 앞당겨주세요.');
  } else {
    visaValidation.hasValidVisa = true;
  }
  
  // Check stay duration limits
  if (visa.maxStayDays) {
    const plannedDays = Math.ceil(
      (plannedExit.getTime() - plannedEntry.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    // Calculate current usage in 180-day window
    const windowStart = new Date(plannedEntry.getTime() - 180 * 24 * 60 * 60 * 1000);
    const recentEntries = relevantEntries.filter(entry => 
      entry.entryDate >= windowStart || (entry.exitDate && entry.exitDate >= windowStart)
    );
    
    let usedDays = 0;
    for (const entry of recentEntries) {
      const entryStart = entry.entryDate > windowStart ? entry.entryDate : windowStart;
      const entryEnd = entry.exitDate && entry.exitDate < plannedEntry ? entry.exitDate : plannedEntry;
      
      if (entryStart <= entryEnd) {
        usedDays += Math.ceil(
          (entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60 * 1000)
        ) + 1;
      }
    }
    
    const remainingDays = visa.maxStayDays - usedDays;
    visaValidation.remainingDays = remainingDays;
    
    if (plannedDays > remainingDays) {
      visaValidation.warnings.push(
        `계획된 ${plannedDays}일 체류는 비자 허용 잔여일수 ${remainingDays}일을 초과합니다.`
      );
      visaValidation.suggestions.push(
        `최대 ${remainingDays}일까지만 체류 가능합니다.`
      );
    }
  }
  
  return { schengenValidation, visaValidation };
}

/**
 * Get next safe travel dates considering both Schengen rules and visa limitations
 */
export function getNextSafeTravelDatesWithVisas(
  countryVisits: CountryVisit[],
  visaEntries: UserVisaEntry[],
  desiredDuration: number,
  countryCode: string,
  visaId?: string
): {
  schengenSafeDates: { startDate: Date; endDate: Date } | null;
  visaSafeDates: { startDate: Date; endDate: Date } | null;
  combinedSafeDates: { startDate: Date; endDate: Date } | null;
} | null {
  const today = new Date();
  const maxSearchDays = 365;
  
  let schengenSafeDates: { startDate: Date; endDate: Date } | null = null;
  let visaSafeDates: { startDate: Date; endDate: Date } | null = null;
  let combinedSafeDates: { startDate: Date; endDate: Date } | null = null;
  
  for (let i = 0; i < maxSearchDays; i++) {
    const testStartDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const testEndDate = new Date(testStartDate.getTime() + (desiredDuration - 1) * 24 * 60 * 60 * 1000);
    
    // Test Schengen compliance
    const schengenValidation = validateFutureTrip(
      countryVisits,
      testStartDate,
      testEndDate,
      countryCode
    );
    
    if (!schengenSafeDates && schengenValidation.canTravel) {
      schengenSafeDates = { startDate: testStartDate, endDate: testEndDate };
    }
    
    // Test visa requirements if visa ID provided
    if (visaId) {
      const { visaValidation } = validateFutureTripWithVisas(
        countryVisits,
        visaEntries,
        testStartDate,
        testEndDate,
        countryCode,
        visaId
      );
      
      if (!visaSafeDates && visaValidation.hasValidVisa && visaValidation.warnings.length === 0) {
        visaSafeDates = { startDate: testStartDate, endDate: testEndDate };
      }
      
      // Combined check
      if (!combinedSafeDates && 
          schengenValidation.canTravel && 
          visaValidation.hasValidVisa && 
          visaValidation.warnings.length === 0) {
        combinedSafeDates = { startDate: testStartDate, endDate: testEndDate };
        break; // Found the optimal date
      }
    } else {
      // If no visa ID, combined is same as Schengen
      if (!combinedSafeDates && schengenValidation.canTravel) {
        combinedSafeDates = { startDate: testStartDate, endDate: testEndDate };
        break;
      }
    }
  }
  
  return {
    schengenSafeDates,
    visaSafeDates,
    combinedSafeDates,
  };
}