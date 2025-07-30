# 🚀 AI Workflow Playbook - 메인 설치 및 사용 가이드

**완전 초보자도 30분만에 AI와 함께 개발을 시작할 수 있는 완벽한 가이드**

---

## 📦 빠른 설치 방법

### 1️⃣ 프로젝트에 플레이북 복사

```bash
# 새 프로젝트 폴더에서
cp -r /path/to/AI_Workflow_Playbook/MASTER_PLAYBOOK ./

# 또는 선택적 복사 (추천)
mkdir -p docs/playbook
cp -r AI_Workflow_Playbook/MASTER_PLAYBOOK/{README.md,INDEX.md,00_Prompts,04_BMAD_Method,15_Living_Documentation} docs/playbook/
```

### 2️⃣ Claude/Cursor 학습 시키기

**📋 초기 학습 프롬프트:**

```
안녕 Claude! 이제 AI Workflow Playbook으로 체계적인 개발을 시작할 거야.

@MASTER_PLAYBOOK 폴더 안의 다음 문서들을 순서대로 읽어주세요:

📚 필수 학습 순서:
1. @MASTER_PLAYBOOK/README.md - 전체 개요와 철학 이해
2. @MASTER_PLAYBOOK/INDEX.md - 상세 구조와 네비게이션
3. @MASTER_PLAYBOOK/00_Getting_Started/README.md - 시작 가이드
4. @MASTER_PLAYBOOK/00_Prompts/README.md - 프롬프트 컬렉션

⚡ 핵심 시스템 (우선순위):
5. @MASTER_PLAYBOOK/15_Living_Documentation/README.md - 실시간 문서화 ⭐⭐
6. @MASTER_PLAYBOOK/04_BMAD_Method/README.md - 체계적 개발 방법론
7. @MASTER_PLAYBOOK/20_Smart_Problem_Solving/README.md - 2분 룰 시스템
8. @MASTER_PLAYBOOK/17_Design_System/README.md - AI 디자인 시스템

🚀 고급 기능 (선택적):
9. @MASTER_PLAYBOOK/06_SuperClaude_Framework/README.md - Claude 고급 기능
10. @MASTER_PLAYBOOK/12_Smart_Assistant/README.md - 상황별 자동 추천

모든 문서를 읽은 후 "학습 완료! 프로젝트를 시작할 준비가 되었습니다 🚀"라고 알려주세요.
```

---

## 🎯 학습 완료 후 프로젝트 시작

### 3️⃣ 프로젝트 시작 프롬프트

```
학습이 완료되었다면 이제 @MASTER_PLAYBOOK/00_Prompts/01_New_Project_Start.md 를 읽고 새 프로젝트를 시작해봅시다!

내 프로젝트 아이디어:
[여기에 구체적인 프로젝트 아이디어를 설명하세요]

다음 템플릿을 참고해서 구체화해주세요:

## 프로젝트 개요
- 앱 이름: [프로젝트 명]
- 핵심 기능: [메인 기능 1-2줄로]
- 타겟 사용자: [누가 사용할지]
- 플랫폼: [웹/모바일/데스크톱]

## 핵심 기능 (3-5개)
1. [필수 기능 1]
2. [필수 기능 2]
3. [필수 기능 3]

30분 프로토타입부터 시작해서 BMAD 방법론으로 체계적으로 개발해주세요!
```

---

## 💡 추가 설치 옵션

### 🔧 최소 설치 (핵심만)

```bash
# 핵심 파일만 복사
mkdir -p docs/{playbook,decisions,errors,patterns}
cp MASTER_PLAYBOOK/README.md docs/playbook/
cp MASTER_PLAYBOOK/00_Prompts/01_New_Project_Start.md docs/playbook/
cp MASTER_PLAYBOOK/04_BMAD_Method/01_Business_Definition.md docs/playbook/
```

### 📝 CLAUDE.md 설정 (프로젝트별 가이드)

프로젝트 루트에 `CLAUDE.md` 파일 생성:

```markdown
# CLAUDE.md

이 프로젝트는 AI Workflow Playbook 방법론을 따릅니다:

## 개발 방식

- **BMAD Method**: Business → Model → API → Design
- **Living Documentation**: 실시간 컨텍스트 보존
- **2분 룰**: 막히면 웹검색
- **30분 프로토타입**: 빠른 아이디어 검증

## 주요 명령어

- `/checkpoint` - 진행상황 체크포인트
- `/build` - 프로젝트 빌드
- `/analyze` - 코드 분석
- `/improve` - 코드 개선

상세 가이드: docs/playbook/ 폴더 참조
```

---

## 🚀 즉시 시작 (올인원 프롬프트)

**완전 초보자용 - 복사해서 바로 사용:**

```
안녕 Claude!

1단계: AI Workflow Playbook 학습
@MASTER_PLAYBOOK 폴더의 다음 문서들을 읽어주세요:
- @MASTER_PLAYBOOK/README.md (전체 개요)
- @MASTER_PLAYBOOK/INDEX.md (구조)
- @MASTER_PLAYBOOK/00_Getting_Started/README.md (시작가이드)
- @MASTER_PLAYBOOK/00_Prompts/01_New_Project_Start.md (프로젝트 시작)
- @MASTER_PLAYBOOK/04_BMAD_Method/README.md (개발방법론)
- @MASTER_PLAYBOOK/15_Living_Documentation/README.md (문서화)

2단계: 프로젝트 시작
학습 완료 후 다음 프로젝트를 시작해주세요:

[여기에 프로젝트 아이디어 입력]

BMAD 방법론으로 30분 프로토타입부터 시작해서 단계별로 개발해주세요!
```

---

## 📊 성공 지표

### ✅ 설치 완료 체크리스트

- [ ] MASTER_PLAYBOOK 폴더 복사 완료
- [ ] Claude가 핵심 문서 학습 완료
- [ ] 프로젝트 아이디어 구체화 완료
- [ ] Living Documentation 시스템 이해

### 🎯 30분 후 달성 목표

- [ ] 작동하는 프로토타입 완성
- [ ] BMAD 방법론 첫 적용
- [ ] `/checkpoint` 시스템 활용
- [ ] 다음 개발 단계 계획 수립

---

**🚀 이제 바로 시작하세요! AI와 함께하는 혁신적인 개발 경험을 만나보세요!**
