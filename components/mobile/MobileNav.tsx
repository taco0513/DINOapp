'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plane, Calculator, Calendar, User } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: <Home className='w-5 h-5' />,
      label: '홈',
    },
    {
      href: '/trips',
      icon: <Plane className='w-5 h-5' />,
      label: '여행',
    },
    {
      href: '/schengen',
      icon: <Calculator className='w-5 h-5' />,
      label: '셰겐',
    },
    {
      href: '/calendar',
      icon: <Calendar className='w-5 h-5' />,
      label: '캘린더',
    },
    {
      href: '/profile',
      icon: <User className='w-5 h-5' />,
      label: '프로필',
    },
  ];

  return (
    <nav
      className='mobile-nav md:hidden'
      role='navigation'
      aria-label='모바일 네비게이션'
    >
      {navItems.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'text-primary' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className='mobile-nav-icon' aria-hidden='true'>
              {item.icon}
            </span>
            <span className='text-xs'>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
