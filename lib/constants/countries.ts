/**
 * DINO v2.0 - Country Constants
 * Country codes and names mapping
 */

export const countryNames: Record<string, string> = {
  // Asia
  'KR': '대한민국',
  'JP': '일본',
  'CN': '중국',
  'TH': '태국',
  'VN': '베트남',
  'SG': '싱가포르',
  'MY': '말레이시아',
  'ID': '인도네시아',
  'PH': '필리핀',
  'IN': '인도',
  'TW': '대만',
  'HK': '홍콩',
  
  // Europe
  'DE': '독일',
  'FR': '프랑스',
  'IT': '이탈리아',
  'ES': '스페인',
  'PT': '포르투갈',
  'NL': '네덜란드',
  'BE': '벨기에',
  'AT': '오스트리아',
  'CH': '스위스',
  'SE': '스웨덴',
  'NO': '노르웨이',
  'DK': '덴마크',
  'FI': '핀란드',
  'PL': '폴란드',
  'CZ': '체코',
  'HU': '헝가리',
  'GR': '그리스',
  'IE': '아일랜드',
  
  // Americas
  'US': '미국',
  'CA': '캐나다',
  'MX': '멕시코',
  'BR': '브라질',
  'AR': '아르헨티나',
  'CL': '칠레',
  'PE': '페루',
  'CO': '콜롬비아',
  
  // Oceania
  'AU': '호주',
  'NZ': '뉴질랜드',
  
  // Middle East
  'AE': '아랍에미리트',
  'SA': '사우디아라비아',
  'IL': '이스라엘',
  'TR': '터키',
  
  // Africa
  'ZA': '남아프리카공화국',
  'EG': '이집트',
  'MA': '모로코',
  'KE': '케냐',
  
  // Others
  'GB': '영국',
  'RU': '러시아',
  'UA': '우크라이나',
};

// ISO 3166-1 alpha-2 country codes
export const countryCodes = Object.keys(countryNames);

// Schengen Area countries
export const schengenCountries = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH'
];

// Countries with visa-free access for Korean passport holders
export const visaFreeForKorea = [
  // Europe (Schengen)
  ...schengenCountries,
  // Americas
  'US', 'CA', 'BR', 'AR', 'CL', 'PE', 'CO', 'MX',
  // Asia-Pacific
  'JP', 'TH', 'SG', 'MY', 'AU', 'NZ',
  // Others
  'GB', 'IE', 'IL', 'AE', 'MA', 'ZA'
];

// Get country name by code
export function getCountryName(code: string): string {
  return countryNames[code] || code;
}

// Check if country is in Schengen Area
export function isSchengenCountry(code: string): boolean {
  return schengenCountries.includes(code);
}