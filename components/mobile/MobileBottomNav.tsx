'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: '홈',
    icon: '🏠',
    href: '/dashboard'
  },
  {
    id: 'trips',
    label: '여행기록',
    icon: '✈️',
    href: '/trips'
  },
  {
    id: 'schengen',
    label: '셰겐',
    icon: '🇪🇺',
    href: '/schengen'
  },
  {
    id: 'calendar',
    label: '캘린더',
    icon: '📅',
    href: '/calendar'
  }
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  // 모바일이 아닌 경우 렌더링하지 않음
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '60px'
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              textDecoration: 'none',
              color: isActive ? '#000' : '#666',
              fontSize: '12px',
              fontWeight: isActive ? '600' : '400',
              transition: 'color 0.2s ease, transform 0.1s ease',
              minWidth: '60px',
              position: 'relative'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <div
              style={{
                fontSize: '20px',
                marginBottom: '2px',
                transition: 'transform 0.2s ease',
                transform: isActive ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {item.icon}
            </div>
            
            <span style={{ fontSize: '10px' }}>
              {item.label}
            </span>

            {/* 배지 */}
            {item.badge && item.badge > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '8px',
                  backgroundColor: '#ff3b30',
                  color: '#fff',
                  borderRadius: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600'
                }}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}

            {/* 활성 상태 인디케이터 */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#000',
                  borderRadius: '2px'
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}