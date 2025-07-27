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
    try {
      await signOut({ 
        callbackUrl: `${window.location.origin}/`,
        redirect: true 
      })
    } catch (error) {
      // Logout error occurred
      // Fallback: clear session and redirect manually
      window.location.href = '/'
    }
  }

  const isActive = (href: string) => pathname === href

  // 헤더는 항상 보여주되, 로딩 상태만 체크
  if (status === 'loading') {
    return (
      <header style={{
        backgroundColor: 'white',
        border: '2px solid #333',
        borderBottom: '3px solid #333',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>로딩 중...</div>
      </header>
    )
  }

  return (
    <header style={{
      backgroundColor: 'white',
      border: '2px solid #333',
      borderBottom: '3px solid #333',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '70px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          {/* Logo */}
          <div>
            <Link href={"/dashboard" as any} style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
                color: '#333',
                border: '2px solid #333',
                padding: '8px 12px',
                backgroundColor: 'white'
              }}>
                DINO
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav style={{
            display: isMobile ? 'none' : 'flex',
            gap: '10px'
          }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href as any}
                style={{
                  padding: '8px 16px',
                  border: isActive(item.href) ? '2px solid #333' : '1px solid #666',
                  backgroundColor: isActive(item.href) ? '#f0f0f0' : 'white',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'medium'
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {session?.user && (
              <>
                <div style={{
                  display: isMobile ? 'none' : 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #666',
                  padding: '6px 12px',
                  backgroundColor: '#f9f9f9'
                }}>
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      style={{
                        height: '32px',
                        width: '32px',
                        borderRadius: '50%',
                        border: '1px solid #666'
                      }}
                    />
                  )}
                  <span style={{ color: '#333', fontSize: '14px', fontWeight: 'medium' }}>
                    {session.user.name}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #333',
                    color: '#333',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'medium',
                    cursor: 'pointer'
                  }}
                >
                  로그아웃
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              style={{
                display: isMobile ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                border: '2px solid #333',
                backgroundColor: 'white',
                color: '#333',
                cursor: 'pointer'
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span style={{ display: 'none' }}>메뉴 열기</span>
              <svg
                style={{ height: '24px', width: '24px' }}
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
            <div style={{
              padding: '16px 8px',
              borderTop: '2px solid #333',
              backgroundColor: '#f9f9f9'
            }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    margin: '4px 0',
                    border: isActive(item.href) ? '2px solid #333' : '1px solid #666',
                    backgroundColor: isActive(item.href) ? 'white' : '#f9f9f9',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'medium'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile user info */}
              {session?.user && (
                <div style={{
                  borderTop: '1px solid #666',
                  paddingTop: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #666',
                    backgroundColor: 'white'
                  }}>
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        style={{
                          height: '40px',
                          width: '40px',
                          borderRadius: '50%',
                          border: '1px solid #666'
                        }}
                      />
                    )}
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'medium',
                        color: '#333'
                      }}>
                        {session.user.name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: '#666'
                      }}>
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