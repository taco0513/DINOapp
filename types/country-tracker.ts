/**
 * DINO v2.0 - Country Stay Tracker Types
 * Generic types for tracking stay limits in any country
 */

// 체류 기간 계산 방식 정의
export type CalculationMethod = 
  | 'rolling_window'        // Schengen 방식: 임의의 N일 중 M일
  | 'calendar_year'         // 캘린더 연도: 1월1일-12월31일 기준
  | 'entry_based'          // 입국일 기준: 첫 입국일부터 365일
  | 'per_entry'            // 입국당: 한번 입국시 최대 기간
  | 'visa_validity'        // 비자 유효기간: 비자 발급일부터
  | 'custom';              // 특수 규정

export interface CountryStayPolicy {
  readonly countryCode: string;
  readonly countryName: string;
  readonly policyType: 'visa_free' | 'visa_required' | 'schengen' | 'special';
  readonly calculationMethod: CalculationMethod;
  readonly maxDaysPerStay: number;        // 1회 입국시 최대 체류일
  readonly maxDaysPerPeriod?: number;     // 특정 기간당 최대 체류일  
  readonly periodDays?: number;           // 계산 기간 (365일, 180일 등)
  readonly description: string;
  readonly restrictions?: string[];       // 추가 제한사항
  readonly sources?: string[];           // 정보 출처 (외교부, 대사관 등)
  readonly lastUpdated: string;          // 마지막 업데이트 날짜
  readonly nationalitySpecific?: {
    [nationality: string]: {
      calculationMethod: CalculationMethod;
      maxDaysPerStay: number;
      maxDaysPerPeriod?: number;
      periodDays?: number;
      description: string;
      restrictions?: string[];
    };
  };
}

export interface StayRecord {
  readonly id: string;
  readonly countryCode: string;
  readonly entryDate: Date;
  readonly exitDate: Date | null;
  readonly purpose?: string;
  readonly notes?: string;
}

export interface StayStatus {
  readonly countryCode: string;
  readonly calculationMethod: CalculationMethod;
  readonly daysUsedThisPeriod: number;
  readonly daysRemainingThisPeriod: number;
  readonly maxDaysPerStay: number;
  readonly maxDaysPerPeriod?: number;
  readonly currentPeriodStart?: Date;
  readonly currentPeriodEnd?: Date;
  readonly warningLevel: 'safe' | 'caution' | 'warning' | 'danger';
  readonly nextAvailableDate?: Date;
  readonly additionalInfo?: {
    daysInCurrentStay?: number;
    maxConsecutiveDays?: number;
    cooldownRequired?: number;
    annualDaysUsed?: number;
  };
}

export interface CountryTrackerResult {
  readonly status: StayStatus;
  readonly recentStays: readonly StayRecord[];
  readonly violations: readonly StayViolation[];
  readonly recommendations: readonly string[];
}

export interface StayViolation {
  readonly type: 'overstay' | 'too_frequent' | 'exceeds_limit';
  readonly severity: 'minor' | 'major' | 'critical';
  readonly description: string;
  readonly date: Date;
  readonly daysOver: number;
}

