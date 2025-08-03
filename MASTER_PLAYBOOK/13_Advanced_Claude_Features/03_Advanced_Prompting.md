# 고급 프롬프팅 기법

## 개요

Claude의 잠재력을 최대한 활용하기 위한 고급 프롬프팅 전략과 기법들입니다. 복잡한 추론, 창의적 문제 해결, 정교한 코드 생성을 위한 프롬프트 엔지니어링 방법론을 다룹니다.

## 체인 오브 씽킹 (Chain of Thought)

### 다단계 추론 프롬프팅

```typescript
// 복잡한 문제 해결을 위한 단계별 접근
interface ChainOfThoughtPrompt {
  problem: ProblemDefinition;
  steps: ThinkingStep[];
  constraints: Constraint[];
  expectedOutput: OutputSpecification;
}

class AdvancedPromptingEngine {
  // 체인 오브 씽킹 프롬프트 생성
  async createChainOfThoughtPrompt(
    problem: ComplexProblem
  ): Promise<StructuredPrompt> {

    const prompt = `
    문제를 해결하기 위해 다음 단계를 따라주세요:

    1. 문제 분석 및 분해
       - 핵심 요구사항 식별
       - 제약 조건 명확화
       - 예상되는 어려움 파악

    2. 해결 전략 수립
       - 가능한 접근 방법 나열
       - 각 방법의 장단점 분석
       - 최적 접근법 선택 및 근거

    3. 단계별 구현 계획
       - 구체적인 실행 단계 정의
       - 각 단계의 검증 방법
       - 예상 결과 및 대안

    4. 실제 구현
       - 코드 작성 또는 해결책 제시
       - 중간 검증 포인트
       - 오류 처리 전략

    5. 결과 검증
       - 요구사항 충족 여부 확인
       - 성능 및 품질 평가
       - 개선 가능 영역 식별

    문제: ${problem.description}
    제약사항: ${problem.constraints.join(', ')}
    기대 결과: ${problem.expectedOutcome}
    `;

    return {
      prompt,
      structure: 'chain-of-thought',
      estimatedTokens: this.estimateTokenUsage(prompt),
      validationCriteria: await this.defineValidationCriteria(problem)
    };
  }

  // 재귀적 추론 프롬프트
  async createRecursiveReasoningPrompt(
    problem: ComplexProblem,
    depth: number = 3
  ): Promise<RecursivePrompt> {

    const baseCase = await this.identifyBaseCase(problem);
    const recursivePattern = await this.identifyRecursivePattern(problem);

    const prompt = `
    이 문제를 재귀적으로 접근해주세요:

    기본 사례 (Base Case):
    ${baseCase.description}
    ${baseCase.solution}

    재귀 패턴:
    1. 문제를 더 작은 하위 문제로 분해
    2. 각 하위 문제에 동일한 접근법 적용
    3. 결과를 종합하여 전체 해결책 구성

    구체적 적용:
    ${this.generateRecursiveSteps(problem, recursivePattern, depth)}

    각 단계에서 다음을 명확히 해주세요:
    - 현재 문제의 범위
    - 하위 문제로의 분해 방법
    - 결과 통합 전략
    `;

    return {
      prompt,
      baseCase,
      recursivePattern,
      maxDepth: depth,
      terminationCondition: this.defineTerminationCondition(problem)
    };
  }
}
```

### 멀티모달 추론 최적화

