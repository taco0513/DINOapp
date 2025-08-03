# 문서화 자동화

## 개요

개발하면서 자연스럽게 문서가 만들어지는 시스템을 구축하는 방법을 다룹니다. 코드와 문서가 항상 동기화되어 AI가 정확한 컨텍스트를 이해할 수 있도록 합니다.

## 코드에서 문서 추출

### 자동 문서 생성 시스템

```typescript
// 코드 분석 및 문서 생성기
class CodeDocumentationExtractor {
  private parser: CodeParser;
  private analyzer: CodeAnalyzer;
  private generator: DocumentationGenerator;

  async extractDocumentation(
    filePath: string
  ): Promise<Documentation> {
    // 1. 코드 파싱
    const ast = await this.parser.parse(filePath);

    // 2. 코드 분석
    const analysis = await this.analyzer.analyze(ast);

    // 3. 컨텍스트 추출
    const context = {
      purpose: this.extractPurpose(ast),
      dependencies: this.extractDependencies(ast),
      exports: this.extractExports(ast),
      patterns: this.identifyPatterns(analysis),
      complexity: this.calculateComplexity(ast)
    };

    // 4. 문서 생성
    return this.generator.generate({
      filePath,
      ast,
      analysis,
      context
    });
  }

  // WHY 주석 추출
  private extractWhyComments(ast: AST): WhyComment[] {
    const comments: WhyComment[] = [];

    ast.traverse({
      Comment(node) {
        const text = node.value.trim();

        // WHY, TRIED, CONTEXT 패턴 감지
        if (text.startsWith('WHY:')) {
          comments.push({
            type: 'why',
            content: text.substring(4).trim(),
            line: node.loc.start.line,
            context: this.getNodeContext(node)
          });
        } else if (text.startsWith('TRIED:')) {
          comments.push({
            type: 'tried',
            content: text.substring(6).trim(),
            line: node.loc.start.line
          });
        } else if (text.startsWith('CONTEXT:')) {
          comments.push({
            type: 'context',
            content: text.substring(8).trim(),
            line: node.loc.start.line
          });
        }
      }
    });

    return comments;
  }
}
```

### JSDoc에서 AI 컨텍스트 추출

```typescript
// JSDoc 기반 문서화
class JSDocExtractor {
  extractFromJSDoc(comment: string): AIContext {
    const lines = comment.split('\n');
    const context: AIContext = {
      description: '',
      parameters: [],
      returns: null,
      examples: [],
      related: [],
      gotchas: [],
      patterns: []
    };

    let currentSection = 'description';

    for (const line of lines) {
      const trimmed = line.trim().replace(/^\* ?/, '');

      // 태그 감지
      if (trimmed.startsWith('@')) {
        const [tag, ...rest] = trimmed.split(' ');
        const content = rest.join(' ');

        switch (tag) {
          case '@param':
            const [name, ...desc] = content.split(' ');
            context.parameters.push({
              name,
              description: desc.join(' ')
            });
            break;

          case '@returns':
            context.returns = content;
            break;

          case '@example':
            currentSection = 'example';
            break;

          case '@related':
            context.related.push(content);
            break;

          case '@gotcha':
          case '@warning':
            context.gotchas.push(content);
            break;

          case '@pattern':
            context.patterns.push(content);
            break;
        }
      } else if (currentSection === 'example') {
        context.examples.push(trimmed);
      } else if (currentSection === 'description') {
        context.description += trimmed + ' ';
      }
    }

    return context;
  }
}
```

## TypeScript 타입에서 문서 생성

### 타입 정보 문서화

```typescript
// TypeScript 타입 분석기
class TypeDocumentationGenerator {
  async generateFromTypes(
    sourceFile: ts.SourceFile
  ): Promise<TypeDocumentation> {
    const types: TypeDefinition[] = [];
    const interfaces: InterfaceDefinition[] = [];
    const functions: FunctionDefinition[] = [];

    // 타입 정의 수집
    ts.forEachChild(sourceFile, node => {
      if (ts.isTypeAliasDeclaration(node)) {
        types.push(this.extractTypeAlias(node));
      } else if (ts.isInterfaceDeclaration(node)) {
        interfaces.push(this.extractInterface(node));
      } else if (ts.isFunctionDeclaration(node)) {
        functions.push(this.extractFunction(node));
      }
    });

    // 문서 생성
    return {
      types: types.map(type => this.documentType(type)),
      interfaces: interfaces.map(iface => this.documentInterface(iface)),
      functions: functions.map(func => this.documentFunction(func)),
      relationships: this.analyzeRelationships(types, interfaces, functions)
    };
  }

  private documentInterface(
    iface: InterfaceDefinition
  ): InterfaceDocumentation {
    return {
      name: iface.name,
      description: this.generateDescription(iface),
      properties: iface.properties.map(prop => ({
        name: prop.name,
        type: this.typeToString(prop.type),
        optional: prop.optional,
        description: this.inferPropertyDescription(prop),
        examples: this.generatePropertyExamples(prop)
      })),
      usage: this.generateUsageExamples(iface),
      relatedTypes: this.findRelatedTypes(iface)
    };
  }
}
```

