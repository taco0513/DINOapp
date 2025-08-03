# Async Testing Mastery - 비동기 테스트 완전 정복

## 🎯 비동기 테스트의 현실적 도전

> **핵심 문제**: "비동기 코드는 예측하기 어렵고, 테스트는 더욱 어렵다"

## ⚡ 비동기 테스트 패턴 분류

### 1. Promise 기반 테스트 패턴
```typescript
// 🔄 Promise 테스트 전략
describe('Promise Testing Patterns', () => {
  
  // ✅ 올바른 Promise 테스트
  test('should handle async operation correctly', async () => {
    // Given
    const mockApi = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    const userService = new UserService(mockApi);
    
    // When
    const result = await userService.getUser(1);
    
    // Then
    expect(result).toEqual({ id: 1, name: 'John' });
    expect(mockApi).toHaveBeenCalledWith(1);
  });
  
  // ✅ Promise 에러 처리 테스트
  test('should handle async errors properly', async () => {
    // Given
    const mockApi = jest.fn().mockRejectedValue(new Error('Network error'));
    const userService = new UserService(mockApi);
    
    // When & Then
    await expect(userService.getUser(1)).rejects.toThrow('Network error');
    expect(mockApi).toHaveBeenCalledWith(1);
  });
  
  // ✅ 복잡한 Promise 체이닝 테스트
  test('should handle promise chaining', async () => {
    // Given
    const mockUserApi = jest.fn().mockResolvedValue({ id: 1, profileId: 'prof_1' });
    const mockProfileApi = jest.fn().mockResolvedValue({ id: 'prof_1', bio: 'Developer' });
    const userService = new UserService(mockUserApi, mockProfileApi);
    
    // When
    const result = await userService.getUserWithProfile(1);
    
    // Then
    expect(result).toEqual({
      user: { id: 1, profileId: 'prof_1' },
      profile: { id: 'prof_1', bio: 'Developer' }
    });
    expect(mockUserApi).toHaveBeenCalledWith(1);
    expect(mockProfileApi).toHaveBeenCalledWith('prof_1');
  });
  
  // ✅ 병렬 Promise 테스트
  test('should handle parallel promises', async () => {
    // Given
    const mockApi1 = jest.fn().mockResolvedValue('result1');
    const mockApi2 = jest.fn().mockResolvedValue('result2');
    const mockApi3 = jest.fn().mockResolvedValue('result3');
    
    const service = new ParallelService(mockApi1, mockApi2, mockApi3);
    
    // When
    const startTime = Date.now();
    const results = await service.getDataInParallel();
    const endTime = Date.now();
    
    // Then
    expect(results).toEqual(['result1', 'result2', 'result3']);
    expect(endTime - startTime).toBeLessThan(100); // 병렬 실행이므로 빠름
  });
});
```

### 2. Callback 기반 테스트 패턴
```typescript
// 📞 Callback 테스트 전략
describe('Callback Testing Patterns', () => {
  
  // ✅ 전통적인 done 패턴
  test('should handle callback-based async operation', (done) => {
    // Given
    const mockCallback = jest.fn((error, result) => {
      try {
        expect(error).toBeNull();
        expect(result).toEqual({ success: true });
        done();
      } catch (err) {
        done(err);
      }
    });
    
    // When
    callbackBasedFunction(mockCallback);
  });
  
  // ✅ Promise로 래핑한 Callback 테스트
  test('should wrap callback in promise for easier testing', async () => {
    // Given
    const callbackToPromise = <T>(fn: Function): Promise<T> => {
      return new Promise((resolve, reject) => {
        fn((error: Error | null, result: T) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    };
    
    // When
    const result = await callbackToPromise(callbackBasedFunction);
    
    // Then
    expect(result).toEqual({ success: true });
  });
  
  // ✅ 복잡한 Callback 체이닝 테스트
  test('should handle callback chaining', (done) => {
    let callCount = 0;
    
    const checkComplete = () => {
      callCount++;
      if (callCount === 3) {
        done();
      }
    };
    
    // 여러 callback이 순차적으로 실행되는 상황
    step1((err1, result1) => {
      expect(err1).toBeNull();
      expect(result1).toBeDefined();
      checkComplete();
      
      step2(result1, (err2, result2) => {
        expect(err2).toBeNull();
        expect(result2).toBeDefined();
        checkComplete();
        
        step3(result2, (err3, result3) => {
          expect(err3).toBeNull();
          expect(result3).toBeDefined();
          checkComplete();
        });
      });
    });
  });
});
```

