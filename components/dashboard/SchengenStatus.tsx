/**
 * DINO v2.0 - Schengen Status Component
 * Real-time Schengen 90/180 day rule status
 */

import type { Trip } from '@prisma/client';
import { calculateSchengenDays } from '@/lib/schengen/calculator';

interface SchengenStatusProps {
  readonly trips: Trip[];
}

export function SchengenStatus({ trips }: SchengenStatusProps) {
  // Calculate Schengen days in the last 180 days
  const today = new Date();
  const schengenDays = calculateSchengenDays(trips, today);
  const remainingDays = 90 - schengenDays;
  const percentage = (schengenDays / 90) * 100;

  // Determine status color
  const getStatusColor = () => {
    if (schengenDays >= 90) return 'red';
    if (schengenDays >= 75) return 'orange';
    if (schengenDays >= 60) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          셰겐 지역 체류 현황 🇪🇺
        </h2>
        <span className="text-sm text-gray-500">
          최근 180일 기준
        </span>
      </div>

      {/* Status Badge */}
      <div className={`rounded-lg border-2 p-4 mb-4 ${colorClasses[statusColor]}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {schengenDays}일 / 90일
            </div>
            <div className="text-sm mt-1">
              {remainingDays > 0 
                ? `${remainingDays}일 더 체류 가능`
                : '체류 한도 초과!'
              }
            </div>
          </div>
          <div className="text-4xl">
            {statusColor === 'green' && '✅'}
            {statusColor === 'yellow' && '⚠️'}
            {statusColor === 'orange' && '⚠️'}
            {statusColor === 'red' && '🚨'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>사용률</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              statusColor === 'green' ? 'bg-green-500' :
              statusColor === 'yellow' ? 'bg-yellow-500' :
              statusColor === 'orange' ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Recent Schengen Trips */}
      {trips.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            최근 셰겐 지역 방문
          </h3>
          <div className="space-y-2">
            {trips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {trip.countryName}
                </span>
                <span className="text-gray-500">
                  {new Date(trip.entryDate).toLocaleDateString('ko-KR')}
                  {trip.exitDate && (
                    <> - {new Date(trip.exitDate).toLocaleDateString('ko-KR')}</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}