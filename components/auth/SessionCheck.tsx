'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SessionCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;

    // Prevent multiple redirects
    if (session && !hasRedirected.current) {
      hasRedirected.current = true;
      // Use push instead of replace to avoid issues
      router.push('/dashboard');
    }
  }, [session, status, router]);

  return null;
}
