# 자동 검색 트리거 시스템

## 개요

Claude가 문제 해결 시 혼자 삽질하지 않고 적절한 시점에 웹 검색을 자동으로 실행하는 인텔리전트 트리거 시스템입니다. 2분 룰을 기반으로 효율적인 문제 해결 파이프라인을 구축합니다.

## 자동 트리거 조건

### 시간 기반 트리거

```typescript
// 시간 기반 자동 검색 트리거
interface TimeBasedTrigger {
  // 기본 2분 룰
  basicTimeLimit: {
    duration: 120; // 2분 (초)
    condition: 'any_unsolved_problem';
    priority: 'high';
    autoExecute: true;
  };

  // 컨텍스트별 조정된 시간 제한
  contextualLimits: {
    // 간단한 구문 오류 - 더 빠른 트리거
    syntaxError: {
      duration: 60; // 1분
      examples: ['SyntaxError', 'TypeError', 'ReferenceError'];
      rationale: '구문 오류는 웹에서 빠르게 해결책을 찾을 수 있음';
    };

    // 새로운 기술/라이브러리 - 즉시 트리거
    newTechnology: {
      duration: 30; // 30초
      examples: ['새로운 npm 패키지', '최신 프레임워크', '최근 업데이트'];
      rationale: '최신 기술은 공식 문서나 커뮤니티 정보가 필수';
    };

    // 복잡한 아키텍처 문제 - 더 긴 시간 허용
    architecturalIssue: {
      duration: 300; // 5분
      examples: ['시스템 설계', '성능 최적화', '확장성 문제'];
      rationale: '복잡한 문제는 내부 분석도 중요';
    };
  };
}

// 시간 추적 시스템
class ProblemSolvingTimer {
  private startTime: Date;
  private context: ProblemContext;
  private warningThreshold: number;
  private triggerThreshold: number;

  constructor(context: ProblemContext) {
    this.startTime = new Date();
    this.context = context;
    this.setThresholds();
  }

  private setThresholds(): void {
    const { problemType, technology, complexity } = this.context;

    // 문제 유형별 임계값 설정
    if (problemType === 'syntax' || technology.isNew) {
      this.warningThreshold = 60;   // 1분
      this.triggerThreshold = 90;   // 1.5분
    } else if (problemType === 'architecture') {
      this.warningThreshold = 180;  // 3분
      this.triggerThreshold = 300;  // 5분
    } else {
      this.warningThreshold = 90;   // 1.5분
      this.triggerThreshold = 120;  // 2분 (기본)
    }
  }

  checkTimeElapsed(): TriggerResult {
    const elapsed = (Date.now() - this.startTime.getTime()) / 1000;

    if (elapsed >= this.triggerThreshold) {
      return {
        shouldTrigger: true,
        urgency: 'high',
        message: `⏰ ${elapsed}초 경과 - 웹 검색 자동 실행`,
        searchQuery: this.generateSearchQuery()
      };
    } else if (elapsed >= this.warningThreshold) {
      return {
        shouldTrigger: false,
        urgency: 'medium',
        message: `⚠️ ${elapsed}초 경과 - 곧 자동 검색 실행`,
        estimatedTrigger: this.triggerThreshold - elapsed
      };
    }

    return { shouldTrigger: false, urgency: 'low' };
  }
}
```

### 패턴 기반 트리거