### 타입 관계 시각화

```typescript
// 타입 관계 분석기
class TypeRelationshipAnalyzer {
  analyzeRelationships(
    types: TypeDefinition[],
    interfaces: InterfaceDefinition[]
  ): RelationshipGraph {
    const graph = new RelationshipGraph();

    // 상속 관계 분석
    interfaces.forEach(iface => {
      if (iface.extends) {
        iface.extends.forEach(parent => {
          graph.addEdge(iface.name, parent, 'extends');
        });
      }
    });

    // 참조 관계 분석
    types.forEach(type => {
      const references = this.extractTypeReferences(type);
      references.forEach(ref => {
        graph.addEdge(type.name, ref, 'references');
      });
    });

    // 문서화를 위한 Mermaid 다이어그램 생성
    return {
      graph,
      mermaidDiagram: this.generateMermaidDiagram(graph),
      clusters: this.identifyClusters(graph),
      complexity: this.calculateGraphComplexity(graph)
    };
  }

  private generateMermaidDiagram(graph: RelationshipGraph): string {
    let diagram = 'graph TD\n';

    graph.edges.forEach(edge => {
      const arrow = edge.type === 'extends' ? '--|>' : '-->';
      diagram += `  ${edge.from}${arrow}${edge.to}\n`;
    });

    return diagram;
  }
}
```

## 자동 API 문서 생성

### OpenAPI/Swagger 자동 생성

```typescript
// API 문서 자동 생성기
class APIDocumentationGenerator {
  async generateOpenAPISpec(
    routes: Route[]
  ): Promise<OpenAPISpec> {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Auto-generated API documentation'
      },
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    };

    // 라우트별 문서 생성
    for (const route of routes) {
      const path = this.expressPathToOpenAPI(route.path);

      if (!spec.paths[path]) {
        spec.paths[path] = {};
      }

      spec.paths[path][route.method.toLowerCase()] = {
        summary: this.extractSummary(route),
        description: this.extractDescription(route),
        parameters: this.extractParameters(route),
        requestBody: this.extractRequestBody(route),
        responses: this.extractResponses(route),
        security: this.extractSecurity(route)
      };

      // 스키마 추출
      const schemas = this.extractSchemas(route);
      Object.assign(spec.components.schemas, schemas);
    }

    return spec;
  }

  // Express 라우트에서 파라미터 추출
  private extractParameters(route: Route): Parameter[] {
    const parameters: Parameter[] = [];

    // 경로 파라미터
    const pathParams = route.path.match(/:([^/]+)/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const name = param.substring(1);
        parameters.push({
          name,
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: this.inferParameterDescription(name)
        });
      });
    }

    // 쿼리 파라미터 (코드 분석으로 추출)
    const queryParams = this.analyzeQueryParameters(route.handler);
    parameters.push(...queryParams);

    return parameters;
  }
}
```

### Postman Collection 자동 생성

```typescript
// Postman Collection 생성기
class PostmanCollectionGenerator {
  generateCollection(
    apiSpec: OpenAPISpec,
    baseUrl: string
  ): PostmanCollection {
    const collection: PostmanCollection = {
      info: {
        name: apiSpec.info.title,
        description: apiSpec.info.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl
        }
      ]
    };

    // API 경로별 요청 생성
    Object.entries(apiSpec.paths).forEach(([path, methods]) => {
      const folder = {
        name: this.extractResourceName(path),
        item: []
      };

      Object.entries(methods).forEach(([method, operation]) => {
        const request = {
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            url: {
              raw: `{{baseUrl}}${path}`,
              host: ['{{baseUrl}}'],
              path: path.split('/').filter(Boolean)
            },
            header: this.generateHeaders(operation),
            body: this.generateRequestBody(operation)
          },
          response: this.generateExampleResponses(operation)
        };

        folder.item.push(request);
      });

      collection.item.push(folder);
    });

    return collection;
  }
}
```

## 코드 변경 추적

### Git 훅을 통한 자동 기록

