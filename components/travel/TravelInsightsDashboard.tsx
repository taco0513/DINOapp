'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TravelInsights } from '@/lib/travel-manager';

interface TravelInsightsDashboardProps {
  className?: string;
}

export function TravelInsightsDashboard({
  className,
}: TravelInsightsDashboardProps) {
  const [insights, setInsights] = useState<TravelInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/trips/insights');
      const data = await response.json();

      if (data.success) {
        setInsights(data.data);
      } else {
        setError('Failed to load travel insights');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className='text-red-600'>{error}</p>
        <button
          onClick={fetchInsights}
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className='text-gray-600'>여행 데이터가 없습니다.</p>
      </div>
    );
  }

  const {
    summary,
    popularDestinations,
    travelPatterns,
    upcomingExpirations,
    recommendations,
  } = insights;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 기본 통계 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold text-blue-600'>
              {summary.totalTrips}
            </h3>
            <p className='text-sm text-gray-600'>총 여행 횟수</p>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold text-green-600'>
              {summary.countriesVisited}
            </h3>
            <p className='text-sm text-gray-600'>방문 국가</p>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold text-purple-600'>
              {summary.totalDaysAbroad}
            </h3>
            <p className='text-sm text-gray-600'>총 여행일</p>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold text-orange-600'>
              {summary.schengenDaysRemaining}
            </h3>
            <p className='text-sm text-gray-600'>셰겐 잔여일</p>
          </div>
        </Card>
      </div>

      {/* 셰겐 상태 */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>셰겐 90/180일 규칙 현황</h3>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span>사용한 일수</span>
            <Badge
              variant={
                summary.schengenDaysUsed > 80 ? 'destructive' : 'default'
              }
            >
              {summary.schengenDaysUsed}/90일
            </Badge>
          </div>
          <div className='flex justify-between items-center'>
            <span>남은 일수</span>
            <Badge
              variant={
                summary.schengenDaysRemaining < 10 ? 'destructive' : 'default'
              }
            >
              {summary.schengenDaysRemaining}일
            </Badge>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${
                summary.schengenDaysUsed > 80
                  ? 'bg-red-600'
                  : summary.schengenDaysUsed > 60
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
              }`}
              style={{ width: `${(summary.schengenDaysUsed / 90) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 인기 목적지 */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>인기 목적지</h3>
        <div className='space-y-3'>
          {popularDestinations.slice(0, 5).map((destination, index) => (
            <div
              key={destination.country}
              className='flex justify-between items-center'
            >
              <div className='flex items-center space-x-3'>
                <span className='text-gray-400 w-4'>{index + 1}</span>
                <span className='font-medium'>{destination.country}</span>
              </div>
              <div className='text-right'>
                <div className='text-sm font-medium'>
                  {destination.visits}회 방문
                </div>
                <div className='text-xs text-gray-600'>
                  {destination.totalDays}일 체류
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 여행 패턴 */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>여행 패턴 분석</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-600'>평균 여행 기간</p>
            <p className='text-2xl font-bold'>
              {travelPatterns.averageTripDuration}일
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>가장 긴 여행</p>
            <p className='text-2xl font-bold'>{travelPatterns.longestTrip}일</p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>가장 짧은 여행</p>
            <p className='text-2xl font-bold'>
              {travelPatterns.shortestTrip}일
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>주요 비자 유형</p>
            <p className='text-lg font-semibold'>
              {travelPatterns.mostCommonVisaType}
            </p>
          </div>
          {travelPatterns.totalSpent && (
            <div className='md:col-span-2'>
              <p className='text-sm text-gray-600'>총 여행 비용</p>
              <p className='text-2xl font-bold'>
                ${travelPatterns.totalSpent.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 예정된 출국 */}
      {upcomingExpirations.length > 0 && (
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>예정된 출국</h3>
          <div className='space-y-3'>
            {upcomingExpirations.map(expiry => (
              <div
                key={expiry.country}
                className='flex justify-between items-center'
              >
                <span className='font-medium'>{expiry.country}</span>
                <div className='text-right'>
                  <div className='text-sm font-medium'>
                    {new Date(expiry.exitDate).toLocaleDateString('ko-KR')}
                  </div>
                  <Badge
                    variant={
                      expiry.daysUntilExit <= 3 ? 'destructive' : 'default'
                    }
                  >
                    {expiry.daysUntilExit}일 후
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 추천 사항 */}
      {recommendations.length > 0 && (
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>추천 사항</h3>
          <div className='space-y-2'>
            {recommendations.map((recommendation, index) => (
              <div key={index} className='flex items-start space-x-2'>
                <span className='text-blue-600 mt-1'>•</span>
                <p className='text-sm'>{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 최근 활동 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4 text-center'>
          <h4 className='font-medium text-gray-600'>완료된 여행</h4>
          <p className='text-2xl font-bold text-green-600'>
            {summary.completedTrips}
          </p>
        </Card>
        <Card className='p-4 text-center'>
          <h4 className='font-medium text-gray-600'>진행 중인 여행</h4>
          <p className='text-2xl font-bold text-blue-600'>
            {summary.ongoingTrips}
          </p>
        </Card>
        <Card className='p-4 text-center'>
          <h4 className='font-medium text-gray-600'>계획된 여행</h4>
          <p className='text-2xl font-bold text-purple-600'>
            {summary.plannedTrips}
          </p>
        </Card>
      </div>
    </div>
  );
}
