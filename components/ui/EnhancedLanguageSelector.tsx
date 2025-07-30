'use client';

import { useState } from 'react';
import { getSupportedLocales, type Locale } from '@/lib/i18n';
import { useI18n } from '@/hooks/useI18n';
import { Globe } from 'lucide-react';

interface EnhancedLanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'full';
}

export default function EnhancedLanguageSelector({
  className = '',
  showLabel = true,
  variant = 'default',
}: EnhancedLanguageSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { locale: currentLocale, changeLocale, t } = useI18n();
  const supportedLocales = getSupportedLocales();

  const currentLanguage = supportedLocales.find(
    lang => lang.code === currentLocale
  );

  const handleLanguageChange = (locale: Locale) => {
    changeLocale(locale); // No page refresh!
    setShowDropdown(false);
  };

  // Compact variant for mobile/header
  if (variant === 'compact') {
    return (
      <div className='relative'>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`btn btn-ghost btn-sm flex items-center gap-1 ${className}`}
          title={t('language.select')}
        >
          <Globe className='h-4 w-4' />
          <span className='text-xs'>{currentLanguage?.code.toUpperCase()}</span>
        </button>

        {showDropdown && (
          <>
            <div
              className='fixed inset-0 z-40'
              onClick={() => setShowDropdown(false)}
            />
            <div className='absolute right-0 z-50 mt-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[140px]'>
              {supportedLocales.map(locale => (
                <button
                  key={locale.code}
                  onClick={() => handleLanguageChange(locale.code)}
                  className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentLocale === locale.code
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                >
                  <span className='mr-2'>{locale.flag}</span>
                  <span className='flex-1'>{locale.name}</span>
                  {currentLocale === locale.code && (
                    <span className='text-xs opacity-70'>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant for settings page
  if (variant === 'full') {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Globe className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>{t('language.select')}</h3>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {supportedLocales.map(locale => (
            <button
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                currentLocale === locale.code
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <span className='text-2xl'>{locale.flag}</span>
              <div className='text-left'>
                <div className='font-medium'>{locale.name}</div>
                <div className='text-sm text-gray-500 uppercase'>
                  {locale.code}
                </div>
              </div>
              {currentLocale === locale.code && (
                <div className='ml-auto'>
                  <div className='w-2 h-2 bg-primary rounded-full'></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-400'>
          {t('language.change_note')}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className='relative'>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`btn btn-ghost btn-sm flex items-center gap-2 ${className}`}
        aria-label={t('language.select')}
      >
        <Globe className='h-4 w-4' />
        {showLabel && <span>{currentLanguage?.name}</span>}
        <span>{currentLanguage?.flag}</span>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setShowDropdown(false)}
          />
          <div className='absolute right-0 z-50 mt-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px]'>
            {supportedLocales.map(locale => (
              <button
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={`w-full flex items-center px-4 py-3 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currentLocale === locale.code
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''
                }`}
              >
                <span className='mr-3 text-lg'>{locale.flag}</span>
                <span className='flex-1'>{locale.name}</span>
                <span className='text-xs text-gray-500 uppercase mr-2'>
                  {locale.code}
                </span>
                {currentLocale === locale.code && (
                  <span className='text-primary'>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
