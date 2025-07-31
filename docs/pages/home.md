# 홈페이지 (/)

## 개요

DINO 앱의 랜딩 페이지로, 서비스 소개와 주요 기능을 보여주는 첫 화면입니다.

### 주요 기능

- 서비스 브랜딩 및 소개
- 핵심 가치 제안 (Value Proposition)
- 주요 기능 하이라이트
- 로그인/회원가입 유도
- 데모 접근 경로 제공

## 사용자 역할 및 플로우

### 1. 신규 방문자 플로우

```mermaid
graph LR
    A[홈페이지 방문] --> B{이미 로그인?}
    B -->|예| C[대시보드로 리다이렉트]
    B -->|아니오| D[랜딩 페이지 표시]
    D --> E[로그인하여 시작하기]
    D --> F[데모 보기]
    E --> G[/auth/signin]
    F --> H[/demo]
```

### 2. 기존 사용자 플로우

- SessionCheck 컴포넌트가 자동으로 로그인 상태 확인
- 로그인된 사용자는 자동으로 대시보드로 리다이렉트

## UI/UX 요소

### 1. 헤더 섹션

- **브랜드명**: "DINO"
- **태그라인**: "Digital Nomad Visa Tracker"
- **설명**: 복잡한 비자 규정 자동 추적 및 여행 기록 관리

### 2. CTA (Call-to-Action) 버튼

- **주 버튼**: "로그인하여 시작하기" (btn-primary)
- **보조 버튼**: "데모 보기" (btn)
- 중앙 정렬, 적절한 간격 (gap-4)

### 3. 기능 카드

3개의 핵심 기능을 그리드로 표시:

- **실시간 추적**: 비자 만료일과 체류 기간 자동 계산
- **규정 준수**: 셰겐 90/180일 규칙 정확한 계산
- **자동 기록**: Gmail과 Calendar 통합으로 여행 자동 감지

### 4. 반응형 디자인

- 모바일: 1열 그리드 (grid-cols-1)
- 태블릿/데스크톱: 3열 그리드 (md:grid-cols-3)

## 기술 구현

### 1. 파일 구조

```typescript
// app/page.tsx
- 서버 컴포넌트로 구현
- 동적 SessionCheck 컴포넌트 로드
- CSS-in-JS 스타일 사용
```

### 2. 컴포넌트 구성

```typescript
HomePage (서버 컴포넌트)
├── SessionCheck (클라이언트 컴포넌트, 동적 로드)
├── Header Section
├── CTA Buttons
└── Features Grid
```

### 3. 동적 로딩

```typescript
const SessionCheck = dynamic(() => import('@/components/auth/SessionCheck'), {
  ssr: false,
  loading: () => null,
});
```

- SSR 비활성화로 하이드레이션 문제 방지
- 로딩 중 null 반환으로 레이아웃 시프트 방지

### 4. 스타일링 전략

- Tailwind CSS 클래스 사용
- CSS 변수 활용 (--space-20 등)
- 인라인 스타일로 세밀한 조정

## 성능 지표

### 1. Core Web Vitals 목표

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 2. 최적화 전략

- 동적 임포트로 초기 번들 크기 감소
- 이미지 최적화 (현재 이미지 없음)
- 서버 컴포넌트 활용으로 클라이언트 JS 최소화

## 모바일 지원

### 1. 반응형 브레이크포인트

- 모바일: < 768px
- 태블릿: 768px - 1024px
- 데스크톱: > 1024px

### 2. 터치 친화적 요소

- 버튼 크기 적절 (최소 44x44px)
- 충분한 탭 타겟 간격
- 모바일 우선 그리드 시스템

## 알려진 이슈

### 1. SessionCheck 하이드레이션

- 문제: 클라이언트/서버 불일치 가능성
- 해결: dynamic import with ssr: false

### 2. 데모 페이지 미구현

- 현재 /demo 경로가 구현되지 않음
- TODO: 데모 페이지 구현 필요

## 개선 계획

### 단기 (1-2주)

1. 데모 페이지 구현
2. 애니메이션 추가 (페이드인, 슬라이드)
3. 다크 모드 지원

### 중기 (1개월)

1. 사용 사례 섹션 추가
2. 고객 후기/통계 추가
3. FAQ 섹션 통합

### 장기 (3개월)

1. A/B 테스팅 구현
2. 개인화된 랜딩 페이지
3. 다국어 지원 (i18n)

## SEO/메타데이터

### 1. 메타 태그 (TODO)

```html
<title>DINO - Digital Nomad Visa Tracker | 비자 추적 및 여행 관리</title>
<meta
  name="description"
  content="복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 디지털 노마드 필수 도구"
/>
<meta
  name="keywords"
  content="디지털노마드, 비자추적, 셰겐, 여행관리, visa tracker"
/>
```

### 2. Open Graph (TODO)

```html
<meta property="og:title" content="DINO - Digital Nomad Visa Tracker" />
<meta
  property="og:description"
  content="비자 만료일 자동 추적, 셰겐 규정 준수 계산"
/>
<meta property="og:image" content="/og-image.png" />
```

## 보안 고려사항

### 1. 인증 체크

- SessionCheck 컴포넌트로 자동 리다이렉트
- 미인증 사용자만 랜딩 페이지 접근

### 2. CSRF 보호

- NextAuth.js의 기본 CSRF 보호 활용

## 사용자 분석

### 추적 이벤트 (TODO)

1. 페이지 방문
2. CTA 버튼 클릭
3. 기능 카드 상호작용
4. 스크롤 깊이

### 전환율 목표

- 방문자 → 회원가입: 5%
- 방문자 → 데모 시도: 15%
- 데모 → 회원가입: 30%

## 관련 컴포넌트

- `components/auth/SessionCheck.tsx` - 세션 확인 및 리다이렉트
- `app/auth/signin/page.tsx` - 로그인 페이지
- `app/demo/page.tsx` - 데모 페이지 (미구현)

## 관련 문서

- [인증 시스템](./auth-signin.md)
- [대시보드](./dashboard.md)
- [컴포넌트 설계](../COMPONENT_DESIGN.md)
