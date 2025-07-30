'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nProvider } from '@/hooks/useI18n';

interface TranslationProviderProps {
  children: ReactNode;
}

// Provider component to wrap the entire app with i18n context
export function TranslationProvider({ children }: TranslationProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <I18nProvider>{children}</I18nProvider>;
}

// HOC for automatic translation updates
export function withTranslation<T extends object>(
  Component: React.ComponentType<T>
) {
  return function TranslatedComponent(props: T) {
    const [, forceUpdate] = useState({});

    useEffect(() => {
      const handleLocaleChange = () => {
        forceUpdate({});
      };

      window.addEventListener('localechange', handleLocaleChange);
      return () =>
        window.removeEventListener('localechange', handleLocaleChange);
    }, []);

    return <Component {...props} />;
  };
}
