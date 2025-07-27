# ⚡ Claude Code 고급 기능 마스터

## 🎯 개요

**Claude Code의 숨겨진 강력한 기능들**을 활용해 개발 생산성을 10배 향상시키는 완전 가이드입니다.

### 고급 기능 목록
- 🤖 **Sub-Agents**: 전문화된 AI 에이전트
- 🧠 **Extended Thinking**: 깊은 사고 모드  
- 🔄 **Parallel Sessions**: Git Worktrees 병렬 개발
- 🔧 **Unix Integration**: CLI 도구로 활용
- 📎 **@ 참조 시스템**: 즉시 컨텍스트 포함
- 🖼️ **Image Analysis**: 시각적 자료 분석

---

## 🤖 Sub-Agents: 전문화된 AI 에이전트

### 개념과 활용
**Sub-Agents는 특정 작업에 특화된 독립적인 AI 에이전트**입니다.

### 즉시 활용 가능한 Sub-Agent 패턴

#### 1. 코드 리뷰 전문가
```bash
# 보안 중심 리뷰 에이전트
/create-sub-agent security-reviewer \
  --focus "security vulnerabilities, authentication, data validation" \
  --checklist "OWASP Top 10, input sanitization, JWT security" \
  --output "prioritized security issues with fix suggestions"

# 성능 중심 리뷰 에이전트  
/create-sub-agent performance-reviewer \
  --focus "performance bottlenecks, optimization opportunities" \
  --checklist "bundle size, render performance, database queries" \
  --output "performance metrics with improvement suggestions"
```

#### 2. 디버깅 전문가
```bash
# Frontend 디버깅 에이전트
/create-sub-agent frontend-debugger \
  --focus "React issues, state management, rendering problems" \
  --tools "React DevTools, browser console, network tab" \
  --approach "systematic elimination, state tracing"

# Backend 디버깅 에이전트
/create-sub-agent backend-debugger \
  --focus "API errors, database issues, server problems" \
  --tools "server logs, database queries, network monitoring" \
  --approach "log analysis, dependency checking"
```

#### 3. 아키텍처 설계자
```bash
# 시스템 아키텍처 에이전트
/create-sub-agent system-architect \
  --focus "scalability, maintainability, design patterns" \
  --checklist "SOLID principles, clean architecture, microservices" \
  --output "architectural recommendations with trade-offs"
```

### 실전 활용 시나리오

#### 시나리오 1: 복합적 코드 리뷰
```bash
# 여러 관점에서 동시 리뷰
parallel_review() {
  /delegate security-reviewer @auth-module --output security-report.md &
  /delegate performance-reviewer @auth-module --output perf-report.md &  
  /delegate maintainability-reviewer @auth-module --output maintain-report.md &
  wait
  /combine-reports security-report.md perf-report.md maintain-report.md
}
```

#### 시나리오 2: 문제 해결 팀워크
```bash
# 복잡한 버그를 여러 각도에서 분석
debug_complex_issue() {
  /delegate frontend-debugger @client-error --trace user-interaction &
  /delegate backend-debugger @server-logs --trace api-calls &
  /delegate network-debugger @network-requests --trace data-flow &
  wait
  /synthesize-findings --correlate-timeline
}
```

---

## 🧠 Extended Thinking: 깊은 사고 모드

### 언제 사용하나?
- 복잡한 아키텍처 설계
- 까다로운 버그 분석  
- 복잡한 비즈니스 로직 구현
- 성능 최적화 전략 수립

### 활용 레벨

#### Level 1: 기본 확장 사고
```bash
# 일반적인 문제 해결
/analyze @problematic-component --extended-thinking

결과:
- 문제의 근본 원인 심층 분석
- 여러 해결 방안 비교
- 부작용과 트레이드오프 고려
- 단계별 구현 계획
```

#### Level 2: 고급 확장 사고  
```bash
# 복잡한 아키텍처 문제
/design system-architecture --extended-thinking --deep-analysis

결과:
- 시스템 전체 관점에서 분석
- 확장성과 유지보수성 고려
- 미래 요구사항 예측
- 리스크 요소 식별
```

#### Level 3: 전문가급 사고
```bash
# 최고 수준의 분석 (30분+ 소요)
/architect enterprise-system --extended-thinking --expert-level

결과:
- 엔터프라이즈급 고려사항
- 다양한 아키텍처 패턴 비교
- 기술 스택 전략적 선택
- 장기적 진화 계획
```

### 실전 활용 예시

#### 복잡한 상태 관리 설계
```bash
사용자: "전자상거래 앱의 복잡한 장바구니 상태를 어떻게 관리해야 할까?"

/design shopping-cart-state --extended-thinking --focus scalability

AI 분석 과정:
1. 현재 요구사항 분석
2. 상태 복잡도 평가  
3. 다양한 상태 관리 패턴 비교
4. 성능과 사용성 트레이드오프
5. 확장 가능한 설계 제안
6. 구현 단계별 계획
```

