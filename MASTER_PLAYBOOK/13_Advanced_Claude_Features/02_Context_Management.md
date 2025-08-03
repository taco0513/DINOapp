# 고급 컨텍스트 관리

## 개요

대용량 프로젝트에서 Claude와 효과적으로 협업하기 위한 컨텍스트 최적화 전략입니다. 제한된 컨텍스트 윈도우 내에서 최대한의 정보를 효율적으로 활용하는 방법을 다룹니다.

## 컨텍스트 최적화 전략

### 계층적 컨텍스트 구조

```typescript
// 컨텍스트 관리 시스템
interface ContextHierarchy {
  global: GlobalContext;
  project: ProjectContext;
  module: ModuleContext;
  session: SessionContext;
  immediate: ImmediateContext;
}

interface GlobalContext {
  projectOverview: ProjectOverview;
  architecturePatterns: ArchitecturePattern[];
  teamConventions: CodingConventions;
  businessDomain: DomainKnowledge;
  technicalStack: TechnologyStack;
}

class ContextManager {
  private contextLayers: ContextHierarchy;
  private priorityEngine: ContextPriorityEngine;
  private compressionEngine: ContextCompressionEngine;

  constructor() {
    this.contextLayers = this.initializeContextLayers();
    this.priorityEngine = new ContextPriorityEngine();
    this.compressionEngine = new ContextCompressionEngine();
  }

  async optimizeContextForTask(
    task: DevelopmentTask,
    availableTokens: number
  ): Promise<OptimizedContext> {

    // 1. 태스크 분석 및 필요 컨텍스트 식별
    const requiredContext = await this.analyzeTaskRequirements(task);

    // 2. 컨텍스트 우선순위 계산
    const prioritizedContext = await this.prioritizeContext(
      requiredContext,
      task.priority,
      task.complexity
    );

    // 3. 토큰 예산에 맞춰 컨텍스트 압축
    const compressedContext = await this.compressContext(
      prioritizedContext,
      availableTokens
    );

    // 4. 컨텍스트 구조화
    const structuredContext = await this.structureContext(compressedContext);

    return {
      context: structuredContext,
      tokenUsage: await this.calculateTokenUsage(structuredContext),
      compressionRatio: this.calculateCompressionRatio(
        requiredContext,
        compressedContext
      ),
      missingContext: this.identifyMissingContext(
        requiredContext,
        compressedContext
      )
    };
  }

  // 동적 컨텍스트 로딩
  async loadContextDynamically(
    currentContext: Context,
    newRequirement: ContextRequirement
  ): Promise<UpdatedContext> {

    // 현재 컨텍스트 분석
    const contextAnalysis = await this.analyzeCurrentContext(currentContext);

    // 새로운 요구사항과의 관련성 평가
    const relevanceScore = await this.calculateRelevance(
      contextAnalysis,
      newRequirement
    );

    // 컨텍스트 교체 전략 결정
    const replacementStrategy = await this.determineReplacementStrategy(
      contextAnalysis,
      newRequirement,
      relevanceScore
    );

    // 컨텍스트 업데이트 실행
    const updatedContext = await this.executeContextUpdate(
      currentContext,
      newRequirement,
      replacementStrategy
    );

    return {
      context: updatedContext,
      changes: this.documentChanges(currentContext, updatedContext),
      rationale: replacementStrategy.rationale,
      impact: await this.assessUpdateImpact(currentContext, updatedContext)
    };
  }
}
```

### 스마트 압축 기법

