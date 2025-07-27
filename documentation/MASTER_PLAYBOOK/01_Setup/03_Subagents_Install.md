# 🤖 AI 전문가 팀(서브에이전트) 설치 가이드

## 🎯 서브에이전트란?

**36명의 AI 전문가**가 당신을 도와줍니다:
- 🔧 각 분야의 전문가
- 🎯 자동으로 호출됨
- 💡 최고의 해결책 제공

## 📥 일괄 설치 (추천! 🌟)

### Cursor에서 한 번에 설치하기

#### Step 1: 설치 명령
Cursor 채팅창에 입력:
```
You: "모든 Claude Code 서브에이전트 설치해줘"
```

AI가 자동으로:
1. 서브에이전트 저장소 다운로드
2. 36개 전문가 모두 설치
3. 설치 확인

#### Step 2: 설치 진행 확인
```
설치 중 메시지:
✅ backend-architect 설치 완료
✅ frontend-developer 설치 완료
✅ debugger 설치 완료
... (33개 더)
✅ 모든 서브에이전트 설치 완료!
```

## 📋 전문가 목록

### 🏗️ 개발 & 설계 (12명)
```
✅ backend-architect     - API 설계, 서버 구조
✅ frontend-developer    - UI/UX, React, 디자인
✅ mobile-developer      - iOS/Android 앱
✅ fullstack-engineer    - 전체 시스템 개발
✅ api-designer          - RESTful API, GraphQL
✅ database-architect    - DB 설계, 최적화
✅ ui-ux-designer        - 사용자 경험 설계
✅ game-developer        - 게임 개발
✅ blockchain-developer  - 블록체인, Web3
✅ wordpress-developer   - WordPress 전문
✅ shopify-developer     - 쇼핑몰 구축
✅ chrome-extension-dev  - 브라우저 확장
```

### 🛡️ 품질 & 보안 (8명)
```
✅ debugger             - 에러 해결 전문가
✅ code-reviewer        - 코드 품질 검토
✅ security-auditor     - 보안 취약점 검사
✅ performance-engineer - 성능 최적화
✅ test-engineer        - 테스트 자동화
✅ qa-specialist        - 품질 보증
✅ accessibility-expert - 접근성 검사
✅ seo-optimizer        - 검색 최적화
```

### 🚀 운영 & 인프라 (8명)
```
✅ devops-engineer      - CI/CD, 자동화
✅ cloud-architect      - AWS, GCP, Azure
✅ deployment-specialist - 배포 전문가
✅ docker-expert        - 컨테이너화
✅ kubernetes-admin     - K8s 관리
✅ monitoring-engineer  - 모니터링, 로깅
✅ backup-specialist    - 백업, 복구
✅ cdn-optimizer        - CDN, 캐싱
```

### 📊 데이터 & AI (8명)
```
✅ data-scientist       - 데이터 분석, ML
✅ ai-engineer          - AI/ML 구현
✅ data-engineer        - 데이터 파이프라인
✅ analytics-expert     - 비즈니스 분석
✅ nlp-specialist       - 자연어 처리
✅ computer-vision-dev  - 이미지 인식
✅ chatbot-developer    - 대화형 AI
✅ automation-engineer  - 자동화 시스템
```

## ✅ 설치 확인

### 방법 1: 목록 확인
Cursor 채팅창에:
```
You: "설치된 서브에이전트 목록 보여줘"
```

### 방법 2: 직접 확인
터미널에서:
```bash
# 설치 위치 확인
ls ~/.claude/agents/

# 개수 확인
ls ~/.claude/agents/ | wc -l
# 결과가 36이면 성공!
```

### 방법 3: 테스트 호출
Cursor 채팅창에:
```
You: "debugger 불러줘"
```

응답 예시:
```
Debugger: 안녕하세요! 디버깅 전문가입니다. 
어떤 문제를 해결해드릴까요?
```

## 🎯 자동 호출 테스트

### 에러 해결 테스트
```
You: "TypeError: Cannot read property 'name' of undefined 에러가 났어"
[debugger 자동 호출됨]
```

### UI 개발 테스트
```
You: "로그인 폼 만들어줘"
[frontend-developer 자동 호출됨]
```

### 성능 문제 테스트
```
You: "웹사이트가 너무 느려"
[performance-engineer 자동 호출됨]
```

## 🚨 문제 해결

### "서브에이전트를 찾을 수 없습니다"
```
해결:
1. 설치 경로 확인
2. 재설치:
   You: "서브에이전트 재설치해줘"
```

### "권한이 없습니다"
```
해결:
1. 폴더 권한 확인
2. 관리자 권한으로 재설치
```

### 특정 전문가만 설치하기
```
You: "frontend-developer 서브에이전트만 설치해줘"
```

## 💡 활용 팁

### 명시적 호출
특정 전문가를 부르고 싶을 때:
```
You: "security-auditor 불러서 내 코드 검사해줘"
You: "performance-engineer한테 최적화 방법 물어봐"
```

### 여러 전문가 협업
```
You: "로그인 시스템 만들어줘"
[자동으로 협업]
- backend-architect: API 설계
- security-auditor: 보안 검토
- frontend-developer: UI 구현
```

### 전문가 추천받기
```
You: "이 문제는 어떤 전문가한테 물어봐야 해?"
```

## 🎯 다음 단계

모든 전문가 설치가 완료되셨나요?

### ✅ 완료했다면
👉 [Step 4: 첫 대화 시작하기](04_First_Conversation.md)

### ❌ 문제가 있다면
```
You: "서브에이전트 설치 중 문제가 생겼어. 도와줘"
```

## 🌟 전문가 활용 예시

### 웹사이트 만들기
```
You: "쇼핑몰 웹사이트 만들고 싶어"
활성화되는 전문가들:
- frontend-developer (UI)
- backend-architect (서버)
- database-architect (DB)
- payment-specialist (결제)
- security-auditor (보안)
```

### 앱 만들기
```
You: "할일 관리 모바일 앱 만들어줘"
활성화되는 전문가들:
- mobile-developer (앱 개발)
- ui-ux-designer (디자인)
- database-architect (저장소)
- test-engineer (테스트)
```

---

> 🎉 **축하합니다!** 36명의 AI 전문가 팀이 준비되었습니다!

**이제 첫 대화를 시작해볼까요? 🚀**