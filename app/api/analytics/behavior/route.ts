import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Range parameter available if needed
    // const range = request.nextUrl.searchParams.get('range') || '30d';

    // 모의 사용자 행동 데이터
    const mockData = {
      pageViews: [
        { page: '/dashboard', views: 3420, avgTime: 145 },
        { page: '/trips', views: 2830, avgTime: 210 },
        { page: '/schengen', views: 2150, avgTime: 180 },
        { page: '/analytics', views: 1890, avgTime: 240 },
        { page: '/', views: 1650, avgTime: 60 },
        { page: '/gmail', views: 1420, avgTime: 300 },
        { page: '/notifications', views: 980, avgTime: 90 },
        { page: '/pricing', views: 750, avgTime: 120 },
        { page: '/docs/api', views: 620, avgTime: 360 },
        { page: '/contact', views: 450, avgTime: 80 },
      ],
      userFlow: [
        { source: 'Landing', target: 'Dashboard', value: 450 },
        { source: 'Dashboard', target: 'Trips', value: 320 },
        { source: 'Dashboard', target: 'Schengen', value: 280 },
        { source: 'Trips', target: 'Analytics', value: 180 },
        { source: 'Schengen', target: 'Gmail', value: 150 },
      ],
      deviceTypes: [
        { device: 'Desktop', count: 4250 },
        { device: 'Mobile', count: 2850 },
        { device: 'Tablet', count: 890 },
      ],
      bounceRate: 32.5,
      avgSessionDuration: 325, // seconds
      pagesPerSession: 4.2,
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Failed to fetch behavior analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}