### 3. Event-Based 테스트 패턴
```typescript
// 📡 Event 테스트 전략
describe('Event-Based Testing Patterns', () => {
  
  // ✅ Event Emitter 테스트
  test('should handle event emission correctly', async () => {
    // Given
    const eventEmitter = new EventEmitter();
    const mockListener = jest.fn();
    
    eventEmitter.on('data', mockListener);
    
    // When
    eventEmitter.emit('data', { id: 1, message: 'test' });
    
    // Wait for next tick to ensure event is processed
    await new Promise(resolve => setImmediate(resolve));
    
    // Then
    expect(mockListener).toHaveBeenCalledWith({ id: 1, message: 'test' });
  });
  
  // ✅ 복수 Event 시퀀스 테스트
  test('should handle event sequence', async () => {
    // Given
    const eventEmitter = new EventEmitter();
    const events: string[] = [];
    
    const eventPromise = new Promise<void>((resolve) => {
      let eventCount = 0;
      const expectedEvents = ['start', 'progress', 'complete'];
      
      eventEmitter.on('start', () => {
        events.push('start');
        eventCount++;
      });
      
      eventEmitter.on('progress', () => {
        events.push('progress');
        eventCount++;
      });
      
      eventEmitter.on('complete', () => {
        events.push('complete');
        eventCount++;
        
        if (eventCount === 3) {
          resolve();
        }
      });
    });
    
    // When
    eventEmitter.emit('start');
    eventEmitter.emit('progress');
    eventEmitter.emit('complete');
    
    await eventPromise;
    
    // Then
    expect(events).toEqual(['start', 'progress', 'complete']);
  });
  
  // ✅ Event 타임아웃 테스트
  test('should timeout when event not received', async () => {
    // Given
    const eventEmitter = new EventEmitter();
    
    const waitForEvent = (eventName: string, timeout: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Event ${eventName} not received within ${timeout}ms`));
        }, timeout);
        
        eventEmitter.once(eventName, (data) => {
          clearTimeout(timer);
          resolve(data);
        });
      });
    };
    
    // When & Then
    await expect(waitForEvent('nonexistent', 100))
      .rejects.toThrow('Event nonexistent not received within 100ms');
  });
});
```

### 4. Timer 기반 테스트 패턴
```typescript
// ⏰ Timer 테스트 전략
describe('Timer-Based Testing Patterns', () => {
  
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  // ✅ setTimeout 테스트
  test('should handle setTimeout correctly', () => {
    // Given
    const mockCallback = jest.fn();
    const delayedFunction = (callback: Function, delay: number) => {
      setTimeout(callback, delay);
    };
    
    // When
    delayedFunction(mockCallback, 1000);
    
    // Then - 아직 호출되지 않음
    expect(mockCallback).not.toHaveBeenCalled();
    
    // 시간을 1000ms 앞으로
    jest.advanceTimersByTime(1000);
    
    // 이제 호출됨
    expect(mockCallback).toHaveBeenCalled();
  });
  
  // ✅ setInterval 테스트
  test('should handle setInterval correctly', () => {
    // Given
    const mockCallback = jest.fn();
    const intervalFunction = (callback: Function) => {
      return setInterval(callback, 500);
    };
    
    // When
    const intervalId = intervalFunction(mockCallback);
    
    // Then - 500ms씩 3번 진행
    expect(mockCallback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(500);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(500);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    
    jest.advanceTimersByTime(500);
    expect(mockCallback).toHaveBeenCalledTimes(3);
    
    // Cleanup
    clearInterval(intervalId);
  });
  
  // ✅ 복잡한 Timer 조합 테스트
  test('should handle complex timer combinations', () => {
    // Given
    const results: string[] = [];
    
    // 다양한 타이밍의 함수들
    setTimeout(() => results.push('timeout-100'), 100);
    setTimeout(() => results.push('timeout-200'), 200);
    setTimeout(() => results.push('timeout-150'), 150);
    
    const intervalId = setInterval(() => results.push('interval-50'), 50);
    
    // When & Then - 250ms까지 실행
    jest.advanceTimersByTime(250);
    
    clearInterval(intervalId);
    
    expect(results).toEqual([
      'interval-50',     // 50ms
      'timeout-100',     // 100ms
      'interval-50',     // 100ms
      'timeout-150',     // 150ms
      'interval-50',     // 150ms
      'timeout-200',     // 200ms
      'interval-50',     // 200ms
      'interval-50'      // 250ms
    ]);
  });
  
  // ✅ Promise + Timer 조합 테스트
  test('should handle promise with timer', async () => {
    // Given
    const delayedPromise = (delay: number, value: string): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(value), delay);
      });
    };
    
    // When
    const promise = delayedPromise(1000, 'delayed result');
    
    // 시간을 앞으로 이동
    jest.advanceTimersByTime(1000);
    
    // Then
    const result = await promise;
    expect(result).toBe('delayed result');
  });
});
```

## 🌐 실전 비동기 테스트 시나리오

### 1. API 통신 테스트
```typescript
// 🌍 API 통신 완전 테스트
describe('API Communication Testing', () => {
  
  // ✅ HTTP 요청 성공 케이스
  test('should handle successful API request', async () => {
    // Given
    const mockAxios = {
      get: jest.fn().mockResolvedValue({
        data: { id: 1, name: 'John' },
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    };
    
    const apiClient = new ApiClient(mockAxios);
    
    // When
    const result = await apiClient.getUser(1);
    
    // Then
    expect(result).toEqual({ id: 1, name: 'John' });
    expect(mockAxios.get).toHaveBeenCalledWith('/users/1');
  });
  
  // ✅ 네트워크 에러 처리 테스트
  test('should handle network errors', async () => {
    // Given
    const networkError = new Error('Network Error');
    networkError.code = 'ECONNREFUSED';
    
    const mockAxios = {
      get: jest.fn().mockRejectedValue(networkError)
    };
    
    const apiClient = new ApiClient(mockAxios);
    
    // When & Then
    await expect(apiClient.getUser(1)).rejects.toThrow('Network Error');
    expect(mockAxios.get).toHaveBeenCalledWith('/users/1');
  });
  
  // ✅ 재시도 로직 테스트
  test('should retry failed requests', async () => {
    // Given
    const mockAxios = {
      get: jest.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockRejectedValueOnce(new Error('Another error'))
        .mockResolvedValue({ data: { id: 1, name: 'John' } })
    };
    
    const apiClient = new ApiClient(mockAxios, { retries: 3, retryDelay: 100 });
    
    // When
    const result = await apiClient.getUser(1);
    
    // Then
    expect(result).toEqual({ id: 1, name: 'John' });
    expect(mockAxios.get).toHaveBeenCalledTimes(3); // 2번 실패 + 1번 성공
  });
  
  // ✅ 타임아웃 테스트
  test('should timeout long requests', async () => {
    jest.useRealTimers(); // 실제 타이머 사용
    
    // Given
    const mockAxios = {
      get: jest.fn(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: 'too late' }), 2000)
      ))
    };
    
    const apiClient = new ApiClient(mockAxios, { timeout: 1000 });
    
    // When & Then
    await expect(apiClient.getUser(1)).rejects.toThrow('Request timeout');
  });
  
  // ✅ 동시 요청 처리 테스트
  test('should handle concurrent requests', async () => {
    // Given
    const mockAxios = {
      get: jest.fn()
        .mockImplementation((url) => {
          const id = url.split('/').pop();
          return Promise.resolve({
            data: { id: parseInt(id), name: `User${id}` }
          });
        })
    };
    
    const apiClient = new ApiClient(mockAxios);
    
    // When
    const requests = [1, 2, 3, 4, 5].map(id => apiClient.getUser(id));
    const results = await Promise.all(requests);
    
    // Then
    expect(results).toHaveLength(5);
    expect(results[0]).toEqual({ id: 1, name: 'User1' });
    expect(results[4]).toEqual({ id: 5, name: 'User5' });
    expect(mockAxios.get).toHaveBeenCalledTimes(5);
  });
});
```

### 2. 데이터베이스 트랜잭션 테스트
```typescript
// 🗄️ 데이터베이스 트랜잭션 테스트
describe('Database Transaction Testing', () => {
  
  let mockDb: MockDatabase;
  
  beforeEach(() => {
    mockDb = new MockDatabase();
    mockDb.seed('users', [
      { id: 1, name: 'John', email: 'john@test.com', balance: 1000 }
    ]);
  });
  
  // ✅ 성공적인 트랜잭션 테스트
  test('should complete transaction successfully', async () => {
    // Given
    const userService = new UserService(mockDb);
    
    // When
    await userService.transferMoney(1, 2, 500);
    
    // Then
    const user1 = mockDb.select('users', u => u.id === 1)[0];
    const user2 = mockDb.select('users', u => u.id === 2)[0];
    
    expect(user1.balance).toBe(500);
    expect(user2.balance).toBe(500);
  });
  
  // ✅ 트랜잭션 롤백 테스트
  test('should rollback on transaction failure', async () => {
    // Given
    const userService = new UserService(mockDb);
    
    // 부족한 잔액으로 실패하도록 설정
    mockDb.update('users', 1, { balance: 100 });
    
    // When & Then
    await expect(userService.transferMoney(1, 2, 500))
      .rejects.toThrow('Insufficient balance');
    
    // 원래 상태 유지 확인
    const user1 = mockDb.select('users', u => u.id === 1)[0];
    expect(user1.balance).toBe(100); // 변경되지 않음
  });
  
  // ✅ 동시 트랜잭션 테스트
  test('should handle concurrent transactions', async () => {
    // Given
    const userService = new UserService(mockDb);
    mockDb.seed('users', [
      { id: 1, name: 'John', balance: 1000 },
      { id: 2, name: 'Jane', balance: 1000 },
      { id: 3, name: 'Bob', balance: 0 }
    ]);
    
    // When - 동시에 두 트랜잭션 실행
    const transaction1 = userService.transferMoney(1, 3, 300);
    const transaction2 = userService.transferMoney(2, 3, 200);
    
    await Promise.all([transaction1, transaction2]);
    
    // Then
    const user1 = mockDb.select('users', u => u.id === 1)[0];
    const user2 = mockDb.select('users', u => u.id === 2)[0];
    const user3 = mockDb.select('users', u => u.id === 3)[0];
    
    expect(user1.balance).toBe(700);  // 1000 - 300
    expect(user2.balance).toBe(800);  // 1000 - 200  
    expect(user3.balance).toBe(500);  // 0 + 300 + 200
  });
});
```

### 3. 스트림 처리 테스트
```typescript
// 🌊 스트림 처리 테스트
describe('Stream Processing Testing', () => {
  
  // ✅ 읽기 스트림 테스트
  test('should process readable stream', async () => {
    // Given
    const { Readable } = require('stream');
    const chunks: string[] = [];
    
    const mockStream = new Readable({
      read() {
        this.push('chunk1');
        this.push('chunk2');
        this.push('chunk3');
        this.push(null); // 스트림 종료
      }
    });
    
    // When
    const processStream = async (stream: NodeJS.ReadableStream): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const chunks: string[] = [];
        
        stream.on('data', (chunk) => {
          chunks.push(chunk.toString());
        });
        
        stream.on('end', () => {
          resolve(chunks);
        });
        
        stream.on('error', reject);
      });
    };
    
    const result = await processStream(mockStream);
    
    // Then
    expect(result).toEqual(['chunk1', 'chunk2', 'chunk3']);
  });
  
  // ✅ 변환 스트림 테스트
  test('should handle transform stream', async () => {
    // Given
    const { Transform, Readable } = require('stream');
    
    const upperCaseTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
      }
    });
    
    const mockInput = new Readable({
      read() {
        this.push('hello');
        this.push('world');
        this.push(null);
      }
    });
    
    // When
    const result: string[] = [];
    
    const streamPromise = new Promise<void>((resolve, reject) => {
      mockInput
        .pipe(upperCaseTransform)
        .on('data', (chunk) => result.push(chunk.toString()))
        .on('end', resolve)
        .on('error', reject);
    });
    
    await streamPromise;
    
    // Then
    expect(result).toEqual(['HELLO', 'WORLD']);
  });
  
  // ✅ 스트림 에러 처리 테스트
  test('should handle stream errors', async () => {
    // Given
    const { Readable } = require('stream');
    
    const errorStream = new Readable({
      read() {
        this.emit('error', new Error('Stream error'));
      }
    });
    
    // When & Then
    const processStream = (stream: NodeJS.ReadableStream): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const chunks: string[] = [];
        
        stream.on('data', (chunk) => chunks.push(chunk.toString()));
        stream.on('end', () => resolve(chunks));
        stream.on('error', reject);
      });
    };
    
    await expect(processStream(errorStream)).rejects.toThrow('Stream error');
  });
});
```

## 🔧 비동기 테스트 유틸리티

### 1. 테스트 헬퍼 함수들
```typescript
// 🛠️ 비동기 테스트 헬퍼
export class AsyncTestHelpers {
  
