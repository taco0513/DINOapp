'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, lazy, Suspense } from 'react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'
import { t } from '@/lib/i18n'
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading'

// Dynamic imports for better code splitting
const TripForm = lazy(() => import('@/components/trips/TripForm'))
const TripCard = lazy(() => import('@/components/trips/TripCard'))

export default function TripsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<CountryVisit | null>(null)
  const [filter, setFilter] = useState<'all' | 'schengen' | 'current'>('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadTrips()
  }, [session, status, router])

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
          {/* Header */}
          <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="mb-2">
                {t('trips.title')}
              </h1>
              <p className="text-small text-secondary">
                {t('trips.description')}
              </p>
            </div>
            <button 
              onClick={handleAddTrip}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              {t('trips.add')}
            </button>
          </header>

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
            <div className="card text-center" style={{ padding: 'var(--space-16) var(--space-10)' }}>
              <h3 className="mb-2">
                {filter === 'all' ? '여행 기록이 없습니다' :
                 filter === 'schengen' ? '셰겐 지역 여행 기록이 없습니다' :
                 '현재 체류 중인 국가가 없습니다'}
              </h3>
              <p className="text-small text-secondary mb-6">
                {filter === 'all' ? '첫 번째 여행을 추가하여 비자 추적을 시작하세요' :
                 filter === 'schengen' ? '셰겐 지역 여행을 추가하면 90/180일 규칙을 자동으로 계산합니다' :
                 '현재 체류 중인 여행 기록이 없습니다'}
              </p>
              <button 
                onClick={handleAddTrip}
                className="btn btn-primary"
              >
                {filter === 'all' ? '첫 번째 여행 추가하기' : '여행 추가하기'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<HydrationSafeLoading />}>
                {filteredTrips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onEdit={handleEditTrip}
                    onDelete={() => handleDeleteTrip(trip)}
                  />
                ))}
              </Suspense>
            </div>
          )}
        </div>
      </main>

      {/* Trip Form Modal */}
      {showForm && (
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
      )}
    </>
  )
}