```typescript
// 지능형 컨텍스트 압축
class IntelligentContextCompression {
  private semanticAnalyzer: SemanticAnalyzer;
  private redundancyDetector: RedundancyDetector;
  private importanceRanker: ImportanceRanker;

  async compressContext(
    fullContext: FullContext,
    targetTokens: number
  ): Promise<CompressedContext> {

    // 1. 의미적 중복 제거
    const deduplicatedContext = await this.removeSemanticDuplicates(fullContext);

    // 2. 중요도 기반 순위 매기기
    const rankedContext = await this.rankByImportance(deduplicatedContext);

    // 3. 점진적 압축
    const compressedContext = await this.performProgressiveCompression(
      rankedContext,
      targetTokens
    );

    // 4. 압축 품질 검증
    const qualityCheck = await this.validateCompressionQuality(
      fullContext,
      compressedContext
    );

    return {
      compressed: compressedContext,
      compressionRatio: this.calculateCompressionRatio(fullContext, compressedContext),
      qualityMetrics: qualityCheck,
      preservedElements: this.identifyPreservedElements(fullContext, compressedContext),
      compressionLog: this.generateCompressionLog(fullContext, compressedContext)
    };
  }

  // 적응형 압축 알고리즘
  private async performProgressiveCompression(
    rankedContext: RankedContext,
    targetTokens: number
  ): Promise<Context> {

    let currentContext = rankedContext.context;
    let currentTokens = await this.calculateTokens(currentContext);

    const compressionSteps: CompressionStep[] = [
      // 1. 예제 코드 압축
      {
        name: "code-examples",
        ratio: 0.7,
        handler: this.compressCodeExamples.bind(this)
      },
      // 2. 상세 설명 요약
      {
        name: "detailed-descriptions",
        ratio: 0.6,
        handler: this.summarizeDescriptions.bind(this)
      },
      // 3. 중복 정보 제거
      {
        name: "redundant-information",
        ratio: 0.5,
        handler: this.removeRedundancy.bind(this)
      },
      // 4. 키워드 기반 압축
      {
        name: "keyword-compression",
        ratio: 0.4,
        handler: this.compressToKeywords.bind(this)
      }
    ];

    for (const step of compressionSteps) {
      if (currentTokens <= targetTokens) break;

      const stepResult = await step.handler(currentContext, step.ratio);
      currentContext = stepResult.compressed;
      currentTokens = stepResult.tokenCount;

      // 압축 품질이 임계값 이하로 떨어지면 중단
      if (stepResult.qualityScore < 0.7) {
        break;
      }
    }

    return currentContext;
  }

  // 코드 예제 지능형 압축
  private async compressCodeExamples(
    context: Context,
    targetRatio: number
  ): Promise<CompressionResult> {

    const codeBlocks = this.extractCodeBlocks(context);
    const compressedBlocks: CompressedCodeBlock[] = [];

    for (const block of codeBlocks) {
      // 핵심 로직 식별
      const coreLogic = await this.identifyCoreLogic(block);

      // 보일러플레이트 제거
      const withoutBoilerplate = this.removeBoilerplate(block, coreLogic);

      // 주석을 간결한 설명으로 변환
      const withCompressedComments = await this.compressComments(withoutBoilerplate);

      // 변수명 축약 (의미 보존)
      const withShortVariables = this.abbreviateVariables(withCompressedComments);

      compressedBlocks.push({
        original: block,
        compressed: withShortVariables,
        compressionRatio: this.calculateBlockCompressionRatio(block, withShortVariables),
        preservedMeaning: await this.verifyMeaningPreservation(block, withShortVariables)
      });
    }

    const compressedContext = this.replaceCodeBlocks(context, compressedBlocks);

    return {
      compressed: compressedContext,
      tokenCount: await this.calculateTokens(compressedContext),
      qualityScore: await this.assessCompressionQuality(context, compressedContext),
      details: {
        originalBlocks: codeBlocks.length,
        compressedBlocks: compressedBlocks.length,
        averageCompressionRatio: this.calculateAverageRatio(compressedBlocks)
      }
    };
  }
}
```

## 대용량 프로젝트 컨텍스트 관리

### 프로젝트 분할 전략

