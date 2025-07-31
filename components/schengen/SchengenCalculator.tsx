'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';

interface SchengenCalculatorProps {
  onDataUpdate?: (data: any) => void;
}

export default function SchengenCalculator({
  onDataUpdate,
}: SchengenCalculatorProps) {
  const [schengenData, setSchengenData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [futureTrip, setFutureTrip] = useState({
    country: '',
    entryDate: '',
    exitDate: '',
    enabled: false,
  });

  useEffect(() => {
    loadSchengenStatus();
  }, []);

  const _loadSchengenStatus = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.getSchengenStatus();
      if (response.success && response.data) {
        setSchengenData(response.data);
        if (onDataUpdate) {
          onDataUpdate(response.data);
        }
      }
    } catch (_error) {
      // Error loading Schengen status
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysOnDate = (date: string) => {
    if (!schengenData?.status) return { usedDays: 0, remainingDays: 90 };

    // Simple calculation for demo - in real app, this would be more complex
    const targetDate = new Date(date);
    const today = new Date();
    const daysDiff = Math.floor(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Estimate based on current status and time difference
    let estimatedUsed = schengenData.status?.usedDays || 0;
    if (daysDiff > 0) {
      // Future date - days might reset
      estimatedUsed = Math.max(
        0,
        estimatedUsed - Math.floor(daysDiff / 180) * 90
      );
    }

    return {
      usedDays: estimatedUsed,
      remainingDays: Math.max(0, 90 - estimatedUsed),
    };
  };

  const _selectedDateStatus = calculateDaysOnDate(selectedDate);

  const handleFutureTripCalculation = () => {
    if (!futureTrip.entryDate || !futureTrip.exitDate) return null;

    const entryDate = new Date(futureTrip.entryDate);
    const exitDate = new Date(futureTrip.exitDate);
    const tripDays =
      Math.ceil(
        (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const statusOnEntry = calculateDaysOnDate(futureTrip.entryDate);
    const projectedUsed = statusOnEntry.usedDays + tripDays;

    return {
      tripDays,
      statusOnEntry,
      projectedUsed,
      wouldViolate: projectedUsed > 90,
    };
  };

  const _futureTripResult = futureTrip.enabled
    ? handleFutureTripCalculation()
    : null;

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='animate-pulse' data-testid='loading-skeleton'>
          <div
            className='h-4 bg-gray-200 rounded w-1/4 mb-4'
            data-testid='loading-placeholder'
          ></div>
          <div
            className='h-8 bg-gray-200 rounded w-1/2 mb-4'
            data-testid='loading-placeholder'
          ></div>
          <div
            className='h-20 bg-gray-200 rounded'
            data-testid='loading-placeholder'
          ></div>
        </div>
      </div>
    );
  }

  if (!schengenData) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='text-center'>
          <p className='text-gray-600'>셰겐 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Current Status */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          현재 셰겐 상태
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6'>
          <div className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg'>
            <div className='text-xl sm:text-2xl font-bold text-gray-900'>
              {schengenData?.status?.usedDays || 0}
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>사용된 일수</div>
          </div>
          <div className='text-center p-3 sm:p-4 bg-blue-50 rounded-lg'>
            <div className='text-xl sm:text-2xl font-bold text-blue-600'>
              {schengenData?.status?.remainingDays || 90}
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>남은 일수</div>
          </div>
          <div className='text-center p-3 sm:p-4 bg-purple-50 rounded-lg'>
            <div className='text-xl sm:text-2xl font-bold text-purple-600'>
              90
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>총 허용 일수</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex justify-between text-sm text-gray-600 mb-2'>
            <span>사용량</span>
            <span>{schengenData?.status?.usedDays || 0}/90일</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className={`h-3 rounded-full transition-all ${
                (schengenData?.status?.usedDays || 0) > 90
                  ? 'bg-red-500'
                  : (schengenData?.status?.usedDays || 0) > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(((schengenData?.status?.usedDays || 0) / 90) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            schengenData?.status?.isCompliant !== false
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {schengenData?.status?.isCompliant !== false
            ? '✅ 규정 준수'
            : '⚠️ 규정 위반'}
        </div>
      </div>

      {/* Date-specific Calculator */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          특정 날짜 계산기
        </h3>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            확인할 날짜
          </label>
          <input
            type='date'
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm'
          />
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4'>
          <h4 className='font-medium text-blue-900 mb-3 text-sm sm:text-base'>
            {new Date(selectedDate).toLocaleDateString('ko-KR')} 예상 상태
          </h4>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='text-center sm:text-left'>
              <div className='text-lg sm:text-xl font-bold text-blue-900'>
                {selectedDateStatus.usedDays}일
              </div>
              <div className='text-xs sm:text-sm text-blue-700'>
                예상 사용 일수
              </div>
            </div>
            <div className='text-center sm:text-left'>
              <div className='text-lg sm:text-xl font-bold text-blue-900'>
                {selectedDateStatus.remainingDays}일
              </div>
              <div className='text-xs sm:text-sm text-blue-700'>
                예상 남은 일수
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Trip Planner */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            미래 여행 계획
          </h3>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={futureTrip.enabled}
              onChange={e =>
                setFutureTrip(prev => ({ ...prev, enabled: e.target.checked }))
              }
              className='mr-2 w-4 h-4'
            />
            <span className='text-sm text-gray-600'>활성화</span>
          </label>
        </div>

        {futureTrip.enabled && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  국가
                </label>
                <select
                  value={futureTrip.country}
                  onChange={e =>
                    setFutureTrip(prev => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm'
                >
                  <option value=''>선택하세요</option>
                  <option value='Germany'>🇩🇪 Germany</option>
                  <option value='France'>🇫🇷 France</option>
                  <option value='Italy'>🇮🇹 Italy</option>
                  <option value='Spain'>🇪🇸 Spain</option>
                  <option value='Netherlands'>🇳🇱 Netherlands</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  입국 날짜
                </label>
                <input
                  type='date'
                  value={futureTrip.entryDate}
                  onChange={e =>
                    setFutureTrip(prev => ({
                      ...prev,
                      entryDate: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  출국 날짜
                </label>
                <input
                  type='date'
                  value={futureTrip.exitDate}
                  onChange={e =>
                    setFutureTrip(prev => ({
                      ...prev,
                      exitDate: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm'
                />
              </div>
            </div>

            {futureTripResult && (
              <div
                className={`border rounded-lg p-3 sm:p-4 ${
                  futureTripResult.wouldViolate
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <h4
                  className={`font-medium mb-3 text-sm sm:text-base ${
                    futureTripResult.wouldViolate
                      ? 'text-red-900'
                      : 'text-green-900'
                  }`}
                >
                  {futureTripResult.wouldViolate
                    ? '⚠️ 규정 위반 예상'
                    : '✅ 규정 준수 예상'}
                </h4>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm'>
                  <div className='text-center sm:text-left'>
                    <div className='font-medium text-xs sm:text-sm'>
                      여행 일수
                    </div>
                    <div className='text-base sm:text-lg font-bold'>
                      {futureTripResult.tripDays}일
                    </div>
                  </div>
                  <div className='text-center sm:text-left'>
                    <div className='font-medium text-xs sm:text-sm'>
                      입국 시 사용량
                    </div>
                    <div className='text-base sm:text-lg font-bold'>
                      {futureTripResult.statusOnEntry.usedDays}/90일
                    </div>
                  </div>
                  <div className='text-center sm:text-left'>
                    <div className='font-medium text-xs sm:text-sm'>
                      여행 후 예상
                    </div>
                    <div
                      className={`text-base sm:text-lg font-bold ${futureTripResult.wouldViolate ? 'text-red-600' : ''}`}
                    >
                      {futureTripResult.projectedUsed}/90일
                    </div>
                  </div>
                  <div className='text-center sm:text-left'>
                    <div className='font-medium text-xs sm:text-sm'>
                      남은 일수
                    </div>
                    <div className='text-base sm:text-lg font-bold'>
                      {Math.max(0, 90 - futureTripResult.projectedUsed)}일
                    </div>
                  </div>
                </div>

                {futureTripResult.wouldViolate && (
                  <div className='mt-3 p-3 bg-red-100 rounded-lg'>
                    <p className='text-red-800 text-xs sm:text-sm'>
                      이 여행은 90일 한도를{' '}
                      {futureTripResult.projectedUsed - 90}일 초과합니다. 여행
                      계획을 조정하거나 더 나은 시기를 고려해보세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips and Information */}
      <div className='alert'>
        <h4 className='font-semibold mb-3 text-sm sm:text-base'>
          💡 셰겐 규정 팁
        </h4>
        <div className='space-y-2 text-xs sm:text-sm'>
          <p>• 90일 한도는 연속 체류가 아닌 누적 체류입니다</p>
          <p>• 매일 지난 180일간의 체류 일수를 계산합니다</p>
          <p>• 입국일과 출국일 모두 체류 일수에 포함됩니다</p>
          <p>• 국경 통과 시간이 자정을 넘으면 다음 날로 계산됩니다</p>
          <p>• 장기 거주 비자나 워킹홀리데이는 별도 규정이 적용됩니다</p>
        </div>
      </div>
    </div>
  );
}
