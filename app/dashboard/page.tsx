'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import NotificationIcon from '@/components/notifications/NotificationIcon'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import LanguageSelector from '@/components/ui/LanguageSelector'
import LanguageTest from '@/components/ui/LanguageTest'
import { t } from '@/lib/i18n'
import { Bell, Globe, Plus, Plane, Calculator, BarChart } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [schengenData, setSchengenData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

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
    setDataError(null)
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
      setDataError('데이터를 불러오는 중 오류가 발생했습니다.')
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
      // Logout error occurred
      window.location.href = '/'
    }
  }

  if (status === 'loading') {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading">{t('common.loading')}</div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {t('nav.dashboard')}
          </h1>
          <p className="text-secondary">
            {t('dashboard.welcome', { name: session.user?.name || '' })}
          </p>
        </div>

        {/* Error Display */}
        {dataError && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{
                  color: '#e03131',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  데이터 로드 오류
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {dataError}
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                style={{
                  backgroundColor: '#e03131',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 빈 상태 처리: Quick Action Cards */}
        {!dataLoading && (!statsData || statsData.overview.totalVisits === 0) ? (
          <QuickStartDashboard />
        ) : (
          <>
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Travel Records */}
              <div className="card card-priority-high">
                <div className="card-header">
                  <h3 className="card-title">{t('nav.trips')}</h3>
                </div>
                
                <div className="stat mb-4">
                  <div className="stat-value">
                    {dataLoading ? '...' : statsData ? statsData.overview.totalVisits : '0'}
                  </div>
                  <div className="stat-label">{t('common.total')} {t('nav.trips')}</div>
                </div>
                
                <p className="text-small text-secondary mb-4">
                  {t('trips.description')}
                </p>
                
                <button 
                  onClick={() => router.push('/trips')}
                  className="btn btn-full"
                >
                  {t('trips.add')}
                </button>
              </div>

              {/* Schengen Calculator */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('nav.schengen')}</h3>
                </div>
                
                <div className="stat mb-4">
                  <div className="stat-value">
                    {dataLoading ? '...' : schengenData ? `${schengenData.status.usedDays}/90` : '0/90'}
                  </div>
                  <div className="stat-label">{t('schengen.used_days')}/90</div>
                  {schengenData && (
                    <div className={`badge mt-2 ${schengenData.status.isCompliant ? 'badge-success' : 'badge-error'}`}>
                      {schengenData.status.isCompliant ? t('schengen.compliant') : t('schengen.violation')}
                    </div>
                  )}
                </div>
                
                <p className="text-small text-secondary mb-4">
                  {t('schengen.description')}
                </p>
                
                <button 
                  onClick={() => router.push('/schengen')}
                  className="btn btn-full"
                >
                  {t('nav.schengen')}
                </button>
              </div>

              {/* Statistics */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('dashboard.stats.view')}</h3>
                </div>
                
                <div className="stat mb-4">
                  <div className="stat-value">
                    {dataLoading ? '...' : statsData ? statsData.overview.totalCountries : '0'}
                  </div>
                  <div className="stat-label">{t('dashboard.stats.countries')}</div>
                </div>
                
                <p className="text-small text-secondary mb-4">
                  여행 패턴과 체류 일수를 분석해보세요
                </p>
                
                <button 
                  onClick={() => router.push('/analytics')}
                  className="btn btn-full"
                >
                  {t('dashboard.stats.view')}
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 빠른 비자 체크 카드 */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">빠른 비자 체크</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  국가를 선택하면 비자 정보를 바로 확인
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/visa-check')}
              className="btn btn-primary w-full"
            >
              비자 체크 바로가기
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.recent_activity')}</h3>
          </div>
          
          {dataLoading ? (
            <div className="text-center" style={{ padding: 'var(--space-10)' }}>
              <div className="loading">{t('dashboard.loading_activity')}</div>
            </div>
          ) : statsData && statsData.overview.totalVisits > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat">
                <div className="stat-value">
                  {statsData.overview.totalVisits}
                </div>
                <div className="stat-label">{t('common.total')} {t('nav.trips')}</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {statsData.overview.totalCountries}
                </div>
                <div className="stat-label">{t('dashboard.stats.countries')}</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {statsData.overview.totalDays}
                </div>
                <div className="stat-label">{t('common.total')} {t('common.days')}</div>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ padding: 'var(--space-10)' }}>
              <p className="text-secondary mb-6">{t('dashboard.no_trips')}</p>
              <button 
                onClick={() => router.push('/trips')}
                className="btn btn-primary"
              >
                {t('dashboard.add_first_trip')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 알림 설정 섹션 */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </h2>
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="btn btn-ghost text-sm"
          >
            {showNotificationSettings ? '닫기' : '설정'}
          </button>
        </div>
        
        {showNotificationSettings && (
          <div className="card-body">
            <NotificationSettings userId={session?.user?.id || ''} />
          </div>
        )}
      </div>
      
      <LanguageTest />
    </main>
  )
}

// Quick Start Dashboard Component for Empty State
function QuickStartDashboard() {
  const router = useRouter()
  
  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🚀 DINOapp 시작하기</h2>
        <p className="text-secondary">첫 여행 기록부터 시작해서 모든 기능을 체험해보세요</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* 첫 여행 기록 추가 */}
        <div className="card card-featured">
          <div className="card-badges">
            <span className="badge badge-primary">추천</span>
          </div>
          <div className="card-header">
            <div className="flex items-center gap-3 mb-2">
              <Plane className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              <h3 className="card-title">첫 여행 기록 추가</h3>
            </div>
            <p className="card-description">
              최근 여행을 추가해서 DINOapp의 핵심 기능을 체험해보세요
            </p>
          </div>
          <button 
            onClick={() => router.push('/trips')}
            className="btn btn-primary btn-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            여행 기록 추가
          </button>
        </div>

        {/* 셰겐 계산기 */}
        <div className="card card-priority-medium">
          <div className="card-header">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
              <h3 className="card-title">셰겐 계산기</h3>
            </div>
            <p className="card-description">
              90/180일 규정을 자동으로 계산하고 체류 가능 일수를 확인하세요
            </p>
          </div>
          <button 
            onClick={() => router.push('/schengen')}
            className="btn btn-outline btn-full"
          >
            계산기 사용하기
          </button>
        </div>

        {/* Gmail 연동 */}
        <div className="card card-priority-low">
          <div className="card-header">
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="h-6 w-6" style={{ color: 'var(--color-text-secondary)' }} />
              <h3 className="card-title">스마트 분석</h3>
            </div>
            <p className="card-description">
              Gmail 연동으로 항공권, 호텔 예약을 자동 분석해보세요
            </p>
          </div>
          <button 
            onClick={() => router.push('/gmail')}
            className="btn btn-ghost btn-full"
          >
            Gmail 연동하기
          </button>
        </div>
      </div>

      {/* Getting Started Checklist */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">시작 체크리스트</h3>
          <p className="card-description">단계별로 DINOapp의 모든 기능을 활용해보세요</p>
        </div>
        <div className="space-y-3">
          <ChecklistItem 
            icon="✈️" 
            title="첫 여행 기록 추가" 
            description="최근 여행 경험을 입력해보세요"
            completed={false}
            onClick={() => router.push('/trips')}
          />
          <ChecklistItem 
            icon="🇪🇺" 
            title="셰겐 계산기 체험" 
            description="유럽 여행 계획에 필수적인 도구입니다"
            completed={false}
            onClick={() => router.push('/schengen')}
          />
          <ChecklistItem 
            icon="📧" 
            title="Gmail 연동 설정" 
            description="자동 여행 기록 생성을 위한 설정"
            completed={false}
            onClick={() => router.push('/gmail')}
          />
          <ChecklistItem 
            icon="📅" 
            title="캘린더 연동" 
            description="여행 일정을 캘린더와 동기화"
            completed={false}
            onClick={() => router.push('/calendar')}
          />
        </div>
      </div>
    </div>
  )
}

// Checklist Item Component
function ChecklistItem({ 
  icon, 
  title, 
  description, 
  completed, 
  onClick 
}: {
  icon: string
  title: string
  description: string
  completed: boolean
  onClick: () => void
}) {
  return (
    <div 
      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
        completed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-surface border-border hover:border-border-strong'
      }`}
      onClick={onClick}
    >
      <span className="text-2xl mr-4">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium ${completed ? 'line-through text-secondary' : ''}`}>
            {title}
          </h4>
          {completed && <span className="text-green-600 text-sm">✓ 완료</span>}
        </div>
        <p className="text-sm text-secondary">{description}</p>
      </div>
      <div className="text-secondary">
        →
      </div>
    </div>
  )
}