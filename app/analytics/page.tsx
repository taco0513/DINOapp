'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
      router.push('/auth/signin' as any)
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
    return null
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="통계"
        description="여행 패턴과 체류 일수를 분석해보세요"
      />

      {loading ? (
        <div className="text-center py-16">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">통계를 불러오는 중...</p>
        </div>
      ) : statsData ? (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 방문 국가</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.overview.totalCountries}</p>
                </div>
                <div className="text-2xl">🌍</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 여행 일수</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.overview.totalDays}일</p>
                </div>
                <div className="text-2xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">셰겐 사용 일수</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.overview.schengenDays}/90일</p>
                </div>
                <div className="text-2xl">🇪🇺</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 여행 횟수</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.overview.totalVisits}</p>
                </div>
                <div className="text-2xl">✈️</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">올해 방문 국가</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.currentYear.countries}</p>
                </div>
                <div className="text-2xl">🗓️</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">최근 6개월 활동</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.recentActivity.visits}회</p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
            </div>
          </div>

          {/* Most Visited Countries */}
          {statsData.mostVisitedCountries && statsData.mostVisitedCountries.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">가장 많이 방문한 국가</h3>
              <div className="space-y-3">
                {statsData.mostVisitedCountries.map((item: any, index: number) => {
                  const country = getCountryByName(item.country)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{country?.flag || '🌍'}</span>
                        <span className="font-medium text-gray-900">{item.country}</span>
                        {country?.isSchengen && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            셰겐
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-blue-600">{item.visits}회</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Visa Type Distribution */}
          {statsData.visaTypeDistribution && statsData.visaTypeDistribution.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">비자 유형별 분포</h3>
              <div className="space-y-3">
                {statsData.visaTypeDistribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-900">{item.type}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / statsData.overview.totalVisits) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Timeline */}
          {statsData.timeline && statsData.timeline.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 여행 기록</h3>
              <div className="space-y-4">
                {statsData.timeline.map((trip: any, index: number) => {
                  const country = getCountryByName(trip.country)
                  const entryDate = new Date(trip.entryDate)
                  const exitDate = trip.exitDate ? new Date(trip.exitDate) : null
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{country?.flag || '🌍'}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{trip.country}</h4>
                            {country?.isSchengen && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                셰겐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{trip.visaType}</p>
                          <p className="text-xs text-gray-500">
                            {entryDate.toLocaleDateString('ko-KR')} 
                            {exitDate ? ` - ${exitDate.toLocaleDateString('ko-KR')}` : ' (현재 체류 중)'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">통계 데이터가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              여행 기록을 추가하면 상세한 통계를 확인할 수 있습니다
            </p>
            <button 
              onClick={() => router.push('/trips' as any)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              여행 기록 추가하기
            </button>
          </div>
        </div>
      )}
    </Container>
  )
}