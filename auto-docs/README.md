# Auto-Docs - 자동 문서화 시스템

AI Workflow Playbook을 위한 지능형 자동 문서화 도구입니다. 파일 변경을 실시간으로 감지하고 자동으로 문서를 생성/업데이트합니다.

## ✨ 주요 기능

### 📝 핵심 자동화 기능
- 🔍 **실시간 파일 변경 감지**: chokidar 기반 파일 시스템 모니터링
- 📚 **자동 문서 생성**: README, CHANGELOG, PROGRESS, API 문서 자동 생성
- 🎯 **SuperClaude 연동**: /checkpoint 명령어와 완벽 연동
- 📋 **누락 문서 탐지**: 필요한 문서들을 자동으로 발견하고 알림

### 🔍 **NEW! 문서 품질 리뷰 시스템**
- 🏥 **기본 품질 검사**: 맞춤법, 문법, 마크다운 문법, 링크 유효성 검사
- 🧠 **AI 기반 스마트 리뷰**: Context7, Sequential MCP 서버 활용
- 📊 **품질 점수 및 등급**: 100점 만점 점수와 A~D 등급 시스템
- 🎯 **맞춤형 개선 제안**: 파일별 구체적인 개선 방안 제공
- 📈 **일관성 검사**: 프로젝트명, 버전, API 문서 동기화 확인

### 🛠️ 추가 기능
- 🌐 **다국어 지원**: 한국어/영어 템플릿 제공
- ⚙️ **유연한 설정**: YAML 기반 사용자 정의 설정
- 🔄 **Git 연동**: 자동 커밋 및 변경 사항 추적

## 🚀 빠른 시작

### 1. 설치

```bash
cd /path/to/your/project
npm install

# 또는 전역 설치
npm install -g .
```

### 2. 초기화

```bash
# 프로젝트 디렉토리에서
auto-docs init

# 또는 특정 경로 지정
auto-docs init --path /path/to/project
```

### 3. 모니터링 시작

```bash
# 파일 변경 모니터링 시작
auto-docs watch

# 백그라운드 실행
nohup auto-docs watch &
```

## 📋 사용법

### 기본 명령어

```bash
# 도움말
auto-docs --help

# 시스템 상태 확인
auto-docs status

# 문서 즉시 생성
auto-docs generate

# 누락된 문서만 생성
auto-docs generate --missing

# 특정 문서만 생성
auto-docs generate --readme --changelog

# 🔍 NEW! 문서 품질 리뷰
auto-docs review                    # 전체 품질 검사
auto-docs review --summary         # 요약만 출력
auto-docs review --ai              # AI 기반 심화 리뷰 포함
```

### 설정 관리

```bash
# 현재 설정 확인
auto-docs config --show

# 대화형 설정
auto-docs config
```

## ⚙️ 설정 파일 (.auto-docs.yml)

```yaml
watch:
  paths: ['**/*']
  ignore:
    - 'node_modules/**'
    - '.git/**'
    - '*.log'
  debounceMs: 1000

docs:
  autoGenerate: true
  templates:
    readme: true
    api: true
    changelog: true
    progress: true
  outputFormats: ['md']
  language: 'ko'

git:
  autoCommit: false
  commitPrefix: '📝 docs:'

notifications:
  enabled: true
  missingDocs: true
  changes: true
```

## 🔗 SuperClaude 연동

### /checkpoint 명령어와 자동 연동

```bash
# SuperClaude에서 체크포인트 생성 시 자동으로:
# 1. checkpoints/ 폴더 모니터링
# 2. PROGRESS.md 자동 업데이트
# 3. CHANGELOG.md에 변경 사항 추가
# 4. README.md 최근 변경 사항 업데이트
```

### 연동 기능

- ✅ **체크포인트 파일 분석**: 스프린트 목표, 완료 작업, 진행 상황 자동 추출
- ✅ **Git 상태 동기화**: 커밋되지 않은 변경 사항 자동 추적
- ✅ **메트릭스 수집**: 파일 수, 코드 라인, 테스트 커버리지 등
- ✅ **MCP 서버 연동**: Context7, Sequential 등과 협력

## 📊 생성되는 문서들

### 1. README.md (자동 생성/업데이트)
- 프로젝트 개요 및 설명
- 빠른 시작 가이드
- 프로젝트 구조
- 기술 스택 분석
- 최근 변경 사항

### 2. CHANGELOG.md
- 시간순 변경 기록
- 파일별 변경 사항 추적
- Git 상태 기반 업데이트
- 체크포인트 연동

### 3. PROGRESS.md
- 프로젝트 진행 상황
- 스프린트 목표 및 달성도
- 완료/진행/예정 작업 관리
- 이슈 및 블로커 추적

### 4. docs/missing-docs-report.md
- 누락된 문서 목록
- 자동 생성 제안
- 프로젝트 구조 분석 결과

## 🎯 고급 기능

### 1. 스마트 변수 시스템
- package.json 자동 분석
- 프로젝트 구조 자동 감지
- 기술 스택 자동 추론
- 기존 문서에서 정보 추출

### 2. 템플릿 시스템
- 한국어/영어 다국어 지원
- 프로젝트 타입별 맞춤 템플릿
- 사용자 정의 템플릿 지원
- 동적 변수 치환

### 3. 누락 문서 탐지
- 프로젝트 구조 분석
- 필수 문서 확인
- 폴더별 README 검사
- 자동 생성 제안

## 🔧 개발자 가이드

### 프로젝트 구조

```
auto-docs/
├── index.js              # 메인 시스템
├── cli.js                # CLI 인터페이스
├── templates.js          # 문서 템플릿 시스템
├── superclaud-integration.js  # SuperClaude 연동
├── package.json          # 패키지 설정
└── README.md            # 이 파일
```

### 확장 방법

1. **새로운 템플릿 추가**:
   ```javascript
   // templates.js에서
   getMyCustomTemplate() {
     return `# {{title}}\n{{content}}`;
   }
   ```

2. **새로운 파일 타입 지원**:
   ```javascript
   // index.js에서 handleFileChange 메서드 확장
   ```

3. **외부 도구 연동**:
   ```javascript
   // superclaud-integration.js 참고
   ```

## 🚨 문제 해결

### 자주 발생하는 문제

1. **파일 감시가 작동하지 않음**
   ```bash
   # 권한 확인
   ls -la .auto-docs.yml

   # 설정 파일 재생성
   auto-docs init
   ```

2. **문서가 생성되지 않음**
   ```bash
   # 상태 확인
   auto-docs status

   # 수동 생성 시도
   auto-docs generate --readme
   ```

3. **Git 자동 커밋 실패**
   ```bash
   # Git 설정 확인
   git config --list

   # 설정에서 autoCommit 비활성화
   ```

## 📈 성능 최적화

- **디바운싱**: 파일 변경 이벤트를 1초 간격으로 그룹핑
- **선택적 모니터링**: ignore 패턴으로 불필요한 파일 제외
- **캐싱**: 반복적인 분석 결과 캐시
- **병렬 처리**: 여러 문서 동시 생성

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성
3. 변경 사항 커밋
4. Pull Request 생성

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.

---

*이 문서는 Auto-Docs 시스템에 의해 관리되며, AI Workflow Playbook의 일부입니다.*