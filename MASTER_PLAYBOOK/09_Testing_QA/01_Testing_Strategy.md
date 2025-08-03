# 테스트 전략 수립 가이드

## 전략적 테스팅 접근법

SuperClaude AI 워크플로우를 활용하여 체계적이고 효율적인 테스트 전략을 수립하는 완전한 가이드입니다.

### 테스트 피라미드 설계

```yaml
testing_pyramid:
  unit_tests:
    coverage: "70%"
    purpose: "개별 함수/컴포넌트 검증"
    tools: ["Jest", "Vitest", "pytest", "JUnit"]
    characteristics:
      - "빠른 실행 속도 (< 1초)"
      - "높은 격리성"
      - "세밀한 테스트"
      - "높은 유지보수성"

  integration_tests:
    coverage: "20%"
    purpose: "모듈 간 상호작용 검증"
    tools: ["Supertest", "TestContainers", "Cypress", "REST Assured"]
    characteristics:
      - "중간 실행 속도 (1-10초)"
      - "실제 환경 시뮬레이션"
      - "API/DB 연동 테스트"
      - "계약 기반 테스트"

  e2e_tests:
    coverage: "10%"
    purpose: "전체 사용자 시나리오 검증"
    tools: ["Playwright", "Cypress", "Selenium", "Puppeteer"]
    characteristics:
      - "느린 실행 속도 (10초+)"
      - "실제 사용자 환경"
      - "비즈니스 크리티컬 플로우"
      - "브라우저 호환성"
```

### SuperClaude를 활용한 테스트 전략 설계

```bash
# 1. 프로젝트별 테스트 전략 분석
/analyze project-testing --think-hard --persona-qa

# 2. 테스트 아키텍처 설계
/design test-architecture --pyramid --automation --coverage-goals

# 3. 테스트 환경 구성
/implement test-environment --docker --ci-cd --parallel-execution

# 4. 테스트 데이터 전략
/design test-data-strategy --fixtures --factories --isolation
```

## 프로젝트별 테스트 전략

### 웹 애플리케이션 테스트 전략

```typescript
// test-strategy.config.ts
interface TestStrategy {
  projectType: 'web-app' | 'api' | 'mobile' | 'microservice';
  testTypes: TestType[];
  environments: Environment[];
  tools: TestingTools;
  coverage: CoverageGoals;
  automation: AutomationStrategy;
}

const webAppStrategy: TestStrategy = {
  projectType: 'web-app',
  testTypes: [
    {
      type: 'unit',
      scope: ['components', 'hooks', 'utils', 'services'],
      tools: ['Jest', 'React Testing Library'],
      coverage: 85,
      priority: 'high'
    },
    {
      type: 'integration',
      scope: ['api-integration', 'component-integration'],
      tools: ['MSW', 'Supertest'],
      coverage: 70,
      priority: 'medium'
    },
    {
      type: 'e2e',
      scope: ['critical-paths', 'user-journeys'],
      tools: ['Playwright'],
      coverage: 100, // 모든 크리티컬 패스
      priority: 'high'
    },
    {
      type: 'visual',
      scope: ['ui-components', 'responsive-design'],
      tools: ['Chromatic', 'Percy'],
      coverage: 80,
      priority: 'medium'
    },
    {
      type: 'accessibility',
      scope: ['wcag-compliance', 'keyboard-navigation'],
      tools: ['jest-axe', 'Lighthouse CI'],
      coverage: 100,
      priority: 'high'
    },
    {
      type: 'performance',
      scope: ['page-load', 'bundle-size', 'runtime-performance'],
      tools: ['Lighthouse', 'WebPageTest', 'Bundle Analyzer'],
      coverage: 90,
      priority: 'medium'
    }
  ],
  environments: [
    {
      name: 'local',
      purpose: 'development',
      config: 'docker-compose.test.yml'
    },
    {
      name: 'ci',
      purpose: 'continuous-integration',
      config: 'ci-test-environment'
    },
    {
      name: 'staging',
      purpose: 'pre-production-testing',
      config: 'staging-environment'
    }
  ],
  tools: {
    testRunner: 'Jest',
    e2eFramework: 'Playwright',
    mockingLibrary: 'MSW',
    testData: 'Faker.js',
    reporting: 'Allure'
  },
  coverage: {
    statements: 80,
    branches: 75,
    functions: 85,
    lines: 80
  },
  automation: {
    ciIntegration: true,
    parallelExecution: true,
    flakytestRetry: 3,
    reportGeneration: true
  }
};
```

