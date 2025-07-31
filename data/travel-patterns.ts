/**
 * 여행 이메일 패턴 정의
 * 다양한 항공사, 여행사, 호텔 체인의 이메일 패턴을 정의합니다.
 */

export interface TravelEmailPattern {
  name: string;
  category:
    | 'airline'
    | 'hotel'
    | 'travel_agency'
    | 'rental'
    | 'booking_platform';
  senderPatterns: RegExp[];
  subjectPatterns: RegExp[];
  bodyPatterns: RegExp[];
  weight: number;
  extractors: {
    dates?: RegExp[];
    flights?: RegExp[];
    bookingReference?: RegExp[];
    airports?: RegExp[];
    passengers?: RegExp[];
    hotels?: RegExp[];
  };
}

// 한국 항공사 패턴
export const koreanAirlinePatterns: TravelEmailPattern[] = [
  {
    name: 'Korean Air',
    category: 'airline',
    senderPatterns: [/@koreanair\.com$/i, /@ke\.co\.kr$/i, /korean\s*air/i],
    subjectPatterns: [
      /대한항공.*예약/i,
      /korean\s*air.*booking/i,
      /항공권.*발권/i,
      /e-ticket.*confirmation/i,
    ],
    bodyPatterns: [
      /항공편\s*번호/i,
      /departure\s*time/i,
      /출발\s*시간/i,
      /(KE|ke)\s*\d{3,4}/i,
    ],
    weight: 0.9,
    extractors: {
      flights: [/(KE|ke)\s*(\d{3,4})/gi],
      bookingReference: [
        /예약\s*번호[:\s]*([A-Z0-9]{6,})/gi,
        /confirmation[:\s]*([A-Z0-9]{6,})/gi,
      ],
      airports: [
        /([A-Z]{3})\s*→\s*([A-Z]{3})/gi,
        /\b([A-Z]{3})\s*-\s*([A-Z]{3})\b/gi,
      ],
    },
  },
  {
    name: 'Asiana Airlines',
    category: 'airline',
    senderPatterns: [/@flyasiana\.com$/i, /@asiana\.co\.kr$/i, /asiana/i],
    subjectPatterns: [/아시아나.*예약/i, /asiana.*booking/i, /항공권.*확인/i],
    bodyPatterns: [/(OZ|oz)\s*\d{3,4}/i, /아시아나항공/i],
    weight: 0.9,
    extractors: {
      flights: [/(OZ|oz)\s*(\d{3,4})/gi],
      bookingReference: [/예약\s*번호[:\s]*([A-Z0-9]{6,})/gi],
    },
  },
  {
    name: 'Jeju Air',
    category: 'airline',
    senderPatterns: [/@jejuair\.net$/i, /jeju\s*air/i],
    subjectPatterns: [/제주항공.*예약/i, /jeju\s*air.*booking/i],
    bodyPatterns: [/(7C|7c)\s*\d{3,4}/i, /제주항공/i],
    weight: 0.8,
    extractors: {
      flights: [/(7C|7c)\s*(\d{3,4})/gi],
    },
  },
];

// 국제 항공사 패턴
export const internationalAirlinePatterns: TravelEmailPattern[] = [
  {
    name: 'United Airlines',
    category: 'airline',
    senderPatterns: [/@united\.com$/i, /united\s*airlines/i],
    subjectPatterns: [
      /united.*confirmation/i,
      /flight.*confirmation/i,
      /e-ticket/i,
    ],
    bodyPatterns: [/(UA|ua)\s*\d{3,4}/i, /united\s*airlines/i],
    weight: 0.9,
    extractors: {
      flights: [/(UA|ua)\s*(\d{3,4})/gi],
      bookingReference: [/confirmation\s*number[:\s]*([A-Z0-9]{6,})/gi],
    },
  },
  {
    name: 'Delta Airlines',
    category: 'airline',
    senderPatterns: [/@delta\.com$/i, /delta\s*airlines/i],
    subjectPatterns: [/delta.*confirmation/i, /flight.*itinerary/i],
    bodyPatterns: [/(DL|dl)\s*\d{3,4}/i, /delta\s*airlines/i],
    weight: 0.9,
    extractors: {
      flights: [/(DL|dl)\s*(\d{3,4})/gi],
    },
  },
  {
    name: 'Japan Airlines',
    category: 'airline',
    senderPatterns: [/@jal\.com$/i, /@jal\.co\.jp$/i, /japan\s*airlines/i],
    subjectPatterns: [/jal.*confirmation/i, /japan\s*airlines/i],
    bodyPatterns: [/(JL|jl)\s*\d{3,4}/i, /japan\s*airlines/i],
    weight: 0.9,
    extractors: {
      flights: [/(JL|jl)\s*(\d{3,4})/gi],
    },
  },
];

