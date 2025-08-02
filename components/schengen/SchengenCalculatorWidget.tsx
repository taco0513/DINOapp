/**
 * DINO v2.0 - Schengen Calculator Widget
 * Integrated 90/180 day rule calculator for analytics dashboard
 */

'use client';

import { useState, useMemo } from 'react';
import { StayRecord } from '@/types/travel';
import { calculateSchengenStatus, generateWarnings, validateFutureTrip } from '@/lib/schengen/calculator';
import { CountryVisit } from '@/types/schengen';

interface SchengenCalculatorWidgetProps {
  stays: StayRecord[];
  nationality?: string;
  onSelectDate?: (date: Date) => void;
}

export function SchengenCalculatorWidget({ 
  stays, 
  nationality: _nationality = 'KR',
  onSelectDate 
}: SchengenCalculatorWidgetProps) {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [showFutureTripValidator, setShowFutureTripValidator] = useState(false);
  const [plannedEntry, setPlannedEntry] = useState('');
  const [plannedExit, setPlannedExit] = useState('');
  const [plannedCountry, setPlannedCountry] = useState('');

  // Convert StayRecord to CountryVisit format
  const visits: CountryVisit[] = useMemo(() => {
    return stays.map((stay, index) => ({
      id: stay.id || `stay-${index}`,
      userId: 'current-user',
      country: stay.countryCode,
      entryDate: stay.entryDate.toISOString().split('T')[0],
      exitDate: stay.exitDate ? stay.exitDate.toISOString().split('T')[0] : null,
      visaType: 'Tourist',
      maxDays: 90,
      notes: stay.notes || '',
      createdAt: stay.entryDate,
      updatedAt: stay.entryDate
    }));
  }, [stays]);

  // Calculate Schengen status
  const schengenStatus = useMemo(() => {
    return calculateSchengenStatus(visits, referenceDate);
  }, [visits, referenceDate]);

  const warnings = useMemo(() => {
    return generateWarnings(schengenStatus);
  }, [schengenStatus]);

  // Validate future trip if data is provided
  const futureTripValidation = useMemo(() => {
    if (!plannedEntry || !plannedExit || !plannedCountry) return null;
    
    try {
      const entryDate = new Date(plannedEntry);
      const exitDate = new Date(plannedExit);
      return validateFutureTrip(visits, entryDate, exitDate, plannedCountry);
    } catch {
      return null;
    }
  }, [visits, plannedEntry, plannedExit, plannedCountry]);

  // Get status color
  const getStatusColor = () => {
    if (!schengenStatus.isCompliant) return 'text-red-600 bg-red-50';
    if (schengenStatus.remainingDays <= 10) return 'text-orange-600 bg-orange-50';
    if (schengenStatus.remainingDays <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressBarColor = () => {
    const percentage = (schengenStatus.usedDays / 90) * 100;
    if (percentage > 100) return 'bg-red-600';
    if (percentage > 80) return 'bg-orange-600';
    if (percentage > 60) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">🇪🇺 샹겐 90/180일 계산기</h3>
        <p className="text-gray-600">샹겐 지역 체류 일수를 실시간으로 계산하고 관리하세요</p>
      </div>

      {/* Reference Date Selector */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기준 날짜 선택
        </label>
        <input
          type="date"
          value={referenceDate.toISOString().split('T')[0]}
          onChange={(e) => {
            const date = new Date(e.target.value);
            setReferenceDate(date);
            onSelectDate?.(date);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Current Status */}
      <div className={`rounded-xl p-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">현재 상태</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            schengenStatus.isCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {schengenStatus.isCompliant ? '규정 준수' : '규정 위반'}
          </span>
        </div>

        {/* Days Counter */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-3xl font-bold mb-1">{schengenStatus.usedDays}일</div>
            <div className="text-sm opacity-80">사용한 일수</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{schengenStatus.remainingDays}일</div>
            <div className="text-sm opacity-80">남은 일수</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>180일 기간 내 체류</span>
            <span>{schengenStatus.usedDays} / 90일</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min((schengenStatus.usedDays / 90) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Next Reset Date */}
        <div className="text-sm">
          <span className="font-medium">다음 리셋 날짜:</span>{' '}
          {new Date(schengenStatus.nextResetDate).toLocaleDateString('ko-KR')}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h4 className="font-semibold text-orange-900 mb-2">주의사항</h4>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-orange-800 flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Trip Validator Toggle */}
      <button
        onClick={() => setShowFutureTripValidator(!showFutureTripValidator)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        {showFutureTripValidator ? '미래 여행 검증기 닫기' : '미래 여행 계획 검증하기'}
      </button>

      {/* Future Trip Validator */}
      {showFutureTripValidator && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">미래 여행 계획 검증</h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목적지 국가
              </label>
              <select
                value={plannedCountry}
                onChange={(e) => setPlannedCountry(e.target.value)}
                className="form-select"
              >
                <option value="">선택하세요</option>
                <option value="Germany">독일</option>
                <option value="France">프랑스</option>
                <option value="Italy">이탈리아</option>
                <option value="Spain">스페인</option>
                <option value="Netherlands">네덜란드</option>
                <option value="Belgium">벨기에</option>
                <option value="Turkey">터키 (비샹겐)</option>
                <option value="UK">영국 (비샹겐)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입국 예정일
              </label>
              <input
                type="date"
                value={plannedEntry}
                onChange={(e) => setPlannedEntry(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출국 예정일
              </label>
              <input
                type="date"
                value={plannedExit}
                onChange={(e) => setPlannedExit(e.target.value)}
                min={plannedEntry || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Validation Results */}
          {futureTripValidation && (
            <div className={`rounded-lg p-4 ${
              futureTripValidation.canTravel ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">
                  {futureTripValidation.canTravel ? '✅' : '❌'}
                </span>
                <span className={`font-semibold ${
                  futureTripValidation.canTravel ? 'text-green-900' : 'text-red-900'
                }`}>
                  {futureTripValidation.canTravel ? '여행 가능' : '여행 불가'}
                </span>
              </div>

              {futureTripValidation.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="font-medium text-red-800 mb-2">경고:</div>
                  {futureTripValidation.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-red-700 ml-4">
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {futureTripValidation.suggestions.length > 0 && (
                <div>
                  <div className="font-medium text-gray-800 mb-2">제안:</div>
                  {futureTripValidation.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm text-gray-700 ml-4">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {futureTripValidation.canTravel && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>여행 후 사용 일수: {futureTripValidation.daysUsedAfterTrip}일</div>
                  <div>여행 후 남은 일수: {futureTripValidation.remainingDaysAfterTrip}일</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 샹겐 90/180일 규칙이란?</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• 180일 기간 내에서 최대 90일까지만 체류 가능</p>
          <p>• 매일 180일 전부터 오늘까지를 계산하는 이동 기간</p>
          <p>• 샹겐 29개국에 공통으로 적용 (프랑스, 독일, 이탈리아 등)</p>
          <p>• 영국, 아일랜드, 루마니아, 불가리아는 별도 계산</p>
        </div>
      </div>
    </div>
  );
}