```typescript
// 코드와 시각적 표현을 결합한 추론
class MultiModalReasoningPrompts {
  // 다이어그램 기반 시스템 설계
  async createDiagramBasedPrompt(
    systemRequirements: SystemRequirements
  ): Promise<DiagramPrompt> {

    const prompt = `
    다음 시스템을 설계하고 구현해주세요:

    1. 아키텍처 다이어그램 (Mermaid)
       - 주요 컴포넌트 식별
       - 컴포넌트 간 상호작용
       - 데이터 흐름

    2. 시퀀스 다이어그램
       - 핵심 사용 사례별 흐름
       - 에러 처리 시나리오
       - 비동기 작업 처리

    3. 코드 구현
       - 인터페이스 정의
       - 핵심 클래스 구현
       - 통합 테스트

    \`\`\`mermaid
    graph TB
      subgraph "System Architecture"
        A[Client] --> B[API Gateway]
        B --> C[Service Layer]
        C --> D[Data Layer]
      end
    \`\`\`

    요구사항:
    ${systemRequirements.functional.map(req => `- ${req}`).join('\n')}

    비기능적 요구사항:
    ${systemRequirements.nonFunctional.map(req => `- ${req}`).join('\n')}
    `;

    return {
      prompt,
      expectedDiagrams: ['architecture', 'sequence', 'class'],
      codeStructure: await this.suggestCodeStructure(systemRequirements)
    };
  }

  // 코드 진화 시각화
  async createCodeEvolutionPrompt(
    codeBase: CodeBase,
    evolutionGoals: EvolutionGoal[]
  ): Promise<EvolutionPrompt> {

    const currentState = await this.analyzeCurrentCode(codeBase);
    const targetState = await this.defineTargetState(evolutionGoals);

    const prompt = `
    현재 코드를 목표 상태로 진화시켜주세요:

    현재 상태:
    \`\`\`${currentState.language}
    ${currentState.code}
    \`\`\`

    진화 목표:
    ${evolutionGoals.map((goal, i) => `
    ${i + 1}. ${goal.description}
       - 현재: ${goal.currentMetric}
       - 목표: ${goal.targetMetric}
       - 전략: ${goal.suggestedApproach}
    `).join('\n')}

    단계별 진화 경로:
    1. 리팩토링 준비
       - 테스트 커버리지 확보
       - 의존성 분석
       - 영향 범위 평가

    2. 점진적 개선
       - 각 목표별 개선 단계
       - 중간 검증 포인트
       - 롤백 전략

    3. 최종 최적화
       - 성능 튜닝
       - 코드 정리
       - 문서화

    각 단계에서 before/after 비교와 개선 이유를 명확히 설명해주세요.
    `;

    return {
      prompt,
      currentState,
      targetState,
      evolutionPath: await this.planEvolutionPath(currentState, targetState),
      validationMetrics: this.defineValidationMetrics(evolutionGoals)
    };
  }
}
```

## 컨텍스트 증강 기법

### 동적 컨텍스트 주입

```typescript
// 실시간 컨텍스트 증강 시스템
class ContextAugmentationEngine {
  private contextStore: ContextStore;
  private relevanceCalculator: RelevanceCalculator;

  // 적응형 컨텍스트 프롬프트
  async createAdaptiveContextPrompt(
    task: DevelopmentTask,
    availableContext: AvailableContext
  ): Promise<AugmentedPrompt> {

    // 작업 관련성에 따른 컨텍스트 선택
    const relevantContext = await this.selectRelevantContext(
      task,
      availableContext
    );

    // 우선순위별 컨텍스트 구성
    const prioritizedContext = this.prioritizeContext(relevantContext);

    const prompt = `
    [핵심 컨텍스트]
    ${prioritizedContext.critical.map(ctx => `- ${ctx.summary}`).join('\n')}

    [작업 정의]
    ${task.description}

    [관련 코드베이스 정보]
    ${prioritizedContext.codebase.map(info => `
    파일: ${info.file}
    역할: ${info.purpose}
    주요 함수: ${info.keyFunctions.join(', ')}
    `).join('\n')}

    [프로젝트 규칙]
    ${prioritizedContext.conventions.map(rule => `- ${rule}`).join('\n')}

    [참고할 패턴]
    ${prioritizedContext.patterns.map(pattern => `
    패턴: ${pattern.name}
    용도: ${pattern.usage}
    예제: ${pattern.example}
    `).join('\n')}

    위 컨텍스트를 고려하여 다음 작업을 수행해주세요:
    ${task.specificInstructions}
    `;

    return {
      prompt,
      contextUsage: this.calculateContextUsage(prioritizedContext),
      relevanceScore: await this.calculateRelevanceScore(
        prioritizedContext,
        task
      ),
      fallbackContext: this.prepareFallbackContext(availableContext)
    };
  }

