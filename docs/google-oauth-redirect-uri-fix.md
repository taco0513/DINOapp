# Google OAuth Redirect URI 업데이트 가이드

## 🚨 현재 오류
**Error 400: redirect_uri_mismatch**

새 Vercel 배포 URL이 Google OAuth 설정에 추가되지 않아서 발생하는 오류입니다.

## 🔧 해결 방법

### 1. Google Cloud Console 접속
1. https://console.cloud.google.com 접속
2. 현재 프로젝트 선택 (DINO app)

### 2. OAuth 설정 페이지로 이동
1. 왼쪽 메뉴에서 "APIs & Services" → "Credentials" 클릭
2. OAuth 2.0 Client IDs 섹션에서 기존 클라이언트 ID 클릭

### 3. Authorized redirect URIs 업데이트
"Authorized redirect URIs" 섹션에 다음 URL들을 **모두** 추가하세요:

```
https://dino-n5mxx87b7-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
https://dino-8lr5xqqyv-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google  
https://dino-7qt9troj6-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
https://dinoapp.net/api/auth/callback/google
```

### 4. Authorized JavaScript origins 업데이트
"Authorized JavaScript origins" 섹션에도 다음 URL들을 **모두** 추가하세요:

```
https://dino-n5mxx87b7-zimos-projects-6824b9bc.vercel.app
https://dino-8lr5xqqyv-zimos-projects-6824b9bc.vercel.app
https://dino-7qt9troj6-zimos-projects-6824b9bc.vercel.app  
https://dinoapp.net
```

### 5. 설정 저장
- "SAVE" 버튼 클릭
- 변경사항이 적용되려면 몇 분 정도 기다려야 할 수 있습니다

## ✅ 테스트
설정 변경 후 다음을 시도해보세요:

1. **브라우저 캐시/쿠키 완전 삭제**
2. **새 시크릿 모드 창** 열기
3. https://dino-n5mxx87b7-zimos-projects-6824b9bc.vercel.app 접속
4. "Sign in with Google" 클릭

## 🔍 추가 확인 사항

### 현재 설정된 URL들 확인
Google Console에서 다음 URL들이 모두 포함되어 있는지 확인:

**Redirect URIs**:
- ✅ dinoapp.net/api/auth/callback/google
- ✅ dino-n5mxx87b7-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google (새로 추가 필요)

**JavaScript Origins**:
- ✅ dinoapp.net  
- ✅ dino-n5mxx87b7-zimos-projects-6824b9bc.vercel.app (새로 추가 필요)

### 일반적인 실수들
- ❌ http:// 사용 (https://만 사용해야 함)
- ❌ 끝에 슬래시(/) 추가
- ❌ 대소문자 불일치
- ❌ 포트 번호 포함

## 📝 참고
Vercel은 매 배포마다 새로운 URL을 생성하므로, 향후에도 새 배포 시 Google OAuth 설정을 업데이트해야 할 수 있습니다. 

**권장사항**: 주로 dinoapp.net 커스텀 도메인을 사용하여 이런 문제를 최소화하세요.