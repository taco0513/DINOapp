import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* 브랜드 섹션 */}
          <div className='md:col-span-1'>
            <div className='flex items-center mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3'>
                <span className='text-white font-bold text-lg'>🦕</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>DINO</h3>
            </div>
            <p className='text-gray-600 text-sm leading-relaxed'>
              디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼
            </p>
          </div>

          {/* 핵심 서비스 링크 */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-4'>✈️ 핵심 기능</h4>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='/dashboard'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>🏠</span> 대시보드
                </Link>
              </li>
              <li>
                <Link
                  href='/trips'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>✈️</span> 여행 기록
                </Link>
              </li>
              <li>
                <Link
                  href='/schengen'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>🇪🇺</span> 셰겐 계산기
                </Link>
              </li>
              <li>
                <Link
                  href='/gmail'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>📧</span> Gmail 분석
                </Link>
              </li>
            </ul>
          </div>

          {/* 추가 기능 */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-4'>⚡ 추가 기능</h4>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='/calendar'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>📅</span> 캘린더
                </Link>
              </li>
              <li>
                <Link
                  href='/analytics'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>📊</span> 통계
                </Link>
              </li>
              <li>
                <Link
                  href='/notifications'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>🔔</span> 알림
                </Link>
              </li>
              <li>
                <Link
                  href='/visa'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>📋</span> 비자 정보
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 & 법적 */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-4'>🛟 지원 & 정보</h4>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='/profile'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>👤</span> 프로필
                </Link>
              </li>
              <li>
                <Link
                  href='/settings'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>⚙️</span> 설정
                </Link>
              </li>
              <li>
                <Link
                  href='/legal/terms'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>📄</span> 이용약관
                </Link>
              </li>
              <li>
                <Link
                  href='/legal/privacy'
                  className='text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center min-h-[44px] py-2'
                >
                  <span className='mr-2'>🔒</span> 개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className='border-t border-gray-200 mt-12 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-500 text-sm'>
              © {currentYear} DINO. All rights reserved. Made with ❤️ for
              digital nomads.
            </p>
            <div className='flex items-center space-x-6 mt-4 md:mt-0'>
              <div className='flex items-center text-sm text-gray-500'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></span>
                서비스 운영 중
              </div>
              <div className='text-xs text-gray-400'>v1.0.0</div>
            </div>
          </div>
        </div>

        {/* 법적 고지 */}
        <div className='mt-6 pt-4 border-t border-border/50'>
          <p className='text-xs text-tertiary leading-relaxed'>
            <strong>법적 고지:</strong> DINO에서 제공하는 비자 및 출입국 정보는
            참고용입니다. 실제 출입국 시에는 해당 국가의 공식 기관에서 최신
            정보를 확인하시기 바랍니다. 셰겐 계산 결과의 정확성에 대한 법적
            책임을 지지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
