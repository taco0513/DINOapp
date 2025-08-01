'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import type { CountryVisit } from '@/types/global';
// import { PageIcons } from '@/components/common/PageHeader';
import { t } from '@/lib/i18n';
import SchengenUsageChart from '@/components/schengen/SchengenUsageChart';
// import { PullToRefresh } from '@/components/mobile/PullToRefresh';
// import { SwipeableCard } from '@/components/mobile/SwipeableCard';
import { TrendingUp, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryUtils } from '@/constants/countries';
import { StandardPageLayout, StandardCard, StatsCard, EmptyState } from '@/components/layout/StandardPageLayout';
import { EnhancedSchengenPlanner } from '@/components/schengen/EnhancedSchengenPlanner';

export default function SchengenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasTrips, setHasTrips] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<CountryVisit[]>([]);
  const [schengenData, setSchengenData] = useState<any>(null);
  const [futureDate, setFutureDate] = useState<string>('');
  const [futureDuration, setFutureDuration] = useState<number>(7);
  const [futureCountry, setFutureCountry] = useState<string>('France');
  const [futureAnalysis, setFutureAnalysis] = useState<any>(null);
  const [_isMobile, _setIsMobile] = useState(false);
  const [userVisas, setUserVisas] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as any);
      return;
    }

    loadSchengenData();
    loadUserVisas();
  }, [session, status, router]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      _setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadSchengenData = async () => {
    setLoading(true);
    try {
      const [tripsResponse, schengenResponse] = await Promise.all([
        ApiClient.getTrips(),
        ApiClient.getSchengenStatus(),
      ]);

      if (tripsResponse.success && tripsResponse.data) {
        setTrips(tripsResponse.data);
        setHasTrips(tripsResponse.data.length > 0);
      } else {
        setHasTrips(false);
      }

      if (schengenResponse.success && schengenResponse.data) {
        setSchengenData(schengenResponse.data);
      }
    } catch (error) {
      console.error('Error loading Schengen data:', error);
      setHasTrips(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVisas = async () => {
    try {
      const response = await fetch('/api/visas?status=active');
      const result = await response.json();

      if (result.success) {
        // 셰겐 국가 비자만 필터링
        const schengenCountries = [
          'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
          'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
          'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
          'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
        ];
        
        const schengenVisas = result.data
          .filter((visa: any) => schengenCountries.includes(visa.countryName))
          .map((visa: any) => ({
            ...visa,
            expiryDate: visa.expiryDate, // API에서 이미 문자열로 반환
          }));
        
        setUserVisas(schengenVisas);
      }
    } catch (error) {
      console.error('Error loading user visas:', error);
    }
  };

  const analyzeFutureTrip = () => {
    if (!futureDate || !schengenData) return;

    const schengenCountries = [
      'Austria',
      'Belgium',
      'Czech Republic',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Germany',
      'Greece',
      'Hungary',
      'Iceland',
      'Italy',
      'Latvia',
      'Lithuania',
      'Luxembourg',
      'Malta',
      'Netherlands',
      'Norway',
      'Poland',
      'Portugal',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
    ];

    // 미래 여행 날짜 계산
    const startDate = new Date(futureDate);
    const endDate = new Date(futureDate);
    endDate.setDate(endDate.getDate() + futureDuration - 1);

    // 180일 윈도우 계산
    const windowStart = new Date(startDate);
    windowStart.setDate(windowStart.getDate() - 180);

    // 현재까지의 셰겐 사용일수 계산
    let usedDays = 0;
    trips.forEach(trip => {
      if (!schengenCountries.includes(trip.country)) return;

      const entryDate = new Date(trip.entryDate);
      const exitDate = trip.exitDate ? new Date(trip.exitDate) : new Date();

      // 180일 윈도우 내의 여행만 계산
      const overlapStart = Math.max(entryDate.getTime(), windowStart.getTime());
      const overlapEnd = Math.min(exitDate.getTime(), startDate.getTime());

      if (overlapStart <= overlapEnd) {
        const days =
          Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
        usedDays += days;
      }
    });

    // 미래 여행을 포함한 총 사용일수
    const totalDays = usedDays + futureDuration;

    setFutureAnalysis({
      startDate: startDate.toLocaleDateString('ko-KR'),
      endDate: endDate.toLocaleDateString('ko-KR'),
      duration: futureDuration,
      currentUsed: usedDays,
      totalAfterTrip: totalDays,
      isAllowed: totalDays <= 90,
      remainingDays: 90 - totalDays,
      recommendation:
        totalDays > 90
          ? `⚠️ 위험: 이 여행을 가면 셰겐 규정을 ${totalDays - 90}일 초과하게 됩니다!`
          : totalDays > 80
            ? `⚡ 주의: 여행 후 ${90 - totalDays}일만 남게 됩니다.`
            : `✅ 안전: 여행 후에도 ${90 - totalDays}일의 여유가 있습니다.`,
    });
  };

  if (status === 'loading' || !session) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-gray-600'>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title={t('schengen.title')}
      description={t('schengen.description')}
      icon="Schengen"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.schengen') },
      ]}
      headerActions={
        <div className="flex gap-2">
          {hasTrips && (
            <Button variant="outline" size="sm" asChild>
              <Link href='/trips'>
                <TrendingUp className='h-4 w-4 mr-2' />
                여행 기록
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href='/my-visas'>
              <CreditCard className='h-4 w-4 mr-2' />
              내 비자
            </Link>
          </Button>
        </div>
      }
    >

      {loading ? (
        <StandardCard>
          <div className='text-center py-12'>
            <div className='text-gray-600'>{t('common.loading')}</div>
          </div>
        </StandardCard>
      ) : hasTrips ? (
        <div className='space-y-8'>
          {/* Schengen Status Card */}
          <StandardCard title={t('schengen.current_status')}>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <StatsCard
                value={schengenData ? `${schengenData.status.usedDays} / 90` : '0 / 90'}
                label={t('schengen.used_days')}
                color='blue'
              />
              <StatsCard
                value={schengenData ? schengenData.status.remainingDays : '90'}
                label={t('schengen.remaining_days')}
                color='green'
              />
              <StatsCard
                value={schengenData ? schengenData.status.nextResetDate : '---'}
                label={t('schengen.next_reset')}
                color='purple'
              />
            </div>

            {/* Compliance Status and Warnings */}
            {schengenData && (
              <div className='mt-6'>
                <div
                  className={`text-center font-semibold p-4 rounded-lg border ${
                    schengenData.status.isCompliant 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {schengenData.status.isCompliant
                    ? t('schengen.compliant')
                    : t('schengen.violation')}
                </div>

                {schengenData.warnings &&
                  schengenData.warnings.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      {schengenData.warnings.map(
                        (warning: string, index: number) => (
                          <div
                            key={index}
                            className='bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg'
                          >
                            {warning}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            )}
          </StandardCard>

          {/* Usage Chart */}
          <StandardCard title='180일 사용 현황'>
            <SchengenUsageChart visits={trips} />
          </StandardCard>

          {/* Enhanced Future Trip Planner */}
          <EnhancedSchengenPlanner 
            userVisas={userVisas}
            onRefresh={() => {
              // 내 비자 페이지로 이동
              window.open('/my-visas', '_blank');
            }}
          />

          {/* Legacy Future Trip Planner - 비교용으로 유지 */}
          <StandardCard title='📊 기본 여행 시뮬레이터 (참고용)'>
            <p className='text-gray-600 mb-6'>
              기본 셰겐 규칙만 적용한 단순 계산기 (비자 정보 미포함)
            </p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>여행 시작일</label>
                <input
                  type='date'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={futureDate}
                  onChange={e => setFutureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>체류 일수</label>
                <input
                  type='number'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={futureDuration}
                  onChange={e =>
                    setFutureDuration(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  min='1'
                  max='90'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>방문 국가</label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={futureCountry}
                  onChange={e => setFutureCountry(e.target.value)}
                >
                  {CountryUtils.getSchengenCountryOptions().map(option => (
                    <option key={option.code} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={analyzeFutureTrip}
              disabled={!futureDate}
              className='w-full mb-6'
              variant='outline'
            >
              🔍 기본 검증 (비자 정보 제외)
            </Button>

            {futureAnalysis && (
              <div
                className={`p-6 rounded-lg border-2 ${
                  futureAnalysis.isAllowed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h4 className='text-lg font-semibold mb-4'>
                  {futureAnalysis.isAllowed
                    ? '✅ 기본 규칙 준수'
                    : '❌ 기본 규칙 위반'}
                </h4>

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>여행 기간:</span>
                    <strong>
                      {futureAnalysis.startDate} ~ {futureAnalysis.endDate} (
                      {futureAnalysis.duration}일)
                    </strong>
                  </div>
                  <div className='flex justify-between'>
                    <span>현재 사용일수:</span>
                    <strong>{futureAnalysis.currentUsed}일</strong>
                  </div>
                  <div className='flex justify-between'>
                    <span>여행 후 총 사용일수:</span>
                    <strong
                      className={futureAnalysis.totalAfterTrip > 90 ? 'text-red-600' : ''}
                    >
                      {futureAnalysis.totalAfterTrip}일 / 90일
                    </strong>
                  </div>

                  <div className='mt-4 p-3 bg-white bg-opacity-50 rounded-lg text-sm font-medium'>
                    {futureAnalysis.recommendation}
                  </div>
                </div>
              </div>
            )}

            {!futureAnalysis && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <p className='text-sm text-blue-800'>
                  💡 더 정확한 검증을 원하면 위의 "향상된 여행 계획 검증기"를 사용하세요
                </p>
              </div>
            )}
          </StandardCard>
        </div>
      ) : (
        <EmptyState
          icon='🇪🇺'
          title='셰겐 계산기'
          description='여행 기록을 추가하면 자동으로 셰겐 지역 체류 일수가 계산됩니다'
          action={
            <Button asChild>
              <Link href='/trips'>
                여행 기록 추가하기
              </Link>
            </Button>
          }
        >
          <StandardCard title='📚 셰겐 90/180일 규칙' className='mt-8'>
            <div className='text-left max-w-2xl mx-auto'>
              <div className='space-y-2 text-sm text-gray-600'>
                <p className='flex items-start'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다
                </p>
                <p className='flex items-start'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  이 규칙은 롤링 방식으로 적용됩니다 (고정된 기간이 아님)
                </p>
                <p className='flex items-start'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  매일 지난 180일간의 체류 일수를 계산합니다
                </p>
                <p className='flex items-start'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  비자 없이 입국하는 관광객에게 적용됩니다
                </p>
                <p className='flex items-start'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  장기 체류 비자나 거주권이 있으면 규칙이 다를 수 있습니다
                </p>
              </div>
            </div>
          </StandardCard>
        </EmptyState>
      )}
    </StandardPageLayout>
  );
}
