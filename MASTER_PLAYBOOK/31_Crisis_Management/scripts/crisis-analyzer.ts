#!/usr/bin/env node
/**
 * Crisis Analyzer - 위기 상황 자동 진단 도구
 * 프로젝트 상태를 종합적으로 분석하여 위기 레벨과 대응 방안 제시
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CrisisAnalysis {
  level: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  issues: Issue[];
  recommendations: string[];
  timeEstimate: string;
}

interface Issue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  count: number;
  autoFixable: boolean;
}

class CrisisAnalyzer {
  private projectPath: string;
  private issues: Issue[] = [];

  constructor(projectPath: string = '.') {
    this.projectPath = projectPath;
  }

  async analyzeProject(): Promise<CrisisAnalysis> {
    console.log('🔍 Starting comprehensive crisis analysis...\n');

    // 다양한 분석 실행
    await this.analyzeBuildStatus();
    await this.analyzeTypeScriptErrors();
    await this.analyzeTestStatus();
    await this.analyzeDependencies();
    await this.analyzePerformance();
    await this.analyzeGitStatus();

    // 위기 점수 계산
    const score = this.calculateCrisisScore();
    const level = this.determineCrisisLevel(score);

    return {
      level,
      score,
      issues: this.issues,
      recommendations: this.generateRecommendations(),
      timeEstimate: this.estimateResolutionTime()
    };
  }

  private async analyzeBuildStatus() {
    try {
      execSync('npm run build', { stdio: 'pipe', cwd: this.projectPath });
      console.log('✅ Build Status: OK');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error/gi) || []).length;
      
      this.issues.push({
        category: 'Build',
        severity: errorCount > 100 ? 'critical' : errorCount > 20 ? 'high' : 'medium',
        description: `Build failed with ${errorCount} errors`,
        count: errorCount,
        autoFixable: false
      });

      console.log(`❌ Build Status: FAILED (${errorCount} errors)`);
    }
  }

  private async analyzeTypeScriptErrors() {
    try {
      const output = execSync('npx tsc --noEmit', { 
        stdio: 'pipe', 
        cwd: this.projectPath,
        encoding: 'utf8'
      });
      console.log('✅ TypeScript: No errors');
    } catch (error) {
      const output = error.stdout?.toString() || '';
      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      const errorCount = errorLines.length;

      // 에러 타입별 분류
      const errorTypes = new Map<string, number>();
      errorLines.forEach(line => {
        const match = line.match(/error TS(\d+):/);
        if (match) {
          const errorCode = match[1];
          errorTypes.set(errorCode, (errorTypes.get(errorCode) || 0) + 1);
        }
      });

      // 주요 에러 타입들
      const criticalErrors = [
        'Cannot find module',
        'is not assignable to type',
        'Property does not exist'
      ];

      let autoFixableCount = 0;
      errorLines.forEach(line => {
        if (line.includes('Cannot find module') || line.includes('Property') || line.includes('undefined')) {
          autoFixableCount++;
        }
      });

      this.issues.push({
        category: 'TypeScript',
        severity: errorCount > 1000 ? 'critical' : errorCount > 500 ? 'high' : errorCount > 100 ? 'medium' : 'low',
        description: `${errorCount} TypeScript errors (${autoFixableCount} auto-fixable)`,
        count: errorCount,
        autoFixable: autoFixableCount > errorCount * 0.6
      });

      console.log(`⚠️ TypeScript: ${errorCount} errors (${autoFixableCount} auto-fixable)`);

      // 주요 에러 타입 표시
      const topErrors = Array.from(errorTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      topErrors.forEach(([code, count]) => {
        console.log(`   TS${code}: ${count} occurrences`);
      });
    }
  }

  private async analyzeTestStatus() {
    try {
      execSync('npm test -- --watchAll=false', { 
        stdio: 'pipe', 
        cwd: this.projectPath 
      });
      console.log('✅ Tests: All passing');
    } catch (error) {
      const output = error.stdout?.toString() || '';
      const failedMatch = output.match(/(\d+) failed/);
      const failedCount = failedMatch ? parseInt(failedMatch[1]) : 0;

      if (failedCount > 0) {
        this.issues.push({
          category: 'Tests',
          severity: failedCount > 20 ? 'high' : failedCount > 5 ? 'medium' : 'low',
          description: `${failedCount} test(s) failing`,
          count: failedCount,
          autoFixable: false
        });

        console.log(`❌ Tests: ${failedCount} failing`);
      }
    }
  }

  private async analyzeDependencies() {
    try {
      // 보안 취약점 확인
      const auditOutput = execSync('npm audit --json', { 
        stdio: 'pipe', 
        cwd: this.projectPath,
        encoding: 'utf8'
      });
      
      const auditResult = JSON.parse(auditOutput);
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {};
      
      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;
      const moderate = vulnerabilities.moderate || 0;

      if (critical > 0 || high > 0) {
        this.issues.push({
          category: 'Security',
          severity: critical > 0 ? 'critical' : 'high',
          description: `${critical} critical, ${high} high security vulnerabilities`,
          count: critical + high,
          autoFixable: true
        });

        console.log(`🚨 Security: ${critical} critical, ${high} high vulnerabilities`);
      } else if (moderate > 0) {
        console.log(`⚠️ Security: ${moderate} moderate vulnerabilities`);
      } else {
        console.log('✅ Security: No high-risk vulnerabilities');
      }

      // 패키지 버전 충돌 확인
      try {
        execSync('npm ls', { stdio: 'pipe', cwd: this.projectPath });
        console.log('✅ Dependencies: No conflicts');
      } catch (error) {
        const conflictCount = (error.stdout?.toString().match(/UNMET DEPENDENCY/g) || []).length;
        if (conflictCount > 0) {
          this.issues.push({
            category: 'Dependencies',
            severity: 'medium',
            description: `${conflictCount} dependency conflicts`,
            count: conflictCount,
            autoFixable: true
          });
        }
      }

    } catch (error) {
      console.log('⚠️ Security: Could not analyze (npm audit failed)');
    }
  }

  private async analyzePerformance() {
    // 번들 크기 분석 (대략적)
    const distPath = path.join(this.projectPath, 'dist');
    const buildPath = path.join(this.projectPath, '.next');
    
    let bundleSize = 0;
    try {
      if (fs.existsSync(distPath)) {
        bundleSize = this.getFolderSize(distPath);
      } else if (fs.existsSync(buildPath)) {
        bundleSize = this.getFolderSize(buildPath);
      }

      if (bundleSize > 50 * 1024 * 1024) { // 50MB 이상
        this.issues.push({
          category: 'Performance',
          severity: 'medium',
          description: `Large bundle size: ${(bundleSize / 1024 / 1024).toFixed(1)}MB`,
          count: 1,
          autoFixable: false
        });
        
        console.log(`⚠️ Performance: Large bundle (${(bundleSize / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        console.log('✅ Performance: Bundle size OK');
      }
    } catch (error) {
      console.log('ℹ️ Performance: Could not analyze bundle size');
    }
  }

  private async analyzeGitStatus() {
    try {
      const status = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: this.projectPath 
      });
      
      const unstagedFiles = status.split('\n').filter(line => line.trim()).length;
      
      if (unstagedFiles > 20) {
        this.issues.push({
          category: 'Git',
          severity: 'low',
          description: `${unstagedFiles} unstaged files`,
          count: unstagedFiles,
          autoFixable: false
        });
        
        console.log(`⚠️ Git: ${unstagedFiles} unstaged files`);
      } else {
        console.log('✅ Git: Repository status OK');
      }

      // 최근 커밋 확인
      const lastCommit = execSync('git log -1 --format="%cr"', {
        encoding: 'utf8',
        cwd: this.projectPath
      }).trim();
      
      console.log(`ℹ️ Last commit: ${lastCommit}`);

    } catch (error) {
      console.log('ℹ️ Git: Not a git repository or git not available');
    }
  }

  private getFolderSize(folderPath: string): number {
    let size = 0;
    try {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          size += stats.size;
        } else if (stats.isDirectory()) {
          size += this.getFolderSize(filePath);
        }
      });
    } catch (error) {
      // 폴더에 접근할 수 없는 경우 무시
    }
    return size;
  }

  private calculateCrisisScore(): number {
    let score = 0;
    
    this.issues.forEach(issue => {
      const severityWeight = {
        critical: 25,
        high: 15,
        medium: 8,
        low: 3
      };

      const categoryWeight = {
        Build: 2.0,
        TypeScript: 1.5,
        Security: 2.5,
        Tests: 1.2,
        Dependencies: 1.3,
        Performance: 1.0,
        Git: 0.5
      };

      const baseScore = severityWeight[issue.severity] * (categoryWeight[issue.category] || 1.0);
      
      // 개수에 따른 추가 점수 (로그 스케일)
      const countMultiplier = Math.min(Math.log10(issue.count + 1), 3);
      
      score += baseScore * countMultiplier;
    });

    return Math.round(score);
  }

  private determineCrisisLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 100) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // 빌드 에러 권장사항
    if (this.issues.some(i => i.category === 'Build' && i.severity === 'critical')) {
      recommendations.push('🚨 IMMEDIATE: Fix critical build errors - consider rollback if fix takes >30min');
    }

    // TypeScript 에러 권장사항
    const tsIssue = this.issues.find(i => i.category === 'TypeScript');
    if (tsIssue) {
      if (tsIssue.count > 1000) {
        recommendations.push('🔧 Run automated TypeScript error fixer: npm run crisis:ts-errors');
      } else if (tsIssue.count > 100) {
        recommendations.push('📝 Implement gradual typing strategy with temporary any types');
      }
    }

    // 보안 권장사항
    if (this.issues.some(i => i.category === 'Security' && i.severity === 'critical')) {
      recommendations.push('🛡️ URGENT: Fix critical security vulnerabilities: npm audit fix --force');
    }

    // 일반적 권장사항
    const autoFixableIssues = this.issues.filter(i => i.autoFixable);
    if (autoFixableIssues.length > 0) {
      recommendations.push(`⚡ ${autoFixableIssues.length} issues can be auto-fixed - run batch fix scripts`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No critical issues found - proceed with regular development');
    }

    return recommendations;
  }

  private estimateResolutionTime(): string {
    let totalHours = 0;
    
    this.issues.forEach(issue => {
      const baseHours = {
        critical: issue.autoFixable ? 2 : 8,
        high: issue.autoFixable ? 1 : 4,
        medium: issue.autoFixable ? 0.5 : 2,
        low: issue.autoFixable ? 0.2 : 1
      };

      const hours = baseHours[issue.severity];
      const countFactor = Math.min(Math.log10(issue.count + 1), 2);
      
      totalHours += hours * countFactor;
    });

    if (totalHours < 1) return 'Less than 1 hour';
    if (totalHours < 8) return `${Math.ceil(totalHours)} hours`;
    if (totalHours < 40) return `${Math.ceil(totalHours / 8)} days`;
    return `${Math.ceil(totalHours / 40)} weeks`;
  }

  printAnalysis(analysis: CrisisAnalysis) {
    console.log('\n' + '='.repeat(50));
    console.log('🚨 CRISIS ANALYSIS REPORT');
    console.log('='.repeat(50));

    // 위기 레벨 표시
    const levelEmoji = {
      critical: '🔴',
      high: '🟠', 
      medium: '🟡',
      low: '🟢'
    };

    console.log(`\n${levelEmoji[analysis.level]} Crisis Level: ${analysis.level.toUpperCase()}`);
    console.log(`📊 Crisis Score: ${analysis.score}/100`);
    console.log(`⏱️ Estimated Resolution Time: ${analysis.timeEstimate}`);

    // 이슈 요약
    if (analysis.issues.length > 0) {
      console.log('\n📋 Issues Summary:');
      console.log('-'.repeat(30));
      
      analysis.issues.forEach(issue => {
        const emoji = levelEmoji[issue.severity];
        const autoFix = issue.autoFixable ? '⚡' : '🔧';
        console.log(`${emoji} ${autoFix} ${issue.category}: ${issue.description}`);
      });
    }

    // 권장사항
    console.log('\n💡 Immediate Actions:');
    console.log('-'.repeat(30));
    analysis.recommendations.forEach(rec => {
      console.log(rec);
    });

    // 추가 명령어 제안
    console.log('\n🛠️ Available Crisis Tools:');
    console.log('-'.repeat(30));
    console.log('npm run crisis:ts-errors     # Fix TypeScript errors');
    console.log('npm run crisis:fix-imports   # Fix import paths');
    console.log('npm run crisis:security-fix  # Fix security issues');
    console.log('npm run crisis:rollback      # Safe rollback');
    
    console.log('\n' + '='.repeat(50));
  }
}

// CLI 실행
if (require.main === module) {
  const analyzer = new CrisisAnalyzer(process.argv[2] || '.');
  
  analyzer.analyzeProject()
    .then(analysis => {
      analyzer.printAnalysis(analysis);
      
      // 위기 레벨에 따른 종료 코드
      const exitCodes = {
        critical: 3,
        high: 2,
        medium: 1,
        low: 0
      };
      
      process.exit(exitCodes[analysis.level]);
    })
    .catch(error => {
      console.error('Crisis analysis failed:', error);
      process.exit(4);
    });
}

export { CrisisAnalyzer };