/**
 * DINO v2.0 - Test Flight UI Page
 * Test page to verify flight components are working
 */

'use client';

import { FlightCard } from '@/components/ui/FlightCard';
import { FlightRoute } from '@/components/ui/FlightRoute';
import { FlightStatus } from '@/components/ui/FlightStatus';
import type { Flight } from '@/types/flight';

const testFlight: Flight = {
  id: 'test-1',
  flightNumber: 'KE123',
  airline: {
    code: 'KE',
    name: 'Korean Air',
  },
  departure: {
    airport: {
      code: 'ICN',
      name: '인천국제공항',
      city: '서울',
      country: '대한민국',
      timezone: 'Asia/Seoul',
    },
    scheduledTime: new Date(),
    gate: 'A12',
    terminal: '1',
  },
  arrival: {
    airport: {
      code: 'NRT',
      name: '나리타국제공항',
      city: '도쿄',
      country: '일본',
      timezone: 'Asia/Tokyo',
    },
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    gate: 'B7',
    terminal: '1',
  },
  status: 'on-time',
  duration: '2시간 15분',
};

export default function TestFlightUIPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Flight UI Components Test</h1>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Flight Status</h2>
          <div className="flex gap-2 flex-wrap">
            <FlightStatus status="on-time" />
            <FlightStatus status="delayed" delay={{ minutes: 30 }} />
            <FlightStatus status="cancelled" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Flight Route</h2>
          <FlightRoute
            departure={testFlight.departure.airport}
            arrival={testFlight.arrival.airport}
            duration={testFlight.duration}
            showCities={true}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Flight Card</h2>
          <FlightCard flight={testFlight} variant="minimal" />
          <FlightCard flight={testFlight} variant="boarding-pass" />
        </div>
      </div>
    </div>
  );
}