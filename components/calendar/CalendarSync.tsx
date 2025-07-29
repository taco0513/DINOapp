'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
// Remove shadcn/ui imports - using minimal design system
import { 
  Calendar, 
  Settings, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle,
  RotateCcw,
  Eye,
  Clock,
  MapPin,
  Plane,
  Hotel,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
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

interface SyncProgress {
  currentStep: string
  progress: number
  processedCount: number
  totalCount: number
}

export default function CalendarSync({ travelInfos, onSyncComplete }: CalendarSyncProps) {
  const { data: session } = useSession()
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('')
  const [selectedTravelInfos, setSelectedTravelInfos] = useState<string[]>([])
  const [preventDuplicates, setPreventDuplicates] = useState(true)
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    currentStep: '',
    progress: 0,
    processedCount: 0,
    totalCount: 0
  })
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string>('')
  const [activeView, setActiveView] = useState<'setup' | 'preview'>('setup')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

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

  // 여행 정보 동기화 (진행 상황 추적 개선)
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
      
      // 1단계: 중복 체크 시작
      setSyncProgress({
        currentStep: '중복 이벤트 확인 중...',
        progress: 10,
        processedCount: 0,
        totalCount: infoToSync.length
      })

      // 2단계: 동기화 시작
      setSyncProgress(prev => ({
        ...prev,
        currentStep: 'Calendar 이벤트 생성 중...',
        progress: 30
      }))
      
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
      
      // 3단계: 처리 중
      setSyncProgress(prev => ({
        ...prev,
        currentStep: '동기화 처리 중...',
        progress: 70
      }))
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to sync to calendar')
      }
      
      // 4단계: 완료
      setSyncProgress(prev => ({
        ...prev,
        currentStep: '동기화 완료!',
        progress: 100,
        processedCount: infoToSync.length
      }))
      
      setSyncResult(result)
      
      if (onSyncComplete) {
        onSyncComplete(result)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setSyncProgress(prev => ({
        ...prev,
        currentStep: '동기화 실패',
        progress: 0
      }))
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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <span className="badge badge-success">높음</span>
    } else if (confidence >= 0.6) {
      return <span className="badge badge-warning">중간</span>
    } else {
      return <span className="badge badge-error">낮음</span>
    }
  }

  if (!session) {
    return (
      <div className="alert alert-warning">
        <AlertTriangle className="h-4 w-4" />
        <p>
          Google Calendar 통합을 사용하려면 먼저 로그인해주세요.
        </p>
      </div>
    )
  }

  if (travelInfos.length === 0) {
    return (
      <div className="card">
        <div className="p-8 text-center">
          <Calendar className="h-16 w-16 text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">동기화할 여행 정보가 없습니다</h3>
          <p className="text-secondary">
            먼저 Gmail에서 여행 이메일을 분석해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5" />
          Google Calendar 동기화
        </h2>
        <p className="text-secondary mb-6">
          추출된 여행 정보를 Google Calendar에 자동으로 동기화합니다
        </p>
        <div className="space-y-6">
        {/* 동기화 진행 상황 */}
        {isSyncing && (
          <div className="card" style={{borderColor: 'var(--color-primary)'}}>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    {syncProgress.currentStep}
                  </span>
                  <span className="text-sm text-secondary">
                    {syncProgress.progress}%
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{width: `${syncProgress.progress}%`}}></div>
                </div>
                {syncProgress.totalCount > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>처리됨: {syncProgress.processedCount}</span>
                    <span>전체: {syncProgress.totalCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              설정
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              미리보기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-6 space-y-6">
            {/* 캘린더 선택 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">대상 캘린더 선택</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="btn btn-ghost btn-sm"
                >
                  {isLoadingCalendars ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 기본 동기화 옵션 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">동기화 옵션</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prevent-duplicates"
                  checked={preventDuplicates}
                  onChange={(e) => setPreventDuplicates(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="prevent-duplicates" className="text-sm">
                  중복 이벤트 방지 (동일한 이메일에서 추출된 이벤트가 이미 있는 경우 건너뛰기)
                </label>
              </div>
            </div>

            {/* 고급 옵션 토글 */}
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="btn btn-ghost btn-sm flex items-center gap-2"
              >
                {showAdvancedOptions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                고급 옵션
              </button>
              
              {showAdvancedOptions && (
                <div className="card mt-3">
                  <div className="p-4 space-y-3">
                    <div className="text-sm text-secondary">
                      고급 동기화 옵션들입니다. 대부분의 경우 기본 설정을 사용하는 것을 권장합니다.
                    </div>
                    {/* 추후 고급 옵션들 추가 가능 */}
                  </div>
                </div>
              )}
            </div>

            {/* 여행 정보 선택 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  동기화할 여행 정보 선택
                </label>
                <div className="flex items-center gap-2">
                  <span className="badge">
                    {selectedTravelInfos.length}/{travelInfos.length}
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="btn btn-ghost btn-sm"
                  >
                    {selectedTravelInfos.length === travelInfos.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                {travelInfos.map((info) => (
                  <div
                    key={info.emailId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTravelInfos.includes(info.emailId)
                        ? 'border-primary bg-surface'
                        : 'border hover:bg-surface'
                    }`}
                    onClick={() => toggleTravelInfo(info.emailId)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTravelInfos.includes(info.emailId)}
                        className="mt-1 w-5 h-5 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm truncate">{info.subject}</h4>
                          {getConfidenceBadge(info.confidence)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-secondary">
                          {info.departureDate && (
                            <div className="flex items-center gap-1">
                              <Plane className="h-3 w-3" />
                              출발: {info.departureDate}
                            </div>
                          )}
                          {info.returnDate && (
                            <div className="flex items-center gap-1">
                              <Plane className="h-3 w-3 rotate-180" />
                              귀국: {info.returnDate}
                            </div>
                          )}
                          {info.destination && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              목적지: {info.destination}
                            </div>
                          )}
                          {info.hotelName && (
                            <div className="flex items-center gap-1">
                              <Hotel className="h-3 w-3" />
                              호텔: {info.hotelName}
                            </div>
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
              className="btn btn-primary w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  동기화 중...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  캘린더에 동기화 ({selectedTravelInfos.length}개)
                </>
              )}
            </button>
          </TabsContent>

          <TabsContent value="preview" className="mt-6 space-y-4">
            {selectedTravelInfos.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">생성될 캘린더 이벤트 미리보기</h4>
                    <span className="badge">
                      {selectedTravelInfos.length}개 이벤트
                    </span>
                  </div>
                  <div className="space-y-3">
                    {travelInfos
                      .filter(info => selectedTravelInfos.includes(info.emailId))
                      .map((info) => (
                        <div key={info.emailId} className="card" style={{borderLeft: '4px solid var(--color-primary)'}}>
                          <div className="p-4">
                            <h5 className="font-medium mb-2">{info.subject}</h5>
                            <div className="space-y-2 text-sm">
                              {info.departureDate && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-error rounded-full"></div>
                                  <Plane className="h-4 w-4" />
                                  <span>{info.destination || '목적지'} 출발 - {info.departureDate}</span>
                                </div>
                              )}
                              {info.returnDate && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-success rounded-full"></div>
                                  <Plane className="h-4 w-4 rotate-180" />
                                  <span>{info.departure || '출발지'} 귀국 - {info.returnDate}</span>
                                </div>
                              )}
                              {info.hotelName && info.departureDate && info.returnDate && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                                  <Hotel className="h-4 w-4" />
                                  <span>{info.hotelName} - {info.departureDate} ~ {info.returnDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="card">
                  <div className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">미리보기가 없습니다</h3>
                    <p className="text-secondary">
                      동기화할 여행 정보를 선택해주세요.
                    </p>
                  </div>
                </div>
              )}
          </TabsContent>
        </Tabs>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-error">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {/* 동기화 결과 */}
        {syncResult && (
          <div className={syncResult.success ? 'alert alert-success' : 'alert alert-warning'}>
            <CheckCircle className="h-4 w-4" />
            <div>
              <div className="space-y-2">
                <p className="font-medium">
                  {syncResult.success ? '✅' : '⚠️'} {syncResult.message}
                </p>
                <div className="text-sm">
                  <p>✅ 생성됨: {syncResult.created}개</p>
                  {syncResult.skipped > 0 && <p>⏭️ 건너뜀: {syncResult.skipped}개 (중복)</p>}
                  {syncResult.errors.length > 0 && (
                    <div>
                      <p className="text-error font-medium">❌ 오류:</p>
                      <ul className="list-disc list-inside text-error ml-2">
                        {syncResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {syncResult.success && syncResult.created > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => window.open('https://calendar.google.com', '_blank')}
                      className="btn btn-ghost btn-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Calendar에서 확인
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}