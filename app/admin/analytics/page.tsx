import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
// Dynamic import for heavy analytics dashboard
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';
import { authOptions } from '@/lib/auth';

const LazyAnalyticsDashboard = dynamic(() => import('@/components/lazy/LazyAnalyticsDashboard'), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export const metadata: Metadata = {
  title: '고급 분석 - DINO Admin',
  description: '사용자 행동, 전환율, 리텐션 등 고급 분석 데이터를 확인합니다.',
};

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/analytics');
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
        <h1 className="text-3xl font-bold mb-2">고급 분석</h1>
        <p className="text-gray-600">
          사용자 행동 패턴, 전환 퍼널, 리텐션 분석 등 심층적인 인사이트를 제공합니다.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <LazyAnalyticsDashboard />
      </Suspense>
    </div>
  );
}