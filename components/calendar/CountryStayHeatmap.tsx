/**
 * DINO v2.0 - Country Stay Heatmap
 * Visual representation of time spent in each country
 */

'use client';

import { useMemo } from 'react';
import type { StayRecord } from '@/types/country-tracker';
import { COUNTRY_STAY_POLICIES } from '@/types/country-tracker';

interface CountryStayHeatmapProps {
  readonly stays: readonly StayRecord[];
  readonly onCountryClick?: (countryCode: string) => void;
}

interface CountryStats {
  countryCode: string;
  countryName: string;
  totalDays: number;
  visitCount: number;
  averageStay: number;
  longestStay: number;
  lastVisit: Date;
  flag: string;
}

export function CountryStayHeatmap({ stays, onCountryClick }: CountryStayHeatmapProps) {
  // Calculate country statistics
  const countryStats = useMemo(() => {
    const statsMap = new Map<string, CountryStats>();
    
    stays.forEach(stay => {
      const countryCode = stay.countryCode;
      const policy = COUNTRY_STAY_POLICIES[countryCode];
      const countryName = policy?.countryName || countryCode;
      
      // Calculate stay duration
      const entryDate = new Date(stay.entryDate);
      const exitDate = stay.exitDate ? new Date(stay.exitDate) : new Date();
      const stayDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const existing = statsMap.get(countryCode);
      if (existing) {
        existing.totalDays += stayDays;
        existing.visitCount += 1;
        existing.averageStay = existing.totalDays / existing.visitCount;
        existing.longestStay = Math.max(existing.longestStay, stayDays);
        existing.lastVisit = entryDate > existing.lastVisit ? entryDate : existing.lastVisit;
      } else {
        statsMap.set(countryCode, {
          countryCode,
          countryName,
          totalDays: stayDays,
          visitCount: 1,
          averageStay: stayDays,
          longestStay: stayDays,
          lastVisit: entryDate,
          flag: getCountryFlag(countryCode)
        });
      }
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.totalDays - a.totalDays);
  }, [stays]);

  const maxDays = Math.max(...countryStats.map(stat => stat.totalDays));

  // Get country flag
  function getCountryFlag(countryCode: string): string {
    const flags: Record<string, string> = {
      'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾', 'PH': '🇵🇭',
      'ID': '🇮🇩', 'SG': '🇸🇬', 'TW': '🇹🇼', 'JP': '🇯🇵',
      'AU': '🇦🇺', 'US': '🇺🇸', 'KR': '🇰🇷', 'GB': '🇬🇧'
    };
    return flags[countryCode] || '🌏';
  }

  // Get heat intensity color
  const getHeatColor = (days: number) => {
    const intensity = days / maxDays;
    
    if (intensity >= 0.8) return 'bg-red-500 text-white';
    if (intensity >= 0.6) return 'bg-red-400 text-white';
    if (intensity >= 0.4) return 'bg-orange-400 text-white';
    if (intensity >= 0.2) return 'bg-yellow-400 text-gray-900';
    return 'bg-green-300 text-gray-900';
  };

  // Get visit frequency color
  const getFrequencyColor = (visitCount: number) => {
    if (visitCount >= 10) return 'bg-purple-500';
    if (visitCount >= 5) return 'bg-purple-400';
    if (visitCount >= 3) return 'bg-blue-400';
    if (visitCount >= 2) return 'bg-blue-300';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🌍 국가별 체류 히트맵
        </h2>
        <p className="text-sm text-gray-600">
          어느 국가에 얼마나 오래 머물렀는지 한눈에 확인하세요
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {countryStats.length}
          </div>
          <div className="text-sm text-gray-600">방문 국가</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {countryStats.reduce((sum, stat) => sum + stat.totalDays, 0)}
          </div>
          <div className="text-sm text-gray-600">총 체류일</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {countryStats.reduce((sum, stat) => sum + stat.visitCount, 0)}
          </div>
          <div className="text-sm text-gray-600">총 방문 횟수</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(countryStats.reduce((sum, stat) => sum + stat.averageStay, 0) / countryStats.length) || 0}
          </div>
          <div className="text-sm text-gray-600">평균 체류일</div>
        </div>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countryStats.map(stat => (
          <div
            key={stat.countryCode}
            className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
              ${getHeatColor(stat.totalDays)}
            `}
            onClick={() => onCountryClick?.(stat.countryCode)}
          >
            {/* Country Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.flag}</span>
                <div>
                  <div className="font-bold text-sm">{stat.countryName}</div>
                  <div className="text-xs opacity-75">
                    최근 방문: {stat.lastVisit.toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold">{stat.totalDays}</div>
                <div className="text-xs opacity-75">일</div>
              </div>
            </div>

            {/* Progress Bar - Total Days */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1 opacity-75">
                <span>체류 기간</span>
                <span>{((stat.totalDays / maxDays) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div
                  className="bg-white/80 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stat.totalDays / maxDays) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-black/10 rounded">
                <div className="font-bold">{stat.visitCount}</div>
                <div className="opacity-75">방문</div>
              </div>
              <div className="text-center p-2 bg-black/10 rounded">
                <div className="font-bold">{Math.round(stat.averageStay)}</div>
                <div className="opacity-75">평균일</div>
              </div>
              <div className="text-center p-2 bg-black/10 rounded">
                <div className="font-bold">{stat.longestStay}</div>
                <div className="opacity-75">최장일</div>
              </div>
            </div>

            {/* Visit Frequency Indicator */}
            <div className="mt-3 flex items-center space-x-1">
              <span className="text-xs opacity-75">방문 빈도:</span>
              <div className="flex space-x-1">
                {[...Array(Math.min(stat.visitCount, 10))].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${getFrequencyColor(stat.visitCount)}`}
                  />
                ))}
                {stat.visitCount > 10 && (
                  <span className="text-xs opacity-75">+{stat.visitCount - 10}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heat Scale Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">체류 기간 범례</h4>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-600">적게</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <div className="w-4 h-4 bg-red-500 rounded"></div>
          </div>
          <span className="text-gray-600">많게</span>
        </div>
        
        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>1-2회 방문</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>3-4회 방문</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>5+회 방문</span>
          </div>
        </div>
      </div>
    </div>
  );
}