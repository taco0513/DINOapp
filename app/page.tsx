import Link from 'next/link';
import dynamic from 'next/dynamic';

// 하이드레이션 안전한 세션 체크 컴포넌트
const SessionCheck = dynamic(() => import('@/components/auth/SessionCheck'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <>
      <SessionCheck />
      <main
        style={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(14, 165, 233, 0.05) 0%, transparent 50%),
            var(--color-background)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '300px',
            height: '300px',
            background:
              'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(245, 158, 11, 0.1))',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: 'float 6s ease-in-out infinite',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '200px',
            height: '200px',
            background:
              'linear-gradient(225deg, rgba(245, 158, 11, 0.1), rgba(14, 165, 233, 0.1))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite reverse',
            zIndex: 0,
          }}
        />

        <div
          className='container'
          style={{
            paddingTop: 'var(--space-20)',
            paddingBottom: 'var(--space-20)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Enhanced Hero Section */}
          <header className='text-center mb-12'>
            <div className='hero-badge mb-6'>
              <span className='badge badge-primary'>✈️ Travel Smart</span>
            </div>

            <h1
              className='hero-title mb-4'
              style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: 'var(--font-bold)',
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'var(--animation-slide-up)',
                letterSpacing: '-0.02em',
              }}
            >
              DINO
            </h1>

            <p
              className='hero-subtitle text-lg mb-6'
              style={{
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--font-medium)',
                animation: 'var(--animation-slide-up)',
                animationDelay: '100ms',
                animationFillMode: 'both',
              }}
            >
              Digital Nomad Visa Tracker
            </p>

            <p
              className='hero-description text-base'
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                color: 'var(--color-text-tertiary)',
                lineHeight: '1.6',
                animation: 'var(--animation-slide-up)',
                animationDelay: '200ms',
                animationFillMode: 'both',
              }}
            >
              복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로
              관리하는
              <strong style={{ color: 'var(--color-primary)' }}>
                {' '}
                스마트 플랫폼
              </strong>
            </p>
          </header>

          {/* Enhanced Action Buttons */}
          <div
            className='flex flex-col sm:flex-row gap-4 justify-center mb-16'
            style={{
              animation: 'var(--animation-slide-up)',
              animationDelay: '300ms',
              animationFillMode: 'both',
            }}
          >
            <Link
              href='/auth/signin'
              className='btn btn-primary btn-lg'
              style={{
                fontSize: 'var(--text-base)',
                padding: 'var(--space-4) var(--space-8)',
                minWidth: '200px',
              }}
            >
              🚀 지금 시작하기
            </Link>

            <Link
              href='/demo'
              className='btn btn-outline btn-lg'
              style={{
                fontSize: 'var(--text-base)',
                padding: 'var(--space-4) var(--space-8)',
                minWidth: '200px',
              }}
            >
              📱 데모 체험
            </Link>
          </div>

          {/* Enhanced Features Section */}
          <section style={{ marginBottom: 'var(--space-20)' }}>
            <div
              className='divider'
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--color-border), transparent)',
                height: '2px',
                margin: 'var(--space-12) 0',
              }}
            ></div>

            <h2
              className='text-center mb-12'
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                animation: 'var(--animation-slide-up)',
                animationDelay: '400ms',
                animationFillMode: 'both',
              }}
            >
              🌟 주요 기능
            </h2>

            <div
              className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'
              style={{
                animation: 'var(--animation-slide-up)',
                animationDelay: '500ms',
                animationFillMode: 'both',
              }}
            >
              <div className='card card-feature'>
                <div className='feature-icon mb-4'>
                  <span
                    style={{
                      fontSize: '3rem',
                      display: 'block',
                      animation: 'var(--animation-scale-in)',
                      animationDelay: '600ms',
                      animationFillMode: 'both',
                    }}
                  >
                    📊
                  </span>
                </div>
                <h3 className='card-title mb-3'>실시간 추적</h3>
                <p className='text-small text-secondary'>
                  비자 만료일과 체류 기간을 자동으로 계산하여
                  <strong style={{ color: 'var(--color-primary)' }}>
                    {' '}
                    실시간 모니터링
                  </strong>
                </p>
              </div>

              <div className='card card-feature'>
                <div className='feature-icon mb-4'>
                  <span
                    style={{
                      fontSize: '3rem',
                      display: 'block',
                      animation: 'var(--animation-scale-in)',
                      animationDelay: '700ms',
                      animationFillMode: 'both',
                    }}
                  >
                    🇪🇺
                  </span>
                </div>
                <h3 className='card-title mb-3'>규정 준수</h3>
                <p className='text-small text-secondary'>
                  셰겐 90/180일 규칙을 정확하게 계산하여
                  <strong style={{ color: 'var(--color-success)' }}>
                    {' '}
                    완벽한 컴플라이언스
                  </strong>
                </p>
              </div>

              <div className='card card-feature'>
                <div className='feature-icon mb-4'>
                  <span
                    style={{
                      fontSize: '3rem',
                      display: 'block',
                      animation: 'var(--animation-scale-in)',
                      animationDelay: '800ms',
                      animationFillMode: 'both',
                    }}
                  >
                    🤖
                  </span>
                </div>
                <h3 className='card-title mb-3'>스마트 자동화</h3>
                <p className='text-small text-secondary'>
                  Gmail과 Calendar를 통해 여행을 자동 감지하여
                  <strong style={{ color: 'var(--color-accent)' }}>
                    {' '}
                    편리한 기록 관리
                  </strong>
                </p>
              </div>
            </div>

            {/* Premium Stats Section */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(245, 158, 11, 0.05))',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-12) var(--space-8)',
                margin: 'var(--space-16) 0',
                border: '1px solid var(--color-border-subtle)',
                animation: 'var(--animation-slide-up)',
                animationDelay: '900ms',
                animationFillMode: 'both',
              }}
            >
              <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    99.9%
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    정확성
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-accent)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    195+
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    지원 국가
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-success)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    50K+
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    관리된 여행
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-info)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    24/7
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    모니터링
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section style={{ marginBottom: 'var(--space-20)' }}>
            <h2
              className='text-center mb-12'
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                animation: 'var(--animation-slide-up)',
                animationDelay: '1000ms',
                animationFillMode: 'both',
              }}
            >
              💬 사용자 후기
            </h2>

            <div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              style={{
                animation: 'var(--animation-slide-up)',
                animationDelay: '1100ms',
                animationFillMode: 'both',
              }}
            >
              <div
                className='card'
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background:
                      'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  }}
                />
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div
                    style={{
                      fontSize: 'var(--text-lg)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    "DINO 덕분에 복잡한 비자 규정을 걱정하지 않고 자유롭게
                    여행할 수 있게 되었어요!"
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'var(--font-bold)',
                    }}
                  >
                    김
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>
                      김민수
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      디지털 노마드
                    </div>
                  </div>
                </div>
              </div>

              <div
                className='card'
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background:
                      'linear-gradient(90deg, var(--color-accent), var(--color-success))',
                  }}
                />
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div
                    style={{
                      fontSize: 'var(--text-lg)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    "자동화 기능이 정말 놀라워요. Gmail 연동으로 여행 기록이
                    자동으로 업데이트돼요."
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--color-accent), var(--color-success))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'var(--font-bold)',
                    }}
                  >
                    박
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>
                      박지영
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      백패커
                    </div>
                  </div>
                </div>
              </div>

              <div
                className='card'
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background:
                      'linear-gradient(90deg, var(--color-success), var(--color-primary))',
                  }}
                />
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div
                    style={{
                      fontSize: 'var(--text-lg)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    "셰겐 규정 관리가 이렇게 쉬울 줄 몰랐어요. 비자 오버스테이
                    걱정이 사라졌습니다."
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--color-success), var(--color-primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'var(--font-bold)',
                    }}
                  >
                    이
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>
                      이현우
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      프리랜서
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section
            style={{
              background:
                'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(245, 158, 11, 0.1))',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-16) var(--space-8)',
              textAlign: 'center',
              border: '1px solid var(--color-border-subtle)',
              position: 'relative',
              overflow: 'hidden',
              animation: 'var(--animation-slide-up)',
              animationDelay: '1200ms',
              animationFillMode: 'both',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                background:
                  'radial-gradient(circle, rgba(14, 165, 233, 0.1), transparent)',
                borderRadius: '50%',
                filter: 'blur(100px)',
                zIndex: 0,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2
                style={{
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-bold)',
                  marginBottom: 'var(--space-4)',
                  background:
                    'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                지금 바로 시작하세요
              </h2>

              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-8)',
                  maxWidth: '600px',
                  margin: '0 auto var(--space-8) auto',
                }}
              >
                무료로 시작하여 스마트한 여행 관리의 편리함을 경험해보세요
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/auth/signin'
                  className='btn btn-primary btn-lg'
                  style={{
                    fontSize: 'var(--text-lg)',
                    padding: 'var(--space-5) var(--space-10)',
                    minWidth: '220px',
                    background:
                      'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                    boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    ✨ 무료로 시작하기
                  </span>
                </Link>

                <Link
                  href='/features'
                  className='btn btn-outline btn-lg'
                  style={{
                    fontSize: 'var(--text-lg)',
                    padding: 'var(--space-5) var(--space-10)',
                    minWidth: '220px',
                  }}
                >
                  🔍 더 알아보기
                </Link>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-8)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                신용카드 불필요 • 언제든 취소 가능 • 즉시 사용 가능
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
