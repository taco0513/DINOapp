'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
// UI Components removed - using minimal design system
import { 
  Mail, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Filter,
  Eye,
  Download,
  Calendar,
  MapPin,
  Plane,
  Hotel,
  User,
  Hash
} from 'lucide-react'
import { TravelInfo } from '@/lib/gmail'

interface GmailAnalyzerProps {
  onAnalysisComplete: (travelInfos: TravelInfo[]) => void
  onStatsUpdate: (stats: { emailsScanned: number }) => void
}

interface AnalysisProgress {
  currentStep: string
  progress: number
  totalEmails: number
  processedEmails: number
  foundTravelEmails: number
}

interface FilterOptions {
  confidence: number
  maxResults: number
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all'
  category: 'all' | 'airline' | 'hotel' | 'booking_platform'
}

export default function GmailAnalyzer({ onAnalysisComplete, onStatsUpdate }: GmailAnalyzerProps) {
  const { data: session } = useSession()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    currentStep: '',
    progress: 0,
    totalEmails: 0,
    processedEmails: 0,
    foundTravelEmails: 0
  })
  const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([])
  const [filteredTravelInfos, setFilteredTravelInfos] = useState<TravelInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    confidence: 0.6,
    maxResults: 50,
    dateRange: 'quarter',
    category: 'all'
  })
  const [selectedTab, setSelectedTab] = useState<'results' | 'details'>('results')

  // 필터 적용
  useEffect(() => {
    if (travelInfos.length === 0) {
      setFilteredTravelInfos([])
      return
    }

    let filtered = travelInfos.filter(info => info.confidence >= filters.confidence)

    if (filters.category !== 'all') {
      filtered = filtered.filter(info => {
        const category = getCategoryFromEmail(info)
        return category === filters.category
      })
    }

    setFilteredTravelInfos(filtered)
  }, [travelInfos, filters])

  const getCategoryFromEmail = (travelInfo: TravelInfo): string => {
    const subject = travelInfo.subject.toLowerCase()
    const from = (travelInfo.from || '').toLowerCase()
    
    if (subject.includes('hotel') || subject.includes('숙박') || from.includes('booking') || from.includes('agoda')) {
      return 'hotel'
    }
    if (subject.includes('flight') || subject.includes('항공') || from.includes('airline')) {
      return 'airline'
    }
    return 'booking_platform'
  }

  const startAnalysis = async () => {
    if (!session) {
      setError('인증이 필요합니다.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress({
      currentStep: 'Gmail 연결 확인 중...',
      progress: 0,
      totalEmails: 0,
      processedEmails: 0,
      foundTravelEmails: 0
    })

    try {
      // 1단계: Gmail 연결 확인
      setAnalysisProgress(prev => ({
        ...prev,
        currentStep: 'Gmail 연결 상태 확인 중...',
        progress: 10
      }))

      const checkResponse = await fetch('/api/gmail/check')
      const checkData = await checkResponse.json()
      
      if (!checkData.connected) {
        throw new Error('Gmail 연결이 필요합니다.')
      }

      // 2단계: 이메일 검색 시작
      setAnalysisProgress(prev => ({
        ...prev,
        currentStep: '여행 관련 이메일 검색 중...',
        progress: 25
      }))

      // 검색 쿼리 생성
      const queries = [
        'subject:(flight OR 항공 OR airline OR boarding)',
        'subject:(hotel OR 숙박 OR booking OR reservation)',
        'subject:(travel OR 여행 OR trip OR 예약)',
        'from:(booking.com OR agoda OR hotels.com OR koreanair OR asiana)'
      ]

      const searchResults = []
      let totalFound = 0

      for (let i = 0; i < queries.length; i++) {
        const query = queries[i]
        setAnalysisProgress(prev => ({
          ...prev,
          currentStep: `검색 중... (${i + 1}/${queries.length})`,
          progress: 25 + (i * 15)
        }))

        const searchResponse = await fetch('/api/gmail/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            maxResults: Math.ceil(filters.maxResults / queries.length)
          })
        })

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          searchResults.push(...(searchData.messages || []))
          totalFound += searchData.messages?.length || 0
        }
      }

      // 중복 제거
      const uniqueEmails = Array.from(
        new Map(searchResults.map(email => [email.id, email])).values()
      ).slice(0, filters.maxResults)

      setAnalysisProgress(prev => ({
        ...prev,
        currentStep: '이메일 내용 분석 중...',
        progress: 70,
        totalEmails: uniqueEmails.length
      }))

      onStatsUpdate({ emailsScanned: uniqueEmails.length })

      // 3단계: 이메일 분석
      const analyzeResponse = await fetch('/api/gmail/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds: uniqueEmails.map(e => e.id),
          extractTravelInfo: true
        })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.message || '이메일 분석 중 오류가 발생했습니다.')
      }

      const analyzeData = await analyzeResponse.json()
      const extractedTravelInfos = analyzeData.travelInfos || []

      setAnalysisProgress(prev => ({
        ...prev,
        currentStep: '분석 완료!',
        progress: 100,
        processedEmails: uniqueEmails.length,
        foundTravelEmails: extractedTravelInfos.length
      }))

      setTravelInfos(extractedTravelInfos)
      onAnalysisComplete(extractedTravelInfos)

    } catch (error) {
      // Analysis error occurred
      setError(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <span className="badge badge-success">높음 {Math.round(confidence * 100)}%</span>
    } else if (confidence >= 0.6) {
      return <span className="badge badge-warning">중간 {Math.round(confidence * 100)}%</span>
    } else {
      return <span className="badge badge-error">낮음 {Math.round(confidence * 100)}%</span>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'airline': return <Plane className="h-4 w-4" />
      case 'hotel': return <Hotel className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'airline': return '항공사'
      case 'hotel': return '호텔'
      case 'booking_platform': return '예약사이트'
      default: return '기타'
    }
  }

  return (
    <div className="space-y-6">
      {/* 분석 설정 및 시작 */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
            <Search className="h-5 w-5" />
            Gmail 이메일 분석
          </h3>
          <p className="text-secondary">
            Gmail에서 여행 관련 이메일을 찾아 여행 정보를 자동으로 추출합니다
          </p>
        </div>
        <div className="space-y-4">
          {/* 분석 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">최대 이메일 수</label>
              <select
                value={filters.maxResults}
                onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isAnalyzing}
              >
                <option value={20}>20개</option>
                <option value={50}>50개</option>
                <option value={100}>100개</option>
                <option value={200}>200개</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">검색 기간</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isAnalyzing}
              >
                <option value="week">최근 1주</option>
                <option value="month">최근 1개월</option>
                <option value="quarter">최근 3개월</option>
                <option value="year">최근 1년</option>
                <option value="all">전체</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">최소 신뢰도</label>
              <select
                value={filters.confidence}
                onChange={(e) => setFilters(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isAnalyzing}
              >
                <option value={0.3}>30% 이상</option>
                <option value={0.5}>50% 이상</option>
                <option value={0.6}>60% 이상</option>
                <option value={0.8}>80% 이상</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="btn btn-primary btn-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    분석 시작
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 진행 상황 */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{analysisProgress.currentStep}</span>
                <span className="text-sm text-secondary">
                  {analysisProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{width: `${analysisProgress.progress}%`}} />
              </div>
              
              {analysisProgress.totalEmails > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{analysisProgress.totalEmails}</div>
                    <div className="text-secondary">총 이메일</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{analysisProgress.processedEmails}</div>
                    <div className="text-secondary">처리됨</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{analysisProgress.foundTravelEmails}</div>
                    <div className="text-secondary">여행정보 발견</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="alert alert-error">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 분석 결과 */}
      {filteredTravelInfos.length > 0 && (
        <div className="card">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                분석 결과
              </h3>
              <span className="badge">
                {filteredTravelInfos.length}개 발곮
              </span>
            </div>
            <p className="text-secondary">
              추출된 여행 정보를 확인하고 캘린더에 동기화할 수 있습니다
            </p>
          </div>
          <div>
            {/* 필터 및 요약 */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">필터:</span>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="airline">항공사</option>
                  <option value="hotel">호텔</option>
                  <option value="booking_platform">예약사이트</option>
                </select>
              </div>

              {/* 요약 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary">{filteredTravelInfos.length}</div>
                  <div className="text-sm text-secondary">총 여행정보</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-success">
                    {filteredTravelInfos.filter(info => info.confidence >= 0.8).length}
                  </div>
                  <div className="text-sm text-secondary">높은 신뢰도</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Set(filteredTravelInfos.map(info => info.destination).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-secondary">목적지 수</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-warning">
                    {filteredTravelInfos.filter(info => info.flightNumber).length}
                  </div>
                  <div className="text-sm text-secondary">항공편 정보</div>
                </div>
              </div>
            </div>

            {/* 결과 탭 */}
            <div className="mb-6">
              <nav className="nav-menu flex gap-4">
                <button
                  onClick={() => setSelectedTab('results')}
                  className={`btn btn-ghost btn-sm ${
                    selectedTab === 'results' ? 'active' : ''
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  결과 목록
                </button>
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`btn btn-ghost btn-sm ${
                    selectedTab === 'details' ? 'active' : ''
                  }`}
                >
                  <Download className="h-4 w-4" />
                  상세 정보
                </button>
              </nav>
            </div>

            {selectedTab === 'results' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTravelInfos.map((travelInfo, index) => (
                  <div key={travelInfo.emailId} className="card">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium flex-1 mr-2">
                          {travelInfo.subject}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(getCategoryFromEmail(travelInfo))}
                          {getConfidenceBadge(travelInfo.confidence)}
                        </div>
                      </div>

                      <p className="text-sm text-secondary mb-3">{travelInfo.from}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {travelInfo.departureDate && (
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-primary" />
                            <span className="font-medium">출발:</span>
                            <span>{travelInfo.departureDate}</span>
                          </div>
                        )}
                        {travelInfo.returnDate && (
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-success rotate-180" />
                            <span className="font-medium">귀국:</span>
                            <span>{travelInfo.returnDate}</span>
                          </div>
                        )}
                        {travelInfo.destination && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-error" />
                            <span className="font-medium">목적지:</span>
                            <span>{travelInfo.destination}</span>
                          </div>
                        )}
                        {travelInfo.flightNumber && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="font-medium">항공편:</span>
                            <span>{travelInfo.flightNumber}</span>
                          </div>
                        )}
                        {travelInfo.hotelName && (
                          <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-warning" />
                            <span className="font-medium">호텔:</span>
                            <span>{travelInfo.hotelName}</span>
                          </div>
                        )}
                        {travelInfo.passengerName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-medium">승객:</span>
                            <span>{travelInfo.passengerName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {selectedTab === 'details' && (
              <div className="space-y-4">
                <div className="text-sm text-secondary">
                  상세 분석 정보와 데이터 품질 지표를 확인할 수 있습니다.
                </div>
                  
                  {/* 데이터 품질 분석 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card text-center">
                      <div className="text-2xl font-bold text-success">
                        {Math.round(filteredTravelInfos.reduce((sum, info) => sum + info.confidence, 0) / filteredTravelInfos.length * 100)}%
                      </div>
                      <div className="text-sm text-secondary">평균 신뢰도</div>
                    </div>
                    
                    <div className="card text-center">
                      <div className="text-2xl font-bold text-primary">
                        {filteredTravelInfos.filter(info => info.departureDate && info.returnDate).length}
                      </div>
                      <div className="text-sm text-secondary">완전한 여행</div>
                    </div>
                    
                    <div className="card text-center">
                      <div className="text-2xl font-bold text-primary">
                        {filteredTravelInfos.filter(info => info.bookingReference).length}
                      </div>
                      <div className="text-sm text-secondary">예약번호 있음</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 결과가 없을 때 */}
      {!isAnalyzing && travelInfos.length === 0 && !error && (
        <div className="card p-8 text-center">
          <Mail className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">분석 준비 완료</h3>
          <p className="text-secondary">
            위 설정을 확인하고 "분석 시작" 버튼을 클릭하여 Gmail에서 여햑 정보를 추출하세요.
          </p>
        </div>
      )}
    </div>
  )
}