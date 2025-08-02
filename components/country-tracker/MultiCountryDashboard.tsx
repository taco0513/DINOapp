/**
 * DINO v2.0 - Multi-Country Travel Dashboard
 * Comprehensive overview of all country stay statuses
 */

'use client';

import { useMemo } from 'react';
import {
  calculateMultiCountryRealisticStatus
} from '@/lib/country-tracker/real-calculator';
import { COUNTRY_STAY_POLICIES } from '@/types/country-tracker';
import type { StayRecord } from '@/types/country-tracker';

interface MultiCountryDashboardProps {
  readonly stays: readonly StayRecord[];
  readonly nationality?: string;
}

export function MultiCountryDashboard({ 
  stays, 
  nationality = 'KR' 
}: MultiCountryDashboardProps) {
  const countryStatuses = useMemo(() => 
    calculateMultiCountryRealisticStatus(stays, nationality),
    [stays, nationality]
  );

  const supportedCountries = useMemo(() => Object.values(COUNTRY_STAY_POLICIES), []);

  // Filter countries with activity or warnings
  const activeCountries = Object.entries(countryStatuses).filter(
    ([, result]) => result.status.daysUsedThisPeriod > 0 || result.violations.length > 0
  );

  const getStatusColor = (warningLevel: string) => {
    switch (warningLevel) {
      case 'danger': return 'bg-red-100 border-red-500 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'caution': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-green-100 border-green-500 text-green-800';
    }
  };

  const getProgressColor = (warningLevel: string) => {
    switch (warningLevel) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾', 'PH': '🇵🇭',
      'ID': '🇮🇩', 'SG': '🇸🇬', 'TW': '🇹🇼', 'JP': '🇯🇵',
      'AU': '🇦🇺', 'US': '🇺🇸', 'KR': '🇰🇷'
    };
    return flags[countryCode] || '🌏';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🌍 다국가 체류 추적
        </h2>
        <p className="text-gray-600">
          디지털 노마드를 위한 실시간 체류 한도 모니터링
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {activeCountries.length}
            </div>
            <div className="text-sm text-gray-600">활성 국가</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {activeCountries.filter(([, r]) => r.status.warningLevel === 'safe').length}
            </div>
            <div className="text-sm text-gray-600">안전 상태</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {activeCountries.filter(([, r]) => 
                r.status.warningLevel === 'warning' || r.status.warningLevel === 'caution'
              ).length}
            </div>
            <div className="text-sm text-gray-600">주의 필요</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {activeCountries.filter(([, r]) => r.status.warningLevel === 'danger').length}
            </div>
            <div className="text-sm text-gray-600">위험 상태</div>
          </div>
        </div>
      </div>

      {/* Country Status Cards */}
      {activeCountries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCountries.map(([countryCode, result]) => (
            <div
              key={countryCode}
              className={`rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                getStatusColor(result.status.warningLevel)
              }`}
            >
              {/* Country Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCountryFlag(countryCode)}</span>
                  <div>
                    <div className="font-bold text-lg">
                      {supportedCountries.find(c => c.countryCode === countryCode)?.countryName || countryCode}
                    </div>
                    <div className="text-sm opacity-75">
                      {result.status.calculationMethod === 'per_entry' 
                        ? `1회 입국당 최대 ${result.status.maxDaysPerStay}일`
                        : result.status.maxDaysPerPeriod 
                          ? `기간당 ${result.status.maxDaysPerPeriod}일 한도`
                          : `최대 ${result.status.maxDaysPerStay}일`
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {result.status.daysRemainingThisPeriod}
                  </div>
                  <div className="text-sm opacity-75">일 남음</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>사용: {result.status.daysUsedThisPeriod}일</span>
                  <span>
                    {result.status.maxDaysPerPeriod 
                      ? Math.round((result.status.daysUsedThisPeriod / result.status.maxDaysPerPeriod) * 100)
                      : Math.round((result.status.daysUsedThisPeriod / result.status.maxDaysPerStay) * 100)
                    }%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(result.status.warningLevel)}`}
                    style={{
                      width: `${Math.min(100, 
                        result.status.maxDaysPerPeriod 
                          ? (result.status.daysUsedThisPeriod / result.status.maxDaysPerPeriod) * 100
                          : (result.status.daysUsedThisPeriod / result.status.maxDaysPerStay) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>계산 방식:</strong> {
                    result.status.calculationMethod === 'per_entry' ? '입국당 독립' :
                    result.status.calculationMethod === 'calendar_year' ? '캘린더 연도' :
                    result.status.calculationMethod === 'entry_based' ? '첫 입국 기준' :
                    result.status.calculationMethod === 'rolling_window' ? '롤링 윈도우' :
                    '기타'
                  }
                </div>
                
                {result.status.currentPeriodStart && result.status.currentPeriodEnd && (
                  <div className="text-sm">
                    <strong>기간:</strong> {result.status.currentPeriodStart.toLocaleDateString('ko-KR')} ~ {result.status.currentPeriodEnd.toLocaleDateString('ko-KR')}
                  </div>
                )}
                
                {result.status.additionalInfo?.daysInCurrentStay && result.status.additionalInfo.daysInCurrentStay > 0 && (
                  <div className="text-sm">
                    <strong>현재 체류:</strong> {result.status.additionalInfo.daysInCurrentStay}일째
                  </div>
                )}
                
                {result.status.nextAvailableDate && (
                  <div className="text-sm">
                    <strong>다음 입국 가능:</strong> {result.status.nextAvailableDate.toLocaleDateString('ko-KR')}
                  </div>
                )}

                {result.violations.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-800 mb-1">⚠️ 위반 사항</div>
                    {result.violations.map((violation, idx) => (
                      <div key={idx} className="text-xs text-red-700">
                        {violation.description}
                      </div>
                    ))}
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">💡 권장사항</div>
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-xs text-blue-700">
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            아직 여행 기록이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 여행을 추가해서 체류 한도 추적을 시작하세요!
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            여행 추가하기
          </button>
        </div>
      )}

      {/* Supported Countries Info */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 지원 국가 ({supportedCountries.length}개)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {supportedCountries.map((country) => (
            <div
              key={country.countryCode}
              className="flex items-center space-x-2 text-sm p-2 bg-white rounded-lg"
            >
              <span>{getCountryFlag(country.countryCode)}</span>
              <div>
                <div className="font-medium">{country.countryName}</div>
                <div className="text-xs text-gray-500">
                  {country.calculationMethod === 'per_entry' 
                    ? `${country.maxDaysPerStay}일/회`
                    : country.maxDaysPerPeriod 
                      ? `${country.maxDaysPerPeriod}일/기간`
                      : `${country.maxDaysPerStay}일`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}