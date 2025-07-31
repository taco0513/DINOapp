'use client';

import React, { useState, useEffect, memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Plane,
  Clock,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Globe,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { getCountryByName } from '@/data/countries';
import type { CountryVisit } from '@/types/global';

interface CalendarEvent {
  id: string;
  title: string;
  country: string;
  type: 'entry' | 'exit' | 'ongoing' | 'planned';
  date: Date;
  duration?: number;
  visaType?: string;
  notes?: string;
  flag?: string;
  isSchengen?: boolean;
}

interface TravelCalendarViewProps {
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  initialDate?: Date;
}

const _MONTH_NAMES = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

const _DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export const _TravelCalendarView = memo<TravelCalendarViewProps>(
  ({ className = '', onEventClick, onDateClick, initialDate = new Date() }) => {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [trips, setTrips] = useState<CountryVisit[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
      null
    );
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [filter, setFilter] = useState<'all' | 'schengen' | 'current'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      loadTrips();
    }, []);

    useEffect(() => {
      generateEvents();
    }, [trips, filter]);

    // Check mobile on mount and resize
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const _loadTrips = async () => {
      setLoading(true);
      try {
        const response = await ApiClient.getTrips();
        if (response.success && response.data) {
          setTrips(response.data);
        }
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    };

    const _generateEvents = () => {
      const calendarEvents: CalendarEvent[] = [];
      const _now = new Date();

      let filteredTrips = trips;
      if (filter === 'schengen') {
        const schengenCountries = [
          'France',
          'Germany',
          'Italy',
          'Spain',
          'Netherlands',
          'Switzerland',
          'Austria',
          'Belgium',
          'Czech Republic',
        ];
        filteredTrips = trips.filter(trip =>
          schengenCountries.includes(trip.country)
        );
      } else if (filter === 'current') {
        filteredTrips = trips.filter(trip => !trip.exitDate);
      }

      if (searchTerm) {
        filteredTrips = filteredTrips.filter(
          trip =>
            trip.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (trip.notes &&
              trip.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      filteredTrips.forEach(trip => {
        const country = getCountryByName(trip.country);
        const entryDate = new Date(trip.entryDate);
        const exitDate = trip.exitDate ? new Date(trip.exitDate) : null;
        const duration = exitDate
          ? Math.ceil(
              (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1
          : Math.ceil(
              (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

        // Entry event
        calendarEvents.push({
          id: `${trip.id}-entry`,
          title: `${trip.country} 입국`,
          country: trip.country,
          type: 'entry',
          date: entryDate,
          duration,
          visaType: trip.visaType,
          notes: trip.notes,
          flag: country?.flag,
          isSchengen: country?.isSchengen,
        });

        // Exit event (if exists)
        if (exitDate) {
          calendarEvents.push({
            id: `${trip.id}-exit`,
            title: `${trip.country} 출국`,
            country: trip.country,
            type: 'exit',
            date: exitDate,
            duration,
            visaType: trip.visaType,
            notes: trip.notes,
            flag: country?.flag,
            isSchengen: country?.isSchengen,
          });
        }

        // Ongoing events (for current stays)
        if (!exitDate) {
          const today = new Date();
          const daysBetween = Math.ceil(
            (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          for (let i = 1; i <= Math.min(daysBetween, 30); i++) {
            // Limit to 30 days for performance
            const ongoingDate = new Date(entryDate);
            ongoingDate.setDate(ongoingDate.getDate() + i);

            if (ongoingDate <= today) {
              calendarEvents.push({
                id: `${trip.id}-ongoing-${i}`,
                title: `${trip.country} 체류 중`,
                country: trip.country,
                type: 'ongoing',
                date: ongoingDate,
                duration,
                visaType: trip.visaType,
                notes: trip.notes,
                flag: country?.flag,
                isSchengen: country?.isSchengen,
              });
            }
          }
        }
      });

      setEvents(
        calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    };

    const _getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const _getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const _getEventsForDate = (date: Date) => {
      return events.filter(
        event => event.date.toDateString() === date.toDateString()
      );
    };

    const _navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (viewMode === 'year') {
        if (direction === 'prev') {
          newDate.setFullYear(newDate.getFullYear() - 1);
        } else {
          newDate.setFullYear(newDate.getFullYear() + 1);
        }
      } else {
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
      }
      setCurrentDate(newDate);
    };

    const _navigateToToday = () => {
      setCurrentDate(new Date());
    };

    const _handleEventClick = (event: CalendarEvent) => {
      setSelectedEvent(event);
      onEventClick?.(event);
    };

    const _handleDateClick = (date: Date) => {
      onDateClick?.(date);
    };

    const _getEventTypeColor = (type: CalendarEvent['type']) => {
      switch (type) {
        case 'entry':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'exit':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'ongoing':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'planned':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const _renderCalendarGrid = () => {
      if (viewMode === 'year') {
        return renderYearGrid();
      }

      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayOfMonth(currentDate);
      const today = new Date();
      const cells = [];

      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        cells.push(
          <div key={`empty-${i}`} className='p-2 text-gray-300'>
            {new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              -firstDay + i + 1
            ).getDate()}
          </div>
        );
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
        const dayEvents = getEventsForDate(date);
        const isToday = date.toDateString() === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        cells.push(
          <div
            key={day}
            className={`p-2 min-h-[100px] border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              isToday ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleDateClick(date)}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                isToday
                  ? 'text-blue-600'
                  : isWeekend
                    ? 'text-red-600'
                    : 'text-gray-900'
              }`}
            >
              {day}
            </div>

            <div className='space-y-1'>
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.type)}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  title={`${event.title} - ${event.visaType}`}
                >
                  <div className='flex items-center gap-1'>
                    <span>{event.flag}</span>
                    <span className='truncate'>{event.title}</span>
                  </div>
                </div>
              ))}

              {dayEvents.length > 3 && (
                <div className='text-xs text-gray-500 px-2'>
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      }

      return cells;
    };

    const _renderYearGrid = () => {
      const year = currentDate.getFullYear();
      const months = [];

      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);
        const monthEvents = events.filter(
          event =>
            event.date.getFullYear() === year && event.date.getMonth() === month
        );

        const eventTypes = {
          entry: monthEvents.filter(e => e.type === 'entry').length,
          exit: monthEvents.filter(e => e.type === 'exit').length,
          ongoing: monthEvents.filter(e => e.type === 'ongoing').length,
          planned: monthEvents.filter(e => e.type === 'planned').length,
        };

        months.push(
          <div
            key={month}
            className='border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={() => {
              setCurrentDate(monthDate);
              setViewMode('month');
            }}
          >
            <div className='text-center mb-3'>
              <h4 className='font-semibold text-gray-900'>
                {MONTH_NAMES[month]}
              </h4>
              <p className='text-sm text-gray-500'>
                {monthEvents.length}개 이벤트
              </p>
            </div>

            {monthEvents.length > 0 && (
              <div className='space-y-1'>
                {eventTypes.entry > 0 && (
                  <div className='flex items-center gap-2 text-xs'>
                    <div className='w-2 h-2 rounded bg-green-400'></div>
                    <span>입국 {eventTypes.entry}회</span>
                  </div>
                )}
                {eventTypes.exit > 0 && (
                  <div className='flex items-center gap-2 text-xs'>
                    <div className='w-2 h-2 rounded bg-red-400'></div>
                    <span>출국 {eventTypes.exit}회</span>
                  </div>
                )}
                {eventTypes.ongoing > 0 && (
                  <div className='flex items-center gap-2 text-xs'>
                    <div className='w-2 h-2 rounded bg-blue-400'></div>
                    <span>체류 {Math.ceil(eventTypes.ongoing / 5)}일</span>
                  </div>
                )}
              </div>
            )}

            {monthEvents.length === 0 && (
              <div className='text-center text-gray-400 text-xs'>여행 없음</div>
            )}
          </div>
        );
      }

      return months;
    };

    if (loading) {
      return (
        <div className={`card ${className}`}>
          <div className='p-8 text-center'>
            <div className='animate-pulse'>
              <div className='h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4'></div>
              <div className='grid grid-cols-7 gap-2'>
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className='h-20 bg-gray-200 rounded'></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`card ${className}`}>
        {/* Header */}
        <div className='p-6 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-semibold flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              여행 캘린더
            </h3>

            <div className='flex items-center gap-2'>
              <button
                onClick={navigateToToday}
                className='btn btn-sm btn-ghost'
              >
                {isMobile ? '오늘' : '오늘'}
              </button>

              <div className='flex border rounded-lg'>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm rounded-l-lg ${
                    viewMode === 'month'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  월
                </button>
                <button
                  onClick={() => setViewMode('year')}
                  className={`px-3 py-1 text-sm rounded-r-lg ${
                    viewMode === 'year'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  년
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => navigateMonth('prev')}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>

                <h2 className='text-lg font-semibold min-w-[120px] text-center'>
                  {viewMode === 'year'
                    ? `${currentDate.getFullYear()}년`
                    : `${currentDate.getFullYear()}년 ${MONTH_NAMES[currentDate.getMonth()]}`}
                </h2>

                <button
                  onClick={() => navigateMonth('next')}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div
              className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full mt-4' : ''}`}
            >
              <div className={`relative ${isMobile ? 'w-full' : ''}`}>
                <Search className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder={
                    isMobile ? '국가 검색...' : '국가 또는 비자 검색...'
                  }
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${isMobile ? 'w-full' : ''}`}
                />
              </div>

              <select
                value={filter}
                onChange={e =>
                  setFilter(e.target.value as 'all' | 'schengen' | 'current')
                }
                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${isMobile ? 'w-full' : ''}`}
              >
                <option value='all'>전체</option>
                <option value='schengen'>셰겐</option>
                <option value='current'>현재 체류</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className='p-6'>
          {viewMode === 'month' && (
            <>
              {/* Day headers */}
              <div className='grid grid-cols-7 gap-2 mb-2'>
                {DAY_NAMES.map((day, index) => (
                  <div
                    key={day}
                    className={`p-2 text-center text-sm font-medium ${
                      index === 0
                        ? 'text-red-600'
                        : index === 6
                          ? 'text-blue-600'
                          : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className='grid grid-cols-7 gap-2'>
                {renderCalendarGrid()}
              </div>
            </>
          )}

          {viewMode === 'year' && (
            <>
              {/* Year grid */}
              <div
                className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}
              >
                {renderCalendarGrid()}
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className='p-6 border-t bg-gray-50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded bg-green-200 border border-green-300'></div>
                <span>입국</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded bg-red-200 border border-red-300'></div>
                <span>출국</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded bg-blue-200 border border-blue-300'></div>
                <span>체류 중</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded bg-purple-200 border border-purple-300'></div>
                <span>예정</span>
              </div>
            </div>

            <div className='text-sm text-gray-600'>
              총 {events.length}개 이벤트
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className='card max-w-md w-full m-4'
              onClick={e => e.stopPropagation()}
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <span>{selectedEvent.flag}</span>
                    {selectedEvent.title}
                  </h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className='p-1 hover:bg-gray-100 rounded-full'
                  >
                    ×
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span>{selectedEvent.country}</span>
                    {selectedEvent.isSchengen && (
                      <span className='badge badge-sm'>셰겐</span>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span>
                      {selectedEvent.date.toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  {selectedEvent.visaType && (
                    <div className='flex items-center gap-2'>
                      <Plane className='h-4 w-4 text-gray-400' />
                      <span>{selectedEvent.visaType}</span>
                    </div>
                  )}

                  {selectedEvent.duration && (
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-gray-400' />
                      <span>{selectedEvent.duration}일</span>
                    </div>
                  )}

                  {selectedEvent.notes && (
                    <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                      <p className='text-sm'>{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TravelCalendarView.displayName = 'TravelCalendarView';
