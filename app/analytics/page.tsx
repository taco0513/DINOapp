'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import { getCountryByName } from '@/data/countries'
import { TravelStatsWidget } from '@/components/dashboard/TravelStatsWidget'
import { PullToRefresh } from '@/components/mobile/PullToRefresh'
import { PageHeader, PageIcons } from '@/components/common/PageHeader'
import { BarChart3, Download, RefreshCw } from 'lucide-react'
import { format, startOfYear, endOfYear, eachMonthOfInterval, differenceInDays, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Trip {
  id: string
  country: string
  city?: string
  entryDate: string
  exitDate?: string
  visaType?: string
  days?: number
  purpose?: string
  isSchengen?: boolean
}

interface CountryStats {
  country: string
  visits: number
  totalDays: number
  cities: string[]
  lastVisit: string
}

interface MonthlyStats {
  month: Date
  trips: number
  days: number
  schengenDays: number
  countries: string[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'overview' | 'countries' | 'timeline' | 'patterns'>('overview')
  const [trips, setTrips] = useState<Trip[]>([])

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
        // Convert timeline data to trips format for enhanced analytics
        if (response.data.timeline) {
          const convertedTrips: Trip[] = response.data.timeline.map((trip: any, index: number) => ({
            id: `trip-${index}`,
            country: trip.country,
            city: trip.city,
            entryDate: trip.entryDate,
            exitDate: trip.exitDate,
            visaType: trip.visaType,
            days: trip.days,
            purpose: trip.purpose || 'Travel',
            isSchengen: getCountryByName(trip.country)?.isSchengen
          }))
          setTrips(convertedTrips)
        }
      }
    } catch (error) {
      // Error loading stats
    } finally {
      setLoading(false)
    }
  }

  // Enhanced calculation functions
  const calculateTravelPatterns = () => {
    const dayOfWeekCounts = Array(7).fill(0)
    const monthCounts = Array(12).fill(0)
    const seasonCounts = { spring: 0, summer: 0, fall: 0, winter: 0 }

    trips.forEach(trip => {
      const startDate = new Date(trip.entryDate)
      dayOfWeekCounts[startDate.getDay()]++
      monthCounts[startDate.getMonth()]++

      const month = startDate.getMonth()
      if (month >= 2 && month <= 4) seasonCounts.spring++
      else if (month >= 5 && month <= 7) seasonCounts.summer++
      else if (month >= 8 && month <= 10) seasonCounts.fall++
      else seasonCounts.winter++
    })

    return { dayOfWeekCounts, monthCounts, seasonCounts }
  }

  const calculateMonthlyStats = (): MonthlyStats[] => {
    const yearStart = startOfYear(new Date(selectedYear, 0))
    const yearEnd = endOfYear(new Date(selectedYear, 0))
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthTrips = trips.filter(trip => {
        const tripStart = new Date(trip.entryDate)
        const tripEnd = trip.exitDate ? new Date(trip.exitDate) : tripStart
        return (
          (tripStart >= monthStart && tripStart <= monthEnd) ||
          (tripEnd >= monthStart && tripEnd <= monthEnd) ||
          (tripStart < monthStart && tripEnd > monthEnd)
        )
      })

      const days = monthTrips.reduce((sum, trip) => {
        const tripStart = new Date(trip.entryDate)
        const tripEnd = trip.exitDate ? new Date(trip.exitDate) : tripStart
        const overlapStart = tripStart > monthStart ? tripStart : monthStart
        const overlapEnd = tripEnd < monthEnd ? tripEnd : monthEnd
        
        if (overlapStart <= overlapEnd) {
          return sum + differenceInDays(overlapEnd, overlapStart) + 1
        }
        return sum
      }, 0)

      const schengenDays = monthTrips.reduce((sum, trip) => {
        if (trip.isSchengen) {
          const tripStart = new Date(trip.entryDate)
          const tripEnd = trip.exitDate ? new Date(trip.exitDate) : tripStart
          const overlapStart = tripStart > monthStart ? tripStart : monthStart
          const overlapEnd = tripEnd < monthEnd ? tripEnd : monthEnd
          
          if (overlapStart <= overlapEnd) {
            return sum + differenceInDays(overlapEnd, overlapStart) + 1
          }
        }
        return sum
      }, 0)

      const countries = new Set(monthTrips.map(t => t.country))

      return {
        month,
        trips: monthTrips.length,
        days,
        schengenDays,
        countries: Array.from(countries)
      }
    })
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
        <PageHeader
          title="여행 분석"
          description="당신의 여행 패턴과 통계를 자세히 분석해보세요"
          icon={PageIcons.Analytics}
          breadcrumbs={[
            { label: '대시보드', href: '/dashboard' },
            { label: '여행 분석' }
          ]}
          action={
            <div className="flex items-center space-x-2">
              <button
                onClick={loadStats}
                disabled={loading}
                className="btn btn-outline btn-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          }
        />

        {/* Enhanced Analytics Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium">{selectedYear}년</span>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={selectedYear >= new Date().getFullYear() || loading}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex space-x-2">
            {(['overview', 'countries', 'timeline', 'patterns'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                {mode === 'overview' && '전체 요약'}
                {mode === 'countries' && '국가별'}
                {mode === 'timeline' && '시간대별'}
                {mode === 'patterns' && '패턴 분석'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: 'var(--space-16) var(--space-5)' }}>
            <div className="loading">통계를 불러오는 중...</div>
          </div>
        ) : statsData ? (
          <div className="flex flex-col gap-10">
            {/* Travel Statistics Widget - Always show */}
            {viewMode === 'overview' && <TravelStatsWidget />}
            
            {/* View-based content */}
            {viewMode === 'overview' && (
              <>
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
              </>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="card">
                <h3 className="card-title mb-5">월별 여행 현황</h3>
                <div className="flex flex-col gap-3">
                  {calculateMonthlyStats().map(month => (
                    <div key={month.month.toISOString()} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {format(month.month, 'M월', { locale: ko })}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>여행 {month.trips}회</span>
                          <span>•</span>
                          <span>{month.days}일</span>
                          {month.schengenDays > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600">셰겐 {month.schengenDays}일</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {month.countries.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {month.countries.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns View */}
            {viewMode === 'patterns' && trips.length > 0 && (
              <div className="space-y-6">
                {/* Travel Patterns Analysis */}
                <div className="card">
                  <h3 className="card-title mb-5">여행 패턴 분석</h3>
                  
                  {/* Day of Week Pattern */}
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-900 mb-4">요일별 출발 패턴</h4>
                    <div className="space-y-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
                        const patterns = calculateTravelPatterns()
                        const maxCount = Math.max(...patterns.dayOfWeekCounts, 1)
                        return (
                          <div key={day} className="flex items-center justify-between">
                            <span className="text-gray-700 w-12">{day}요일</span>
                            <div className="flex-1 mx-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ 
                                    width: `${(patterns.dayOfWeekCounts[index] / maxCount) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-8 text-right">
                              {patterns.dayOfWeekCounts[index]}회
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Season Pattern */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">계절별 여행 선호도</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const patterns = calculateTravelPatterns()
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-3xl mb-2">🌸</div>
                              <p className="text-sm text-gray-600">봄</p>
                              <p className="text-xl font-bold text-gray-900">{patterns.seasonCounts.spring}회</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">☀️</div>
                              <p className="text-sm text-gray-600">여름</p>
                              <p className="text-xl font-bold text-gray-900">{patterns.seasonCounts.summer}회</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">🍂</div>
                              <p className="text-sm text-gray-600">가을</p>
                              <p className="text-xl font-bold text-gray-900">{patterns.seasonCounts.fall}회</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">❄️</div>
                              <p className="text-sm text-gray-600">겨울</p>
                              <p className="text-xl font-bold text-gray-900">{patterns.seasonCounts.winter}회</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Countries View - Use existing most visited countries */}
            {viewMode === 'countries' && statsData.mostVisitedCountries && statsData.mostVisitedCountries.length > 0 && (
              <div className="card">
                <h3 className="card-title mb-5">국가별 방문 통계</h3>
                <div className="flex flex-col gap-3">
                  {statsData.mostVisitedCountries.map((item: any, index: number) => {
                    const country = getCountryByName(item.country)
                    return (
                      <div key={index} className="flex justify-between items-center p-4" style={{ 
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: '20px' }}>{country?.flag || '🌍'}</span>
                          <div>
                            <h4 className="font-medium">{item.country}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {country?.isSchengen && (
                                <span className="badge">셰겐</span>
                              )}
                              <span className="text-small text-secondary">
                                방문 {item.visits}회 • 총 {item.totalDays || 0}일
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                          {item.visits}회
                        </span>
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