#!/usr/bin/env node
/**
 * Context Optimizer for Claude Code
 * 토큰 사용량을 최적화하는 자동화 도구
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ProjectConfig {
  tokenLimits: {
    warning: number;
    max: number;
  };
  compression: {
    level: 'aggressive' | 'moderate' | 'light';
  };
  commonIssues: string[];
}

interface AnalysisResult {
  keywords: string[];
  errorType?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  projectType?: string;
}

interface OptimizationResult {
  context: string;
  tokensUsed: number;
  tokensSaved: number;
  modules: string[];
  strategy: string;
}

export class ContextOptimizer {
  private config: ProjectConfig;
  private moduleIndex: Map<string, string> = new Map();

  constructor(configPath: string = '.claude-context.yml') {
    const configContent = fs.readFileSync(configPath, 'utf8');
    this.config = yaml.load(configContent) as ProjectConfig;
    this.loadModuleIndex();
  }

  private loadModuleIndex() {
    // 모듈 인덱스 로드
    const indexPaths = [
      'MASTER_PLAYBOOK/MASTER_INDEX.md',
      'MASTER_PLAYBOOK/CRISIS_INDEX.md',
      'MASTER_PLAYBOOK/QUICK_START.md'
    ];

    indexPaths.forEach(indexPath => {
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        // 간단한 파싱으로 모듈 매핑 추출
        const matches = content.matchAll(/@(\S+)/g);
        for (const match of matches) {
          this.moduleIndex.set(match[1], indexPath);
        }
      }
    });
  }

  async analyzeQuery(query: string): Promise<AnalysisResult> {
    const lowerQuery = query.toLowerCase();
    const keywords: string[] = [];
    let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let errorType: string | undefined;

    // 긴급도 판단
    if (lowerQuery.includes('production down') || lowerQuery.includes('모든 사용자')) {
      urgency = 'critical';
    } else if (lowerQuery.includes('error') || lowerQuery.includes('실패')) {
      urgency = 'high';
    } else if (lowerQuery.includes('느림') || lowerQuery.includes('개선')) {
      urgency = 'medium';
    }

    // 에러 타입 감지
    if (lowerQuery.includes('hydration')) {
      errorType = 'hydration';
      keywords.push('hydration', 'ssr', 'nextjs');
    } else if (lowerQuery.includes('typescript')) {
      errorType = 'typescript';
      keywords.push('typescript', 'type', 'error');
    } else if (lowerQuery.includes('deploy') || lowerQuery.includes('배포')) {
      errorType = 'deployment';
      keywords.push('deploy', 'vercel', 'production');
    }

    // 프로젝트 타입 감지
    let projectType: string | undefined;
    if (lowerQuery.includes('새 프로젝트') || lowerQuery.includes('new project')) {
      projectType = 'new';
      keywords.push('template', 'starter');
    }

    return { keywords, errorType, urgency, projectType };
  }

  findRelevantModules(analysis: AnalysisResult): string[] {
    const modules: string[] = [];

    // 긴급도에 따른 모듈 선택
    if (analysis.urgency === 'critical') {
      modules.push('31_Crisis_Management/protocols/emergency-steps.md');
    }

    // 에러 타입에 따른 모듈 선택
    if (analysis.errorType) {
      switch (analysis.errorType) {
        case 'hydration':
          modules.push('30_Real_World_Traps/quick/hydration-fix.md');
          break;
        case 'typescript':
          modules.push('30_Real_World_Traps/quick/typescript-errors.md');
          break;
        case 'deployment':
          modules.push('31_Crisis_Management/templates/deployment-crisis.md');
          break;
      }
    }

    // 프로젝트 타입에 따른 모듈 선택
    if (analysis.projectType === 'new') {
      modules.push('MASTER_PLAYBOOK/QUICK_START.md');
      modules.push('24_AI_Interview_System/QUICK.md');
    }

    // 기본 모듈 추가 (매우 작은 크기)
    if (modules.length === 0) {
      modules.push('MASTER_PLAYBOOK/MASTER_INDEX.md');
    }

    return modules;
  }

  async loadMinimalContext(
    modules: string[], 
    options: { maxTokens: number; compressionLevel: string }
  ): Promise<string> {
    let context = '';
    let currentTokens = 0;
    const tokenLimit = options.maxTokens;

    for (const module of modules) {
      const modulePath = `MASTER_PLAYBOOK/${module}`;
      
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, 'utf8');
        const estimatedTokens = this.estimateTokens(content);

        if (currentTokens + estimatedTokens <= tokenLimit) {
          context += `\n\n## From ${module}\n${content}`;
          currentTokens += estimatedTokens;
        } else {
          // 압축 시도
          const compressed = this.compressContent(content, options.compressionLevel);
          const compressedTokens = this.estimateTokens(compressed);
          
          if (currentTokens + compressedTokens <= tokenLimit) {
            context += `\n\n## From ${module} (compressed)\n${compressed}`;
            currentTokens += compressedTokens;
          }
        }
      }
    }

    return context;
  }

  private estimateTokens(text: string): number {
    // 간단한 토큰 추정 (실제로는 더 정교한 tokenizer 필요)
    return Math.ceil(text.length / 4);
  }

  private compressContent(content: string, level: string): string {
    if (level === 'aggressive') {
      // 매우 공격적인 압축
      return content
        .split('\n')
        .filter(line => !line.startsWith('//') && line.trim())
        .map(line => line.trim())
        .join('\n')
        .replace(/\s+/g, ' ')
        .substring(0, 200);
    } else if (level === 'moderate') {
      // 중간 압축
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
        .join('\n')
        .substring(0, 500);
    } else {
      // 가벼운 압축
      return content.substring(0, 1000);
    }
  }

  async optimize(query: string): Promise<OptimizationResult> {
    // 1. 쿼리 분석
    const analysis = await this.analyzeQuery(query);
    
    // 2. 관련 모듈 찾기
    const modules = this.findRelevantModules(analysis);
    
    // 3. 최소 컨텍스트 로드
    const context = await this.loadMinimalContext(modules, {
      maxTokens: this.config.tokenLimits.warning,
      compressionLevel: this.config.compression.level
    });
    
    // 4. 결과 계산
    const tokensUsed = this.estimateTokens(context);
    const tokensSaved = this.config.tokenLimits.max - tokensUsed;
    
    return {
      context,
      tokensUsed,
      tokensSaved,
      modules,
      strategy: `${analysis.urgency} priority, ${modules.length} modules loaded`
    };
  }
}

// CLI 사용
if (require.main === module) {
  const optimizer = new ContextOptimizer();
  const query = process.argv[2] || "Hydration error in production";
  
  optimizer.optimize(query).then(result => {
    console.log('🎯 Context Optimization Result');
    console.log('============================');
    console.log(`Query: "${query}"`);
    console.log(`Tokens Used: ${result.tokensUsed}`);
    console.log(`Tokens Saved: ${result.tokensSaved}`);
    console.log(`Efficiency: ${Math.round((result.tokensSaved / 10000) * 100)}%`);
    console.log(`Strategy: ${result.strategy}`);
    console.log('\nModules Loaded:');
    result.modules.forEach(m => console.log(`  - ${m}`));
  });
}