'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'
import { t } from '@/lib/i18n'

export default function SchengenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [hasTrips, setHasTrips] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [schengenData, setSchengenData] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin' as any)
      return
    }

    loadSchengenData()
  }, [session, status, router])

  const loadSchengenData = async () => {
    setLoading(true)
    try {
      const [tripsResponse, schengenResponse] = await Promise.all([
        ApiClient.getTrips(),
        ApiClient.getSchengenStatus()
      ])

      if (tripsResponse.success && tripsResponse.data) {
        setTrips(tripsResponse.data)
        setHasTrips(tripsResponse.data.length > 0)
      } else {
        setHasTrips(false)
      }

      if (schengenResponse.success && schengenResponse.data) {
        setSchengenData(schengenResponse.data)
      }
    } catch (error) {
      console.error('Error loading Schengen data:', error)
      setHasTrips(false)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading">{t('common.loading')}</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-10)' }}>
        {/* Navigation */}
        <nav className="nav mb-8">
          <Link href="/dashboard" className="nav-brand">
            DINO
          </Link>
          <ul className="nav-menu">
            <li><Link href="/dashboard" className="nav-link">{t('nav.dashboard')}</Link></li>
            <li><Link href="/trips" className="nav-link">{t('nav.trips')}</Link></li>
            <li><span className="nav-link active">{t('nav.schengen')}</span></li>
            <li><Link href="/calendar" className="nav-link">{t('nav.calendar')}</Link></li>
          </ul>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="mb-2">
            {t('schengen.title')}
          </h1>
          <p className="text-secondary">
            {t('schengen.description')}
          </p>
        </header>

        {loading ? (
          <div className="text-center" style={{ padding: 'var(--space-20) 0' }}>
            <div className="loading">데이터를 불러오는 중...</div>
          </div>
        ) : hasTrips ? (
          <div className="grid gap-10">
            {/* Schengen Status Card */}
            <div className="card">
              <h3 className="card-title mb-5">
                현재 셰겐 상태
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="stat">
                  <div className="stat-value">
                    {schengenData ? `${schengenData.status.usedDays} / 90` : '0 / 90'}
                  </div>
                  <div className="stat-label">사용된 일수</div>
                </div>
                <div className="stat">
                  <div className="stat-value">
                    {schengenData ? schengenData.status.remainingDays : '90'}
                  </div>
                  <div className="stat-label">남은 일수</div>
                </div>
                <div className="stat">
                  <div className="stat-value">
                    {schengenData ? schengenData.status.nextResetDate : '---'}
                  </div>
                  <div className="stat-label">다음 재설정</div>
                </div>
              </div>
              
              {/* Compliance Status and Warnings */}
              {schengenData && (
                <div className="mt-5">
                  <div className={`alert ${schengenData.status.isCompliant ? 'alert-success' : 'alert-error'} text-center font-semibold`}>
                    {schengenData.status.isCompliant ? '✅ 셰겐 규정 준수' : '⚠️ 셰겐 규정 위반'}
                  </div>
                  
                  {schengenData.warnings && schengenData.warnings.length > 0 && (
                    <div className="mt-4">
                      {schengenData.warnings.map((warning: string, index: number) => (
                        <div key={index} className="alert alert-warning mb-2">
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Usage Chart */}
            <div className="card">
              <h3 className="card-title mb-5">
                180일 사용 현황
              </h3>
              <div style={{ 
                height: '200px', 
                border: '1px solid var(--color-border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--color-surface)'
              }}>
                <span className="text-secondary text-small">[차트 영역 - 180일간 셰겐 사용 현황]</span>
              </div>
            </div>

            {/* Future Trip Planner */}
            <div className="card">
              <h3 className="card-title mb-5">
                미래 여행 계획
              </h3>
              <div className="form-group">
                <label className="form-label">
                  계획된 여행 날짜
                </label>
                <input 
                  type="date" 
                  className="form-input"
                  style={{ width: '200px' }}
                />
              </div>
              <div className="alert" style={{ backgroundColor: 'var(--color-surface)' }}>
                <p className="text-small text-secondary">
                  여행 날짜를 선택하면 셰겐 규칙 준수 여부를 확인할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 'var(--space-16)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-5)' }}>🇪🇺</div>
            <h3 className="mb-2">
              셰겐 계산기
            </h3>
            <p className="text-secondary mb-8">
              여행 기록을 추가하면 자동으로 셰겐 지역 체류 일수가 계산됩니다
            </p>
            <Link 
              href="/trips"
              className="btn btn-primary mb-10"
            >
              여행 기록 추가하기
            </Link>
            
            <div className="divider"></div>
            
            <div style={{ paddingTop: 'var(--space-10)' }}>
              <h4 className="mb-5">
                📚 셰겐 90/180일 규칙
              </h4>
              <div className="text-left" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <p className="text-small text-secondary mb-2">• 셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다</p>
                <p className="text-small text-secondary mb-2">• 이 규칙은 롤링 방식으로 적용됩니다 (고정된 기간이 아님)</p>
                <p className="text-small text-secondary mb-2">• 매일 지난 180일간의 체류 일수를 계산합니다</p>
                <p className="text-small text-secondary mb-2">• 비자 없이 입국하는 관광객에게 적용됩니다</p>
                <p className="text-small text-secondary">• 장기 체류 비자나 거주권이 있으면 규칙이 다를 수 있습니다</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}