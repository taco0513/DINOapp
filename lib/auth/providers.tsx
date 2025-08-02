'use client';

/**
 * DINO v2.0 - Authentication Providers
 * Client-side session provider wrapper
 */

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface AuthProvidersProps {
  readonly children: React.ReactNode;
  readonly session?: Session | null;
}

export function AuthProviders({ children, session }: AuthProvidersProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // 5분마다만 세션 새로고침
      refetchOnWindowFocus={false} // 윈도우 포커스 시 세션 체크 비활성화
      refetchWhenOffline={false} // 오프라인일 때 세션 체크 비활성화
    >
      {children}
    </SessionProvider>
  );
}