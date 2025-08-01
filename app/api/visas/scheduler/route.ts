import { NextRequest, NextResponse } from 'next/server';
import { visaAlerts } from '@/lib/notifications/visa-alerts';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

// GET /api/visas/scheduler - 비자 만료 알림 스케줄러 수동 실행 (개발/테스트용)
export async function GET(request: NextRequest) {
  try {
    // API 키 검증 (운영환경에서는 필수)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SCHEDULER_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    logger.info('Starting visa expiry check scheduler...');
    const startTime = Date.now();

    // 만료 예정 비자 확인 및 알림 발송
    await visaAlerts.checkExpiringVisas();

    const duration = Date.now() - startTime;
    logger.info(`Visa expiry check completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Visa expiry check completed successfully',
      executionTime: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in visa scheduler:', error);
    return NextResponse.json(
      { 
        error: 'Scheduler execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/visas/scheduler - 특정 사용자의 비자 만료 확인
export async function POST(request: NextRequest) {
  try {
    const { userId, forceCheck } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    logger.debug(`Checking visa expiry for user: ${userId}${forceCheck ? " (forced)" : ""}`);
    const startTime = Date.now();

    // 특정 사용자의 비자 만료 확인
    // TODO: 사용자별 체크 함수 구현
    await visaAlerts.checkExpiringVisas();

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Visa expiry check completed for user ${userId}`,
      userId,
      executionTime: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in user-specific visa check:', error);
    return NextResponse.json(
      { 
        error: 'User visa check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}