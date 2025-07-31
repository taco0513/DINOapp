# 트러블슈팅 가이드

DINOapp 운영 중 발생할 수 있는 문제들과 해결 방법을 정리한 가이드입니다.

## 🔧 일반적인 문제 해결

### 애플리케이션 시작 문제

#### 문제: 앱이 시작되지 않음

```bash
# 증상
npm run dev
# Error: Cannot find module '@prisma/client'
```

**해결 방법**:

```bash
# 1. Prisma 클라이언트 재생성
npx prisma generate

# 2. 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 3. 환경 변수 확인
cp .env.example .env.local
# .env.local 파일 내용 확인 및 수정
```

#### 문제: 포트 충돌

```bash
# 증상
Error: listen EADDRINUSE: address already in use :::3000
```

**해결 방법**:

```bash
# 1. 사용 중인 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 2. 다른 포트 사용
PORT=3001 npm run dev

# 3. 프로세스 확인
ps aux | grep node
```

### 데이터베이스 연결 문제

#### 문제: 데이터베이스 연결 실패

```bash
# 증상
PrismaClientInitializationError: Can't reach database server
```

**해결 방법**:

```bash
# 1. 데이터베이스 상태 확인
pg_isready -h localhost -p 5432

# 2. PostgreSQL 서비스 재시작
sudo service postgresql restart

# 3. 연결 문자열 확인
echo $DATABASE_URL

# 4. 네트워크 연결 테스트
telnet your-db-host 5432
```

#### 문제: 마이그레이션 실패

```bash
# 증상
Migration failed: relation "User" already exists
```

**해결 방법**:

```bash
# 1. 마이그레이션 상태 확인
npx prisma migrate status

# 2. 스키마 리셋 (개발환경만)
npx prisma migrate reset

# 3. 수동 마이그레이션 (프로덕션)
npx prisma db push --preview-feature

# 4. 특정 마이그레이션 해결
npx prisma migrate resolve --applied "migration-name"
```

### 인증 관련 문제

#### 문제: NextAuth 세션 오류

```bash
# 증상
[next-auth][error][CLIENT_FETCH_ERROR]
```

**해결 방법**:

```bash
# 1. 환경 변수 확인
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# 2. 새로운 시크릿 생성
openssl rand -base64 32

# 3. Google OAuth 설정 확인
# Google Cloud Console에서 클라이언트 ID/Secret 확인
# 리다이렉트 URI 설정 확인

# 4. 세션 쿠키 삭제
# 브라우저 개발자 도구 → Application → Cookies → 삭제
```

#### 문제: Google API 인증 실패

```bash
# 증상
Error 403: access_denied
```

**해결 방법**:

```bash
# 1. API 활성화 확인
# Google Cloud Console → API & Services → Library
# Gmail API, Calendar API 활성화 확인

# 2. OAuth 동의 화면 설정
# User Type: External
# Scopes: email, profile, gmail.readonly, calendar

# 3. 테스트 사용자 추가 (개발 시)
# OAuth consent screen → Test users

# 4. 할당량 확인
# Google Cloud Console → APIs → Quotas
```

## 🚀 배포 관련 문제

### Vercel 배포 문제

#### 문제: 빌드 실패

```bash
# 증상
Build Error: Command failed with exit code 1
```

**해결 방법**:

```bash
# 1. 로컬 빌드 테스트
npm run build

# 2. 타입 검사
npm run type-check

# 3. 환경 변수 확인
# Vercel Dashboard → Settings → Environment Variables

# 4. 빌드 로그 확인
# Vercel Dashboard → Deployments → [해당 배포] → Function Logs
```

#### 문제: 환경 변수 누락

```bash
# 증상
Error: Environment variable "DATABASE_URL" is not defined
```

**해결 방법**:

```bash
# 1. Vercel 환경 변수 설정
vercel env add DATABASE_URL

# 2. 환경별 변수 확인
# Preview, Development, Production 각각 설정

# 3. 변수명 정확성 확인
# 대소문자, 언더스코어 등 정확히 일치해야 함

# 4. 재배포
vercel --prod
```

