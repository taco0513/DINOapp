# Git Worktrees로 병렬 Claude Code 세션 실행하기

## 개요

Git worktrees를 사용하면 하나의 저장소에서 여러 브랜치를 동시에 다른 디렉토리에서 작업할 수 있습니다. 이를 통해 여러 Claude Code 세션을 병렬로 실행할 수 있습니다.

## Git Worktrees란?

Git worktree는 하나의 Git 저장소에서 여러 작업 트리를 동시에 체크아웃할 수 있게 해주는 기능입니다.

### 장점
- 🚀 브랜치 전환 없이 여러 기능 동시 개발
- 💾 디스크 공간 절약 (저장소 공유)
- 🔄 빠른 컨텍스트 전환
- 🤖 여러 AI 세션 병렬 실행 가능

## 기본 설정

### 1. Worktree 생성
```bash
# 메인 저장소에서
cd ~/projects/my-app

# 새 기능을 위한 worktree 생성
git worktree add ../my-app-feature-auth feature/authentication
git worktree add ../my-app-feature-ui feature/ui-redesign
git worktree add ../my-app-bugfix bugfix/memory-leak
```

### 2. 디렉토리 구조
```
~/projects/
├── my-app/                 # 메인 워킹 디렉토리 (main 브랜치)
├── my-app-feature-auth/    # 인증 기능 개발
├── my-app-feature-ui/      # UI 리디자인
└── my-app-bugfix/          # 버그 수정
```

## Claude Code와 함께 사용하기

### 병렬 세션 실행
```bash
# 터미널 1: 인증 기능 개발
cd ~/projects/my-app-feature-auth
claude

# 터미널 2: UI 개발
cd ~/projects/my-app-feature-ui
claude

# 터미널 3: 버그 수정
cd ~/projects/my-app-bugfix
claude
```

### 각 세션에서의 작업 예시

#### 세션 1: 인증 기능
```bash
# Claude Code 세션에서
/implement "JWT 기반 사용자 인증 시스템" --type auth
/test unit auth
/git commit -m "feat: JWT authentication implementation"
```

#### 세션 2: UI 개선
```bash
# 다른 Claude Code 세션에서
/implement "반응형 대시보드 컴포넌트" --magic
/improve --focus accessibility
/git commit -m "feat: responsive dashboard UI"
```

#### 세션 3: 버그 수정
```bash
# 또 다른 Claude Code 세션에서
/troubleshoot "메모리 누수 이슈" --think-hard
/analyze --focus performance
/git commit -m "fix: resolve memory leak in data processing"
```

## 고급 워크플로우

### 1. 실험적 기능 개발
```bash
# 실험을 위한 worktree 생성
git worktree add ../my-app-experiment experimental/new-architecture

# Claude Code로 실험
cd ../my-app-experiment
claude
```

```bash
# Claude Code 세션에서
/design "마이크로프론트엔드 아키텍처" --think-hard
/implement "모듈 페더레이션 설정" --wave-mode force
```

### 2. A/B 테스트 개발
```bash
# A 버전
git worktree add ../my-app-version-a feature/checkout-flow-a

# B 버전
git worktree add ../my-app-version-b feature/checkout-flow-b
```

### 3. 핫픽스와 기능 개발 동시 진행
```bash
# 프로덕션 핫픽스
git worktree add ../my-app-hotfix hotfix/critical-bug

# 동시에 새 기능 개발 계속
cd ../my-app-feature-auth
```

## SuperClaude와의 통합

### Wave 모드 활용
```bash
# 대규모 리팩토링을 위한 worktree
git worktree add ../my-app-refactor refactor/architecture

cd ../my-app-refactor
claude
```

```bash
# Claude Code에서
/improve --wave-mode force --wave-strategy systematic
# 다른 worktree에서는 일상적인 개발 계속 가능
```