---

## 🔄 Parallel Sessions: Git Worktrees 활용

### 병렬 개발의 혁신
**여러 브랜치에서 독립적인 Claude 세션**을 동시 실행!

### 설정 방법
```bash
# 메인 브랜치에서 시작
cd your-project

# 새 기능 개발용 워크트리
git worktree add ../project-feature-auth -b feature/authentication

# 버그 수정용 워크트리  
git worktree add ../project-hotfix -b hotfix/critical-bug

# 실험적 기능용 워크트리
git worktree add ../project-experiment -b experiment/new-ui
```

### 각 워크트리에서 독립 세션
```bash
# 터미널 1: 인증 기능 개발
cd ../project-feature-auth
claude --context "authentication system development"

# 터미널 2: 긴급 버그 수정  
cd ../project-hotfix
claude --context "critical bug fixing session"

# 터미널 3: UI 실험
cd ../project-experiment  
claude --context "experimental UI exploration"
```

### 고급 병렬 워크플로우

#### 1. 기능별 전문가 배치
```bash
# 각 워크트리에 전문 에이전트 배치
setup_parallel_experts() {
  cd ../project-feature-auth
  /create-sub-agent auth-expert --focus "security, JWT, OAuth"
  
  cd ../project-hotfix
  /create-sub-agent bug-hunter --focus "debugging, error tracking"
  
  cd ../project-experiment
  /create-sub-agent ui-designer --focus "UX, accessibility, performance"
}
```

#### 2. 동시 코드 리뷰
```bash
# 모든 워크트리에서 동시 리뷰
parallel_review_all() {
  cd ../project-feature-auth && /review @. --output auth-review.md &
  cd ../project-hotfix && /review @. --output hotfix-review.md &  
  cd ../project-experiment && /review @. --output ui-review.md &
  wait
  /consolidate-reviews --merge-insights
}
```

#### 3. 크로스 브랜치 분석
```bash
# 브랜치 간 영향도 분석
/analyze-cross-impact \
  --branches feature/auth,hotfix/bug,experiment/ui \
  --focus "conflicts, dependencies, integration-points"
```

---

## 🔧 Unix Integration: CLI 도구로 활용

### Claude를 파이프라인에 통합

#### 1. 린팅 도구로 활용
```bash
# Git hook으로 자동 코드 리뷰
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$')
if [ -n "$staged_files" ]; then
  echo "$staged_files" | claude review --stdin --format json > review-results.json
  if grep -q "CRITICAL\|ERROR" review-results.json; then
    echo "❌ Critical issues found. Please fix before committing."
    cat review-results.json
    exit 1
  fi
fi
EOF

chmod +x .git/hooks/pre-commit
```

#### 2. 빌드 스크립트 통합
```bash
# package.json scripts 예시
{
  "scripts": {
    "pre-build": "claude analyze @src --focus performance --output build-analysis.json",
    "post-build": "claude review @dist --focus bundle-optimization --output optimization-tips.md",
    "security-scan": "claude audit @. --focus security --output security-report.html"
  }
}
```

#### 3. CI/CD 파이프라인
```yaml
# GitHub Actions 예시
name: AI-Powered Code Review
on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: AI Code Review
        run: |
          claude review @. --format github-comment > ai-review.md
          gh pr comment ${{ github.event.number }} --body-file ai-review.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 4. 모니터링 통합
```bash
# 로그 분석 자동화
tail -f /var/log/app.log | claude analyze --stdin --focus errors --alert-threshold high
```

---

## 📎 @ 참조 시스템: 즉시 컨텍스트

### 강력한 컨텍스트 포함 기능

#### 1. 파일 참조
```bash
# 단일 파일 분석
/analyze @components/AuthForm.tsx --focus security

# 여러 파일 동시 참조
/review @components/AuthForm.tsx @utils/validation.ts @hooks/useAuth.ts

# 타입 정의 포함 분석
/refactor @components/Button.tsx @types/button.d.ts --improve-typing
```

#### 2. 디렉토리 참조
```bash
# 전체 컴포넌트 폴더 분석
/analyze @components/ --focus architecture

# 유틸리티 함수들 최적화
/optimize @utils/ --focus performance

# API 라우트 보안 검토
/security-audit @pages/api/ --focus vulnerabilities
```

#### 3. 패턴 기반 참조
```bash
# 특정 패턴 파일들만
/review @**/*.test.ts --focus test-quality

# 스타일 파일들 최적화
/optimize @**/*.css @**/*.scss --focus bundle-size

# TypeScript 설정 파일들
/configure @tsconfig.json @*.config.ts --improve-dev-experience
```

### 고급 참조 패턴

#### 1. 조건부 참조
```bash
# 최근 수정된 파일만
/review @$(git diff --name-only HEAD~1) --focus recent-changes

# 에러가 있는 파일만  
/fix @$(grep -l "TODO\|FIXME" src/**/*.ts) --resolve-todos
```

#### 2. 동적 컨텍스트 구성
```bash
# 기능별 관련 파일 자동 수집
analyze_feature() {
  local feature=$1
  local files=$(find . -name "*${feature}*" -type f | head -10)
  /analyze @$files --focus feature-completeness
}

