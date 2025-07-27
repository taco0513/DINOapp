'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

// Wireframe Gmail 분석기 컴포넌트
function WireframeGmailAnalyzer({ onAnalysisComplete, onStatsUpdate }: {
  onAnalysisComplete?: (infos: any[]) => void
  onStatsUpdate?: (stats: any) => void
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      // 시뮬레이션된 분석
      setTimeout(() => {
        const mockResults = [
          { id: 1, subject: 'Booking.com 예약 확인', destination: '파리', date: '2024-08-15' },
          { id: 2, subject: 'KLM 항공권 예약', destination: '암스테르담', date: '2024-09-01' }
        ]
        setResults(mockResults)
        onAnalysisComplete?.(mockResults)
        onStatsUpdate?.({ emailsScanned: 25 })
        setIsAnalyzing(false)
      }, 2000)
    } catch (error) {
      setIsAnalyzing(false)
    }
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>📧 Gmail 이메일 분석</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>Gmail에서 여행 관련 이메일을 분석합니다.</p>
      
      <button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        style={{
          padding: '12px 24px',
          backgroundColor: isAnalyzing ? '#f0f0f0' : '#0066cc',
          color: isAnalyzing ? '#999' : '#fff',
          border: 'none',
          cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          marginBottom: '20px'
        }}
      >
        {isAnalyzing ? '분석 중...' : '이메일 분석 시작'}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '15px', color: '#000' }}>분석 결과</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map(result => (
              <div key={result.id} style={{ padding: '15px', border: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                <div style={{ fontWeight: '500', marginBottom: '5px' }}>{result.subject}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>목적지: {result.destination} | 날짜: {result.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Wireframe 캘린더 동기화 컴포넌트
function WireframeCalendarSync({ travelInfos, onSyncComplete }: {
  travelInfos: any[]
  onSyncComplete?: (result: any) => void
}) {
  const [isSyncing, setIsSyncing] = useState(false)

  const startSync = async () => {
    setIsSyncing(true)
    setTimeout(() => {
      onSyncComplete?.({ created: travelInfos.length, errors: [] })
      setIsSyncing(false)
    }, 1500)
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>📅 Google Calendar 동기화</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>추출된 여행 정보를 Google Calendar에 동기화합니다.</p>
      
      {travelInfos.length > 0 ? (
        <div>
          <p style={{ marginBottom: '15px', color: '#333' }}>{travelInfos.length}개의 여행 정보가 준비되었습니다.</p>
          <button
            onClick={startSync}
            disabled={isSyncing}
            style={{
              padding: '12px 24px',
              backgroundColor: isSyncing ? '#f0f0f0' : '#009900',
              color: isSyncing ? '#999' : '#fff',
              border: 'none',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isSyncing ? '동기화 중...' : 'Calendar에 동기화'}
          </button>
        </div>
      ) : (
        <p style={{ color: '#999' }}>동기화할 여행 정보가 없습니다. 먼저 Gmail 분석을 완료해주세요.</p>
      )}
    </div>
  )
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
  const [extractedTravelInfos, setExtractedTravelInfos] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<'connect' | 'analyze' | 'sync' | 'complete'>('connect')
  const [activeTab, setActiveTab] = useState<'workflow' | 'gmail' | 'calendar'>('workflow')
  const [error, setError] = useState<string | null>(null)

  // 연결 상태 확인
  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkConnections()
    }
  }, [session, status])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

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
      // Error checking connections
      setConnectionStatus({
        gmail: false,
        calendar: false,
        loading: false
      })
    }
  }

  const handleGmailAnalysisComplete = (travelInfos: any[]) => {
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main style={{ 
        minHeight: '100vh', 
        padding: '20px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fffbf0', border: '1px solid #e0e0e0', padding: '20px' }}>
            <p style={{ color: '#cc9900' }}>⚠️ 이 기능을 사용하려면 Google 계정으로 로그인해야 합니다.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ 
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>Gmail & Calendar 통합</h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            Gmail에서 여행 정보를 추출하고 Google Calendar에 자동으로 동기화하세요
          </p>
        </div>

        {/* 연결 상태 카드 */}
        <div style={{ border: '1px solid #e0e0e0', padding: '30px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>서비스 연결 상태</h2>
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Gmail과 Google Calendar 연결 상태를 확인하세요
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {/* Gmail 상태 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '32px', color: '#0066cc' }}>📧</span>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>Gmail</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>이메일 분석</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <span style={{ fontSize: '20px' }}>🔄</span>
              ) : connectionStatus.gmail ? (
                <div style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#e6ffe6', 
                  color: '#006600', 
                  fontSize: '12px',
                  border: '1px solid #ccffcc'
                }}>
                  ✅ 연결됨
                </div>
              ) : (
                <div style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#ffe6e6', 
                  color: '#cc0000', 
                  fontSize: '12px',
                  border: '1px solid #ffcccc'
                }}>
                  ❌ 연결 안됨
                </div>
              )}
            </div>

            {/* Calendar 상태 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '32px', color: '#009900' }}>📅</span>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>Google Calendar</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>일정 동기화</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <span style={{ fontSize: '20px' }}>🔄</span>
              ) : connectionStatus.calendar ? (
                <div style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#e6ffe6', 
                  color: '#006600', 
                  fontSize: '12px',
                  border: '1px solid #ccffcc'
                }}>
                  ✅ 연결됨
                </div>
              ) : (
                <div style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#ffe6e6', 
                  color: '#cc0000', 
                  fontSize: '12px',
                  border: '1px solid #ffcccc'
                }}>
                  ❌ 연결 안됨
                </div>
              )}
            </div>
          </div>

          {(!connectionStatus.gmail || !connectionStatus.calendar) && (
            <div style={{ marginTop: '20px', backgroundColor: '#fffbf0', border: '1px solid #e0e0e0', padding: '15px' }}>
              <p style={{ color: '#cc9900', fontSize: '14px' }}>
                ⚠️ Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수 있습니다. 
                Google OAuth 인증을 통해 필요한 권한을 부여해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        {(stats.emailsScanned > 0 || stats.travelInfosExtracted > 0 || stats.eventsCreated > 0) && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '40px' 
          }}>
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', color: '#0066cc' }}>📧</span>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{stats.emailsScanned}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>스캔된 이메일</p>
                </div>
              </div>
            </div>
            
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', color: '#009900' }}>📥</span>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{stats.travelInfosExtracted}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>추출된 여행정보</p>
                </div>
              </div>
            </div>
            
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', color: '#6600cc' }}>📤</span>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{stats.eventsCreated}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>생성된 이벤트</p>
                </div>
              </div>
            </div>
            
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', color: '#cc9900' }}>🔄</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>마지막 동기화</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    {stats.lastSync ? new Date(stats.lastSync).toLocaleString('ko-KR') : '없음'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div style={{ marginBottom: '30px', backgroundColor: '#ffe6e6', border: '1px solid #ffcccc', padding: '15px' }}>
            <p style={{ color: '#cc0000' }}>⚠️ {error}</p>
          </div>
        )}

        {/* 진행 단계 표시 */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: currentStep === 'connect' ? '#0066cc' : 
                     (currentStep === 'analyze' || currentStep === 'sync' || currentStep === 'complete') ? '#009900' : '#999'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep === 'connect' ? '#e6f3ff' : 
                               (currentStep === 'analyze' || currentStep === 'sync' || currentStep === 'complete') ? '#e6ffe6' : '#f0f0f0'
              }}>
                <span style={{ fontSize: '16px' }}>⚙️</span>
              </div>
              <span style={{ fontWeight: '500' }}>서비스 연결</span>
            </div>
            
            <span style={{ fontSize: '16px', color: '#999' }}>→</span>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: currentStep === 'analyze' ? '#0066cc' : 
                     (currentStep === 'sync' || currentStep === 'complete') ? '#009900' : '#999'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep === 'analyze' ? '#e6f3ff' : 
                               (currentStep === 'sync' || currentStep === 'complete') ? '#e6ffe6' : '#f0f0f0'
              }}>
                <span style={{ fontSize: '16px' }}>📧</span>
              </div>
              <span style={{ fontWeight: '500' }}>Gmail 분석</span>
            </div>
            
            <span style={{ fontSize: '16px', color: '#999' }}>→</span>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: currentStep === 'sync' ? '#0066cc' : 
                     currentStep === 'complete' ? '#009900' : '#999'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep === 'sync' ? '#e6f3ff' : 
                               currentStep === 'complete' ? '#e6ffe6' : '#f0f0f0'
              }}>
                <span style={{ fontSize: '16px' }}>📅</span>
              </div>
              <span style={{ fontWeight: '500' }}>Calendar 동기화</span>
            </div>
            
            <span style={{ fontSize: '16px', color: '#999' }}>→</span>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: currentStep === 'complete' ? '#009900' : '#999'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep === 'complete' ? '#e6ffe6' : '#f0f0f0'
              }}>
                <span style={{ fontSize: '16px' }}>✅</span>
              </div>
              <span style={{ fontWeight: '500' }}>완료</span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {connectionStatus.gmail && connectionStatus.calendar ? (
          <div style={{ width: '100%' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '30px', border: '1px solid #e0e0e0' }}>
              <button
                onClick={() => setActiveTab('workflow')}
                style={{
                  padding: '15px',
                  backgroundColor: activeTab === 'workflow' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>⚡</span>
                통합 워크플로우
              </button>
              <button
                onClick={() => setActiveTab('gmail')}
                style={{
                  padding: '15px',
                  backgroundColor: activeTab === 'gmail' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>📧</span>
                Gmail 분석
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '15px',
                  backgroundColor: activeTab === 'calendar' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>📅</span>
                Calendar 동기화
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'workflow' && (
              <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>통합 워크플로우</h2>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                  Gmail에서 여행 정보를 추출하고 Google Calendar에 동기화하는 전체 과정을 관리합니다
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {currentStep === 'analyze' && (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>1단계: Gmail 이메일 분석</h3>
                      <WireframeGmailAnalyzer
                        onAnalysisComplete={handleGmailAnalysisComplete}
                        onStatsUpdate={(stats) => setStats(prev => ({ ...prev, emailsScanned: stats.emailsScanned }))}
                      />
                    </div>
                  )}

                  {currentStep === 'sync' && extractedTravelInfos.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>2단계: Calendar 동기화</h3>
                      <WireframeCalendarSync
                        travelInfos={extractedTravelInfos}
                        onSyncComplete={handleCalendarSyncComplete}
                      />
                    </div>
                  )}

                  {currentStep === 'complete' && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>동기화 완료!</h3>
                      <p style={{ color: '#666', marginBottom: '20px' }}>
                        총 {stats.eventsCreated}개의 캘린더 이벤트가 생성되었습니다.
                      </p>
                      <button 
                        onClick={resetFlow}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#fff',
                          border: '1px solid #666',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        다시 시작하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gmail' && (
              <WireframeGmailAnalyzer
                onAnalysisComplete={handleGmailAnalysisComplete}
                onStatsUpdate={(stats) => setStats(prev => ({ ...prev, emailsScanned: stats.emailsScanned }))}
              />
            )}

            {activeTab === 'calendar' && (
              <WireframeCalendarSync
                travelInfos={extractedTravelInfos}
                onSyncComplete={handleCalendarSyncComplete}
              />
            )}
          </div>
        ) : (
          <div style={{ border: '1px solid #e0e0e0', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', color: '#999', marginBottom: '20px' }}>⚙️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>서비스 연결이 필요합니다</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수 있습니다.
            </p>
            <button 
              onClick={checkConnections} 
              disabled={connectionStatus.loading}
              style={{
                padding: '12px 24px',
                backgroundColor: connectionStatus.loading ? '#f0f0f0' : '#0066cc',
                color: connectionStatus.loading ? '#999' : '#fff',
                border: 'none',
                cursor: connectionStatus.loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <span>{connectionStatus.loading ? '🔄' : '🔄'}</span>
              연결 상태 확인
            </button>
          </div>
        )}
      </div>
    </main>
  )
}