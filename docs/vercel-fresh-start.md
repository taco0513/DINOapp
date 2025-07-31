# Vercel 프로젝트 새로 시작하기

## 1. Vercel에서 새 프로젝트 생성

1. https://vercel.com/new 접속
2. "Import Git Repository" 클릭
3. "DINOapp" 선택
4. Configure Project:
   - Framework Preset: Next.js (자동 감지됨)
   - Root Directory: ./ (기본값)
   - Build Command: 기본값 사용
   - Output Directory: 기본값 사용

## 2. 환경변수 설정 (매우 중요!)

Deploy 전에 환경변수를 모두 추가하세요:

### 필수 환경변수:

```
DATABASE_URL=[Supabase Transaction pooler URL]?pgbouncer=true&statement_cache_size=0
DATABASE_URL_UNPOOLED=[Supabase Direct connection URL]
NEXTAUTH_SECRET=rsZAOqVCnh+qtEqqWs0X4t7LWAwza7bjGnVWQzUHFUk=
NEXTAUTH_URL=https://dinoapp.net
GOOGLE_CLIENT_ID=[Google OAuth Client ID]
GOOGLE_CLIENT_SECRET=[새로 생성한 Google OAuth Secret]
```

## 3. Deploy 클릭

- 모든 환경변수 추가 후 "Deploy" 버튼 클릭
- 첫 배포는 3-5분 정도 소요

## 4. 배포 완료 후 설정

### Custom Domain 추가:

1. Settings → Domains
2. "Add" 클릭
3. dinoapp.net 입력
4. DNS 설정 확인 (이미 설정되어 있음)

### Google OAuth Redirect URI 추가:

Google Console에서 새 Vercel URL 추가:

- https://[new-vercel-url].vercel.app/api/auth/callback/google
- https://dinoapp.net/api/auth/callback/google

## 5. 테스트

1. 브라우저 캐시/쿠키 삭제
2. 시크릿 모드에서 테스트
3. 로그인 시도

## 장점:

- 깨끗한 시작
- 모든 캐시 초기화
- 새로운 URL (보안상 더 안전)
- 환경변수 처음부터 올바르게 설정
