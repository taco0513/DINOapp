# 👥 팀 AI 개발 표준 학습 & 온보딩 가이드

> 새로운 팀원이 AI 협업 방식을 빠르게 익히고 생산적인 멤버가 되도록 돕는 종합 온보딩 프로그램

안녕 Claude! 우리 팀에 새로운 멤버가 합류했어! 이 가이드는 팀의 AI 개발 표준과 협업 방식을 체계적으로 학습할 수 있도록 설계된 온보딩 프로그램이야. 함께 우리만의 개발 문화를 익혀보자.

---

## 🎯 이런 상황에 사용하세요

👥 **새로운 팀원이 합류했을 때**
👥 **AI 개발 방식이 처음인 개발자를 위해**
👥 **팀의 개발 표준을 통일하고 싶을 때**
👥 **기존 팀원들도 베스트 프랙티스를 재학습하고 싶을 때**
👥 **프로젝트별 맞춤 표준을 정립하고 싶을 때**

---

## 📚 체계적 팀 표준 학습 로드맵

### Phase 1: 팀 문화 이해 (30분)

**우리 팀만의 AI 협업 철학과 방식**
```
1. @/MASTER_PLAYBOOK/03_Vibe_Coding/README.md
   - 자연어 우선 개발 방식
   - 대화형 코딩과 반복적 개선 프로세스
   - AI와의 효과적 의사소통 패턴

2. @/MASTER_PLAYBOOK/02_AI_Experts/README.md
   - AI 전문가 시스템 활용법
   - 상황별 AI 역할 분담 전략
   - 도메인별 전문가 AI 활용 가이드

3. @/MASTER_PLAYBOOK/20_Smart_Problem_Solving/README.md
   - 2분 룰의 정확한 의미와 적용법
   - 체계적 문제 해결 프로세스
   - 웹 검색과 커뮤니티 활용 전략
```

**🎯 체크포인트**: 팀 문화 이해도 확인
- Vibe Coding의 핵심 원칙 3가지와 일반 개발과의 차이점
- 2분 룰 적용 상황 5가지와 각각의 대응 방법
- AI 전문가 시스템에서 각 전문가의 역할과 활용 시나리오

### Phase 2: 개발 프로세스 습득 (45분)

**팀의 표준 개발 워크플로우**
```
4. @/MASTER_PLAYBOOK/04_BMAD_Method/README.md
   - Business-Model-API-Design 방법론
   - 단계별 개발 프로세스와 체크포인트
   - 각 단계별 산출물과 품질 기준

5. @/MASTER_PLAYBOOK/14_Project_Kickstart/README.md
   - 30분 프로토타입 제작 프로세스
   - 프로젝트 시작 템플릿과 체크리스트
   - 빠른 MVP 개발 전략

6. @/MASTER_PLAYBOOK/15_Living_Documentation/README.md
   - 코드와 동기화되는 문서 작성법
   - 팀 지식 공유 시스템
   - 자동 문서화 도구 활용법
```

**🎯 체크포인트**: 개발 프로세스 숙련도 확인
- BMAD 4단계를 순서대로 설명하고 각 단계의 목적과 산출물
- 30분 프로토타입 제작 과정과 필요한 도구들
- Living Documentation과 일반 문서의 차이점과 작성 방법

### Phase 3: 품질 및 협업 표준 (30분)

**팀의 코드 품질과 협업 규칙**
```
7. @/MASTER_PLAYBOOK/09_Testing_QA/README.md
   - AI 개발에서의 테스트 전략
   - TDD와 AI 협업 방식 통합
   - 자동화된 품질 검증 시스템

8. @/MASTER_PLAYBOOK/08_Code_Review/README.md
   - AI를 활용한 코드 리뷰 프로세스
   - 팀 리뷰 체크리스트와 표준
   - 피드백 문화와 개선 방식

9. @/MASTER_PLAYBOOK/16_Reality_Check/README.md
   - 현실적인 개발 계획 수립
   - 기술 부채 관리 전략
   - 비즈니스 요구사항과 기술적 이상의 균형
```

**🎯 체크포인트**: 품질 표준 이해도 점검
- 팀의 테스트 커버리지 목표와 테스트 작성 원칙
- AI를 활용한 코드 리뷰 체크포인트 5가지
- 기술 부채 식별 방법과 우선순위 결정 기준

---

## 🤝 팀 협업 규칙 & 문화

### 📋 핵심 개발 원칙 (Team Charter)

