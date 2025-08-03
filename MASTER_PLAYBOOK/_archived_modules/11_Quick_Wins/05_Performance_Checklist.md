# 성능 최적화 체크리스트

## 개요

웹 애플리케이션 성능을 2배 향상시키는 즉시 적용 가능한 최적화 기법들입니다. Lighthouse 점수 90+ 달성과 Core Web Vitals 개선을 보장하는 체계적인 체크리스트를 제공합니다.

## 프론트엔드 성능 최적화

### 이미지 최적화 (즉시 30% 성능 향상)

```typescript
// components/OptimizedImage.tsx - 자동 이미지 최적화
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85} // 최적 품질/크기 비율
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyb3Td6uNhfy12BckvOW8nzLcPT9t14fLfQH2/zzfrI="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit: 'cover',
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// lib/image-optimization.ts - 이미지 최적화 유틸리티
export const imageOptimization = {
  // WebP 지원 확인
  supportsWebP: () => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  },

  // 적응형 이미지 URL 생성
  getOptimizedImageUrl: (src: string, width: number, quality: number = 85) => {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
      f: imageOptimization.supportsWebP() ? 'webp' : 'jpeg'
    });
    return `/api/image-proxy?${params}`;
  },

  // 이미지 지연 로딩 구현
  lazyLoadImages: () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
};
```

### 코드 분할 및 번들 최적화

```typescript
// next.config.js - Next.js 최적화 설정
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능 활성화
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    scrollRestoration: true,
  },

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년
  },

  // 압축 및 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // 번들 분석기
  webpack: (config, { dev, isServer }) => {
    // 프로덕션에서 번들 크기 분석
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }

    // 중복 제거
    config.optimization.splitChunks = {
      chunks: 'all',
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
        },
      },
    };

    return config;
  },

  // 헤더 최적화
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 보안 헤더
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // 성능 헤더
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // 정적 자산 캐싱
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 레이지 로딩 및 코드 스플리팅

```typescript
// components/LazyComponents.tsx - 동적 컴포넌트 로딩
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 큰 컴포넌트들을 동적으로 로딩
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />,
  ssr: false, // 클라이언트에서만 로딩
});

const DataTable = dynamic(() => import('./DataTable'), {
  loading: () => <div>테이블 로딩 중...</div>,
});

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  loading: () => <div className="aspect-video bg-gray-200 animate-pulse rounded" />,
  ssr: false,
});

// 조건부 로딩
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <div>관리자 패널 로딩 중...</div>,
});