  // Promise 대기 헬퍼
  static async waitFor<T>(
    condition: () => T | Promise<T>,
    options: {
      timeout?: number;
      interval?: number;
      timeoutMessage?: string;
    } = {}
  ): Promise<T> {
    const { timeout = 5000, interval = 100, timeoutMessage = 'Condition not met within timeout' } = options;
    
    const startTime = Date.now();
    
    while (true) {
      try {
        const result = await condition();
        if (result) {
          return result;
        }
      } catch (error) {
        // 조건이 아직 만족되지 않음, 계속 시도
      }
      
      if (Date.now() - startTime > timeout) {
        throw new Error(timeoutMessage);
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  // 여러 비동기 작업 완료 대기
  static async waitForAll<T>(
    promises: Promise<T>[],
    options: {
      timeout?: number;
      failFast?: boolean;
    } = {}
  ): Promise<T[]> {
    const { timeout = 10000, failFast = true } = options;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout waiting for all promises')), timeout);
    });
    
    if (failFast) {
      return Promise.race([
        Promise.all(promises),
        timeoutPromise
      ]);
    } else {
      return Promise.race([
        Promise.allSettled(promises).then(results => 
          results.map(result => 
            result.status === 'fulfilled' ? result.value : result.reason
          )
        ),
        timeoutPromise
      ]);
    }
  }
  
  // 재시도 테스트 헬퍼
  static async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoff?: 'linear' | 'exponential';
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'linear',
      shouldRetry = () => true
    } = options;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          throw lastError;
        }
        
        const currentDelay = backoff === 'exponential' 
          ? delay * Math.pow(2, attempt - 1)
          : delay;
          
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }
    
    throw lastError!;
  }
  
  // 비동기 이벤트 수집기
  static createEventCollector<T>(
    eventEmitter: NodeJS.EventEmitter,
    eventName: string,
    options: {
      timeout?: number;
      expectedCount?: number;
      filter?: (data: T) => boolean;
    } = {}
  ): Promise<T[]> {
    const { timeout = 5000, expectedCount, filter } = options;
    
    return new Promise((resolve, reject) => {
      const events: T[] = [];
      let timer: NodeJS.Timeout;
      
      const cleanup = () => {
        eventEmitter.removeListener(eventName, onEvent);
        if (timer) clearTimeout(timer);
      };
      
      const onEvent = (data: T) => {
        if (!filter || filter(data)) {
          events.push(data);
          
          if (expectedCount && events.length >= expectedCount) {
            cleanup();
            resolve(events);
          }
        }
      };
      
      eventEmitter.on(eventName, onEvent);
      
      timer = setTimeout(() => {
        cleanup();
        if (expectedCount && events.length < expectedCount) {
          reject(new Error(`Expected ${expectedCount} events, got ${events.length}`));
        } else {
          resolve(events);
        }
      }, timeout);
    });
  }
  
  // 성능 측정 헬퍼
  static async measurePerformance<T>(
    operation: () => Promise<T>,
    options: {
      warmupRuns?: number;
      testRuns?: number;
      maxAcceptableTime?: number;
    } = {}
  ): Promise<{
    result: T;
    averageTime: number;
    minTime: number;
    maxTime: number;
    times: number[];
  }> {
    const { warmupRuns = 1, testRuns = 5, maxAcceptableTime } = options;
    
    // Warmup
    for (let i = 0; i < warmupRuns; i++) {
      await operation();
    }
    
    // 실제 측정
    const times: number[] = [];
    let lastResult: T;
    
    for (let i = 0; i < testRuns; i++) {
      const startTime = performance.now();
      lastResult = await operation();
      const endTime = performance.now();
      
      times.push(endTime - startTime);
    }
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    if (maxAcceptableTime && averageTime > maxAcceptableTime) {
      throw new Error(`Performance test failed: ${averageTime}ms > ${maxAcceptableTime}ms`);
    }
    
    return {
      result: lastResult!,
      averageTime,
      minTime,
      maxTime,
      times
    };
  }
}

