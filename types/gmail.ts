/**
 * DINO v2.0 - Gmail API Integration Types
 * Strict TypeScript for Gmail sync functionality
 */

// Gmail API Message structure
export interface GmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly labelIds: readonly string[];
  readonly snippet: string;
  readonly historyId: string;
  readonly internalDate: string;
  readonly payload: GmailPayload;
  readonly sizeEstimate: number;
}

export interface GmailPayload {
  readonly partId: string;
  readonly mimeType: string;
  readonly filename: string;
  readonly headers: readonly GmailHeader[];
  readonly body: GmailBody;
  readonly parts?: readonly GmailPart[];
}

export interface GmailHeader {
  readonly name: string;
  readonly value: string;
}

export interface GmailBody {
  readonly size: number;
  readonly data?: string; // Base64 encoded
}

export interface GmailPart {
  readonly partId: string;
  readonly mimeType: string;
  readonly filename: string;
  readonly headers: readonly GmailHeader[];
  readonly body: GmailBody;
}

// Flight information extracted from emails
export interface FlightInfo {
  readonly flightNumber: string;
  readonly airline: string;
  readonly departureAirport: AirportInfo;
  readonly arrivalAirport: AirportInfo;
  readonly departureDate: Date;
  readonly arrivalDate: Date;
  readonly departureTime: string;
  readonly arrivalTime: string;
  readonly bookingReference: string | null;
  readonly passengerName: string | null;
  readonly seatNumber: string | null;
  readonly emailId: string; // Gmail message ID
  readonly confidence: number; // 0-1, how confident we are in the extraction
}

export interface AirportInfo {
  readonly code: string; // IATA code (e.g., "ICN", "LAX")
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly countryCode: string; // ISO country code
}

// Travel period extracted from flights
export interface TravelPeriod {
  readonly id: string;
  readonly countryCode: string;
  readonly countryName: string;
  readonly entryDate: Date;
  readonly exitDate: Date | null; // null if still traveling
  readonly flights: readonly FlightInfo[];
  readonly purpose: TravelPurpose;
  readonly notes: string | null;
  readonly confidence: number;
  readonly extractedAt: Date;
}

export type TravelPurpose = 'TOURISM' | 'BUSINESS' | 'TRANSIT' | 'EDUCATION' | 'FAMILY' | 'MEDICAL' | 'OTHER';

// Gmail sync configuration
export interface GmailSyncConfig {
  readonly userId: string;
  readonly lastSyncDate: Date | null;
  readonly syncEnabled: boolean;
  readonly autoImport: boolean;
  readonly searchQuery: string; // Gmail search query for flight emails
  readonly maxEmails: number;
  readonly syncIntervalHours: number;
}

// Gmail sync status
export interface GmailSyncStatus {
  readonly isRunning: boolean;
  readonly lastSync: Date | null;
  readonly lastError: string | null;
  readonly emailsProcessed: number;
  readonly flightsFound: number;
  readonly periodsCreated: number;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}

// API Request/Response types
export interface GmailSyncRequest {
  readonly forceSync?: boolean;
  readonly dateRange?: {
    readonly from: Date;
    readonly to: Date;
  };
}

export interface GmailSyncResponse {
  readonly success: boolean;
  readonly status: GmailSyncStatus;
  readonly periods: readonly TravelPeriod[];
  readonly errors: readonly string[];
}

// Email parsing result
export interface EmailParseResult {
  readonly emailId: string;
  readonly subject: string;
  readonly from: string;
  readonly date: Date;
  readonly flights: readonly FlightInfo[];
  readonly isFlightEmail: boolean;
  readonly confidence: number;
  readonly rawText: string;
  readonly parseErrors: readonly string[];
}

// Airline patterns for email recognition
export interface AirlinePattern {
  readonly name: string;
  readonly domains: readonly string[];
  readonly subjectPatterns: readonly string[];
  readonly flightNumberPatterns: readonly string[];
  readonly dateFormats: readonly string[];
  readonly airportPatterns: readonly string[];
}

// Country mapping for airports
export interface CountryMapping {
  readonly [airportCode: string]: {
    readonly countryCode: string;
    readonly countryName: string;
    readonly city: string;
  };
}

export type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'other';

export interface EmailSyncProvider {
  readonly type: EmailProvider;
  readonly displayName: string;
  readonly isConfigured: boolean;
  readonly lastSync: Date | null;
  readonly authRequired: boolean;
}