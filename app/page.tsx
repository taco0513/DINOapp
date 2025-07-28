import Link from 'next/link';
import dynamic from 'next/dynamic';

// 클라이언트 컴포넌트를 동적으로 로드
const SessionCheck = dynamic(() => import('@/components/auth/SessionCheck'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <>
      <SessionCheck />
      <main style={{ minHeight: '100vh' }}>
        <div
          className='container'
          style={{
            paddingTop: 'var(--space-20)',
            paddingBottom: 'var(--space-20)',
          }}
        >
          {/* Header */}
          <header className='text-center mb-8'>
            <h1 className='mb-2'>DINO</h1>
            <p className='text-secondary mb-4'>Digital Nomad Visa Tracker</p>
            <p
              className='text-small text-tertiary'
              style={{ maxWidth: '500px', margin: '0 auto' }}
            >
              복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로
              관리하는 플랫폼
            </p>
          </header>

          {/* Action Buttons */}
          <div className='flex gap-4 justify-center mb-8'>
            <Link href='/auth/signin' className='btn btn-primary'>
              로그인하여 시작하기
            </Link>

            <Link href='/demo' className='btn'>
              데모 보기
            </Link>
          </div>

          {/* Features */}
          <section>
            <div className='divider'></div>

            <h2 className='text-center mb-8'>주요 기능</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='card'>
                <h3 className='card-title'>실시간 추적</h3>
                <p className='text-small text-secondary'>
                  비자 만료일과 체류 기간을 자동으로 계산
                </p>
              </div>

              <div className='card'>
                <h3 className='card-title'>규정 준수</h3>
                <p className='text-small text-secondary'>
                  셰겐 90/180일 규칙을 정확하게 계산
                </p>
              </div>

              <div className='card'>
                <h3 className='card-title'>자동 기록</h3>
                <p className='text-small text-secondary'>
                  Gmail과 Calendar를 통해 여행을 자동 감지
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