### CI/CD 파이프라인 문제

#### 문제: GitHub Actions 실패

```yaml
# 증상
Error: Process completed with exit code 1
```

**해결 방법**:

```bash
# 1. 로컬에서 CI 명령어 실행
npm run lint
npm run type-check
npm run test

# 2. Node.js 버전 확인
# .github/workflows/ci.yml에서 node-version 확인
# package.json engines 필드와 일치하는지 확인

# 3. 시크릿 변수 설정
# GitHub Repository → Settings → Secrets and Variables

# 4. 권한 확인
# GitHub Repository → Settings → Actions → General
```

#### 문제: 테스트 실패

```bash
# 증상
Tests failed with errors
```

**해결 방법**:

```bash
# 1. 로컬 테스트 실행
npm run test

# 2. 테스트 데이터베이스 설정
DATABASE_URL="postgresql://test:test@localhost:5432/test_db" npm run test

# 3. Mock 설정 확인
# __mocks__ 폴더의 설정 확인

# 4. 비동기 테스트 처리
# async/await 또는 done 콜백 사용 확인
```

## 📊 성능 문제

### 느린 페이지 로딩

#### 문제: 페이지 로딩 시간 > 5초

```javascript
// 증상: 네트워크 탭에서 긴 응답 시간 확인
```

**해결 방법**:

```bash
# 1. 번들 크기 분석
npm run build:analyze

# 2. 이미지 최적화 확인
# Next.js Image 컴포넌트 사용 여부
# WebP 형식 사용 여부

# 3. 코드 분할 적용
# Dynamic imports 사용
# 페이지별 청크 분리

# 4. CDN 캐싱 확인
# Vercel Analytics에서 캐시 히트율 확인
```

### API 응답 지연

#### 문제: API 응답 시간 > 2초

```javascript
// 증상: 네트워크 탭에서 API 요청 지연
```

**해결 방법**:

```bash
# 1. 데이터베이스 쿼리 최적화
# Prisma Studio에서 쿼리 실행 계획 확인

# 2. 인덱스 추가
CREATE INDEX idx_travel_records_user_id ON TravelRecord(userId);

# 3. N+1 쿼리 해결
# include 대신 select 사용
# 배치 로딩 구현

# 4. 응답 캐싱
# API 레벨 캐싱 구현
# Redis 캐시 도입 고려
```

### 메모리 사용량 증가

#### 문제: 메모리 사용량 지속 증가

```bash
# 증상: Vercel 함수 메모리 한계 초과
```

**해결 방법**:

```bash
# 1. 메모리 리크 확인
# Node.js --inspect 옵션 사용
# Chrome DevTools Memory 탭 활용

# 2. Prisma 클라이언트 최적화
# 연결 풀 크기 조정
# 쿼리 후 명시적 disconnection

# 3. 이미지 처리 최적화
# Sharp 라이브러리 사용
# 스트림 처리 구현

# 4. 함수 메모리 설정 증가
# vercel.json에서 maxDuration/memory 설정
```

## 🔐 보안 문제

### CORS 오류

#### 문제: Cross-Origin Request Blocked

```javascript
// 증상: 브라우저 콘솔에 CORS 오류
```

**해결 방법**:

```typescript
// 1. Next.js API 라우트에서 CORS 헤더 설정
export async function GET(request: Request) {
  const response = new Response(JSON.stringify(data));
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return response;
}

// 2. Middleware에서 전역 CORS 설정
// middleware.ts 파일 확인

// 3. Vercel 설정에서 CORS 허용
// vercel.json headers 섹션 확인
```

### CSP 위반

#### 문제: Content Security Policy 위반

```javascript
// 증상: 콘솔에 CSP 오류 메시지
```

**해결 방법**:

```typescript
// 1. next.config.js에서 CSP 설정 수정
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

// 2. 인라인 스크립트 nonce 사용
// 3. unsafe-inline 최소화
// 4. 외부 도메인 허용 목록 관리
```

## 📱 사용자 인터페이스 문제

### 모바일 레이아웃 깨짐

