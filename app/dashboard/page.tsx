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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{
          padding: '20px',
          border: '2px solid #ccc',
          backgroundColor: 'white'
        }}>
          로딩 중...
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      {/* 진짜 와이어프레임 컨테이너 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        border: '3px solid #333',
        padding: '20px'
      }}>
        
        {/* 헤더 박스 */}
        <div style={{
          border: '2px solid #666',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
              DINO Dashboard
            </h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              환영합니다, {session.user?.name}님
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              border: '2px solid #333',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>

        {/* 메인 그리드 - 와이어프레임 박스들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* 여행 기록 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>여행 기록</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : statsData ? statsData.overview.totalVisits : '0'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>총 여행 수</div>
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              새로운 여행을 추가하고 기존 기록을 관리하세요
            </p>
            
            <button 
              onClick={() => router.push('/trips')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              여행 추가하기
            </button>
          </div>

          {/* 셰겐 계산기 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>셰겐 계산기</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : schengenData ? `${schengenData.status.usedDays}/90` : '0/90'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>사용일/허용일</div>
              {schengenData && (
                <div style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  backgroundColor: schengenData.status.isCompliant ? '#e6ffe6' : '#ffe6e6',
                  fontSize: '12px'
                }}>
                  {schengenData.status.isCompliant ? '준수' : '위반'}
                </div>
              )}
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              90/180일 규칙을 확인하고 규정 준수를 확인하세요
            </p>
            
            <button 
              onClick={() => router.push('/schengen')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              계산기 열기
            </button>
          </div>

          {/* 통계 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>통계</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : statsData ? statsData.overview.totalCountries : '0'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>방문 국가</div>
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              여행 패턴과 체류 일수를 분석해보세요
            </p>
            
            <button 
              onClick={() => router.push('/analytics')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              통계 보기
            </button>
          </div>
        </div>

        {/* 최근 활동 박스 */}
        <div style={{
          border: '2px solid #666',
          padding: '20px',
          backgroundColor: 'white'
        }}>
          <div style={{
            borderBottom: '1px solid #ccc',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: '0', fontSize: '18px' }}>최근 활동</h3>
          </div>
          
          {dataLoading ? (
            <div style={{
              border: '1px dashed #999',
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              최근 활동을 불러오는 중...
            </div>
          ) : statsData && statsData.overview.totalVisits > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalVisits}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>총 여행</div>
              </div>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalCountries}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>방문 국가</div>
              </div>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalDays}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>총 체류일</div>
              </div>
            </div>
          ) : (
            <div style={{
              border: '1px dashed #999',
              padding: '40px',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '20px', color: '#666' }}>아직 여행 기록이 없습니다</p>
              <button 
                onClick={() => router.push('/trips')}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #333',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                첫 번째 여행 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}