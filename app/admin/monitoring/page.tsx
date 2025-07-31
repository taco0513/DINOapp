import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MonitoringDashboard from '@/components/admin/MonitoringDashboard'



interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: any
  stack?: string
}


export const metadata: Metadata = {
  title: '시스템 모니터링 - DINO Admin',
  description: '실시간 시스템 성능 및 건강 상태 모니터링을 확인합니다.',
};

export default async function AdminMonitoringPage() {
  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/monitoring');
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
        <h1 className="text-3xl font-bold mb-2">시스템 모니터링</h1>
        <p className="text-gray-600">
          실시간 시스템 성능 및 건강 상태 모니터링을 확인합니다.
        </p>
      </div>

      <MonitoringDashboard />
    </div>
  );
}

