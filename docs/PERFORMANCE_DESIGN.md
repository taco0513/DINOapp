# DINO Performance Optimization Design

## ⚡ Performance Overview

### Performance Goals

- **Page Load Time**: < 3 seconds on 3G networks
- **API Response Time**: < 200ms for 95th percentile
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Database Queries**: < 50ms for common operations
- **Bundle Size**: < 300KB initial JavaScript load

### Performance Metrics Framework

```typescript
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift

  // Loading Performance
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  tti: number; // Time to Interactive

  // Runtime Performance
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;

  // Business Metrics
  bounceRate: number;
  taskCompletionRate: number;
}
```

## 🚀 Frontend Performance

### Bundle Optimization

```typescript
// Next.js configuration for optimal bundling
const nextConfig = {
  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle splitting strategy
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };

    // Tree shaking optimization
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'date-fns': 'date-fns/esm',
      };
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};
```

### Code Splitting Strategy

```typescript
// Route-based code splitting
const SchengenCalculator = dynamic(
  () => import('@/components/features/schengen/SchengenCalculator'),
  {
    loading: () => <SchengenCalculatorSkeleton />,
    ssr: false, // Client-side only for heavy calculations
  }
)

const TripExportModal = dynamic(
  () => import('@/components/features/trips/TripExportModal'),
  {
    loading: () => <ModalSkeleton />,
    ssr: false,
  }
)

// Component-level lazy loading
const LazyChart = lazy(() =>
  import('recharts').then(module => ({ default: module.LineChart }))
)

// Feature flag based loading
const AdvancedFeatures = dynamic(
  () => import('@/components/features/advanced/AdvancedFeatures'),
  {
    loading: () => null,
    ssr: false,
  }
)
```

### React Performance Optimization

```typescript
// Memoization strategy
const TripCard = memo(({ trip, onEdit, onDelete }: TripCardProps) => {
  const schengenDays = useMemo(() =>
    calculateSchengenDays(trip), [trip.entryDate, trip.exitDate, trip.country]
  )

  const handleEdit = useCallback(() => {
    onEdit?.(trip)
  }, [onEdit, trip])

  const handleDelete = useCallback(() => {
    onDelete?.(trip)
  }, [onDelete, trip])

  return (
    <Card>
      <TripDetails trip={trip} schengenDays={schengenDays} />
      <TripActions onEdit={handleEdit} onDelete={handleDelete} />
    </Card>
  )
})

// Virtual scrolling for large lists
const VirtualizedTripList = ({ trips }: { trips: Trip[] }) => {
  const rowRenderer = useCallback(
    ({ index, key, style }) => (
      <div key={key} style={style}>
        <TripCard trip={trips[index]} />
      </div>
    ),
    [trips]
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={trips.length}
          rowHeight={120}
          rowRenderer={rowRenderer}
          overscanRowCount={5}
        />
      )}
    </AutoSizer>
  )
}
```

### Image Optimization

```typescript
// Optimized image component
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false
}: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    priority={priority}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    quality={85}
  />
)

// Progressive image loading
const ProgressiveImage = ({ src, placeholder, alt }: ProgressiveImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
    }
  }, [src])

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
```

## 🎯 Backend Performance

### API Response Optimization

```typescript
// Response compression
import compression from 'compression';

export const apiOptimization = {
  // Compression middleware
  compression: compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }),

  // Response caching
  cache: {
    trips: { ttl: 300, staleWhileRevalidate: 600 }, // 5 min TTL, 10 min SWR
    stats: { ttl: 600, staleWhileRevalidate: 1200 }, // 10 min TTL, 20 min SWR
    schengen: { ttl: 60, staleWhileRevalidate: 120 }, // 1 min TTL, 2 min SWR
  },
};

// Parallel request processing
export const getTripsWithStats = async (userId: string) => {
  const [trips, stats, schengenStatus] = await Promise.all([
    getUserTrips(userId),
    getUserStats(userId),
    getSchengenStatus(userId),
  ]);

  return { trips, stats, schengenStatus };
};
```

