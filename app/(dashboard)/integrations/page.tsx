'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ConnectionStatus {
  gmail: boolean;
  calendar: boolean;
  loading: boolean;
}

interface IntegrationStats {
  emailsScanned: number;
  travelInfosExtracted: number;
  eventsCreated: number;
  lastSync: string | null;
}

// Wireframe Gmail 분석기 컴포넌트
function WireframeGmailAnalyzer({
  onAnalysisComplete,
  onStatsUpdate,
}: {
  onAnalysisComplete?: (_infos: any[]) => void;
  onStatsUpdate?: (_stats: any) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 시뮬레이션된 분석
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            subject: 'Booking.com 예약 확인',
            destination: '파리',
            date: '2024-08-15',
          },
          {
            id: 2,
            subject: 'KLM 항공권 예약',
            destination: '암스테르담',
            date: '2024-09-01',
          },
        ];
        setResults(mockResults);
        onAnalysisComplete?.(mockResults);
        onStatsUpdate?.({ emailsScanned: 25 });
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='bg-card border border-border rounded-lg p-8'>
      <h3 className='text-lg font-bold mb-4 text-foreground'>
        📧 Gmail 이메일 분석
      </h3>
      <p className='text-muted-foreground mb-5'>
        Gmail에서 여행 관련 이메일을 분석합니다.
      </p>

      <button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className={`px-6 py-3 text-sm mb-5 border-0 cursor-pointer rounded ${
          isAnalyzing
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isAnalyzing ? '분석 중...' : '이메일 분석 시작'}
      </button>

      {results.length > 0 && (
        <div className='mt-5'>
          <h4 className='text-base font-medium mb-4 text-foreground'>
            분석 결과
          </h4>
          <div className='flex flex-col gap-2'>
            {results.map(result => (
              <div
                key={result.id}
                className='p-4 border border-border bg-card rounded-lg'
              >
                <div className='font-medium mb-1'>{result.subject}</div>
                <div className='text-sm text-muted-foreground'>
                  목적지: {result.destination} | 날짜: {result.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Wireframe 캘린더 동기화 컴포넌트
function WireframeCalendarSync({
  travelInfos,
  onSyncComplete,
}: {
  travelInfos: any[];
  onSyncComplete?: (_result: any) => void;
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const startSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      onSyncComplete?.({ created: travelInfos.length, errors: [] });
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className='bg-card border border-border rounded-lg p-8'>
      <h3 className='text-lg font-bold mb-4 text-foreground'>
        📅 Google Calendar 동기화
      </h3>
      <p className='text-muted-foreground mb-5'>
        추출된 여행 정보를 Google Calendar에 동기화합니다.
      </p>

      {travelInfos.length > 0 ? (
        <div>
          <p className='mb-4 text-foreground'>
            {travelInfos.length}개의 여행 정보가 준비되었습니다.
          </p>
          <button
            onClick={startSync}
            disabled={isSyncing}
            className={`px-6 py-3 text-sm border-0 cursor-pointer rounded ${
              isSyncing
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSyncing ? '동기화 중...' : 'Calendar에 동기화'}
          </button>
        </div>
      ) : (
        <p className='text-muted-foreground'>
          동기화할 여행 정보가 없습니다. 먼저 Gmail 분석을 완료해주세요.
        </p>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    gmail: false,
    calendar: false,
    loading: true,
  });
  const [stats, setStats] = useState<IntegrationStats>({
    emailsScanned: 0,
    travelInfosExtracted: 0,
    eventsCreated: 0,
    lastSync: null,
  });
  const [extractedTravelInfos, setExtractedTravelInfos] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'connect' | 'analyze' | 'sync' | 'complete'
  >('connect');
  const [activeTab, setActiveTab] = useState<'workflow' | 'gmail' | 'calendar'>(
    'workflow'
  );
  const [error, setError] = useState<string | null>(null);

  // 연결 상태 확인
  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkConnections();
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const checkConnections = useCallback(async () => {
    if (!session) return;

    setConnectionStatus(prev => ({ ...prev, loading: true }));

    try {
      // Gmail 연결 상태 확인
      const gmailResponse = await fetch('/api/gmail/check');
      const gmailData = await gmailResponse.json();

      // Calendar 연결 상태 확인
      const calendarResponse = await fetch('/api/calendar/check');
      const calendarData = await calendarResponse.json();

      setConnectionStatus({
        gmail: gmailData.connected || false,
        calendar: calendarData.connected || false,
        loading: false,
      });

      // 연결 상태에 따라 다음 단계 결정
      if (gmailData.connected && calendarData.connected) {
        setCurrentStep('analyze');
      }
    } catch (error) {
      // Error checking connections
      setConnectionStatus({
        gmail: false,
        calendar: false,
        loading: false,
      });
    }
  }, [session]);

  const handleGmailAnalysisComplete = (travelInfos: any[]) => {
    setExtractedTravelInfos(travelInfos);
    setStats(prev => ({
      ...prev,
      travelInfosExtracted: travelInfos.length,
    }));

    if (travelInfos.length > 0) {
      setCurrentStep('sync');
    }
  };

  const handleCalendarSyncComplete = (result: {
    created: number;
    errors: string[];
  }) => {
    setStats(prev => ({
      ...prev,
      eventsCreated: result.created,
      lastSync: new Date().toISOString(),
    }));

    if (result.created > 0) {
      setCurrentStep('complete');
    }
  };

  const resetFlow = () => {
    setExtractedTravelInfos([]);
    setCurrentStep('analyze');
    setError(null);
  };

  if (status === 'loading') {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mb-5 text-sm text-muted-foreground'>로딩 중...</div>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className='min-h-screen p-5 bg-background font-sans'>
        <div className='max-w-6xl mx-auto'>
          <div className='bg-yellow-50 border border-border p-5 rounded-lg'>
            <p className='text-yellow-700'>
              ⚠️ 이 기능을 사용하려면 Google 계정으로 로그인해야 합니다.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen p-5 bg-background font-sans'>
      <div className='max-w-6xl mx-auto'>
        {/* 헤더 */}
        <div className='mb-10 pb-5 border-b border-border'>
          <h1 className='text-3xl font-bold mb-2 text-foreground'>
            Gmail & Calendar 통합
          </h1>
          <p className='text-sm text-muted-foreground leading-6'>
            Gmail에서 여행 정보를 추출하고 Google Calendar에 자동으로
            동기화하세요
          </p>
        </div>

        {/* 연결 상태 카드 */}
        <div className='bg-card border border-border rounded-lg p-8 mb-10'>
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-xl'>⚙️</span>
            <h2 className='text-xl font-bold text-foreground'>
              서비스 연결 상태
            </h2>
          </div>
          <p className='text-sm text-muted-foreground mb-5'>
            Gmail과 Google Calendar 연결 상태를 확인하세요
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {/* Gmail 상태 */}
            <div className='flex justify-between items-center p-5 border border-border rounded-lg'>
              <div className='flex items-center gap-4'>
                <span className='text-3xl text-blue-600'>📧</span>
                <div>
                  <h3 className='font-bold mb-1 text-foreground'>Gmail</h3>
                  <p className='text-sm text-muted-foreground'>이메일 분석</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <span className='text-xl'>🔄</span>
              ) : connectionStatus.gmail ? (
                <div className='px-3 py-1 bg-green-50 text-green-800 text-xs border border-green-200 rounded'>
                  ✅ 연결됨
                </div>
              ) : (
                <div className='px-3 py-1 bg-red-50 text-red-800 text-xs border border-red-200 rounded'>
                  ❌ 연결 안됨
                </div>
              )}
            </div>

            {/* Calendar 상태 */}
            <div className='flex justify-between items-center p-5 border border-border rounded-lg'>
              <div className='flex items-center gap-4'>
                <span className='text-3xl text-green-600'>📅</span>
                <div>
                  <h3 className='font-bold mb-1 text-foreground'>
                    Google Calendar
                  </h3>
                  <p className='text-sm text-muted-foreground'>일정 동기화</p>
                </div>
              </div>
              {connectionStatus.loading ? (
                <span className='text-xl'>🔄</span>
              ) : connectionStatus.calendar ? (
                <div className='px-3 py-1 bg-green-50 text-green-800 text-xs border border-green-200 rounded'>
                  ✅ 연결됨
                </div>
              ) : (
                <div className='px-3 py-1 bg-red-50 text-red-800 text-xs border border-red-200 rounded'>
                  ❌ 연결 안됨
                </div>
              )}
            </div>
          </div>

          {(!connectionStatus.gmail || !connectionStatus.calendar) && (
            <div className='mt-5 bg-yellow-50 border border-border rounded-lg p-4'>
              <p className='text-yellow-700 text-sm'>
                ⚠️ Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수
                있습니다. Google OAuth 인증을 통해 필요한 권한을 부여해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        {(stats.emailsScanned > 0 ||
          stats.travelInfosExtracted > 0 ||
          stats.eventsCreated > 0) && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10'>
            <div className='bg-card border border-border rounded-lg p-5'>
              <div className='flex items-center gap-3'>
                <span className='text-blue-600'>📧</span>
                <div>
                  <p className='text-2xl font-bold text-foreground'>
                    {stats.emailsScanned}
                  </p>
                  <p className='text-sm text-muted-foreground'>스캔된 이메일</p>
                </div>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-5'>
              <div className='flex items-center gap-3'>
                <span className='text-green-600'>📥</span>
                <div>
                  <p className='text-2xl font-bold text-foreground'>
                    {stats.travelInfosExtracted}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    추출된 여행정보
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-5'>
              <div className='flex items-center gap-3'>
                <span className='text-purple-600'>📤</span>
                <div>
                  <p className='text-2xl font-bold text-foreground'>
                    {stats.eventsCreated}
                  </p>
                  <p className='text-sm text-muted-foreground'>생성된 이벤트</p>
                </div>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-5'>
              <div className='flex items-center gap-3'>
                <span className='text-yellow-600'>🔄</span>
                <div>
                  <p className='text-xs font-bold text-foreground'>
                    마지막 동기화
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {stats.lastSync
                      ? new Date(stats.lastSync).toLocaleString('ko-KR')
                      : '없음'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className='mb-8 bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-red-700'>⚠️ {error}</p>
          </div>
        )}

        {/* 진행 단계 표시 */}
        <div className='mb-10'>
          <div className='flex justify-between items-center'>
            <div
              className={`flex items-center gap-3 ${
                currentStep === 'connect'
                  ? 'text-blue-600'
                  : currentStep === 'analyze' ||
                      currentStep === 'sync' ||
                      currentStep === 'complete'
                    ? 'text-green-600'
                    : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'connect'
                    ? 'bg-blue-100'
                    : currentStep === 'analyze' ||
                        currentStep === 'sync' ||
                        currentStep === 'complete'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <span>⚙️</span>
              </div>
              <span className='font-medium'>서비스 연결</span>
            </div>

            <span className='text-gray-400'>→</span>

            <div
              className={`flex items-center gap-3 ${
                currentStep === 'analyze'
                  ? 'text-blue-600'
                  : currentStep === 'sync' || currentStep === 'complete'
                    ? 'text-green-600'
                    : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'analyze'
                    ? 'bg-blue-100'
                    : currentStep === 'sync' || currentStep === 'complete'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <span>📧</span>
              </div>
              <span className='font-medium'>Gmail 분석</span>
            </div>

            <span className='text-gray-400'>→</span>

            <div
              className={`flex items-center gap-3 ${
                currentStep === 'sync'
                  ? 'text-blue-600'
                  : currentStep === 'complete'
                    ? 'text-green-600'
                    : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'sync'
                    ? 'bg-blue-100'
                    : currentStep === 'complete'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <span>📅</span>
              </div>
              <span className='font-medium'>Calendar 동기화</span>
            </div>

            <span className='text-gray-400'>→</span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: currentStep === 'complete' ? '#009900' : '#999',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    currentStep === 'complete' ? '#e6ffe6' : '#f0f0f0',
                }}
              >
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                marginBottom: '30px',
                border: '1px solid #e0e0e0',
              }}
            >
              <button
                onClick={() => setActiveTab('workflow')}
                style={{
                  padding: '15px',
                  backgroundColor:
                    activeTab === 'workflow' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
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
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📧</span>
                Gmail 분석
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '15px',
                  backgroundColor:
                    activeTab === 'calendar' ? '#f0f0f0' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📅</span>
                Calendar 동기화
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'workflow' && (
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-8)',
                }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#000',
                  }}
                >
                  통합 워크플로우
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '30px',
                  }}
                >
                  Gmail에서 여행 정보를 추출하고 Google Calendar에 동기화하는
                  전체 과정을 관리합니다
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px',
                  }}
                >
                  {currentStep === 'analyze' && (
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '20px',
                          color: '#000',
                        }}
                      >
                        1단계: Gmail 이메일 분석
                      </h3>
                      <WireframeGmailAnalyzer
                        onAnalysisComplete={handleGmailAnalysisComplete}
                        onStatsUpdate={stats =>
                          setStats(prev => ({
                            ...prev,
                            emailsScanned: stats.emailsScanned,
                          }))
                        }
                      />
                    </div>
                  )}

                  {currentStep === 'sync' &&
                    extractedTravelInfos.length > 0 && (
                      <div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            color: '#000',
                          }}
                        >
                          2단계: Calendar 동기화
                        </h3>
                        <WireframeCalendarSync
                          travelInfos={extractedTravelInfos}
                          onSyncComplete={handleCalendarSyncComplete}
                        />
                      </div>
                    )}

                  {currentStep === 'complete' && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                        ✅
                      </div>
                      <h3
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          color: '#000',
                        }}
                      >
                        동기화 완료!
                      </h3>
                      <p
                        style={{
                          color: 'var(--color-text-secondary)',
                          marginBottom: 'var(--space-5)',
                        }}
                      >
                        총 {stats.eventsCreated}개의 캘린더 이벤트가
                        생성되었습니다.
                      </p>
                      <button
                        onClick={resetFlow}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#fff',
                          border: '1px solid #666',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: '14px',
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
                onStatsUpdate={stats =>
                  setStats(prev => ({
                    ...prev,
                    emailsScanned: stats.emailsScanned,
                  }))
                }
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
          <div
            style={{
              border: '1px solid #e0e0e0',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{ fontSize: '64px', color: '#999', marginBottom: '20px' }}
            >
              ⚙️
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#000',
              }}
            >
              서비스 연결이 필요합니다
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-5)',
              }}
            >
              Gmail과 Google Calendar 모두 연결되어야 이 기능을 사용할 수
              있습니다.
            </p>
            <button
              onClick={checkConnections}
              disabled={connectionStatus.loading}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                backgroundColor: connectionStatus.loading
                  ? '#f0f0f0'
                  : '#0066cc',
                color: connectionStatus.loading ? '#999' : '#fff',
                border: 'none',
                cursor: connectionStatus.loading ? 'not-allowed' : 'pointer',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
              }}
            >
              <span>{connectionStatus.loading ? '🔄' : '🔄'}</span>
              연결 상태 확인
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
