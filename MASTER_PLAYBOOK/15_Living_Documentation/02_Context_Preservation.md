# 컨텍스트 보존 전략

## 개요

개발 과정에서 발생하는 중요한 컨텍스트를 놓치지 않고 보존하는 전략을 다룹니다. AI가 언제든지 프로젝트 상황을 이해하고 효과적으로 도울 수 있도록 합니다.

## 컨텍스트 계층 구조

### 프로젝트 전체 컨텍스트

```typescript
// 프로젝트 컨텍스트 관리자
class ProjectContextManager {
  private contextLayers = {
    global: 'project-wide context',
    feature: 'current feature context',
    session: 'current session context',
    file: 'file-specific context'
  };

  async captureContext(
    level: keyof typeof this.contextLayers
  ): Promise<Context> {
    switch (level) {
      case 'global':
        return this.captureGlobalContext();
      case 'feature':
        return this.captureFeatureContext();
      case 'session':
        return this.captureSessionContext();
      case 'file':
        return this.captureFileContext();
    }
  }

  private async captureGlobalContext(): Promise<GlobalContext> {
    return {
      projectName: await this.getProjectName(),
      architecture: await this.analyzeArchitecture(),
      techStack: await this.identifyTechStack(),
      conventions: await this.extractConventions(),
      keyDecisions: await this.loadDecisionRecords(),
      teamStructure: await this.getTeamInfo(),
      currentPhase: await this.identifyProjectPhase()
    };
  }
}
```

### 의사결정 컨텍스트 기록

```typescript
// ADR (Architecture Decision Record) 관리
class ADRManager {
  async recordDecision(
    title: string,
    context: string,
    decision: string,
    consequences: string[]
  ): Promise<ADR> {
    const adr: ADR = {
      id: this.generateId(),
      date: new Date(),
      title,
      status: 'proposed',
      context,
      decision,
      consequences,
      alternatives: [],
      relatedFiles: await this.findRelatedFiles(title)
    };

    // 마크다운 파일로 저장
    const content = this.formatADR(adr);
    const filename = `docs/decisions/${adr.id}-${this.slugify(title)}.md`;

    await this.saveFile(filename, content);
    await this.updateIndex(adr);

    return adr;
  }

  private formatADR(adr: ADR): string {
    return `# ${adr.id}: ${adr.title}

Date: ${adr.date.toISOString()}
Status: ${adr.status}

## Context

${adr.context}

## Decision

${adr.decision}

## Consequences

${adr.consequences.map(c => `- ${c}`).join('\n')}

## Related Files

${adr.relatedFiles.map(f => `- ${f}`).join('\n')}
`;
  }
}
```

## 동적 컨텍스트 수집

### 코딩 세션 추적

```typescript
// 코딩 세션 컨텍스트 수집기
class CodingSessionTracker {
  private session: CodingSession;

  startSession(purpose: string) {
    this.session = {
      id: uuid(),
      startTime: new Date(),
      purpose,
      filesModified: [],
      decisions: [],
      errors: [],
      learnings: []
    };

    // 파일 변경 감지
    this.watchFileChanges();

    // 에러 수집
    this.captureErrors();

    // 터미널 명령어 추적
    this.trackCommands();
  }

  private watchFileChanges() {
    const watcher = chokidar.watch('src/**/*', {
      ignored: /node_modules/
    });

    watcher.on('change', (path) => {
      this.session.filesModified.push({
        path,
        timestamp: new Date(),
        changes: this.detectChanges(path)
      });
    });
  }

  async endSession(): Promise<SessionSummary> {
    const summary = {
      ...this.session,
      endTime: new Date(),
      duration: this.calculateDuration(),
      impact: await this.analyzeImpact(),
      nextSteps: this.suggestNextSteps()
    };

    // AI용 컨텍스트 파일 생성
    await this.saveSessionContext(summary);

    return summary;
  }
}
```

### 에러 컨텍스트 자동 수집

```typescript
// 에러 컨텍스트 수집기
class ErrorContextCollector {
  async collectErrorContext(
    error: Error,
    additionalInfo?: any
  ): Promise<ErrorContext> {
    const context: ErrorContext = {
      timestamp: new Date(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cwd: process.cwd()
      },
      session: await this.getCurrentSession(),
      relatedFiles: await this.findRelatedFiles(error),
      recentActions: await this.getRecentActions(),
      additionalInfo
    };

    // 자동으로 에러 문서 생성
    await this.createErrorDocument(context);

    // AI 친화적 형식으로 저장
    await this.saveForAI(context);

    return context;
  }

  private async findRelatedFiles(error: Error): Promise<string[]> {
    const stackFiles = this.extractFilesFromStack(error.stack);
    const recentlyModified = await this.getRecentlyModifiedFiles();
    const imports = await this.findImportChain(stackFiles[0]);

    return [...new Set([...stackFiles, ...recentlyModified, ...imports])];
  }
}
```

## 컨텍스트 연결 시스템

### 파일 간 관계 추적

```typescript
// 파일 관계 분석기
class FileRelationshipAnalyzer {
  async analyzeRelationships(
    rootFile: string
  ): Promise<FileRelationshipGraph> {
    const graph = new Graph();
    const visited = new Set<string>();

    const analyze = async (file: string) => {
      if (visited.has(file)) return;
      visited.add(file);

      const content = await fs.readFile(file, 'utf-8');

      // Import 분석
      const imports = this.extractImports(content);
      for (const imp of imports) {
        graph.addEdge(file, imp.source, 'imports');
        await analyze(imp.source);
      }

      // Export 분석
      const exports = this.extractExports(content);
      graph.setNodeData(file, { exports });

      // 주석에서 관계 추출
      const relatedFiles = this.extractRelatedFromComments(content);
      for (const related of relatedFiles) {
        graph.addEdge(file, related, 'related');
      }
    };

    await analyze(rootFile);

    return {
      graph,
      clusters: this.identifyClusters(graph),
      keyFiles: this.identifyKeyFiles(graph),
      documentation: this.generateDocumentation(graph)
    };
  }
}
```

