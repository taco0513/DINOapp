/**
 * DINO v2.0 - Flight Types
 * Flight and travel booking related type definitions
 */

export interface Airport {
  code: string; // IATA code (e.g., "ICN", "LAX")
  name: string; // Full airport name
  city: string; // City name
  country: string; // Country name
  timezone: string; // Timezone (e.g., "Asia/Seoul")
}

export interface Airline {
  code: string; // IATA airline code (e.g., "KE", "UA")
  name: string; // Airline name
  logo?: string; // Logo URL
}

export type FlightStatus = 
  | 'scheduled'
  | 'on-time' 
  | 'delayed'
  | 'boarding'
  | 'departed'
  | 'cancelled'
  | 'gate-change'
  | 'arrived';

export interface Flight {
  id: string;
  flightNumber: string; // e.g., "KE12", "UA123"
  airline: Airline;
  
  // Route information
  departure: {
    airport: Airport;
    scheduledTime: Date;
    actualTime?: Date;
    gate?: string;
    terminal?: string;
  };
  
  arrival: {
    airport: Airport;
    scheduledTime: Date;
    actualTime?: Date;
    gate?: string;
    terminal?: string;
  };
  
  // Flight details
  status: FlightStatus;
  aircraft?: string; // Aircraft type (e.g., "Boeing 777-300ER")
  duration?: string; // Flight duration (e.g., "11h 30m")
  
  // Passenger information
  seat?: string; // Seat number (e.g., "12A")
  bookingRef?: string; // Booking reference
  passengerName?: string;
  
  // Additional info
  notes?: string[];
  delay?: {
    minutes: number;
    reason?: string;
  };
}

export interface FlightRoute {
  departure: Airport;
  arrival: Airport;
  duration?: string;
  distance?: string;
}

export interface FlightStatusBadge {
  status: FlightStatus;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  text: string;
  icon?: string;
}

// Localization interfaces
export interface FlightLabels {
  departure: string;
  arrival: string;
  gate: string;
  terminal: string;
  seat: string;
  status: string;
  flightNumber: string;
  aircraft: string;
  duration: string;
  delay: string;
  boarding: string;
  cancelled: string;
  onTime: string;
  delayed: string;
  gateChange: string;
}

export const KOREAN_FLIGHT_LABELS: FlightLabels = {
  departure: '출발',
  arrival: '도착',
  gate: '게이트',
  terminal: '터미널',
  seat: '좌석',
  status: '상태',
  flightNumber: '항공편',
  aircraft: '기종',
  duration: '소요시간',
  delay: '지연',
  boarding: '탑승 중',
  cancelled: '취소됨',
  onTime: '정시',
  delayed: '지연',
  gateChange: '게이트 변경',
};