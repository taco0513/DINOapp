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
import { Bell, Globe } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [schengenData, setSchengenData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
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
      // Error loading dashboard data
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Travel Records */}
          <div className="card">
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