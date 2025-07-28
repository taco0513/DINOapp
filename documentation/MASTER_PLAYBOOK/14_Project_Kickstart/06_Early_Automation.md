# 초기 자동화

## 개요

프로젝트 초기부터 자동화를 도입하여 개발 속도를 높이고 품질을 보장하는 방법을 다룹니다. 최소한의 노력으로 최대한의 효과를 얻을 수 있는 자동화 전략을 제시합니다.

## CI/CD 파이프라인 구축

### GitHub Actions 기본 설정

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 코드 품질 검사
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Check formatting
        run: npm run format:check
      
      - name: Security audit
        run: npm audit --audit-level=moderate

  # 테스트 실행
  test:
    runs-on: ubuntu-latest
    needs: quality-check
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # 빌드 및 배포
  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [quality-check, test]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # 실제 배포 명령어
```

### 빠른 피드백 루프

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  # 빠른 테스트 (3분 이내)
  quick-test:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: Quick checks
        run: |
          npm run lint:quick
          npm run test:unit -- --passWithNoTests
      
      - name: Comment PR
        uses: actions/github-script@v6
        if: always()
        with:
          script: |
            const status = '${{ job.status }}';
            const emoji = status === 'success' ? '✅' : '❌';
            const message = `${emoji} Quick checks ${status}`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: message
            });
```

## 코드 품질 자동화

### Pre-commit 훅 설정

```yaml
# .pre-commit-config.yaml
repos:
  # 코드 포매팅
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        types_or: [javascript, typescript, jsx, tsx, json, yaml, markdown]
  
  # 코드 품질
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.0.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        types: [file]
        additional_dependencies:
          - eslint@8
          - typescript
          - '@typescript-eslint/parser'
          - '@typescript-eslint/eslint-plugin'
  
  # 보안 검사
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
  
  # 커밋 메시지 검사
  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.0.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
  
  # 대용량 파일 검사
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
```

### 자동 코드 리뷰

```typescript
// scripts/auto-review.ts
import { Octokit } from '@octokit/rest';
import { analyzeCode } from './code-analyzer';

class AutoCodeReviewer {
  private octokit: Octokit;
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }
  
  async reviewPR(owner: string, repo: string, prNumber: number) {
    // PR 변경 사항 가져오기
    const { data: files } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    });
    
    const comments: ReviewComment[] = [];
    
    for (const file of files) {
      // 코드 분석
      const analysis = await analyzeCode(file);
      
      // 자동 리뷰 코멘트 생성
      if (analysis.issues.length > 0) {
        comments.push(...this.generateComments(file, analysis));
      }
    }
    
    // 리뷰 제출
    if (comments.length > 0) {
      await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        body: '🤖 자동 코드 리뷰 결과입니다.',
        event: 'COMMENT',
        comments
      });
    }
  }
  
  private generateComments(
    file: File,
    analysis: CodeAnalysis
  ): ReviewComment[] {
    return analysis.issues.map(issue => ({
      path: file.filename,
      line: issue.line,
      body: `💡 **${issue.type}**: ${issue.message}\n\n제안: ${issue.suggestion}`
    }));
  }
}

// 코드 분석 함수
export async function analyzeCode(file: File): Promise<CodeAnalysis> {
  const issues: Issue[] = [];
  
  // 복잡도 검사
  if (file.complexity > 10) {
    issues.push({
      type: 'complexity',
      line: file.complexityLocation,
      message: '함수가 너무 복잡합니다',
      suggestion: '더 작은 함수로 분리해보세요'
    });
  }
  
  // 중복 코드 검사
  const duplicates = findDuplicates(file.content);
  if (duplicates.length > 0) {
    issues.push(...duplicates.map(dup => ({
      type: 'duplication',
      line: dup.line,
      message: '중복된 코드가 발견되었습니다',
      suggestion: '공통 함수로 추출하세요'
    })));
  }
  
  return { issues };
}
```

## 개발 환경 자동화

### Docker 기반 개발 환경

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # 애플리케이션
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
      args:
        - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
      - "9229:9229" # 디버그 포트
    environment:
      - NODE_ENV=development
      - WATCHPACK_POLLING=true
    command: npm run dev
    depends_on:
      - db
      - redis

  # 데이터베이스
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: localpass
      POSTGRES_DB: myapp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  # 캐시
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  # 테스트 DB
  test-db:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: tester
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: myapp_test
    tmpfs:
      - /var/lib/postgresql/data

volumes:
  postgres_data:
  redis_data:
```

### 개발 환경 자동 설정 스크립트

```bash
#!/bin/bash
# scripts/dev-setup.sh

set -e

echo "🚀 개발 환경 자동 설정을 시작합니다..."

# 1. 필수 도구 확인
check_requirements() {
  echo "🔍 필수 도구 확인 중..."
  
  # Docker
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   https://docs.docker.com/get-docker/ 에서 설치하세요."
    exit 1
  fi
  
  # Node.js
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "   https://nodejs.org/ 에서 설치하세요."
    exit 1
  fi
  
  echo "✅ 모든 필수 도구가 설치되어 있습니다."
}

# 2. 환경 변수 설정
setup_env() {
  echo "🔐 환경 변수 설정 중..."
  
  if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 .env.local 파일이 생성되었습니다. 필요한 값을 업데이트하세요."
  else
    echo "ℹ️  .env.local 파일이 이미 존재합니다."
  fi
}

