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
    <main className="min-h-screen bg-gray-50">
      {/* Container with max width and padding */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Wireframe Header Section */}
        <div className="bg-white border-2 border-gray-300 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                DINO Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                환영합니다, {session.user?.name}님
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Main Features Grid - Wireframe Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Travel Records Card */}
          <div className="bg-white border-2 border-gray-300 p-6 hover:border-blue-400 transition-colors">
            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                여행 기록
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 text-center">
                {dataLoading ? (
                  <div className="text-sm text-gray-500">로딩중...</div>
                ) : statsData ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {statsData.overview.totalVisits}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      총 여행 수
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-gray-400">-</div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                새로운 여행을 추가하고 기존 기록을 관리하세요
              </p>
              
              <button 
                onClick={() => router.push('/trips')}
                className="w-full py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium text-sm uppercase tracking-wide"
              >
                여행 추가하기
              </button>
            </div>
          </div>

          {/* Schengen Calculator Card */}
          <div className="bg-white border-2 border-gray-300 p-6 hover:border-purple-400 transition-colors">
            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                셰겐 계산기
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 text-center">
                {dataLoading ? (
                  <div className="text-sm text-gray-500">로딩중...</div>
                ) : schengenData ? (
                  <>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {schengenData.status.usedDays}/90
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      사용일수
                    </div>
                    <div className={`inline-block px-2 py-1 text-xs border ${
                      schengenData.status.isCompliant 
                        ? 'border-green-400 text-green-700 bg-green-50' 
                        : 'border-red-400 text-red-700 bg-red-50'
                    }`}>
                      {schengenData.status.isCompliant ? '준수' : '위반'}
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-gray-400">-/-</div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                90/180일 규칙 준수 여부를 확인하세요
              </p>
              
              <button 
                onClick={() => router.push('/schengen')}
                className="w-full py-3 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-medium text-sm uppercase tracking-wide"
              >
                계산기 열기
              </button>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white border-2 border-gray-300 p-6 hover:border-green-400 transition-colors">
            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                통계
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 text-center">
                {dataLoading ? (
                  <div className="text-sm text-gray-500">로딩중...</div>
                ) : statsData ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {statsData.overview.totalCountries}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      방문 국가
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-gray-400">-</div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                여행 패턴과 체류 일수를 분석해보세요
              </p>
              
              <button 
                onClick={() => router.push('/analytics')}
                className="w-full py-3 border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium text-sm uppercase tracking-wide"
              >
                통계 보기
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section - Wireframe Style */}
        <div className="bg-white border-2 border-gray-300">
          <div className="border-b-2 border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              최근 활동
            </h3>
          </div>
          
          <div className="p-6">
            {dataLoading ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200">
                <p className="text-gray-500">최근 활동을 불러오는 중...</p>
              </div>
            ) : statsData && statsData.overview.totalVisits > 0 ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-600 font-medium">
                  최근 여행 기록 요약:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border-2 border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {statsData.overview.totalVisits}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide border-t pt-2">
                      총 여행
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border-2 border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {statsData.overview.totalCountries}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide border-t pt-2">
                      방문 국가
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border-2 border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {statsData.overview.totalDays}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide border-t pt-2">
                      총 체류일
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200">
                <p className="text-gray-600 mb-6">아직 여행 기록이 없습니다</p>
                <button 
                  onClick={() => router.push('/trips')}
                  className="px-6 py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium text-sm uppercase tracking-wide"
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