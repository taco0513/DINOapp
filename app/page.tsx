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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  // If user is logged in, show loading while redirecting
  if (session) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>대시보드로 이동 중...</div>
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
              padding: '8px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
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
    <main style={{ 
      minHeight: '100vh', 
      padding: '40px 20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: '#000'
          }}>
            DINO
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#666',
            marginBottom: '20px'
          }}>
            Digital Nomad Visa Tracker
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#888',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 플랫폼
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          marginBottom: '80px'
        }}>
          <Link 
            href="/auth/signin"
            style={{
              padding: '12px 30px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              border: '2px solid #000',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            로그인하여 시작하기
          </Link>
          
          <Link 
            href="/demo"
            style={{
              padding: '12px 30px',
              backgroundColor: '#fff',
              color: '#000',
              textDecoration: 'none',
              border: '2px solid #000',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            데모 보기
          </Link>
        </div>

        {/* Features */}
        <div style={{ 
          borderTop: '1px solid #e0e0e0',
          paddingTop: '60px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            marginBottom: '40px',
            textAlign: 'center',
            color: '#000'
          }}>
            주요 기능
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px'
          }}>
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
                실시간 추적
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                비자 만료일과 체류 기간을 자동으로 계산
              </p>
            </div>
            
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
                규정 준수
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                셰겐 90/180일 규칙을 정확하게 계산
              </p>
            </div>
            
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
                자동 기록
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Gmail과 Calendar를 통해 여행을 자동 감지
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}