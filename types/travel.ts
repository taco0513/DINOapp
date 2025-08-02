/**
 * DINO v2.0 - Travel Types
 * Core travel-related type definitions
 */

export interface StayRecord {
  country: string;
  entryDate: Date;
  exitDate: Date;
  duration: number;
  purpose?: 'tourism' | 'business' | 'study' | 'other';
}

export interface TravelSummary {
  totalTrips: number;
  totalDays: number;
  countriesVisited: number;
  averageTripLength: number;
  longestTrip: {
    country: string;
    days: number;
  };
  mostVisited: {
    country: string;
    visits: number;
  };
}

export interface CountryVisit {
  country: string;
  countryName: string;
  visits: number;
  totalDays: number;
  lastVisit: Date;
  visaRequired: boolean;
}

export interface TripValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface VisaRequirement {
  country: string;
  visaRequired: boolean;
  visaType?: 'VISA_FREE' | 'VISA_ON_ARRIVAL' | 'E_VISA' | 'VISA_REQUIRED';
  maxStayDays?: number;
  validityDays?: number;
  fee?: number;
  currency?: string;
}

export interface TravelPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  countries: string[];
  status: 'draft' | 'planned' | 'in_progress' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}