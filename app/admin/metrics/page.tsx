import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import BusinessMetricsDashboard from '@/components/metrics/BusinessMetricsDashboard';

export const metadata: Metadata = {
  title: '비즈니스 메트릭 - DINO Admin',
  description: 'DINO 플랫폼의 비즈니스 성과와 사용자 분석을 확인하세요.',
};

export default async function AdminMetricsPage() {
  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/metrics');
  }

  // 관리자 권한 확인 (이메일 기반)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>비즈니스 메트릭</h1>
        <p className='text-gray-600'>
          DINO 플랫폼의 핵심 성과 지표와 사용자 행동 분석을 실시간으로
          확인하세요.
        </p>
      </div>

      <BusinessMetricsDashboard />
    </div>
  );
}
