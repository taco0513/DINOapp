'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

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
    id: 'visa-check',
    label: '비자체크',
    icon: '🌏',
    href: '/visa-check'
  },
  {
    id: 'schengen',
    label: '셰겐',
    icon: '🇪🇺',
    href: '/schengen'
  }
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) {
    return null
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border-strong)',
        borderBottom: 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '64px'
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
              padding: 'var(--space-2) var(--space-3)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              minWidth: '60px',
              position: 'relative',
              border: isActive ? '1px solid var(--color-border-strong)' : '1px solid var(--color-border)',
              backgroundColor: isActive ? 'var(--color-surface)' : 'var(--color-background)',
              margin: 'var(--space-1)'
            }}
          >
            <div
              style={{
                fontSize: '18px',
                marginBottom: 'var(--space-1)'
              }}
            >
              {item.icon}
            </div>
            
            <span style={{ fontSize: 'var(--text-xs)' }}>
              {item.label}
            </span>

            {/* 배지 */}
            {item.badge && item.badge > 0 && (
              <div
                className="badge"
                style={{
                  position: 'absolute',
                  top: 'var(--space-1)',
                  right: 'var(--space-2)',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)'
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