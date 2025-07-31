# 📚 SuperClaude 명령어 완벽 레퍼런스

## 초보자를 위한 모든 명령어와 플래그 상세 설명

---

## 🎯 핵심 명령어 (Core Commands)

### 1. `/analyze` - 코드 분석하기

**목적**: 현재 코드를 분석하고 이해하기

#### 기본 사용법

```bash
/analyze                          # 전체 프로젝트 분석
/analyze @app/trips              # 특정 폴더 분석
/analyze @lib/schengen.ts        # 특정 파일 분석
```

#### 고급 옵션

```bash
# 깊이 있는 분석
/analyze --think                 # 일반 분석 (4K 토큰)
/analyze --think-hard           # 깊은 분석 (10K 토큰)
/analyze --ultrathink           # 초깊은 분석 (32K 토큰)

# 특정 관점 분석
/analyze --focus performance    # 성능 중심 분석
/analyze --focus security      # 보안 중심 분석
/analyze --focus quality       # 코드 품질 분석
/analyze --focus mobile        # 모바일 최적화 분석
```

#### 실제 사용 예시

```bash
# "이 코드가 왜 느린지 모르겠어"
/analyze @app/dashboard --focus performance --think-hard

# "보안 문제 있나 확인해줘"
/analyze --focus security --persona-security
```

---

### 2. `/implement` - 기능 구현하기

**목적**: 새로운 기능이나 컴포넌트 만들기

#### 기본 사용법

```bash
/implement "로그인 버튼"                    # 간단한 구현
/implement "사용자 프로필 페이지"           # 페이지 구현
/implement "이메일 알림 시스템"            # 시스템 구현
```

#### 타입 지정

```bash
/implement "대시보드" --type component      # React 컴포넌트
/implement "사용자 API" --type api         # API 엔드포인트
/implement "로그인 시스템" --type auth     # 인증 시스템
/implement "여행 기록" --type feature      # 전체 기능
/implement "데이터베이스" --type database  # DB 스키마
```

#### 고급 옵션

```bash
# UI 컴포넌트는 Magic 서버 사용
/implement "예쁜 버튼" --magic

# 검증과 함께 구현
/implement "결제 시스템" --validate

# 프레임워크 지정
/implement "대시보드" --framework react
```

#### 실제 사용 예시

```bash
# "다크모드 토글 버튼 만들어줘"
/implement "다크모드 토글" --type component --magic

# "회원가입 API 만들어줘"
/implement "회원가입 API" --type api --validate
```

---

### 3. `/improve` - 코드 개선하기

**목적**: 기존 코드를 더 좋게 만들기

#### 기본 사용법

```bash
/improve                           # 전체 개선
/improve @components/Header       # 특정 컴포넌트 개선
/improve --loop                   # 반복 개선 (3회)
```

#### 개선 초점

```bash
/improve --focus performance      # 성능 개선
/improve --focus security        # 보안 강화
/improve --focus quality         # 코드 품질
/improve --focus accessibility   # 접근성 개선
```

#### 반복 개선

```bash
/improve --loop                   # 기본 3회 반복
/improve --loop --iterations 5    # 5회 반복
/improve --loop --interactive     # 각 단계마다 확인
```

#### 실제 사용 예시

```bash
# "이 페이지 로딩이 너무 느려"
/improve @app/dashboard --focus performance --loop

# "코드가 너무 복잡해"
/improve @lib/calculator --focus quality
```

---

### 4. `/build` - 프로젝트 빌드하기

**목적**: 프로젝트를 빌드하고 배포 준비하기

#### 기본 사용법

```bash
/build                            # 개발 빌드
/build --type prod               # 프로덕션 빌드
/build --type test               # 테스트 빌드
```

#### 빌드 옵션

```bash
/build --clean                    # 클린 빌드
/build --optimize                # 최적화 빌드
/build --validate               # 검증과 함께 빌드
```

#### 실제 사용 예시

```bash
# "배포 준비해줘"
/build --type prod --optimize --validate

# "빌드 에러 났어"
/build --clean --verbose
```

---

### 5. `/test` - 테스트 작성하기

**목적**: 자동으로 테스트 코드 생성하기

#### 기본 사용법

```bash
/test                             # 전체 테스트 생성
/test unit                        # 단위 테스트
/test integration                # 통합 테스트
/test e2e                        # E2E 테스트
```

#### 특정 대상 테스트

```bash
/test @lib/calculator.ts          # 특정 파일 테스트
/test @components/Button          # 컴포넌트 테스트
/test "로그인 플로우"             # 시나리오 테스트
```

#### 실제 사용 예시

```bash
# "계산기 함수 테스트 만들어줘"
/test unit @lib/schengen-calculator.ts

# "사용자가 여행 추가하는 과정 테스트해줘"
/test e2e "여행 추가 플로우"
```

---

