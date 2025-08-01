import { NextRequest, NextResponse } from 'next/server';
import { runDailyVisaCheck } from '@/lib/schedulers/visa-scheduler';

// Vercel Cron Jobs에서 호출하는 비자 만료 확인 엔드포인트
// vercel.json에서 다음과 같이 설정:
// {
//   "crons": [
//     {
//       "path": "/api/cron/visa-check",
//       "schedule": "0 9 * * *"
//     }
//   ]
// }

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Jobs 인증 확인
    const authHeader = request.headers.get('authorization');
    
    // Vercel Cron Jobs는 특별한 헤더를 포함하여 요청을 보냄
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel');
    const cronSecret = process.env.CRON_SECRET;
    
    // 인증 검증
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('Unauthorized cron job attempt:', {
          authHeader,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for')
        });
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else if (!isVercelCron) {
      // 개발 환경에서는 Vercel Cron이 아닌 경우 경고 로그만 출력
      console.warn('Cron job accessed without proper authentication in development');
    }

    const startTime = Date.now();
    console.log(`[CRON] Starting visa expiry check at ${new Date().toISOString()}`);

    // 일일 비자 만료 확인 실행
    await runDailyVisaCheck();

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      message: 'Daily visa expiry check completed successfully',
      executedAt: new Date().toISOString(),
      executionTimeMs: duration,
      environment: process.env.NODE_ENV,
      isVercelCron
    };

    console.log('[CRON] Visa expiry check completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    const errorResult = {
      success: false,
      error: 'Cron job execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      executedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };

    console.error('[CRON] Visa expiry check failed:', errorResult);

    return NextResponse.json(errorResult, { status: 500 });
  }
}

// POST는 수동 실행용 (관리자가 필요시 사용)
export async function POST(request: NextRequest) {
  try {
    // 수동 실행을 위한 관리자 인증
    const { forceRun, adminKey } = await request.json();
    
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin key' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    console.log(`[MANUAL] Manual visa expiry check started at ${new Date().toISOString()}`);

    await runDailyVisaCheck();

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      message: 'Manual visa expiry check completed successfully',
      executedAt: new Date().toISOString(),
      executionTimeMs: duration,
      triggeredBy: 'manual',
      forceRun
    };

    console.log('[MANUAL] Manual visa expiry check completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[MANUAL] Manual visa expiry check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Manual cron job execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}