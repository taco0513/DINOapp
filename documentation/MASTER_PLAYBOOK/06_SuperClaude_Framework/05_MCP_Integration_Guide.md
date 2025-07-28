# MCP 서버 통합 가이드

## MCP (Model Context Protocol) 개요

MCP 서버는 Claude Code의 기능을 확장하여 외부 도구와 서비스에 접근할 수 있게 합니다.

## 핵심 MCP 서버

### 1. Context7 - 공식 문서 허브
**상태**: 🟢 항상 활성 (모든 개발 작업)

**주요 기능**:
- 공식 라이브러리 문서
- 코드 예제 및 패턴
- 베스트 프랙티스
- 현지화 표준

**워크플로우**:
```bash
# 1. 라이브러리 감지
import/require 구문 스캔
package.json 분석

# 2. ID 해결
resolve-library-id("react")
→ "/facebook/react"

# 3. 문서 검색
get-library-docs("/facebook/react", {
  topic: "hooks",
  tokens: 10000
})

# 4. 패턴 추출 및 구현
```

**활용 예시**:
```bash
# React Hooks 문서
"React의 useEffect 사용법 알려줘"

# Next.js 라우팅
"Next.js 13 App Router 구현 방법"

# Tailwind CSS
"Tailwind로 반응형 그리드 만들기"
```

### 2. Sequential - 복잡한 분석 엔진
**활성화**: 복잡한 디버깅, 시스템 설계, --think 플래그

**주요 기능**:
- 다단계 문제 해결
- 체계적 분석
- 가설 생성 및 검증
- 관계 매핑

**분석 프로세스**:
```yaml
sequential_process:
  1_decomposition: "문제를 구성 요소로 분해"
  2_analysis: "각 구성 요소 체계적 분석"
  3_mapping: "의존성 및 상호작용 식별"
  4_hypothesis: "테스트 가능한 가설 생성"
  5_evidence: "도구로 증거 수집"
  6_synthesis: "결과 종합"
  7_recommendation: "실행 가능한 다음 단계"
```

**활용 예시**:
```bash
# 복잡한 버그 분석
/troubleshoot "간헐적 메모리 누수" --seq

# 아키텍처 설계
/design "마이크로서비스 아키텍처" --think-hard

# 성능 병목지점
/analyze performance --seq
```

### 3. Magic - UI 컴포넌트 생성기
**활성화**: UI 컴포넌트 요청, 디자인 시스템, frontend 페르소나

**주요 기능**:
- 현대적 UI 컴포넌트 생성
- 디자인 시스템 통합
- 반응형 디자인
- 접근성 준수

**컴포넌트 카테고리**:
```yaml
component_types:
  interactive:
    - buttons
    - forms
    - modals
    - dropdowns
  layout:
    - grids
    - containers
    - sidebars
  display:
    - cards
    - tables
    - charts
  feedback:
    - alerts
    - toasts
    - progress
```

**활용 예시**:
```bash
# 대시보드 컴포넌트
/implement "관리자 대시보드" --magic

# 폼 컴포넌트
/build "다단계 등록 폼" --type component --magic

# 데이터 시각화
/implement "실시간 차트 컴포넌트" --magic
```

### 4. Playwright - 브라우저 자동화
**활성화**: E2E 테스트, 성능 모니터링, 시각적 테스트

**주요 기능**:
- 크로스 브라우저 테스팅
- 성능 메트릭 수집
- 시각적 회귀 테스트
- 사용자 시뮬레이션

**테스트 능력**:
```yaml
testing_capabilities:
  browsers:
    - Chrome
    - Firefox
    - Safari
    - Edge
  metrics:
    - Load time
    - Core Web Vitals
    - Resource usage
  validation:
    - Visual regression
    - Accessibility
    - User flows
```

**활용 예시**:
```bash
# E2E 테스트 생성
/test e2e "사용자 등록 플로우" --play

# 성능 모니터링
/test performance --play

# 시각적 테스트
/test visual --play
```

## MCP 서버 선택 알고리즘

### 우선순위 매트릭스
```yaml
selection_priority:
  1_task_affinity: "작업-서버 적합성"
  2_performance: "응답 시간, 성공률"
  3_context: "현재 페르소나, 세션 상태"
  4_load: "서버 부하 분산"
  5_fallback: "백업 서버 준비"
```

