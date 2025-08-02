/**
 * DINO v2.0 - Demo Passport Data
 * Sample data for multiple passport support
 */

import { Passport } from '@/types/passport';

export const DEMO_PASSPORTS: Passport[] = [
  {
    id: 'passport-001',
    userId: 'demo-user',
    countryCode: 'KR',
    countryName: '대한민국',
    passportNumber: 'M12345678',
    issueDate: new Date('2020-03-15'),
    expiryDate: new Date('2030-03-14'),
    isActive: true,
    isPrimary: true,
    visaFreeCountries: [
      'JP', 'SG', 'MY', 'TH', 'PH', 'TW', 'HK', 'MO', 'ID', 'VN', 'LA', 'KH', 'MM', 'BN',
      'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'GR',
      'PL', 'CZ', 'HU', 'SK', 'SI', 'HR', 'EE', 'LV', 'LT', 'MT', 'CY', 'LU', 'RO', 'BG',
      'US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'CL', 'AR', 'BR', 'MX', 'PE', 'CO', 'EC', 'UY',
      'IL', 'TR', 'AE', 'QA', 'BH', 'KW', 'OM', 'JO', 'LB', 'GE', 'AM', 'KZ', 'KG', 'UZ',
      'MN', 'FK', 'GS', 'PN', 'SH', 'TC', 'VG', 'MS', 'AI', 'KY', 'BM', 'GI', 'JE', 'GG',
      'IM', 'FO', 'GL', 'AW', 'CW', 'SX', 'BQ', 'SR', 'GY', 'GF', 'PF', 'NC', 'WF', 'PM'
    ],
    lastUpdated: new Date('2025-08-01'),
    notes: '주요 여행용 여권. 대부분의 국가에서 무비자 입국 가능.',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-08-01')
  },
  {
    id: 'passport-002',
    userId: 'demo-user',
    countryCode: 'US',
    countryName: '미국',
    passportNumber: '123456789',
    issueDate: new Date('2019-06-10'),
    expiryDate: new Date('2029-06-09'),
    isActive: true,
    isPrimary: false,
    visaFreeCountries: [
      'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'JM', 'HT', 'DO', 'PR',
      'VG', 'AI', 'AG', 'KN', 'DM', 'LC', 'VC', 'GD', 'BB', 'TT', 'GY', 'SR', 'GF', 'BR',
      'AR', 'CL', 'UY', 'PY', 'BO', 'PE', 'EC', 'CO', 'VE', 'GB', 'IE', 'IS', 'NO', 'SE',
      'FI', 'DK', 'DE', 'NL', 'BE', 'LU', 'FR', 'CH', 'AT', 'LI', 'IT', 'SM', 'VA', 'MT',
      'ES', 'AD', 'PT', 'MC', 'GR', 'CY', 'TR', 'BG', 'RO', 'MD', 'HU', 'SK', 'CZ', 'PL',
      'LT', 'LV', 'EE', 'SI', 'HR', 'BA', 'ME', 'RS', 'MK', 'AL', 'KS', 'JP', 'KR', 'SG',
      'BN', 'MY', 'TH', 'PH', 'ID', 'TL', 'AU', 'NZ', 'FJ', 'PW', 'FM', 'MH', 'KI', 'NR',
      'TO', 'WS', 'VU', 'SB', 'TV', 'PG', 'NC', 'PF', 'CK', 'NU', 'TK', 'IL', 'JO', 'AE',
      'QA', 'BH', 'KW', 'OM', 'SA', 'GE', 'AM', 'AZ', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'MN',
      'TW', 'HK', 'MO', 'MV', 'LK', 'NP', 'BT', 'LA', 'KH', 'VN', 'MM', 'BD', 'IN', 'PK'
    ],
    lastUpdated: new Date('2025-08-01'),
    notes: '미국 여권으로 중국 장기 비자 신청 시 유리함. 10년 다중 비자 가능.',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-08-01')
  }
];

// Generate additional passport for testing
export function generateDemoPassport(countryCode: string, countryName: string): Passport {
  const now = new Date();
  const issueDate = new Date(now.getTime() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000); // 0-5 years ago
  const expiryDate = new Date(issueDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years validity

  return {
    id: `passport-${Date.now()}`,
    userId: 'demo-user',
    countryCode,
    countryName,
    passportNumber: generatePassportNumber(countryCode),
    issueDate,
    expiryDate,
    isActive: true,
    isPrimary: false,
    visaFreeCountries: generateVisaFreeCountries(countryCode),
    lastUpdated: now,
    notes: `${countryName} 여권`,
    createdAt: now,
    updatedAt: now
  };
}

// Generate realistic passport numbers based on country format
function generatePassportNumber(countryCode: string): string {
  const formats: Record<string, () => string> = {
    'KR': () => 'M' + Math.random().toString().slice(2, 10),
    'US': () => Math.random().toString().slice(2, 11),
    'CA': () => 'AB' + Math.random().toString().slice(2, 9),
    'AU': () => 'A' + Math.random().toString().slice(2, 9),
    'UK': () => Math.random().toString().slice(2, 11),
    'DE': () => 'C' + Math.random().toString().slice(2, 9).toUpperCase(),
    'JP': () => 'TH' + Math.random().toString().slice(2, 9),
    'SG': () => 'E' + Math.random().toString().slice(2, 9) + 'P',
  };

  const generator = formats[countryCode] || (() => Math.random().toString().slice(2, 11));
  return generator();
}

// Generate visa-free countries list based on passport power
function generateVisaFreeCountries(countryCode: string): string[] {
  // Simplified mapping - in real app, this would come from a comprehensive database
  const baseCounts: Record<string, number> = {
    'SG': 195, 'KR': 192, 'DE': 191, 'JP': 189, 'US': 182, 'CA': 183,
    'AU': 184, 'UK': 187, 'FR': 188, 'IT': 191, 'ES': 191, 'NL': 188
  };

  const count = baseCounts[countryCode] || 100;
  
  // Return a mock list (in reality, this would be country-specific)
  const allCountries = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];

  // Exclude the passport's own country and randomly select countries
  const availableCountries = allCountries.filter(c => c !== countryCode);
  const shuffled = availableCountries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, availableCountries.length));
}