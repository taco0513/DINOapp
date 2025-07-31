'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface IOSTabBarProps {
  className?: string;
}

export default function IOSTabBar({ className = '' }: IOSTabBarProps) {
  const _pathname = usePathname();

  const tabItems = [
    {
      href: '/dashboard',
      label: '홈',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={active ? 2.5 : 2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
    },
    {
      href: '/trips',
      label: '여행',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={active ? 2.5 : 2}
            d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
          />
        </svg>
      ),
    },
    {
      href: '/schengen',
      label: '셰겐',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={active ? 2.5 : 2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: '프로필',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={active ? 2.5 : 2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}
    >
      {/* iOS-style Tab Bar */}
      <div className='ios-tabbar'>
        {tabItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className='ios-tab-item group'
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className='flex flex-col items-center justify-center'
              >
                <div className='relative mb-1'>
                  {item.icon(active)}
                  {active && (
                    <motion.div
                      layoutId='tabIndicator'
                      className='absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full'
                    />
                  )}
                </div>
                <span
                  className={`text-caption ${active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className='pb-safe bg-white/95 backdrop-blur-md' />
    </div>
  );
}