### 자동 활성화 규칙
```yaml
auto_activation:
  context7:
    triggers:
      - "라이브러리 import"
      - "프레임워크 질문"
      - "문서 요청"
      - "코드 예제"
    confidence: 95%
  
  sequential:
    triggers:
      - "복잡한 디버깅"
      - "시스템 설계"
      - "--think 플래그"
      - "다단계 문제"
    confidence: 90%
  
  magic:
    triggers:
      - "UI 컴포넌트"
      - "디자인 시스템"
      - "frontend 페르소나"
      - "컴포넌트 생성"
    confidence: 85%
  
  playwright:
    triggers:
      - "E2E 테스트"
      - "성능 테스트"
      - "QA 페르소나"
      - "브라우저 테스트"
    confidence: 88%
```

## 서버 조합 패턴

### 1. 풀스택 개발
```bash
Context7 + Magic + Sequential

# 사용 사례
/build "전자상거래 플랫폼" --all-mcp

# 워크플로우
1. Context7: 프레임워크 패턴
2. Magic: UI 컴포넌트
3. Sequential: 비즈니스 로직
```

### 2. 성능 최적화
```bash
Sequential + Playwright + Context7

# 사용 사례
/improve --focus performance --all-mcp

# 워크플로우
1. Sequential: 병목지점 분석
2. Playwright: 성능 측정
3. Context7: 최적화 패턴
```

### 3. 보안 감사
```bash
Sequential + Context7

# 사용 사례
/analyze --focus security --seq --c7

# 워크플로우
1. Sequential: 위협 모델링
2. Context7: 보안 패턴
```

### 4. UI/UX 개발
```bash
Magic + Playwright + Context7

# 사용 사례
/implement "디자인 시스템" --magic --play

# 워크플로우
1. Magic: 컴포넌트 생성
2. Playwright: 시각적 테스트
3. Context7: 프레임워크 통합
```

## 캐싱 전략

### 서버별 캐싱
```yaml
caching_strategy:
  context7:
    type: "버전 인식 캐싱"
    ttl: "세션 동안"
    savings: "2-5K 토큰/쿼리"
  
  sequential:
    type: "분석 결과 캐싱"
    ttl: "컨텍스트 변경까지"
    savings: "패턴 재사용"
  
  magic:
    type: "컴포넌트 패턴"
    ttl: "프로젝트 동안"
    savings: "디자인 일관성"
  
  playwright:
    type: "테스트 결과"
    ttl: "코드 변경까지"
    savings: "환경별 캐싱"
```

## 에러 처리 및 복구

### 장애 시나리오
```yaml
error_scenarios:
  context7_unavailable:
    fallback: "WebSearch"
    action: "문서 검색"
    limitation: "비공식 소스"
  
  sequential_timeout:
    fallback: "Native 분석"
    action: "기본 도구 사용"
    limitation: "깊이 제한"
  
  magic_failure:
    fallback: "기본 생성"
    action: "수동 개선 제안"
    limitation: "디자인 품질"
  
  playwright_disconnect:
    fallback: "수동 테스트"
    action: "테스트 케이스 제공"
    limitation: "자동화 없음"
```

### 복구 전략
```yaml
recovery_strategies:
  exponential_backoff:
    initial: 1s
    max: 30s
    factor: 2
  
  circuit_breaker:
    threshold: 3
    timeout: 60s
    half_open: 30s
  
  graceful_degradation:
    levels:
      - "전체 기능"
      - "제한된 기능"
      - "기본 기능만"
```

## 실전 활용 팁

### 효율적인 MCP 사용
1. **필요한 서버만 활성화**: 토큰 절약
2. **캐싱 활용**: 반복 요청 최소화
3. **병렬 처리**: 독립적 작업 동시 실행
4. **폴백 준비**: 장애 대응 계획

### 서버 조합 가이드
- **개발 초기**: Context7 중심
- **구현 단계**: Context7 + Magic
- **디버깅**: Sequential + Context7
- **테스트**: Playwright + Sequential
- **최적화**: 모든 서버 활용

### 성능 고려사항
```yaml
performance_tips:
  token_usage:
    context7: "~5K/요청"
    sequential: "~10K/분석"
    magic: "~3K/컴포넌트"
    playwright: "~2K/테스트"
  
  response_time:
    context7: "1-3초"
    sequential: "5-15초"
    magic: "2-5초"  
    playwright: "10-30초"
```

## 문제 해결 가이드

### 일반적인 이슈
1. **서버 응답 없음**: 다른 서버로 폴백
2. **토큰 초과**: 캐싱 활성화, 쿼리 최적화
3. **부정확한 결과**: 쿼리 구체화, 컨텍스트 제공
4. **성능 저하**: 불필요한 서버 비활성화