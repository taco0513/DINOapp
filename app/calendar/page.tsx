'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TravelInfo } from '@/lib/gmail';
import StayVisualizationCalendar from '@/components/calendar/StayVisualizationCalendar';
import CalendarSync from '@/components/calendar/CalendarSync';
import { Trip } from '@/types/database';
import { Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';

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
  const loadTravelInfos = async () => {
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
    } catch (err) {
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
  const handleSyncComplete = (result: any) => {
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
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <HydrationSafeLoading
            fallback='Loading...'
            className='mb-4 text-sm text-secondary'
            translationKey='common.loading'
          />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='card p-16 text-center max-w-md'>
          <div className='text-5xl mb-5'>📅</div>
          <h3 className='text-lg font-bold mb-2'>로그인이 필요합니다</h3>
          <p className='text-sm text-secondary mb-8'>
            Google Calendar 통합을 사용하려면 먼저 로그인해주세요.
          </p>
          <Link href='/auth/signin' className='btn btn-primary'>
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <PageHeader
          title='📅 Calendar 통합'
          description='Gmail에서 추출한 여행 정보를 Google Calendar와 동기화하세요'
        />

        {/* Action Button */}
        <div className='flex justify-end mb-8'>
          <button
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            className='btn btn-ghost flex items-center gap-2'
          >
            <ExternalLink className='h-4 w-4' />
            Google Calendar 열기
          </button>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <div className='card p-5'>
            <div className='text-2xl font-bold mb-1'>
              {calendarStats.totalEvents}
            </div>
            <div className='text-sm text-secondary'>전체 이벤트</div>
          </div>

          <div className='card p-5'>
            <div className='text-2xl font-bold mb-1'>
              {calendarStats.upcomingEvents}
            </div>
            <div className='text-sm text-secondary'>예정된 여행</div>
          </div>

          <div className='card p-5'>
            <div className='text-2xl font-bold mb-1'>
              {calendarStats.pastEvents}
            </div>
            <div className='text-sm text-secondary'>지난 여행</div>
          </div>

          <div className='card p-5'>
            <div className='text-2xl font-bold mb-1'>{travelInfos.length}</div>
            <div className='text-sm text-secondary'>Gmail 분석</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='alert alert-error mb-8'>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className='border-b border-border mb-8'>
          <div className='flex gap-0'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              👁️ 개요
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-5 py-3 border-b-2 transition-colors ${
                activeTab === 'sync'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              🔄 동기화
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`px-5 py-3 border-b-2 transition-colors ${
                activeTab === 'visualization'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              📊 시각화
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-5 py-3 border-b-2 transition-colors ${
                activeTab === 'manage'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              ⚙️ 관리
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Overview Section */}
            <div className='card p-8'>
              <h3 className='text-lg font-bold mb-2'>
                Google Calendar 통합 개요
              </h3>
              <p className='text-sm text-secondary mb-8'>
                DINO는 Gmail에서 추출한 여행 정보를 Google Calendar와 자동으로
                동기화합니다
              </p>

              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h4 className='text-base font-bold mb-4'>✅ 지원되는 기능</h4>
                  <div className='text-sm text-secondary space-y-2'>
                    <div>• 항공편 예약 자동 추가</div>
                    <div>• 호텔 예약 일정 동기화</div>
                    <div>• 여행 기간 자동 계산</div>
                    <div>• 중복 이벤트 자동 방지</div>
                  </div>
                </div>

                <div>
                  <h4 className='text-base font-bold mb-4'>⚙️ 사용 방법</h4>
                  <div className='text-sm text-secondary space-y-2'>
                    <div>1. Gmail 연결 및 이메일 분석</div>
                    <div>2. 동기화할 캘린더 선택</div>
                    <div>3. 여행 정보 선택 및 동기화</div>
                    <div>4. Google Calendar에서 확인</div>
                  </div>
                </div>
              </div>

              {travelInfos.length === 0 && (
                <div className='alert alert-warning mt-8'>
                  ⚠️ 아직 Gmail에서 여행 정보를 분석하지 않았습니다.
                  <Link href='/gmail' className='underline ml-1'>
                    Gmail 페이지
                  </Link>
                  에서 먼저 이메일을 분석해주세요.
                </div>
              )}
            </div>

            {/* Travel Info Preview */}
            {travelInfos.length > 0 && (
              <div className='card p-8'>
                <div className='flex justify-between items-center mb-5'>
                  <div>
                    <h3 className='text-lg font-bold mb-1'>분석된 여행 정보</h3>
                    <p className='text-sm text-secondary'>
                      Gmail에서 추출된 여행 정보들입니다
                    </p>
                  </div>
                  <div className='badge'>{travelInfos.length}개 발견</div>
                </div>

                <div className='space-y-4'>
                  {travelInfos.slice(0, 3).map(info => (
                    <div key={info.emailId} className='card p-5'>
                      <div className='flex justify-between items-center mb-2'>
                        <h4 className='text-sm font-medium truncate'>
                          {info.subject}
                        </h4>
                        <div
                          className={`badge ${
                            info.confidence >= 0.7
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          신뢰도 {Math.round(info.confidence * 100)}%
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-xs text-secondary'>
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
                    <div className='text-center pt-5'>
                      <button
                        onClick={() => setActiveTab('sync')}
                        className='btn btn-ghost'
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
              <div className='card p-16 text-center'>
                <div className='text-5xl mb-5'>📄</div>
                <h3 className='text-lg font-bold mb-2'>
                  동기화할 여행 정보가 없습니다
                </h3>
                <p className='text-sm text-secondary mb-8'>
                  먼저 Gmail에서 여행 이메일을 분석해주세요.
                </p>
                <div className='flex gap-4 justify-center'>
                  <Link href='/gmail' className='btn btn-primary'>
                    Gmail 분석하기
                  </Link>
                  <button
                    onClick={loadTravelInfos}
                    disabled={isLoading}
                    className='btn btn-ghost'
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                        로딩중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        새로고침
                      </>
                    )}
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
          <div className='grid md:grid-cols-2 gap-8'>
            {/* Calendar Settings */}
            <div className='card p-8'>
              <h3 className='text-lg font-bold mb-2'>캘린더 설정</h3>
              <p className='text-sm text-secondary mb-8'>
                Google Calendar 연결 및 설정을 관리합니다
              </p>

              <div className='flex justify-between items-center mb-5'>
                <div>
                  <p className='text-sm font-medium mb-1'>
                    Google Calendar 연결
                  </p>
                  <p className='text-xs text-secondary'>
                    {session?.user?.email || '연결된 계정 없음'}
                  </p>
                </div>
                <div className='badge badge-success'>연결됨</div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://calendar.google.com/calendar/u/0/r/settings',
                    '_blank'
                  )
                }
                className='btn btn-ghost w-full'
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Google Calendar 설정
              </button>
            </div>

            {/* Sync History */}
            <div className='card p-8'>
              <h3 className='text-lg font-bold mb-2'>동기화 내역</h3>
              <p className='text-sm text-secondary mb-8'>
                최근 동기화 활동을 확인합니다
              </p>

              {calendarStats.lastSyncDate ? (
                <div className='mb-5'>
                  <div className='flex justify-between mb-2'>
                    <span className='text-sm'>마지막 동기화</span>
                    <span className='text-sm text-secondary'>
                      {calendarStats.lastSyncDate}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>총 이벤트</span>
                    <span className='text-sm font-medium'>
                      {calendarStats.totalEvents}개
                    </span>
                  </div>
                </div>
              ) : (
                <div className='text-center py-5 mb-5'>
                  <div className='text-3xl mb-2'>🕒</div>
                  <p className='text-sm text-secondary'>
                    아직 동기화 내역이 없습니다
                  </p>
                </div>
              )}

              <button
                onClick={loadCalendarStats}
                className='btn btn-ghost w-full'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                내역 새로고침
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
