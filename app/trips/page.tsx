'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, lazy, Suspense } from 'react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'
import { PageHeader, PageIcons } from '@/components/common/PageHeader'
import { t } from '@/lib/i18n'
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading'
import { HelpCircle, Plus, Filter } from 'lucide-react'
import { MobileModal } from '@/components/mobile/MobileModal'

// Dynamic imports for better code splitting
const TripForm = lazy(() => import('@/components/trips/TripForm'))
const TripCard = lazy(() => import('@/components/trips/TripCard'))
const MobileTripCard = lazy(() => import('@/components/trips/MobileTripCard'))

export default function TripsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<CountryVisit | null>(null)
  const [filter, setFilter] = useState<'all' | 'schengen' | 'current'>('all')
  const [showHelp, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadTrips()
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

  const loadTrips = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getTrips()
      if (response.success && response.data) {
        setTrips(response.data)
      } else {
        console.error('Failed to load trips:', response.error)
      }
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTrip = () => {
    setEditingTrip(null)
    setShowForm(true)
  }

  const handleEditTrip = (trip: CountryVisit) => {
    setEditingTrip(trip)
    setShowForm(true)
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingTrip(null)
    // Force reload trips after successful creation/update
    await loadTrips()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTrip(null)
  }

  const handleDeleteTrip = async (trip: CountryVisit) => {
    if (window.confirm('이 여행 기록을 삭제하시겠습니까?')) {
      try {
        await ApiClient.deleteTrip(trip.id!)
        loadTrips()
      } catch (error) {
        // Error deleting trip
      }
    }
  }

  const getFilteredTrips = () => {
    const schengenCountries = [
      'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
      'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
      'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
      'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
    ]

    switch (filter) {
      case 'schengen':
        return trips.filter(trip => schengenCountries.includes(trip.country))
      case 'current':
        return trips.filter(trip => !trip.exitDate)
      default:
        return trips
    }
  }

  if (status === 'loading' || !session) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <HydrationSafeLoading />
      </main>
    )
  }

  const filteredTrips = getFilteredTrips()

  return (
    <>
      <main style={{ minHeight: '100vh' }}>
        <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
          <PageHeader
            title={t('trips.title')}
            description={t('trips.description')}
            icon={PageIcons.Trips}
            showHelp={trips.length > 0}
            onHelpClick={() => setShowHelp(!showHelp)}
            breadcrumbs={[
              { label: t('nav.dashboard'), href: '/dashboard' },
              { label: t('nav.trips') }
            ]}
            action={
              <button 
                onClick={handleAddTrip}
                className="btn btn-primary"
                style={{ flexShrink: 0 }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('trips.add')}
              </button>
            }
          />

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex" style={{ gap: '0', border: '1px solid var(--color-border-strong)', width: 'fit-content' }}>
              <button
                onClick={() => setFilter('all')}
                className="btn btn-ghost"
                style={{
                  borderRadius: '0',
                  borderRight: '1px solid var(--color-border-strong)',
                  backgroundColor: filter === 'all' ? 'var(--color-surface)' : 'transparent'
                }}
              >
                전체 ({trips.length})
              </button>
              <button
                onClick={() => setFilter('schengen')}
                className="btn btn-ghost"
                style={{
                  borderRadius: '0',
                  borderRight: '1px solid var(--color-border-strong)',
                  backgroundColor: filter === 'schengen' ? 'var(--color-surface)' : 'transparent'
                }}
              >
                셰겐 ({trips.filter(t => {
                  const schengenCountries = [
                    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
                    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
                    'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
                    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
                  ]
                  return schengenCountries.includes(t.country)
                }).length})
              </button>
              <button
                onClick={() => setFilter('current')}
                className="btn btn-ghost"
                style={{
                  borderRadius: '0',
                  backgroundColor: filter === 'current' ? 'var(--color-surface)' : 'transparent'
                }}
              >
                현재 체류 중 ({trips.filter(t => !t.exitDate).length})
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center" style={{ padding: 'var(--space-16) var(--space-5)' }}>
              <HydrationSafeLoading fallback="Loading trips..." className="loading" translationKey="trips.loading" />
            </div>
          ) : filteredTrips.length === 0 ? (
            <div>
              {/* 빈 상태 카드 */}
              <div className="card text-center" style={{ padding: 'var(--space-16) var(--space-10)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>
                  {filter === 'all' ? '✈️' :
                   filter === 'schengen' ? '🇪🇺' :
                   '🌍'}
                </div>
                <h3 className="mb-2">
                  {filter === 'all' ? '여행 기록이 없습니다' :
                   filter === 'schengen' ? '셰겐 지역 여행 기록이 없습니다' :
                   '현재 체류 중인 국가가 없습니다'}
                </h3>
                <p className="text-secondary mb-6">
                  {filter === 'all' ? '첫 번째 여행을 추가하여 비자 추적을 시작하세요' :
                   filter === 'schengen' ? '셰겐 지역 여행을 추가하면 90/180일 규칙을 자동으로 계산합니다' :
                   '현재 체류 중인 여행 기록이 없습니다'}
                </p>
                <button 
                  onClick={handleAddTrip}
                  className="btn btn-primary"
                  style={{ minWidth: '200px' }}
                >
                  {filter === 'all' ? '첫 번째 여행 추가하기' : '여행 추가하기'}
                </button>
              </div>

              {/* 가이드 콘텐츠 */}
              {filter === 'all' && (
                <div className="mt-10">
                  <h3 className="text-center mb-6" style={{ fontSize: '20px', fontWeight: '600' }}>
                    📚 DINOapp으로 여행 기록 관리하기
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card" style={{ padding: 'var(--space-8)' }}>
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                          <span style={{ fontSize: '20px' }}>1️⃣</span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2 text-center">간편한 기록</h4>
                      <p className="text-sm text-secondary text-center">
                        국가, 입출국 날짜, 비자 정보만 입력하면 
                        자동으로 체류 일수가 계산됩니다
                      </p>
                    </div>
                    
                    <div className="card" style={{ padding: 'var(--space-8)' }}>
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--color-success-light)' }}>
                          <span style={{ fontSize: '20px' }}>2️⃣</span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2 text-center">자동 분석</h4>
                      <p className="text-sm text-secondary text-center">
                        셰겐 90/180일 규칙을 자동으로 계산하고 
                        오버스테이 위험을 미리 알려드립니다
                      </p>
                    </div>
                    
                    <div className="card" style={{ padding: 'var(--space-8)' }}>
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--color-warning-light)' }}>
                          <span style={{ fontSize: '20px' }}>3️⃣</span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2 text-center">스마트 알림</h4>
                      <p className="text-sm text-secondary text-center">
                        비자 만료일이 다가오면 자동으로 알림을 보내 
                        법적 문제를 예방합니다
                      </p>
                    </div>
                  </div>

                  {/* FAQ 섹션 */}
                  <div className="card" style={{ padding: 'var(--space-10)' }}>
                    <h4 className="mb-6" style={{ fontSize: '18px', fontWeight: '600' }}>
                      💡 자주 묻는 질문
                    </h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-medium mb-2">Q: 과거 여행도 기록해야 하나요?</h5>
                        <p className="text-sm text-secondary">
                          A: 셰겐 지역은 최근 180일 이내의 여행만 기록하면 됩니다. 
                          다른 국가는 비자 유효기간 내의 여행을 기록하시면 좋습니다.
                        </p>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
                        <h5 className="font-medium mb-2">Q: 여러 국가를 연속으로 방문한 경우 어떻게 기록하나요?</h5>
                        <p className="text-sm text-secondary">
                          A: 각 국가별로 별도의 여행 기록을 만들어주세요. 
                          DINOapp이 자동으로 연속된 여행을 분석해드립니다.
                        </p>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
                        <h5 className="font-medium mb-2">Q: 현재 체류 중인 국가는 어떻게 표시하나요?</h5>
                        <p className="text-sm text-secondary">
                          A: 출국 날짜를 비워두시면 현재 체류 중으로 표시됩니다. 
                          출국하실 때 날짜를 업데이트해주세요.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 프로 팁 */}
                  <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
                    <div className="flex items-start gap-4">
                      <div style={{ fontSize: '24px' }}>💎</div>
                      <div>
                        <h4 className="font-semibold mb-2">프로 팁: Gmail 연동으로 자동화하기</h4>
                        <p className="text-sm mb-3">
                          Gmail을 연동하면 항공권 이메일을 자동으로 분석해서 여행 기록을 생성합니다. 
                          수동 입력 시간을 90% 이상 절약할 수 있어요!
                        </p>
                        <a href="/settings" className="btn btn-sm btn-outline">
                          Gmail 연동하기 →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* 도움말 섹션 - 토글 가능 */}
              {showHelp && (
                <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                      📚 여행 기록 관리 가이드
                    </h3>
                    <button 
                      onClick={() => setShowHelp(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">📝 여행 기록 수정</h4>
                      <p className="text-xs text-secondary">
                        카드의 수정 버튼을 클릭하여 날짜나 비자 정보를 업데이트할 수 있습니다.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">🏷️ 필터 활용</h4>
                      <p className="text-xs text-secondary">
                        셰겐 지역만 보기, 현재 체류 중인 국가만 보기 등 필터를 활용하세요.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">📊 통계 확인</h4>
                      <p className="text-xs text-secondary">
                        대시보드에서 전체 여행 통계와 셰겐 사용 현황을 확인할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '16px' }}>💡</span>
                      <p className="text-sm text-secondary">
                        <strong>팁:</strong> Gmail을 연동하면 항공권 이메일에서 여행 정보를 자동으로 추출합니다.
                        <a href="/settings" className="ml-2 text-primary hover:underline">연동하기 →</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 여행 기록 그리드 */}
              <div className={isMobile ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                <Suspense fallback={<HydrationSafeLoading />}>
                  {filteredTrips.map(trip => (
                    isMobile ? (
                      <MobileTripCard
                        key={trip.id}
                        trip={trip}
                        onEdit={handleEditTrip}
                        onDelete={() => loadTrips()}
                      />
                    ) : (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onEdit={handleEditTrip}
                        onDelete={() => handleDeleteTrip(trip)}
                      />
                    )
                  ))}
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Trip Form Modal */}
      {showForm && (
        isMobile ? (
          <MobileModal
            isOpen={showForm}
            onClose={handleFormCancel}
            title={editingTrip ? '여행 수정' : '새 여행 추가'}
          >
            <Suspense fallback={<HydrationSafeLoading />}>
              <TripForm
                trip={editingTrip || undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </Suspense>
          </MobileModal>
        ) : (
          <Suspense fallback={
            <div style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)' 
            }}>
              <div className="card">
                <HydrationSafeLoading />
              </div>
            </div>
          }>
            <TripForm
              trip={editingTrip || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Suspense>
        )
      )}
    </>
  )
}