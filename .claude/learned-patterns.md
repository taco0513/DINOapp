# Learned Patterns - DINOapp

## Code Patterns

### API Route Error Handling Pattern

```typescript
// PATTERN: 모든 API route에서 동일한 에러 처리 구조 사용
export async function GET/POST/PUT/DELETE(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth()
    if (\!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    // 2. 입력 검증
    const body = await request.json()
    // validation logic

    // 3. 비즈니스 로직 (lib/ 함수 호출)
    const result = await businessLogicFunction(session.user.id, body)

    // 4. 성공 응답
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
```

### Component Props Interface Pattern

```typescript
// PATTERN: 컴포넌트 props는 항상 interface로 정의
interface ComponentNameProps {
  // 필수 props
  id: string;
  title: string;

  // 선택적 props
  className?: string;
  onAction?: () => void;

  // 자식 요소
  children?: React.ReactNode;
}

export default function ComponentName({
  id,
  title,
  className,
  onAction,
  children,
}: ComponentNameProps) {
  // 컴포넌트 로직
}
```

### Database Query Pattern

```typescript
// PATTERN: Prisma 쿼리는 lib/ 함수로 분리, 에러 처리 포함
export async function getUserTrips(userId: string) {
  try {
    return await prisma.trip.findMany({
      where: { userId },
      include: {
        // 필요한 관계 데이터만 include
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch user trips');
  }
}
```

## Architecture Patterns

### Feature-Based Folder Structure

```
feature/
├── components/           # UI 컴포넌트
├── api/                 # API 엔드포인트
├── lib/                 # 비즈니스 로직
└── types/               # TypeScript 타입 정의
```

### Environment Configuration Pattern

```typescript
// PATTERN: 환경 설정은 config 객체로 중앙화
export const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID\!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET\!,
  },
  database: {
    url: process.env.DATABASE_URL\!,
  },
  // 환경변수 누락시 즉시 에러 발생하도록 \! 사용
}
```

## Common Solutions

### Google OAuth Setup

```typescript
// LESSON: Google OAuth 리디렉션 URI는 정확히 설정해야 함
// 개발: http://localhost:3000/api/auth/callback/google
// 프로덕션: https://yourdomain.com/api/auth/callback/google
```

### Prisma Migration Workflow

```bash
# LESSON: Prisma 스키마 변경시 항상 이 순서로 실행
npx prisma migrate dev --name describe-changes
npx prisma generate
# 서버 재시작
```

### Next.js App Router Caching

```typescript
// LESSON: API Route 캐싱 방지하려면
export const dynamic = 'force-dynamic';
// 또는
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'no-store' },
});
```

## Performance Learnings

### Database Query Optimization

- `include`보다 `select` 사용시 성능 향상
- `findMany`에 `take` 제한 설정으로 대량 데이터 방지
- 인덱스가 필요한 필드들을 Prisma 스키마에 명시

### Component Rendering Optimization

- 큰 목록은 가상화 또는 페이지네이션 적용
- `useCallback`, `useMemo` 적절히 활용
- 상태 변경이 많은 컴포넌트는 작게 분리

## Security Learnings

### Input Validation

```typescript
// LESSON: 사용자 입력은 항상 서버사이드에서 검증
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(100),
  date: z.date(),
});

const validated = schema.parse(input); // 에러 발생시 자동 throw
```

### Session Management

```typescript
// LESSON: 민감한 API는 항상 세션 체크
const session = await auth()
if (\!session?.user?.id) {
  return NextResponse.json({error: 'Unauthorized'}, {status: 401})
}
```

## UI/UX Learnings

### Mobile Responsiveness

- Tailwind의 모바일 퍼스트 접근법 활용
- 터치 인터랙션을 위한 최소 44px 터치 영역
- 모바일에서 호버 효과 대신 활성 상태 사용

### Accessibility

- 모든 인터랙티브 요소에 적절한 aria 라벨
- 키보드 내비게이션 지원
- 색상만으로 정보 전달하지 않기

## Integration Learnings

### Gmail API

```typescript
// LESSON: Gmail API 사용시 배치 처리가 효율적
const batch = gmail.users.messages.batchGet({
  userId: 'me',
  ids: messageIds,
});
```

### Google Calendar API

```typescript
// LESSON: 캘린더 이벤트 생성시 시간대 설정 중요
const event = {
  start: {
    dateTime: '2024-01-01T10:00:00',
    timeZone: 'Asia/Seoul',
  },
};
```

## Recent Problem Solutions

### 2025-01-29: Living Documentation 구축

- **문제**: AI가 프로젝트 컨텍스트를 매번 다시 학습해야 함
- **해결**: `.claude/` 폴더에 구조화된 컨텍스트 파일들 생성
- **학습**: 5초 투자로 몇 시간 절약하는 원칙 적용

### Previous Issues (from docs/errors/)

- Google OAuth 리디렉션 URI 설정 문제 → 정확한 URL 매칭 필요
- Prisma 마이그레이션 충돌 → 순서대로 실행하고 스키마 백업
- API Route 캐싱 문제 → dynamic export 또는 Cache-Control 헤더 사용

## Best Practices Discovered

1. **5초 원칙**: 지금 5초 투자해서 나중에 시간 절약
2. **에러 우선**: 에러 케이스를 먼저 처리하고 성공 케이스 구현
3. **타입 안전성**: any 타입 사용 금지, 엄격한 타입 검사
4. **컴포넌트 분리**: 하나의 책임만 가지는 작은 컴포넌트들
5. **비즈니스 로직 분리**: UI 컴포넌트에서 비즈니스 로직 제거

## Code Quality Rules

- 함수명은 동사로 시작 (`getUserTrips`, `createTrip`)
- 불변성 유지 (spread operator, immutable updates)
- Early return 패턴으로 중첩 줄이기
- 매직 넘버 대신 상수 사용
- JSDoc 주석으로 복잡한 함수 설명

## Testing Insights

- API 테스트는 실제 DB 연결 없이 모킹
- E2E 테스트는 핵심 사용자 플로우만 커버
- 단위 테스트는 비즈니스 로직 함수 중심
- 테스트 데이터는 팩토리 패턴으로 생성
  EOF < /dev/null
