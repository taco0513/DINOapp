/**
 * Database Query Optimizer
 * Provides optimized queries and performance monitoring for database operations  
 */

import { PrismaClient } from '@prisma/client'
import { loggers } from '@/lib/monitoring/logger'
import { getPrismaClient } from '@/lib/database/connection-manager'

export interface QueryMetrics {
  query: string
  duration: number
  rows?: number
  cached?: boolean
  timestamp: Date
}

export interface OptimizedTripQuery {
  userId: string
  startDate?: Date
  endDate?: Date
  status?: 'PLANNED' | 'COMPLETED' | 'CANCELLED'
  countryCode?: string
  limit?: number
  offset?: number
}

export class QueryOptimizer {
  private queryMetrics: QueryMetrics[] = []
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private logger = loggers.performance

  constructor(private maxMetrics = 1000, private defaultCacheTtl = 300000) {}

  /**
   * Optimized trip queries with caching and performance monitoring
   */
  async getTripsOptimized(params: OptimizedTripQuery) {
    const cacheKey = this.generateCacheKey('trips', params)
    const startTime = Date.now()

    // Check cache first
    const cached = this.getCached(cacheKey)
    if (cached) {
      this.recordMetric({
        query: 'trips-cached',
        duration: Date.now() - startTime,
        cached: true,
        timestamp: new Date()
      })
      return cached
    }

    try {
      const prisma = await getPrismaClient()
      
      // Build optimized query
      const whereClause: any = {
        userId: params.userId
      }

      if (params.startDate || params.endDate) {
        whereClause.entryDate = {}
        if (params.startDate) {
          whereClause.entryDate.gte = params.startDate
        }
        if (params.endDate) {
          whereClause.entryDate.lte = params.endDate
        }
      }

      if (params.status) {
        whereClause.status = params.status
      }

      if (params.countryCode) {
        whereClause.countryCode = params.countryCode
      }

      // Execute optimized query with proper indexing
      const trips = await prisma.trip.findMany({
        where: whereClause,
        orderBy: [
          { entryDate: 'desc' },
          { createdAt: 'desc' }
        ],
        take: params.limit || 50,
        skip: params.offset || 0,
        select: {
          id: true,
          countryCode: true,
          entryDate: true,
          exitDate: true,
          purpose: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      })

      const duration = Date.now() - startTime
      
      // Cache successful results
      this.setCache(cacheKey, trips, this.defaultCacheTtl)

      // Record metrics
      this.recordMetric({
        query: 'trips-optimized',
        duration,
        rows: trips.length,
        cached: false,
        timestamp: new Date()
      })

      // Log slow queries
      if (duration > 1000) {
        this.logger.warn('Slow trip query detected', {
          duration,
          params,
          rowCount: trips.length
        })
      }

      return trips

    } catch (error) {
      this.logger.error('Trip query failed', {
        error: error instanceof Error ? error.message : error,
        params,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  /**
   * Optimized Schengen calculation query
   */
  async getSchengenTripsOptimized(userId: string, referenceDate: Date = new Date()) {
    const cacheKey = this.generateCacheKey('schengen', { userId, referenceDate: referenceDate.toISOString() })
    const startTime = Date.now()

    const cached = this.getCached(cacheKey)
    if (cached) {
      this.recordMetric({
        query: 'schengen-cached',
        duration: Date.now() - startTime,
        cached: true,
        timestamp: new Date()
      })
      return cached
    }

    try {
      const prisma = await getPrismaClient()
      
      // Get trips from 6 months ago to cover 180-day rolling period
      const sixMonthsAgo = new Date(referenceDate)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      // Schengen countries
      const schengenCountries = [
        'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
        'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
        'PT', 'SK', 'SI', 'ES', 'SE', 'CH'
      ]

      const schengenTrips = await prisma.trip.findMany({
        where: {
          userId,
          countryCode: {
            in: schengenCountries
          },
          entryDate: {
            gte: sixMonthsAgo,
            lte: referenceDate
          }
        },
        orderBy: {
          entryDate: 'asc'
        },
        select: {
          countryCode: true,
          entryDate: true,
          exitDate: true,
          status: true
        }
      })

      const duration = Date.now() - startTime

      // Cache for 1 hour (Schengen calculations don't change frequently)
      this.setCache(cacheKey, schengenTrips, 3600000)

      this.recordMetric({
        query: 'schengen-optimized',
        duration,
        rows: schengenTrips.length,
        cached: false,
        timestamp: new Date()
      })

      return schengenTrips

    } catch (error) {
      this.logger.error('Schengen query failed', {
        error: error instanceof Error ? error.message : error,
        userId,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  /**
   * Optimized user stats query
   */
  async getUserStatsOptimized(userId: string) {
    const cacheKey = this.generateCacheKey('user-stats', { userId })
    const startTime = Date.now()

    const cached = this.getCached(cacheKey)
    if (cached) {
      this.recordMetric({
        query: 'user-stats-cached',
        duration: Date.now() - startTime,
        cached: true,
        timestamp: new Date()
      })
      return cached
    }

    try {
      const prisma = await getPrismaClient()

      // Use aggregation queries for better performance
      const [
        totalTrips,
        completedTrips,
        countriesVisited,
        recentTrips
      ] = await Promise.all([
        prisma.trip.count({
          where: { userId }
        }),
        prisma.trip.count({
          where: { userId, status: 'COMPLETED' }
        }),
        prisma.trip.groupBy({
          by: ['countryCode'],
          where: { userId, status: 'COMPLETED' }
        }),
        prisma.trip.findMany({
          where: { userId },
          orderBy: { entryDate: 'desc' },
          take: 5,
          select: {
            countryCode: true,
            entryDate: true,
            exitDate: true,
            status: true
          }
        })
      ])

      const stats = {
        totalTrips,
        completedTrips,
        plannedTrips: totalTrips - completedTrips,
        countriesVisited: countriesVisited.length,
        recentTrips
      }

      const duration = Date.now() - startTime

      // Cache for 5 minutes
      this.setCache(cacheKey, stats, 300000)

      this.recordMetric({
        query: 'user-stats-optimized', 
        duration,
        cached: false,
        timestamp: new Date()
      })

      return stats

    } catch (error) {
      this.logger.error('User stats query failed', {
        error: error instanceof Error ? error.message : error,
        userId,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchCreateTrips(userId: string, trips: any[]) {
    const startTime = Date.now()

    try {
      const prisma = await getPrismaClient()

      // Use transaction for batch operations
      const result = await prisma.$transaction(
        trips.map(trip => 
          prisma.trip.create({
            data: {
              ...trip,
              userId
            }
          })
        )
      )

      const duration = Date.now() - startTime

      // Invalidate related caches
      this.invalidateUserCaches(userId)

      this.recordMetric({
        query: 'batch-create-trips',
        duration,
        rows: result.length,
        cached: false,
        timestamp: new Date()
      })

      this.logger.info('Batch trip creation completed', {
        userId,
        tripCount: trips.length,
        duration
      })

      return result

    } catch (error) {
      this.logger.error('Batch trip creation failed', {
        error: error instanceof Error ? error.message : error,
        userId,
        tripCount: trips.length,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  /**
   * Cache management
   */
  private generateCacheKey(prefix: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort())
    return `${prefix}:${Buffer.from(paramString).toString('base64').slice(0, 16)}`
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private invalidateUserCaches(userId: string): void {
    // Clear all caches for this user
    for (const [key] of this.cache) {
      if (key.includes(userId)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Performance monitoring
   */
  private recordMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric)

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetrics) {
      this.queryMetrics.splice(0, this.queryMetrics.length - this.maxMetrics)
    }
  }

  getQueryMetrics(): QueryMetrics[] {
    return [...this.queryMetrics]
  }

  getPerformanceStats() {
    if (this.queryMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        cacheHitRate: 0
      }
    }

    const totalQueries = this.queryMetrics.length
    const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration = totalDuration / totalQueries
    const slowQueries = this.queryMetrics.filter(m => m.duration > 1000).length
    const cachedQueries = this.queryMetrics.filter(m => m.cached).length
    const cacheHitRate = (cachedQueries / totalQueries) * 100

    return {
      totalQueries,
      averageDuration: Math.round(averageDuration),
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  clearMetrics(): void {
    this.queryMetrics = []
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer()