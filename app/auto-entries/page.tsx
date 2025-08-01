'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Mail, 
  Shield, 
  Plane,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { StandardPageLayout, StandardCard } from '@/components/layout/StandardPageLayout';
import { AutoEntryDetector } from '@/components/auto-entries/AutoEntryDetector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { t } from '@/lib/i18n';

export default function AutoEntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as any);
      return;
    }

    // Gmail 연결 확인
    if (!session.accessToken) {
      router.push('/gmail?redirect=/auto-entries' as any);
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
      title="입출국 기록 자동 추적"
      description="Gmail의 항공권 이메일을 분석하여 입출국 기록을 자동으로 감지하고 추적합니다"
      icon="Mail"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: '입출국 자동 추적' },
      ]}
    >
      {/* 기능 소개 */}
      <StandardCard title="스마트 입출국 기록 자동 감지" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Gmail 통합</h3>
            <p className="text-sm text-blue-700">
              항공권 예약 이메일을 자동으로 분석하여 여행 정보를 추출합니다
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">지능형 감지</h3>
            <p className="text-sm text-green-700">
              AI가 항공편 정보를 분석하여 입출국 날짜와 국가를 자동 식별합니다
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">검증 후 저장</h3>
            <p className="text-sm text-purple-700">
              감지된 기록을 검토하고 선택적으로 저장할 수 있습니다
            </p>
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            <strong>개인정보 보호:</strong> Gmail 데이터는 실시간으로 처리되며 서버에 저장되지 않습니다. 
            오직 확인된 입출국 정보만 암호화되어 저장됩니다.
          </AlertDescription>
        </Alert>
      </StandardCard>

      {/* 자동 감지 컴포넌트 */}
      <AutoEntryDetector />

      {/* 사용법 가이드 */}
      <StandardCard title="자동 감지 사용법" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Plane className="h-4 w-4" />
              감지 가능한 이메일
            </h4>
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                항공사 예약 확인 이메일 (대한항공, 아시아나 등)
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                온라인 여행사 예약 확인 (Expedia, Booking.com 등)
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                전자 항공권 (E-ticket) 및 여정표
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              추출되는 정보
            </h4>
            <div className="space-y-2">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                출발/도착 국가 및 공항 정보
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                정확한 출발/도착 날짜
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                항공편 번호 및 예약 번호
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                왕복 여행의 경우 자동 매칭
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">팁</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 항공권 이메일이 Gmail에 있는지 확인하세요</li>
                <li>• 최근 6개월 이내의 여행 기록이 가장 정확하게 감지됩니다</li>
                <li>• 감지된 기록은 반드시 검토 후 저장하세요</li>
                <li>• 비자가 없는 국가는 먼저 비자를 추가해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}