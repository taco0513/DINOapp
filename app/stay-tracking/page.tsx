'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import {
  MapPin,
  TrendingUp,
  Clock,
  Calendar,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { StandardPageLayout, StandardCard, StatsCard } from '@/components/layout/StandardPageLayout';
import { CurrentStayTracker } from '@/components/stay/CurrentStayTracker';
import { AddStayModal } from '@/components/stay/AddStayModal';
import { ExitCountryModal } from '@/components/stay/ExitCountryModal';
import { OverstayWarningDashboard } from '@/components/overstay/OverstayWarningDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import Link from 'next/link';

interface StayStats {
  totalCurrentStays: number;
  countriesStaying: string[];
  totalDaysThisYear: number;
  averageStayDuration: number;
  criticalStays: number;
  warningStays: number;
}

interface CurrentStay {
  id: string;
  countryName: string;
  visaType: string;
  entryDate: string;
  maxStayDays: number | null;
  status: 'active' | 'warning' | 'critical' | 'exceeded';
}

export default function StayTrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<StayStats | null>(null);
  const [currentStays, setCurrentStays] = useState<CurrentStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState<CurrentStay | null>(null);
  const [summary, setSummary] = useState({
    hasActiveStays: false,
    hasCriticalStays: false,
    hasWarningStays: false,
    needsImmediateAction: false
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as any);
      return;
    }

    loadStayData();
  }, [session, status, router]);

  const loadStayData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stay-tracking');
      const result = await response.json();

      if (result.success) {
        setCurrentStays(result.data.currentStays);
        setStats(result.data.stats);
        setSummary(result.data.summary);
      } else {
        logger.error('Failed to load stay data:', result.error);
      }
    } catch (error) {
      logger.error('Error loading stay data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitCountry = (stayId: string) => {
    const stay = currentStays.find(s => s.id === stayId);
    if (stay) {
      setSelectedStay(stay);
      setExitModalOpen(true);
    }
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
      title="체류 추적"
      description="현재 체류 중인 국가와 체류일을 실시간으로 추적하고 관리하세요"
      icon="MapPin"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: '체류 추적' },
      ]}
    >
      {/* 긴급 알림 */}
      {summary.needsImmediateAction && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            🚨 즉시 조치가 필요한 체류 상황이 있습니다! 아래 체류 현황을 확인하세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 체류 통계 */}
      {stats && (
        <StandardCard title="체류 현황 요약" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCard
              icon={<MapPin className="h-5 w-5" />}
              value={stats.totalCurrentStays}
              label="현재 체류국"
              color="blue"
            />
            <StatsCard
              icon={<Calendar className="h-5 w-5" />}
              value={stats.totalDaysThisYear}
              label="올해 총 체류일"
              color="green"
            />
            <StatsCard
              icon={<TrendingUp className="h-5 w-5" />}
              value={stats.averageStayDuration}
              label="평균 체류일"
              color="purple"
            />
            <StatsCard
              icon={<BarChart3 className="h-5 w-5" />}
              value={stats.criticalStays + stats.warningStays}
              label="주의 필요"
              color={stats.criticalStays > 0 ? "red" : stats.warningStays > 0 ? "orange" : "green"}
            />
          </div>

          {/* 체류 중인 국가 목록 */}
          {stats.countriesStaying.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                현재 체류 중인 국가
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.countriesStaying.map((country, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}
        </StandardCard>
      )}

      {/* 체류 경고 대시보드 */}
      <StandardCard 
        title="체류 기간 경고" 
        className="mb-6"
        action={
          <Link href='/overstay-warnings'>
            <Button size="sm" variant="outline">
              전체 보기
            </Button>
          </Link>
        }
      >
        <OverstayWarningDashboard />
      </StandardCard>

      {/* 현재 체류 추적기 */}
      <CurrentStayTracker
        onAddEntry={() => setAddModalOpen(true)}
        onExitCountry={handleExitCountry}
      />

      {/* 입국 기록 추가 모달 */}
      <AddStayModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onStayAdded={loadStayData}
      />

      {/* 출국 기록 모달 */}
      {selectedStay && (
        <ExitCountryModal
          open={exitModalOpen}
          onOpenChange={setExitModalOpen}
          stayId={selectedStay.id}
          countryName={selectedStay.countryName}
          entryDate={selectedStay.entryDate}
          visaType={selectedStay.visaType}
          maxStayDays={selectedStay.maxStayDays}
          onExitRecorded={() => {
            loadStayData();
            setSelectedStay(null);
          }}
        />
      )}

      {/* 도움말 섹션 */}
      <StandardCard title="체류 추적 가이드" className="mt-8">
        <div className="text-left max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">입국 기록</h4>
              <div className="space-y-2">
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  새로운 국가에 입국할 때마다 기록을 추가하세요
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  사용할 비자를 정확히 선택해주세요
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  입국 목적과 메모를 남겨 추후 참고하세요
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">체류 관리</h4>
              <div className="space-y-2">
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  실시간으로 체류일과 잔여일수를 확인하세요
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  체류 한도 초과 전에 미리 알림을 받으세요
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  출국 시 정확한 출국일을 기록하세요
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">중요 안내</h4>
                <p className="text-sm text-yellow-700">
                  이 시스템은 참고용이며, 실제 출입국 관련 결정은 해당 국가의 공식 규정을 확인하시기 바랍니다. 
                  체류 기간 초과는 심각한 법적 문제를 야기할 수 있으므로 항상 여유를 두고 관리하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}