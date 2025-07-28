# 10-06. 성능 최적화 가이드

> "빠름은 기능이다. SuperClaude로 극한의 성능을 달성하자."

## 📋 목차
1. [성능 최적화 개요](#성능-최적화-개요)
2. [프론트엔드 성능 최적화](#프론트엔드-성능-최적화)
3. [백엔드 성능 최적화](#백엔드-성능-최적화)
4. [데이터베이스 최적화](#데이터베이스-최적화)
5. [인프라 성능 튜닝](#인프라-성능-튜닝)
6. [SuperClaude 활용법](#superclaude-활용법)

## 성능 최적화 개요

### 핵심 원칙
```yaml
# performance-principles.yml
performance_principles:
  measure_first: "측정 없는 최적화는 금물"
  user_centric: "사용자 경험 중심의 성능 지표"
  continuous: "지속적인 성능 모니터링 및 개선"
  holistic: "전체 시스템 관점의 최적화"
  cost_effective: "성능과 비용의 균형"
```

### SuperClaude 성능 명령어
```bash
# 성능 병목 분석
/analyze performance-bottlenecks --focus performance --think-hard

# 성능 최적화 설계
/design performance-optimization --persona-performance --wave-mode

# 성능 개선 구현
/improve performance --focus efficiency --loop

# 성능 테스트 자동화
/implement performance-testing --type automation --safe-mode
```

## 프론트엔드 성능 최적화

### 1. 번들 최적화
```typescript
// webpack.performance.config.js
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.tsx',
    vendor: ['react', 'react-dom', 'lodash']
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    publicPath: '/static/'
  },
  
  optimization: {
    // 코드 분할
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // 런타임 청크 분리
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
    
    // 미사용 코드 제거
    usedExports: true,
    sideEffects: false,
    
    // 압축 설정
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  },
  
  plugins: [
    // Gzip 압축
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Brotli 압축
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11
      },
      threshold: 8192,
      minRatio: 0.8,
      filename: '[path][base].br'
    }),
    
    // 번들 분석
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
    
    // 모듈 연결
    new webpack.optimize.ModuleConcatenationPlugin()
  ].filter(Boolean),
  
  resolve: {
    // 확장자 생략으로 번들 크기 감소
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    
    // 트리 쉐이킹을 위한 ES 모듈 우선
    mainFields: ['module', 'main']
  }
};
```

### 2. 이미지 최적화 시스템
```typescript
// image-optimizer.ts
export class ImageOptimizer {
  private sharp: Sharp;
  private cdn: CDNService;
  
  async optimizeImage(
    input: Buffer | string,
    options: ImageOptimizationOptions
  ): Promise<OptimizedImage> {
    const metadata = await this.sharp(input).metadata();
    const optimizedVersions: ImageVersion[] = [];
    
    // 1. WebP 변환
    const webpVersion = await this.generateWebP(input, options);
    optimizedVersions.push(webpVersion);
    
    // 2. AVIF 변환 (최신 브라우저용)
    const avifVersion = await this.generateAVIF(input, options);
    optimizedVersions.push(avifVersion);
    
    // 3. 반응형 이미지 생성
    const responsiveVersions = await this.generateResponsiveImages(input, options);
    optimizedVersions.push(...responsiveVersions);
    
    // 4. CDN 업로드
    const cdnUrls = await this.uploadToCDN(optimizedVersions);
    
    return {
      original: metadata,
      versions: optimizedVersions,
      cdnUrls,
      pictureElement: this.generatePictureElement(cdnUrls, options)
    };
  }
  
  private async generateWebP(
    input: Buffer | string,
    options: ImageOptimizationOptions
  ): Promise<ImageVersion> {
    const buffer = await this.sharp(input)
      .webp({
        quality: options.quality || 80,
        effort: 6 // 최대 압축 노력
      })
      .toBuffer();
    
    return {
      format: 'webp',
      buffer,
      size: buffer.length,
      quality: options.quality || 80
    };
  }
  
  private async generateAVIF(
    input: Buffer | string,
    options: ImageOptimizationOptions
  ): Promise<ImageVersion> {
    const buffer = await this.sharp(input)
      .avif({
        quality: options.quality || 80,
        effort: 9 // 최대 압축 노력
      })
      .toBuffer();
    
    return {
      format: 'avif',
      buffer,
      size: buffer.length,
      quality: options.quality || 80
    };
  }
  
  private async generateResponsiveImages(
    input: Buffer | string,
    options: ImageOptimizationOptions
  ): Promise<ImageVersion[]> {
    const breakpoints = options.breakpoints || [320, 640, 960, 1280, 1920];
    const versions: ImageVersion[] = [];
    
    for (const width of breakpoints) {
      const buffer = await this.sharp(input)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: options.quality || 80 })
        .toBuffer();
      
      versions.push({
        format: 'webp',
        buffer,
        size: buffer.length,
        width,
        descriptor: `${width}w`
      });
    }
    
    return versions;
  }
  
  private generatePictureElement(
    cdnUrls: CDNUrls,
    options: ImageOptimizationOptions
  ): string {
    return `
      <picture>
        <source 
          srcset="${cdnUrls.avif.sizes.map(s => `${s.url} ${s.descriptor}`).join(', ')}"
          type="image/avif"
        >
        <source 
          srcset="${cdnUrls.webp.sizes.map(s => `${s.url} ${s.descriptor}`).join(', ')}"
          type="image/webp"
        >
        <img 
          src="${cdnUrls.fallback}"
          alt="${options.alt || ''}"
          loading="lazy"
          decoding="async"
          width="${options.width}"
          height="${options.height}"
        >
      </picture>
    `;
  }
}
```

### 3. 렌더링 최적화
```typescript
// rendering-optimizer.tsx
import React, { Suspense, lazy, memo, useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

// 코드 분할 및 지연 로딩
const HeavyComponent = lazy(() => 
  import('./HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);

// 메모화된 컴포넌트
const OptimizedListItem = memo<ListItemProps>(({ item, onSelect }) => {
  // 값비싼 계산 메모화
  const processedData = useMemo(() => {
    return expensiveDataProcessing(item);
  }, [item.id, item.lastModified]);
  
  // 콜백 메모화
  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);
  
  return (
    <div className="list-item" onClick={handleClick}>
      <h3>{processedData.title}</h3>
      <p>{processedData.description}</p>
    </div>
  );
});

// 가상화된 리스트
export const VirtualizedList: React.FC<VirtualizedListProps> = ({ 
  items, 
  onItemSelect 
}) => {
  const ItemRenderer = useCallback(({ index }: { index: number }) => {
    const item = items[index];
    return (
      <OptimizedListItem 
        key={item.id}
        item={item} 
        onSelect={onItemSelect}
      />
    );
  }, [items, onItemSelect]);
  
  return (
    <Virtuoso
      style={{ height: '400px' }}
      totalCount={items.length}
      itemContent={ItemRenderer}
      overscan={10} // 성능을 위한 오버스캔
    />
  );
};

// 점진적 하이드레이션
export const ProgressiveHydration: React.FC<ProgressiveHydrationProps> = ({ 
  children,
  priority = 'low'
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // 우선순위에 따른 하이드레이션 지연
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 300;
    
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [priority]);
  
  if (!isHydrated) {
    // 서버 사이드 렌더된 HTML 유지
    return <div suppressHydrationWarning>{children}</div>;
  }
  
  return <>{children}</>;
};

// Web Worker를 활용한 무거운 작업 처리
class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeWorkers = 0;
  
  constructor(private maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker('/workers/data-processor.js');
      this.workers.push(worker);
    }
  }
  
  async processData<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task = {
        id: Math.random().toString(36),
        data,
        resolve,
        reject
      };
      
      if (this.activeWorkers < this.maxWorkers) {
        this.executeTask(task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }
  
  private executeTask(task: Task): void {
    const worker = this.workers[this.activeWorkers];
    this.activeWorkers++;
    
    const timeoutId = setTimeout(() => {
      worker.terminate();
      task.reject(new Error('Worker timeout'));
      this.activeWorkers--;
      this.processNextTask();
    }, 30000); // 30초 타임아웃
    
    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      task.resolve(event.data);
      this.activeWorkers--;
      this.processNextTask();
    };
    
    worker.onerror = (error) => {
      clearTimeout(timeoutId);
      task.reject(error);
      this.activeWorkers--;
      this.processNextTask();
    };
    
    worker.postMessage(task.data);
  }
  
  private processNextTask(): void {
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift()!;
      this.executeTask(nextTask);
    }
  }
}
```

## 백엔드 성능 최적화

### 1. 캐싱 전략
```typescript
// caching-strategy.ts
export class CachingStrategy {
  private redisClient: RedisClient;
  private memoryCache: NodeCache;
  
  constructor() {
    this.redisClient = new RedisClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // 연결 풀 설정
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      // 성능 최적화
      enableReadyCheck: false,
      keepAlive: true
    });
    
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5분 기본 TTL
      checkperiod: 120, // 2분마다 만료 체크
      useClones: false // 성능을 위해 복제 비활성화
    });
  }
  
  // 다층 캐싱 전략
  async get<T>(key: string): Promise<T | null> {
    // 1. L1 캐시 (메모리) 확인
    let value = this.memoryCache.get<T>(key);
    if (value !== undefined) {
      return value;
    }
    
    // 2. L2 캐시 (Redis) 확인
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      value = JSON.parse(redisValue);
      // L1 캐시에 저장 (짧은 TTL)
      this.memoryCache.set(key, value, 60);
      return value;
    }
    
    return null;
  }
  
  async set<T>(
    key: string, 
    value: T, 
    ttl: number = 3600
  ): Promise<void> {
    // L1 캐시에 저장
    this.memoryCache.set(key, value, Math.min(ttl, 300));
    
    // L2 캐시에 저장
    await this.redisClient.setex(key, ttl, JSON.stringify(value));
  }
  
  // 캐시 워밍
  async warmCache(warmingStrategies: WarmingStrategy[]): Promise<void> {
    const promises = warmingStrategies.map(async (strategy) => {
      switch (strategy.type) {
        case 'popular_queries':
          await this.warmPopularQueries(strategy.queries);
          break;
        case 'user_data':
          await this.warmUserData(strategy.userIds);
          break;
        case 'static_content':
          await this.warmStaticContent(strategy.paths);
          break;
      }
    });
    
    await Promise.all(promises);
  }
  
  // 지능형 캐시 무효화
  async invalidatePattern(pattern: string): Promise<void> {
    // Redis에서 패턴 매칭으로 무효화
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
    
    // 메모리 캐시에서도 무효화
    const memoryKeys = this.memoryCache.keys();
    const matchingKeys = memoryKeys.filter(key => 
      this.matchesPattern(key, pattern)
    );
    matchingKeys.forEach(key => this.memoryCache.del(key));
  }
  
  // 캐시 히트율 모니터링
  getStats(): CacheStats {
    const redisInfo = this.redisClient.info('stats');
    const memoryStats = this.memoryCache.getStats();
    
    return {
      redis: {
        hits: redisInfo.keyspace_hits,
        misses: redisInfo.keyspace_misses,
        hitRate: redisInfo.keyspace_hits / (redisInfo.keyspace_hits + redisInfo.keyspace_misses)
      },
      memory: {
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses)
      }
    };
  }
}
```

### 2. 데이터베이스 연결 풀 최적화
```typescript
// database-pool-optimizer.ts
export class DatabasePoolOptimizer {
  private pools: Map<string, Pool> = new Map();
  private metrics: PoolMetrics = new PoolMetrics();
  
  createOptimizedPool(config: DatabaseConfig): Pool {
    const poolConfig: PoolConfig = {
      // 연결 수 최적화
      min: Math.max(2, Math.floor(config.expectedConcurrency * 0.1)),
      max: Math.min(50, config.expectedConcurrency * 2),
      
      // 타임아웃 설정
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 10000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 300000, // 5분
      
      // 연결 검증
      testOnBorrow: true,
      validationQuery: 'SELECT 1',
      
      // 이벤트 핸들러
      create: async () => {
        const connection = await this.createConnection(config);
        this.metrics.recordConnectionCreated();
        return connection;
      },
      
      destroy: async (connection) => {
        await connection.end();
        this.metrics.recordConnectionDestroyed();
      },
      
      validate: async (connection) => {
        try {
          await connection.query('SELECT 1');
          return true;
        } catch {
          return false;
        }
      }
    };
    
    const pool = createPool(poolConfig);
    this.pools.set(config.name, pool);
    
    // 모니터링 설정
    this.setupPoolMonitoring(config.name, pool);
    
    return pool;
  }
  
  // 동적 풀 크기 조정
  async optimizePoolSize(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName);
    if (!pool) return;
    
    const metrics = this.metrics.getPoolMetrics(poolName);
    const current = {
      active: pool.size - pool.available,
      total: pool.size,
      pending: pool.pending
    };
    
    // 스케일 업 조건
    if (metrics.avgWaitTime > 100 && current.pending > 0) {
      const newMax = Math.min(pool.max * 1.2, 100);
      await this.adjustPoolSize(poolName, { max: newMax });
    }
    
    // 스케일 다운 조건
    if (metrics.utilization < 0.3 && current.total > pool.min) {
      const newMax = Math.max(pool.max * 0.8, pool.min);
      await this.adjustPoolSize(poolName, { max: newMax });
    }
  }
  
  // 읽기 전용 연결 분리
  async executeReadQuery<T>(
    query: string, 
    params: any[] = []
  ): Promise<T> {
    const readPool = this.pools.get('read-replica');
    if (!readPool) {
      throw new Error('Read replica pool not configured');
    }
    
    return await readPool.query(query, params);
  }
  
  // 트랜잭션 최적화
  async executeTransaction<T>(
    operations: TransactionOperation[]
  ): Promise<T> {
    const writePool = this.pools.get('primary');
    if (!writePool) {
      throw new Error('Primary pool not configured');
    }
    
    const connection = await writePool.acquire();
    
    try {
      await connection.query('BEGIN');
      
      let result: T | undefined;
      for (const operation of operations) {
        result = await operation.execute(connection);
        
        // 중간 커밋 (긴 트랜잭션 최적화)
        if (operation.intermittentCommit) {
          await connection.query('COMMIT');
          await connection.query('BEGIN');
        }
      }
      
      await connection.query('COMMIT');
      return result as T;
      
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      writePool.release(connection);
    }
  }
  
  private setupPoolMonitoring(poolName: string, pool: Pool): void {
    setInterval(() => {
      const stats = {
        size: pool.size,
        available: pool.available,
        borrowed: pool.size - pool.available,
        pending: pool.pending
      };
      
      this.metrics.recordPoolStats(poolName, stats);
    }, 10000); // 10초마다 측정
  }
}
```

### 3. API 응답 최적화
```typescript
// api-response-optimizer.ts
export class APIResponseOptimizer {
  private compressionMiddleware: CompressionMiddleware;
  private serializationCache: Map<string, Buffer> = new Map();
  
  constructor() {
    this.compressionMiddleware = compression({
      level: 6, // 압축 레벨 (1-9, 6이 속도와 압축률의 균형)
      threshold: 1024, // 1KB 이상만 압축
      filter: this.shouldCompress
    });
  }
  
  // 응답 압축 필터
  private shouldCompress(req: Request, res: Response): boolean {
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // 이미 압축된 콘텐츠는 제외
    const contentType = res.getHeader('content-type') as string;
    if (contentType?.includes('image/') || 
        contentType?.includes('video/') ||
        contentType?.includes('application/zip')) {
      return false;
    }
    
    return compression.filter(req, res);
  }
  
  // 직렬화 최적화
  optimizeJSONSerialization(): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      
      res.json = function(obj: any) {
        // 캐시 키 생성
        const cacheKey = this.generateCacheKey(obj);
        
        // 캐시된 직렬화 결과 확인
        const cached = this.serializationCache.get(cacheKey);
        if (cached) {
          this.setHeader('Content-Type', 'application/json');
          this.setHeader('Content-Length', cached.length.toString());
          return this.end(cached);
        }
        
        // 최적화된 직렬화
        const jsonString = this.optimizedStringify(obj);
        const buffer = Buffer.from(jsonString, 'utf8');
        
        // 캐시 저장 (작은 응답만)
        if (buffer.length < 10240) { // 10KB 미만
          this.serializationCache.set(cacheKey, buffer);
          
          // 캐시 크기 제한
          if (this.serializationCache.size > 1000) {
            const firstKey = this.serializationCache.keys().next().value;
            this.serializationCache.delete(firstKey);
          }
        }
        
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Content-Length', buffer.length.toString());
        return this.end(buffer);
      }.bind(res);
      
      next();
    };
  }
  
  private optimizedStringify(obj: any): string {
    // 순환 참조 제거
    const seen = new WeakSet();
    
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      // undefined 값 제거
      if (value === undefined) {
        return undefined;
      }
      
      // null을 명시적으로 유지
      if (value === null) {
        return null;
      }
      
      // 빈 객체/배열 최적화
      if (Array.isArray(value) && value.length === 0) {
        return [];
      }
      
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return {};
      }
      
      return value;
    });
  }
  
  // 응답 스트리밍
  streamLargeResponse<T>(
    data: T[], 
    res: Response,
    options: StreamOptions = {}
  ): void {
    const { 
      batchSize = 100,
      delimiter = '\n',
      contentType = 'application/json'
    } = options;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const stream = new Readable({
      objectMode: true,
      
      read() {
        // 스트림 압력 제어
      }
    });
    
    // 배치 단위로 데이터 전송
    let index = 0;
    const sendBatch = () => {
      const batch = data.slice(index, index + batchSize);
      
      if (batch.length === 0) {
        stream.push(null); // 스트림 종료
        return;
      }
      
      const jsonString = JSON.stringify(batch);
      stream.push(jsonString + delimiter);
      
      index += batchSize;
      
      // 비동기적으로 다음 배치 처리
      setImmediate(sendBatch);
    };
    
    stream.pipe(res);
    sendBatch();
  }
  
  // 조건부 응답 (ETag 활용)
  setupConditionalResponses(): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;
      
      res.send = function(body: any) {
        if (typeof body === 'string' || Buffer.isBuffer(body)) {
          // ETag 생성
          const etag = this.generateETag(body);
          this.setHeader('ETag', etag);
          
          // If-None-Match 헤더 확인
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === etag) {
            this.status(304).end();
            return this;
          }
          
          // Last-Modified 처리
          const lastModified = this.getHeader('Last-Modified');
          if (lastModified) {
            const ifModifiedSince = req.headers['if-modified-since'];
            if (ifModifiedSince === lastModified) {
              this.status(304).end();
              return this;
            }
          }
        }
        
        return originalSend.call(this, body);
      }.bind(res);
      
      next();
    };
  }
}
```

## 데이터베이스 최적화

### 1. 쿼리 최적화 분석기
```typescript
// query-optimizer.ts
export class QueryOptimizer {
  private database: Database;
  private queryCache: Map<string, QueryPlan> = new Map();
  
  async analyzeQuery(sql: string, params: any[] = []): Promise<QueryAnalysis> {
    // 1. 실행 계획 분석
    const executionPlan = await this.getExecutionPlan(sql, params);
    
    // 2. 인덱스 사용 분석
    const indexAnalysis = await this.analyzeIndexUsage(executionPlan);
    
    // 3. 비용 분석
    const costAnalysis = this.analyzeCost(executionPlan);
    
    // 4. 최적화 제안 생성
    const recommendations = await this.generateRecommendations(
      sql, 
      executionPlan, 
      indexAnalysis
    );
    
    return {
      originalQuery: sql,
      executionPlan,
      indexAnalysis,
      costAnalysis,
      recommendations,
      estimatedPerformanceImprovement: this.calculateImprovement(recommendations)
    };
  }
  
  private async getExecutionPlan(sql: string, params: any[]): Promise<ExecutionPlan> {
    // PostgreSQL EXPLAIN ANALYZE
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
    const result = await this.database.query(explainQuery, params);
    
    return this.parseExecutionPlan(result[0]['QUERY PLAN'][0]);
  }
  
  private async analyzeIndexUsage(plan: ExecutionPlan): Promise<IndexAnalysis> {
    const usedIndexes: IndexInfo[] = [];
    const suggestedIndexes: IndexSuggestion[] = [];
    
    // 실행 계획에서 인덱스 사용 추출
    this.extractIndexUsage(plan, usedIndexes);
    
    // Seq Scan 감지 및 인덱스 제안
    this.detectSequentialScans(plan, suggestedIndexes);
    
    return {
      usedIndexes,
      suggestedIndexes,
      indexHitRatio: await this.calculateIndexHitRatio(),
      inefficientIndexes: await this.findInefficientIndexes()
    };
  }
  
  private async generateRecommendations(
    sql: string,
    plan: ExecutionPlan,
    indexAnalysis: IndexAnalysis
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    // 1. 인덱스 추가 제안
    for (const suggestion of indexAnalysis.suggestedIndexes) {
      recommendations.push({
        type: 'add_index',
        priority: suggestion.priority,
        description: `Add index on ${suggestion.columns.join(', ')}`,
        impact: 'high',
        sql: `CREATE INDEX idx_${suggestion.tableName}_${suggestion.columns.join('_')} ON ${suggestion.tableName} (${suggestion.columns.join(', ')});`,
        estimatedImprovement: suggestion.estimatedImprovement
      });
    }
    
    // 2. 쿼리 재작성 제안
    const rewriteSuggestions = await this.analyzeQueryRewrite(sql, plan);
    recommendations.push(...rewriteSuggestions);
    
    // 3. 통계 업데이트 제안
    if (this.needsStatisticsUpdate(plan)) {
      recommendations.push({
        type: 'update_statistics',
        priority: 'medium',
        description: 'Update table statistics for better query planning',
        impact: 'medium',
        sql: 'ANALYZE;'
      });
    }
    
    return recommendations.sort((a, b) => 
      this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    );
  }
  
  // 자동 인덱스 생성
  async createOptimalIndexes(
    tableName: string, 
    queryPatterns: QueryPattern[]
  ): Promise<IndexCreationResult[]> {
    const results: IndexCreationResult[] = [];
    
    // 쿼리 패턴 분석
    const indexCandidates = this.analyzeQueryPatterns(queryPatterns);
    
    for (const candidate of indexCandidates) {
      try {
        // 중복 인덱스 확인
        const existingIndexes = await this.getExistingIndexes(tableName);
        if (this.isDuplicateIndex(candidate, existingIndexes)) {
          continue;
        }
        
        // 인덱스 생성
        const createSQL = this.generateIndexSQL(candidate);
        const startTime = Date.now();
        
        await this.database.query(createSQL);
        
        const creationTime = Date.now() - startTime;
        
        // 성능 테스트
        const performanceImprovement = await this.testIndexPerformance(
          candidate, 
          queryPatterns
        );
        
        results.push({
          indexName: candidate.name,
          tableName,
          columns: candidate.columns,
          creationTime,
          performanceImprovement,
          diskUsage: await this.getIndexSize(candidate.name)
        });
        
      } catch (error) {
        results.push({
          indexName: candidate.name,
          tableName,
          columns: candidate.columns,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // 쿼리 캐시 최적화
  optimizeQueryCache(): void {
    // 자주 사용되는 쿼리 패턴 식별
    const frequentPatterns = this.identifyFrequentPatterns();
    
    // 캐시 히트율이 낮은 쿼리 제거
    const lowHitRateQueries = this.findLowHitRateQueries();
    lowHitRateQueries.forEach(query => {
      this.queryCache.delete(query);
    });
    
    // 자주 사용되는 쿼리 사전 컴파일
    frequentPatterns.forEach(async (pattern) => {
      const compiledPlan = await this.compileQuery(pattern.sql);
      this.queryCache.set(pattern.sql, compiledPlan);
    });
  }
}
```

### 2. 파티셔닝 자동화
```typescript
// table-partitioning.ts
export class TablePartitioning {
  private database: Database;
  
  async analyzePartitioningOpportunities(
    tableName: string
  ): Promise<PartitioningAnalysis> {
    // 1. 테이블 크기 및 성장 패턴 분석
    const tableStats = await this.getTableStatistics(tableName);
    
    // 2. 쿼리 패턴 분석
    const queryPatterns = await this.analyzeQueryPatterns(tableName);
    
    // 3. 파티셔닝 전략 추천
    const strategies = this.recommendPartitioningStrategies(
      tableStats,
      queryPatterns
    );
    
    return {
      tableName,
      currentSize: tableStats.size,
      growthRate: tableStats.growthRate,
      queryPatterns,
      recommendedStrategies: strategies,
      estimatedBenefit: this.calculatePartitioningBenefit(strategies)
    };
  }
  
  private recommendPartitioningStrategies(
    stats: TableStatistics,
    patterns: QueryPattern[]
  ): PartitioningStrategy[] {
    const strategies: PartitioningStrategy[] = [];
    
    // 시간 기반 파티셔닝 검토
    const dateColumns = this.findDateColumns(stats.columns);
    if (dateColumns.length > 0) {
      const dateStrategy = this.analyzeTimeBasedPartitioning(
        dateColumns,
        patterns,
        stats
      );
      if (dateStrategy.viability > 0.7) {
        strategies.push(dateStrategy);
      }
    }
    
    // 범위 기반 파티셔닝 검토
    const numericColumns = this.findNumericColumns(stats.columns);
    for (const column of numericColumns) {
      const rangeStrategy = this.analyzeRangePartitioning(
        column,
        patterns,
        stats
      );
      if (rangeStrategy.viability > 0.6) {
        strategies.push(rangeStrategy);
      }
    }
    
    // 해시 기반 파티셔닝 검토
    const hashStrategy = this.analyzeHashPartitioning(patterns, stats);
    if (hashStrategy.viability > 0.5) {
      strategies.push(hashStrategy);
    }
    
    return strategies.sort((a, b) => b.viability - a.viability);
  }
  
  async implementTimeBasedPartitioning(
    tableName: string,
    dateColumn: string,
    interval: 'monthly' | 'weekly' | 'daily'
  ): Promise<PartitioningResult> {
    const partitions: PartitionInfo[] = [];
    
    try {
      // 1. 기존 데이터 분석
      const dataRange = await this.getDateRange(tableName, dateColumn);
      
      // 2. 파티션 계획 생성
      const partitionPlan = this.generateTimePartitionPlan(
        dataRange,
        interval
      );
      
      // 3. 파티션 테이블 생성
      await this.createPartitionedTable(tableName, dateColumn, partitionPlan);
      
      // 4. 데이터 마이그레이션
      for (const partition of partitionPlan) {
        await this.migrateDataToPartition(tableName, partition);
        partitions.push({
          name: partition.name,
          range: partition.range,
          rowCount: partition.estimatedRows,
          size: partition.estimatedSize
        });
      }
      
      // 5. 자동 파티션 관리 설정
      await this.setupAutomaticPartitionManagement(tableName, interval);
      
      return {
        success: true,
        partitions,
        migrationTime: Date.now() - partitionPlan.startTime,
        performanceImprovement: await this.measurePartitioningBenefit(tableName)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rollbackCompleted: await this.rollbackPartitioning(tableName)
      };
    }
  }
  
  // 자동 파티션 유지보수
  async maintainPartitions(tableName: string): Promise<MaintenanceResult> {
    const maintenanceActions: MaintenanceAction[] = [];
    
    // 1. 새 파티션 생성 필요성 확인
    const futurePartitions = await this.checkFuturePartitionNeeds(tableName);
    for (const partition of futurePartitions) {
      await this.createPartition(tableName, partition);
      maintenanceActions.push({
        type: 'create',
        partition: partition.name,
        reason: 'future_data_preparation'
      });
    }
    
    // 2. 오래된 파티션 정리
    const oldPartitions = await this.identifyOldPartitions(tableName);
    for (const partition of oldPartitions) {
      if (partition.retentionExpired) {
        await this.dropPartition(tableName, partition.name);
        maintenanceActions.push({
          type: 'drop',
          partition: partition.name,
          reason: 'retention_policy'
        });
      } else if (partition.shouldArchive) {
        await this.archivePartition(tableName, partition.name);
        maintenanceActions.push({
          type: 'archive',
          partition: partition.name,
          reason: 'data_archival'
        });
      }
    }
    
    // 3. 파티션 통계 업데이트
    await this.updatePartitionStatistics(tableName);
    
    return {
      actionsPerformed: maintenanceActions,
      totalPartitions: await this.getPartitionCount(tableName),
      diskSpaceFreed: this.calculateFreedSpace(maintenanceActions)
    };
  }
}
```

## 인프라 성능 튜닝

### 1. Kubernetes 리소스 최적화
```typescript
// k8s-resource-optimizer.ts
export class KubernetesResourceOptimizer {
  private k8sApi: KubernetesAPI;
  private metricsClient: MetricsClient;
  
  async optimizeWorkloadResources(
    namespace: string,
    workload: string
  ): Promise<OptimizationResult> {
    // 1. 현재 리소스 사용량 분석
    const usage = await this.analyzeResourceUsage(namespace, workload);
    
    // 2. 권장 리소스 계산
    const recommendations = this.calculateOptimalResources(usage);
    
    // 3. 자동 스케일링 설정 최적화
    const hpaConfig = await this.optimizeHPA(namespace, workload, usage);
    
    // 4. VPA 설정 분석
    const vpaConfig = await this.analyzeVPA(namespace, workload, usage);
    
    return {
      currentResources: usage.current,
      recommendedResources: recommendations,
      potentialSavings: this.calculateSavings(usage.current, recommendations),
      hpaOptimization: hpaConfig,
      vpaOptimization: vpaConfig
    };
  }
  
  private async analyzeResourceUsage(
    namespace: string,
    workload: string
  ): Promise<ResourceUsageAnalysis> {
    const timeRange = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일
      end: new Date()
    };
    
    // CPU 사용량 패턴 분석
    const cpuMetrics = await this.metricsClient.getCPUUsage(
      namespace,
      workload,
      timeRange
    );
    
    // 메모리 사용량 패턴 분석
    const memoryMetrics = await this.metricsClient.getMemoryUsage(
      namespace,
      workload,
      timeRange
    );
    
    // 네트워크 I/O 분석
    const networkMetrics = await this.metricsClient.getNetworkUsage(
      namespace,
      workload,
      timeRange
    );
    
    return {
      cpu: {
        average: this.calculateAverage(cpuMetrics),
        p95: this.calculatePercentile(cpuMetrics, 0.95),
        p99: this.calculatePercentile(cpuMetrics, 0.99),
        pattern: this.analyzePattern(cpuMetrics)
      },
      memory: {
        average: this.calculateAverage(memoryMetrics),
        p95: this.calculatePercentile(memoryMetrics, 0.95),
        p99: this.calculatePercentile(memoryMetrics, 0.99),
        pattern: this.analyzePattern(memoryMetrics)
      },
      network: {
        ingress: this.analyzeNetworkTraffic(networkMetrics.ingress),
        egress: this.analyzeNetworkTraffic(networkMetrics.egress)
      },
      current: await this.getCurrentResourceLimits(namespace, workload)
    };
  }
  
  private calculateOptimalResources(
    usage: ResourceUsageAnalysis
  ): ResourceRecommendations {
    // CPU 권장 사항
    const cpuRequest = Math.max(
      usage.cpu.average * 1.2, // 20% 버퍼
      100 // 최소 100m
    );
    
    const cpuLimit = Math.max(
      usage.cpu.p95 * 1.3, // 30% 버퍼
      cpuRequest * 2 // 최소 request의 2배
    );
    
    // 메모리 권장 사항
    const memoryRequest = Math.max(
      usage.memory.average * 1.3, // 30% 버퍼
      128 * 1024 * 1024 // 최소 128MB
    );
    
    const memoryLimit = Math.max(
      usage.memory.p95 * 1.5, // 50% 버퍼
      memoryRequest * 1.5 // 최소 request의 1.5배
    );
    
    return {
      requests: {
        cpu: `${Math.round(cpuRequest)}m`,
        memory: `${Math.round(memoryRequest / 1024 / 1024)}Mi`
      },
      limits: {
        cpu: `${Math.round(cpuLimit)}m`,
        memory: `${Math.round(memoryLimit / 1024 / 1024)}Mi`
      },
      confidence: this.calculateConfidence(usage),
      reasoning: this.generateReasoning(usage)
    };
  }
  
  async implementResourceOptimization(
    namespace: string,
    workload: string,
    recommendations: ResourceRecommendations
  ): Promise<void> {
    // 1. 백업 생성
    const backup = await this.backupWorkload(namespace, workload);
    
    try {
      // 2. 점진적 롤아웃
      await this.performRollingUpdate(namespace, workload, recommendations);
      
      // 3. 성능 모니터링
      await this.monitorPerformanceAfterUpdate(namespace, workload);
      
      // 4. 자동 롤백 설정
      await this.setupAutoRollback(namespace, workload, backup);
      
    } catch (error) {
      // 롤백 수행
      await this.rollbackWorkload(namespace, workload, backup);
      throw error;
    }
  }
  
  // 클러스터 전체 최적화
  async optimizeCluster(): Promise<ClusterOptimizationResult> {
    const optimizations: ClusterOptimization[] = [];
    
    // 1. 노드 리소스 효율성 분석
    const nodeOptimization = await this.optimizeNodeResources();
    optimizations.push(nodeOptimization);
    
    // 2. 네트워크 정책 최적화
    const networkOptimization = await this.optimizeNetworkPolicies();
    optimizations.push(networkOptimization);
    
    // 3. 스토리지 최적화
    const storageOptimization = await this.optimizeStorageClasses();
    optimizations.push(storageOptimization);
    
    // 4. 스케줄링 최적화
    const schedulingOptimization = await this.optimizeScheduling();
    optimizations.push(schedulingOptimization);
    
    return {
      optimizations,
      totalSavings: optimizations.reduce((sum, opt) => sum + opt.savings, 0),
      performanceImprovement: this.calculateOverallImprovement(optimizations)
    };
  }
}
```

## SuperClaude 활용법

### 1. 성능 분석 및 최적화
```bash
# 성능 병목 지점 분석
/analyze performance-bottlenecks --persona-performance --think-hard
- 프론트엔드 성능 측정
- 백엔드 응답 시간 분석
- 데이터베이스 쿼리 최적화
- 인프라 리소스 사용률

# 성능 최적화 구현
/improve performance --focus efficiency --loop --iterations 5
- 코드 레벨 최적화
- 캐싱 전략 개선
- 데이터베이스 튜닝
- 인프라 스케일링
```

### 2. 캐싱 전략 구현
```bash
# 캐싱 아키텍처 설계
/design caching-strategy --persona-performance --wave-mode
- 다층 캐싱 구조
- 캐시 무효화 전략
- 성능 지표 정의
- 모니터링 시스템

# 캐시 시스템 구현
/implement caching-system --type performance --magic
- Redis 클러스터 설정
- 애플리케이션 캐시 레이어
- CDN 최적화
- 브라우저 캐싱
```

### 3. 데이터베이스 최적화
```bash
# 데이터베이스 성능 분석
/analyze database-performance --focus efficiency --seq
- 쿼리 실행 계획 분석
- 인덱스 사용률 검토
- 파티셔닝 기회 식별
- 연결 풀 최적화

# 데이터베이스 튜닝
/improve database --focus performance --validate
- 쿼리 최적화
- 인덱스 전략 개선
- 파티셔닝 구현
- 연결 관리 최적화
```

### 4. 프론트엔드 최적화
```bash
# 웹 성능 최적화
/improve web-performance --persona-frontend --loop
- 번들 크기 최적화
- 이미지 최적화
- 레이지 로딩 구현
- 렌더링 성능 개선

# Core Web Vitals 개선
/optimize core-web-vitals --focus ux --magic
- LCP 최적화
- FID 개선
- CLS 최소화
- 사용자 경험 향상
```

## 마무리

성능 최적화는 사용자 경험과 직결되는 핵심 요소입니다. SuperClaude의 Performance 페르소나와 체계적인 분석 능력을 활용하여 모든 계층에서 최적의 성능을 달성하고, 지속적으로 모니터링하며 개선하는 시스템을 구축하세요.

10_Deployment_Scaling 섹션의 모든 가이드를 완료했습니다. 다음 섹션에서는 Quick Wins에 대해 알아보겠습니다.