### API 서비스 테스트 전략

```typescript
const apiServiceStrategy: TestStrategy = {
  projectType: 'api',
  testTypes: [
    {
      type: 'unit',
      scope: ['controllers', 'services', 'models', 'utils'],
      tools: ['Jest', 'Supertest'],
      coverage: 90,
      priority: 'high'
    },
    {
      type: 'integration',
      scope: ['database', 'external-apis', 'middleware'],
      tools: ['Testcontainers', 'WireMock'],
      coverage: 80,
      priority: 'high'
    },
    {
      type: 'contract',
      scope: ['api-contracts', 'schema-validation'],
      tools: ['Pact', 'OpenAPI-validator'],
      coverage: 100,
      priority: 'high'
    },
    {
      type: 'security',
      scope: ['authentication', 'authorization', 'input-validation'],
      tools: ['OWASP ZAP', 'Snyk'],
      coverage: 100,
      priority: 'critical'
    },
    {
      type: 'performance',
      scope: ['load-testing', 'stress-testing', 'endurance'],
      tools: ['K6', 'Artillery', 'JMeter'],
      coverage: 90,
      priority: 'medium'
    }
  ],
  environments: [
    {
      name: 'unit',
      purpose: 'isolated-testing',
      config: 'in-memory-database'
    },
    {
      name: 'integration',
      purpose: 'service-integration',
      config: 'docker-test-environment'
    },
    {
      name: 'load-test',
      purpose: 'performance-testing',
      config: 'load-test-environment'
    }
  ],
  tools: {
    testRunner: 'Jest',
    apiTesting: 'Supertest',
    databaseTesting: 'Testcontainers',
    loadTesting: 'K6',
    securityTesting: 'OWASP ZAP'
  },
  coverage: {
    statements: 85,
    branches: 80,
    functions: 90,
    lines: 85
  },
  automation: {
    ciIntegration: true,
    parallelExecution: true,
    environmentProvisioning: true,
    securityScanning: true
  }
};
```

## 테스트 환경 구성

### Docker 기반 테스트 환경

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - DB_HOST=postgres-test
      - REDIS_HOST=redis-test
    depends_on:
      - postgres-test
      - redis-test
    volumes:
      - ./coverage:/app/coverage

  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    tmpfs:
      - /data

  playwright:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    environment:
      - BASE_URL=http://app:3000
    depends_on:
      - app
    volumes:
      - ./test-results:/app/test-results
      - ./playwright-report:/app/playwright-report

networks:
  default:
    name: test-network
```

### Testcontainers 설정

```typescript
// test/setup/testcontainers.ts
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Pool } from 'pg';
import Redis from 'ioredis';

export class TestEnvironment {
  private postgresContainer: StartedTestContainer;
  private redisContainer: StartedTestContainer;
  private pgPool: Pool;
  private redisClient: Redis;

