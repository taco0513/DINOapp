'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ABTestHook {
  variant: string | null;
  loading: boolean;
  trackEvent: (event: string, metadata?: Record<string, any>) => Promise<void>;
}

export function useABTest(testId: string): ABTestHook {
  const [variant, setVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchVariant() {
      try {
        const response = await fetch(`/api/ab-test/${testId}/variant`);
        if (response.ok) {
          const data = await response.json();
          setVariant(data.variant?.name || null);
        }
      } catch (error) {
        console.error('Failed to fetch AB test variant:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVariant();
  }, [testId]);

  const trackEvent = async (event: string, metadata?: Record<string, any>) => {
    try {
      await fetch(`/api/ab-test/${testId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          userId: session?.user?.id,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to track AB test event:', error);
    }
  };

  return { variant, loading, trackEvent };
}

// 사용 예시:
// const { variant, loading, trackEvent } = useABTest('homepage-cta-test');
// 
// if (variant === 'variant-a') {
//   return <ButtonVariantA onClick={() => trackEvent('click')} />;
// } else {
//   return <ButtonVariantB onClick={() => trackEvent('click')} />;
// }