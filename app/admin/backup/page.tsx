import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import BackupManagementDashboard from '@/components/admin/BackupManagementDashboard';

interface _BackupInfo {
  databaseBackups: any[];
  fileBackups: any[];
  schedules: any[];
  status: {
    totalSchedules: number;
    enabledSchedules: number;
    runningSchedules: number;
    lastBackup?: string;
    nextBackup?: string;
  };
}

export const metadata: Metadata = {
  title: '백업 및 복구 - DINO Admin',
  description: '시스템 백업과 재해 복구를 관리합니다.',
};

export default async function AdminBackupPage() {
  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/backup');
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
        <h1 className='text-3xl font-bold mb-2'>백업 및 복구</h1>
        <p className='text-gray-600'>시스템 백업과 재해 복구를 관리합니다.</p>
      </div>

      <BackupManagementDashboard />
    </div>
  );
}
