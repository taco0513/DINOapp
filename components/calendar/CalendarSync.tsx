'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TravelInfo } from '@/lib/gmail'

interface CalendarInfo {
  id: string
  name: string
  description?: string
  primary: boolean
  accessRole: string
  backgroundColor?: string
  foregroundColor?: string
}

interface SyncResult {
  success: boolean
  created: number
  skipped: number
  errors: string[]
  eventIds: string[]
  message: string
}

interface CalendarSyncProps {
  travelInfos: TravelInfo[]
  onSyncComplete?: (result: SyncResult) => void
}

export default function CalendarSync({ travelInfos, onSyncComplete }: CalendarSyncProps) {
  const { data: session } = useSession()
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('')
  const [selectedTravelInfos, setSelectedTravelInfos] = useState<string[]>([])
  const [preventDuplicates, setPreventDuplicates] = useState(true)
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string>('')
  const [activeView, setActiveView] = useState<'setup' | 'preview'>('setup')

  // 캘린더 목록 로드
  const loadCalendars = async () => {
    if (!session) return

    try {
      setIsLoadingCalendars(true)
      setError('')
      
      const response = await fetch('/api/calendar/calendars')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load calendars')
      }
      
      if (data.success && data.calendars) {
        setCalendars(data.calendars)
        
        // 기본 캘린더 자동 선택
        const primaryCalendar = data.calendars.find((cal: CalendarInfo) => cal.primary)
        if (primaryCalendar) {
          setSelectedCalendarId(primaryCalendar.id)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoadingCalendars(false)
    }
  }

  // 여행 정보 동기화
  const syncToCalendar = async () => {
    if (!session || !selectedCalendarId) return

    const infoToSync = selectedTravelInfos.length > 0 
      ? travelInfos.filter(info => selectedTravelInfos.includes(info.emailId))
      : travelInfos

    if (infoToSync.length === 0) {
      setError('동기화할 여행 정보를 선택해주세요.')
      return
    }

    try {
      setIsSyncing(true)
      setError('')
      setSyncResult(null)
      
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendarId: selectedCalendarId,
          travelInfos: infoToSync,
          preventDuplicates
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to sync to calendar')
      }
      
      setSyncResult(result)
      
      if (onSyncComplete) {
        onSyncComplete(result)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSyncing(false)
    }
  }

  // 여행 정보 선택/해제
  const toggleTravelInfo = (emailId: string) => {
    setSelectedTravelInfos(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedTravelInfos.length === travelInfos.length) {
      setSelectedTravelInfos([])
    } else {
      setSelectedTravelInfos(travelInfos.map(info => info.emailId))
    }
  }

  // 컴포넌트 마운트 시 캘린더 로드
  useEffect(() => {
    if (session) {
      loadCalendars()
    }
  }, [session])

  // 초기 선택 (신뢰도 50% 이상 자동 선택)
  useEffect(() => {
    if (travelInfos.length > 0 && selectedTravelInfos.length === 0) {
      const highConfidenceInfos = travelInfos
        .filter(info => info.confidence >= 0.5)
        .map(info => info.emailId)
      setSelectedTravelInfos(highConfidenceInfos)
    }
  }, [travelInfos])

  if (!session) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">Google Calendar 통합을 사용하려면 먼저 로그인해주세요.</p>
      </div>
    )
  }

  if (travelInfos.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">동기화할 여행 정보가 없습니다. 먼저 Gmail에서 여행 이메일을 분석해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">📅 Google Calendar 동기화</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('setup')}
              className={`px-3 py-1 text-sm rounded ${
                activeView === 'setup'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              설정
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1 text-sm rounded ${
                activeView === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              미리보기
            </button>
          </div>
        </div>

        {activeView === 'setup' && (
          <div className="space-y-6">
            {/* 캘린더 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 캘린더 선택
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">캘린더를 선택해주세요</option>
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name} {calendar.primary && '(기본)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadCalendars}
                  disabled={isLoadingCalendars}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isLoadingCalendars ? '로딩...' : '새로고침'}
                </button>
              </div>
            </div>

            {/* 동기화 옵션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">동기화 옵션</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prevent-duplicates"
                  checked={preventDuplicates}
                  onChange={(e) => setPreventDuplicates(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="prevent-duplicates" className="text-sm text-gray-600">
                  중복 이벤트 방지 (동일한 이메일에서 추출된 이벤트가 이미 있는 경우 건너뛰기)
                </label>
              </div>
            </div>

            {/* 여행 정보 선택 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  동기화할 여행 정보 선택 ({selectedTravelInfos.length}/{travelInfos.length})
                </label>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedTravelInfos.length === travelInfos.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                {travelInfos.map((info) => (
                  <div
                    key={info.emailId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTravelInfos.includes(info.emailId)
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTravelInfo(info.emailId)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTravelInfos.includes(info.emailId)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{info.subject}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            info.confidence >= 0.7
                              ? 'bg-green-100 text-green-800'
                              : info.confidence >= 0.5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(info.confidence * 100)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {info.departureDate && (
                            <div>✈️ 출발: {info.departureDate}</div>
                          )}
                          {info.returnDate && (
                            <div>🏠 귀국: {info.returnDate}</div>
                          )}
                          {info.destination && (
                            <div>📍 목적지: {info.destination}</div>
                          )}
                          {info.hotelName && (
                            <div>🏨 호텔: {info.hotelName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 동기화 버튼 */}
            <button
              onClick={syncToCalendar}
              disabled={isSyncing || !selectedCalendarId || selectedTravelInfos.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                '동기화 중...'
              ) : (
                `🔄 캘린더에 동기화 (${selectedTravelInfos.length}개)`
              )}
            </button>
          </div>
        )}

        {activeView === 'preview' && (
          <div className="space-y-4">
            {selectedTravelInfos.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">생성될 캘린더 이벤트 미리보기</h4>
                {travelInfos
                  .filter(info => selectedTravelInfos.includes(info.emailId))
                  .map((info) => (
                    <div key={info.emailId} className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <h5 className="font-medium">{info.subject}</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {info.departureDate && (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>✈️ {info.destination || '목적지'} 출발 - {info.departureDate}</span>
                          </div>
                        )}
                        {info.returnDate && (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>🏠 {info.departure || '출발지'} 귀국 - {info.returnDate}</span>
                          </div>
                        )}
                        {info.hotelName && info.departureDate && info.returnDate && (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>🏨 {info.hotelName} - {info.departureDate} ~ {info.returnDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📅</div>
                <p>동기화할 여행 정보를 선택해주세요.</p>
              </div>
            )}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        {/* 동기화 결과 */}
        {syncResult && (
          <div className={`mt-4 p-4 border rounded-lg ${
            syncResult.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="space-y-2">
              <p className={`font-medium ${
                syncResult.success ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {syncResult.success ? '✅' : '⚠️'} {syncResult.message}
              </p>
              <div className="text-sm">
                <p>✅ 생성됨: {syncResult.created}개</p>
                {syncResult.skipped > 0 && <p>⏭️ 건너뜀: {syncResult.skipped}개 (중복)</p>}
                {syncResult.errors.length > 0 && (
                  <div>
                    <p className="text-red-600">❌ 오류:</p>
                    <ul className="list-disc list-inside text-red-600 ml-2">
                      {syncResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}