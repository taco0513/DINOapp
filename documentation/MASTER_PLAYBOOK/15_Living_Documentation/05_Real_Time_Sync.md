# 실시간 동기화

## 개요

코드와 문서가 항상 동기화되도록 자동화 시스템을 구축합니다. 코드가 변경될 때마다 관련 문서가 자동으로 업데이트되고, AI가 항상 최신 상태를 인지할 수 있도록 합니다.

## 파일 감시 시스템

### 실시간 파일 감시기

```typescript
// 파일 변경 감시 및 동기화 시스템
class FileWatcherSystem {
  private watcher: chokidar.FSWatcher;
  private documentSync: DocumentSyncService;
  private contextUpdater: ContextUpdateService;
  
  async initialize() {
    this.watcher = chokidar.watch(['src/**/*', 'docs/**/*'], {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/*.log'
      ],
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // 파일 추가
    this.watcher.on('add', async (path) => {
      console.log(`🆕 New file: ${path}`);
      await this.handleNewFile(path);
    });
    
    // 파일 변경
    this.watcher.on('change', async (path) => {
      console.log(`🔄 Changed: ${path}`);
      await this.handleFileChange(path);
    });
    
    // 파일 삭제
    this.watcher.on('unlink', async (path) => {
      console.log(`🗑️  Deleted: ${path}`);
      await this.handleFileDelete(path);
    });
    
    // 디렉토리 변경
    this.watcher.on('addDir', async (path) => {
      console.log(`📁 New directory: ${path}`);
      await this.handleDirectoryChange(path);
    });
  }
  
  private async handleFileChange(filePath: string) {
    const fileType = this.getFileType(filePath);
    
    switch (fileType) {
      case 'code':
        await this.syncCodeChange(filePath);
        break;
      case 'documentation':
        await this.syncDocChange(filePath);
        break;
      case 'config':
        await this.syncConfigChange(filePath);
        break;
    }
  }
}
```

### 코드 변경 동기화

```typescript
// 코드 변경시 문서 동기화
class CodeDocumentSync {
  async syncCodeChange(filePath: string) {
    // 1. 코드 분석
    const analysis = await this.analyzeCode(filePath);
    
    // 2. 관련 문서 찾기
    const relatedDocs = await this.findRelatedDocuments(filePath);
    
    // 3. 문서 업데이트 필요성 확인
    const updateNeeded = await this.checkUpdateNeeded(analysis, relatedDocs);
    
    if (updateNeeded.length > 0) {
      // 4. 자동 업데이트 실행
      for (const doc of updateNeeded) {
        await this.updateDocument(doc, analysis);
      }
      
      // 5. AI 컨텍스트 업데이트
      await this.updateAIContext(filePath, analysis);
      
      // 6. 변경 알림
      await this.notifyChanges(filePath, updateNeeded);
    }
  }
  
  private async analyzeCode(filePath: string): Promise<CodeAnalysis> {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = this.parseCode(content);
    
    return {
      exports: this.extractExports(ast),
      imports: this.extractImports(ast),
      functions: this.extractFunctions(ast),
      classes: this.extractClasses(ast),
      complexity: this.calculateComplexity(ast),
      dependencies: this.analyzeDependencies(ast),
      patterns: this.identifyPatterns(ast),
      lastModified: new Date()
    };
  }
}
```

## 문서 자동 업데이트

### API 문서 동기화

```typescript
// API 엔드포인트 문서 자동 업데이트
class APIDocumentationSync {
  async syncAPIEndpoint(routeFile: string) {
    // 1. 라우트 파일 분석
    const routes = await this.extractRoutes(routeFile);
    
    // 2. OpenAPI 스펙 업데이트
    const openAPISpec = await this.updateOpenAPISpec(routes);
    
    // 3. Markdown 문서 업데이트
    await this.updateMarkdownDocs(routes);
    
    // 4. Postman 커렉션 업데이트
    await this.updatePostmanCollection(routes);
    
    // 5. 예시 코드 업데이트
    await this.updateExampleCode(routes);
  }
  
  private async extractRoutes(filePath: string): Promise<Route[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parse(content);
    const routes: Route[] = [];
    
    // Express 라우트 추출
    traverse(ast, {
      CallExpression(path) {
        if (this.isRouteDefinition(path)) {
          routes.push({
            method: this.extractMethod(path),
            path: this.extractPath(path),
            handler: this.extractHandler(path),
            middleware: this.extractMiddleware(path),
            validation: this.extractValidation(path),
            description: this.extractDescription(path)
          });
        }
      }
    });
    
    return routes;
  }
}
```

