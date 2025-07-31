'use client';

import { useState } from 'react';
import {
  StandardPageLayout,
  StandardCard,
  StatsCard,
  EmptyState,
} from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';

export default function SimplePage() {
  const [trips, setTrips] = useState([
    {
      id: 1,
      country: '프랑스',
      entryDate: '2024-01-15',
      exitDate: '2024-01-20',
      visaType: 'Tourist',
      maxDays: 90,
      notes: '파리 여행',
    },
    {
      id: 2,
      country: '독일',
      entryDate: '2024-02-10',
      exitDate: '2024-02-15',
      visaType: 'Tourist',
      maxDays: 90,
      notes: '베를린 방문',
    },
  ]);

  const [showExportImport, setShowExportImport] = useState(false);

  const handleExport = (format: string) => {
    const data =
      format === 'json'
        ? JSON.stringify(trips, null, 2)
        : trips
            .map(
              trip =>
                `${trip.country},${trip.entryDate},${trip.exitDate},${trip.visaType},${trip.maxDays},"${trip.notes}"`
            )
            .join('\n');

    const blob = new Blob([data], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dinoapp-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StandardPageLayout
      title='🦕 DinoApp 데모'
      description='디지털 노마드를 위한 스마트 여행 관리 플랫폼'
      headerActions={
        <div className='text-sm text-gray-600'>프로토타입 데모</div>
      }
    >
      {/* 통계 카드들 - 대시보드 스타일 */}
      <StandardCard title='📊 여행 현황'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <StatsCard value={trips.length} label='총 여행' color='blue' />
          <StatsCard value='15/90' label='셰겐 일수' color='green' />
          <StatsCard value='2' label='방문 국가' color='purple' />
        </div>
      </StandardCard>

      {/* 데이터 관리 섹션 */}
      <StandardCard
        title='📤 데이터 관리'
        className={showExportImport ? '' : 'cursor-pointer'}
      >
        <div className='flex justify-between items-center mb-4'>
          <p className='text-gray-600'>
            여행 데이터를 내보내거나 가져올 수 있습니다
          </p>
          <Button
            onClick={() => setShowExportImport(!showExportImport)}
            variant='ghost'
            size='sm'
          >
            {showExportImport ? '숨기기' : '보기'}
          </Button>
        </div>

        {showExportImport && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100'>
            <div>
              <h4 className='font-medium mb-4'>📤 데이터 내보내기</h4>
              <div className='space-y-3'>
                <Button onClick={() => handleExport('json')} className='w-full'>
                  📄 JSON 형식으로 내보내기
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  variant='secondary'
                  className='w-full'
                >
                  📊 CSV 형식으로 내보내기
                </Button>
              </div>
            </div>
            <div>
              <h4 className='font-medium mb-4'>📥 데이터 가져오기</h4>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <p className='text-gray-600 mb-2'>
                  JSON 또는 CSV 파일을 선택하세요
                </p>
                <input type='file' accept='.json,.csv' className='text-sm' />
              </div>
            </div>
          </div>
        )}
      </StandardCard>

      {/* 여행 기록 목록 */}
      <StandardCard title='✈️ 여행 기록'>
        <div className='space-y-4'>
          {trips.map(trip => (
            <div
              key={trip.id}
              className='border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg text-gray-900'>
                    {trip.country}
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    {trip.entryDate} ~ {trip.exitDate}
                  </p>
                  <p className='text-sm text-gray-500 mt-1'>
                    {trip.visaType} | 최대 {trip.maxDays}일
                  </p>
                  {trip.notes && (
                    <p className='mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2'>
                      {trip.notes}
                    </p>
                  )}
                </div>
                <div className='ml-4'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    완료
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </StandardCard>

      {/* 셰겐 계산기 미리보기 */}
      <StandardCard title='🇪🇺 셰겐 계산기'>
        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6'>
          <h4 className='font-semibold mb-3 text-gray-900'>
            📚 셰겐 90/180일 규칙
          </h4>
          <div className='space-y-2 text-sm'>
            <p className='flex items-center text-gray-700'>
              <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
              셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다
            </p>
            <p className='flex items-center text-green-700'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-3'></span>
              현재 사용량: 15일 / 90일 (규정 준수 ✅)
            </p>
            <p className='flex items-center text-gray-700'>
              <span className='w-2 h-2 bg-purple-500 rounded-full mr-3'></span>
              다음 초기화: 2024년 8월 15일
            </p>
          </div>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}
