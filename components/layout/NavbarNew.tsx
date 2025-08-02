/**
 * DINO v2.0 - Enhanced Navigation Bar
 * Mega menu navigation with all 16 pages accessible
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  icon: string;
  href?: string;
  submenu?: {
    name: string;
    href: string;
    icon: string;
    description?: string;
  }[];
}

export function NavbarNew() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const navigation: NavItem[] = [
    { 
      name: '홈', 
      href: '/', 
      icon: '🏠' 
    },
    {
      name: '비자 서비스',
      icon: '🛂',
      submenu: [
        { 
          name: '비자 체커', 
          href: '/visa', 
          icon: '🔍',
          description: '국가별 비자 요구사항 확인'
        },
        { 
          name: '비자 추적기', 
          href: '/visa-tracker', 
          icon: '⏰',
          description: '비자 만료일 관리 및 알림'
        },
        { 
          name: '비자 도우미', 
          href: '/visa-assistant', 
          icon: '📋',
          description: '비자 신청 단계별 가이드'
        },
        { 
          name: '정책 업데이트', 
          href: '/visa-updates', 
          icon: '🔔',
          description: '실시간 비자 정책 변경 알림'
        },
      ]
    },
    {
      name: '여행 관리',
      icon: '✈️',
      submenu: [
        { 
          name: '대시보드', 
          href: '/dashboard', 
          icon: '📈',
          description: '여행 통계 및 현황 한눈에 보기'
        },
        { 
          name: '샹겐 추적기', 
          href: '/schengen', 
          icon: '🇪🇺',
          description: '샹겐 90/180일 규칙 계산'
        },
        { 
          name: '여행 기록', 
          href: '/trips', 
          icon: '📅',
          description: '지난 여행 기록 관리'
        },
        { 
          name: '여행 분석', 
          href: '/analytics', 
          icon: '📊',
          description: '여행 패턴 및 지출 분석'
        },
        { 
          name: '다국가 추적', 
          href: '/tracker', 
          icon: '🌍',
          description: '여러 국가 체류 기간 추적'
        },
      ]
    },
    { 
      name: '여권 관리', 
      href: '/multi-passport', 
      icon: '📔' 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isSubmenuActive = (submenu: NavItem['submenu']) => {
    if (!submenu) return false;
    return submenu.some(item => isActive(item.href));
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🦕</span>
              <span className="font-bold text-xl text-gray-900">DINO v2.0</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              item.submenu ? (
                <div key={item.name} className="relative">
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                    aria-label={`${item.name} 메뉴 열기`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Mega Menu Dropdown */}
                  <div 
                    className={`absolute left-0 mt-1 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all ${
                      openDropdown === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                      </h3>
                      <div className="space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className={`block p-3 rounded-lg transition-colors ${
                              isActive(subitem.href)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-label={`${subitem.name} - ${subitem.description}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">{subitem.icon}</span>
                              <div>
                                <div className="font-medium">{subitem.name}</div>
                                {subitem.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {subitem.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  aria-label={`${item.name} 페이지로 이동`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              )
            ))}

            {/* Auth Section */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="사용자 프로필 페이지로 이동"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || '사용자'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">
                    {session.user?.name || '프로필'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  aria-label="로그인 페이지로 이동"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              item.submenu ? (
                <div key={item.name}>
                  <div className="px-3 py-2 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.name}
                  </div>
                  <div className="ml-8 space-y-1">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm ${
                          isActive(subitem.href)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        aria-label={`${subitem.name} 페이지로 이동`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{subitem.icon}</span>
                          {subitem.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={`${item.name} 페이지로 이동`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Profile Link for Mobile */}
            {session && (
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="프로필 설정 페이지로 이동"
              >
                <span>👤</span>
                프로필 설정
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}