### 병렬 분석
```bash
# 성능 분석 전용 worktree
git worktree add ../my-app-performance analysis/performance

# 보안 분석 전용 worktree
git worktree add ../my-app-security analysis/security
```

각 세션에서:
```bash
# 성능 세션
/analyze --focus performance --ultrathink

# 보안 세션
/analyze --focus security --persona-security
```

## 협업 시나리오

### 1. 팀 개발
```yaml
developer_1:
  worktree: "feature/payment"
  claude_session: "결제 시스템 구현"
  
developer_2:
  worktree: "feature/notifications"
  claude_session: "알림 시스템 구현"
  
developer_3:
  worktree: "bugfix/performance"
  claude_session: "성능 최적화"
```

### 2. 코드 리뷰 준비
```bash
# 리뷰를 위한 깨끗한 worktree
git worktree add ../my-app-review feature/ready-for-review

cd ../my-app-review
claude
```

```bash
# Claude Code에서
/analyze --focus quality
/improve --quality
/document --type pr-description
```

## 모범 사례

### 1. Worktree 명명 규칙
```bash
# 기능 개발
../project-feature-{feature-name}

# 버그 수정
../project-bugfix-{issue-number}

# 실험
../project-exp-{experiment-name}

# 릴리스
../project-release-{version}
```

### 2. 정리 및 관리
```bash
# 현재 worktree 목록 확인
git worktree list

# 사용하지 않는 worktree 제거
git worktree remove ../my-app-experiment

# 정리
git worktree prune
```

### 3. 브랜치 전략
```yaml
main_worktree:
  branch: main
  purpose: "안정적인 코드베이스"
  
feature_worktrees:
  branches: feature/*
  purpose: "새 기능 개발"
  
hotfix_worktrees:
  branches: hotfix/*
  purpose: "긴급 수정"
```

## 주의사항

### 1. 동일 브랜치 제한
- 같은 브랜치를 여러 worktree에서 체크아웃할 수 없음
- 각 worktree는 고유한 브랜치 필요

### 2. 리소스 관리
- 각 Claude Code 세션은 독립적인 메모리 사용
- 너무 많은 병렬 세션은 시스템 리소스 부담

### 3. 동기화
```bash
# 다른 worktree의 변경사항 가져오기
git fetch
git pull origin main
```

## 실전 예제: 풀스택 개발

```bash
# Backend API 개발
git worktree add ../app-backend feature/api-v2

# Frontend UI 개발  
git worktree add ../app-frontend feature/new-ui

# 모바일 앱 개발
git worktree add ../app-mobile feature/mobile-app

# 인프라 설정
git worktree add ../app-infra feature/kubernetes
```

각 세션에서 전문화된 개발:
```bash
# Backend 세션
/implement "GraphQL API" --persona-backend

# Frontend 세션
/implement "React 컴포넌트" --persona-frontend --magic

# Mobile 세션
/implement "React Native 앱" --type mobile

# Infrastructure 세션
/implement "K8s 배포 설정" --persona-devops
```

## 성능 팁

### 1. 선택적 클론
```bash
# 대규모 저장소의 경우 sparse-checkout 사용
git worktree add --sparse ../my-app-frontend feature/ui
cd ../my-app-frontend
git sparse-checkout set frontend/
```

### 2. 캐시 공유
- Git 객체는 모든 worktree 간 공유
- 디스크 공간 절약
- 빠른 브랜치 전환

### 3. 병렬 빌드
```bash
# 각 worktree에서 독립적 빌드 가능
(cd ../app-backend && npm run build) &
(cd ../app-frontend && npm run build) &
wait
```

## 문제 해결

### Worktree 잠금 해제
```bash
# 잠긴 worktree 강제 제거
git worktree remove --force ../my-app-broken
```

### 브랜치 충돌
```bash
# 이미 체크아웃된 브랜치 확인
git worktree list
```

### 정리
```bash
# 모든 worktree 정리
git worktree prune
git gc
```