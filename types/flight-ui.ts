/**
 * DINO v2.0 - Flight UI Types
 * Modern flight app inspired UI components
 * Extends existing Flight types for UI-specific needs
 */

import { Flight, FlightStatus, Airport, Airline } from './flight';

// Re-export existing types
export type { Flight, FlightStatus, Airport, Airline };

// UI-specific props interfaces
export interface FlightCardProps {
  flight: Flight;
  variant?: 'minimal' | 'boarding-pass' | 'detailed';
  showPassengerInfo?: boolean;
  showBookingRef?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface FlightRouteProps {
  departure: Airport;
  arrival: Airport;
  duration?: string;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showCities?: boolean;
  showTimes?: boolean;
  departureTime?: Date;
  arrivalTime?: Date;
  className?: string;
}

export interface FlightStatusProps {
  status: FlightStatus;
  delay?: {
    minutes: number;
    reason?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

// Korean localization labels for FlightStatus
export const FLIGHT_STATUS_LABELS: Record<FlightStatus, string> = {
  'scheduled': '예정',
  'on-time': '정시',
  'delayed': '지연',
  'cancelled': '취소',
  'boarding': '탑승 중',
  'gate-change': '게이트 변경',
  'departed': '출발',
  'arrived': '도착'
};

export const FLIGHT_STATUS_COLORS: Record<FlightStatus, string> = {
  'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
  'on-time': 'bg-green-100 text-green-800 border-green-200',
  'delayed': 'bg-orange-100 text-orange-800 border-orange-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200',
  'boarding': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'gate-change': 'bg-purple-100 text-purple-800 border-purple-200',
  'departed': 'bg-gray-100 text-gray-800 border-gray-200',
  'arrived': 'bg-green-100 text-green-800 border-green-200'
};