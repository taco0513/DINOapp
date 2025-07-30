# 토큰 최적화 가이드

## 토큰 효율성의 중요성

SuperClaude에서 토큰 관리는 성능과 비용 효율성의 핵심입니다. 이 가이드는 30-50% 토큰 절감을 목표로 합니다.

## 토큰 사용 영역

### 리소스 관리 임계값

```yaml
resource_zones:
  green:
    range: '0-60%'
    action: '전체 기능 활성화'
    monitoring: '예측 모니터링'

  yellow:
    range: '60-75%'
    action: '리소스 최적화'
    features: '캐싱, --uc 제안'

  orange:
    range: '75-85%'
    action: '경고 알림'
    features: '비필수 작업 연기'

  red:
    range: '85-95%'
    action: '효율성 모드 강제'
    features: '필수 작업만'

  critical:
    range: '95%+'
    action: '긴급 프로토콜'
    features: '최소 기능만'
```

## 압축 전략

### 1. 심볼 시스템

**핵심 논리 및 흐름**:

```yaml
core_symbols:
  '→': 'leads to, implies'
  '⇒': 'transforms to'
  '←': 'rollback, reverse'
  '⇄': 'bidirectional'
  '&': 'and, combine'
  '|': 'or, separator'
  ':': 'define, specify'
  '»': 'sequence, then'
  '∴': 'therefore'
  '∵': 'because'
```

**상태 및 진행**:

```yaml
status_symbols:
  '✅': 'completed'
  '❌': 'failed'
  '⚠️': 'warning'
  '🔄': 'in progress'
  '⏳': 'pending'
  '🚨': 'critical'
  '🎯': 'target'
  '📊': 'metrics'
```

### 2. 약어 시스템

**시스템 및 아키텍처**:

```yaml
abbreviations:
  cfg: 'configuration'
  impl: 'implementation'
  arch: 'architecture'
  perf: 'performance'
  ops: 'operations'
  env: 'environment'
```

**개발 프로세스**:

```yaml
process_abbr:
  req: 'requirements'
  deps: 'dependencies'
  val: 'validation'
  test: 'testing'
  docs: 'documentation'
  std: 'standards'
```

### 3. 구조적 최적화

```yaml
structural_optimization:
  # 기존 (장황한 방식)
  traditional: |
    The system architecture consists of three main layers:
    1. Presentation Layer: Handles user interface
    2. Business Logic Layer: Processes business rules
    3. Data Access Layer: Manages database operations

  # 최적화된 방식
  optimized: |
    arch: 3-layer
    - UI: presentation
    - BL: business rules
    - DAL: db ops
```

## 적응형 압축 레벨

### Level 1: Minimal (0-40%)

```yaml
characteristics:
  - '전체 설명 유지'
  - '페르소나별 명확성'
  - '초보자 친화적'

example:
  normal: '사용자 인증 시스템을 구현하고 테스트를 작성했습니다'
  compressed: '사용자 인증 구현 & 테스트 작성 완료'
```

### Level 2: Efficient (40-70%)

```yaml
characteristics:
  - '균형잡힌 압축'
  - '도메인 인식 약어'
  - '구조 유지'

example:
  normal: '성능 최적화를 위해 데이터베이스 쿼리를 개선했습니다'
  compressed: 'perf opt: db query 개선'
```

### Level 3: Compressed (70-85%)

```yaml
characteristics:
  - '공격적 최적화'
  - '품질 게이트 유지'
  - '전문가 수준'

example:
  normal: '아키텍처 분석 결과 마이크로서비스로 전환 필요'
  compressed: 'arch → μsvc 전환 req'
```

### Level 4: Critical (85-95%)

```yaml
characteristics:
  - '최대 압축'
  - '필수 정보만'
  - '컨텍스트 의존'

example:
  normal: '보안 취약점 발견, 즉시 패치 필요'
  compressed: '🚨 sec vuln → patch now'
```

### Level 5: Emergency (95%+)

```yaml
characteristics:
  - '초압축'
  - '정보 검증'
  - '위기 모드'

example:
  normal: '시스템 전체 장애, 롤백 진행'
  compressed: '❌ sys → ←rollback'
```

## 페르소나별 최적화

### Architect Persona

