/**
 * DINO v2.0 - Flight Status Component
 * Modern flight app inspired status indicator
 */

import { FlightStatusProps, FLIGHT_STATUS_LABELS, FLIGHT_STATUS_COLORS } from '@/types/flight-ui';

const STATUS_ICONS = {
  'scheduled': '🕐',
  'on-time': '✅',
  'delayed': '⚠️', 
  'cancelled': '❌',
  'boarding': '🚪',
  'gate-change': '🔄',
  'departed': '🛫',
  'arrived': '🛬'
};

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

export function FlightStatus({ 
  status, 
  delay, 
  size = 'md', 
  showText = true,
  className 
}: FlightStatusProps) {
  const statusColors = FLIGHT_STATUS_COLORS[status];
  const statusLabel = FLIGHT_STATUS_LABELS[status];
  const icon = STATUS_ICONS[status];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border font-medium ${statusColors} ${sizeClass} ${className || ''}`}>
      <span className="text-sm">{icon}</span>
      {showText && (
        <>
          <span>{statusLabel}</span>
          {delay && delay.minutes > 0 && (
            <span className="ml-1">
              (+{delay.minutes}분)
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Pre-configured status components for common use cases
export function OnTimeStatus(props: Omit<FlightStatusProps, 'status'>) {
  return <FlightStatus {...props} status="on-time" />;
}

export function DelayedStatus(props: Omit<FlightStatusProps, 'status'>) {
  return <FlightStatus {...props} status="delayed" />;
}

export function CancelledStatus(props: Omit<FlightStatusProps, 'status'>) {
  return <FlightStatus {...props} status="cancelled" />;
}

export function BoardingStatus(props: Omit<FlightStatusProps, 'status'>) {
  return <FlightStatus {...props} status="boarding" />;
}