# CLAUDE.md - DINO 프로젝트 AI 개발 가이드

이 파일은 Claude Code (claude.ai/code)가 이 프로젝트에서 작업할 때 참조하는 가이드입니다.

## 🦕 프로젝트 개요

**DINO (Digital Nomad Travel Manager)**는 디지털 노마드를 위한 스마트 여행 관리 플랫폼입니다.

### 핵심 기능

- 78개국 비자 규정 자동 추적
- 셰겐 90/180일 규칙 계산기
- Gmail 통합으로 여행 정보 자동 추출
- PWA 지원으로 모바일 최적화

## 🏗️ 기술 스택

### Frontend

- **Next.js 14** (App Router)
- **TypeScript 5.8**
- **Tailwind CSS 3.4**
- **iOS Style Components** (커스텀 디자인 시스템)

### Backend

- **Next.js API Routes**
- **Prisma ORM 6.12**
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **NextAuth.js** (Google OAuth)

### 개발 도구

- **npm** (패키지 매니저)
- **Jest + Playwright** (테스트)
- **ESLint + Prettier** (코드 품질)

## 📁 프로젝트 구조

```
/DINO
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (dashboard)/       # 메인 앱
│   └── api/               # API 엔드포인트
├── components/            # UI 컴포넌트
│   ├── schengen/         # 셰겐 계산기
│   ├── trips/            # 여행 관리
│   └── ui/               # 기본 UI
├── lib/                   # 비즈니스 로직
│   ├── schengen/         # 셰겐 로직
│   ├── gmail/            # Gmail 통합
│   └── security/         # 보안 유틸
├── styles/               # 스타일 시스템
│   ├── ios-components.css # iOS 스타일
│   └── design-tokens.css  # 디자인 토큰
└── prisma/               # 데이터베이스
```

## 🎯 개발 원칙

### 1. **미니멀리즘 우선**

- 불필요한 기능 추가 금지
- 핵심 기능에 집중
- 깔끔하고 직관적인 UI

### 2. **모바일 퍼스트**

- 모든 기능은 모바일에서 완벽하게 작동
- 터치 친화적 인터페이스
- PWA 기능 활용

### 3. **성능 최적화**

- 번들 크기 최소화
- 이미지 최적화
- 코드 스플리팅 적극 활용

### 4. **보안 우선**

- 최소 권한 원칙
- 민감한 데이터 암호화
- 정기적인 보안 감사

## 🔧 코드 일관성 가이드라인

### Import 패턴 (2025-07-31 업데이트)

**⚠️ 중요: 다음 패턴을 반드시 따라주세요**

```tsx
// ✅ 올바른 패턴: StandardPageLayout 사용
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';

// ❌ 사용 금지: 개별 PageHeader 임포트
// import { PageHeader, PageIcons } from '@/components/common/PageHeader'
```

### 페이지 컴포넌트 표준 구조

```tsx
// ✅ 권장 패턴
export default function SomePage() {
  return (
    <StandardPageLayout
      title={t('page.title')}
      description={t('page.description')}
      icon={PageIcons.SomeIcon}
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.current') },
      ]}
    >
      {/* 페이지 컨텐츠 */}
    </StandardPageLayout>
  );
}
```

### 코드 스타일 규칙

```tsx
// ✅ 세미콜론 필수
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// ❌ 세미콜론 누락 금지
// import { useState } from 'react'
```

## 💻 개발 가이드라인

### 컴포넌트 작성

```tsx
// ✅ 좋은 예: 타입 안전, 명확한 props
interface TripCardProps {
  trip: Trip;
  onEdit?: (id: string) => void;
  isLoading?: boolean;
}

export function TripCard({ trip, onEdit, isLoading = false }: TripCardProps) {
  // 컴포넌트 로직
}

// ❌ 나쁜 예: any 타입, 불명확한 props
export function TripCard({ data, callback }: any) {
  // 피해야 할 패턴
}
```

### 스타일링

```css
/* ✅ 좋은 예: 디자인 토큰 사용 */
.button {
  background: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-base);
}

/* ❌ 나쁜 예: 하드코딩된 값 */
.button {
  background: #000;
  padding: 16px;
  border-radius: 8px;
}
```

### API 라우트

```ts
// ✅ 좋은 예: 에러 처리, 타입 안전
export async function GET(request: Request) {
  try {
    const trips = await prisma.trip.findMany();
    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}
```

## 🚀 개발 워크플로우

### 1. 기능 개발

```bash
# 1. 브랜치 생성
git checkout -b feature/기능명

# 2. 개발 서버 시작
npm run dev

# 3. 테스트 작성 및 실행
npm test

# 4. 린트 및 타입 체크
npm run lint
npm run type-check
```

### 2. 데이터베이스 작업

```bash
# 스키마 변경 후
npm run db:generate
npm run db:push

# 마이그레이션 생성
npm run db:migrate
```

### 3. 배포 전 체크

```bash
# 전체 검증
npm run check:all

# 빌드 테스트
npm run build
```

## 🐛 일반적인 문제 해결

### 1. 포트 충돌

- 개발 서버는 반드시 포트 3000에서 실행
- `PORT=3000 npm run dev` 사용

### 2. 데이터베이스 오류

- `npm run db:generate` 먼저 실행
- Prisma 클라이언트 재생성

### 3. 타입 오류

- `npm run type-check`로 확인
- tsconfig.json 설정 검토

## 📚 주요 파일 참조

- **비즈니스 로직**: `/lib/schengen/calculator.ts`
- **API 핸들러**: `/app/api/trips/route.ts`
- **주요 컴포넌트**: `/components/schengen/SchengenCalculator.tsx`
- **스타일 가이드**: `/STYLEGUIDE.md`
- **디자인 토큰**: `/styles/design-tokens.css`

## 🔧 특별 지침

### Gmail API 작업 시

- 권한은 최소한으로 유지
- 사용자 데이터는 즉시 처리 후 삭제
- 에러 메시지에 민감한 정보 포함 금지

### 셰겐 계산기 작업 시

- 날짜 계산은 date-fns 라이브러리 사용
- 타임존 고려 필수
- 엣지 케이스 테스트 필수

### 성능 최적화 시

- 번들 분석: `npm run build:analyze`
- Lighthouse 실행: `npm run lighthouse`
- 이미지는 Next.js Image 컴포넌트 사용

## 🎨 디자인 시스템

### iOS 스타일 컴포넌트

- `/styles/ios-components.css` 참조
- Human Interface Guidelines 준수
- 다크모드 지원 필수

### 반응형 브레이크포인트

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚨 주의사항

1. **환경 변수**: `.env.local`의 모든 값 필수
2. **보안**: 클라이언트에 민감한 정보 노출 금지
3. **성능**: 번들 크기 500KB 미만 유지
4. **접근성**: WCAG 2.1 AA 준수

## 📞 도움이 필요할 때

- **문서**: `/docs` 디렉토리 참조
- **예제**: `/components/examples` 참조
- **테스트**: `/__tests__` 디렉토리 참조

---

**Remember**: Keep it simple, make it beautiful, and focus on the user experience! 🦕
