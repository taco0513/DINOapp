'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

interface HydrationSafeLoadingProps {
  fallback?: string;
  className?: string;
  translationKey?: string;
}

export function HydrationSafeLoading({
  fallback = 'Loading...',
  className = 'loading',
  translationKey = 'common.loading',
}: HydrationSafeLoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={className}>{mounted ? t(translationKey) : fallback}</div>
  );
}
