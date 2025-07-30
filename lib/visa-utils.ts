import type { VisaType } from './visa-database';

// Country flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
  // Asia-Pacific
  KR: '🇰🇷',
  JP: '🇯🇵',
  CN: '🇨🇳',
  IN: '🇮🇳',
  TH: '🇹🇭',
  VN: '🇻🇳',
  SG: '🇸🇬',
  MY: '🇲🇾',
  ID: '🇮🇩',
  PH: '🇵🇭',
  TW: '🇹🇼',
  HK: '🇭🇰',
  AU: '🇦🇺',
  NZ: '🇳🇿',

  // Europe
  FR: '🇫🇷',
  DE: '🇩🇪',
  GB: '🇬🇧',
  ES: '🇪🇸',
  IT: '🇮🇹',
  NL: '🇳🇱',
  CH: '🇨🇭',
  AT: '🇦🇹',
  BE: '🇧🇪',
  DK: '🇩🇰',
  FI: '🇫🇮',
  NO: '🇳🇴',
  SE: '🇸🇪',
  PL: '🇵🇱',
  CZ: '🇨🇿',
  HU: '🇭🇺',
  PT: '🇵🇹',
  GR: '🇬🇷',
  IE: '🇮🇪',
  IS: '🇮🇸',
  RU: '🇷🇺',
  UA: '🇺🇦',
  TR: '🇹🇷',
  HR: '🇭🇷',
  SI: '🇸🇮',
  SK: '🇸🇰',
  BG: '🇧🇬',
  RO: '🇷🇴',
  EE: '🇪🇪',
  LV: '🇱🇻',
  LT: '🇱🇹',
  LU: '🇱🇺',
  MT: '🇲🇹',
  CY: '🇨🇾',

  // Americas
  US: '🇺🇸',
  CA: '🇨🇦',
  MX: '🇲🇽',
  BR: '🇧🇷',
  AR: '🇦🇷',
  CL: '🇨🇱',
  CO: '🇨🇴',
  PE: '🇵🇪',
  UY: '🇺🇾',
  EC: '🇪🇨',
  VE: '🇻🇪',
  BO: '🇧🇴',
  PY: '🇵🇾',
  CR: '🇨🇷',
  GT: '🇬🇹',
  PA: '🇵🇦',
  CU: '🇨🇺',
  JM: '🇯🇲',

  // Middle East & Africa
  AE: '🇦🇪',
  SA: '🇸🇦',
  IL: '🇮🇱',
  JO: '🇯🇴',
  LB: '🇱🇧',
  QA: '🇶🇦',
  KW: '🇰🇼',
  BH: '🇧🇭',
  OM: '🇴🇲',
  EG: '🇪🇬',
  MA: '🇲🇦',
  TN: '🇹🇳',
  ZA: '🇿🇦',
  KE: '🇰🇪',
  TZ: '🇹🇿',
  NG: '🇳🇬',
  GH: '🇬🇭',
  ET: '🇪🇹',
  UG: '🇺🇬',
  RW: '🇷🇼',

  // Other
  OTHER: '🌍',
};

// Visa type icons mapping
const VISA_TYPE_ICONS: Record<VisaType, string> = {
  tourist: '🏖️',
  business: '💼',
  student: '🎓',
  work: '🏢',
  transit: '✈️',
  'digital-nomad': '💻',
  investor: '💰',
  'working-holiday': '🎒',
  spouse: '💒',
  medical: '🏥',
};

// Visa type colors
const VISA_TYPE_COLORS: Record<VisaType, string> = {
  tourist: 'bg-blue-100 text-blue-800 border-blue-200',
  business: 'bg-purple-100 text-purple-800 border-purple-200',
  student: 'bg-green-100 text-green-800 border-green-200',
  work: 'bg-orange-100 text-orange-800 border-orange-200',
  transit: 'bg-gray-100 text-gray-800 border-gray-200',
  'digital-nomad': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  investor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'working-holiday': 'bg-pink-100 text-pink-800 border-pink-200',
  spouse: 'bg-red-100 text-red-800 border-red-200',
  medical: 'bg-teal-100 text-teal-800 border-teal-200',
};

/**
 * Get country flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || '🏳️';
}

/**
 * Get visa type icon
 */
export function getVisaTypeIcon(visaType: VisaType): string {
  return VISA_TYPE_ICONS[visaType] || '📄';
}

/**
 * Get visa type color classes
 */
