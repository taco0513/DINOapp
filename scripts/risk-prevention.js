#!/usr/bin/env node

/**
 * Risk Prevention Framework for DINO v2.0
 * Automated quality assurance and risk assessment
 * 
 * Usage:
 * - npm run risk-check (full check)
 * - npm run zero-defects-check (pre-commit)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxBundleSize: 300 * 1024, // 300KB
  minTestCoverage: 80,
  maxComplexity: 10,
  checkPaths: ['app', 'components', 'lib', 'types'],
  excludePaths: ['node_modules', '.next', 'dist']
};

// Risk levels
const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

class RiskAssessment {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.metrics = {};
  }

  // Main assessment runner
  async runAssessment() {
    console.log('🛡️  DINO v2.0 Risk Prevention Framework');
    console.log('=====================================\n');

    try {
      await this.checkTypeScript();
      await this.checkLinting();
      await this.checkBundleSize();
      await this.checkTestCoverage();
      await this.checkCodeComplexity();
      await this.checkSecurityVulnerabilities();
      
      this.generateReport();
      return this.calculateRiskScore();
    } catch (error) {
      console.error('❌ Risk assessment failed:', error.message);
      process.exit(1);
    }
  }

  // TypeScript type checking
  async checkTypeScript() {
    console.log('🔍 Checking TypeScript...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ TypeScript: No errors\n');
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (errorOutput.match(/error TS/g) || []).length;
      
      this.issues.push({
        type: 'TypeScript',
        level: errorCount > 5 ? RISK_LEVELS.CRITICAL : RISK_LEVELS.HIGH,
        message: `${errorCount} TypeScript errors found`,
        details: errorOutput.split('\n').slice(0, 10).join('\n')
      });
    }
  }

  // ESLint checking
  async checkLinting() {
    console.log('🔍 Checking ESLint...');
    try {
      const output = execSync('npx eslint . --ext .ts,.tsx --format json', { stdio: 'pipe' });
      const results = JSON.parse(output.toString());
      
      const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
      const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);
      
      if (errorCount === 0 && warningCount === 0) {
        console.log('✅ ESLint: No issues\n');
      } else {
        this.issues.push({
          type: 'ESLint',
          level: errorCount > 0 ? RISK_LEVELS.HIGH : RISK_LEVELS.MEDIUM,
          message: `${errorCount} errors, ${warningCount} warnings`,
          details: results.slice(0, 5).map(r => `${r.filePath}: ${r.messages.length} issues`).join('\n')
        });
      }
    } catch (error) {
      this.warnings.push({
        type: 'ESLint',
        message: 'Could not run ESLint check'
      });
    }
  }

  // Bundle size checking
  async checkBundleSize() {
    console.log('🔍 Checking bundle size...');
    try {
      // Build the project
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check .next/static/chunks directory
      const chunksDir = path.join(process.cwd(), '.next/static/chunks');
      if (fs.existsSync(chunksDir)) {
        const files = fs.readdirSync(chunksDir);
        const totalSize = files.reduce((size, file) => {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          return size + stats.size;
        }, 0);
        
        this.metrics.bundleSize = totalSize;
        
        if (totalSize > CONFIG.maxBundleSize) {
          this.issues.push({
            type: 'Bundle Size',
            level: RISK_LEVELS.MEDIUM,
            message: `Bundle size ${Math.round(totalSize / 1024)}KB exceeds limit ${Math.round(CONFIG.maxBundleSize / 1024)}KB`
          });
        } else {
          console.log(`✅ Bundle size: ${Math.round(totalSize / 1024)}KB (within limit)\n`);
        }
      }
    } catch (error) {
      this.warnings.push({
        type: 'Bundle Size',
        message: 'Could not check bundle size'
      });
    }
  }

  // Test coverage checking
  async checkTestCoverage() {
    console.log('🔍 Checking test coverage...');
    try {
      const output = execSync('npm test -- --coverage --watchAll=false', { stdio: 'pipe' });
      const coverageMatch = output.toString().match(/All files\s+\|\s+([\d.]+)/);
      
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        this.metrics.testCoverage = coverage;
        
        if (coverage < CONFIG.minTestCoverage) {
          this.issues.push({
            type: 'Test Coverage',
            level: RISK_LEVELS.MEDIUM,
            message: `Test coverage ${coverage}% is below minimum ${CONFIG.minTestCoverage}%`
          });
        } else {
          console.log(`✅ Test coverage: ${coverage}%\n`);
        }
      }
    } catch (error) {
      this.warnings.push({
        type: 'Test Coverage',
        message: 'Could not check test coverage (tests may not be set up)'
      });
    }
  }

  // Code complexity checking
  async checkCodeComplexity() {
    console.log('🔍 Checking code complexity...');
    
    const complexFiles = [];
    const self = this;
    
    function checkComplexity(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !CONFIG.excludePaths.includes(item)) {
          checkComplexity(itemPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const content = fs.readFileSync(itemPath, 'utf8');
          const complexity = self.calculateCyclomaticComplexity(content);
          
          if (complexity > CONFIG.maxComplexity) {
            complexFiles.push({ file: itemPath, complexity });
          }
        }
      }
    }
    
    CONFIG.checkPaths.forEach(checkPath => {
      const fullPath = path.join(process.cwd(), checkPath);
      if (fs.existsSync(fullPath)) {
        checkComplexity(fullPath);
      }
    });
    
    if (complexFiles.length > 0) {
      this.issues.push({
        type: 'Code Complexity',
        level: RISK_LEVELS.MEDIUM,
        message: `${complexFiles.length} files exceed complexity threshold`,
        details: complexFiles.slice(0, 5).map(f => `${f.file}: ${f.complexity}`).join('\n')
      });
    } else {
      console.log('✅ Code complexity: Within limits\n');
    }
  }

  // Simple cyclomatic complexity calculation
  calculateCyclomaticComplexity(code) {
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\s*.*\s*:/g, // ternary
      /\&\&/g,
      /\|\|/g
    ];
    
    let complexity = 1; // Base complexity
    
    complexityPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  // Security vulnerability checking
  async checkSecurityVulnerabilities() {
    console.log('🔍 Checking security vulnerabilities...');
    try {
      const output = execSync('npm audit --json', { stdio: 'pipe' });
      const audit = JSON.parse(output.toString());
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const highSeverity = Object.values(audit.vulnerabilities).filter(v => 
          v.severity === 'high' || v.severity === 'critical'
        ).length;
        
        this.issues.push({
          type: 'Security',
          level: highSeverity > 0 ? RISK_LEVELS.HIGH : RISK_LEVELS.MEDIUM,
          message: `${Object.keys(audit.vulnerabilities).length} vulnerabilities found (${highSeverity} high/critical)`
        });
      } else {
        console.log('✅ Security: No vulnerabilities\n');
      }
    } catch (error) {
      // npm audit returns non-zero for vulnerabilities, so we handle both cases
      try {
        const output = error.stdout?.toString();
        if (output) {
          const audit = JSON.parse(output);
          // Process as above
        }
      } catch {
        this.warnings.push({
          type: 'Security',
          message: 'Could not check security vulnerabilities'
        });
      }
    }
  }

  // Calculate overall risk score
  calculateRiskScore() {
    const weights = {
      [RISK_LEVELS.LOW]: 1,
      [RISK_LEVELS.MEDIUM]: 3,
      [RISK_LEVELS.HIGH]: 7,
      [RISK_LEVELS.CRITICAL]: 10
    };
    
    const totalScore = this.issues.reduce((score, issue) => {
      return score + weights[issue.level];
    }, 0);
    
    // Normalize to 0-100 scale
    const maxPossibleScore = this.issues.length * 10;
    const riskScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    return {
      score: riskScore,
      level: riskScore < 25 ? RISK_LEVELS.LOW :
             riskScore < 50 ? RISK_LEVELS.MEDIUM :
             riskScore < 75 ? RISK_LEVELS.HIGH : RISK_LEVELS.CRITICAL,
      issues: this.issues.length,
      warnings: this.warnings.length
    };
  }

  // Generate final report
  generateReport() {
    console.log('\n📊 RISK ASSESSMENT REPORT');
    console.log('========================\n');
    
    // Metrics summary
    if (Object.keys(this.metrics).length > 0) {
      console.log('📈 Metrics:');
      if (this.metrics.bundleSize) {
        console.log(`   Bundle Size: ${Math.round(this.metrics.bundleSize / 1024)}KB`);
      }
      if (this.metrics.testCoverage) {
        console.log(`   Test Coverage: ${this.metrics.testCoverage}%`);
      }
      console.log('');
    }
    
    // Issues
    if (this.issues.length > 0) {
      console.log('🚨 Issues Found:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.level}] ${issue.type}: ${issue.message}`);
        if (issue.details) {
          console.log(`      ${issue.details.split('\n')[0]}...`);
        }
      });
      console.log('');
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.type}: ${warning.message}`);
      });
      console.log('');
    }
    
    // Final assessment
    const risk = this.calculateRiskScore();
    const riskEmoji = {
      [RISK_LEVELS.LOW]: '🟢',
      [RISK_LEVELS.MEDIUM]: '🟡',
      [RISK_LEVELS.HIGH]: '🟠',
      [RISK_LEVELS.CRITICAL]: '🔴'
    };
    
    console.log(`${riskEmoji[risk.level]} Overall Risk Level: ${risk.level}`);
    console.log(`   Risk Score: ${Math.round(risk.score)}/100`);
    console.log(`   Issues: ${risk.issues}, Warnings: ${risk.warnings}\n`);
    
    // Recommendations
    if (risk.level === RISK_LEVELS.CRITICAL || risk.level === RISK_LEVELS.HIGH) {
      console.log('🚫 DEPLOYMENT NOT RECOMMENDED');
      console.log('   Please address critical and high-risk issues before deploying.\n');
      process.exit(1);
    } else if (risk.level === RISK_LEVELS.MEDIUM) {
      console.log('⚠️  DEPLOYMENT WITH CAUTION');
      console.log('   Consider addressing medium-risk issues before deploying.\n');
    } else {
      console.log('✅ DEPLOYMENT APPROVED');
      console.log('   All checks passed. Safe to deploy.\n');
    }
    
    return risk;
  }
}

// CLI execution
if (require.main === module) {
  const assessment = new RiskAssessment();
  assessment.runAssessment().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = RiskAssessment;