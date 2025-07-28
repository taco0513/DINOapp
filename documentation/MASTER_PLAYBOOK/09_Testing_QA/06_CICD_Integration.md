# CI/CD 통합 완전 가이드

## CI/CD 파이프라인 테스트 통합

SuperClaude AI 워크플로우를 활용하여 테스트가 완전히 통합된 CI/CD 파이프라인을 구축하는 종합 가이드입니다.

### CI/CD 테스트 전략

```yaml
cicd_test_strategy:
  continuous_integration:
    triggers: ["push", "pull_request", "schedule"]
    stages: ["lint", "test", "build", "security", "quality-gate"]
    parallelization: true
    early_feedback: true
    
  continuous_delivery:
    environments: ["staging", "pre-production"]
    deployment_tests: ["smoke", "integration", "e2e"]
    rollback_capability: true
    monitoring_integration: true
    
  continuous_deployment:
    environments: ["production"]
    deployment_strategy: ["blue-green", "canary", "rolling"]
    post_deployment_tests: ["health-check", "monitoring"]
    automated_rollback: true
```

### SuperClaude를 활용한 CI/CD 구축

```bash
# 1. GitHub Actions 워크플로우 구현
/implement "GitHub Actions 파이프라인" --multi-stage --parallel --matrix

# 2. 테스트 최적화 및 병렬화
/implement "테스트 병렬화" --jest-workers --playwright-sharding --resource-optimization

# 3. 품질 게이트 자동화
/implement "자동 품질 게이트" --sonarqube --codecov --security-scanning

# 4. 배포 자동화 및 모니터링
/implement "배포 파이프라인" --automated-testing --health-checks --rollback
```

## GitHub Actions 워크플로우

### 종합 CI/CD 파이프라인

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # 매일 오전 2시 정기 빌드

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 코드 품질 및 보안 검사
  code-quality:
    name: Code Quality & Security
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # SonarCloud 전체 히스토리 필요
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint check
        run: npm run lint:check
      
      - name: Type check
        run: npm run type-check
      
      - name: Format check
        run: npm run format:check
      
      - name: Security audit
        run: npm audit --audit-level moderate
      
      - name: License check
        run: npm run license-check
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # 단위 테스트
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 21]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage --maxWorkers=2
      
      - name: Upload coverage to Codecov
        if: matrix.node-version == '20'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unit-tests
          fail_ci_if_error: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: unit-test-results-${{ matrix.node-version }}
          path: |
            coverage/
            test-results/

  # 통합 테스트
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Upload integration test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/

  # E2E 테스트
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1, 2, 3, 4]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: |
          npm start &
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/4
        env:
          CI: true
      
      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results-${{ matrix.browser }}-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/

  # 성능 테스트
  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: |
          npm start &
          npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Run load tests
        run: npm run test:load
      
      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            lighthouse-results/
            load-test-results/

  # 보안 테스트
  security-tests:
    name: Security Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --all-projects
      
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten
      
      - name: Build Docker image for scanning
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # 빌드 및 이미지 생성
  build:
    name: Build & Package
    runs-on: ubuntu-latest
    needs: [code-quality, unit-tests]
    
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-url: ${{ steps.build.outputs.image-url }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run bundle analyzer
        run: npm run analyze:bundle
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            build-stats.json
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 품질 게이트
  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [code-quality, unit-tests, integration-tests, security-tests]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download test results
        uses: actions/download-artifact@v3
        with:
          path: test-results/
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run quality gate check
        run: npm run quality:gate
      
      - name: Comment quality gate results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = 'quality-gate-results.json';
            
            if (fs.existsSync(path)) {
              const results = JSON.parse(fs.readFileSync(path, 'utf8'));
              const status = results.passed ? '✅ 통과' : '❌ 실패';
              const score = results.overallScore.toFixed(1);
              
              const comment = `## 🎯 품질 게이트 결과
              
              **상태**: ${status}
              **전체 점수**: ${score}/100
              
              ### 상세 결과
              ${results.results.map(r => `- ${r.message}`).join('\n')}
              `;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }

  # 스테이징 배포
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, quality-gate]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # 실제 배포 스크립트 실행
      
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --env=staging
      
      - name: Run staging integration tests
        run: |
          npm run test:staging

  # 프로덕션 배포
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, quality-gate, e2e-tests]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Blue-Green 또는 Canary 배포 실행
      
      - name: Run health checks
        run: |
          npm run health:check -- --env=production
      
      - name: Run production smoke tests
        run: |
          npm run test:smoke -- --env=production
      
      - name: Update deployment status
        if: always()
        run: |
          # 배포 상태를 모니터링 시스템에 전송
          echo "Deployment completed"

  # 배포 후 모니터링
  post-deployment-monitoring:
    name: Post-Deployment Monitoring
    runs-on: ubuntu-latest
    needs: [deploy-production]
    if: always() && needs.deploy-production.result == 'success'
    
    steps:
      - name: Wait for metrics stabilization
        run: sleep 300 # 5분 대기
      
      - name: Check error rates
        run: |
          # APM 도구에서 에러율 확인
          npm run monitor:errors
      
      - name: Check performance metrics
        run: |
          # 성능 지표 확인
          npm run monitor:performance
      
      - name: Send deployment notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 테스트 최적화 전략

