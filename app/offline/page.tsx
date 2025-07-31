'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/lib/pwa/pwa-utils';

interface CachedTrip {
  id: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  purpose: string;
}

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [cachedTrips, setCachedTrips] = useState<CachedTrip[]>([]);
  const [cacheSize, setCacheSize] = useState<string>('0');

  useEffect(() => {
    // 마지막 동기화 시간 가져오기
    const getLastSync = () => {
      const stored = localStorage.getItem('dino-last-sync');
      if (stored) {
        setLastSync(new Date(stored).toLocaleString('ko-KR'));
      }
    };

    // 캐시된 여행 데이터 가져오기
    const getCachedData = () => {
      const trips = localStorage.getItem('dino-offline-trips');
      if (trips) {
        setCachedTrips(JSON.parse(trips));
      }
    };

    // 캐시 크기 계산
    const calculateCacheSize = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { usage } = await navigator.storage.estimate();
        if (usage) {
          setCacheSize((usage / 1024 / 1024).toFixed(2));
        }
      }
    };

    getLastSync();
    getCachedData();
    calculateCacheSize();
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/dashboard';
    } else {
      alert('아직 인터넷에 연결되지 않았습니다.');
    }
  };

  const handleClearCache = async () => {
    if (confirm('모든 오프라인 데이터를 삭제하시겠습니까?')) {
      // 캐시 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 로컬 스토리지 정리
      localStorage.removeItem('dino-offline-trips');
      localStorage.removeItem('dino-last-sync');

      setCachedTrips([]);
      setCacheSize('0');
      alert('오프라인 데이터가 삭제되었습니다.');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        {/* 상태 카드 */}
        <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6'>
          <div className='text-center mb-8'>
            {/* 오프라인 아이콘 */}
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isOnline ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              {isOnline ? (
                <svg
                  className='w-10 h-10 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0'
                  />
                </svg>
              ) : (
                <svg
                  className='w-10 h-10 text-orange-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12'
                  />
                </svg>
              )}
            </div>

            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {isOnline ? '다시 온라인입니다!' : '오프라인 모드'}
            </h1>
            <p className='text-gray-600'>
              {isOnline
                ? '인터넷 연결이 복구되었습니다. 대시보드로 돌아가실 수 있습니다.'
                : '인터넷 연결이 없습니다. 오프라인 기능만 사용 가능합니다.'}
            </p>
          </div>

          {/* 연결 정보 */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  연결 상태
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOnline
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {isOnline ? '온라인' : '오프라인'}
                </span>
              </div>

              {lastSync && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>
                    마지막 동기화
                  </span>
                  <span className='text-sm text-gray-600'>{lastSync}</span>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  캐시 사용량
                </span>
                <span className='text-sm text-gray-600'>{cacheSize} MB</span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  저장된 여행
                </span>
                <span className='text-sm text-gray-600'>
                  {cachedTrips.length}개
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className='space-y-3'>
            <button
              onClick={handleRetry}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                isOnline
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isOnline ? '대시보드로 이동' : '다시 연결 시도'}
            </button>

            {!isOnline && cachedTrips.length > 0 && (
              <button
                onClick={() => (window.location.href = '/trips?offline=true')}
                className='w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50'
              >
                저장된 여행 기록 보기 ({cachedTrips.length}개)
              </button>
            )}

            <button
              onClick={handleClearCache}
              className='w-full px-4 py-3 text-red-600 hover:text-red-700 text-sm'
            >
              오프라인 데이터 삭제
            </button>
          </div>
        </div>

        {/* 오프라인 기능 안내 */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            오프라인에서 사용 가능한 기능
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>여행 기록 조회</h3>
                <p className='text-sm text-gray-600'>
                  저장된 여행 정보를 확인할 수 있습니다
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-purple-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>셰겐 계산기</h3>
                <p className='text-sm text-gray-600'>
                  캐시된 데이터로 일수 계산 가능
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
                  />
                </svg>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>비자 정보</h3>
                <p className='text-sm text-gray-600'>
                  저장된 국가별 비자 요구사항
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-yellow-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>자동 동기화</h3>
                <p className='text-sm text-gray-600'>
                  연결 복구 시 자동으로 동기화됩니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA 설치 안내 */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-blue-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-blue-800'>
                더 나은 오프라인 경험을 위한 팁
              </h3>
              <div className='mt-2 text-sm text-blue-700'>
                <p>
                  홈 화면에 DINO를 추가하면 앱처럼 사용할 수 있고,
                  오프라인에서도 더 많은 기능을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