export default function OptimizedPage() {
  const [showChart, setShowChart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div>
      <h1>성능 최적화된 페이지</h1>

      {/* 즉시 필요한 컨텐츠 */}
      <div className="mb-8">
        <p>중요한 컨텐츠는 즉시 로딩됩니다.</p>
      </div>

      {/* 사용자 상호작용 후 로딩 */}
      <button
        onClick={() => setShowChart(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        차트 보기
      </button>

      {showChart && (
        <Suspense fallback={<div>차트 로딩 중...</div>}>
          <HeavyChart />
        </Suspense>
      )}

      {/* 권한 기반 로딩 */}
      {isAdmin && (
        <Suspense fallback={<div>관리자 기능 로딩 중...</div>}>
          <AdminPanel />
        </Suspense>
      )}

      {/* 뷰포트에 진입 시 로딩 */}
      <IntersectionObserver>
        <DataTable />
      </IntersectionObserver>
    </div>
  );
}

// 교차관찰자를 이용한 지연 로딩
function IntersectionObserver({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <div className="h-64 bg-gray-100" />}
    </div>
  );
}
```

## 백엔드 성능 최적화

### 데이터베이스 쿼리 최적화

```typescript
// lib/database-optimization.ts - 데이터베이스 최적화
import { PrismaClient } from '@prisma/client';

class OptimizedDatabase {
  private prisma: PrismaClient;
  private queryCache = new Map();

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // 연결 최적화 (선택적 로딩)
  async getUser(id: string, includeProfile: boolean = false) {
    const cacheKey = `user:${id}:${includeProfile}`;

    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        // 조건부 include
        ...(includeProfile && {
          profile: {
            select: {
              bio: true,
              avatar: true,
              preferences: true
            }
          }
        })
      }
    });

    // 5분 캐싱
    this.queryCache.set(cacheKey, user);
    setTimeout(() => this.queryCache.delete(cacheKey), 5 * 60 * 1000);

    return user;
  }

  // 배치 쿼리로 N+1 문제 해결
  async getUsersWithPosts(userIds: string[]) {
    // 한 번의 쿼리로 모든 데이터 가져오기
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: { comments: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // 최신 5개만
        }
      }
    });

    return users;
  }

  // 페이지네이션 최적화
  async getPaginatedPosts(
    page: number = 1,
    limit: number = 10,
    cursor?: string
  ) {
    // 커서 기반 페이지네이션 (무한 스크롤용)
    if (cursor) {
      return await this.prisma.post.findMany({
        take: limit,
        skip: 1, // 커서 제외
        cursor: { id: cursor },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          excerpt: true,
          createdAt: true,
          author: {
            select: { name: true, avatar: true }
          },
          _count: {
            select: { comments: true, likes: true }
          }
        }
      });
    }

    // 오프셋 기반 페이지네이션 (페이지 번호용)
    const posts = await this.prisma.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        createdAt: true,
        author: {
          select: { name: true, avatar: true }
        }
      }
    });

    const total = await this.prisma.post.count();

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // 집계 쿼리 최적화
  async getDashboardStats(userId: string) {
    const [userStats, recentActivity] = await Promise.all([
      // 병렬 집계 쿼리
      this.prisma.$transaction([
        this.prisma.post.count({ where: { userId } }),
        this.prisma.comment.count({ where: { userId } }),
        this.prisma.like.count({ where: { userId } }),
        this.prisma.follower.count({ where: { followingId: userId } })
      ]),

      // 최근 활동
      this.prisma.post.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { comments: true, likes: true } }
        }
      })
    ]);

    const [postsCount, commentsCount, likesCount, followersCount] = userStats;

    return {
      counts: {
        posts: postsCount,
        comments: commentsCount,
        likes: likesCount,
        followers: followersCount
      },
      recentActivity
    };
  }

  // 검색 최적화 (풀텍스트 검색)
  async searchPosts(query: string, limit: number = 10) {
    // PostgreSQL 풀텍스트 검색 사용
    return await this.prisma.$queryRaw`
      SELECT id, title, excerpt,
             ts_rank(search_vector, plainto_tsquery(${query})) as rank
      FROM posts
      WHERE search_vector @@ plainto_tsquery(${query})
      ORDER BY rank DESC, created_at DESC
      LIMIT ${limit}
    `;
  }
}
```

### 캐싱 전략

```typescript
// lib/caching.ts - 멀티레벨 캐싱 시스템
import Redis from 'ioredis';

class CacheManager {
  private redis: Redis;
  private memoryCache = new Map();
  private readonly DEFAULT_TTL = 3600; // 1시간

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  // L1: 메모리 캐시 (가장 빠름, 제한적)
  private getFromMemory(key: string) {
    const item = this.memoryCache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    this.memoryCache.delete(key);
    return null;
  }

