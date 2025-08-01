'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, lazy, Suspense } from 'react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'
import { logger } from '@/lib/logger'

// import { PageHeader, PageIcons } from '@/components/common/PageHeader'
import { t } from '@/lib/i18n'
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading'
import { HelpCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileModal } from '@/components/mobile/MobileModal'
import { StandardPageLayout, StandardCard, EmptyState, LoadingCard } from '@/components/layout/StandardPageLayout'

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
        logger.error('Failed to load trips:', response.error)
      }
    } catch (error) {
      logger.error('Error loading trips:', error)
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
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <HydrationSafeLoading />
      </div>
    )
  }

  const filteredTrips = getFilteredTrips()

  return (
    <>
      <StandardPageLayout
        title={t('trips.title')}
        description={t('trips.description')}
        icon="Trips"
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/dashboard' },
          { label: t('nav.trips') }
        ]}
        headerActions={
          <div className='flex items-center gap-3'>
            {trips.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={handleAddTrip}>
              <Plus className="h-4 w-4 mr-2" />
              {t('trips.add')}
            </Button>
          </div>
        }
      >

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            전체 ({trips.length})
          </Button>
          <Button
            onClick={() => setFilter('schengen')}
            variant={filter === 'schengen' ? 'default' : 'outline'}
            size="sm"
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
          </Button>
          <Button
            onClick={() => setFilter('current')}
            variant={filter === 'current' ? 'default' : 'outline'}
            size="sm"
          >
            현재 체류 중 ({trips.filter(t => !t.exitDate).length})
          </Button>
        </div>

        {/* Content */}
        <div>
        {loading ? (
          <LoadingCard>
            <HydrationSafeLoading fallback="Loading trips..." translationKey="trips.loading" />
          </LoadingCard>
        ) : filteredTrips.length === 0 ? (
          <div>
            <EmptyState
              icon={filter === 'all' ? '✈️' : filter === 'schengen' ? '🇪🇺' : '🌍'}
              title={
                filter === 'all' ? '여행 기록이 없습니다' :
                filter === 'schengen' ? '셰겐 지역 여행 기록이 없습니다' :
                '현재 체류 중인 국가가 없습니다'
              }
              description={
                filter === 'all' ? '첫 번째 여행을 추가하여 비자 추적을 시작하세요' :
                filter === 'schengen' ? '셰겐 지역 여행을 추가하면 90/180일 규칙을 자동으로 계산합니다' :
                '현재 체류 중인 여행 기록이 없습니다'
              }
              action={
                <Button onClick={handleAddTrip} className="min-w-[200px]">
                  {filter === 'all' ? '첫 번째 여행 추가하기' : '여행 추가하기'}
                </Button>
              }
            >

            {/* 가이드 콘텐츠 */}
            {filter === 'all' && (
              <StandardCard title="📚 DINOapp으로 여행 기록 관리하기" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                        <span className="text-xl">1️⃣</span>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2 text-center">간편한 기록</h4>
                    <p className="text-sm text-gray-600 text-center">
                      국가, 입출국 날짜, 비자 정보만 입력하면 
                      자동으로 체류 일수가 계산됩니다
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <span className="text-xl">2️⃣</span>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2 text-center">자동 분석</h4>
                    <p className="text-sm text-gray-600 text-center">
                      셰겐 90/180일 규칙을 자동으로 계산하고 
                      오버스테이 위험을 미리 알려드립니다
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                        <span className="text-xl">3️⃣</span>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2 text-center">스마트 알림</h4>
                    <p className="text-sm text-gray-600 text-center">
                      비자 만료일이 다가오면 자동으로 알림을 보내 
                      법적 문제를 예방합니다
                    </p>
                  </div>
                  </div>

                {/* FAQ 섹션 */}
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
                  <h4 className="text-lg font-semibold mb-6">
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
                      
                      <div className="pt-5 border-t border-gray-200">
                        <h5 className="font-medium mb-2">Q: 여러 국가를 연속으로 방문한 경우 어떻게 기록하나요?</h5>
                        <p className="text-sm text-gray-600">
                          A: 각 국가별로 별도의 여행 기록을 만들어주세요. 
                          DINOapp이 자동으로 연속된 여행을 분석해드립니다.
                        </p>
                      </div>
                      
                      <div className="pt-5 border-t border-gray-200">
                        <h5 className="font-medium mb-2">Q: 현재 체류 중인 국가는 어떻게 표시하나요?</h5>
                        <p className="text-sm text-gray-600">
                          A: 출국 날짜를 비워두시면 현재 체류 중으로 표시됩니다. 
                          출국하실 때 날짜를 업데이트해주세요.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 프로 팁 */}
                  <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">💎</div>
                      <div>
                        <h4 className="font-semibold mb-2">프로 팁: Gmail 연동으로 자동화하기</h4>
                        <p className="text-sm mb-3">
                          Gmail을 연동하면 항공권 이메일을 자동으로 분석해서 여행 기록을 생성합니다. 
                          수동 입력 시간을 90% 이상 절약할 수 있어요!
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/settings">
                            Gmail 연동하기 →
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </StandardCard>
              )}
            </EmptyState>
          </div>
          ) : (
            <div>
              {/* 도움말 섹션 - 토글 가능 */}
              {showHelp && (
                <div className="mb-8 p-6 rounded-lg bg-white border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      📚 여행 기록 관리 가이드
                    </h3>
                    <Button 
                      onClick={() => setShowHelp(false)}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">📝 여행 기록 수정</h4>
                      <p className="text-xs text-gray-600">
                        카드의 수정 버튼을 클릭하여 날짜나 비자 정보를 업데이트할 수 있습니다.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">🏷️ 필터 활용</h4>
                      <p className="text-xs text-gray-600">
                        셰겐 지역만 보기, 현재 체류 중인 국가만 보기 등 필터를 활용하세요.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">📊 통계 확인</h4>
                      <p className="text-xs text-gray-600">
                        대시보드에서 전체 여행 통계와 셰겐 사용 현황을 확인할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💡</span>
                      <p className="text-sm text-gray-600">
                        <strong>팁:</strong> Gmail을 연동하면 항공권 이메일에서 여행 정보를 자동으로 추출합니다.
                        <a href="/settings" className="ml-2 text-blue-600 hover:underline">연동하기 →</a>
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
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
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
      </StandardPageLayout>
    </>
  )
}