**1. AI 친화적 코드 작성**
```typescript
// ✅ 좋은 예시: AI가 이해하기 쉬운 명확한 코드
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

const createUserProfile = async (userData: UserData): Promise<UserProfile> => {
  // 입력 데이터 검증
  const validatedData = validateUserData(userData);

  // 사용자 프로필 생성
  const profile = await userRepository.create(validatedData);

  // 기본 설정 적용
  const profileWithDefaults = applyDefaultPreferences(profile);

  return profileWithDefaults;
};

// ❌ 나쁜 예시: AI가 이해하기 어려운 축약된 코드
const cUp = async (d) => await uRepo.cr({...d, pref: defPref});
```

**2. 2분 룰 엄격 적용**
```typescript
interface ProblemSolvingTimer {
  startTime: number;
  maxDuration: 120000; // 2분 = 120초
  searchTrigger: () => void;
}

const handleStuckSituation = () => {
  if (Date.now() - startTime > maxDuration) {
    console.log('🔍 2분 경과! 웹 검색 시작');
    openSearchQuery(generateSearchQuery(currentProblem));
  }
};

// 팀 규칙: 2분 이상 막히면 반드시 도움 요청 또는 검색
```

**3. 매일 Living Documentation 업데이트**
```markdown
## 일일 문서 업데이트 체크리스트
- [ ] 새로 작성한 함수/컴포넌트의 목적과 사용법 기록
- [ ] 변경된 API 스펙이 있다면 문서 동기화
- [ ] 발견한 버그나 해결 방법 기록
- [ ] 팀원과 공유할 만한 학습 내용 정리
- [ ] 내일 할 일과 현재 진행 상황 업데이트
```

**4. 프로토타입도 프로덕션 품질로**
```typescript
// 프로토타입 개발 시에도 지켜야 할 품질 기준
const PROTOTYPE_QUALITY_STANDARDS = {
  typeScript: true,        // 타입 안전성 필수
  errorHandling: true,     // 기본 에러 처리 구현
  testing: 'basic',        // 최소한의 단위 테스트
  documentation: 'inline', // 인라인 주석으로 최소 문서화
  security: 'basic',       // 기본 보안 검증 (입력값 체크 등)
  performance: 'aware'     // 성능 고려사항 주석으로 표시
};
```

### 🚀 협업 워크플로우

**Daily Standup with AI**
```typescript
interface DailyStandup {
  yesterday: {
    completed: string[];
    blockers: string[];
    aiCollaboration: string[]; // AI와 협업한 내용
  };
  today: {
    planned: string[];
    aiSupport: string[];      // AI 도움이 필요한 작업
  };
  impediments: string[];
}

// 예시
const todayStandup: DailyStandup = {
  yesterday: {
    completed: ["사용자 인증 API 구현"],
    blockers: ["PostgreSQL 연결 설정 이슈"],
    aiCollaboration: ["Claude와 함께 JWT 토큰 검증 로직 구현"]
  },
  today: {
    planned: ["프론트엔드 로그인 폼 구현"],
    aiSupport: ["React Hook Form 최적 사용법 학습"]
  },
  impediments: ["테스트 데이터베이스 설정 필요"]
};
```

**Code Review Process**
```typescript
interface AICodeReview {
  automated: {
    linting: boolean;
    typeCheck: boolean;
    testCoverage: number;
    aiCodeAnalysis: string; // AI가 분석한 코드 품질
  };
  human: {
    logicReview: boolean;
    businessLogicCheck: boolean;
    teamStandardCompliance: boolean;
  };
  collaborative: {
    aiSuggestions: string[];
    humanFeedback: string[];
    finalDecision: 'approve' | 'request_changes' | 'needs_discussion';
  };
}
```

---

## 🎯 실전 온보딩 과제 (Hands-on Practice)

### 📝 Level 1: 팀 스타일 학습 (30분)

**과제**: 기존 코드 분석 및 스타일 파악
```typescript
// 팀의 기존 코드를 분석해보세요
interface CodeAnalysisTask {
  step1: '프로젝트 구조 파악';        // 폴더 구성과 파일 명명 규칙
  step2: '함수 작성 패턴 분석';       // 함수 길이, 복잡도, 네이밍
  step3: '에러 처리 방식 확인';       // try-catch 패턴, 에러 타입
  step4: '테스트 코드 스타일 학습';    // 테스트 구조와 네이밍
  step5: '문서화 방식 이해';         // 주석과 README 작성 패턴
}

// 분석 결과를 다음 형식으로 정리하세요
const teamStyleAnalysis = {
  namingConventions: {
    functions: 'camelCase, verb + noun pattern',
    variables: 'descriptive names, no abbreviations',
    files: 'PascalCase for components, kebab-case for utilities'
  },
  codeStructure: {
    maxFunctionLength: '50 lines',
    preferredPatterns: ['pure functions', 'composition over inheritance'],
    avoidedPatterns: ['deep nesting', 'global state mutations']
  }
};
```

