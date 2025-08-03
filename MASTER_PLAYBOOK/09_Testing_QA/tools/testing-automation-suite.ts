#!/usr/bin/env node
/**
 * Testing Automation Suite - 완전 자동화된 테스트 관리 시스템
 * 테스트 생성, 실행, 분석, 리포팅을 통합 관리
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestConfiguration {
  framework: 'jest' | 'vitest' | 'mocha' | 'playwright';
  testPattern: string;
  coverageThreshold: {
    branches: number;
    functions: number;
    lines: number;
    statements: number;
  };
  parallel: boolean;
  timeout: number;
  retries: number;
}

interface TestResult {
  framework: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  coverage: CoverageReport;
  failures: TestFailure[];
}

interface CoverageReport {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  uncoveredLines: Array<{ file: string; lines: number[] }>;
}

interface TestFailure {
  testName: string;
  file: string;
  error: string;
  stackTrace: string;
  duration: number;
}

interface TestSuiteMetrics {
  totalDuration: number;
  testVelocity: number; // tests per minute
  flakeRate: number; // percentage of flaky tests
  coverageChange: number; // coverage change from last run
  qualityScore: number; // overall quality score (0-100)
}

class TestingAutomationSuite {
  private config: TestConfiguration;
  private testHistory: TestResult[] = [];
  private flakeTracker = new Map<string, number[]>(); // test name -> failure timestamps
  
  constructor(config: TestConfiguration) {
    this.config = config;
    this.loadTestHistory();
  }
  
  // 메인 테스트 실행 메서드
  async runTestSuite(options: {
    watch?: boolean;
    coverage?: boolean;
    updateSnapshots?: boolean;
    verbose?: boolean;
    filter?: string;
  } = {}): Promise<TestResult> {
    console.log('🧪 Starting Test Automation Suite...\n');
    
    const startTime = Date.now();
    
    try {
      // 1. 사전 검사
      await this.performPreChecks();
      
      // 2. 테스트 환경 준비
      await this.setupTestEnvironment();
      
      // 3. 테스트 실행
      const result = await this.executeTests(options);
      
      // 4. 결과 분석
      const metrics = this.analyzeResults(result);
      
      // 5. 리포트 생성
      await this.generateReports(result, metrics);
      
      // 6. 사후 작업
      await this.performPostActions(result);
      
      console.log(`\n✅ Test suite completed in ${Date.now() - startTime}ms`);
      return result;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }
  
  // 스마트 테스트 생성
  async generateTests(options: {
    sourceFile: string;
    testType: 'unit' | 'integration' | 'e2e';
    mockStrategy: 'full' | 'partial' | 'none';
    coverage: 'basic' | 'comprehensive';
  }): Promise<string> {
    console.log(`🤖 Generating ${options.testType} tests for ${options.sourceFile}...`);
    
    const sourceCode = fs.readFileSync(options.sourceFile, 'utf8');
    const testCode = await this.analyzeAndGenerateTest(sourceCode, options);
    
    const testFileName = this.getTestFileName(options.sourceFile, options.testType);
    fs.writeFileSync(testFileName, testCode);
    
    console.log(`✅ Generated test file: ${testFileName}`);
    return testFileName;
  }
  
  private async analyzeAndGenerateTest(
    sourceCode: string, 
    options: any
  ): Promise<string> {
    // 소스 코드 분석
    const analysis = this.analyzeSourceCode(sourceCode);
    
    let testTemplate = '';
    
    // 테스트 타입별 템플릿 생성
    switch (options.testType) {
      case 'unit':
        testTemplate = this.generateUnitTestTemplate(analysis, options);
        break;
      case 'integration':
        testTemplate = this.generateIntegrationTestTemplate(analysis, options);
        break;
      case 'e2e':
        testTemplate = this.generateE2ETestTemplate(analysis, options);
        break;
    }
    
    return testTemplate;
  }
  
  private analyzeSourceCode(sourceCode: string): any {
    // 간단한 코드 분석 (실제로는 AST 파서 사용)
    const functions = sourceCode.match(/(?:function|const|let|var)\s+(\w+)/g) || [];
    const classes = sourceCode.match(/class\s+(\w+)/g) || [];
    const imports = sourceCode.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    const exports = sourceCode.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g) || [];
    
    return {
      functions: functions.map(f => f.split(/\s+/).pop()),
      classes: classes.map(c => c.split(/\s+/).pop()),
      imports: imports.map(i => i.match(/['"]([^'"]+)['"]/)?.[1]),
      exports: exports.map(e => e.split(/\s+/).pop())
    };
  }
  
  private generateUnitTestTemplate(analysis: any, options: any): string {
    const { functions, classes, imports } = analysis;
    
    let template = `// Auto-generated unit tests
import { jest } from '@jest/globals';
`;
    
    // Import statements
    imports.forEach((imp: string) => {
      if (imp && !imp.includes('test') && !imp.includes('spec')) {
        template += `import * as ${imp.replace(/[^a-zA-Z0-9]/g, '')} from '${imp}';\n`;
      }
    });
    
    template += `
describe('Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
`;
    
    // 함수별 테스트 생성
    functions.forEach((func: string) => {
      template += `
  describe('${func}', () => {
    test('should execute successfully', () => {
      // Arrange
      const mockInput = {};
      
      // Act
      const result = ${func}(mockInput);
      
      // Assert
      expect(result).toBeDefined();
    });
    
    test('should handle edge cases', () => {
      // Test null/undefined inputs
      expect(() => ${func}(null)).not.toThrow();
      expect(() => ${func}(undefined)).not.toThrow();
    });
    
    ${options.coverage === 'comprehensive' ? `
    test('should handle error scenarios', () => {
      // Test error conditions
      expect(() => ${func}({})).not.toThrow();
    });
    
    test('should validate input parameters', () => {
      // Test parameter validation
      expect(${func}).toBeDefined();
    });` : ''}
  });`;
    });
    
    // 클래스별 테스트 생성
    classes.forEach((cls: string) => {
      template += `
  describe('${cls}', () => {
    let instance: ${cls};
    
    beforeEach(() => {
      instance = new ${cls}();
    });
    
    test('should instantiate correctly', () => {
      expect(instance).toBeInstanceOf(${cls});
    });
    
    test('should have required methods', () => {
      // Verify public interface
      expect(typeof instance).toBe('object');
    });
  });`;
    });
    
    template += `
});
`;
    
    return template;
  }
  
  private generateIntegrationTestTemplate(analysis: any, options: any): string {
    return `// Auto-generated integration tests
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';

describe('Integration Tests', () => {
  let app: any;
  let server: any;
  
  beforeAll(async () => {
    // Setup test environment
    app = await createTestApp();
    server = app.listen(0);
  });
  
  afterAll(async () => {
    // Cleanup
    if (server) {
      await server.close();
    }
  });
  
  describe('API Endpoints', () => {
    test('should handle GET requests', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);
        
      expect(response.body).toBeDefined();
    });
    
    test('should handle POST requests', async () => {
      const testData = { name: 'test' };
      
      const response = await request(app)
        .post('/api/test')
        .send(testData)
        .expect(201);
        
      expect(response.body).toMatchObject(testData);
    });
    
    test('should handle error scenarios', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
  
  describe('Database Integration', () => {
    test('should connect to database', async () => {
      // Test database connection
      expect(true).toBe(true); // Replace with actual test
    });
    
    test('should perform CRUD operations', async () => {
      // Test database operations
      expect(true).toBe(true); // Replace with actual test
    });
  });
});
`;
  }
  
  private generateE2ETestTemplate(analysis: any, options: any): string {
    return `// Auto-generated E2E tests
import { test, expect, Page } from '@playwright/test';

test.describe('E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await page.goto('/');
  });
  
  test('should load homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Home/);
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('should handle user interactions', async ({ page }) => {
    // Test user interactions
    await page.click('button[data-testid="primary-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });
  
  test('should navigate between pages', async ({ page }) => {
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
  });
  
  test('should handle forms', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.form-success')).toBeVisible();
  });
  
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-menu')).toBeVisible();
  });
});
`;
  }
  
  private async performPreChecks(): Promise<void> {
    console.log('🔍 Performing pre-flight checks...');
    
    // Node.js 버전 확인
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);
    
    // 의존성 확인
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasTestDependencies = packageJson.devDependencies && 
      (packageJson.devDependencies.jest || 
       packageJson.devDependencies.vitest || 
       packageJson.devDependencies['@playwright/test']);
       
    if (!hasTestDependencies) {
      throw new Error('No testing framework found in devDependencies');
    }
    
    // 테스트 파일 존재 확인
    const testFiles = this.findTestFiles();
    console.log(`   Found ${testFiles.length} test files`);
    
    if (testFiles.length === 0) {
      console.warn('   ⚠️  No test files found');
    }
  }
  
  private async setupTestEnvironment(): Promise<void> {
    console.log('🛠️  Setting up test environment...');
    
    // 환경 변수 설정
    process.env.NODE_ENV = 'test';
    process.env.CI = process.env.CI || 'false';
    
    // 테스트 데이터베이스 초기화 (필요한 경우)
    if (fs.existsSync('test/setup.js') || fs.existsSync('test/setup.ts')) {
      console.log('   Running test setup...');
      try {
        require(path.resolve('test/setup.js'));
      } catch (error) {
        console.warn('   ⚠️  Test setup failed:', error.message);
      }
    }
    
    // 캐시 정리
    if (fs.existsSync('node_modules/.cache')) {
      console.log('   Clearing test cache...');
      await execAsync('rm -rf node_modules/.cache/jest');
    }
  }
  
  private async executeTests(options: any): Promise<TestResult> {
    console.log('🏃 Executing tests...');
    
    const command = this.buildTestCommand(options);
    console.log(`   Command: ${command}`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.config.timeout,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(stdout, stderr, duration);
      
      // 테스트 히스토리에 추가
      this.testHistory.push(result);
      this.saveTestHistory();
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // 부분 실패의 경우에도 결과 파싱 시도
      const result = this.parseTestOutput(error.stdout || '', error.stderr || '', duration);
      result.failures = result.failures || [];
      
      if (error.message) {
        result.failures.push({
          testName: 'Test Execution',
          file: 'unknown',
          error: error.message,
          stackTrace: error.stack || '',
          duration: 0
        });
      }
      
      this.testHistory.push(result);
      this.saveTestHistory();
      
      return result;
    }
  }
  
  private buildTestCommand(options: any): string {
    let command = '';
    
    switch (this.config.framework) {
      case 'jest':
        command = 'npx jest';
        if (options.coverage) command += ' --coverage';
        if (options.watch) command += ' --watch';
        if (options.updateSnapshots) command += ' --updateSnapshot';
        if (options.verbose) command += ' --verbose';
        if (options.filter) command += ` --testNamePattern="${options.filter}"`;
        if (this.config.parallel) command += ' --maxWorkers=50%';
        break;
        
      case 'vitest':
        command = 'npx vitest';
        if (options.coverage) command += ' --coverage';
        if (options.watch) command += ' --watch';
        if (options.verbose) command += ' --reporter=verbose';
        break;
        
      case 'playwright':
        command = 'npx playwright test';
        if (options.verbose) command += ' --reporter=list';
        break;
        
      default:
        throw new Error(`Unsupported framework: ${this.config.framework}`);
    }
    
    return command;
  }
  
  private parseTestOutput(stdout: string, stderr: string, duration: number): TestResult {
    // Jest 출력 파싱 (다른 프레임워크도 유사하게 구현)
    const testMatch = stdout.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    const coverageMatch = stdout.match(/All files[^|]*\|\s*(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)/);
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    
    if (testMatch) {
      failedTests = parseInt(testMatch[1]) || 0;
      passedTests = parseInt(testMatch[2]) || 0;
      totalTests = parseInt(testMatch[3]) || 0;
      skippedTests = totalTests - passedTests - failedTests;
    }
    
    const coverage: CoverageReport = {
      statements: coverageMatch ? parseFloat(coverageMatch[1]) : 0,
      branches: coverageMatch ? parseFloat(coverageMatch[2]) : 0,
      functions: coverageMatch ? parseFloat(coverageMatch[3]) : 0,
      lines: coverageMatch ? parseFloat(coverageMatch[4]) : 0,
      uncoveredLines: []
    };
    
    // 실패한 테스트 파싱
    const failures: TestFailure[] = [];
    const failurePattern = /FAIL\s+([^\n]+)\n[\s\S]*?●\s+([^\n]+)\n[\s\S]*?Error:\s+([^\n]+)/g;
    let match;
    
    while ((match = failurePattern.exec(stdout + stderr)) !== null) {
      failures.push({
        testName: match[2],
        file: match[1],
        error: match[3],
        stackTrace: match[0],
        duration: 0
      });
    }
    
    return {
      framework: this.config.framework,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      duration,
      coverage,
      failures
    };
  }
  
  private analyzeResults(result: TestResult): TestSuiteMetrics {
    // 테스트 속도 계산
    const testVelocity = result.totalTests / (result.duration / 60000); // tests per minute
    
    // 플래키 테스트 비율 계산
    let flakeRate = 0;
    if (this.testHistory.length > 1) {
      const recentFailures = new Set();
      const recentPasses = new Set();
      
      this.testHistory.slice(-5).forEach(run => {
        run.failures.forEach(failure => recentFailures.add(failure.testName));
      });
      
      this.testHistory.slice(-5).forEach(run => {
        // 통과한 테스트들도 추적 (실패 기록이 있다면 플래키)
        // 간단히 총 테스트에서 실패한 테스트를 뺀 것으로 추정
        for (let i = 0; i < run.passedTests; i++) {
          recentPasses.add(`test_${i}`);
        }
      });
      
      const flakyTests = Array.from(recentFailures).filter(test => recentPasses.has(test));
      flakeRate = (flakyTests.length / result.totalTests) * 100;
    }
    
    // 커버리지 변화 계산
    let coverageChange = 0;
    if (this.testHistory.length > 1) {
      const previousRun = this.testHistory[this.testHistory.length - 2];
      coverageChange = result.coverage.lines - previousRun.coverage.lines;
    }
    
    // 품질 점수 계산 (0-100)
    const passRate = (result.passedTests / result.totalTests) * 100;
    const coverageScore = (result.coverage.lines + result.coverage.branches + 
                         result.coverage.functions + result.coverage.statements) / 4;
    const flakeHealthScore = Math.max(0, 100 - flakeRate * 10);
    
    const qualityScore = (passRate * 0.4 + coverageScore * 0.4 + flakeHealthScore * 0.2);
    
    return {
      totalDuration: result.duration,
      testVelocity,
      flakeRate,
      coverageChange,
      qualityScore
    };
  }
  
  private async generateReports(result: TestResult, metrics: TestSuiteMetrics): Promise<void> {
    console.log('📊 Generating test reports...');
    
    const reportDir = 'test-reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // HTML 리포트 생성
    const htmlReport = this.generateHtmlReport(result, metrics);
    fs.writeFileSync(path.join(reportDir, 'test-report.html'), htmlReport);
    
    // JSON 리포트 생성
    const jsonReport = {
      timestamp: new Date().toISOString(),
      result,
      metrics,
      history: this.testHistory.slice(-10) // 최근 10개 결과만
    };
    fs.writeFileSync(path.join(reportDir, 'test-report.json'), JSON.stringify(jsonReport, null, 2));
    
    // 콘솔 요약 출력
    this.printSummary(result, metrics);
  }
  
  private generateHtmlReport(result: TestResult, metrics: TestSuiteMetrics): string {
    const passRate = ((result.passedTests / result.totalTests) * 100).toFixed(1);
    const coverageColor = result.coverage.lines >= 80 ? 'green' : result.coverage.lines >= 60 ? 'orange' : 'red';
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 3px; }
        .coverage { color: ${coverageColor}; font-weight: bold; }
        .failures { background: #ffe6e6; padding: 15px; border-radius: 5px; }
        .failure { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid red; }
    </style>
</head>
<body>
    <h1>Test Report - ${new Date().toLocaleString()}</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Total Tests: <strong>${result.totalTests}</strong></div>
        <div class="metric">Passed: <strong style="color: green">${result.passedTests}</strong></div>
        <div class="metric">Failed: <strong style="color: red">${result.failedTests}</strong></div>
        <div class="metric">Pass Rate: <strong>${passRate}%</strong></div>
        <div class="metric">Duration: <strong>${(result.duration / 1000).toFixed(2)}s</strong></div>
        <div class="metric">Quality Score: <strong>${metrics.qualityScore.toFixed(1)}/100</strong></div>
    </div>
    
    <div class="summary">
        <h2>Coverage</h2>
        <div class="metric">Lines: <span class="coverage">${result.coverage.lines.toFixed(1)}%</span></div>
        <div class="metric">Branches: <span class="coverage">${result.coverage.branches.toFixed(1)}%</span></div>
        <div class="metric">Functions: <span class="coverage">${result.coverage.functions.toFixed(1)}%</span></div>
        <div class="metric">Statements: <span class="coverage">${result.coverage.statements.toFixed(1)}%</span></div>
    </div>
    
    ${result.failures.length > 0 ? `
    <div class="failures">
        <h2>Failures (${result.failures.length})</h2>
        ${result.failures.map(failure => `
            <div class="failure">
                <strong>${failure.testName}</strong> in ${failure.file}<br>
                <em>${failure.error}</em>
            </div>
        `).join('')}
    </div>
    ` : '<div style="color: green; font-size: 18px;">🎉 All tests passed!</div>'}
    
</body>
</html>`;
  }
  
  private printSummary(result: TestResult, metrics: TestSuiteMetrics): void {
    console.log('\n📋 Test Summary:');
    console.log(`   Total Tests: ${result.totalTests}`);
    console.log(`   ✅ Passed: ${result.passedTests}`);
    console.log(`   ❌ Failed: ${result.failedTests}`);
    console.log(`   ⏭️  Skipped: ${result.skippedTests}`);
    console.log(`   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`   📊 Coverage: ${result.coverage.lines.toFixed(1)}%`);
    console.log(`   🏆 Quality Score: ${metrics.qualityScore.toFixed(1)}/100`);
    
    if (metrics.flakeRate > 0) {
      console.log(`   🔥 Flake Rate: ${metrics.flakeRate.toFixed(1)}%`);
    }
    
    if (result.failures.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      result.failures.forEach(failure => {
        console.log(`   • ${failure.testName}: ${failure.error}`);
      });
    }
  }
  
  private async performPostActions(result: TestResult): Promise<void> {
    // 실패한 테스트가 있는 경우 알림
    if (result.failedTests > 0) {
      console.log(`\n⚠️  ${result.failedTests} tests failed. Check the report for details.`);
    }
    
    // 커버리지 임계값 체크
    const { coverageThreshold } = this.config;
    if (result.coverage.lines < coverageThreshold.lines) {
      console.log(`\n⚠️  Coverage below threshold: ${result.coverage.lines.toFixed(1)}% < ${coverageThreshold.lines}%`);
    }
    
    // 테스트 파일 정리 (필요한 경우)
    if (fs.existsSync('coverage')) {
      console.log('   Preserving coverage reports...');
    }
  }
  
  private findTestFiles(): string[] {
    const testFiles: string[] = [];
    const testDirs = ['test', 'tests', '__tests__', 'src'];
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = this.findFilesRecursively(dir, /\.(test|spec)\.(js|ts|jsx|tsx)$/);
        testFiles.push(...files);
      }
    });
    
    return testFiles;
  }
  
  private findFilesRecursively(dir: string, pattern: RegExp): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...this.findFilesRecursively(fullPath, pattern));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  private getTestFileName(sourceFile: string, testType: string): string {
    const ext = path.extname(sourceFile);
    const base = path.basename(sourceFile, ext);
    const dir = path.dirname(sourceFile);
    
    return path.join(dir, `${base}.${testType}.test${ext}`);
  }
  
  private loadTestHistory(): void {
    const historyFile = '.test-history.json';
    if (fs.existsSync(historyFile)) {
      try {
        this.testHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.warn('Failed to load test history:', error.message);
        this.testHistory = [];
      }
    }
  }
  
  private saveTestHistory(): void {
    const historyFile = '.test-history.json';
    
    // 최근 50개 결과만 보관
    const trimmedHistory = this.testHistory.slice(-50);
    
    try {
      fs.writeFileSync(historyFile, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
      console.warn('Failed to save test history:', error.message);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const config: TestConfiguration = {
    framework: 'jest',
    testPattern: '**/*.{test,spec}.{js,ts,jsx,tsx}',
    coverageThreshold: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    parallel: true,
    timeout: 300000, // 5 minutes
    retries: 0
  };
  
  const suite = new TestingAutomationSuite(config);
  
  const command = args[0];
  
  switch (command) {
    case 'run':
      const options = {
        watch: args.includes('--watch'),
        coverage: args.includes('--coverage'),
        updateSnapshots: args.includes('--update-snapshots'),
        verbose: args.includes('--verbose'),
        filter: args.find(arg => arg.startsWith('--filter='))?.split('=')[1]
      };
      
      suite.runTestSuite(options)
        .then(result => {
          process.exit(result.failedTests > 0 ? 1 : 0);
        })
        .catch(error => {
          console.error('Test suite failed:', error);
          process.exit(1);
        });
      break;
      
    case 'generate':
      const sourceFile = args[1];
      const testType = (args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'unit') as 'unit' | 'integration' | 'e2e';
      
      if (!sourceFile) {
        console.error('Usage: npm run test generate <source-file> [--type=unit|integration|e2e]');
        process.exit(1);
      }
      
      suite.generateTests({
        sourceFile,
        testType,
        mockStrategy: 'partial',
        coverage: 'comprehensive'
      })
        .then(testFile => {
          console.log(`Generated test file: ${testFile}`);
          process.exit(0);
        })
        .catch(error => {
          console.error('Test generation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
Usage:
  npm run test run [--coverage] [--watch] [--verbose] [--filter=pattern]
  npm run test generate <source-file> [--type=unit|integration|e2e]

Examples:
  npm run test run --coverage --verbose
  npm run test generate src/utils/math.ts --type=unit
  npm run test run --filter="user.*login"
`);
      process.exit(0);
  }
}

export { TestingAutomationSuite, TestConfiguration, TestResult, TestSuiteMetrics };