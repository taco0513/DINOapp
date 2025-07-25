export interface CountryInfo {
  code: string
  name: string
  flag: string
  isSchengen: boolean
  visaFree?: {
    US?: number
    UK?: number
    EU?: number
    CA?: number
    AU?: number
    JP?: number
  }
}

export const COUNTRIES: CountryInfo[] = [
  // Schengen Countries
  { code: 'AT', name: 'Austria', flag: '🇦🇹', isSchengen: true },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', isSchengen: true },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', isSchengen: true },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', isSchengen: true },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', isSchengen: true },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', isSchengen: true },
  { code: 'FR', name: 'France', flag: '🇫🇷', isSchengen: true },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', isSchengen: true },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', isSchengen: true },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', isSchengen: true },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', isSchengen: true },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', isSchengen: true },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', isSchengen: true },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', isSchengen: true },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', isSchengen: true },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', isSchengen: true },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', isSchengen: true },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', isSchengen: true },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', isSchengen: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', isSchengen: true },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', isSchengen: true },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', isSchengen: true },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', isSchengen: true },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', isSchengen: true },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', isSchengen: true },

  // Popular Digital Nomad Destinations (Non-Schengen)
  { code: 'US', name: 'United States', flag: '🇺🇸', isSchengen: false },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', isSchengen: false },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', isSchengen: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', isSchengen: false },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', isSchengen: false },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', isSchengen: false },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', isSchengen: false },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', isSchengen: false },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', isSchengen: false },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', isSchengen: false },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', isSchengen: false },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', isSchengen: false },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', isSchengen: false },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', isSchengen: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', isSchengen: false },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', isSchengen: false },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', isSchengen: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', isSchengen: false },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', isSchengen: false },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', isSchengen: false },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', isSchengen: false },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', isSchengen: false },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', isSchengen: false },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', isSchengen: false },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', isSchengen: false },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', isSchengen: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', isSchengen: false },
  { code: 'CN', name: 'China', flag: '🇨🇳', isSchengen: false },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', isSchengen: false },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', isSchengen: false },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', isSchengen: false },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', isSchengen: false },
]

export const VISA_TYPES = [
  'Tourist',
  'Business', 
  'Student',
  'Working Holiday',
  'Digital Nomad',
  'Transit',
  'Work',
  'Investor',
  'Retirement',
  'Volunteer',
  'Visa Run',
  'Extension',
  'Spouse',
  'Medical'
] as const

export const PASSPORT_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'EU', name: 'European Union' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'OTHER', name: 'Other' }
] as const

export function getCountryByName(name: string): CountryInfo | undefined {
  return COUNTRIES.find(country => country.name === name)
}

export function getSchengenCountries(): CountryInfo[] {
  return COUNTRIES.filter(country => country.isSchengen)
}

export function getNonSchengenCountries(): CountryInfo[] {
  return COUNTRIES.filter(country => !country.isSchengen)
}