  private setToMemory(key: string, value: any, ttl: number = 300) {
    // 메모리 캐시는 5분으로 제한
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000
    });

    // 메모리 사용량 제한 (1000개 항목)
    if (this.memoryCache.size > 1000) {
      this.clearOldestMemoryCache();
    }
  }

  // L2: Redis 캐시 (빠름, 확장 가능)
  async getFromRedis(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setToRedis(key: string, value: any, ttl: number = this.DEFAULT_TTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  // 통합 캐시 인터페이스
  async get(key: string) {
    // L1 캐시 확인
    let value = this.getFromMemory(key);
    if (value !== null) {
      return value;
    }

    // L2 캐시 확인
    value = await this.getFromRedis(key);
    if (value !== null) {
      // L1 캐시에도 저장
      this.setToMemory(key, value);
      return value;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL) {
    // 두 레벨 모두에 저장
    this.setToMemory(key, value, Math.min(ttl, 300));
    await this.setToRedis(key, value, ttl);
  }

  // 캐시 무효화
  async invalidate(pattern: string) {
    // 메모리 캐시 무효화
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Redis 캐시 무효화
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // 스마트 캐싱 (자동 TTL 조정)
  async smartSet(key: string, value: any, accessFrequency: number = 1) {
    // 접근 빈도에 따라 TTL 조정
    let ttl = this.DEFAULT_TTL;

    if (accessFrequency > 100) ttl *= 2; // 자주 접근하는 데이터는 더 오래
    if (accessFrequency < 10) ttl /= 2;  // 가끔 접근하는 데이터는 짧게

    await this.set(key, value, ttl);
  }

  private clearOldestMemoryCache() {
    // 가장 오래된 100개 항목 제거
    const entries = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => a.expiry - b.expiry)
      .slice(0, 100);

    entries.forEach(([key]) => this.memoryCache.delete(key));
  }
}

// 사용 예시
export const cache = new CacheManager();

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  let data = await cache.get(key);

  if (data === null) {
    data = await fetcher();
    await cache.set(key, data, ttl);
  }

  return data;
}
```

## 모니터링 및 성능 측정

### 실시간 성능 모니터링

```typescript
// lib/performance-monitor.ts - 성능 모니터링 시스템
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Core Web Vitals 측정
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('lcp', entry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  // 메트릭 기록
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 최근 100개 값만 유지
    if (values.length > 100) {
      values.shift();
    }

    // 임계값 초과 시 알림
    this.checkThresholds(name, value);
  }

  // 성능 임계값 검사
  private checkThresholds(metric: string, value: number) {
    const thresholds = {
      lcp: 2500, // 2.5초
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      api_response: 1000 // 1초
    };

    if (thresholds[metric] && value > thresholds[metric]) {
      this.sendAlert(metric, value, thresholds[metric]);
    }
  }

  // 통계 계산
  getStats(metric: string): PerformanceStats | null {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      count: values.length
    };
  }

  // API 응답 시간 측정
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      this.recordMetric(`api_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`api_${name}_error`, duration);
      throw error;
    }
  }

  // 페이지 로드 성능 측정
  measurePageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        const metrics = {
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connect: navigation.connectEnd - navigation.connectStart,
          server_response: navigation.responseEnd - navigation.requestStart,
          dom_parse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          resource_load: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
          total_load: navigation.loadEventEnd - navigation.navigationStart
        };

        Object.entries(metrics).forEach(([name, value]) => {
          this.recordMetric(`page_${name}`, value);
        });
      });
    }
  }

  // 성능 리포트 생성
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date(),
      coreWebVitals: {
        lcp: this.getStats('lcp'),
        fid: this.getStats('fid'),
        cls: this.getStats('cls')
      },
      pageLoad: {
        dnsLookup: this.getStats('page_dns_lookup'),
        tcpConnect: this.getStats('page_tcp_connect'),
        serverResponse: this.getStats('page_server_response'),
        domParse: this.getStats('page_dom_parse'),
        resourceLoad: this.getStats('page_resource_load'),
        totalLoad: this.getStats('page_total_load')
      },
      apiPerformance: this.getApiMetrics(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // 성능 개선 권장사항
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const lcpStats = this.getStats('lcp');
    if (lcpStats && lcpStats.p75 > 2500) {
      recommendations.push('LCP 개선 필요: 이미지 최적화, 크리티컬 리소스 우선로딩');
    }

    const fidStats = this.getStats('fid');
    if (fidStats && fidStats.p75 > 100) {
      recommendations.push('FID 개선 필요: JavaScript 번들 크기 줄이기, 코드 스플리팅');
    }

    const clsStats = this.getStats('cls');
    if (clsStats && clsStats.p75 > 0.1) {
      recommendations.push('CLS 개선 필요: 이미지 크기 고정, 폰트 로딩 최적화');
    }

    return recommendations;
  }

  private async sendAlert(metric: string, value: number, threshold: number) {
    // 실제 구현에서는 Slack, 이메일 등으로 알림 발송
    console.warn(`⚠️ Performance Alert: ${metric} = ${value} (threshold: ${threshold})`);

    // 웹훅 알림 (옵션)
    try {
      await fetch('/api/alerts/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          threshold,
          timestamp: new Date(),
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  // 정리
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// 자동 페이지 로드 측정 시작
if (typeof window !== 'undefined') {
  performanceMonitor.measurePageLoad();
}
```

## SuperClaude 성능 최적화 명령어

```bash
# 성능 분석 및 최적화
/analyze-performance --lighthouse --core-web-vitals --bundle-size

# 이미지 최적화 일괄 처리
/optimize-images --format webp --quality 85 --lazy-loading --responsive

# 코드 스플리팅 자동 설정
/setup-code-splitting --route-based --component-based --vendor-chunks

# 캐싱 전략 구현
/implement-caching --redis --memory --cdn --browser-cache

# 데이터베이스 쿼리 최적화
/optimize-database --index-analysis --query-profiling --connection-pool

# 번들 크기 분석 및 최적화
/analyze-bundle --tree-shaking --dead-code --chunk-optimization

# CDN 설정 및 정적 자산 최적화
/setup-cdn --provider cloudflare --static-assets --dynamic-content

# 모니터링 시스템 구축
/setup-monitoring --performance --alerts --dashboards --real-time

# 서버 사이드 렌더링 최적화
/optimize-ssr --streaming --partial-hydration --selective-rendering

# 모바일 성능 최적화
/optimize-mobile --touch-performance --network-aware --battery-saving
```

## 성능 최적화 체크리스트

### 즉시 적용 가능 (30분 내)
- [ ] **이미지 최적화**: WebP 형식, 적절한 크기 설정
- [ ] **압축 활성화**: Gzip/Brotli 압축 설정
- [ ] **불필요한 코드 제거**: 사용하지 않는 CSS/JS 정리
- [ ] **캐시 헤더 설정**: 정적 자산 브라우저 캐싱
- [ ] **폰트 최적화**: 웹폰트 preload, display: swap

### 단기 최적화 (1주일 내)
- [ ] **코드 스플리팅**: 라우트별, 컴포넌트별 분할
- [ ] **레이지 로딩**: 이미지, 컴포넌트 지연 로딩
- [ ] **CDN 연결**: 정적 자산 CDN 배포
- [ ] **데이터베이스 최적화**: 인덱스 추가, 쿼리 최적화
- [ ] **Redis 캐싱**: API 응답 캐시 구현

### 중장기 최적화 (1개월 내)
- [ ] **성능 모니터링**: 실시간 모니터링 시스템 구축
- [ ] **서버 최적화**: 로드 밸런싱, 오토 스케일링
- [ ] **PWA 구현**: 서비스 워커, 오프라인 기능
- [ ] **스트리밍 SSR**: 점진적 페이지 렌더링
- [ ] **성능 예산**: 성능 메트릭 기반 CI/CD

### 성능 목표
- **Lighthouse 점수**: 90+ (모든 항목)
- **LCP**: < 2.5초
- **FID**: < 100ms
- **CLS**: < 0.1
- **First Byte**: < 200ms
- **번들 크기**: < 500KB (gzipped)

성능 최적화는 **"측정 → 분석 → 최적화 → 재측정"** 사이클을 반복하는 것이 핵심입니다. 사용자 경험에 가장 큰 영향을 미치는 항목부터 우선적으로 개선하세요.