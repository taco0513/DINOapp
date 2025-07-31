/**
 * In-memory cache implementation with TTL support
 * Optimized for DiNoCal's 5-minute caching strategy
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
  created: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  };

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      expiry,
      created: Date.now(),
    });
    this.stats.sets++;
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    this.stats.hits++;
    return item.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    let totalMemoryUsage = 0;

    for (const [key, item] of this.cache.entries()) {
      // Estimate memory usage
      const itemSize = JSON.stringify(item.data).length + key.length + 64; // overhead
      totalMemoryUsage += itemSize;

      if (now > item.expiry) {
        expiredItems++;
      } else {
        validItems++;
      }
    }

    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      // Cache content stats
      totalItems: this.cache.size,
      validItems,
      expiredItems,

      // Performance stats
      hitRate: Math.round(hitRate * 100) / 100,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      evictions: this.stats.evictions,

      // Memory stats
      memoryUsageBytes: totalMemoryUsage,
      memoryUsageMB: Math.round((totalMemoryUsage / 1024 / 1024) * 100) / 100,

      // Cache efficiency
      efficiency: validItems / this.cache.size || 0,
    };
  }

  /**
   * Remove expired items
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Cleanup interval when done
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Singleton instance
export const memoryCache = new MemoryCache();

/**
 * Cache wrapper function for async operations
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch data and cache it
  const data = await fetcher();
  memoryCache.set(key, data, ttl);

  return data;
}

/**
 * Generate cache key for API calls
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  const baseKey = `api:${endpoint}`;

  if (!params) {
    return baseKey;
  }

  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key];
        return result;
      },
      {} as Record<string, any>
    );

  const paramString = JSON.stringify(sortedParams);
  return `${baseKey}:${Buffer.from(paramString).toString('base64')}`;
}

/**
 * Cache keys for DiNoCal specific data
 */
export const CacheKeys = {
  // User data
  USER_TRIPS: (userId: string) => `user:${userId}:trips`,
  USER_SCHENGEN_STATUS: (userId: string) => `user:${userId}:schengen`,
  USER_NOTIFICATIONS: (userId: string) => `user:${userId}:notifications`,

  // System data
  COUNTRIES_DATA: 'system:countries',
  VISA_TYPES: 'system:visa-types',

  // Gmail integration
  GMAIL_MESSAGES: (userId: string, query?: string) =>
    `gmail:${userId}:messages${query ? `:${Buffer.from(query).toString('base64')}` : ''}`,
  GMAIL_ANALYSIS: (userId: string, messageId: string) =>
    `gmail:${userId}:analysis:${messageId}`,

  // Analytics (enhanced)
  USER_STATS: (userId: string) => `stats:${userId}`,
  USER_ANALYTICS_OVERVIEW: (userId: string) => `analytics:${userId}:overview`,
  USER_ANALYTICS_COUNTRIES: (userId: string) => `analytics:${userId}:countries`,
  USER_ANALYTICS_TIMELINE: (userId: string) => `analytics:${userId}:timeline`,
  USER_ANALYTICS_VISA_BREAKDOWN: (userId: string) =>
    `analytics:${userId}:visa-breakdown`,

  // Monitoring & Performance
  SYSTEM_STATS: 'stats:system',
  MONITORING_PERFORMANCE: 'monitoring:performance',
  MONITORING_ERRORS: 'monitoring:errors',
  MONITORING_USAGE: 'monitoring:usage',
  MONITORING_FEATURES: 'monitoring:features',
  MONITORING_CACHE_STATS: 'monitoring:cache-stats',

  // Dashboard widgets
  DASHBOARD_SUMMARY: (userId: string) => `dashboard:${userId}:summary`,
  DASHBOARD_WIDGETS: (userId: string) => `dashboard:${userId}:widgets`,
  DASHBOARD_QUICK_STATS: (userId: string) => `dashboard:${userId}:quick-stats`,
} as const;

