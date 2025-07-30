# 에러 패턴 및 해결책

## 🔍 자주 발생하는 에러

### 1. Prisma 관련 에러

#### 에러: "Cannot find module '@prisma/client'"

**원인**: Prisma 클라이언트 미생성
**해결책**:

```bash
bun run db:generate
```

#### 에러: "Database connection failed"

**원인**: DATABASE_URL 설정 오류
**해결책**:

1. `.env.local` 확인
2. 데이터베이스 파일 존재 확인
3. `bun run db:push` 실행

### 2. Gmail API 에러

#### 에러: "Insufficient permission"

**원인**: 권한 부족
**해결책**:

1. Google OAuth 스코프 확인
2. 토큰 재발급
3. 최소 권한만 요청

#### 에러: "Rate limit exceeded"

**원인**: API 호출 제한 초과
**해결책**:

1. 지수 백오프 구현
2. 캐싱 활용
3. 배치 처리

### 3. Next.js 에러

#### 에러: "Hydration failed"

**원인**: 서버/클라이언트 불일치
**해결책**:

1. `use client` 지시어 확인
2. 조건부 렌더링 검토
3. useEffect 사용

#### 에러: "Module not found"

**원인**: 잘못된 import 경로
**해결책**:

1. 절대 경로 사용 (`@/`)
2. 파일 확장자 확인
3. 대소문자 확인

### 4. TypeScript 에러

#### 에러: "Type 'X' is not assignable to type 'Y'"

**원인**: 타입 불일치
**해결책**:

1. 타입 정의 확인
2. 타입 가드 사용
3. 제네릭 활용

### 5. 배포 에러

#### 에러: "Build failed"

**원인**: 환경 변수 누락
**해결책**:

1. Vercel 환경 변수 설정
2. `vercel-build` 스크립트 확인
3. 빌드 로그 분석

## 💡 예방 팁

1. **개발 전 체크리스트**
   - [ ] 환경 변수 설정
   - [ ] 데이터베이스 마이그레이션
   - [ ] 타입 체크 실행

2. **커밋 전 체크리스트**
   - [ ] 린트 통과
   - [ ] 테스트 통과
   - [ ] 빌드 성공

3. **배포 전 체크리스트**
   - [ ] 프로덕션 환경 변수
   - [ ] 데이터베이스 백업
   - [ ] 모니터링 설정
