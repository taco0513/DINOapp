# 🔧 문제 해결 가이드

**AI 개발 과정에서 발생할 수 있는 모든 문제의 해결책을 제공합니다.**

## 🚨 긴급 상황 대응

### 즉시 해결이 필요한 문제들

#### 🔥 Claude Code가 완전히 응답하지 않음

```bash
# 1. 서비스 재시작
claude restart

# 2. 캐시 클리어
claude cache clear

# 3. 재로그인
claude auth logout
claude auth login

# 4. 완전 재설치 (최후 수단)
claude uninstall
curl -sSf https://claude.ai/code/install.sh | sh
```

#### 🔥 프로젝트가 완전히 망가짐

```bash
# Git이 설정되어 있다면
git status
git checkout -- .  # 모든 변경사항 되돌리기

# 백업이 없다면 Claude에게
"프로젝트가 망가졌어요. 처음부터 다시 만들어주세요.
이런 기능들이 있었어요: [기능 목록]"
```

#### 🔥 배포된 사이트가 다운됨

```bash
# Vercel인 경우
vercel --prod  # 재배포

# Netlify인 경우
netlify deploy --prod

# 또는 Claude에게
"배포된 사이트가 안 열려요. 어떻게 해결할까요?"
```

## 💻 설치 및 환경 설정 문제

### Claude Code CLI 설치 실패

#### 문제: "Permission denied" 오류

```bash
# 해결책 1: sudo 사용
sudo curl -sSf https://claude.ai/code/install.sh | sh

# 해결책 2: 사용자 디렉토리에 설치
curl -sSf https://claude.ai/code/install.sh | sh -s -- --user

# 해결책 3: 수동 다운로드
# 1. https://github.com/anthropics/claude-code/releases 방문
# 2. OS에 맞는 파일 다운로드
# 3. 압축 해제 후 PATH에 추가
```

#### 문제: "Command not found: claude"

```bash
# 해결책 1: PATH 확인
echo $PATH

# 해결책 2: 프로필에 추가 (Mac/Linux)
echo 'export PATH="$HOME/.claude/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 해결책 3: 프로필에 추가 (Mac zsh)
echo 'export PATH="$HOME/.claude/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 문제: Windows에서 설치 실패

```powershell
# 해결책 1: PowerShell 관리자 권한으로 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 해결책 2: WSL 사용
wsl --install
# WSL 내에서 Linux 설치 방법 사용

# 해결책 3: 수동 설치
# 1. GitHub Releases에서 Windows용 .exe 다운로드
# 2. 프로그램 파일에 설치
# 3. 환경 변수 PATH에 추가
```

### API 연결 문제

#### 문제: "Authentication failed" 오류

```bash
# 해결책 1: 재로그인
claude auth logout
claude auth login

# 해결책 2: 브라우저 쿠키 클리어
# Chrome/Edge에서 claude.ai 사이트 쿠키 삭제

# 해결책 3: API 키 수동 설정
claude auth configure
# 프롬프트에 따라 API 키 입력
```

#### 문제: "Rate limit exceeded" 오류

```bash
# 해결책 1: 잠시 대기 (보통 1-5분)
sleep 300  # 5분 대기

# 해결책 2: Claude Pro 구독 고려
# https://claude.ai/upgrade

# 해결책 3: 요청 분산
# 한 번에 많은 코드 생성 대신 작은 단위로 나누어 요청
```

## 🗣️ AI 대화 문제

### Claude가 이해하지 못하는 경우

#### 문제: 요청이 너무 모호함

```
❌ 나쁜 예:
"웹사이트 만들어줘"

✅ 좋은 예:
"개인 포트폴리오 웹사이트를 만들어줘.
- 자기소개 섹션
- 프로젝트 3개 보여주는 갤러리
- 연락처 정보
- 모던하고 깔끔한 디자인으로"
```

#### 문제: 기술적인 설명을 이해하지 못함

```
❌ 나쁜 예:
"RESTful API와 JWT 인증을 구현해줘"

✅ 좋은 예:
"사용자가 회원가입하고 로그인할 수 있는 시스템을 만들어줘.
로그인하면 개인 데이터를 볼 수 있고,
로그아웃하면 접근할 수 없게 해줘."
```

#### 문제: 복잡한 요청을 한 번에 처리하려 함

```
❌ 나쁜 예:
"쇼핑몰 전체를 한 번에 만들어줘"

✅ 좋은 예:
"1단계: 상품 목록을 보여주는 페이지부터 만들어줘"
"2단계: 상품을 클릭하면 상세 페이지로 가게 해줘"
"3단계: 장바구니 기능을 추가해줘"
```

### AI 응답이 이상한 경우

#### 문제: 오래된 정보나 잘못된 코드 제공

```
해결책:
"이 코드가 최신 버전인지 확인해줘"
"더 최신 방법이 있다면 알려줘"
"이 방법 말고 다른 방법으로도 해보자"
```

#### 문제: 코드가 작동하지 않음

```
해결책:
"에러가 발생했어요: [에러 메시지 전체 복사]
어떻게 수정하면 될까요?"

