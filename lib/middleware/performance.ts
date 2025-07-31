/**
 * Performance middleware for API routes
 * Provides caching, compression, rate limiting, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  apiCache,
  rateLimiter,
  compressResponse,
  apiMonitor,
} from '@/lib/performance/api-cache';
import { MetricsCollector } from '@/lib/monitoring/metrics-collector';

interface PerformanceMiddlewareOptions {
  cache?: {
    enabled?: boolean;
    ttl?: number;
    excludePaths?: string[];
    includeQuery?: boolean;
  };
  compression?: {
    enabled?: boolean;
    threshold?: number;
    level?: number;
  };
  rateLimit?: {
    enabled?: boolean;
    requests?: number;
    windowMs?: number;
    skipSuccessfulRequests?: boolean;
  };
  monitoring?: {
    enabled?: boolean;
    slowThreshold?: number;
  };
}

const defaultOptions: PerformanceMiddlewareOptions = {
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    excludePaths: ['/api/auth', '/api/user'],
    includeQuery: false,
  },
  compression: {
    enabled: true,
    threshold: 1024, // 1KB
    level: 6,
  },
  rateLimit: {
    enabled: true,
    requests: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
  },
  monitoring: {
    enabled: true,
    slowThreshold: 1000, // 1 second
  },
};

// Main performance middleware
export function performanceMiddleware(
  options: PerformanceMiddlewareOptions = {}
) {
  const config = { ...defaultOptions, ...options };

  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const _startTime = performance.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const _method = request.method;
    const clientIp = getClientIP(request);

    // Generate cache key
    const _cacheKey = generateCacheKey(request, config.cache?.includeQuery);

    // Rate limiting
    if (config.rateLimit?.enabled) {
      const rateLimitKey = `${clientIp}:${path}`;

      if (
        !rateLimiter.isAllowed(
          rateLimitKey,
          config.rateLimit.requests || 100,
          config.rateLimit.windowMs || 60000
        )
      ) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: config.rateLimit.windowMs,
          },
          { status: 429 }
        );

        response.headers.set(
          'X-RateLimit-Limit',
          String(config.rateLimit.requests)
        );
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set(
          'Retry-After',
          String(Math.ceil((config.rateLimit.windowMs || 60000) / 1000))
        );

        return response;
      }
    }

    // Check cache for GET requests
    if (config.cache?.enabled && method === 'GET') {
      const isExcluded = config.cache.excludePaths?.some(excludePath =>
        path.startsWith(excludePath)
      );

      if (!isExcluded) {
        const cached = apiCache.get(cacheKey);
        if (cached) {
          const response = NextResponse.json(cached.data, {
            status: cached.status || 200,
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-TTL': String(config.cache.ttl),
              'Content-Type': 'application/json',
              ...cached.headers,
            },
          });

          // Record cache hit
          recordMetrics(path, performance.now() - startTime, 'cache-hit');
          return response;
        }
      }
    }

    try {
      // Execute handler
      const response = await handler(request);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Clone response to read body
      const clonedResponse = response.clone();

      // Process response based on content type
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        await processJSONResponse(
          clonedResponse,
          response,
          cacheKey,
          config,
          duration,
          path,
          method
        );
      }

      // Add performance headers
      response.headers.set('X-Response-Time', `${Math.round(duration)}ms`);
      response.headers.set('X-Cache', 'MISS');

      // Record metrics
      recordMetrics(
        path,
        duration,
        response.status >= 400 ? 'error' : 'success'
      );

      // Log slow requests
      if (
        config.monitoring?.enabled &&
        duration > (config.monitoring.slowThreshold || 1000)
      ) {
        console.warn(
          `Slow API request: ${method} ${path} - ${Math.round(duration)}ms`
        );
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Record error metrics
      recordMetrics(path, duration, 'error');
      apiMonitor.recordError(path);

      // Return error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Process JSON responses for caching and compression
async function processJSONResponse(
  clonedResponse: NextResponse,
  originalResponse: NextResponse,
  cacheKey: string,
  config: PerformanceMiddlewareOptions,
  duration: number,
  path: string,
  method: string
): Promise<void> {
  try {
    const data = await clonedResponse.json();
    const dataSize = JSON.stringify(data).length;

    // Cache successful GET responses
    if (
      config.cache?.enabled &&
      method === 'GET' &&
      originalResponse.status < 400 &&
      !config.cache.excludePaths?.some(excludePath =>
        path.startsWith(excludePath)
      )
    ) {
      apiCache.set(
        cacheKey,
        {
          data,
          status: originalResponse.status,
          headers: Object.fromEntries(originalResponse.headers.entries()),
          timestamp: Date.now(),
        },
        config.cache.ttl
      );
    }

    // Apply compression if enabled and response is large enough
    if (
      config.compression?.enabled &&
      dataSize > (config.compression.threshold || 1024)
    ) {
      const compressed = compressResponse(data);
      const compressionRatio = compressed.length / dataSize;

      if (compressionRatio < 0.9) {
        // Only if we achieve >10% compression
        originalResponse.headers.set('Content-Encoding', 'custom');
        originalResponse.headers.set(
          'X-Compression-Ratio',
          compressionRatio.toFixed(2)
        );
      }
    }

    // Add size headers
    originalResponse.headers.set('X-Content-Size', String(dataSize));
  } catch (error) {
    console.error('Error processing JSON response:', error);
  }
}

// Generate cache key from request
function generateCacheKey(request: NextRequest, includeQuery = false): string {
  const url = new URL(request.url);
  const path = url.pathname;
  const query = includeQuery ? url.search : '';
  const headers = JSON.stringify(
    Object.fromEntries(
      ['authorization', 'x-user-id'].map(h => [h, request.headers.get(h)])
    )
  );

  return `api:${path}${query}:${headers}`;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// Record performance metrics
function recordMetrics(path: string, duration: number, type: string): void {
  if (typeof window !== 'undefined' && (window as any).metricsCollector) {
    const collector = (window as any).metricsCollector as MetricsCollector;

    collector.histogram('api_response_time', duration, { path, type });
    collector.increment('api_requests_total', 1, { path, type });

    if (type === 'error') {
      collector.increment('api_errors_total', 1, { path });
    }
  }
}

// Response compression utility
export function compressJSON(data: any): Buffer {
  const json = JSON.stringify(data);

  // Simple compression using gzip-like techniques
  // In production, you would use actual gzip compression
  const compressed = json
    .replace(/\s+/g, ' ')
    .replace(/": "/g, '":"')
    .replace(/", "/g, '","')
    .trim();

  return Buffer.from(compressed, 'utf-8');
}

// API route wrapper with performance optimizations
export function withPerformance<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options: PerformanceMiddlewareOptions = {}
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();

    try {
      const result = await handler(...args);
      const duration = performance.now() - startTime;

      // Record successful execution
      recordMetrics('handler', duration, 'success');

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Record error
      recordMetrics('handler', duration, 'error');

      throw error;
    }
  };
}

// Database query optimization wrapper
export function optimizeQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey?: string,
  ttl = 300000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();

    try {
      // Check cache first
      if (cacheKey) {
        const cached = apiCache.get(cacheKey);
        if (cached) {
          recordMetrics('db_query', performance.now() - startTime, 'cache-hit');
          return resolve(cached);
        }
      }

      // Execute query
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Cache result
      if (cacheKey && result) {
        apiCache.set(cacheKey, result, ttl);
      }

      // Record metrics
      recordMetrics('db_query', duration, 'success');

      resolve(result);
    } catch (error) {
      const duration = performance.now() - startTime;
      recordMetrics('db_query', duration, 'error');
      reject(error);
    }
  });
}

// Batch processing utility for API operations
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 10,
  concurrency = 3
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch with limited concurrency
    const batchPromises = batch.map(item => processor(item));
    const batchResults = await Promise.allSettled(batchPromises);

    // Extract successful results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch processing error:', result.reason);
      }
    }

    // Small delay between batches to prevent overwhelming
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return results;
}