```typescript
// 대용량 프로젝트 관리
class LargeProjectContextManager {
  private projectStructure: ProjectStructure;
  private dependencyGraph: DependencyGraph;
  private contextCache: ContextCache;

  async manageEnterpriseProject(
    project: EnterpriseProject
  ): Promise<ProjectContextStrategy> {

    // 1. 프로젝트 구조 분석
    const structureAnalysis = await this.analyzeProjectStructure(project);

    // 2. 모듈 의존성 매핑
    const dependencyMap = await this.buildDependencyMap(structureAnalysis);

    // 3. 컨텍스트 경계 정의
    const contextBoundaries = await this.defineContextBoundaries(
      structureAnalysis,
      dependencyMap
    );

    // 4. 동적 로딩 전략 수립
    const loadingStrategy = await this.createDynamicLoadingStrategy(
      contextBoundaries
    );

    return {
      structure: structureAnalysis,
      boundaries: contextBoundaries,
      loadingStrategy,
      cacheStrategy: await this.designCacheStrategy(contextBoundaries),
      synchronizationPlan: await this.createSyncPlan(contextBoundaries)
    };
  }

  // 컨텍스트 경계 식별
  private async defineContextBoundaries(
    structure: ProjectStructure,
    dependencies: DependencyGraph
  ): Promise<ContextBoundary[]> {

    const boundaries: ContextBoundary[] = [];

    // 1. 도메인 경계
    const domainBoundaries = await this.identifyDomainBoundaries(structure);
    boundaries.push(...domainBoundaries);

    // 2. 기술적 경계
    const technicalBoundaries = await this.identifyTechnicalBoundaries(structure);
    boundaries.push(...technicalBoundaries);

    // 3. 팀 경계
    const teamBoundaries = await this.identifyTeamBoundaries(structure);
    boundaries.push(...teamBoundaries);

    // 4. 의존성 기반 경계
    const dependencyBoundaries = await this.identifyDependencyBoundaries(
      dependencies
    );
    boundaries.push(...dependencyBoundaries);

    // 경계 최적화
    const optimizedBoundaries = await this.optimizeBoundaries(
      boundaries,
      dependencies
    );

    return optimizedBoundaries;
  }

  // 지능형 캐싱 시스템
  async implementIntelligentCaching(
    contextBoundaries: ContextBoundary[]
  ): Promise<CachingSystem> {

    const cachingLayers: CachingLayer[] = [
      {
        name: "hot-cache",
        capacity: "10MB",
        ttl: "1h",
        evictionPolicy: "LRU",
        content: "actively-used-contexts"
      },
      {
        name: "warm-cache",
        capacity: "50MB",
        ttl: "4h",
        evictionPolicy: "LFU",
        content: "recently-accessed-contexts"
      },
      {
        name: "cold-cache",
        capacity: "200MB",
        ttl: "24h",
        evictionPolicy: "FIFO",
        content: "historical-contexts"
      }
    ];

    const prefetchingStrategy = await this.designPrefetchingStrategy(
      contextBoundaries
    );

    const invalidationRules = await this.createInvalidationRules(
      contextBoundaries
    );

    return {
      layers: cachingLayers,
      prefetching: prefetchingStrategy,
      invalidation: invalidationRules,
      metrics: await this.defineCacheMetrics(),
      optimization: await this.createCacheOptimizer()
    };
  }
}
```

### 실시간 컨텍스트 동기화

```typescript
// 실시간 컨텍스트 동기화
class RealTimeContextSync {
  private syncChannels: Map<string, SyncChannel> = new Map();
  private conflictResolver: ConflictResolver;
  private versionTracker: VersionTracker;

  async synchronizeContexts(
    contexts: Context[],
    syncPolicy: SyncPolicy
  ): Promise<SyncResult> {

    // 1. 컨텍스트 변경 감지
    const changes = await this.detectContextChanges(contexts);

    // 2. 충돌 해결
    const resolvedChanges = await this.resolveConflicts(changes);

    // 3. 동기화 실행
    const syncResults = await Promise.all(
      resolvedChanges.map(change => this.applySyncChange(change, syncPolicy))
    );

    // 4. 일관성 검증
    const consistencyCheck = await this.validateConsistency(contexts, syncResults);

    return {
      appliedChanges: syncResults,
      conflicts: this.getResolvedConflicts(),
      consistency: consistencyCheck,
      performance: this.getSyncPerformanceMetrics()
    };
  }

  // 충돌 해결 알고리즘
  private async resolveConflicts(
    changes: ContextChange[]
  ): Promise<ResolvedChange[]> {

    const conflicts = this.identifyConflicts(changes);
    const resolvedChanges: ResolvedChange[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.conflictResolver.resolve(conflict, {
        strategy: 'semantic-merge',
        fallback: 'user-prompt',
        timeout: 30000
      });

      resolvedChanges.push({
        original: conflict,
        resolution: resolution.decision,
        rationale: resolution.rationale,
        confidence: resolution.confidence
      });
    }

    // 충돌 없는 변경사항 추가
    const nonConflictingChanges = changes.filter(
      change => !conflicts.some(conflict =>
        this.changesOverlap(change, conflict)
      )
    );

    resolvedChanges.push(...nonConflictingChanges.map(change => ({
      original: change,
      resolution: 'accept',
      rationale: 'no-conflict',
      confidence: 1.0
    })));

    return resolvedChanges;
  }
}
```