"이 코드를 실행했는데 아무것도 나타나지 않아요.
뭐가 문제일까요?"
```

## 💻 개발 환경 문제

### VSCode/Cursor 관련

#### 문제: 확장 프로그램이 작동하지 않음

```json
// settings.json에 추가
{
  "claude.enabled": true,
  "claude.apiKey": "your-api-key",
  "editor.inlineSuggest.enabled": true
}
```

#### 문제: 자동완성이 나타나지 않음

```
해결책:
1. Ctrl+Space (수동 트리거)
2. 확장 프로그램 재시작: Ctrl+Shift+P → "Reload Window"
3. 설정 확인: Ctrl+, → "claude" 검색
```

#### 문제: 터미널이 작동하지 않음

```bash
# Windows Git Bash 설정
"terminal.integrated.defaultProfile.windows": "Git Bash"

# 또는 PowerShell 사용
"terminal.integrated.defaultProfile.windows": "PowerShell"
```

### Node.js 및 패키지 관리

#### 문제: "npm command not found"

```bash
# Node.js 설치 확인
node --version
npm --version

# 설치되지 않은 경우
# 1. https://nodejs.org 에서 LTS 버전 다운로드
# 2. 또는 패키지 매니저 사용:
brew install node  # macOS
choco install nodejs  # Windows
```

#### 문제: "Permission denied" (npm 글로벌 설치)

```bash
# macOS/Linux
sudo npm install -g package-name

# 또는 권한 없이 설치하도록 설정
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

#### 문제: 패키지 설치 실패

```bash
# 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 또는 yarn 사용
npm install -g yarn
yarn install
```

### Git 관련 문제

#### 문제: "Git is not installed"

```bash
# 설치 확인
git --version

# Windows: https://git-scm.com/download/win
# macOS: xcode-select --install
# Linux: sudo apt-get install git
```

#### 문제: Git 사용자 정보 설정

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 문제: 커밋 메시지 에디터 문제

```bash
# 기본 에디터를 nano로 설정
git config --global core.editor "nano"

# 또는 VSCode로 설정
git config --global core.editor "code --wait"
```

## 🌐 웹 개발 특화 문제

### HTML/CSS 렌더링 문제

#### 문제: 스타일이 적용되지 않음

```html
<!-- CSS 파일 경로 확인 -->
<link rel="stylesheet" href="./styles.css" />

<!-- 브라우저 캐시 클리어 -->
<!-- Ctrl+F5 (하드 리프레시) -->
```

#### 문제: 모바일에서 레이아웃 깨짐

```html
<!-- viewport 메타 태그 추가 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

#### 문제: 이미지가 표시되지 않음

```html
<!-- 이미지 경로 확인 -->
<img src="./images/photo.jpg" alt="Description" />

<!-- 파일 확장자 대소문자 확인 -->
<!-- photo.JPG vs photo.jpg -->
```

### JavaScript 오류

#### 문제: "Uncaught ReferenceError"

```javascript
// 변수나 함수가 정의되기 전에 사용됨
// 해결: 선언 순서 확인

// 스크립트 로딩 순서 확인
<script src="jquery.js"></script>  <!-- 먼저 -->
<script src="main.js"></script>    <!-- 나중에 -->
```

#### 문제: "Cannot read property of undefined"

```javascript
// null 체크 추가
if (element && element.textContent) {
  element.textContent = 'New text';
}

// 또는 옵셔널 체이닝 사용 (최신 브라우저)
element?.textContent = 'New text';
```

#### 문제: 이벤트 리스너가 작동하지 않음

```javascript
// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
  // 이벤트 리스너 등록
  button.addEventListener('click', handleClick);
});
```

### API 연동 문제

#### 문제: CORS 오류

```javascript
// 개발 환경에서 프록시 설정
// package.json에 추가
{
  "proxy": "http://localhost:3001"
}

// 또는 서버에서 CORS 헤더 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com']
}));
```

#### 문제: API 키 노출

```javascript
// 환경 변수 사용
// .env 파일
REACT_APP_API_KEY=your-api-key

// 코드에서
const apiKey = process.env.REACT_APP_API_KEY;

// .env를 .gitignore에 추가
echo ".env" >> .gitignore
```

## 🚀 배포 관련 문제

### Vercel 배포 실패

#### 문제: Build 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 종속성 문제 해결
npm install --save-dev @types/node

# Vercel 설정 파일 생성
# vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

#### 문제: 환경 변수 설정

```
1. Vercel 대시보드 → Project → Settings → Environment Variables
2. 환경 변수 추가:
   - Name: REACT_APP_API_KEY
   - Value: your-actual-api-key
   - Environment: Production
3. 재배포
```

### Netlify 배포 문제

#### 문제: 404 오류 (SPA)

```toml
# netlify.toml 파일 생성
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 문제: 빌드 명령어 설정

```
Build command: npm run build
Publish directory: build (React) 또는 dist (Vite)
```

