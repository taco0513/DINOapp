# 🤖 Auto-Docs 자동 문서화 시스템

**완전 자동화된 파일 변경 추적 및 문서 생성 시스템**

## 🎯 문제 해결

**기존 문제점**:

- ❌ 새 파일을 만들거나 수정할 때마다 일일이 문서 확인
- ❌ 누락된 문서들을 수동으로 찾아야 함
- ❌ SuperClaude /checkpoint와 문서 동기화 번거로움
- ❌ 프로젝트 변경 사항 추적의 어려움

**Auto-Docs 해결책**:

- ✅ **실시간 파일 변경 감지**: 모든 파일 변경사항을 자동 추적
- ✅ **자동 문서 생성**: README, CHANGELOG, PROGRESS 자동 생성/업데이트
- ✅ **SuperClaude 완벽 연동**: /checkpoint 명령어와 실시간 동기화
- ✅ **누락 문서 자동 탐지**: 필요한 문서를 자동으로 발견하고 알림
- 🔍 **NEW! 문서 품질 리뷰**: 맞춤법, 문법, 링크, 일관성 자동 검사
- 🧠 **AI 기반 스마트 분석**: Context7/Sequential 활용한 지능형 개선 제안

## 🚀 초고속 설치 (30초)

```bash
# 1. AI Workflow Playbook 디렉토리에서
./install-auto-docs.sh

# 2. 다른 프로젝트에 설치하려면
./install-auto-docs.sh /path/to/your/project

# 3. 전역 설치 (한 번만)
./install-auto-docs.sh --global
```

## 💡 핵심 기능

### 1. 실시간 파일 모니터링

- **감지 대상**: `.js`, `.ts`, `.jsx`, `.tsx`, `.md`, `.json`, `.yml` 등
- **실시간 추적**: 추가/수정/삭제/이름변경 모든 변경사항
- **지능형 필터링**: `node_modules`, `.git` 등 불필요한 파일 자동 제외

### 2. 자동 문서 생성

- **README.md**: 프로젝트 구조, 기술스택, 사용법 자동 생성
- **CHANGELOG.md**: 모든 파일 변경사항을 시간순으로 기록
- **PROGRESS.md**: 프로젝트 진행상황, 할일, 이슈 관리
- **API 문서**: 코드 분석을 통한 API 문서 자동 생성 (개발 중)

### 3. SuperClaude 완벽 연동

- **/checkpoint 자동 연동**: 체크포인트 생성 시 문서 자동 업데이트
- **Git 상태 동기화**: 커밋되지 않은 변경사항 자동 추적
- **MCP 서버 협력**: Context7, Sequential 등과 연동된 스마트 문서화

### 4. 누락 문서 탐지

- **필수 문서 확인**: README, package.json 등 기본 문서 검사
- **폴더별 문서**: 각 디렉토리의 README 존재 여부 확인
- **자동 생성 제안**: 누락된 문서의 자동 생성 방법 제공

## 📋 사용법

### 기본 사용법

```bash
# 파일 변경 모니터링 시작 (메인 기능)
auto-docs watch

# 백그라운드 실행
nohup auto-docs watch &

# 상태 확인
auto-docs status

# 수동 문서 생성
auto-docs generate

# 누락 문서만 생성
auto-docs generate --missing
```

### SuperClaude와 함께 사용

```bash
# SuperClaude에서 일반적인 워크플로우
/checkpoint "기능 구현 완료"

# Auto-Docs가 자동으로:
# 1. checkpoints/ 폴더 변경 감지
# 2. PROGRESS.md 체크포인트 내용으로 업데이트
# 3. CHANGELOG.md에 변경사항 추가
# 4. README.md 최신 정보 반영
```

## ⚙️ 설정 (.auto-docs.yml)

```yaml
watch:
  paths: ['**/*.js', '**/*.ts', '**/*.md'] # 모니터링할 파일 패턴
  ignore: ['node_modules/**', '.git/**'] # 제외할 패턴
  debounceMs: 1000 # 변경 감지 지연시간

docs:
  autoGenerate: true # 자동 생성 활성화
  language: 'ko' # 문서 언어 (ko/en)
  templates:
    readme: true # README 자동 생성
    changelog: true # CHANGELOG 자동 생성
    progress: true # PROGRESS 자동 생성

git:
  autoCommit: false # Git 자동 커밋 (선택사항)
  commitPrefix: '📝 docs:' # 커밋 메시지 접두사

notifications:
  enabled: true # 알림 활성화
  missingDocs: true # 누락 문서 알림
  changes: true # 변경사항 알림

superClaude:
  enabled: true # SuperClaude 연동
  checkpointIntegration: true # /checkpoint 연동
```

## 📊 실제 사용 예시

### 시나리오 1: 새 React 컴포넌트 추가

```bash
# 1. 새 컴포넌트 파일 생성
touch src/components/UserProfile.jsx

# 2. Auto-Docs가 자동으로:
#    - 파일 생성 감지
#    - CHANGELOG.md 업데이트: "➕ src/components/UserProfile.jsx (added)"
#    - README.md 프로젝트 구조 업데이트
#    - 컴포넌트 문서 생성 제안
```

### 시나리오 2: SuperClaude /checkpoint 사용

