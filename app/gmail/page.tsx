'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { StandardPageLayout } from '@/components/layout/StandardPageLayout'
import { t } from '@/lib/i18n'

import { logger } from '@/lib/logger'

interface EmailPattern {
  id: string
  name: string
  description: string
  patterns: string[]
  icon: string
  enabled: boolean
}

interface ExtractedTrip {
  id: string
  type: 'flight' | 'hotel' | 'car' | 'activity'
  title: string
  provider: string
  bookingRef: string
  startDate: string
  endDate?: string
  location: string
  details: any
  emailId: string
  emailDate: string
  status: 'pending' | 'imported' | 'ignored'
}

export default function GmailIntegrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [extractedTrips, setExtractedTrips] = useState<ExtractedTrip[]>([])
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set())
  const [emailPatterns, setEmailPatterns] = useState<EmailPattern[]>([
    {
      id: 'flight',
      name: '항공편',
      description: '항공사 예약 확인 이메일',
      patterns: ['flight confirmation', 'booking reference', 'e-ticket'],
      icon: '✈️',
      enabled: true
    },
    {
      id: 'hotel',
      name: '호텔',
      description: '호텔 예약 확인 이메일',
      patterns: ['hotel reservation', 'accommodation', 'check-in'],
      icon: '🏨',
      enabled: true
    },
    {
      id: 'car',
      name: '렌터카',
      description: '렌터카 예약 확인 이메일',
      patterns: ['car rental', 'vehicle reservation', 'pickup location'],
      icon: '🚗',
      enabled: true
    },
    {
      id: 'activity',
      name: '액티비티',
      description: '투어, 액티비티 예약 확인',
      patterns: ['tour booking', 'activity confirmation', 'experience'],
      icon: '🎫',
      enabled: true
    }
  ])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 로컬 스토리지에서 연결 상태 확인
  useEffect(() => {
    const gmailConnected = localStorage.getItem('dino-gmail-connected')
    if (gmailConnected === 'true') {
      setIsConnected(true)
      // 저장된 추출 데이터 로드
      const saved = localStorage.getItem('dino-extracted-trips')
      if (saved) {
        setExtractedTrips(JSON.parse(saved))
      }
    }
  }, [])

  const handleConnect = async () => {
    try {
      // Gmail OAuth 연결 시뮬레이션
      const mockAuth = await new Promise(resolve => {
        setTimeout(() => resolve(true), 1500)
      })
      
      if (mockAuth) {
        setIsConnected(true)
        localStorage.setItem('dino-gmail-connected', 'true')
      }
    } catch (error) {
      logger.error('Gmail 연결 실패:', error)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    localStorage.removeItem('dino-gmail-connected')
    localStorage.removeItem('dino-extracted-trips')
    setExtractedTrips([])
  }

  const handleScan = async () => {
    setIsScanning(true)
    setScanProgress(0)
    
    // 이메일 스캔 시뮬레이션
    const mockTrips: ExtractedTrip[] = [
      {
        id: '1',
        type: 'flight',
        title: '서울 → 방콕 항공편',
        provider: '대한항공',
        bookingRef: 'KE653-ABC123',
        startDate: '2024-02-15',
        location: 'Bangkok, Thailand',
        details: {
          departure: 'ICN 10:30',
          arrival: 'BKK 14:25',
          flightNumber: 'KE653',
          class: 'Economy'
        },
        emailId: 'email-1',
        emailDate: '2024-01-20',
        status: 'pending'
      },
      {
        id: '2',
        type: 'hotel',
        title: 'Marriott Bangkok Sukhumvit',
        provider: 'Booking.com',
        bookingRef: '2024021534567',
        startDate: '2024-02-15',
        endDate: '2024-02-20',
        location: 'Bangkok, Thailand',
        details: {
          roomType: 'Deluxe King',
          guests: 2,
          nights: 5,
          address: '2 Sukhumvit Soi 57'
        },
        emailId: 'email-2',
        emailDate: '2024-01-22',
        status: 'pending'
      },
      {
        id: '3',
        type: 'flight',
        title: '방콕 → 푸켓 항공편',
        provider: 'Thai Airways',
        bookingRef: 'TG205-XYZ789',
        startDate: '2024-02-20',
        location: 'Phuket, Thailand',
        details: {
          departure: 'BKK 15:30',
          arrival: 'HKT 16:55',
          flightNumber: 'TG205'
        },
        emailId: 'email-3',
        emailDate: '2024-01-25',
        status: 'pending'
      },
      {
        id: '4',
        type: 'activity',
        title: '피피 아일랜드 당일 투어',
        provider: 'Viator',
        bookingRef: 'VTR-2024-98765',
        startDate: '2024-02-22',
        location: 'Phuket, Thailand',
        details: {
          pickup: '08:00 호텔 로비',
          duration: '8시간',
          includes: '점심, 스노클링 장비'
        },
        emailId: 'email-4',
        emailDate: '2024-02-01',
        status: 'pending'
      }
    ]
    
    // 프로그레스 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      setScanProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setExtractedTrips(mockTrips)
    localStorage.setItem('dino-extracted-trips', JSON.stringify(mockTrips))
    setIsScanning(false)
  }

  const handleTogglePattern = (patternId: string) => {
    setEmailPatterns(patterns =>
      patterns.map(p =>
        p.id === patternId ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  const handleSelectTrip = (tripId: string) => {
    setSelectedTrips(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tripId)) {
        newSet.delete(tripId)
      } else {
        newSet.add(tripId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedTrips.size === extractedTrips.filter(t => t.status === 'pending').length) {
      setSelectedTrips(new Set())
    } else {
      setSelectedTrips(new Set(extractedTrips.filter(t => t.status === 'pending').map(t => t.id)))
    }
  }

  const handleImportSelected = async () => {
    // 선택된 여행 가져오기
    const tripsToImport = extractedTrips.filter(t => selectedTrips.has(t.id))
    
    // 여행 기록에 추가 (시뮬레이션)
    logger.debug('Importing trips:', tripsToImport)
    
    // 상태 업데이트
    setExtractedTrips(trips =>
      trips.map(t =>
        selectedTrips.has(t.id) ? { ...t, status: 'imported' as const } : t
      )
    )
    
    // 선택 초기화
    setSelectedTrips(new Set())
    
    // 성공 메시지
    alert(`${tripsToImport.length}개의 여행 기록을 가져왔습니다!`)
  }

  const handleIgnoreSelected = () => {
    setExtractedTrips(trips =>
      trips.map(t =>
        selectedTrips.has(t.id) ? { ...t, status: 'ignored' as const } : t
      )
    )
    setSelectedTrips(new Set())
  }

  const pendingTrips = extractedTrips.filter(t => t.status === 'pending')
  const importedTrips = extractedTrips.filter(t => t.status === 'imported')

  return (
    <StandardPageLayout
      title="Gmail 연동"
      description="이메일에서 여행 예약 정보를 자동으로 추출합니다"
      icon="Gmail"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.gmail') }
      ]}
    >

        {/* 연결 상태 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isConnected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Gmail 계정
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isConnected 
                    ? `${session?.user?.email || 'user@gmail.com'}과 연결됨`
                    : 'Gmail 계정을 연결하여 예약 확인 이메일을 자동으로 가져오세요'
                  }
                </p>
                {isConnected && (
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>마지막 스캔: 2시간 전</span>
                    <span>•</span>
                    <span>발견된 예약: {extractedTrips.length}개</span>
                  </div>
                )}
              </div>
            </div>
            
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                연결 해제
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Gmail 연결
              </button>
            )}
          </div>
        </div>

        {isConnected && (
          <>
            {/* 이메일 패턴 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                스캔할 이메일 유형
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailPatterns.map(pattern => (
                  <label
                    key={pattern.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pattern.enabled}
                      onChange={() => handleTogglePattern(pattern.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{pattern.icon}</span>
                        <span className="font-medium text-gray-900">{pattern.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                onClick={handleScan}
                disabled={isScanning || !emailPatterns.some(p => p.enabled)}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? '스캔 중...' : '이메일 스캔 시작'}
              </button>
              
              {isScanning && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>스캔 진행률</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 추출된 여행 목록 */}
            {pendingTrips.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    발견된 예약 ({pendingTrips.length}개)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedTrips.size === pendingTrips.length ? '선택 해제' : '모두 선택'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {pendingTrips.map(trip => (
                    <label
                      key={trip.id}
                      className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTrips.has(trip.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedTrips.has(trip.id)}
                          onChange={() => handleSelectTrip(trip.id)}
                          className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">
                                  {trip.type === 'flight' && '✈️'}
                                  {trip.type === 'hotel' && '🏨'}
                                  {trip.type === 'car' && '🚗'}
                                  {trip.type === 'activity' && '🎫'}
                                </span>
                                <h4 className="font-semibold text-gray-900">{trip.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {trip.provider} • 예약번호: {trip.bookingRef}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(trip.startDate).toLocaleDateString('ko-KR')}
                                {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString('ko-KR')}`}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {trip.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                이메일 날짜
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(trip.emailDate).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedTrips.size > 0 && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleIgnoreSelected}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      무시하기 ({selectedTrips.size}개)
                    </button>
                    <button
                      onClick={handleImportSelected}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      가져오기 ({selectedTrips.size}개)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 가져온 예약 */}
            {importedTrips.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  가져온 예약 ({importedTrips.length}개)
                </h3>
                <div className="space-y-2">
                  {importedTrips.map(trip => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {trip.type === 'flight' && '✈️'}
                          {trip.type === 'hotel' && '🏨'}
                          {trip.type === 'car' && '🚗'}
                          {trip.type === 'activity' && '🎫'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{trip.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(trip.startDate).toLocaleDateString('ko-KR')} • {trip.location}
                          </p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
    </StandardPageLayout>
  )
}