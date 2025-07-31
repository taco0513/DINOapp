/**
 * Database Query Optimizer for Production Performance
 * 프로덕션 성능을 위한 데이터베이스 쿼리 최적화
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { getPrismaClient } from './dev-prisma';
const prisma = getPrismaClient();

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  recordCount?: number;
  error?: string;
}

interface CacheOptions {
  ttl: number; // Time to live in seconds
  key: string;
}

class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryMetrics: QueryMetrics[] = [];
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly MAX_METRICS = 1000; // 최대 메트릭 보관 수
  private readonly DEFAULT_CACHE_TTL = 300; // 5분

  private constructor() {}

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * 캐시된 쿼리 실행
   */
  public async executeWithCache<T>(
    queryFn: () => Promise<T>,
    cacheOptions: CacheOptions
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(cacheOptions.key);

    // 캐시 히트
    if (cached && cached.expires > now) {
      return cached.data as T;
    }

    // 캐시 미스 - 쿼리 실행
    const result = await queryFn();

    // 캐시 저장
    this.cache.set(cacheOptions.key, {
      data: result,
      expires: now + cacheOptions.ttl * 1000,
    });

    return result;
  }

  /**
   * 메트릭과 함께 쿼리 실행
   */
  public async executeWithMetrics<T>(
    queryFn: () => Promise<T>,
    queryName: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        recordCount: Array.isArray(result) ? result.length : 1,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 에러 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private recordMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // 메트릭 수 제한
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * 쿼리 성능 통계
   */
  public getQueryStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: QueryMetrics[];
    errorQueries: QueryMetrics[];
    cacheHitRate: number;
  } {
    const total = this.queryMetrics.length;
    const totalDuration = this.queryMetrics.reduce(
      (sum, m) => sum + m.duration,
      0
    );
    const slowQueries = this.queryMetrics.filter(m => m.duration > 1000); // 1초 이상
    const errorQueries = this.queryMetrics.filter(m => m.error);

    return {
      totalQueries: total,
      averageDuration: total > 0 ? totalDuration / total : 0,
      slowQueries,
      errorQueries,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  private calculateCacheHitRate(): number {
    // 간단한 캐시 히트율 계산 (실제 구현에서는 더 정교한 추적 필요)
    return this.cache.size > 0 ? 0.8 : 0; // 임시값
  }

  /**
   * 캐시 정리
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 통계
   */
  public getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Optimized query helpers
export const queryOptimizer = QueryOptimizer.getInstance();

/**
 * 사용자의 여행 기록 조회 (최적화된 버전)
 */
export async function getUserTripsOptimized(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    country?: string;
    fromDate?: Date;
    toDate?: Date;
    includeActive?: boolean;
  } = {}
) {
  const cacheKey = `user_trips_${userId}_${JSON.stringify(options)}`;

  return queryOptimizer.executeWithCache(
    async () => {
      return queryOptimizer.executeWithMetrics(async () => {
        const where: Prisma.CountryVisitWhereInput = {
          userId,
          ...(options.country && { country: options.country }),
          ...(options.fromDate && { entryDate: { gte: options.fromDate } }),
          ...(options.toDate && { entryDate: { lte: options.toDate } }),
          ...(options.includeActive !== undefined && {
            exitDate: options.includeActive ? null : { not: null },
          }),
        };

        return prisma.countryVisit.findMany({
          where,
          orderBy: { entryDate: 'desc' },
          take: options.limit,
          skip: options.offset,
          select: {
            id: true,
            country: true,
            entryDate: true,
            exitDate: true,
            visaType: true,
            maxDays: true,
            passportCountry: true,
            notes: true,
            createdAt: true,
          },
        });
      }, `getUserTrips_${userId}`);
    },
    { key: cacheKey, ttl: 300 } // 5분 캐시
  );
}

/**
 * 셰겐 계산을 위한 최적화된 쿼리
 */
export async function getSchengenTripsOptimized(
  userId: string,
  fromDate: Date,
  toDate: Date
) {
  const cacheKey = `schengen_${userId}_${fromDate.getTime()}_${toDate.getTime()}`;

  return queryOptimizer.executeWithCache(
    async () => {
      return queryOptimizer.executeWithMetrics(async () => {
        // 셰겐 국가 목록
        const schengenCountries = [
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
        ];

        return prisma.countryVisit.findMany({
          where: {
            userId,
            country: { in: schengenCountries },
            OR: [
              {
                // 기간 내 입국
                entryDate: {
                  gte: fromDate,
                  lte: toDate,
                },
              },
              {
                // 기간 내 출국
                exitDate: {
                  gte: fromDate,
                  lte: toDate,
                },
              },
              {
                // 기간을 가로지르는 체류
                AND: [
                  { entryDate: { lte: fromDate } },
                  {
                    OR: [{ exitDate: { gte: toDate } }, { exitDate: null }],
                  },
                ],
              },
            ],
          },
          orderBy: { entryDate: 'asc' },
          select: {
            id: true,
            country: true,
            entryDate: true,
            exitDate: true,
            visaType: true,
          },
        });
      }, `getSchengenTrips_${userId}`);
    },
    { key: cacheKey, ttl: 600 } // 10분 캐시 (계산이 복잡하므로 더 길게)
  );
}

/**
 * 대시보드 통계를 위한 최적화된 쿼리
 */
export async function getDashboardStatsOptimized(userId: string) {
  const cacheKey = `dashboard_stats_${userId}`;

  return queryOptimizer.executeWithCache(
    async () => {
      return queryOptimizer.executeWithMetrics(async () => {
        const [totalTrips, activeTrips, countries, recentTrips] =
          await Promise.all([
            // 총 여행 횟수
            prisma.countryVisit.count({
              where: { userId },
            }),

            // 현재 체류 중인 여행
            prisma.countryVisit.count({
              where: {
                userId,
                exitDate: null,
              },
            }),

            // 방문한 국가 수
            prisma.countryVisit.findMany({
              where: { userId },
              select: { country: true },
              distinct: ['country'],
            }),

            // 최근 5개 여행
            prisma.countryVisit.findMany({
              where: { userId },
              orderBy: { entryDate: 'desc' },
              take: 5,
              select: {
                id: true,
                country: true,
                entryDate: true,
                exitDate: true,
                visaType: true,
              },
            }),
          ]);

        return {
          totalTrips,
          activeTrips,
          uniqueCountries: countries.length,
          recentTrips,
        };
      }, `getDashboardStats_${userId}`);
    },
    { key: cacheKey, ttl: 1800 } // 30분 캐시
  );
}

// 정기적으로 만료된 캐시 정리
setInterval(() => {
  queryOptimizer.clearExpiredCache();
}, 60000); // 1분마다
