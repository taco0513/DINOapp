# 🛡️ Code Safety Patterns - 코드 안전성 패턴

## 📋 개요

TypeScript를 활용한 안전한 코드 작성 패턴과 AI 기반 코드 안전성 검증 시스템입니다. 컴파일 타임과 런타임 모두에서 안전성을 보장하며, AI가 자동으로 안전하지 않은 패턴을 감지하고 개선 방안을 제시합니다. 프로덕션 환경에서 발생할 수 있는 모든 타입 관련 오류를 사전에 차단합니다.

## 🎯 핵심 목표

1. **Compile-time Safety**: 컴파일 타임 안전성 보장
2. **Runtime Validation**: 런타임 타입 검증 자동화
3. **AI-Powered Detection**: AI 기반 위험 패턴 감지
4. **Defensive Programming**: 방어적 프로그래밍 패턴
5. **Zero Runtime Errors**: 런타임 타입 오류 제로화

## 🏗️ 코드 안전성 아키텍처

```typescript
interface CodeSafetyArchitecture {
  // 컴파일 타임 안전성
  compileTime: {
    strictTypes: StrictTypeChecker;
    brandedTypes: BrandedTypeSystem;
    discriminatedUnions: DiscriminatedUnionValidator;
    exhaustiveChecking: ExhaustiveChecker;
  };
  
  // 런타임 안전성
  runtime: {
    validator: RuntimeValidator;
    guards: TypeGuardSystem;
    assertions: AssertionFramework;
    errorHandling: SafeErrorHandler;
  };
  
  // AI 기반 검증
  aiVerification: {
    patternDetector: UnsafePatternDetector;
    codeAnalyzer: SafetyAnalyzer;
    suggestionEngine: ImprovementSuggester;
    continuousMonitoring: SafetyMonitor;
  };
}
```

## 🔒 컴파일 타임 안전성 패턴

### 1. Branded Types (브랜드 타입)
```typescript
// 브랜드 타입으로 타입 안전성 강화
type Brand<T, B> = T & { __brand: B };

// 사용자 ID 브랜드
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
type Email = Brand<string, 'Email'>;

// 브랜드 타입 생성 함수
const createUserId = (id: string): UserId => {
  if (!id || id.length < 3) {
    throw new Error('Invalid user ID');
  }
  return id as UserId;
};

const createEmail = (email: string): Email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email as Email;
};

// 안전한 함수 시그니처
class UserService {
  // 컴파일 타임에 잘못된 ID 타입 사용 방지
  async getUser(userId: UserId): Promise<User> {
    // userId는 반드시 UserId 브랜드를 가져야 함
    return this.repository.findById(userId);
  }
  
  async getProduct(productId: ProductId): Promise<Product> {
    // productId와 userId 혼동 방지
    return this.productRepository.findById(productId);
  }
  
  // 잘못된 사용 예시 (컴파일 에러)
  // async wrongUsage() {
  //   const user = await this.getUser('user123'); // 에러: string은 UserId가 아님
  //   const product = await this.getProduct(userId); // 에러: UserId는 ProductId가 아님
  // }
}
```

### 2. Discriminated Unions (판별 유니온)
```typescript
// 안전한 상태 관리를 위한 판별 유니온
type ApiState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// 타입 가드로 안전한 상태 처리
function handleApiState<T>(state: ApiState<T>): string {
  switch (state.status) {
    case 'idle':
      return 'Ready to load';
    
    case 'loading':
      return 'Loading...';
    
    case 'success':
      // state.data는 여기서 안전하게 접근 가능
      return `Loaded: ${JSON.stringify(state.data)}`;
    
    case 'error':
      // state.error는 여기서 안전하게 접근 가능
      return `Error: ${state.error}`;
    
    default:
      // 완전성 검사 - 새로운 상태가 추가되면 컴파일 에러
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}

// React 컴포넌트에서의 안전한 사용
function UserProfileComponent() {
  const [userState, setUserState] = useState<ApiState<User>>({ status: 'idle' });
  
  const renderContent = () => {
    switch (userState.status) {
      case 'loading':
        return <div>Loading user...</div>;
      
      case 'success':
        // userState.data는 반드시 User 타입
        return <div>Hello, {userState.data.name}!</div>;
      
      case 'error':
        return <div>Error: {userState.error}</div>;
      
      case 'idle':
        return <button onClick={loadUser}>Load User</button>;
      
      default:
        // 컴파일 타임 완전성 보장
        const _exhaustive: never = userState;
        return null;
    }
  };
  
  return <div>{renderContent()}</div>;
}
```

