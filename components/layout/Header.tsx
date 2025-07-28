'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navigation = [
  { name: '대시보드', href: '/dashboard' },
  { name: '여행 기록', href: '/trips' },
  { name: '셰겐 계산기', href: '/schengen' },
  { name: 'Gmail 통합', href: '/gmail' },
  { name: '통계', href: '/analytics' },
]

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSignOut = async () => {
    // Simply redirect to logout page which handles everything
    window.location.href = '/logout'
  }

  const isActive = (href: string) => pathname === href

  // 헤더는 항상 보여주되, 로딩 상태만 체크
  if (status === 'loading') {
    return (
      <header className="nav sticky top-0 z-50 flex items-center justify-center" style={{ height: '64px' }}>
        <div>로딩 중...</div>
      </header>
    )
  }

  return (
    <header className="nav sticky top-0 z-50 flex items-center" style={{ height: '70px' }}>
      <div className="container mx-auto px-5 w-full h-full flex items-center">
        <div className="flex justify-between items-center w-full h-full">
          {/* Logo */}
          <div>
            <Link href={"/dashboard" as any} className="no-underline">
              <h1 className="nav-brand">
                DINO
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={`nav-menu ${isMobile ? 'hidden' : 'flex'}`} style={{ gap: 'var(--space-6)' }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href as any}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <div className={`${isMobile ? 'hidden' : 'flex'} items-center gap-3 p-2 border`} style={{backgroundColor: 'var(--color-surface)'}}>
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full border"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="btn btn-ghost btn-sm"
                >
                  로그아웃
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className={`${isMobile ? 'flex' : 'hidden'} items-center justify-center btn btn-ghost btn-sm`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span style={{ display: 'none' }}>메뉴 열기</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isMobile && (
          <div>
            <div className="p-4 border-t" style={{backgroundColor: 'var(--color-surface)'}}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`block nav-link my-1 ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile user info */}
              {session?.user && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center p-3 border" style={{backgroundColor: 'var(--color-surface)'}}>
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-10 w-10 rounded-full border"
                      />
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium">
                        {session.user.name}
                      </div>
                      <div className="text-sm font-medium text-secondary">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}