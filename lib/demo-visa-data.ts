/**
 * DINO v2.0 - Demo Visa Application Data
 * Sample data for visa application tracking and alerts
 */

import { VisaApplication, VisaAlert, ApplicationStatus, ApplicationType } from '@/types/visa-application';
import { COMMON_DOCUMENTS } from '@/types/visa-application';

// Demo visa applications
export const DEMO_VISA_APPLICATIONS: VisaApplication[] = [
  {
    id: 'visa-001',
    userId: 'demo-user',
    countryCode: 'CN',
    countryName: '중국',
    applicationType: 'tourist' as ApplicationType,
    status: 'preparing' as ApplicationStatus,
    plannedTravelDate: new Date('2025-09-15'),
    applicationDeadline: new Date('2025-08-15'),
    processingTime: 7,
    applicationFee: 60,
    currency: 'USD',
    consulate: '주한중국영사관 (서울)',
    notes: '베이징, 상하이 여행 예정. 호텔 예약 완료.',
    alertsEnabled: true,
    reminderDays: [30, 14, 7, 3, 1],
    documents: [
      {
        id: 'doc-001',
        name: COMMON_DOCUMENTS.passport.name,
        description: COMMON_DOCUMENTS.passport.description,
        isRequired: true,
        status: 'ready'
      },
      {
        id: 'doc-002',
        name: COMMON_DOCUMENTS.photo.name,
        description: COMMON_DOCUMENTS.photo.description,
        isRequired: true,
        status: 'ready'
      },
      {
        id: 'doc-003',
        name: COMMON_DOCUMENTS.application_form.name,
        description: COMMON_DOCUMENTS.application_form.description,
        isRequired: true,
        status: 'preparing'
      },
      {
        id: 'doc-004',
        name: COMMON_DOCUMENTS.bank_statement.name,
        description: COMMON_DOCUMENTS.bank_statement.description,
        isRequired: true,
        status: 'missing'
      },
      {
        id: 'doc-005',
        name: COMMON_DOCUMENTS.flight_reservation.name,
        description: COMMON_DOCUMENTS.flight_reservation.description,
        isRequired: true,
        status: 'ready'
      },
      {
        id: 'doc-006',
        name: COMMON_DOCUMENTS.accommodation.name,
        description: COMMON_DOCUMENTS.accommodation.description,
        isRequired: true,
        status: 'ready'
      }
    ],
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-08-01')
  },
  {
    id: 'visa-002',
    userId: 'demo-user',
    countryCode: 'IN',
    countryName: '인도',
    applicationType: 'tourist' as ApplicationType,
    status: 'processing' as ApplicationStatus,
    plannedTravelDate: new Date('2025-10-20'),
    submissionDate: new Date('2025-07-25'),
    processingTime: 5,
    expectedDecisionDate: new Date('2025-08-02'),
    applicationFee: 25,
    currency: 'USD',
    consulate: '인도 e-Visa 온라인',
    notes: '델리, 뭄바이, 고아 여행 계획. e-Tourist 비자 신청 완료.',
    alertsEnabled: true,
    reminderDays: [14, 7, 3],
    documents: [
      {
        id: 'doc-007',
        name: COMMON_DOCUMENTS.passport.name,
        description: COMMON_DOCUMENTS.passport.description,
        isRequired: true,
        status: 'submitted'
      },
      {
        id: 'doc-008',
        name: COMMON_DOCUMENTS.photo.name,
        description: COMMON_DOCUMENTS.photo.description,
        isRequired: true,
        status: 'submitted'
      },
      {
        id: 'doc-009',
        name: COMMON_DOCUMENTS.application_form.name,
        description: COMMON_DOCUMENTS.application_form.description,
        isRequired: true,
        status: 'submitted'
      }
    ],
    createdAt: new Date('2025-07-20'),
    updatedAt: new Date('2025-07-25')
  },
  {
    id: 'visa-003',
    userId: 'demo-user',
    countryCode: 'RU',
    countryName: '러시아',
    applicationType: 'tourist' as ApplicationType,
    status: 'planning' as ApplicationStatus,
    plannedTravelDate: new Date('2025-11-10'),
    applicationDeadline: new Date('2025-10-10'),
    processingTime: 14,
    applicationFee: 160,
    currency: 'USD',
    consulate: '주한러시아영사관 (서울)',
    notes: '모스크바, 상트페테르부르크 여행 예정. 초청장 필요.',
    alertsEnabled: true,
    reminderDays: [45, 30, 14, 7],
    documents: [
      {
        id: 'doc-010',
        name: COMMON_DOCUMENTS.passport.name,
        description: COMMON_DOCUMENTS.passport.description,
        isRequired: true,
        status: 'ready'
      },
      {
        id: 'doc-011',
        name: COMMON_DOCUMENTS.photo.name,
        description: COMMON_DOCUMENTS.photo.description,
        isRequired: true,
        status: 'missing'
      },
      {
        id: 'doc-012',
        name: COMMON_DOCUMENTS.application_form.name,
        description: COMMON_DOCUMENTS.application_form.description,
        isRequired: true,
        status: 'missing'
      },
      {
        id: 'doc-013',
        name: COMMON_DOCUMENTS.invitation_letter.name,
        description: COMMON_DOCUMENTS.invitation_letter.description,
        isRequired: true,
        status: 'missing'
      },
      {
        id: 'doc-014',
        name: COMMON_DOCUMENTS.travel_insurance.name,
        description: COMMON_DOCUMENTS.travel_insurance.description,
        isRequired: true,
        status: 'missing'
      }
    ],
    createdAt: new Date('2025-07-30'),
    updatedAt: new Date('2025-08-01')
  },
  {
    id: 'visa-004',
    userId: 'demo-user',
    countryCode: 'JP',
    countryName: '일본',
    applicationType: 'tourist' as ApplicationType,
    status: 'approved' as ApplicationStatus,
    plannedTravelDate: new Date('2025-08-15'),
    submissionDate: new Date('2025-07-10'),
    processingTime: 5,
    expectedDecisionDate: new Date('2025-07-15'),
    visaValidFrom: new Date('2025-08-01'),
    visaValidUntil: new Date('2025-11-01'),
    applicationFee: 0,
    currency: 'USD',
    consulate: '무비자 (90일)',
    notes: '도쿄, 오사카 여행. 한국 여권 무비자 입국 가능.',
    alertsEnabled: true,
    reminderDays: [30, 7],
    documents: [
      {
        id: 'doc-015',
        name: COMMON_DOCUMENTS.passport.name,
        description: COMMON_DOCUMENTS.passport.description,
        isRequired: true,
        status: 'ready'
      }
    ],
    createdAt: new Date('2025-07-05'),
    updatedAt: new Date('2025-07-15')
  }
];