### 3. 고급 타입 가드
```typescript
// 복합 타입 가드 시스템
class AdvancedTypeGuards {
  // 배열 타입 가드
  static isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]] {
    return arr.length > 0;
  }
  
  // 객체 속성 존재 확인
  static hasProperty<T extends object, K extends PropertyKey>(
    obj: T,
    prop: K
  ): obj is T & Record<K, unknown> {
    return prop in obj;
  }
  
  // 중첩 속성 안전 접근
  static hasNestedProperty<T extends object>(
    obj: T,
    path: string
  ): boolean {
    return path.split('.').reduce((current: any, key) => {
      return current && typeof current === 'object' && key in current
        ? current[key]
        : undefined;
    }, obj) !== undefined;
  }
  
  // 함수 타입 가드
  static isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }
  
  // Promise 타입 가드
  static isPromise<T>(value: unknown): value is Promise<T> {
    return value instanceof Promise ||
           (typeof value === 'object' &&
            value !== null &&
            'then' in value &&
            typeof (value as any).then === 'function');
  }
}

// 사용 예시
function safeArrayProcessing<T>(items: T[]) {
  if (AdvancedTypeGuards.isNonEmptyArray(items)) {
    // items는 이제 [T, ...T[]] 타입으로 보장됨
    const firstItem = items[0]; // 안전하게 접근 가능
    return firstItem;
  }
  
  throw new Error('Array is empty');
}

function safePropertyAccess(obj: unknown, prop: string) {
  if (typeof obj === 'object' && obj !== null &&
      AdvancedTypeGuards.hasProperty(obj, prop)) {
    // obj[prop]에 안전하게 접근 가능
    return obj[prop];
  }
  
  return undefined;
}
```

## 🔍 런타임 안전성 패턴

### 1. 안전한 JSON 파싱
```typescript
// 안전한 JSON 파싱 유틸리티
class SafeJSONParser {
  static parse<T>(
    jsonString: string,
    validator: (value: unknown) => value is T,
    fallback?: T
  ): T {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (validator(parsed)) {
        return parsed;
      }
      
      throw new Error('Validation failed');
    } catch (error) {
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw new Error(`JSON parsing failed: ${error.message}`);
    }
  }
  
  // 스키마 기반 파싱
  static parseWithSchema<T>(
    jsonString: string,
    schema: z.ZodSchema<T>
  ): T {
    try {
      const parsed = JSON.parse(jsonString);
      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Schema validation failed: ${error.message}`);
      }
      throw new Error(`JSON parsing failed: ${error.message}`);
    }
  }
}

// 사용 예시
const userValidator = (value: unknown): value is User => {
  return typeof value === 'object' &&
         value !== null &&
         'id' in value &&
         'name' in value &&
         'email' in value;
};

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// 안전한 파싱
const userFromAPI = SafeJSONParser.parse(
  apiResponse,
  userValidator,
  { id: '', name: 'Unknown', email: '' } // 폴백
);

const userFromSchema = SafeJSONParser.parseWithSchema(
  apiResponse,
  userSchema
);
```

### 2. 안전한 배열 조작
```typescript
// 안전한 배열 유틸리티
class SafeArrayOperations {
  // 안전한 배열 접근
  static safeGet<T>(array: T[], index: number): T | undefined {
    if (index >= 0 && index < array.length) {
      return array[index];
    }
    return undefined;
  }
  
  // 안전한 첫 번째 요소 접근
  static safeFirst<T>(array: T[]): T | undefined {
    return this.safeGet(array, 0);
  }
  
  // 안전한 마지막 요소 접근
  static safeLast<T>(array: T[]): T | undefined {
    return this.safeGet(array, array.length - 1);
  }
  
  // 타입 안전한 필터링
  static safeFilter<T, U extends T>(
    array: T[],
    predicate: (item: T) => item is U
  ): U[] {
    return array.filter(predicate);
  }
  
  // 안전한 맵핑 (null/undefined 제거)
  static safeMap<T, U>(
    array: T[],
    mapper: (item: T) => U | null | undefined
  ): U[] {
    return array
      .map(mapper)
      .filter((item): item is U => item != null);
  }
  
  // 안전한 리듀싱
  static safeReduce<T, U>(
    array: T[],
    reducer: (acc: U, item: T, index: number) => U,
    initialValue: U
  ): U {
    if (array.length === 0) {
      return initialValue;
    }
    
    return array.reduce(reducer, initialValue);
  }
}

// 사용 예시
const numbers = [1, 2, 3, 4, 5];
const strings = ['hello', '', 'world', null, 'typescript'];

// 안전한 접근
const firstNumber = SafeArrayOperations.safeFirst(numbers); // number | undefined
const lastNumber = SafeArrayOperations.safeLast(numbers);   // number | undefined

// 타입 안전한 필터링
const nonEmptyStrings = SafeArrayOperations.safeFilter(
  strings,
  (str): str is string => typeof str === 'string' && str.length > 0
);

