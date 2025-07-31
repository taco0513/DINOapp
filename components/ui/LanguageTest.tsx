'use client';

import { t, getCurrentLocale } from '@/lib/i18n';

export default function LanguageTest() {
  const currentLocale = getCurrentLocale();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      <div>Current Locale: {currentLocale}</div>
      <div>Dashboard: {t('nav.dashboard')}</div>
      <div>Trips: {t('nav.trips')}</div>
      <div>Schengen: {t('nav.schengen')}</div>
      <div>Welcome: {t('dashboard.welcome', { name: 'Test User' })}</div>
    </div>
  );
}
