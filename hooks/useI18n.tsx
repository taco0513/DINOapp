'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { getCurrentLocale, setLocale, t, type Locale } from '@/lib/i18n';

// Custom hook for i18n with real-time updates
export function useI18n() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('ko');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale
  useEffect(() => {
    const locale = getCurrentLocale();
    setCurrentLocale(locale);
    setIsLoading(false);
  }, []);

  // Change locale without page refresh
  const changeLocale = useCallback((newLocale: Locale) => {
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dino-locale', newLocale);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(
        new CustomEvent('localechange', {
          detail: { locale: newLocale },
        })
      );
    }
  }, []);

  // Translation function that uses current state
  const translate = useCallback(
    (key: string, params?: Record<string, string>) => {
      return t(key, params);
    },
    [currentLocale]
  );

  return {
    locale: currentLocale,
    changeLocale,
    t: translate,
    isLoading,
  };
}

// Context for global i18n state

interface I18nContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const _I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('ko');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale
  useEffect(() => {
    const locale = getCurrentLocale();
    setCurrentLocale(locale);
    setIsLoading(false);
  }, []);

  // Change locale without page refresh
  const changeLocale = useCallback((newLocale: Locale) => {
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dino-locale', newLocale);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(
        new CustomEvent('localechange', {
          detail: { locale: newLocale },
        })
      );
    }
  }, []);

  // Translation function that uses current state
  const translate = useCallback(
    (key: string, params?: Record<string, string>) => {
      return t(key, params);
    },
    [currentLocale]
  );

  const value = {
    locale: currentLocale,
    changeLocale,
    t: translate,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
