import { Metadata } from 'next';
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';
// Remove shadcn/ui imports - using minimal design system
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '모니터링 대시보드',
  description: 'DINO 애플리케이션 성능 및 사용 통계 모니터링',
};

export default async function MonitoringPage() {
  const session = await getServerSession(authOptions);

  // 관리자만 접근 가능하도록 설정 (선택사항)
  // if (!session || session.user.email !== 'admin@example.com') {
  //   redirect('/dashboard')
  // }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>모니터링 대시보드</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* 성능 모니터링 */}
        <div className='md:col-span-2 lg:col-span-3'>
          <PerformanceDashboard />
        </div>

        {/* 사용 통계 */}
        <div className='card'>
          <h3 className='text-lg font-semibold mb-4'>사용 통계</h3>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-secondary'>총 사용자 수</p>
              <p className='text-2xl font-bold'>-</p>
            </div>
            <div>
              <p className='text-sm text-secondary'>오늘 활성 사용자</p>
              <p className='text-2xl font-bold'>-</p>
            </div>
            <div>
              <p className='text-sm text-secondary'>총 여행 기록</p>
              <p className='text-2xl font-bold'>-</p>
            </div>
          </div>
        </div>

        {/* 에러 통계 */}
        <div className='card'>
          <h3 className='text-lg font-semibold mb-4'>에러 통계</h3>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-secondary'>24시간 에러</p>
              <p className='text-2xl font-bold'>0</p>
            </div>
            <div>
              <p className='text-sm text-secondary'>에러율</p>
              <p className='text-2xl font-bold'>0%</p>
            </div>
            <div>
              <p className='text-sm text-secondary'>평균 응답 시간</p>
              <p className='text-2xl font-bold'>-ms</p>
            </div>
          </div>
        </div>

        {/* 인기 기능 */}
        <div className='card'>
          <h3 className='text-lg font-semibold mb-4'>인기 기능</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Schengen 계산기</span>
              <span className='text-sm font-medium'>-</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>여행 기록 추가</span>
              <span className='text-sm font-medium'>-</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Gmail 통합</span>
              <span className='text-sm font-medium'>-</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>데이터 내보내기</span>
              <span className='text-sm font-medium'>-</span>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 alert'>
        <h2 className='font-semibold mb-2'>모니터링 도구 통합 안내</h2>
        <ul className='space-y-2 text-sm'>
          <li>
            • <strong>Sentry</strong>: 에러 추적 및 성능 모니터링 (SENTRY_DSN
            환경 변수 설정 필요)
          </li>
          <li>
            • <strong>Vercel Analytics</strong>: 자동으로 활성화됨 (Vercel
            대시보드에서 확인)
          </li>
          <li>
            • <strong>Google Analytics</strong>: 사용자 행동 분석
            (NEXT_PUBLIC_GA_ID 환경 변수 설정 필요)
          </li>
          <li>
            • <strong>Core Web Vitals</strong>: 실시간 성능 지표 모니터링
          </li>
        </ul>
      </div>
    </div>
  );
}
