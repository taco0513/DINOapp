'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the dashboard error to error reporting service
    // Dashboard error - handled by Next.js error boundary
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        padding: '40px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#333',
        }}>
          대시보드 로드 오류
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>
          대시보드를 불러오는 중 문제가 발생했습니다. 일시적인 오류일 수 있습니다.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '12px',
              borderRadius: '4px',
            }}
          >
            대시보드 다시 로드
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #000',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            홈으로 이동
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details style={{ 
            marginTop: '20px', 
            textAlign: 'left',
            fontSize: '12px',
            color: '#999',
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              개발 모드 - 오류 세부 정보
            </summary>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              overflow: 'auto',
              borderRadius: '4px',
            }}>
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}