  // 점진적 컨텍스트 확장
  async createProgressiveContextPrompt(
    initialTask: Task,
    contextLevels: ContextLevel[]
  ): Promise<ProgressivePrompt> {

    const prompts: LeveledPrompt[] = [];

    for (const level of contextLevels) {
      const levelPrompt = await this.createLevelPrompt(initialTask, level);
      prompts.push(levelPrompt);
    }

    return {
      initialPrompt: prompts[0],
      expansionPrompts: prompts.slice(1),
      expansionTriggers: this.defineExpansionTriggers(contextLevels),
      maxExpansionDepth: contextLevels.length
    };
  }
}
```

### 메타 프롬프팅 전략

```typescript
// 프롬프트를 생성하는 프롬프트
class MetaPromptingStrategies {
  // 자기 개선 프롬프트 생성
  async createSelfImprovingPrompt(
    initialPrompt: string,
    qualityCriteria: QualityCriteria
  ): Promise<MetaPrompt> {

    const metaPrompt = `
    다음 프롬프트를 분석하고 개선해주세요:

    [원본 프롬프트]
    ${initialPrompt}

    [개선 기준]
    1. 명확성: 모호한 표현 제거, 구체적 지시
    2. 완전성: 누락된 정보나 단계 추가
    3. 구조화: 논리적 순서와 계층 구조
    4. 효율성: 불필요한 반복 제거
    5. 검증가능성: 명확한 성공 기준

    [개선 과정]
    1. 현재 프롬프트의 강점과 약점 분석
    2. 각 약점에 대한 구체적 개선 방안
    3. 개선된 프롬프트 제시
    4. 개선 전후 비교 및 근거 설명

    [품질 검증]
    - 개선된 프롬프트가 원본 목적을 달성하는가?
    - 추가된 내용이 가치를 제공하는가?
    - 제거된 내용이 정말 불필요했는가?
    `;

    return {
      metaPrompt,
      originalPrompt: initialPrompt,
      improvementCriteria: qualityCriteria,
      iterationLimit: 3,
      convergenceThreshold: 0.9
    };
  }

  // 도메인 특화 프롬프트 템플릿 생성
  async createDomainSpecificTemplate(
    domain: DevelopmentDomain,
    taskTypes: TaskType[]
  ): Promise<PromptTemplate> {

    const templatePrompt = `
    ${domain} 도메인의 ${taskTypes.join(', ')} 작업을 위한
    프롬프트 템플릿을 생성해주세요.

    템플릿 요구사항:
    1. 도메인 특화 용어와 개념 포함
    2. 일반적인 제약사항과 best practice
    3. 검증 가능한 품질 기준
    4. 재사용 가능한 구조

    템플릿 구조:
    - 작업 컨텍스트 섹션
    - 구체적 요구사항 섹션
    - 제약사항 및 고려사항 섹션
    - 예상 결과물 섹션
    - 검증 기준 섹션

    각 섹션에 대해:
    - 필수 포함 요소
    - 선택적 요소
    - 도메인별 특수 고려사항
    - 예제 텍스트

    생성된 템플릿은 다음과 같이 사용됩니다:
    \`\`\`
    const prompt = template.fill({
      taskDescription: "...",
      constraints: [...],
      expectedOutput: "..."
    });
    \`\`\`
    `;

    return {
      generationPrompt: templatePrompt,
      domain,
      supportedTaskTypes: taskTypes,
      customizationPoints: await this.identifyCustomizationPoints(
        domain,
        taskTypes
      )
    };
  }
}
```

## 창의적 문제 해결 프롬프팅

### 발산적 사고 유도

```typescript
// 창의적 솔루션 생성을 위한 프롬프팅
class CreativeProblemSolvingPrompts {
  // 브레인스토밍 프롬프트
  async createBrainstormingPrompt(
    problem: Problem,
    constraints: Constraint[]
  ): Promise<BrainstormingPrompt> {

    const prompt = `
    다음 문제에 대해 창의적인 해결책을 브레인스토밍해주세요:

    [문제 정의]
    ${problem.description}

    [현재 접근법의 한계]
    ${problem.currentLimitations.map(limit => `- ${limit}`).join('\n')}

    [브레인스토밍 규칙]
    1. 판단 유보 - 모든 아이디어를 일단 수용
    2. 양적 목표 - 최소 10개 이상의 다양한 접근법
    3. 연상 확장 - 기존 아이디어에서 파생
    4. 결합과 개선 - 아이디어들을 조합

    [사고 방향]
    - 기술적 혁신: 새로운 기술이나 알고리즘 활용
    - 구조적 재설계: 근본적인 아키텍처 변경
    - 패러다임 전환: 문제를 다른 관점에서 재정의
    - 하이브리드 접근: 여러 방법론의 결합
    - 역발상: 일반적 가정의 반대로 접근

    [아이디어 구조]
    각 아이디어에 대해:
    1. 핵심 개념 (한 문장)
    2. 작동 원리 (간단한 설명)
    3. 장점과 혁신성
    4. 잠재적 도전과제
    5. 구현 가능성 (1-10)

    제약사항: ${constraints.map(c => c.description).join(', ')}
    (단, 초기 아이디어 생성 시에는 제약을 느슨하게 해석)
    `;

    return {
      prompt,
      expectedIdeas: 10,
      evaluationCriteria: this.defineEvaluationCriteria(),
      refinementStrategy: 'convergent-selection'
    };
  }

