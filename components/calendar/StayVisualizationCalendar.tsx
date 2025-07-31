'use client';

import { useState, useMemo } from 'react';
import { Trip } from '@/types/database';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  addMonths,
  subMonths,
  differenceInDays,
  subDays,
  addDays,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import MiniDatePicker from './MiniDatePicker';

interface StayVisualizationCalendarProps {
  trips: Trip[];
  currentCountry?: string;
  onDateClick?: (date: Date, trips: Trip[]) => void;
}

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  trips: Trip[];
  stayCount: number;
  isWarning: boolean;
  isDanger: boolean;
}

export default function StayVisualizationCalendar({
  trips = [],
  currentCountry = 'KR',
  onDateClick,
}: StayVisualizationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [manualDateInput, setManualDateInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateCalculator, setShowDateCalculator] = useState(false);
  const [calcBaseDate, setCalcBaseDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [calcDays, setCalcDays] = useState('');
  const [calcResult, setCalcResult] = useState<Date | null>(null);

  // 16개월 기간 계산 (과거 6개월 + 현재 + 미래 9개월)
  const startDate = subMonths(startOfMonth(currentDate), 6);
  const endDate = addMonths(endOfMonth(currentDate), 9);

  // 365일 롤링 윈도우 계산
  const calculateRollingStayDays = (
    date: Date,
    country: string = currentCountry
  ): number => {
    const windowStart = subDays(date, 364); // 365일 전
    const windowEnd = date;

    return trips
      .filter(trip => trip.country === country)
      .reduce((total, trip) => {
        const tripStart = new Date(trip.entryDate);
        const tripEnd = new Date(trip.exitDate);

        // 여행이 윈도우와 겹치는지 확인
        if (tripEnd < windowStart || tripStart > windowEnd) return total;

        // 윈도우 내에서의 실제 체류 기간 계산
        const effectiveStart =
          tripStart < windowStart ? windowStart : tripStart;
        const effectiveEnd = tripEnd > windowEnd ? windowEnd : tripEnd;

        return total + differenceInDays(effectiveEnd, effectiveStart) + 1;
      }, 0);
  };

  // 특정 날짜의 여행 정보 가져오기
  const getTripsForDate = (date: Date): Trip[] => {
    return trips.filter(trip => {
      const tripStart = new Date(trip.entryDate);
      const tripEnd = new Date(trip.exitDate);
      return isWithinInterval(date, { start: tripStart, end: tripEnd });
    });
  };

  // 캘린더 데이터 생성
  const calendarData = useMemo(() => {
    const months: { month: Date; days: DayInfo[] }[] = [];

    let currentMonth = startDate;
    while (currentMonth <= endDate) {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const monthDays = days.map(date => {
        const dayTrips = getTripsForDate(date);
        const stayCount = calculateRollingStayDays(date);

        // 한국 기준: 183일 제한
        const limit = currentCountry === 'KR' ? 183 : 90;
        const warningThreshold = limit * 0.8; // 80%
        const dangerThreshold = limit * 0.9; // 90%

        return {
          date,
          isCurrentMonth: isSameMonth(date, currentDate),
          trips: dayTrips,
          stayCount,
          isWarning:
            stayCount >= warningThreshold && stayCount < dangerThreshold,
          isDanger: stayCount >= dangerThreshold,
        };
      });

      months.push({ month: monthStart, days: monthDays });
      currentMonth = addMonths(currentMonth, 1);
    }

    return months;
  }, [trips, currentDate, currentCountry, startDate, endDate]);

  // 날짜 선택 핸들러
  const handleDateClick = (dayInfo: DayInfo) => {
    setSelectedDate(dayInfo.date);
    if (onDateClick) {
      onDateClick(dayInfo.date, dayInfo.trips);
    }
  };

  // 현재 날짜로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 월 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  // 수동 날짜 입력 처리
  const _handleManualDateSubmit = () => {
    // YYYY-MM-DD 또는 YYYY/MM/DD 형식 지원
    const dateRegex = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
    const match = manualDateInput.match(dateRegex);

    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(match[3]);

      const inputDate = new Date(year, month, day);

      // 유효한 날짜인지 확인
      if (!isNaN(inputDate.getTime())) {
        setCurrentDate(inputDate);
        setSelectedDate(inputDate);

        // 해당 날짜의 여행 정보 가져오기
        const dayTrips = getTripsForDate(inputDate);
        if (onDateClick) {
          onDateClick(inputDate, dayTrips);
        }

        setManualDateInput('');
        setShowManualInput(false);
      } else {
        console.error('올바른 날짜 형식이 아닙니다.');
      }
    } else {
      console.error('날짜를 YYYY-MM-DD 형식으로 입력해주세요.');
    }
  };

  // 날짜 계산기
  const handleDateCalculation = () => {
    if (!calcBaseDate || !calcDays) return;

    const baseDate = new Date(calcBaseDate);
    const daysToAdd = parseInt(calcDays);

    if (!isNaN(baseDate.getTime()) && !isNaN(daysToAdd)) {
      const resultDate = addDays(baseDate, daysToAdd);
      setCalcResult(resultDate);
    }
  };

  // 날짜 셀 스타일 계산
  const getDayCellStyle = (dayInfo: DayInfo) => {
    const baseClasses =
      'relative p-2 text-center cursor-pointer transition-all hover:opacity-80';

    if (dayInfo.trips.length > 0) {
      if (dayInfo.isDanger) {
        return `${baseClasses} bg-red-500 text-white`;
      } else if (dayInfo.isWarning) {
        return `${baseClasses} bg-yellow-500 text-white`;
      } else {
        return `${baseClasses} bg-green-500 text-white`;
      }
    }

    return `${baseClasses} hover:bg-surface`;
  };

  return (
    <div className='card'>
      <div className='p-6'>
        {/* 헤더 */}
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            체류 기간 시각화
          </h2>
          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setShowManualInput(!showManualInput)}
              variant="ghost"
              size="sm"
            >
              날짜 입력
            </Button>
            <Button
              onClick={() => setShowDateCalculator(!showDateCalculator)}
              variant="ghost"
              size="sm"
            >
              날짜 계산
            </Button>
            <Button
              onClick={() =>
                setViewMode(viewMode === 'month' ? 'year' : 'month')
              }
              variant="ghost"
              size="sm"
            >
              {viewMode === 'month' ? '연간 보기' : '월간 보기'}
            </Button>
            <Button onClick={goToToday} variant="ghost" size="sm">
              오늘
            </Button>
          </div>
        </div>

        {/* 수동 날짜 입력 */}
        {showManualInput && (
          <div className='relative'>
            <div className='card bg-surface mb-4 p-4'>
              <div className='flex items-center gap-2'>
                <div className='relative flex-1'>
                  <input
                    type='text'
                    value={
                      manualDateInput ||
                      format(selectedDate || new Date(), 'yyyy-MM-dd')
                    }
                    onChange={e => setManualDateInput(e.target.value)}
                    onFocus={() => setShowDatePicker(true)}
                    placeholder='YYYY-MM-DD'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                  {showDatePicker && (
                    <MiniDatePicker
                      selectedDate={selectedDate || new Date()}
                      onDateSelect={date => {
                        setCurrentDate(date);
                        setSelectedDate(date);
                        setManualDateInput(format(date, 'yyyy-MM-dd'));
                        const dayTrips = getTripsForDate(date);
                        if (onDateClick) {
                          onDateClick(date, dayTrips);
                        }
                        setShowDatePicker(false);
                      }}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                </div>
                <input
                  type='date'
                  value={manualDateInput || format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => {
                    setManualDateInput(e.target.value);
                    if (e.target.value) {
                      const inputDate = new Date(e.target.value);
                      setCurrentDate(inputDate);
                      setSelectedDate(inputDate);
                      const dayTrips = getTripsForDate(inputDate);
                      if (onDateClick) {
                        onDateClick(inputDate, dayTrips);
                      }
                    }
                  }}
                  className='px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <Button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualDateInput('');
                    setShowDatePicker(false);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  닫기
                </Button>
              </div>
              <p className='text-xs text-secondary mt-2'>
                날짜를 클릭하여 선택하거나 캘린더 아이콘을 클릭하세요
              </p>
            </div>
          </div>
        )}

        {/* 날짜 계산기 */}
        {showDateCalculator && (
          <div className='card bg-surface mb-4 p-4'>
            <h4 className='text-sm font-medium mb-3'>날짜 계산기</h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-secondary w-20'>기준일:</label>
                <input
                  type='date'
                  value={calcBaseDate}
                  onChange={e => setCalcBaseDate(e.target.value)}
                  className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-secondary w-20'>일수:</label>
                <input
                  type='number'
                  value={calcDays}
                  onChange={e => setCalcDays(e.target.value)}
                  placeholder='+30 또는 -30'
                  className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <Button
                  onClick={handleDateCalculation}
                  size="sm"
                >
                  계산
                </Button>
              </div>
              {calcResult && (
                <div className='flex items-center gap-2 p-3 bg-primary/10 rounded-md'>
                  <span className='text-sm'>결과:</span>
                  <span className='font-medium'>
                    {format(calcResult, 'yyyy년 MM월 dd일 (EEEE)', {
                      locale: ko,
                    })}
                  </span>
                  <Button
                    onClick={() => {
                      setCurrentDate(calcResult);
                      setSelectedDate(calcResult);
                      setShowDateCalculator(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                  >
                    이동
                  </Button>
                </div>
              )}
              <Button
                onClick={() => {
                  setShowDateCalculator(false);
                  setCalcResult(null);
                }}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                닫기
              </Button>
            </div>
          </div>
        )}

        {/* 범례 */}
        <div className='flex items-center gap-4 mb-4 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-green-500 rounded'></div>
            <span>안전 (체류 중)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-yellow-500 rounded'></div>
            <span>주의 (80% 이상)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-red-500 rounded'></div>
            <span>위험 (90% 이상)</span>
          </div>
        </div>

        {/* 현재 체류 정보 */}
        <div className='card bg-surface mb-6'>
          <div className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Info className='h-4 w-4 text-primary' />
                <span className='text-sm font-medium'>
                  현재 {currentCountry === 'KR' ? '한국' : '셍겐'} 체류 현황
                </span>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {calculateRollingStayDays(new Date())} /{' '}
                  {currentCountry === 'KR' ? '183' : '90'}일
                </div>
                <div className='text-xs text-secondary'>365일 기준</div>
              </div>
            </div>
          </div>
        </div>

        {/* 캘린더 네비게이션 */}
        <div className='flex items-center justify-between mb-4'>
          <Button
            onClick={() => navigateMonth('prev')}
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <h3 className='text-lg font-medium'>
            {format(currentDate, 'yyyy년 MM월', { locale: ko })}
          </h3>
          <Button
            onClick={() => navigateMonth('next')}
            variant="ghost"
            size="sm"
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        {/* 월간 보기 */}
        {viewMode === 'month' && (
          <div className='space-y-6'>
            {calendarData
              .filter(monthData => isSameMonth(monthData.month, currentDate))
              .map(({ month, days }) => (
                <div key={month.toISOString()}>
                  {/* 요일 헤더 */}
                  <div className='grid grid-cols-7 gap-1 mb-2'>
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div
                        key={day}
                        className='text-center text-sm font-medium text-secondary'
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 날짜 그리드 */}
                  <div className='grid grid-cols-7 gap-1'>
                    {/* 첫 주 빈 칸 채우기 */}
                    {Array.from({ length: days[0].date.getDay() }).map(
                      (_, i) => (
                        <div key={`empty-${i}`} className='p-2'></div>
                      )
                    )}

                    {/* 날짜 셀 */}
                    {days.map(dayInfo => (
                      <div
                        key={dayInfo.date.toISOString()}
                        className={getDayCellStyle(dayInfo)}
                        onClick={() => handleDateClick(dayInfo)}
                      >
                        <div className='text-sm'>
                          {format(dayInfo.date, 'd')}
                        </div>
                        {dayInfo.trips.length > 0 && (
                          <div className='absolute bottom-1 right-1 text-xs'>
                            {dayInfo.trips.length}
                          </div>
                        )}
                        {isSameDay(dayInfo.date, new Date()) && (
                          <div className='absolute top-1 right-1 w-2 h-2 bg-primary rounded-full'></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 연간 보기 */}
        {viewMode === 'year' && (
          <div className='grid grid-cols-4 gap-4'>
            {calendarData.map(({ month, days }) => {
              const monthStayDays = days.filter(d => d.trips.length > 0).length;
              const hasWarning = days.some(d => d.isWarning);
              const hasDanger = days.some(d => d.isDanger);

              return (
                <div
                  key={month.toISOString()}
                  className='card cursor-pointer hover:shadow-md transition-shadow'
                  onClick={() => setCurrentDate(month)}
                >
                  <div className='p-3'>
                    <h4 className='text-sm font-medium mb-2'>
                      {format(month, 'yyyy년 MM월', { locale: ko })}
                    </h4>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-secondary'>
                        체류: {monthStayDays}일
                      </span>
                      {hasDanger && (
                        <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                      )}
                      {!hasDanger && hasWarning && (
                        <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 선택된 날짜 정보 */}
        {selectedDate && (
          <div className='mt-6 card bg-surface'>
            <div className='p-4'>
              <h4 className='font-medium mb-2'>
                {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}
              </h4>
              {getTripsForDate(selectedDate).length > 0 ? (
                <div className='space-y-2'>
                  {getTripsForDate(selectedDate).map(trip => (
                    <div key={trip.id} className='text-sm'>
                      <div className='font-medium'>{trip.country}</div>
                      <div className='text-secondary'>
                        {format(new Date(trip.entryDate), 'MM/dd')} -{' '}
                        {format(new Date(trip.exitDate), 'MM/dd')}
                        {trip.purpose && ` (${trip.purpose})`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-secondary'>
                  이 날짜에 여행 기록이 없습니다.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 경고 메시지 */}
        {calendarData.some(m => m.days.some(d => d.isDanger)) && (
          <div className='mt-6 alert alert-error'>
            <AlertTriangle className='h-4 w-4' />
            <p>
              체류 일수가 제한에 근접하거나 초과한 날짜가 있습니다. 비자 규정을
              확인해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
