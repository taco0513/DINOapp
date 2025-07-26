'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [schengenData, setSchengenData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadDashboardData()
  }, [session, status, router])

  const loadDashboardData = async () => {
    setDataLoading(true)
    try {
      const [statsResponse, schengenResponse] = await Promise.all([
        ApiClient.getStats(),
        ApiClient.getSchengenStatus()
      ])

      if (statsResponse.success && statsResponse.data) {
        setStatsData(statsResponse.data)
      }

      if (schengenResponse.success && schengenResponse.data) {
        setSchengenData(schengenResponse.data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: `${window.location.origin}/`,
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  if (status === 'loading') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px', color: '#000' }}>
              DINO Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              환영합니다, {session.user?.name}님
            </p>
          </div>
          <button
            onClick={handleLogout}
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

        {/* Dashboard Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* 여행 기록 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
              여행 기록
            </h3>
            <div style={{ marginBottom: '15px' }}>
              {dataLoading ? (
                <div style={{ fontSize: '14px', color: '#666' }}>로딩 중...</div>
              ) : statsData ? (
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc', marginBottom: '5px' }}>
                  {statsData.overview.totalVisits}
                </div>
              ) : null}
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                새로운 여행을 추가하고 기존 기록을 관리하세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/trips')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              여행 추가하기
            </button>
          </div>

          {/* 셰겐 계산기 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
              셰겐 계산기
            </h3>
            <div style={{ marginBottom: '15px' }}>
              {dataLoading ? (
                <div style={{ fontSize: '14px', color: '#666' }}>로딩 중...</div>
              ) : schengenData ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6600cc' }}>
                    {schengenData.status.usedDays}/90
                  </div>
                  <div style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: schengenData.status.isCompliant ? '#e6ffe6' : '#ffe6e6',
                    color: schengenData.status.isCompliant ? '#006600' : '#cc0000'
                  }}>
                    {schengenData.status.isCompliant ? '준수' : '위반'}
                  </div>
                </div>
              ) : null}
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                90/180일 규칙을 확인하고 규정 준수를 확인하세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/schengen')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#6600cc',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              계산기 열기
            </button>
          </div>

          {/* 통계 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
              통계
            </h3>
            <div style={{ marginBottom: '15px' }}>
              {dataLoading ? (
                <div style={{ fontSize: '14px', color: '#666' }}>로딩 중...</div>
              ) : statsData ? (
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#009900', marginBottom: '5px' }}>
                  {statsData.overview.totalCountries}
                </div>
              ) : null}
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                여행 패턴과 체류 일수를 분석해보세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/analytics')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#009900',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              통계 보기
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
            최근 활동
          </h3>
          <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666' }}>최근 활동을 불러오는 중...</p>
              </div>
            ) : statsData && statsData.overview.totalVisits > 0 ? (
              <div>
                <p style={{ color: '#666', marginBottom: '20px' }}>최근 여행 기록 요약:</p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f8ff', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc', marginBottom: '5px' }}>
                      {statsData.overview.totalVisits}
                    </div>
                    <div style={{ fontSize: '12px', color: '#004499' }}>총 여행</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fff0', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#009900', marginBottom: '5px' }}>
                      {statsData.overview.totalCountries}
                    </div>
                    <div style={{ fontSize: '12px', color: '#006600' }}>방문 국가</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff0ff', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6600cc', marginBottom: '5px' }}>
                      {statsData.overview.totalDays}
                    </div>
                    <div style={{ fontSize: '12px', color: '#440066' }}>총 체류일</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666', marginBottom: '20px' }}>아직 여행 기록이 없습니다</p>
                <button 
                  onClick={() => router.push('/trips')}
                  style={{
                    padding: '10px 25px',
                    backgroundColor: '#0066cc',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  첫 번째 여행 추가하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}