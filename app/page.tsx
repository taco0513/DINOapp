'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (session) {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading">로딩 중...</div>
      </main>
    )
  }

  if (session) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="loading mb-4">대시보드로 이동 중...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="mb-2">DINO</h1>
          <p className="text-secondary mb-4">Digital Nomad Visa Tracker</p>
          <p className="text-small text-tertiary" style={{ maxWidth: '500px', margin: '0 auto' }}>
            복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 플랫폼
          </p>
        </header>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Link href="/auth/signin" className="btn btn-primary">
            로그인하여 시작하기
          </Link>
          
          <Link href="/demo" className="btn">
            데모 보기
          </Link>
        </div>

        {/* Features */}
        <section>
          <div className="divider"></div>
          
          <h2 className="text-center mb-8">주요 기능</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="card-title">실시간 추적</h3>
              <p className="text-small text-secondary">
                비자 만료일과 체류 기간을 자동으로 계산
              </p>
            </div>
            
            <div className="card">
              <h3 className="card-title">규정 준수</h3>
              <p className="text-small text-secondary">
                셰겐 90/180일 규칙을 정확하게 계산
              </p>
            </div>
            
            <div className="card">
              <h3 className="card-title">자동 기록</h3>
              <p className="text-small text-secondary">
                Gmail과 Calendar를 통해 여행을 자동 감지
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}