  async setup(): Promise<void> {
    // PostgreSQL 컨테이너 시작
    this.postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_DB: 'test_db',
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_pass'
      })
      .withExposedPorts(5432)
      .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
      .start();

    // Redis 컨테이너 시작
    this.redisContainer = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .withTmpFs({ '/data': 'rw' })
      .start();

    // 데이터베이스 연결 설정
    this.pgPool = new Pool({
      host: this.postgresContainer.getHost(),
      port: this.postgresContainer.getMappedPort(5432),
      database: 'test_db',
      user: 'test_user',
      password: 'test_pass'
    });

    // Redis 연결 설정
    this.redisClient = new Redis({
      host: this.redisContainer.getHost(),
      port: this.redisContainer.getMappedPort(6379)
    });

    // 데이터베이스 마이그레이션 실행
    await this.runMigrations();
  }

  async teardown(): Promise<void> {
    await this.pgPool?.end();
    await this.redisClient?.disconnect();
    await this.postgresContainer?.stop();
    await this.redisContainer?.stop();
  }

  private async runMigrations(): Promise<void> {
    // 마이그레이션 스크립트 실행
    const migrationQueries = [
      `CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of migrationQueries) {
      await this.pgPool.query(query);
    }
  }

  getDbConnection(): Pool {
    return this.pgPool;
  }

  getRedisClient(): Redis {
    return this.redisClient;
  }
}

// Jest 글로벌 설정
// jest.setup.ts
import { TestEnvironment } from './test/setup/testcontainers';

let testEnv: TestEnvironment;

beforeAll(async () => {
  testEnv = new TestEnvironment();
  await testEnv.setup();

  // 글로벌 변수로 설정
  global.testDb = testEnv.getDbConnection();
  global.testRedis = testEnv.getRedisClient();
}, 60000); // 60초 타임아웃

afterAll(async () => {
  await testEnv.teardown();
}, 30000);
```

## 테스트 데이터 관리

### Factory Pattern으로 테스트 데이터 생성

```typescript
// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '../../src/models/User';

interface UserFactoryOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin' | 'moderator';
  isActive?: boolean;
}

export class UserFactory {
  static create(options: UserFactoryOptions = {}): Partial<User> {
    return {
      email: options.email || faker.internet.email(),
      firstName: options.firstName || faker.person.firstName(),
      lastName: options.lastName || faker.person.lastName(),
      role: options.role || 'user',
      isActive: options.isActive ?? true,
      password: faker.internet.password(),
      phoneNumber: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      preferences: {
        newsletter: faker.datatype.boolean(),
        notifications: faker.datatype.boolean(),
        theme: faker.helpers.arrayElement(['light', 'dark', 'auto'])
      },
      metadata: {
        lastLoginAt: faker.date.recent(),
        registrationSource: faker.helpers.arrayElement(['web', 'mobile', 'api']),
        referralCode: faker.string.alphanumeric(8)
      }
    };
  }

  static createMany(count: number, options: UserFactoryOptions = {}): Partial<User>[] {
    return Array.from({ length: count }, () => this.create(options));
  }

  static async createInDb(options: UserFactoryOptions = {}): Promise<User> {
    const userData = this.create(options);
    const user = new User(userData);
    return await user.save();
  }

  static async createManyInDb(count: number, options: UserFactoryOptions = {}): Promise<User[]> {
    const promises = Array.from({ length: count }, () => this.createInDb(options));
    return await Promise.all(promises);
  }

  // 특정 시나리오용 팩토리 메서드
  static createAdmin(): Partial<User> {
    return this.create({
      role: 'admin',
      email: faker.internet.email({ provider: 'company.com' }),
      isActive: true
    });
  }

  static createInactiveUser(): Partial<User> {
    return this.create({
      isActive: false,
      role: 'user'
    });
  }

  static createWithPurchaseHistory(): Partial<User> {
    return {
      ...this.create(),
      purchaseHistory: Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
        orderId: faker.string.uuid(),
        amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        date: faker.date.past(),
        status: faker.helpers.arrayElement(['completed', 'pending', 'cancelled'])
      }))
    };
  }
}

// test/factories/product.factory.ts
export class ProductFactory {
  static create(options: any = {}): any {
    return {
      name: options.name || faker.commerce.productName(),
      description: options.description || faker.commerce.productDescription(),
      price: options.price || parseFloat(faker.commerce.price()),
      category: options.category || faker.commerce.department(),
      sku: options.sku || faker.string.alphanumeric(8).toUpperCase(),
      inStock: options.inStock ?? faker.datatype.boolean(),
      stockQuantity: options.stockQuantity || faker.number.int({ min: 0, max: 100 }),
      images: options.images || Array.from({ length: 3 }, () => faker.image.url()),
      tags: options.tags || faker.helpers.arrayElements([
        'popular', 'new', 'sale', 'featured', 'organic', 'premium'
      ], { min: 1, max: 3 }),
      specifications: {
        weight: faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }),
        dimensions: {
          length: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
          width: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
          height: faker.number.float({ min: 1, max: 100, fractionDigits: 1 })
        },
        material: faker.commerce.productMaterial(),
        color: faker.color.human()
      },
      ratings: {
        average: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        count: faker.number.int({ min: 0, max: 1000 })
      }
    };
  }

  static createElectronics(): any {
    return this.create({
      category: 'Electronics',
      tags: ['electronic', 'tech', 'gadget'],
      specifications: {
        ...this.create().specifications,
        warranty: `${faker.number.int({ min: 1, max: 5 })} years`,
        powerConsumption: `${faker.number.int({ min: 5, max: 500 })}W`,
        compatibility: faker.helpers.arrayElements(['iOS', 'Android', 'Windows', 'macOS'])
      }
    });
  }

  static createOutOfStock(): any {
    return this.create({
      inStock: false,
      stockQuantity: 0
    });
  }
}
```

### Fixture 기반 테스트 데이터

```typescript
// test/fixtures/scenarios.ts
export const testScenarios = {
  ecommerce: {
    userWithCart: {
      user: UserFactory.create({ role: 'user' }),
      cart: {
        items: [
          { product: ProductFactory.create(), quantity: 2 },
          { product: ProductFactory.create(), quantity: 1 }
        ],
        total: 150.00,
        discount: 15.00
      }
    },

    completedOrder: {
      user: UserFactory.create(),
      order: {
        id: faker.string.uuid(),
        status: 'completed',
        items: ProductFactory.createMany(3),
        shippingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode()
        },
        paymentMethod: 'credit_card',
        total: 299.99,
        createdAt: faker.date.recent()
      }
    }
  },

  userManagement: {
    adminWithPermissions: {
      user: UserFactory.createAdmin(),
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'products.read', 'products.write',
        'orders.read', 'orders.manage'
      ]
    },

    userWithSubscription: {
      user: UserFactory.create(),
      subscription: {
        type: 'premium',
        status: 'active',
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        features: ['unlimited_storage', 'priority_support', 'advanced_analytics']
      }
    }
  }
};

// 테스트에서 사용
describe('Order Processing', () => {
  it('should process completed order correctly', async () => {
    const scenario = testScenarios.ecommerce.completedOrder;

    // 시나리오 데이터로 테스트 실행
    const user = await UserFactory.createInDb(scenario.user);
    const order = await createOrder(user.id, scenario.order);

    expect(order.status).toBe('completed');
    expect(order.total).toBe(scenario.order.total);
  });
});
```

## 테스트 자동화 전략

### CI/CD 파이프라인 통합

```yaml
# .github/workflows/test.yml
name: Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage --watchAll=false

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unit-tests

  integration-tests:
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
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Start application
        run: npm start &

      - name: Wait for application to be ready
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'

  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build and start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000

      - name: Run performance tests
        run: npm run test:performance

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results/
```

### 병렬 테스트 실행

```typescript
// jest.config.js
module.exports = {
  maxWorkers: '50%', // CPU 코어의 50% 사용
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup/unit.setup.ts']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup/integration.setup.ts'],
      maxWorkers: 2, // 통합 테스트는 동시성 제한
    }
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    },
    './src/utils/': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90
    }
  }
};

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,

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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
```

## 테스트 품질 지표

### 커버리지 분석 및 리포팅

```typescript
// test/coverage/coverage-analysis.ts
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface CoverageData {
  statements: { pct: number; total: number; covered: number };
  branches: { pct: number; total: number; covered: number };
  functions: { pct: number; total: number; covered: number };
  lines: { pct: number; total: number; covered: number };
}

interface CoverageReport {
  total: CoverageData;
  files: Record<string, CoverageData>;
}

export class CoverageAnalyzer {
  private coverageThresholds = {
    statements: 80,
    branches: 75,
    functions: 85,
    lines: 80
  };

  async generateCoverageReport(): Promise<CoverageReport> {
    // Jest 커버리지 데이터 읽기
    const coverageData = await fs.readFile(
      path.join(process.cwd(), 'coverage/coverage-summary.json'),
      'utf-8'
    );

    return JSON.parse(coverageData);
  }

  async analyzeCoverage(): Promise<void> {
    const report = await this.generateCoverageReport();

    console.log('\n📊 커버리지 분석 결과');
    console.log('='.repeat(50));

    // 전체 커버리지 분석
    this.printCoverageMetrics('전체', report.total);

    // 임계값 미달 파일 찾기
    const lowCoverageFiles = this.findLowCoverageFiles(report.files);

    if (lowCoverageFiles.length > 0) {
      console.log('\n⚠️  커버리지 임계값 미달 파일:');
      lowCoverageFiles.forEach(({ file, metrics }) => {
        console.log(`  ${file}`);
        Object.entries(metrics).forEach(([type, pct]) => {
          if (pct < this.coverageThresholds[type as keyof typeof this.coverageThresholds]) {
            console.log(`    ${type}: ${pct}% (임계값: ${this.coverageThresholds[type as keyof typeof this.coverageThresholds]}%)`);
          }
        });
      });
    }

    // 커버리지 트렌드 분석
    await this.trackCoverageTrend(report.total);
  }

  private printCoverageMetrics(label: string, data: CoverageData): void {
    console.log(`\n${label}:`);
    console.log(`  구문(Statements): ${data.statements.pct}% (${data.statements.covered}/${data.statements.total})`);
    console.log(`  분기(Branches): ${data.branches.pct}% (${data.branches.covered}/${data.branches.total})`);
    console.log(`  함수(Functions): ${data.functions.pct}% (${data.functions.covered}/${data.functions.total})`);
    console.log(`  라인(Lines): ${data.lines.pct}% (${data.lines.covered}/${data.lines.total})`);
  }

  private findLowCoverageFiles(files: Record<string, CoverageData>): Array<{file: string, metrics: Record<string, number>}> {
    const lowCoverageFiles: Array<{file: string, metrics: Record<string, number>}> = [];

    Object.entries(files).forEach(([file, data]) => {
      const metrics: Record<string, number> = {
        statements: data.statements.pct,
        branches: data.branches.pct,
        functions: data.functions.pct,
        lines: data.lines.pct
      };

      const hasLowCoverage = Object.entries(metrics).some(([type, pct]) =>
        pct < this.coverageThresholds[type as keyof typeof this.coverageThresholds]
      );

      if (hasLowCoverage) {
        lowCoverageFiles.push({ file, metrics });
      }
    });

    return lowCoverageFiles;
  }

  private async trackCoverageTrend(currentCoverage: CoverageData): Promise<void> {
    const trendFile = path.join(process.cwd(), 'coverage/trend.json');

    try {
      const existingTrend = await fs.readFile(trendFile, 'utf-8');
      const trend = JSON.parse(existingTrend);

      // 새로운 데이터 추가
      trend.push({
        date: new Date().toISOString(),
        statements: currentCoverage.statements.pct,
        branches: currentCoverage.branches.pct,
        functions: currentCoverage.functions.pct,
        lines: currentCoverage.lines.pct
      });

      // 최근 30개 항목만 유지
      if (trend.length > 30) {
        trend.splice(0, trend.length - 30);
      }

      await fs.writeFile(trendFile, JSON.stringify(trend, null, 2));

      // 트렌드 분석
      if (trend.length >= 2) {
        const previous = trend[trend.length - 2];
        const current = trend[trend.length - 1];

        console.log('\n📈 커버리지 트렌드:');
        this.printTrendAnalysis('구문', previous.statements, current.statements);
        this.printTrendAnalysis('분기', previous.branches, current.branches);
        this.printTrendAnalysis('함수', previous.functions, current.functions);
        this.printTrendAnalysis('라인', previous.lines, current.lines);
      }

    } catch (error) {
      // 첫 번째 실행인 경우 새 파일 생성
      const initialTrend = [{
        date: new Date().toISOString(),
        statements: currentCoverage.statements.pct,
        branches: currentCoverage.branches.pct,
        functions: currentCoverage.functions.pct,
        lines: currentCoverage.lines.pct
      }];

      await fs.writeFile(trendFile, JSON.stringify(initialTrend, null, 2));
    }
  }

  private printTrendAnalysis(type: string, previous: number, current: number): void {
    const diff = current - previous;
    const arrow = diff > 0 ? '↗️' : diff < 0 ? '↘️' : '➡️';
    const diffStr = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)` : '';

    console.log(`  ${type}: ${current.toFixed(1)}% ${arrow}${diffStr}`);
  }
}

// 스크립트 실행
if (require.main === module) {
  const analyzer = new CoverageAnalyzer();
  analyzer.analyzeCoverage().catch(console.error);
}
```

이 테스트 전략 가이드는 SuperClaude AI 워크플로우를 활용하여 체계적이고 효율적인 테스팅 환경을 구축하는 방법을 제시합니다. 다음 파일에서는 구체적인 단위 테스트 구현 방법을 다루겠습니다.