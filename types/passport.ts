/**
 * DINO v2.0 - Passport Management Types
 * TypeScript definitions for multiple passport support
 */

export interface Passport {
  id: string;
  userId: string;
  
  // Basic Info
  countryCode: string;
  countryName: string;
  passportNumber: string;
  
  // Dates
  issueDate: Date;
  expiryDate: Date;
  
  // Status
  isActive: boolean;
  isPrimary: boolean;
  
  // Visa-free destinations (cached for performance)
  visaFreeCountries: string[];
  lastUpdated: Date;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface PassportComparison {
  destination: string;
  passports: {
    passportId: string;
    countryCode: string;
    countryName: string;
    visaRequired: boolean;
    stayDuration?: number;
    visaFee?: number;
    processingTime?: number;
    requirements?: string[];
    recommendation: 'best' | 'good' | 'avoid';
    score: number; // 0-100
  }[];
  recommendation: {
    bestPassportId: string;
    reason: string;
    savings?: {
      fee: number;
      time: number; // days
    };
  };
}

export interface TravelOptimization {
  tripId: string;
  destination: string;
  plannedDate: Date;
  
  passportAnalysis: {
    passportId: string;
    advantages: string[];
    disadvantages: string[];
    totalScore: number;
  }[];
  
  recommendation: {
    passportId: string;
    countryName: string;
    reasons: string[];
    estimatedSavings: {
      visaFee?: number;
      processingTime?: number;
      stayDuration?: number;
    };
  };
}

// Passport power ranking data
export const PASSPORT_RANKINGS = {
  'SG': { rank: 1, visaFreeCount: 195, power: 'Very High' },
  'KR': { rank: 2, visaFreeCount: 192, power: 'Very High' },
  'DE': { rank: 3, visaFreeCount: 191, power: 'Very High' },
  'IT': { rank: 3, visaFreeCount: 191, power: 'Very High' },
  'ES': { rank: 3, visaFreeCount: 191, power: 'Very High' },
  'LU': { rank: 3, visaFreeCount: 191, power: 'Very High' },
  'AT': { rank: 4, visaFreeCount: 190, power: 'Very High' },
  'FI': { rank: 4, visaFreeCount: 190, power: 'Very High' },
  'JP': { rank: 5, visaFreeCount: 189, power: 'Very High' },
  'SE': { rank: 5, visaFreeCount: 189, power: 'Very High' },
  'FR': { rank: 6, visaFreeCount: 188, power: 'Very High' },
  'IE': { rank: 6, visaFreeCount: 188, power: 'Very High' },
  'NL': { rank: 6, visaFreeCount: 188, power: 'Very High' },
  'UK': { rank: 7, visaFreeCount: 187, power: 'Very High' },
  'DK': { rank: 8, visaFreeCount: 186, power: 'Very High' },
  'BE': { rank: 8, visaFreeCount: 186, power: 'Very High' },
  'NO': { rank: 8, visaFreeCount: 186, power: 'Very High' },
  'NZ': { rank: 8, visaFreeCount: 186, power: 'Very High' },
  'CH': { rank: 9, visaFreeCount: 185, power: 'Very High' },
  'AU': { rank: 10, visaFreeCount: 184, power: 'Very High' },
  'PT': { rank: 10, visaFreeCount: 184, power: 'Very High' },
  'CZ': { rank: 10, visaFreeCount: 184, power: 'Very High' },
  'CA': { rank: 11, visaFreeCount: 183, power: 'High' },
  'GR': { rank: 11, visaFreeCount: 183, power: 'High' },
  'MT': { rank: 11, visaFreeCount: 183, power: 'High' },
  'US': { rank: 12, visaFreeCount: 182, power: 'High' },
  'PL': { rank: 12, visaFreeCount: 182, power: 'High' },
  'HU': { rank: 12, visaFreeCount: 182, power: 'High' },
} as const;

// Common dual citizenship combinations
export const COMMON_DUAL_CITIZENSHIPS = [
  { primary: 'KR', secondary: 'US', name: '한국-미국' },
  { primary: 'KR', secondary: 'CA', name: '한국-캐나다' },
  { primary: 'KR', secondary: 'AU', name: '한국-호주' },
  { primary: 'KR', secondary: 'JP', name: '한국-일본' },
  { primary: 'US', secondary: 'CA', name: '미국-캐나다' },
  { primary: 'US', secondary: 'UK', name: '미국-영국' },
  { primary: 'US', secondary: 'DE', name: '미국-독일' },
  { primary: 'CA', secondary: 'UK', name: '캐나다-영국' },
  { primary: 'AU', secondary: 'UK', name: '호주-영국' },
  { primary: 'UK', secondary: 'IE', name: '영국-아일랜드' },
] as const;

// Visa optimization strategies
export interface VisaOptimizationStrategy {
  name: string;
  description: string;
  apply: (passports: Passport[], destination: string) => PassportComparison;
}

export const OPTIMIZATION_STRATEGIES: VisaOptimizationStrategy[] = [
  {
    name: 'cost_minimization',
    description: '비자 비용 최소화',
    apply: (passports, destination) => {
      // Implementation would go here
      throw new Error('Not implemented');
    }
  },
  {
    name: 'time_minimization', 
    description: '처리 시간 최소화',
    apply: (passports, destination) => {
      // Implementation would go here
      throw new Error('Not implemented');
    }
  },
  {
    name: 'stay_duration_maximization',
    description: '체류 기간 최대화',
    apply: (passports, destination) => {
      // Implementation would go here
      throw new Error('Not implemented');
    }
  },
  {
    name: 'convenience_maximization',
    description: '편의성 최대화 (무비자 우선)',
    apply: (passports, destination) => {
      // Implementation would go here
      throw new Error('Not implemented');
    }
  }
] as const;