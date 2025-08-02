/**
 * DINO v2.0 - Flight Route Component  
 * Modern flight app inspired route visualization
 */

import { FlightRouteProps } from '@/types/flight-ui';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  sm: {
    airport: 'text-lg font-bold',
    city: 'text-xs',
    time: 'text-xs',
    container: 'gap-2'
  },
  md: {
    airport: 'text-xl font-bold',
    city: 'text-sm',
    time: 'text-sm', 
    container: 'gap-3'
  },
  lg: {
    airport: 'text-2xl font-bold',
    city: 'text-base',
    time: 'text-base',
    container: 'gap-4'
  }
};

export function FlightRoute({
  departure,
  arrival,
  duration,
  variant = 'horizontal',
  size = 'md',
  showCities = true,
  showTimes = false,
  departureTime,
  arrivalTime,
  className
}: FlightRouteProps) {
  const sizeClasses = SIZE_CLASSES[size];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center', sizeClasses.container, className)}>
        {/* Departure */}
        <div className="text-center">
          <div className={cn('text-gray-900', sizeClasses.airport)}>
            {departure.code}
          </div>
          {showCities && (
            <div className={cn('text-gray-600', sizeClasses.city)}>
              {departure.city}
            </div>
          )}
          {showTimes && departureTime && (
            <div className={cn('text-gray-500 font-mono', sizeClasses.time)}>
              {formatTime(departureTime)}
            </div>
          )}
        </div>

        {/* Flight Path */}
        <div className="flex flex-col items-center py-2">
          <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-blue-600"></div>
          <div className="text-blue-600 text-lg">✈️</div>
          <div className="w-px h-8 bg-gradient-to-b from-blue-600 to-blue-400"></div>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <div className={cn('text-gray-900', sizeClasses.airport)}>
            {arrival.code}
          </div>
          {showCities && (
            <div className={cn('text-gray-600', sizeClasses.city)}>
              {arrival.city}
            </div>
          )}
          {showTimes && arrivalTime && (
            <div className={cn('text-gray-500 font-mono', sizeClasses.time)}>
              {formatTime(arrivalTime)}
            </div>
          )}
        </div>

        {/* Duration */}
        {duration && (
          <div className={cn('text-gray-500 mt-2', sizeClasses.time)}>
            {duration}
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className={cn('flex items-center justify-between w-full', sizeClasses.container, className)}>
      {/* Departure */}
      <div className="text-center min-w-0 flex-1">
        <div className={cn('text-gray-900', sizeClasses.airport)}>
          {departure.code}
        </div>
        {showCities && (
          <div className={cn('text-gray-600 truncate', sizeClasses.city)}>
            {departure.city}
          </div>
        )}
        {showTimes && departureTime && (
          <div className={cn('text-gray-500 font-mono', sizeClasses.time)}>
            {formatTime(departureTime)}
          </div>
        )}
      </div>

      {/* Flight Path */}
      <div className="flex items-center justify-center min-w-0 flex-1 px-2">
        <div className="flex items-center w-full">
          <div className="h-px bg-blue-300 flex-1"></div>
          <div className="h-px bg-blue-400 flex-1"></div>
          <div className="text-blue-600 mx-2 text-lg">✈️</div>
          <div className="h-px bg-blue-400 flex-1"></div>
          <div className="h-px bg-blue-300 flex-1"></div>
        </div>
        {duration && (
          <div className={cn('absolute text-gray-500 bg-white px-2 text-center', sizeClasses.time)}>
            {duration}
          </div>
        )}
      </div>

      {/* Arrival */}
      <div className="text-center min-w-0 flex-1">
        <div className={cn('text-gray-900', sizeClasses.airport)}>
          {arrival.code}
        </div>
        {showCities && (
          <div className={cn('text-gray-600 truncate', sizeClasses.city)}>
            {arrival.city}
          </div>
        )}
        {showTimes && arrivalTime && (
          <div className={cn('text-gray-500 font-mono', sizeClasses.time)}>
            {formatTime(arrivalTime)}
          </div>
        )}
      </div>
    </div>
  );
}