// 안전한 맵핑
const upperCaseStrings = SafeArrayOperations.safeMap(
  strings,
  (str) => typeof str === 'string' ? str.toUpperCase() : null
);
```

### 3. 안전한 비동기 처리
```typescript
// 안전한 Promise 유틸리티
class SafePromiseHandling {
  // 타임아웃이 있는 안전한 Promise
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage?: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(timeoutMessage || `Timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      })
    ]);
  }
  
  // 재시도 로직이 있는 안전한 Promise
  static async withRetry<T>(
    promiseFactory: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await promiseFactory();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // 지수 백오프
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
  
  // 안전한 Promise.all
  static async safeAll<T>(
    promises: Promise<T>[],
    options: {
      failFast?: boolean;
      timeout?: number;
    } = {}
  ): Promise<{ successes: T[]; failures: Error[] }> {
    const results = await Promise.allSettled(
      promises.map(p => 
        options.timeout ? this.withTimeout(p, options.timeout) : p
      )
    );
    
    const successes: T[] = [];
    const failures: Error[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        successes.push(result.value);
      } else {
        failures.push(result.reason);
      }
    });
    
    if (options.failFast && failures.length > 0) {
      throw failures[0];
    }
    
    return { successes, failures };
  }
}

// 사용 예시
async function fetchUserData(userId: string) {
  // 타임아웃이 있는 안전한 fetch
  const userData = await SafePromiseHandling.withTimeout(
    fetch(`/api/users/${userId}`).then(r => r.json()),
    5000,
    'User fetch timeout'
  );
  
  // 재시도 로직
  const enrichedData = await SafePromiseHandling.withRetry(
    () => enrichUserData(userData),
    3,
    1000
  );
  
  return enrichedData;
}
```

## 🤖 AI 기반 안전성 검증

### 1. 위험 패턴 감지기
```typescript
// AI 기반 위험 패턴 감지
class UnsafePatternDetector {
  private aiAnalyzer: CodeAnalysisAI;
  private ruleEngine: SafetyRuleEngine;
  
  constructor() {
    this.aiAnalyzer = new CodeAnalysisAI();
    this.ruleEngine = new SafetyRuleEngine();
  }
  
  async analyzeCode(sourceCode: string): Promise<SafetyAnalysisResult> {
    const analysis: SafetyAnalysisResult = {
      overallScore: 0,
      issues: [],
      suggestions: [],
      riskLevel: 'low',
      timestamp: new Date().toISOString()
    };
    
    // 1. 정적 규칙 기반 검사
    const staticIssues = await this.ruleEngine.analyze(sourceCode);
    analysis.issues.push(...staticIssues);
    
    // 2. AI 기반 패턴 분석
    const aiAnalysis = await this.aiAnalyzer.analyzePatterns(sourceCode);
    analysis.issues.push(...aiAnalysis.issues);
    analysis.suggestions.push(...aiAnalysis.suggestions);
    
    // 3. 위험도 계산
    analysis.riskLevel = this.calculateRiskLevel(analysis.issues);
    analysis.overallScore = this.calculateSafetyScore(analysis.issues);
    
    return analysis;
  }
  
  // 일반적인 위험 패턴들
  private detectUnsafePatterns(code: string): UnsafePattern[] {
    const patterns: UnsafePattern[] = [];
    
    // any 타입 남용
    if (code.includes(': any') || code.includes('as any')) {
      patterns.push({
        type: 'any_type_usage',
        severity: 'high',
        message: 'Avoid using \'any\' type - use specific types instead',
        suggestion: 'Define proper interfaces or use union types'
      });
    }
    
    // 타입 단언 남용
    const assertionRegex = /as\s+\w+/g;
    const assertions = code.match(assertionRegex);
    if (assertions && assertions.length > 5) {
      patterns.push({
        type: 'excessive_type_assertions',
        severity: 'medium',
        message: 'Excessive use of type assertions detected',
        suggestion: 'Consider improving type inference or using type guards'
      });
    }
    
    // 비동기 오류 처리 누락
    if (code.includes('await ') && !code.includes('try') && !code.includes('catch')) {
      patterns.push({
        type: 'unhandled_async_errors',
        severity: 'high',
        message: 'Async operations without error handling',
        suggestion: 'Add try-catch blocks or .catch() handlers'
      });
    }
    
    return patterns;
  }
  
  // 개선 제안 생성
  async generateImprovements(code: string): Promise<CodeImprovement[]> {
    const improvements: CodeImprovement[] = [];
    
    // AI 기반 개선 제안
    const aiSuggestions = await this.aiAnalyzer.suggestImprovements(code);
    
    for (const suggestion of aiSuggestions) {
      improvements.push({
        type: suggestion.type,
        priority: suggestion.priority,
        description: suggestion.description,
        before: suggestion.currentCode,
        after: suggestion.improvedCode,
        impact: suggestion.impact
      });
    }
    
    return improvements;
  }
}
```

### 2. 자동 코드 수정 시스템
```typescript
// 자동 코드 개선 시스템
class AutoCodeImprover {
  private detector: UnsafePatternDetector;
  private transformer: CodeTransformer;
  
  constructor() {
    this.detector = new UnsafePatternDetector();
    this.transformer = new CodeTransformer();
  }
  
  async improveCodeSafety(
    sourceCode: string,
    options: ImprovementOptions = {}
  ): Promise<ImprovedCodeResult> {
    // 1. 현재 코드 분석
    const analysis = await this.detector.analyzeCode(sourceCode);
    
    // 2. 자동 수정 가능한 이슈들 식별
    const autoFixableIssues = analysis.issues.filter(issue => 
      issue.autoFixable && 
      (options.aggressiveness || 'conservative').includes(issue.severity)
    );
    
    // 3. 자동 수정 적용
    let improvedCode = sourceCode;
    const appliedFixes: AppliedFix[] = [];
    
    for (const issue of autoFixableIssues) {
      try {
        const fix = await this.generateAutoFix(issue, improvedCode);
        improvedCode = this.transformer.applyFix(improvedCode, fix);
        appliedFixes.push({
          issue: issue.type,
          description: issue.message,
          fix: fix.description
        });
      } catch (error) {
        console.warn(`Failed to auto-fix ${issue.type}:`, error.message);
      }
    }
    
    // 4. 개선 후 재분석
    const reanalysis = await this.detector.analyzeCode(improvedCode);
    
    return {
      originalCode: sourceCode,
      improvedCode,
      appliedFixes,
      beforeAnalysis: analysis,
      afterAnalysis: reanalysis,
      improvementScore: reanalysis.overallScore - analysis.overallScore
    };
  }
  
  private async generateAutoFix(
    issue: SafetyIssue,
    code: string
  ): Promise<AutoFix> {
    switch (issue.type) {
      case 'any_type_usage':
        return this.fixAnyTypeUsage(issue, code);
      
      case 'missing_null_checks':
        return this.addNullChecks(issue, code);
      
      case 'unhandled_async_errors':
        return this.addErrorHandling(issue, code);
      
      default:
        throw new Error(`No auto-fix available for ${issue.type}`);
    }
  }
  
  private fixAnyTypeUsage(issue: SafetyIssue, code: string): AutoFix {
    // AI를 사용해 적절한 타입 추론
    const inferredType = this.inferBetterType(issue.context);
    
    return {
      description: `Replace 'any' with '${inferredType}'`,
      pattern: /:\s*any/g,
      replacement: `: ${inferredType}`,
      confidence: 0.8
    };
  }
}
```

## 🎯 Best Practices

### 1. 안전성 체크리스트
```typescript
const CODE_SAFETY_CHECKLIST = {
  // 타입 안전성
  typesafety: {
    strictMode: true,              // strict 모드 활성화
    noAnyTypes: true,              // any 타입 사용 금지
    exhaustiveChecking: true,      // 완전성 검사
    brandedTypes: true             // 브랜드 타입 사용
  },
  
  // 런타임 안전성
  runtimeSafety: {
    inputValidation: true,         // 입력값 검증
    errorHandling: true,           // 오류 처리
    nullChecks: true,              // null/undefined 검사
    boundaryChecks: true           // 경계값 검사
  },
  
  // AI 검증
  aiVerification: {
    patternDetection: true,        // 위험 패턴 감지
    automaticFixes: true,          // 자동 수정
    continuousMonitoring: true,    // 지속적 모니터링
    qualityGates: true             // 품질 게이트
  }
};
```

### 2. 성공 메트릭
```typescript
const SAFETY_SUCCESS_METRICS = {
  // 코드 품질
  codeQuality: {
    safetyScore: 95,               // 95점 이상
    typeErrorRate: 0,              // 타입 오류 0%
    runtimeErrorRate: 0.1,         // 런타임 오류 0.1% 이하
    testCoverage: 90               // 테스트 커버리지 90%
  },
  
  // 개발 효율성
  efficiency: {
    bugReductionRate: 80,          // 버그 80% 감소
    developmentSpeed: 150,         // 개발 속도 150%
    codeReviewTime: 50,            // 코드 리뷰 시간 50%
    maintenanceCost: 30            // 유지보수 비용 30%
  },
  
  // AI 성능
  aiPerformance: {
    detectionAccuracy: 95,         // 감지 정확도 95%
    falsePositiveRate: 5,          // 오탐률 5% 이하
    autoFixSuccessRate: 85,        // 자동 수정 성공률 85%
    responseTime: 100              // 응답 시간 100ms 이하
  }
};
```

---

*Code Safety Patterns: 안전한 코드가 신뢰할 수 있는 소프트웨어를 만든다*