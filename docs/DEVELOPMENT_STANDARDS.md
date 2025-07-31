# DINO 프로젝트 개발 표준 가이드

## 📋 개요

이 문서는 DINO 프로젝트의 모든 개발자가 준수해야 할 코딩 표준과 모범 사례를 정의합니다.

## 🎯 핵심 원칙

1. **일관성 우선**: 모든 코드는 동일한 패턴과 스타일을 따릅니다
2. **타입 안전성**: TypeScript를 활용한 엄격한 타입 검사
3. **성능 최적화**: 사용자 경험을 최우선으로 하는 성능 최적화
4. **접근성 준수**: WCAG 2.1 AA 표준 준수
5. **보안 우선**: 보안을 최우선으로 하는 개발

## 📁 파일 구조 표준

### 디렉토리 구조

```
/DINO
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지들
│   ├── api/               # API 라우트
│   └── globals.css        # 전역 스타일
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   └── features/         # 기능별 컴포넌트
├── lib/                   # 유틸리티 및 비즈니스 로직
│   ├── utils.ts          # 공통 유틸리티
│   ├── api-client.ts     # API 클라이언트
│   └── validation/       # 검증 스키마
├── hooks/                # 커스텀 훅
├── types/                # TypeScript 타입 정의
└── styles/               # 스타일 파일
```

### 파일 명명 규칙

- **페이지 컴포넌트** (`app/` 디렉토리): kebab-case (`user-profile/page.tsx`)
- **기능 컴포넌트**: PascalCase (`TripCard.tsx`, `UserProfile.tsx`)
- **UI 라이브러리 컴포넌트** (shadcn/ui): kebab-case (`button.tsx`, `dropdown-menu.tsx`)
- **유틸리티**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **훅**: camelCase with 'use' prefix (`useAuth.ts`, `useTrips.ts`)
- **타입**: PascalCase (`UserType.ts`, `TripInterface.ts`)

**참고**: 기존 파일명은 유지합니다. 새 파일만 이 규칙을 따릅니다.

## 🧩 컴포넌트 표준

### Import 패턴 (2025-07-31 표준화)

**✅ 권장 패턴**

```tsx
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { toast } from 'sonner';

// 3. Internal imports (absolute paths)
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';
import { ApiClient } from '@/lib/api-client';

// 4. Type imports (separated)
import type { Trip, User } from '@/types/global';
```

**❌ 사용 금지 패턴**

```tsx
// 개별 PageHeader 임포트 금지
import { PageHeader } from '@/components/common/PageHeader';

// 상대 경로 임포트 금지
import { Button } from '../../../components/ui/button';

// 세미콜론 누락 금지
import { useState } from 'react';
```

### 페이지 컴포넌트 구조

**표준 페이지 템플릿**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';
import { t } from '@/lib/i18n';
import type { SomeDataType } from '@/types/global';

export default function SomePage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<SomeDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 로딩 로직
  }, []);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    redirect('/auth/signin');
  }

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

### 컴포넌트 Props 타입 정의

```tsx
// Props 인터페이스는 컴포넌트 위에 정의
interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function TripCard({
  trip,
  onEdit,
  onDelete,
  isLoading = false,
  className,
}: TripCardProps) {
  // 컴포넌트 로직
}
```

### 컴포넌트 Export 패턴

프로젝트는 다음 두 가지 패턴을 모두 허용합니다:

#### 1. Function Declaration (권장 - 페이지 컴포넌트)

```tsx
// 페이지 컴포넌트와 주요 기능 컴포넌트
export default function HomePage() {
  return <div>...</div>;
}

// Named export
export function FeatureComponent() {
  return <div>...</div>;
}
```

#### 2. Const with forwardRef (권장 - UI 라이브러리 컴포넌트)

```tsx
// shadcn/ui 스타일의 재사용 가능한 UI 컴포넌트
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

**선택 가이드라인**:

- **페이지 컴포넌트**: `export default function` 사용
- **UI 컴포넌트 (shadcn/ui)**: `const` + `forwardRef` 패턴 유지
- **기능 컴포넌트**: 두 패턴 모두 허용, 일관성 우선
- **기존 코드**: 현재 패턴 유지 (불필요한 리팩토링 방지)

## 🎨 스타일링 표준

### Tailwind CSS 사용 규칙

```tsx
// ✅ 올바른 사용
<div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md">
  <Button variant="primary" size="sm">
    클릭
  </Button>
</div>

// ❌ 잘못된 사용 - 인라인 스타일 금지
<div style={{ display: 'flex', padding: '24px' }}>
  <button style={{ backgroundColor: 'blue' }}>클릭</button>
</div>
```

### 조건부 클래스명 처리

```tsx
import { cn } from '@/lib/utils';

