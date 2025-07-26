# Google OAuth Redirect URIs 설정 가이드

## 필수 Redirect URIs

Google Cloud Console의 OAuth 2.0 Client ID 설정에서 다음 URI들을 모두 추가해야 합니다:

### Production URLs
```
https://dinoapp.net/api/auth/callback/google
https://www.dinoapp.net/api/auth/callback/google
https://app.dinoapp.net/api/auth/callback/google
```

### Vercel Preview URLs
각 배포마다 고유한 URL이 생성됩니다. 현재 사용 중인 URL을 추가하세요:
```
https://dino-jc2n8enjx-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
https://dino-musiaqnpe-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
https://dino-app-psi.vercel.app/api/auth/callback/google
```

### Development URL
```
http://localhost:3000/api/auth/callback/google
```

## 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택
3. APIs & Services → Credentials
4. OAuth 2.0 Client IDs에서 해당 Client ID 클릭
5. "Authorized redirect URIs" 섹션에서 "+ ADD URI" 클릭
6. 위의 URI들을 하나씩 추가
7. "SAVE" 클릭

## 주의사항

- URI는 정확히 일치해야 합니다 (대소문자, 슬래시 포함)
- 프로토콜도 일치해야 합니다 (http vs https)
- 포트 번호도 일치해야 합니다 (localhost:3000)
- Vercel은 각 배포마다 새로운 URL을 생성하므로 주기적으로 업데이트 필요

## 에러 해결

"Error 400: redirect_uri_mismatch" 발생 시:
1. 브라우저 개발자 도구 → Network 탭
2. "authorize" 요청 찾기
3. Query parameters에서 redirect_uri 값 확인
4. 해당 URI를 Google Console에 추가