  // 아날로지 기반 문제 해결
  async createAnalogyBasedPrompt(
    problem: Problem,
    sourceDomains: Domain[]
  ): Promise<AnalogyPrompt> {

    const analogies = await this.findPotentialAnalogies(problem, sourceDomains);

    const prompt = `
    다른 도메인의 해결책을 현재 문제에 적용해보세요:

    [현재 문제]
    도메인: ${problem.domain}
    문제: ${problem.description}
    핵심 도전: ${problem.coreChallenge}

    [참고 도메인과 아날로지]
    ${analogies.map(analogy => `
    ${analogy.sourceDomain}에서의 유사 문제:
    - 문제: ${analogy.sourceProblem}
    - 해결책: ${analogy.sourceSolution}
    - 핵심 원리: ${analogy.corePrinciple}

    적용 방법:
    1. 핵심 원리를 현재 도메인으로 변환
    2. 필요한 조정사항 식별
    3. 구체적 구현 방안 제시
    `).join('\n---\n')}

    [창의적 적용]
    각 아날로지에 대해:
    1. 직접 적용: 최소한의 수정으로 적용
    2. 변형 적용: 도메인 특성에 맞게 조정
    3. 영감 적용: 원리만 차용하여 새로운 해결책

    가장 유망한 3가지 접근법을 상세히 개발해주세요.
    `;

    return {
      prompt,
      analogies,
      transferStrategies: ['direct', 'adapted', 'inspired'],
      evaluationFramework: this.createAnalogyEvaluationFramework()
    };
  }
}
```

### 제약 기반 창의성

```typescript
// 제약을 활용한 창의적 해결책
class ConstraintBasedCreativity {
  // 극단적 제약 프롬프트
  async createExtremeConstraintPrompt(
    task: Task,
    extremeConstraints: ExtremeConstraint[]
  ): Promise<ConstraintPrompt> {

    const prompt = `
    다음의 극단적 제약 조건 하에서 창의적 해결책을 찾아주세요:

    [작업]
    ${task.description}

    [극단적 제약]
    ${extremeConstraints.map(constraint => `
    ${constraint.name}:
    - 일반적 수준: ${constraint.normalLevel}
    - 극단적 수준: ${constraint.extremeLevel}
    - 도전 요소: ${constraint.challenge}
    `).join('\n')}

    [창의적 접근 전략]
    1. 제약을 장점으로 전환
       - 각 제약이 강제하는 혁신 기회 식별
       - 제약 때문에 가능한 새로운 접근법

    2. 최소주의 설계
       - 핵심 기능만으로 목표 달성
       - 불필요한 복잡성 제거

    3. 대안적 해결 경로
       - 전통적 방법을 우회하는 접근
       - 문제 자체를 재정의

    4. 제약 간 시너지
       - 여러 제약을 동시에 만족하는 통합 솔루션
       - 한 제약이 다른 제약 해결에 도움

    각 해결책에 대해:
    - 핵심 아이디어
    - 모든 제약 충족 방법
    - 예상치 못한 이점
    - 구현 전략
    `;

    return {
      prompt,
      constraints: extremeConstraints,
      creativityMetrics: this.defineCreativityMetrics(),
      feasibilityThreshold: 0.6
    };
  }

