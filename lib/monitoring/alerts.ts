import { captureMessage } from './sentry';

// 알림 타입 정의
export type AlertType = 'error' | 'warning' | 'info' | 'success';
export type AlertCategory = 'performance' | 'security' | 'usage' | 'system';

interface Alert {
  type: AlertType;
  category: AlertCategory;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// 알림 임계값 설정
export const alertThresholds = {
  performance: {
    responseTime: 3000, // 3초
    errorRate: 0.05, // 5%
    cpuUsage: 80, // 80%
    memoryUsage: 85, // 85%
  },
  usage: {
    concurrentUsers: 1000,
    requestsPerMinute: 10000,
    dataTransferGB: 100,
  },
  security: {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 0.8,
  },
};

// 알림 전송 함수
export async function sendAlert(alert: Alert) {
  // Sentry로 알림 전송
  captureMessage(alert.message, alert.type === 'error' ? 'error' : 'info');

  // 콘솔 로그 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[${alert.type.toUpperCase()}] ${alert.category}: ${alert.message}`,
      alert.metadata
    );
  }

  // TODO: 이메일 알림 전송 (프로덕션)
  if (process.env.NODE_ENV === 'production' && alert.type === 'error') {
    // await sendEmailAlert(alert)
  }

  // TODO: Slack/Discord 웹훅 통합
  if (alert.type === 'error' || alert.type === 'warning') {
    // await sendWebhookAlert(alert)
  }

  // 알림 로그 저장
  await logAlert(alert);
}

// 성능 알림 체크
export function checkPerformanceAlerts(metrics: {
  responseTime?: number;
  errorRate?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}) {
  const alerts: Alert[] = [];

  if (
    metrics.responseTime &&
    metrics.responseTime > alertThresholds.performance.responseTime
  ) {
    alerts.push({
      type: 'warning',
      category: 'performance',
      message: `응답 시간이 임계값을 초과했습니다: ${metrics.responseTime}ms`,
      metadata: { responseTime: metrics.responseTime },
      timestamp: new Date(),
    });
  }

  if (
    metrics.errorRate &&
    metrics.errorRate > alertThresholds.performance.errorRate
  ) {
    alerts.push({
      type: 'error',
      category: 'performance',
      message: `에러율이 임계값을 초과했습니다: ${(metrics.errorRate * 100).toFixed(2)}%`,
      metadata: { errorRate: metrics.errorRate },
      timestamp: new Date(),
    });
  }

  if (
    metrics.cpuUsage &&
    metrics.cpuUsage > alertThresholds.performance.cpuUsage
  ) {
    alerts.push({
      type: 'warning',
      category: 'performance',
      message: `CPU 사용률이 높습니다: ${metrics.cpuUsage}%`,
      metadata: { cpuUsage: metrics.cpuUsage },
      timestamp: new Date(),
    });
  }

  if (
    metrics.memoryUsage &&
    metrics.memoryUsage > alertThresholds.performance.memoryUsage
  ) {
    alerts.push({
      type: 'error',
      category: 'performance',
      message: `메모리 사용률이 위험 수준입니다: ${metrics.memoryUsage}%`,
      metadata: { memoryUsage: metrics.memoryUsage },
      timestamp: new Date(),
    });
  }

  // 알림 전송
  alerts.forEach(alert => sendAlert(alert));

  return alerts;
}

// 보안 알림 체크
export function checkSecurityAlerts(events: {
  failedLoginAttempts?: number;
  suspiciousActivity?: boolean;
  ipAddress?: string;
  userId?: string;
}) {
  const alerts: Alert[] = [];

  if (
    events.failedLoginAttempts &&
    events.failedLoginAttempts >= alertThresholds.security.failedLoginAttempts
  ) {
    alerts.push({
      type: 'warning',
      category: 'security',
      message: `로그인 실패 횟수가 임계값을 초과했습니다: ${events.failedLoginAttempts}회`,
      metadata: {
        failedAttempts: events.failedLoginAttempts,
        ipAddress: events.ipAddress,
        userId: events.userId,
      },
      timestamp: new Date(),
    });
  }

  if (events.suspiciousActivity) {
    alerts.push({
      type: 'error',
      category: 'security',
      message: '의심스러운 활동이 감지되었습니다',
      metadata: {
        ipAddress: events.ipAddress,
        userId: events.userId,
      },
      timestamp: new Date(),
    });
  }

  // 알림 전송
  alerts.forEach(alert => sendAlert(alert));

  return alerts;
}

// 사용량 알림 체크
export function checkUsageAlerts(usage: {
  concurrentUsers?: number;
  requestsPerMinute?: number;
  dataTransferGB?: number;
}) {
  const alerts: Alert[] = [];

  if (
    usage.concurrentUsers &&
    usage.concurrentUsers > alertThresholds.usage.concurrentUsers
  ) {
    alerts.push({
      type: 'info',
      category: 'usage',
      message: `동시 사용자 수가 많습니다: ${usage.concurrentUsers}명`,
      metadata: { concurrentUsers: usage.concurrentUsers },
      timestamp: new Date(),
    });
  }

  if (
    usage.requestsPerMinute &&
    usage.requestsPerMinute > alertThresholds.usage.requestsPerMinute
  ) {
    alerts.push({
      type: 'warning',
      category: 'usage',
      message: `분당 요청 수가 높습니다: ${usage.requestsPerMinute}개`,
      metadata: { requestsPerMinute: usage.requestsPerMinute },
      timestamp: new Date(),
    });
  }

  if (
    usage.dataTransferGB &&
    usage.dataTransferGB > alertThresholds.usage.dataTransferGB
  ) {
    alerts.push({
      type: 'warning',
      category: 'usage',
      message: `데이터 전송량이 많습니다: ${usage.dataTransferGB}GB`,
      metadata: { dataTransferGB: usage.dataTransferGB },
      timestamp: new Date(),
    });
  }

  // 알림 전송
  alerts.forEach(alert => sendAlert(alert));

  return alerts;
}

// 알림 로그 저장
async function logAlert(alert: Alert) {
  // TODO: 데이터베이스에 알림 로그 저장
  // await prisma.alertLog.create({
  //   data: {
  //     type: alert.type,
  //     category: alert.category,
  //     message: alert.message,
  //     metadata: alert.metadata,
  //     timestamp: alert.timestamp,
  //   },
  // })

  // 로컬 스토리지에 임시 저장 (클라이언트 사이드)
  if (typeof window !== 'undefined') {
    const alerts = JSON.parse(localStorage.getItem('dino-alerts') || '[]');
    alerts.push(alert);
    // 최근 100개만 유지
    if (alerts.length > 100) {
      alerts.shift();
    }
    localStorage.setItem('dino-alerts', JSON.stringify(alerts));
  }
}

// 예약된 알림 체크 (1분마다 실행)
export function startAlertMonitoring() {
  if (typeof window === 'undefined') {
    // 서버 사이드에서만 실행
    setInterval(async () => {
      // TODO: 실제 메트릭 수집 및 체크
      // const metrics = await collectMetrics()
      // checkPerformanceAlerts(metrics)
      // checkUsageAlerts(metrics)
    }, 60000); // 1분
  }
}
