'use client';

import { useEffect } from 'react';

import { logger } from '@/lib/logger'

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Application Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-5)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-width-sm)',
          textAlign: 'center',
          padding: 'var(--space-10)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-base)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-primary)',
          }}
        >
          문제가 발생했습니다
        </h1>

        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: '1.5',
          }}
        >
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              padding: 'var(--space-3) var(--space-6)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              marginRight: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            다시 시도
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-primary)',
              padding: 'var(--space-3) var(--space-6)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            홈으로 이동
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details
            style={{
              marginTop: 'var(--space-5)',
              textAlign: 'left',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <summary
              style={{ cursor: 'pointer', marginBottom: 'var(--space-2)' }}
            >
              개발 모드 - 오류 세부 정보
            </summary>
            <pre
              style={{
                background: 'var(--color-surface-hover)',
                padding: 'var(--space-2)',
                overflow: 'auto',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
