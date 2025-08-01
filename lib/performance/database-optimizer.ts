/**
 * Database performance optimization utilities
 * Provides query optimization, connection pooling, and performance monitoring
 */

import { PrismaClient } from '@prisma/client'
import { apiCache } from './api-cache'

interface QueryMetrics {
  query: string
  duration: number
  timestamp: number
  params?: any
  error?: string
}

interface ConnectionPoolConfig {
  maxConnections?: number
  minConnections?: number
  idleTimeout?: number
  acquireTimeout?: number
  retryAttempts?: number
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private queryMetrics: QueryMetrics[] = []
  private slowQueryThreshold = 1000 // 1 second
  private metricsRetentionTime = 3600000 // 1 hour

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Optimized Prisma client with connection pooling
  createOptimizedClient(config: ConnectionPoolConfig = {}): PrismaClient {
    const {
      maxConnections = 20,
      // minConnections = 2,
      // idleTimeout = 300000, // 5 minutes
      acquireTimeout = 60000, // 1 minute
      // retryAttempts = 3
    } = config

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }

    // Construct optimized connection string
    const url = new URL(databaseUrl)
    url.searchParams.set('connection_limit', maxConnections.toString())
    url.searchParams.set('pool_timeout', Math.floor(acquireTimeout / 1000).toString())
    url.searchParams.set('sslmode', 'prefer')

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url.toString()
        }
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
      ]
    })

    // Set up query monitoring
    prisma.$on('query', (e) => {
      this.recordQueryMetric({
        query: e.query,
        duration: e.duration,
        timestamp: Date.now(),
        params: e.params
      })
    })

    prisma.$on('error', (e) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.error('Database error', { error: e });
      });
    })

    return prisma
  }

  // Record query performance metrics
  recordQueryMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric)

    // Clean up old metrics
    this.cleanupMetrics()

    // Log slow queries
    if (metric.duration > this.slowQueryThreshold) {
      import('@/lib/logger').then(({ logger }) => {
        logger.warn('Slow query detected', {
          duration: metric.duration,
          query: metric.query,
          threshold: this.slowQueryThreshold
        });
      });
      
      // Store in performance cache for monitoring dashboard
      const slowQueries = apiCache.get('slow-queries') || []
      slowQueries.push(metric)
      apiCache.set('slow-queries', slowQueries.slice(-100), 3600000) // Keep last 100
    }

    // Report to metrics collector if available
    if (typeof window !== 'undefined' && (window as any).metricsCollector) {
      const collector = (window as any).metricsCollector
      collector.histogram('db_query_duration', metric.duration, {
        query_type: this.getQueryType(metric.query)
      })
    }
  }

  // Get database performance statistics
  getPerformanceStats(): any {
    const now = Date.now()
    const recentMetrics = this.queryMetrics.filter(
      m => now - m.timestamp < 3600000 // Last hour
    )

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        slowQueries: 0,
        errorRate: 0
      }
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0)
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold)
    const errorQueries = recentMetrics.filter(m => m.error)

    return {
      totalQueries: recentMetrics.length,
      averageResponseTime: Math.round(totalDuration / recentMetrics.length),
      slowQueries: slowQueries.length,
      slowQueryPercentage: Math.round((slowQueries.length / recentMetrics.length) * 100),
      errorRate: Math.round((errorQueries.length / recentMetrics.length) * 100),
      queryTypes: this.getQueryTypeStats(recentMetrics)
    }
  }

  // Clean up old metrics
  private cleanupMetrics(): void {
    const cutoff = Date.now() - this.metricsRetentionTime
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp > cutoff)
  }

  // Determine query type from SQL
  private getQueryType(query: string): string {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (normalizedQuery.startsWith('select')) return 'SELECT'
    if (normalizedQuery.startsWith('insert')) return 'INSERT'
    if (normalizedQuery.startsWith('update')) return 'UPDATE'
    if (normalizedQuery.startsWith('delete')) return 'DELETE'
    if (normalizedQuery.startsWith('create')) return 'CREATE'
    if (normalizedQuery.startsWith('alter')) return 'ALTER'
    if (normalizedQuery.startsWith('drop')) return 'DROP'
    
    return 'OTHER'
  }

  // Get statistics by query type
  private getQueryTypeStats(metrics: QueryMetrics[]): Record<string, any> {
    const stats: Record<string, { count: number; totalTime: number; avgTime: number }> = {}

    for (const metric of metrics) {
      const type = this.getQueryType(metric.query)
      
      if (!stats[type]) {
        stats[type] = { count: 0, totalTime: 0, avgTime: 0 }
      }
      
      stats[type].count++
      stats[type].totalTime += metric.duration
      stats[type].avgTime = Math.round(stats[type].totalTime / stats[type].count)
    }

    return stats
  }
}

