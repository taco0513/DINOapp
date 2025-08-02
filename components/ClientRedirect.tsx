'use client';

/**
 * DINO v2.0 - Client Redirect Component
 * Handles client-side redirects without Hook errors
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ClientRedirectProps {
  readonly href: string;
  readonly replace?: boolean;
}

export function ClientRedirect({ href, replace = false }: ClientRedirectProps): null {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  }, [href, replace, router]);

  return null;
}