```typescript
// 문제 해결 패턴 인식 시스템
interface PatternBasedTrigger {
  // 반복 시도 패턴 감지
  repetitiveAttempts: {
    threshold: 3; // 같은 접근법 3번 시도
    detection: 'semantic_similarity';
    examples: [
      '같은 명령어 반복 실행',
      '동일한 코드 수정 반복',
      '비슷한 구글링 키워드 반복'
    ];
  };

  // 막다른 길 패턴 감지
  deadEndPatterns: {
    indicators: [
      'unknown error 또는 generic error',
      'not found 메시지 연속',
      '해결책 없이 다른 방향으로 우회',
      'stackoverflow에 없는 희귀한 에러'
    ];
    action: '즉시 웹 검색 + 커뮤니티 검색';
  };

  // 토큰 사용량 기반 트리거
  tokenUsagePattern: {
    threshold: 1000; // 토큰
    efficiency: 'search_cost_200_tokens_vs_analysis_5000_tokens';
    rationale: '웹 검색(200토큰) vs 혼자 분석(5000토큰)';
  };
}

// 패턴 인식 엔진
class ProblemPatternRecognizer {
  private attemptHistory: Attempt[] = [];
  private tokenUsage: number = 0;

  recordAttempt(attempt: Attempt): void {
    this.attemptHistory.push({
      ...attempt,
      timestamp: Date.now(),
      similarity: this.calculateSimilarity(attempt)
    });

    this.tokenUsage += attempt.tokenCost;
  }

  checkTriggerConditions(): TriggerAnalysis {
    return {
      repetitiveAttempts: this.detectRepetitiveAttempts(),
      deadEndPattern: this.detectDeadEndPattern(),
      tokenEfficiency: this.analyzeTokenEfficiency(),
      recommendation: this.generateRecommendation()
    };
  }

  private detectRepetitiveAttempts(): RepetitiveAnalysis {
    const recentAttempts = this.attemptHistory.slice(-5);
    const similarGroups = this.groupBySimilarity(recentAttempts, 0.8);

    const maxGroupSize = Math.max(...similarGroups.map(g => g.length));

    return {
      detected: maxGroupSize >= 3,
      maxRepetition: maxGroupSize,
      pattern: maxGroupSize >= 3 ? similarGroups[0][0].approach : null,
      recommendation: maxGroupSize >= 3 ?
        '같은 접근법을 반복하고 있습니다. 웹 검색으로 새로운 관점을 찾아보세요.' :
        null
    };
  }

  private detectDeadEndPattern(): DeadEndAnalysis {
    const recentErrors = this.attemptHistory
      .slice(-3)
      .map(a => a.errorMessage)
      .filter(Boolean);

    const deadEndIndicators = [
      /unknown.+error/i,
      /not found/i,
      /undefined.+method/i,
      /cannot.+find/i
    ];

    const matchCount = recentErrors.reduce((count, error) => {
      return count + deadEndIndicators.filter(pattern => pattern.test(error)).length;
    }, 0);

    return {
      detected: matchCount >= 2,
      confidence: matchCount / recentErrors.length,
      indicators: deadEndIndicators.filter(pattern =>
        recentErrors.some(error => pattern.test(error))
      )
    };
  }

  private analyzeTokenEfficiency(): TokenEfficiencyAnalysis {
    const averageTokensPerAttempt = this.tokenUsage / Math.max(this.attemptHistory.length, 1);
    const projectedContinuedCost = averageTokensPerAttempt * 10; // 10번 더 시도한다면
    const webSearchCost = 200; // 웹 검색 예상 비용

    return {
      currentUsage: this.tokenUsage,
      projectedCost: projectedContinuedCost,
      searchAlternativeCost: webSearchCost,
      efficiencyGain: (projectedContinuedCost - webSearchCost) / projectedContinuedCost,
      recommendation: projectedContinuedCost > webSearchCost * 2 ?
        '웹 검색이 더 효율적입니다' :
        '현재 방식 계속 진행'
    };
  }
}
```

### 컨텍스트 기반 트리거

