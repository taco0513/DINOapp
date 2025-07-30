/**
 * Analytics API with optimized caching
 * 성능 최적화된 분석 데이터 API
 */

import {
  withCache,
  CacheKeys,
  CacheTTL,
  memoryCache,
} from '@/lib/cache/memory-cache';
import type { CountryVisit } from '@/types/global';

export interface AnalyticsOverview {
  totalCountries: number;
  totalTripDays: number;
  schengenDaysUsed: number;
  yearlyActivity: {
    year: number;
    trips: number;
    countries: number;
    days: number;
  }[];
}

export interface CountryStats {
  country: string;
  countryCode: string;
  flag: string;
  visits: number;
  totalDays: number;
  isSchengen: boolean;
  lastVisit: string;
  visaTypes: string[];
}

export interface VisaBreakdown {
  visaType: string;
  count: number;
  percentage: number;
  totalDays: number;
  countries: string[];
}

export interface TravelTimeline {
  date: string;
  country: string;
  countryCode: string;
  flag: string;
  type: 'entry' | 'exit';
  visaType: string;
  days?: number;
}

export class AnalyticsAPI {
  /**
   * 사용자 분석 개요 데이터 조회 (캐시 적용)
   */
  static async getAnalyticsOverview(
    userId: string
  ): Promise<AnalyticsOverview> {
    const cacheKey = CacheKeys.USER_ANALYTICS_OVERVIEW(userId);

    return await withCache(
      cacheKey,
      async () => {
        // 실제 API 호출 또는 데이터베이스 쿼리
        const trips = await this.fetchUserTrips(userId);

        return this.calculateOverview(trips);
      },
      CacheTTL.ANALYTICS
    );
  }

  /**
   * 국가별 통계 데이터 조회 (캐시 적용)
   */
  static async getCountryStats(userId: string): Promise<CountryStats[]> {
    const cacheKey = CacheKeys.USER_ANALYTICS_COUNTRIES(userId);

    return await withCache(
      cacheKey,
      async () => {
        const trips = await this.fetchUserTrips(userId);

        return this.calculateCountryStats(trips);
      },
      CacheTTL.ANALYTICS
    );
  }

  /**
   * 비자 유형별 분석 데이터 조회 (캐시 적용)
   */
  static async getVisaBreakdown(userId: string): Promise<VisaBreakdown[]> {
    const cacheKey = CacheKeys.USER_ANALYTICS_VISA_BREAKDOWN(userId);

    return await withCache(
      cacheKey,
      async () => {
        const trips = await this.fetchUserTrips(userId);

        return this.calculateVisaBreakdown(trips);
      },
      CacheTTL.ANALYTICS
    );
  }

  /**
   * 여행 타임라인 데이터 조회 (캐시 적용)
   */
  static async getTravelTimeline(userId: string): Promise<TravelTimeline[]> {
    const cacheKey = CacheKeys.USER_ANALYTICS_TIMELINE(userId);

    return await withCache(
      cacheKey,
      async () => {
        const trips = await this.fetchUserTrips(userId);

        return this.calculateTimeline(trips);
      },
      CacheTTL.ANALYTICS
    );
  }

  /**
   * 캐시 무효화 - 새로운 여행 추가 시 호출
   */
  static invalidateUserCache(userId: string): void {
    memoryCache.delete(CacheKeys.USER_ANALYTICS_OVERVIEW(userId));
    memoryCache.delete(CacheKeys.USER_ANALYTICS_COUNTRIES(userId));
    memoryCache.delete(CacheKeys.USER_ANALYTICS_VISA_BREAKDOWN(userId));
    memoryCache.delete(CacheKeys.USER_ANALYTICS_TIMELINE(userId));

    // 연관된 캐시도 무효화
    memoryCache.delete(CacheKeys.USER_TRIPS(userId));
    memoryCache.delete(CacheKeys.USER_SCHENGEN_STATUS(userId));
  }