// 사용 예시
describe('Async Test Helpers Usage', () => {
  
  test('should wait for condition', async () => {
    let counter = 0;
    
    // 백그라운드에서 카운터 증가
    const interval = setInterval(() => {
      counter++;
    }, 100);
    
    try {
      // 카운터가 5가 될 때까지 대기
      await AsyncTestHelpers.waitFor(
        () => counter >= 5,
        { timeout: 2000, timeoutMessage: 'Counter never reached 5' }
      );
      
      expect(counter).toBeGreaterThanOrEqual(5);
    } finally {
      clearInterval(interval);
    }
  });
  
  test('should collect events', async () => {
    const emitter = new EventEmitter();
    
    // 이벤트 수집 시작
    const eventsPromise = AsyncTestHelpers.createEventCollector(
      emitter,
      'test',
      { expectedCount: 3, timeout: 1000 }
    );
    
    // 이벤트 발생
    setTimeout(() => emitter.emit('test', 'event1'), 100);
    setTimeout(() => emitter.emit('test', 'event2'), 200);
    setTimeout(() => emitter.emit('test', 'event3'), 300);
    
    const events = await eventsPromise;
    expect(events).toEqual(['event1', 'event2', 'event3']);
  });
  
  test('should measure performance', async () => {
    const slowOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'result';
    };
    
    const metrics = await AsyncTestHelpers.measurePerformance(
      slowOperation,
      { testRuns: 3, maxAcceptableTime: 150 }
    );
    
    expect(metrics.result).toBe('result');
    expect(metrics.averageTime).toBeGreaterThan(90);
    expect(metrics.averageTime).toBeLessThan(150);
  });
});
```

### 2. 플래키 테스트 방지 전략
```typescript
// 🛡️ 플래키 테스트 방지
export class FlakeProofTesting {
  
