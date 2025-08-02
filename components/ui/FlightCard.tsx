/**
 * DINO v2.0 - Flight Card Component
 * Modern boarding pass style card with Korean localization
 */

import { Flight, KOREAN_FLIGHT_LABELS } from '@/types/flight';
import { FlightStatus } from './FlightStatus';
import { FlightRoute } from './FlightRoute';

interface FlightCardProps {
  flight: Flight;
  variant?: 'boarding-pass' | 'minimal' | 'detailed';
  showPassengerInfo?: boolean;
  showBookingRef?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FlightCard({
  flight,
  variant = 'boarding-pass',
  showPassengerInfo = false,
  showBookingRef = false,
  onClick,
  className = '',
}: FlightCardProps) {
  const formatTime = (date: Date, timezone?: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    if (timezone) {
      options.timeZone = timezone;
    }
    
    return date.toLocaleTimeString('ko-KR', options);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const isClickable = !!onClick;

  if (variant === 'minimal') {
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-semibold text-gray-900">
              {flight.airline.name} {flight.flightNumber}
            </div>
            <FlightStatus status={flight.status} delay={flight.delay} size="sm" />
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(flight.departure.scheduledTime)}
          </div>
        </div>
        
        <FlightRoute
          departure={flight.departure.airport}
          arrival={flight.arrival.airport}
          departureTime={flight.departure.actualTime || flight.departure.scheduledTime}
          arrivalTime={flight.arrival.actualTime || flight.arrival.scheduledTime}
          showTimes={true}
          size="sm"
        />
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {flight.airline.name}
              </div>
              <div className="text-sm text-gray-600">
                {KOREAN_FLIGHT_LABELS.flightNumber} {flight.flightNumber}
              </div>
            </div>
            <FlightStatus status={flight.status} delay={flight.delay} />
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          <FlightRoute
            departure={flight.departure.airport}
            arrival={flight.arrival.airport}
            departureTime={flight.departure.actualTime || flight.departure.scheduledTime}
            arrivalTime={flight.arrival.actualTime || flight.arrival.scheduledTime}
            showTimes={true}
          />

          {/* Flight details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {flight.departure.gate && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.gate}</div>
                <div className="font-semibold">{flight.departure.gate}</div>
              </div>
            )}
            {flight.seat && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.seat}</div>
                <div className="font-semibold">{flight.seat}</div>
              </div>
            )}
            {flight.departure.terminal && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.terminal}</div>
                <div className="font-semibold">{flight.departure.terminal}</div>
              </div>
            )}
            {flight.duration && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.duration}</div>
                <div className="font-semibold">{flight.duration}</div>
              </div>
            )}
          </div>

          {/* Passenger info */}
          {showPassengerInfo && flight.passengerName && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">승객명</div>
              <div className="font-semibold">{flight.passengerName}</div>
            </div>
          )}

          {/* Booking reference */}
          {showBookingRef && flight.bookingRef && (
            <div className="pt-2">
              <div className="text-xs text-gray-500 mb-1">예약번호</div>
              <div className="font-mono text-sm">{flight.bookingRef}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: boarding-pass variant
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Boarding pass header */}
      <div className="relative">
        {/* Perforated edge effect */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-100 via-white to-gray-100"></div>
        
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {flight.airline.name}
              </div>
              <div className="text-sm text-gray-600">
                {flight.flightNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatDate(flight.departure.scheduledTime)}
              </div>
              <FlightStatus status={flight.status} delay={flight.delay} size="sm" />
            </div>
          </div>

          {/* Route */}
          <div className="mb-6">
            <FlightRoute
              departure={flight.departure.airport}
              arrival={flight.arrival.airport}
              duration={flight.duration}
              showCities={true}
            />
          </div>

          {/* Times */}
          <div className="flex justify-between text-center mb-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.departure}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.departure.actualTime || flight.departure.scheduledTime, flight.departure.airport.timezone)}
              </div>
              {flight.departure.actualTime && flight.departure.actualTime !== flight.departure.scheduledTime && (
                <div className="text-xs text-gray-500 line-through">
                  {formatTime(flight.departure.scheduledTime, flight.departure.airport.timezone)}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.arrival}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.arrival.actualTime || flight.arrival.scheduledTime, flight.arrival.airport.timezone)}
              </div>
              {flight.arrival.actualTime && flight.arrival.actualTime !== flight.arrival.scheduledTime && (
                <div className="text-xs text-gray-500 line-through">
                  {formatTime(flight.arrival.scheduledTime, flight.arrival.airport.timezone)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative border-t border-dashed border-gray-300 mx-6">
          <div className="absolute -left-3 -top-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
          <div className="absolute -right-3 -top-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
        </div>

        {/* Flight details */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {flight.departure.gate && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.gate}</div>
                <div className="font-bold text-lg">{flight.departure.gate}</div>
              </div>
            )}
            {flight.seat && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.seat}</div>
                <div className="font-bold text-lg">{flight.seat}</div>
              </div>
            )}
            {flight.departure.terminal && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">{KOREAN_FLIGHT_LABELS.terminal}</div>
                <div className="font-bold text-lg">{flight.departure.terminal}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {(flight.status === 'delayed' || flight.status === 'cancelled' || flight.status === 'gate-change') && (
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-3">
          <div className="flex items-center justify-center space-x-2">
            <FlightStatus status={flight.status} delay={flight.delay} size="sm" />
            {flight.delay?.reason && (
              <span className="text-xs text-amber-700">
                - {flight.delay.reason}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Collection component for multiple flights
export function FlightList({
  flights,
  variant = 'boarding-pass',
  onFlightClick,
  className = '',
}: {
  flights: Flight[];
  variant?: 'boarding-pass' | 'minimal' | 'detailed';
  onFlightClick?: (flight: Flight) => void;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          variant={variant}
          onClick={() => onFlightClick?.(flight)}
        />
      ))}
    </div>
  );
}