```bash
#!/bin/bash
# .git/hooks/post-commit
# 커밋할 때마다 변경 사항 자동 기록

COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_DATE=$(git log -1 --pretty=%ad --date=iso)
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)

# JSON 형식으로 저장
cat >> docs/trace/commits.jsonl << EOF
{
  "hash": "$COMMIT_HASH",
  "message": "$COMMIT_MSG",
  "date": "$COMMIT_DATE",
  "files": [$(echo "$CHANGED_FILES" | awk '{printf "\"%s\",", $0}' | sed 's/,$//')]},
  "stats": {
    "insertions": $(git diff-tree --numstat HEAD | awk '{s+=$1} END {print s}'),
    "deletions": $(git diff-tree --numstat HEAD | awk '{s+=$2} END {print s}')
  }
}
EOF

# 파일별 컨텍스트 업데이트
for file in $CHANGED_FILES; do
  if [[ $file == *.ts || $file == *.js ]]; then
    # 파일 컨텍스트 자동 업데이트
    node scripts/update-context.js "$file" "$COMMIT_MSG"
  fi
done
```

### 코드 변경 영향 분석

```typescript
// 변경 영향 분석기
class ChangeImpactAnalyzer {
  async analyzeImpact(
    changedFile: string,
    changeType: 'added' | 'modified' | 'deleted'
  ): Promise<ImpactAnalysis> {
    const impactedFiles: Set<string> = new Set();
    const impactedTests: Set<string> = new Set();

    // 1. 직접 의존성 분석
    const directDependents = await this.findDirectDependents(changedFile);
    directDependents.forEach(file => impactedFiles.add(file));

    // 2. 간접 의존성 분석 (트랜지티브)
    const transitiveDependents = await this.findTransitiveDependents(
      changedFile,
      3 // 최대 3단계까지
    );
    transitiveDependents.forEach(file => impactedFiles.add(file));

    // 3. 테스트 파일 찾기
    const testFiles = await this.findRelatedTests(changedFile);
    testFiles.forEach(test => impactedTests.add(test));

    // 4. 문서 업데이트 필요 파일
    const docsToUpdate = await this.findRelatedDocumentation(changedFile);

    // 5. 영향도 점수 계산
    const impactScore = this.calculateImpactScore({
      directDependents: directDependents.length,
      transitiveDependents: transitiveDependents.length,
      testFiles: testFiles.length,
      changeType
    });

    return {
      changedFile,
      changeType,
      impactedFiles: Array.from(impactedFiles),
      impactedTests: Array.from(impactedTests),
      docsToUpdate,
      impactScore,
      riskLevel: this.assessRiskLevel(impactScore),
      recommendations: this.generateRecommendations(impactScore)
    };
  }
}
```

## 실시간 문서 동기화

### 파일 시스템 감시

```typescript
// 파일 변경 감시 및 문서 동기화
class DocumentationWatcher {
  private watcher: chokidar.FSWatcher;
  private documentationUpdater: DocumentationUpdater;

  async start() {
    this.watcher = chokidar.watch('src/**/*.{ts,js}', {
      ignored: /node_modules/,
      persistent: true
    });

    // 파일 변경 시 문서 업데이트
    this.watcher.on('change', async (path) => {
      console.log(`🔄 File changed: ${path}`);

      try {
        // 1. 코드 분석
        const analysis = await this.analyzeFile(path);

        // 2. 문서 업데이트
        await this.documentationUpdater.updateDocumentation(path, analysis);

        // 3. 관련 문서 업데이트
        await this.updateRelatedDocumentation(path, analysis);

        // 4. AI 컨텍스트 업데이트
        await this.updateAIContext(path, analysis);

        console.log(`✅ Documentation updated for ${path}`);
      } catch (error) {
        console.error(`❌ Error updating documentation for ${path}:`, error);
      }
    });

    // 새 파일 추가 시
    this.watcher.on('add', async (path) => {
      console.log(`➕ New file: ${path}`);
      await this.createInitialDocumentation(path);
    });
  }

  private async updateAIContext(
    filePath: string,
    analysis: FileAnalysis
  ) {
    const contextFile = `.claude/context/${path.basename(filePath)}.md`;

    const context = `
# ${filePath}

## PURPOSE
${analysis.purpose}

## DEPENDENCIES
${analysis.dependencies.map(dep => `- ${dep}`).join('\n')}

## EXPORTS
${analysis.exports.map(exp => `- ${exp.name}: ${exp.type}`).join('\n')}

## PATTERNS
${analysis.patterns.map(pattern => `- ${pattern}`).join('\n')}

## RECENT CHANGES
- ${new Date().toISOString()}: ${analysis.lastChange}

## COMPLEXITY
- Cyclomatic: ${analysis.complexity.cyclomatic}
- Cognitive: ${analysis.complexity.cognitive}
`;

    await fs.writeFile(contextFile, context);
  }
}
```

### 문서 품질 검증