## 효율적인 정보 구조화

### 정보 아키텍처 설계

```typescript
// 정보 아키텍처 최적화
class InformationArchitecture {
  private taxonomyBuilder: TaxonomyBuilder;
  private relationshipMapper: RelationshipMapper;
  private accessPatternAnalyzer: AccessPatternAnalyzer;

  async designOptimalStructure(
    information: InformationSet,
    usagePatterns: UsagePattern[]
  ): Promise<OptimalStructure> {

    // 1. 정보 분류 체계 구축
    const taxonomy = await this.buildInformationTaxonomy(information);

    // 2. 관계 매핑
    const relationships = await this.mapInformationRelationships(
      information,
      taxonomy
    );

    // 3. 접근 패턴 분석
    const accessAnalysis = await this.analyzeAccessPatterns(
      usagePatterns,
      relationships
    );

    // 4. 구조 최적화
    const optimizedStructure = await this.optimizeStructure(
      taxonomy,
      relationships,
      accessAnalysis
    );

    return {
      taxonomy,
      relationships,
      accessAnalysis,
      structure: optimizedStructure,
      performance: await this.predictPerformance(optimizedStructure),
      recommendations: await this.generateOptimizationRecommendations(
        optimizedStructure
      )
    };
  }

  // 적응형 정보 구조
  async createAdaptiveStructure(
    baseStructure: InformationStructure,
    contextRequirements: ContextRequirement[]
  ): Promise<AdaptiveStructure> {

    const adaptationRules: AdaptationRule[] = [
      {
        trigger: 'high-frequency-access',
        action: 'promote-to-top-level',
        weight: 0.8
      },
      {
        trigger: 'related-information-clustering',
        action: 'group-related-items',
        weight: 0.7
      },
      {
        trigger: 'temporal-locality',
        action: 'cache-recent-access',
        weight: 0.6
      },
      {
        trigger: 'context-relevance',
        action: 'prioritize-relevant-info',
        weight: 0.9
      }
    ];

    const adaptiveLogic = await this.buildAdaptationLogic(adaptationRules);

    return {
      baseStructure,
      adaptationRules,
      adaptiveLogic,
      monitor: await this.createStructureMonitor(),
      optimizer: await this.createStructureOptimizer()
    };
  }
}
```

### 컨텍스트 품질 관리

