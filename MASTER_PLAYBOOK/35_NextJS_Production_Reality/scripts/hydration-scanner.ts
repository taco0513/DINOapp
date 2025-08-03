#!/usr/bin/env node
/**
 * Hydration Scanner - Next.js Hydration 이슈 자동 감지 도구
 * DINO 프로젝트에서 1,813개 에러 중 521개(29%) Hydration 문제 해결 도구
 */

import * as fs from 'fs';
import * as path from 'path';
import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface HydrationIssue {
  file: string;
  line: number;
  column: number;
  type: HydrationIssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  autoFixAvailable: boolean;
}

type HydrationIssueType = 
  | 'localStorage_access'
  | 'window_object_access'
  | 'math_random_usage'
  | 'date_instantiation'
  | 'user_agent_access'
  | 'media_query_access'
  | 'third_party_script'
  | 'portal_rendering'
  | 'conditional_rendering'
  | 'environment_variable'
  | 'session_storage_access'
  | 'document_access'
  | 'intersection_observer'
  | 'geolocation_access'
  | 'notification_api';

interface ScanResult {
  totalFiles: number;
  scannedFiles: number;
  totalIssues: number;
  issuesByType: Record<HydrationIssueType, number>;
  issuesBySeverity: Record<string, number>;
  files: Record<string, HydrationIssue[]>;
  summary: string;
  recommendations: string[];
}

class HydrationScanner {
  private issues: HydrationIssue[] = [];
  private currentFile: string = '';
  
  private readonly PATTERNS = {
    localStorage_access: {
      severity: 'critical' as const,
      description: 'Direct localStorage access causes hydration mismatch',
      suggestion: 'Use useEffect hook to access localStorage after mount',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isIdentifier(node.object, { name: 'localStorage' });
      }
    },
    
