/**
 * DINO v2.0 - Future Trip Validator
 * Validate planned trips against visa policies
 */

'use client';

import { useState, useMemo } from 'react';
import { validateFutureTrip } from '@/lib/country-tracker/real-calculator';
import type { StayRecord } from '@/types/country-tracker';
import { COUNTRY_STAY_POLICIES } from '@/types/country-tracker';

interface FutureTripValidatorProps {
  readonly existingStays: readonly StayRecord[];
  readonly nationality?: string;
}

interface PlannedTrip {
  countryCode: string;
  entryDate: string;
  exitDate: string;
  purpose: string;
}

export function FutureTripValidator({ 
  existingStays, 
  nationality = 'KR' 
}: FutureTripValidatorProps) {
  const [plannedTrip, setPlannedTrip] = useState<PlannedTrip>({
    countryCode: 'TH',
    entryDate: '',
    exitDate: '',
    purpose: 'tourism'
  });

  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warnings: string[];
    daysUsedAfter: number;
  } | null>(null);

  // Available countries
  const availableCountries = useMemo(() => 
    Object.values(COUNTRY_STAY_POLICIES)
  , []);

  // Get country flag
  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾', 'PH': '🇵🇭',
      'ID': '🇮🇩', 'SG': '🇸🇬', 'TW': '🇹🇼', 'JP': '🇯🇵',
      'AU': '🇦🇺', 'US': '🇺🇸', 'KR': '🇰🇷', 'GB': '🇬🇧'
    };
    return flags[countryCode] || '🌏';
  };

  // Validate trip
  const handleValidation = () => {
    if (!plannedTrip.entryDate || !plannedTrip.exitDate) {
      return;
    }

    const entryDate = new Date(plannedTrip.entryDate);
    const exitDate = new Date(plannedTrip.exitDate);

    if (exitDate <= entryDate) {
      setValidationResult({
        isValid: false,
        warnings: ['출국일은 입국일보다 늦어야 합니다.'],
        daysUsedAfter: 0
      });
      return;
    }

    const result = validateFutureTrip(
      existingStays,
      entryDate,
      exitDate,
      plannedTrip.countryCode,
      nationality
    );

    setValidationResult(result);
  };

  // Calculate trip duration
  const tripDuration = useMemo(() => {
    if (!plannedTrip.entryDate || !plannedTrip.exitDate) return 0;
    
    const entry = new Date(plannedTrip.entryDate);
    const exit = new Date(plannedTrip.exitDate);
    return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [plannedTrip.entryDate, plannedTrip.exitDate]);

  // Get policy for selected country
  const selectedPolicy = COUNTRY_STAY_POLICIES[plannedTrip.countryCode];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ✈️ 미래 여행 계획 검증
        </h2>
        <p className="text-sm text-gray-600">
          계획된 여행이 비자 정책에 맞는지 미리 확인하세요
        </p>
      </div>

      {/* Trip Planning Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목적지 국가
            </label>
            <select
              value={plannedTrip.countryCode}
              onChange={(e) => setPlannedTrip(prev => ({ ...prev, countryCode: e.target.value }))}
              className="form-select"
            >
              {availableCountries.map(country => (
                <option key={country.countryCode} value={country.countryCode}>
                  {getCountryFlag(country.countryCode)} {country.countryName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입국일
              </label>
              <input
                type="date"
                value={plannedTrip.entryDate}
                onChange={(e) => setPlannedTrip(prev => ({ ...prev, entryDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출국일
              </label>
              <input
                type="date"
                value={plannedTrip.exitDate}
                onChange={(e) => setPlannedTrip(prev => ({ ...prev, exitDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방문 목적
            </label>
            <select
              value={plannedTrip.purpose}
              onChange={(e) => setPlannedTrip(prev => ({ ...prev, purpose: e.target.value }))}
              className="form-select"
            >
              <option value="tourism">관광</option>
              <option value="business">비즈니스</option>
              <option value="transit">경유</option>
              <option value="study">연수</option>
              <option value="work">업무</option>
            </select>
          </div>

          {/* Trip Duration Display */}
          {tripDuration > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-medium">📅 계획된 체류기간:</span>
                <span className="text-blue-800 font-bold">{tripDuration}일</span>
              </div>
            </div>
          )}

          {/* Validate Button */}
          <button
            onClick={handleValidation}
            disabled={!plannedTrip.entryDate || !plannedTrip.exitDate}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            여행 계획 검증하기
          </button>
        </div>

        {/* Right Column - Results & Policy Info */}
        <div className="space-y-6">
          {/* Selected Country Policy */}
          {selectedPolicy && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getCountryFlag(plannedTrip.countryCode)}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPolicy.countryName}</h3>
                  <p className="text-sm text-gray-600">{selectedPolicy.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white rounded">
                  <div className="font-medium text-gray-700">1회 최대</div>
                  <div className="text-blue-600 font-bold">{selectedPolicy.maxDaysPerStay}일</div>
                </div>
                <div className="p-2 bg-white rounded">
                  <div className="font-medium text-gray-700">계산 방식</div>
                  <div className="text-blue-600 font-bold text-xs">
                    {selectedPolicy.calculationMethod === 'per_entry' ? '입국당 독립' :
                     selectedPolicy.calculationMethod === 'calendar_year' ? '캘린더 연도' :
                     selectedPolicy.calculationMethod === 'rolling_window' ? '롤링 윈도우' :
                     '기타'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className={`p-4 rounded-lg ${
              validationResult.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`flex items-center space-x-2 mb-3 ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                <span className="text-xl">
                  {validationResult.isValid ? '✅' : '❌'}
                </span>
                <span className="font-bold">
                  {validationResult.isValid ? '여행 가능' : '여행 불가능'}
                </span>
              </div>

              {validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      validationResult.isValid 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {validationResult.daysUsedAfter > 0 && (
                <div className="mt-3 p-2 bg-white rounded text-sm">
                  <span className="font-medium">여행 후 총 사용일:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {validationResult.daysUsedAfter}일
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 여행 계획 팁</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 출입국 스탬프 날짜를 정확히 기록하세요</li>
              <li>• 체류 한도는 입출국일을 모두 포함합니다</li>
              <li>• 국가별로 계산 방식이 다릅니다</li>
              <li>• 여권 유효기간도 확인하세요 (보통 6개월 이상)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}