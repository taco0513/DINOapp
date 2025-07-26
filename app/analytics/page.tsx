'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import { getCountryByName } from '@/data/countries'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadStats()
  }, [session, status, router])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getStats()
      if (response.success && response.data) {
        setStatsData(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
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
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
            통계
          </h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            여행 패턴과 체류 일수를 분석해보세요
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>통계를 불러오는 중...</p>
          </div>
        ) : statsData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Overview Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>총 방문 국가</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.overview.totalCountries}</p>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>총 여행 일수</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.overview.totalDays}일</p>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>셰겐 사용 일수</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.overview.schengenDays}/90일</p>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>총 여행 횟수</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.overview.totalVisits}</p>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>올해 방문 국가</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.currentYear.countries}</p>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>최근 6개월 활동</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{statsData.recentActivity.visits}회</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Visited Countries */}
            {statsData.mostVisitedCountries && statsData.mostVisitedCountries.length > 0 && (
              <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>가장 많이 방문한 국가</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {statsData.mostVisitedCountries.map((item: any, index: number) => {
                    const country = getCountryByName(item.country)
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '18px' }}>{country?.flag || '🌍'}</span>
                          <span style={{ fontWeight: '500', color: '#000' }}>{item.country}</span>
                          {country?.isSchengen && (
                            <span style={{ 
                              fontSize: '11px', 
                              backgroundColor: '#e6f3ff', 
                              color: '#0066cc', 
                              padding: '2px 6px'
                            }}>
                              셰겐
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{item.visits}회</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Visa Type Distribution */}
            {statsData.visaTypeDistribution && statsData.visaTypeDistribution.length > 0 && (
              <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>비자 유형별 분포</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {statsData.visaTypeDistribution.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#000' }}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '100px', 
                          height: '8px', 
                          backgroundColor: '#f0f0f0',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div style={{ 
                            width: `${(item.count / statsData.overview.totalVisits) * 100}%`,
                            height: '100%',
                            backgroundColor: '#0066cc'
                          }} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#666' }}>{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Timeline */}
            {statsData.timeline && statsData.timeline.length > 0 && (
              <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>최근 여행 기록</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {statsData.timeline.map((trip: any, index: number) => {
                    const country = getCountryByName(trip.country)
                    const entryDate = new Date(trip.entryDate)
                    const exitDate = trip.exitDate ? new Date(trip.exitDate) : null
                    
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '20px' }}>{country?.flag || '🌍'}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{ fontWeight: '500', color: '#000' }}>{trip.country}</h4>
                              {country?.isSchengen && (
                                <span style={{ 
                                  fontSize: '11px', 
                                  backgroundColor: '#e6f3ff', 
                                  color: '#0066cc', 
                                  padding: '2px 6px'
                                }}>
                                  셰겐
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{trip.visaType}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>
                              {entryDate.toLocaleDateString('ko-KR')} 
                              {exitDate ? ` - ${exitDate.toLocaleDateString('ko-KR')}` : ' (현재 체류 중)'}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
                            {trip.days ? `${trip.days}일` : '-'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ border: '1px solid #e0e0e0', padding: '60px 40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '10px' }}>통계 데이터가 없습니다</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
              여행 기록을 추가하면 상세한 통계를 확인할 수 있습니다
            </p>
            <button 
              onClick={() => router.push('/trips')}
              style={{
                padding: '12px 30px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              여행 기록 추가하기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}