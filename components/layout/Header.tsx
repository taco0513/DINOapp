'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// 네비게이션 단순화: 6개 핵심 메뉴 + More 드롭다운
const coreNavigation = [
  { name: '대시보드', href: '/dashboard', icon: '🏠', priority: 1 },
  { name: '여행 기록', href: '/trips', icon: '✈️', priority: 1 },
  { name: '셰겐 계산기', href: '/schengen', icon: '🇪🇺', priority: 1 },
  { name: 'Gmail 분석', href: '/gmail', icon: '📧', priority: 1 },
];

const moreNavigation = [
  { name: '캘린더', href: '/calendar', icon: '📅', priority: 2 },
  { name: '통계', href: '/analytics', icon: '📊', priority: 2 },
  { name: '알림', href: '/notifications', icon: '🔔', priority: 2 },
  { name: '비자 정보', href: '/visa', icon: '📋', priority: 2 },
];

// 전체 네비게이션 (모바일 메뉴용)
const allNavigation = [...coreNavigation, ...moreNavigation];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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
      if (!target.closest('.more-menu-container')) {
        setMoreMenuOpen(false);
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
    <header className='bg-card border-b border-border sticky top-0 z-50 shadow-sm'>
      <div className='container mx-auto px-4 h-16 flex items-center'>
        <div className='flex justify-between items-center w-full'>
          {/* Logo */}
          <div>
            <Link
              href={'/dashboard' as any}
              className='flex items-center space-x-2 no-underline'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>🦕</span>
              </div>
              <h1 className='text-xl font-bold text-foreground'>DINO</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-4`}
          >
            {/* Core Navigation */}
            {coreNavigation.map(item => (
              <Link
                key={item.name}
                href={item.href as any}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
              >
                <span className='mr-2'>{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* More Menu */}
            <div className='relative more-menu-container'>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center min-h-[44px] ${
                  moreNavigation.some(item => isActive(item.href))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                aria-label='추가 메뉴'
                aria-expanded={moreMenuOpen}
                aria-haspopup='true'
              >
                <span className='mr-2'>⚡</span>
                More
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`}
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

              {/* More Dropdown */}
              {moreMenuOpen && (
                <div
                  className='absolute left-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50'
                  role='menu'
                  aria-labelledby='more-menu-button'
                >
                  <div className='py-2'>
                    {moreNavigation.map(item => (
                      <Link
                        key={item.name}
                        href={item.href as any}
                        className={`flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors min-h-[44px] ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                        onClick={() => setMoreMenuOpen(false)}
                        role='menuitem'
                      >
                        <span className='text-base'>{item.icon}</span>
                        <span className='text-sm font-medium'>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className='flex items-center gap-4'>
            {session?.user && (
              <div
                className={`${isMobile ? 'hidden' : 'relative'} user-menu-container`}
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]'
                  aria-label='사용자 메뉴'
                  aria-expanded={userMenuOpen}
                  aria-haspopup='true'
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className='h-8 w-8 rounded-full border'
                    />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center'>
                      <span className='text-sm font-medium text-muted-foreground'>
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
                  <div
                    className='absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border border-border z-50'
                    role='menu'
                    aria-labelledby='user-menu-button'
                  >
                    <div className='p-4 border-b border-border'>
                      <div className='flex items-center gap-3'>
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className='h-12 w-12 rounded-full border'
                          />
                        ) : (
                          <div className='h-12 w-12 rounded-full bg-muted border border-border flex items-center justify-center'>
                            <span className='text-lg font-medium text-muted-foreground'>
                              {session.user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium truncate'>
                            {session.user.name}
                          </div>
                          <div className='text-sm text-muted-foreground truncate'>
                            {session.user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='py-2'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors min-h-[44px]'
                        onClick={() => setUserMenuOpen(false)}
                        role='menuitem'
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
                        className='flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors min-h-[44px]'
                        onClick={() => setUserMenuOpen(false)}
                        role='menuitem'
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

                      <div className='border-t border-border my-2'></div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className='w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive min-h-[44px]'
                        role='menuitem'
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

            {/* Mobile menu button - 44px 터치 타겟 보장 */}
            <button
              type='button'
              className={`${isMobile ? 'flex' : 'hidden'} items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-action-manipulation`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'
              }
              aria-expanded={mobileMenuOpen}
              aria-controls='mobile-navigation'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                aria-hidden='true'
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
          <div
            className='md:hidden'
            id='mobile-navigation'
            role='navigation'
            aria-label='모바일 네비게이션'
          >
            <div className='px-4 py-4 bg-card border-t border-border'>
              {/* 모바일 메뉴 - Core 먼저, 구분선, More */}
              <div className='space-y-1'>
                <div className='text-xs font-medium text-muted-foreground px-3 py-1'>
                  핵심 기능
                </div>
                {coreNavigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='text-lg'>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className='border-t border-border my-3'></div>

              <div className='space-y-1'>
                <div className='text-xs font-medium text-muted-foreground px-3 py-1'>
                  추가 기능
                </div>
                {moreNavigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
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
                <div className='border-t border-border pt-4 mt-4'>
                  <div className='flex items-center p-3 mb-4 bg-muted rounded-lg border border-border'>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className='h-10 w-10 rounded-full border'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center'>
                        <span className='text-sm font-medium text-muted-foreground'>
                          {session.user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className='ml-3'>
                      <div className='text-base font-medium'>
                        {session.user.name}
                      </div>
                      <div className='text-sm font-medium text-muted-foreground'>
                        {session.user.email}
                      </div>
                    </div>
                  </div>

                  {/* 모바일 사용자 메뉴 */}
                  <div className='space-y-1'>
                    <Link
                      href='/profile'
                      className='flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors'
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
                      className='flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors'
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
                      className='w-full flex items-center gap-3 p-3 rounded-md hover:bg-destructive/10 transition-colors text-destructive'
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
