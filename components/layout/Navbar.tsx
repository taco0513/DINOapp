/**
 * DINO v2.0 - Navigation Bar
 * Main navigation component with responsive design
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
// import { ClientRedirect } from '@/components/ClientRedirect';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navigation = [
    { 
      name: '홈', 
      href: '/', 
      icon: '🏠' 
    },
    { 
      name: '비자 서비스', 
      icon: '🛂',
      submenu: [
        { name: '비자 체커', href: '/visa', icon: '🔍' },
        { name: '비자 추적기', href: '/visa-tracker', icon: '⏰' },
        { name: '비자 도우미', href: '/visa-assistant', icon: '📋' },
        { name: '정책 업데이트', href: '/visa-updates', icon: '🔔' },
      ]
    },
    { 
      name: '여행 관리', 
      icon: '✈️',
      submenu: [
        { name: '샹겐 추적기', href: '/schengen', icon: '🇪🇺' },
        { name: '여행 기록', href: '/trips', icon: '📅' },
        { name: '여행 분석', href: '/analytics', icon: '📊' },
        { name: '다국가 추적', href: '/tracker', icon: '🌍' },
      ]
    },
    { 
      name: '여권 관리', 
      href: '/multi-passport', 
      icon: '📔' 
    },
    { 
      name: '대시보드', 
      href: '/dashboard', 
      icon: '📈' 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🦕</span>
              <span className="text-xl font-bold text-gray-900">DINO</span>
              <span className="text-sm text-gray-500 font-medium">v2.0</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                title="프로필 설정"
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
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
              aria-label="메뉴 열기"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            {/* Profile Link for Mobile */}
            {session && (
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
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