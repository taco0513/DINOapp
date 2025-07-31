'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';
import { t } from '@/lib/i18n';

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
      <StandardPageLayout
        title={t('nav.dashboard')}
        description='여행 현황을 한눈에 확인하세요'
        icon={PageIcons.Dashboard}
        breadcrumbs={[{ label: t('nav.dashboard') }]}
      >
        <div className='space-y-8'>
          {/* Loading greeting */}
          <div className='text-center animate-pulse'>
            <div className='h-8 bg-muted rounded-lg w-64 mx-auto mb-2'></div>
            <div className='h-6 bg-muted rounded-lg w-48 mx-auto'></div>
          </div>

          {/* Loading cards */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-card p-6 rounded-xl shadow-sm border border-border animate-pulse'
            >
              <div className='h-6 bg-muted rounded-lg w-32 mx-auto mb-4'></div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[...Array(4)].map((_, j) => (
                  <div key={j} className='p-4 bg-muted/50 rounded-lg'>
                    <div className='h-8 bg-muted rounded w-16 mx-auto mb-2'></div>
                    <div className='h-4 bg-muted rounded w-20 mx-auto'></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={`안녕하세요${session?.user?.name ? `, ${session.user.name}님` : ''}! 👋`}
      description='오늘도 멋진 여행을 계획해보세요'
      icon={PageIcons.Dashboard}
      breadcrumbs={[{ label: t('nav.dashboard') }]}
    >
      <div className='space-y-8'>
        {/* Stats Overview */}
        {(statsData || schengenData) && (
          <div className='bg-card rounded-xl shadow-sm border border-border p-6'>
            <h2 className='text-xl font-bold text-foreground mb-6 text-center'>
              📊 여행 현황
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {statsData && (
                <>
                  <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
                    <div className='text-3xl font-bold text-primary mb-2'>
                      {statsData.totalTrips || 0}
                    </div>
                    <div className='text-sm font-medium text-primary'>
                      총 여행
                    </div>
                  </div>
                  <div className='text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20'>
                    <div className='text-3xl font-bold text-secondary-foreground mb-2'>
                      {statsData.totalCountries || 0}
                    </div>
                    <div className='text-sm font-medium text-secondary-foreground'>
                      방문 국가
                    </div>
                  </div>
                </>
              )}
              {schengenData && (
                <>
                  <div className='text-center p-4 bg-accent/10 rounded-lg border border-accent/20'>
                    <div className='text-3xl font-bold text-accent-foreground mb-2'>
                      {schengenData.currentDays || 0}
                    </div>
                    <div className='text-sm font-medium text-accent-foreground'>
                      셰겐 일수
                    </div>
                  </div>
                  <div className='text-center p-4 bg-muted rounded-lg border border-border'>
                    <div className='text-3xl font-bold text-foreground mb-2'>
                      {90 - (schengenData.currentDays || 0)}
                    </div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      남은 일수
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className='bg-card rounded-xl shadow-sm border border-border p-6'>
          <h2 className='text-xl font-bold text-foreground mb-6 text-center'>
            ⚡ 빠른 작업
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {quickActions.map(action => (
              <Link
                key={action.href}
                href={action.href}
                className='block group'
              >
                <div className='p-5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group-hover:shadow-md'>
                  <div className='flex items-center'>
                    <div className='w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center mr-4 group-hover:from-primary/30 group-hover:to-primary/40 transition-all duration-200'>
                      <span className='text-2xl filter group-hover:scale-110 transition-transform duration-200'>
                        {action.icon}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-foreground mb-1 group-hover:text-primary transition-colors'>
                        {action.title}
                      </h3>
                      <p className='text-sm text-muted-foreground group-hover:text-primary/90'>
                        {action.subtitle}
                      </p>
                    </div>
                    <svg
                      className='w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200'
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
        <div className='bg-card rounded-xl shadow-sm border border-border p-6'>
          <h2 className='text-xl font-bold text-foreground mb-6 text-center'>
            📋 최근 활동
          </h2>
          <div className='text-center py-12'>
            <div className='w-20 h-20 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>📝</span>
            </div>
            <p className='text-muted-foreground mb-4 text-lg'>
              아직 여행 기록이 없습니다
            </p>
            <Link
              href='/trips/new'
              className='inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md'
            >
              <span className='mr-2'>✈️</span>첫 여행을 추가해보세요
            </Link>
          </div>
        </div>

        {/* Tips Section */}
        <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6'>
          <h2 className='text-xl font-bold text-foreground mb-6 text-center'>
            💡 유용한 팁
          </h2>
          <div className='bg-card/80 backdrop-blur-sm p-5 rounded-lg border border-border/50'>
            <div className='flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mr-4 flex-shrink-0'>
                <span className='text-xl'>📧</span>
              </div>
              <div>
                <h3 className='font-semibold text-foreground mb-2'>
                  Gmail 연동으로 자동 추적
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  이메일에서 항공권과 호텔 예약을 자동으로 감지하여 여행 기록을
                  만들어줍니다. 편리하고 정확한 여행 관리를 경험해보세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
}
