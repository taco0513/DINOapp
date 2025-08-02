/**
 * DINO v2.0 - Country Data
 * Comprehensive country information with visa policies
 */

import type { Country } from '@/types/visa';

/**
 * Complete list of countries with visa information
 */
export const COUNTRIES: readonly Country[] = [
  // Asia Pacific - East Asia
  {
    code: 'KR',
    name: '대한민국',
    nameEn: 'South Korea',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: [
      // Schengen Area (29 countries) - 90 days
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 
      'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // Asia Pacific
      'JP', 'SG', 'MY', 'TH', 'PH', 'TW', 'HK', 'MO', 'BN', 'ID', 'LA', 'MV', 'MN', 'MM', 'NP',
      // Americas  
      'US', 'CA', 'AR', 'BR', 'CL', 'CO', 'CR', 'EC', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'UY', 'VE',
      // Oceania Major
      'AU', 'NZ',
      // Europe (Non-Schengen)
      'GB', 'AL', 'AD', 'BA', 'MC', 'ME', 'MK', 'RS', 'SM', 'VA', 'XK',
      // Oceania
      'FJ', 'KI', 'MH', 'FM', 'NR', 'PW', 'WS', 'SB', 'TO', 'TV', 'VU',
      // Africa
      'BW', 'LS', 'MU', 'MA', 'NA', 'ZA', 'SZ', 'TN', 'ZM',
      // Middle East
      'IL', 'OM', 'QA', 'AE', 'YE'
    ],
    evisaAvailable: ['IN', 'VN', 'KH', 'LK', 'MM', 'TR', 'EG', 'KE', 'TZ', 'UG', 'ZW']
  },
  {
    code: 'JP',
    name: '일본',
    nameEn: 'Japan',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'SG', 'MY', 'TH', 'PH', 'TW', 'HK', 'MO'],
    evisaAvailable: ['IN', 'VN', 'KH', 'CN']
  },
  {
    code: 'CN',
    name: '중국',
    nameEn: 'China',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['SG', 'MY', 'TH'],
    evisaAvailable: ['KR', 'JP', 'IN', 'VN']
  },
  {
    code: 'SG',
    name: '싱가포르',
    nameEn: 'Singapore',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'MY', 'TH', 'PH', 'ID', 'VN', 'TW', 'HK', 'MO'],
    evisaAvailable: ['IN', 'CN', 'MM']
  },
  {
    code: 'TH',
    name: '태국',
    nameEn: 'Thailand',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'PH', 'ID', 'VN', 'TW', 'HK', 'MO'],
    evisaAvailable: ['IN', 'CN', 'MM', 'KH']
  },
  {
    code: 'VN',
    name: '베트남',
    nameEn: 'Vietnam',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['SG', 'MY', 'TH', 'PH', 'ID'],
    evisaAvailable: ['KR', 'JP', 'CN', 'IN']
  },
  
  // Europe - Schengen Area
  {
    code: 'DE',
    name: '독일',
    nameEn: 'Germany',
    region: 'Europe',
    isSchengen: true,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ'],
    evisaAvailable: []
  },
  {
    code: 'FR',
    name: '프랑스',
    nameEn: 'France',
    region: 'Europe',
    isSchengen: true,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ'],
    evisaAvailable: []
  },
  {
    code: 'IT',
    name: '이탈리아',
    nameEn: 'Italy',
    region: 'Europe',
    isSchengen: true,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ'],
    evisaAvailable: []
  },
  {
    code: 'ES',
    name: '스페인',
    nameEn: 'Spain',
    region: 'Europe',
    isSchengen: true,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ'],
    evisaAvailable: []
  },
  {
    code: 'NL',
    name: '네덜란드',
    nameEn: 'Netherlands',
    region: 'Europe',
    isSchengen: true,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ'],
    evisaAvailable: []
  },
  
  // Europe - Non-Schengen
  {
    code: 'GB',
    name: '영국',
    nameEn: 'United Kingdom',
    region: 'Europe',
    isSchengen: false,
    visaFree: [
      // ETA required from 2024
      'KR', 'JP', 'SG', 'MY', 'US', 'CA', 'AU', 'NZ',
      // EU countries (post-Brexit)
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
      'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // Other visa-free
      'AD', 'CL', 'IS', 'LI', 'MC', 'NO', 'SM', 'CH', 'TW'
    ],
    evisaAvailable: []
  },
  
  // Americas
  {
    code: 'US',
    name: '미국',
    nameEn: 'United States',
    region: 'Americas',
    isSchengen: false,
    visaFree: [
      // VWP Countries (Visa Waiver Program) - ESTA required
      'KR', 'JP', 'SG', 'CA', 'AU', 'NZ', 'GB', 
      // Schengen VWP countries
      'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT',
      'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'ES', 'SE', 'CH',
      // Other VWP
      'AD', 'CL', 'HR', 'IE', 'MC', 'SM', 'TW'
    ],
    evisaAvailable: []
  },
  {
    code: 'CA',
    name: '캐나다',
    nameEn: 'Canada',
    region: 'Americas',
    isSchengen: false,
    visaFree: [
      // eTA required countries
      'KR', 'JP', 'SG', 'AU', 'NZ', 'GB',
      // Schengen countries
      'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT',
      'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'ES', 'SE', 'CH',
      // Other visa-free
      'AD', 'CL', 'HR', 'IE', 'MC', 'SM', 'TW'
    ],
    evisaAvailable: []
  },
  
  // Oceania
  {
    code: 'AU',
    name: '호주',
    nameEn: 'Australia',
    region: 'Oceania',
    isSchengen: false,
    visaFree: [
      // ETA/eVisitor required
      'KR', 'JP', 'SG', 'MY', 'US', 'CA', 'GB', 'NZ',
      // European countries
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
      'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // Other
      'AD', 'IS', 'LI', 'MC', 'NO', 'SM', 'CH', 'TW'
    ],
    evisaAvailable: []
  },
  {
    code: 'NZ',
    name: '뉴질랜드',
    nameEn: 'New Zealand',
    region: 'Oceania',
    isSchengen: false,
    visaFree: [
      // NZeTA required
      'KR', 'JP', 'SG', 'MY', 'US', 'CA', 'GB', 'AU',
      // European countries
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
      'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // Other
      'AD', 'IS', 'LI', 'MC', 'NO', 'SM', 'CH', 'TW'
    ],
    evisaAvailable: []
  },

  // Southeast Asia
  {
    code: 'MY',
    name: '말레이시아',
    nameEn: 'Malaysia',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'SG', 'TH', 'PH', 'ID', 'VN', 'BN', 'KH', 'LA'],
    evisaAvailable: ['CN', 'IN', 'MM', 'BD', 'PK']
  },
  {
    code: 'PH',
    name: '필리핀',
    nameEn: 'Philippines',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'TH', 'ID', 'VN', 'BN', 'KH', 'LA'],
    evisaAvailable: ['CN', 'IN', 'TW']
  },
  {
    code: 'ID',
    name: '인도네시아',
    nameEn: 'Indonesia',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'TH', 'PH', 'VN', 'BN', 'KH', 'LA'],
    evisaAvailable: ['CN', 'IN', 'TW', 'US', 'CA', 'GB', 'AU']
  },
  {
    code: 'IN',
    name: '인도',
    nameEn: 'India',
    region: 'Asia Pacific',
    isSchengen: false,
    visaFree: ['BT', 'NP', 'MV'],
    evisaAvailable: ['KR', 'JP', 'CN', 'SG', 'MY', 'TH', 'ID', 'VN', 'US', 'CA', 'GB', 'AU', 'NZ']
  },

  // South America
  {
    code: 'BR',
    name: '브라질',
    nameEn: 'Brazil',
    region: 'Americas',
    isSchengen: false,
    visaFree: ['KR', 'AR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO'],
    evisaAvailable: ['US', 'CA', 'AU', 'JP']
  },
  {
    code: 'AR',
    name: '아르헨티나',
    nameEn: 'Argentina',
    region: 'Americas',
    isSchengen: false,
    visaFree: ['KR', 'BR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO'],
    evisaAvailable: ['CN', 'IN', 'RU']
  },
  {
    code: 'CL',
    name: '칠레',
    nameEn: 'Chile',
    region: 'Americas',
    isSchengen: false,
    visaFree: ['KR', 'BR', 'AR', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO'],
    evisaAvailable: ['CN', 'IN']
  },
  {
    code: 'CO',
    name: '콜롬비아',
    nameEn: 'Colombia',
    region: 'Americas',
    isSchengen: false,
    visaFree: ['KR', 'BR', 'AR', 'CL', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO'],
    evisaAvailable: ['CN', 'IN', 'VN']
  },
  {
    code: 'PE',
    name: '페루',
    nameEn: 'Peru',
    region: 'Americas',
    isSchengen: false,
    visaFree: ['KR', 'BR', 'AR', 'CL', 'CO', 'EC', 'PY', 'UY', 'VE', 'BO'],
    evisaAvailable: ['CN', 'IN']
  },

  // Africa
  {
    code: 'ZA',
    name: '남아프리카공화국',
    nameEn: 'South Africa',
    region: 'Africa',
    isSchengen: false,
    visaFree: ['KR', 'BW', 'LS', 'MW', 'MZ', 'NA', 'SZ', 'TZ', 'ZM', 'ZW'],
    evisaAvailable: ['CN', 'IN', 'KE', 'NG']
  },
  {
    code: 'EG',
    name: '이집트',
    nameEn: 'Egypt',
    region: 'Africa',
    isSchengen: false,
    visaFree: ['SA', 'AE', 'KW', 'BH', 'OM', 'JO'],
    evisaAvailable: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'CN', 'IN']
  },
  {
    code: 'MA',
    name: '모로코',
    nameEn: 'Morocco',
    region: 'Africa',
    isSchengen: false,
    visaFree: ['KR', 'MY', 'SG', 'TH', 'ID', 'PH', 'TR', 'TN', 'DZ'],
    evisaAvailable: ['CN', 'IN', 'RU']
  },
  {
    code: 'KE',
    name: '케냐',
    nameEn: 'Kenya',
    region: 'Africa',
    isSchengen: false,
    visaFree: ['BW', 'ET', 'GH', 'LS', 'MW', 'MU', 'RW', 'ZA', 'UG', 'TZ'],
    evisaAvailable: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'CN', 'IN']
  },
  {
    code: 'ET',
    name: '에티오피아',
    nameEn: 'Ethiopia',
    region: 'Africa',
    isSchengen: false,
    visaFree: ['KE', 'DJ'],
    evisaAvailable: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'CN', 'IN']
  },

  // Middle East
  {
    code: 'AE',
    name: '아랍에미리트',
    nameEn: 'United Arab Emirates',
    region: 'Middle East',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'SG', 'MY', 'SA', 'KW', 'BH', 'OM', 'QA'],
    evisaAvailable: ['CN', 'IN', 'PK', 'BD']
  },
  {
    code: 'TR',
    name: '터키',
    nameEn: 'Turkey',
    region: 'Europe',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'MY', 'SG', 'TH', 'QA', 'AZ', 'GE'],
    evisaAvailable: ['CN', 'IN', 'US', 'CA', 'GB', 'AU']
  },
  {
    code: 'IL',
    name: '이스라엘',
    nameEn: 'Israel',
    region: 'Middle East',
    isSchengen: false,
    visaFree: ['KR', 'US', 'CA', 'GB', 'AU', 'NZ', 'JP', 'SG'],
    evisaAvailable: ['CN', 'IN', 'RU', 'UA']
  },
  {
    code: 'JO',
    name: '요르단',
    nameEn: 'Jordan',
    region: 'Middle East',
    isSchengen: false,
    visaFree: ['SA', 'AE', 'KW', 'BH', 'OM', 'QA', 'EG', 'LB'],
    evisaAvailable: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'CN', 'IN']
  },

  // Additional Oceania
  {
    code: 'FJ',
    name: '피지',
    nameEn: 'Fiji',
    region: 'Oceania',
    isSchengen: false,
    visaFree: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'MY'],
    evisaAvailable: ['CN', 'IN']
  },

  // Additional Europe (Non-Schengen)
  {
    code: 'RU',
    name: '러시아',
    nameEn: 'Russia',
    region: 'Europe',
    isSchengen: false,
    visaFree: ['BY', 'KZ', 'AM', 'AZ', 'KG', 'MD', 'TJ', 'UZ'],
    evisaAvailable: ['KR', 'JP', 'CN', 'IN', 'IR', 'TR']
  },
  {
    code: 'UA',
    name: '우크라이나',
    nameEn: 'Ukraine',
    region: 'Europe',
    isSchengen: false,
    visaFree: ['GE', 'MD', 'BY', 'AM', 'AZ', 'KZ', 'KG', 'UZ'],
    evisaAvailable: ['KR', 'JP', 'US', 'CA', 'GB', 'AU', 'CN', 'IN']
  }
] as const;

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code);
}

/**
 * Get countries by region
 */
export function getCountriesByRegion(region: string): readonly Country[] {
  return COUNTRIES.filter(country => country.region === region);
}

/**
 * Get all regions
 */
export function getRegions(): readonly string[] {
  const regions = new Set(COUNTRIES.map(country => country.region));
  return Array.from(regions).sort();
}

/**
 * Search countries by name
 */
export function searchCountries(query: string): readonly Country[] {
  const searchTerm = query.toLowerCase();
  return COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchTerm) ||
    country.nameEn.toLowerCase().includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm)
  );
}

/**
 * Popular passport countries (for Korean users)
 */
export const POPULAR_PASSPORTS = [
  'KR', // 대한민국
  'JP', // 일본
  'US', // 미국
  'SG', // 싱가포르
  'DE', // 독일
  'GB', // 영국
  'CA', // 캐나다
  'AU', // 호주
  'CN', // 중국
  'FR'  // 프랑스
] as const;