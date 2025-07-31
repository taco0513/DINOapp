# DINO Technical Stack

## 🎯 Overview

DINO는 현대적인 웹 기술 스택을 사용하여 구축된 디지털 노마드 여행 관리 플랫폼입니다.

## 🛠️ Core Technologies

### Frontend

#### Framework & Language

- **Next.js 14.2** - React 기반 풀스택 프레임워크 (App Router)
- **TypeScript 5.8** - 타입 안전성을 위한 정적 타입 언어
- **React 18.3** - UI 라이브러리

#### Styling & UI Components

- **Tailwind CSS 3.4** - Utility-first CSS 프레임워크
- **shadcn/ui** - Radix UI와 Tailwind CSS 기반 컴포넌트 시스템
  - Copy-paste 방식의 컴포넌트 라이브러리
  - Radix UI primitives 사용으로 접근성 보장
  - CSS Variables 기반 테마 시스템
- **Design Tokens** - CSS 변수 기반 디자인 토큰 시스템
  - 색상: `--background`, `--foreground`, `--primary` 등
  - 일관된 디자인 시스템 구현

#### UI Libraries

- **Radix UI** - Headless UI 컴포넌트
  - `@radix-ui/react-select`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-slot`
  - `@radix-ui/react-progress`
- **Lucide React** - 아이콘 라이브러리
- **Recharts** - 차트 라이브러리
- **Framer Motion** - 애니메이션 라이브러리

### Backend

#### Database & ORM

- **PostgreSQL 15+** - 프로덕션 데이터베이스
- **SQLite** - 개발 환경 데이터베이스
- **Prisma 6.12** - 타입 안전 ORM

#### Authentication & Security

- **NextAuth.js 4.24** - 인증 시스템
- **Google OAuth 2.0** - 소셜 로그인
- **bcrypt** - 비밀번호 해싱

#### API Integration

- **Google APIs** - Gmail, Calendar 통합
- **Next.js API Routes** - 서버리스 API 엔드포인트

### Development Tools

#### Build & Bundle

- **Webpack** (Next.js 내장)
- **PostCSS** - CSS 처리
- **Autoprefixer** - CSS 벤더 프리픽스

#### Code Quality

- **ESLint** - 코드 린팅
- **Prettier** - 코드 포매팅
- **TypeScript** - 타입 체킹

#### Testing

- **Jest** - 단위 테스트
- **Playwright** - E2E 테스트
- **@axe-core/playwright** - 접근성 테스트

### Utilities

#### Core Utilities

- **clsx** - 조건부 클래스명 결합
- **tailwind-merge** - Tailwind 클래스 충돌 해결
- **class-variance-authority (CVA)** - 컴포넌트 변형 관리
- **date-fns** - 날짜 처리 라이브러리

#### Performance & Monitoring

- **@vercel/analytics** - 분석 도구
- **@vercel/speed-insights** - 성능 모니터링
- **@sentry/nextjs** - 에러 모니터링
- **web-vitals** - Core Web Vitals 측정

### Deployment

- **Vercel** - 호스팅 플랫폼
- **GitHub Actions** - CI/CD
- **Docker** - 컨테이너화 (옵션)

## 🏗️ Architecture Patterns

### Frontend Patterns

- **Component Composition** - 복합 컴포넌트 패턴
- **Atomic Design** - 원자적 디자인 시스템
- **CSS Variables Theme** - 동적 테마 시스템
- **Utility-First CSS** - Tailwind CSS 유틸리티 클래스

### State Management

- **React Context** - 전역 상태 관리
- **Server Components** - 서버 사이드 데이터 페칭
- **Client Components** - 인터랙티브 UI

### Data Fetching

- **Server Components** - 초기 데이터 로드
- **API Routes** - 클라이언트 사이드 데이터 페칭
- **Prisma Client** - 타입 안전 데이터베이스 쿼리

## 📦 Key Dependencies

### Production Dependencies

```json
{
  "@radix-ui/*": "Headless UI components",
  "tailwindcss": "Utility-first CSS",
  "class-variance-authority": "Component variants",
  "clsx": "Class name utility",
  "tailwind-merge": "Tailwind class merging",
  "date-fns": "Date manipulation",
  "lucide-react": "Icon library",
  "recharts": "Chart library",
  "next-auth": "Authentication",
  "@prisma/client": "Database ORM"
}
```

### Development Dependencies

```json
{
  "typescript": "Type checking",
  "eslint": "Code linting",
  "prettier": "Code formatting",
  "jest": "Unit testing",
  "playwright": "E2E testing"
}
```

## 🎨 Design System Integration

### shadcn/ui Components

- Copy-paste 방식으로 프로젝트에 직접 통합
- `/components/ui/` 디렉토리에 위치
- 필요에 따라 커스터마이징 가능

### Theme System

```css
/* CSS Variables for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 221.2 83.2% 53.3%;
  --muted: 240 4.8% 95.9%;
  /* ... more tokens */
}
```

### Utility Helper

```typescript
// cn() helper for conditional classes
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

## 🚀 Performance Optimizations

- **Next.js Image Optimization** - 자동 이미지 최적화
- **Code Splitting** - 자동 코드 분할
- **Server Components** - 서버 사이드 렌더링
- **Edge Runtime** - Edge에서 실행 가능한 API
- **ISR** - Incremental Static Regeneration

## 📱 Progressive Web App (PWA)

- **Service Worker** - 오프라인 지원
- **Web App Manifest** - 앱 설치 가능
- **Push Notifications** - 알림 기능
- **Responsive Design** - 모바일 최적화
