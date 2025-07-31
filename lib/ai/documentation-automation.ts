import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DocumentationContext {
  type: 'api' | 'component' | 'function' | 'class' | 'module';
  language: 'typescript' | 'javascript' | 'python' | 'go';
  complexity: 'simple' | 'moderate' | 'complex';
  framework?: string;
}

export interface GeneratedDocumentation {
  id: string;
  type: string;
  title: string;
  description: string;
  content: string;
  sections: {
    overview?: string;
    parameters?: string;
    returns?: string;
    examples?: string;
    notes?: string;
  };
  metadata: {
    generatedAt: Date;
    lastUpdated: Date;
    version: string;
  };
}

export class DocumentationAutomation extends EventEmitter {
  private watchedFiles: Map<string, Date> = new Map();
  private documentationCache: Map<string, GeneratedDocumentation> = new Map();

  constructor() {
    super();
  }

  // 파일 변경 감지 및 자동 문서화
  async watchFile(filePath: string, context: DocumentationContext) {
    const stats = await fs.stat(filePath);
    this.watchedFiles.set(filePath, stats.mtime);

    // 초기 문서 생성
    const doc = await this.generateDocumentation(filePath, context);
    this.documentationCache.set(filePath, doc);

    this.emit('documentation:generated', { filePath, documentation: doc });
  }

  // 코드를 분석하여 문서 생성
  async generateDocumentation(
    filePath: string,
    context: DocumentationContext
  ): Promise<GeneratedDocumentation> {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    // 코드 분석 및 문서 생성 로직
    switch (context.type) {
      case 'api':
        return this.generateAPIDocumentation(fileName, content, context);
      case 'component':
        return this.generateComponentDocumentation(fileName, content, context);
      case 'function':
        return this.generateFunctionDocumentation(fileName, content, context);
      default:
        return this.generateGenericDocumentation(fileName, content, context);
    }
  }

  // API 엔드포인트 문서화
  private async generateAPIDocumentation(
    fileName: string,
    content: string,
    context: DocumentationContext
  ): Promise<GeneratedDocumentation> {
    // HTTP 메서드 추출
    const methods = this.extractHTTPMethods(content);

    const doc: GeneratedDocumentation = {
      id: `doc_${Date.now()}`,
      type: 'api',
      title: `API Documentation: ${fileName}`,
      description: 'RESTful API 엔드포인트 문서',
      content: '',
      sections: {
        overview: `## Overview\n\n이 API는 ${fileName}에 정의된 RESTful 엔드포인트를 제공합니다.`,
        parameters: this.generateAPIParameters(methods),
        returns: this.generateAPIResponses(methods),
        examples: this.generateAPIExamples(methods),
        notes:
          '## 보안 고려사항\n\n- 모든 요청은 인증이 필요합니다\n- HTTPS를 사용하여 통신하세요',
      },
      metadata: {
        generatedAt: new Date(),
        lastUpdated: new Date(),
        version: '1.0.0',
      },
    };

    // 전체 컨텐츠 조합
    doc.content = this.combineDocumentationSections(doc.sections);
    return doc;
  }

  // React 컴포넌트 문서화
  private async generateComponentDocumentation(
    fileName: string,
    content: string,
    context: DocumentationContext
  ): Promise<GeneratedDocumentation> {
    // Props 추출
    const props = this.extractComponentProps(content);
    const componentName = this.extractComponentName(content);

    const doc: GeneratedDocumentation = {
      id: `doc_${Date.now()}`,
      type: 'component',
      title: `${componentName} Component`,
      description: 'React 컴포넌트 문서',
      content: '',
      sections: {
        overview: `## Overview\n\n${componentName} 컴포넌트는 ${this.inferComponentPurpose(content)}를 위한 UI 컴포넌트입니다.`,
        parameters: this.generatePropsDocumentation(props),
        examples: this.generateComponentExamples(componentName, props),
        notes:
          '## 사용 시 주의사항\n\n- 필수 props를 확인하세요\n- 접근성을 고려하여 사용하세요',
      },
      metadata: {
        generatedAt: new Date(),
        lastUpdated: new Date(),
        version: '1.0.0',
      },
    };

    doc.content = this.combineDocumentationSections(doc.sections);
    return doc;
  }

  // 함수 문서화
  private async generateFunctionDocumentation(
    fileName: string,
    content: string,
    context: DocumentationContext
  ): Promise<GeneratedDocumentation> {
    const functions = this.extractFunctions(content);

    const doc: GeneratedDocumentation = {
      id: `doc_${Date.now()}`,
      type: 'function',
      title: `Functions in ${fileName}`,
      description: '함수 참고 문서',
      content: '',
      sections: {
        overview: `## Overview\n\n${fileName} 파일에 정의된 함수들입니다.`,
        parameters: this.generateFunctionParameters(functions),
        returns: this.generateFunctionReturns(functions),
        examples: this.generateFunctionExamples(functions),
      },
      metadata: {
        generatedAt: new Date(),
        lastUpdated: new Date(),
        version: '1.0.0',
      },
    };

    doc.content = this.combineDocumentationSections(doc.sections);
    return doc;
  }

  // 일반 문서화
  private async generateGenericDocumentation(
    fileName: string,
    content: string,
    context: DocumentationContext
  ): Promise<GeneratedDocumentation> {
    const doc: GeneratedDocumentation = {
      id: `doc_${Date.now()}`,
      type: context.type,
      title: fileName,
      description: '코드 문서',
      content: `# ${fileName}\n\n자동 생성된 문서입니다.`,
      sections: {
        overview: `## Overview\n\n${fileName} 파일에 대한 문서입니다.`,
      },
      metadata: {
        generatedAt: new Date(),
        lastUpdated: new Date(),
        version: '1.0.0',
      },
    };

    return doc;
  }

