# 🔄 버전 관리 가이드

AI Workflow Playbook의 체계적인 버전 관리 방법을 안내합니다.

## 🎯 버전 관리 개요

### 목표

- **일관성**: 모든 변경사항의 체계적 기록
- **추적성**: 언제, 무엇이, 왜 변경되었는지 명확한 기록
- **자동화**: 수동 작업 최소화, 실수 방지
- **협업**: 여러 기여자의 원활한 협업 지원

### 핵심 파일

- `VERSION.md`: 현재 버전 및 로드맵
- `CHANGELOG.md`: 상세한 변경 이력
- `scripts/version-manager.sh`: 자동 버전 업데이트 도구
- `.github/BRANCHING_STRATEGY.md`: 브랜치 전략

## 🚀 빠른 시작

### 1. 일반적인 개발 워크플로우

```bash
# 1. 새 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/add-new-template

# 2. 개발 작업 수행
# ... 파일 수정, 추가 ...

# 3. 변경사항 커밋
git add .
git commit -m "✨ feat(resources): 새로운 프로젝트 템플릿 추가

- React + TypeScript + Tailwind 템플릿
- API 연동 예제 포함
- 배포 설정 자동화"

# 4. 푸시 및 PR 생성
git push origin feature/add-new-template
# GitHub에서 PR 생성: develop ← feature/add-new-template
```

### 2. 버전 릴리즈

```bash
# 1. 릴리즈 브랜치 생성
git checkout develop
git checkout -b release/v2.2.0

# 2. 자동 버전 업데이트
./scripts/version-manager.sh minor "새로운 템플릿과 자동화 기능 추가"

# 3. main 브랜치에 병합
git checkout main
git merge release/v2.2.0
git push origin main --tags

# 4. develop에도 동기화
git checkout develop
git merge release/v2.2.0
git push origin develop
```

## 🛠️ 도구 사용법

### version-manager.sh 상세 사용법

```bash
# 기본 사용법
./scripts/version-manager.sh [타입] "변경사항 설명"

# 예시들
./scripts/version-manager.sh patch "문서 링크 수정"
./scripts/version-manager.sh minor "새로운 가이드 섹션 추가"
./scripts/version-manager.sh major "전체 구조 재편 및 호환성 변경"
```

#### 버전 타입별 가이드

**PATCH (x.x.1)**

- 버그 수정
- 오타 수정
- 링크 업데이트
- 작은 개선사항

```bash
./scripts/version-manager.sh patch "설치 가이드 링크 수정"
```

**MINOR (x.1.0)**

- 새로운 섹션 추가
- 기능 확장
- 템플릿 추가
- 기존 호환성 유지

```bash
./scripts/version-manager.sh minor "AI 디버깅 가이드 섹션 추가"
```

**MAJOR (1.0.0)**

- 전체 구조 변경
- 기존 호환성 깨짐
- 새로운 방법론 도입

```bash
./scripts/version-manager.sh major "BMAD Method 2.0 도입 및 구조 재편"
```

## 📋 커밋 메시지 가이드

### 형식

```
<타입>(<범위>): <제목>

<본문 - 선택사항>

<푸터 - 선택사항>
```

### 타입별 예시

#### ✨ feat (새로운 기능)

```
✨ feat(automation): 자동 문서 검증 시스템 추가

Claude Code와 연동하여 문서 품질을 실시간으로 검증하는
시스템을 구축했습니다.

- 맞춤법 및 문법 검사
- 링크 유효성 검증
- 구조 일관성 확인
- 자동 개선 제안
```

#### 🐛 fix (버그 수정)

```
🐛 fix(docs): 설치 가이드 명령어 오류 수정

macOS에서 권한 문제로 설치가 실패하는 이슈를 해결했습니다.

Fixes #123
```

#### 📝 docs (문서 업데이트)

```
📝 docs(readme): 빠른 시작 가이드 개선

사용자 피드백을 반영하여 첫 실행까지의 단계를
5개에서 3개로 단순화했습니다.
```

#### ♻️ refactor (리팩토링)

```
♻️ refactor(structure): 리소스 섹션 구조 개선

- 99_Resources → 21_Resources 이동
- 접근성 향상을 위한 위치 조정
- 중복 제거 및 내용 통합
```

## 🏷️ 태그 관리

### 태그 생성 규칙