```typescript
// 문서 품질 검사기
class DocumentationQualityChecker {
  async checkQuality(
    documentation: Documentation
  ): Promise<QualityReport> {
    const checks: QualityCheck[] = [];

    // 1. 완전성 검사
    checks.push({
      name: 'completeness',
      passed: this.checkCompleteness(documentation),
      score: this.calculateCompletenessScore(documentation),
      issues: this.findMissingElements(documentation)
    });

    // 2. 일관성 검사
    checks.push({
      name: 'consistency',
      passed: this.checkConsistency(documentation),
      score: this.calculateConsistencyScore(documentation),
      issues: this.findInconsistencies(documentation)
    });

    // 3. 업데이트 상태
    checks.push({
      name: 'freshness',
      passed: this.checkFreshness(documentation),
      score: this.calculateFreshnessScore(documentation),
      issues: this.findOutdatedSections(documentation)
    });

    // 4. 코드-문서 동기화
    checks.push({
      name: 'synchronization',
      passed: await this.checkSynchronization(documentation),
      score: await this.calculateSyncScore(documentation),
      issues: await this.findSyncIssues(documentation)
    });

    const overallScore = this.calculateOverallScore(checks);

    return {
      score: overallScore,
      grade: this.scoreToGrade(overallScore),
      checks,
      recommendations: this.generateRecommendations(checks),
      autoFixable: this.identifyAutoFixableIssues(checks)
    };
  }
}
```

## 다이어그램 자동 생성

### 아키텍처 다이어그램

```typescript
// 아키텍처 다이어그램 생성기
class ArchitectureDiagramGenerator {
  async generateDiagram(
    projectRoot: string
  ): Promise<ArchitectureDiagram> {
    // 1. 프로젝트 구조 분석
    const structure = await this.analyzeProjectStructure(projectRoot);

    // 2. 계층 분리
    const layers = this.identifyLayers(structure);

    // 3. 컴포넌트 관계 분석
    const relationships = await this.analyzeRelationships(structure);

    // 4. PlantUML 코드 생성
    const plantUML = `
@startuml Architecture
!define RECTANGLE class

skinparam componentStyle rectangle

package "Presentation Layer" {
  ${layers.presentation.map(comp =>
    `[${comp.name}] as ${comp.id}`
  ).join('\n  ')}
}

package "Business Logic Layer" {
  ${layers.business.map(comp =>
    `[${comp.name}] as ${comp.id}`
  ).join('\n  ')}
}

package "Data Access Layer" {
  ${layers.data.map(comp =>
    `[${comp.name}] as ${comp.id}`
  ).join('\n  ')}
}

${relationships.map(rel =>
  `${rel.from} --> ${rel.to} : ${rel.label}`
).join('\n')}

@enduml
`;

    return {
      plantUML,
      mermaid: this.convertToMermaid(plantUML),
      svg: await this.renderToSVG(plantUML),
      components: structure.components,
      relationships
    };
  }
}
```

### 시퀀스 다이어그램 자동 생성

```typescript
// 함수 호출 시퀀스 분석
class SequenceDiagramGenerator {
  async generateFromFunction(
    functionName: string,
    filePath: string
  ): Promise<SequenceDiagram> {
    // 1. 함수 호출 트레이스
    const callTrace = await this.traceFunctionCalls(functionName, filePath);

    // 2. 시퀀스 다이어그램 생성
    const mermaid = `
sequenceDiagram
    participant User
    ${this.extractParticipants(callTrace).map(p =>
      `participant ${p}`
    ).join('\n    ')}

    ${this.generateSequence(callTrace).map(call =>
      `${call.from}->>+${call.to}: ${call.method}(${call.params})`
    ).join('\n    ')}
`;

    return {
      mermaid,
      participants: this.extractParticipants(callTrace),
      interactions: callTrace,
      complexity: this.calculateSequenceComplexity(callTrace)
    };
  }
}
```

## SuperClaude 문서화 명령어

```bash
# 코드에서 문서 추출
/extract-docs --from src/ --format markdown

# JSDoc 기반 문서 생성
/generate-docs --source code --include-types --ai-context

# API 문서 자동 생성
/api-docs --openapi --postman --examples

# 타입 문서화
/type-docs --visualize --relationships --examples

# 코드 변경 추적
/track-changes --auto-commit --impact-analysis

# 실시간 동기화
/watch-docs --sync --update-ai-context

# 문서 품질 검사
/check-docs --quality --completeness --fix

# 다이어그램 생성
/generate-diagram --architecture --sequence --class

# 컨텍스트 업데이트
/update-context --current-file --related --ai-optimize

# 문서화 리포트
/doc-report --coverage --quality --recommendations
```

이 자동화 시스템을 통해 개발하면서 자연스럽게 문서가 생성되고 유지되어, AI가 항상 최신 컨텍스트를 이해할 수 있습니다.