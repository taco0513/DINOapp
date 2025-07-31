import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  metricsCollector,
  SystemMetrics,
} from '@/lib/monitoring/metrics-collector';
import { dbPool } from '@/lib/database/connection-pool';
import { queryOptimizer } from '@/lib/database/query-optimizer';
import { applyRateLimit } from '@/lib/security/rate-limiter';
import { securityMiddleware } from '@/lib/security/auth-middleware';
import { csrfProtection } from '@/lib/security/csrf-protection';
import {
  createErrorResponse,
  ErrorCode,
  generateRequestId,
  handleApiError,
} from '@/lib/api/error-handler';

interface MetricsResponse {
  success: boolean;
  timestamp: string;
  current: SystemMetrics | null;
  database: {
    health: Awaited<ReturnType<typeof dbPool.healthCheck>>;
    connections: Awaited<ReturnType<typeof dbPool.getConnectionInfo>>;
    queries: Awaited<ReturnType<typeof queryOptimizer.getQueryStats>>;
    cache: ReturnType<typeof queryOptimizer.getCacheStats>;
  };
  system: {
    environment: string | undefined;
    uptime: number;
    version: string;
    memory: NodeJS.MemoryUsage;
  };
  history?: SystemMetrics[];
  averages?: Partial<SystemMetrics>;
}

// GET /api/monitoring/metrics - 실시간 시스템 메트릭 조회
export async function GET(request: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'general');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Security middleware
    const securityResult = await securityMiddleware(request);
    if (!securityResult.proceed) {
      return securityResult.response!;
    }

    // 관리자 권한 확인 (운영 환경에서는 필수)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    // Admin 이메일 체크 (환경변수로 설정)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (
      process.env.NODE_ENV === 'production' &&
      !adminEmails.includes(session.user.email)
    ) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        'Admin access required',
        undefined,
        requestId
      );
    }

    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange'); // '1h', '24h', '7d'
    const includeHistory = url.searchParams.get('history') === 'true';

    // 현재 메트릭
    const currentMetrics = metricsCollector.getLatestMetrics();

    // 데이터베이스 상태
    const [dbHealth, dbConnection, queryStats] = await Promise.all([
      dbPool.healthCheck(),
      dbPool.getConnectionInfo(),
      queryOptimizer.getQueryStats(),
    ]);

    const response: MetricsResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      current: currentMetrics,
      database: {
        health: dbHealth,
        connections: dbConnection,
        queries: queryStats,
        cache: queryOptimizer.getCacheStats(),
      },
      system: {
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        version: process.version,
        memory: process.memoryUsage(),
      },
    };

    // 히스토리 데이터 포함
    if (includeHistory) {
      const historyCount =
        timeRange === '1h' ? 120 : timeRange === '24h' ? 288 : 1008; // 30초 간격 기준
      response.history = metricsCollector.getMetricsHistory(historyCount);
    }

    // 평균 메트릭
    if (timeRange) {
      const timeRangeMs =
        {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
        }[timeRange] || 60 * 60 * 1000;

      response.averages = metricsCollector.getAverageMetrics(timeRangeMs);
    }

    return NextResponse.json(response);
  } catch (error) {
    // Error fetching metrics
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

// POST /api/monitoring/metrics/alerts - 알림 설정
export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'mutation');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true,
    });
    if (!csrfResult.protected) {
      return csrfResult.response!;
    }

    // Security middleware
    const securityResult = await securityMiddleware(request);
    if (!securityResult.proceed) {
      return securityResult.response!;
    }

    // 관리자 권한 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (
      process.env.NODE_ENV === 'production' &&
      !adminEmails.includes(session.user.email)
    ) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        'Admin access required',
        undefined,
        requestId
      );
    }

    const body = await request.json();
    const { action, alert } = body;

    switch (action) {
      case 'add':
        metricsCollector.addAlert(alert);
        break;
      case 'remove':
        metricsCollector.removeAlert(alert.name);
        break;
      default:
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid action',
          { validActions: ['add', 'remove'] },
          requestId
        );
    }

    return NextResponse.json({
      success: true,
      alerts: metricsCollector.getAlerts(),
    });
  } catch (error) {
    // Error managing alerts
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}
