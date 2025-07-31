import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  checkPerformanceAlerts,
  checkSecurityAlerts,
  checkUsageAlerts,
} from '@/lib/monitoring/alerts';

// POST /api/monitoring/alerts - 알림 트리거
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 인증 확인 (선택적 - 관리자만 허용)
    // if (!session || session.user.email !== 'admin@example.com') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json();
    const { type, data } = body;

    let alerts = [];

    switch (type) {
      case 'performance':
        alerts = checkPerformanceAlerts(data);
        break;
      case 'security':
        alerts = checkSecurityAlerts(data);
        break;
      case 'usage':
        alerts = checkUsageAlerts(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid alert type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      alerts: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Alert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/monitoring/alerts - 알림 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: 데이터베이스에서 알림 로그 조회
    // const alerts = await prisma.alertLog.findMany({
    //   where: {
    //     userId: session.user.id,
    //   },
    //   orderBy: {
    //     timestamp: 'desc',
    //   },
    //   take: 50,
    // })

    // 임시: 로컬 스토리지에서 조회하는 것은 클라이언트에서 처리
    return NextResponse.json({
      success: true,
      alerts: [],
    });
  } catch (error) {
    console.error('Alert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
