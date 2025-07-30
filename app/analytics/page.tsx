'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import { getCountryByName } from '@/data/countries'
import { TravelStatsWidget } from '@/components/dashboard/TravelStatsWidget'
import { PullToRefresh } from '@/components/mobile/PullToRefresh'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadStats()
  }, [session, status, router])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getStats()
      if (response.success && response.data) {
        setStatsData(response.data)
      }
    } catch (error) {
      // Error loading stats
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading">로딩 중...</div>
      </main>
    )
  }

  const pageContent = (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        {/* Header */}
        <header className="nav mb-8">
          <div>
            <h1 className="mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              여행 분석
            </h1>
            <p className="text-small text-secondary">
              당신의 여행 패턴과 통계를 자세히 분석해보세요
            </p>
          </div>
        </header>

        {loading ? (
          <div className="text-center" style={{ padding: 'var(--space-16) var(--space-5)' }}>
            <div className="loading">통계를 불러오는 중...</div>
          </div>
        ) : statsData ? (
          <div className="flex flex-col gap-10">
            {/* Travel Statistics Widget */}
            <TravelStatsWidget />
            
            {/* Existing Analytics */}
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="stat">
                <div className="stat-label">총 방문 국가</div>
                <div className="stat-value">{statsData.overview.totalCountries}</div>
              </div>

              <div className="stat">
                <div className="stat-label">총 여행 일수</div>
                <div className="stat-value">{statsData.overview.totalDays}일</div>
              </div>

              <div className="stat">
                <div className="stat-label">셰겐 사용 일수</div>
                <div className="stat-value">{statsData.overview.schengenDays}/90일</div>
              </div>

              <div className="stat">
                <div className="stat-label">총 여행 횟수</div>
                <div className="stat-value">{statsData.overview.totalVisits}</div>
              </div>

              <div className="stat">
                <div className="stat-label">올해 방문 국가</div>
                <div className="stat-value">{statsData.currentYear.countries}</div>
              </div>

              <div className="stat">
                <div className="stat-label">최근 6개월 활동</div>
                <div className="stat-value">{statsData.recentActivity.visits}회</div>
              </div>
            </div>

            {/* Most Visited Countries */}
            {statsData.mostVisitedCountries && statsData.mostVisitedCountries.length > 0 && (
              <div className="card">
                <h3 className="card-title mb-5">가장 많이 방문한 국가</h3>
                <div className="flex flex-col gap-3">
                  {statsData.mostVisitedCountries.map((item: any, index: number) => {
                    const country = getCountryByName(item.country)
                    return (
                      <div key={index} className="flex justify-between items-center p-3" style={{ 
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: '18px' }}>{country?.flag || '🌍'}</span>
                          <span className="font-medium">{item.country}</span>
                          {country?.isSchengen && (
                            <span className="badge">
                              셰겐
                            </span>
                          )}
                        </div>
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{item.visits}회</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Visa Type Distribution */}
            {statsData.visaTypeDistribution && statsData.visaTypeDistribution.length > 0 && (
              <div className="card">
                <h3 className="card-title mb-5">비자 유형별 분포</h3>
                <div className="flex flex-col gap-3">
                  {statsData.visaTypeDistribution.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.type}</span>
                      <div className="flex items-center gap-3">
                        <div style={{ 
                          width: '100px', 
                          height: '8px', 
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)'
                        }}>
                          <div style={{ 
                            width: `${(item.count / statsData.overview.totalVisits) * 100}%`,
                            height: '100%',
                            backgroundColor: 'var(--color-primary)'
                          }} />
                        </div>
                        <span className="text-small text-secondary">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Timeline */}
            {statsData.timeline && statsData.timeline.length > 0 && (
              <div className="card">
                <h3 className="card-title mb-5">최근 여행 기록</h3>
                <div className="flex flex-col gap-4">
                  {statsData.timeline.map((trip: any, index: number) => {
                    const country = getCountryByName(trip.country)
                    const entryDate = new Date(trip.entryDate)
                    const exitDate = trip.exitDate ? new Date(trip.exitDate) : null
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-4" style={{ 
                        border: '1px solid var(--color-border)'
                      }}>
                        <div className="flex items-center gap-4">
                          <span style={{ fontSize: '20px' }}>{country?.flag || '🌍'}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{trip.country}</h4>
                              {country?.isSchengen && (
                                <span className="badge">
                                  셰겐
                                </span>
                              )}
                            </div>
                            <p className="text-small text-secondary mb-1">{trip.visaType}</p>
                            <p className="text-small text-tertiary">
                              {entryDate.toLocaleDateString('ko-KR')} 
                              {exitDate ? ` - ${exitDate.toLocaleDateString('ko-KR')}` : ' (현재 체류 중)'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
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
          <div className="card text-center" style={{ padding: 'var(--space-16) var(--space-10)' }}>
            <h3 className="mb-2">통계 데이터가 없습니다</h3>
            <p className="text-small text-secondary mb-6">
              여행 기록을 추가하면 상세한 통계를 확인할 수 있습니다
            </p>
            <button 
              onClick={() => router.push('/trips')}
              className="btn btn-primary"
            >
              여행 기록 추가하기
            </button>
          </div>
        )}
      </div>
    )

  return (
    <main style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <PullToRefresh onRefresh={loadStats}>
          {pageContent}
        </PullToRefresh>
      ) : (
        pageContent
      )}
    </main>
  )
}