### 타입 정의 동기화

```typescript
// TypeScript 타입 정의 문서 동기화
class TypeDefinitionSync {
  async syncTypeDefinitions(typeFile: string) {
    const program = ts.createProgram([typeFile], {});
    const sourceFile = program.getSourceFile(typeFile);
    const typeChecker = program.getTypeChecker();
    
    const types: TypeDefinition[] = [];
    
    // 타입 정의 추출
    ts.forEachChild(sourceFile!, (node) => {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const type = typeChecker.getTypeAtLocation(node);
        const symbol = type.getSymbol();
        
        types.push({
          name: symbol?.getName() || '',
          kind: ts.isInterfaceDeclaration(node) ? 'interface' : 'type',
          properties: this.extractProperties(type, typeChecker),
          description: this.extractJSDoc(node),
          examples: this.generateExamples(type)
        });
      }
    });
    
    // 문서 업데이트
    await this.updateTypeDocumentation(types);
  }
  
  private async updateTypeDocumentation(types: TypeDefinition[]) {
    let markdown = '# Type Definitions\n\n';
    
    for (const type of types) {
      markdown += `## ${type.name}\n\n`;
      markdown += `${type.description}\n\n`;
      markdown += '```typescript\n';
      markdown += this.generateTypeSignature(type);
      markdown += '\n```\n\n';
      
      if (type.examples.length > 0) {
        markdown += '### Examples\n\n';
        for (const example of type.examples) {
          markdown += '```typescript\n';
          markdown += example;
          markdown += '\n```\n\n';
        }
      }
    }
    
    await fs.writeFile('docs/types.md', markdown);
  }
}
```

## 컨텍스트 자동 업데이트

### AI 컨텍스트 유지

```typescript
// AI를 위한 컨텍스트 자동 업데이트
class AIContextMaintainer {
  private contextCache = new Map<string, FileContext>();
  
  async maintainFileContext(filePath: string) {
    const context = await this.buildFileContext(filePath);
    const previousContext = this.contextCache.get(filePath);
    
    if (this.hasSignificantChanges(context, previousContext)) {
      // 컨텍스트 파일 업데이트
      await this.updateContextFile(filePath, context);
      
      // 관련 컨텍스트 업데이트
      await this.updateRelatedContexts(filePath, context);
      
      // 프로젝트 전체 컨텍스트 업데이트
      await this.updateProjectContext(filePath, context);
    }
    
    this.contextCache.set(filePath, context);
  }
  
  private async buildFileContext(filePath: string): Promise<FileContext> {
    const content = await fs.readFile(filePath, 'utf-8');
    const analysis = await this.analyzeFile(content, filePath);
    
    return {
      path: filePath,
      purpose: analysis.purpose,
      dependencies: analysis.dependencies,
      exports: analysis.exports,
      patterns: analysis.patterns,
      complexity: analysis.complexity,
      recentChanges: await this.getRecentChanges(filePath),
      relatedFiles: await this.findRelatedFiles(filePath),
      gotchas: this.extractGotchas(content),
      lastUpdated: new Date()
    };
  }
  
