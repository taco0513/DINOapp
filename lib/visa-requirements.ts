import type { PassportCountry } from '@/types/global';

interface VisaRequirement {
  visaRequired: boolean;
  visaType: string;
  maxStayDays: number;
  notes?: string;
}

// 간단한 비자 요구사항 데이터베이스 (실제로는 더 복잡)
// 한국 여권 기준 주요 국가들
const VISA_REQUIREMENTS: Record<
  PassportCountry,
  Record<string, VisaRequirement>
> = {
  KR: {
    // 무비자 국가들
    US: {
      visaRequired: false,
      visaType: 'ESTA',
      maxStayDays: 90,
      notes: 'ESTA 사전 신청 필요 ($21)',
    },
    JP: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    FR: {
      visaRequired: false,
      visaType: 'Visa Waiver',
      maxStayDays: 90,
      notes: '셴겐 지역 180일 중 90일',
    },
    DE: {
      visaRequired: false,
      visaType: 'Visa Waiver',
      maxStayDays: 90,
      notes: '셴겐 지역 180일 중 90일',
    },
    ES: {
      visaRequired: false,
      visaType: 'Visa Waiver',
      maxStayDays: 90,
      notes: '셴겐 지역 180일 중 90일',
    },
    IT: {
      visaRequired: false,
      visaType: 'Visa Waiver',
      maxStayDays: 90,
      notes: '셴겐 지역 180일 중 90일',
    },
    NL: {
      visaRequired: false,
      visaType: 'Visa Waiver',
      maxStayDays: 90,
      notes: '셴겐 지역 180일 중 90일',
    },
    GB: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 180 },
    CA: {
      visaRequired: false,
      visaType: 'eTA',
      maxStayDays: 180,
      notes: 'eTA 사전 신청 필요 (CAD $7)',
    },
    AU: {
      visaRequired: true,
      visaType: 'ETA',
      maxStayDays: 90,
      notes: 'ETA 온라인 신청 필요 (AUD $20)',
    },

    // 동남아시아
    TH: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    SG: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    MY: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    VN: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 45 },
    ID: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 30 },
    PH: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 30 },

    // 비자 필요 국가들
    CN: {
      visaRequired: true,
      visaType: 'Tourist Visa',
      maxStayDays: 30,
      notes: '관광 비자 필요',
    },
    IN: {
      visaRequired: true,
      visaType: 'e-Visa',
      maxStayDays: 30,
      notes: 'e-Visa 온라인 신청',
    },
    RU: {
      visaRequired: true,
      visaType: 'Tourist Visa',
      maxStayDays: 30,
      notes: '초청장 필요',
    },

    // 중동
    AE: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    TR: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },

    // 남미
    BR: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    AR: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    CL: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    PE: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    MX: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 180 },
  },

  US: {
    // 미국 여권 기준 (예시)
    KR: {
      visaRequired: false,
      visaType: 'K-ETA',
      maxStayDays: 90,
      notes: 'K-ETA 사전 신청 필요',
    },
    JP: { visaRequired: false, visaType: 'Visa Waiver', maxStayDays: 90 },
    CN: { visaRequired: true, visaType: 'Tourist Visa', maxStayDays: 60 },
    // ... 더 많은 국가들
  },

  JP: {
    // 일본 여권 기준 (예시)
    KR: {
      visaRequired: false,
      visaType: 'K-ETA',
      maxStayDays: 90,
      notes: 'K-ETA 사전 신청 필요',
    },
    US: {
      visaRequired: false,
      visaType: 'ESTA',
      maxStayDays: 90,
      notes: 'ESTA 사전 신청 필요',
    },
    // ... 더 많은 국가들
  },

  CN: {
    // 중국 여권 기준 (예시)
    KR: { visaRequired: true, visaType: 'Tourist Visa', maxStayDays: 30 },
    JP: { visaRequired: true, visaType: 'Tourist Visa', maxStayDays: 15 },
    // ... 더 많은 국가들
  },

  OTHER: {
    // 기본값
    KR: { visaRequired: true, visaType: 'Tourist Visa', maxStayDays: 30 },
    US: { visaRequired: true, visaType: 'Tourist Visa', maxStayDays: 90 },
    // ... 더 많은 국가들
  },
};

export function getVisaRequirements(
  passportCountry: PassportCountry,
  destinationCountry: string
): VisaRequirement {
  const requirements = VISA_REQUIREMENTS[passportCountry]?.[destinationCountry];

  if (requirements) {
    return requirements;
  }

  // 기본값: 비자 필요
  return {
    visaRequired: true,
    visaType: 'Tourist Visa',
    maxStayDays: 30,
    notes: '정확한 비자 정보는 해당 국가 대사관에 문의하세요.',
  };
}

// 인기 목적지 리스트
export const _POPULAR_DESTINATIONS = {
  KR: ['US', 'JP', 'TH', 'VN', 'FR', 'ES', 'IT', 'GB'],
  US: ['MX', 'CA', 'GB', 'FR', 'JP', 'KR', 'IT', 'ES'],
  JP: ['US', 'KR', 'TW', 'TH', 'FR', 'GB', 'IT', 'ES'],
  CN: ['TH', 'JP', 'KR', 'SG', 'MY', 'US', 'AU', 'NZ'],
  OTHER: ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'CA', 'AU'],
};
