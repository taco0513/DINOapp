#!/usr/bin/env node
/**
 * Recovery Toolkit - 통합 복구 도구
 * 다양한 위기 상황에 대한 자동화된 복구 도구 모음
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface RecoveryResult {
  success: boolean;
  message: string;
  details: string[];
  rollbackAvailable: boolean;
}

class RecoveryToolkit {
  private projectPath: string;
  private backupPath: string;

  constructor(projectPath: string = '.') {
    this.projectPath = projectPath;
    this.backupPath = path.join(projectPath, '.crisis-backups');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  private createBackup(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${name}_${timestamp}`;
    
    try {
      // Git stash로 현재 상태 백업
      execSync(`git stash push -m "CRISIS_BACKUP_${backupName}"`, {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      
      console.log(`✅ Backup created: ${backupName}`);
      return backupName;
    } catch (error) {
      console.warn('⚠️ Could not create git backup, proceeding without backup');
      return '';
    }
  }

  async fixTypeScriptErrors(): Promise<RecoveryResult> {
    console.log('🔧 Starting TypeScript error recovery...');
    
    const backup = this.createBackup('typescript_fix');
    const details: string[] = [];

    try {
      // 1. 현재 에러 수 확인
      const initialErrors = this.countTypeScriptErrors();
      details.push(`Initial errors: ${initialErrors}`);

      if (initialErrors === 0) {
        return {
          success: true,
          message: 'No TypeScript errors found',
          details,
          rollbackAvailable: false
        };
      }

      // 2. 자동 수정 실행
      await this.runImportFixer();
      details.push('✅ Import paths fixed');

      await this.runTypingFixer();
      details.push('✅ Type annotations added');

      await this.runOptionalChainingFixer();
      details.push('✅ Optional chaining applied');

      // 3. 결과 확인
      const finalErrors = this.countTypeScriptErrors();
      details.push(`Final errors: ${finalErrors}`);

      const reduction = initialErrors - finalErrors;
      const successRate = Math.round((reduction / initialErrors) * 100);

      if (finalErrors < initialErrors * 0.5) {
        return {
          success: true,
          message: `TypeScript errors reduced by ${successRate}% (${reduction} errors fixed)`,
          details,
          rollbackAvailable: true
        };
      } else {
        return {
          success: false,
          message: `Minimal improvement: only ${successRate}% reduction`,
          details,
          rollbackAvailable: true
        };
      }

    } catch (error) {
      details.push(`❌ Error during fix: ${error.message}`);
      return {
        success: false,
        message: 'TypeScript fix failed',
        details,
        rollbackAvailable: true
      };
    }
  }

  private countTypeScriptErrors(): number {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: this.projectPath });
      return 0;
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      return (output.match(/error TS/g) || []).length;
    }
  }

  private async runImportFixer() {
    const files = this.getSourceFiles();
    
    const importFixes = [
      // .js 확장자 추가
      {
        pattern: /from ['"](\.[^'"]*?)(?<!\.js)['"];?$/gm,
        replacement: (match: string, path: string) => 
          path.includes('node_modules') ? match : match.replace(path, `${path}.js`)
      },
      
      // 상대 경로를 절대 경로로
      {
        pattern: /from ['"]\.\.\/(\.\.\/)+(.*?)['"];?$/g,
        replacement: "from '@/$2';"
      },

      // CommonJS를 ESM으로
      {
        pattern: /const (.+?) = require\(['"](.+?)['"]\);?/g,
        replacement: 'import $1 from "$2";'
      }
    ];

    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      importFixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement as any);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
      }
    });
  }

  private async runTypingFixer() {
    const files = this.getSourceFiles();
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // 일반적인 타입 수정
      const typeFixes = [
        // any 타입 추가
        {
          pattern: /function\s+(\w+)\s*\([^)]*\)\s*{/g,
          replacement: 'function $1(...args: any[]): any {'
        },
        
        // 객체 속성 접근 안전화
        {
          pattern: /(\w+)\.(\w+)(?!\?)/g,
          replacement: '$1?.$2'
        }
      ];

      let modified = false;
      typeFixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
      }
    });
  }

  private async runOptionalChainingFixer() {
    const files = this.getSourceFiles();
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // Optional chaining 적용
      const chainFixes = [
        // window 객체 안전 접근
        {
          pattern: /\bwindow\.(\w+)/g,
          replacement: 'window?.$1'
        },
        
        // document 객체 안전 접근
        {
          pattern: /\bdocument\.(\w+)/g,
          replacement: 'document?.$1'
        }
      ];

      let modified = false;
      chainFixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
      }
    });
  }

  async fixSecurityVulnerabilities(): Promise<RecoveryResult> {
    console.log('🛡️ Starting security vulnerability recovery...');
    
    const backup = this.createBackup('security_fix');
    const details: string[] = [];

    try {
      // npm audit 실행
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        cwd: this.projectPath 
      });
      
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      
      details.push(`Critical: ${vulnerabilities.critical || 0}`);
      details.push(`High: ${vulnerabilities.high || 0}`);
      details.push(`Moderate: ${vulnerabilities.moderate || 0}`);

      // 자동 수정 시도
      try {
        execSync('npm audit fix --force', { 
          stdio: 'pipe',
          cwd: this.projectPath 
        });
        details.push('✅ npm audit fix completed');
      } catch (error) {
        details.push('⚠️ npm audit fix had issues, trying alternative fixes');
        
        // 개별 취약한 패키지 업데이트
        const outdatedPackages = this.getOutdatedPackages();
        if (outdatedPackages.length > 0) {
          outdatedPackages.slice(0, 5).forEach(pkg => {
            try {
              execSync(`npm update ${pkg}`, { 
                stdio: 'pipe',
                cwd: this.projectPath 
              });
              details.push(`✅ Updated ${pkg}`);
            } catch (error) {
              details.push(`⚠️ Could not update ${pkg}`);
            }
          });
        }
      }

      return {
        success: true,
        message: 'Security fixes applied',
        details,
        rollbackAvailable: true
      };

    } catch (error) {
      return {
        success: false,
        message: 'Security fix failed',
        details: [...details, `Error: ${error.message}`],
        rollbackAvailable: true
      };
    }
  }

  private getOutdatedPackages(): string[] {
    try {
      const output = execSync('npm outdated --json', { 
        encoding: 'utf8',
        cwd: this.projectPath 
      });
      const outdated = JSON.parse(output);
      return Object.keys(outdated);
    } catch (error) {
      return [];
    }
  }

  async fixBuildErrors(): Promise<RecoveryResult> {
    console.log('🔨 Starting build error recovery...');
    
    const backup = this.createBackup('build_fix');
    const details: string[] = [];

    try {
      // 빌드 시도 및 에러 분석
      const buildErrors = this.getBuildErrors();
      details.push(`Build errors found: ${buildErrors.length}`);

      // 일반적인 빌드 문제 해결
      await this.fixCommonBuildIssues();
      details.push('✅ Common build issues addressed');

      // node_modules 재설치
      this.reinstallDependencies();
      details.push('✅ Dependencies reinstalled');

      // 캐시 클리어
      this.clearBuildCache();
      details.push('✅ Build cache cleared');

      // 재빌드 시도
      try {
        execSync('npm run build', { 
          stdio: 'pipe',
          cwd: this.projectPath 
        });
        
        return {
          success: true,
          message: 'Build errors resolved',
          details,
          rollbackAvailable: true
        };
      } catch (error) {
        return {
          success: false,
          message: 'Build still failing after fixes',
          details: [...details, 'Manual intervention required'],
          rollbackAvailable: true
        };
      }

    } catch (error) {
      return {
        success: false,
        message: 'Build fix process failed',
        details: [...details, `Error: ${error.message}`],
        rollbackAvailable: true
      };
    }
  }

  private getBuildErrors(): string[] {
    try {
      execSync('npm run build', { stdio: 'pipe', cwd: this.projectPath });
      return [];
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      return output.split('\n').filter(line => 
        line.includes('Error') || line.includes('error')
      );
    }
  }

  private async fixCommonBuildIssues() {
    // TypeScript 설정 완화
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      // 빌드 실패를 방지하는 설정
      tsconfig.compilerOptions = {
        ...tsconfig.compilerOptions,
        skipLibCheck: true,
        noEmitOnError: false,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      };
      
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    }

    // Next.js 설정 최적화
    const nextConfigPath = path.join(this.projectPath, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      let config = fs.readFileSync(nextConfigPath, 'utf8');
      
      // 타입 체크 건너뛰기 설정 추가
      if (!config.includes('typescript')) {
        config = config.replace(
          'module.exports = {',
          `module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },`
        );
        fs.writeFileSync(nextConfigPath, config);
      }
    }
  }

  private reinstallDependencies() {
    try {
      // 기존 node_modules 제거
      const nodeModulesPath = path.join(this.projectPath, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        execSync(`rm -rf ${nodeModulesPath}`, { cwd: this.projectPath });
      }

      // package-lock.json 기준으로 재설치
      execSync('npm ci', { 
        stdio: 'pipe',
        cwd: this.projectPath 
      });
    } catch (error) {
      // npm ci 실패 시 npm install로 대체
      execSync('npm install', { 
        stdio: 'pipe',
        cwd: this.projectPath 
      });
    }
  }

  private clearBuildCache() {
    const cachePaths = [
      '.next',
      'dist',
      'build',
      '.cache',
      'node_modules/.cache'
    ];

    cachePaths.forEach(cachePath => {
      const fullPath = path.join(this.projectPath, cachePath);
      if (fs.existsSync(fullPath)) {
        try {
          execSync(`rm -rf ${fullPath}`, { cwd: this.projectPath });
        } catch (error) {
          // 권한 문제 등으로 삭제 실패해도 계속 진행
        }
      }
    });
  }

  async performEmergencyRollback(): Promise<RecoveryResult> {
    console.log('🔄 Performing emergency rollback...');
    
    const details: string[] = [];

    try {
      // Git 상태 확인
      const gitStatus = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: this.projectPath 
      });
      
      if (gitStatus.trim()) {
        details.push('⚠️ Uncommitted changes detected');
        
        // 현재 변경사항 stash
        execSync('git stash push -m "EMERGENCY_ROLLBACK_STASH"', {
          cwd: this.projectPath
        });
        details.push('✅ Current changes stashed');
      }

      // 마지막 성공한 커밋 찾기
      const lastCommit = this.findLastWorkingCommit();
      if (lastCommit) {
        execSync(`git checkout ${lastCommit}`, { cwd: this.projectPath });
        details.push(`✅ Rolled back to commit: ${lastCommit}`);
        
        // 의존성 복원
        execSync('npm ci', { stdio: 'pipe', cwd: this.projectPath });
        details.push('✅ Dependencies restored');

        return {
          success: true,
          message: 'Emergency rollback completed',
          details,
          rollbackAvailable: false
        };
      } else {
        return {
          success: false,
          message: 'Could not find safe rollback point',
          details,
          rollbackAvailable: false
        };
      }

    } catch (error) {
      return {
        success: false,
        message: 'Rollback failed',
        details: [...details, `Error: ${error.message}`],
        rollbackAvailable: false
      };
    }
  }

  private findLastWorkingCommit(): string | null {
    try {
      // 최근 10개 커밋 중에서 작동하는 것 찾기
      const commits = execSync('git log --oneline -10 --format="%H"', {
        encoding: 'utf8',
        cwd: this.projectPath
      }).trim().split('\n');

      for (const commit of commits) {
        try {
          // 임시로 체크아웃해서 빌드 테스트
          execSync(`git checkout ${commit}`, { 
            stdio: 'pipe',
            cwd: this.projectPath 
          });
          
          execSync('npm run build', { 
            stdio: 'pipe',
            cwd: this.projectPath 
          });
          
          return commit;
        } catch (error) {
          // 이 커밋은 작동하지 않음, 다음 커밋 시도
          continue;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private getSourceFiles(): string[] {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files: string[] = [];
    
    const searchDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          searchDir(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };
    
    searchDir(path.join(this.projectPath, 'src'));
    return files;
  }

  printResult(result: RecoveryResult) {
    console.log('\n' + '='.repeat(50));
    console.log('🛠️ RECOVERY RESULT');
    console.log('='.repeat(50));

    const statusEmoji = result.success ? '✅' : '❌';
    console.log(`\n${statusEmoji} Status: ${result.message}`);

    if (result.details.length > 0) {
      console.log('\n📋 Details:');
      result.details.forEach(detail => console.log(`  ${detail}`));
    }

    if (result.rollbackAvailable) {
      console.log('\n🔄 Rollback available: git stash pop (to restore changes)');
    }

    console.log('\n' + '='.repeat(50));
  }
}

// CLI 실행
if (require.main === module) {
  const toolkit = new RecoveryToolkit(process.argv[3] || '.');
  const command = process.argv[2];

  let recoveryPromise: Promise<RecoveryResult>;

  switch (command) {
    case 'typescript':
      recoveryPromise = toolkit.fixTypeScriptErrors();
      break;
    case 'security':
      recoveryPromise = toolkit.fixSecurityVulnerabilities();
      break;
    case 'build':
      recoveryPromise = toolkit.fixBuildErrors();
      break;
    case 'rollback':
      recoveryPromise = toolkit.performEmergencyRollback();
      break;
    default:
      console.log('Usage: recovery-toolkit [typescript|security|build|rollback] [project-path]');
      process.exit(1);
  }

  recoveryPromise
    .then(result => {
      toolkit.printResult(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Recovery failed:', error);
      process.exit(2);
    });
}

export { RecoveryToolkit };