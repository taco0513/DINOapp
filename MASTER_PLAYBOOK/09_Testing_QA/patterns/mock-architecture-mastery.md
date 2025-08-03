# Mock Architecture Mastery - 완전한 모킹 전략

## 🎯 실전 검증된 Mock 아키텍처

> **핵심 원칙**: "Mock은 테스트의 신뢰성을 높이는 도구이지, 복잡성을 만드는 장애물이 아니다"

## ⚡ Mock 전략 분류 시스템

### 1. Mock 레벨별 전략
```typescript
interface MockStrategy {
  level: 'unit' | 'integration' | 'e2e';
  mockType: 'full' | 'partial' | 'spy' | 'stub';
  testScope: 'isolated' | 'component' | 'system';
  maintainability: 'high' | 'medium' | 'low';
}

const MOCK_DECISION_MATRIX = {
  unit_testing: {
    external_apis: 'full_mock',        // 완전 모킹
    database: 'full_mock',             // 완전 모킹
    file_system: 'full_mock',          // 완전 모킹
    internal_modules: 'spy',           // 스파이/부분 모킹
    pure_functions: 'no_mock'          // 모킹 불필요
  },
  
  integration_testing: {
    external_apis: 'contract_testing',  // 계약 테스트
    database: 'test_database',         // 테스트 DB
    file_system: 'temp_directories',   // 임시 파일
    internal_modules: 'real',          // 실제 모듈
    cache: 'in_memory'                 // 인메모리 캐시
  },
  
  e2e_testing: {
    external_apis: 'mock_server',      // Mock Server
    database: 'test_database',         // 격리된 테스트 DB
    file_system: 'containerized',      // 컨테이너 환경
    third_party: 'stub_services',     // 스텁 서비스
    real_user_flow: 'minimal_mocking'  // 최소 모킹
  }
};
```

### 2. Smart Mock Factory Pattern
```typescript
// 🏭 지능형 Mock 팩토리
class SmartMockFactory {
  private mockCache = new Map<string, any>();
  private mockHistory = new Map<string, any[]>();
  
  // 타입 안전한 Mock 생성
  createTypedMock<T>(
    target: new (...args: any[]) => T,
    overrides: Partial<T> = {},
    options: MockOptions = {}
  ): jest.Mocked<T> {
    const mockKey = `${target.name}_${JSON.stringify(overrides)}`;
    
    if (this.mockCache.has(mockKey) && options.reuse) {
      return this.mockCache.get(mockKey);
    }
    
    // 실제 클래스의 메서드 시그니처 추출
    const prototype = target.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
    
    const mock = {} as jest.Mocked<T>;
    
    // 각 메서드에 대한 스마트 Mock 생성
    methodNames.forEach(methodName => {
      mock[methodName as keyof T] = jest.fn().mockImplementation((...args) => {
        // 호출 히스토리 기록
        const historyKey = `${target.name}.${methodName}`;
        if (!this.mockHistory.has(historyKey)) {
          this.mockHistory.set(historyKey, []);
        }
        this.mockHistory.get(historyKey)!.push({
          args,
          timestamp: new Date(),
          callCount: this.mockHistory.get(historyKey)!.length + 1
        });
        
        // 커스텀 동작 또는 기본 리턴값
        if (overrides[methodName as keyof T]) {
          return overrides[methodName as keyof T];
        }
        
        return this.generateSmartReturn(methodName, args);
      }) as any;
    });
    
    if (options.reuse) {
      this.mockCache.set(mockKey, mock);
    }
    
    return mock;
  }
  
  // 스마트 리턴값 생성
  private generateSmartReturn(methodName: string, args: any[]): any {
    // 메서드 이름 패턴에 따른 기본 리턴값
    if (methodName.startsWith('get')) return null;
    if (methodName.startsWith('is') || methodName.startsWith('has')) return false;
    if (methodName.startsWith('find')) return undefined;
    if (methodName.startsWith('create') || methodName.startsWith('save')) {
      return { id: `mock_${Date.now()}`, ...args[0] };
    }
    if (methodName.startsWith('delete')) return true;
    if (methodName.startsWith('count')) return 0;
    
    return undefined;
  }
  
  // Mock 히스토리 분석
  getCallHistory(className: string, methodName?: string) {
    if (methodName) {
      return this.mockHistory.get(`${className}.${methodName}`) || [];
    }
    
    const classHistory = {};
    this.mockHistory.forEach((history, key) => {
      if (key.startsWith(`${className}.`)) {
        const method = key.split('.')[1];
        classHistory[method] = history;
      }
    });
    
    return classHistory;
  }
  
  // Mock 검증 도구
  verifyInteractions(className: string, expectedCalls: Record<string, number>) {
    const results = {};
    
    Object.entries(expectedCalls).forEach(([methodName, expectedCount]) => {
      const history = this.mockHistory.get(`${className}.${methodName}`) || [];
      results[methodName] = {
        expected: expectedCount,
        actual: history.length,
        passed: history.length === expectedCount,
        calls: history
      };
    });
    
    return results;
  }
  
  // Mock 리셋
  resetMocks(pattern?: string) {
    if (pattern) {
      const keysToDelete = Array.from(this.mockCache.keys())
        .filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.mockCache.delete(key));
      
      const historyKeysToDelete = Array.from(this.mockHistory.keys())
        .filter(key => key.includes(pattern));
      historyKeysToDelete.forEach(key => this.mockHistory.delete(key));
    } else {
      this.mockCache.clear();
      this.mockHistory.clear();
    }
  }
}

// 글로벌 팩토리 인스턴스
export const mockFactory = new SmartMockFactory();
```

