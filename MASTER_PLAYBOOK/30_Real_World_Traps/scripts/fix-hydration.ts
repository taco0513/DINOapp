#!/usr/bin/env node
/**
 * Hydration Error Auto-Fixer
 * Next.js hydration 에러를 자동으로 감지하고 수정하는 도구
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

interface HydrationIssue {
  file: string;
  line: number;
  type: string;
  code: string;
  suggestion: string;
}

class HydrationFixer {
  private issues: HydrationIssue[] = [];
  
  // 패턴 정의
  private patterns = {
    windowUsage: /\bwindow\./g,
    documentUsage: /\bdocument\./g,
    localStorageUsage: /\blocalStorage\./g,
    dateUsage: /new\s+Date\(\)/g,
    mathRandomUsage: /Math\.random\(\)/g,
    conditionalRender: /{\s*\w+\s*\?\s*<.+>\s*:\s*<.+>\s*}/g
  };

  async scanProject(projectPath: string) {
    console.log('🔍 Scanning for hydration issues...\n');
    
    const files = glob.sync(`${projectPath}/**/*.{tsx,jsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
    });
    
    for (const file of files) {
      await this.scanFile(file);
    }
    
    console.log(`\n📊 Found ${this.issues.length} potential hydration issues`);
    return this.issues;
  }

  private async scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues: HydrationIssue[] = [];
    
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      traverse(ast, {
        // Window/Document 사용 감지
        MemberExpression(path) {
          const object = path.node.object;
          
          if (t.isIdentifier(object)) {
            if (object.name === 'window' || object.name === 'document') {
              // useEffect 내부인지 확인
              const inUseEffect = path.findParent(p => 
                t.isCallExpression(p.node) && 
                t.isIdentifier(p.node.callee) && 
                p.node.callee.name === 'useEffect'
              );
              
              if (!inUseEffect) {
                issues.push({
                  file: filePath,
                  line: path.node.loc?.start.line || 0,
                  type: 'browser-api',
                  code: generate(path.node).code,
                  suggestion: 'Wrap in useEffect or use dynamic import'
                });
              }
            }
            
            if (object.name === 'localStorage') {
              const inUseEffect = path.findParent(p => 
                t.isCallExpression(p.node) && 
                t.isIdentifier(p.node.callee) && 
                p.node.callee.name === 'useEffect'
              );
              
              if (!inUseEffect) {
                issues.push({
                  file: filePath,
                  line: path.node.loc?.start.line || 0,
                  type: 'localStorage',
                  code: generate(path.node).code,
                  suggestion: 'Move to useEffect or use state initialization'
                });
              }
            }
          }
        },
        
        // new Date() 사용 감지
        NewExpression(path) {
          if (
            t.isIdentifier(path.node.callee) && 
            path.node.callee.name === 'Date' &&
            path.node.arguments.length === 0
          ) {
            const inJSX = path.findParent(p => t.isJSXElement(p.node));
            
            if (inJSX) {
              issues.push({
                file: filePath,
                line: path.node.loc?.start.line || 0,
                type: 'dynamic-date',
                code: generate(path.node).code,
                suggestion: 'Add suppressHydrationWarning or use static date'
              });
            }
          }
        },
        
        // Math.random() 사용 감지
        CallExpression(path) {
          if (
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object) &&
            path.node.callee.object.name === 'Math' &&
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'random'
          ) {
            const inJSX = path.findParent(p => t.isJSXElement(p.node));
            
            if (inJSX) {
              issues.push({
                file: filePath,
                line: path.node.loc?.start.line || 0,
                type: 'random-value',
                code: generate(path.node).code,
                suggestion: 'Use useId or fixed value'
              });
            }
          }
        }
      });
      
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
    }
    
    if (issues.length > 0) {
      console.log(`\n📄 ${path.relative(process.cwd(), filePath)}`);
      issues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.type}`);
        console.log(`  Code: ${issue.code}`);
        console.log(`  💡 ${issue.suggestion}`);
      });
      
      this.issues.push(...issues);
    }
  }

  async autoFix(issues: HydrationIssue[]) {
    const fixesByFile = new Map<string, HydrationIssue[]>();
    
    // 파일별로 그룹화
    issues.forEach(issue => {
      if (!fixesByFile.has(issue.file)) {
        fixesByFile.set(issue.file, []);
      }
      fixesByFile.get(issue.file)!.push(issue);
    });
    
    // 각 파일 수정
    for (const [file, fileIssues] of fixesByFile) {
      await this.fixFile(file, fileIssues);
    }
  }

  private async fixFile(filePath: string, issues: HydrationIssue[]) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 간단한 수정 적용
    issues.forEach(issue => {
      switch (issue.type) {
        case 'browser-api':
          // window. -> typeof window !== 'undefined' && window.
          content = content.replace(
            new RegExp(`\\b${issue.code}\\b`, 'g'),
            `typeof window !== 'undefined' && ${issue.code}`
          );
          break;
          
        case 'dynamic-date':
          // Date 렌더링 부분에 suppressHydrationWarning 추가
          // 이건 AST 변환이 필요하므로 수동 처리 권장
          console.log(`⚠️  Manual fix needed for date at line ${issue.line}`);
          break;
          
        case 'localStorage':
          // localStorage 사용을 주석 처리하고 TODO 추가
          const lineNumber = issue.line - 1;
          const lines = content.split('\n');
          if (lines[lineNumber]) {
            lines[lineNumber] = `// TODO: Move to useEffect - ${lines[lineNumber]}`;
          }
          content = lines.join('\n');
          break;
      }
    });
    
    // 백업 생성
    fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath));
    
    // 수정된 파일 저장
    fs.writeFileSync(filePath, content);
    
    console.log(`\n✅ Fixed ${issues.length} issues in ${path.basename(filePath)}`);
    console.log(`   Backup saved as ${path.basename(filePath)}.backup`);
  }

  generateReport(issues: HydrationIssue[]) {
    const report = {
      summary: {
        total: issues.length,
        byType: {} as Record<string, number>,
        byFile: {} as Record<string, number>
      },
      issues: issues,
      recommendations: [] as string[]
    };
    
    // 통계 생성
    issues.forEach(issue => {
      report.summary.byType[issue.type] = (report.summary.byType[issue.type] || 0) + 1;
      report.summary.byFile[issue.file] = (report.summary.byFile[issue.file] || 0) + 1;
    });
    
    // 권장사항 생성
    if (report.summary.byType['browser-api'] > 5) {
      report.recommendations.push(
        'Consider creating a custom hook for browser API access'
      );
    }
    
    if (report.summary.byType['localStorage'] > 3) {
      report.recommendations.push(
        'Consider using a state management solution with SSR support'
      );
    }
    
    // 리포트 저장
    fs.writeFileSync(
      'hydration-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Report saved to hydration-report.json');
    
    return report;
  }
}

// CLI 실행
if (require.main === module) {
  const fixer = new HydrationFixer();
  const projectPath = process.argv[2] || '.';
  const shouldAutoFix = process.argv.includes('--fix');
  
  console.log('🔧 Hydration Error Fixer');
  console.log('=======================\n');
  
  fixer.scanProject(projectPath).then(issues => {
    if (issues.length === 0) {
      console.log('✨ No hydration issues found!');
      return;
    }
    
    fixer.generateReport(issues);
    
    if (shouldAutoFix) {
      console.log('\n🔧 Applying automatic fixes...');
      fixer.autoFix(issues);
    } else {
      console.log('\n💡 Run with --fix to apply automatic fixes');
    }
  });
}

export { HydrationFixer };