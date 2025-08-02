/**
 * DINO v2.0 - Recent Trips Component
 * Display user's recent travel history
 */

import Link from 'next/link';
import type { Trip } from '@prisma/client';
import { getCountryByCode } from '@/data/countries';

interface RecentTripsProps {
  readonly trips: Trip[];
}

export function RecentTrips({ trips }: RecentTripsProps) {
  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          최근 여행 ✈️
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600 mb-4">
            아직 여행 기록이 없습니다.
          </p>
          <Link
            href="/trips"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            첫 여행 추가하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          최근 여행 ✈️
        </h2>
        <Link
          href="/trips"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => {
          const country = getCountryByCode(trip.country);
          const stayDays = trip.stayDays || (trip.exitDate 
            ? Math.ceil(
                (new Date(trip.exitDate).getTime() - new Date(trip.entryDate).getTime()) / 
                (1000 * 60 * 60 * 24)
              ) + 1
            : Math.ceil(
                (new Date().getTime() - new Date(trip.entryDate).getTime()) / 
                (1000 * 60 * 60 * 24)
              ) + 1
          );

          return (
            <div
              key={trip.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {country?.isSchengen ? '🇪🇺' : '🌍'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {trip.countryName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(trip.entryDate).toLocaleDateString('ko-KR')}
                    {trip.exitDate ? (
                      <> - {new Date(trip.exitDate).toLocaleDateString('ko-KR')}</>
                    ) : (
                      <span className="text-blue-600"> (체류 중)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {stayDays}일
                </div>
                <div className="text-xs text-gray-500">
                  {trip.purpose === 'tourism' && '관광'}
                  {trip.purpose === 'business' && '사업'}
                  {trip.purpose === 'transit' && '경유'}
                  {trip.purpose === 'study' && '학업'}
                  {trip.purpose === 'work' && '업무'}
                  {trip.purpose === 'family_visit' && '가족 방문'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}