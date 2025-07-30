# Wave System 가이드

## Wave System이란?

Wave System은 복잡한 작업을 여러 단계(wave)로 나누어 체계적으로 처리하는 SuperClaude의 핵심 오케스트레이션 엔진입니다.

## 핵심 개념

### 자동 활성화 조건

```yaml
activation_formula: |
  complexity ≥ 0.7 AND
  file_count > 20 AND
  operation_types > 2
```

### Wave의 구조

```
Wave 1: 분석 → Wave 2: 계획 → Wave 3: 구현 → Wave 4: 검증 → Wave 5: 최적화
```

## Wave 전략

### 1. Progressive (점진적 개선)

**특징**: 반복적 개선을 통한 점진적 향상

```bash
/improve --wave-mode force --wave-strategy progressive

# 사용 사례
- 성능 최적화
- UI/UX 개선
- 코드 품질 향상
```

**Wave 구성**:

1. 현재 상태 평가
2. 개선 기회 식별
3. 우선순위별 구현
4. 효과 측정
5. 추가 개선

### 2. Systematic (체계적 분석)

**특징**: 철저한 분석과 방법론적 접근

```bash
/analyze --wave-mode force --wave-strategy systematic

# 사용 사례
- 복잡한 버그 해결
- 아키텍처 검토
- 보안 감사
```

**Wave 구성**:

1. 전체 시스템 스캔
2. 문제 영역 매핑
3. 근본 원인 분석
4. 솔루션 구현
5. 통합 테스트

### 3. Adaptive (적응형 구성)

**특징**: 상황에 따라 동적으로 조정

```bash
/implement --wave-mode force --wave-strategy adaptive

# 사용 사례
- 다양한 복잡도의 작업
- 예측 불가능한 요구사항
- 탐색적 개발
```

**Wave 구성**:

1. 초기 평가
2. 전략 결정
3. 유연한 실행
4. 피드백 통합
5. 전략 재조정

### 4. Enterprise (대규모 오케스트레이션)

**특징**: 대규모 시스템을 위한 포괄적 접근

```bash
/build --wave-mode force --wave-strategy enterprise

# 사용 사례
- 100+ 파일 프로젝트
- 레거시 현대화
- 전사적 마이그레이션
```

**Wave 구성**:

1. 인프라 평가
2. 의존성 분석
3. 단계별 마이그레이션
4. 통합 검증
5. 성능 튜닝

## Wave 실행 패턴

### 기본 실행 플로우

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Wave 1    │ ──▶ │   Wave 2    │ ──▶ │   Wave 3    │
│   분석      │     │   계획      │     │   구현      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                         │
       └─────────── 피드백 루프 ─────────────────┘
```

### 병렬 Wave 실행

```
         ┌─────────────┐
         │ 조정자 Wave │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│ 품질   │  │ 보안   │  │ 성능   │
│ Wave   │  │ Wave   │  │ Wave   │
└───────┘  └───────┘  └───────┘
```

## Wave 위임 전략

### 파일 단위 위임

```bash
/improve --wave-mode force --wave-delegation files

# 각 Wave가 개별 파일을 Sub-Agent에 위임
# 효과적인 경우: 독립적인 파일 수정
```

### 폴더 단위 위임

```bash
/analyze --wave-mode force --wave-delegation folders

# 각 Wave가 디렉토리를 Sub-Agent에 위임
# 효과적인 경우: 모듈별 분석
```

### 작업 단위 위임

```bash
/build --wave-mode force --wave-delegation tasks

# 각 Wave가 특정 작업을 Sub-Agent에 위임
# 효과적인 경우: 다양한 전문성 필요
```

## Wave 검증 및 체크포인트

### 검증 모드

```bash
# 각 Wave 후 검증
/improve --wave-mode force --wave-validation

# 체크포인트 설정
/build --wave-mode force --wave-checkpoint
```

### 검증 기준

1. **구문 검사**: 코드 유효성
2. **테스트 통과**: 기존 테스트 실행
3. **성능 지표**: 개선 측정
4. **보안 스캔**: 취약점 검사
5. **통합 테스트**: 시스템 전체 검증

## 실제 사용 예시

### 예시 1: 대규모 리팩토링

```bash
/improve "전체 코드베이스 리팩토링" \
  --wave-mode force \
  --wave-strategy systematic \
  --wave-validation \
  --wave-count 5

# Wave 1: 코드 분석 및 문제 식별
# Wave 2: 리팩토링 계획 수립
# Wave 3: 핵심 모듈 리팩토링
# Wave 4: 통합 및 테스트
# Wave 5: 최적화 및 문서화
```

### 예시 2: 성능 최적화

```bash
/improve --focus performance \
  --wave-mode force \
  --wave-strategy progressive \
  --wave-delegation files

# Wave 1: 성능 병목 지점 식별
# Wave 2: 최적화 기회 분석
# Wave 3: 크리티컬 패스 최적화
# Wave 4: 효과 측정
# Wave 5: 추가 미세 조정
```

### 예시 3: 보안 감사

```bash
/analyze --focus security \
  --wave-mode force \
  --wave-strategy enterprise \
  --wave-validation

# Wave 1: 취약점 스캔
# Wave 2: 위협 모델링
# Wave 3: 보안 패치 적용
# Wave 4: 침투 테스트
# Wave 5: 컴플라이언스 검증
```

## Wave 모니터링

### 진행 상황 추적

```yaml
wave_progress:
  current_wave: 3
  total_waves: 5
  completion: 60%
  status: '구현 진행 중'
  next_milestone: '통합 테스트'
```

### 성과 지표

- **품질 개선**: 코드 복잡도 감소율
- **성능 향상**: 응답 시간 개선율
- **보안 강화**: 취약점 해결율
- **생산성**: 자동화된 작업 비율

## 모범 사례

### Do's

1. ✅ 복잡한 작업에 Wave 사용
2. ✅ 적절한 전략 선택
3. ✅ 검증 단계 포함
4. ✅ 피드백 루프 활용
5. ✅ 체크포인트 설정

### Don'ts

1. ❌ 단순 작업에 Wave 강제
2. ❌ 너무 많은 Wave 설정 (최대 7개 권장)
3. ❌ 검증 없이 진행
4. ❌ 피드백 무시
5. ❌ 병렬 처리 과용

## 문제 해결

### Wave 실패 시

1. 체크포인트로 롤백
2. 실패 원인 분석
3. 전략 재조정
4. 단계별 재실행

### 성능 이슈

1. Wave 수 조정
2. 병렬 처리 최적화
3. 위임 전략 변경
4. 리소스 할당 조정
