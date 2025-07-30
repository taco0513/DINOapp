'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface IOSDashboardProps {
  statsData?: any;
  schengenData?: any;
  loading?: boolean;
}

export default function IOSDashboard({
  statsData,
  schengenData,
  loading,
}: IOSDashboardProps) {
  const { data: session } = useSession();

  const quickActions = [
    {
      title: '새 여행 추가',
      subtitle: '여행을 기록하고 추적하세요',
      href: '/trips/new',
      icon: '✈️',
    },
    {
      title: '셰겐 계산기',
      subtitle: '90/180일 규칙 확인',
      href: '/schengen',
      icon: '🇪🇺',
    },
    {
      title: '여행 기록',
      subtitle: '모든 여행 보기',
      href: '/trips',
      icon: '📝',
    },
    {
      title: '비자 정보',
      subtitle: '비자 규정 확인',
      href: '/visa',
      icon: '📋',
    },
  ];

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-white p-4 rounded-lg shadow animate-pulse'
            >
              <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-6 min-h-screen'>
      <div className='space-y-6'>
        {/* Greeting Section */}
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-1'>
            안녕하세요{session?.user?.name ? `, ${session.user.name}님` : ''}
          </h1>
          <p className='text-gray-600'>오늘도 멋진 여행을 계획해보세요</p>
        </div>

        {/* Stats Overview */}
        {(statsData || schengenData) && (
          <div>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>
              여행 현황
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {statsData && (
                <>
                  <div className='bg-white p-4 rounded-lg shadow text-center'>
                    <div className='text-2xl font-bold text-gray-900 mb-1'>
                      {statsData.totalTrips || 0}
                    </div>
                    <div className='text-sm text-gray-600'>총 여행</div>
                  </div>
                  <div className='bg-white p-4 rounded-lg shadow text-center'>
                    <div className='text-2xl font-bold text-gray-900 mb-1'>
                      {statsData.totalCountries || 0}
                    </div>
                    <div className='text-sm text-gray-600'>방문 국가</div>
                  </div>
                </>
              )}
              {schengenData && (
                <>
                  <div className='bg-white p-4 rounded-lg shadow text-center'>
                    <div className='text-2xl font-bold text-blue-600 mb-1'>
                      {schengenData.currentDays || 0}
                    </div>
                    <div className='text-sm text-gray-600'>셰겐 일수</div>
                  </div>
                  <div className='bg-white p-4 rounded-lg shadow text-center'>
                    <div className='text-2xl font-bold text-green-600 mb-1'>
                      {90 - (schengenData.currentDays || 0)}
                    </div>
                    <div className='text-sm text-gray-600'>남은 일수</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            빠른 작업
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {quickActions.map(action => (
              <Link key={action.href} href={action.href} className='block'>
                <div className='bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'>
                  <div className='flex items-center'>
                    <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4'>
                      <span className='text-2xl'>{action.icon}</span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-gray-900 mb-1'>
                        {action.title}
                      </h3>
                      <p className='text-sm text-gray-600'>{action.subtitle}</p>
                    </div>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            최근 활동
          </h2>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='text-center py-8'>
              <div className='text-4xl mb-2'>📝</div>
              <p className='text-gray-600 mb-3'>아직 여행 기록이 없습니다</p>
              <Link
                href='/trips/new'
                className='text-blue-600 font-medium hover:text-blue-700'
              >
                첫 여행을 추가해보세요
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            유용한 팁
          </h2>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-start'>
              <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1'>
                <span className='text-sm'>💡</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-900 mb-1'>
                  Gmail 연동으로 자동 추적
                </h3>
                <p className='text-sm text-gray-600'>
                  이메일에서 항공권과 호텔 예약을 자동으로 감지하여 여행 기록을
                  만들어줍니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