### 6. `/troubleshoot` - 문제 해결하기

**목적**: 에러나 문제를 자동으로 해결하기

#### 기본 사용법

```bash
/troubleshoot                     # 현재 에러 분석
/troubleshoot --auto-fix         # 자동 수정
/troubleshoot --explain          # 설명과 함께
```

#### 실제 사용 예시

```bash
# "TypeError가 났어"
/troubleshoot --auto-fix --explain

# "빌드가 안 돼"
/troubleshoot "빌드 실패" --think --auto-fix
```

---

## 🚀 고급 플래그 (Advanced Flags)

### 사고 깊이 플래그

#### `--think` (일반 분석)

- **용도**: 복잡한 문제 해결
- **토큰**: ~4K
- **예시**: `/analyze --think`

#### `--think-hard` (깊은 분석)

- **용도**: 시스템 전체 분석
- **토큰**: ~10K
- **예시**: `/analyze --think-hard`

#### `--ultrathink` (초깊은 분석)

- **용도**: 아키텍처 재설계
- **토큰**: ~32K
- **예시**: `/analyze --ultrathink`

### 효율성 플래그

#### `--uc` / `--ultracompressed`

- **용도**: 토큰 30-50% 절약
- **예시**: `/implement "대시보드" --uc`

#### `--answer-only`

- **용도**: 설명 없이 결과만
- **예시**: `/implement "버튼" --answer-only`

#### `--verbose`

- **용도**: 상세한 설명
- **예시**: `/analyze --verbose`

### MCP 서버 플래그

#### `--c7` / `--context7`

- **용도**: 라이브러리 문서 참조
- **자동 활성화**: 개발 작업 시
- **예시**: `/implement "React 컴포넌트" --c7`

#### `--seq` / `--sequential`

- **용도**: 복잡한 분석
- **자동 활성화**: 디버깅, --think 사용 시
- **예시**: `/analyze --seq --think`

#### `--magic`

- **용도**: UI 컴포넌트 생성
- **자동 활성화**: UI 작업 시
- **예시**: `/implement "예쁜 대시보드" --magic`

#### `--play` / `--playwright`

- **용도**: 브라우저 테스트
- **예시**: `/test e2e --play`

#### `--all-mcp`

- **용도**: 모든 서버 활성화
- **주의**: 토큰 많이 사용
- **예시**: `/analyze --all-mcp`

#### `--no-mcp`

- **용도**: MCP 서버 비활성화
- **예시**: `/implement "간단한 함수" --no-mcp`

### 반복 작업 플래그

#### `--loop`

- **용도**: 반복 개선 (기본 3회)
- **예시**: `/improve --loop`

#### `--iterations [n]`

- **용도**: 반복 횟수 지정
- **예시**: `/improve --loop --iterations 5`

#### `--interactive`

- **용도**: 각 단계 확인
- **예시**: `/improve --loop --interactive`

### 병렬 처리 플래그

#### `--delegate [type]`

- **용도**: 작업 분산
- **옵션**: `files`, `folders`, `auto`
- **예시**: `/analyze --delegate folders`

#### `--concurrency [n]`

- **용도**: 동시 작업 수
- **기본값**: 7
- **예시**: `/analyze --delegate auto --concurrency 10`

### Wave 모드 플래그

#### `--wave-mode [mode]`

- **용도**: 복잡한 작업 단계별 처리
- **옵션**: `auto`, `force`, `off`
- **예시**: `/improve --wave-mode force`

#### `--wave-strategy [strategy]`

- **용도**: Wave 전략 선택
- **옵션**:
  - `progressive`: 점진적 개선
  - `systematic`: 체계적 분석
  - `adaptive`: 동적 조정
  - `enterprise`: 대규모 작업
- **예시**: `/improve --wave-strategy systematic`

### 검증 플래그

#### `--validate`

- **용도**: 작업 전 검증
- **예시**: `/implement "결제 시스템" --validate`

#### `--safe-mode`

- **용도**: 안전 모드
- **예시**: `/improve --safe-mode`

#### `--dry-run`

- **용도**: 실행 없이 계획만
- **예시**: `/build --dry-run`

---

## 👥 페르소나 플래그

### 전문가 모드 활성화

#### `--persona-architect`

- **전문**: 시스템 설계
- **자동 활성화**: 아키텍처 작업
- **예시**: `/design "마이크로서비스" --persona-architect`

#### `--persona-frontend`

- **전문**: UI/UX
- **자동 활성화**: 컴포넌트 작업
- **예시**: `/implement "대시보드" --persona-frontend`

#### `--persona-backend`

- **전문**: 서버/API
- **자동 활성화**: API 작업
- **예시**: `/implement "API" --persona-backend`

#### `--persona-security`

- **전문**: 보안
- **자동 활성화**: 보안 검토
- **예시**: `/analyze --persona-security`

#### `--persona-performance`

