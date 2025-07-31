'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import IOSDashboard from '@/components/ios/IOSDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [statsData, setStatsData] = useState<any>(null);
  const [schengenData, setSchengenData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [_dataError, setDataError] = useState<string | null>(null);
  const [_showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [statsResponse, schengenResponse] = await Promise.all([
        ApiClient.getStats(),
        ApiClient.getSchengenStatus(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStatsData(statsResponse.data);
      }

      if (schengenResponse.success && schengenResponse.data) {
        setSchengenData(schengenResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDataError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setDataLoading(false);
    }
  };

  if (status === 'loading') {
    return <IOSDashboard loading={true} />;
  }

  if (!session) {
    return null;
  }

  return (
    <IOSDashboard
      statsData={statsData}
      schengenData={schengenData}
      loading={dataLoading}
    />
  );
}
