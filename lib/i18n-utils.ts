// Internationalization utilities for enhanced UX
import { type Locale } from '@/lib/i18n';

// RTL languages configuration
export const RTL_LANGUAGES: Locale[] = []; // None for current languages

// Date formatting with enhanced options
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  locale: Locale
): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year:
      startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined,
  };

  try {
    const localeMap = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    const formatter = new Intl.DateTimeFormat(localeMap[locale], options);
    const start = formatter.format(startDate);
    const end = formatter.format(endDate);

    return `${start} - ${end}`;
  } catch {
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

// Relative time formatting
export function formatRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(getLocaleCode(locale), {
    numeric: 'auto',
    style: 'short',
  });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

// Duration formatting (for stays)
export function formatDuration(days: number, locale: Locale): string {
  const units = {
    ko: { day: '일', week: '주', month: '개월' },
    en: { day: days === 1 ? 'day' : 'days', week: 'week', month: 'month' },
    ja: { day: '日', week: '週', month: 'ヶ月' },
    zh: { day: '天', week: '周', month: '个月' },
    es: { day: days === 1 ? 'día' : 'días', week: 'semana', month: 'mes' },
    fr: { day: days === 1 ? 'jour' : 'jours', week: 'semaine', month: 'mois' },
  };

  const unit = units[locale] || units.en;

  if (days === 0) return '0 ' + unit.day;
  if (days < 7) return `${days} ${unit.day}`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} ${unit.week}${weeks > 1 ? 's' : ''}`;
    }
    return `${weeks} ${unit.week}${weeks > 1 ? 's' : ''} ${remainingDays} ${unit.day}`;
  }

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (remainingDays === 0) {
    return `${months} ${unit.month}${months > 1 ? 's' : ''}`;
  }
  return `${months} ${unit.month}${months > 1 ? 's' : ''} ${remainingDays} ${unit.day}`;
}

// Number formatting with appropriate separators
export function formatNumber(num: number, locale: Locale): string {
  try {
    return num.toLocaleString(getLocaleCode(locale));
  } catch {
    return num.toString();
  }
}

// Percentage formatting
export function formatPercentage(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(getLocaleCode(locale), {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  } catch {
    return `${value}%`;
  }
}

// Helper to get full locale code
function getLocaleCode(locale: Locale): string {
  const localeMap = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
  };
  return localeMap[locale] || 'en-US';
}

// Pluralization helpers
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale
): string {
  // Korean, Japanese, Chinese don't use plurals typically
  if (['ko', 'ja', 'zh'].includes(locale)) {
    return singular;
  }

  return count === 1 ? singular : plural;
}

// Text direction helper
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.includes(locale) ? 'rtl' : 'ltr';
}

// Language detection from browser
export function detectBrowserLanguage(): Locale {
  if (typeof navigator === 'undefined') return 'ko';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';

  return 'ko'; // Default fallback
}

export type { Locale };
