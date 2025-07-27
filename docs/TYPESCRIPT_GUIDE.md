# TypeScript 사용 가이드

## 📋 개요

DINO 프로젝트는 TypeScript strict 모드를 사용하여 타입 안전성을 최대한 보장합니다. 이 문서는 팀 개발자들이 TypeScript를 효과적으로 사용할 수 있도록 가이드라인을 제공합니다.

## 🔧 TypeScript 설정

### 현재 활성화된 strict 옵션들
```json
{
  "strict": true,                        // 모든 strict 옵션 활성화
  "noImplicitAny": true,                // any 타입 암시적 사용 금지
  "strictNullChecks": true,             // null/undefined 체크 강화
  "strictFunctionTypes": true,          // 함수 타입 검사 강화
  "strictBindCallApply": true,          // bind/call/apply 메서드 타입 검사
  "strictPropertyInitialization": true, // 클래스 프로퍼티 초기화 검사
  "alwaysStrict": true,                 // 모든 파일에 'use strict' 적용
  "noUnusedLocals": true,               // 사용하지 않는 지역 변수 에러
  "noUnusedParameters": true,           // 사용하지 않는 매개변수 에러
  "noImplicitReturns": true,            // 암시적 return 금지
  "noFallthroughCasesInSwitch": true,  // switch문 fall-through 금지
  "noImplicitOverride": true            // override 키워드 필수
}
```

## 📝 Best Practices

### 1. 타입 정의

#### ✅ Good
```typescript
// 명시적 타입 정의
interface User {
  id: string
  email: string
  name?: string
}

// 함수 매개변수와 반환값 타입 명시
function calculateDays(entry: Date, exit: Date | null): number {
  if (!exit) return 0
  return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
}

// 배열과 객체 타입 명시
const visits: CountryVisit[] = []
const countByCountry: Record<string, number> = {}
```

#### ❌ Bad
```typescript
// any 타입 사용
let data: any = fetchData()

// 타입 명시 없는 함수
function process(data) {
  return data.map(item => item.value)
}

// 암시적 any
const result = []  // any[] 타입
```

### 2. Null/Undefined 처리

#### ✅ Good
```typescript
// Optional chaining 사용
const exitDate = visit.exitDate?.toISOString()

// Type guard 사용
if (user.email !== undefined) {
  sendEmail(user.email)
}

// Nullish coalescing 사용
const name = user.name ?? 'Unknown User'
```

#### ❌ Bad
```typescript
// null 체크 없이 사용
const days = visit.exitDate.getTime() - visit.entryDate.getTime()

// 타입 단언 남용
const email = user.email as string
```

### 3. API Route 타입

#### ✅ Good
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 타입 안전한 응답
    return NextResponse.json({
      success: true,
      data: { /* ... */ }
    })
  } catch (error) {
    // 에러 타입 체크
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
  }
}
```

### 4. Prisma 타입 활용

#### ✅ Good
```typescript
import type { User, CountryVisit } from '@prisma/client'

// Prisma 생성 타입 활용
type UserWithVisits = User & {
  countryVisits: CountryVisit[]
}

// Type-safe queries
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: { countryVisits: true }
}) // 타입: UserWithVisits | null
```

### 5. 타입 좁히기 (Type Narrowing)

#### ✅ Good
```typescript
// Type guard 함수
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// 사용 예시
if (isString(action)) {
  // 여기서 action은 string 타입
  userActions[action] = (userActions[action] || 0) + 1
}

// in 연산자 사용
if ('duration' in event.data) {
  // event.data.duration 안전하게 사용 가능
  totalTime += event.data.duration
}
```

## 🛠️ 일반적인 에러 해결 방법

### 1. "Object is possibly 'undefined'" 에러
```typescript
// 해결책 1: Optional chaining
const value = data?.property?.value

// 해결책 2: Type guard
if (data && data.property) {
  const value = data.property.value
}

// 해결책 3: Default value
const value = data?.property?.value ?? defaultValue
```

### 2. "Argument of type 'X' is not assignable to parameter of type 'Y'" 에러
```typescript
// 해결책: 타입 검사 후 사용
if (typeof value === 'number') {
  processNumber(value)
}
```

### 3. "Property does not exist on type" 에러
```typescript
// 해결책: 인터페이스 확장 또는 타입 단언
interface ExtendedData extends BaseData {
  newProperty: string
}

// 또는 타입 가드 사용
if ('newProperty' in data) {
  console.log(data.newProperty)
}
```

## 🚀 개발 워크플로우

1. **개발 중**: `npm run dev`로 실시간 타입 체크
2. **커밋 전**: `npm run type-check`로 전체 프로젝트 타입 검사
3. **빌드 시**: 자동으로 타입 체크 실행 (타입 에러 시 빌드 실패)

## 📚 추가 리소스

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 💡 팁

1. VSCode의 TypeScript 자동 완성 기능을 적극 활용
2. `// @ts-ignore` 사용은 최대한 피하고, 정말 필요한 경우 이유 설명
3. 제네릭을 활용하여 재사용 가능한 타입 작성
4. 외부 라이브러리 사용 시 `@types/*` 패키지 확인

---

> 타입 안전성은 런타임 에러를 줄이고 코드 품질을 높이는 가장 효과적인 방법입니다.