```typescript
// 기술 스택별 자동 트리거 설정
interface TechnologySpecificTriggers {
  // 프론트엔드 프레임워크
  frontend: {
    react: {
      quickTriggers: [
        'React Hook 관련 에러',
        'JSX 문법 오류',
        'State 관리 문제',
        'useEffect 의존성 경고'
      ];
      searchPatterns: [
        'React ${hookName} ${errorType} fix 2024',
        'React ${version} ${component} best practices',
        'React performance ${issue} solution'
      ];
    };

    nextjs: {
      quickTriggers: [
        'Hydration 에러',
        'Routing 문제',
        'Build 에러',
        'API Routes 에러'
      ];
      searchPatterns: [
        'Next.js ${version} ${errorType} fix 2024',
        'Next.js deployment ${platform} error solution',
        'Next.js ${feature} implementation guide'
      ];
    };

    vue: {
      quickTriggers: [
        'Composition API 에러',
        'Reactivity 문제',
        'Template 컴파일 에러'
      ];
      searchPatterns: [
        'Vue 3 ${feature} ${errorType} solution 2024',
        'Vue Composition API ${issue} fix',
        'Vite Vue ${error} troubleshooting'
      ];
    };
  };

  // 백엔드 기술
  backend: {
    nodejs: {
      quickTriggers: [
        'Module resolution 에러',
        'Async/await 문제',
        'Memory leak',
        'Performance 이슈'
      ];
      searchPatterns: [
        'Node.js ${version} ${errorType} fix 2024',
        'Express.js ${middleware} ${issue} solution',
        'Node.js performance optimization ${problem}'
      ];
    };

    python: {
      quickTriggers: [
        'Import 에러',
        'Virtual environment 문제',
        'Package 의존성 충돌'
      ];
      searchPatterns: [
        'Python ${version} ${errorType} fix 2024',
        'pip install ${package} error solution',
        'Python virtual environment ${issue}'
      ];
    };
  };

  // DevOps 도구
  devops: {
    docker: {
      quickTriggers: [
        'Container build 실패',
        'Network 연결 문제',
        'Volume mount 에러'
      ];
      searchPatterns: [
        'Docker ${version} ${errorType} fix 2024',
        'Docker compose ${service} error solution',
        'Dockerfile ${instruction} best practices'
      ];
    };

    kubernetes: {
      quickTriggers: [
        'Pod 상태 에러',
        'Service 연결 실패',
        'Resource 할당 문제'
      ];
      searchPatterns: [
        'Kubernetes ${resource} ${status} troubleshooting 2024',
        'kubectl ${command} error solution',
        'K8s ${service} configuration guide'
      ];
    };
  };
}

// 컨텍스트 인식 트리거 시스템
class ContextAwareTriggerSystem {
  private context: DevelopmentContext;
  private technologyTriggers: TechnologySpecificTriggers;

  constructor(context: DevelopmentContext) {
    this.context = context;
    this.technologyTriggers = this.initializeTriggers();
  }

  evaluateTriggerConditions(problemDescription: string, errorMessage?: string): TriggerDecision {
    const technology = this.identifyTechnology();
    const triggerConfig = this.getTriggerConfig(technology);

    // 빠른 트리거 조건 확인
    const quickTrigger = this.checkQuickTriggers(
      problemDescription,
      errorMessage,
      triggerConfig.quickTriggers
    );

    if (quickTrigger.matches) {
      return {
        shouldTrigger: true,
        urgency: 'immediate',
        reason: 'quick_trigger_match',
        searchQuery: this.generateSearchQuery(technology, quickTrigger),
        expectedSources: ['official_docs', 'github_issues', 'stack_overflow']
      };
    }

    // 일반적인 트리거 조건 확인
    const generalTrigger = this.checkGeneralTriggers(problemDescription, errorMessage);

    return {
      shouldTrigger: generalTrigger.shouldTrigger,
      urgency: generalTrigger.urgency,
      reason: generalTrigger.reason,
      searchQuery: generalTrigger.searchQuery,
      expectedSources: generalTrigger.expectedSources,
      fallbackStrategy: generalTrigger.fallbackStrategy
    };
  }

  private identifyTechnology(): TechnologyStack {
    // 프로젝트 파일, 의존성, 에러 메시지 등으로 기술 스택 식별
    const packageJson = this.context.project?.packageJson;
    const errorStack = this.context.currentError?.stack;
    const fileExtensions = this.context.project?.fileExtensions;

    return {
      frontend: this.detectFrontendFramework(packageJson, errorStack),
      backend: this.detectBackendFramework(packageJson, errorStack),
      database: this.detectDatabase(packageJson, this.context.environment),
      devops: this.detectDevOpsTools(this.context.project?.config),
      cloud: this.detectCloudPlatform(this.context.deployment)
    };
  }

  private generateSearchQuery(
    technology: TechnologyStack,
    trigger: QuickTrigger
  ): string {
    const patterns = this.technologyTriggers[technology.category][technology.name]?.searchPatterns;
    const bestPattern = patterns?.[0] || 'generic_pattern';

    return this.interpolatePattern(bestPattern, {
      technology: technology.name,
      version: technology.version,
      errorType: trigger.errorType,
      feature: trigger.feature,
      issue: trigger.issue
    });
  }
}
```

