'use client';

import { useState } from 'react';
import EnhancedLanguageSelector from '@/components/ui/EnhancedLanguageSelector';
import { useI18n } from '@/hooks/useI18n';
import {
  formatDateRange,
  formatDuration,
  formatRelativeTime,
} from '@/lib/i18n-utils';
import { PageHeader } from '@/components/common/PageHeader';

export default function I18nTestPage() {
  const { locale, t } = useI18n();
  const [testDate] = useState(new Date());
  const [endDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days later

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <PageHeader
          title='🌍 국제화 테스트 페이지'
          description='6개 언어 지원 및 실시간 언어 변경 테스트'
        />

        {/* Language Selector Variants */}
        <div className='grid md:grid-cols-3 gap-8 mb-8'>
          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>기본 선택기</h3>
            <EnhancedLanguageSelector />
          </div>

          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>컴팩트 선택기</h3>
            <EnhancedLanguageSelector variant='compact' />
          </div>

          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>현재 언어</h3>
            <div className='text-2xl font-bold text-primary'>
              {locale.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Full Language Selector */}
        <div className='card p-8 mb-8'>
          <EnhancedLanguageSelector variant='full' />
        </div>

        {/* Translation Examples */}
        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>네비게이션 번역</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>{t('nav.dashboard')}:</strong> {t('nav.dashboard')}
              </div>
              <div>
                <strong>{t('nav.trips')}:</strong> {t('nav.trips')}
              </div>
              <div>
                <strong>{t('nav.schengen')}:</strong> {t('nav.schengen')}
              </div>
              <div>
                <strong>{t('nav.calendar')}:</strong> {t('nav.calendar')}
              </div>
            </div>
          </div>

          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>공통 텍스트</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>Loading:</strong> {t('common.loading')}
              </div>
              <div>
                <strong>Error:</strong> {t('common.error')}
              </div>
              <div>
                <strong>Retry:</strong> {t('common.retry')}
              </div>
              <div>
                <strong>Days:</strong> {t('common.days')}
              </div>
            </div>
          </div>
        </div>

        {/* Formatting Examples */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>날짜 형식</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>Single:</strong> {testDate.toLocaleDateString()}
              </div>
              <div>
                <strong>Range:</strong>{' '}
                {formatDateRange(testDate, endDate, locale)}
              </div>
              <div>
                <strong>Relative:</strong>{' '}
                {formatRelativeTime(testDate, locale)}
              </div>
            </div>
          </div>

          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>기간 형식</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>3일:</strong> {formatDuration(3, locale)}
              </div>
              <div>
                <strong>14일:</strong> {formatDuration(14, locale)}
              </div>
              <div>
                <strong>45일:</strong> {formatDuration(45, locale)}
              </div>
            </div>
          </div>

          <div className='card p-6'>
            <h3 className='text-lg font-semibold mb-4'>숫자 형식</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>1,234:</strong> {(1234).toLocaleString()}
              </div>
              <div>
                <strong>50%:</strong>{' '}
                {new Intl.NumberFormat(undefined, { style: 'percent' }).format(
                  0.5
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Translation Test */}
        <div className='card p-8'>
          <h3 className='text-lg font-semibold mb-4'>대시보드 번역 테스트</h3>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <p className='mb-2'>
                {t('dashboard.welcome', { name: 'Test User' })}
              </p>
              <p className='mb-2'>{t('dashboard.recent_activity')}</p>
              <p className='text-sm text-gray-600'>
                {t('dashboard.loading_activity')}
              </p>
            </div>
            <div>
              <p className='mb-2'>{t('language.change_note')}</p>
              <p className='text-sm text-gray-600'>
                {t('language.auto_detect')}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className='mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <h4 className='font-semibold mb-2'>🧪 테스트 방법</h4>
          <ul className='text-sm space-y-1 list-disc list-inside'>
            <li>위의 언어 선택기를 사용해서 언어를 변경하세요</li>
            <li>페이지 새로고침 없이 즉시 텍스트가 변경되는지 확인하세요</li>
            <li>브라우저를 새로고침해도 선택한 언어가 유지되는지 확인하세요</li>
            <li>날짜와 숫자 형식이 언어에 맞게 표시되는지 확인하세요</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
