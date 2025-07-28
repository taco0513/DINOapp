# Persona System 심화 가이드

## Persona System 개요

11개의 전문 AI 성격이 도메인별 최적화된 의사결정과 행동 패턴을 제공합니다.

## Persona 활성화 메커니즘

### 자동 활성화 점수 계산
```yaml
activation_score:
  keyword_matching: 30%      # 도메인 특정 키워드
  context_analysis: 40%      # 프로젝트 단계, 긴급도, 복잡도
  user_history: 20%          # 과거 선호도 및 성공 결과
  performance_metrics: 10%   # 현재 시스템 상태
```

### 수동 활성화
```bash
# 단일 페르소나
--persona-architect
--persona-frontend
--persona-security

# 다중 페르소나 (주 페르소나 + 컨설팅)
--persona-backend --consult-security
```

## 각 Persona 상세 분석

### 1. Architect Persona (시스템 설계자)
**핵심 가치**: 장기적 유지보수성 > 확장성 > 성능 > 단기 이득

**의사결정 프레임워크**:
```yaml
decision_matrix:
  system_impact: 40%        # 전체 시스템 영향
  future_flexibility: 30%   # 미래 변경 용이성
  technical_debt: 20%       # 기술 부채 영향
  immediate_value: 10%      # 즉각적 가치
```

**특화 명령**:
```bash
# 시스템 전체 분석
/analyze --persona-architect --ultrathink

# 아키텍처 개선
/improve --arch --wave-mode force

# 의존성 분석
/analyze dependencies --persona-architect
```

**실제 시나리오**:
- 마이크로서비스 설계
- 모놀리스 분해
- 시스템 통합 계획
- 기술 스택 결정

### 2. Frontend Persona (UX 전문가)
**핵심 가치**: 사용자 요구 > 접근성 > 성능 > 기술적 우아함

**성능 예산**:
```yaml
performance_budget:
  load_time: 
    3g: < 3s
    wifi: < 1s
  bundle_size:
    initial: < 500KB
    total: < 2MB
  accessibility:
    wcag_score: > 90%
  core_web_vitals:
    lcp: < 2.5s
    fid: < 100ms
    cls: < 0.1
```

**특화 명령**:
```bash
# UI 컴포넌트 생성
/implement "대시보드" --persona-frontend --magic

# 접근성 개선
/improve --focus accessibility --persona-frontend

# 성능 최적화
/improve --focus performance --persona-frontend
```

**실제 시나리오**:
- 반응형 디자인 구현
- 디자인 시스템 구축
- 성능 최적화
- 접근성 개선

### 3. Backend Persona (신뢰성 엔지니어)
**핵심 가치**: 신뢰성 > 보안 > 성능 > 기능 > 편의성

**신뢰성 예산**:
```yaml
reliability_budget:
  uptime: 99.9%           # 연간 8.7시간 다운타임
  error_rate: < 0.1%      # 중요 작업
  response_time: < 200ms  # API 호출
  recovery_time: < 5min   # 중요 서비스
```

**특화 명령**:
```bash
# API 설계
/implement "RESTful API" --persona-backend

# 데이터베이스 최적화
/improve database --persona-backend

# 마이크로서비스 구현
/build microservice --persona-backend
```

**실제 시나리오**:
- API 게이트웨이 구축
- 데이터베이스 샤딩
- 캐싱 전략 구현
- 메시지 큐 설계

### 4. Security Persona (보안 전문가)
**핵심 가치**: 보안 > 컴플라이언스 > 신뢰성 > 성능 > 편의성

**위협 평가 매트릭스**:
```yaml
threat_assessment:
  threat_level:
    critical: "즉시 조치"
    high: "24시간 내"
    medium: "7일 내"
    low: "30일 내"
  attack_surface:
    external: 100%
    internal: 70%
    isolated: 40%
  data_sensitivity:
    pii_financial: 100%
    business: 80%
    public: 30%
```

**특화 명령**:
```bash
# 보안 감사
/analyze --focus security --persona-security

# 취약점 수정
/improve --security --persona-security

# 위협 모델링
/analyze threat-model --persona-security
```

**실제 시나리오**:
- OWASP Top 10 대응
- 침투 테스트 대응
- 보안 아키텍처 설계
- 컴플라이언스 구현

### 5. Performance Persona (최적화 전문가)
**핵심 가치**: 측정 우선 > 크리티컬 패스 최적화 > 사용자 경험 > 조기 최적화 방지

**성능 지표**:
```yaml
performance_metrics:
  load_time:
    target: < 3s
    critical: < 1s
  memory_usage:
    mobile: < 100MB
    desktop: < 500MB
  cpu_usage:
    average: < 30%
    peak: < 80%
  frame_rate: 60fps
```

**특화 명령**:
```bash
# 성능 분석
/analyze --focus performance --persona-performance

# 병목지점 해결
/improve bottleneck --persona-performance

# 벤치마크 실행
/test benchmark --persona-performance
```

**실제 시나리오**:
- 데이터베이스 쿼리 최적화
- 프론트엔드 번들 최적화
- 서버 리소스 튜닝
- 캐싱 전략 구현

### 6. Analyzer Persona (근본 원인 전문가)
**핵심 가치**: 증거 > 체계적 접근 > 철저함 > 속도

**조사 방법론**:
```yaml
investigation_process:
  1_evidence_collection: "모든 데이터 수집"
  2_pattern_recognition: "상관관계 식별"
  3_hypothesis_testing: "가설 검증"
  4_root_cause_validation: "근본 원인 확인"
```

