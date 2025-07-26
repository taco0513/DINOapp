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
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-5 text-sm text-gray-600">로딩 중...</div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen p-5 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-5 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-black">
              DINO Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              환영합니다, {session.user?.name}님
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm"
          >
            로그아웃
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {/* 여행 기록 */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-3 text-black">
              여행 기록
            </h3>
            <div className="mb-4">
              {dataLoading ? (
                <div className="text-sm text-gray-600">로딩 중...</div>
              ) : statsData ? (
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {statsData.overview.totalVisits}
                </div>
              ) : null}
              <p className="text-sm text-gray-600 leading-relaxed">
                새로운 여행을 추가하고 기존 기록을 관리하세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/trips')}
              className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm rounded"
            >
              여행 추가하기
            </button>
          </div>

          {/* 셰겐 계산기 */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-3 text-black">
              셰겐 계산기
            </h3>
            <div className="mb-4">
              {dataLoading ? (
                <div className="text-sm text-gray-600">로딩 중...</div>
              ) : schengenData ? (
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {schengenData.status.usedDays}/90
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    schengenData.status.isCompliant 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {schengenData.status.isCompliant ? '준수' : '위반'}
                  </div>
                </div>
              ) : null}
              <p className="text-sm text-gray-600 leading-relaxed">
                90/180일 규칙을 확인하고 규정 준수를 확인하세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/schengen')}
              className="w-full py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm rounded"
            >
              계산기 열기
            </button>
          </div>

          {/* 통계 */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-3 text-black">
              통계
            </h3>
            <div className="mb-4">
              {dataLoading ? (
                <div className="text-sm text-gray-600">로딩 중...</div>
              ) : statsData ? (
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statsData.overview.totalCountries}
                </div>
              ) : null}
              <p className="text-sm text-gray-600 leading-relaxed">
                여행 패턴과 체류 일수를 분석해보세요.
              </p>
            </div>
            <button 
              onClick={() => router.push('/analytics')}
              className="w-full py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm rounded"
            >
              통계 보기
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-5 text-black">
            최근 활동
          </h3>
          <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
            {dataLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-600">최근 활동을 불러오는 중...</p>
              </div>
            ) : statsData && statsData.overview.totalVisits > 0 ? (
              <div>
                <p className="text-gray-600 mb-5">최근 여행 기록 요약:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-5 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {statsData.overview.totalVisits}
                    </div>
                    <div className="text-xs text-blue-700">총 여행</div>
                  </div>
                  <div className="text-center p-5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {statsData.overview.totalCountries}
                    </div>
                    <div className="text-xs text-green-700">방문 국가</div>
                  </div>
                  <div className="text-center p-5 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {statsData.overview.totalDays}
                    </div>
                    <div className="text-xs text-purple-700">총 체류일</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600 mb-5">아직 여행 기록이 없습니다</p>
                <button 
                  onClick={() => router.push('/trips')}
                  className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm rounded"
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