// Demo alerts
export const DEMO_VISA_ALERTS: VisaAlert[] = [
  {
    id: 'alert-001',
    applicationId: 'visa-001',
    type: 'deadline',
    title: '중국 비자 신청 마감 임박',
    message: '중국 관광비자 신청 마감일이 2주 후입니다. 필요 서류를 완료해주세요.',
    alertDate: new Date('2025-08-01'),
    isRead: false,
    priority: 'high'
  },
  {
    id: 'alert-002',
    applicationId: 'visa-001',
    type: 'document',
    title: '잔고증명서 준비 필요',
    message: '중국 비자 신청을 위한 잔고증명서가 아직 준비되지 않았습니다.',
    alertDate: new Date('2025-08-01'),
    isRead: false,
    priority: 'medium'
  },
  {
    id: 'alert-003',
    applicationId: 'visa-002',
    type: 'processing',
    title: '인도 e-Visa 결과 발표 예정',
    message: '인도 e-Tourist 비자 심사 결과가 내일 발표될 예정입니다.',
    alertDate: new Date('2025-08-01'),
    isRead: false,
    priority: 'medium'
  },
  {
    id: 'alert-004',
    applicationId: 'visa-004',
    type: 'expiry',
    title: '일본 여행 출발일 임박',
    message: '일본 여행 출발일이 2주 후입니다. 여행 준비를 완료해주세요.',
    alertDate: new Date('2025-08-01'),
    isRead: true,
    priority: 'low'
  },
  {
    id: 'alert-005',
    applicationId: 'visa-003',
    type: 'deadline',
    title: '러시아 비자 준비 시작',
    message: '러시아 관광비자 신청 마감일이 2개월 후입니다. 초청장 준비를 시작하세요.',
    alertDate: new Date('2025-08-01'),
    isRead: false,
    priority: 'low'
  }
];

// Generate random visa application for testing
export function generateRandomVisaApplication(): VisaApplication {
  const countries = [
    { code: 'CN', name: '중국' },
    { code: 'IN', name: '인도' },
    { code: 'RU', name: '러시아' },
    { code: 'VN', name: '베트남' },
    { code: 'BR', name: '브라질' }
  ] as const;
  
  const types: ApplicationType[] = ['tourist', 'business'];
  const statuses: ApplicationStatus[] = ['planning', 'preparing', 'submitted', 'processing', 'approved'];
  
  const country = countries[Math.floor(Math.random() * countries.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const now = new Date();
  const plannedDate = new Date(now.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000); // 0-180 days from now
  
  return {
    id: `visa-${Date.now()}`,
    userId: 'demo-user',
    countryCode: country.code,
    countryName: country.name,
    applicationType: type,
    status,
    plannedTravelDate: plannedDate,
    applicationDeadline: new Date(plannedDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before travel
    processingTime: Math.floor(Math.random() * 20) + 5, // 5-25 days
    applicationFee: Math.floor(Math.random() * 200) + 25, // $25-225
    currency: 'USD',
    consulate: `${country.name} 영사관`,
    alertsEnabled: true,
    reminderDays: [30, 14, 7, 3, 1],
    documents: [
      {
        id: `doc-${Date.now()}-1`,
        name: COMMON_DOCUMENTS.passport.name,
        description: COMMON_DOCUMENTS.passport.description,
        isRequired: true,
        status: 'ready'
      },
      {
        id: `doc-${Date.now()}-2`,
        name: COMMON_DOCUMENTS.photo.name,
        description: COMMON_DOCUMENTS.photo.description,
        isRequired: true,
        status: Math.random() > 0.5 ? 'ready' : 'preparing'
      }
    ],
    createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 0-30 days ago
    updatedAt: now
  };
}