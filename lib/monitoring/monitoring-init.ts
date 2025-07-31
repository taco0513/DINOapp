/**
 * Monitoring System Initialization
 * 모니터링 시스템 초기화
 */

import { metricsCollector } from './metrics-collector';
import { alertManager, systemAlert } from '../notifications/alert-manager';
import { dbPool } from '../database/connection-pool';

class MonitoringSystem {
  private static instance: MonitoringSystem;
  private initialized = false;
  private shutdownHandlers: (() => Promise<void>)[] = [];

  private constructor() {}

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  /**
   * 모니터링 시스템 초기화
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      // Monitoring system already initialized
      return;
    }

    try {
      // Initializing monitoring system

      // 1. 데이터베이스 연결 확인
      await this.initializeDatabase();

      // 2. 메트릭 수집 시작
      await this.initializeMetricsCollection();

      // 3. 알림 시스템 설정
      await this.initializeAlertSystem();

      // 4. 헬스체크 설정
      await this.initializeHealthChecks();

      // 5. 시스템 이벤트 리스너 설정
      await this.setupSystemEventListeners();

      // 6. 정리 핸들러 등록
      this.registerShutdownHandlers();

      this.initialized = true;
      // Monitoring system initialized successfully

      // 시스템 시작 알림
      await systemAlert.warning(
        'DINO monitoring system started',
        'monitoring',
        {
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      // Failed to initialize monitoring system
      await systemAlert.error(
        'Failed to initialize monitoring system',
        'monitoring',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await dbPool.connect();
      const health = await dbPool.healthCheck();

      if (health.status === 'unhealthy') {
        throw new Error('Database health check failed');
      }

      // Database connected
    } catch (error) {
      // Database initialization failed
      throw error;
    }
  }

  private async initializeMetricsCollection(): Promise<void> {
    // 메트릭 수집 시작 (30초 간격)
    metricsCollector.startCollection(30000);

    // 메트릭 기반 알림 설정
    const unsubscribe = metricsCollector.subscribe(metrics => {
      this.checkMetricThresholds(metrics);
    });

    this.shutdownHandlers.push(async () => {
      unsubscribe();
      metricsCollector.stopCollection();
    });

    // Metrics collection started
  }

  private async initializeAlertSystem(): Promise<void> {
    // 프로덕션 환경에서만 이메일/웹훅 알림 활성화
    if (process.env.NODE_ENV === 'production') {
      // Production alert channels enabled
    } else {
      // Development mode - console alerts only
    }

    // 초기 알림 테스트
    await systemAlert.warning('Alert system initialized', 'monitoring');
  }

  private async initializeHealthChecks(): Promise<void> {
    // 주기적 헬스체크 (5분마다)
    const healthCheckInterval = setInterval(
      async () => {
        await this.performHealthCheck();
      },
      5 * 60 * 1000
    );

    this.shutdownHandlers.push(async () => {
      clearInterval(healthCheckInterval);
    });

    // 초기 헬스체크
    await this.performHealthCheck();

    // Health checks initialized
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const health = await dbPool.healthCheck();
      const connectionInfo = await dbPool.getConnectionInfo();

      // 데이터베이스 건강 상태 확인
      if (health.status === 'unhealthy') {
        await systemAlert.error(
          'Database health check failed',
          'health-check',
          {
            latency: health.latency,
            timestamp: health.timestamp,
          }
        );
      } else if (health.latency > 1000) {
        await systemAlert.warning(
          'Database high latency detected',
          'health-check',
          {
            latency: health.latency,
            threshold: 1000,
          }
        );
      }

      // 연결 풀 상태 확인
      if (connectionInfo.poolStatus === 'warning') {
        await systemAlert.warning(
          'Database connection pool approaching limit',
          'health-check',
          {
            activeConnections: connectionInfo.activeConnections,
            maxConnections: connectionInfo.maxConnections,
          }
        );
      }
    } catch (error) {
      await systemAlert.error('Health check failed', 'health-check', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private checkMetricThresholds(metrics: any): void {
    if (!metrics.current) return;

    const { cpu, memory, database } = metrics.current;

    // CPU 사용률 체크
    if (cpu.usage > 90) {
      systemAlert.error('Critical CPU usage detected', 'metrics', {
        current: cpu.usage,
        threshold: 90,
      });
    } else if (cpu.usage > 80) {
      systemAlert.warning('High CPU usage detected', 'metrics', {
        current: cpu.usage,
        threshold: 80,
      });
    }

    // 메모리 사용률 체크
    if (memory.usage > 85) {
      systemAlert.error('Critical memory usage detected', 'metrics', {
        current: memory.usage,
        threshold: 85,
      });
    } else if (memory.usage > 70) {
      systemAlert.warning('High memory usage detected', 'metrics', {
        current: memory.usage,
        threshold: 70,
      });
    }

    // 데이터베이스 레이턴시 체크
    if (database.queryLatency > 2000) {
      systemAlert.error('Critical database latency detected', 'metrics', {
        current: database.queryLatency,
        threshold: 2000,
      });
    } else if (database.queryLatency > 1000) {
      systemAlert.warning('High database latency detected', 'metrics', {
        current: database.queryLatency,
        threshold: 1000,
      });
    }

    // 데이터베이스 에러율 체크
    if (database.errorRate > 10) {
      systemAlert.error('High database error rate detected', 'metrics', {
        current: database.errorRate,
        threshold: 10,
      });
    } else if (database.errorRate > 5) {
      systemAlert.warning('Elevated database error rate detected', 'metrics', {
        current: database.errorRate,
        threshold: 5,
      });
    }
  }

  private async setupSystemEventListeners(): Promise<void> {
    // 프로세스 종료 신호 처리
    process.on('SIGTERM', async () => {
      // SIGTERM received, starting graceful shutdown
      await systemAlert.warning(
        'System shutdown initiated (SIGTERM)',
        'system'
      );
      await this.shutdown();
    });

    process.on('SIGINT', async () => {
      // SIGINT received, starting graceful shutdown
      await systemAlert.warning('System shutdown initiated (SIGINT)', 'system');
      await this.shutdown();
    });

    // 예상치 못한 에러 처리
    process.on('uncaughtException', async error => {
      // Uncaught Exception
      await systemAlert.error('Uncaught exception detected', 'system', {
        error: error.message,
        stack: error.stack,
      });
    });

    process.on('unhandledRejection', async reason => {
      // Unhandled Rejection
      await systemAlert.error(
        'Unhandled promise rejection detected',
        'system',
        {
          reason: reason instanceof Error ? reason.message : String(reason),
        }
      );
    });

    // System event listeners configured
  }

  private registerShutdownHandlers(): void {
    // 데이터베이스 연결 해제
    this.shutdownHandlers.push(async () => {
      await dbPool.disconnect();
    });
  }

  /**
   * 시스템 종료 처리
   */
  public async shutdown(): Promise<void> {
    if (!this.initialized) return;

    // Shutting down monitoring system

    try {
      // 모든 종료 핸들러 실행
      for (const handler of this.shutdownHandlers) {
        await handler();
      }

      await systemAlert.warning('DINO monitoring system stopped', 'monitoring');

      this.initialized = false;
      // Monitoring system shutdown completed
    } catch (__error) {
      // Error during monitoring system shutdown
    }
  }

  /**
   * 시스템 상태 확인
   */
  public getStatus(): {
    initialized: boolean;
    uptime: number;
    environment: string;
  } {
    return {
      initialized: this.initialized,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * 수동 헬스체크 실행
   */
  public async runHealthCheck(): Promise<void> {
    await this.performHealthCheck();
  }
}

export const monitoringSystem = MonitoringSystem.getInstance();

// 자동 초기화 (프로덕션 환경에서만)
if (
  process.env.NODE_ENV === 'production' ||
  process.env.FORCE_MONITORING === 'true'
) {
  monitoringSystem.initialize().catch(() => {
    /* Failed to initialize monitoring */
  });
}
