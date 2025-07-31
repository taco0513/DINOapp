'use client';

import { useState } from 'react';
import {
  getCurrentLocale,
  setLocale,
  getSupportedLocales,
  type Locale,
} from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({
  className = '',
}: LanguageSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const currentLocale = getCurrentLocale();
  const supportedLocales = getSupportedLocales();

  const currentLanguage = supportedLocales.find(
    lang => lang.code === currentLocale
  );

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale);
    setShowDropdown(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`btn btn-ghost btn-sm flex items-center gap-2 ${className}`}
      >
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
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
          <div
            className='absolute right-0 z-50 card p-0'
            style={{
              marginTop: 'var(--space-2)',
              minWidth: '150px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border-strong)',
            }}
          >
            {supportedLocales.map(locale => (
              <button
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={`w-full flex items-center text-left transition-colors ${
                  currentLocale === locale.code ? '' : ''
                }`}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor:
                    currentLocale === locale.code
                      ? 'var(--color-surface)'
                      : 'transparent',
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={e => {
                  if (currentLocale !== locale.code) {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-surface-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (currentLocale !== locale.code) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ marginRight: 'var(--space-3)' }}>
                  {locale.flag}
                </span>
                <span>{locale.name}</span>
                {currentLocale === locale.code && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
