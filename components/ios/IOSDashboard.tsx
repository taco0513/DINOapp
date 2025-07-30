'use client';

import { motion } from 'framer-motion';
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
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: '셰겐 계산기',
      subtitle: '90/180일 규칙 확인',
      href: '/schengen',
      icon: '🇪🇺',
      color: 'from-green-500 to-green-600',
    },
    {
      title: '여행 기록',
      subtitle: '모든 여행 보기',
      href: '/trips',
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: '비자 정보',
      subtitle: '비자 규정 확인',
      href: '/visa',
      icon: '📋',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='ios-card animate-pulse'>
              <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className='container mx-auto px-4 py-6 pb-safe min-h-screen'
      style={{ background: '#f8f9fa' }}
    >
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='space-y-6'
      >
        {/* Greeting Section */}
        <motion.div variants={itemVariants} className='mb-8'>
          <h1 className='text-title-1 font-semibold text-primary mb-1'>
            안녕하세요{session?.user?.name ? `, ${session.user.name}님` : ''}
          </h1>
          <p className='text-body text-secondary'>
            오늘도 멋진 여행을 계획해보세요
          </p>
        </motion.div>

        {/* Stats Overview */}
        {(statsData || schengenData) && (
          <motion.div variants={itemVariants}>
            <h2 className='text-title-3 font-semibold text-primary mb-3'>
              여행 현황
            </h2>
            <div className='grid grid-cols-2 gap-3'>
              {statsData && (
                <>
                  <div className='ios-card text-center'>
                    <div className='text-title-2 font-bold text-primary mb-1'>
                      {statsData.totalTrips || 0}
                    </div>
                    <div className='text-caption text-secondary'>총 여행</div>
                  </div>
                  <div className='ios-card text-center'>
                    <div className='text-title-2 font-bold text-primary mb-1'>
                      {statsData.totalCountries || 0}
                    </div>
                    <div className='text-caption text-secondary'>방문 국가</div>
                  </div>
                </>
              )}
              {schengenData && (
                <>
                  <div className='ios-card text-center'>
                    <div className='text-title-2 font-bold text-blue-600 mb-1'>
                      {schengenData.currentDays || 0}
                    </div>
                    <div className='text-caption text-secondary'>셰겐 일수</div>
                  </div>
                  <div className='ios-card text-center'>
                    <div className='text-title-2 font-bold text-green-600 mb-1'>
                      {90 - (schengenData.currentDays || 0)}
                    </div>
                    <div className='text-caption text-secondary'>남은 일수</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className='text-title-3 font-semibold text-primary mb-3'>
            빠른 작업
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href} className='block'>
                  <div className='ios-card group'>
                    <div className='flex items-center'>
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-0 mr-4 shadow-sm`}
                      >
                        <span className='text-xl'>{action.icon}</span>
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-footnote font-semibold text-primary mb-1'>
                          {action.title}
                        </h3>
                        <p className='text-caption text-secondary'>
                          {action.subtitle}
                        </p>
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - Placeholder */}
        <motion.div variants={itemVariants}>
          <h2 className='text-title-3 font-semibold text-primary mb-3'>
            최근 활동
          </h2>
          <div className='ios-card'>
            <div className='text-center py-8'>
              <div className='text-4xl mb-2'>📝</div>
              <p className='text-body text-secondary mb-3'>
                아직 여행 기록이 없습니다
              </p>
              <Link
                href='/trips/new'
                className='text-footnote text-blue-600 font-medium'
              >
                첫 여행을 추가해보세요
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div variants={itemVariants}>
          <h2 className='text-title-3 font-semibold text-primary mb-3'>
            유용한 팁
          </h2>
          <div className='ios-card'>
            <div className='flex items-start'>
              <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1'>
                <span className='text-sm'>💡</span>
              </div>
              <div>
                <h3 className='text-footnote font-medium text-primary mb-1'>
                  Gmail 연동으로 자동 추적
                </h3>
                <p className='text-caption text-secondary'>
                  이메일에서 항공권과 호텔 예약을 자동으로 감지하여 여행 기록을
                  만들어줍니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