export type CacheKeyType = keyof typeof CacheKeys;

/**
 * Cache TTL configurations for different data types
 */
export const CacheTTL = {
  // User data - moderate refresh rate
  USER_DATA: 5 * 60 * 1000, // 5 minutes

  // Analytics - can be slightly stale
  ANALYTICS: 10 * 60 * 1000, // 10 minutes

  // Monitoring - frequent updates needed
  MONITORING: 30 * 1000, // 30 seconds

  // Dashboard - balanced approach
  DASHBOARD: 2 * 60 * 1000, // 2 minutes

  // System/static data - infrequent changes
  STATIC: 30 * 60 * 1000, // 30 minutes

  // Real-time data - very frequent updates
  REALTIME: 10 * 1000, // 10 seconds
} as const;

/**
 * Advanced cache utilities for analytics and monitoring
 */
export class CacheManager {
  /**
   * Batch invalidate multiple cache keys by pattern
   */
  static invalidatePattern(pattern: string): number {
    const cache = memoryCache as any;
    let deletedCount = 0;

    for (const [key] of cache.cache.entries()) {
      if (key.includes(pattern)) {
        cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Invalidate all user-specific cache
   */
  static invalidateUser(userId: string): number {
    return (
      this.invalidatePattern(`user:${userId}`) +
      this.invalidatePattern(`analytics:${userId}`) +
      this.invalidatePattern(`dashboard:${userId}`)
    );
  }

  /**
   * Invalidate all monitoring cache
   */
  static invalidateMonitoring(): number {
    return this.invalidatePattern('monitoring:');
  }

  /**
   * Get cache performance metrics
   */
  static getPerformanceMetrics() {
    const stats = memoryCache.getStats();
    return {
      ...stats,
      performance: {
        hitRateGrade: this.getHitRateGrade(stats.hitRate),
        memoryPressure: this.getMemoryPressure(stats.memoryUsageMB),
        efficiency: this.getEfficiencyGrade(stats.efficiency),
      },
    };
  }

  /**
   * Grade hit rate performance
   */
  private static getHitRateGrade(hitRate: number): string {
    if (hitRate >= 90) return 'Excellent';
    if (hitRate >= 75) return 'Good';
    if (hitRate >= 50) return 'Fair';
    return 'Poor';
  }

  /**
   * Assess memory pressure
   */
  private static getMemoryPressure(memoryMB: number): string {
    if (memoryMB < 10) return 'Low';
    if (memoryMB < 50) return 'Medium';
    if (memoryMB < 100) return 'High';
    return 'Critical';
  }

  /**
   * Grade cache efficiency
   */
  private static getEfficiencyGrade(efficiency: number): string {
    if (efficiency >= 0.9) return 'Excellent';
    if (efficiency >= 0.75) return 'Good';
    if (efficiency >= 0.5) return 'Fair';
    return 'Poor';
  }

  /**
   * Auto-cleanup based on memory pressure
   */
  static autoCleanup(): { cleaned: number; pressure: string } {
    const stats = memoryCache.getStats();
    const pressure = this.getMemoryPressure(stats.memoryUsageMB);

    let cleanedCount = 0;

    if (pressure === 'High' || pressure === 'Critical') {
      const cache = memoryCache as any;
      const now = Date.now();

      // Remove expired items first
      const expiredKeys: string[] = [];
      for (const [key, item] of cache.cache.entries()) {
        if (now > item.expiry) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => {
        cache.delete(key);
        cleanedCount++;
      });

      // If still high pressure, remove oldest items
      if (pressure === 'Critical' && cleanedCount < 10) {
        const items = Array.from(cache.cache.entries())
          .sort(([, a], [, b]) => a.created - b.created)
          .slice(0, Math.min(20, items.length / 2));

        items.forEach(([key]) => {
          cache.delete(key);
          cleanedCount++;
        });
      }
    }

    return { cleaned: cleanedCount, pressure };
  }
}
