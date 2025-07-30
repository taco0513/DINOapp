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
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='space-y-8'>
            {/* Loading greeting */}
            <div className='text-center animate-pulse'>
              <div className='h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-2'></div>
              <div className='h-6 bg-gray-200 rounded-lg w-48 mx-auto'></div>
            </div>

            {/* Loading cards */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse'
              >
                <div className='h-6 bg-gray-200 rounded-lg w-32 mx-auto mb-4'></div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className='p-4 bg-gray-50 rounded-lg'>
                      <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2'></div>
                      <div className='h-4 bg-gray-200 rounded w-20 mx-auto'></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-8'>
          {/* Greeting Section */}
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              안녕하세요{session?.user?.name ? `, ${session.user.name}님` : ''}!
              👋
            </h1>
            <p className='text-lg text-gray-600'>
              오늘도 멋진 여행을 계획해보세요
            </p>
          </div>

          {/* Stats Overview */}
          {(statsData || schengenData) && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
                📊 여행 현황
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {statsData && (
                  <>
                    <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-100'>
                      <div className='text-3xl font-bold text-blue-600 mb-2'>
                        {statsData.totalTrips || 0}
                      </div>
                      <div className='text-sm font-medium text-blue-700'>
                        총 여행
                      </div>
                    </div>
                    <div className='text-center p-4 bg-green-50 rounded-lg border border-green-100'>
                      <div className='text-3xl font-bold text-green-600 mb-2'>
                        {statsData.totalCountries || 0}
                      </div>
                      <div className='text-sm font-medium text-green-700'>
                        방문 국가
                      </div>
                    </div>
                  </>
                )}
                {schengenData && (
                  <>
                    <div className='text-center p-4 bg-purple-50 rounded-lg border border-purple-100'>
                      <div className='text-3xl font-bold text-purple-600 mb-2'>
                        {schengenData.currentDays || 0}
                      </div>
                      <div className='text-sm font-medium text-purple-700'>
                        셰겐 일수
                      </div>
                    </div>
                    <div className='text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100'>
                      <div className='text-3xl font-bold text-emerald-600 mb-2'>
                        {90 - (schengenData.currentDays || 0)}
                      </div>
                      <div className='text-sm font-medium text-emerald-700'>
                        남은 일수
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              ⚡ 빠른 작업
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {quickActions.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className='block group'
                >
                  <div className='p-5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md'>
                    <div className='flex items-center'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200'>
                        <span className='text-2xl filter group-hover:scale-110 transition-transform duration-200'>
                          {action.icon}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 mb-1 group-hover:text-blue-800 transition-colors'>
                          {action.title}
                        </h3>
                        <p className='text-sm text-gray-600 group-hover:text-blue-700'>
                          {action.subtitle}
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200'
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
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              📋 최근 활동
            </h2>
            <div className='text-center py-12'>
              <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-4xl'>📝</span>
              </div>
              <p className='text-gray-600 mb-4 text-lg'>
                아직 여행 기록이 없습니다
              </p>
              <Link
                href='/trips/new'
                className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md'
              >
                <span className='mr-2'>✈️</span>첫 여행을 추가해보세요
              </Link>
            </div>
          </div>

          {/* Tips Section */}
          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              💡 유용한 팁
            </h2>
            <div className='bg-white/80 backdrop-blur-sm p-5 rounded-lg border border-white/50'>
              <div className='flex items-start'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 flex-shrink-0'>
                  <span className='text-xl'>📧</span>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    Gmail 연동으로 자동 추적
                  </h3>
                  <p className='text-gray-700 leading-relaxed'>
                    이메일에서 항공권과 호텔 예약을 자동으로 감지하여 여행
                    기록을 만들어줍니다. 편리하고 정확한 여행 관리를
                    경험해보세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
