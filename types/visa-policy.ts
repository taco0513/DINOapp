/**
 * DINO v2.0 - Visa Policy Types
 * Types for real-time visa policy updates
 */

export interface VisaPolicy {
  id: string;
  fromCountry: string; // ISO 3166-1 alpha-2
  toCountry: string; // ISO 3166-1 alpha-2
  policyType: 'VISA_FREE' | 'VISA_ON_ARRIVAL' | 'E_VISA' | 'VISA_REQUIRED' | 'BANNED';
  maxStayDays: number | null;
  validityDays: number | null;
  fee: number | null;
  currency: string | null;
  requirements: string[];
  lastUpdated: Date;
  effectiveDate: Date;
  source: string;
  notes?: string;
}

export interface VisaPolicyUpdate {
  id: string;
  policyId: string;
  changeType: 'NEW' | 'UPDATE' | 'REMOVED';
  previousPolicy?: Partial<VisaPolicy>;
  newPolicy: VisaPolicy;
  timestamp: Date;
  verified: boolean;
}

export interface VisaPolicySubscription {
  userId: string;
  countries: string[]; // Countries to monitor
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: Date;
}