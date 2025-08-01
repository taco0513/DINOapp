'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  MapPin, 
  Shield, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock
} from 'lucide-react';
import { StandardPageLayout, StandardCard } from '@/components/layout/StandardPageLayout';
import { TripPlanningValidator } from '@/components/trip-planning/TripPlanningValidator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { t } from '@/lib/i18n';

export default function TripPlanningPage() {
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
      title="여행 계획 검증"
      description="여행 계획을 사전에 검증하고 비자 및 체류 규정을 확인하세요"
      icon="Shield"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: '여행 계획 검증' },
      ]}
    >
      {/* 기능 소개 */}
      <StandardCard title="스마트 여행 계획 검증 시스템" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">비자 자동 검증</h3>
            <p className="text-sm text-blue-700">
              보유한 비자로 계획된 여행이 가능한지 자동으로 확인합니다
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">체류 기간 분석</h3>
            <p className="text-sm text-green-700">
              각 국가별 체류 기간 제한과 셰겐 90/180일 규칙을 검증합니다
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">맞춤 권장사항</h3>
            <p className="text-sm text-purple-700">
              여행 계획 개선을 위한 개인화된 권장사항을 제공합니다
            </p>
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            <strong>참고사항:</strong> 이 검증 시스템은 참고용이며, 실제 여행 전에는 해당 국가의 공식 비자 및 출입국 규정을 반드시 확인하시기 바랍니다.
          </AlertDescription>
        </Alert>
      </StandardCard>

      {/* 여행 계획 검증기 */}
      <TripPlanningValidator />

      {/* 사용법 가이드 */}
      <StandardCard title="사용법 가이드" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              여행 계획 입력
            </h4>
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                여권 만료일을 입력하면 더 정확한 검증이 가능합니다
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                방문할 모든 국가와 정확한 일정을 입력하세요
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                여행 목적에 따라 비자 요구사항이 달라질 수 있습니다
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              검증 결과 해석
            </h4>
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong className="text-green-600">유효:</strong> 여행 가능, 문제없음</span>
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong className="text-orange-600">주의:</strong> 주의사항 확인 필요</span>
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong className="text-blue-600">비자 필요:</strong> 추가 비자 신청 필요</span>
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong className="text-red-600">무효:</strong> 여행 계획 수정 필요</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">검증 범위</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>✓ 보유 비자의 유효성 및 체류 기간 제한</p>
                <p>✓ 셰겐 지역 90/180일 규칙 준수 여부</p>
                <p>✓ 비자 만료일과 여행 일정의 호환성</p>
                <p>✓ 여권 만료일 대비 여행 가능성</p>
                <p>✓ 목적지별 맞춤 권장사항 제공</p>
              </div>
            </div>
          </div>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}