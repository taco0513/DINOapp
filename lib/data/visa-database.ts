/**
 * 78-Country Visa Database for Digital Nomads
 * Comprehensive visa regulations, requirements, and processing information
 */

export interface VisaRequirement {
  /** Country ISO code */
  countryCode: string;
  /** Country name in multiple languages */
  countryName: {
    en: string;
    ko: string;
    es?: string;
    fr?: string;
  };
  /** Capital city */
  capital: string;
  /** Currency information */
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  /** Timezone information */
  timezone: {
    primary: string;
    offset: string;
    dst: boolean;
  };
  /** Visa requirements for different passport holders */
  visaRequirements: {
    /** Passport country ISO code */
    passportCountry: string;
    /** Visa requirement type */
    requirement: 'visa_free' | 'visa_on_arrival' | 'evisa' | 'visa_required';
    /** Maximum stay duration in days */
    maxStayDays: number;
    /** Stay period (e.g., per 180 days, per year) */
    stayPeriod?: string;
    /** Processing time for visa applications */
    processingTime?: {
      min: number;
      max: number;
      unit: 'days' | 'weeks';
    };
    /** Cost of visa application */
    cost?: {
      amount: number;
      currency: string;
      notes?: string;
    };
    /** Additional requirements */
    requirements?: string[];
    /** Special notes or conditions */
    notes?: string;
    /** Last updated date */
    lastUpdated: string;
  }[];
  /** Digital nomad specific information */
  digitalNomadInfo: {
    /** Whether country offers digital nomad visa */
    hasDigitalNomadVisa: boolean;
    /** Digital nomad visa details */
    nomadVisa?: {
      name: string;
      maxDuration: number; // in days
      requirements: string[];
      cost: {
        amount: number;
        currency: string;
      };
      applicationUrl?: string;
      processingTime: {
        min: number;
        max: number;
        unit: 'days' | 'weeks';
      };
    };
    /** Internet quality rating (1-5) */
    internetQuality: number;
    /** Cost of living index (1-5, 1 = very low, 5 = very high) */
    costOfLiving: number;
    /** Popular nomad cities */
    popularCities: string[];
    /** Coworking spaces availability */
    coworkingSpaces: 'abundant' | 'moderate' | 'limited' | 'rare';
  };
  /** Schengen area membership */
  schengenMember: boolean;
  /** EU membership */
  euMember: boolean;
  /** Entry/exit requirements */
  entryRequirements: {
    /** Passport validity requirement in months */
    passportValidity: number;
    /** Blank pages required */
    blankPages: number;
    /** Proof of return ticket required */
    returnTicket: boolean;
    /** Proof of accommodation required */
    accommodation: boolean;
    /** Proof of sufficient funds required */
    sufficientFunds: boolean;
    /** Minimum funds amount */
    minFunds?: {
      amount: number;
      currency: string;
      perDay?: boolean;
    };
  };
  /** Health requirements */
  healthRequirements: {
    /** Yellow fever vaccination required */
    yellowFever: boolean;
    /** Other required vaccinations */
    vaccinations?: string[];
    /** Health insurance required */
    healthInsurance: boolean;
    /** COVID-19 specific requirements */
    covidRequirements?: {
      vaccination: boolean;
      testing: boolean;
      quarantine: boolean;
      notes?: string;
    };
  };
}

/**
 * Initial visa database with key countries for digital nomads
 * This will be expanded to include all 78 countries
 */
