import Link from 'next/link';
export default function NotFound() {

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
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-primary)',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-primary)',
          }}
        >
          페이지를 찾을 수 없습니다
        </h2>

        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: '1.5',
          }}
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
          }}
        >
          <Link
            href='/'
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              textDecoration: 'none',
              padding: 'var(--space-3) var(--space-6)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            홈으로 이동
          </Link>

          <Link
            href='/dashboard'
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-primary)',
              textDecoration: 'none',
              padding: 'var(--space-3) var(--space-6)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            대시보드
          </Link>
        </div>

        <div
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            도움이 필요하신가요?
          </p>
          <Link
            href='mailto:support@dino-app.com'
            style={{
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
            }}
          >
            고객 지원 문의
          </Link>
        </div>
      </div>
    </div>
  );
}
