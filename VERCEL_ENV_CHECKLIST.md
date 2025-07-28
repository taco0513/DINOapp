# Vercel 환경변수 체크리스트

## 필수 환경변수 (Vercel Dashboard → Settings → Environment Variables)

### 1. 인증 관련

- [x] `NEXTAUTH_URL` = `https://www.dinoapp.net` (www 포함!)
- [x] `NEXTAUTH_SECRET` = (32자 이상의 랜덤 문자열)
- [x] `GOOGLE_CLIENT_ID` = (프로덕션용 클라이언트 ID)
- [x] `GOOGLE_CLIENT_SECRET` = (프로덕션용 클라이언트 시크릿)

### 2. 데이터베이스

- [x] `DATABASE_URL` = (SQLite 또는 PostgreSQL URL)

### 3. 앱 설정

- [ ] ⚠️ **`NEXT_PUBLIC_APP_URL` = `https://www.dinoapp.net`** (반드시 설정 필요!)
- [x] `NODE_ENV` = `production`

## Google Console 설정 확인

### 프로덕션 OAuth 2.0 클라이언트 ID 설정:

**Authorized JavaScript origins:**

- `https://dinoapp.net`
- `https://www.dinoapp.net`

**Authorized redirect URIs:**

- `https://dinoapp.net/api/auth/callback/google`
- `https://www.dinoapp.net/api/auth/callback/google`

## 중요 사항

1. NEXTAUTH_URL은 반드시 `https://www.dinoapp.net` (www 포함)으로 설정
2. 환경변수 변경 후 Vercel에서 재배포 필요
3. Google Console에서 리디렉트 URI는 정확히 일치해야 함
