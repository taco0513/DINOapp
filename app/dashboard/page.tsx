'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DataExportImport from '@/components/data/DataExportImport'
import { ApiClient } from '@/lib/api-client'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [schengenData, setSchengenData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin' as any)
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

  if (status === 'loading') {
    return (
      <Container className="py-16">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </Container>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <Container className="py-8">
      <PageHeader
        title={`환영합니다, ${session.user.name}님! 👋`}
        description="여행 기록을 시작하고 비자 규정을 추적해보세요."
      />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🗓️</div>
            <h3 className="text-lg font-semibold text-gray-900">여행 기록</h3>
          </div>
          <div className="mb-4">
            {dataLoading ? (
              <div className="text-sm text-gray-500">로딩 중...</div>
            ) : statsData ? (
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {statsData.overview.totalVisits}
              </div>
            ) : null}
            <p className="text-gray-600 text-sm">
              새로운 여행을 추가하고 기존 기록을 관리하세요.
            </p>
          </div>
          <button 
            onClick={() => router.push('/trips' as any)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            여행 추가하기
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🚨</div>
            <h3 className="text-lg font-semibold text-gray-900">셰겐 계산기</h3>
          </div>
          <div className="mb-4">
            {dataLoading ? (
              <div className="text-sm text-gray-500">로딩 중...</div>
            ) : schengenData ? (
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold text-indigo-600">
                  {schengenData.status.usedDays}/90
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  schengenData.status.isCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {schengenData.status.isCompliant ? '준수' : '위반'}
                </div>
              </div>
            ) : null}
            <p className="text-gray-600 text-sm">
              90/180일 규칙을 확인하고 규정 준수를 확인하세요.
            </p>
          </div>
          <button 
            onClick={() => router.push('/schengen' as any)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            계산기 열기
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900">통계</h3>
          </div>
          <div className="mb-4">
            {dataLoading ? (
              <div className="text-sm text-gray-500">로딩 중...</div>
            ) : statsData ? (
              <div className="text-2xl font-bold text-green-600 mb-1">
                {statsData.overview.totalCountries}
              </div>
            ) : null}
            <p className="text-gray-600 text-sm">
              여행 패턴과 체류 일수를 분석해보세요.
            </p>
          </div>
          <button 
            onClick={() => router.push('/analytics' as any)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            통계 보기
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">데이터 관리</h3>
        <DataExportImport onSuccess={loadDashboardData} />
      </div>

      {/* Recent Activity */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">최근 활동</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {dataLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner className="mx-auto mb-4" />
              <p className="text-gray-500">최근 활동을 불러오는 중...</p>
            </div>
          ) : statsData && statsData.overview.totalVisits > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">최근 여행 기록 요약:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {statsData.overview.totalVisits}
                  </div>
                  <div className="text-sm text-blue-700">총 여행</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {statsData.overview.totalCountries}
                  </div>
                  <div className="text-sm text-green-700">방문 국가</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {statsData.overview.totalDays}
                  </div>
                  <div className="text-sm text-purple-700">총 체류일</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✈️</div>
              <p className="text-gray-500 mb-4">아직 여행 기록이 없습니다</p>
              <button 
                onClick={() => router.push('/trips' as any)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                첫 번째 여행 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}