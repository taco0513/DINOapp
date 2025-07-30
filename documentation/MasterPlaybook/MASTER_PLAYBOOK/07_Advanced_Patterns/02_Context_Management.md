# 대규모 컨텍스트 관리

## 개요

대규모 프로젝트에서 효과적으로 컨텍스트를 관리하고 최적화하는 고급 패턴과 전략을 다룹니다.

## 컨텍스트 이해하기

### 컨텍스트 구성 요소

```yaml
context_components:
  conversation_history: '대화 기록'
  code_files: '코드 파일 내용'
  documentation: '프로젝트 문서'
  system_state: '시스템 상태 정보'
  user_preferences: '사용자 설정'
```

### 토큰 사용량 분석

```yaml
token_distribution:
  typical_usage:
    conversation: '20-30%'
    code_context: '40-50%'
    documentation: '10-20%'
    system_info: '5-10%'
    overhead: '5-10%'
```

## 전략 1: Progressive Context Loading

### 개념

필요에 따라 점진적으로 컨텍스트를 로드하여 토큰 효율성 극대화

### 구현

```bash
# Level 1: 최소 컨텍스트
/analyze summary --minimal

# Level 2: 핵심 컨텍스트
/analyze --focus core

# Level 3: 전체 컨텍스트
/analyze --comprehensive
```

### 단계별 로딩 전략

```yaml
loading_stages:
  stage_1:
    content: '파일 목록, 요약'
    tokens: '~1K'
    use_case: '초기 탐색'

  stage_2:
    content: '핵심 파일, 인터페이스'
    tokens: '~5K'
    use_case: '일반 개발'

  stage_3:
    content: '전체 구현, 테스트'
    tokens: '~20K'
    use_case: '복잡한 디버깅'
```

## 전략 2: Context Windowing

### 슬라이딩 윈도우 기법

```
[이전 컨텍스트] → [현재 작업 윈도우] → [예상 작업]
     (20%)              (60%)              (20%)
```

### 구현 예시

```bash
# 윈도우 크기 설정
--context-window 10000

# 윈도우 이동
--shift-context forward
--shift-context backward
```

### 윈도우 관리 전략

```yaml
window_management:
  retention_policy:
    critical: '항상 유지'
    important: '3 윈도우 유지'
    normal: '1 윈도우 유지'
    low: '즉시 제거'

  compression:
    old_context: '요약으로 대체'
    repetitive: '참조로 대체'
    verbose: '핵심만 추출'
```

## 전략 3: Hierarchical Context

### 계층적 구조

```
Project Level
├── Module Level
│   ├── Component Level
│   │   └── Function Level
│   └── Component Level
└── Module Level
```

### 구현 방식

```bash
# 프로젝트 레벨 컨텍스트
/load project --level high

# 모듈 레벨 집중
/load module:auth --deep

# 컴포넌트 레벨 상세
/load component:login --detailed
```

### 계층별 정보 밀도

```yaml
hierarchy_density:
  project:
    info: '아키텍처, 의존성'
    density: 'low'
    tokens: '~2K'

  module:
    info: '인터페이스, 주요 로직'
    density: 'medium'
    tokens: '~5K'

  component:
    info: '전체 구현'
    density: 'high'
    tokens: '~10K'
```

## 전략 4: Context Compression

### 압축 기법

```yaml
compression_techniques:
  summarization:
    method: '핵심 내용 추출'
    ratio: '10:1'
    quality: '85%'

  symbolization:
    method: '심볼로 대체'
    ratio: '3:1'
    quality: '95%'

  referencing:
    method: '참조 ID 사용'
    ratio: '20:1'
    quality: '90%'
```

### SuperClaude 압축 명령

```bash
# 자동 압축 모드
--uc  # Ultra Compressed

# 수동 압축 레벨
--compress-level 1  # 가벼운 압축
--compress-level 3  # 보통 압축
--compress-level 5  # 최대 압축
```

### 압축 예시

```yaml
# 원본
original: |
  이 함수는 사용자 인증을 처리합니다.
  먼저 이메일과 비밀번호를 검증하고,
  데이터베이스에서 사용자를 조회한 후,
  JWT 토큰을 생성하여 반환합니다.

# 압축됨
compressed: |
  auth fn: email/pwd → validate → db lookup → JWT
```