## 자동 검색 실행 시스템

### 검색 쿼리 생성

```typescript
// 스마트 검색 쿼리 생성기
class SmartSearchQueryGenerator {
  generateQuery(context: ProblemContext): SearchQuery {
    const components = [
      this.getTechnologyComponent(context.technology),
      this.getErrorComponent(context.error),
      this.getIntentComponent(context.intent),
      this.getTimeComponent(),
      this.getQualityComponent()
    ].filter(Boolean);

    return {
      query: components.join(' '),
      priority: this.calculatePriority(context),
      expectedSources: this.predictBestSources(context),
      fallbackQueries: this.generateFallbackQueries(components)
    };
  }

  private getTechnologyComponent(tech: Technology): string {
    // 기술명 + 버전 (버전이 중요한 경우)
    const versionImportantTechs = ['React', 'Next.js', 'Node.js', 'TypeScript'];

    if (versionImportantTechs.includes(tech.name) && tech.version) {
      return `${tech.name} ${tech.version}`;
    }

    return tech.name;
  }

  private getErrorComponent(error: ErrorInfo): string {
    if (!error?.message) return '';

    // 에러 메시지 정제
    const cleanError = error.message
      .replace(/at .+:\d+:\d+/g, '') // 파일 경로 제거
      .replace(/\s+/g, ' ') // 여러 공백 정리
      .trim();

    // 핵심 에러 타입 추출
    const errorTypePattern = /^(\w+Error|Error \w+|\w+Exception)/;
    const match = cleanError.match(errorTypePattern);

    return match ? match[1] : cleanError.substring(0, 50);
  }

  private getIntentComponent(intent: ProblemIntent): string {
    const intentMap = {
      fix: 'fix solution',
      implement: 'implementation example guide',
      optimize: 'optimization best practices',
      understand: 'explanation tutorial',
      configure: 'configuration setup'
    };

    return intentMap[intent] || 'solution';
  }

  private getTimeComponent(): string {
    return '2024'; // 최신 정보 우선
  }

  private getQualityComponent(): string {
    // 고품질 소스 유도 키워드
    return 'official documentation best practices';
  }

  // 백업 검색 쿼리 생성
  generateFallbackQueries(originalComponents: string[]): string[] {
    return [
      // 더 구체적인 쿼리
      [...originalComponents, 'github issues'].join(' '),
      // 더 일반적인 쿼리
      originalComponents.slice(0, -1).join(' '),
      // 커뮤니티 중심 쿼리
      [...originalComponents, 'stack overflow reddit'].join(' '),
      // 튜토리얼 중심 쿼리
      [...originalComponents.slice(0, 2), 'tutorial guide example'].join(' ')
    ];
  }
}
```

### 실시간 트리거 모니터링

