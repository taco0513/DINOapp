import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
// Dynamic import for performance metrics
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';
import { authOptions } from '@/lib/auth';

const LazyPerformanceMetrics = dynamic(() => import('@/components/lazy/LazyPerformanceMetrics'), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export const metadata: Metadata = {
  title: '성능 모니터링 - DINO Admin',
  description: 'DINO 플랫폼의 성능 지표와 시스템 상태를 모니터링합니다.',
};

export default async function AdminPerformancePage() {
  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/performance');
  }

  // 관리자 권한 확인 (이메일 기반)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');
  
  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">성능 모니터링</h1>
        <p className="text-gray-600">
          시스템 성능, Core Web Vitals, 리소스 사용량을 실시간으로 모니터링합니다.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <LazyPerformanceMetrics />
      </Suspense>
    </div>
  );
}