# 3. Docker 컨테이너 시작
start_containers() {
  echo "🐳 Docker 컨테이너 시작 중..."
  
  docker-compose -f docker-compose.dev.yml up -d
  
  # DB 초기화 대기
  echo "⏳ 데이터베이스 초기화 대기 중..."
  sleep 5
}

# 4. 의존성 설치
install_dependencies() {
  echo "📦 의존성 설치 중..."
  npm install
}

# 5. DB 마이그레이션
run_migrations() {
  echo "🗄️  데이터베이스 마이그레이션 실행 중..."
  npm run db:migrate
  npm run db:seed
}

# 6. Git hooks 설정
setup_git_hooks() {
  echo "🪝 Git hooks 설정 중..."
  npx husky install
  npm run prepare
}

# 메인 실행
main() {
  check_requirements
  setup_env
  start_containers
  install_dependencies
  run_migrations
  setup_git_hooks
  
  echo "
✅ 개발 환경 설정이 완료되었습니다!"
  echo "
🚀 다음 명령어로 개발을 시작하세요:"
  echo "   npm run dev"
  echo "
🔗 앱 URL: http://localhost:3000"
  echo "🗄️  DB URL: postgresql://developer:localpass@localhost:5432/myapp_dev"
}

main
```

## 테스트 자동화

### 테스트 실행 자동화

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.unit\\.test\\.",
    "test:integration": "jest --testPathPattern=\\.integration\\.test\\.",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### E2E 테스트 자동화

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });
  
  test('회원가입 프로세스', async ({ page }) => {
    // 회원가입 버튼 클릭
    await page.click('text=회원가입');
    
    // 폼 작성
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 확인
    await expect(page.locator('text=회원가입이 완료되었습니다')).toBeVisible();
  });
  
  test('로그인 프로세스', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    
    // 폼 작성
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## 배포 자동화

### Vercel 자동 배포

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "pages/api/*": {
      "maxDuration": 10
    }
  }
}
```

### 스테이징 환경 자동 배포

```typescript
// scripts/deploy-staging.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class StagingDeployer {
  async deploy(branch: string) {
    try {
      console.log('🚀 스테이징 배포를 시작합니다...');
      
      // 1. 테스트 실행
      console.log('🧪 테스트 실행 중...');
      await execAsync('npm run test:ci');
      
      // 2. 빌드
      console.log('🏭 빌드 중...');
      await execAsync('npm run build');
      
      // 3. Docker 이미지 빌드
      console.log('🐳 Docker 이미지 빌드 중...');
      const tag = `staging-${Date.now()}`;
      await execAsync(`docker build -t myapp:${tag} .`);
      
      // 4. 이미지 푸시
      console.log('📤 이미지 푸시 중...');
      await execAsync(`docker push registry.company.com/myapp:${tag}`);
      
      // 5. 스테이징 서버 업데이트
      console.log('🔄 스테이징 서버 업데이트 중...');
      await this.updateStagingServer(tag);
      
      // 6. 헬스 체크
      console.log('🏥 헬스 체크 중...');
      await this.checkHealth('https://staging.myapp.com/health');
      
      console.log('✅ 스테이징 배포 완료!');
      
    } catch (error) {
      console.error('❌ 배포 실패:', error);
      throw error;
    }
  }
  
  private async updateStagingServer(tag: string) {
    // Kubernetes 또는 Docker Swarm 업데이트
    await execAsync(`
      kubectl set image deployment/myapp \
        myapp=registry.company.com/myapp:${tag} \
        --namespace=staging
    `);
  }
  
  private async checkHealth(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
  }
}
```

## 모니터링 자동화

### 에러 추적 자동화

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

class ErrorTracker {
  static initialize() {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      
      beforeSend(event, hint) {
        // 민감한 정보 필터링
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        // 개발 환경에서는 콘솔로만 출력
        if (process.env.NODE_ENV === 'development') {
          console.error('Sentry Event:', event);
          return null;
        }
        
        return event;
      },
      
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true
        })
      ]
    });
  }
  
  static captureError(error: Error, context?: any) {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    });
  }
}

// 자동 에러 보고
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorTracker.captureError(
      new Error(event.reason),
      { type: 'unhandledRejection' }
    );
  });
}
```

### 성능 모니터링

```typescript
// lib/performance-monitoring.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  // API 응답 시간 추적
  async trackAPICall<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(name, duration);
      
      // 임계값 초과 시 경고
      if (duration > 1000) {
        console.warn(`Slow API call: ${name} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }
  
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 최근 100개만 유지
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    
    if (values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}
```

## SuperClaude 자동화 명령어

```bash
# CI/CD 파이프라인 설정
/setup ci-cd --platform github-actions --stages "test,build,deploy"

# Pre-commit 훅 설정
/setup pre-commit --checks "lint,format,test,security"

# 개발 환경 자동화
/setup dev-env --docker --auto-install --hot-reload

# 테스트 자동화
/setup testing --unit --integration --e2e --coverage

# 배포 자동화
/setup deployment --staging --production --rollback

# 모니터링 설정
/setup monitoring --errors --performance --uptime

# 코드 품질 자동화
/setup code-quality --eslint --prettier --husky

# 보안 검사 자동화
/setup security --dependency-check --secret-scan

# 문서화 자동화
/setup documentation --api-docs --changelog --readme

# 전체 자동화 설정
/automate everything --from-scratch --best-practices
```

이 초기 자동화 시스템을 통해 개발 효율성을 극대화하고 품질을 일관되게 유지할 수 있습니다.