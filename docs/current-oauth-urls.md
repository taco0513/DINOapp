# 현재 Google OAuth에 추가해야 할 URL들

## 🔗 최신 배포 URL (2025-07-26 19:22)

**새로운 Vercel 배포 URL**: `dino-20m4k95mq-zimos-projects-6824b9bc.vercel.app`

## 📝 Google Console에 추가할 URL들

### Authorized JavaScript origins
```
https://dino-20m4k95mq-zimos-projects-6824b9bc.vercel.app
```

### Authorized redirect URIs  
```
https://dino-20m4k95mq-zimos-projects-6824b9bc.vercel.app/api/auth/callback/google
```

## ⚠️ 중요 사항

매번 `vercel --prod --force`로 배포할 때마다 새로운 URL이 생성되므로:

1. **새 배포 후 Google OAuth 설정 업데이트 필요**
2. **dinoapp.net 커스텀 도메인을 주로 사용하는 것이 좋음**

## 🔧 빠른 Google Console 업데이트 방법

1. https://console.cloud.google.com/apis/credentials 접속
2. OAuth 2.0 Client ID 클릭
3. 위의 URL들을 각각의 섹션에 추가
4. SAVE 클릭
5. 2-3분 기다린 후 테스트

## 🧪 테스트 URL
로그인 테스트: https://dino-20m4k95mq-zimos-projects-6824b9bc.vercel.app/auth/signin