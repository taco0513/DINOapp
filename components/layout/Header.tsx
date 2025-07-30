'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// 우선순위 기반 네비게이션 구조
const primaryNavigation = [
  { name: '대시보드', href: '/dashboard', icon: '🏠', priority: 1 },
  { name: '여행 기록', href: '/trips', icon: '✈️', priority: 1 },
  { name: '셰겐 계산기', href: '/schengen', icon: '🇪🇺', priority: 1 },
];

const secondaryNavigation = [
  { name: 'Gmail 분석', href: '/gmail', icon: '📧', priority: 2 },
  { name: '캘린더', href: '/calendar', icon: '📅', priority: 2 },
  { name: '통계', href: '/analytics', icon: '📊', priority: 2 },
];

// 반응형 네비게이션: 모바일에서는 primary만, 데스크톱에서는 모두
const navigation = [...primaryNavigation, ...secondaryNavigation];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 클릭 외부 감지 (드롭다운 닫기)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    // Simply redirect to logout page which handles everything
    window.location.href = '/logout';
  };

  const isActive = (href: string) => pathname === href;

  // 헤더는 항상 보여주되, 로딩 상태만 체크
  if (status === 'loading') {
    return (
      <header
        className='nav sticky top-0 z-50 flex items-center justify-center'
        style={{ height: '64px' }}
      >
        <div>로딩 중...</div>
      </header>
    );
  }

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm'>
      <div className='container mx-auto px-4 h-16 flex items-center'>
        <div className='flex justify-between items-center w-full'>
          {/* Logo */}
          <div>
            <Link
              href={'/dashboard' as any}
              className='flex items-center space-x-2 no-underline'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>🦕</span>
              </div>
              <h1 className='text-xl font-bold text-gray-900'>DINO</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-6`}
          >
            {/* Primary Navigation */}
            {primaryNavigation.map(item => (
              <Link
                key={item.name}
                href={item.href as any}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className='mr-2'>{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* Divider */}
            <div className='w-px h-6 bg-gray-300' />

            {/* Secondary Navigation */}
            {secondaryNavigation.map(item => (
              <Link
                key={item.name}
                href={item.href as any}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className='mr-2'>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className='flex items-center gap-4'>
            {session?.user && (
              <div
                className={`${isMobile ? 'hidden' : 'relative'} user-menu-container`}
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className='h-8 w-8 rounded-full border'
                    />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-600'>
                        {session.user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className='text-sm font-medium'>
                    {session.user.name}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {userMenuOpen && (
                  <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-4 border-b border-gray-200'>
                      <div className='flex items-center gap-3'>
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className='h-12 w-12 rounded-full border'
                          />
                        ) : (
                          <div className='h-12 w-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center'>
                            <span className='text-lg font-medium text-gray-600'>
                              {session.user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium truncate'>
                            {session.user.name}
                          </div>
                          <div className='text-sm text-gray-500 truncate'>
                            {session.user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='py-2'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                          />
                        </svg>
                        프로필 관리
                      </Link>

                      <Link
                        href='/settings'
                        className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                        설정
                      </Link>

                      <div className='border-t border-gray-200 my-2'></div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600'
                      >
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                          />
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type='button'
              className={`${isMobile ? 'flex' : 'hidden'} items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span style={{ display: 'none' }}>메뉴 열기</span>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d={
                    mobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isMobile && (
          <div className='md:hidden'>
            <div className='px-4 py-4 bg-white border-t border-gray-200'>
              {/* 모바일 메뉴 - Primary 먼저, 구분선, Secondary */}
              <div className='space-y-1'>
                <div className='text-xs font-medium text-gray-500 px-3 py-1'>
                  주요 기능
                </div>
                {primaryNavigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='text-lg'>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className='border-t border-gray-200 my-3'></div>

              <div className='space-y-1'>
                <div className='text-xs font-medium text-gray-500 px-3 py-1'>
                  추가 기능
                </div>
                {secondaryNavigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='text-lg'>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile user info */}
              {session?.user && (
                <div className='border-t border-gray-200 pt-4 mt-4'>
                  <div className='flex items-center p-3 mb-4 bg-gray-50 rounded-lg border border-gray-200'>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className='h-10 w-10 rounded-full border'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-600'>
                          {session.user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className='ml-3'>
                      <div className='text-base font-medium'>
                        {session.user.name}
                      </div>
                      <div className='text-sm font-medium text-gray-600'>
                        {session.user.email}
                      </div>
                    </div>
                  </div>

                  {/* 모바일 사용자 메뉴 */}
                  <div className='space-y-1'>
                    <Link
                      href='/profile'
                      className='flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                      프로필 관리
                    </Link>

                    <Link
                      href='/settings'
                      className='flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                      설정
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className='w-full flex items-center gap-3 p-3 rounded-md hover:bg-red-50 transition-colors text-red-600'
                    >
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                        />
                      </svg>
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