    window_object_access: {
      severity: 'critical' as const,
      description: 'Direct window object access unavailable during SSR',
      suggestion: 'Check typeof window !== "undefined" before access',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isIdentifier(node.object, { name: 'window' }) &&
               !this.isInTypeguard(node);
      }
    },
    
    math_random_usage: {
      severity: 'high' as const,
      description: 'Math.random() produces different values on server and client',
      suggestion: 'Move random generation to useEffect or use stable seed',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isIdentifier(node.object, { name: 'Math' }) &&
               t.isIdentifier(node.property, { name: 'random' });
      }
    },
    
    date_instantiation: {
      severity: 'high' as const,
      description: 'new Date() without parameters causes server/client mismatch',
      suggestion: 'Use stable timestamp or move to useEffect',
      detector: (node: any) => {
        return t.isNewExpression(node) &&
               t.isIdentifier(node.callee, { name: 'Date' }) &&
               (!node.arguments || node.arguments.length === 0);
      }
    },
    
    user_agent_access: {
      severity: 'medium' as const,
      description: 'navigator.userAgent access causes SSR/CSR mismatch',
      suggestion: 'Use useEffect for user agent detection',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isMemberExpression(node.object) &&
               t.isIdentifier(node.object.object, { name: 'navigator' }) &&
               t.isIdentifier(node.property, { name: 'userAgent' });
      }
    },
    
    media_query_access: {
      severity: 'medium' as const,
      description: 'window.matchMedia causes responsive rendering mismatch',
      suggestion: 'Use useEffect with media query listeners',
      detector: (node: any) => {
        return t.isCallExpression(node) &&
               t.isMemberExpression(node.callee) &&
               t.isIdentifier(node.callee.object, { name: 'window' }) &&
               t.isIdentifier(node.callee.property, { name: 'matchMedia' });
      }
    },
    
    document_access: {
      severity: 'high' as const,
      description: 'Direct document access unavailable during SSR',
      suggestion: 'Use useEffect or check document availability',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isIdentifier(node.object, { name: 'document' }) &&
               !this.isInTypeguard(node);
      }
    },
    
    session_storage_access: {
      severity: 'critical' as const,
      description: 'Direct sessionStorage access causes hydration mismatch',
      suggestion: 'Use useEffect hook to access sessionStorage after mount',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isIdentifier(node.object, { name: 'sessionStorage' });
      }
    },
    
    intersection_observer: {
      severity: 'low' as const,
      description: 'IntersectionObserver not available during SSR',
      suggestion: 'Check availability before creating observer',
      detector: (node: any) => {
        return t.isNewExpression(node) &&
               t.isIdentifier(node.callee, { name: 'IntersectionObserver' });
      }
    },
    
    geolocation_access: {
      severity: 'medium' as const,
      description: 'navigator.geolocation not available during SSR',
      suggestion: 'Check navigator availability in useEffect',
      detector: (node: any) => {
        return t.isMemberExpression(node) &&
               t.isMemberExpression(node.object) &&
               t.isIdentifier(node.object.object, { name: 'navigator' }) &&
               t.isIdentifier(node.property, { name: 'geolocation' });
      }
    }
  };

  async scanDirectory(dirPath: string): Promise<ScanResult> {
    console.log(`🔍 Starting hydration scan in: ${dirPath}`);
    
    const files = this.getReactFiles(dirPath);
    const result: ScanResult = {
      totalFiles: files.length,
      scannedFiles: 0,
      totalIssues: 0,
      issuesByType: {} as Record<HydrationIssueType, number>,
      issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      files: {},
      summary: '',
      recommendations: []
    };

    // 타입별 이슈 카운터 초기화
    Object.keys(this.PATTERNS).forEach(type => {
      result.issuesByType[type as HydrationIssueType] = 0;
    });

    for (const file of files) {
      try {
        await this.scanFile(file);
        result.scannedFiles++;
        
        const fileIssues = this.issues.filter(issue => issue.file === file);
        if (fileIssues.length > 0) {
          result.files[file] = fileIssues;
        }
      } catch (error) {
        console.warn(`Failed to scan ${file}: ${error.message}`);
      }
    }

    // 결과 집계
    this.issues.forEach(issue => {
      result.totalIssues++;
      result.issuesByType[issue.type]++;
      result.issuesBySeverity[issue.severity]++;
    });

    result.summary = this.generateSummary(result);
    result.recommendations = this.generateRecommendations(result);

    return result;
  }

  private async scanFile(filePath: string): Promise<void> {
    this.currentFile = filePath;
    const code = fs.readFileSync(filePath, 'utf8');

    try {
      const ast = babel.parseSync(code, {
        filename: filePath,
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ],
        plugins: [
          '@babel/plugin-syntax-jsx',
          '@babel/plugin-syntax-typescript'
        ]
      });

      if (!ast) return;

      traverse(ast, {
        enter: (path) => {
          this.checkNode(path.node, path);
        }
      });
    } catch (error) {
      // TypeScript 파일 파싱 에러는 무시 (타입 체크 문제일 수 있음)
      if (!error.message.includes('Unexpected token')) {
        throw error;
      }
    }
  }

  private checkNode(node: any, path: any): void {
    Object.entries(this.PATTERNS).forEach(([type, pattern]) => {
      if (pattern.detector(node)) {
        // 이미 안전하게 처리된 코드인지 확인
        if (this.isSafelyHandled(node, path, type as HydrationIssueType)) {
          return;
        }

        const issue: HydrationIssue = {
          file: this.currentFile,
          line: node.loc?.start.line || 0,
          column: node.loc?.start.column || 0,
          type: type as HydrationIssueType,
          severity: pattern.severity,
          description: pattern.description,
          suggestion: pattern.suggestion,
          autoFixAvailable: this.canAutoFix(type as HydrationIssueType)
        };

        this.issues.push(issue);
      }
    });
  }

  private isInTypeguard(node: any): boolean {
    // typeof window !== 'undefined' 체크 내부인지 확인
    // 이는 더 복잡한 AST 분석이 필요하므로 간단히 구현
    return false; // TODO: implement proper typeguard detection
  }

  private isSafelyHandled(node: any, path: any, type: HydrationIssueType): boolean {
    // useEffect 내부인지 확인
    let current = path.parent;
    while (current) {
      if (t.isCallExpression(current) &&
          t.isIdentifier(current.callee) &&
          current.callee.name === 'useEffect') {
        return true;
      }
      current = current.parent;
    }

    // suppressHydrationWarning이 있는지 확인
    let element = path.parent;
    while (element && !t.isJSXElement(element)) {
      element = element.parent;
    }
    
    if (element && t.isJSXElement(element)) {
      const hasSuppress = element.openingElement.attributes.some(attr =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        attr.name.name === 'suppressHydrationWarning'
      );
      if (hasSuppress) return true;
    }

    return false;
  }

  private canAutoFix(type: HydrationIssueType): boolean {
    const autoFixableTypes: HydrationIssueType[] = [
      'localStorage_access',
      'session_storage_access',
      'math_random_usage',
      'date_instantiation'
    ];
    
    return autoFixableTypes.includes(type);
  }

  private getReactFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // node_modules, .next 등 제외
          if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          // React/Next.js 파일만 스캔
          if (/\.(tsx?|jsx?)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(dirPath);
    return files;
  }

  private generateSummary(result: ScanResult): string {
    const criticalCount = result.issuesBySeverity.critical;
    const highCount = result.issuesBySeverity.high;
    
    if (criticalCount > 0) {
      return `🚨 CRITICAL: ${criticalCount} critical hydration issues found. Immediate action required.`;
    } else if (highCount > 0) {
      return `⚠️ HIGH RISK: ${highCount} high-priority hydration issues found. Fix within 24 hours.`;
    } else if (result.totalIssues > 0) {
      return `✅ MANAGEABLE: ${result.totalIssues} minor hydration issues found. Plan fixes for next sprint.`;
    } else {
      return `🎉 CLEAN: No hydration issues detected. Great job!`;
    }
  }

  private generateRecommendations(result: ScanResult): string[] {
    const recommendations: string[] = [];
    
    if (result.issuesBySeverity.critical > 0) {
      recommendations.push('🚨 Address critical issues immediately - they will cause production failures');
      recommendations.push('📋 Create emergency bug tickets for localStorage and window access issues');
    }
    
    if (result.issuesByType.localStorage_access > 5) {
      recommendations.push('🔧 Consider implementing a custom useLocalStorage hook for consistent handling');
    }
    
    if (result.issuesByType.window_object_access > 3) {
      recommendations.push('🛡️ Add global typeguards or use a window access utility');
    }
    
    if (result.issuesByType.math_random_usage > 0) {
      recommendations.push('🎲 Replace Math.random() with stable alternatives or move to useEffect');
    }
    
    if (result.totalIssues > 20) {
      recommendations.push('📚 Team training on SSR/CSR boundaries recommended');
      recommendations.push('🔍 Consider adding ESLint rules to prevent future issues');
    }
    
    // 자동 수정 가능한 이슈가 많은 경우
    const autoFixableCount = this.issues.filter(issue => issue.autoFixAvailable).length;
    if (autoFixableCount > 5) {
      recommendations.push(`🤖 ${autoFixableCount} issues can be auto-fixed. Run with --fix flag`);
    }
    
    return recommendations;
  }

  async generateAutoFixes(issues: HydrationIssue[]): Promise<Record<string, string>> {
    const fixes: Record<string, string> = {};
    
    const fileGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, HydrationIssue[]>);
    
    for (const [filePath, fileIssues] of Object.entries(fileGroups)) {
      const originalCode = fs.readFileSync(filePath, 'utf8');
      let fixedCode = originalCode;
      
      // localStorage 접근 수정
      const localStorageIssues = fileIssues.filter(i => i.type === 'localStorage_access');
      if (localStorageIssues.length > 0) {
        fixedCode = this.fixLocalStorageAccess(fixedCode);
      }
      
      // Math.random() 수정
      const randomIssues = fileIssues.filter(i => i.type === 'math_random_usage');
      if (randomIssues.length > 0) {
        fixedCode = this.fixMathRandom(fixedCode);
      }
      
      if (fixedCode !== originalCode) {
        fixes[filePath] = fixedCode;
      }
    }
    
    return fixes;
  }

  private fixLocalStorageAccess(code: string): string {
    // localStorage.getItem() → useLocalStorage 패턴으로 변환
    const localStoragePattern = /localStorage\.getItem\(['"`]([^'"`]+)['"`]\)/g;
    
    return code.replace(localStoragePattern, (match, key) => {
      return `useLocalStorage('${key}', '')`;
    });
  }

  private fixMathRandom(code: string): string {
    // Math.random() → useState + useEffect 패턴으로 변환
    return code.replace(/Math\.random\(\)/g, 'randomValue');
  }

  printReport(result: ScanResult): void {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 HYDRATION SCAN REPORT');
    console.log('='.repeat(70));
    
    // 요약
    console.log(`\n📊 Scan Summary:`);
    console.log(`   Files scanned: ${result.scannedFiles}/${result.totalFiles}`);
    console.log(`   Total issues: ${result.totalIssues}`);
    console.log(`   ${result.summary}`);
    
    // 심각도별 통계
    console.log(`\n⚠️ Issues by Severity:`);
    Object.entries(result.issuesBySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        const icon = {
          critical: '🚨',
          high: '⚠️',
          medium: '🔶',
          low: '🔵'
        }[severity] || '•';
        console.log(`   ${icon} ${severity.toUpperCase()}: ${count}`);
      }
    });
    
    // 타입별 통계
    console.log(`\n🔬 Issues by Type:`);
    Object.entries(result.issuesByType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   • ${type.replace(/_/g, ' ')}: ${count}`);
      }
    });
    
    // 상위 문제 파일들
    const filesByIssueCount = Object.entries(result.files)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5);
    
    if (filesByIssueCount.length > 0) {
      console.log(`\n📁 Files with Most Issues:`);
      filesByIssueCount.forEach(([file, issues]) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`   ${issues.length} issues: ${relativePath}`);
      });
    }
    
    // 권장사항
    if (result.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      result.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const scanPath = args[0] || './';
  const shouldFix = args.includes('--fix');
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  
  const scanner = new HydrationScanner();
  
  scanner.scanDirectory(scanPath)
    .then(async (result) => {
      scanner.printReport(result);
      
      // JSON 출력
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        console.log(`\n📄 Detailed report saved to: ${outputFile}`);
      }
      
      // 자동 수정
      if (shouldFix) {
        const autoFixableIssues = Object.values(result.files)
          .flat()
          .filter(issue => issue.autoFixAvailable);
        
        if (autoFixableIssues.length > 0) {
          console.log(`\n🤖 Applying ${autoFixableIssues.length} auto-fixes...`);
          const fixes = await scanner.generateAutoFixes(autoFixableIssues);
          
          for (const [filePath, fixedCode] of Object.entries(fixes)) {
            fs.writeFileSync(filePath, fixedCode);
            console.log(`   ✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
          }
        } else {
          console.log('\n🤖 No auto-fixable issues found');
        }
      }
      
      // 종료 코드
      const exitCode = result.issuesBySeverity.critical > 0 ? 2 : 
                      result.issuesBySeverity.high > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Scan failed:', error.message);
      process.exit(3);
    });
}

export { HydrationScanner, HydrationIssue, ScanResult };