// 📍 실제 국가별 이민법 정책 데이터베이스 (2024년 기준)
export const COUNTRY_STAY_POLICIES: Record<string, CountryStayPolicy> = {
  // 🇻🇳 베트남 - 실제 정책: 입국당 최대 45일, 출국 후 재입국 제한 없음
  'VN': {
    countryCode: 'VN',
    countryName: 'Vietnam',
    policyType: 'visa_free',
    calculationMethod: 'per_entry',
    maxDaysPerStay: 45,
    description: '한국인 45일 무비자 (2024년 8월 15일부터 영구 시행)',
    restrictions: [
      '1회 입국당 최대 45일 연속 체류',
      '출국 후 재입국 시 다시 45일 가능',
      '비자 없이는 45일 초과 체류 불가'
    ],
    sources: ['베트남 대사관', '외교부 영사서비스'],
    lastUpdated: '2024-08-15',
    nationalitySpecific: {
      'KR': {
        calculationMethod: 'per_entry',
        maxDaysPerStay: 45,
        description: '45일 무비자 (영구 시행)',
        restrictions: ['연속 45일 한도']
      },
      'JP': {
        calculationMethod: 'per_entry', 
        maxDaysPerStay: 15,
        description: '15일 무비자',
        restrictions: ['연속 15일 한도']
      },
      'US': {
        calculationMethod: 'visa_validity',
        maxDaysPerStay: 0,
        description: '비자 필요',
        restrictions: ['무비자 입국 불가']
      }
    }
  },
  
  // 🇹🇭 태국 - 실제 정책: 캘린더 연도당 총 180일 + 1회 입국당 60일
  'TH': {
    countryCode: 'TH',
    countryName: 'Thailand',
    policyType: 'visa_free',
    calculationMethod: 'calendar_year',
    maxDaysPerStay: 60,
    maxDaysPerPeriod: 180,
    periodDays: 365,
    description: '한국인 무비자: 1회 60일, 연간 총 180일',
    restrictions: [
      '1회 입국당 최대 60일 연속 체류',
      '캘린더 연도(1월~12월)당 총 180일 한도',
      '연간 한도 초과 시 다음 연도까지 입국 제한',
      '장기 체류 시 관광비자로 의심받을 수 있음'
    ],
    sources: ['태국 대사관', '태국 이민청'],
    lastUpdated: '2024-07-01',
    nationalitySpecific: {
      'KR': {
        calculationMethod: 'calendar_year',
        maxDaysPerStay: 60,
        maxDaysPerPeriod: 180,
        periodDays: 365,
        description: '무비자 60일/회, 연간 180일',
        restrictions: ['캘린더 연도 기준 180일 총합']
      },
      'JP': {
        calculationMethod: 'per_entry',
        maxDaysPerStay: 30,
        description: '30일 무비자',
        restrictions: ['1회 30일 한도']
      },
      'US': {
        calculationMethod: 'per_entry',
        maxDaysPerStay: 30,
        description: '30일 무비자',
        restrictions: ['1회 30일 한도']
      }
    }
  },
  
  // 🇲🇾 말레이시아 - 실제 정책: 1회 90일, 연간 누적 제한 있음
  'MY': {
    countryCode: 'MY',
    countryName: 'Malaysia',
    policyType: 'visa_free',
    calculationMethod: 'per_entry',
    maxDaysPerStay: 90,
    description: '한국인 90일 무비자 (관광목적)',
    restrictions: [
      '1회 입국당 최대 90일',
      '출국 후 재입국 시 심사관 재량',
      '연간 장기 체류 시 의심받을 수 있음',
      '충분한 자금 증명 필요'
    ],
    sources: ['말레이시아 대사관'],
    lastUpdated: '2024-06-01',
    nationalitySpecific: {
      'KR': {
        calculationMethod: 'per_entry',
        maxDaysPerStay: 90,
        description: '90일 무비자',
        restrictions: ['관광목적 한정']
      }
    }
  },
  
  // 🇯🇵 일본 - 실제 정책: 90일 무비자, 180일 중 90일 제한
  'JP': {
    countryCode: 'JP',
    countryName: 'Japan',
    policyType: 'visa_free',
    calculationMethod: 'rolling_window',
    maxDaysPerStay: 90,
    maxDaysPerPeriod: 90,
    periodDays: 180,
    description: '한국인 90일 무비자 (180일 중 90일)',
    restrictions: [
      '임의의 180일 기간 중 90일까지 체류 가능',
      '1회 입국당 최대 90일',
      '관광 또는 상용 목적만 허용',
      '장기 체류 시 비자 필요'
    ],
    sources: ['일본 외무성', '일본 법무성'],
    lastUpdated: '2024-06-01',
    nationalitySpecific: {
      'KR': {
        calculationMethod: 'rolling_window',
        maxDaysPerStay: 90,
        maxDaysPerPeriod: 90,
        periodDays: 180,
        description: '90일 무비자 (180일 중)',
        restrictions: ['180일 롤링 윈도우 적용']
      }
    }
  },

  // 🇵🇭 필리핀
  'PH': {
    countryCode: 'PH',
    countryName: 'Philippines',
    policyType: 'visa_free',
    maxDays: 30,
    rollingPeriodDays: 180,
    description: '한국인 30일 무비자',
    nationalitySpecific: {
      'KR': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'JP': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'US': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'GB': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' }
    }
  },
  
  // 🇮🇩 인도네시아  
  'ID': {
    countryCode: 'ID',
    countryName: 'Indonesia',
    policyType: 'visa_free',
    maxDays: 30,
    rollingPeriodDays: 180,
    description: '한국인 30일 무비자',
    nationalitySpecific: {
      'KR': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'JP': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'US': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' },
      'GB': { maxDays: 30, rollingPeriodDays: 180, description: '30일 무비자' }
    }
  },
  
  // 🇸🇬 싱가포르
  'SG': {
    countryCode: 'SG',
    countryName: 'Singapore',
    policyType: 'visa_free',
    maxDays: 90,
    rollingPeriodDays: 180,
    description: '한국인 90일 무비자',
    nationalitySpecific: {
      'KR': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'JP': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'US': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'GB': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' }
    }
  },
  
  // 🇹🇼 대만
  'TW': {
    countryCode: 'TW',
    countryName: 'Taiwan',
    policyType: 'visa_free',
    maxDays: 90,
    rollingPeriodDays: 180,
    description: '한국인 90일 무비자',
    nationalitySpecific: {
      'KR': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'JP': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'US': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'GB': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' }
    }
  },
  
  // 🇯🇵 일본
  'JP': {
    countryCode: 'JP',
    countryName: 'Japan',
    policyType: 'visa_free',
    maxDays: 90,
    rollingPeriodDays: 180,
    description: '한국인 90일 무비자',
    nationalitySpecific: {
      'KR': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'US': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' },
      'GB': { maxDays: 90, rollingPeriodDays: 180, description: '90일 무비자' }
    }
  },
  
  // 🇦🇺 호주
  'AU': {
    countryCode: 'AU',
    countryName: 'Australia',
    policyType: 'visa_required',
    maxDays: 90,
    rollingPeriodDays: 365,
    description: 'ETA/비자 필요',
    nationalitySpecific: {
      'KR': { maxDays: 90, rollingPeriodDays: 365, description: 'ETA 90일' },
      'JP': { maxDays: 90, rollingPeriodDays: 365, description: 'ETA 90일' },
      'US': { maxDays: 90, rollingPeriodDays: 365, description: 'ETA 90일' },
      'GB': { maxDays: 90, rollingPeriodDays: 365, description: 'ETA 90일' }
    }
  }
};