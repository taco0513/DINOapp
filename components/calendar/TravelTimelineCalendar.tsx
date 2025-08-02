/**
 * DINO v2.0 - Travel Timeline Calendar
 * Visual representation of all travel history with country-specific insights
 */

'use client';

import { useState, useMemo } from 'react';
import type { StayRecord } from '@/types/country-tracker';
import { COUNTRY_STAY_POLICIES } from '@/types/country-tracker';

interface TravelTimelineCalendarProps {
  readonly stays: readonly StayRecord[];
  readonly onDateClick?: (date: Date) => void;
  readonly highlightCountry?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  stays: StayRecord[];
  isToday: boolean;
  hasActivity: boolean;
}

export function TravelTimelineCalendar({
  stays,
  onDateClick,
  highlightCountry
}: TravelTimelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayStays = stays.filter(stay => {
        const stayStart = new Date(stay.entryDate);
        const stayEnd = stay.exitDate ? new Date(stay.exitDate) : new Date();
        return date >= stayStart && date <= stayEnd;
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        stays: dayStays,
        isToday: date.toDateString() === today.toDateString(),
        hasActivity: dayStays.length > 0
      });
    }
    
    return days;
  }, [currentDate, stays]);

  // Get country flag
  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾', 'PH': '🇵🇭',
      'ID': '🇮🇩', 'SG': '🇸🇬', 'TW': '🇹🇼', 'JP': '🇯🇵',
      'AU': '🇦🇺', 'US': '🇺🇸', 'KR': '🇰🇷', 'GB': '🇬🇧'
    };
    return flags[countryCode] || '🌏';
  };

  // Get country name
  const getCountryName = (countryCode: string) => {
    return COUNTRY_STAY_POLICIES[countryCode]?.countryName || countryCode;
  };

  // Navigate months
  const navigateMonth = (direction: 1 | -1) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Get day background color based on stays
  const getDayColor = (day: CalendarDay) => {
    if (!day.hasActivity) {
      return day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400';
    }

    const primaryStay = day.stays[0];
    const isHighlighted = highlightCountry && day.stays.some(stay => stay.countryCode === highlightCountry);
    
    if (isHighlighted) {
      return 'bg-blue-100 border-2 border-blue-500 text-blue-900';
    }

    // Different colors for different countries
    const colorMap: Record<string, string> = {
      'VN': 'bg-red-100 text-red-800',
      'TH': 'bg-yellow-100 text-yellow-800', 
      'MY': 'bg-green-100 text-green-800',
      'JP': 'bg-pink-100 text-pink-800',
      'SG': 'bg-purple-100 text-purple-800',
      'KR': 'bg-blue-100 text-blue-800'
    };

    return colorMap[primaryStay.countryCode] || 'bg-gray-100 text-gray-800';
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            📅 여행 타임라인 캘린더
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            모든 입출국 기록을 시각적으로 확인하세요
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {viewMode === 'month' ? '연도별' : '월별'}
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        
        <h3 className="text-lg font-semibold">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              relative min-h-[60px] p-1 border border-gray-100 cursor-pointer transition-all duration-200
              ${getDayColor(day)}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              hover:shadow-sm
            `}
            onClick={() => onDateClick?.(day.date)}
          >
            {/* Date number */}
            <div className="text-xs font-medium mb-1">
              {day.date.getDate()}
            </div>
            
            {/* Country indicators */}
            {day.hasActivity && (
              <div className="space-y-1">
                {day.stays.slice(0, 2).map((stay, idx) => (
                  <div
                    key={`${stay.id}-${idx}`}
                    className="flex items-center text-xs"
                    title={`${getCountryName(stay.countryCode)} 체류`}
                  >
                    <span className="text-xs mr-1">
                      {getCountryFlag(stay.countryCode)}
                    </span>
                  </div>
                ))}
                {day.stays.length > 2 && (
                  <div className="text-xs text-gray-600">
                    +{day.stays.length - 2}
                  </div>
                )}
              </div>
            )}
            
            {/* Today indicator */}
            {day.isToday && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">범례</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(COUNTRY_STAY_POLICIES).slice(0, 8).map(([code, policy]) => (
            <div key={code} className="flex items-center space-x-2 text-xs">
              <span>{getCountryFlag(code)}</span>
              <span className="truncate">{policy.countryName}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded"></div>
            <span>선택된 국가</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>오늘</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>여행 기록</span>
          </div>
        </div>
      </div>
    </div>
  );
}