'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (session) {
      // If user is logged in, redirect to dashboard
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" className="mx-auto" />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>로딩 중...</p>
        </div>
      </main>
    )
  }

  // If user is logged in, show loading while redirecting
  if (session) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" className="mx-auto" />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>대시보드로 이동 중...</p>
          <button
            onClick={async () => {
              try {
                await signOut({ 
                  callbackUrl: `${window.location.origin}/`,
                  redirect: true 
                })
              } catch (error) {
                console.error('Logout error:', error)
                // Fallback: clear session and redirect manually
                window.location.href = '/'
              }
            }}
            style={{
              marginTop: '2rem',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            로그아웃
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          DINO
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
          Digital Nomad
        </p>
        <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: '1.6', marginBottom: '2rem' }}>
          복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 
          스마트 여행 관리 플랫폼입니다.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/auth/signin"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            로그인하여 시작하기
          </Link>
          
          <Link 
            href="/demo"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              border: '2px solid #3b82f6',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#3b82f6'
            }}
          >
            데모 보기
          </Link>
        </div>
      </div>
    </main>
  )
}