```yaml
optimization_strategy:
  focus: '구조적 명확성'
  symbols: '→, ⇒, arch, impl'
  compression: 'moderate'

example:
  normal: '시스템 아키텍처를 마이크로서비스로 전환하여 확장성 개선'
  optimized: 'sys arch → μsvc ⇒ scalability+'
```

### Frontend Persona

```yaml
optimization_strategy:
  focus: 'UI/UX 용어'
  symbols: '🎨, 📱, perf'
  compression: 'visual'

example:
  normal: '반응형 디자인으로 모바일 최적화 구현'
  optimized: '📱 responsive → mobile opt ✅'
```

### Security Persona

```yaml
optimization_strategy:
  focus: '위협 및 대응'
  symbols: '🛡️, 🚨, sec'
  compression: 'critical info'

example:
  normal: 'SQL 인젝션 취약점 발견 및 수정 완료'
  optimized: '🛡️ SQLi vuln → patched ✅'
```

## MCP 서버 최적화

### Context7 캐싱

```yaml
caching_strategy:
  first_lookup: '5K tokens'
  cached_lookup: '500 tokens'
  savings: '90%'

implementation:
  - '세션별 캐시'
  - '버전 인식'
  - '토픽 기반 인덱싱'
```

### Sequential 결과 재사용

```yaml
reuse_patterns:
  analysis_cache: '분석 결과 저장'
  pattern_library: '패턴 라이브러리'
  decision_trees: '의사결정 트리'

savings: '40-60% on repeated analysis'
```

## 실전 최적화 기법

### 1. 배치 처리

```bash
# 비효율적 (개별 요청)
/analyze file1.js
/analyze file2.js
/analyze file3.js

# 효율적 (배치)
/analyze "*.js" --batch
```

### 2. 선택적 상세도

```bash
# 전체 분석 (높은 토큰)
/analyze --verbose

# 요약만 (낮은 토큰)
/analyze --summary-only

# 특정 영역만
/analyze --focus security
```

### 3. 캐싱 활용

```bash
# 첫 실행 (캐시 구축)
/build app --cache-results

# 재실행 (캐시 사용)
/build app --use-cache
```

### 4. 스마트 위임

```bash
# 병렬 처리로 토큰 분산
/analyze --delegate folders --aggregate-summary
```

## 토큰 모니터링

### 실시간 추적

```yaml
monitoring_metrics:
  current_usage: '실시간 사용량'
  projection: '예상 사용량'
  efficiency: '압축 효율'
  savings: '절감된 토큰'
```

### 알림 설정

```yaml
alerts:
  warning: '75% 도달 시'
  critical: '90% 도달 시'
  optimization: '개선 기회 발견'
```

## 최적화 체크리스트

### 사전 최적화

- [ ] 작업 범위 명확히 정의
- [ ] 필요한 상세도 결정
- [ ] 캐싱 가능 영역 식별
- [ ] 배치 처리 기회 확인

### 실행 중 최적화

- [ ] 압축 모드 활성화
- [ ] 불필요한 출력 제거
- [ ] 캐시 적극 활용
- [ ] 병렬 처리 극대화

### 사후 최적화

- [ ] 토큰 사용 분석
- [ ] 개선 기회 문서화
- [ ] 캐시 업데이트
- [ ] 패턴 라이브러리 확장

## 고급 기법

### 1. 컨텍스트 압축

```yaml
context_compression:
  before: |
    파일: src/components/Button.jsx
    라인: 45-67
    함수: handleClick
    문제: 성능 이슈

  after: |
    Button.jsx:45-67 handleClick() perf issue
```

### 2. 결과 집계

```yaml
result_aggregation:
  individual: '파일별 상세 분석'
  aggregated: '카테고리별 요약'
  savings: '70% 토큰 절감'
```

### 3. 점진적 로딩

```yaml
progressive_loading:
  initial: '핵심 정보만'
  on_demand: '필요시 상세 로드'
  benefit: '초기 토큰 80% 절감'
```

## 문제 해결

### 과도한 압축

- **증상**: 정보 손실, 오해 발생
- **해결**: 압축 레벨 조정, 중요 정보 보존

### 캐시 미스

- **증상**: 반복적인 높은 토큰 사용
- **해결**: 캐시 키 최적화, TTL 조정

### 품질 저하

- **증상**: 부정확한 결과
- **해결**: 품질 게이트 강화, 선택적 상세도
