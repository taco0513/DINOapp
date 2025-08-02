/**
 * DINO v2.0 - Visa Types
 * Comprehensive type definitions for visa requirements and management
 */

/**
 * Visa requirement types
 */
export type VisaRequirement = 
  | 'visa_free'           // 무비자
  | 'visa_on_arrival'     // 도착비자
  | 'evisa'              // 전자비자
  | 'visa_required'      // 사전비자 필수
  | 'special_admin'      // 특별행정구역
  | 'not_recognized';    // 미승인

/**
 * Travel purpose types
 */
export type TravelPurpose = 
  | 'tourism'            // 관광
  | 'business'           // 사업
  | 'transit'            // 경유
  | 'work'               // 취업
  | 'study'              // 유학
  | 'family_visit';      // 가족방문

/**
 * Country information with visa policies
 */
export interface Country {
  readonly code: string;           // ISO 3166-1 alpha-2 code (KR, US, etc.)
  readonly name: string;           // Country name in Korean
  readonly nameEn: string;         // Country name in English
  readonly region: string;         // Geographic region
  readonly isSchengen: boolean;    // Schengen area member
  readonly visaFree: readonly string[];  // Countries with visa-free access
  readonly evisaAvailable: readonly string[];  // Countries with e-visa
}

/**
 * Visa requirement result
 */
export interface VisaRequirementResult {
  readonly fromCountry: string;    // Passport country code
  readonly toCountry: string;      // Destination country code
  readonly requirement: VisaRequirement;
  readonly maxStayDays: number;    // Maximum stay duration
  readonly notes: string;          // Additional information
  readonly processingTime?: string; // Visa processing time if required
  readonly cost?: string;          // Visa cost if applicable
  readonly validityPeriod?: string; // Visa validity period
  readonly lastUpdated: string;    // ISO date string
}

/**
 * Visa application information
 */
export interface VisaApplicationInfo {
  readonly country: string;
  readonly purpose: TravelPurpose;
  readonly requirements: readonly string[];  // Required documents
  readonly processingTime: string;
  readonly cost: string;
  readonly validityPeriod: string;
  readonly applicationUrl?: string;
  readonly embassy?: EmbassyInfo;
}

/**
 * Embassy/Consulate information
 */
export interface EmbassyInfo {
  readonly name: string;
  readonly address: string;
  readonly phone: string;
  readonly email?: string;
  readonly website?: string;
  readonly workingHours: string;
}

/**
 * Visa checker request
 */
export interface VisaCheckerRequest {
  readonly passportCountry: string;  // User's passport country
  readonly destination: string;      // Destination country
  readonly purpose: TravelPurpose;   // Travel purpose
  readonly stayDuration?: number;    // Planned stay duration in days
}

/**
 * Visa checker response
 */
export type VisaCheckerResponse = {
  readonly success: true;
  readonly data: {
    readonly requirement: VisaRequirementResult;
    readonly applicationInfo?: VisaApplicationInfo;
    readonly alternatives?: readonly VisaRequirementResult[]; // Alternative routes
    readonly recommendations: readonly string[];
  };
} | {
  readonly success: false;
  readonly error: string;
}

/**
 * Popular passport rankings
 */
export interface PassportRanking {
  readonly country: string;
  readonly rank: number;
  readonly visaFreeCount: number;
  readonly mobilityScore: number;
}