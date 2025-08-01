import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// TODO: Remove unused logger import

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '24h';

    // 시간 범위에 따른 데이터 포인트 계산
    let dataPoints = 24;
    let interval = 60 * 60 * 1000; // 1시간

    switch (range) {
      case '1h':
        dataPoints = 12;
        interval = 5 * 60 * 1000; // 5분
        break;
      case '24h':
        dataPoints = 24;
        interval = 60 * 60 * 1000; // 1시간
        break;
      case '7d':
        dataPoints = 7 * 4; // 하루 4개 포인트
        interval = 6 * 60 * 60 * 1000; // 6시간
        break;
      case '30d':
        dataPoints = 30;
        interval = 24 * 60 * 60 * 1000; // 1일
        break;
    }

    // 모의 성능 데이터 생성
    const now = Date.now();
    const metrics = Array.from({ length: dataPoints }, (_, i) => {
      const timestamp = new Date(now - (dataPoints - i - 1) * interval);
      return {
        timestamp: timestamp.toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.floor(Math.random() * 100) + 50, // 50-150 req/s
        cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      };
    });

    // Core Web Vitals 모의 데이터
    const webVitals = {
      lcp: Math.random() * 2 + 1.5, // 1.5-3.5s
      fid: Math.random() * 100 + 50, // 50-150ms
      cls: Math.random() * 0.15, // 0-0.15
      ttfb: Math.random() * 800 + 200, // 200-1000ms
    };

    return NextResponse.json({ metrics, webVitals });
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