  // 안정화 대기
  static async stabilize(
    operation: () => Promise<boolean>,
    options: {
      attempts?: number;
      interval?: number;
      stabilityDuration?: number;
    } = {}
  ): Promise<void> {
    const { attempts = 10, interval = 100, stabilityDuration = 500 } = options;
    
    let consecutiveSuccess = 0;
    const requiredSuccesses = Math.ceil(stabilityDuration / interval);
    
    for (let attempt = 0; attempt < attempts; attempt++) {
      const isStable = await operation();
      
      if (isStable) {
        consecutiveSuccess++;
        if (consecutiveSuccess >= requiredSuccesses) {
          return; // 안정화됨
        }
      } else {
        consecutiveSuccess = 0;
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Failed to stabilize within allowed attempts');
  }
  
  // 결과 일관성 검증
  static async verifyConsistency<T>(
    operation: () => Promise<T>,
    options: {
      runs?: number;
      compareFn?: (a: T, b: T) => boolean;
    } = {}
  ): Promise<T> {
    const { runs = 5, compareFn = (a, b) => JSON.stringify(a) === JSON.stringify(b) } = options;
    
    const results: T[] = [];
    
    for (let i = 0; i < runs; i++) {
      results.push(await operation());
    }
    
    // 모든 결과가 일관성 있는지 확인
    const firstResult = results[0];
    const allConsistent = results.every(result => compareFn(result, firstResult));
    
    if (!allConsistent) {
      throw new Error(`Inconsistent results detected: ${JSON.stringify(results)}`);
    }
    
    return firstResult;
  }
  
  // 타이밍 독립적 테스트
  static async timingIndependent<T>(
    operation: () => Promise<T>,
    options: {
      variations?: number[];
      tolerance?: number;
    } = {}
  ): Promise<T> {
    const { variations = [0, 10, 50, 100], tolerance = 0.1 } = options;
    
    const results: T[] = [];
    
    for (const delay of variations) {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      results.push(await operation());
    }
    
    // 결과 일관성 검증
    const firstResult = results[0];
    const allSimilar = results.every(result => {
      // 숫자인 경우 tolerance 범위 내에서 검증
      if (typeof result === 'number' && typeof firstResult === 'number') {
        return Math.abs(result - firstResult) <= tolerance;
      }
      
      return JSON.stringify(result) === JSON.stringify(firstResult);
    });
    
    if (!allSimilar) {
      throw new Error(`Timing-dependent behavior detected: ${JSON.stringify(results)}`);
    }
    
    return firstResult;
  }
}

// 플래키 테스트 방지 사용 예시
describe('Flake-Proof Testing Examples', () => {
  
  test('should wait for UI to stabilize', async () => {
    const checkUIStability = async (): Promise<boolean> => {
      // UI 요소들이 로딩 중인지 확인
      const loadingElements = document.querySelectorAll('.loading');
      const pendingRequests = (window as any).pendingRequests || 0;
      
      return loadingElements.length === 0 && pendingRequests === 0;
    };
    
    await FlakeProofTesting.stabilize(checkUIStability, {
      attempts: 20,
      interval: 100,
      stabilityDuration: 300
    });
    
    // 이제 안정화된 상태에서 테스트 진행
    expect(document.querySelectorAll('.loading')).toHaveLength(0);
  });
  
  test('should have consistent results', async () => {
    const fetchUserData = async () => {
      // 네트워크 지연이나 다른 요인에 영향받을 수 있는 작업
      const response = await fetch('/api/user/1');
      return response.json();
    };
    
    const userData = await FlakeProofTesting.verifyConsistency(
      fetchUserData,
      { runs: 3 }
    );
    
    expect(userData).toHaveProperty('id', 1);
  });
});
```

---

*"비동기 테스트는 예측 가능해야 한다. 타이밍에 의존하는 테스트는 신뢰할 수 없는 테스트다."*