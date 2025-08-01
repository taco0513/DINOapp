'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Clock,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { StandardPageLayout, StandardCard } from '@/components/layout/StandardPageLayout';
import { OverstayWarningDashboard } from '@/components/overstay/OverstayWarningDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { t } from '@/lib/i18n';

export default function OverstayWarningsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as any);
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-gray-600'>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title="체류 기간 경고 시스템"
      description="비자 체류 기간을 모니터링하고 초과 위험을 사전에 경고합니다"
      icon="AlertTriangle"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: '체류 경고' },
      ]}
    >
      {/* 시스템 소개 */}
      <StandardCard title="지능형 체류 기간 관리" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-red-800 mb-2">실시간 모니터링</h3>
            <p className="text-sm text-red-700">
              현재 체류 중인 모든 국가의 체류 기간을 실시간으로 추적합니다
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-orange-800 mb-2">사전 경고</h3>
            <p className="text-sm text-orange-700">
              체류 기간 만료 2주 전부터 단계적으로 경고를 제공합니다
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">셰겐 90/180</h3>
            <p className="text-sm text-purple-700">
              복잡한 셰겐 지역 90/180일 규칙을 자동으로 계산합니다
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">법적 보호</h3>
            <p className="text-sm text-green-700">
              체류 초과로 인한 벌금과 입국 금지를 예방합니다
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>중요:</strong> 체류 초과는 벌금, 추방, 향후 입국 거부 등 심각한 법적 결과를 초래할 수 있습니다.
            경고를 주의 깊게 확인하고 적절한 조치를 취하세요.
          </AlertDescription>
        </Alert>
      </StandardCard>

      {/* 경고 대시보드 */}
      <OverstayWarningDashboard />

      {/* 도움말 */}
      <StandardCard title="체류 기간 관리 가이드" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              경고 단계별 의미
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-800">긴급 (3일 이내)</p>
                  <p className="text-gray-600">즉시 출국 준비가 필요합니다. 항공권을 예약하고 필요한 서류를 준비하세요.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-800">높음 (7일 이내)</p>
                  <p className="text-gray-600">출국 일정을 확정하고 체류 연장이 필요한 경우 신청하세요.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-800">보통 (14일 이내)</p>
                  <p className="text-gray-600">출국 계획을 세우고 다음 목적지를 정하세요.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-800">낮음 (14일 이상)</p>
                  <p className="text-gray-600">여유가 있지만 일정을 미리 계획하는 것이 좋습니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              체류 초과 시 결과
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800 mb-1">단기 초과 (1-30일)</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>벌금 부과 (일일 $50-200)</li>
                  <li>출국 시 경고 기록</li>
                  <li>다음 입국 시 주의 대상</li>
                </ul>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800 mb-1">장기 초과 (30일 이상)</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>높은 벌금 및 법적 조치</li>
                  <li>강제 추방 가능성</li>
                  <li>1-10년 입국 금지</li>
                  <li>비자 발급 거부</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">예방 팁</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 입국 시 여권에 찍힌 입국 도장과 날짜를 반드시 확인하세요</li>
            <li>• 비자 종류별 체류 조건을 정확히 파악하세요</li>
            <li>• 셰겐 지역은 180일 중 90일 규칙을 꼭 지켜야 합니다</li>
            <li>• 체류 연장이 필요한 경우 만료 최소 2주 전에 신청하세요</li>
            <li>• 모든 입출국 기록을 DINO 앱에 정확히 기록하세요</li>
          </ul>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}