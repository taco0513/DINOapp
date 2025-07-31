export interface EmailProvider {
  name: string;
  domains: string[];
  patterns: EmailPattern[];
}

export interface EmailPattern {
  type: 'flight' | 'hotel' | 'rental' | 'train' | 'other';
  subjectPatterns: RegExp[];
  bodyPatterns: {
    date?: RegExp[];
    departureDate?: RegExp[];
    arrivalDate?: RegExp[];
    checkIn?: RegExp[];
    checkOut?: RegExp[];
    departure?: RegExp[];
    arrival?: RegExp[];
    flightNumber?: RegExp[];
    confirmation?: RegExp[];
    location?: RegExp[];
    destination?: RegExp[];
  };
  dateFormats: string[];
}

export interface ParsedEmailData {
  type: 'flight' | 'hotel' | 'rental' | 'train' | 'other';
  provider: string;
  confirmationNumber?: string;

  // Flight specific
  flightNumber?: string;
  departure?: {
    location: string;
    date: Date;
    time?: string;
  };
  arrival?: {
    location: string;
    date: Date;
    time?: string;
  };

  // Hotel specific
  hotel?: {
    name: string;
    location: string;
    checkIn: Date;
    checkOut: Date;
  };

  // General travel info
  dates?: {
    start: Date;
    end: Date;
  };

  // Raw data for debugging
  rawSubject: string;
  rawBody: string;
  confidence: number; // 0-1, parsing confidence score
}

export interface EmailParserResult {
  success: boolean;
  data?: ParsedEmailData;
  error?: string;
  warnings?: string[];
}

export interface EmailParserOptions {
  strictMode?: boolean; // More strict parsing
  includeRawData?: boolean; // Include raw email content
  confidenceThreshold?: number; // Minimum confidence to accept result
}

// Korean airline codes and names
export const _KOREAN_AIRLINES = {
  KE: '대한항공',
  OZ: '아시아나항공',
  LJ: '진에어',
  BX: '에어부산',
  RS: '에어서울',
  ZE: '이스타항공',
  TW: '티웨이항공',
  RF: '플라이강원',
} as const;

// Airport codes mapping
export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  korean?: string;
}

export const MAJOR_AIRPORTS: Record<string, AirportInfo> = {
  ICN: {
    code: 'ICN',
    name: 'Incheon International',
    city: 'Seoul',
    country: 'KR',
    korean: '인천국제공항',
  },
  GMP: {
    code: 'GMP',
    name: 'Gimpo International',
    city: 'Seoul',
    country: 'KR',
    korean: '김포국제공항',
  },
  PUS: {
    code: 'PUS',
    name: 'Busan Gimhae International',
    city: 'Busan',
    country: 'KR',
    korean: '부산김해국제공항',
  },
  CJU: {
    code: 'CJU',
    name: 'Jeju International',
    city: 'Jeju',
    country: 'KR',
    korean: '제주국제공항',
  },
  NRT: {
    code: 'NRT',
    name: 'Narita International',
    city: 'Tokyo',
    country: 'JP',
    korean: '나리타국제공항',
  },
  HND: {
    code: 'HND',
    name: 'Haneda Airport',
    city: 'Tokyo',
    country: 'JP',
    korean: '하네다공항',
  },
  KIX: {
    code: 'KIX',
    name: 'Kansai International',
    city: 'Osaka',
    country: 'JP',
    korean: '간사이국제공항',
  },
  TPE: {
    code: 'TPE',
    name: 'Taiwan Taoyuan International',
    city: 'Taipei',
    country: 'TW',
    korean: '타오위안국제공항',
  },
  HKG: {
    code: 'HKG',
    name: 'Hong Kong International',
    city: 'Hong Kong',
    country: 'HK',
    korean: '홍콩국제공항',
  },
  PVG: {
    code: 'PVG',
    name: 'Shanghai Pudong International',
    city: 'Shanghai',
    country: 'CN',
    korean: '상하이푸둥국제공항',
  },
  PEK: {
    code: 'PEK',
    name: 'Beijing Capital International',
    city: 'Beijing',
    country: 'CN',
    korean: '베이징수도국제공항',
  },
  SIN: {
    code: 'SIN',
    name: 'Singapore Changi',
    city: 'Singapore',
    country: 'SG',
    korean: '싱가포르창이공항',
  },
  BKK: {
    code: 'BKK',
    name: 'Suvarnabhumi Airport',
    city: 'Bangkok',
    country: 'TH',
    korean: '수완나품공항',
  },
  KUL: {
    code: 'KUL',
    name: 'Kuala Lumpur International',
    city: 'Kuala Lumpur',
    country: 'MY',
    korean: '쿠알라룸푸르국제공항',
  },
} as const;