// Query optimization utilities
export class QueryOptimizer {
  // Optimize Prisma queries with intelligent caching and batching
  static async optimizeQuery<T>(
    queryFn: () => Promise<T>,
    options: {
      cacheKey?: string
      cacheTtl?: number
      timeout?: number
      retries?: number
    } = {}
  ): Promise<T> {
    const {
      cacheKey,
      cacheTtl = 300000, // 5 minutes
      timeout = 30000, // 30 seconds
      retries = 3
    } = options

    // Check cache first
    if (cacheKey) {
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    const executeQuery = async (): Promise<T> => {
      const startTime = performance.now()
      
      try {
        // Add timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        })

        const result = await Promise.race([queryFn(), timeoutPromise])
        const duration = performance.now() - startTime

        // Cache successful results
        if (cacheKey && result) {
          apiCache.set(cacheKey, result, cacheTtl)
        }

        // Record metrics
        DatabaseOptimizer.getInstance().recordQueryMetric({
          query: cacheKey || 'unknown',
          duration,
          timestamp: Date.now()
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        // Record error metric
        DatabaseOptimizer.getInstance().recordQueryMetric({
          query: cacheKey || 'unknown',
          duration,
          timestamp: Date.now(),
          error: (error as Error).message
        })

        throw error
      }
    }

    // Retry logic
    let lastError: Error | null = null
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await executeQuery()
      } catch (error) {
        lastError = error as Error
        
        if (i < retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, i), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // Batch multiple queries for better performance
  static async batchQueries<T>(
    queries: Array<() => Promise<T>>,
    batchSize = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(batch.map(q => q()))
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          import('@/lib/logger').then(({ logger }) => {
            logger.error('Batch query failed', { reason: result.reason });
          });
          throw result.reason
        }
      }
    }
    
    return results
  }

  // Optimize SELECT queries with smart field selection
  static optimizeSelect<T extends Record<string, any>>(
    fields: (keyof T)[],
    includeRelations: boolean = false
  ): { select: Record<string, boolean> } {
    const select: Record<string, boolean> = {}
    
    // Always include ID for relationships
    select.id = true
    
    // Add requested fields
    for (const field of fields) {
      select[field as string] = true
    }
    
    // Add commonly needed fields if including relations
    if (includeRelations) {
      select.createdAt = true
      select.updatedAt = true
    }
    
    return { select }
  }

  // Optimize WHERE clauses with index hints
  static optimizeWhere(
    conditions: Record<string, any>,
    indexHints: string[] = []
  ): Record<string, any> {
    const optimized: Record<string, any> = {}
    
    // Sort conditions to put indexed fields first
    const sortedKeys = Object.keys(conditions).sort((a, b) => {
      const aIsIndexed = indexHints.includes(a)
      const bIsIndexed = indexHints.includes(b)
      
      if (aIsIndexed && !bIsIndexed) return -1
      if (!aIsIndexed && bIsIndexed) return 1
      return 0
    })
    
    for (const key of sortedKeys) {
      optimized[key] = conditions[key]
    }
    
    return optimized
  }
}

// Database connection pool manager
export class ConnectionPoolManager {
  private static pools = new Map<string, PrismaClient>()
  
  static getPool(name = 'default', config?: ConnectionPoolConfig): PrismaClient {
    if (!this.pools.has(name)) {
      const optimizer = DatabaseOptimizer.getInstance()
      const client = optimizer.createOptimizedClient(config)
      this.pools.set(name, client)
    }
    
    return this.pools.get(name)!
  }
  
  static async closeAll(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map(client => 
      client.$disconnect()
    )
    
    await Promise.all(closePromises)
    this.pools.clear()
  }
}

// Common query patterns with optimizations
export class OptimizedQueries {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Optimized user queries with caching
  async getUserWithCache(userId: string) {
    return QueryOptimizer.optimizeQuery(
      () => this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true
        }
      }),
      {
        cacheKey: `user:${userId}`,
        cacheTtl: 600000 // 10 minutes
      }
    )
  }

  // Optimized travel records with pagination and filtering
  async getTravelRecords(
    userId: string,
    options: {
      page?: number
      limit?: number
      country?: string
      year?: number
    } = {}
  ) {
    const { page = 1, limit = 20, country: countryCode, year } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    
    if (countryCode) {
      where.country = countryCode
    }
    
    if (year) {
      where.entryDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }

    return QueryOptimizer.optimizeQuery(
      () => Promise.all([
        this.prisma.countryVisit.findMany({
          where,
          select: {
            id: true,
            country: true,
            entryDate: true,
            exitDate: true,
            purpose: true,
            notes: true
          },
          orderBy: { entryDate: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.countryVisit.count({ where })
      ]),
      {
        cacheKey: `travel-records:${userId}:${JSON.stringify(options)}`,
        cacheTtl: 300000 // 5 minutes
      }
    ).then(([records, total]) => ({ records, total, page, limit }))
  }

  // Optimized Schengen calculation with caching
  async getSchengenData(userId: string) {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return QueryOptimizer.optimizeQuery(
      () => this.prisma.countryVisit.findMany({
        where: {
          userId,
          country: {
            in: [
              // Schengen countries
              'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
              'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
              'PT', 'SK', 'SI', 'ES', 'SE', 'CH'
            ]
          },
          OR: [
            { entryDate: { gte: sixMonthsAgo } },
            { exitDate: { gte: sixMonthsAgo } }
          ]
        },
        select: {
          id: true,
          country: true,
          entryDate: true,
          exitDate: true
        },
        orderBy: { entryDate: 'desc' }
      }),
      {
        cacheKey: `schengen:${userId}`,
        cacheTtl: 3600000 // 1 hour
      }
    )
  }

  // Batch operations for better performance
  async batchCreateTravelRecords(records: any[]) {
    return QueryOptimizer.batchQueries(
      records.map(record => () => 
        this.prisma.countryVisit.create({ data: record })
      ),
      5 // Process 5 at a time
    )
  }
}

// Database performance monitoring
export const dbOptimizer = DatabaseOptimizer.getInstance()

// Export default optimized client
export const optimizedPrisma = ConnectionPoolManager.getPool('default', {
  maxConnections: 20,
  minConnections: 2,
  idleTimeout: 300000,
  acquireTimeout: 60000
})

// Performance monitoring middleware for Prisma
export function withDatabaseMonitoring<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now()
    
    try {
      const result = await fn(...args)
      const duration = performance.now() - startTime
      
      dbOptimizer.recordQueryMetric({
        query: operation,
        duration,
        timestamp: Date.now()
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      dbOptimizer.recordQueryMetric({
        query: operation,
        duration,
        timestamp: Date.now(),
        error: (error as Error).message
      })
      
      throw error
    }
  }
}