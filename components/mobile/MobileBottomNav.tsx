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

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        border: '3px solid #333',
        borderBottom: 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '64px'
      }}
      className="md:hidden"
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
              padding: '8px 12px',
              textDecoration: 'none',
              color: '#333',
              fontSize: '12px',
              fontWeight: 'medium',
              minWidth: '60px',
              position: 'relative',
              border: isActive ? '2px solid #333' : '1px solid #666',
              backgroundColor: isActive ? '#f0f0f0' : 'white',
              margin: '4px 2px'
            }}
          >
            <div
              style={{
                fontSize: '18px',
                marginBottom: '2px'
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
                  backgroundColor: 'white',
                  color: '#333',
                  border: '1px solid #333',
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
          </Link>
        )
      })}
    </nav>
  )
}