### 3. API Mock Server Architecture
```typescript
// 🌐 MSW (Mock Service Worker) 기반 API 모킹
import { rest } from 'msw';
import { setupServer } from 'msw/node';

interface ApiMockConfig {
  baseUrl: string;
  responses: Record<string, any>;
  delays: Record<string, number>;
  errors: Record<string, { status: number; message: string }>;
}

class ApiMockServer {
  private server: any;
  private mockDatabase = new Map<string, any[]>();
  private requestHistory: Array<{ method: string; url: string; body?: any; timestamp: Date }> = [];
  
  constructor(private config: ApiMockConfig) {
    this.initializeDatabase();
    this.server = setupServer(...this.createHandlers());
  }
  
  private initializeDatabase() {
    // 실제와 유사한 테스트 데이터 생성
    this.mockDatabase.set('users', [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
    ]);
    
    this.mockDatabase.set('products', [
      { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', inStock: true },
      { id: 2, name: 'Phone', price: 699.99, category: 'electronics', inStock: false },
      { id: 3, name: 'Book', price: 29.99, category: 'books', inStock: true }
    ]);
    
    this.mockDatabase.set('orders', []);
  }
  
  private createHandlers() {
    return [
      // GET requests
      rest.get(`${this.config.baseUrl}/users`, (req, res, ctx) => {
        this.recordRequest('GET', '/users');
        
        const users = this.mockDatabase.get('users') || [];
        const page = parseInt(req.url.searchParams.get('page') || '1');
        const limit = parseInt(req.url.searchParams.get('limit') || '10');
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        return res(
          ctx.delay(this.config.delays['/users'] || 0),
          ctx.json({
            data: paginatedUsers,
            pagination: {
              page,
              limit,
              total: users.length,
              totalPages: Math.ceil(users.length / limit)
            }
          })
        );
      }),
      
      rest.get(`${this.config.baseUrl}/users/:id`, (req, res, ctx) => {
        const { id } = req.params;
        this.recordRequest('GET', `/users/${id}`);
        
        const users = this.mockDatabase.get('users') || [];
        const user = users.find(u => u.id === parseInt(id as string));
        
        if (!user) {
          return res(
            ctx.status(404),
            ctx.json({ error: 'User not found' })
          );
        }
        
        return res(
          ctx.delay(this.config.delays['/users/:id'] || 0),
          ctx.json({ data: user })
        );
      }),
      
      // POST requests
      rest.post(`${this.config.baseUrl}/users`, async (req, res, ctx) => {
        const body = await req.json();
        this.recordRequest('POST', '/users', body);
        
        // 입력 검증
        if (!body.name || !body.email) {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Name and email are required' })
          );
        }
        
        const users = this.mockDatabase.get('users') || [];
        const newUser = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          ...body,
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        this.mockDatabase.set('users', users);
        
        return res(
          ctx.status(201),
          ctx.delay(this.config.delays['/users'] || 0),
          ctx.json({ data: newUser })
        );
      }),
      
      // PUT/PATCH requests
      rest.put(`${this.config.baseUrl}/users/:id`, async (req, res, ctx) => {
        const { id } = req.params;
        const body = await req.json();
        this.recordRequest('PUT', `/users/${id}`, body);
        
        const users = this.mockDatabase.get('users') || [];
        const userIndex = users.findIndex(u => u.id === parseInt(id as string));
        
        if (userIndex === -1) {
          return res(
            ctx.status(404),
            ctx.json({ error: 'User not found' })
          );
        }
        
        users[userIndex] = { ...users[userIndex], ...body, updatedAt: new Date().toISOString() };
        this.mockDatabase.set('users', users);
        
        return res(
          ctx.delay(this.config.delays['/users/:id'] || 0),
          ctx.json({ data: users[userIndex] })
        );
      }),
      
      // DELETE requests
      rest.delete(`${this.config.baseUrl}/users/:id`, (req, res, ctx) => {
        const { id } = req.params;
        this.recordRequest('DELETE', `/users/${id}`);
        
        const users = this.mockDatabase.get('users') || [];
        const userIndex = users.findIndex(u => u.id === parseInt(id as string));
        
        if (userIndex === -1) {
          return res(
            ctx.status(404),
            ctx.json({ error: 'User not found' })
          );
        }
        
        users.splice(userIndex, 1);
        this.mockDatabase.set('users', users);
        
        return res(
          ctx.status(204)
        );
      }),
      
      // 에러 시뮬레이션
      rest.get(`${this.config.baseUrl}/error-test`, (req, res, ctx) => {
        const errorType = req.url.searchParams.get('type');
        
        switch (errorType) {
          case 'timeout':
            return res(ctx.delay(30000)); // 30초 지연으로 타임아웃 시뮬레이션
          case 'server-error':
            return res(
              ctx.status(500),
              ctx.json({ error: 'Internal server error' })
            );
          case 'rate-limit':
            return res(
              ctx.status(429),
              ctx.json({ error: 'Too many requests' })
            );
          default:
            return res(ctx.json({ message: 'Error test endpoint' }));
        }
      })
    ];
  }
  
  private recordRequest(method: string, url: string, body?: any) {
    this.requestHistory.push({
      method,
      url,
      body,
      timestamp: new Date()
    });
  }
  
  // Mock 서버 제어 메서드
  start() {
    this.server.listen({
      onUnhandledRequest: 'warn'
    });
  }
  
  stop() {
    this.server.close();
  }
  
  reset() {
    this.server.resetHandlers();
    this.requestHistory = [];
    this.initializeDatabase();
  }
  
  // 동적 응답 설정
  setMockResponse(endpoint: string, response: any, statusCode = 200) {
    this.server.use(
      rest.get(`${this.config.baseUrl}${endpoint}`, (req, res, ctx) => {
        return res(
          ctx.status(statusCode),
          ctx.json(response)
        );
      })
    );
  }
  
  // 네트워크 상황 시뮬레이션
  simulateNetworkCondition(condition: 'slow' | 'unstable' | 'offline') {
    const delays = {
      slow: 3000,
      unstable: () => Math.random() * 5000,
      offline: 0
    };
    
    this.server.use(
      rest.all('*', (req, res, ctx) => {
        if (condition === 'offline') {
          return res.networkError('Network offline');
        }
        
        const delay = typeof delays[condition] === 'function' 
          ? delays[condition]() 
          : delays[condition];
          
        return res(ctx.delay(delay));
      })
    );
  }
  
  // 요청 히스토리 분석
  getRequestHistory(filter?: { method?: string; url?: string }) {
    if (!filter) return this.requestHistory;
    
    return this.requestHistory.filter(req => {
      if (filter.method && req.method !== filter.method) return false;
      if (filter.url && !req.url.includes(filter.url)) return false;
      return true;
    });
  }
  
  // 테스트 데이터 조작
  setMockData(resource: string, data: any[]) {
    this.mockDatabase.set(resource, data);
  }
  
  getMockData(resource: string) {
    return this.mockDatabase.get(resource) || [];
  }
  
  addMockData(resource: string, item: any) {
    const data = this.mockDatabase.get(resource) || [];
    data.push(item);
    this.mockDatabase.set(resource, data);
  }
}

// 글로벌 API Mock 서버
export const apiMockServer = new ApiMockServer({
  baseUrl: 'https://api.example.com',
  responses: {},
  delays: {},
  errors: {}
});
```

