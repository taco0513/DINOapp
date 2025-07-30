# SuperClaude 명령어 레퍼런스

## 개발 명령어

### /build

**용도**: 프로젝트 빌더 (프레임워크 자동 감지)

```bash
# 기본 사용
/build my-app

# 프레임워크 지정
/build my-app --framework nextjs

# Wave 모드로 대규모 빌드
/build enterprise-app --wave-mode force

# 타입 지정
/build component --type ui --magic
```

**자동 활성화**:

- 페르소나: Frontend, Backend, Architect
- MCP: Magic (UI), Context7 (패턴)
- 패키지 매니저: Bun 우선 (30x 빠름)

### /implement

**용도**: 기능 및 코드 구현

```bash
# 기본 구현
/implement "사용자 인증 시스템"

# 타입별 구현
/implement "결제 API" --type api
/implement "대시보드" --type component
/implement "캐싱 시스템" --type service

# 프레임워크 지정
/implement "React 컴포넌트" --framework react --magic
```

**구현 타입**:

- `component`: UI 컴포넌트
- `api`: API 엔드포인트
- `service`: 백엔드 서비스
- `feature`: 전체 기능
- `auth`: 인증/인가
- `database`: DB 스키마

### /analyze

**용도**: 다차원 코드 및 시스템 분석

```bash
# 기본 분석
/analyze

# 사고 깊이 조절
/analyze --think              # 4K 토큰
/analyze --think-hard         # 10K 토큰
/analyze --ultrathink         # 32K 토큰

# 포커스 영역
/analyze --focus performance
/analyze --focus security
/analyze --focus architecture

# 대규모 코드베이스
/analyze --delegate folders --concurrency 10
```

**분석 레벨**:

- `--think`: 모듈 수준 분석
- `--think-hard`: 시스템 전체 분석
- `--ultrathink`: 아키텍처 재설계 수준

### /improve

**용도**: 증거 기반 코드 개선

```bash
# 기본 개선
/improve

# 반복 개선
/improve --loop                # 3회 기본
/improve --loop --iterations 5 # 5회 반복

# 포커스 영역
/improve --focus performance
/improve --focus security
/improve --quality

# Wave 모드로 대규모 개선
/improve --wave-mode force --wave-strategy systematic
```

**개선 전략**:

- `performance`: 성능 최적화
- `security`: 보안 강화
- `quality`: 코드 품질
- `accessibility`: 접근성

## 분석 명령어

### /troubleshoot

**용도**: 문제 조사 및 해결

```bash
# 자동 수정
/troubleshoot --auto-fix

# 상세 설명
/troubleshoot --explain

# 복잡한 이슈
/troubleshoot --think --seq
```

### /explain

**용도**: 교육적 설명

```bash
# 기본 설명
/explain "React hooks"

# 상세 설명
/explain "시스템 아키텍처" --detailed

# 초보자용
/explain "Git 기초" --beginner
```

### /estimate

**용도**: 증거 기반 추정

```bash
# 작업 추정
/estimate "새 기능 구현"

# 아키텍처 복잡도 포함
/estimate --include-architecture

# 리스크 분석 포함
/estimate --with-risks
```

## 품질 명령어

### /test

**용도**: 테스트 워크플로우

```bash
# 단위 테스트
/test unit

# 통합 테스트
/test integration

# E2E 테스트
/test e2e --play

# 전체 테스트
/test all --coverage
```

### /cleanup

**용도**: 프로젝트 정리 및 기술 부채 감소

```bash
# 기본 정리
/cleanup

# 사용하지 않는 코드 제거
/cleanup --remove-unused

# 의존성 정리
/cleanup --deps
```

### /document

**용도**: 문서 생성

```bash
# 기본 문서
/document

# API 문서
/document --type api

# 사용자 가이드
/document --type user-guide

# 다국어 지원
/document --persona-scribe=ko
```

## 워크플로우 명령어

### /git

**용도**: Git 워크플로우 지원

```bash
# 커밋 메시지 생성
/git commit

# PR 생성
/git pr

# 브랜치 전략
/git flow
```

### /task

**용도**: 장기 프로젝트 관리

```bash
# 새 작업 생성
/task "새 기능 개발"

# 에픽 생성
/task epic "대규모 리팩토링"

# 진행 상황 확인
/task status
```

### /spawn

**용도**: 작업 오케스트레이션

```bash
# 병렬 실행
/spawn parallel "테스트, 빌드, 린트"

# 순차 실행
/spawn sequence "분석 → 수정 → 테스트"

# 복잡한 워크플로우
/spawn workflow "CI/CD 파이프라인"
```

## 플래그 참조

### 사고 플래그

- `--think`: 멀티파일 분석 (~4K 토큰)
- `--think-hard`: 심층 아키텍처 분석 (~10K 토큰)
- `--ultrathink`: 중요 시스템 재설계 (~32K 토큰)

### 압축 플래그

- `--uc`: 30-50% 토큰 감소
- `--answer-only`: 작업 생성 없이 직접 응답
- `--verbose`: 최대 상세 설명

### MCP 서버 플래그

- `--c7`: Context7 활성화 (기본 활성)
- `--seq`: Sequential 활성화
- `--magic`: Magic UI 활성화
- `--play`: Playwright 활성화
- `--all-mcp`: 모든 서버 활성화
- `--no-mcp`: MCP 비활성화

### Wave 플래그

- `--wave-mode [auto|force|off]`: Wave 제어
- `--wave-strategy [progressive|systematic|adaptive|enterprise]`: 전략 선택
- `--wave-delegation [files|folders|tasks]`: 위임 방식

### 기타 플래그

- `--safe-mode`: 최대 검증, 보수적 실행
- `--validate`: 사전 검증 및 리스크 평가
- `--loop`: 반복 개선 모드
- `--interactive`: 단계별 사용자 확인
- `--delegate`: 하위 에이전트 위임
- `--concurrency [n]`: 동시 실행 수 (1-15)

## 자동 활성화 규칙

### 복잡도 기반

- 복잡도 ≥0.7 → Wave 모드 고려
- 파일 >20개 → 병렬 처리 고려
- 작업 유형 >2개 → 멀티 도메인 처리

### 도메인 기반

- UI 작업 → Frontend 페르소나 + Magic
- API 작업 → Backend 페르소나 + Context7
- 보안 작업 → Security 페르소나 + Sequential
- 성능 작업 → Performance 페르소나 + Playwright

### 상황 기반

- 리소스 사용 >75% → --uc 자동 활성화
- 프로덕션 환경 → --safe-mode 제안
- 대규모 리팩토링 → Wave 모드 제안
