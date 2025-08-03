# 🔧 Document Validation Scripts - 문서 검증 자동화 도구

## 📋 개요

AI가 문서를 제대로 읽고 따랐는지 자동으로 검증하는 스크립트 모음입니다.

## 🛠️ 핵심 검증 도구들

### 1. Document Compliance Checker

```typescript
// document-compliance-checker.ts
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

interface ComplianceReport {
  totalFiles: number;
  compliantFiles: number;
  violations: Violation[];
  documentCoverage: number;
  missingReferences: string[];
}

interface Violation {
  file: string;
  line: number;
  type: 'missing_reference' | 'incorrect_implementation' | 'unauthorized_change';
  description: string;
  documentReference?: string;
  severity: 'critical' | 'major' | 'minor';
}

class DocumentComplianceChecker {
  private projectDocs: Map<string, DocumentSpec> = new Map();
  private codebaseFiles: string[] = [];
  
  constructor(private projectRoot: string) {
    this.loadProjectDocuments();
    this.scanCodebase();
  }
  
  private loadProjectDocuments(): void {
    const docsPath = path.join(this.projectRoot, 'docs');
    const docFiles = this.getMarkdownFiles(docsPath);
    
    docFiles.forEach(docFile => {
      const content = fs.readFileSync(docFile, 'utf-8');
      const spec = this.parseDocumentSpec(content, docFile);
      this.projectDocs.set(docFile, spec);
    });
  }
  
  private parseDocumentSpec(content: string, filePath: string): DocumentSpec {
    // Extract specifications from markdown
    const spec: DocumentSpec = {
      filePath,
      requirements: [],
      prohibitions: [],
      apis: [],
      components: [],
      schemas: []
    };
    
    // Parse requirements sections
    const reqMatches = content.matchAll(/##\s*Requirements?\s*\n([\s\S]*?)(?=\n##|$)/gi);
    for (const match of reqMatches) {
      spec.requirements.push(...this.extractListItems(match[1]));
    }
    
    // Parse API specifications
    const apiMatches = content.matchAll(/###?\s*(?:API|Endpoint):\s*`([^`]+)`[\s\S]*?```(?:json|typescript)?\n([\s\S]*?)```/gi);
    for (const match of apiMatches) {
      spec.apis.push({
        endpoint: match[1],
        specification: match[2]
      });
    }
    
    // Parse component specifications
    const compMatches = content.matchAll(/###?\s*Component:\s*`([^`]+)`[\s\S]*?Props:\s*```(?:typescript|jsx)?\n([\s\S]*?)```/gi);
    for (const match of compMatches) {
      spec.components.push({
        name: match[1],
        props: match[2]
      });
    }
    
    return spec;
  }
  
  public async checkCompliance(): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      totalFiles: this.codebaseFiles.length,
      compliantFiles: 0,
      violations: [],
      documentCoverage: 0,
      missingReferences: []
    };
    
    for (const codeFile of this.codebaseFiles) {
      const violations = await this.checkFileCompliance(codeFile);
      if (violations.length === 0) {
        report.compliantFiles++;
      } else {
        report.violations.push(...violations);
      }
    }
    
    // Check document coverage
    report.documentCoverage = this.calculateDocumentCoverage();
    report.missingReferences = this.findMissingDocumentReferences();
    
    return report;
  }
  
  private async checkFileCompliance(filePath: string): Promise<Violation[]> {
    const violations: Violation[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for document reference comments
    const hasDocRef = /\/\/\s*DOC-REF:|\/\*\*[\s\S]*?@document-reference/i.test(content);
    if (!hasDocRef && this.requiresDocumentation(filePath)) {
      violations.push({
        file: filePath,
        line: 1,
        type: 'missing_reference',
        description: 'No document reference found in file',
        severity: 'major'
      });
    }
    
    // Parse and check API implementations
    if (filePath.includes('api/') || filePath.includes('routes/')) {
      violations.push(...await this.checkAPICompliance(filePath, content));
    }
    
    // Check component implementations
    if (filePath.match(/\.(tsx?|jsx?)$/) && content.includes('export')) {
      violations.push(...await this.checkComponentCompliance(filePath, content));
    }
    
    return violations;
  }
  
  private async checkAPICompliance(filePath: string, content: string): Promise<Violation[]> {
    const violations: Violation[] = [];
    
    // Extract API endpoints from code
    const endpointMatches = content.matchAll(/(?:router\.|app\.)(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi);
    
    for (const match of endpointMatches) {
      const endpoint = match[1];
      const isDocumented = this.isEndpointDocumented(endpoint);
      
      if (!isDocumented) {
        violations.push({
          file: filePath,
          line: this.getLineNumber(content, match.index!),
          type: 'unauthorized_change',
          description: `Endpoint '${endpoint}' not found in API documentation`,
          severity: 'critical'
        });
      }
    }
    
    return violations;
  }
  
  private generateComplianceReport(report: ComplianceReport): string {
    return `
# 📊 Document Compliance Report

Generated: ${new Date().toISOString()}

## Summary
- Total Files: ${report.totalFiles}
- Compliant Files: ${report.compliantFiles} (${(report.compliantFiles / report.totalFiles * 100).toFixed(1)}%)
- Document Coverage: ${(report.documentCoverage * 100).toFixed(1)}%
- Total Violations: ${report.violations.length}

## Violations by Severity
- Critical: ${report.violations.filter(v => v.severity === 'critical').length}
- Major: ${report.violations.filter(v => v.severity === 'major').length}
- Minor: ${report.violations.filter(v => v.severity === 'minor').length}

## Detailed Violations

${report.violations.map(v => `
### ${v.severity.toUpperCase()}: ${v.type}
- **File**: ${v.file}
- **Line**: ${v.line}
- **Description**: ${v.description}
${v.documentReference ? `- **Should reference**: ${v.documentReference}` : ''}
`).join('\n')}

## Missing Document References

${report.missingReferences.length > 0 ? 
  report.missingReferences.map(ref => `- ${ref}`).join('\n') : 
  'None - all code elements have document references ✅'}

## Recommendations

${this.generateRecommendations(report)}
`;
  }
}

// 사용 예시
const checker = new DocumentComplianceChecker('./project');
const report = await checker.checkCompliance();
fs.writeFileSync('compliance-report.md', checker.generateComplianceReport(report));
```

### 2. Real-time Document Watcher

```typescript
// document-watcher.ts
import { watch } from 'chokidar';
import { EventEmitter } from 'events';

class DocumentWatcher extends EventEmitter {
  private documentState: Map<string, DocumentState> = new Map();
  private codebaseState: Map<string, CodeState> = new Map();
  
  constructor(private projectRoot: string) {
    super();
    this.initializeWatchers();
  }
  
  private initializeWatchers(): void {
    // Watch document changes
    const docWatcher = watch('docs/**/*.md', {
      cwd: this.projectRoot,
      ignoreInitial: false
    });
    
    docWatcher
      .on('add', path => this.handleDocumentAdded(path))
      .on('change', path => this.handleDocumentChanged(path))
      .on('unlink', path => this.handleDocumentRemoved(path));
    
    // Watch code changes
    const codeWatcher = watch(['src/**/*', 'app/**/*', 'pages/**/*'], {
      cwd: this.projectRoot,
      ignored: /node_modules/
    });
    
    codeWatcher
      .on('add', path => this.handleCodeAdded(path))
      .on('change', path => this.handleCodeChanged(path));
  }
  
  private handleDocumentChanged(docPath: string): void {
    console.log(`📝 Document changed: ${docPath}`);
    
    // Find all code files that reference this document
    const affectedFiles = this.findCodeFilesReferencingDocument(docPath);
    
    if (affectedFiles.length > 0) {
      this.emit('document-changed', {
        document: docPath,
        affectedFiles,
        message: `⚠️  ${affectedFiles.length} files may need updates due to document changes`
      });
      
      // Create a checklist for the developer
      this.createUpdateChecklist(docPath, affectedFiles);
    }
  }
  
  private handleCodeChanged(codePath: string): void {
    // Check if the code still complies with its referenced documents
    const compliance = this.checkFileDocumentCompliance(codePath);
    
    if (!compliance.isCompliant) {
      this.emit('compliance-violation', {
        file: codePath,
        violations: compliance.violations,
        message: `❌ Code changes violate document specifications`
      });
    }
  }
  
  private createUpdateChecklist(docPath: string, affectedFiles: string[]): void {
    const checklist = `
# 📋 Document Update Checklist

Document changed: ${docPath}
Time: ${new Date().toISOString()}

## Affected Files (${affectedFiles.length})

${affectedFiles.map((file, index) => `
### ${index + 1}. ${file}
- [ ] Review document changes
- [ ] Update implementation if needed
- [ ] Update doc reference comments
- [ ] Test changes
- [ ] Verify compliance
`).join('\n')}

## Verification Commands

\`\`\`bash
# Run compliance check
npm run check:compliance

# Run tests for affected files
npm test ${affectedFiles.join(' ')}

# Generate new compliance report
npm run report:compliance
\`\`\`
`;
    
    fs.writeFileSync('UPDATE_CHECKLIST.md', checklist);
    console.log('📝 Created UPDATE_CHECKLIST.md');
  }
}

// Usage
const watcher = new DocumentWatcher('./project');

watcher.on('document-changed', (event) => {
  console.log(event.message);
  // Could trigger AI to review changes
});

watcher.on('compliance-violation', (event) => {
  console.error(event.message);
  // Could block commit or deployment
});
```

### 3. AI Prompt Generator from Documents

```typescript
// prompt-generator.ts
class DocumentBasedPromptGenerator {
  private documents: Map<string, ParsedDocument> = new Map();
  
  constructor(private projectRoot: string) {
    this.loadAllDocuments();
  }
  
  public generateFeaturePrompt(featureName: string): string {
    const relevantDocs = this.findRelevantDocuments(featureName);
    
    return `
# 🔒 STRICT DOCUMENT-BASED IMPLEMENTATION

You must implement "${featureName}" following these documents EXACTLY:

${relevantDocs.map(doc => `
## 📄 ${doc.title} (${doc.path})

### Requirements:
${doc.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

### Constraints:
${doc.constraints.map((con, i) => `- ${con}`).join('\n')}

### References:
${doc.codeExamples.map(ex => `\`\`\`${ex.language}
${ex.code}
\`\`\``).join('\n')}
`).join('\n\n')}

## 🚨 COMPLIANCE RULES:

1. Every file you create must include:
   \`\`\`javascript
   // DOC-REF: [document-path]#[section]
   // SPEC: [exact requirement being implemented]
   // COMPLIANCE: verified | pending
   \`\`\`

2. Any deviation requires:
   \`\`\`javascript
   // DEVIATION: [what changed]
   // REASON: [why necessary]
   // IMPACT: [what it affects]
   // APPROVED: [yes/no]
   \`\`\`

3. Before creating any file, state:
   - Which document section authorizes this file
   - What requirement it fulfills
   - Its exact location according to FOLDER_STRUCTURE.md

## 📋 Implementation Checklist:

Create these files in order:
${this.generateImplementationChecklist(featureName, relevantDocs)}

Say "Ready to implement ${featureName} with strict document compliance" to begin.
`;
  }
  
  public generateValidationPrompt(featureName: string): string {
    return `
# ✅ DOCUMENT COMPLIANCE VALIDATION

Validate the implementation of "${featureName}" against project documents:

## 1. Document Reference Check
For each file created, verify:
- [ ] Has DOC-REF comment pointing to authorizing document
- [ ] Reference is accurate (check line numbers)
- [ ] Implementation matches specification exactly

## 2. Requirement Coverage
Check against requirements document:
${this.getRequirementsChecklist(featureName)}

## 3. API Compliance
Verify all endpoints against API specification:
${this.getAPIChecklist(featureName)}

## 4. UI Component Compliance
Check all components against design system:
${this.getUIChecklist(featureName)}

## 5. Create Compliance Report
Generate: compliance-report-${featureName}.md with:
- Coverage percentage
- Deviations (if any)
- Missing implementations
- Validation test results

Run this validation and provide the complete report.
`;
  }
  
  private generateImplementationChecklist(feature: string, docs: ParsedDocument[]): string {
    const tasks: ImplementationTask[] = [];
    
    // Extract implementation tasks from documents
    docs.forEach(doc => {
      if (doc.type === 'api') {
        doc.endpoints.forEach(endpoint => {
          tasks.push({
            order: tasks.length + 1,
            type: 'api',
            description: `Implement ${endpoint.method} ${endpoint.path}`,
            documentRef: `${doc.path}#${endpoint.id}`,
            location: `src/api/${endpoint.resource}/`
          });
        });
      }
      
      if (doc.type === 'ui') {
        doc.components.forEach(component => {
          tasks.push({
            order: tasks.length + 1,
            type: 'component',
            description: `Create ${component.name} component`,
            documentRef: `${doc.path}#${component.id}`,
            location: `src/components/${component.category}/`
          });
        });
      }
    });
    
    return tasks.map(task => 
      `${task.order}. [ ] ${task.description}\n   - Doc: ${task.documentRef}\n   - Location: ${task.location}`
    ).join('\n');
  }
}

// Usage example
const generator = new DocumentBasedPromptGenerator('./project');

// Generate implementation prompt
const implementPrompt = generator.generateFeaturePrompt('user-authentication');
console.log(implementPrompt);

// Generate validation prompt  
const validatePrompt = generator.generateValidationPrompt('user-authentication');
console.log(validatePrompt);
```

### 4. Git Pre-commit Hook for Document Compliance

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Checking document compliance..."

# Run compliance checker
npm run check:compliance --silent

if [ $? -ne 0 ]; then
  echo "❌ Document compliance check failed!"
  echo "📋 Please review compliance-report.md for details"
  echo ""
  echo "Common issues:"
  echo "- Missing DOC-REF comments in new files"
  echo "- API endpoints not matching documentation"
  echo "- Components missing design system references"
  echo ""
  echo "Run 'npm run fix:compliance' to add missing references"
  exit 1
fi

# Check for document references in staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$')

for file in $staged_files; do
  if ! grep -q "DOC-REF\|@document-reference" "$file"; then
    echo "⚠️  Warning: $file has no document reference"
    echo "Add a reference comment like:"
    echo "  // DOC-REF: docs/API_SPEC.md#user-endpoints"
  fi
done

echo "✅ Document compliance check passed!"
```

## 📊 Compliance Dashboard Generator

```typescript
// compliance-dashboard.ts
class ComplianceDashboard {
  public generateHTML(report: ComplianceReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Document Compliance Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .metric { display: inline-block; padding: 20px; margin: 10px; border-radius: 8px; }
    .metric.good { background: #d4edda; color: #155724; }
    .metric.warning { background: #fff3cd; color: #856404; }
    .metric.error { background: #f8d7da; color: #721c24; }
    .violation { margin: 10px 0; padding: 10px; border-left: 4px solid #dc3545; }
    .chart { width: 100%; height: 300px; }
  </style>
</head>
<body>
  <h1>📊 Document Compliance Dashboard</h1>
  
  <div class="metrics">
    <div class="metric ${report.compliantFiles / report.totalFiles > 0.9 ? 'good' : 'warning'}">
      <h2>${((report.compliantFiles / report.totalFiles) * 100).toFixed(1)}%</h2>
      <p>File Compliance</p>
    </div>
    
    <div class="metric ${report.documentCoverage > 0.8 ? 'good' : 'error'}">
      <h2>${(report.documentCoverage * 100).toFixed(1)}%</h2>
      <p>Document Coverage</p>
    </div>
    
    <div class="metric ${report.violations.length < 10 ? 'good' : 'error'}">
      <h2>${report.violations.length}</h2>
      <p>Total Violations</p>
    </div>
  </div>
  
  <h2>Violations by Type</h2>
  <canvas id="violationsChart" class="chart"></canvas>
  
  <h2>Critical Violations</h2>
  ${report.violations
    .filter(v => v.severity === 'critical')
    .map(v => `
      <div class="violation">
        <strong>${v.file}:${v.line}</strong><br>
        ${v.description}
      </div>
    `).join('')}
  
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // Render violations chart
    const ctx = document.getElementById('violationsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Missing Reference', 'Incorrect Implementation', 'Unauthorized Change'],
        datasets: [{
          label: 'Violations',
          data: [
            ${report.violations.filter(v => v.type === 'missing_reference').length},
            ${report.violations.filter(v => v.type === 'incorrect_implementation').length},
            ${report.violations.filter(v => v.type === 'unauthorized_change').length}
          ],
          backgroundColor: ['#ffc107', '#dc3545', '#6c757d']
        }]
      }
    });
  </script>
</body>
</html>
`;
  }
}
```

## 🚀 통합 사용법

### package.json 스크립트 추가

```json
{
  "scripts": {
    "check:compliance": "ts-node scripts/document-compliance-checker.ts",
    "watch:compliance": "ts-node scripts/document-watcher.ts",
    "generate:prompt": "ts-node scripts/prompt-generator.ts",
    "report:compliance": "ts-node scripts/compliance-dashboard.ts",
    "fix:compliance": "ts-node scripts/add-doc-references.ts"
  }
}
```

### 일일 검증 워크플로우

```bash
# 아침에 프로젝트 시작할 때
npm run check:compliance

# 개발 중 실시간 모니터링
npm run watch:compliance

# AI에게 작업 지시할 때
npm run generate:prompt -- --feature "user-profile"

# 작업 완료 후 검증
npm run report:compliance

# 커밋 전 자동 검증 (pre-commit hook이 처리)
git commit -m "feat: add user profile"
```

---

> 🎯 **"측정할 수 없으면 관리할 수 없다"**

이 자동화 도구들로 AI의 문서 준수를 완벽하게 관리하세요!