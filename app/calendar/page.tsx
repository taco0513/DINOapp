'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';
import { t } from '@/lib/i18n';

interface Trip {
  id: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  purpose: string;
  isSchengen?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  trips: Trip[];
  isToday: boolean;
  schengenDays?: number;
}

export default function CalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [showSchengenInfo, setShowSchengenInfo] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 로컬 스토리지에서 여행 데이터 로드
  useEffect(() => {
    const _loadTrips = () => {
      const saved = localStorage.getItem('dino-trips');
      if (saved) {
        const parsedTrips = JSON.parse(saved);
        setTrips(parsedTrips);
      } else {
        // 샘플 데이터
        const sampleTrips: Trip[] = [
          {
            id: '1',
            country: '태국',
            city: '방콕',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            purpose: '관광',
            isSchengen: false,
          },
          {
            id: '2',
            country: '프랑스',
            city: '파리',
            startDate: '2024-03-10',
            endDate: '2024-03-17',
            purpose: '출장',
            isSchengen: true,
          },
          {
            id: '3',
            country: '스페인',
            city: '바르셀로나',
            startDate: '2024-03-18',
            endDate: '2024-03-25',
            purpose: '관광',
            isSchengen: true,
          },
          {
            id: '4',
            country: '일본',
            city: '도쿄',
            startDate: '2024-04-05',
            endDate: '2024-04-12',
            purpose: '관광',
            isSchengen: false,
          },
        ];
        setTrips(sampleTrips);
        localStorage.setItem('dino-trips', JSON.stringify(sampleTrips));
      }
    };
    loadTrips();
  }, []);

  // 캘린더 데이터 생성
  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // 첫 주의 빈 날짜 채우기
    const startDay = start.getDay();
    const previousMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      previousMonthDays.push(subMonths(start, 1));
    }

    const calendarDays: CalendarDay[] = days.map(date => {
      const dayTrips = trips.filter(trip => {
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);
        return isWithinInterval(date, { start: tripStart, end: tripEnd });
      });

      return {
        date,
        isCurrentMonth: true,
        trips: dayTrips,
        isToday: isSameDay(date, new Date()),
        schengenDays: dayTrips.filter(t => t.isSchengen).length > 0 ? 1 : 0,
      };
    });

    return calendarDays;
  };

  const _monthlySchengenDays = () => {
    const days = generateCalendarDays();
    return days.reduce((sum, day) => sum + (day.schengenDays || 0), 0);
  };

  const _handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const _handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const _handleToday = () => {
    setCurrentDate(new Date());
  };

  const _handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const _getTripsForDate = (date: Date) => {
    return trips.filter(trip => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      return isWithinInterval(date, { start: tripStart, end: tripEnd });
    });
  };

  const _calendarDays = generateCalendarDays();
  const _weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <StandardPageLayout
      title={t('nav.calendar')}
      description='여행 일정을 한눈에 확인하고 관리하세요'
      icon={PageIcons.Calendar}
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.calendar') },
      ]}
      headerActions={
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            className='px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted/50'
          >
            {viewMode === 'month' ? '연간 보기' : '월간 보기'}
          </button>
          <button
            onClick={() => setShowSchengenInfo(!showSchengenInfo)}
            className='px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted/50'
          >
            셰겐 {showSchengenInfo ? '숨기기' : '보기'}
          </button>
        </div>
      }
    >
      {/* 캘린더 네비게이션 */}
      <div className='bg-card rounded-lg shadow-sm border border-border p-4 mb-6'>
        <div className='flex items-center justify-between'>
          <button
            onClick={handlePreviousMonth}
            className='p-2 hover:bg-muted/50 rounded-lg transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>

          <div className='flex items-center space-x-4'>
            <h2 className='text-xl font-semibold text-foreground'>
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <button
              onClick={handleToday}
              className='px-3 py-1 text-sm font-medium text-primary hover:text-primary/90'
            >
              오늘
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className='p-2 hover:bg-muted/50 rounded-lg transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>

        {showSchengenInfo && (
          <div className='mt-4 pt-4 border-t border-border'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                이번 달 셰겐 체류일수
              </span>
              <span className='font-semibold text-primary'>
                {monthlySchengenDays()}일
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 캘린더 그리드 */}
      <div className='bg-card rounded-lg shadow-sm border border-border p-6'>
        {/* 요일 헤더 */}
        <div className='grid grid-cols-7 mb-2'>
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index === 0
                  ? 'text-destructive'
                  : index === 6
                    ? 'text-primary'
                    : 'text-foreground/80'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className='grid grid-cols-7 gap-1'>
          {calendarDays.map((day, index) => {
            const _dayTrips = day.trips;
            const isSelected =
              selectedDate && isSameDay(day.date, selectedDate);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all ${
                  day.isToday
                    ? 'bg-primary/10 border-primary'
                    : isSelected
                      ? 'bg-muted border-muted-foreground'
                      : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className='flex items-start justify-between mb-1'>
                  <span
                    className={`text-sm font-medium ${
                      day.isToday ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {format(day.date, 'd')}
                  </span>
                  {day.schengenDays > 0 && showSchengenInfo && (
                    <span className='text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded'>
                      셰겐
                    </span>
                  )}
                </div>

                {/* 여행 표시 */}
                <div className='space-y-1'>
                  {dayTrips.slice(0, 2).map(trip => (
                    <div
                      key={trip.id}
                      className={`text-xs p-1 rounded truncate ${
                        trip.isSchengen
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      title={`${trip.country} - ${trip.city}`}
                    >
                      {trip.city}
                    </div>
                  ))}
                  {dayTrips.length > 2 && (
                    <div className='text-xs text-muted-foreground/70 text-center'>
                      +{dayTrips.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedDate && (
        <div className='mt-6 bg-card rounded-lg shadow-sm border border-border p-6'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>
            {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })} 여행 정보
          </h3>

          {getTripsForDate(selectedDate).length > 0 ? (
            <div className='space-y-3'>
              {getTripsForDate(selectedDate).map(trip => {
                const tripStart = new Date(trip.startDate);
                const tripEnd = new Date(trip.endDate);
                const duration = differenceInDays(tripEnd, tripStart) + 1;

                return (
                  <div
                    key={trip.id}
                    className='flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50'
                  >
                    <div>
                      <div className='flex items-center space-x-2 mb-1'>
                        <h4 className='font-medium text-foreground'>
                          {trip.country} - {trip.city}
                        </h4>
                        {trip.isSchengen && (
                          <span className='text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full'>
                            셰겐
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {format(tripStart, 'M월 d일')} -{' '}
                        {format(tripEnd, 'M월 d일')} ({duration}일)
                      </p>
                      <p className='text-sm text-muted-foreground/70 mt-1'>
                        목적: {trip.purpose}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/trips/${trip.id}`)}
                      className='text-sm text-primary hover:text-primary/90'
                    >
                      상세보기
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-muted-foreground/70 text-center py-8'>
              이 날짜에 예정된 여행이 없습니다
            </p>
          )}
        </div>
      )}

      {/* 범례 */}
      <div className='mt-6 bg-card rounded-lg shadow-sm border border-border p-4'>
        <h3 className='text-sm font-semibold text-foreground mb-3'>범례</h3>
        <div className='flex items-center space-x-6 text-sm'>
          <div className='flex items-center space-x-2'>
            <div className='w-4 h-4 bg-primary/10 border border-primary rounded'></div>
            <span className='text-muted-foreground'>오늘</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-4 h-4 bg-muted rounded'></div>
            <span className='text-muted-foreground'>일반 여행</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-4 h-4 bg-secondary rounded'></div>
            <span className='text-muted-foreground'>셰겐 지역</span>
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
}