### 병렬 테스트 실행

```javascript
// jest.config.js
module.exports = {
  // CI 환경에서 최적화된 설정
  maxWorkers: process.env.CI ? 2 : '50%',
  
  // 테스트 실행 최적화
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  
  // 프로젝트별 설정으로 병렬 실행
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/test/integration/setup.ts'],
      testEnvironment: 'node',
      // 통합 테스트는 순차 실행
      maxWorkers: 1
    }
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    }
  },
  
  // CI에서 성능 최적화
  ...(process.env.CI && {
    maxWorkers: 2,
    coverageReporters: ['text', 'lcov'],
    verbose: false,
    silent: true
  })
};
```

### Playwright 테스트 샤딩

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // CI에서 병렬 실행 최적화
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  
  // 테스트 샤딩 설정
  shard: process.env.SHARD ? {
    current: parseInt(process.env.SHARD.split('/')[0]),
    total: parseInt(process.env.SHARD.split('/')[1])
  } : undefined,
  
  // 타임아웃 설정
  timeout: 30000,
  expect: { timeout: 5000 },
  
  use: {
    // 브라우저 설정
    actionTimeout: 0,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // 실패 시 디버깅 정보
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // CI 최적화
    ...(process.env.CI && {
      video: 'off',
      screenshot: 'off'
    })
  },
  
  // 브라우저별 프로젝트 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 테스트는 중요한 테스트만
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /critical\.spec\.ts/
    }
  ],
  
  // 리포터 설정
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.CI ? [['github']] : [])
  ],
  
  // 웹 서버 설정
  webServer: process.env.CI ? undefined : {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### 테스트 결과 집계

```typescript
// scripts/aggregate-test-results.ts
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

interface TestResult {
  type: 'unit' | 'integration' | 'e2e';
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  coverage?: number;
}

interface AggregatedResults {
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalDuration: number;
    overallCoverage: number;
  };
  byType: TestResult[];
  details: any[];
}

export class TestResultAggregator {
  async aggregateResults(): Promise<AggregatedResults> {
    const results: AggregatedResults = {
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalDuration: 0,
        overallCoverage: 0
      },
      byType: [],
      details: []
    };

    // Jest 결과 수집
    const jestResults = await this.collectJestResults();
    if (jestResults) {
      results.byType.push(jestResults);
      results.details.push({ type: 'jest', data: jestResults });
    }

    // Playwright 결과 수집
    const playwrightResults = await this.collectPlaywrightResults();
    if (playwrightResults) {
      results.byType.push(playwrightResults);
      results.details.push({ type: 'playwright', data: playwrightResults });
    }

    // 커버리지 정보 수집
    const coverage = await this.collectCoverageInfo();
    if (coverage) {
      results.summary.overallCoverage = coverage.overall;
      results.details.push({ type: 'coverage', data: coverage });
    }

    // 전체 요약 계산
    results.summary = this.calculateSummary(results.byType, coverage);

    // 결과 저장
    await this.saveAggregatedResults(results);

    return results;
  }

  private async collectJestResults(): Promise<TestResult | null> {
    try {
      const jestOutput = await fs.readFile('test-results/jest-results.json', 'utf-8');
      const jestData = JSON.parse(jestOutput);

      return {
        type: 'unit',
        passed: jestData.numPassedTests,
        failed: jestData.numFailedTests,
        skipped: jestData.numPendingTests,
        total: jestData.numTotalTests,
        duration: jestData.testRunTime || 0
      };
    } catch (error) {
      console.warn('Jest 결과를 찾을 수 없습니다:', error.message);
      return null;
    }
  }

  private async collectPlaywrightResults(): Promise<TestResult | null> {
    try {
      const playwrightFiles = await glob('test-results/**/results.json');
      let totalPassed = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      let totalDuration = 0;

      for (const file of playwrightFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const data = JSON.parse(content);
        
        totalPassed += data.stats?.expected || 0;
        totalFailed += data.stats?.unexpected || 0;
        totalSkipped += data.stats?.skipped || 0;
        totalDuration += data.stats?.duration || 0;
      }

      return {
        type: 'e2e',
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        total: totalPassed + totalFailed + totalSkipped,
        duration: totalDuration
      };
    } catch (error) {
      console.warn('Playwright 결과를 찾을 수 없습니다:', error.message);
      return null;
    }
  }

  private async collectCoverageInfo(): Promise<any> {
    try {
      const coverageFile = await fs.readFile('coverage/coverage-summary.json', 'utf-8');
      const coverage = JSON.parse(coverageFile);
      
      return {
        overall: coverage.total.lines.pct,
        statements: coverage.total.statements.pct,
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct,
        lines: coverage.total.lines.pct
      };
    } catch (error) {
      console.warn('커버리지 정보를 찾을 수 없습니다:', error.message);
      return null;
    }
  }

  private calculateSummary(results: TestResult[], coverage: any): any {
    const summary = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalDuration: 0,
      overallCoverage: coverage?.overall || 0
    };

    for (const result of results) {
      summary.totalTests += result.total;
      summary.totalPassed += result.passed;
      summary.totalFailed += result.failed;
      summary.totalDuration += result.duration;
    }

    return summary;
  }

  private async saveAggregatedResults(results: AggregatedResults): Promise<void> {
    await fs.writeFile(
      'test-results/aggregated-results.json',
      JSON.stringify(results, null, 2)
    );

    // 사람이 읽기 쉬운 요약 생성
    const summary = this.generateHumanReadableSummary(results);
    await fs.writeFile('test-results/test-summary.md', summary);

    console.log('📊 테스트 결과 집계 완료');
    console.log(`총 테스트: ${results.summary.totalTests}`);
    console.log(`통과: ${results.summary.totalPassed}`);
    console.log(`실패: ${results.summary.totalFailed}`);
    console.log(`커버리지: ${results.summary.overallCoverage.toFixed(1)}%`);
  }

  private generateHumanReadableSummary(results: AggregatedResults): string {
    const { summary, byType } = results;
    const passRate = ((summary.totalPassed / summary.totalTests) * 100).toFixed(1);

    let markdown = `# 테스트 결과 요약\n\n`;
    markdown += `## 전체 요약\n\n`;
    markdown += `- **총 테스트**: ${summary.totalTests}\n`;
    markdown += `- **통과**: ${summary.totalPassed} (${passRate}%)\n`;
    markdown += `- **실패**: ${summary.totalFailed}\n`;
    markdown += `- **실행 시간**: ${(summary.totalDuration / 1000).toFixed(1)}초\n`;
    markdown += `- **커버리지**: ${summary.overallCoverage.toFixed(1)}%\n\n`;

    markdown += `## 테스트 유형별 결과\n\n`;
    
    for (const result of byType) {
      const typePassRate = ((result.passed / result.total) * 100).toFixed(1);
      markdown += `### ${result.type.toUpperCase()} 테스트\n\n`;
      markdown += `- 통과: ${result.passed}\n`;
      markdown += `- 실패: ${result.failed}\n`;
      markdown += `- 건너뜀: ${result.skipped}\n`;
      markdown += `- 성공률: ${typePassRate}%\n`;
      markdown += `- 실행 시간: ${(result.duration / 1000).toFixed(1)}초\n\n`;
    }

    // 실패한 테스트가 있으면 경고 추가
    if (summary.totalFailed > 0) {
      markdown += `## ⚠️ 주의사항\n\n`;
      markdown += `${summary.totalFailed}개의 테스트가 실패했습니다. 상세 내용을 확인하고 수정해주세요.\n\n`;
    }

    // 커버리지가 낮으면 경고 추가
    if (summary.overallCoverage < 80) {
      markdown += `## 📊 커버리지 개선 필요\n\n`;
      markdown += `현재 커버리지가 ${summary.overallCoverage.toFixed(1)}%입니다. 80% 이상을 목표로 테스트를 추가해주세요.\n\n`;
    }

    return markdown;
  }
}

