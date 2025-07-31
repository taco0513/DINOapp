# Decision: Google OAuth Only for Authentication

## DATE

2024-07-28

## CONTEXT

DINO 프로젝트의 사용자 인증 시스템 구현이 필요. 디지털 노마드 타겟으로 간편한 로그인과 Google 서비스 연동이 중요.

## OPTIONS_CONSIDERED

1. **Email/Password + Social Logins**
   - Pros: 다양한 로그인 옵션, 사용자 선택권
   - Cons: 구현 복잡도 증가, 유지보수 부담

2. **Google OAuth Only**
   - Pros: 구현 단순, Gmail/Calendar 연동 자연스러움, 유지보수 용이
   - Cons: Google 계정 없는 사용자 배제

3. **Magic Link (Passwordless)**
   - Pros: 보안성 높음, 비밀번호 관리 불필요
   - Cons: 이메일 의존성, UX 익숙하지 않음

## DECISION

**Google OAuth Only** 선택

## REASONING

- 타겟 사용자(디지털 노마드)는 대부분 Google 계정 보유
- Gmail/Calendar API 연동이 핵심 기능
- MVP 단계에서 단순함 우선
- 향후 다른 로그인 방식 추가 가능

## IMPLEMENTATION

```typescript
// lib/auth.ts
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        scope:
          'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
      },
    },
  }),
];
```

## CONSEQUENCES

- ✅ 빠른 개발 및 출시
- ✅ Gmail/Calendar 연동 원활
- ✅ 유지보수 부담 감소
- ❌ Google 계정 없는 사용자 사용 불가
- ❌ Google 서비스 의존성 증가

## RELATED_FILES

- lib/auth.ts: NextAuth 설정
- app/api/auth/[...nextauth]/route.ts: Auth API
- components/auth/SessionCheck.tsx: 인증 체크

## REVIEW_DATE

2025-01-28 (6개월 후 재검토 - 사용자 피드백 반영)
