/**
 * DINO v2.0 - Flight Edit Dialog
 * Edit flight information before confirmation
 */

import React, { useState } from 'react';
import type { FlightInfo, AirportInfo } from '@/types/gmail';

interface FlightEditDialogProps {
  readonly flight: FlightInfo;
  readonly onSave: (flight: FlightInfo) => void;
  readonly onCancel: () => void;
}

export function FlightEditDialog({ flight, onSave, onCancel }: FlightEditDialogProps) {
  const [editedFlight, setEditedFlight] = useState<FlightInfo>({ ...flight });

  const handleSave = () => {
    onSave(editedFlight);
  };

  const updateDepartureAirport = (field: keyof AirportInfo, value: string) => {
    setEditedFlight({
      ...editedFlight,
      departureAirport: {
        ...editedFlight.departureAirport,
        [field]: value,
      },
    });
  };

  const updateArrivalAirport = (field: keyof AirportInfo, value: string) => {
    setEditedFlight({
      ...editedFlight,
      arrivalAirport: {
        ...editedFlight.arrivalAirport,
        [field]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✏️ 항공편 정보 수정
          </h3>

          <div className="space-y-6">
            {/* Flight Number and Airline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  항공편 번호
                </label>
                <input
                  type="text"
                  value={editedFlight.flightNumber}
                  onChange={(e) => setEditedFlight({ ...editedFlight, flightNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: KE123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  항공사
                </label>
                <input
                  type="text"
                  value={editedFlight.airline}
                  onChange={(e) => setEditedFlight({ ...editedFlight, airline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Korean Air"
                />
              </div>
            </div>

            {/* Departure Airport */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">출발 공항</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">공항 코드</label>
                  <input
                    type="text"
                    value={editedFlight.departureAirport.code || ''}
                    onChange={(e) => updateDepartureAirport('code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: ICN"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">도시</label>
                  <input
                    type="text"
                    value={editedFlight.departureAirport.city}
                    onChange={(e) => updateDepartureAirport('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: Seoul"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">국가</label>
                  <input
                    type="text"
                    value={editedFlight.departureAirport.country}
                    onChange={(e) => updateDepartureAirport('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: South Korea"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">국가 코드</label>
                  <input
                    type="text"
                    value={editedFlight.departureAirport.countryCode}
                    onChange={(e) => updateDepartureAirport('countryCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: KR"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Arrival Airport */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">도착 공항</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">공항 코드</label>
                  <input
                    type="text"
                    value={editedFlight.arrivalAirport.code || ''}
                    onChange={(e) => updateArrivalAirport('code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: LAX"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">도시</label>
                  <input
                    type="text"
                    value={editedFlight.arrivalAirport.city}
                    onChange={(e) => updateArrivalAirport('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">국가</label>
                  <input
                    type="text"
                    value={editedFlight.arrivalAirport.country}
                    onChange={(e) => updateArrivalAirport('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: United States"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">국가 코드</label>
                  <input
                    type="text"
                    value={editedFlight.arrivalAirport.countryCode}
                    onChange={(e) => updateArrivalAirport('countryCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: US"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출발일
                </label>
                <input
                  type="date"
                  value={new Date(editedFlight.departureDate).toISOString().split('T')[0]}
                  onChange={(e) => setEditedFlight({ 
                    ...editedFlight, 
                    departureDate: new Date(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출발 시간
                </label>
                <input
                  type="text"
                  value={editedFlight.departureTime}
                  onChange={(e) => setEditedFlight({ ...editedFlight, departureTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 14:30"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 번호 (선택)
                </label>
                <input
                  type="text"
                  value={editedFlight.bookingReference || ''}
                  onChange={(e) => setEditedFlight({ 
                    ...editedFlight, 
                    bookingReference: e.target.value || null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: ABC123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  승객명 (선택)
                </label>
                <input
                  type="text"
                  value={editedFlight.passengerName || ''}
                  onChange={(e) => setEditedFlight({ 
                    ...editedFlight, 
                    passengerName: e.target.value || null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: John Doe"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              💾 저장
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}