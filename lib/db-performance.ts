/**
 * Database Performance Optimization and Monitoring
 * Advanced query optimization, connection pooling, and performance analysis
 */

import { PrismaClient } from '@prisma/client';

// Enhanced Prisma configuration for production performance
export const _createOptimizedPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'minimal',
  });
};

// Query performance monitoring
interface QueryMetric {
  query: string;
  duration: number;
  timestamp: number;
  params?: any;
}

class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private queryMetrics: QueryMetric[] = [];
  private slowQueryThreshold = 100; // 100ms

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  trackQuery(query: string, duration: number, params?: any) {
    const metric: QueryMetric = {
      query,
      duration,
      timestamp: Date.now(),
      params,
    };

    this.queryMetrics.push(metric);

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      // Slow query detected
    }

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  }

  getSlowQueries(threshold: number = this.slowQueryThreshold): QueryMetric[] {
    return this.queryMetrics.filter(metric => metric.duration > threshold);
  }

  getAverageQueryTime(): number {
    if (this.queryMetrics.length === 0) return 0;
    const total = this.queryMetrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    return total / this.queryMetrics.length;
  }

  getPerformanceReport() {
    const totalQueries = this.queryMetrics.length;
    const slowQueries = this.getSlowQueries();
    const averageTime = this.getAverageQueryTime();

    return {
      totalQueries,
      slowQueriesCount: slowQueries.length,
      slowQueriesPercentage:
        totalQueries > 0 ? (slowQueries.length / totalQueries) * 100 : 0,
      averageQueryTime: averageTime,
      slowestQuery:
        this.queryMetrics.length > 0
          ? this.queryMetrics.reduce((max, metric) =>
              metric.duration > max.duration ? metric : max
            )
          : null,
    };
  }
}

// Database connection pool management
export class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private clients: Map<string, PrismaClient> = new Map();
  private maxConnections = 10;

  static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  getClient(context: string = 'default'): PrismaClient {
    if (!this.clients.has(context)) {
      if (this.clients.size >= this.maxConnections) {
        // Reuse existing client
        return Array.from(this.clients.values())[0];
      }

      this.clients.set(context, createOptimizedPrismaClient());
    }

    return this.clients.get(context)!;
  }

  async closeAll() {
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
    this.clients.clear();
  }
}

