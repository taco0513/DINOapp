# CLAUDE.md - DINO v2.0 프로젝트 AI 개발 가이드

이 파일은 Claude Code (claude.ai/code)가 이 프로젝트에서 작업할 때 참조하는 가이드입니다.

## 🦕 프로젝트 개요

**DINO v2.0 (Digital Nomad Travel Manager)**는 디지털 노마드를 위한 스마트 여행 관리 플랫폼의 재구축 버전입니다.

### 핵심 기능 (MVP)

- ✅ **셰겐 90/180일 규칙 계산기** (핵심 기능)
- ✅ **비자 상태 추적** (간소화)
- ✅ **사용자 인증** (NextAuth.js)
- 🔄 **PWA 지원** (점진적 추가)

### v2.0 설계 원칙

1. **Zero Technical Debt** - 처음부터 깨끗한 코드
2. **Risk Prevention Framework** 적용
3. **단순함 우선** - 핵심 기능에 집중
4. **TypeScript 100%** - 타입 안전성 보장

## 🏗️ 기술 스택

### Frontend

- **Next.js 14** (App Router)
- **TypeScript 5.x** (strict mode)
- **Tailwind CSS 3.4**
- **iOS Style Components** (재설계)

### Backend

- **Next.js API Routes**
- **Prisma ORM** (최신 버전)
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **NextAuth.js** (Google OAuth)

### 개발 도구

- **npm** (패키지 매니저)
- **Jest + Playwright** (테스트)
- **ESLint + Prettier** (엄격한 설정)
- **Risk Prevention Framework** (품질 보증)

## 📁 프로젝트 구조 (v2.0)

```
/dino-v2
├── app/                    # Next.js App Router (간소화)
│   ├── (auth)/            # 인증 페이지
│   ├── dashboard/         # 메인 대시보드
│   ├── schengen/          # 셰겐 계산기
│   └── api/               # API 엔드포인트 (필수만)
├── components/            # UI 컴포넌트 (핵심만)
│   ├── schengen/         # 셰겐 계산기 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 비즈니스 로직 (정리됨)
│   ├── schengen/         # 셰겐 로직 (핵심)
│   ├── auth/             # 인증 로직
│   └── utils/            # 유틸리티
├── types/                 # TypeScript 타입 정의
├── styles/               # 스타일 시스템
└── prisma/               # 데이터베이스
```

## 🎯 개발 원칙 (v2.0)

### 1. **Zero Defects Policy**

- TypeScript 에러 0개 유지
- ESLint 경고 0개 유지
- 테스트 커버리지 80% 이상

### 2. **미니멀리즘 극대화**

- 불필요한 기능 완전 제거
- 핵심 비즈니스 로직에만 집중
- 복잡성 최소화

### 3. **모바일 퍼스트**

- 모든 기능은 모바일에서 완벽하게 작동
- 터치 친화적 인터페이스
- PWA 기능 (점진적 추가)

### 4. **성능 최우선**

- 번들 크기 300KB 미만 (v1: 500KB)
- 페이지 로드 시간 1초 미만
- Core Web Vitals 최적화

## 💻 개발 가이드라인 (v2.0)

### TypeScript 엄격 모드

```typescript
// ✅ 모든 타입 명시적 정의
interface SchengenEntry {
  country: string;
  entryDate: Date;
  exitDate: Date;
  stayDays: number;
}

// ✅ 에러 처리 타입 안전
type ApiResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
```

### 컴포넌트 패턴

```tsx
// ✅ v2.0 컴포넌트 패턴
interface SchengenCalculatorProps {
  readonly entries: SchengenEntry[];
  readonly onCalculate: (result: SchengenResult) => void;
}

export function SchengenCalculator({
  entries,
  onCalculate,
}: SchengenCalculatorProps) {
  // 로직
}
```

## 🚀 개발 워크플로우 (v2.0)

### 1. Risk Prevention 체크

```bash
# 모든 개발 전
npm run risk-check

# 커밋 전 필수
npm run zero-defects-check
```

### 2. 개발 서버

```bash
npm run dev
```

### 3. 테스트 및 검증

```bash
npm run test
npm run type-check
npm run lint
```

## 📚 핵심 파일 (v2.0)

- **셰겐 계산기**: `/lib/schengen/calculator.ts`
- **API 핸들러**: `/app/api/schengen/route.ts`
- **메인 컴포넌트**: `/components/schengen/Calculator.tsx`
- **타입 정의**: `/types/schengen.ts`

## 🔧 특별 지침 (v2.0)

### 셰겐 계산기 핵심 로직

- 90/180일 규칙 정확한 구현
- 날짜 계산은 date-fns 사용
- 타임존 고려 필수
- 엣지 케이스 100% 커버

### 코드 품질

- 모든 함수는 순수 함수로 작성
- 사이드 이펙트 최소화
- 테스트 가능한 구조

### 성능

- React.memo 적극 활용
- useMemo, useCallback 최적화
- 번들 분석 정기적 실행

## 🚨 v2.0 주의사항

1. **Zero Technical Debt** - 기술적 부채 완전 금지
2. **Risk Prevention** - 모든 변경사항은 위험 평가 필수
3. **단순성** - 복잡한 기능보다 단순하고 확실한 기능
4. **품질** - 모든 코드는 프로덕션 품질

## 📈 성공 지표

- ✅ TypeScript 에러: 0개
- ✅ ESLint 경고: 0개
- ✅ 테스트 커버리지: 80%+
- ✅ 번들 크기: <300KB
- ✅ 페이지 로드: <1초

---

**DINO v2.0**: Simple, Fast, Reliable! 🦕
