/**
 * DINO v2.0 - Flight Card Demo Component
 * Example usage of flight components with sample Korean nomad data
 */

'use client';

import { useState } from 'react';
import { Flight } from '@/types/flight';
import { FlightCard, FlightList } from './FlightCard';
import { FlightStatus } from './FlightStatus';
import { FlightRoute } from './FlightRoute';

// Sample flight data for Korean digital nomads
const sampleFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'KE12',
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
      scheduledTime: new Date('2024-08-15T14:30:00+09:00'),
      actualTime: new Date('2024-08-15T14:30:00+09:00'),
      gate: 'A12',
      terminal: '1',
    },
    arrival: {
      airport: {
        code: 'LAX',
        name: 'Los Angeles International',
        city: 'Los Angeles',
        country: '미국',
        timezone: 'America/Los_Angeles',
      },
      scheduledTime: new Date('2024-08-15T09:45:00-07:00'),
      actualTime: new Date('2024-08-15T09:45:00-07:00'),
      gate: '52B',
      terminal: 'TBIT',
    },
    status: 'on-time',
    duration: '11시간 30분',
    seat: '12A',
    bookingRef: 'ABC123',
    passengerName: '김디지털',
  },
  {
    id: '2',
    flightNumber: 'SQ317',
    airline: {
      code: 'SQ',
      name: 'Singapore Airlines',
    },
    departure: {
      airport: {
        code: 'SIN',
        name: '싱가포르 창이공항',
        city: '싱가포르',
        country: '싱가포르',
        timezone: 'Asia/Singapore',
      },
      scheduledTime: new Date('2024-08-20T23:55:00+08:00'),
      actualTime: new Date('2024-08-21T00:15:00+08:00'),
      gate: 'C15',
      terminal: '3',
    },
    arrival: {
      airport: {
        code: 'LHR',
        name: 'Heathrow Airport',
        city: '런던',
        country: '영국',
        timezone: 'Europe/London',
      },
      scheduledTime: new Date('2024-08-21T06:25:00+01:00'),
      actualTime: new Date('2024-08-21T06:45:00+01:00'),
      gate: 'T3-25',
      terminal: '3',
    },
    status: 'delayed',
    duration: '13시간 30분',
    seat: '34K',
    delay: {
      minutes: 20,
      reason: '지상 교통 체증',
    },
  },
  {
    id: '3',
    flightNumber: 'JL514',
    airline: {
      code: 'JL',
      name: 'JAL',
    },
    departure: {
      airport: {
        code: 'NRT',
        name: '나리타국제공항',
        city: '도쿄',
        country: '일본',
        timezone: 'Asia/Tokyo',
      },
      scheduledTime: new Date('2024-08-25T17:20:00+09:00'),
      gate: '21',
      terminal: '1',
    },
    arrival: {
      airport: {
        code: 'ICN',
        name: '인천국제공항',
        city: '서울',
        country: '대한민국',
        timezone: 'Asia/Seoul',
      },
      scheduledTime: new Date('2024-08-25T19:55:00+09:00'),
      gate: 'B8',
      terminal: '1',
    },
    status: 'boarding',
    duration: '2시간 35분',
    seat: '15F',
  },
  {
    id: '4',
    flightNumber: 'TG659',
    airline: {
      code: 'TG',
      name: 'Thai Airways',
    },
    departure: {
      airport: {
        code: 'BKK',
        name: '수완나품국제공항',
        city: '방콕',
        country: '태국',
        timezone: 'Asia/Bangkok',
      },
      scheduledTime: new Date('2024-08-30T08:30:00+07:00'),
      gate: 'D6',
      terminal: '1',
    },
    arrival: {
      airport: {
        code: 'ICN',
        name: '인천국제공항',
        city: '서울',
        country: '대한민국',
        timezone: 'Asia/Seoul',
      },
      scheduledTime: new Date('2024-08-30T16:10:00+09:00'),
      gate: 'TBD',
      terminal: '1',
    },
    status: 'gate-change',
    duration: '5시간 40분',
    seat: '28C',
  },
];

export function FlightCardDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'boarding-pass' | 'minimal' | 'detailed'>('boarding-pass');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">항공편 카드 컴포넌트</h1>
        <p className="text-gray-600">디지털 노마드를 위한 현대적인 항공편 카드 UI</p>
      </div>

      {/* Variant selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedVariant('boarding-pass')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedVariant === 'boarding-pass'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          탑승권 스타일
        </button>
        <button
          onClick={() => setSelectedVariant('minimal')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedVariant === 'minimal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          미니멀 스타일
        </button>
        <button
          onClick={() => setSelectedVariant('detailed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedVariant === 'detailed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          상세 스타일
        </button>
      </div>

      {/* Flight status examples */}
      <div>
        <h2 className="text-xl font-semibold mb-4">항공편 상태 표시</h2>
        <div className="flex flex-wrap gap-3">
          <FlightStatus status="on-time" />
          <FlightStatus status="delayed" delay={{ minutes: 30, reason: '기상 악화' }} />
          <FlightStatus status="boarding" />
          <FlightStatus status="cancelled" />
          <FlightStatus status="gate-change" />
          <FlightStatus status="departed" />
          <FlightStatus status="arrived" />
        </div>
      </div>

      {/* Flight route examples */}
      <div>
        <h2 className="text-xl font-semibold mb-4">항공편 경로 표시</h2>
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">기본 가로형</h3>
            <FlightRoute
              departure={sampleFlights[0].departure.airport}
              arrival={sampleFlights[0].arrival.airport}
              duration="11시간 30분"
              showCities={true}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">컴팩트형</h3>
            <FlightRoute
              departure={sampleFlights[1].departure.airport}
              arrival={sampleFlights[1].arrival.airport}
              size="sm"
              showCities={false}
            />
          </div>

          <div className="max-w-xs">
            <h3 className="text-sm font-medium text-gray-700 mb-3">세로형</h3>
            <FlightRoute
              departure={sampleFlights[2].departure.airport}
              arrival={sampleFlights[2].arrival.airport}
              variant="vertical"
              duration="2시간 35분"
              showCities={true}
            />
          </div>
        </div>
      </div>

      {/* Flight cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">항공편 카드 ({selectedVariant})</h2>
        <FlightList
          flights={sampleFlights}
          variant={selectedVariant}
          onFlightClick={setSelectedFlight}
        />
      </div>

      {/* Selected flight details modal */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">항공편 상세 정보</h3>
                <button
                  onClick={() => setSelectedFlight(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <FlightCard
                flight={selectedFlight}
                variant="detailed"
                showPassengerInfo={true}
                showBookingRef={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}