// Optimized query builders with caching
export class OptimizedQueries {
  private static cache = new Map<string, { data: any; expiry: number }>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(query: string, params: any): string {
    return `${query}_${JSON.stringify(params)}`;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private static setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTimeout,
    });
  }

  // Optimized user queries with selective field loading
  static async getUserWithTrips(
    prisma: PrismaClient,
    userId: string,
    limit: number = 50
  ) {
    const cacheKey = this.getCacheKey('getUserWithTrips', { userId, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();

    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        passportCountry: true,
        timezone: true,
        countryVisits: {
          select: {
            id: true,
            country: true,
            entryDate: true,
            exitDate: true,
            visaType: true,
            maxDays: true,
            notes: true,
          },
          orderBy: { entryDate: 'desc' },
          take: limit,
        },
        notificationSettings: {
          select: {
            visaExpiryDays: true,
            schengenWarningDays: true,
            emailEnabled: true,
            pushEnabled: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    DatabasePerformanceMonitor.getInstance().trackQuery(
      'getUserWithTrips',
      duration,
      { userId, limit }
    );

    this.setCache(cacheKey, result);
    return result;
  }

  // Optimized Schengen calculation with compound indexes
  static async getSchengenVisitsOptimized(
    prisma: PrismaClient,
    userId: string,
    fromDate: Date,
    toDate: Date = new Date()
  ) {
    const cacheKey = this.getCacheKey('getSchengenVisits', {
      userId,
      fromDate,
      toDate,
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const _startTime = Date.now();

    // Use optimized query with compound index [userId, entryDate, exitDate]
    const result = await prisma.countryVisit.findMany({
      where: {
        userId,
        country: {
          in: [
            'Austria',
            'Belgium',
            'Czech Republic',
            'Denmark',
            'Estonia',
            'Finland',
            'France',
            'Germany',
            'Greece',
            'Hungary',
            'Iceland',
            'Italy',
            'Latvia',
            'Lithuania',
            'Luxembourg',
            'Malta',
            'Netherlands',
            'Norway',
            'Poland',
            'Portugal',
            'Slovakia',
            'Slovenia',
            'Spain',
            'Sweden',
            'Switzerland',
          ],
        },
        OR: [
          {
            entryDate: {
              gte: fromDate,
              lte: toDate,
            },
          },
          {
            exitDate: {
              gte: fromDate,
              lte: toDate,
            },
          },
          {
            AND: [
              { entryDate: { lte: fromDate } },
              { exitDate: { gte: toDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        exitDate: true,
        visaType: true,
        maxDays: true,
      },
      orderBy: { entryDate: 'asc' },
    });

    const duration = Date.now() - startTime;
    DatabasePerformanceMonitor.getInstance().trackQuery(
      'getSchengenVisitsOptimized',
      duration,
      { userId, fromDate, toDate }
    );

    this.setCache(cacheKey, result);
    return result;
  }

  // Optimized country statistics with aggregation
  static async getCountryStatistics(prisma: PrismaClient, userId: string) {
    const cacheKey = this.getCacheKey('getCountryStatistics', { userId });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();

    // Use raw query for better performance on aggregation
    const result = await prisma.$queryRaw`
      SELECT 
        country,
        COUNT(*) as visit_count,
        SUM(
          CASE 
            WHEN "exitDate" IS NOT NULL THEN 
              EXTRACT(DAY FROM ("exitDate" - "entryDate"))
            ELSE 0
          END
        ) as total_days,
        MIN("entryDate") as first_visit,
        MAX("entryDate") as last_visit
      FROM "CountryVisit"
      WHERE "userId" = ${userId}
      GROUP BY country
      ORDER BY visit_count DESC, total_days DESC
    `;

    const duration = Date.now() - startTime;
    DatabasePerformanceMonitor.getInstance().trackQuery(
      'getCountryStatistics',
      duration,
      { userId }
    );

    this.setCache(cacheKey, result);
    return result;
  }

  // Batch operations for better performance
  static async createMultipleVisits(prisma: PrismaClient, visits: any[]) {
    const startTime = Date.now();

    const result = await prisma.countryVisit.createMany({
      data: visits,
      skipDuplicates: true,
    });

    const duration = Date.now() - startTime;
    DatabasePerformanceMonitor.getInstance().trackQuery(
      'createMultipleVisits',
      duration,
      { count: visits.length }
    );

    return result;
  }

  // Clear cache for specific patterns
  static clearUserCache(userId: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        this.cache.delete(key);
      }
    }
  }

  static clearAllCache() {
    this.cache.clear();
  }
}

// Database health check and optimization utilities
export class DatabaseMaintenance {
  static async checkDatabaseHealth(prisma: PrismaClient) {
    const startTime = Date.now();

    try {
      // Basic connectivity test
      await prisma.$queryRaw`SELECT 1`;

      // Check table statistics
      const tableStats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
      `;

      // Check index usage
      const indexStats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_tup_read DESC
      `;

      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        connectionTime: duration,
        tableStats,
        indexStats,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  static async analyzeQueryPerformance(prisma: PrismaClient) {
    try {
      // Get slow queries from PostgreSQL
      const slowQueries = await prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 20
      `;

      return {
        slowQueries,
        recommendations: this.generatePerformanceRecommendations(
          slowQueries as any[]
        ),
      };
    } catch (error) {
      // pg_stat_statements might not be enabled
      return {
        slowQueries: [],
        recommendations: [
          'Enable pg_stat_statements extension for query analysis',
        ],
        error: 'pg_stat_statements not available',
      };
    }
  }

  private static generatePerformanceRecommendations(
    slowQueries: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (slowQueries.length === 0) {
      recommendations.push('Database performance looks good');
      return recommendations;
    }

    slowQueries.forEach(query => {
      if (query.mean_time > 1000) {
        recommendations.push(
          `Critical: Query taking ${query.mean_time}ms on average needs optimization`
        );
      } else if (query.mean_time > 500) {
        recommendations.push(
          `Warning: Query taking ${query.mean_time}ms could be optimized`
        );
      }
    });

    recommendations.push(
      'Consider adding indexes for frequently filtered columns'
    );
    recommendations.push(
      'Review query patterns and consider denormalization for read-heavy operations'
    );

    return recommendations;
  }

  static async optimizeDatabase(prisma: PrismaClient) {
    try {
      // Analyze tables for query planning
      await prisma.$executeRaw`ANALYZE`;

      // Update table statistics
      await prisma.$executeRaw`VACUUM ANALYZE`;

      return {
        status: 'success',
        message: 'Database optimization completed',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instances
export const dbPerformanceMonitor = DatabasePerformanceMonitor.getInstance();
export const _dbConnectionPool = DatabaseConnectionPool.getInstance();

// Performance middleware for API routes
export function createDatabasePerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const originalQuery = PrismaClient.prototype.$queryRaw;
    const _startTime = Date.now();

    // Override query method to track performance
    const trackQuery = function (this: any, query: any, ...args: any[]) {
      const queryStartTime = Date.now();
      const result = originalQuery.call(this, query, ...args);

      if (result instanceof Promise) {
        result.then(() => {
          const duration = Date.now() - queryStartTime;
          dbPerformanceMonitor.trackQuery(query.toString(), duration);
        });
      }

      return result;
    };

    // Restore original method after request
    res.on('finish', () => {
      PrismaClient.prototype.$queryRaw = originalQuery;
    });

    next();
  };
}

export type { QueryMetric };
