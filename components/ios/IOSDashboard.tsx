'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/icons';
import { px, py } from '@/lib/spacing';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Button } from '@/components/ui/button';

interface IOSDashboardProps {
  statsData?: any;
  schengenData?: any;
  overstayWarnings?: any;
  loading?: boolean;
}

export default function IOSDashboard({
  statsData,
  schengenData,
  overstayWarnings,
  loading,
}: IOSDashboardProps) {
  const { data: session } = useSession();

  const quickActions = [
    {
      title: '새 여행 추가',
      subtitle: '여행을 기록하고 추적하세요',
      href: '/trips/new',
      icon: 'plane' as const,
    },
    {
      title: '셰겐 계산기',
      subtitle: '90/180일 규칙 확인',
      href: '/schengen',
      icon: 'schengen' as const,
    },
    {
      title: '여행 기록',
      subtitle: '모든 여행 보기',
      href: '/trips',
      icon: 'file-text' as const,
    },
    {
      title: '비자 정보',
      subtitle: '비자 규정 확인',
      href: '/visa',
      icon: 'visa' as const,
    },
  ];

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto' style={{ ...px('4'), ...py('8') }}>
          <div className='space-y-8'>
            {/* Loading greeting */}
            <div className='text-center'>
              <Loading.Skeleton height={32} width="256px" className="mx-auto mb-2" />
              <Loading.Skeleton height={24} width="192px" className="mx-auto" />
            </div>

            {/* Loading stats */}
            <div className='bg-card rounded-xl shadow-sm border border-border' style={{ padding: 'var(--space-6)' }}>
              <Loading.Skeleton height={24} width="128px" className="mx-auto mb-6" />
              <div className='grid grid-cols-2 md:grid-cols-4' style={{ gap: 'var(--space-4)' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='text-center bg-gray-50 rounded-lg' style={{ padding: 'var(--space-4)' }}>
                    <Loading.Skeleton height={32} width="64px" className="mx-auto mb-2" />
                    <Loading.Skeleton height={16} width="80px" className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Loading quick actions */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100' style={{ padding: 'var(--space-6)' }}>
              <Loading.Skeleton height={24} width="128px" className="mx-auto mb-6" />
              <div className='grid grid-cols-1 md:grid-cols-2' style={{ gap: 'var(--space-4)' }}>
                {[...Array(4)].map((_, i) => (
                  <Loading.Card key={i} showImage={false} />
                ))}
              </div>
            </div>

            {/* Loading recent activity */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100' style={{ padding: 'var(--space-6)' }}>
              <Loading.Skeleton height={24} width="128px" className="mx-auto mb-6" />
              <Loading.List items={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto' style={{ ...px('4'), ...py('8') }}>
        <div className='space-y-8'>
          {/* Greeting Section */}
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-foreground' style={{ marginBottom: 'var(--space-2)' }}>
              안녕하세요{session?.user?.name ? `, ${session.user.name}님` : ''}!
              👋
            </h1>
            <p className='text-lg text-muted-foreground'>
              오늘도 멋진 여행을 계획해보세요
            </p>
          </div>

          {/* Overstay Warnings */}
          {overstayWarnings && overstayWarnings.summary.total > 0 && (
            <div className='bg-red-50 rounded-xl shadow-sm border border-red-200' style={{ padding: 'var(--space-6)' }}>
              <h2 className='text-xl font-bold text-red-800 text-center mb-4'>
                <Icon name="alert-triangle" size="md" className="inline mr-2" />
                체류 기간 경고
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
                {overstayWarnings.summary.critical > 0 && (
                  <div className='text-center bg-red-100 rounded-lg border border-red-300 p-3'>
                    <div className='text-2xl font-bold text-red-600'>
                      {overstayWarnings.summary.critical}
                    </div>
                    <div className='text-xs font-medium text-red-700'>긴급</div>
                  </div>
                )}
                {overstayWarnings.summary.high > 0 && (
                  <div className='text-center bg-orange-100 rounded-lg border border-orange-300 p-3'>
                    <div className='text-2xl font-bold text-orange-600'>
                      {overstayWarnings.summary.high}
                    </div>
                    <div className='text-xs font-medium text-orange-700'>높음</div>
                  </div>
                )}
                {overstayWarnings.summary.medium > 0 && (
                  <div className='text-center bg-yellow-100 rounded-lg border border-yellow-300 p-3'>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {overstayWarnings.summary.medium}
                    </div>
                    <div className='text-xs font-medium text-yellow-700'>보통</div>
                  </div>
                )}
                {overstayWarnings.summary.low > 0 && (
                  <div className='text-center bg-blue-100 rounded-lg border border-blue-300 p-3'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {overstayWarnings.summary.low}
                    </div>
                    <div className='text-xs font-medium text-blue-700'>낮음</div>
                  </div>
                )}
              </div>
              <Link href='/overstay-warnings'>
                <Button variant='destructive' className='w-full'>
                  경고 상세 보기
                  <Icon name="chevron-right" size="sm" className="ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Overview */}
          {(statsData || schengenData) && (
            <div className='bg-card rounded-xl shadow-sm border border-border' style={{ padding: 'var(--space-6)' }}>
              <h2 className='text-xl font-bold text-foreground text-center' style={{ marginBottom: 'var(--space-6)' }}>
                <Icon name="bar-chart" size="md" className="inline mr-2" />
                여행 현황
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {statsData && (
                  <>
                    <div className='text-center bg-primary/10 rounded-lg border border-primary/20' style={{ padding: 'var(--space-4)' }}>
                      <div className='text-3xl font-bold text-primary mb-2'>
                        {statsData.totalTrips || 0}
                      </div>
                      <div className='text-sm font-medium text-blue-700'>
                        총 여행
                      </div>
                    </div>
                    <div className='text-center bg-green-50 rounded-lg border border-green-100' style={{ padding: 'var(--space-4)' }}>
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
                    <div className='text-center bg-purple-50 rounded-lg border border-purple-100' style={{ padding: 'var(--space-4)' }}>
                      <div className='text-3xl font-bold text-purple-600 mb-2'>
                        {schengenData.currentDays || 0}
                      </div>
                      <div className='text-sm font-medium text-purple-700'>
                        셰겐 일수
                      </div>
                    </div>
                    <div className='text-center bg-emerald-50 rounded-lg border border-emerald-100' style={{ padding: 'var(--space-4)' }}>
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
          <div className='bg-white rounded-xl shadow-sm border border-gray-100' style={{ padding: 'var(--space-6)' }}>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              <Icon name="zap" size="md" className="inline mr-2" />
              빠른 작업
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2' style={{ gap: 'var(--space-4)' }}>
              {quickActions.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className='block group'
                >
                  <div className='rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group-hover:shadow-md' style={{ padding: 'var(--space-5)' }}>
                    <div className='flex items-center'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200'>
                        <Icon name={action.icon} size="lg" className="group-hover:scale-110 transition-transform duration-200" />
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 mb-1 group-hover:text-blue-800 transition-colors'>
                          {action.title}
                        </h3>
                        <p className='text-sm text-gray-600 group-hover:text-blue-700'>
                          {action.subtitle}
                        </p>
                      </div>
                      <Icon 
                        name="chevron-right" 
                        size="md" 
                        className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" 
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100' style={{ padding: 'var(--space-6)' }}>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              <Icon name="file-text" size="md" className="inline mr-2" />
              최근 활동
            </h2>
            <Error.Empty
              icon="file-text"
              title="아직 여행 기록이 없습니다"
              message="첫 여행을 추가하고 비자 관리를 시작해보세요."
              action={
                <Link href='/trips/new'>
                  <Button>
                    <Icon name="plane" size="sm" className="mr-2" />
                    첫 여행을 추가해보세요
                  </Button>
                </Link>
              }
            />
          </div>

          {/* Tips Section */}
          <div className='bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20' style={{ padding: 'var(--space-6)' }}>
            <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
              <Icon name="tips" size="md" className="inline mr-2" />
              유용한 팁
            </h2>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg border border-white/50' style={{ padding: 'var(--space-5)' }}>
              <div className='flex items-start'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 flex-shrink-0'>
                  <Icon name="mail" size="lg" />
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
