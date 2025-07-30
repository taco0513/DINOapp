# 대시보드 모니터링 페이지 (/dashboard/monitoring)

## 개요

DINO 애플리케이션의 성능 및 사용 통계를 모니터링하는 페이지입니다. Core Web Vitals, 사용 통계, 에러 통계, 인기 기능 등을 확인할 수 있습니다.

## 주요 기능

### 1. 성능 모니터링

- PerformanceDashboard 컴포넌트 통합
- Core Web Vitals 실시간 추적
- 성능 지표 시각화

### 2. 사용 통계

- 총 사용자 수
- 오늘 활성 사용자
- 총 여행 기록

### 3. 에러 통계

- 24시간 에러
- 에러율
- 평균 응답 시간

### 4. 인기 기능

- Schengen 계산기
- 여행 기록 추가
- Gmail 통합
- 데이터 내보내기

## 기술적 구현

### 페이지 구조

```typescript
- MonitoringPage (서버 컴포넌트)
  - 세션 인증 확인
  - PerformanceDashboard 렌더링
  - 통계 카드들
```

### 인증 및 접근 제어

- NextAuth 세션 확인
- 비로그인 사용자 리다이렉트
- 관리자 전용 설정 가능 (주석 처리됨)

### 메타데이터

```typescript
export const metadata: Metadata = {
  title: '모니터링 대시보드',
  description: 'DINO 애플리케이션 성능 및 사용 통계 모니터링',
};
```

## 사용자 경험 (UX)

### 페이지 레이아웃

- 그리드 기반 레이아웃
- 반응형 디자인
- 카드 기반 UI

### 모니터링 서비스 통합 안내

- Sentry: 에러 추적 및 성능 모니터링
- Vercel Analytics: 자동 활성화
- Google Analytics: 사용자 행동 분석
- Core Web Vitals: 실시간 성능 지표

### 데이터 표시

- 현재 모든 데이터는 플레이스홀더(-)로 표시
- 실제 API 연동 후 동적 데이터 표시

## 접근성 및 보안

### 접근성

- 로그인 필수
- 명확한 제목과 설명
- 카드 기반 UI

### 보안

- NextAuth 세션 인증
- 관리자 전용 설정 가능
- 환경 변수 기반 설정

## 개선 가능 사항

1. **실시간 데이터**
   - API 연동을 통한 실제 데이터 표시
   - WebSocket을 통한 실시간 업데이트

2. **고급 분석**
   - 사용자 행동 패턴 분석
   - 퍼널 분석
   - 코호트 분석

3. **알림 및 경보**
   - 임계치 설정
   - 에러 알림
   - 성능 저하 경보

4. **내보내기 기능**
   - 리포트 생성
   - CSV/PDF 내보내기
   - 주기적 리포트

## 관련 페이지

- `/dashboard` - 메인 대시보드
- `/admin/monitoring` - 관리자 모니터링
- `/admin/performance` - 성능 모니터링
- `/admin/metrics` - 비즈니스 메트릭

## 컴포넌트 의존성

- `@/components/monitoring/PerformanceDashboard` - 성능 대시보드
- `@/lib/auth` - 인증 설정

## 환경 변수 설정

- `SENTRY_DSN` - Sentry 에러 추적
- `NEXT_PUBLIC_GA_ID` - Google Analytics
- Vercel Analytics는 자동 활성화
