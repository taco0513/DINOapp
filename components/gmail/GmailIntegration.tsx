'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TravelInfo } from '@/lib/gmail';
import {
  TravelStats,
  TravelInsight,
  generateTravelStats,
  generateTravelInsights,
} from '@/lib/gmail-analytics';
import CalendarSync from '@/components/calendar/CalendarSync';

interface GmailConnectionStatus {
  connected: boolean;
  message: string;
}

interface TravelEmail {
  emailId: string;
  subject: string;
  from: string;
  departureDate?: string;
  returnDate?: string;
  destination?: string;
  departure?: string;
  flightNumber?: string;
  bookingReference?: string;
  hotelName?: string;
  passengerName?: string;
  category?:
    | 'airline'
    | 'hotel'
    | 'travel_agency'
    | 'rental'
    | 'booking_platform';
  confidence: number;
  extractedData?: {
    dates: string[];
    airports: string[];
    flights: string[];
    bookingCodes: string[];
    matchedPatterns: string[];
  };
}

export default function GmailIntegration() {
  const { data: session } = useSession();
  const [connectionStatus, setConnectionStatus] =
    useState<GmailConnectionStatus | null>(null);
  const [travelEmails, setTravelEmails] = useState<TravelEmail[]>([]);
  const [travelStats, setTravelStats] = useState<TravelStats | null>(null);
  const [travelInsights, setTravelInsights] = useState<TravelInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'analysis' | 'calendar' | 'stats' | 'insights'
  >('analysis');

  // Gmail 연결 상태 확인
  const checkConnection = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/gmail/check');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check Gmail connection');
      }

      setConnectionStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setConnectionStatus({ connected: false, message: '연결 확인 실패' });
    } finally {
      setIsLoading(false);
    }
  };

  // 여행 이메일 분석
  const analyzeTravelEmails = async (maxResults: number = 20) => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(
        `/api/gmail/analyze?maxResults=${maxResults}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze travel emails');
      }

      const emails = data.travelInfos || [];
      setTravelEmails(emails);

      // 통계 및 인사이트 생성
      if (emails.length > 0) {
        const stats = generateTravelStats(emails);
        const insights = generateTravelInsights(stats, emails);
        setTravelStats(stats);
        setTravelInsights(insights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 연결 상태 확인
  useEffect(() => {
    if (session) {
      checkConnection();
    }
  }, [session]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'tip':
        return '💡';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'alert alert-success';
      case 'tip':
        return 'alert';
      case 'warning':
        return 'alert alert-warning';
      default:
        return 'alert';
    }
  };

  if (!session) {
    return (
      <div className='alert alert-warning'>
        <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
          Gmail 통합
        </h3>
        <p className='text-yellow-700'>
          Gmail 통합을 사용하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          📧 Gmail 여행 이메일 분석 & 캘린더 동기화
        </h2>
        <p className='text-gray-600 mb-6'>
          Gmail에서 여행 관련 이메일을 자동으로 찾아 분석하고 Google Calendar에
          동기화합니다.
        </p>

        {/* 연결 상태 */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-700 mb-3'>연결 상태</h3>

          {connectionStatus && (
            <div
              className={`alert ${
                connectionStatus.connected ? 'alert-success' : 'alert-error'
              }`}
            >
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    connectionStatus.connected ? 'badge-success' : 'badge-error'
                  }`}
                />
                <span
                  className={`font-medium ${
                    connectionStatus.connected
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  {connectionStatus.message}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={checkConnection}
            disabled={isLoading}
            className='btn btn-primary btn-full mt-3'
          >
            {isLoading ? '확인 중...' : '연결 상태 확인'}
          </button>
        </div>

        {/* 이메일 분석 컨트롤 */}
        {connectionStatus?.connected && (
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-700'>
                여행 이메일 분석
              </h3>
              {travelEmails.length > 0 && (
                <span className='badge'>{travelEmails.length}개 발견</span>
              )}
            </div>

            <div className='flex items-center space-x-3 mb-4'>
              <button
                onClick={() => analyzeTravelEmails(10)}
                disabled={isLoading}
                className='btn btn-primary'
              >
                {isLoading ? '분석 중...' : '🔍 최근 10개 분석'}
              </button>

              <button
                onClick={() => analyzeTravelEmails(20)}
                disabled={isLoading}
                className='btn btn-primary'
              >
                {isLoading ? '분석 중...' : '🔍 최근 20개 분석'}
              </button>

              <button
                onClick={() => analyzeTravelEmails(50)}
                disabled={isLoading}
                className='btn btn-primary'
              >
                {isLoading ? '분석 중...' : '📊 전체 분석 (50개)'}
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className='alert alert-error mb-4'>
                <p className='text-red-700'>❌ {error}</p>
              </div>
            )}
          </div>
        )}

        {/* 분석 결과 탭 */}
        {travelEmails.length > 0 && (
          <div className='w-full'>
            <div className='mb-6'>
              <nav className='nav-menu flex gap-4'>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`btn btn-ghost btn-sm ${
                    activeTab === 'analysis' ? 'active' : ''
                  }`}
                >
                  🔍 분석결과
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`btn btn-ghost btn-sm ${
                    activeTab === 'calendar' ? 'active' : ''
                  }`}
                >
                  📅 캘린더 동기화
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`btn btn-ghost btn-sm ${
                    activeTab === 'stats' ? 'active' : ''
                  }`}
                >
                  📊 통계
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`btn btn-ghost btn-sm ${
                    activeTab === 'insights' ? 'active' : ''
                  }`}
                >
                  💡 인사이트
                </button>
              </nav>
            </div>

            {activeTab === 'analysis' && (
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {travelEmails.map((email, index) => (
                  <div key={email.emailId} className='card'>
                    <div className='flex justify-between items-start mb-2'>
                      <h5 className='font-medium text-gray-900 truncate flex-1 mr-2'>
                        {email.subject}
                      </h5>
                      <div className='flex items-center gap-2'>
                        {email.category && (
                          <span className='badge'>
                            {email.category === 'airline'
                              ? '항공사'
                              : email.category === 'hotel'
                                ? '호텔'
                                : email.category === 'travel_agency'
                                  ? '여행사'
                                  : email.category === 'rental'
                                    ? '렌터카'
                                    : email.category === 'booking_platform'
                                      ? '예약사이트'
                                      : email.category}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            email.confidence >= 0.7
                              ? 'bg-green-100 text-green-800'
                              : email.confidence >= 0.5
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          신뢰도 {Math.round(email.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <p className='text-sm text-gray-600 mb-3'>{email.from}</p>

                    <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
                      {email.departureDate && (
                        <div className='flex items-center gap-1'>
                          <span>✈️</span>
                          <span className='font-medium text-gray-700'>
                            출발:
                          </span>
                          <span className='text-gray-600'>
                            {email.departureDate}
                          </span>
                        </div>
                      )}
                      {email.returnDate && (
                        <div className='flex items-center gap-1'>
                          <span>🏠</span>
                          <span className='font-medium text-gray-700'>
                            귀국:
                          </span>
                          <span className='text-gray-600'>
                            {email.returnDate}
                          </span>
                        </div>
                      )}
                      {email.departure && (
                        <div className='flex items-center gap-1'>
                          <span>📍</span>
                          <span className='font-medium text-gray-700'>
                            출발지:
                          </span>
                          <span className='text-gray-600'>
                            {email.departure}
                          </span>
                        </div>
                      )}
                      {email.destination && (
                        <div className='flex items-center gap-1'>
                          <span>🎯</span>
                          <span className='font-medium text-gray-700'>
                            목적지:
                          </span>
                          <span className='text-gray-600'>
                            {email.destination}
                          </span>
                        </div>
                      )}
                      {email.flightNumber && (
                        <div className='flex items-center gap-1'>
                          <span>✈️</span>
                          <span className='font-medium text-gray-700'>
                            항공편:
                          </span>
                          <span className='text-gray-600'>
                            {email.flightNumber}
                          </span>
                        </div>
                      )}
                      {email.bookingReference && (
                        <div className='flex items-center gap-1'>
                          <span>📋</span>
                          <span className='font-medium text-gray-700'>
                            예약번호:
                          </span>
                          <span className='text-gray-600'>
                            {email.bookingReference}
                          </span>
                        </div>
                      )}
                      {email.hotelName && (
                        <div className='flex items-center gap-1'>
                          <span>🏨</span>
                          <span className='font-medium text-gray-700'>
                            호텔:
                          </span>
                          <span className='text-gray-600'>
                            {email.hotelName}
                          </span>
                        </div>
                      )}
                      {email.passengerName && (
                        <div className='flex items-center gap-1'>
                          <span>👤</span>
                          <span className='font-medium text-gray-700'>
                            승객:
                          </span>
                          <span className='text-gray-600'>
                            {email.passengerName}
                          </span>
                        </div>
                      )}
                    </div>

                    {email.extractedData &&
                      email.extractedData.matchedPatterns.length > 0 && (
                        <div className='mb-3'>
                          <p className='text-xs text-gray-500 mb-1'>
                            매칭된 패턴:
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {email.extractedData.matchedPatterns.map(
                              (pattern, idx) => (
                                <span key={idx} className='badge'>
                                  {pattern}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {email.confidence >= 0.5 && (
                      <button
                        className='btn btn-primary btn-sm'
                        onClick={() => {
                          // TODO: 여행 기록 추가 페이지로 이동하며 정보 전달
                          // TODO: Add travel record
                        }}
                      >
                        📅 여행 기록 추가
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <CalendarSync
                travelInfos={travelEmails.map(email => ({
                  ...email,
                  extractedData: email.extractedData || {
                    dates: [],
                    airports: [],
                    flights: [],
                    bookingCodes: [],
                    matchedPatterns: [],
                  },
                }))}
                onSyncComplete={result => {
                  // Calendar sync completed
                }}
              />
            )}

            {activeTab === 'stats' && travelStats && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {travelStats.totalTrips}
                    </div>
                    <div className='text-sm text-gray-600'>총 여행 수</div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {travelStats.totalDestinations}
                    </div>
                    <div className='text-sm text-gray-600'>방문 도시</div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {travelStats.totalAirlines}
                    </div>
                    <div className='text-sm text-gray-600'>이용 항공사</div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-orange-600'>
                      {travelStats.travelFrequency.averageTripsPerMonth}
                    </div>
                    <div className='text-sm text-gray-600'>월평균 여행</div>
                  </div>
                </div>

                {travelStats.mostVisitedDestinations.length > 0 && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>🌍 자주 방문한 목적지</h4>
                    <div className='space-y-2'>
                      {travelStats.mostVisitedDestinations.map((dest, idx) => (
                        <div
                          key={dest.code}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm'>
                            {dest.name} ({dest.code})
                          </span>
                          <span className='badge'>{dest.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {travelStats.preferredAirlines.length > 0 && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>✈️ 선호 항공사</h4>
                    <div className='space-y-2'>
                      {travelStats.preferredAirlines.map((airline, idx) => (
                        <div
                          key={airline.code}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm'>
                            {airline.name} ({airline.code})
                          </span>
                          <span className='badge'>{airline.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className='space-y-3'>
                {travelInsights.length > 0 ? (
                  travelInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
                    >
                      <div className='flex items-start space-x-2'>
                        <span className='text-xl'>
                          {getInsightIcon(insight.type)}
                        </span>
                        <div className='flex-1'>
                          <h4 className='font-medium mb-1'>{insight.title}</h4>
                          <p className='text-sm'>{insight.description}</p>
                          {insight.actionable && insight.action && (
                            <button className='btn btn-sm btn-ghost mt-2'>
                              {insight.action}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='text-4xl mb-4'>🤖</div>
                    <p>
                      충분한 데이터가 모이면 개인화된 인사이트를 제공합니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {travelEmails.length === 0 &&
          !isLoading &&
          !error &&
          connectionStatus?.connected && (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-4'>🔍</div>
              <p>분석할 여행 이메일을 찾지 못했습니다.</p>
              <p className='text-sm mt-1'>다른 검색 범위로 시도해보세요.</p>
            </div>
          )}
      </div>

      {/* 개인정보 보호 안내 */}
      <div className='alert'>
        <h4 className='font-medium text-blue-900 mb-2'>🔒 개인정보 보호</h4>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>• 이메일 내용은 로컬에서만 처리되며 외부로 전송되지 않습니다</li>
          <li>• 읽기 전용 권한만 사용하여 이메일을 수정할 수 없습니다</li>
          <li>• 분석된 정보는 사용자 승인 후에만 저장됩니다</li>
          <li>• 언제든지 Gmail 연동을 해제할 수 있습니다</li>
          <li>
            • Google Calendar 동기화는 선택사항이며 언제든 취소 가능합니다
          </li>
        </ul>
      </div>
    </div>
  );
}