```typescript
// 컨텍스트 품질 보증
class ContextQualityManager {
  private qualityMetrics: QualityMetric[];
  private validator: ContextValidator;
  private improver: ContextImprover;

  async assessContextQuality(
    context: Context,
    qualityStandards: QualityStandard[]
  ): Promise<QualityAssessment> {

    const assessments: QualityDimension[] = [
      {
        dimension: 'completeness',
        score: await this.assessCompleteness(context),
        weight: 0.25
      },
      {
        dimension: 'accuracy',
        score: await this.assessAccuracy(context),
        weight: 0.30
      },
      {
        dimension: 'relevance',
        score: await this.assessRelevance(context),
        weight: 0.20
      },
      {
        dimension: 'clarity',
        score: await this.assessClarity(context),
        weight: 0.15
      },
      {
        dimension: 'consistency',
        score: await this.assessConsistency(context),
        weight: 0.10
      }
    ];

    const overallScore = this.calculateWeightedScore(assessments);

    return {
      overallScore,
      dimensions: assessments,
      issues: await this.identifyQualityIssues(context, assessments),
      recommendations: await this.generateQualityRecommendations(
        context,
        assessments
      ),
      improvement: await this.suggestQualityImprovements(context, assessments)
    };
  }

  // 자동 품질 개선
  async improveContextQuality(
    context: Context,
    qualityAssessment: QualityAssessment
  ): Promise<ImprovedContext> {

    const improvements: QualityImprovement[] = [];

    // 완성도 개선
    if (qualityAssessment.dimensions.find(d => d.dimension === 'completeness')?.score < 0.8) {
      const completenessImprovements = await this.improveCompleteness(context);
      improvements.push(...completenessImprovements);
    }

    // 정확성 개선
    if (qualityAssessment.dimensions.find(d => d.dimension === 'accuracy')?.score < 0.8) {
      const accuracyImprovements = await this.improveAccuracy(context);
      improvements.push(...accuracyImprovements);
    }

    // 관련성 개선
    if (qualityAssessment.dimensions.find(d => d.dimension === 'relevance')?.score < 0.8) {
      const relevanceImprovements = await this.improveRelevance(context);
      improvements.push(...relevanceImprovements);
    }

    // 개선사항 적용
    const improvedContext = await this.applyImprovements(context, improvements);

    // 개선 효과 검증
    const postImprovementAssessment = await this.assessContextQuality(
      improvedContext,
      qualityAssessment.standards
    );

    return {
      original: context,
      improved: improvedContext,
      improvements,
      qualityGain: this.calculateQualityGain(
        qualityAssessment,
        postImprovementAssessment
      ),
      verification: postImprovementAssessment
    };
  }
}
```

## SuperClaude 컨텍스트 관리 명령어

```bash
# 컨텍스트 최적화
/context optimize --target-tokens 8000 --priority high

# 프로젝트 컨텍스트 분석
/context analyze --project-structure --dependencies

# 컨텍스트 압축
/context compress --ratio 0.7 --preserve-semantics

# 동적 컨텍스트 로딩
/context load --module auth --related-components

# 컨텍스트 품질 평가
/context quality --assess --improve --validate

# 대용량 프로젝트 관리
/context enterprise --boundaries --caching --sync

# 컨텍스트 경계 정의
/context boundaries --domain --technical --team

# 실시간 동기화
/context sync --real-time --conflict-resolution

# 캐시 최적화
/context cache --strategy intelligent --prefetch

# 정보 구조화
/context structure --taxonomy --relationships --adaptive
```

## 베스트 프랙티스

### 컨텍스트 관리 원칙

```markdown
1. **계층적 구조화**
   - 글로벌 → 프로젝트 → 모듈 → 세션 순으로 계층화
   - 각 계층별 역할과 책임 명확히 정의
   - 계층 간 의존성 최소화

2. **동적 적응성**
   - 작업 특성에 따른 컨텍스트 동적 조정
   - 실시간 우선순위 재계산
   - 사용 패턴 학습 및 적용

3. **품질 중심 접근**
   - 정보의 정확성과 관련성 우선
   - 지속적인 품질 모니터링
   - 자동 품질 개선 프로세스

4. **효율성 최적화**
   - 토큰 사용량 최적화
   - 압축 기법 활용
   - 캐싱 전략 구현

5. **일관성 유지**
   - 컨텍스트 간 동기화
   - 충돌 해결 메커니즘
   - 버전 관리 및 추적
```

### 대용량 프로젝트 관리 전략

```markdown
1. **모듈화 전략**
   - 도메인별 컨텍스트 분리
   - 느슨한 결합, 높은 응집도
   - 명확한 인터페이스 정의

2. **캐싱 전략**
   - 다단계 캐시 구조
   - 지능형 프리페칭
   - 효율적인 무효화 정책

3. **동기화 전략**
   - 실시간 변경 감지
   - 충돌 해결 알고리즘
   - 일관성 검증 메커니즘

4. **성능 최적화**
   - 접근 패턴 분석
   - 구조 최적화
   - 병목 지점 제거
```

이 고급 컨텍스트 관리 가이드를 통해 대용량 프로젝트에서도 Claude와 효율적으로 협업할 수 있으며, 제한된 리소스 내에서 최대한의 성과를 달성할 수 있습니다.