```typescript
// 실시간 문제 해결 모니터링 시스템
class RealTimeProblemSolvingMonitor {
  private activeSession: ProblemSolvingSession;
  private triggerSystem: AutoTriggerSystem;
  private searchExecutor: SearchExecutor;

  startMonitoring(problemDescription: string): void {
    this.activeSession = new ProblemSolvingSession({
      startTime: Date.now(),
      description: problemDescription,
      context: this.gatherContext()
    });

    // 주기적 모니터링 시작 (10초마다)
    this.startPeriodicCheck();
  }

  private startPeriodicCheck(): void {
    const checkInterval = setInterval(() => {
      const triggerResult = this.triggerSystem.evaluate(this.activeSession);

      if (triggerResult.shouldTrigger) {
        this.executeAutoSearch(triggerResult);
        clearInterval(checkInterval);
      }

      // 세션 업데이트
      this.updateSession();

    }, 10000); // 10초마다
  }

  private async executeAutoSearch(trigger: TriggerResult): Promise<void> {
    const searchResult = await this.searchExecutor.execute({
      query: trigger.searchQuery,
      sources: trigger.expectedSources,
      maxResults: 5,
      qualityThreshold: 0.8
    });

    // 검색 결과 분석 및 적용
    const analysis = await this.analyzeSearchResults(searchResult);

    // 사용자에게 결과 제시
    this.presentSolution({
      trigger: trigger,
      searchResult: searchResult,
      analysis: analysis,
      recommendedActions: this.generateRecommendedActions(analysis)
    });

    // 세션 완료
    this.completeSession(analysis.success);
  }

  private analyzeSearchResults(searchResult: SearchResult): SolutionAnalysis {
    return {
      relevanceScore: this.calculateRelevance(searchResult),
      reliabilityScore: this.calculateReliability(searchResult),
      difficultyScore: this.calculateDifficulty(searchResult),
      applicabilityScore: this.calculateApplicability(searchResult),
      bestSolution: this.selectBestSolution(searchResult.results),
      alternativeSolutions: this.selectAlternativeSolutions(searchResult.results),
      success: this.predictSuccessRate(searchResult)
    };
  }

  private generateRecommendedActions(analysis: SolutionAnalysis): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    if (analysis.bestSolution) {
      actions.push({
        type: 'primary',
        title: '추천 해결책 적용',
        description: analysis.bestSolution.summary,
        code: analysis.bestSolution.code,
        source: analysis.bestSolution.source,
        confidence: analysis.bestSolution.confidence
      });
    }

    if (analysis.alternativeSolutions.length > 0) {
      actions.push({
        type: 'alternative',
        title: '대안 해결책들',
        options: analysis.alternativeSolutions.map(sol => ({
          title: sol.title,
          description: sol.summary,
          pros: sol.pros,
          cons: sol.cons
        }))
      });
    }

    return actions;
  }
}
```

## SuperClaude 통합

### 자동 트리거 설정 명령어

```bash
# 기본 자동 트리거 활성화
/setup auto-search --time-limit 120 --pattern-detection --token-efficiency

# 기술별 맞춤 트리거 설정
/setup auto-search --tech "React,Next.js,Node.js" --quick-triggers --domain-specific

# 트리거 임계값 조정
/configure auto-search --time-threshold 90 --repetition-threshold 3 --token-threshold 1000

# 트리거 조건 확인
/check auto-search-conditions --current-problem --estimated-trigger-time

# 수동 트리거 실행
/trigger auto-search --reason "stuck_for_5_minutes" --urgent

# 트리거 성능 분석
/analyze auto-search-performance --success-rate --token-savings --time-savings

# 트리거 패턴 학습
/learn trigger-patterns --from-history --optimize-thresholds --improve-accuracy
```

### 실시간 알림 시스템

```typescript
// 실시간 트리거 알림
interface AutoTriggerNotifications {
  // 사전 경고 (트리거 30초 전)
  preWarning: {
    message: "🔍 30초 후 자동 웹 검색이 실행됩니다";
    options: ["지금 실행", "1분 더 시도", "수동 검색"];
    countdown: true;
  };

  // 트리거 실행
  executing: {
    message: "⚡ 자동 웹 검색 실행 중...";
    query: string;
    estimatedTime: "10-30초";
    progress: true;
  };

  // 결과 완료
  completed: {
    message: "✅ 해결책을 찾았습니다!";
    results: SearchSolution[];
    timesSaved: string;
    tokensSaved: number;
  };
}
```

이 자동 트리거 시스템을 통해 Claude가 효율적으로 문제를 해결하고 불필요한 시행착오를 줄일 수 있습니다.