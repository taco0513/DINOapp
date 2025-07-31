// Global type definitions for DiNoCal

export type VisaType =
  | 'Tourist'
  | 'Business'
  | 'Student'
  | 'Working Holiday'
  | 'Digital Nomad'
  | 'Transit'
  | 'Work'
  | 'Investor'
  | 'Retirement'
  | 'Volunteer'
  | 'Visa Run'
  | 'Extension'
  | 'Spouse'
  | 'Medical';

export type PassportCountry = 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'JP' | 'OTHER';

export interface CountryVisit {
  id: string;
  userId: string;
  country: string;
  entryDate: string; // ISO 8601 date string
  exitDate: string | null; // ISO 8601 date string or null if currently staying
  visaType: VisaType;
  maxDays: number;
  passportCountry?: PassportCountry;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  googleId?: string;
  passportCountry: PassportCountry;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchengenStatus {
  usedDays: number;
  remainingDays: number;
  nextResetDate: string;
  isCompliant: boolean;
  violations: SchengenViolation[];
}

export interface SchengenViolation {
  date: string;
  daysOverLimit: number;
  description: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  visaExpiryDays: number[];
  schengenWarningDays: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  updatedAt: string;
}