- **전문**: 성능 최적화
- **자동 활성화**: 성능 이슈
- **예시**: `/improve --persona-performance`

#### `--persona-qa`

- **전문**: 품질 보증
- **자동 활성화**: 테스트 작업
- **예시**: `/test --persona-qa`

#### `--persona-analyzer`

- **전문**: 문제 분석
- **자동 활성화**: 디버깅
- **예시**: `/troubleshoot --persona-analyzer`

#### `--persona-mentor`

- **전문**: 교육/설명
- **자동 활성화**: 설명 요청
- **예시**: `/explain "React hooks" --persona-mentor`

#### `--persona-refactorer`

- **전문**: 코드 개선
- **자동 활성화**: 리팩토링
- **예시**: `/improve --persona-refactorer`

#### `--persona-devops`

- **전문**: 배포/인프라
- **자동 활성화**: 배포 작업
- **예시**: `/build --persona-devops`

#### `--persona-scribe=[lang]`

- **전문**: 문서 작성
- **언어**: en, ko, ja, zh 등
- **예시**: `/document --persona-scribe=ko`

---

## 💡 실전 사용 패턴

### 초보자 패턴

#### "버튼 만들어줘"

```bash
/implement "파란색 로그인 버튼" --magic
```

#### "에러 났어"

```bash
/troubleshoot --auto-fix --explain
```

#### "느려"

```bash
/analyze --focus performance
/improve --focus performance --auto-fix
```

#### "더 예쁘게"

```bash
/improve @components/Button --magic --loop
```

### 중급자 패턴

#### 새 기능 추가

```bash
/analyze @app --think                    # 현재 구조 파악
/implement "새 기능" --validate          # 구현
/test unit                               # 테스트
/improve --loop                          # 개선
```

#### 성능 최적화

```bash
/analyze --focus performance --think-hard
/improve --focus performance --persona-performance
/test performance
/validate
```

#### 보안 강화

```bash
/analyze --focus security --persona-security
/improve --focus security --validate
/test security
```

### 고급자 패턴

#### 대규모 리팩토링

```bash
/analyze --ultrathink --delegate folders
/improve --wave-mode force --wave-strategy systematic
/test all --comprehensive
/build --type prod --validate
```

#### 시스템 재설계

```bash
/analyze --ultrathink --persona-architect
/design "새 아키텍처" --think-hard
/implement --wave-mode force
/migrate --safe-mode
```

---

## 🎯 상황별 추천 명령어

### "처음 시작할 때"

```bash
/design "내 앱 아이디어" --think
/build "프로젝트 이름" --type new
```

### "기능 추가할 때"

```bash
/implement "기능 설명" --type feature
/test                     # 테스트 자동 생성
```

### "버그 고칠 때"

```bash
/troubleshoot --auto-fix --explain
```

### "성능 개선할 때"

```bash
/analyze --focus performance --think-hard
/improve --focus performance --loop
```

### "배포 준비할 때"

```bash
/test all
/build --type prod --optimize --validate
/deploy --check
```

### "코드 이해 안 될 때"

```bash
/explain "이 코드" --persona-mentor
```

### "전체적으로 개선하고 싶을 때"

```bash
/improve --wave-mode auto --loop
```

---

## 🔥 프로 팁

### 1. 조합의 힘

```bash
# 최강 분석 조합
/analyze --ultrathink --all-mcp --delegate folders

# 최강 구현 조합
/implement "복잡한 기능" --think-hard --validate --magic

# 최강 개선 조합
/improve --wave-mode force --loop --all-mcp
```

### 2. 토큰 절약

```bash
# 긴 작업은 압축 모드
/analyze --uc
/implement "큰 기능" --uc

# 결과만 필요할 때
/implement "간단한 것" --answer-only
```

### 3. 자동화 활용

```bash
# 반복 작업 자동화
/improve --loop --iterations 10 --auto-fix

# 병렬 처리로 속도 향상
/analyze --delegate auto --concurrency 15
```

### 4. 안전 우선

```bash
# 중요한 작업은 검증
/implement "결제" --validate --safe-mode

# 배포 전 체크
/test all --comprehensive
/build --type prod --dry-run
```

---

## 📌 빠른 참조

### 가장 많이 쓰는 명령어

```bash
/implement "기능"           # 구현
/improve                   # 개선
/troubleshoot             # 문제 해결
/test                     # 테스트
/analyze                  # 분석
```

### 가장 유용한 플래그

```bash
--think                   # 깊게 생각
--magic                   # UI 생성
--loop                    # 반복 개선
--auto-fix               # 자동 수정
--validate               # 검증
```

### 초보자 필수 조합

```bash
/implement "원하는 것" --magic
/troubleshoot --auto-fix --explain
/improve --loop
```

**이제 SuperClaude의 모든 명령어를 마스터했습니다! 🎉**
