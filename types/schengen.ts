/**
 * DINO v2.0 - Schengen Types
 * Comprehensive type definitions for Schengen Area calculations
 */

/**
 * Represents a country visit record
 */
export interface CountryVisit {
  readonly id: string;
  readonly userId: string;
  readonly country: string;
  readonly entryDate: string; // ISO date string
  readonly exitDate: string | null; // ISO date string or null if ongoing
  readonly visaType: string;
  readonly maxDays: number;
  readonly passportCountry?: string;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Schengen Area compliance status
 */
export interface SchengenStatus {
  readonly usedDays: number;
  readonly remainingDays: number;
  readonly nextResetDate: string; // ISO date string
  readonly isCompliant: boolean;
  readonly violations: readonly SchengenViolation[];
}

/**
 * Schengen rule violation details
 */
export interface SchengenViolation {
  readonly date: string; // ISO date string
  readonly daysOverLimit: number;
  readonly description: string;
}

/**
 * Result of future trip validation
 */
export interface FutureTripValidation {
  readonly canTravel: boolean;
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
  readonly maxStayDays: number;
  readonly violatesRule: boolean;
  readonly daysUsedAfterTrip: number;
  readonly remainingDaysAfterTrip: number;
}

/**
 * Safe travel date range
 */
export interface SafeTravelDates {
  readonly startDate: Date;
  readonly endDate: Date;
}

/**
 * Schengen country information
 */
export interface SchengenCountry {
  readonly code: string;
  readonly name: string;
  readonly isSchengen: true;
}

/**
 * API response wrapper
 */
export type ApiResult<T> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly error: string;
};

/**
 * Schengen calculation result
 */
export interface SchengenCalculationResult {
  readonly status: SchengenStatus;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
  readonly nextAllowedEntry?: string; // ISO date string
  readonly maxStayDays: number;
}