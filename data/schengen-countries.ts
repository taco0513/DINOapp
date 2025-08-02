/**
 * DINO v2.0 - Schengen Countries Data
 * Official list of Schengen Area countries (as of 2024)
 */

import type { SchengenCountry } from '@/types/schengen';

/**
 * Complete list of Schengen Area countries
 * Updated: 2024 - 27 countries
 */
export const SCHENGEN_COUNTRIES: readonly SchengenCountry[] = [
  // Original Schengen Agreement (1995)
  { code: 'DE', name: 'Germany', isSchengen: true },
  { code: 'FR', name: 'France', isSchengen: true },
  { code: 'ES', name: 'Spain', isSchengen: true },
  { code: 'PT', name: 'Portugal', isSchengen: true },
  { code: 'NL', name: 'Netherlands', isSchengen: true },
  { code: 'BE', name: 'Belgium', isSchengen: true },
  { code: 'LU', name: 'Luxembourg', isSchengen: true },

  // Joined 1997
  { code: 'IT', name: 'Italy', isSchengen: true },
  { code: 'AT', name: 'Austria', isSchengen: true },

  // Joined 2000
  { code: 'GR', name: 'Greece', isSchengen: true },

  // Joined 2001
  { code: 'DK', name: 'Denmark', isSchengen: true },
  { code: 'FI', name: 'Finland', isSchengen: true },
  { code: 'IS', name: 'Iceland', isSchengen: true },
  { code: 'NO', name: 'Norway', isSchengen: true },
  { code: 'SE', name: 'Sweden', isSchengen: true },

  // Joined 2008
  { code: 'CH', name: 'Switzerland', isSchengen: true },

  // Joined 2007
  { code: 'CZ', name: 'Czech Republic', isSchengen: true },
  { code: 'EE', name: 'Estonia', isSchengen: true },
  { code: 'HU', name: 'Hungary', isSchengen: true },
  { code: 'LV', name: 'Latvia', isSchengen: true },
  { code: 'LT', name: 'Lithuania', isSchengen: true },
  { code: 'MT', name: 'Malta', isSchengen: true },
  { code: 'PL', name: 'Poland', isSchengen: true },
  { code: 'SK', name: 'Slovakia', isSchengen: true },
  { code: 'SI', name: 'Slovenia', isSchengen: true },

  // Joined 2008
  { code: 'LI', name: 'Liechtenstein', isSchengen: true },

  // Joined 2023
  { code: 'HR', name: 'Croatia', isSchengen: true },
] as const;

/**
 * Map of country codes to country names for fast lookups
 */
export const SCHENGEN_COUNTRY_MAP = new Map(
  SCHENGEN_COUNTRIES.map(country => [country.code, country.name])
);

/**
 * Set of Schengen country codes for fast membership checking
 */
export const SCHENGEN_COUNTRY_CODES = new Set(
  SCHENGEN_COUNTRIES.map(country => country.code)
);

/**
 * Set of Schengen country names for fast membership checking
 */
export const SCHENGEN_COUNTRY_NAMES = new Set(
  SCHENGEN_COUNTRIES.map(country => country.name)
);

/**
 * Checks if a country code belongs to the Schengen Area
 */
export function isSchengenCountryCode(code: string): boolean {
  return SCHENGEN_COUNTRY_CODES.has(code.toUpperCase());
}

/**
 * Checks if a country name belongs to the Schengen Area
 */
export function isSchengenCountryName(name: string): boolean {
  return SCHENGEN_COUNTRY_NAMES.has(name);
}

/**
 * Gets country name from country code
 */
export function getSchengenCountryName(code: string): string | null {
  return SCHENGEN_COUNTRY_MAP.get(code.toUpperCase()) ?? null;
}

/**
 * Gets all Schengen countries (immutable)
 */
export function getSchengenCountries(): readonly SchengenCountry[] {
  return SCHENGEN_COUNTRIES;
}