  // 역설적 요구사항 해결
  async createParadoxicalRequirementsPrompt(
    requirements: ParadoxicalRequirement[]
  ): Promise<ParadoxPrompt> {

    const prompt = `
    서로 모순되는 것처럼 보이는 요구사항들을 동시에 만족시켜주세요:

    [역설적 요구사항]
    ${requirements.map(req => `
    ${req.name}:
    - 요구 A: ${req.requirementA}
    - 요구 B: ${req.requirementB}
    - 표면적 모순: ${req.apparentContradiction}
    `).join('\n')}

    [해결 전략]
    1. 차원 분리
       - 시간적 분리: 다른 시점에 각 요구 충족
       - 공간적 분리: 다른 컨텍스트에서 작동
       - 조건적 분리: 상황에 따라 전환

    2. 상위 수준 통합
       - 두 요구를 포함하는 더 큰 개념
       - 메타 레벨에서의 해결

    3. 창의적 재해석
       - 요구사항의 진짜 의도 파악
       - 대안적 충족 방법

    4. 혁신적 아키텍처
       - 새로운 구조로 모순 해소
       - 기술적 돌파구

    각 모순에 대한 해결책과 구현 코드를 제시해주세요.
    `;

    return {
      prompt,
      paradoxes: requirements,
      resolutionStrategies: ['separation', 'integration', 'reinterpretation', 'innovation'],
      validationCriteria: this.createParadoxResolutionCriteria()
    };
  }
}
```

## 성능 최적화 프롬프팅

### 효율적 응답 유도

```typescript
// 토큰 효율적인 프롬프트 설계
class EfficientPromptingStrategies {
  // 압축 프롬프트 생성
  async createCompressedPrompt(
    task: Task,
    tokenLimit: number
  ): Promise<CompressedPrompt> {

    const essentials = await this.extractEssentials(task);
    const abbreviations = this.createAbbreviationMap(essentials);

    const prompt = `
    [간결 모드 활성화]

    작업: ${this.compressDescription(task.description)}

    약어:
    ${Object.entries(abbreviations).map(([full, abbr]) =>
      `${abbr}=${full}`
    ).join(', ')}

    요구사항:
    ${essentials.requirements.map((req, i) => `R${i+1}: ${req}`).join('\n')}

    출력 형식:
    - 코드: 주석 최소화, 핵심 로직만
    - 설명: 불필리스트, 핵심 포인트만
    - 구조: 계층적, 번호 매기기

    ${this.compressedContext(task.context, abbreviations)}
    `;

    return {
      prompt,
      estimatedTokens: this.estimateTokens(prompt),
      compressionRatio: this.calculateCompressionRatio(task, prompt),
      abbreviations,
      expansionGuide: this.createExpansionGuide(abbreviations)
    };
  }

  // 점진적 상세화 프롬프트
  async createProgressiveDetailPrompt(
    task: Task,
    detailLevels: DetailLevel[]
  ): Promise<ProgressivePrompt> {

    const prompts = detailLevels.map(level => ({
      level: level.name,
      prompt: this.createLevelSpecificPrompt(task, level),
      expectedTokens: level.targetTokens,
      focusAreas: level.focusAreas
    }));

    return {
      overviewPrompt: prompts[0],
      detailPrompts: prompts.slice(1),
      transitionTriggers: this.defineTransitionTriggers(detailLevels),
      tokenBudget: detailLevels.reduce((sum, level) => sum + level.targetTokens, 0)
    };
  }
}
```

## SuperClaude 고급 프롬프팅 명령어

```bash
# 체인 오브 씽킹 활성화
/prompt chain-of-thought --steps 5 --validation strict

# 재귀적 문제 해결
/prompt recursive --depth 3 --base-case auto

# 멀티모달 추론
/prompt multimodal --diagrams --code --explanation

# 메타 프롬프팅
/prompt meta --improve --iterate 3

# 창의적 문제 해결
/prompt creative --brainstorm --analogies --constraints

# 역설적 요구사항 해결
/prompt paradox --strategies all --validate

# 효율적 프롬프팅
/prompt efficient --compress --token-limit 4000

