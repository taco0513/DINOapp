# 🛠️ 개발 도구 컬렉션

**AI 기반 개발에 최적화된 필수 도구들**

## ⭐ 편집자 추천 (필수 도구)

### 🎯 AI 코딩 도구
| 도구 | 목적 | 가격 | 추천도 |
|------|------|------|--------|
| **Claude Code** | AI 페어 프로그래밍 | 무료/Pro $20 | ⭐⭐⭐⭐⭐ |
| **Cursor** | AI 네이티브 IDE | 무료/Pro $20 | ⭐⭐⭐⭐⭐ |
| **GitHub Copilot** | 코드 자동완성 | $10/월 | ⭐⭐⭐⭐ |
| **Tabnine** | AI 코드 어시스턴트 | 무료/Pro $12 | ⭐⭐⭐ |

### 🔧 필수 개발 환경
| 도구 | 목적 | 가격 | 설치 명령어 |
|------|------|------|-------------|
| **Node.js** | JavaScript 런타임 | 무료 | `brew install node` |
| **Git** | 버전 관리 | 무료 | `brew install git` |
| **Docker** | 컨테이너화 | 무료 | `brew install docker` |
| **VS Code** | 코드 에디터 | 무료 | `brew install visual-studio-code` |

## 🚀 IDE 및 에디터

### Cursor (최우선 추천)
```bash
# 설치
curl -fsSL https://cursor.sh/install.sh | sh

# 또는 직접 다운로드
# https://cursor.sh
```

**장점:**
- AI가 기본 통합됨
- Claude Code와 완벽 호환
- 실시간 코드 제안
- 자연어 코드 생성

**설정 팁:**
```json
{
  "cursor.enabled": true,
  "cursor.aiMode": "advanced",
  "cursor.autoSuggest": true
}
```

### VS Code + 확장 프로그램
**필수 확장 프로그램:**
- Claude Code Extension
- GitHub Copilot
- Prettier (코드 포맷팅)
- ESLint (코드 품질)
- GitLens (Git 시각화)

```bash
# 확장 프로그램 일괄 설치
code --install-extension claude-ai.claude-code
code --install-extension github.copilot
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension eamodio.gitlens
```

## 🎨 디자인 도구

### UI/UX 디자인
| 도구 | 목적 | 가격 | 특징 |
|------|------|------|------|
| **Figma** | 디자인 협업 | 무료/Pro $12 | 웹 기반, 실시간 협업 |
| **Canva** | 그래픽 디자인 | 무료/Pro $13 | 템플릿 풍부 |
| **Unsplash** | 무료 이미지 | 무료 | 고품질 스톡 사진 |
| **Heroicons** | 아이콘 세트 | 무료 | Tailwind CSS 제작팀 |

### 컬러 및 타이포그래피
- **Coolors.co**: 컬러 팔레트 생성기
- **Google Fonts**: 무료 웹폰트
- **Fontsquirrel**: 무료 상업용 폰트
- **Adobe Color**: 컬러 조합 도구

## 🌐 웹 개발 도구

### 프론트엔드 프레임워크
```bash
# React 프로젝트 생성
npx create-react-app my-app
cd my-app
npm start

# Next.js 프로젝트 생성
npx create-next-app@latest my-app
cd my-app
npm run dev

# Vue.js 프로젝트 생성
npm create vue@latest my-app
cd my-app
npm run dev
```

### CSS 프레임워크
| 프레임워크 | 특징 | 학습 곡선 | AI 호환성 |
|------------|------|-----------|-----------|
| **Tailwind CSS** | 유틸리티 우선 | 낮음 | ⭐⭐⭐⭐⭐ |
| **Bootstrap** | 컴포넌트 기반 | 낮음 | ⭐⭐⭐⭐ |
| **Material-UI** | Google 디자인 | 중간 | ⭐⭐⭐⭐ |
| **Ant Design** | 엔터프라이즈 UI | 중간 | ⭐⭐⭐ |

### 백엔드 도구
```bash
# Express.js (Node.js)
npm init -y
npm install express
npm install -g nodemon

# FastAPI (Python)
pip install fastapi uvicorn

# Spring Boot (Java)
# https://start.spring.io 에서 생성
```

## 📱 모바일 개발

### 크로스 플랫폼
| 도구 | 언어 | 성능 | AI 지원 |
|------|------|------|---------|
| **React Native** | JavaScript | 높음 | ⭐⭐⭐⭐ |
| **Flutter** | Dart | 매우 높음 | ⭐⭐⭐⭐ |
| **Ionic** | HTML/CSS/JS | 중간 | ⭐⭐⭐ |
| **Xamarin** | C# | 높음 | ⭐⭐ |

### 설치 및 설정
```bash
# React Native CLI
npm install -g @react-native-community/cli
npx react-native init MyApp

# Flutter
# https://flutter.dev 에서 SDK 다운로드
flutter doctor
flutter create my_app

# Expo (React Native)
npm install -g @expo/cli
npx create-expo-app MyApp
```

## 🗄️ 데이터베이스 도구

