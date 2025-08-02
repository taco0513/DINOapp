/**
 * DINO v2.0 - Flight Confirmation Dialog
 * User confirmation dialog for each flight
 */

import React from 'react';
import { FlightRoute } from '@/components/ui/FlightRoute';
import type { FlightInfo } from '@/types/gmail';

interface FlightConfirmationDialogProps {
  readonly flight: FlightInfo;
  readonly confidence: number;
  readonly onConfirm: () => void;
  readonly onReject: () => void;
  readonly onEdit: (flight: FlightInfo) => void;
}

export function FlightConfirmationDialog({
  flight,
  confidence,
  onConfirm,
  onReject,
  onEdit,
}: FlightConfirmationDialogProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (conf >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceEmoji = (conf: number) => {
    if (conf >= 0.8) return '✅';
    if (conf >= 0.5) return '⚠️';
    return '❌';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✈️ 항공편 확인
          </h3>

          {/* Confidence Score */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 border ${getConfidenceColor(confidence)}`}>
            <span className="mr-2">{getConfidenceEmoji(confidence)}</span>
            신뢰도: {(confidence * 100).toFixed(0)}%
          </div>

          {/* Flight Details */}
          <div className="space-y-4 mb-6">
            {/* Flight Route */}
            <div className="bg-gray-50 rounded-lg p-4">
              <FlightRoute
                departure={{
                  code: flight.departureAirport.code || 'UNK',
                  name: flight.departureAirport.name || flight.departureAirport.city,
                  city: flight.departureAirport.city,
                  country: flight.departureAirport.country,
                  timezone: 'UTC'
                }}
                arrival={{
                  code: flight.arrivalAirport.code || 'UNK',
                  name: flight.arrivalAirport.name || flight.arrivalAirport.city,
                  city: flight.arrivalAirport.city,
                  country: flight.arrivalAirport.country,
                  timezone: 'UTC'
                }}
                showCities={true}
              />
            </div>

            {/* Flight Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">항공편 번호</label>
                <p className="font-medium">{flight.flightNumber}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">항공사</label>
                <p className="font-medium">{flight.airline}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">출발일</label>
                <p className="font-medium">
                  {new Date(flight.departureDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">출발 시간</label>
                <p className="font-medium">{flight.departureTime}</p>
              </div>
              {flight.bookingReference && (
                <div>
                  <label className="text-xs text-gray-500">예약 번호</label>
                  <p className="font-medium">{flight.bookingReference}</p>
                </div>
              )}
              {flight.passengerName && (
                <div>
                  <label className="text-xs text-gray-500">승객명</label>
                  <p className="font-medium">{flight.passengerName}</p>
                </div>
              )}
            </div>

            {/* Low Confidence Warning */}
            {confidence < 0.5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ 낮은 신뢰도</p>
                <p>이 항공편 정보는 신뢰도가 낮습니다. 정보를 다시 확인해주세요.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              ✅ 확인
            </button>
            <button
              onClick={() => onEdit(flight)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              ✏️ 수정
            </button>
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
            >
              ❌ 거부
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}