// 스크립트 실행
if (require.main === module) {
  const aggregator = new TestResultAggregator();
  aggregator.aggregateResults().catch(console.error);
}
```

## 배포 전략 및 테스트

### Blue-Green 배포 테스트

```typescript
// scripts/blue-green-deployment.ts
interface DeploymentEnvironment {
  name: 'blue' | 'green';
  url: string;
  version: string;
  healthy: boolean;
}

interface DeploymentConfig {
  healthCheckTimeout: number;
  smokeTestTimeout: number;
  rollbackTimeout: number;
  trafficSwitchDelay: number;
}

export class BlueGreenDeployment {
  private config: DeploymentConfig = {
    healthCheckTimeout: 300000, // 5분
    smokeTestTimeout: 600000, // 10분
    rollbackTimeout: 180000, // 3분
    trafficSwitchDelay: 30000 // 30초
  };

  async deploy(newVersion: string): Promise<boolean> {
    console.log(`🚀 Blue-Green 배포 시작: ${newVersion}`);

    try {
      // 1. 현재 활성 환경 확인
      const activeEnv = await this.getActiveEnvironment();
      const inactiveEnv = activeEnv.name === 'blue' ? 'green' : 'blue';
      
      console.log(`현재 활성 환경: ${activeEnv.name}`);
      console.log(`배포 대상 환경: ${inactiveEnv}`);

      // 2. 비활성 환경에 새 버전 배포
      await this.deployToEnvironment(inactiveEnv, newVersion);

      // 3. 건강성 검사
      const healthCheckPassed = await this.performHealthCheck(inactiveEnv);
      if (!healthCheckPassed) {
        throw new Error('건강성 검사 실패');
      }

      // 4. 스모크 테스트 실행
      const smokeTestPassed = await this.runSmokeTests(inactiveEnv);
      if (!smokeTestPassed) {
        throw new Error('스모크 테스트 실패');
      }

      // 5. 트래픽 전환
      await this.switchTraffic(activeEnv.name, inactiveEnv);

      // 6. 전환 후 검증
      await this.postSwitchValidation(inactiveEnv);

      console.log(`✅ 배포 완료: ${newVersion}`);
      return true;

    } catch (error) {
      console.error(`❌ 배포 실패: ${error.message}`);
      await this.rollback();
      return false;
    }
  }

