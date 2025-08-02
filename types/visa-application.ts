/**
 * DINO v2.0 - Visa Application Types
 * TypeScript definitions for visa application tracking
 */

export type ApplicationStatus = 
  | 'planning'      // 신청 계획 중
  | 'preparing'     // 서류 준비 중
  | 'submitted'     // 신청 완료
  | 'processing'    // 심사 중
  | 'approved'      // 승인됨
  | 'rejected'      // 거절됨
  | 'expired'       // 만료됨
  | 'cancelled';    // 취소됨

export type ApplicationType = 
  | 'tourist'       // 관광비자
  | 'business'      // 사업비자
  | 'work'          // 취업비자
  | 'student'       // 학생비자
  | 'transit'       // 경유비자
  | 'working_holiday' // 백팩커비자
  | 'residence';    // 거주비자

export type DocumentStatus = 'missing' | 'preparing' | 'ready' | 'submitted';

export interface VisaDocument {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  status: DocumentStatus;
  notes?: string;
  expiryDate?: Date;
  fileUrl?: string;
}

export interface VisaApplication {
  id: string;
  userId: string;
  
  // Basic Info
  countryCode: string;
  countryName: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  
  // Dates
  plannedTravelDate: Date;
  applicationDeadline?: Date;
  submissionDate?: Date;
  processingTime?: number; // days
  expectedDecisionDate?: Date;
  visaValidFrom?: Date;
  visaValidUntil?: Date;
  
  // Documents
  documents: VisaDocument[];
  
  // Details
  consulate?: string;
  applicationFee?: number;
  currency?: string;
  notes?: string;
  
  // Notifications
  alertsEnabled: boolean;
  reminderDays: number[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface VisaRequirement {
  countryCode: string;
  applicationType: ApplicationType;
  processingTime: number; // days
  fee: number;
  currency: string;
  requiredDocuments: {
    name: string;
    description: string;
    isRequired: boolean;
  }[];
  notes?: string;
}

export interface VisaAlert {
  id: string;
  applicationId: string;
  type: 'deadline' | 'document' | 'processing' | 'expiry';
  title: string;
  message: string;
  alertDate: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Common document templates
export const COMMON_DOCUMENTS = {
  passport: {
    name: '여권',
    description: '유효기간 6개월 이상 남은 여권',
    isRequired: true,
  },
  photo: {
    name: '여권사진',
    description: '최근 6개월 이내 촬영된 여권용 사진',
    isRequired: true,
  },
  application_form: {
    name: '비자신청서',
    description: '온라인 작성 또는 인쇄하여 작성',
    isRequired: true,
  },
  bank_statement: {
    name: '잔고증명서',
    description: '최근 3개월 은행 거래내역서',
    isRequired: true,
  },
  flight_reservation: {
    name: '항공권 예약확인서',
    description: '왕복 항공권 예약 증명서',
    isRequired: true,
  },
  accommodation: {
    name: '숙박예약확인서',
    description: '호텔 또는 숙박시설 예약 증명서',
    isRequired: true,
  },
  travel_insurance: {
    name: '여행자보험',
    description: '의료비 보장 여행자보험 증서',
    isRequired: false,
  },
  employment_letter: {
    name: '재직증명서',
    description: '현재 직장의 재직증명서',
    isRequired: false,
  },
  invitation_letter: {
    name: '초청장',
    description: '현지 초청인의 초청장 및 신원보증서',
    isRequired: false,
  },
} as const;

// Country-specific visa requirements
export const VISA_REQUIREMENTS: Record<string, VisaRequirement[]> = {
  CN: [
    {
      countryCode: 'CN',
      applicationType: 'tourist',
      processingTime: 7,
      fee: 60,
      currency: 'USD',
      requiredDocuments: [
        COMMON_DOCUMENTS.passport,
        COMMON_DOCUMENTS.photo,
        COMMON_DOCUMENTS.application_form,
        COMMON_DOCUMENTS.bank_statement,
        COMMON_DOCUMENTS.flight_reservation,
        COMMON_DOCUMENTS.accommodation,
      ],
      notes: '중국 관광비자 (L) - 최대 30일 체류',
    },
  ],
  IN: [
    {
      countryCode: 'IN',
      applicationType: 'tourist',
      processingTime: 5,
      fee: 25,
      currency: 'USD',
      requiredDocuments: [
        COMMON_DOCUMENTS.passport,
        COMMON_DOCUMENTS.photo,
        COMMON_DOCUMENTS.application_form,
      ],
      notes: '인도 e-Tourist 비자 - 최대 30일 체류',
    },
  ],
  RU: [
    {
      countryCode: 'RU',
      applicationType: 'tourist',
      processingTime: 14,
      fee: 160,
      currency: 'USD',
      requiredDocuments: [
        COMMON_DOCUMENTS.passport,
        COMMON_DOCUMENTS.photo,
        COMMON_DOCUMENTS.application_form,
        COMMON_DOCUMENTS.invitation_letter,
        COMMON_DOCUMENTS.travel_insurance,
      ],
      notes: '러시아 관광비자 - 최대 30일 체류',
    },
  ],
} as const;