### 무료 데이터베이스 서비스
| 서비스 | 타입 | 무료 한도 | 특징 |
|--------|------|-----------|------|
| **Supabase** | PostgreSQL | 500MB, 2GB 전송 | Firebase 대안 |
| **PlanetScale** | MySQL | 10GB 스토리지 | 서버리스 MySQL |
| **MongoDB Atlas** | NoSQL | 512MB | 클라우드 MongoDB |
| **Firebase** | NoSQL | 1GB 저장, 10GB 전송 | Google 통합 |

### 로컬 개발 도구
```bash
# PostgreSQL
brew install postgresql
brew services start postgresql

# MongoDB
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Redis
brew install redis
brew services start redis
```

## 🚀 배포 및 DevOps

### 무료 호스팅 플랫폼
| 플랫폼 | 타입 | 특징 | 추천 용도 |
|--------|------|------|---------|
| **Vercel** | Jamstack | 자동 배포 | React, Next.js |
| **Netlify** | 정적 사이트 | 폼 처리 | Vue, Angular |
| **Railway** | 풀스택 | 데이터베이스 포함 | Node.js, Python |
| **Heroku** | PaaS | 다양한 언어 | 모든 백엔드 |

### CI/CD 도구
- **GitHub Actions**: 무료 (2000분/월)
- **GitLab CI/CD**: 무료 (400분/월)
- **CircleCI**: 무료 (6000분/월)
- **Travis CI**: 오픈소스 무료

## 📊 모니터링 및 분석

### 에러 트래킹
| 도구 | 무료 한도 | 특징 |
|------|-----------|------|
| **Sentry** | 5K 에러/월 | 실시간 에러 알림 |
| **LogRocket** | 1K 세션/월 | 사용자 세션 녹화 |
| **Bugsnag** | 2K 에러/월 | 에러 우선순위 |

### 분석 도구
- **Google Analytics**: 무료 웹 분석
- **Hotjar**: 사용자 행동 분석
- **Mixpanel**: 이벤트 트래킹
- **Plausible**: 프라이버시 중심 분석

## 🔐 보안 도구

### 코드 보안 스캔
```bash
# npm audit (Node.js)
npm audit
npm audit fix

# Snyk
npm install -g snyk
snyk test
snyk wizard

# OWASP ZAP
# https://owasp.org/www-project-zap/
```

### 환경 변수 관리
- **dotenv**: 환경 변수 로딩
- **AWS Secrets Manager**: 클라우드 시크릿 관리
- **HashiCorp Vault**: 오픈소스 시크릿 관리

## 🎯 생산성 도구

### 커맨드라인 도구
```bash
# 향상된 터미널 (zsh + oh-my-zsh)
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 빠른 파일 검색
brew install fzf
brew install ripgrep
brew install fd

# Git 향상
brew install tig
brew install lazygit
```

### 브라우저 확장 프로그램
**Chrome/Edge/Firefox:**
- React Developer Tools
- Vue.js devtools
- Redux DevTools
- Lighthouse (성능 분석)
- JSON Viewer
- CORS Unblock (개발용)

## 📚 학습 및 문서화

### API 도구
- **Postman**: API 테스팅
- **Insomnia**: API 클라이언트
- **Swagger/OpenAPI**: API 문서화
- **GraphQL Playground**: GraphQL 쿼리

### 문서화 도구
- **GitBook**: 온라인 문서
- **Notion**: 협업 문서
- **Obsidian**: 지식 관리
- **Docusaurus**: 정적 문서 사이트

## 💡 AI 개발 최적화 팁

### Claude Code와 함께 사용하기
```bash
# 프로젝트 컨텍스트 설정
echo "프로젝트 구조와 주요 기술 스택을 @PROJECT_INFO.md에 정리하세요"

# 자주 사용하는 명령어 alias 설정
alias dev="npm run dev"
alias build="npm run build"
alias test="npm test"
alias commit="git add . && git commit -m"
```

### 효율적인 도구 조합
1. **기본 스택**: Cursor + Claude Code + Tailwind CSS
2. **백엔드 추가**: Supabase + Vercel
3. **모니터링**: Sentry + Google Analytics
4. **협업**: GitHub + Notion + Discord

## 🔄 도구 업데이트 관리

### 정기 업데이트 체크리스트
```bash
# Node.js 및 npm 패키지
npm outdated
npm update

# 전역 패키지 업데이트
npm update -g

# Homebrew 패키지 (macOS)
brew update
brew upgrade

# VS Code 확장 프로그램
# Extensions 탭에서 업데이트 확인
```

### 버전 관리 전략
- **LTS 버전 사용**: Node.js, Python 등은 LTS 버전 권장
- **점진적 업데이트**: 메이저 버전 업데이트는 신중히
- **테스트 환경 검증**: 프로덕션 적용 전 충분한 테스트

---

## 🚀 시작하기

### 신규 프로젝트 도구 설치 스크립트
```bash
#!/bin/bash
# 기본 개발 환경 설정

# Homebrew 설치 (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 필수 도구 설치
brew install node git docker
brew install visual-studio-code

# Cursor 설치
curl -fsSL https://cursor.sh/install.sh | sh

# 전역 패키지 설치
npm install -g @latest/cli
npm install -g vercel
npm install -g netlify-cli

echo "개발 환경 설정 완료! 🎉"
```

**다음 단계**: [학습 자료](02_Learning_Resources.md)에서 이 도구들을 활용한 학습 방법을 확인하세요!