### 🔧 Level 2: 표준 도구 활용 (45분)

**과제**: 팀 표준 도구를 사용한 간단한 기능 구현
```typescript
// 1. 30분 프로토타입으로 간단한 TODO 앱 만들기
interface TodoApp {
  requirements: {
    tech: 'React + TypeScript';
    features: ['add', 'toggle', 'delete'];
    quality: 'production-ready prototype';
    documentation: 'living documentation style';
  };
  deliverables: {
    code: 'GitHub repository';
    docs: 'README with usage and architecture';
    demo: 'deployed version or video';
    reflection: 'learning notes and team standard compliance';
  };
}
```

**구현 체크리스트**:
- [ ] BMAD 방법론 적용 (B: TODO 비즈니스 로직, M: 데이터 모델, A: 상태 관리 API, D: UI 디자인)
- [ ] 2분 룰 적용한 개발 과정 기록
- [ ] Living Documentation 스타일로 문서 작성
- [ ] 기본 테스트 코드 포함
- [ ] AI 협업 과정 상세 기록

### 🚀 Level 3: 팀 프로젝트 기여 (1주)

**과제**: 실제 팀 프로젝트에 기여하기
```typescript
interface TeamContribution {
  task: 'Pick a small feature or bug fix from backlog';
  approach: {
    planning: 'Use BMAD method for task breakdown';
    development: 'Apply vibe coding with AI collaboration';
    quality: 'Follow team testing and review standards';
    documentation: 'Update living docs with changes';
  };
  mentorship: {
    buddy: 'Assigned team member for guidance';
    checkIns: 'Daily 15-min progress check';
    review: 'Pair review of PR with buddy';
  };
}
```

**성공 기준**:
- [ ] 팀 코딩 표준 준수 (lint, type check 통과)
- [ ] AI 협업 과정이 팀 표준에 부합
- [ ] 코드 리뷰에서 승인 받기
- [ ] Living Documentation 업데이트 완료
- [ ] 2분 룰 적용 사례 최소 3회 기록

---

## 💬 팀 커뮤니케이션 가이드

### 🤖 AI와의 효과적 소통 방법

**팀 표준 프롬프트 패턴**
```typescript
// 표준 작업 시작 프롬프트
const TEAM_WORK_PROMPT = `
안녕 Claude! 우리 팀의 ${PROJECT_NAME} 프로젝트에서 작업 중이야.

## 현재 작업 컨텍스트
- **기술 스택**: ${TECH_STACK}
- **작업 유형**: ${WORK_TYPE}
- **품질 요구사항**: ${QUALITY_REQUIREMENTS}

## 팀 규칙 준수 요청
1. 코드는 TypeScript로 타입 안전하게
2. 함수는 50줄 이내, 단일 책임 원칙 적용
3. 에러 처리 필수 포함
4. 테스트 가능한 구조로 작성
5. 주석으로 비즈니스 로직 설명

## 작업 요청
${SPECIFIC_TASK}

2분 룰을 적용해서 막히면 바로 알려줘!
`;
```

**팀 표준 리뷰 요청**
```typescript
const TEAM_REVIEW_PROMPT = `
이 코드를 우리 팀 표준에 맞게 리뷰해줘:

## 체크 포인트
- [ ] 코드 가독성 (변수명, 함수명, 구조)
- [ ] 타입 안전성 (any 사용, 타입 정의)
- [ ] 에러 처리 (try-catch, validation)
- [ ] 테스트 가능성 (의존성, 사이드 이펙트)
- [ ] 성능 고려사항
- [ ] 보안 이슈

개선점이 있다면 구체적인 수정 제안도 부탁해!
`;
```

### 👥 팀원 간 소통 프로토콜