  private async updateContextFile(filePath: string, context: FileContext) {
    const contextPath = `.claude/context/${path.basename(filePath)}.md`;
    
    const markdown = `# ${filePath}

## PURPOSE
${context.purpose}

## DEPENDENCIES
${context.dependencies.map(d => `- ${d}`).join('\n')}

## EXPORTS
${context.exports.map(e => `- ${e.name}: ${e.type}`).join('\n')}

## PATTERNS
${context.patterns.map(p => `- ${p}`).join('\n')}

## COMPLEXITY
- Cyclomatic: ${context.complexity.cyclomatic}
- Cognitive: ${context.complexity.cognitive}

## RECENT CHANGES
${context.recentChanges.map(c => `- ${c.date}: ${c.message}`).join('\n')}

## RELATED FILES
${context.relatedFiles.map(f => `- ${f}`).join('\n')}

## GOTCHAS
${context.gotchas.map(g => `- ⚠️ ${g}`).join('\n')}

## LAST UPDATED
${context.lastUpdated.toISOString()}
`;
    
    await fs.ensureDir(path.dirname(contextPath));
    await fs.writeFile(contextPath, markdown);
  }
}
```

## 링크 검증 시스템

### 링크 자동 검증

```typescript
// 문서와 코드 간 링크 검증
class LinkValidationSystem {
  async validateAllLinks() {
    const results = {
      valid: 0,
      broken: 0,
      warnings: 0,
      issues: [] as LinkIssue[]
    };
    
    // 1. 코드에서 참조하는 파일 확인
    const codeReferences = await this.findCodeReferences();
    for (const ref of codeReferences) {
      if (!await this.fileExists(ref.target)) {
        results.broken++;
        results.issues.push({
          type: 'broken_code_reference',
          source: ref.source,
          target: ref.target,
          line: ref.line
        });
      } else {
        results.valid++;
      }
    }
    
    // 2. 문서에서 참조하는 코드 확인
    const docReferences = await this.findDocumentationReferences();
    for (const ref of docReferences) {
      if (!await this.fileExists(ref.target)) {
        results.broken++;
        results.issues.push({
          type: 'broken_doc_reference',
          source: ref.source,
          target: ref.target,
          line: ref.line
        });
      } else {
        results.valid++;
      }
    }
    
    // 3. 결과 리포트 생성
    await this.generateValidationReport(results);
    
    // 4. 자동 수정 가능한 것들 수정
    if (results.broken > 0) {
      await this.attemptAutoFix(results.issues);
    }
    
    return results;
  }
  
  private async attemptAutoFix(issues: LinkIssue[]) {
    for (const issue of issues) {
      // 비슷한 이름의 파일 찾기
      const suggestion = await this.findSimilarFile(issue.target);
      
      if (suggestion && suggestion.similarity > 0.8) {
        console.log(`🔧 Auto-fixing: ${issue.target} → ${suggestion.file}`);
        await this.updateReference(issue.source, issue.target, suggestion.file);
      }
    }
  }
}
```

## 변경 알림 시스템

### 팀 알림

```typescript
// 문서 변경 알림 시스템
class DocumentChangeNotifier {
  async notifyChanges(changes: Change[]) {
    // 1. 변경 사항 분류
    const categorized = this.categorizeChanges(changes);
    
    // 2. 영향도 분석
    const impact = await this.analyzeImpact(categorized);
    
    // 3. 관련자 식별
    const stakeholders = await this.identifyStakeholders(impact);
    
    // 4. 알림 생성
    for (const [stakeholder, relevantChanges] of stakeholders) {
      await this.sendNotification(stakeholder, {
        changes: relevantChanges,
        impact: impact[stakeholder.id],
        summary: this.generateSummary(relevantChanges),
        actions: this.suggestActions(relevantChanges)
      });
    }
    
    // 5. 변경 로그 기록
    await this.logChanges(changes);
  }
  
  private generateSummary(changes: Change[]): string {
    const summary = {
      added: changes.filter(c => c.type === 'add').length,
      modified: changes.filter(c => c.type === 'modify').length,
      deleted: changes.filter(c => c.type === 'delete').length,
      highImpact: changes.filter(c => c.impact === 'high').length
    };
    
    return `📢 Documentation Update Summary:
- 🆕 ${summary.added} new documents
- 🔄 ${summary.modified} updated documents
- 🗑️ ${summary.deleted} removed documents
${summary.highImpact > 0 ? `- ⚠️ ${summary.highImpact} high-impact changes` : ''}
`;
  }
}
```

## SuperClaude 동기화 명령어

```bash
# 파일 감시 시작
/watch --sync-docs --real-time

# 동기화 상태 확인
/sync-status --show-pending --show-conflicts

# 강제 동기화
/force-sync --all --regenerate

# API 문서 동기화
/sync-api-docs --openapi --postman

# 타입 정의 동기화
/sync-types --generate-docs --examples

# AI 컨텍스트 업데이트
/update-ai-context --current-file --related

# 링크 검증
/validate-links --auto-fix --report

# 변경 알림 설정
/configure-notifications --team --important-only

# 동기화 로그 확인
/sync-log --last-24h --errors-only

# 충돌 해결
/resolve-conflicts --interactive --backup
```

이 실시간 동기화 시스템을 통해 코드와 문서가 항상 일치하고, AI가 최신 컨텍스트를 파악할 수 있습니다.