  // 헬퍼 메서드들
  private extractHTTPMethods(content: string): string[] {
    const methods = [];
    const patterns = [
      /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g,
      /\.get\s*\(/g,
      /\.post\s*\(/g,
      /\.put\s*\(/g,
      /\.delete\s*\(/g,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        methods.push(...matches);
      }
    });

    return methods;
  }

  private extractComponentProps(content: string): any[] {
    const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/s);
    if (!propsMatch) return [];

    const propsContent = propsMatch[1];
    const props = [];
    const propLines = propsContent.split('\n').filter(line => line.trim());

    propLines.forEach(line => {
      const propMatch = line.match(/(\w+)\s*\??\s*:\s*(.+);?/);
      if (propMatch) {
        props.push({
          name: propMatch[1],
          type: propMatch[2].trim(),
          required: !line.includes('?'),
        });
      }
    });

    return props;
  }

  private extractComponentName(content: string): string {
    const match = content.match(
      /(?:export\s+default\s+)?(?:function|const)\s+(\w+)/
    );
    return match ? match[1] : 'Component';
  }

  private extractFunctions(content: string): any[] {
    const functions = [];
    const functionPattern =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        params: match[2]
          .split(',')
          .map(p => p.trim())
          .filter(p => p),
      });
    }

    return functions;
  }

  private inferComponentPurpose(content: string): string {
    if (content.includes('form') || content.includes('Form')) {
      return '사용자 입력을 받기';
    }
    if (content.includes('list') || content.includes('List')) {
      return '데이터 목록을 표시하기';
    }
    if (content.includes('card') || content.includes('Card')) {
      return '정보를 카드 형태로 표시하기';
    }
    return '사용자 인터페이스를 구성하기';
  }

  private generateAPIParameters(methods: string[]): string {
    return `## Parameters\n\n| Method | Parameter | Type | Description |\n|--------|-----------|------|-------------|\n| GET | page | number | 페이지 번호 |\n| GET | limit | number | 페이지당 항목 수 |\n| POST | body | object | 요청 데이터 |`;
  }

  private generateAPIResponses(methods: string[]): string {
    return `## Responses\n\n### Success (200)\n\`\`\`json\n{\n  "success": true,\n  "data": {},\n  "message": "Success"\n}\n\`\`\`\n\n### Error (400)\n\`\`\`json\n{\n  "success": false,\n  "error": "Error message"\n}\n\`\`\``;
  }

  private generateAPIExamples(methods: string[]): string {
    return `## Examples\n\n### GET Request\n\`\`\`bash\ncurl -X GET https://api.example.com/endpoint\n\`\`\`\n\n### POST Request\n\`\`\`bash\ncurl -X POST https://api.example.com/endpoint \\\n  -H "Content-Type: application/json" \\\n  -d '{"key": "value"}'\n\`\`\``;
  }

  private generatePropsDocumentation(props: any[]): string {
    if (props.length === 0) return '';

    let doc =
      '## Props\n\n| Prop | Type | Required | Description |\n|------|------|----------|-------------|\n';

    props.forEach(prop => {
      doc += `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | - |\n`;
    });

    return doc;
  }

  private generateComponentExamples(
    componentName: string,
    props: any[]
  ): string {
    const propsExample = props
      .filter(p => p.required)
      .map(p => `  ${p.name}={${p.type === 'string' ? '"value"' : 'value'}}`)
      .join('\n');

    return `## Examples\n\n### Basic Usage\n\`\`\`tsx\n<${componentName}\n${propsExample}\n/>\n\`\`\``;
  }

  private generateFunctionParameters(functions: any[]): string {
    if (functions.length === 0) return '';

    let doc = '## Functions\n\n';
    functions.forEach(func => {
      doc += `### ${func.name}\n\nParameters: ${func.params.join(', ') || 'none'}\n\n`;
    });

    return doc;
  }

  private generateFunctionReturns(functions: any[]): string {
    return '## Return Values\n\n각 함수의 반환 값은 코드를 참고하세요.';
  }

  private generateFunctionExamples(functions: any[]): string {
    if (functions.length === 0) return '';

    let doc = '## Examples\n\n';
    functions.forEach(func => {
      doc += `### Using ${func.name}\n\`\`\`javascript\n${func.name}(${func.params.map(p => `/* ${p} */`).join(', ')});\n\`\`\`\n\n`;
    });

    return doc;
  }

  private combineDocumentationSections(sections: any): string {
    return Object.values(sections)
      .filter(section => section)
      .join('\n\n');
  }

  // 문서를 파일로 저장
  async saveDocumentation(doc: GeneratedDocumentation, outputPath: string) {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, doc.content, 'utf-8');

    this.emit('documentation:saved', { path: outputPath, documentation: doc });
  }

  // 자동 업데이트 체크
  async checkForUpdates() {
    for (const [filePath, lastModified] of this.watchedFiles) {
      try {
        const stats = await fs.stat(filePath);
        if (stats.mtime > lastModified) {
          this.emit('file:changed', {
            filePath,
            oldTime: lastModified,
            newTime: stats.mtime,
          });
          // 문서 재생성 트리거
          // 실제 구현에서는 컨텍스트를 저장하고 재생성
        }
      } catch (error) {
        this.emit('error', { filePath, error });
      }
    }
  }
}

// 싱글톤 인스턴스
export const _documentationEngine = new DocumentationAutomation();