```bash
# SuperClaude에서
/checkpoint "사용자 인증 기능 완료" --completed "JWT 토큰 구현, 로그인/로그아웃 API"

# Auto-Docs가 자동으로:
# 1. checkpoints/checkpoint-날짜.md 파일 감지
# 2. 체크포인트 내용 분석:
#    - 완료된 작업: JWT 토큰 구현, 로그인/로그아웃 API
#    - 스프린트 목표 추출
# 3. PROGRESS.md 업데이트:
#    - ✅ 완료된 작업에 추가
#    - 📊 프로젝트 메트릭스 업데이트
# 4. CHANGELOG.md에 기록
# 5. README.md 최근 변경사항 반영
```

### 시나리오 3: 대규모 리팩토링

```bash
# 여러 파일을 한 번에 수정
# Auto-Docs가 변경사항을 1초 간격으로 그룹핑하여:
#
# CHANGELOG.md 업데이트:
# ## 2025-07-30 15:30:00
# - ✏️ src/utils/auth.js (modified)
# - ✏️ src/components/Login.jsx (modified)
# - ➕ src/hooks/useAuth.js (added)
# - 🗑️ src/legacy/oldAuth.js (deleted)

# 누락 문서 탐지:
# ⚠️ 누락된 문서 발견: src/hooks/README.md
# 📋 누락 문서 리포트 생성: docs/missing-docs-report.md
```

## 🔄 워크플로우 최적화

### 개발 시작 시

```bash
# 1. Auto-Docs 모니터링 시작
nohup auto-docs watch &

# 2. 일반적인 개발 작업 수행
# 3. SuperClaude /checkpoint로 진행상황 기록
# 4. 모든 문서가 자동으로 최신 상태 유지
```

### 프로젝트 리뷰 시

```bash
# 현재 상태 확인
auto-docs status

# 누락된 문서 확인
auto-docs generate --missing

# 자동 생성된 문서들 검토:
# - README.md (프로젝트 개요)
# - PROGRESS.md (진행 상황)
# - CHANGELOG.md (변경 이력)
# - docs/missing-docs-report.md (누락 문서)
```

## 🎛️ 고급 기능

### 1. 스마트 변수 시스템

- **package.json 분석**: 프로젝트명, 설명, 기술스택 자동 추출
- **Git 분석**: 커밋 히스토리, 브랜치 정보 활용
- **코드 분석**: 함수, 클래스, API 엔드포인트 자동 감지

### 2. 다국어 템플릿

- **한국어**: 자연스러운 한국어 문서 생성
- **영어**: 국제 표준 문서 형식
- **사용자 정의**: 템플릿 커스터마이징 가능

### 3. 외부 도구 연동

- **Git**: 커밋 메시지, 브랜치 정보 활용
- **npm/yarn**: 패키지 정보, 스크립트 분석
- **TypeScript**: 타입 정보 기반 API 문서
- **Jest**: 테스트 커버리지 정보

## 🚨 문제 해결

### 자주 묻는 질문

**Q: 파일 변경이 감지되지 않아요**

```bash
# 1. 권한 확인
ls -la .auto-docs.yml

# 2. 프로세스 확인
ps aux | grep auto-docs

# 3. 재시작
pkill -f auto-docs
auto-docs watch
```

**Q: 문서가 생성되지 않아요**

```bash
# 1. 상태 확인
auto-docs status

# 2. 수동 생성 시도
auto-docs generate --readme

# 3. 로그 확인
cat auto-docs/logs/auto-docs.log
```

**Q: SuperClaude 연동이 안 돼요**

```bash
# 1. checkpoints 폴더 확인
ls -la checkpoints/

# 2. 설정 확인
auto-docs config --show

# 3. 재초기화
auto-docs init
```

## 🔧 개발자 가이드

### 커스텀 템플릿 만들기

```javascript
// templates.js 확장
getMyCustomTemplate() {
  return `# {{projectName}} Custom Doc

{{description}}

## Custom Section
{{customContent}}
`;
}
```

### 새로운 파일 타입 지원

```javascript
// index.js의 handleFileChange 확장
if (filePath.endsWith('.py')) {
  // Python 파일 특별 처리
  await this.generatePythonDocs(filePath);
}
```

## 📈 성능 및 최적화

- **디바운싱**: 1초 간격으로 변경사항 그룹핑하여 성능 최적화
- **선택적 모니터링**: ignore 패턴으로 불필요한 파일 제외
- **캐싱**: 반복 분석 결과 캐시하여 속도 향상
- **병렬 처리**: 여러 문서 동시 생성

## 🤝 기여 및 확장

1. **버그 리포트**: GitHub Issues 활용
2. **기능 제안**: 새로운 템플릿, 연동 도구 제안
3. **템플릿 기여**: 새로운 언어, 프레임워크 템플릿
4. **플러그인 개발**: 외부 도구 연동 플러그인

---

**Auto-Docs는 AI Workflow Playbook의 핵심 도구로, 개발자의 문서화 부담을 완전히 제거하고 프로젝트 관리를 자동화합니다.**

🎉 **이제 코딩에만 집중하고, 문서화는 Auto-Docs에게 맡기세요!**
