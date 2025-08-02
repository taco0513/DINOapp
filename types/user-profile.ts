/**
 * DINO v2.0 - User Profile and Special Visa Types
 * Support for custom visa statuses and special cases
 */

export type SpecialVisaType = 
  | 'standard'              // 일반 관광/단기 비자
  | 'working_holiday'       // 워킹홀리데이
  | 'student_visa'          // 학생 비자
  | 'work_visa'            // 취업 비자
  | 'investment_visa'      // 투자 비자
  | 'family_visa'          // 가족 결합 비자
  | 'digital_nomad'        // 디지털 노마드 비자
  | 'long_term_resident'   // 장기 거주자
  | 'dual_citizenship'     // 이중국적
  | 'custom';              // 사용자 정의

export interface CustomStayPolicy {
  readonly id: string;
  readonly countryCode: string;
  readonly visaType: SpecialVisaType;
  readonly calculationMethod: 'rolling_window' | 'calendar_year' | 'entry_based' | 'per_entry' | 'visa_validity' | 'custom';
  readonly maxDaysPerStay: number;
  readonly maxDaysPerPeriod?: number;
  readonly periodDays?: number;
  readonly description: string;
  readonly validFrom?: Date;
  readonly validUntil?: Date;
  readonly restrictions?: string[];
  readonly documents?: string[];
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly primaryNationality: string;
  readonly secondaryNationality?: string;
  readonly specialStatuses: CustomStayPolicy[];
  readonly preferences: {
    readonly defaultCalculationMethod?: 'realistic' | 'conservative';
    readonly warningThresholds: {
      readonly caution: number;    // 60%
      readonly warning: number;    // 80%
      readonly danger: number;     // 95%
    };
    readonly reminderDays: number; // 7일 전 알림
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 한국 특수 케이스 (183일 롤링 캘린더)
export const KOREA_SPECIAL_CASES: Record<string, CustomStayPolicy> = {
  // 한국 거주자/시민권자의 해외 체류 추적용
  'KR_RESIDENT_183': {
    id: 'kr-resident-183',
    countryCode: 'KR',
    visaType: 'long_term_resident',
    calculationMethod: 'rolling_window',
    maxDaysPerStay: 183,
    maxDaysPerPeriod: 183,
    periodDays: 365,
    description: '한국 거주자 특례: 365일 중 183일 해외 체류 가능',
    restrictions: [
      '거주자 신분 유지를 위한 한도',
      '183일 이상 해외 체류 시 거주자 신분 상실 위험',
      '세무상 거주자 판정에 영향',
      '건강보험 자격 유지 고려 필요'
    ],
    documents: ['거주자등록증', '주민등록등본']
  },
  
  // 한국 시민권자의 병역 관련 특례
  'KR_MILITARY_EXEMPT': {
    id: 'kr-military-exempt',
    countryCode: 'KR',
    visaType: 'dual_citizenship',
    calculationMethod: 'calendar_year',
    maxDaysPerStay: 365,
    maxDaysPerPeriod: 183,
    periodDays: 365,
    description: '한국 시민권자 병역 특례: 연간 183일 초과 체류 제한',
    restrictions: [
      '만 18세~37세 남성 해당',
      '연간 183일 초과 체류 시 병역 의무 발생',
      '연속 3년 초과 시 국적상실 신고 의무'
    ],
    documents: ['한국 여권', '병적증명서']
  }
};

// 기타 국가별 특수 케이스
export const SPECIAL_VISA_POLICIES: Record<string, CustomStayPolicy[]> = {
  // 워킹홀리데이 비자들
  'AU': [{
    id: 'au-working-holiday',
    countryCode: 'AU',
    visaType: 'working_holiday',
    calculationMethod: 'visa_validity',
    maxDaysPerStay: 365,
    description: '호주 워킹홀리데이: 1년간 체류 가능',
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    restrictions: ['같은 고용주 6개월 한도', '3개월 농장 일 필요 시 2차 비자 가능']
  }],
  
  'NZ': [{
    id: 'nz-working-holiday',
    countryCode: 'NZ',
    visaType: 'working_holiday',
    calculationMethod: 'visa_validity',
    maxDaysPerStay: 365,
    description: '뉴질랜드 워킹홀리데이: 1년간 체류 가능',
    restrictions: ['만 18-30세', '같은 고용주 12개월 한도']
  }],
  
  // 디지털 노마드 비자들
  'PT': [{
    id: 'pt-d7-visa',
    countryCode: 'PT',
    visaType: 'digital_nomad',
    calculationMethod: 'visa_validity',
    maxDaysPerStay: 365,
    description: '포르투갈 D7 비자: 1년 거주 가능',
    restrictions: ['최소 소득 증명 필요', '건강보험 가입 필수']
  }],
  
  'EE': [{
    id: 'ee-digital-nomad',
    countryCode: 'EE',
    visaType: 'digital_nomad',
    calculationMethod: 'visa_validity',
    maxDaysPerStay: 365,
    description: '에스토니아 디지털 노마드 비자: 1년간 원격근무 가능',
    restrictions: ['월 3500유로 이상 소득', '원격근무만 가능']
  }]
};