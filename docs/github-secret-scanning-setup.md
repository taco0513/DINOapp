# GitHub Secret Scanning 활성화 가이드

## 🔒 GitHub Secret Scanning이란?

GitHub Secret Scanning은 리포지토리에서 실수로 커밋된 API 키, 토큰, 패스워드 등의 민감한 정보를 자동으로 감지하고 알려주는 보안 기능입니다.

## 📋 활성화 단계

### 1단계: GitHub 리포지토리 설정 페이지 접속

**링크**: https://github.com/taco0513/DINOapp/settings

또는:
1. https://github.com/taco0513/DINOapp 접속
2. **Settings** 탭 클릭
3. 왼쪽 사이드바에서 **Security** 섹션 찾기

### 2단계: Code security and analysis 설정

1. 왼쪽 메뉴에서 **Code security and analysis** 클릭
2. **Secret scanning** 섹션 찾기
3. **Enable** 버튼 클릭

### 3단계: 고급 설정 (권장)

다음 보안 기능들도 함께 활성화하는 것을 권장합니다:

#### Dependency graph
- ✅ **Enable** - 종속성 그래프 활성화

#### Dependabot alerts  
- ✅ **Enable** - 보안 취약점이 있는 종속성 알림

#### Dependabot security updates
- ✅ **Enable** - 보안 업데이트 자동 생성

#### Code scanning (GitHub Advanced Security)
- ⚠️ **Private 리포지토리의 경우 유료** 
- Public 리포지토리는 무료로 사용 가능

#### Secret scanning
- ✅ **Enable** - 비밀 정보 스캔
- ✅ **Push protection** - 비밀 정보 푸시 방지

## ✅ 완료 확인

설정 완료 후 다음과 같이 표시되어야 합니다:

```
✅ Secret scanning: Enabled
✅ Push protection: Enabled  
✅ Dependabot alerts: Enabled
✅ Dependabot security updates: Enabled
```

## 🚨 이미 감지된 비밀 정보

현재 리포지토리에서 이미 감지된 비밀 정보들:

1. **PostgreSQL URI** - Supabase 데이터베이스 연결 문자열 ✅ 해결됨
2. **Generic High Entropy Secret** - NextAuth Secret ✅ 해결됨  
3. **Google OAuth2 Keys** - Client ID/Secret ✅ 해결됨

모든 민감한 정보는 이미 새로운 값으로 교체되었습니다.

## 📝 앞으로의 보안 수칙

### 환경 변수 관리
- ✅ `.env.local`은 절대 커밋하지 않기
- ✅ `.env.example` 사용하여 템플릿 제공
- ✅ Vercel 환경 변수에만 실제 값 저장

### 코드 검토
- ✅ 커밋 전 `git diff` 확인
- ✅ 하드코딩된 API 키 검사
- ✅ 환경 변수 사용 확인

### 정기 보안 점검
- 🔄 월 1회 Secret Scanning 알림 확인
- 🔄 분기별 Dependabot 알림 검토
- 🔄 연 2회 전체 보안 감사

## 🆘 비상 대응

만약 민감한 정보가 노출되었다면:

1. **즉시 비밀 정보 교체** (API 키, 패스워드 등)
2. **Vercel 환경 변수 업데이트**
3. **Google OAuth 키 재생성** (필요시)
4. **데이터베이스 패스워드 변경** (필요시)
5. **Git 히스토리에서 제거** (고급 사용자만)

## 📞 지원

추가 도움이 필요하면:
- GitHub 공식 문서: https://docs.github.com/en/code-security
- DINO 프로젝트 이슈: https://github.com/taco0513/DINOapp/issues

---

**마지막 업데이트**: 2025-07-26  
**작성자**: Claude Code Assistant