  private async getActiveEnvironment(): Promise<DeploymentEnvironment> {
    // 로드 밸런서에서 현재 활성 환경 조회
    const response = await fetch('/api/deployment/active');
    return await response.json();
  }

  private async deployToEnvironment(environment: string, version: string): Promise<void> {
    console.log(`📦 ${environment} 환경에 ${version} 배포 중...`);
    
    // 실제 배포 로직 (Kubernetes, Docker Swarm 등)
    const deployCommand = `kubectl set image deployment/app-${environment} app=myapp:${version}`;
    await this.executeCommand(deployCommand);
    
    // 배포 완료 대기
    await this.waitForDeployment(environment, version);
  }

  private async performHealthCheck(environment: string): Promise<boolean> {
    console.log(`🏥 ${environment} 환경 건강성 검사 중...`);
    
    const startTime = Date.now();
    const timeout = this.config.healthCheckTimeout;
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`https://${environment}.myapp.com/health`);
        const health = await response.json();
        
        if (health.status === 'healthy' && health.database && health.redis) {
          console.log(`✅ ${environment} 환경 건강성 검사 통과`);
          return true;
        }
        
        console.log(`⏳ ${environment} 환경 준비 중... (${health.status})`);
        await this.sleep(5000); // 5초 대기
        
      } catch (error) {
        console.log(`⏳ ${environment} 환경 연결 대기 중...`);
        await this.sleep(5000);
      }
    }
    
    console.log(`❌ ${environment} 환경 건강성 검사 타임아웃`);
    return false;
  }

  private async runSmokeTests(environment: string): Promise<boolean> {
    console.log(`🧪 ${environment} 환경에서 스모크 테스트 실행 중...`);
    
    try {
      // Playwright로 핵심 기능 테스트
      const testCommand = `npx playwright test smoke --config=playwright.smoke.config.ts`;
      const testEnv = {
        ...process.env,
        BASE_URL: `https://${environment}.myapp.com`,
        TEST_TIMEOUT: '30000'
      };
      
      const result = await this.executeCommand(testCommand, testEnv);
      
      if (result.exitCode === 0) {
        console.log(`✅ ${environment} 환경 스모크 테스트 통과`);
        return true;
      } else {
        console.log(`❌ ${environment} 환경 스모크 테스트 실패`);
        console.log(result.stderr);
        return false;
      }
      
    } catch (error) {
      console.log(`❌ 스모크 테스트 실행 오류: ${error.message}`);
      return false;
    }
  }

  private async switchTraffic(from: string, to: string): Promise<void> {
    console.log(`🔄 트래픽 전환: ${from} → ${to}`);
    
    // 점진적 트래픽 전환 (Canary 방식)
    const steps = [10, 25, 50, 75, 100];
    
    for (const percentage of steps) {
      console.log(`📊 ${to} 환경으로 ${percentage}% 트래픽 전환`);
      
      await this.updateLoadBalancer(to, percentage);
      await this.sleep(this.config.trafficSwitchDelay);
      
      // 각 단계마다 에러율 확인
      const errorRate = await this.checkErrorRate(to);
      if (errorRate > 1) { // 1% 초과 시 롤백
        throw new Error(`높은 에러율 감지: ${errorRate}%`);
      }
    }
    
    console.log(`✅ 트래픽 전환 완료`);
  }

  private async postSwitchValidation(environment: string): Promise<void> {
    console.log(`🔍 전환 후 검증 실행 중...`);
    
    // 1분간 메트릭 모니터링
    for (let i = 0; i < 12; i++) {
      const metrics = await this.getMetrics(environment);
      
      if (metrics.errorRate > 1 || metrics.responseTime > 2000) {
        throw new Error(`성능 저하 감지: 에러율 ${metrics.errorRate}%, 응답시간 ${metrics.responseTime}ms`);
      }
      
      await this.sleep(5000);
    }
    
    console.log(`✅ 전환 후 검증 완료`);
  }

  private async rollback(): Promise<void> {
    console.log(`🔙 롤백 실행 중...`);
    
    try {
      // 이전 환경으로 트래픽 복원
      const currentActive = await this.getActiveEnvironment();
      const previousEnv = currentActive.name === 'blue' ? 'green' : 'blue';
      
      await this.updateLoadBalancer(previousEnv, 100);
      
      // 롤백 검증
      await this.sleep(10000); // 10초 대기
      const metrics = await this.getMetrics(previousEnv);
      
      if (metrics.errorRate < 1) {
        console.log(`✅ 롤백 완료`);
      } else {
        console.log(`❌ 롤백 후에도 문제 지속`);
      }
      
    } catch (error) {
      console.error(`❌ 롤백 실패: ${error.message}`);
    }
  }

  private async executeCommand(command: string, env?: any): Promise<any> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    return await execAsync(command, { env: env || process.env });
  }

  private async updateLoadBalancer(environment: string, percentage: number): Promise<void> {
    // 로드 밸런서 설정 업데이트 (예: AWS ALB, Nginx 등)
    const config = {
      blue: percentage === 100 && environment === 'blue' ? 100 : (environment === 'blue' ? percentage : 100 - percentage),
      green: percentage === 100 && environment === 'green' ? 100 : (environment === 'green' ? percentage : 100 - percentage)
    };
    
    // 실제 로드 밸런서 API 호출
    console.log(`Load balancer updated: Blue ${config.blue}%, Green ${config.green}%`);
  }

  private async checkErrorRate(environment: string): Promise<number> {
    // APM 도구에서 에러율 조회 (예: DataDog, New Relic)
    const response = await fetch(`/api/metrics/error-rate?env=${environment}&duration=1m`);
    const data = await response.json();
    return data.errorRate;
  }

  private async getMetrics(environment: string): Promise<any> {
    // 성능 메트릭 조회
    const response = await fetch(`/api/metrics?env=${environment}&duration=1m`);
    return await response.json();
  }

  private async waitForDeployment(environment: string, version: string): Promise<void> {
    // Kubernetes 배포 완료 대기
    const command = `kubectl rollout status deployment/app-${environment} --timeout=300s`;
    await this.executeCommand(command);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 스크립트 실행
if (require.main === module) {
  const deployment = new BlueGreenDeployment();
  const version = process.argv[2] || 'latest';
  
  deployment.deploy(version).then(success => {
    process.exit(success ? 0 : 1);
  });
}
```

### 배포 후 모니터링

```typescript
// scripts/post-deployment-monitoring.ts
interface MonitoringConfig {
  checkInterval: number; // 체크 간격 (ms)
  alertThresholds: {
    errorRate: number; // %
    responseTime: number; // ms
    cpuUsage: number; // %
    memoryUsage: number; // %
  };
  notificationChannels: string[];
}

export class PostDeploymentMonitoring {
  private config: MonitoringConfig = {
    checkInterval: 30000, // 30초
    alertThresholds: {
      errorRate: 1, // 1%
      responseTime: 2000, // 2초
      cpuUsage: 80, // 80%
      memoryUsage: 85 // 85%
    },
    notificationChannels: ['slack', 'email']
  };

  async startMonitoring(environment: string, duration: number = 3600000): Promise<void> {
    console.log(`📊 배포 후 모니터링 시작: ${environment} (${duration / 1000}초)`);
    
    const startTime = Date.now();
    const alerts: any[] = [];
    
    while (Date.now() - startTime < duration) {
      try {
        const metrics = await this.collectMetrics(environment);
        const issues = this.analyzeMetrics(metrics);
        
        if (issues.length > 0) {
          alerts.push(...issues);
          await this.sendAlerts(issues, environment);
        }
        
        // 메트릭 로그
        this.logMetrics(metrics);
        
        await this.sleep(this.config.checkInterval);
        
      } catch (error) {
        console.error(`모니터링 오류: ${error.message}`);
        await this.sleep(this.config.checkInterval);
      }
    }
    
    // 모니터링 완료 보고서
    await this.generateMonitoringReport(environment, alerts, duration);
  }

  private async collectMetrics(environment: string): Promise<any> {
    const [
      healthMetrics,
      performanceMetrics,
      systemMetrics,
      businessMetrics
    ] = await Promise.all([
      this.getHealthMetrics(environment),
      this.getPerformanceMetrics(environment),
      this.getSystemMetrics(environment),
      this.getBusinessMetrics(environment)
    ]);

    return {
      timestamp: new Date(),
      environment,
      health: healthMetrics,
      performance: performanceMetrics,
      system: systemMetrics,
      business: businessMetrics
    };
  }

  private analyzeMetrics(metrics: any): any[] {
    const issues: any[] = [];
    
    // 에러율 체크
    if (metrics.performance.errorRate > this.config.alertThresholds.errorRate) {
      issues.push({
        type: 'error_rate',
        severity: 'high',
        message: `높은 에러율: ${metrics.performance.errorRate}%`,
        threshold: this.config.alertThresholds.errorRate,
        current: metrics.performance.errorRate
      });
    }
    
    // 응답 시간 체크
    if (metrics.performance.responseTime > this.config.alertThresholds.responseTime) {
      issues.push({
        type: 'response_time',
        severity: 'medium',
        message: `응답 시간 지연: ${metrics.performance.responseTime}ms`,
        threshold: this.config.alertThresholds.responseTime,
        current: metrics.performance.responseTime
      });
    }
    
    // CPU 사용률 체크
    if (metrics.system.cpuUsage > this.config.alertThresholds.cpuUsage) {
      issues.push({
        type: 'cpu_usage',
        severity: 'medium',
        message: `높은 CPU 사용률: ${metrics.system.cpuUsage}%`,
        threshold: this.config.alertThresholds.cpuUsage,
        current: metrics.system.cpuUsage
      });
    }
    
    // 메모리 사용률 체크
    if (metrics.system.memoryUsage > this.config.alertThresholds.memoryUsage) {
      issues.push({
        type: 'memory_usage',
        severity: 'high',
        message: `높은 메모리 사용률: ${metrics.system.memoryUsage}%`,
        threshold: this.config.alertThresholds.memoryUsage,
        current: metrics.system.memoryUsage
      });
    }
    
    return issues;
  }

  private async sendAlerts(issues: any[], environment: string): Promise<void> {
    for (const issue of issues) {
      const message = `🚨 [${environment.toUpperCase()}] ${issue.message}`;
      
      if (this.config.notificationChannels.includes('slack')) {
        await this.sendSlackAlert(message, issue.severity);
      }
      
      if (this.config.notificationChannels.includes('email')) {
        await this.sendEmailAlert(message, issue);
      }
    }
  }

  private logMetrics(metrics: any): void {
    console.log(`[${metrics.timestamp.toISOString()}] ${metrics.environment}:`);
    console.log(`  Health: ${metrics.health.status}`);
    console.log(`  Error Rate: ${metrics.performance.errorRate}%`);
    console.log(`  Response Time: ${metrics.performance.responseTime}ms`);
    console.log(`  CPU: ${metrics.system.cpuUsage}%`);
    console.log(`  Memory: ${metrics.system.memoryUsage}%`);
  }

  private async generateMonitoringReport(environment: string, alerts: any[], duration: number): Promise<void> {
    const report = {
      environment,
      duration: duration / 1000,
      totalAlerts: alerts.length,
      alertsByType: this.groupAlertsByType(alerts),
      alertsBySeverity: this.groupAlertsBySeverity(alerts),
      recommendation: this.generateRecommendation(alerts)
    };

    // 보고서 저장
    await fs.writeFile(
      `monitoring-report-${environment}-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`📋 모니터링 보고서 생성 완료: ${environment}`);
    console.log(`총 알림: ${report.totalAlerts}건`);
    
    if (report.totalAlerts === 0) {
      console.log(`✅ 배포 후 모니터링 완료: 문제 없음`);
    } else {
      console.log(`⚠️ 배포 후 모니터링 완료: ${report.totalAlerts}건의 문제 감지`);
    }
  }
}
```

이 CI/CD 통합 가이드는 SuperClaude AI 워크플로우를 활용하여 테스트가 완전히 통합된 자동화 파이프라인을 구축하는 방법을 제시합니다. 이로써 09_Testing_QA 섹션의 모든 파일이 완성되었습니다.