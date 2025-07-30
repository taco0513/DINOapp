# SuperClaude 코어 아키텍처

## 개요

SuperClaude는 Claude Code의 모든 고급 기능을 통합한 지능형 개발 프레임워크입니다.

## 핵심 구성 요소

### 1. Wave System (웨이브 시스템)

- **정의**: 복잡한 작업을 여러 단계로 나누어 처리하는 멀티스테이지 실행 엔진
- **자동 활성화**: 복잡도 ≥0.7 + 파일 >20개 + 작업 유형 >2개

```yaml
wave-strategies:
  progressive: '점진적 개선'
  systematic: '체계적 분석'
  adaptive: '동적 구성'
  enterprise: '대규모 오케스트레이션'
```

### 2. Persona System (페르소나 시스템)

11개의 전문 AI 성격:

- **architect**: 시스템 설계 전문가
- **frontend**: UI/UX 전문가
- **backend**: 서버/인프라 전문가
- **security**: 보안 전문가
- **performance**: 성능 최적화 전문가
- **analyzer**: 근본 원인 분석가
- **qa**: 품질 보증 전문가
- **refactorer**: 코드 품질 전문가
- **devops**: 인프라 자동화 전문가
- **mentor**: 교육 전문가
- **scribe**: 문서화 전문가

### 3. MCP Integration (MCP 서버 통합)

- **Context7**: 라이브러리 문서 (항상 활성)
- **Sequential**: 복잡한 분석
- **Magic**: UI 컴포넌트 생성
- **Playwright**: E2E 테스팅

### 4. Command System (명령 시스템)

- **/analyze**: 다차원 코드 분석
- **/build**: 프로젝트 빌더
- **/implement**: 기능 구현
- **/improve**: 코드 개선
- **/test**: 테스트 워크플로우

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                  User Interface                      │
│              (Commands & Natural Language)           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Orchestrator (라우팅 엔진)              │
│  • Pattern Recognition • Intent Extraction          │
│  • Complexity Assessment • Resource Management      │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┬──────────┬──────────┐
         │                       │          │          │
┌────────▼──────┐     ┌─────────▼─────┐ ┌─▼──────────▼─┐
│ Wave System   │     │ Persona System│ │ MCP Servers  │
│ • Multi-stage │     │ • 11 Experts  │ │ • Context7   │
│ • Progressive │     │ • Auto-detect │ │ • Sequential │
│ • Validation  │     │ • Specialized │ │ • Magic      │
└───────────────┘     └───────────────┘ └──────────────┘
                              │
┌─────────────────────────────▼───────────────────────┐
│                   Tool Layer                        │
│  Read • Write • Edit • Grep • Bash • TodoWrite    │
└─────────────────────────────────────────────────────┘
```

## 핵심 워크플로우

### 1. 요청 분석

```
사용자 입력 → 패턴 인식 → 의도 추출 → 복잡도 평가
```

### 2. 라우팅 결정

```
복잡도 평가 → 페르소나 선택 → MCP 서버 활성화 → 도구 조합
```

### 3. 실행 전략

```
단일 작업: 직접 실행
복잡 작업: Wave 모드 활성화
대규모 작업: 병렬 처리 + Wave
```

### 4. 품질 검증

```
8단계 검증 사이클:
1. 구문 검사
2. 타입 검사
3. 린트 검사
4. 보안 검사
5. 테스트 실행
6. 성능 검사
7. 문서 검사
8. 통합 검사
```

## 성능 최적화

### 토큰 관리

- **Green Zone (0-60%)**: 전체 기능 활성화
- **Yellow Zone (60-75%)**: 리소스 최적화, --uc 모드 제안
- **Orange Zone (75-85%)**: 경고, 비필수 작업 연기
- **Red Zone (85-95%)**: 효율성 모드 강제
- **Critical Zone (95%+)**: 필수 작업만 수행

### 병렬 처리

- 독립적 작업 동시 실행
- 컨텍스트 공유를 통한 효율성
- 성공 패턴 캐싱

## 확장성

### 커스텀 명령 추가

```yaml
custom_command:
  name: '/mycmd'
  category: 'custom'
  persona: ['architect', 'frontend']
  mcp: ['context7', 'magic']
  wave_eligible: true
```

### 플러그인 시스템

- 커스텀 페르소나 추가
- 새로운 MCP 서버 통합
- 도구 확장

## 모범 사례

1. **복잡한 작업에는 Wave 모드 사용**
2. **도메인별 페르소나 활용**
3. **MCP 서버로 외부 지식 확보**
4. **품질 게이트 준수**
5. **반복 작업에는 --loop 플래그**
