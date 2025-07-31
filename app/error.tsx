'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-5'>
      <div className='max-w-sm text-center p-10 border border-border rounded-lg bg-card'>
        <h1 className='text-2xl font-bold mb-4 text-foreground'>
          문제가 발생했습니다
        </h1>

        <p className='text-base text-muted-foreground mb-6 leading-normal'>
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        <div className='mb-4 flex gap-3 justify-center'>
          <button
            onClick={reset}
            className='bg-primary text-primary-foreground border-none px-6 py-3 text-sm cursor-pointer rounded-sm hover:bg-primary/90 transition-colors'
          >
            다시 시도
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className='bg-background text-foreground border border-primary px-6 py-3 text-sm cursor-pointer rounded-sm hover:bg-muted transition-colors'
          >
            홈으로 이동
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='mt-5 text-left text-xs text-muted-foreground'>
            <summary className='cursor-pointer mb-2'>
              개발 모드 - 오류 세부 정보
            </summary>
            <pre className='bg-muted p-2 overflow-auto rounded-sm'>
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