**일일 AI 협업 공유**
```markdown
## 📝 Daily AI Collaboration Log

### 오늘의 AI 협업 하이라이트
- **시간**: 2024-XX-XX 14:30-15:00
- **작업**: 사용자 인증 로직 구현
- **AI 도움**: JWT 토큰 검증 최적화 방법 제안
- **결과**: 성능 20% 향상, 코드 가독성 개선
- **학습**: JWT 라이브러리 새로운 옵션 발견

### 막혔던 문제와 해결
- **문제**: PostgreSQL 연결 풀 설정 이슈
- **시도**: 공식 문서 확인 (1분), AI에게 질문 (1분)
- **해결**: Stack Overflow 검색으로 해결 (2분 룰 적용)
- **공유**: 팀 위키에 해결 방법 추가

### 내일 AI 협업 계획
- React Hook Form 최적 사용법 학습
- 성능 테스트 자동화 방법 연구
```

**코드 리뷰 템플릿**
```markdown
## Code Review Checklist

### 🤖 AI Analysis Results
- Lint Status: ✅/❌
- Type Check: ✅/❌
- AI Code Quality Score: X/10
- AI Security Scan: ✅/❌

### 👥 Human Review
- [ ] Business Logic Correctness
- [ ] Team Coding Standards Compliance
- [ ] Documentation Quality
- [ ] Test Coverage Adequacy

### 💡 Suggestions & Improvements
- [AI 제안사항]
- [Human 리뷰어 의견]

### 🎯 Action Items
- [ ] [구체적 개선 사항]
- [ ] [추가 테스트 필요 항목]
```

---

## 🎊 온보딩 완료 체크리스트

### ✅ Level 1 완료 기준: 기본 이해

- [ ] **팀 문화 이해**: Vibe Coding, 2분 룰, AI 협업 방식 설명 가능
- [ ] **개발 프로세스**: BMAD 방법론 4단계 순서대로 설명 가능
- [ ] **품질 표준**: 팀 코딩 표준과 리뷰 체크포인트 숙지
- [ ] **도구 사용**: Living Documentation 작성 방법 이해
- [ ] **의사소통**: 팀 표준 프롬프트 패턴 활용 가능

### ✅ Level 2 완료 기준: 실무 적용

- [ ] **실전 개발**: 30분 프로토타입 제작 경험
- [ ] **AI 협업**: Claude와 협업하여 실제 기능 구현 완료
- [ ] **코드 품질**: 팀 표준에 맞는 코드 작성 가능
- [ ] **문서화**: Living Documentation 스타일로 작업 내용 기록
- [ ] **문제 해결**: 2분 룰 적용한 문제 해결 경험 3회 이상

### ✅ Level 3 완료 기준: 팀 기여

- [ ] **프로젝트 기여**: 팀 프로젝트에 의미있는 기여 완료
- [ ] **코드 리뷰**: 팀 표준에 맞는 코드 리뷰 통과
- [ ] **멘토링**: 신규 팀원 온보딩 지원 가능
- [ ] **개선 제안**: 팀 프로세스 개선 아이디어 제시
- [ ] **지식 공유**: 팀 위키에 유용한 정보 기여

---

## 🚀 온보딩 시작하기

### 📞 온보딩 매니저에게 연락하세요!

**온보딩에 필요한 정보를 다음 형식으로 제공해주세요:**

```markdown
## 👥 팀 온보딩 정보

### 신규 팀원 정보
- **이름**: [신규 팀원 이름]
- **역할**: [Frontend/Backend/Fullstack/QA/DevOps]
- **경험 수준**: [Junior/Mid/Senior]
- **AI 개발 경험**: [처음/기본/숙련]

### 현재 프로젝트 상황
- **프로젝트명**: [진행 중인 주요 프로젝트]
- **기술 스택**: [주요 사용 기술들]
- **팀 규모**: [현재 팀원 수]
- **개발 단계**: [초기/개발/운영/확장]

### 온보딩 목표
- **1주차 목표**: [첫 주에 달성하고 싶은 것]
- **1개월 목표**: [한 달 후 기대하는 역할]
- **특별 요청사항**: [특별히 신경 쓸 부분]

### 팀 환경
- **코드 저장소**: [GitHub/GitLab 등]
- **협업 도구**: [Slack/Discord/Teams 등]
- **문서 시스템**: [Notion/Confluence/Wiki 등]
```

**💡 온보딩 준비 사항**
- [ ] 개발 환경 설정 완료 (IDE, Git, Node.js 등)
- [ ] 팀 협업 도구 접근 권한 확보
- [ ] 기존 프로젝트 코드 저장소 클론
- [ ] 온보딩 버디 배정 및 첫 미팅 일정 조율

**Ready for Team Onboarding?** 팀 정보를 공유해주시면 맞춤형 온보딩 프로그램을 시작해보겠습니다! 🎉

**Welcome to the Team!** 함께 멋진 제품을 만들어보자! 💪