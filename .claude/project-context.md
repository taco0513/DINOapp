# DINOapp - Project Context for Claude

## What This Project Does

**DINOapp**은 AI 기반 여행 계획 및 관리 플랫폼입니다.

- 🌍 **여행 계획**: 스마트한 여행 일정 생성 및 관리
- 📧 **Gmail 통합**: 이메일에서 여행 정보 자동 추출
- 📅 **달력 동기화**: Google Calendar 연동
- 🇪🇺 **Schengen 계산**: 솅겐 지역 체류 기간 자동 계산
- 🤖 **AI 어시스턴트**: 여행 관련 질문 답변 및 코드 생성

## Architecture Overview

**Next.js 14 App Router + TypeScript + Prisma + SQLite 기반 풀스택 웹앱**

```
Frontend (Next.js 14)
├── app/                    # App Router 페이지
├── components/            # React 컴포넌트
└── styles/               # Tailwind CSS + 커스텀

Backend (API Routes)
├── app/api/              # REST API 엔드포인트
├── lib/                  # 비즈니스 로직 & 유틸리티
└── prisma/              # 데이터베이스 스키마

Infrastructure
├── Vercel 배포
├── SQLite (개발) / PostgreSQL (프로덕션)
└── Google OAuth + Gmail API
```

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js + Google OAuth
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Jest + Playwright
- **Deployment**: Vercel
- **Integrations**: Gmail API, Google Calendar API

## Important Patterns

### 1. API Route Pattern

```typescript
// app/api/[resource]/route.ts
export async function GET(request: NextRequest) {
  try {
    // 인증 체크
    const session = await auth()
    if (\!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    // 비즈니스 로직 (lib/에서 import)
    const result = await someBusinessLogic()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({error: 'Internal error'}, {status: 500})
  }
}
```

### 2. Component Structure Pattern

```typescript
// components/[category]/ComponentName.tsx
interface ComponentProps {
  // TypeScript 인터페이스
}

export default function ComponentName({}: ComponentProps) {
  // React 컴포넌트 로직
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  )
}
```

### 3. Database Access Pattern

```typescript
// lib/[domain].ts
import { prisma } from './prisma';

export async function getDomainData(userId: string) {
  return await prisma.model.findMany({
    where: { userId },
    include: { relatedModel: true },
  });
}
```

## Common Gotchas

- ⚠️ **Google OAuth 설정**: 리디렉션 URI 정확히 설정 필요
- ⚠️ **Prisma 스키마 변경**: migrate → generate → 재시작 순서
- ⚠️ **API Route 캐싱**: Next.js 14에서 기본 캐싱됨, 필요시 no-store 설정
- ⚠️ **환경변수**: .env.local과 Vercel 환경변수 동기화 필요
- ⚠️ **Gmail API 권한**: 이메일 읽기 권한 승인 필요

## File Organization

```
app/
├── (auth)/               # 인증 관련 페이지
├── (dashboard)/          # 대시보드 페이지
├── api/                  # API 엔드포인트
│   ├── auth/            # 인증 API
│   ├── trips/           # 여행 CRUD API
│   ├── gmail/           # Gmail 통합 API
│   └── ai/              # AI 어시스턴트 API
├── dashboard/           # 메인 대시보드
├── trips/               # 여행 관리
└── auth/                # 로그인/로그아웃

components/
├── ai/                  # AI 관련 컴포넌트
├── travel/              # 여행 관련 컴포넌트
├── auth/                # 인증 컴포넌트
├── ui/                  # 공통 UI 컴포넌트
└── layout/              # 레이아웃 컴포넌트

lib/
├── auth.ts              # NextAuth 설정
├── prisma.ts            # Prisma 클라이언트
├── gmail.ts             # Gmail API 연동
├── travel-manager.ts    # 여행 비즈니스 로직
└── utils.ts             # 공통 유틸리티
```

## Current Status

- ✅ **완료**: 기본 인증, 여행 CRUD, Gmail 통합, AI 어시스턴트
- 🔄 **진행중**: Living Documentation 시스템 구축
- 📋 **예정**: 성능 최적화, 모바일 반응형 개선

## Key Business Logic Files

- `lib/travel-manager.ts`: 여행 관리 핵심 로직
- `lib/gmail.ts`: Gmail 이메일 파싱 및 분석
- `lib/schengen-calculator.ts`: 솅겐 체류 계산
- `app/api/ai/`: AI 어시스턴트 엔드포인트들

## Database Schema Key Models

- `User`: 사용자 정보 (Google OAuth)
- `Trip`: 여행 정보 (목적지, 날짜, 메모)
- `Email`: Gmail에서 추출한 여행 관련 이메일
- `Notification`: 사용자 알림

## Testing Strategy

- **Unit Tests**: Jest (비즈니스 로직)
- **Integration Tests**: API 엔드포인트 테스트
- **E2E Tests**: Playwright (핵심 사용자 플로우)

## Recent Major Changes

- 2025-01-28: AI 협업 시스템 구현 완료
- 2025-01-29: Smart Assistant 기능 추가
- 2025-01-29: Living Documentation 시스템 구축 시작

## Next Priorities

1. Living Documentation 시스템 완성
2. 모바일 사용성 개선
3. 성능 최적화 (데이터베이스 쿼리)
4. 사용자 온보딩 플로우 개선
   EOF < /dev/null
