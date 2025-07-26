'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, lazy, Suspense } from 'react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

// Dynamic imports for better code splitting
const WireframeTripForm = lazy(() => import('@/components/WireframeTripForm'))
const WireframeTripCard = lazy(() => import('@/components/WireframeTripCard'))

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

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTrip(null)
    loadTrips()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTrip(null)
  }

  const handleDeleteTrip = async (trip: CountryVisit) => {
    if (confirm('이 여행 기록을 삭제하시겠습니까?')) {
      try {
        await ApiClient.deleteTrip(trip.id!)
        loadTrips()
      } catch (error) {
        console.error('Error deleting trip:', error)
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  const filteredTrips = getFilteredTrips()

  return (
    <>
      <main style={{ 
        minHeight: '100vh', 
        padding: '20px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                여행 기록
              </h1>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                여행 기록을 추가하고 관리하세요
              </p>
            </div>
            <button 
              onClick={handleAddTrip}
              style={{
                padding: '8px 20px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              새 여행 추가
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '0', border: '1px solid #e0e0e0', width: 'fit-content' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: filter === 'all' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  color: '#000',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                전체 ({trips.length})
              </button>
              <button
                onClick={() => setFilter('schengen')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: filter === 'schengen' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  color: '#000',
                  fontSize: '14px',
                  cursor: 'pointer'
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
                style={{
                  padding: '10px 20px',
                  backgroundColor: filter === 'current' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  color: '#000',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                현재 체류 중 ({trips.filter(t => !t.exitDate).length})
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>여행 기록을 불러오는 중...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div style={{ border: '1px solid #e0e0e0', padding: '60px 40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '10px' }}>
                {filter === 'all' ? '여행 기록이 없습니다' :
                 filter === 'schengen' ? '셰겐 지역 여행 기록이 없습니다' :
                 '현재 체류 중인 국가가 없습니다'}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
                {filter === 'all' ? '첫 번째 여행을 추가하여 비자 추적을 시작하세요' :
                 filter === 'schengen' ? '셰겐 지역 여행을 추가하면 90/180일 규칙을 자동으로 계산합니다' :
                 '현재 체류 중인 여행 기록이 없습니다'}
              </p>
              <button 
                onClick={handleAddTrip}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {filter === 'all' ? '첫 번째 여행 추가하기' : '여행 추가하기'}
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              <Suspense fallback={<div style={{ padding: '20px', fontSize: '14px', color: '#666' }}>Loading trips...</div>}>
                {filteredTrips.map(trip => (
                  <WireframeTripCard
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
        <Suspense fallback={<div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>Loading form...</div>}>
          <WireframeTripForm
            trip={editingTrip || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Suspense>
      )}
    </>
  )
}