export function getVisaTypeColor(visaType: VisaType): string {
  return (
    VISA_TYPE_COLORS[visaType] || 'bg-gray-100 text-gray-800 border-gray-200'
  );
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: string): string {
  // Simple formatting - in a real app, you'd want proper i18n
  return amount;
}

/**
 * Calculate visa processing time in days
 */
export function parseProcessingTime(timeString: string): number {
  const match = timeString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Get visa requirement urgency level
 */
export function getVisaUrgency(
  processingTime: string,
  travelDate?: Date
): 'low' | 'medium' | 'high' {
  if (!travelDate) return 'low';

  const days = parseProcessingTime(processingTime);
  const daysUntilTravel = Math.floor(
    (travelDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilTravel <= days) return 'high';
  if (daysUntilTravel <= days * 2) return 'medium';
  return 'low';
}

/**
 * Check if visa is required for a specific passport-destination combination
 */
export function isVisaRequired(
  visaType: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'embassy'
): boolean {
  return visaType !== 'visa-free';
}

/**
 * Get difficulty level of visa process
 */
export function getVisaDifficulty(
  visaType: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'embassy'
): 'easy' | 'medium' | 'hard' {
  switch (visaType) {
    case 'visa-free':
      return 'easy';
    case 'visa-on-arrival':
    case 'evisa':
      return 'medium';
    case 'embassy':
      return 'hard';
    default:
      return 'medium';
  }
}

/**
 * Get popular destinations for a specific passport
 */
export function getPopularDestinations(passportCountry: string): string[] {
  const popularByPassport: Record<string, string[]> = {
    KR: ['JP', 'TH', 'VN', 'US', 'FR', 'DE', 'ES', 'IT', 'GB', 'AU'],
    US: ['CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'JP', 'AU', 'BR'],
    JP: ['KR', 'TH', 'TW', 'US', 'FR', 'GB', 'IT', 'ES', 'DE', 'AU'],
    GB: ['FR', 'ES', 'IT', 'DE', 'US', 'TH', 'AU', 'NZ', 'JP', 'SG'],
    DE: ['FR', 'ES', 'IT', 'GB', 'US', 'TH', 'JP', 'AU', 'CA', 'AT'],
    CN: ['TH', 'JP', 'KR', 'SG', 'MY', 'VN', 'US', 'AU', 'NZ', 'FR'],
    IN: ['TH', 'SG', 'MY', 'AE', 'US', 'GB', 'AU', 'NZ', 'CA', 'FR'],
  };

  return (
    popularByPassport[passportCountry] || [
      'US',
      'GB',
      'FR',
      'DE',
      'JP',
      'AU',
      'CA',
      'TH',
      'SG',
      'IT',
    ]
  );
}

/**
 * Search countries by name or code
 */
export function searchCountries(
  query: string,
  countries: Record<string, any>
): Array<{ code: string; data: any }> {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];

  return Object.entries(countries)
    .filter(
      ([code, data]) =>
        code.toLowerCase().includes(searchTerm) ||
        data.name.toLowerCase().includes(searchTerm) ||
        data.region.toLowerCase().includes(searchTerm) ||
        (data.capital && data.capital.toLowerCase().includes(searchTerm))
    )
    .map(([code, data]) => ({ code, data }))
    .slice(0, 20); // Limit results
}

/**
 * Sort countries by relevance for a specific passport
 */
export function sortCountriesByRelevance(
  countries: Array<{ code: string; data: any }>,
  passportCountry: string
): Array<{ code: string; data: any }> {
  const popular = getPopularDestinations(passportCountry);

  return countries.sort((a, b) => {
    const aPopular = popular.indexOf(a.code);
    const bPopular = popular.indexOf(b.code);

    // Popular destinations first
    if (aPopular !== -1 && bPopular === -1) return -1;
    if (bPopular !== -1 && aPopular === -1) return 1;
    if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;

    // Then by alphabetical order
    return a.data.name.localeCompare(b.data.name);
  });
}

/**
 * Get travel seasons and best time to visit
 */
export function getTravelSeasons(countryCode: string): {
  peak: string[];
  shoulder: string[];
  low: string[];
  bestTime: string;
} {
  // This is a simplified version - in a real app, you'd have comprehensive seasonal data
  const seasonData: Record<
    string,
    { peak: string[]; shoulder: string[]; low: string[]; bestTime: string }
  > = {
    TH: {
      peak: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      shoulder: ['Apr', 'May', 'Oct'],
      low: ['Jun', 'Jul', 'Aug', 'Sep'],
      bestTime: 'November to March (cool and dry season)',
    },
    JP: {
      peak: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
      shoulder: ['Jun', 'Sep', 'Dec'],
      low: ['Jan', 'Feb', 'Jul', 'Aug'],
      bestTime: 'April-May (spring) and October-November (autumn)',
    },
    FR: {
      peak: ['Jun', 'Jul', 'Aug'],
      shoulder: ['Apr', 'May', 'Sep', 'Oct'],
      low: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      bestTime: 'April-June and September-October',
    },
    US: {
      peak: ['Jun', 'Jul', 'Aug'],
      shoulder: ['Apr', 'May', 'Sep', 'Oct'],
      low: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      bestTime: 'Varies by region - generally May-September',
    },
  };

  return (
    seasonData[countryCode] || {
      peak: ['Jun', 'Jul', 'Aug'],
      shoulder: ['Apr', 'May', 'Sep', 'Oct'],
      low: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      bestTime: 'Research specific regional climate patterns',
    }
  );
}

/**
 * Generate visa checklist based on requirements
 */
export function generateVisaChecklist(
  visaType: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'embassy',
  requiredDocuments: string[],
  maxStay: string,
  fee: string
): Array<{ task: string; completed: boolean; urgent: boolean }> {
  const checklist: Array<{
    task: string;
    completed: boolean;
    urgent: boolean;
  }> = [];

  switch (visaType) {
    case 'visa-free':
      checklist.push(
        {
          task: 'Check passport validity (6+ months recommended)',
          completed: false,
          urgent: true,
        },
        { task: 'Book return ticket', completed: false, urgent: false },
        {
          task: 'Confirm maximum stay period: ' + maxStay,
          completed: false,
          urgent: false,
        }
      );
      break;

    case 'visa-on-arrival':
      checklist.push(
        {
          task: 'Check passport validity (6+ months)',
          completed: false,
          urgent: true,
        },
        {
          task: 'Prepare cash for visa fee: ' + fee,
          completed: false,
          urgent: true,
        },
        { task: 'Book return ticket', completed: false, urgent: false },
        { task: 'Print hotel reservations', completed: false, urgent: false }
      );
      break;

    case 'evisa':
      checklist.push(
        { task: 'Apply for eVisa online', completed: false, urgent: true },
        { task: 'Upload required documents', completed: false, urgent: true },
        { task: 'Pay visa fee: ' + fee, completed: false, urgent: true },
        { task: 'Print eVisa approval', completed: false, urgent: true }
      );
      break;

    case 'embassy':
      checklist.push(
        { task: 'Book embassy appointment', completed: false, urgent: true },
        {
          task: 'Complete visa application form',
          completed: false,
          urgent: true,
        },
        {
          task: 'Prepare all required documents',
          completed: false,
          urgent: true,
        },
        { task: 'Pay visa fee: ' + fee, completed: false, urgent: true },
        {
          task: 'Submit application at embassy',
          completed: false,
          urgent: true,
        },
        { task: 'Collect passport with visa', completed: false, urgent: true }
      );
      break;
  }

  // Add document-specific tasks
  requiredDocuments.forEach(doc => {
    checklist.push({
      task: 'Prepare: ' + doc,
      completed: false,
      urgent:
        doc.toLowerCase().includes('passport') ||
        doc.toLowerCase().includes('photo'),
    });
  });

  return checklist;
}

/**
 * Format visa duration/stay period
 */
export function formatStayPeriod(stayPeriod: string): {
  duration: string;
  type: 'days' | 'months' | 'years';
  restrictions?: string;
} {
  const daysMatch = stayPeriod.match(/(\d+)\s*days?/i);
  const monthsMatch = stayPeriod.match(/(\d+)\s*months?/i);
  const yearsMatch = stayPeriod.match(/(\d+)\s*years?/i);

  if (yearsMatch) {
    return {
      duration: yearsMatch[1],
      type: 'years',
      restrictions: stayPeriod.includes('180')
        ? 'Schengen 90/180 rule applies'
        : undefined,
    };
  }

  if (monthsMatch) {
    return {
      duration: monthsMatch[1],
      type: 'months',
      restrictions: stayPeriod.includes('180')
        ? 'Schengen 90/180 rule applies'
        : undefined,
    };
  }

  if (daysMatch) {
    return {
      duration: daysMatch[1],
      type: 'days',
      restrictions: stayPeriod.includes('180')
        ? 'Schengen 90/180 rule applies'
        : undefined,
    };
  }

  return {
    duration: stayPeriod,
    type: 'days',
  };
}
