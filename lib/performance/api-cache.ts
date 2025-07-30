/**
 * Advanced API caching and optimization system
 * Implements in-memory LRU cache with TTL and Redis-like functionality
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  hitRate: number;
}

export class PerformanceCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxEntries: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(
    maxSize = 50 * 1024 * 1024, // 50MB
    maxEntries = 1000
  ) {
    this.maxSize = maxSize;
    this.maxEntries = maxEntries;

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Get value from cache
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count and stats
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  // Set value in cache with TTL
  set(key: string, value: T, ttl = 3600000): void {
    // 1 hour default
    const size = this.estimateSize(value);

    // Check size limits
    if (size > this.maxSize) {
      console.warn(`Cache entry too large: ${size} bytes`);
      return;
    }

    // Ensure we don't exceed limits
    this.ensureCapacity(size);

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  // Delete specific key
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Clear all entries
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    );

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: totalSize,
      entries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Ensure cache doesn't exceed capacity limits
  private ensureCapacity(newEntrySize: number): void {
    // Check entry count limit
    while (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    // Check size limit
    let totalSize = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    );

    while (totalSize + newEntrySize > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
      totalSize = Array.from(this.cache.values()).reduce(
        (sum, entry) => sum + entry.size,
        0
      );
    }
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let lruKey = '';
    let lruScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score based on age and hit count (lower is more likely to be evicted)
      const age = Date.now() - entry.timestamp;
      const score = entry.hits > 0 ? age / entry.hits : age;

      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  // Estimate size of value in bytes
  private estimateSize(value: any): number {
    const json = JSON.stringify(value);
    return new Blob([json]).size;
  }
}

// Global cache instance
export const apiCache = new PerformanceCache();

// API response caching decorator
export function CacheResponse(ttl = 3600000) {
  // 1 hour default
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from function name and arguments
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache first
      const cached = apiCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);

      // Cache the result
      if (result !== undefined && result !== null) {
        apiCache.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}

// Request deduplication for identical concurrent requests
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Execute request and store promise
    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// API rate limiting
class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Optimized fetch wrapper with caching, deduplication, and retry logic
interface OptimizedFetchOptions extends RequestInit {
  cache?: boolean;
  cacheTtl?: number;
  deduplicate?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  rateLimit?: { key: string; limit: number; windowMs: number };
}

export async function optimizedFetch(
  url: string,
  options: OptimizedFetchOptions = {}
): Promise<Response> {
  const {
    cache = true,
    cacheTtl = 300000, // 5 minutes
    deduplicate = true,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    rateLimit,
    ...fetchOptions
  } = options;

  // Check rate limit
  if (
    rateLimit &&
    !rateLimiter.isAllowed(rateLimit.key, rateLimit.limit, rateLimit.windowMs)
  ) {
    throw new Error('Rate limit exceeded');
  }

  const cacheKey = `fetch:${url}:${JSON.stringify(fetchOptions)}`;

  // Request function
  const makeRequest = async (): Promise<Response> => {
    // Check cache first
    if (cache && fetchOptions.method !== 'POST') {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          status: cached.status,
          statusText: cached.statusText,
          headers: cached.headers,
        });
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Cache successful responses
      if (cache && response.ok && fetchOptions.method !== 'POST') {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json().catch(() => null);

        if (data) {
          apiCache.set(
            cacheKey,
            {
              data,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
            },
            cacheTtl
          );
        }
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Request with retry logic
  const makeRequestWithRetry = async (): Promise<Response> => {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        return await makeRequest();
      } catch (error) {
        lastError = error as Error;

        if (i < retries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  };

  // Use deduplication if enabled
  if (deduplicate) {
    return await requestDeduplicator.deduplicate(
      cacheKey,
      makeRequestWithRetry
    );
  }

  return await makeRequestWithRetry();
}

// API response compression
export function compressResponse(data: any): string {
  // Simple compression using JSON minification and common string replacements
  let json = JSON.stringify(data);

  // Replace common patterns to reduce size
  const replacements: [string, string][] = [
    ['"createdAt":', '"cA":'],
    ['"updatedAt":', '"uA":'],
    ['"userId":', '"uI":'],
    ['"travelRecord":', '"tR":'],
    ['"countryCode":', '"cC":'],
    ['"entryDate":', '"eD":'],
    ['"exitDate":', '"xD":'],
    ['true', 't'],
    ['false', 'f'],
    ['null', 'n'],
  ];

  for (const [search, replace] of replacements) {
    json = json.replace(new RegExp(search, 'g'), replace);
  }

  return json;
}

export function decompressResponse(compressed: string): any {
  // Reverse the compression
  let json = compressed;

  // Replace field names back
  json = json.replace(/"cA":/g, '"createdAt":');
  json = json.replace(/"uA":/g, '"updatedAt":');
  json = json.replace(/"uI":/g, '"userId":');
  json = json.replace(/"tR":/g, '"travelRecord":');
  json = json.replace(/"cC":/g, '"countryCode":');
  json = json.replace(/"eD":/g, '"entryDate":');
  json = json.replace(/"xD":/g, '"exitDate":');

  // Replace boolean and null values carefully (including in arrays)
  json = json.replace(/:\s*t\s*([,}\]])/g, ': true$1');
  json = json.replace(/:\s*f\s*([,}\]])/g, ': false$1');
  json = json.replace(/:\s*n\s*([,}\]])/g, ': null$1');

  // Handle values in arrays
  json = json.replace(/\[\s*t\s*([,\]])/g, '[ true$1');
  json = json.replace(/,\s*t\s*([,\]])/g, ', true$1');
  json = json.replace(/\[\s*f\s*([,\]])/g, '[ false$1');
  json = json.replace(/,\s*f\s*([,\]])/g, ', false$1');
  json = json.replace(/\[\s*n\s*([,\]])/g, '[ null$1');
  json = json.replace(/,\s*n\s*([,\]])/g, ', null$1');

  return JSON.parse(json);
}

// Performance monitoring for API calls
export class APIPerformanceMonitor {
  private metrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      errors: number;
      averageTime: number;
    }
  >();

  startTiming(endpoint: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric(endpoint, duration, false);
    };
  }

  recordError(endpoint: string): void {
    this.recordMetric(endpoint, 0, true);
  }

  private recordMetric(
    endpoint: string,
    duration: number,
    isError: boolean
  ): void {
    const existing = this.metrics.get(endpoint) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      averageTime: 0,
    };

    existing.count++;
    existing.totalTime += duration;

    if (isError) {
      existing.errors++;
    }

    existing.averageTime = existing.totalTime / existing.count;

    this.metrics.set(endpoint, existing);

    // Report to metrics collector if available
    if (typeof window !== 'undefined' && (window as any).metricsCollector) {
      const collector = (window as any).metricsCollector;
      collector.histogram('api_response_time', duration, { endpoint });

      if (isError) {
        collector.increment('api_errors', 1, { endpoint });
      }
    }
  }

  getMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const apiMonitor = new APIPerformanceMonitor();
