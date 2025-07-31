'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  // isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

export default function MiniDatePicker({
  selectedDate,
  onDateSelect,
  onClose,
}: MiniDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <div className='absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-border p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() => navigateMonth('prev')}
          className='p-1 hover:bg-surface rounded'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <h3 className='text-sm font-medium'>
          {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className='p-1 hover:bg-surface rounded'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div
            key={day}
            className='text-center text-xs font-medium text-secondary p-1'
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className='grid grid-cols-7 gap-1'>
        {/* 첫 주 빈 칸 채우기 */}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className='p-1'></div>
        ))}

        {/* 날짜 */}
        {days.map(date => (
          <button
            key={date.toISOString()}
            onClick={() => handleDateClick(date)}
            className={`p-1 text-xs rounded hover:bg-surface transition-colors ${
              selectedDate && isSameDay(date, selectedDate)
                ? 'bg-primary text-white hover:bg-primary'
                : ''
            } ${isSameDay(date, new Date()) ? 'font-bold text-primary' : ''}`}
          >
            {format(date, 'd')}
          </button>
        ))}
      </div>

      {/* 빠른 선택 버튼 */}
      <div className='mt-4 pt-4 border-t border-border flex gap-2'>
        <Button
          onClick={() => handleDateClick(new Date())}
          variant="ghost"
          size="sm"
          className="flex-1"
        >
          오늘
        </Button>
        <Button onClick={onClose} variant="ghost" size="sm" className="flex-1">
          취소
        </Button>
      </div>
    </div>
  );
}