- 형식: `v{MAJOR}.{MINOR}.{PATCH}`
- 예시: `v2.1.0`, `v2.1.1`, `v3.0.0`

### 태그 관련 명령어

```bash
# 모든 태그 확인
git tag -l

# 특정 버전으로 체크아웃
git checkout v2.1.0

# 태그 푸시 (자동으로 수행됨)
git push origin --tags

# 태그 삭제 (신중하게!)
git tag -d v2.1.0
git push origin :refs/tags/v2.1.0
```

## 🔄 자동화 시스템

### 현재 자동화된 작업

- ✅ 버전 번호 자동 증가
- ✅ CHANGELOG.md 자동 업데이트
- ✅ Git 태그 자동 생성
- ✅ 커밋 메시지 표준화
- ✅ ROADMAP_TRACKER.md 연동

### 계획된 자동화

- 🔄 GitHub Actions 연동
- 🔄 자동 릴리즈 노트 생성
- 🔄 문서 품질 자동 검증
- 🔄 링크 유효성 자동 검사

## 📊 품질 관리

### 브랜치 보호 규칙

```yaml
main:
  - PR 필수
  - 리뷰 1명 이상
  - CI 통과 필수
  - 직접 푸시 금지

develop:
  - PR 필수
  - 자동 테스트 통과
  - 충돌 해결 완료
```

### 코드 리뷰 체크리스트

- [ ] 변경사항이 명확하고 필요한가?
- [ ] 문서가 정확하고 이해하기 쉬운가?
- [ ] 기존 구조와 일관성이 있는가?
- [ ] 링크가 모두 작동하는가?
- [ ] 오타나 문법 오류가 없는가?

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. 버전 스크립트 권한 오류

```bash
# 해결방법
chmod +x scripts/version-manager.sh
```

#### 2. Git 태그 충돌

```bash
# 기존 태그 삭제 후 재생성
git tag -d v2.1.0
git push origin :refs/tags/v2.1.0
./scripts/version-manager.sh patch "버그 수정"
```

#### 3. 브랜치 동기화 실패

```bash
# develop 브랜치 강제 동기화
git checkout develop
git reset --hard origin/develop
git pull origin develop
```

### 긴급 복구 프로세스

```bash
# 1. 문제 상황 백업
git stash
git checkout -b emergency-backup

# 2. 안정 버전으로 롤백
git checkout main
git checkout -b hotfix/urgent-fix

# 3. 수정 후 긴급 배포
# ... 수정 작업 ...
./scripts/version-manager.sh patch "긴급 수정: [문제 설명]"
```

## 📈 성능 모니터링

### 추적 지표

- **릴리즈 주기**: 평균 2주
- **버그 수정 시간**: 평균 24시간
- **문서 업데이트**: 실시간
- **커뮤니티 기여**: 월 10+ PR

### 품질 지표

- **문서 정확도**: 95% 이상
- **링크 유효성**: 99% 이상
- **사용자 만족도**: 4.5/5.0 이상
- **학습 완료율**: 80% 이상

## 🎯 베스트 프랙티스

### DO (권장사항)

- ✅ 작은 단위로 자주 커밋
- ✅ 의미있는 커밋 메시지 작성
- ✅ 브랜치명에 목적 명시
- ✅ PR에 상세한 설명 포함
- ✅ 리뷰 피드백 적극 반영

### DON'T (비권장사항)

- ❌ main 브랜치에 직접 푸시
- ❌ 의미없는 커밋 메시지
- ❌ 거대한 단일 커밋
- ❌ 테스트 없는 변경
- ❌ 문서 업데이트 누락

## 📞 도움이 필요할 때

### 문의 채널

- **GitHub Issues**: 버그 리포트, 기능 요청
- **Discord**: 실시간 질문, 토론
- **이메일**: 민감한 문제, 보안 이슈

### 자주 묻는 질문

**Q: 버전 번호를 잘못 매겼어요**
A: `git tag -d` 명령어로 태그를 삭제하고 다시 생성하세요.

**Q: 여러 명이 동시에 작업할 때 충돌을 피하려면?**
A: 서로 다른 섹션에서 작업하고, 자주 동기화하세요.

**Q: 긴급 수정이 필요한데 어떻게 하나요?**
A: hotfix 브랜치를 사용하여 빠른 수정과 배포를 진행하세요.

---

**체계적인 버전 관리로 더 나은 AI Workflow Playbook을 만들어갑시다!** 🚀
