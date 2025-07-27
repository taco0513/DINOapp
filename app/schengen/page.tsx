'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

export default function SchengenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [hasTrips, setHasTrips] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<CountryVisit[]>([])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin' as any)
      return
    }

    checkTripsExistence()
  }, [session, status, router])

  const checkTripsExistence = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getTrips()
      if (response.success && response.data) {
        setTrips(response.data)
        setHasTrips(response.data.length > 0)
      } else {
        setHasTrips(false)
      }
    } catch (error) {
      // Error checking trips
      setHasTrips(false)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Navigation */}
        <nav style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', textDecoration: 'none' }}>
              DINO
            </Link>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>대시보드</Link>
              <Link href="/trips" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>여행기록</Link>
              <span style={{ color: '#000', fontSize: '14px', fontWeight: '500' }}>셰겐계산기</span>
              <Link href="/calendar" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>캘린더</Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
            셰겐 계산기
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            90/180일 규칙을 확인하고 규정 준수를 추적하세요
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>데이터를 불러오는 중...</div>
          </div>
        ) : hasTrips ? (
          <div style={{ display: 'grid', gap: '40px' }}>
            {/* Schengen Status Card */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                현재 셰겐 상태
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ border: '1px solid #e0e0e0', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>45 / 90</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>사용된 일수</div>
                </div>
                <div style={{ border: '1px solid #e0e0e0', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>45</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>남은 일수</div>
                </div>
                <div style={{ border: '1px solid #e0e0e0', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>2024-06-15</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>다음 재설정</div>
                </div>
              </div>
            </div>

            {/* Usage Chart */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                180일 사용 현황
              </h3>
              <div style={{ 
                height: '200px', 
                border: '1px solid #e0e0e0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px'
              }}>
                [차트 영역 - 180일간 셰겐 사용 현황]
              </div>
            </div>

            {/* Future Trip Planner */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                미래 여행 계획
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
                  계획된 여행 날짜
                </label>
                <input 
                  type="date" 
                  style={{ 
                    width: '200px', 
                    padding: '10px', 
                    border: '1px solid #e0e0e0', 
                    fontSize: '14px' 
                  }} 
                />
              </div>
              <div style={{ 
                border: '1px solid #e0e0e0', 
                padding: '20px', 
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                color: '#666'
              }}>
                여행 날짜를 선택하면 셰겐 규칙 준수 여부를 확인할 수 있습니다
              </div>
            </div>
          </div>
        ) : (
          <div style={{ border: '1px solid #e0e0e0', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🇪🇺</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
              셰겐 계산기
            </h3>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
              여행 기록을 추가하면 자동으로 셰겐 지역 체류 일수가 계산됩니다
            </p>
            <Link 
              href="/trips"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#000',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '40px'
              }}
            >
              여행 기록 추가하기
            </Link>
            
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '40px', marginTop: '40px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                📚 셰겐 90/180일 규칙
              </h4>
              <div style={{ 
                textAlign: 'left', 
                maxWidth: '600px', 
                margin: '0 auto', 
                fontSize: '14px', 
                lineHeight: '1.6',
                color: '#666'
              }}>
                <p style={{ marginBottom: '10px' }}>• 셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다</p>
                <p style={{ marginBottom: '10px' }}>• 이 규칙은 롤링 방식으로 적용됩니다 (고정된 기간이 아님)</p>
                <p style={{ marginBottom: '10px' }}>• 매일 지난 180일간의 체류 일수를 계산합니다</p>
                <p style={{ marginBottom: '10px' }}>• 비자 없이 입국하는 관광객에게 적용됩니다</p>
                <p>• 장기 체류 비자나 거주권이 있으면 규칙이 다를 수 있습니다</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}