## 🧬 Advanced Mock Patterns

### 1. Database Mock with Transaction Support
```typescript
// 🗄️ 트랜잭션 지원 데이터베이스 Mock
class MockDatabase {
  private data = new Map<string, any[]>();
  private transactions = new Map<string, Map<string, any[]>>();
  private activeTransactions = new Set<string>();
  
  // 트랜잭션 시작
  beginTransaction(transactionId: string) {
    if (this.activeTransactions.has(transactionId)) {
      throw new Error(`Transaction ${transactionId} already active`);
    }
    
    // 현재 데이터 스냅샷 생성
    const snapshot = new Map<string, any[]>();
    this.data.forEach((value, key) => {
      snapshot.set(key, JSON.parse(JSON.stringify(value)));
    });
    
    this.transactions.set(transactionId, snapshot);
    this.activeTransactions.add(transactionId);
  }
  
  // 트랜잭션 커밋
  commitTransaction(transactionId: string) {
    if (!this.activeTransactions.has(transactionId)) {
      throw new Error(`No active transaction ${transactionId}`);
    }
    
    // 트랜잭션 데이터를 메인 데이터로 복사
    const transactionData = this.transactions.get(transactionId)!;
    transactionData.forEach((value, key) => {
      this.data.set(key, value);
    });
    
    this.transactions.delete(transactionId);
    this.activeTransactions.delete(transactionId);
  }
  
  // 트랜잭션 롤백
  rollbackTransaction(transactionId: string) {
    if (!this.activeTransactions.has(transactionId)) {
      throw new Error(`No active transaction ${transactionId}`);
    }
    
    this.transactions.delete(transactionId);
    this.activeTransactions.delete(transactionId);
  }
  
  // CRUD 연산 (트랜잭션 지원)
  insert(table: string, data: any, transactionId?: string) {
    const targetData = this.getTargetData(table, transactionId);
    const id = Math.max(...targetData.map(item => item.id || 0), 0) + 1;
    const newItem = { id, ...data, createdAt: new Date() };
    
    targetData.push(newItem);
    this.setTargetData(table, targetData, transactionId);
    
    return newItem;
  }
  
  select(table: string, filter?: (item: any) => boolean, transactionId?: string) {
    const targetData = this.getTargetData(table, transactionId);
    return filter ? targetData.filter(filter) : [...targetData];
  }
  
  update(table: string, id: number, data: any, transactionId?: string) {
    const targetData = this.getTargetData(table, transactionId);
    const index = targetData.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in table ${table}`);
    }
    
    targetData[index] = { ...targetData[index], ...data, updatedAt: new Date() };
    this.setTargetData(table, targetData, transactionId);
    
    return targetData[index];
  }
  
  delete(table: string, id: number, transactionId?: string) {
    const targetData = this.getTargetData(table, transactionId);
    const index = targetData.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in table ${table}`);
    }
    
    const deletedItem = targetData.splice(index, 1)[0];
    this.setTargetData(table, targetData, transactionId);
    
    return deletedItem;
  }
  
  private getTargetData(table: string, transactionId?: string): any[] {
    if (transactionId && this.activeTransactions.has(transactionId)) {
      const transactionData = this.transactions.get(transactionId)!;
      return transactionData.get(table) || [];
    }
    
    return this.data.get(table) || [];
  }
  
  private setTargetData(table: string, data: any[], transactionId?: string) {
    if (transactionId && this.activeTransactions.has(transactionId)) {
      const transactionData = this.transactions.get(transactionId)!;
      transactionData.set(table, data);
    } else {
      this.data.set(table, data);
    }
  }
  
  // 테스트 도우미 메서드
  seed(table: string, data: any[]) {
    this.data.set(table, JSON.parse(JSON.stringify(data)));
  }
  
  clear(table?: string) {
    if (table) {
      this.data.delete(table);
    } else {
      this.data.clear();
    }
  }
  
  count(table: string, filter?: (item: any) => boolean): number {
    const data = this.data.get(table) || [];
    return filter ? data.filter(filter).length : data.length;
  }
}

// Jest와 통합된 Database Mock
export const createMockDatabase = () => {
  const mockDb = new MockDatabase();
  
  // 테스트별 자동 정리
  afterEach(() => {
    mockDb.clear();
  });
  
  return mockDb;
};
```

### 2. Event-Driven Mock System
```typescript
// 📡 이벤트 기반 Mock 시스템
import { EventEmitter } from 'events';

interface MockEvent {
  type: string;
  target: string;
  data: any;
  timestamp: Date;
  correlationId: string;
}

class EventDrivenMockSystem extends EventEmitter {
  private eventHistory: MockEvent[] = [];
  private mockBehaviors = new Map<string, Function[]>();
  private delayedEvents = new Map<string, NodeJS.Timeout>();
  
  // Mock 동작 등록
  registerMockBehavior(eventType: string, behavior: Function) {
    if (!this.mockBehaviors.has(eventType)) {
      this.mockBehaviors.set(eventType, []);
    }
    this.mockBehaviors.get(eventType)!.push(behavior);
  }
  
  // 이벤트 트리거
  triggerEvent(type: string, target: string, data: any, delay = 0) {
    const correlationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const executeEvent = () => {
      const event: MockEvent = {
        type,
        target,
        data,
        timestamp: new Date(),
        correlationId
      };
      
      this.eventHistory.push(event);
      
      // 등록된 Mock 동작 실행
      const behaviors = this.mockBehaviors.get(type) || [];
      behaviors.forEach(behavior => {
        try {
          behavior(event);
        } catch (error) {
          console.error(`Mock behavior error for event ${type}:`, error);
        }
      });
      
      // 이벤트 발생
      this.emit(type, event);
      this.emit('*', event); // 모든 이벤트 캐치
    };
    
    if (delay > 0) {
      const timeoutId = setTimeout(executeEvent, delay);
      this.delayedEvents.set(correlationId, timeoutId);
    } else {
      executeEvent();
    }
    
    return correlationId;
  }
  
  // 지연된 이벤트 취소
  cancelDelayedEvent(correlationId: string) {
    const timeoutId = this.delayedEvents.get(correlationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.delayedEvents.delete(correlationId);
      return true;
    }
    return false;
  }
  
  // 이벤트 히스토리 조회
  getEventHistory(filter?: Partial<MockEvent>): MockEvent[] {
    if (!filter) return [...this.eventHistory];
    
    return this.eventHistory.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === 'timestamp') return true; // 시간 필터는 별도 처리
        return event[key as keyof MockEvent] === value;
      });
    });
  }
  
  // 이벤트 대기 (테스트용)
  waitForEvent(eventType: string, timeout = 5000): Promise<MockEvent> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Event ${eventType} not received within ${timeout}ms`));
      }, timeout);
      
      this.once(eventType, (event) => {
        clearTimeout(timer);
        resolve(event);
      });
    });
  }
  
  // 이벤트 시퀀스 검증
  verifyEventSequence(expectedSequence: string[]): boolean {
    const actualSequence = this.eventHistory.map(event => event.type);
    
    if (actualSequence.length < expectedSequence.length) {
      return false;
    }
    
    let expectedIndex = 0;
    for (const actualEvent of actualSequence) {
      if (actualEvent === expectedSequence[expectedIndex]) {
        expectedIndex++;
        if (expectedIndex === expectedSequence.length) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Mock 리셋
  reset() {
    this.eventHistory = [];
    this.mockBehaviors.clear();
    this.delayedEvents.forEach(timeoutId => clearTimeout(timeoutId));
    this.delayedEvents.clear();
    this.removeAllListeners();
  }
}

// 사용 예시: WebSocket Mock
export class WebSocketMock extends EventDrivenMockSystem {
  private connectionState: 'closed' | 'connecting' | 'open' | 'closing' = 'closed';
  private messageQueue: any[] = [];
  
  connect(url: string, options?: any) {
    this.connectionState = 'connecting';
    this.triggerEvent('connecting', url, { options });
    
    // 연결 시뮬레이션 (500ms 후 연결 완료)
    this.triggerEvent('open', url, { readyState: 1 }, 500);
    
    setTimeout(() => {
      this.connectionState = 'open';
      // 큐에 대기 중인 메시지 전송
      this.messageQueue.forEach(message => {
        this.triggerEvent('message', url, message);
      });
      this.messageQueue = [];
    }, 500);
  }
  
  send(data: any) {
    if (this.connectionState === 'open') {
      this.triggerEvent('message', 'client', data);
    } else {
      this.messageQueue.push(data);
    }
  }
  
  close(code = 1000, reason = 'Normal closure') {
    this.connectionState = 'closing';
    this.triggerEvent('closing', 'client', { code, reason });
    
    setTimeout(() => {
      this.connectionState = 'closed';
      this.triggerEvent('close', 'client', { code, reason });
    }, 100);
  }
  
  // 서버에서 메시지 전송 시뮬레이션
  simulateServerMessage(data: any, delay = 0) {
    if (this.connectionState === 'open') {
      this.triggerEvent('message', 'server', data, delay);
    }
  }
  
  // 연결 에러 시뮬레이션
  simulateError(error: Error, delay = 0) {
    this.triggerEvent('error', 'connection', { error: error.message }, delay);
  }
}
```

### 3. Mock 성능 최적화
```typescript
// ⚡ 고성능 Mock 시스템
class OptimizedMockSystem {
  private static instance: OptimizedMockSystem;
  private mockCache = new Map<string, WeakMap<object, any>>();
  private callCounters = new Map<string, number>();
  private performanceMetrics = new Map<string, number[]>();
  
  static getInstance(): OptimizedMockSystem {
    if (!OptimizedMockSystem.instance) {
      OptimizedMockSystem.instance = new OptimizedMockSystem();
    }
    return OptimizedMockSystem.instance;
  }
  
  // 캐시된 Mock 생성
  createCachedMock<T>(
    key: string, 
    factory: () => T,
    cacheStrategy: 'per-test' | 'per-suite' | 'global' = 'per-test'
  ): T {
    const cacheKey = `${key}_${cacheStrategy}`;
    
    if (!this.mockCache.has(cacheKey)) {
      this.mockCache.set(cacheKey, new WeakMap());
    }
    
    const cache = this.mockCache.get(cacheKey)!;
    const cacheTarget = this.getCacheTarget(cacheStrategy);
    
    if (cache.has(cacheTarget)) {
      return cache.get(cacheTarget);
    }
    
    const startTime = performance.now();
    const mock = factory();
    const endTime = performance.now();
    
    // 성능 메트릭 기록
    this.recordPerformance(key, endTime - startTime);
    
    cache.set(cacheTarget, mock);
    return mock;
  }
  
  private getCacheTarget(strategy: string): object {
    switch (strategy) {
      case 'per-test':
        return expect.getState(); // Jest의 현재 테스트 상태
      case 'per-suite':
        return describe; // describe 블록 레벨
      case 'global':
        return global; // 글로벌 레벨
      default:
        return {};
    }
  }
  
  // 호출 횟수 추적
  trackCall(mockName: string): number {
    const count = (this.callCounters.get(mockName) || 0) + 1;
    this.callCounters.set(mockName, count);
    return count;
  }
  
  // 성능 메트릭 기록
  private recordPerformance(mockName: string, duration: number) {
    if (!this.performanceMetrics.has(mockName)) {
      this.performanceMetrics.set(mockName, []);
    }
    this.performanceMetrics.get(mockName)!.push(duration);
  }
  
  // 성능 분석 리포트
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    this.performanceMetrics.forEach((durations, mockName) => {
      const total = durations.reduce((sum, d) => sum + d, 0);
      const average = total / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      report[mockName] = {
        callCount: durations.length,
        totalTime: total,
        averageTime: average,
        minTime: min,
        maxTime: max,
        slowCalls: durations.filter(d => d > average * 2).length
      };
    });
    
    return report;
  }
  
  // 메모리 효율적인 Mock 정리
  cleanup(level: 'test' | 'suite' | 'all' = 'test') {
    switch (level) {
      case 'test':
        // 테스트별 캐시만 정리
        this.mockCache.forEach((cache, key) => {
          if (key.includes('per-test')) {
            cache = new WeakMap();
          }
        });
        break;
      case 'suite':
        // 스위트별 캐시 정리
        this.mockCache.forEach((cache, key) => {
          if (key.includes('per-test') || key.includes('per-suite')) {
            cache = new WeakMap();
          }
        });
        break;
      case 'all':
        this.mockCache.clear();
        this.callCounters.clear();
        this.performanceMetrics.clear();
        break;
    }
  }
}

// Jest 훅과 통합
export const optimizedMocks = OptimizedMockSystem.getInstance();

beforeEach(() => {
  optimizedMocks.cleanup('test');
});

afterAll(() => {
  const report = optimizedMocks.getPerformanceReport();
  console.log('Mock Performance Report:', report);
  
  // 느린 Mock 경고
  Object.entries(report).forEach(([mockName, metrics]: [string, any]) => {
    if (metrics.averageTime > 10) { // 10ms 이상
      console.warn(`Slow mock detected: ${mockName} (${metrics.averageTime.toFixed(2)}ms avg)`);
    }
  });
});
```

## 🎯 Mock 베스트 프랙티스

### 1. Mock 검증 패턴
```typescript
// ✅ Mock 검증 도우미
export class MockVerifier {
  static verifyMockCall<T extends (...args: any[]) => any>(
    mock: jest.MockedFunction<T>,
    expectedCalls: Array<Parameters<T>>,
    options: {
      exactOrder?: boolean;
      allowExtraCalls?: boolean;
    } = {}
  ) {
    const { exactOrder = true, allowExtraCalls = false } = options;
    
    if (!allowExtraCalls && mock.mock.calls.length !== expectedCalls.length) {
      throw new Error(
        `Expected ${expectedCalls.length} calls, but got ${mock.mock.calls.length}`
      );
    }
    
    if (exactOrder) {
      expectedCalls.forEach((expectedArgs, index) => {
        expect(mock).toHaveBeenNthCalledWith(index + 1, ...expectedArgs);
      });
    } else {
      expectedCalls.forEach(expectedArgs => {
        expect(mock).toHaveBeenCalledWith(...expectedArgs);
      });
    }
  }
  
  static verifyMockSequence(mocks: jest.MockedFunction<any>[], expectedSequence: string[]) {
    const actualSequence: string[] = [];
    
    mocks.forEach((mock, index) => {
      mock.mock.calls.forEach(() => {
        actualSequence.push(`mock${index}`);
      });
    });
    
    expect(actualSequence).toEqual(expectedSequence);
  }
  
  static verifyNoUnexpectedCalls(...mocks: jest.MockedFunction<any>[]) {
    mocks.forEach((mock, index) => {
      if (mock.mock.calls.length > 0) {
        throw new Error(
          `Mock ${index} was called unexpectedly: ${JSON.stringify(mock.mock.calls)}`
        );
      }
    });
  }
}

// 사용 예시
describe('UserService', () => {
  const mockRepository = mockFactory.createTypedMock(UserRepository);
  const mockLogger = mockFactory.createTypedMock(Logger);
  
  test('should create user with proper sequence', async () => {
    const userService = new UserService(mockRepository, mockLogger);
    const userData = { name: 'John', email: 'john@example.com' };
    
    await userService.createUser(userData);
    
    // Mock 호출 순서 검증
    MockVerifier.verifyMockSequence(
      [mockLogger.info, mockRepository.save, mockLogger.info],
      ['mock0', 'mock1', 'mock2']
    );
    
    // 구체적인 호출 검증
    MockVerifier.verifyMockCall(mockRepository.save, [
      [expect.objectContaining(userData)]
    ]);
  });
});
```

---

*"Mock은 테스트의 복잡성을 줄이고 신뢰성을 높이는 도구다. 하지만 실제 동작과 너무 멀어지면 거짓 안정감만 주는 독이 된다."*