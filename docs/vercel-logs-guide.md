# Vercel 로그 확인 가이드

## 1. Function 로그 보기

### Vercel Dashboard에서:
1. **Logs** 탭 클릭 (상단 메뉴)
2. 또는 **Functions** 탭 → 특정 function 클릭

### 로그 필터링:
- Function 이름으로 필터: `api/auth/[...nextauth]`
- 에러만 보기: Error 레벨 선택
- 시간대 설정: 최근 1시간

## 2. 실시간 로그 보기

### Vercel CLI 사용:
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그 보기
vercel logs --follow
```

### 특정 function 로그만 보기:
```bash
vercel logs --filter="api/auth"
```

## 3. 브라우저에서 바로 확인

### 현재 Vercel Dashboard에서:
1. **Logs** 탭 클릭 (Overview 옆)
2. Function 드롭다운에서 `api/auth/[...nextauth]` 선택
3. 시간 범위 선택 (Last 1 hour)
4. Level에서 "All" 또는 "Error" 선택

## 4. 로그에서 찾아야 할 것들

### NextAuth 관련:
- `[NextAuth]` 로 시작하는 메시지
- `SignIn attempt:` - 로그인 시도
- `Redirect:` - 리다이렉트 정보
- `Error updating user:` - 데이터베이스 에러

### 에러 패턴:
- `NEXTAUTH_URL` 관련 경고
- Cookie 설정 에러
- Database connection 에러
- OAuth callback 에러

## 5. 디버깅 팁

### 로그인 루프 디버깅:
1. 브라우저 개발자 도구 → Network 탭
2. Preserve log 체크
3. 로그인 시도
4. 301/302 리다이렉트 체인 확인

### Vercel에서 환경변수 확인:
1. Settings → Environment Variables
2. NEXTAUTH_URL 값 확인
3. Production 환경 선택되어 있는지 확인