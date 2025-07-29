import { EmailProvider, EmailPattern } from '@/types/email';

// 대한항공 이메일 패턴
const koreanAirPatterns: EmailPattern[] = [
  {
    type: 'flight',
    subjectPatterns: [
      /대한항공.*예약.*확인/i,
      /Korean Air.*Confirmation/i,
      /KE\d+.*confirmation/i,
      /항공권.*발권.*완료/i
    ],
    bodyPatterns: {
      flightNumber: [
        /KE\s*(\d+)/i,
        /항공편\s*(?:번호)?:?\s*KE\s*(\d+)/i
      ],
      departureDate: [
        /출발\s*(?:일시|날짜)?:?\s*(\d{4}[-년]\d{1,2}[-월]\d{1,2}일?)/i,
        /Departure:?\s*(\w+\s+\d{1,2},?\s+\d{4})/i
      ],
      arrivalDate: [
        /도착\s*(?:일시|날짜)?:?\s*(\d{4}[-년]\d{1,2}[-월]\d{1,2}일?)/i,
        /Arrival:?\s*(\w+\s+\d{1,2},?\s+\d{4})/i
      ],
      departure: [
        /출발지?:?\s*([가-힣]+(?:\([A-Z]{3}\))?)/i,
        /From:?\s*([A-Za-z\s]+(?:\([A-Z]{3}\))?)/i
      ],
      arrival: [
        /도착지?:?\s*([가-힣]+(?:\([A-Z]{3}\))?)/i,
        /To:?\s*([A-Za-z\s]+(?:\([A-Z]{3}\))?)/i
      ],
      confirmation: [
        /예약\s*(?:번호|코드)?:?\s*([A-Z0-9]{6,})/i,
        /Confirmation\s*(?:Number|Code)?:?\s*([A-Z0-9]{6,})/i
      ]
    },
    dateFormats: ['YYYY-MM-DD', 'YYYY년 MM월 DD일', 'MMM DD, YYYY']
  }
];

// 아시아나항공 이메일 패턴
const asianaPatterns: EmailPattern[] = [
  {
    type: 'flight',
    subjectPatterns: [
      /아시아나항공.*예약.*확인/i,
      /Asiana.*Confirmation/i,
      /OZ\d+.*confirmation/i,
      /전자.*항공권.*발권/i
    ],
    bodyPatterns: {
      flightNumber: [
        /OZ\s*(\d+)/i,
        /항공편:?\s*OZ\s*(\d+)/i
      ],
      departureDate: [
        /출발\s*(?:일자|날짜)?:?\s*(\d{4}[-\.년]\d{1,2}[-\.월]\d{1,2}일?)/i,
        /Departure\s*Date:?\s*(\w+\s+\d{1,2},?\s+\d{4})/i
      ],
      departure: [
        /출발\s*공항:?\s*([가-힣]+(?:\([A-Z]{3}\))?)/i,
        /From:?\s*([A-Za-z\s]+\([A-Z]{3}\))/i
      ],
      arrival: [
        /도착\s*공항:?\s*([가-힣]+(?:\([A-Z]{3}\))?)/i,
        /To:?\s*([A-Za-z\s]+\([A-Z]{3}\))/i
      ],
      confirmation: [
        /예약\s*번호:?\s*([A-Z0-9]{6,})/i,
        /Booking\s*Reference:?\s*([A-Z0-9]{6,})/i
      ]
    },
    dateFormats: ['YYYY-MM-DD', 'YYYY.MM.DD', 'MMM DD, YYYY']
  }
];

// 일본항공(JAL) 이메일 패턴
const jalPatterns: EmailPattern[] = [
  {
    type: 'flight',
    subjectPatterns: [
      /JAL.*予約.*確認/i,
      /Japan Airlines.*Confirmation/i,
      /JL\d+.*confirmation/i
    ],
    bodyPatterns: {
      flightNumber: [
        /JL\s*(\d+)/i,
        /Flight:?\s*JL\s*(\d+)/i
      ],
      departureDate: [
        /Departure:?\s*(\d{1,2}\s+\w+\s+\d{4})/i,
        /出発日:?\s*(\d{4}年\d{1,2}月\d{1,2}日)/i
      ],
      confirmation: [
        /Confirmation\s*Number:?\s*([A-Z0-9]{6,})/i,
        /予約番号:?\s*([A-Z0-9]{6,})/i
      ]
    },
    dateFormats: ['DD MMM YYYY', 'YYYY年MM月DD日', 'YYYY-MM-DD']
  }
];