export const VISA_DATABASE: VisaRequirement[] = [
  // Schengen Countries
  {
    countryCode: 'DE',
    countryName: { en: 'Germany', ko: '독일' },
    capital: 'Berlin',
    currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    timezone: { primary: 'Europe/Berlin', offset: '+01:00', dst: true },
    schengenMember: true,
    euMember: true,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'Freelance Visa (Freiberufler)',
        maxDuration: 365,
        requirements: [
          'Proof of freelance work',
          'Health insurance',
          'Proof of accommodation',
          'Financial evidence (€2,000+ per month)'
        ],
        cost: { amount: 100, currency: 'EUR' },
        processingTime: { min: 4, max: 8, unit: 'weeks' }
      },
      internetQuality: 5,
      costOfLiving: 4,
      popularCities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 3,
      blankPages: 2,
      returnTicket: false,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 45, currency: 'EUR', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  {
    countryCode: 'FR',
    countryName: { en: 'France', ko: '프랑스' },
    capital: 'Paris',
    currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    timezone: { primary: 'Europe/Paris', offset: '+01:00', dst: true },
    schengenMember: true,
    euMember: true,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: false,
      internetQuality: 5,
      costOfLiving: 4,
      popularCities: ['Paris', 'Lyon', 'Marseille', 'Nice'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 3,
      blankPages: 2,
      returnTicket: false,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 65, currency: 'EUR', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  {
    countryCode: 'ES',
    countryName: { en: 'Spain', ko: '스페인' },
    capital: 'Madrid',
    currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    timezone: { primary: 'Europe/Madrid', offset: '+01:00', dst: true },
    schengenMember: true,
    euMember: true,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'Digital Nomad Visa',
        maxDuration: 365,
        requirements: [
          'Remote work contract',
          'Proof of income (€2,334+ per month)',
          'Health insurance',
          'Clean criminal record'
        ],
        cost: { amount: 80, currency: 'EUR' },
        processingTime: { min: 2, max: 4, unit: 'weeks' }
      },
      internetQuality: 5,
      costOfLiving: 3,
      popularCities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 3,
      blankPages: 2,
      returnTicket: false,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 65, currency: 'EUR', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  // Non-Schengen European Countries
  {
    countryCode: 'GB',
    countryName: { en: 'United Kingdom', ko: '영국' },
    capital: 'London',
    currency: { code: 'GBP', name: 'British Pound', symbol: '£' },
    timezone: { primary: 'Europe/London', offset: '+00:00', dst: true },
    schengenMember: false,
    euMember: false,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 180,
        stayPeriod: 'per year',
        notes: 'Visitor visa, no work allowed',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 180,
        stayPeriod: 'per year',
        notes: 'Visitor visa, no work allowed',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: false,
      internetQuality: 5,
      costOfLiving: 5,
      popularCities: ['London', 'Edinburgh', 'Manchester', 'Bristol'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 6,
      blankPages: 1,
      returnTicket: true,
      accommodation: true,
      sufficientFunds: true,
      minFunds: { amount: 95, currency: 'GBP', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  // Popular Digital Nomad Destinations
  {
    countryCode: 'PT',
    countryName: { en: 'Portugal', ko: '포르투갈' },
    capital: 'Lisbon',
    currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    timezone: { primary: 'Europe/Lisbon', offset: '+00:00', dst: true },
    schengenMember: true,
    euMember: true,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'D7 Visa (Temporary Stay Visa)',
        maxDuration: 365,
        requirements: [
          'Proof of accommodation',
          'Proof of means of subsistence (€760+ per month)',
          'Health insurance',
          'Clean criminal record'
        ],
        cost: { amount: 83, currency: 'EUR' },
        processingTime: { min: 2, max: 3, unit: 'weeks' }
      },
      internetQuality: 4,
      costOfLiving: 2,
      popularCities: ['Lisbon', 'Porto', 'Braga', 'Coimbra'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 3,
      blankPages: 2,
      returnTicket: false,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 40, currency: 'EUR', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  {
    countryCode: 'EE',
    countryName: { en: 'Estonia', ko: '에스토니아' },
    capital: 'Tallinn',
    currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    timezone: { primary: 'Europe/Tallinn', offset: '+02:00', dst: true },
    schengenMember: true,
    euMember: true,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per 180 days',
        notes: 'Schengen area rules apply',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'Digital Nomad Visa',
        maxDuration: 365,
        requirements: [
          'Employment contract or business ownership',
          'Gross salary €3,500+ per month',
          'Health insurance',
          'No criminal convictions'
        ],
        cost: { amount: 80, currency: 'EUR' },
        applicationUrl: 'https://www.politsei.ee/en/instructions/applying-for-a-digital-nomad-visa',
        processingTime: { min: 2, max: 4, unit: 'weeks' }
      },
      internetQuality: 5,
      costOfLiving: 2,
      popularCities: ['Tallinn', 'Tartu'],
      coworkingSpaces: 'moderate'
    },
    entryRequirements: {
      passportValidity: 3,
      blankPages: 2,
      returnTicket: false,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 30, currency: 'EUR', perDay: true }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  // Asia-Pacific
  {
    countryCode: 'TH',
    countryName: { en: 'Thailand', ko: '태국' },
    capital: 'Bangkok',
    currency: { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    timezone: { primary: 'Asia/Bangkok', offset: '+07:00', dst: false },
    schengenMember: false,
    euMember: false,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 60,
        stayPeriod: 'per entry',
        notes: 'Can extend once for 30 days',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 60,
        stayPeriod: 'per entry',
        notes: 'Can extend once for 30 days',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'Destination Thailand Visa (DTV)',
        maxDuration: 180,
        requirements: [
          'Remote work evidence',
          'Bank statement showing $5,000+ USD',
          'Employment letter or contract',
          'Clean criminal record'
        ],
        cost: { amount: 10000, currency: 'THB' },
        processingTime: { min: 1, max: 2, unit: 'weeks' }
      },
      internetQuality: 4,
      costOfLiving: 1,
      popularCities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 6,
      blankPages: 1,
      returnTicket: true,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 20000, currency: 'THB', perDay: false }
    },
    healthRequirements: {
      yellowFever: true,
      vaccinations: ['Yellow Fever (if coming from infected area)'],
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  {
    countryCode: 'MY',
    countryName: { en: 'Malaysia', ko: '말레이시아' },
    capital: 'Kuala Lumpur',
    currency: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    timezone: { primary: 'Asia/Kuala_Lumpur', offset: '+08:00', dst: false },
    schengenMember: false,
    euMember: false,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per entry',
        notes: 'Can be extended',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 90,
        stayPeriod: 'per entry',
        notes: 'Can be extended',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: true,
      nomadVisa: {
        name: 'DE Rantau Nomad Pass',
        maxDuration: 365,
        requirements: [
          'Income proof of $24,000+ USD annually',
          'Valid passport with 12+ months validity',
          'Proof of accommodation',
          'Health and travel insurance'
        ],
        cost: { amount: 1000, currency: 'MYR' },
        processingTime: { min: 2, max: 4, unit: 'weeks' }
      },
      internetQuality: 4,
      costOfLiving: 1,
      popularCities: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kota Kinabalu'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 6,
      blankPages: 2,
      returnTicket: true,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 500, currency: 'MYR', perDay: false }
    },
    healthRequirements: {
      yellowFever: true,
      vaccinations: ['Yellow Fever (if coming from infected area)'],
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  },
  // Americas
  {
    countryCode: 'MX',
    countryName: { en: 'Mexico', ko: '멕시코' },
    capital: 'Mexico City',
    currency: { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    timezone: { primary: 'America/Mexico_City', offset: '-06:00', dst: true },
    schengenMember: false,
    euMember: false,
    visaRequirements: [
      {
        passportCountry: 'KR',
        requirement: 'visa_free',
        maxStayDays: 180,
        stayPeriod: 'per entry',
        notes: 'Tourist card (FMM) required',
        lastUpdated: '2024-07-30'
      },
      {
        passportCountry: 'US',
        requirement: 'visa_free',
        maxStayDays: 180,
        stayPeriod: 'per entry',
        notes: 'Tourist card (FMM) required',
        lastUpdated: '2024-07-30'
      }
    ],
    digitalNomadInfo: {
      hasDigitalNomadVisa: false,
      internetQuality: 3,
      costOfLiving: 2,
      popularCities: ['Mexico City', 'Playa del Carmen', 'Puerto Vallarta', 'Guadalajara'],
      coworkingSpaces: 'abundant'
    },
    entryRequirements: {
      passportValidity: 6,
      blankPages: 1,
      returnTicket: true,
      accommodation: false,
      sufficientFunds: true,
      minFunds: { amount: 500, currency: 'USD', perDay: false }
    },
    healthRequirements: {
      yellowFever: false,
      healthInsurance: false,
      covidRequirements: {
        vaccination: false,
        testing: false,
        quarantine: false
      }
    }
  }
];

/**
 * Utility functions for visa database
 */
export class VisaDatabase {
  private static instance: VisaDatabase;
  private database: Map<string, VisaRequirement>;

  private constructor() {
    this.database = new Map();
    this.loadDatabase();
  }

  static getInstance(): VisaDatabase {
    if (!VisaDatabase.instance) {
      VisaDatabase.instance = new VisaDatabase();
    }
    return VisaDatabase.instance;
  }

  private loadDatabase(): void {
    VISA_DATABASE.forEach(country => {
      this.database.set(country.countryCode, country);
    });
  }

  /**
   * Get visa requirements for a specific country
   */
  getCountryInfo(countryCode: string): VisaRequirement | null {
    return this.database.get(countryCode.toUpperCase()) || null;
  }

  /**
   * Get visa requirements for specific passport holder
   */
  getVisaRequirement(countryCode: string, passportCountry: string) {
    const country = this.getCountryInfo(countryCode);
    if (!country) return null;

    return country.visaRequirements.find(
      req => req.passportCountry === passportCountry.toUpperCase()
    ) || null;
  }

  /**
   * Get all countries with digital nomad visas
   */
  getDigitalNomadCountries(): VisaRequirement[] {
    return Array.from(this.database.values()).filter(
      country => country.digitalNomadInfo.hasDigitalNomadVisa
    );
  }

  /**
   * Get Schengen member countries
   */
  getSchengenCountries(): VisaRequirement[] {
    return Array.from(this.database.values()).filter(
      country => country.schengenMember
    );
  }

  /**
   * Search countries by various criteria
   */
  searchCountries(criteria: {
    visaFree?: boolean;
    passportCountry?: string;
    digitalNomadVisa?: boolean;
    maxCostOfLiving?: number;
    minInternetQuality?: number;
  }): VisaRequirement[] {
    let results = Array.from(this.database.values());

    if (criteria.digitalNomadVisa !== undefined) {
      results = results.filter(
        country => country.digitalNomadInfo.hasDigitalNomadVisa === criteria.digitalNomadVisa
      );
    }

    if (criteria.maxCostOfLiving !== undefined) {
      results = results.filter(
        country => country.digitalNomadInfo.costOfLiving <= criteria.maxCostOfLiving
      );
    }

    if (criteria.minInternetQuality !== undefined) {
      results = results.filter(
        country => country.digitalNomadInfo.internetQuality >= criteria.minInternetQuality
      );
    }

    if (criteria.visaFree && criteria.passportCountry) {
      results = results.filter(country => {
        const visaReq = country.visaRequirements.find(
          req => req.passportCountry === criteria.passportCountry?.toUpperCase()
        );
        return visaReq?.requirement === 'visa_free';
      });
    }

    return results;
  }

  /**
   * Get countries sorted by digital nomad friendliness
   */
  getDigitalNomadRanking(): Array<VisaRequirement & { score: number }> {
    const countries = Array.from(this.database.values());
    
    return countries.map(country => {
      let score = 0;
      
      // Digital nomad visa bonus
      if (country.digitalNomadInfo.hasDigitalNomadVisa) score += 30;
      
      // Internet quality (0-25 points)
      score += country.digitalNomadInfo.internetQuality * 5;
      
      // Cost of living (lower is better, 0-20 points)
      score += (6 - country.digitalNomadInfo.costOfLiving) * 4;
      
      // Coworking spaces (0-15 points)
      const coworkingPoints = {
        abundant: 15,
        moderate: 10,
        limited: 5,
        rare: 0
      };
      score += coworkingPoints[country.digitalNomadInfo.coworkingSpaces];
      
      // Popular cities bonus (0-10 points)
      score += Math.min(country.digitalNomadInfo.popularCities.length * 2, 10);

      return { ...country, score };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Get database statistics
   */
  getStats() {
    const countries = Array.from(this.database.values());
    
    return {
      totalCountries: countries.length,
      schengenCountries: countries.filter(c => c.schengenMember).length,
      euCountries: countries.filter(c => c.euMember).length,
      digitalNomadVisas: countries.filter(c => c.digitalNomadInfo.hasDigitalNomadVisa).length,
      averageInternetQuality: countries.reduce((sum, c) => sum + c.digitalNomadInfo.internetQuality, 0) / countries.length,
      averageCostOfLiving: countries.reduce((sum, c) => sum + c.digitalNomadInfo.costOfLiving, 0) / countries.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Add or update country information
   */
  updateCountry(countryCode: string, countryInfo: VisaRequirement): void {
    this.database.set(countryCode.toUpperCase(), countryInfo);
  }

  /**
   * Get all countries
   */
  getAllCountries(): VisaRequirement[] {
    return Array.from(this.database.values());
  }
}

// Export singleton instance
export const visaDatabase = VisaDatabase.getInstance();