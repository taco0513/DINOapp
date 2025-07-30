'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface IOSNavigationProps {
  className?: string;
}

export default function IOSNavigation({ className = '' }: IOSNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/trips', label: '여행', icon: '✈️' },
    { href: '/schengen', label: '셰겐', icon: '🇪🇺' },
    { href: '/dashboard', label: '대시보드', icon: '📊' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* iOS-style Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-200/50 ${className}`}
        style={{ backgroundColor: 'rgba(248, 249, 250, 0.85)' }}
      >
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link href='/' className='flex items-center'>
              <span className='text-title-2 font-bold text-primary'>DINO</span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-1'>
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-body font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-secondary hover:bg-gray-100 hover:text-primary'
                  }`}
                >
                  <span className='mr-2'>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden ios-button-icon'
              aria-label='메뉴 열기'
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d={
                      isMenuOpen
                        ? 'M6 18L18 6M6 6l12 12'
                        : 'M4 6h16M4 12h16M4 18h16'
                    }
                  />
                </svg>
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg'
            >
              <div className='container mx-auto px-4 py-4'>
                <div className='space-y-2'>
                  {navigationItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-body font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-secondary hover:bg-gray-100 hover:text-primary'
                      }`}
                    >
                      <span className='text-lg mr-3'>{item.icon}</span>
                      {item.label}
                      {isActive(item.href) && (
                        <motion.div
                          layoutId='activeIndicator'
                          className='ml-auto w-2 h-2 bg-blue-600 rounded-full'
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacing for fixed navigation */}
      <div className='h-16' />
    </>
  );
}
