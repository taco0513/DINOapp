# 🔄 프로젝트 리셋 vs 재구축 의사결정

안녕 Claude! 심각하게 꼬인 프로젝트를 어떻게 할지 결정해보자.

## 📚 필수 학습
- @/MASTER_PLAYBOOK/14_Project_Kickstart/README.md - 처음부터 제대로 시작하는 법
- @/MASTER_PLAYBOOK/04_BMAD_Method/README.md - 체계적 재설계
- @/MASTER_PLAYBOOK/20_Smart_Problem_Solving/README.md - 2분 룰

## 🔍 현재 프로젝트 분석 (30분)

### 1. 프로젝트 파악
```bash
# 전체 구조 스캔
find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | head -20
ls -la
cat package.json
cat README.md (있다면)
```

### 2. 핵심 질문에 답하기
**프로젝트 정보:**
- 원래 목적이 뭐였어?
- 핵심 기능은 뭐야?
- 어떤 기술 스택 사용했어?
- 데이터베이스는 뭐 썼어?

**현재 상태:**
- 뭐가 작동해? (%)
- 뭐가 안 돼? (%)
- 코드 품질은? (1-10점)
- 구조는 이해 가능해? (1-10점)

## 🎯 의사결정 매트릭스

### 🔴 처음부터 다시 만들기 (권장하는 경우)
- [ ] 코드 품질 점수 < 4점
- [ ] 핵심 기능 작동률 < 30%
- [ ] 기술 스택이 구식이거나 부적절
- [ ] 요구사항이 크게 변경됨
- [ ] 리팩토링 시간 > 재개발 시간

**→ 결정: 처음부터 다시! Go to Option A**

### 🟡 기존 코드 살리기 (권장하는 경우)
- [ ] 코드 품질 점수 ≥ 4점
- [ ] 핵심 기능 작동률 ≥ 30%
- [ ] 데이터/비즈니스 로직이 복잡하고 검증됨
- [ ] 기존 사용자/데이터가 있음
- [ ] 부분적 문제만 있음

**→ 결정: 구조하기! Go to Option B**

---

## 🚀 Option A: 처음부터 다시 시작하기

### Step 1: 기존 프로젝트에서 배우기 (1시간)
```bash
# 재사용 가능한 것들 추출
mkdir ../new-project-assets
cp -r ./src/assets ../new-project-assets/  # 이미지, 아이콘 등
cp ./src/api/*.js ../new-project-assets/   # 검증된 API 로직
cp ./.env.example ../new-project-assets/   # 환경 변수 참고
```

### Step 2: 핵심 기능 재정의
**BMAD 방식으로 재설계:**
1. **Business**: 진짜 해결하려는 문제가 뭐야?
2. **Model**: 필요한 데이터 구조는?
3. **API**: 어떤 기능이 필요해?
4. **Design**: 사용자 경험은?

### Step 3: 30분 프로토타입 만들기
```bash
# 새 프로젝트 생성
cd ..
npx create-next-app@latest my-app-v2 --typescript --tailwind --app

# 또는 Vite로 더 빠르게
npm create vite@latest my-app-v2 -- --template react-ts

cd my-app-v2

# 핵심 기능 1개만 구현
# 14_Project_Kickstart 방식으로 진행!
```

### Step 4: 점진적 기능 이전
```
Day 1: 핵심 기능 1개 (프로토타입)
Day 2-3: 주요 기능 3-4개 (베타)
Week 1: 전체 기능 이전 (프로덕션)
```

---

## 🛠️ Option B: 기존 프로젝트 구조하기

### Step 1: 안전한 리팩토링 전략
```bash
# 브랜치 전략
git checkout -b rescue-operation
git checkout -b backup-original

# 단계별 정리
1. 의존성 정리 → 2. 폴더 구조 정리 → 3. 코드 정리
```

### Step 2: 핵심 보존 & 나머지 정리
```javascript
// 1. 핵심 기능 격리
src/
  core/          // 작동하는 핵심 기능만
  legacy/        // 나머지 (일단 보관)
  new/           // 새로 작성할 부분

// 2. 점진적 마이그레이션
legacy/ → refactor → test → core/
```

### Step 3: 구조 개선 로드맵
**Week 1**: 
- 의존성 정리
- 환경 설정 표준화
- 핵심 기능 안정화

**Week 2**:
- 코드 구조 개선
- 테스트 추가
- 문서화

---

## 💡 스마트한 하이브리드 접근법

### 🌟 추천: "핵심만 새로, 나머지는 재활용"

1. **새 프로젝트 생성** (깨끗한 시작)
2. **핵심 비즈니스 로직만 복사** (검증된 것만)
3. **UI는 처음부터** (최신 디자인 시스템)
4. **데이터는 마이그레이션** (기존 데이터 보존)

```bash
# 실행 계획
1. 새 프로젝트 생성 (30분)
2. 기존 프로젝트 분석 & 핵심 추출 (2시간)
3. 핵심 기능 재구현 (1일)
4. 나머지 기능 점진적 추가 (1주)
```

## 🎯 의사결정 시간!

다음 정보를 알려줘:
1. **프로젝트 이름과 목적**
2. **현재 작동률** (대략 몇 %)
3. **투자한 시간** (대략)
4. **마감일** (있다면)

이 정보로 최적의 접근법을 추천해줄게!

**Remember**: 
- 🎯 "깨끗한 재시작이 때로는 최선이다"
- 💡 "기존 코드에서 배운 교훈을 새 프로젝트에 적용하자"
- ⚡ "2분 룰로 빠르게 결정하고 실행하자"