// Booking.com 이메일 패턴
const bookingPatterns: EmailPattern[] = [
  {
    type: 'hotel',
    subjectPatterns: [
      /Booking\.com.*예약.*확인/i,
      /Your booking confirmation/i,
      /숙소.*예약.*완료/i
    ],
    bodyPatterns: {
      checkIn: [
        /체크인:?\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/i,
        /Check-in:?\s*(\w+,?\s*\d{1,2}\s+\w+\s+\d{4})/i,
        /체크인\s*날짜:?\s*(\d{4}-\d{2}-\d{2})/i
      ],
      checkOut: [
        /체크아웃:?\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/i,
        /Check-out:?\s*(\w+,?\s*\d{1,2}\s+\w+\s+\d{4})/i,
        /체크아웃\s*날짜:?\s*(\d{4}-\d{2}-\d{2})/i
      ],
      location: [
        /호텔\s*위치:?\s*([가-힣\s,]+)/i,
        /Address:?\s*([A-Za-z0-9\s,.-]+)/i
      ],
      confirmation: [
        /예약\s*번호:?\s*(\d+)/i,
        /Booking\s*number:?\s*(\d+)/i
      ]
    },
    dateFormats: ['YYYY년 MM월 DD일', 'dddd, DD MMMM YYYY', 'YYYY-MM-DD']
  }
];

// Agoda 이메일 패턴
const agodaPatterns: EmailPattern[] = [
  {
    type: 'hotel',
    subjectPatterns: [
      /Agoda.*예약.*확인/i,
      /Your Agoda booking/i,
      /아고다.*예약.*완료/i
    ],
    bodyPatterns: {
      checkIn: [
        /체크인:?\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/i,
        /Check-in:?\s*(\d{1,2}\s+\w+\s+\d{4})/i
      ],
      checkOut: [
        /체크아웃:?\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/i,
        /Check-out:?\s*(\d{1,2}\s+\w+\s+\d{4})/i
      ],
      location: [
        /호텔:?\s*([가-힣\s]+)/i,
        /Property:?\s*([A-Za-z\s&-]+)/i
      ],
      name: [
        /Property:?\s*([A-Za-z\s&-]+)/i
      ],
      confirmation: [
        /예약\s*ID:?\s*(\d+)/i,
        /Booking\s*ID:?\s*(\d+)/i
      ]
    },
    dateFormats: ['YYYY년 MM월 DD일', 'DD MMMM YYYY', 'YYYY-MM-DD']
  }
];

// 중국 항공사 패턴 (중국국제항공, 중국남방항공 등)
const chineseAirlinePatterns: EmailPattern[] = [
  {
    type: 'flight',
    subjectPatterns: [
      /Air China.*Confirmation/i,
      /China Southern.*booking/i,
      /CA\d+|CZ\d+.*confirmation/i
    ],
    bodyPatterns: {
      flightNumber: [
        /(CA|CZ)\s*(\d+)/i
      ],
      confirmation: [
        /Confirmation\s*Code:?\s*([A-Z0-9]{6,})/i,
        /PNR:?\s*([A-Z0-9]{6,})/i
      ]
    },
    dateFormats: ['DD MMM YYYY', 'YYYY-MM-DD']
  }
];

// 이메일 제공업체별 패턴 정의
export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    name: '대한항공',
    domains: ['koreanair.com', 'ke.com'],
    patterns: koreanAirPatterns
  },
  {
    name: '아시아나항공',
    domains: ['flyasiana.com', 'asiana.co.kr'],
    patterns: asianaPatterns
  },
  {
    name: 'JAL',
    domains: ['jal.com', 'jal.co.jp'],
    patterns: jalPatterns
  },
  {
    name: 'Booking.com',
    domains: ['booking.com', 'bstatic.com'],
    patterns: bookingPatterns
  },
  {
    name: 'Agoda',
    domains: ['agoda.com', 'agoda.net'],
    patterns: agodaPatterns
  },
  {
    name: 'Chinese Airlines',
    domains: ['airchina.com', 'csair.com', 'ceair.com'],
    patterns: chineseAirlinePatterns
  }
];

// 공통 날짜 패턴
export const COMMON_DATE_PATTERNS = {
  korean: [
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g,
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/g
  ],
  english: [
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/g, // January 15, 2024
    /(\d{1,2})\s+(\w+)\s+(\d{4})/g,   // 15 January 2024
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/g  // 01/15/2024
  ],
  japanese: [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/g
  ]
};

// 시간 패턴
export const TIME_PATTERNS = [
  /(\d{1,2}):(\d{2})\s*(AM|PM)?/gi,
  /(\d{1,2})시\s*(\d{2})분?/g
];

// 공항 코드 추출 패턴
export const AIRPORT_CODE_PATTERN = /\(([A-Z]{3})\)/g;

// 항공편 번호 패턴
export const FLIGHT_NUMBER_PATTERNS = [
  /(KE|OZ|JL|NH|CA|CZ|CI|BR|TG|SQ|MH|PR|VN|BL|LJ|BX|RS|ZE|TW|RF)\s*(\d+)/gi
];

// 확인번호 패턴  
export const CONFIRMATION_PATTERNS = [
  /(?:예약|Booking|Confirmation|PNR)(?:\s*(?:번호|Number|Code|Reference))?:?\s*([A-Z0-9]{5,})/gi,
  /([A-Z]{2}\d{4}[A-Z0-9]{2,})/g // 일반적인 항공권 PNR 형식
];