analyze_feature "authentication"
```

---

## 🖼️ Image Analysis: 시각적 자료 분석

### UI/UX 분석
```bash
# 디자인 파일에서 코드 생성
/generate-component @design/button-variants.png --framework react --styling tailwind

# 기존 UI와 목표 디자인 비교
/compare-ui @current-ui-screenshot.png @target-design.png --generate-migration-plan
```

### 에러 스크린샷 분석
```bash
# 브라우저 에러 스크린샷 분석
/debug @error-screenshot.png --identify-issue --suggest-fixes

# 모바일 레이아웃 문제 진단
/analyze @mobile-layout-issue.png --focus responsive-design
```

### 아키텍처 다이어그램 분석
```bash
# 시스템 다이어그램을 코드로 변환
/implement-architecture @system-diagram.png --generate-boilerplate

# 데이터베이스 ERD 분석
/generate-models @database-erd.png --framework prisma
```

---

## 🚀 통합 워크플로우 예시

### 완전 자동화된 기능 개발
```bash
#!/bin/bash
# AI 기반 완전 자동화 개발 워크플로우

develop_feature() {
  local feature_name=$1
  local design_file=$2
  
  # 1. 병렬 환경 준비
  git worktree add ../feature-${feature_name} -b feature/${feature_name}
  cd ../feature-${feature_name}
  
  # 2. 디자인 분석 및 초기 코드 생성
  /analyze-design @${design_file} --generate-component-structure > structure.md
  
  # 3. 전문가 에이전트 배치
  /create-sub-agent feature-developer \
    --focus "component development, state management, API integration"
  
  # 4. 확장 사고로 아키텍처 설계
  /design feature-architecture --extended-thinking --input @structure.md
  
  # 5. 단계별 구현
  /implement @structure.md --step-by-step --with-tests
  
  # 6. 자동 품질 검사
  /review @. --comprehensive --fix-issues
  
  # 7. 성능 최적화
  /optimize @. --focus performance --measure-impact
  
  echo "✅ Feature ${feature_name} development complete!"
}

# 사용 예시
develop_feature "user-dashboard" "designs/dashboard-mockup.png"
```

### 문제 해결 마스터 워크플로우
```bash
solve_complex_problem() {
  local problem_description=$1
  
  # 1. 다각도 분석팀 배치
  /create-sub-agent root-cause-analyzer --focus "systematic debugging"
  /create-sub-agent solution-architect --focus "multiple solution approaches"  
  /create-sub-agent implementation-expert --focus "practical implementation"
  
  # 2. 확장 사고로 문제 분석
  /analyze "$problem_description" --extended-thinking --deep-dive
  
  # 3. 병렬 해결책 탐색
  /delegate root-cause-analyzer "identify all possible causes" &
  /delegate solution-architect "design 3 alternative solutions" &
  /delegate implementation-expert "create implementation roadmap" &
  wait
  
  # 4. 결과 종합 및 최적 솔루션 선택
  /synthesize-solutions --rank-by-feasibility --consider-tradeoffs
  
  # 5. 구현 및 검증
  /implement-solution --with-monitoring --rollback-plan
}
```

---

## 💡 마스터 레벨 팁

### 1. 효율성 극대화
```bash
# 개인 설정 파일로 워크플로우 자동화
cat > ~/.claude-config << 'EOF'
[default-flags]
extended-thinking = true
create-sub-agents = true
output-format = "structured-markdown"

[custom-commands]
my-review = "review @. --focus security,performance --fix-minor-issues"
my-debug = "create-sub-agent debugger --analyze-error --suggest-fixes"
my-optimize = "analyze @. --focus performance --extended-thinking --implement-fixes"
EOF
```

### 2. 팀 협업 최적화
```bash
# 팀 공유 워크플로우
team_standards() {
  /create-sub-agent team-reviewer \
    --checklist @.github/code-review-checklist.md \
    --style @.github/coding-standards.md \
    --output "team-standard-report"
}
```

### 3. 지속적 학습
```bash
# 개발 패턴 학습 및 개선
learn_and_improve() {
  /analyze @. --identify-patterns --suggest-improvements > insights.md
  /create-sub-agent pattern-teacher --explain-best-practices --based-on @insights.md
}
```

---

> ⚡ **"고급 기능을 마스터하면 AI와 진정한 협업이 시작된다"**

**Claude Code의 모든 잠재력을 발휘해 개발의 새로운 차원을 경험하세요!**