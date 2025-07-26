'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Settings, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  MapPin,
  Plane,
  Hotel,
  ExternalLink,
  Plus,
  Eye,
  FileText
} from 'lucide-react'
import CalendarSync from '@/components/calendar/CalendarSync'
import { TravelInfo } from '@/lib/gmail'

interface CalendarStats {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  lastSyncDate?: string
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([])
  const [calendarStats, setCalendarStats] = useState<CalendarStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'sync' | 'manage'>('overview')

  // Gmail에서 여행 정보 가져오기
  const loadTravelInfos = async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/gmail/analyze')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load travel information')
      }
      
      if (data.success && data.travelInfos) {
        setTravelInfos(data.travelInfos)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // 캘린더 통계 가져오기
  const loadCalendarStats = async () => {
    if (!session) return

    try {
      const response = await fetch('/api/calendar/check')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setCalendarStats(data.stats || {
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0
        })
      }
    } catch (err) {
      console.error('Failed to load calendar stats:', err)
    }
  }

  // 동기화 완료 후 콜백
  const handleSyncComplete = (result: any) => {
    if (result.success) {
      loadCalendarStats()
    }
  }

  useEffect(() => {
    if (session) {
      loadTravelInfos()
      loadCalendarStats()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground mb-4">
              Google Calendar 통합을 사용하려면 먼저 로그인해주세요.
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Calendar 통합
          </h1>
          <p className="text-muted-foreground mt-2">
            Gmail에서 추출한 여행 정보를 Google Calendar와 동기화하세요
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open('https://calendar.google.com', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Calendar 열기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 이벤트</p>
                <p className="text-2xl font-bold">{calendarStats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">예정된 여행</p>
                <p className="text-2xl font-bold text-green-600">{calendarStats.upcomingEvents}</p>
              </div>
              <Plane className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">지난 여행</p>
                <p className="text-2xl font-bold text-gray-600">{calendarStats.pastEvents}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gmail 분석</p>
                <p className="text-2xl font-bold text-purple-600">{travelInfos.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            동기화
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* 개요 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar 통합 개요</CardTitle>
              <CardDescription>
                DINO는 Gmail에서 추출한 여행 정보를 Google Calendar와 자동으로 동기화합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    지원되는 기능
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      항공편 예약 자동 추가
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      호텔 예약 일정 동기화
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      여행 기간 자동 계산
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      중복 이벤트 자동 방지
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    사용 방법
                  </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      Gmail 연결 및 이메일 분석
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                      동기화할 캘린더 선택
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                      여행 정보 선택 및 동기화
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                      Google Calendar에서 확인
                    </li>
                  </ol>
                </div>
              </div>
              
              {travelInfos.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    아직 Gmail에서 여행 정보를 분석하지 않았습니다. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1"
                      onClick={() => window.location.href = '/gmail'}
                    >
                      Gmail 페이지
                    </Button>
                    에서 먼저 이메일을 분석해주세요.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 최근 여행 정보 미리보기 */}
          {travelInfos.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>분석된 여행 정보</CardTitle>
                    <CardDescription>
                      Gmail에서 추출된 여행 정보들입니다
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {travelInfos.length}개 발견
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {travelInfos.slice(0, 3).map((info) => (
                    <div key={info.emailId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{info.subject}</h4>
                        <Badge variant={info.confidence >= 0.7 ? 'default' : 'secondary'}>
                          신뢰도 {Math.round(info.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {info.departureDate && (
                          <div className="flex items-center gap-1">
                            <Plane className="h-3 w-3" />
                            출발: {info.departureDate}
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
                            숙소: {info.hotelName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {travelInfos.length > 3 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('sync')}
                      >
                        모든 여행 정보 보기 ({travelInfos.length - 3}개 더)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync" className="mt-6">
          {travelInfos.length > 0 ? (
            <CalendarSync 
              travelInfos={travelInfos} 
              onSyncComplete={handleSyncComplete}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">동기화할 여행 정보가 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  먼저 Gmail에서 여행 이메일을 분석해주세요.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/gmail'}
                  >
                    Gmail 분석하기
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={loadTravelInfos}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    새로고침
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 캘린더 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>캘린더 설정</CardTitle>
                <CardDescription>
                  Google Calendar 연결 및 설정을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Google Calendar 연결</p>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email || '연결된 계정 없음'}
                    </p>
                  </div>
                  <Badge variant="default">연결됨</Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/settings', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Calendar 설정
                </Button>
              </CardContent>
            </Card>

            {/* 동기화 내역 */}
            <Card>
              <CardHeader>
                <CardTitle>동기화 내역</CardTitle>
                <CardDescription>
                  최근 동기화 활동을 확인합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calendarStats.lastSyncDate ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">마지막 동기화</span>
                      <span className="text-sm text-muted-foreground">
                        {calendarStats.lastSyncDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">총 이벤트</span>
                      <span className="text-sm font-medium">
                        {calendarStats.totalEvents}개
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      아직 동기화 내역이 없습니다
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={loadCalendarStats}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  내역 새로고침
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}