# 시스템 모니터링 페이지 (/admin/monitoring)

## 개요

실시간 시스템 성능 및 건강 상태 모니터링을 위한 관리자 전용 페이지입니다. 데이터베이스, 메모리, 업타임, 에러율 등의 핵심 지표를 실시간으로 추적합니다.

## 주요 기능

### 1. 시스템 헬스 체크

- 데이터베이스 상태 및 연결 확인
- 메모리 사용량 모니터링
- 시스템 업타임 추적
- 요청 및 에러 통계

### 2. 모니터링 대시보드

- MonitoringDashboard 컴포넌트 통합
- 실시간 데이터 시각화
- 로그 모니터링 및 분석

### 3. 보안 및 권한

- NextAuth 기반 인증
- 환경 변수를 통한 관리자 이메일 관리
- 미인증 사용자 리다이렉트

## 기술적 구현

### 데이터 구조

```typescript
// 헬스 체크 인터페이스
interface HealthCheck {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  checks: {
    database?: {
      status: string;
      latency?: number;
      lastCheck?: string;
      errorCount?: number;
    };
    memory?: {
      status: string;
      heapUsed: string;
      heapTotal: string;
      rss: string;
    };
    uptime?: {
      status: string;
      seconds: number;
      formatted: string;
    };
    metrics?: {
      status: string;
      totalRequests: number;
      totalErrors: number;
      errorRate: string;
    };
  };
}

// 메트릭 데이터
interface MetricsData {
  summary: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    activeUsers: number;
    timestamp: string;
  };
  metrics: {
    http: any[];
    db: any[];
    business: any[];
    system: any[];
  };
}

// 로그 데이터
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: any;
  stack?: string;
}
```

### 보안 흐름

1. getServerSession으로 세션 확인
2. 세션 없으면 로그인 페이지로 리다이렉트
3. ADMIN_EMAILS 환경 변수로 관리자 확인
4. 권한 없으면 대시보드로 리다이렉트

## 사용자 경험 (UX)

### 페이지 레이아웃

- 컨테이너 기반 레이아웃
- 제목과 설명 헤더
- MonitoringDashboard 메인 콘텐츠

### 모니터링 지표

- 시스템 상태 (healthy/degraded/unhealthy)
- 데이터베이스 연결 및 지연 시간
- 메모리 사용량 (heap, RSS)
- 업타임 및 가동 시간
- HTTP 요청 및 에러 통계
- 로그 레벨별 분포

## 접근성 및 보안

### 접근성

- 관리자 전용 페이지
- 명확한 제목과 설명
- 컴포넌트 기반 구조

### 보안

- 서버 사이드 인증 필수
- 환경 변수 기반 권한 관리
- 권한 없는 접근 차단
- 민감한 시스템 정보 보호

## 개선 가능 사항

1. **알림 시스템**
   - 임계치 기반 알림
   - Slack/Discord 웹훅 통합
   - 이메일 알림

2. **로그 분석**
   - 고급 필터링 및 검색
   - 로그 파일 다운로드
   - 패턴 기반 이상 감지

3. **헬스 체크 확장**
   - 커스텀 헬스 체크 추가
   - 외부 서비스 모니터링
   - 의존성 상태 확인

4. **대시보드 개선**
   - 실시간 업데이트 (WebSocket)
   - 커스터마이즈 가능한 위젯
   - 모바일 최적화

## 관련 페이지

- `/admin/metrics` - 비즈니스 메트릭
- `/admin/performance` - 성능 모니터링
- `/admin/analytics` - 관리자 분석
- `/admin/backup` - 백업 관리

## 컴포넌트 의존성

- `@/components/admin/MonitoringDashboard` - 모니터링 대시보드
- `@/lib/auth` - 인증 설정
- `lucide-react` - 아이콘 라이브러리
