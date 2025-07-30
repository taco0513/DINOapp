# 비즈니스 메트릭 페이지 (/admin/metrics)

## 개요

DINO 플랫폼의 핵심 성과 지표(KPI)와 사용자 행동 분석을 실시간으로 확인하는 관리자 전용 페이지입니다.

## 주요 기능

### 1. 비즈니스 메트릭 대시보드

- BusinessMetricsDashboard 컴포넌트 통합
- 실시간 데이터 시각화
- 핵심 성과 지표 모니터링

### 2. 보안 및 권한

- NextAuth 기반 인증
- 환경 변수를 통한 관리자 이메일 관리
- 미인증 사용자 리다이렉트

## 기술적 구현

### 페이지 구조

```typescript
- AdminMetricsPage (서버 컴포넌트)
  - 세션 인증 확인
  - 관리자 권한 검증
  - BusinessMetricsDashboard 렌더링
```

### 보안 흐름

1. getServerSession으로 세션 확인
2. 세션 없으면 로그인 페이지로 리다이렉트
3. ADMIN_EMAILS 환경 변수로 관리자 확인
4. 권한 없으면 대시보드로 리다이렉트

### 메타데이터

```typescript
export const metadata: Metadata = {
  title: '비즈니스 메트릭 - DINO Admin',
  description: 'DINO 플랫폼의 비즈니스 성과와 사용자 분석을 확인하세요.',
};
```

## 사용자 경험 (UX)

### 페이지 레이아웃

- 컨테이너 기반 레이아웃
- 제목과 설명 헤더
- BusinessMetricsDashboard 메인 콘텐츠

### 예상 메트릭

- 사용자 활성화 지표
- 전환율 및 가입률
- 수익 및 성장 지표
- 사용자 행동 패턴

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

1. **역할 기반 접근 제어 (RBAC)**
   - 단순 이메일 확인 대신 역할 기반 구현
   - 다양한 관리자 레벨 지원

2. **데이터 수집 및 분석**
   - 실시간 메트릭 수집 API
   - 데이터 시각화 개선

3. **내보내기 기능**
   - PDF/Excel 리포트 생성
   - 주기적 리포트 자동 발송

## 관련 페이지

- `/admin/analytics` - 관리자 분석
- `/admin/performance` - 성능 모니터링
- `/admin/monitoring` - 시스템 모니터링
- `/admin/users` - 사용자 관리

## 컴포넌트 의존성

- `@/components/metrics/BusinessMetricsDashboard` - 비즈니스 메트릭 대시보드
- `@/lib/auth` - 인증 설정
