# 🤖 Claude Code CLI 설정 가이드

## 🎯 Claude Code CLI란?

**Claude Code CLI**는 터미널에서 Claude와 대화할 수 있게 해주는 도구입니다.
- Cursor와 완벽 호환
- 36명의 AI 전문가 지원
- 강력한 명령어 시스템

## 📥 설치 방법

### 방법 1: Cursor 내에서 설치 (추천! 🌟)

#### Step 1: Cursor에서 터미널 열기
```
1. Cursor 실행
2. 상단 메뉴 → Terminal → New Terminal
   또는 단축키: Ctrl+` (백틱)
   Mac: Cmd+`
```

#### Step 2: AI에게 요청하기
터미널이 열리면 Cursor의 채팅창에 입력:
```
You: "Claude Code CLI 설치해줘"
```

AI가 자동으로:
1. 운영체제 확인
2. 적절한 명령어 제공
3. 설치 진행

#### Step 3: 설치 확인
```bash
# 터미널에 입력
claude-code --version
```

### 방법 2: 수동 설치

#### Windows (PowerShell)
```powershell
# PowerShell을 관리자 권한으로 실행
# Windows 키 → "PowerShell" 검색 → 우클릭 → "관리자 권한으로 실행"

# npm이 없다면 먼저 설치
winget install OpenJS.NodeJS

# Claude Code CLI 설치
npm install -g claude-code-cli
```

#### Mac (Terminal)
```bash
# Homebrew가 없다면 먼저 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# Claude Code CLI 설치
npm install -g claude-code-cli
```

## 🔑 API 키 설정

### Step 1: API 키 받기
```
1. https://console.anthropic.com 접속
2. 구글 계정으로 로그인
3. "API Keys" 클릭
4. "Create Key" 클릭
5. 키 복사 (sk-ant-api03-... 형태)
```

### Step 2: API 키 설정
Cursor 채팅창에:
```
You: "Claude Code API 키 설정해줘"
```

또는 직접 설정:
```bash
claude-code config set ANTHROPIC_API_KEY "your-api-key-here"
```

## ✅ 설치 확인 테스트

### 기본 테스트
```bash
# 버전 확인
claude-code --version

# 도움말 보기
claude-code --help

# 간단한 대화 테스트
claude-code "안녕하세요"
```

### Cursor 통합 테스트
Cursor 채팅창에:
```
You: "현재 폴더에 있는 파일 목록 보여줘"
```

정상 작동 시 파일 목록이 표시됩니다.

## 🚨 문제 해결

### "command not found" 에러
```
원인: PATH 설정 문제
해결:
1. Cursor 재시작
2. 터미널 재시작
3. 그래도 안 되면:
   - Windows: 시스템 환경 변수에 npm 경로 추가
   - Mac: ~/.zshrc에 export PATH 추가
```

### "npm: command not found" 에러
```
원인: Node.js가 설치되지 않음
해결:
You: "Node.js 설치 방법 알려줘"
```

### API 키 에러
```
원인: API 키가 잘못됨
해결:
1. API 키 다시 확인 (sk-ant-api03-... 형태)
2. 따옴표 포함 여부 확인
3. 키 재생성
```

## 🎯 다음 단계

Claude Code CLI 설정이 완료되셨나요?

### ✅ 완료했다면
👉 [Step 3: AI 전문가 팀 설치](03_Subagents_Install.md)

### ❌ 문제가 있다면
Cursor 채팅창에:
```
You: "Claude Code CLI 설치 중 [에러 메시지] 에러가 났어. 해결해줘"
```

## 💡 유용한 명령어

### 기본 명령어
```bash
# 대화하기
claude-code "질문이나 요청사항"

# 파일 읽고 분석하기
claude-code read "파일명.js"

# 코드 생성하기
claude-code generate "로그인 폼 만들어줘"
```

### 고급 명령어
```bash
# 프로젝트 전체 분석
claude-code analyze .

# 특정 언어로 코드 생성
claude-code generate --language javascript "계산기 만들어줘"

# 대화 기록 보기
claude-code history
```

## 🔧 추가 설정 (선택사항)

### 기본 언어 설정
```bash
claude-code config set DEFAULT_LANGUAGE "korean"
```

### 응답 스타일 설정
```bash
claude-code config set RESPONSE_STYLE "concise"  # 간결하게
claude-code config set RESPONSE_STYLE "detailed" # 자세하게
```

### 자동 완성 설정
```bash
# Bash/Zsh
claude-code completion > ~/.claude-code-completion
echo "source ~/.claude-code-completion" >> ~/.bashrc

# PowerShell
claude-code completion --shell powershell > $PROFILE
```

---

> 🎉 **축하합니다!** Claude Code CLI 설정 완료!

**이제 36명의 AI 전문가를 만나볼 시간입니다! 🚀**