### Database Query Optimization

```typescript
// Optimized trip queries with includes
export const getUserTripsOptimized = async (
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    includeStats?: boolean;
    dateRange?: { start: Date; end: Date };
  } = {}
) => {
  const { limit = 20, offset = 0, includeStats = false, dateRange } = options;

  // Use database-level pagination
  const trips = await prisma.countryVisit.findMany({
    where: {
      userId,
      ...(dateRange && {
        entryDate: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    },
    orderBy: { entryDate: 'desc' },
    take: limit,
    skip: offset,
    // Only include what we need
    select: includeStats
      ? {
          id: true,
          country: true,
          entryDate: true,
          exitDate: true,
          visaType: true,
          maxDays: true,
          notes: true,
        }
      : {
          id: true,
          country: true,
          entryDate: true,
          exitDate: true,
          visaType: true,
        },
  });

  return trips;
};

// Batch operations for better performance
export const createMultipleTrips = async (
  userId: string,
  tripsData: TripInput[]
) => {
  // Use transaction for atomicity and performance
  return await prisma.$transaction(
    tripsData.map(tripData =>
      prisma.countryVisit.create({
        data: {
          ...tripData,
          userId,
        },
      })
    )
  );
};
```

### Caching Strategy

```typescript
// Multi-level caching implementation
class CacheManager {
  private redis: Redis;
  private memoryCache: Map<string, { data: any; expiry: number }>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.memoryCache = new Map();
  }

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (fastest)
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && memoryItem.expiry > Date.now()) {
      return memoryItem.data;
    }

    // L2: Redis cache
    const redisData = await this.redis.get(key);
    if (redisData) {
      const data = JSON.parse(redisData);
      // Populate memory cache
      this.memoryCache.set(key, {
        data,
        expiry: Date.now() + 60000, // 1 minute memory cache
      });
      return data;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, {
      data: value,
      expiry: Date.now() + Math.min(ttl * 1000, 60000),
    });

    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear Redis cache
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

const cache = new CacheManager();

// Usage in API endpoints
export const getCachedTrips = async (userId: string) => {
  const cacheKey = `user_trips_${userId}`;

  let trips = await cache.get<Trip[]>(cacheKey);
  if (!trips) {
    trips = await getUserTripsOptimized(userId);
    await cache.set(cacheKey, trips, 300); // 5 minutes
  }

  return trips;
};
```

## 📊 Performance Monitoring

### Real-Time Performance Tracking

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  // Track API response times
  trackApiResponse(endpoint: string, duration: number) {
    const key = `api_${endpoint}`;
    const times = this.metrics.get(key) || [];
    times.push(duration);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }

    this.metrics.set(key, times);

    // Alert on slow responses
    if (duration > 1000) {
      this.alertSlowResponse(endpoint, duration);
    }
  }

  // Calculate percentiles
  getPercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Generate performance report
  getPerformanceReport() {
    const report: Record<string, any> = {};

    for (const [key, values] of this.metrics.entries()) {
      report[key] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: this.getPercentile(values, 50),
        p95: this.getPercentile(values, 95),
        p99: this.getPercentile(values, 99),
        max: Math.max(...values),
        min: Math.min(...values),
      };
    }

    return report;
  }

  private async alertSlowResponse(endpoint: string, duration: number) {
    await alertManager.sendAlert({
      type: 'SLOW_API_RESPONSE',
      title: 'Slow API Response Detected',
      message: `${endpoint} took ${duration}ms to respond`,
      severity: duration > 2000 ? 'high' : 'medium',
      data: { endpoint, duration },
    });
  }
}

const performanceMonitor = new PerformanceMonitor();
```

### Client-Side Performance Tracking

```typescript
// Web Vitals tracking
export const trackWebVitals = () => {
  // Core Web Vitals
  getCLS(sendMetric);
  getFID(sendMetric);
  getFCP(sendMetric);
  getLCP(sendMetric);
  getTTFB(sendMetric);
};

const sendMetric = ({ name, value, rating, id }) => {
  // Send to analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'web_vitals',
      data: { name, value, rating, id },
    }),
  });
};

