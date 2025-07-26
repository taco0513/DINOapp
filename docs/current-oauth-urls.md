# 현재 Google OAuth에 추가해야 할 URL들

## 🔗 최신 상태 (2025-07-26 20:50)

✅ **프로덕션 도메인**: `dinoapp.net` (DNS 전파 완료)  
✅ **Vercel 배포**: `dino-eayk7s794-zimos-projects-6824b9bc.vercel.app` (안정)

## 📝 Google Console에 추가할 URL들

### Authorized JavaScript origins
```
https://dinoapp.net
https://www.dinoapp.net
https://dino-eayk7s794-zimos-projects-6824b9bc.vercel.app
```

### Authorized redirect URIs  
```
https://dinoapp.net/api/auth/callback/google
https://www.dinoapp.net/api/auth/callback/google
https://dino-eayk7s794-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
```

## 🔧 빠른 Google Console 업데이트 방법

1. https://console.cloud.google.com/apis/credentials 접속
2. OAuth 2.0 Client ID 클릭
3. 위의 URL들을 각각의 섹션에 추가
4. SAVE 클릭
5. 2-3분 기다린 후 테스트

## 🧪 테스트 URL들
- **로그인 테스트**: https://dino-lppbjyrci-zimos-projects-6824b9bc.vercel.app/auth/signin
- **인증 디버그**: https://dino-lppbjyrci-zimos-projects-6824b9bc.vercel.app/api/debug-auth

## 📋 변경 사항
- Ultra-simplified NextAuth 설정으로 로그인 루프 해결
- 복잡한 refresh token 로직 제거
- 기본 NextAuth redirect 방식 사용