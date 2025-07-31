'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TravelInfo } from '@/lib/gmail';
import StayVisualizationCalendar from '@/components/calendar/StayVisualizationCalendar';
import CalendarSync from '@/components/calendar/CalendarSync';
import { Trip } from '@/types/database';

interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  lastSyncDate?: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [calendarStats, setCalendarStats] = useState<CalendarStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sync' | 'visualization' | 'manage'
  >('overview');

  // Gmail에서 여행 정보 가져오기
  const _loadTravelInfos = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/gmail/analyze');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load travel information');
      }

      if (data.success && data.travelInfos) {
        setTravelInfos(data.travelInfos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // 캘린더 통계 가져오기
  const loadCalendarStats = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/calendar/check');
      const data = await response.json();

      if (response.ok && data.success) {
        setCalendarStats(
          data.stats || {
            totalEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
          }
        );
      }
    } catch (__err) {
      // Failed to load calendar stats
    }
  };

  // 여행 기록 가져오기
  const loadTrips = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/trips');
      const data = await response.json();

      if (response.ok && data.success) {
        setTrips(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    }
  };

  // 동기화 완료 후 콜백
  const _handleSyncComplete = (result: any) => {
    if (result.success) {
      loadCalendarStats();
    }
  };

  useEffect(() => {
    if (session) {
      loadTravelInfos();
      loadCalendarStats();
      loadTrips();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}
          >
            로딩 중...
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            border: '1px solid #e0e0e0',
            padding: '60px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#000',
            }}
          >
            로그인이 필요합니다
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
            Google Calendar 통합을 사용하려면 먼저 로그인해주세요.
          </p>
          <Link
            href='/auth/signin'
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '40px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#000',
              }}
            >
              📅 Calendar 통합
            </h1>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Gmail에서 추출한 여행 정보를 Google Calendar와 동기화하세요
            </p>
          </div>
          <button
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            🔗 Google Calendar 열기
          </button>
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '5px',
              }}
            >
              {calendarStats.totalEvents}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>전체 이벤트</div>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '5px',
              }}
            >
              {calendarStats.upcomingEvents}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>예정된 여행</div>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '5px',
              }}
            >
              {calendarStats.pastEvents}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>지난 여행</div>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '5px',
              }}
            >
              {travelInfos.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Gmail 분석</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff3f3',
              padding: '20px',
              marginBottom: '40px',
            }}
          >
            <div style={{ color: '#d73a49', fontSize: '14px' }}>⚠️ {error}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'overview' ? '#fff' : '#f9f9f9',
                borderBottom:
                  activeTab === 'overview'
                    ? '2px solid #000'
                    : '2px solid transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: activeTab === 'overview' ? '#000' : '#666',
              }}
            >
              👁️ 개요
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'sync' ? '#fff' : '#f9f9f9',
                borderBottom:
                  activeTab === 'sync'
                    ? '2px solid #000'
                    : '2px solid transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: activeTab === 'sync' ? '#000' : '#666',
              }}
            >
              🔄 동기화
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor:
                  activeTab === 'visualization' ? '#fff' : '#f9f9f9',
                borderBottom:
                  activeTab === 'visualization'
                    ? '2px solid #000'
                    : '2px solid transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: activeTab === 'visualization' ? '#000' : '#666',
              }}
            >
              📊 시각화
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'manage' ? '#fff' : '#f9f9f9',
                borderBottom:
                  activeTab === 'manage'
                    ? '2px solid #000'
                    : '2px solid transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: activeTab === 'manage' ? '#000' : '#666',
              }}
            >
              ⚙️ 관리
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '40px' }}>
            {/* Overview Section */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#000',
                }}
              >
                Google Calendar 통합 개요
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '30px',
                }}
              >
                DINO는 Gmail에서 추출한 여행 정보를 Google Calendar와 자동으로
                동기화합니다
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '30px',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      color: '#000',
                    }}
                  >
                    ✅ 지원되는 기능
                  </h4>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.8',
                    }}
                  >
                    <div>• 항공편 예약 자동 추가</div>
                    <div>• 호텔 예약 일정 동기화</div>
                    <div>• 여행 기간 자동 계산</div>
                    <div>• 중복 이벤트 자동 방지</div>
                  </div>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      color: '#000',
                    }}
                  >
                    ⚙️ 사용 방법
                  </h4>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.8',
                    }}
                  >
                    <div>1. Gmail 연결 및 이메일 분석</div>
                    <div>2. 동기화할 캘린더 선택</div>
                    <div>3. 여행 정보 선택 및 동기화</div>
                    <div>4. Google Calendar에서 확인</div>
                  </div>
                </div>
              </div>

              {travelInfos.length === 0 && (
                <div
                  style={{
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fffbf0',
                    padding: '20px',
                    marginTop: '30px',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  ⚠️ 아직 Gmail에서 여행 정보를 분석하지 않았습니다.
                  <Link
                    href='/gmail'
                    style={{
                      color: '#000',
                      textDecoration: 'underline',
                      marginLeft: '5px',
                    }}
                  >
                    Gmail 페이지
                  </Link>
                  에서 먼저 이메일을 분석해주세요.
                </div>
              )}
            </div>

            {/* Travel Info Preview */}
            {travelInfos.length > 0 && (
              <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        color: '#000',
                      }}
                    >
                      분석된 여행 정보
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Gmail에서 추출된 여행 정보들입니다
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #e0e0e0',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    {travelInfos.length}개 발견
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {travelInfos.slice(0, 3).map(info => (
                    <div
                      key={info.emailId}
                      style={{ border: '1px solid #e0e0e0', padding: '20px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#000',
                          }}
                        >
                          {info.subject}
                        </h4>
                        <div
                          style={{
                            padding: '3px 8px',
                            backgroundColor:
                              info.confidence >= 0.7 ? '#000' : '#f0f0f0',
                            color: info.confidence >= 0.7 ? '#fff' : '#666',
                            fontSize: '12px',
                          }}
                        >
                          신뢰도 {Math.round(info.confidence * 100)}%
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '10px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        {info.departureDate && (
                          <div>✈️ 출발: {info.departureDate}</div>
                        )}
                        {info.destination && (
                          <div>📍 목적지: {info.destination}</div>
                        )}
                        {info.hotelName && <div>🏨 숙소: {info.hotelName}</div>}
                      </div>
                    </div>
                  ))}

                  {travelInfos.length > 3 && (
                    <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                      <button
                        onClick={() => setActiveTab('sync')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        모든 여행 정보 보기 ({travelInfos.length - 3}개 더)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <div>
            {travelInfos.length > 0 ? (
              <CalendarSync
                travelInfos={travelInfos}
                onSyncComplete={handleSyncComplete}
              />
            ) : (
              <div
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '60px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#000',
                  }}
                >
                  동기화할 여행 정보가 없습니다
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '30px',
                  }}
                >
                  먼저 Gmail에서 여행 이메일을 분석해주세요.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                  }}
                >
                  <Link
                    href='/gmail'
                    style={{
                      display: 'inline-block',
                      padding: '12px 30px',
                      backgroundColor: '#000',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Gmail 분석하기
                  </Link>
                  <button
                    onClick={loadTravelInfos}
                    disabled={isLoading}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      fontSize: '14px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? '🔄 로딩중...' : '🔄 새로고침'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visualization' && (
          <div>
            <StayVisualizationCalendar
              trips={trips}
              currentCountry='KR'
              onDateClick={(date, dayTrips) => {
                console.log('Selected date:', date, 'Trips:', dayTrips);
              }}
            />
          </div>
        )}

        {activeTab === 'manage' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
            }}
          >
            {/* Calendar Settings */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#000',
                }}
              >
                캘린더 설정
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '30px',
                }}
              >
                Google Calendar 연결 및 설정을 관리합니다
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#000',
                      marginBottom: '5px',
                    }}
                  >
                    Google Calendar 연결
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    {session?.user?.email || '연결된 계정 없음'}
                  </p>
                </div>
                <div
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                >
                  연결됨
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://calendar.google.com/calendar/u/0/r/settings',
                    '_blank'
                  )
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🔗 Google Calendar 설정
              </button>
            </div>

            {/* Sync History */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#000',
                }}
              >
                동기화 내역
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '30px',
                }}
              >
                최근 동기화 활동을 확인합니다
              </p>

              {calendarStats.lastSyncDate ? (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#000' }}>
                      마지막 동기화
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {calendarStats.lastSyncDate}
                    </span>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span style={{ fontSize: '14px', color: '#000' }}>
                      총 이벤트
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#000',
                      }}
                    >
                      {calendarStats.totalEvents}개
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px 0',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    🕒
                  </div>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    아직 동기화 내역이 없습니다
                  </p>
                </div>
              )}

              <button
                onClick={loadCalendarStats}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🔄 내역 새로고침
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
