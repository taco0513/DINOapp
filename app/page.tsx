import Link from 'next/link';
import dynamic from 'next/dynamic';
import { StandardCard } from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';

// 하이드레이션 안전한 세션 체크 컴포넌트
const SessionCheck = dynamic(() => import('@/components/auth/SessionCheck'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <>
      <SessionCheck />
      <main className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <section className='relative overflow-hidden'>
          <div className='container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24'>
            <div className='max-w-4xl mx-auto text-center'>
              {/* Large title */}
              <h1 className='text-6xl md:text-7xl font-bold mb-4 text-gray-900'>DINO</h1>

              {/* Subtitle */}
              <p className='text-xl md:text-2xl text-gray-600 mb-6 font-medium'>
                Digital Nomad Visa Tracker
              </p>

              {/* Description */}
              <p className='text-lg text-gray-600 mb-10 max-w-2xl mx-auto'>
                비자 규정을 자동으로 추적하고 여행 기록을 관리하는 가장 스마트한
                방법
              </p>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size="lg" asChild>
                  <Link href='/auth/signin'>
                    시작하기
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href='/simple'>
                    데모 체험
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='py-16 md:py-24 bg-white'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                필요한 모든 기능
              </h2>
              <p className='text-lg text-gray-600'>
                복잡한 비자 관리를 단순하게 만들어드립니다
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              {/* Feature Cards */}
              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  실시간 추적
                </h3>
                <p className='text-gray-600'>
                  비자 만료일과 체류 기간을 자동으로 계산하여 실시간으로
                  모니터링합니다
                </p>
              </StandardCard>

              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  규정 준수
                </h3>
                <p className='text-gray-600'>
                  셰겐 90/180일 규칙을 정확하게 계산하여 완벽한 컴플라이언스를
                  보장합니다
                </p>
              </StandardCard>

              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  자동화
                </h3>
                <p className='text-gray-600'>
                  Gmail과 Calendar를 통해 여행을 자동 감지하여 편리하게 기록을
                  관리합니다
                </p>
              </StandardCard>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='py-16 md:py-20 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto'>
              <div className='text-center p-4'>
                <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-1'>
                  99.9%
                </div>
                <div className='text-sm text-gray-600'>정확성</div>
              </div>
              <div className='text-center p-4'>
                <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-1'>
                  195+
                </div>
                <div className='text-sm text-gray-600'>지원 국가</div>
              </div>
              <div className='text-center p-4'>
                <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-1'>
                  50K+
                </div>
                <div className='text-sm text-gray-600'>관리된 여행</div>
              </div>
              <div className='text-center p-4'>
                <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-1'>
                  24/7
                </div>
                <div className='text-sm text-gray-600'>모니터링</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className='py-16 md:py-24 bg-white'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                사용자 후기
              </h2>
              <p className='text-lg text-gray-600'>
                전 세계 디지털 노마드들이 DINO를 신뢰합니다
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              {/* Testimonial Cards */}
              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 text-yellow-500'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6'>
                  "DINO 덕분에 복잡한 비자 규정을 걱정하지 않고 자유롭게 여행할
                  수 있게 되었어요!"
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700'>
                    김
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      김민수
                    </div>
                    <div className='text-xs text-gray-600'>
                      디지털 노마드
                    </div>
                  </div>
                </div>
              </StandardCard>

              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 text-yellow-500'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6'>
                  "자동화 기능이 정말 놀라워요. Gmail 연동으로 여행 기록이
                  자동으로 업데이트돼요."
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center font-semibold text-green-700'>
                    박
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      박지영
                    </div>
                    <div className='text-xs text-gray-600'>백패커</div>
                  </div>
                </div>
              </StandardCard>

              <StandardCard className='hover:shadow-lg transition-shadow duration-200'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 text-yellow-500'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6'>
                  "셰겐 규정 관리가 이렇게 쉬울 줄 몰랐어요. 비자 오버스테이
                  걱정이 사라졌습니다."
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center font-semibold text-purple-700'>
                    이
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      이현우
                    </div>
                    <div className='text-xs text-gray-600'>프리랜서</div>
                  </div>
                </div>
              </StandardCard>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-16 md:py-20 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                지금 시작하세요
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                무료로 시작하고 언제든지 업그레이드할 수 있습니다
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center mb-6'>
                <Button size="lg" asChild>
                  <Link href='/auth/signin'>
                    무료로 시작하기
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href='/features'>
                    더 알아보기
                  </Link>
                </Button>
              </div>
              <p className='text-sm text-gray-500'>
                신용카드 불필요 • 언제든 취소 가능 • 즉시 사용 가능
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