# 도메인 특화 템플릿
/prompt template --domain backend --tasks [api,database,auth]

# 컨텍스트 증강
/prompt augment --progressive --relevant-only

# 성능 최적화
/prompt optimize --response-time --quality balanced
```

## 프롬프트 패턴 라이브러리

### 문제 해결 패턴

```typescript
// 자주 사용되는 프롬프트 패턴
const PROMPT_PATTERNS = {
  // 분석형 패턴
  analysis: {
    systemAnalysis: `
      다음 시스템을 분석해주세요:
      1. 구조적 분석: 컴포넌트와 관계
      2. 행동적 분석: 상호작용과 흐름
      3. 품질 분석: 성능, 보안, 유지보수성
      4. 개선 기회: 구체적 제안
    `,

    codeReview: `
      코드를 다음 관점에서 리뷰해주세요:
      - 정확성: 로직과 알고리즘
      - 품질: 가독성과 유지보수성
      - 성능: 효율성과 최적화
      - 보안: 취약점과 방어
      각 항목에 대해 구체적 예시와 개선안을 제시
    `
  },

  // 생성형 패턴
  generation: {
    robustImplementation: `
      다음 기능을 구현하되, 특히 주의할 점:
      1. 에러 처리: 모든 예외 상황 고려
      2. 엣지 케이스: 극단적 입력값 처리
      3. 성능: O(n) 이하 복잡도
      4. 테스트: 단위 테스트 포함
      5. 문서화: 명확한 주석
    `,

    evolutionaryDesign: `
      현재 설계를 다음 단계로 진화:
      Phase 1: 현재 문제 해결 (MVP)
      Phase 2: 확장성 고려 (스케일)
      Phase 3: 최적화 (성능)
      Phase 4: 일반화 (재사용)
      각 단계별 구체적 변경사항과 이유 설명
    `
  },

  // 학습형 패턴
  learning: {
    conceptExploration: `
      개념을 다음 수준으로 설명:
      1. ELI5 (초보자): 비유와 예시
      2. 실무자: 구체적 적용과 패턴
      3. 전문가: 깊은 원리와 최적화
      각 수준에서 코드 예제 포함
    `,

    comparativeAnalysis: `
      접근법들을 비교 분석:
      - 핵심 차이점
      - 각각의 장단점
      - 적합한 사용 케이스
      - 성능/복잡도 비교
      - 실제 코드 예시
      - 추천 선택 기준
    `
  }
};
```

### 프롬프트 조합 전략

```typescript
// 복합 프롬프트 생성
class PromptCompositionStrategy {
  // 다중 관점 프롬프트
  async createMultiPerspectivePrompt(
    topic: Topic,
    perspectives: Perspective[]
  ): Promise<CompositePrompt> {

    const sections = perspectives.map(perspective => ({
      viewpoint: perspective.name,
      prompt: this.createPerspectiveSection(topic, perspective),
      weight: perspective.importance
    }));

    const synthesisPrompt = `
    위의 모든 관점을 종합하여:
    1. 공통된 통찰
    2. 상충되는 부분과 해결
    3. 통합된 해결책
    4. 각 관점의 기여도
    `;

    return {
      sections,
      synthesisPrompt,
      integrationStrategy: 'weighted-consensus'
    };
  }

  // 반복적 개선 프롬프트
  async createIterativeRefinementPrompt(
    initialSolution: Solution,
    refinementCriteria: Criteria[]
  ): Promise<RefinementPrompt> {

    const iterations = refinementCriteria.map((criterion, index) => ({
      iteration: index + 1,
      focus: criterion.name,
      prompt: `
        이전 솔루션을 ${criterion.name} 관점에서 개선:
        - 현재 상태 평가
        - 개선 가능 영역
        - 구체적 변경사항
        - 개선 효과 측정
      `,
      validationMetric: criterion.metric
    }));

    return {
      baselineSolution: initialSolution,
      iterations,
      convergenceCriteria: this.defineConvergence(refinementCriteria),
      maxIterations: 5
    };
  }
}
```

이 고급 프롬프팅 기법들을 통해 Claude와의 상호작용을 최적화하고, 복잡한 문제에 대한 정교한 솔루션을 효과적으로 생성할 수 있습니다.