/**
 * DINO v2.0 - Travel Analytics Dashboard
 * Unified interface for all travel visualization and planning tools
 */

'use client';

import { useState } from 'react';
import { TravelTimelineCalendar } from '@/components/calendar/TravelTimelineCalendar';
import { CountryStayHeatmap } from '@/components/calendar/CountryStayHeatmap';
import { FutureTripValidator } from '@/components/calendar/FutureTripValidator';
import { SchengenCalculatorWidget } from '@/components/schengen/SchengenCalculatorWidget';
import type { StayRecord } from '@/types/country-tracker';

interface TravelAnalyticsDashboardProps {
  readonly stays: readonly StayRecord[];
  readonly nationality?: string;
}

type DashboardView = 'overview' | 'calendar' | 'heatmap' | 'validator' | 'schengen';

export function TravelAnalyticsDashboard({ 
  stays, 
  nationality = 'KR' 
}: TravelAnalyticsDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Quick stats
  const totalCountries = new Set(stays.map(stay => stay.countryCode)).size;
  const totalDays = stays.reduce((sum, stay) => {
    const entry = new Date(stay.entryDate);
    const exit = stay.exitDate ? new Date(stay.exitDate) : new Date();
    return sum + Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  const currentStays = stays.filter(stay => !stay.exitDate);

  // Navigation items
  const navItems = [
    { id: 'overview' as const, label: '📊 대시보드', icon: '📊' },
    { id: 'calendar' as const, label: '📅 여행 캘린더', icon: '📅' },
    { id: 'heatmap' as const, label: '🌍 국가별 통계', icon: '🌍' },
    { id: 'validator' as const, label: '✈️ 여행 계획', icon: '✈️' },
    { id: 'schengen' as const, label: '🇪🇺 샹겐 계산기', icon: '🇪🇺' }
  ];

  // Handle country selection from heatmap
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setActiveView('calendar'); // Switch to calendar to show selected country
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">🧳 여행 분석 대시보드</h1>
        <p className="text-blue-100">
          디지털 노마드를 위한 종합 여행 관리 시스템
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{totalCountries}</div>
            <div className="text-sm text-blue-100">방문 국가</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{totalDays}</div>
            <div className="text-sm text-blue-100">총 여행일</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stays.length}</div>
            <div className="text-sm text-blue-100">여행 기록</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{currentStays.length}</div>
            <div className="text-sm text-blue-100">현재 체류</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200
                ${activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              aria-label={`${item.label} 탭으로 전환`}
              aria-pressed={activeView === item.id}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mini Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">📅 최근 여행</h2>
                <button
                  onClick={() => setActiveView('calendar')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  aria-label="여행 캘린더 전체 보기"
                >
                  전체 보기 →
                </button>
              </div>
              
              <div className="space-y-3">
                {stays.slice(-5).reverse().map((stay) => (
                  <div key={stay.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {stay.countryCode === 'VN' ? '🇻🇳' :
                       stay.countryCode === 'TH' ? '🇹🇭' :
                       stay.countryCode === 'MY' ? '🇲🇾' : '🌏'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {stay.countryCode === 'VN' ? '베트남' :
                         stay.countryCode === 'TH' ? '태국' :
                         stay.countryCode === 'MY' ? '말레이시아' : stay.countryCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(stay.entryDate).toLocaleDateString('ko-KR')} ~ 
                        {stay.exitDate ? new Date(stay.exitDate).toLocaleDateString('ko-KR') : '현재'}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {Math.ceil((
                        (stay.exitDate ? new Date(stay.exitDate) : new Date()).getTime() - 
                        new Date(stay.entryDate).getTime()
                      ) / (1000 * 60 * 60 * 24))}일
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Heatmap */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🌍 주요 국가</h2>
                <button
                  onClick={() => setActiveView('heatmap')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  aria-label="국가별 통계 전체 보기"
                >
                  전체 보기 →
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(
                  stays.reduce((acc, stay) => {
                    const country = stay.countryCode;
                    const days = Math.ceil((
                      (stay.exitDate ? new Date(stay.exitDate) : new Date()).getTime() - 
                      new Date(stay.entryDate).getTime()
                    ) / (1000 * 60 * 60 * 24));
                    
                    acc[country] = (acc[country] || 0) + days;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a).slice(0, 5).map(([country, days]) => (
                  <div key={country} className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {country === 'VN' ? '🇻🇳' :
                       country === 'TH' ? '🇹🇭' :
                       country === 'MY' ? '🇲🇾' : '🌏'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {country === 'VN' ? '베트남' :
                         country === 'TH' ? '태국' :
                         country === 'MY' ? '말레이시아' : country}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(days / totalDays) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {days}일
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">🚀 빠른 작업</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveView('validator')}
                  className="p-4 border-2 border-dashed border-blue-300 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  aria-label="새 여행 계획 - 비자 정책 확인"
                >
                  <div className="text-2xl mb-2">✈️</div>
                  <div className="font-medium text-gray-900">새 여행 계획</div>
                  <div className="text-sm text-gray-600">비자 정책 확인</div>
                </button>

                <button
                  onClick={() => setActiveView('schengen')}
                  className="p-4 border-2 border-dashed border-orange-300 rounded-xl text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  aria-label="샹겐 계산기 - 90/180일 규칙 체크"
                >
                  <div className="text-2xl mb-2">🇪🇺</div>
                  <div className="font-medium text-gray-900">샹겐 계산기</div>
                  <div className="text-sm text-gray-600">90/180일 체크</div>
                </button>

                <button
                  onClick={() => setActiveView('calendar')}
                  className="p-4 border-2 border-dashed border-green-300 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-colors"
                  aria-label="여행 기록 보기 - 월별 타임라인"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-medium text-gray-900">여행 기록 보기</div>
                  <div className="text-sm text-gray-600">월별 타임라인</div>
                </button>

                <button
                  onClick={() => setActiveView('heatmap')}
                  className="p-4 border-2 border-dashed border-purple-300 rounded-xl text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  aria-label="통계 분석 - 국가별 현황"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900">통계 분석</div>
                  <div className="text-sm text-gray-600">국가별 현황</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <TravelTimelineCalendar
            stays={stays}
            onDateClick={handleDateSelect}
            highlightCountry={selectedCountry}
          />
        )}

        {activeView === 'heatmap' && (
          <CountryStayHeatmap
            stays={stays}
            onCountryClick={handleCountrySelect}
          />
        )}

        {activeView === 'validator' && (
          <FutureTripValidator
            existingStays={stays}
            nationality={nationality}
          />
        )}

        {activeView === 'schengen' && (
          <SchengenCalculatorWidget
            stays={stays}
            nationality={nationality}
            onSelectDate={handleDateSelect}
          />
        )}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-medium text-blue-900">
                  선택된 날짜: {selectedDate.toLocaleDateString('ko-KR')}
                </div>
                <div className="text-sm text-blue-700">
                  이 날짜의 여행 활동을 확인해보세요
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(undefined)}
              className="text-blue-600 hover:text-blue-700"
              aria-label="선택된 날짜 정보 닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Selected Country Info */}
      {selectedCountry && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {selectedCountry === 'VN' ? '🇻🇳' :
                 selectedCountry === 'TH' ? '🇹🇭' :
                 selectedCountry === 'MY' ? '🇲🇾' : '🌏'}
              </span>
              <div>
                <div className="font-medium text-green-900">
                  선택된 국가: {selectedCountry === 'VN' ? '베트남' :
                               selectedCountry === 'TH' ? '태국' :
                               selectedCountry === 'MY' ? '말레이시아' : selectedCountry}
                </div>
                <div className="text-sm text-green-700">
                  캘린더에서 해당 국가 체류 기간이 강조표시됩니다
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountry(undefined)}
              className="text-green-600 hover:text-green-700"
              aria-label="선택된 국가 정보 닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}