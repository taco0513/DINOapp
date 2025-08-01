// 비자 요구사항 데이터 (한국 여권 기준 주요 국가)
// 실제 운영시에는 외교부 API나 정확한 데이터 소스 사용 필요

// JavaScript에서는 interface 제거

// 한국 여권 소지자 기준 주요 국가 비자 정책
const KOREAN_PASSPORT_VISA_REQUIREMENTS = [
  // 무비자 국가들
  {
    fromCountry: 'KR',
    toCountry: 'JP',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '관광 목적 90일 무비자 입국 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'TH',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '관광 목적 90일 무비자 입국 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'SG',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '관광/비즈니스 목적 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'MY',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '관광 목적 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'VN',
    visaRequired: false,
    visaFreeStay: 45,
    visaTypes: ['tourist', 'business'],
    multipleEntry: true,
    notes: '45일 무비자, 연장 필요시 비자 신청 필요'
  },
  {
    fromCountry: 'KR',
    toCountry: 'PH',
    visaRequired: false,
    visaFreeStay: 30,
    visaTypes: ['tourist'],
    multipleEntry: true,
    notes: '30일 무비자, 현지에서 59일까지 연장 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'ID',
    visaRequired: false,
    visaFreeStay: 30,
    visaTypes: ['tourist', 'business'],
    multipleEntry: true,
    notes: '관광 목적 30일 무비자'
  },
  
  // 유럽 (셰겐)
  {
    fromCountry: 'KR',
    toCountry: 'FR',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '셰겐 협정국, 180일 중 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'DE',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '셰겐 협정국, 180일 중 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'IT',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '셰겐 협정국, 180일 중 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'ES',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '셰겐 협정국, 180일 중 90일 무비자'
  },
  
  // 미주
  {
    fromCountry: 'KR',
    toCountry: 'US',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: 'ESTA 승인 필요, 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'CA',
    visaRequired: false,
    visaFreeStay: 180,
    visaTypes: [],
    multipleEntry: true,
    notes: 'eTA 승인 필요, 최대 6개월 체류'
  },
  {
    fromCountry: 'KR',
    toCountry: 'MX',
    visaRequired: false,
    visaFreeStay: 180,
    visaTypes: [],
    multipleEntry: true,
    notes: '관광 목적 최대 180일 무비자'
  },
  
  // 비자 필요 국가들
  {
    fromCountry: 'KR',
    toCountry: 'CN',
    visaRequired: true,
    visaFreeStay: 0,
    visaTypes: ['tourist', 'business', 'transit'],
    processingTime: '4-7일',
    cost: 'KRW 35,000-70,000',
    requirements: ['여권', '사진', '신청서', '재직증명서', '은행잔고증명'],
    validityPeriod: 90,
    multipleEntry: false,
    notes: '단수/복수 비자 선택 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'IN',
    visaRequired: true,
    visaFreeStay: 0,
    visaTypes: ['e-visa', 'tourist', 'business'],
    processingTime: '3-5일',
    cost: 'USD 25-80',
    requirements: ['여권', '사진', '온라인 신청'],
    validityPeriod: 365,
    multipleEntry: true,
    notes: 'e-Visa 추천, 1년 복수 입국 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'RU',
    visaRequired: true,
    visaFreeStay: 0,
    visaTypes: ['tourist', 'business', 'transit'],
    processingTime: '5-10일',
    cost: 'USD 60-120',
    requirements: ['여권', '사진', '초청장', '보험증명'],
    validityPeriod: 30,
    multipleEntry: false,
    notes: '초청장 필수, 전자비자 가능 지역 제한'
  },
  {
    fromCountry: 'KR',
    toCountry: 'EG',
    visaRequired: true,
    visaFreeStay: 0,
    visaTypes: ['tourist', 'e-visa'],
    processingTime: '1-3일',
    cost: 'USD 25',
    requirements: ['여권', '온라인 신청'],
    validityPeriod: 90,
    multipleEntry: false,
    notes: '도착 비자 또는 e-Visa 가능'
  },
  
  // 오세아니아
  {
    fromCountry: 'KR',
    toCountry: 'AU',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: 'ETA 승인 필요, 3개월 체류 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'NZ',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: 'NZeTA 승인 필요, 3개월 체류 가능'
  },
  
  // 중동
  {
    fromCountry: 'KR',
    toCountry: 'AE',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '90일 무비자, 10일 추가 연장 가능'
  },
  {
    fromCountry: 'KR',
    toCountry: 'TR',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '180일 중 90일 무비자'
  },
  {
    fromCountry: 'KR',
    toCountry: 'IL',
    visaRequired: false,
    visaFreeStay: 90,
    visaTypes: [],
    multipleEntry: true,
    notes: '90일 무비자'
  }
];

// 다른 주요 여권 국가들의 데이터도 추가 가능
const US_PASSPORT_VISA_REQUIREMENTS = [
  // 미국 여권 기준 비자 정책...
];

const JP_PASSPORT_VISA_REQUIREMENTS = [
  // 일본 여권 기준 비자 정책...
];

// 모든 비자 요구사항 데이터 통합
const ALL_VISA_REQUIREMENTS = [
  ...KOREAN_PASSPORT_VISA_REQUIREMENTS,
  // ...US_PASSPORT_VISA_REQUIREMENTS,
  // ...JP_PASSPORT_VISA_REQUIREMENTS,
];

module.exports = {
  KOREAN_PASSPORT_VISA_REQUIREMENTS,
  US_PASSPORT_VISA_REQUIREMENTS,
  JP_PASSPORT_VISA_REQUIREMENTS,
  ALL_VISA_REQUIREMENTS
};