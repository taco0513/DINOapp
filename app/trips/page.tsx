'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TripForm from '@/components/trips/TripForm'
import TripCard from '@/components/trips/TripCard'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

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
      router.push('/auth/signin' as any)
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

  const handleDeleteTrip = () => {
    loadTrips()
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
    return null
  }

  const filteredTrips = getFilteredTrips()

  return (
    <>
      <Container className="py-8">
        <PageHeader
          title="여행 기록"
          description="여행 기록을 추가하고 관리하세요"
          action={
            <button 
              onClick={handleAddTrip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              새 여행 추가
            </button>
          }
        />

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              전체 ({trips.length})
            </button>
            <button
              onClick={() => setFilter('schengen')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'schengen'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'current'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              현재 체류 중 ({trips.filter(t => !t.exitDate).length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">여행 기록을 불러오는 중...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {filter === 'all' ? '🗺️' : filter === 'schengen' ? '🇪🇺' : '✈️'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? '여행 기록이 없습니다' :
                 filter === 'schengen' ? '셰겐 지역 여행 기록이 없습니다' :
                 '현재 체류 중인 국가가 없습니다'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' ? '첫 번째 여행을 추가하여 비자 추적을 시작하세요' :
                 filter === 'schengen' ? '셰겐 지역 여행을 추가하면 90/180일 규칙을 자동으로 계산합니다' :
                 '현재 체류 중인 여행 기록이 없습니다'}
              </p>
              <button 
                onClick={handleAddTrip}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {filter === 'all' ? '첫 번째 여행 추가하기' : '여행 추가하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={handleEditTrip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        )}
      </Container>

      {/* Trip Form Modal */}
      {showForm && (
        <TripForm
          trip={editingTrip || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </>
  )
}