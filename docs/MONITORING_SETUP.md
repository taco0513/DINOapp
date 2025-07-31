# DINO 모니터링 시스템 설정 가이드

## 📊 개요

DINO 애플리케이션은 다음과 같은 모니터링 도구들을 통합하여 성능, 에러, 사용자 행동을 추적합니다:

1. **Sentry** - 에러 추적 및 성능 모니터링
2. **Vercel Analytics** - 웹 분석 및 Core Web Vitals
3. **Google Analytics** - 사용자 행동 분석
4. **Custom Performance Dashboard** - 실시간 성능 모니터링
5. **Alert System** - 임계값 기반 알림 시스템

## 🔧 설정 방법

### 1. Sentry 설정

#### 1.1 Sentry 프로젝트 생성

1. [Sentry.io](https://sentry.io) 계정 생성
2. 새 프로젝트 생성 (Next.js 선택)
3. DSN 복사

#### 1.2 환경 변수 설정

```bash
# .env.local (개발)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# Vercel 환경 변수 (프로덕션)
위 환경 변수들을 Vercel 대시보드에 추가
```

#### 1.3 Sentry 기능

- 자동 에러 캡처
- 성능 모니터링 (트랜잭션)
- 사용자 컨텍스트 추적
- 소스맵 업로드 (프로덕션)
- Replay 세션 녹화 (프로덕션)

### 2. Vercel Analytics 설정

#### 2.1 활성화

Vercel 대시보드에서:

1. 프로젝트 선택
2. Analytics 탭 클릭
3. "Enable Analytics" 클릭

#### 2.2 자동 추적 항목

- 페이지 뷰
- Core Web Vitals (LCP, FID, CLS)
- 방문자 통계
- 디바이스/브라우저 정보

### 3. Google Analytics 설정

#### 3.1 GA4 속성 생성

1. [Google Analytics](https://analytics.google.com) 접속
2. 새 속성 생성 (GA4)
3. 측정 ID 복사 (G-XXXXXXXXXX)

#### 3.2 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### 3.3 추적 이벤트

구현된 커스텀 이벤트:

- `login` - 로그인
- `trip_added` - 여행 기록 추가
- `schengen_calculated` - 셴겐 계산
- `gmail_connected` - Gmail 연동
- `data_exported` - 데이터 내보내기
- `pwa_installed` - PWA 설치

### 4. 성능 모니터링 대시보드

#### 4.1 접근 방법

```
/dashboard/monitoring
```

#### 4.2 모니터링 지표

- **LCP** (Largest Contentful Paint): < 2.5초 (Good)
- **FID** (First Input Delay): < 100ms (Good)
- **CLS** (Cumulative Layout Shift): < 0.1 (Good)
- **FCP** (First Contentful Paint): < 1.8초 (Good)
- **TTFB** (Time to First Byte): < 800ms (Good)

### 5. 알림 시스템

#### 5.1 알림 타입

- **Error**: 심각한 문제
- **Warning**: 주의 필요
- **Info**: 정보성 알림
- **Success**: 성공 알림

#### 5.2 알림 카테고리

- **Performance**: 성능 관련
- **Security**: 보안 관련
- **Usage**: 사용량 관련
- **System**: 시스템 관련

#### 5.3 임계값 설정

```typescript
// lib/monitoring/alerts.ts
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
```

## 📈 모니터링 활용 방법

### 1. 에러 추적

- Sentry 대시보드에서 실시간 에러 확인
- 에러 발생 시 이메일/Slack 알림
- 에러 그룹화 및 우선순위 지정

### 2. 성능 최적화

- Core Web Vitals 모니터링
- 느린 API 엔드포인트 식별
- 프론트엔드 성능 병목 지점 발견

### 3. 사용자 행동 분석

- Google Analytics에서 사용자 플로우 확인
- 인기 기능 파악
- 사용자 이탈 지점 분석

### 4. 실시간 알림

- 성능 저하 시 즉시 알림
- 보안 이슈 발생 시 경고
- 리소스 사용량 초과 시 통지

## 🔍 트러블슈팅

### Sentry 이슈

- DSN이 올바른지 확인
- 네트워크 차단 여부 확인
- 소스맵 업로드 실패 시 AUTH_TOKEN 확인

### Analytics 이슈

- 광고 차단기가 GA를 차단할 수 있음
- Vercel Analytics는 자동 활성화 확인
- 개발 환경에서는 일부 기능 제한

### 성능 대시보드 이슈

- PerformanceObserver API 지원 브라우저 확인
- HTTPS 환경에서만 일부 API 작동

## 📱 모바일 모니터링

- 모바일 디바이스별 성능 추적
- 터치 인터랙션 성능 모니터링
- PWA 설치율 추적
- 오프라인 사용 패턴 분석

## 🚨 보안 고려사항

- 민감한 사용자 정보는 추적하지 않음
- PII(개인식별정보) 필터링
- GDPR 준수를 위한 동의 관리
- 보안 이벤트 로깅 및 감사

## 📊 보고서 생성

### 주간 보고서 항목

- 주요 에러 및 해결 상태
- 성능 지표 트렌드
- 사용자 증가율
- 기능별 사용 통계

### 월간 보고서 항목

- 전체 시스템 건강도
- 성능 개선 사항
- 사용자 만족도 지표
- 향후 개선 계획

---

모니터링 시스템 관련 문의사항은 개발팀에 문의하세요.