// 호텔 체인 패턴
export const hotelPatterns: TravelEmailPattern[] = [
  {
    name: 'Booking.com',
    category: 'booking_platform',
    senderPatterns: [/@booking\.com$/i, /booking\.com/i],
    subjectPatterns: [
      /booking.*confirmation/i,
      /reservation.*confirmed/i,
      /예약.*확인/i,
    ],
    bodyPatterns: [
      /check-in\s*date/i,
      /check-out\s*date/i,
      /체크인/i,
      /체크아웃/i,
    ],
    weight: 0.8,
    extractors: {
      bookingReference: [
        /booking\s*number[:\s]*([A-Z0-9]{6,})/gi,
        /예약\s*번호[:\s]*([A-Z0-9]{6,})/gi,
      ],
      dates: [
        /check-in[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
        /check-out[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
        /체크인[:\s]*(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/gi,
      ],
    },
  },
  {
    name: 'Expedia',
    category: 'travel_agency',
    senderPatterns: [/@expedia\.com$/i, /@expediamail\.com$/i, /expedia/i],
    subjectPatterns: [
      /expedia.*confirmation/i,
      /trip.*confirmation/i,
      /itinerary/i,
    ],
    bodyPatterns: [/trip\s*number/i, /confirmation\s*number/i],
    weight: 0.8,
    extractors: {
      bookingReference: [/trip\s*number[:\s]*([A-Z0-9]{6,})/gi],
    },
  },
  {
    name: 'Agoda',
    category: 'booking_platform',
    senderPatterns: [/@agoda\.com$/i, /agoda/i],
    subjectPatterns: [/agoda.*booking/i, /reservation.*confirmation/i],
    bodyPatterns: [/booking\s*id/i, /reservation\s*number/i],
    weight: 0.7,
    extractors: {
      bookingReference: [/booking\s*id[:\s]*([A-Z0-9]{6,})/gi],
    },
  },
];

// 렌터카 패턴
export const rentalCarPatterns: TravelEmailPattern[] = [
  {
    name: 'Hertz',
    category: 'rental',
    senderPatterns: [/@hertz\.com$/i, /hertz/i],
    subjectPatterns: [/hertz.*reservation/i, /car\s*rental.*confirmation/i],
    bodyPatterns: [/rental\s*agreement/i, /pick-up\s*date/i, /return\s*date/i],
    weight: 0.7,
    extractors: {
      bookingReference: [/reservation\s*number[:\s]*([A-Z0-9]{6,})/gi],
      dates: [
        /pick-up[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
        /return[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
      ],
    },
  },
];

// 모든 패턴을 합친 배열
export const allTravelPatterns: TravelEmailPattern[] = [
  ...koreanAirlinePatterns,
  ...internationalAirlinePatterns,
  ...hotelPatterns,
  ...rentalCarPatterns,
];

// 날짜 형식 패턴
export const datePatterns = [
  // 한국식 날짜
  /(\d{4})[\/\-\.년]\s*(\d{1,2})[\/\-\.월]\s*(\d{1,2})[일]?/g,
  // 미국식 날짜
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
  // ISO 형식
  /(\d{4})-(\d{2})-(\d{2})/g,
  // 영문 월 표기
  /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/gi,
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/gi,
  // 한글 월 표기
  /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g,
  /(\d{1,2})\s*월\s*(\d{1,2})\s*일/g,
];

// 시간 패턴
export const timePatterns = [
  /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm|오전|오후)?/g,
  /(\d{1,2})시\s*(\d{2})?분?/g,
];

// 공항 코드 매핑 (주요 공항)
export const airportCodes = {
  // 한국
  ICN: '인천국제공항',
  GMP: '김포국제공항',
  CJU: '제주국제공항',
  PUS: '김해국제공항',
  TAE: '대구국제공항',

  // 일본
  NRT: '나리타국제공항',
  HND: '하네다공항',
  KIX: '간사이국제공항',
  NGO: '주부국제공항',

  // 중국
  PEK: '베이징서우두국제공항',
  PVG: '상하이푸동국제공항',
  CAN: '광저우바이윈국제공항',

  // 동남아시아
  BKK: '방콕수완나품국제공항',
  SIN: '싱가포르창이공항',
  KUL: '쿠알라룸푸르국제공항',
  MNL: '니노이아키노국제공항',

  // 미국
  LAX: '로스앤젤레스국제공항',
  JFK: '존F케네디국제공항',
  SFO: '샌프란시스코국제공항',
  ORD: '시카고오헤어국제공항',

  // 유럽
  LHR: '런던히드로공항',
  CDG: '파리샤를드골공항',
  FRA: '프랑크푸르트공항',
  AMS: '암스테르담스키폴공항',
};

// 항공사 코드 매핑
export const airlineCodes = {
  // 한국
  KE: '대한항공',
  OZ: '아시아나항공',
  '7C': '제주항공',
  BX: '에어부산',
  TW: '티웨이항공',
  LJ: '진에어',

  // 국제
  UA: '유나이티드항공',
  DL: '델타항공',
  AA: '아메리카항공',
  JL: '일본항공',
  NH: '전일본공수',
  CA: '중국국제항공',
  CZ: '중국남방항공',
  TG: '타이항공',
  SQ: '싱가포르항공',
  CX: '캐세이퍼시픽',
  LH: '루프트한자',
  AF: '에어프랑스',
  BA: '브리티시에어웨이즈',
};
