'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Calendar, 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Zap,
  ArrowRight,
  Download,
  Upload
} from 'lucide-react'
import GmailAnalyzer from '@/components/gmail/GmailAnalyzer'
import CalendarSync from '@/components/calendar/CalendarSync'
import { TravelInfo } from '@/lib/gmail'

interface ConnectionStatus {
  gmail: boolean
  calendar: boolean
  loading: boolean
}

interface IntegrationStats {
  emailsScanned: number
  travelInfosExtracted: number
  eventsCreated: number
  lastSync: string | null
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    gmail: false,
    calendar: false,
    loading: true
  })
  const [stats, setStats] = useState<IntegrationStats>({
    emailsScanned: 0,
    travelInfosExtracted: 0,
    eventsCreated: 0,
    lastSync: null
  })
  const [extractedTravelInfos, setExtractedTravelInfos] = useState<TravelInfo[]>([])
  const [currentStep, setCurrentStep] = useState<'connect' | 'analyze' | 'sync' | 'complete'>('connect')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 연결 상태 확인
  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkConnections()
    }
  }, [session, status])

  const checkConnections = async () => {
    if (!session) return

    setConnectionStatus(prev => ({ ...prev, loading: true }))
    
    try {
      // Gmail 연결 상태 확인
      const gmailResponse = await fetch('/api/gmail/check')
      const gmailData = await gmailResponse.json()
      
      // Calendar 연결 상태 확인
      const calendarResponse = await fetch('/api/calendar/check')
      const calendarData = await calendarResponse.json()
      
      setConnectionStatus({
        gmail: gmailData.connected || false,
        calendar: calendarData.connected || false,
        loading: false
      })

      // 연결 상태에 따라 다음 단계 결정
      if (gmailData.connected && calendarData.connected) {
        setCurrentStep('analyze')
      }
      
    } catch (error) {
      console.error('Error checking connections:', error)
      setConnectionStatus({
        gmail: false,
        calendar: false,
        loading: false
      })
    }
  }

  const handleGmailAnalysisComplete = (travelInfos: TravelInfo[]) => {
    setExtractedTravelInfos(travelInfos)
    setStats(prev => ({
      ...prev,
      travelInfosExtracted: travelInfos.length
    }))
    
    if (travelInfos.length > 0) {
      setCurrentStep('sync')
    }
  }

  const handleCalendarSyncComplete = (result: { created: number, errors: string[] }) => {
    setStats(prev => ({
      ...prev,
      eventsCreated: result.created,
      lastSync: new Date().toISOString()
    }))
    
    if (result.created > 0) {
      setCurrentStep('complete')
    }
  }

  const resetFlow = () => {
    setExtractedTravelInfos([])
    setCurrentStep('analyze')
    setError(null)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            이 기능을 사용하려면 Google 계정으로 로그인해야 합니다.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gmail & Calendar 통합</h1>
        <p className="text-muted-foreground">
          Gmail에서 여행 정보를 추출하고 Google Calendar에 자동으로 동기화하세요
        </p>
      </div>

      {/* 연결 상태 카드 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            서비스 연결 상태
          </CardTitle>
          <CardDescription>
            Gmail과 Google Calendar 연결 상태를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gmail 상태 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Gmail</h3>
                  <p className="text-sm text-muted-foreground">이메일 분석</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : connectionStatus.gmail ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  연결됨
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  연결 안됨
                </Badge>
              )}
            </div>

            {/* Calendar 상태 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">일정 동기화</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : connectionStatus.calendar ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  연결됨
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  연결 안됨
                </Badge>
              )}
            </div>
          </div>

          {(!connectionStatus.gmail || !connectionStatus.calendar) && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수 있습니다. 
                Google OAuth 인증을 통해 필요한 권한을 부여해주세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      {(stats.emailsScanned > 0 || stats.travelInfosExtracted > 0 || stats.eventsCreated > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.emailsScanned}</p>
                  <p className="text-sm text-muted-foreground">스캔된 이메일</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.travelInfosExtracted}</p>
                  <p className="text-sm text-muted-foreground">추출된 여행정보</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.eventsCreated}</p>
                  <p className="text-sm text-muted-foreground">생성된 이벤트</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-semibold">마지막 동기화</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.lastSync ? new Date(stats.lastSync).toLocaleString('ko-KR') : '없음'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 진행 단계 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${currentStep === 'connect' ? 'text-blue-600' : currentStep === 'analyze' || currentStep === 'sync' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'connect' ? 'bg-blue-100' : currentStep === 'analyze' || currentStep === 'sync' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-medium">서비스 연결</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center gap-2 ${currentStep === 'analyze' ? 'text-blue-600' : currentStep === 'sync' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analyze' ? 'bg-blue-100' : currentStep === 'sync' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-medium">Gmail 분석</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center gap-2 ${currentStep === 'sync' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'sync' ? 'bg-blue-100' : currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-medium">Calendar 동기화</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="font-medium">완료</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      {connectionStatus.gmail && connectionStatus.calendar ? (
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              통합 워크플로우
            </TabsTrigger>
            <TabsTrigger value="gmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Gmail 분석
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar 동기화
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>통합 워크플로우</CardTitle>
                <CardDescription>
                  Gmail에서 여행 정보를 추출하고 Google Calendar에 동기화하는 전체 과정을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 'analyze' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">1단계: Gmail 이메일 분석</h3>
                    <GmailAnalyzer
                      onAnalysisComplete={handleGmailAnalysisComplete}
                      onStatsUpdate={(stats) => setStats(prev => ({ ...prev, emailsScanned: stats.emailsScanned }))}
                    />
                  </div>
                )}

                {currentStep === 'sync' && extractedTravelInfos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">2단계: Calendar 동기화</h3>
                    <CalendarSync
                      travelInfos={extractedTravelInfos}
                      onSyncComplete={handleCalendarSyncComplete}
                    />
                  </div>
                )}

                {currentStep === 'complete' && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">동기화 완료!</h3>
                    <p className="text-muted-foreground mb-4">
                      총 {stats.eventsCreated}개의 캘린더 이벤트가 생성되었습니다.
                    </p>
                    <Button onClick={resetFlow} variant="outline">
                      다시 시작하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gmail" className="mt-6">
            <GmailAnalyzer
              onAnalysisComplete={handleGmailAnalysisComplete}
              onStatsUpdate={(stats) => setStats(prev => ({ ...prev, emailsScanned: stats.emailsScanned }))}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarSync
              travelInfos={extractedTravelInfos}
              onSyncComplete={handleCalendarSyncComplete}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">서비스 연결이 필요합니다</h3>
            <p className="text-muted-foreground mb-4">
              Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수 있습니다.
            </p>
            <Button onClick={checkConnections} disabled={connectionStatus.loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${connectionStatus.loading ? 'animate-spin' : ''}`} />
              연결 상태 확인
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}