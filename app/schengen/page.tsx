'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'
import { t } from '@/lib/i18n'
import SchengenUsageChart from '@/components/schengen/SchengenUsageChart'
import { PullToRefresh } from '@/components/mobile/PullToRefresh'
import { SwipeableCard } from '@/components/mobile/SwipeableCard'

export default function SchengenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [hasTrips, setHasTrips] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [schengenData, setSchengenData] = useState<any>(null)
  const [futureDate, setFutureDate] = useState<string>('')
  const [futureDuration, setFutureDuration] = useState<number>(7)
  const [futureCountry, setFutureCountry] = useState<string>('France')
  const [futureAnalysis, setFutureAnalysis] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin' as any)
      return
    }

    loadSchengenData()
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

  const analyzeFutureTrip = () => {
    if (!futureDate || !schengenData) return

    const schengenCountries = [
      'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
      'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
      'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
      'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
    ]

    // 미래 여행 날짜 계산
    const startDate = new Date(futureDate)
    const endDate = new Date(futureDate)
    endDate.setDate(endDate.getDate() + futureDuration - 1)

    // 180일 윈도우 계산
    const windowStart = new Date(startDate)
    windowStart.setDate(windowStart.getDate() - 180)

    // 현재까지의 셰겐 사용일수 계산
    let usedDays = 0
    trips.forEach(trip => {
      if (!schengenCountries.includes(trip.country)) return
      
      const entryDate = new Date(trip.entryDate)
      const exitDate = trip.exitDate ? new Date(trip.exitDate) : new Date()
      
      // 180일 윈도우 내의 여행만 계산
      const overlapStart = Math.max(entryDate.getTime(), windowStart.getTime())
      const overlapEnd = Math.min(exitDate.getTime(), startDate.getTime())
      
      if (overlapStart <= overlapEnd) {
        const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
        usedDays += days
      }
    })

    // 미래 여행을 포함한 총 사용일수
    const totalDays = usedDays + futureDuration

    setFutureAnalysis({
      startDate: startDate.toLocaleDateString('ko-KR'),
      endDate: endDate.toLocaleDateString('ko-KR'),
      duration: futureDuration,
      currentUsed: usedDays,
      totalAfterTrip: totalDays,
      isAllowed: totalDays <= 90,
      remainingDays: 90 - totalDays,
      recommendation: totalDays > 90 
        ? `⚠️ 위험: 이 여행을 가면 셰겐 규정을 ${totalDays - 90}일 초과하게 됩니다!`
        : totalDays > 80
        ? `⚡ 주의: 여행 후 ${90 - totalDays}일만 남게 됩니다.`
        : `✅ 안전: 여행 후에도 ${90 - totalDays}일의 여유가 있습니다.`
    })
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
              <SchengenUsageChart visits={trips} />
            </div>

            {/* Future Trip Planner */}
            <div className="card">
              <h3 className="card-title mb-5">
                🔮 미래 여행 시뮬레이터
              </h3>
              <p className="text-secondary mb-5">
                계획 중인 셰겐 여행이 규정에 맞는지 미리 확인해보세요
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">
                    여행 시작일
                  </label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={futureDate}
                    onChange={(e) => setFutureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    체류 일수
                  </label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={futureDuration}
                    onChange={(e) => setFutureDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="90"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    방문 국가
                  </label>
                  <select 
                    className="form-input"
                    value={futureCountry}
                    onChange={(e) => setFutureCountry(e.target.value)}
                  >
                    <option value="France">🇫🇷 프랑스</option>
                    <option value="Germany">🇩🇪 독일</option>
                    <option value="Italy">🇮🇹 이탈리아</option>
                    <option value="Spain">🇪🇸 스페인</option>
                    <option value="Netherlands">🇳🇱 네덜란드</option>
                    <option value="Belgium">🇧🇪 벨기에</option>
                    <option value="Austria">🇦🇹 오스트리아</option>
                    <option value="Portugal">🇵🇹 포르투갈</option>
                    <option value="Greece">🇬🇷 그리스</option>
                    <option value="Czech Republic">🇨🇿 체코</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={analyzeFutureTrip}
                className="btn btn-primary mb-5"
                disabled={!futureDate}
                style={{ width: '100%' }}
              >
                🔍 여행 가능 여부 확인
              </button>
              
              {futureAnalysis && (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: futureAnalysis.isAllowed ? 'var(--color-success-light)' : 'var(--color-error-light)',
                  border: `2px solid ${futureAnalysis.isAllowed ? 'var(--color-success)' : 'var(--color-error)'}`
                }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '18px' }}>
                    {futureAnalysis.isAllowed ? '✅ 여행 가능!' : '❌ 여행 불가!'}
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>여행 기간:</span>
                      <strong>{futureAnalysis.startDate} ~ {futureAnalysis.endDate} ({futureAnalysis.duration}일)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>현재 사용일수:</span>
                      <strong>{futureAnalysis.currentUsed}일</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>여행 후 총 사용일수:</span>
                      <strong style={{ color: futureAnalysis.totalAfterTrip > 90 ? 'var(--color-error)' : 'inherit' }}>
                        {futureAnalysis.totalAfterTrip}일 / 90일
                      </strong>
                    </div>
                    
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {futureAnalysis.recommendation}
                    </div>
                  </div>
                </div>
              )}
              
              {!futureAnalysis && (
                <div className="alert" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <p className="text-small text-secondary">
                    💡 팁: 여행 날짜와 기간을 입력하면 셰겐 규정 준수 여부를 미리 확인할 수 있습니다
                  </p>
                </div>
              )}
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