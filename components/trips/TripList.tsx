'use client';

/**
 * DINO v2.0 - Trip List Component
 * Display and manage user's travel history
 */

import { useState } from 'react';
import type { Trip } from '@prisma/client';
import { isSchengenCountryCode } from '@/data/schengen-countries';

interface TripListProps {
  readonly trips: Trip[];
  readonly onTripDeleted: (tripId: string) => void;
}

export function TripList({ trips, onTripDeleted }: TripListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tripId: string) => {
    if (!confirm('이 여행 기록을 삭제하시겠습니까?')) {
      return;
    }

    setDeletingId(tripId);
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTripDeleted(tripId);
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStayDays = (entry: Date | string, exit?: Date | string | null) => {
    const entryDate = new Date(entry);
    const exitDate = exit ? new Date(exit) : new Date();
    const diffMs = exitDate.getTime() - entryDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          아직 여행 기록이 없습니다
        </h3>
        <p className="text-gray-600">
          첫 여행을 추가하고 셰겐 체류 일수를 추적해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const stayDays = calculateStayDays(trip.entryDate, trip.exitDate);
        const isSchengen = isSchengenCountryCode(trip.country);
        
        return (
          <div
            key={trip.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {trip.countryName}
                  </h3>
                  {isSchengen && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      🇪🇺 셰겐
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {trip.purpose === 'tourism' && '관광'}
                    {trip.purpose === 'business' && '사업'}
                    {trip.purpose === 'transit' && '경유'}
                    {trip.purpose === 'study' && '학업'}
                    {trip.purpose === 'work' && '업무'}
                    {trip.purpose === 'family_visit' && '가족 방문'}
                  </span>
                </div>
                
                <div className="text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">입국일:</span> {formatDate(trip.entryDate)}
                  </p>
                  <p>
                    <span className="font-medium">출국일:</span> {
                      trip.exitDate ? formatDate(trip.exitDate) : '현재 체류 중'
                    }
                  </p>
                  <p>
                    <span className="font-medium">체류 일수:</span> {
                      trip.exitDate ? (
                        <span>{stayDays}일</span>
                      ) : (
                        <span className="text-blue-600 font-medium">{stayDays}일 (진행 중)</span>
                      )
                    }
                  </p>
                  {trip.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">메모:</span> {trip.notes}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(trip.id)}
                disabled={deletingId === trip.id}
                className="ml-4 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              >
                {deletingId === trip.id ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}