  /**
   * 사용자 여행 데이터 가져오기 (내부 함수)
   */
  private static async fetchUserTrips(userId: string): Promise<CountryVisit[]> {
    // 여행 데이터도 캐시 적용
    return await withCache(
      CacheKeys.USER_TRIPS(userId),
      async () => {
        // 실제 데이터베이스 쿼리 또는 API 호출
        const response = await fetch(`/api/trips?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch trips');

        const data = await response.json();
        return data.trips || [];
      },
      CacheTTL.USER_DATA
    );
  }

  /**
   * 개요 데이터 계산
   */
  private static calculateOverview(trips: CountryVisit[]): AnalyticsOverview {
    const countries = new Set(trips.map(trip => trip.country));
    const totalDays = trips.reduce((sum, trip) => {
      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil(
        (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(1, days);
    }, 0);

    // 셰겐 일수 계산 (예시)
    const schengenTrips = trips.filter(trip =>
      this.isSchengenCountry(trip.country)
    );
    const schengenDays = schengenTrips.reduce((sum, trip) => {
      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil(
        (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(1, days);
    }, 0);

    // 연도별 활동 계산
    const yearlyMap = new Map<
      number,
      { trips: number; countries: Set<string>; days: number }
    >();

    trips.forEach(trip => {
      const year = new Date(trip.entryDate).getFullYear();
      const existing = yearlyMap.get(year) || {
        trips: 0,
        countries: new Set(),
        days: 0,
      };

      existing.trips++;
      existing.countries.add(trip.country);

      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil(
        (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
      );
      existing.days += Math.max(1, days);

      yearlyMap.set(year, existing);
    });

    const yearlyActivity = Array.from(yearlyMap.entries())
      .map(([year, stats]) => ({
        year,
        trips: stats.trips,
        countries: stats.countries.size,
        days: stats.days,
      }))
      .sort((a, b) => b.year - a.year);

    return {
      totalCountries: countries.size,
      totalTripDays: totalDays,
      schengenDaysUsed: schengenDays,
      yearlyActivity,
    };
  }

  /**
   * 국가별 통계 계산
   */
  private static calculateCountryStats(trips: CountryVisit[]): CountryStats[] {
    const countryMap = new Map<
      string,
      {
        visits: number;
        totalDays: number;
        lastVisit: string;
        visaTypes: Set<string>;
      }
    >();

    trips.forEach(trip => {
      const existing = countryMap.get(trip.country) || {
        visits: 0,
        totalDays: 0,
        lastVisit: trip.entryDate,
        visaTypes: new Set(),
      };

      existing.visits++;
      existing.visaTypes.add(trip.visaType || 'Tourist');

      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil(
        (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
      );
      existing.totalDays += Math.max(1, days);

      if (trip.entryDate > existing.lastVisit) {
        existing.lastVisit = trip.entryDate;
      }

      countryMap.set(trip.country, existing);
    });

    return Array.from(countryMap.entries())
      .map(([country, stats]) => ({
        country,
        countryCode: this.getCountryCode(country),
        flag: this.getCountryFlag(country),
        visits: stats.visits,
        totalDays: stats.totalDays,
        isSchengen: this.isSchengenCountry(country),
        lastVisit: stats.lastVisit,
        visaTypes: Array.from(stats.visaTypes),
      }))
      .sort((a, b) => b.visits - a.visits);
  }

  /**
   * 비자 유형별 분석 계산
   */
  private static calculateVisaBreakdown(
    trips: CountryVisit[]
  ): VisaBreakdown[] {
    const visaMap = new Map<
      string,
      {
        count: number;
        totalDays: number;
        countries: Set<string>;
      }
    >();

    const totalTrips = trips.length;

    trips.forEach(trip => {
      const visaType = trip.visaType || 'Tourist';
      const existing = visaMap.get(visaType) || {
        count: 0,
        totalDays: 0,
        countries: new Set(),
      };

      existing.count++;
      existing.countries.add(trip.country);

      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil(
        (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
      );
      existing.totalDays += Math.max(1, days);

      visaMap.set(visaType, existing);
    });

    return Array.from(visaMap.entries())
      .map(([visaType, stats]) => ({
        visaType,
        count: stats.count,
        percentage: Math.round((stats.count / totalTrips) * 100),
        totalDays: stats.totalDays,
        countries: Array.from(stats.countries),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 여행 타임라인 계산
   */
  private static calculateTimeline(trips: CountryVisit[]): TravelTimeline[] {
    const timeline: TravelTimeline[] = [];

    trips.forEach(trip => {
      // 입국
      timeline.push({
        date: trip.entryDate,
        country: trip.country,
        countryCode: this.getCountryCode(trip.country),
        flag: this.getCountryFlag(trip.country),
        type: 'entry',
        visaType: trip.visaType || 'Tourist',
      });

      // 출국 (있는 경우)
      if (trip.exitDate) {
        const entry = new Date(trip.entryDate);
        const exit = new Date(trip.exitDate);
        const days = Math.ceil(
          (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
        );

        timeline.push({
          date: trip.exitDate,
          country: trip.country,
          countryCode: this.getCountryCode(trip.country),
          flag: this.getCountryFlag(trip.country),
          type: 'exit',
          visaType: trip.visaType || 'Tourist',
          days: Math.max(1, days),
        });
      }
    });

    return timeline.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // 유틸리티 함수들 - 중앙화된 국가 데이터 사용
  private static isSchengenCountry(country: string): boolean {
    // 실제 구현에서는 constants/countries.ts의 CountryUtils.isSchengenCountry 사용
    try {
      const { CountryUtils } = require('@/constants/countries');
      return CountryUtils.isSchengenCountry(country);
    } catch {
      // 폴백: 기본 셰겐 국가 목록
      const schengenCountries = [
        'Germany',
        'France',
        'Italy',
        'Spain',
        'Netherlands',
        'Belgium',
        'Austria',
        'Portugal',
        'Greece',
        'Czech Republic',
      ];
      return schengenCountries.includes(country);
    }
  }

  private static getCountryCode(country: string): string {
    // 실제 구현에서는 constants/countries.ts의 CountryUtils.getCountryByName 사용
    try {
      const { CountryUtils } = require('@/constants/countries');
      const countryData = CountryUtils.getCountryByName(country);
      return countryData?.code || 'XX';
    } catch {
      // 폴백: 기본 국가 코드 매핑
      const codes: Record<string, string> = {
        Germany: 'DE',
        France: 'FR',
        Italy: 'IT',
        Spain: 'ES',
        Netherlands: 'NL',
        Belgium: 'BE',
        Austria: 'AT',
        Portugal: 'PT',
      };
      return codes[country] || 'XX';
    }
  }

  private static getCountryFlag(country: string): string {
    // 실제 구현에서는 constants/countries.ts의 CountryUtils.getCountryByName 사용
    try {
      const { CountryUtils } = require('@/constants/countries');
      const countryData = CountryUtils.getCountryByName(country);
      return countryData?.flag || '🏳️';
    } catch {
      // 폴백: 기본 국기 매핑
      const flags: Record<string, string> = {
        Germany: '🇩🇪',
        France: '🇫🇷',
        Italy: '🇮🇹',
        Spain: '🇪🇸',
        Netherlands: '🇳🇱',
        Belgium: '🇧🇪',
        Austria: '🇦🇹',
        Portugal: '🇵🇹',
      };
      return flags[country] || '🏳️';
    }
  }
}
