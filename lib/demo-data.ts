/**
 * DINO v2.0 - Demo Travel Data
 * Sample data for testing the travel analytics dashboard
 */

import type { StayRecord } from '@/types/country-tracker';

export const DEMO_TRAVEL_DATA: StayRecord[] = [
  // 2024 travels
  {
    id: 'stay-001',
    countryCode: 'TH',
    entryDate: new Date('2024-01-15'),
    exitDate: new Date('2024-02-28'),
    purpose: 'tourism',
    notes: '방콕과 치앙마이 여행'
  },
  {
    id: 'stay-002', 
    countryCode: 'VN',
    entryDate: new Date('2024-03-10'),
    exitDate: new Date('2024-04-20'),
    purpose: 'work',
    notes: '호치민에서 원격근무'
  },
  {
    id: 'stay-003',
    countryCode: 'MY',
    entryDate: new Date('2024-05-05'),
    exitDate: new Date('2024-06-15'),
    purpose: 'tourism',
    notes: '쿠알라룸푸르와 페낭'
  },
  {
    id: 'stay-004',
    countryCode: 'SG',
    entryDate: new Date('2024-06-16'),
    exitDate: new Date('2024-06-25'),
    purpose: 'business',
    notes: '비즈니스 미팅'
  },
  {
    id: 'stay-005',
    countryCode: 'TH',
    entryDate: new Date('2024-07-01'),
    exitDate: new Date('2024-08-30'),
    purpose: 'work',
    notes: '푸켓에서 디지털 노마드'
  },
  {
    id: 'stay-006',
    countryCode: 'JP',
    entryDate: new Date('2024-09-10'),
    exitDate: new Date('2024-10-05'),
    purpose: 'tourism',
    notes: '도쿄와 오사카 여행'
  },
  {
    id: 'stay-007',
    countryCode: 'TW',
    entryDate: new Date('2024-10-15'),
    exitDate: new Date('2024-11-20'),
    purpose: 'work',
    notes: '타이페이에서 프로젝트'
  },
  
  // Current stay
  {
    id: 'stay-008',
    countryCode: 'VN',
    entryDate: new Date('2024-12-01'),
    exitDate: null, // Currently staying
    purpose: 'work',
    notes: '하노이에서 장기 체류'
  },

  // 2023 travels for historical data
  {
    id: 'stay-009',
    countryCode: 'TH',
    entryDate: new Date('2023-11-01'),
    exitDate: new Date('2023-12-15'),
    purpose: 'tourism',
    notes: '2023년 말 방콕 여행'
  },
  {
    id: 'stay-010',
    countryCode: 'MY',
    entryDate: new Date('2023-08-10'),
    exitDate: new Date('2023-09-20'),
    purpose: 'work',
    notes: '조호르바루 프로젝트'
  },
  {
    id: 'stay-011',
    countryCode: 'ID',
    entryDate: new Date('2023-06-05'),
    exitDate: new Date('2023-07-25'),
    purpose: 'tourism',
    notes: '발리와 자카르타'
  },
  {
    id: 'stay-012',
    countryCode: 'PH',
    entryDate: new Date('2023-03-15'),
    exitDate: new Date('2023-04-30'),
    purpose: 'work',
    notes: '마닐라에서 컨설팅'
  }
];

// Helper function to generate random demo data
export function generateRandomStayData(count: number = 20): StayRecord[] {
  const countries = ['TH', 'VN', 'MY', 'SG', 'ID', 'PH', 'JP', 'TW'];
  const purposes = ['tourism', 'work', 'business', 'transit'];
  const stays: StayRecord[] = [];
  
  const startDate = new Date('2023-01-01');
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    const countryCode = countries[Math.floor(Math.random() * countries.length)];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    
    // Random stay duration between 7-45 days
    const stayDuration = Math.floor(Math.random() * 38) + 7;
    const entryDate = new Date(currentDate);
    const exitDate = new Date(currentDate);
    exitDate.setDate(exitDate.getDate() + stayDuration);
    
    stays.push({
      id: `demo-stay-${i + 1}`,
      countryCode,
      entryDate,
      exitDate: i === count - 1 ? null : exitDate, // Last stay is current
      purpose,
      notes: `Demo ${countryCode} stay ${i + 1}`
    });
    
    // Move to next stay (with some gap)
    currentDate = new Date(exitDate);
    currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 14) + 1);
  }
  
  return stays;
}

// Predefined country mappings for consistent display
export const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  'TH': '태국',
  'VN': '베트남', 
  'MY': '말레이시아',
  'SG': '싱가포르',
  'ID': '인도네시아',
  'PH': '필리핀',
  'JP': '일본',
  'TW': '대만',
  'KR': '한국',
  'US': '미국',
  'GB': '영국',
  'AU': '호주'
};

export const COUNTRY_FLAGS: Record<string, string> = {
  'TH': '🇹🇭',
  'VN': '🇻🇳',
  'MY': '🇲🇾', 
  'SG': '🇸🇬',
  'ID': '🇮🇩',
  'PH': '🇵🇭',
  'JP': '🇯🇵',
  'TW': '🇹🇼',
  'KR': '🇰🇷',
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'AU': '🇦🇺'
};