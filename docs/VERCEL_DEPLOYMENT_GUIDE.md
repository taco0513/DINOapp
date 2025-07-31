# Vercel 배포 가이드

## 🚀 필수 환경변수 설정

Vercel 대시보드에서 다음 환경변수들을 설정해야 합니다:

### 1. 핵심 인증 설정 (필수)

```bash
# NextAuth.js 설정
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# Google OAuth 인증 정보
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. 데이터베이스 설정 (필수)

```bash
# SQLite (개발용) - Vercel에서는 읽기 전용
DATABASE_URL=file:./prod.db

# 권장: 외부 데이터베이스 사용
# DATABASE_URL=postgresql://username:password@host:port/database
# 또는 Vercel KV/PostgreSQL 사용
```

### 3. 보안 설정 (필수)

```bash
# 데이터 암호화 키 (32자 이상)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# 세션 만료 시간 (초 단위, 기본: 30일)
SESSION_MAX_AGE=2592000
```

### 4. 기능 제어 (선택)

```bash
# 공개 기능 플래그
NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# API 속도 제한
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW=60000

# 캐시 설정
CACHE_TTL_SECONDS=300
ENABLE_REDIS_CACHE=false
```

### 5. 모니터링 (선택)

```bash
# 분석 도구
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn

# 로깅 레벨
LOG_LEVEL=info
```

## 📝 Vercel 환경변수 설정 방법

### CLI를 통한 설정:

```bash
# 개별 환경변수 설정
vercel env add NEXTAUTH_SECRET production

# .env 파일에서 일괄 추가
vercel env pull .env.vercel.local
```

### 웹 대시보드를 통한 설정:

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 → Settings → Environment Variables
3. 각 환경변수를 `production`, `preview`, `development` 환경에 맞게 추가

## 🔐 보안 고려사항

### NEXTAUTH_SECRET 생성:

```bash
# 안전한 시크릿 키 생성
openssl rand -base64 32
```

### ENCRYPTION_KEY 생성:

```bash
# 32자 암호화 키 생성
openssl rand -hex 16
```

### Google OAuth 설정:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials
4. OAuth 2.0 Client ID 생성:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

## 🗄️ 데이터베이스 권장 사항

### 개발/테스트용:

- SQLite (파일 기반, Vercel에서 읽기 전용)

### 프로덕션 권장:

1. **Vercel Postgres** (권장)

   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. **PlanetScale** (서버리스 MySQL)

   ```bash
   DATABASE_URL=mysql://user:password@host:3306/database
   ```

3. **Supabase** (PostgreSQL + 실시간 기능)
   ```bash
   DATABASE_URL=postgresql://postgres:password@host:5432/database
   ```

## 🚨 배포 전 체크리스트

- [ ] 모든 필수 환경변수 설정 완료
- [ ] Google OAuth 콜백 URL 등록
- [ ] 데이터베이스 연결 테스트
- [ ] NEXTAUTH_SECRET 안전하게 생성
- [ ] 도메인별 CORS 설정 확인
- [ ] 프로덕션 빌드 테스트 (`npm run build`)

## 📊 성능 최적화

### Vercel 함수 설정 (이미 구성됨):

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    },
    "app/api/gmail/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### 캐싱 헤더 (이미 구성됨):

- 정적 자산: 1년 캐시
- 이미지: 1년 캐시
- API: 5분 캐시

## 🔍 배포 후 검증

### 1. 환경변수 확인:

```bash
vercel env ls
```

### 2. 배포 로그 확인:

```bash
vercel logs
```

### 3. 기능 테스트:

- [ ] 로그인/로그아웃 동작
- [ ] Gmail 연동 테스트
- [ ] 캘린더 동기화 테스트
- [ ] API 엔드포인트 응답 확인

## 🆘 문제 해결

### 자주 발생하는 오류:

1. **NEXTAUTH_SECRET 누락**

   ```
   Error: Please define a `NEXTAUTH_SECRET` environment variable
   ```

   → Vercel에서 NEXTAUTH_SECRET 환경변수 추가

2. **Google OAuth 오류**

   ```
   Error: redirect_uri_mismatch
   ```

   → Google Console에서 올바른 리다이렉트 URI 등록

3. **데이터베이스 연결 오류**
   ```
   Error: Can't reach database server
   ```
   → DATABASE_URL 확인 및 데이터베이스 접근 권한 체크

## 📞 지원

배포 관련 문제가 발생하면:

1. Vercel 로그 확인
2. 환경변수 설정 재검토
3. 프로젝트 이슈 트래커에 문의