### 도메인 연결 문제

#### 문제: DNS 설정

```
# Vercel 커스텀 도메인 설정
1. Vercel → Project → Settings → Domains
2. 도메인 추가
3. DNS 레코드 설정:
   - Type: CNAME
   - Name: www
   - Value: vercel.app

# Netlify 도메인 설정
1. Netlify → Site → Domain settings
2. Add custom domain
3. DNS 설정에 따라 진행
```

## 🔒 보안 관련 문제

### 인증 시스템 오류

#### 문제: JWT 토큰 만료

```javascript
// 토큰 갱신 로직 추가
const refreshToken = async () => {
  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
  } catch (error) {
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
};
```

#### 문제: 세션 관리

```javascript
// 로그인 상태 확인
const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
```

### HTTPS 인증서 문제

#### 문제: Mixed Content 오류

```javascript
// HTTP API를 HTTPS 사이트에서 호출할 때
// API 서버도 HTTPS로 설정하거나
// 개발 환경에서는 HTTP로 테스트

// 임시 해결책 (개발용만)
// Chrome: --disable-web-security 플래그
```

## 📱 반응형 디자인 문제

### 모바일 호환성

#### 문제: 모바일에서 터치 이벤트

```css
/* 터치 영역 최소 크기 */
.button {
  min-height: 44px;
  min-width: 44px;
}

/* 터치 시 하이라이트 제거 */
.button {
  -webkit-tap-highlight-color: transparent;
}
```

#### 문제: 모바일 키보드로 인한 레이아웃 변화

```css
/* iOS Safari에서 100vh 문제 */
.full-height {
  height: 100vh;
  height: -webkit-fill-available;
}

/* 키보드 나타날 때 고정 */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  bottom: env(safe-area-inset-bottom);
}
```

## 🎯 성능 최적화 문제

### 로딩 속도 개선

#### 문제: 이미지 로딩 느림

```html
<!-- 이미지 최적화 -->
<img
  src="image.webp"
  alt="Description"
  loading="lazy"
  width="400"
  height="300"
/>

<!-- 반응형 이미지 -->
<picture>
  <source media="(max-width: 799px)" srcset="small.webp" />
  <source media="(min-width: 800px)" srcset="large.webp" />
  <img src="fallback.jpg" alt="Description" />
</picture>
```

#### 문제: JavaScript 번들 크기

```javascript
// 코드 스플리팅 (React)
const LazyComponent = lazy(() => import('./LazyComponent'));

// 트리 쉐이킹을 위한 named import
import { debounce } from 'lodash-es'; // ✅
import _ from 'lodash'; // ❌ 전체 라이브러리 로드
```

## 🆘 최후 수단

### 모든 방법이 실패했을 때

#### 1. 프로젝트 완전 재시작

```bash
# 새 디렉토리에서 시작
mkdir new-project
cd new-project

# Claude에게 요청
"이전 프로젝트가 너무 복잡해졌어요.
처음부터 다시 만들어주세요.
이런 기능들이 필요해요: [핵심 기능 목록]"
```

#### 2. 단순화된 버전으로 시작

```
"지금은 너무 복잡한 것 같아요.
가장 핵심적인 기능 하나만 먼저 완벽하게 만들어주세요.
나머지는 나중에 천천히 추가하겠어요."
```

#### 3. 커뮤니티 도움 요청

- GitHub Issues에 상세한 문제 상황 작성
- Stack Overflow에서 유사한 문제 검색
- Discord나 Slack 개발자 커뮤니티 참여

#### 4. 전문가 상담

```
"이 문제가 너무 복잡해서 혼자 해결하기 어려워요.
전문가의 도움이 필요한 것 같아요.
어떤 분야의 전문가에게 문의해야 할까요?"
```

## 📞 추가 지원

### 긴급한 도움이 필요할 때

1. **GitHub Issues**: [문제 신고](https://github.com/your-username/AI_Workflow_Playbook/issues)
2. **이메일 지원**: support@ai-workflow-playbook.com
3. **커뮤니티 채팅**: [Discord 링크](#)
4. **실시간 도움**: Claude와 "문제 해결 모드"로 대화

### 문제 신고 시 포함할 정보

```
운영체제: [Windows 11 / macOS 13.4 / Ubuntu 22.04]
브라우저: [Chrome 120 / Safari 17 / Firefox 121]
Node.js 버전: [node --version 결과]
프로젝트 유형: [React / Vanilla JS / Next.js]
오류 메시지: [전체 오류 메시지 복사]
재현 단계: [문제가 발생하는 정확한 단계]
```

---

## 🌟 문제 예방 팁

### 정기적인 유지보수

- 매주 `npm update` 실행
- 월 1회 전체 의존성 검토
- 중요한 변경 전 Git 커밋

### 좋은 습관

- 작은 단위로 자주 테스트
- 에러 메시지를 정확히 읽기
- 변경사항을 단계별로 적용
- 백업 및 버전 관리 습관화

**🔧 문제가 해결되지 않았다면 언제든 문의하세요!**
