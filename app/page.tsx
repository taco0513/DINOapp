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
      <main className='min-h-screen bg-white'>
        {/* Hero Section - Clean & Modern */}
        <section className='relative overflow-hidden'>
          {/* Subtle Background Pattern */}
          <div className='absolute inset-0 -z-10'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-50' />
            <div className='absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-50 to-transparent rounded-full blur-3xl opacity-50' />
          </div>

          <div className='container mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-32'>
            <div className='max-w-4xl mx-auto text-center'>
              {/* Main Title */}
              <h1 className='text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight'>
                DINO
              </h1>

              {/* Subtitle with better typography */}
              <p className='text-xl lg:text-2xl text-gray-600 mb-8 font-light'>
                Digital Nomad Visa Tracker
              </p>

              {/* Value Proposition */}
              <p className='text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed'>
                비자 규정을 자동으로 추적하고 여행 기록을 관리하는 가장 스마트한
                방법
              </p>

              {/* CTA Buttons - Simplified */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/auth/signin'
                  className='inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black hover:bg-gray-900 rounded-lg transition-colors duration-200'
                >
                  시작하기
                </Link>
                <Link
                  href='/demo'
                  className='inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-200'
                >
                  데모 체험
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Grid Layout */}
        <section className='py-20 lg:py-32 bg-gray-50'>
          <div className='container mx-auto px-6'>
            <div className='max-w-3xl mx-auto text-center mb-16'>
              <h2 className='text-3xl lg:text-4xl font-bold text-black mb-4'>
                필요한 모든 기능
              </h2>
              <p className='text-lg text-gray-600'>
                복잡한 비자 관리를 단순하게 만들어드립니다
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
              {/* Feature 1 */}
              <div className='bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg'>
                <div className='w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6 text-xl font-semibold'>
                  01
                </div>
                <h3 className='text-xl font-semibold text-black mb-3'>
                  실시간 추적
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  비자 만료일과 체류 기간을 자동으로 계산하여 실시간으로
                  모니터링합니다
                </p>
              </div>

              {/* Feature 2 */}
              <div className='bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg'>
                <div className='w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6 text-xl font-semibold'>
                  02
                </div>
                <h3 className='text-xl font-semibold text-black mb-3'>
                  규정 준수
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  셰겐 90/180일 규칙을 정확하게 계산하여 완벽한 컴플라이언스를
                  보장합니다
                </p>
              </div>

              {/* Feature 3 */}
              <div className='bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg'>
                <div className='w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6 text-xl font-semibold'>
                  03
                </div>
                <h3 className='text-xl font-semibold text-black mb-3'>
                  자동화
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  Gmail과 Calendar를 통해 여행을 자동 감지하여 편리하게 기록을
                  관리합니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Minimalist */}
        <section className='py-20 lg:py-32'>
          <div className='container mx-auto px-6'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto'>
              <div className='text-center'>
                <div className='text-4xl font-bold text-black mb-2'>99.9%</div>
                <div className='text-sm text-gray-600'>정확성</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-black mb-2'>195+</div>
                <div className='text-sm text-gray-600'>지원 국가</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-black mb-2'>50K+</div>
                <div className='text-sm text-gray-600'>관리된 여행</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-black mb-2'>24/7</div>
                <div className='text-sm text-gray-600'>모니터링</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Clean Cards */}
        <section className='py-20 lg:py-32 bg-gray-50'>
          <div className='container mx-auto px-6'>
            <div className='max-w-3xl mx-auto text-center mb-16'>
              <h2 className='text-3xl lg:text-4xl font-bold text-black mb-4'>
                사용자 후기
              </h2>
              <p className='text-lg text-gray-600'>
                전 세계 디지털 노마드들이 DINO를 신뢰합니다
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
              {/* Testimonial 1 */}
              <div className='bg-white p-8 rounded-2xl'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-5 h-5 text-black'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  "DINO 덕분에 복잡한 비자 규정을 걱정하지 않고 자유롭게 여행할
                  수 있게 되었어요!"
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600'>
                    김
                  </div>
                  <div>
                    <div className='font-medium text-black'>김민수</div>
                    <div className='text-sm text-gray-500'>디지털 노마드</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className='bg-white p-8 rounded-2xl'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-5 h-5 text-black'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  "자동화 기능이 정말 놀라워요. Gmail 연동으로 여행 기록이
                  자동으로 업데이트돼요."
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600'>
                    박
                  </div>
                  <div>
                    <div className='font-medium text-black'>박지영</div>
                    <div className='text-sm text-gray-500'>백패커</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className='bg-white p-8 rounded-2xl'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-5 h-5 text-black'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  "셰겐 규정 관리가 이렇게 쉬울 줄 몰랐어요. 비자 오버스테이
                  걱정이 사라졌습니다."
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600'>
                    이
                  </div>
                  <div>
                    <div className='font-medium text-black'>이현우</div>
                    <div className='text-sm text-gray-500'>프리랜서</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Simple & Clean */}
        <section className='py-20 lg:py-32'>
          <div className='container mx-auto px-6'>
            <div className='max-w-3xl mx-auto text-center'>
              <h2 className='text-3xl lg:text-4xl font-bold text-black mb-4'>
                지금 시작하세요
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                무료로 시작하고 언제든지 업그레이드할 수 있습니다
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/auth/signin'
                  className='inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black hover:bg-gray-900 rounded-lg transition-colors duration-200'
                >
                  무료로 시작하기
                </Link>
                <Link
                  href='/features'
                  className='inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-200'
                >
                  더 알아보기
                </Link>
              </div>
              <p className='text-sm text-gray-500 mt-8'>
                신용카드 불필요 • 언제든 취소 가능 • 즉시 사용 가능
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
