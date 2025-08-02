/**
 * DINO v2.0 - Travel Data Importer
 * Convert Gmail travel periods to Schengen calculator format
 */

import type { TravelPeriod } from '@/types/gmail';
import type { CountryVisit } from '@/types/schengen';
import { v4 as uuidv4 } from 'uuid';

// Schengen Area country codes
const SCHENGEN_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IS', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH'
]);

export interface ImportResult {
  readonly success: boolean;
  readonly importedCount: number;
  readonly skippedCount: number;
  readonly errors: readonly string[];
  readonly visits: readonly CountryVisit[];
}

export class TravelImporter {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Convert Gmail travel periods to CountryVisit format
   */
  convertTravelPeriods(periods: readonly TravelPeriod[]): ImportResult {
    const visits: CountryVisit[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    for (const period of periods) {
      try {
        // Skip non-Schengen countries for Schengen calculator
        if (!SCHENGEN_COUNTRIES.has(period.countryCode)) {
          skippedCount++;
          errors.push(`Skipped ${period.countryName} - not in Schengen Area`);
          continue;
        }

        // Skip periods without exit date (ongoing trips need special handling)
        if (!period.exitDate) {
          skippedCount++;
          errors.push(`Skipped ${period.countryName} - no exit date (ongoing trip?)`);
          continue;
        }

        const visit = this.convertTravelPeriodToVisit(period);
        visits.push(visit);

      } catch (error) {
        skippedCount++;
        errors.push(`Failed to convert ${period.countryName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: visits.length > 0,
      importedCount: visits.length,
      skippedCount,
      errors,
      visits,
    };
  }

  /**
   * Convert a single travel period to a country visit
   */
  private convertTravelPeriodToVisit(period: TravelPeriod): CountryVisit {
    if (!period.exitDate) {
      throw new Error('Exit date is required for Schengen calculation');
    }

    // Convert dates to ISO strings if they're Date objects
    const entryDate = typeof period.entryDate === 'string' 
      ? period.entryDate 
      : period.entryDate.toISOString();
      
    const exitDate = typeof period.exitDate === 'string'
      ? period.exitDate
      : period.exitDate.toISOString();

    // Calculate stay duration
    const entryTime = new Date(entryDate).getTime();
    const exitTime = new Date(exitDate).getTime();
    const stayDays = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60 * 24)) + 1;

    return {
      id: uuidv4(),
      userId: this.userId,
      country: period.countryCode,
      entryDate,
      exitDate,
      visaType: this.mapPurposeToVisaType(period.purpose),
      maxDays: 90, // Standard tourist visa for Schengen
      passportCountry: 'KR', // Assuming Korean passport - could be made configurable
      notes: this.generateImportNotes(period),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Map travel purpose to visa type
   */
  private mapPurposeToVisaType(purpose: string): string {
    switch (purpose) {
      case 'BUSINESS':
        return 'business';
      case 'TOURISM':
        return 'tourist';
      case 'TRANSIT':
        return 'transit';
      case 'EDUCATION':
        return 'student';
      case 'FAMILY':
        return 'family';
      case 'MEDICAL':
        return 'medical';
      default:
        return 'tourist';
    }
  }

  /**
   * Generate notes with import metadata
   */
  private generateImportNotes(period: TravelPeriod): string {
    const notes = [];
    
    notes.push(`📧 Imported from Gmail sync`);
    notes.push(`✈️ ${period.flights.length} flight(s)`);
    notes.push(`🎯 Confidence: ${Math.round(period.confidence * 100)}%`);
    
    if (period.notes) {
      notes.push(`📝 ${period.notes}`);
    }
    
    notes.push(`🕒 Imported: ${new Date().toLocaleDateString()}`);
    
    return notes.join(' | ');
  }

  /**
   * Validate import data before saving
   */
  validateImport(visits: readonly CountryVisit[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const visit of visits) {
      // Check required fields
      if (!visit.country || visit.country.length !== 2) {
        errors.push(`Invalid country code: ${visit.country}`);
      }

      if (!visit.entryDate) {
        errors.push('Entry date is required');
      }

      if (!visit.exitDate) {
        errors.push('Exit date is required for Schengen calculation');
      }

      // Check date validity
      if (visit.entryDate && visit.exitDate) {
        const entryTime = new Date(visit.entryDate).getTime();
        const exitTime = new Date(visit.exitDate).getTime();
        
        if (entryTime >= exitTime) {
          errors.push('Exit date must be after entry date');
        }

        // Check for reasonable date range
        const stayDays = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60 * 24));
        if (stayDays > 365) {
          errors.push(`Stay duration (${stayDays} days) seems unreasonably long`);
        }
      }

      // Check if country is in Schengen area
      if (!SCHENGEN_COUNTRIES.has(visit.country)) {
        errors.push(`${visit.country} is not in Schengen Area`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for duplicate visits (same country, overlapping dates)
   */
  findDuplicates(newVisits: readonly CountryVisit[], existingVisits: readonly CountryVisit[]): CountryVisit[] {
    const duplicates: CountryVisit[] = [];

    for (const newVisit of newVisits) {
      for (const existing of existingVisits) {
        if (this.areVisitsOverlapping(newVisit, existing)) {
          duplicates.push(newVisit);
          break;
        }
      }
    }

    return duplicates;
  }

  /**
   * Check if two visits overlap in time and country
   */
  private areVisitsOverlapping(visit1: CountryVisit, visit2: CountryVisit): boolean {
    if (visit1.country !== visit2.country) {
      return false;
    }

    const entry1 = new Date(visit1.entryDate).getTime();
    const exit1 = visit1.exitDate ? new Date(visit1.exitDate).getTime() : Date.now();
    const entry2 = new Date(visit2.entryDate).getTime();
    const exit2 = visit2.exitDate ? new Date(visit2.exitDate).getTime() : Date.now();

    // Check if date ranges overlap
    return entry1 <= exit2 && entry2 <= exit1;
  }
}

/**
 * Create travel importer instance
 */
export function createTravelImporter(userId: string): TravelImporter {
  return new TravelImporter(userId);
}