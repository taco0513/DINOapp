import Link from 'next/link'

export default function NotFound() {
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
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#333',
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#333',
        }}>
          페이지를 찾을 수 없습니다
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link 
            href="/"
            style={{
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 24px',
              fontSize: '14px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            홈으로 이동
          </Link>
          
          <Link 
            href="/dashboard"
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #000',
              textDecoration: 'none',
              padding: '12px 24px',
              fontSize: '14px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            대시보드
          </Link>
        </div>

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
            도움이 필요하신가요?
          </p>
          <Link 
            href="mailto:support@dino-app.com"
            style={{
              color: '#0066cc',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            고객 지원 문의
          </Link>
        </div>
      </div>
    </div>
  )
}