#### 문제: 모바일에서 레이아웃 이상

```css
/* 증상: 모바일 화면에서 요소가 잘리거나 겹침 */
```

**해결 방법**:

```css
/* 1. 반응형 디자인 점검 */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
    max-width: 100%;
  }
}

/* 2. Viewport 메타 태그 확인 */
/* layout.tsx에서 viewport 설정 확인 */

/* 3. Flexbox/Grid 설정 검토 */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* 4. 터치 대상 크기 확인 */
.button {
  min-height: 44px; /* iOS 권장 사이즈 */
}
```

### 다크 모드 문제

#### 문제: 다크 모드에서 색상 이상

```css
/* 증상: 다크 모드에서 텍스트가 보이지 않음 */
```

**해결 방법**:

```css
/* 1. CSS 변수 설정 확인 */
:root {
  --text-primary: #000;
  --bg-primary: #fff;
}

[data-theme="dark"] {
  --text-primary: #fff;
  --bg-primary: #000;
}

/* 2. Tailwind 다크 모드 설정 */
/* tailwind.config.js에서 darkMode: 'class' 확인 */

/* 3. 조건부 스타일링 */
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

## 🤖 AI 기능 문제

### OpenAI API 오류

#### 문제: AI 추천 기능 동작 안 함

```javascript
// 증상: OpenAI API 호출 실패
```

**해결 방법**:

```bash
# 1. API 키 확인
echo $OPENAI_API_KEY

# 2. 할당량 확인
# OpenAI Dashboard → Usage → API usage

# 3. 모델 버전 확인
# GPT-3.5-turbo, GPT-4 등 사용 가능한 모델 확인

# 4. 요청 형식 검증
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Gmail API 연동 문제

#### 문제: 이메일 분석 실패

```javascript
// 증상: Gmail 메일 읽기 권한 오류
```

**해결 방법**:

```bash
# 1. OAuth 스코프 확인
# https://www.googleapis.com/auth/gmail.readonly

# 2. API 활성화 확인
# Google Cloud Console → Gmail API 확인

# 3. 할당량 확인
# Gmail API 요청 제한 확인

# 4. 토큰 갱신
# RefreshToken을 사용한 AccessToken 갱신 구현
```

## 📋 디버깅 도구 활용

### 로깅 및 모니터링

#### Vercel Function Logs

```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 함수 로그
vercel logs --function=api/travel/records
```

#### 데이터베이스 디버깅

```bash
# Prisma Studio 실행
npx prisma studio

# 쿼리 로그 활성화
# schema.prisma에서 log 옵션 설정
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

#### 브라우저 디버깅

```javascript
// 1. React DevTools 사용
// 2. Network 탭에서 API 요청 확인
// 3. Console에서 오류 메시지 확인
// 4. Performance 탭에서 성능 분석
```

## 🆘 긴급상황 대응

### 서비스 다운 시 대응

```bash
# 1. 즉시 상황 파악
curl -I https://dinoapp.vercel.app/api/health

# 2. 긴급 롤백
npm run deploy:rollback

# 3. 모니터링 대시보드 확인
# /admin/monitoring

# 4. 사용자 공지
# 상태 페이지 업데이트
```

### 데이터 손실 시 대응

```bash
# 1. 백업에서 복구
npm run backup:restore latest

# 2. 트랜잭션 로그 확인
# PostgreSQL 로그 분석

# 3. 부분 복구
# 특정 테이블만 복구

# 4. 데이터 검증
# 복구된 데이터 무결성 확인
```

## 📞 지원 요청

### 내부 지원

- **개발팀**: dev-team@dinoapp.com
- **운영팀**: ops-team@dinoapp.com
- **Slack**: #tech-support 채널

### 외부 지원

- **Vercel Support**: 플랜에 따라 지원 수준 다름
- **PostgreSQL Community**: 포럼 및 문서
- **Google Cloud Support**: API 관련 문의

---

**추가 참고자료**: [모니터링 대시보드](/admin/monitoring) | [로그 분석 도구](/admin/logs) | [성능 메트릭](/admin/performance)