// Custom performance tracking
export const usePerformanceTracking = () => {
  const trackPageLoad = useCallback((pageName: string) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'page_load',
          data: { page: pageName, duration },
        }),
      });
    };
  }, []);

  const trackUserAction = useCallback((action: string, properties?: any) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'user_action',
          data: { action, duration, ...properties },
        }),
      });
    };
  }, []);

  return { trackPageLoad, trackUserAction };
};
```

## 🔧 Infrastructure Performance

### Edge Computing Strategy

```typescript
// Vercel Edge Functions for global performance
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'fra1', 'sin1'], // Multi-region deployment
};

// Edge-optimized handlers
export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  // Use edge cache for static data
  const countryInfo = await getCountryInfo(country);

  return new Response(JSON.stringify(countryInfo), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
```

### Database Connection Optimization

```typescript
// Connection pooling configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// Connection pool monitoring
export const monitorDatabasePerformance = async () => {
  const metrics = await prisma.$metrics.json();

  return {
    connectionPoolSize: metrics.pools[0]?.poolSize || 0,
    activeConnections: metrics.pools[0]?.activeConnections || 0,
    idleConnections: metrics.pools[0]?.idleConnections || 0,
    queryCount:
      metrics.counters.filter(c => c.key === 'prisma_client_queries_total')[0]
        ?.value || 0,
    queryDuration:
      metrics.histograms.filter(
        h => h.key === 'prisma_client_query_duration_ms'
      )[0] || null,
  };
};
```

## 📈 Performance Testing

### Load Testing Strategy

```typescript
// K6 load testing script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    // Ramp up test
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },

    // Spike test
    spike: {
      executor: 'ramping-vus',
      startTime: '10m',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 0 },
      ],
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'], // Error rate under 1%
  },
};

export default function () {
  const response = http.get('https://api.dino.travel/api/trips');

  check(response, {
    'status is 200': r => r.status === 200,
    'response time < 200ms': r => r.timings.duration < 200,
  });
}
```

### Performance Benchmarking

```typescript
// Automated performance testing
export const runPerformanceBenchmarks = async () => {
  const benchmarks = [
    {
      name: 'Trip List API',
      test: () => fetch('/api/trips').then(r => r.json()),
      threshold: 200, // ms
    },
    {
      name: 'Schengen Calculation',
      test: () => calculateSchengenStatus(mockTrips),
      threshold: 50, // ms
    },
    {
      name: 'Database Query',
      test: () => prisma.countryVisit.findMany({ take: 20 }),
      threshold: 100, // ms
    },
  ];

  const results = [];

  for (const benchmark of benchmarks) {
    const start = performance.now();
    await benchmark.test();
    const duration = performance.now() - start;

    results.push({
      name: benchmark.name,
      duration,
      passed: duration < benchmark.threshold,
      threshold: benchmark.threshold,
    });
  }

  return results;
};
```

## 🎯 Performance Optimization Checklist

### Frontend Optimizations

- [ ] Bundle size analysis and optimization
- [ ] Code splitting implemented
- [ ] Image optimization with Next.js Image
- [ ] Lazy loading for heavy components
- [ ] Memoization for expensive calculations
- [ ] Virtual scrolling for large lists
- [ ] Progressive Web App features
- [ ] Service worker for caching

### Backend Optimizations

- [ ] Database query optimization
- [ ] Response compression enabled
- [ ] Caching strategy implemented
- [ ] Connection pooling configured
- [ ] Parallel request processing
- [ ] Edge functions for global distribution
- [ ] CDN configuration optimized

### Monitoring & Testing

- [ ] Core Web Vitals tracking
- [ ] API performance monitoring
- [ ] Database performance metrics
- [ ] Load testing implemented
- [ ] Performance regression tests
- [ ] Real user monitoring (RUM)
- [ ] Error rate tracking

---

This performance design ensures the DINO application delivers exceptional user experience with fast load times, responsive interactions, and efficient resource utilization across all devices and network conditions.
