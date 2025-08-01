import { logger } from '@/lib/logger';
// TODO: Remove unused logger import

/**
 * API 캐싱 시스템
 * analytics와 monitoring 페이지의 성능 최적화를 위한 인메모리 캐싱
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    memoryUsage: 0,
  };

  // 기본 캐시 TTL 설정 (밀리초)
  private readonly DEFAULT_TTL = {
    analytics: 5 * 60 * 1000, // 5분 - 여행 통계 데이터
    monitoring: 30 * 1000, // 30초 - 모니터링 데이터
    trips: 10 * 60 * 1000, // 10분 - 여행 기록
    schengen: 15 * 60 * 1000, // 15분 - 셰겐 계산
    dashboard: 2 * 60 * 1000, // 2분 - 대시보드 위젯
    static: 30 * 60 * 1000, // 30분 - 정적 데이터 (국가 목록 등)
  };

  /**
   * 캐시에서 데이터 조회
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // TTL 체크
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const category = this.getCategoryFromKey(key);
    const cacheTtl =
      ttl || this.DEFAULT_TTL[category] || this.DEFAULT_TTL.static;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: cacheTtl,
      key,
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * 특정 키 또는 패턴으로 캐시 무효화
   */
  invalidate(keyOrPattern: string): number {
    let deletedCount = 0;

    if (keyOrPattern.includes('*')) {
      // 패턴 매칭 (예: 'analytics:*')
      const pattern = keyOrPattern.replace('*', '');
      for (const [key] of this.cache) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
    } else {
      // 정확한 키 매칭
      if (this.cache.delete(keyOrPattern)) {
        deletedCount = 1;
      }
    }

    this.updateStats();
    return deletedCount;
  }

  /**
   * 전체 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      memoryUsage: 0,
    };
  }

  /**
   * 만료된 캐시 엔트리 정리
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.updateStats();
    return deletedCount;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 캐시 적중률 계산
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * 메모리 사용량 추정 (바이트)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // 기타 오버헤드
    }
    return size;
  }

  /**
   * 통계 업데이트
   */
  private updateStats(): void {
    this.stats.entries = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   * 키에서 카테고리 추출
   */
  private getCategoryFromKey(key: string): keyof typeof this.DEFAULT_TTL {
    const category = key.split(':')[0];
    return category in this.DEFAULT_TTL
      ? (category as keyof typeof this.DEFAULT_TTL)
      : 'static';
  }

  /**
   * 자동 정리 스케줄러 시작
   */
  startCleanupScheduler(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    return setInterval(() => {
      const deletedCount = this.cleanup();
      if (deletedCount > 0) {
        logger.info('[ApiCache] Cleaned up ${deletedCount} expired entries');
      }
    }, intervalMs);
  }
}

// 싱글톤 인스턴스
export const apiCache = new ApiCache();

/**
 * 캐시 데코레이터 함수
 * API 함수를 래핑하여 자동 캐싱 적용
 */
export function withCache<T extends any[], R>(
  key: string | ((...args: T) => string),
  ttl?: number
) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = typeof key === 'function' ? key(...args) : key;

      // 캐시에서 조회
      const cached = apiCache.get<R>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // 캐시 미스 - 실제 함수 실행
      const result = await method.apply(this, args);

      // 결과를 캐시에 저장
      apiCache.set(cacheKey, result, ttl);

      return result;
    };
  };
}

/**
 * React Query 스타일의 캐시 키 생성 도우미
 */
export const CacheKeys = {
  analytics: {
    overview: (userId: string) => `analytics:overview:${userId}`,
    tripStats: (userId: string) => `analytics:trips:${userId}`,
    countryStats: (userId: string) => `analytics:countries:${userId}`,
    schengenStats: (userId: string) => `analytics:schengen:${userId}`,
  },
  monitoring: {
    performance: () => `monitoring:performance`,
    errors: () => `monitoring:errors`,
    usage: () => `monitoring:usage`,
    features: () => `monitoring:features`,
  },
  trips: {
    list: (userId: string) => `trips:list:${userId}`,
    details: (userId: string, tripId: string) =>
      `trips:details:${userId}:${tripId}`,
  },
  schengen: {
    calculation: (userId: string) => `schengen:calculation:${userId}`,
    status: (userId: string) => `schengen:status:${userId}`,
  },
  dashboard: {
    widgets: (userId: string) => `dashboard:widgets:${userId}`,
    summary: (userId: string) => `dashboard:summary:${userId}`,
  },
};

/**
 * 캐시 관리 유틸리티
 */
export const CacheManager = {
  /**
   * 사용자별 캐시 무효화
   */
  invalidateUser: (userId: string): number => {
    let totalDeleted = 0;
    totalDeleted += apiCache.invalidate(`analytics:*:${userId}`);
    totalDeleted += apiCache.invalidate(`trips:*:${userId}`);
    totalDeleted += apiCache.invalidate(`schengen:*:${userId}`);
    totalDeleted += apiCache.invalidate(`dashboard:*:${userId}`);
    return totalDeleted;
  },

  /**
   * 카테고리별 캐시 무효화
   */
  invalidateCategory: (category: string): number => {
    return apiCache.invalidate(`${category}:*`);
  },

  /**
   * 성능 모니터링 전용 캐시 무효화
   */
  invalidateMonitoring: (): number => {
    return apiCache.invalidate('monitoring:*');
  },

  /**
   * 캐시 상태 조회
   */
  getStatus: () => {
    const stats = apiCache.getStats();
    return {
      ...stats,
      hitRate: apiCache.getHitRate(),
      memoryUsageMB: (stats.memoryUsage / 1024 / 1024).toFixed(2),
    };
  },
};

// 앱 시작 시 자동 정리 스케줄러 시작
if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  apiCache.startCleanupScheduler();
}

export type { CacheEntry, CacheStats };