// ✅ cn() 유틸리티 사용
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes',
  className
)}>
```

## 🔒 API 및 데이터 처리

### API 클라이언트 사용

```tsx
// ✅ ApiClient 사용
import { ApiClient } from '@/lib/api-client';

const loadData = async () => {
  try {
    const response = await ApiClient.getTrips();
    if (response.success) {
      setTrips(response.data);
    } else {
      toast.error(response.error);
    }
  } catch (error) {
    toast.error('데이터 로딩 실패');
  }
};
```

### 에러 처리 표준

```tsx
// ✅ 일관된 에러 처리
try {
  const result = await apiCall();
  // 성공 처리
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('작업 실행 중 오류가 발생했습니다');
} finally {
  setLoading(false);
}
```

## 🌐 국제화 (i18n)

### 텍스트 처리

```tsx
import { t } from '@/lib/i18n';

// ✅ 국제화 함수 사용
const title = t('trips.title');
const message = t('trips.added', { count: 5 });

// ❌ 하드코딩된 텍스트 금지
const title = '여행 목록';
```

## 🧪 테스트 표준

### 단위 테스트

```tsx
// SomeComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SomeComponent } from './SomeComponent';

describe('SomeComponent', () => {
  it('renders correctly', () => {
    render(<SomeComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<SomeComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📊 성능 최적화

### 코드 분할

```tsx
// 큰 컴포넌트는 lazy loading 사용
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 메모이제이션

```tsx
import { memo, useMemo, useCallback } from 'react';

// 컴포넌트 메모이제이션
const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  return <div>{/* 렌더링 */}</div>;
});

// 콜백 메모이제이션
const handleClick = useCallback(
  (id: string) => {
    // 클릭 처리
  },
  [dependency]
);
```

## 🔐 보안 표준

### 데이터 검증

```tsx
import { z } from 'zod';

// Zod 스키마 정의
const TripSchema = z.object({
  country: z.string().min(1),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  visaType: z.enum(['TOURIST', 'BUSINESS', 'STUDENT']),
});

// 데이터 검증
const validateTripData = (data: unknown) => {
  try {
    return TripSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid trip data');
  }
};
```

### 환경 변수 처리

```tsx
// ✅ 환경 변수 검증
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

// 누락된 환경 변수 확인
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
```

## 📝 문서화 표준

### JSDoc 주석

````tsx
/**
 * 사용자 여행 정보를 표시하는 카드 컴포넌트
 *
 * @param trip - 표시할 여행 정보
 * @param onEdit - 편집 버튼 클릭 시 호출되는 함수
 * @param onDelete - 삭제 버튼 클릭 시 호출되는 함수
 * @returns 여행 정보 카드 JSX 엘리먼트
 *
 * @example
 * ```tsx
 * <TripCard
 *   trip={tripData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  // 컴포넌트 구현
}
````

## 🛠️ 개발 도구 설정

### ESLint 규칙

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

### Prettier 설정

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

## 🚀 배포 표준

### 빌드 전 체크리스트

- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 경고/오류 없음
- [ ] 단위 테스트 모두 통과
- [ ] E2E 테스트 통과
- [ ] 성능 예산 준수 (Lighthouse 점수 90 이상)
- [ ] 접근성 검사 통과
- [ ] 보안 취약점 스캔 통과

### 환경별 설정

```tsx
// 환경별 설정 관리
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debugMode: true,
  },
  production: {
    apiUrl: 'https://dino-app.vercel.app/api',
    debugMode: false,
  },
};

export const appConfig = config[process.env.NODE_ENV as keyof typeof config];
```

## 🔄 마이그레이션 가이드

### 기존 코드 업데이트

현재 프로젝트에서 발견된 일관성 문제를 해결하기 위한 단계:

1. **Import 패턴 통일**: `@/components/common/PageHeader` → `@/components/layout/StandardPageLayout`
2. **세미콜론 추가**: 모든 import 문에 세미콜론 추가
3. **컴포넌트 구조 통일**: `StandardPageLayout` 사용으로 통일
4. **타입 정의 개선**: 모든 props에 명시적 타입 정의

### 자동화 스크립트

```bash
# ESLint 자동 수정
npx eslint --fix "**/*.{ts,tsx}"

# Prettier 자동 포맷팅
npx prettier --write "**/*.{ts,tsx,json,md}"

# Import 패턴 일괄 변경
find app -name "*.tsx" -exec sed -i 's/@\/components\/common\/PageHeader/@\/components\/layout\/StandardPageLayout/g' {} \;
```

---

**이 표준을 준수함으로써 DINO 프로젝트의 코드 품질, 유지보수성, 그리고 팀 협업 효율성을 크게 향상시킬 수 있습니다.**

마지막 업데이트: 2025-07-31