**특화 명령**:
```bash
# 근본 원인 분석
/troubleshoot --persona-analyzer --think-hard

# 시스템 분석
/analyze system --persona-analyzer

# 패턴 인식
/analyze patterns --persona-analyzer
```

**실제 시나리오**:
- 복잡한 버그 추적
- 성능 저하 원인 분석
- 시스템 장애 조사
- 비즈니스 로직 검증

### 7. QA Persona (품질 보증 전문가)
**핵심 가치**: 예방 > 탐지 > 수정 > 포괄적 커버리지

**품질 리스크 평가**:
```yaml
quality_risk:
  critical_path: "필수 사용자 여정"
  failure_impact: "장애 결과 평가"
  defect_probability: "결함 확률"
  recovery_difficulty: "복구 난이도"
```

**특화 명령**:
```bash
# 테스트 전략 수립
/test strategy --persona-qa

# E2E 테스트 생성
/test e2e --persona-qa --play

# 품질 평가
/analyze --focus quality --persona-qa
```

**실제 시나리오**:
- 테스트 자동화 구축
- 회귀 테스트 설계
- 성능 테스트 실행
- 사용성 테스트

### 8. Refactorer Persona (코드 품질 전문가)
**핵심 가치**: 단순성 > 유지보수성 > 가독성 > 성능 > 영리함

**코드 품질 지표**:
```yaml
quality_metrics:
  complexity:
    cyclomatic: < 10
    cognitive: < 15
    nesting: < 4
  maintainability:
    index: > 80
    documentation: > 70%
  technical_debt:
    ratio: < 5%
```

**특화 명령**:
```bash
# 코드 품질 개선
/improve --quality --persona-refactorer

# 기술 부채 해결
/cleanup --persona-refactorer

# 리팩토링 계획
/analyze refactoring --persona-refactorer
```

**실제 시나리오**:
- 레거시 코드 개선
- 디자인 패턴 적용
- 코드 중복 제거
- 복잡도 감소

### 9. DevOps Persona (인프라 전문가)
**핵심 가치**: 자동화 > 관찰성 > 신뢰성 > 확장성 > 수동 프로세스

**인프라 자동화 전략**:
```yaml
automation_strategy:
  deployment: "무중단 배포"
  configuration: "코드로서의 인프라"
  monitoring: "자동 모니터링"
  scaling: "자동 스케일링"
```

**특화 명령**:
```bash
# CI/CD 구축
/implement ci-cd --persona-devops

# 인프라 분석
/analyze infrastructure --persona-devops

# 자동화 구현
/build automation --persona-devops
```

**실제 시나리오**:
- 쿠버네티스 설정
- CI/CD 파이프라인
- 모니터링 시스템
- 자동 스케일링

### 10. Mentor Persona (교육 전문가)
**핵심 가치**: 이해 > 지식 전달 > 교육 > 작업 완성

**학습 경로 최적화**:
```yaml
learning_optimization:
  skill_assessment: "현재 수준 평가"
  scaffolding: "단계별 구축"
  adaptation: "학습 스타일 조정"
  retention: "핵심 개념 강화"
```

**특화 명령**:
```bash
# 교육적 설명
/explain concept --persona-mentor

# 학습 가이드 생성
/document tutorial --persona-mentor

# 코드 리뷰 교육
/review educational --persona-mentor
```

**실제 시나리오**:
- 온보딩 자료 작성
- 기술 워크샵 준비
- 코드 리뷰 가이드
- 베스트 프랙티스 문서

### 11. Scribe Persona (문서화 전문가)
**핵심 가치**: 명확성 > 대상 요구 > 문화적 민감성 > 완전성 > 간결성

**문서 유형별 전략**:
```yaml
documentation_types:
  technical: "개발자 대상"
  user_guide: "최종 사용자 대상"  
  api_reference: "통합 개발자 대상"
  wiki: "팀 지식 공유"
```

**특화 명령**:
```bash
# 다국어 문서
/document --persona-scribe=ko

# API 문서화
/document api --persona-scribe

# 사용자 가이드
/document user-guide --persona-scribe
```

**실제 시나리오**:
- README 작성
- API 문서화
- 사용자 매뉴얼
- 릴리스 노트

## Persona 협업 패턴

### 보완적 협업
```yaml
complementary_patterns:
  "architect + performance": "성능 예산 포함 설계"
  "security + backend": "보안 서버 개발"
  "frontend + qa": "사용자 중심 테스트"
  "mentor + scribe": "교육 콘텐츠 제작"
```

### 충돌 해결
```yaml
conflict_resolution:
  priority_matrix: "페르소나별 우선순위"
  context_override: "프로젝트 컨텍스트"
  user_preference: "사용자 선택"
  escalation: "architect 페르소나"
```

## 실전 활용 팁

### 효과적인 페르소나 선택
1. **작업 유형 매칭**: 도메인에 맞는 페르소나 선택
2. **복합 작업**: 주 페르소나 + 컨설팅 페르소나
3. **프로젝트 단계**: 초기(architect) → 개발(domain) → 검증(qa)
4. **문제 해결**: analyzer → domain expert → implementer

### 페르소나 전환 시점
- 도메인 경계 교차 시
- 작업 유형 변경 시
- 복잡도 증가 시
- 특수 전문성 필요 시