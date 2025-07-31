'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';

interface SchengenChartProps {
  className?: string;
}

export default function SchengenChart({ className = '' }: SchengenChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m');

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.getTrips();
      if (response.success && response.data) {
        const trips = response.data;
        const schengenCountries = [
          'Austria',
          'Belgium',
          'Czech Republic',
          'Denmark',
          'Estonia',
          'Finland',
          'France',
          'Germany',
          'Greece',
          'Hungary',
          'Iceland',
          'Italy',
          'Latvia',
          'Lithuania',
          'Luxembourg',
          'Malta',
          'Netherlands',
          'Norway',
          'Poland',
          'Portugal',
          'Slovakia',
          'Slovenia',
          'Spain',
          'Sweden',
          'Switzerland',
        ];

        const schengenTrips = trips.filter(trip =>
          schengenCountries.includes(trip.country)
        );

        // Generate daily data points
        const endDate = new Date();
        const startDate = new Date();

        switch (timeRange) {
          case '3m':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6m':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        const dailyData = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const rollingPeriodStart = new Date(currentDate);
          rollingPeriodStart.setDate(rollingPeriodStart.getDate() - 180);

          let daysUsed = 0;
          for (const trip of schengenTrips) {
            const tripStart = new Date(trip.entryDate);
            const tripEnd = trip.exitDate
              ? new Date(trip.exitDate)
              : new Date();

            // Check if trip overlaps with rolling 180-day period
            if (tripStart <= currentDate && tripEnd >= rollingPeriodStart) {
              const overlapStart =
                tripStart > rollingPeriodStart ? tripStart : rollingPeriodStart;
              const overlapEnd = tripEnd < currentDate ? tripEnd : currentDate;

              if (overlapStart <= overlapEnd) {
                const overlapDays =
                  Math.ceil(
                    (overlapEnd.getTime() - overlapStart.getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1;
                daysUsed += Math.max(0, overlapDays);
              }
            }
          }

          dailyData.push({
            date: new Date(currentDate),
            daysUsed: Math.min(daysUsed, 90),
            isViolation: daysUsed > 90,
          });

          currentDate.setDate(currentDate.getDate() + 7); // Weekly data points
        }

        setChartData(dailyData);
      }
    } catch (error) {
      // Error loading chart data
    } finally {
      setLoading(false);
    }
  };

  const maxValue = 90;
  const chartHeight = 200;
  const chartWidth = 600;

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='h-48 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold'>셰겐 사용량 추이</h3>

        <div
          className='flex space-x-1 p-1 rounded-lg'
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {[
            { key: '3m', label: '3개월' },
            { key: '6m', label: '6개월' },
            { key: '1y', label: '1년' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === key
                  ? 'bg-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-secondary text-4xl mb-4'>📊</div>
          <p className='text-secondary'>표시할 셰겐 여행 데이터가 없습니다</p>
        </div>
      ) : (
        <div className='relative'>
          {/* Chart Area */}
          <div className='overflow-x-auto'>
            <svg
              width={Math.max(chartWidth, chartData.length * 40)}
              height={chartHeight + 60}
              className='min-w-full'
            >
              {/* Grid lines */}
              {[0, 30, 60, 90].map(value => (
                <g key={value}>
                  <line
                    x1='40'
                    y1={chartHeight - (value / maxValue) * chartHeight + 20}
                    x2={Math.max(chartWidth, chartData.length * 40) - 20}
                    y2={chartHeight - (value / maxValue) * chartHeight + 20}
                    stroke='var(--color-border)'
                    strokeWidth='1'
                    strokeDasharray={value === 90 ? '5,5' : 'none'}
                  />
                  <text
                    x='35'
                    y={chartHeight - (value / maxValue) * chartHeight + 25}
                    fill='var(--color-text-secondary)'
                    fontSize='12'
                    textAnchor='end'
                  >
                    {value}
                  </text>
                </g>
              ))}

              {/* Data line */}
              <polyline
                points={chartData
                  .map((point, index) => {
                    const x =
                      50 +
                      (index *
                        (Math.max(chartWidth, chartData.length * 40) - 70)) /
                        (chartData.length - 1);
                    const y =
                      chartHeight -
                      (point.daysUsed / maxValue) * chartHeight +
                      20;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill='none'
                stroke='var(--color-primary)'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              {/* Data points */}
              {chartData.map((point, index) => {
                const x =
                  50 +
                  (index * (Math.max(chartWidth, chartData.length * 40) - 70)) /
                    (chartData.length - 1);
                const y =
                  chartHeight - (point.daysUsed / maxValue) * chartHeight + 20;

                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r='4'
                      fill={
                        point.isViolation
                          ? 'var(--color-error)'
                          : 'var(--color-primary)'
                      }
                      stroke='white'
                      strokeWidth='2'
                    />

                    {/* Tooltip on hover */}
                    <circle
                      cx={x}
                      cy={y}
                      r='12'
                      fill='transparent'
                      className='cursor-pointer'
                    >
                      <title>
                        {point.date.toLocaleDateString('ko-KR')}:{' '}
                        {point.daysUsed}일 사용
                        {point.isViolation ? ' (규정 위반)' : ''}
                      </title>
                    </circle>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {chartData
                .filter(
                  (_, index) => index % Math.ceil(chartData.length / 6) === 0
                )
                .map((point, index) => {
                  const originalIndex = index * Math.ceil(chartData.length / 6);
                  const x =
                    50 +
                    (originalIndex *
                      (Math.max(chartWidth, chartData.length * 40) - 70)) /
                      (chartData.length - 1);

                  return (
                    <text
                      key={originalIndex}
                      x={x}
                      y={chartHeight + 40}
                      fill='var(--color-text-secondary)'
                      fontSize='12'
                      textAnchor='middle'
                    >
                      {point.date.toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </text>
                  );
                })}
            </svg>
          </div>

          {/* Legend */}
          <div className='flex items-center justify-center mt-4 space-x-6 text-sm'>
            <div className='flex items-center space-x-2'>
              <span className='badge badge-primary'>규정 준수</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='badge badge-error'>규정 위반</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-0.5 bg-gray-300 border-dashed border-t'></div>
              <span className='text-gray-600'>90일 한도</span>
            </div>
          </div>
        </div>
      )}

      <div className='mt-6 text-xs text-gray-500'>
        * 차트는 매주 데이터 포인트를 표시하며, 각 날짜의 롤링 180일 기간 내
        셰겐 사용량을 보여줍니다.
      </div>
    </div>
  );
}
