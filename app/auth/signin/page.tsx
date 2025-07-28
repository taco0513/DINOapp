'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // User already authenticated, redirecting
      router.replace(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Starting Google sign in

    try {
      // Use the callbackUrl from URL params or default to dashboard
      const targetUrl = callbackUrl.startsWith('/')
        ? callbackUrl
        : '/dashboard';

      await signIn('google', {
        callbackUrl: targetUrl,
        redirect: true,
      });
    } catch (error) {
      // Sign in failed
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}
          >
            잠시만 기다려주세요...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          border: '1px solid #e0e0e0',
          padding: '40px 30px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#000',
            }}
          >
            DINO
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
            }}
          >
            여행 기록을 시작하려면 로그인하세요
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              border: '2px solid #000',
              color: '#000',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox='0 0 24 24'>
              <path
                fill='#4285f4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34a853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#fbbc05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#ea4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            {isLoading ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '12px',
              color: '#888',
              lineHeight: '1.4',
            }}
          >
            로그인하면 이용약관 및 개인정보처리방침에 동의하는 것으로
            간주됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}
            >
              로딩 중...
            </div>
          </div>
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
