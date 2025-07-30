# 성능 모니터링 페이지 (/admin/performance)

## 개요

DINO 플랫폼의 시스템 성능, Core Web Vitals, 리소스 사용량을 실시간으로 모니터링하는 관리자 전용 페이지입니다.

## 주요 기능

### 1. 성능 메트릭 대시보드

- PerformanceMetricsDashboard 컴포넌트 통합
- 실시간 성능 지표 시각화
- 시스템 상태 모니터링

### 2. 보안 및 권한

- NextAuth 기반 인증
- 환경 변수를 통한 관리자 이메일 관리
- 미인증 사용자 리다이렉트

## 기술적 구현

### 페이지 구조

```typescript
- AdminPerformancePage (서버 컴포넌트)
  - 세션 인증 확인
  - 관리자 권한 검증
  - PerformanceMetricsDashboard 렌더링
```

### 보안 흐름

1. getServerSession으로 세션 확인
2. 세션 없으면 로그인 페이지로 리다이렉트
3. ADMIN_EMAILS 환경 변수로 관리자 확인
4. 권한 없으면 대시보드로 리다이렉트

### 메타데이터

```typescript
export const metadata: Metadata = {
  title: '성능 모니터링 - DINO Admin',
  description: 'DINO 플랫폼의 성능 지표와 시스템 상태를 모니터링합니다.',
};
```

## 사용자 경험 (UX)

### 페이지 레이아웃

- 컨테이너 기반 레이아웃
- 제목과 설명 헤더
- PerformanceMetricsDashboard 메인 콘텐츠

### 예상 메트릭

- Core Web Vitals (LCP, FID, CLS)
- 응답 시간 분포
- 리소스 사용률 (CPU, 메모리)
- API 엔드포인트 성능
- 데이터베이스 쿼리 성능

## 접근성 및 보안

### 접근성

- 관리자 전용 페이지
- 명확한 제목과 설명
- 컴포넌트 기반 구조

### 보안

- 서버 사이드 인증 필수
- 환경 변수 기반 권한 관리
- 권한 없는 접근 차단

## 개선 가능 사항

1. **실시간 알림**
   - 성능 임계치 설정
   - 알림 및 경보 시스템

2. **성능 최적화 제안**
   - 자동 최적화 제안
   - 병목 현상 분석

3. **이력 추적**
   - 성능 지표 이력 저장
   - 추세 분석 및 예측

4. **통합 모니터링**
   - APM 도구 통합
   - 외부 모니터링 서비스 연동

## 관련 페이지

- `/admin/metrics` - 비즈니스 메트릭
- `/admin/monitoring` - 시스템 모니터링
- `/admin/analytics` - 관리자 분석

## 컴포넌트 의존성

- `@/components/metrics/PerformanceMetricsDashboard` - 성능 메트릭 대시보드
- `@/lib/auth` - 인증 설정