### 시간 기반 컨텍스트 연결

```typescript
// 시간 기반 컨텍스트 연결
class TemporalContextLinker {
  async linkTemporalContext(
    timeRange: { start: Date; end: Date }
  ): Promise<TemporalContext> {
    // Git 커밋 히스토리
    const commits = await this.getCommitsInRange(timeRange);

    // 에러 로그
    const errors = await this.getErrorsInRange(timeRange);

    // 결정 사항
    const decisions = await this.getDecisionsInRange(timeRange);

    // 파일 변경
    const fileChanges = await this.getFileChangesInRange(timeRange);

    // 시간순 이벤트 구성
    const timeline = this.constructTimeline([
      ...commits.map(c => ({ type: 'commit', ...c })),
      ...errors.map(e => ({ type: 'error', ...e })),
      ...decisions.map(d => ({ type: 'decision', ...d })),
      ...fileChanges.map(f => ({ type: 'file_change', ...f }))
    ]);

    return {
      timeRange,
      timeline,
      summary: this.generateSummary(timeline),
      insights: this.extractInsights(timeline),
      patterns: this.identifyPatterns(timeline)
    };
  }
}
```

## AI 친화적 컨텍스트 포맷

### 구조화된 컨텍스트 템플릿

```typescript
// AI 컨텍스트 포매터
class AIContextFormatter {
  formatForAI(context: any): AIFormattedContext {
    return {
      // 즉시 이해 가능한 요약
      summary: {
        what: this.extractPurpose(context),
        why: this.extractReasoning(context),
        how: this.extractApproach(context),
        when: this.extractTimeline(context)
      },

      // 구조화된 데이터
      structured: {
        files: this.formatFileList(context.files),
        dependencies: this.formatDependencies(context.dependencies),
        patterns: this.formatPatterns(context.patterns),
        constraints: this.formatConstraints(context.constraints)
      },

      // 관계 정보
      relationships: {
        imports: this.formatImportGraph(context.imports),
        exports: this.formatExportMap(context.exports),
        related: this.formatRelatedFiles(context.related),
        impacts: this.formatImpactAnalysis(context.impacts)
      },

      // 히스토리
      history: {
        recentChanges: this.formatRecentChanges(context.changes),
        decisions: this.formatDecisions(context.decisions),
        errors: this.formatErrors(context.errors),
        learnings: this.formatLearnings(context.learnings)
      },

      // 액션 가능한 정보
      actionable: {
        currentFocus: context.currentFocus,
        blockers: context.blockers,
        nextSteps: context.nextSteps,
        warnings: context.warnings
      }
    };
  }
}
```

### 컨텍스트 우선순위 시스템

```typescript
// 컨텍스트 우선순위 관리
class ContextPriorityManager {
  prioritizeContext(
    contexts: Context[]
  ): PrioritizedContext[] {
    return contexts
      .map(context => ({
        ...context,
        priority: this.calculatePriority(context),
        relevance: this.calculateRelevance(context)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // 상위 10개만
  }

  private calculatePriority(context: Context): number {
    let score = 0;

    // 최신성 (0-40점)
    const age = Date.now() - context.timestamp.getTime();
    score += Math.max(0, 40 - (age / (1000 * 60 * 60 * 24))); // 일 단위

    // 영향도 (0-30점)
    score += context.impactedFiles.length * 3;

    // 관련성 (0-20점)
    if (context.relatedToCurrentWork) score += 20;

    // 중요도 (0-10점)
    if (context.critical) score += 10;

    return score;
  }
}
```

## 컨텍스트 검색 및 활용

### 스마트 컨텍스트 검색

```typescript
// 컨텍스트 검색 엔진
class ContextSearchEngine {
  async searchContext(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResults> {
    const indices = [
      this.searchFiles(query),
      this.searchCommits(query),
      this.searchDecisions(query),
      this.searchErrors(query),
      this.searchDocumentation(query)
    ];

    const results = await Promise.all(indices);

    // 결과 통합 및 랭킹
    const merged = this.mergeResults(results);
    const ranked = this.rankResults(merged, query);

    // AI를 위한 컨텍스트 구성
    const context = this.buildContextFromResults(ranked);

    return {
      results: ranked,
      context,
      suggestions: this.generateSuggestions(ranked),
      relatedQueries: this.suggestRelatedQueries(query, ranked)
    };
  }
}
```

## SuperClaude 컨텍스트 명령어

```bash
# 전체 컨텍스트 수집
/capture-context --all --format ai-friendly

# 세션 컨텍스트 시작
/start-session "새 기능 개발" --track-all

# 에러 컨텍스트 자동 수집
/enable error-context --auto-capture --include-related

# 결정사항 기록
/record-decision "API 설계" --adr --link-files

# 파일 관계 분석
/analyze-relationships --from src/index.ts --depth 3

# 시간 기반 컨텍스트
/temporal-context --last-week --include-all

# 컨텍스트 검색
/search-context "authentication" --include-history

# AI용 컨텍스트 준비
/prepare-ai-context --current-task --optimize

# 컨텍스트 우선순위
/prioritize-context --for-current-work

# 컨텍스트 연결
/link-context --temporal --relational --semantic
```

이 컨텍스트 보존 전략을 통해 개발 과정의 모든 중요한 정보를 놓치지 않고 AI가 활용할 수 있도록 합니다.