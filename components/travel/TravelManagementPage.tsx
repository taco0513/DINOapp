'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { TravelInsightsDashboard } from './TravelInsightsDashboard'
import { EnhancedTripForm } from './EnhancedTripForm'
import { CountryVisit } from '@/types/database'
import { getCountryByName } from '@/data/countries'

interface TravelManagementPageProps {
  className?: string
}

export function TravelManagementPage({ className }: TravelManagementPageProps) {
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<CountryVisit | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing' | 'planned'>('all')
  const [sortBy, setSortBy] = useState<'entryDate' | 'createdAt' | 'country'>('entryDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchTrips()
  }, [statusFilter, sortBy, sortOrder])

  const fetchTrips = async () => {
    try {
      const params = new URLSearchParams({
        includeCompleted: statusFilter === 'all' || statusFilter === 'completed' ? 'true' : 'false',
        includeOngoing: statusFilter === 'all' || statusFilter === 'ongoing' ? 'true' : 'false',
        includePlanned: statusFilter === 'all' || statusFilter === 'planned' ? 'true' : 'false',
        sortBy,
        sortOrder,
        limit: '100'
      })

      const response = await fetch(`/api/trips?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTrips(data.data)
      } else {
        setError('Failed to load trips')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTrip = async (tripData: any) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      })

      const data = await response.json()
      if (data.success) {
        setTrips(prev => [data.data, ...prev])
        setShowAddForm(false)
        // Refresh insights by switching tabs
        if (activeTab === 'insights') {
          window.location.reload()
        }
      } else {
        console.error('Failed to add trip:', data.message || 'Unknown error')
      }
    } catch (error) {
      console.error('Network error occurred')
    }
  }

  const handleUpdateTrip = async (tripData: any) => {
    if (!editingTrip) return

    try {
      const response = await fetch(`/api/trips/${editingTrip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      })

      const data = await response.json()
      if (data.success) {
        setTrips(prev => prev.map(trip => 
          trip.id === editingTrip.id ? data.data : trip
        ))
        setEditingTrip(null)
      } else {
        console.error('Failed to update trip:', data.message || 'Unknown error')
      }
    } catch (error) {
      console.error('Network error occurred')
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('정말 이 여행 기록을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setTrips(prev => prev.filter(trip => trip.id !== tripId))
      } else {
        console.error('Failed to delete trip')
      }
    } catch (error) {
      console.error('Network error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">완료</Badge>
      case 'ongoing':
        return <Badge variant="destructive">진행 중</Badge>
      case 'planned':
        return <Badge variant="secondary">계획됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCountryFlag = (countryName: string) => {
    const country = getCountryByName(countryName)
    return country?.flag || '🌍'
  }

  const calculateDuration = (entry: string, exit: string | null) => {
    if (!exit) return '진행 중'
    const entryDate = new Date(entry)
    const exitDate = new Date(exit)
    const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return `${days}일`
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">여행 관리</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + 새 여행 추가
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">여행 목록</TabsTrigger>
          <TabsTrigger value="insights">여행 분석</TabsTrigger>
          <TabsTrigger value="planning">여행 계획</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 필터 및 정렬 */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium mr-2">상태:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">전체</option>
                  <option value="completed">완료됨</option>
                  <option value="ongoing">진행 중</option>
                  <option value="planned">계획됨</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mr-2">정렬:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded px-2 py-1 mr-2"
                >
                  <option value="entryDate">입국일</option>
                  <option value="createdAt">생성일</option>
                  <option value="country">국가</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="border rounded px-2 py-1"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">올림차순</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 여행 목록 */}
          {error ? (
            <div className="text-center p-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchTrips} className="mt-4">
                다시 시도
              </Button>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-600">아직 여행 기록이 없습니다.</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                첫 여행 추가하기
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getCountryFlag(trip.country)}</span>
                        <h3 className="text-lg font-semibold">{trip.country}</h3>
                        {getStatusBadge(trip.status)}
                        {trip.isEmergency && (
                          <Badge variant="destructive">긴급</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">입국일:</span>
                          <p className="font-medium">
                            {new Date(trip.entryDate).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">출국일:</span>
                          <p className="font-medium">
                            {trip.exitDate 
                              ? new Date(trip.exitDate).toLocaleDateString('ko-KR')
                              : '진행 중'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">체류 기간:</span>
                          <p className="font-medium">
                            {calculateDuration(
                              typeof trip.entryDate === 'string' ? trip.entryDate : trip.entryDate.toISOString(),
                              trip.exitDate ? (typeof trip.exitDate === 'string' ? trip.exitDate : trip.exitDate.toISOString()) : null
                            )}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">비자 유형:</span>
                          <p className="font-medium">{trip.visaType}</p>
                        </div>
                      </div>

                      {(trip.purpose || trip.accommodation || trip.cost) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t">
                          {trip.purpose && (
                            <div>
                              <span className="text-gray-600">목적:</span>
                              <p className="font-medium">{trip.purpose}</p>
                            </div>
                          )}
                          {trip.accommodation && (
                            <div>
                              <span className="text-gray-600">숙박:</span>
                              <p className="font-medium">{trip.accommodation}</p>
                            </div>
                          )}
                          {trip.cost && (
                            <div>
                              <span className="text-gray-600">비용:</span>
                              <p className="font-medium">${trip.cost.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {trip.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-gray-600 text-sm">메모:</span>
                          <p className="text-sm mt-1">{trip.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTrip(trip)}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTrip(trip.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <TravelInsightsDashboard />
        </TabsContent>

        <TabsContent value="planning">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">여행 계획 도구</h3>
            <p className="text-gray-600">
              곧 여행 계획을 도와주는 도구들이 추가될 예정입니다.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>• 셰겐 규정 체크</li>
              <li>• 비자 요구사항 확인</li>
              <li>• 최적 여행 일정 추천</li>
              <li>• 여행 경보 알림</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 새 여행 추가 모달 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">새 여행 추가</h2>
              <EnhancedTripForm
                onSubmit={handleAddTrip}
                onCancel={() => setShowAddForm(false)}
                submitLabel="여행 추가"
              />
            </div>
          </div>
        </div>
      )}

      {/* 여행 수정 모달 */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">여행 수정</h2>
              <EnhancedTripForm
                initialData={{
                  country: editingTrip.country,
                  entryDate: new Date(editingTrip.entryDate).toISOString().split('T')[0],
                  exitDate: editingTrip.exitDate ? new Date(editingTrip.exitDate).toISOString().split('T')[0] : '',
                  visaType: editingTrip.visaType,
                  maxDays: editingTrip.maxDays,
                  passportCountry: editingTrip.passportCountry,
                  notes: editingTrip.notes || '',
                  status: editingTrip.status as any,
                  purpose: (editingTrip as any).purpose || '',
                  accommodation: (editingTrip as any).accommodation || '',
                  cost: (editingTrip as any).cost || '',
                  isEmergency: (editingTrip as any).isEmergency || false
                }}
                onSubmit={handleUpdateTrip}
                onCancel={() => setEditingTrip(null)}
                submitLabel="변경 사항 저장"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}