## 전략 5: Semantic Chunking

### 의미 단위 분할

```yaml
semantic_units:
  business_logic: '비즈니스 규칙'
  data_flow: '데이터 흐름'
  user_interface: 'UI 컴포넌트'
  infrastructure: '인프라 설정'
```

### 청크 관리

```bash
# 의미 단위로 로드
/load --semantic business_logic
/load --semantic data_flow

# 청크 조합
/load --combine "business_logic,data_flow"
```

### 청크 우선순위

```yaml
chunk_priority:
  current_task:
    relevance: '100%'
    retention: 'session'

  related_task:
    relevance: '70%'
    retention: '3 operations'

  general_context:
    relevance: '30%'
    retention: '1 operation'
```

## 전략 6: Context Caching

### 캐싱 레벨

```yaml
cache_levels:
  L1_hot:
    location: 'active memory'
    access: 'instant'
    size: '5K tokens'

  L2_warm:
    location: 'ready cache'
    access: '1 operation'
    size: '20K tokens'

  L3_cold:
    location: 'storage'
    access: 'load required'
    size: 'unlimited'
```

### 캐시 관리 명령

```bash
# 캐시 사전 로드
/cache preload "critical_files"

# 캐시 상태 확인
/cache status

# 캐시 최적화
/cache optimize
```

## 전략 7: Delta Context

### 변경사항만 추적

```yaml
delta_tracking:
  baseline: '초기 상태'
  changes: '변경사항만 기록'
  reconstruction: '필요시 재구성'
```

### 구현 예시

```bash
# 베이스라인 설정
/context baseline --save

# 델타만 작업
/work --delta-mode

# 전체 재구성
/context reconstruct
```

## 실전 시나리오

### 시나리오 1: 대규모 리팩토링

```bash
# 1. 프로젝트 구조 파악 (최소 컨텍스트)
/analyze structure --minimal

# 2. 영향 분석 (타겟 컨텍스트)
/analyze impact --focus "auth_module"

# 3. 상세 작업 (전체 컨텍스트)
/refactor --comprehensive
```

### 시나리오 2: 다중 모듈 작업

```bash
# 병렬 컨텍스트 관리
/context split --modules "auth,payment,notification"

# 각 모듈 독립 작업
/work module:auth --isolated
/work module:payment --isolated

# 통합 시점에 전체 로드
/context merge --validate
```

### 시나리오 3: 장기 프로젝트

```bash
# 세션 간 컨텍스트 유지
/context save --checkpoint daily

# 다음 세션에서 복원
/context restore --from-checkpoint

# 증분 업데이트
/context update --incremental
```

## 모니터링 및 최적화

### 컨텍스트 사용량 모니터링

```yaml
monitoring_metrics:
  token_usage:
    current: '실시간 사용량'
    average: '평균 사용량'
    peak: '최대 사용량'

  efficiency:
    hit_rate: '캐시 적중률'
    compression: '압축 효율'
    relevance: '관련성 점수'
```

### 최적화 제안

```bash
# 자동 최적화
/optimize context --auto

# 수동 최적화
/optimize context --strategy "compression"
/optimize context --strategy "caching"
```

## 고급 기법

### 1. Context Branching

```bash
# 컨텍스트 분기
/context branch "experiment"

# 실험 후 병합 또는 폐기
/context merge "experiment"
/context discard "experiment"
```

### 2. Context Templates

```yaml
templates:
  debugging:
    include: ['error_logs', 'stack_traces', 'recent_changes']
    exclude: ['documentation', 'tests']

  feature_development:
    include: ['interfaces', 'related_modules', 'tests']
    exclude: ['implementation_details', 'legacy_code']
```

### 3. Predictive Loading

```bash
# 예측 기반 사전 로드
/context predict --next-likely

# 사용 패턴 학습
/context learn --from-history
```

## 문제 해결

### 일반적인 문제

1. **컨텍스트 오버플로우**: 압축 및 우선순위 조정
2. **관련성 저하**: 시맨틱 청킹 재구성
3. **성능 저하**: 캐싱 전략 개선
4. **일관성 문제**: 델타 추적 검증

### 응급 조치

```bash
# 컨텍스트 리셋
/context reset --emergency

# 최소 모드 전환
/context minimal --force

# 백업에서 복원
/context restore --from-backup
```
