'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
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
              시스템 오류가 발생했습니다
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5',
            }}>
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
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
                다시 시도
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

            {process.env.NODE_ENV === 'development' && error && (
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
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}

            <div style={{ 
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e0e0e0',
            }}>
              <p style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '8px',
              }}>
                문제가 계속 발생하면 고객지원에 문의하세요.
              </p>
              <a 
                href="mailto:support@dinoapp.net"
                style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                support@dinoapp.net
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}