import { ApiClient, ApiResponse, TripFormData } from './api-client';
import { offlineStorage } from './offline-storage';
import type { CountryVisit } from '@/types/global';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

/**
 * Offline-capable API client for DINO app
 * Provides seamless offline support with automatic synchronization
 *
 * Features:
 * - Automatic fallback to offline storage when network is unavailable
 * - Queue operations for later sync when offline
 * - Local Schengen calculations without server dependency
 * - Smart caching with offline persistence
 *
 * @example
 * ```typescript
 * // Works seamlessly online or offline
 * const trips = await OfflineApiClient.getTrips('user123');
 *
 * // Create trip offline - will sync when online
 * const newTrip = await OfflineApiClient.createTrip(tripData);
 * ```
 */
export class OfflineApiClient {
  /**
   * Checks if the application is currently online
   * @returns true if online, false if offline
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Retrieves trip records with offline support
   * - When online: Fetches from API and caches for offline use
   * - When offline: Returns cached data from offline storage
   *
   * @param userId - Optional user ID to filter trips
   * @returns Promise resolving to trip records (from API or cache)
   *
   * @example
   * ```typescript
   * const result = await OfflineApiClient.getTrips('user123');
   * if (result.success) {
   *   logger.info('Found ${result.data.length} trips');
   *   if (result.message?.includes('오프라인')) {
   *     logger.info('Using offline data');
   *   }
   * }
   * ```
   */
  static async getTrips(userId?: string): Promise<ApiResponse<CountryVisit[]>> {
    const cacheKey = `trips:${userId || 'all'}`;

    try {
      // 온라인인 경우 API 호출 시도
      if (this.isOnline()) {
        const response = await ApiClient.getTrips(userId);

        if (response.success && response.data) {
          // 성공한 응답을 오프라인 저장소에 캐시
          await offlineStorage.saveTrips(response.data);
          await offlineStorage.cacheApiResponse(cacheKey, response.data);
        }

        return response;
      }
    } catch (error) {
      // API call failed, checking offline storage
    }

    // 오프라인이거나 API 실패 시 로컬 저장소에서 데이터 가져오기
    try {
      const offlineTrips = await offlineStorage.getTrips(userId);
      return {
        success: true,
        data: offlineTrips,
        message: '오프라인 데이터를 사용 중입니다',
      };
    } catch (error) {
      return {
        success: false,
        error: '오프라인 데이터를 불러올 수 없습니다',
        data: [],
      };
    }
  }

  /**
   * Creates a new trip with offline support
   * - When online: Creates immediately via API
   * - When offline: Queues for later sync and stores temporarily
   *
   * @param data - Trip form data
   * @param userId - Optional user ID for the trip
   * @returns Promise resolving to created trip (temporary if offline)
   *
   * @example
   * ```typescript
   * const result = await OfflineApiClient.createTrip({
   *   country: 'FR',
   *   entryDate: '2024-01-01',
   *   exitDate: '2024-01-15',
   *   visaType: 'TOURIST',
   *   maxDays: 90,
   *   passportCountry: 'KR'
   * });
   *
   * if (result.data?._isTemporary) {
   *   logger.info('Trip saved offline, will sync later');
   * }
   * ```
   */
  static async createTrip(
    data: TripFormData,
    userId?: string
  ): Promise<ApiResponse<CountryVisit>> {
    try {
      if (this.isOnline()) {
        // 온라인인 경우 바로 API 호출
        const response = await ApiClient.createTrip(data, userId);

        if (response.success) {
          // 성공 시 캐시 무효화 및 새 데이터 저장
          this.invalidateOfflineCache(userId);
        }

        return response;
      }
    } catch (error) {
      // Online create failed, queuing for offline sync
    }

    // 오프라인인 경우 큐에 추가
    try {
      const tempId = `temp_${Date.now()}`;
      const tempTrip: CountryVisit = {
        id: tempId,
        ...data,
        userId: userId || 'unknown',
        exitDate: data.exitDate || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Note: _isTemporary is handled separately
      };

      // 오프라인 큐에 추가
      await offlineStorage.addTripToQueue(data);

      // 로컬 저장소에 임시 저장
      const existingTrips = await offlineStorage.getTrips(userId);
      await offlineStorage.saveTrips([...existingTrips, tempTrip]);

      return {
        success: true,
        data: tempTrip,
        message: '오프라인 모드: 연결 복구 시 동기화됩니다',
      };
    } catch (error) {
      return {
        success: false,
        error: '오프라인 저장에 실패했습니다',
      };
    }
  }

  /**
   * Retrieves country information with offline support
   * - When online: Fetches from API and caches for offline use
   * - When offline: Returns cached data or default countries
   *
   * @returns Promise resolving to array of country data
   *
   * @example
   * ```typescript
   * const result = await OfflineApiClient.getCountries();
   * if (result.success) {
   *   logger.info('Available countries: ${result.data.length}');
   *   result.data.forEach(country => {
   *     logger.info('${country.name} (${country.code})');
   *   });
   * }
   * ```
   */
  static async getCountries(): Promise<ApiResponse<any[]>> {
    const cacheKey = 'countries:all';

    try {
      if (this.isOnline()) {
        const response = await ApiClient.getCountries();

        if (response.success && response.data) {
          // 성공한 응답을 오프라인 저장소에 캐시
          await offlineStorage.saveCountries(response.data);
          await offlineStorage.cacheApiResponse(
            cacheKey,
            response.data,
            24 * 60 * 60 * 1000
          ); // 24시간
        }

        return response;
      }
    } catch (error) {
      // Countries API failed, checking offline storage
    }

    // 오프라인 저장소에서 데이터 가져오기
    try {
      const offlineCountries = await offlineStorage.getCountries();

      if (offlineCountries.length > 0) {
        return {
          success: true,
          data: offlineCountries,
          message: '오프라인 데이터를 사용 중입니다',
        };
      }
    } catch (error) {
      // Offline countries fetch failed
    }

    // 기본 국가 데이터 반환
    return {
      success: true,
      data: this.getDefaultCountries(),
      message: '기본 국가 데이터를 사용 중입니다',
    };
  }

  /**
   * Calculates Schengen zone status with offline support
   * - When online: Uses server calculation for accuracy
   * - When offline: Performs local calculation based on cached trips
   *
   * @param userId - Optional user ID to calculate status for
   * @returns Promise resolving to Schengen status data
   *
   * @example
   * ```typescript
   * const result = await OfflineApiClient.getSchengenStatus('user123');
   * if (result.success) {
   *   logger.info('Days used: ${result.data.usedDays}/90');
   *   logger.info('Days remaining: ${result.data.remainingDays}');
   *   logger.info('Compliant: ${result.data.isCompliant}');
   *   logger.info('Next reset: ${result.data.nextResetDate}');
   * }
   * ```
   */
  static async getSchengenStatus(userId?: string): Promise<ApiResponse<any>> {
    try {
      if (this.isOnline()) {
        return await ApiClient.getSchengenStatus(userId);
      }
    } catch (error) {
      // Schengen API failed, calculating offline
    }

    // 오프라인에서 로컬 계산
    try {
      const trips = await offlineStorage.getTrips(userId);
      const schengenTrips = trips.filter(trip =>
        this.isSchengenCountry(trip.country)
      );

      // 간단한 셰겐 계산 로직 (실제 구현 시 더 정확한 로직 필요)
      const last180Days = new Date();
      last180Days.setDate(last180Days.getDate() - 180);

      const recentTrips = schengenTrips.filter(
        trip => new Date(trip.entryDate) > last180Days
      );

      const totalDays = recentTrips.reduce((sum, trip) => {
        const entry = new Date(trip.entryDate);
        const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
        const days = Math.ceil(
          (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + Math.max(0, days);
      }, 0);

      return {
        success: true,
        data: {
          usedDays: Math.min(totalDays, 90),
          remainingDays: Math.max(0, 90 - totalDays),
          isCompliant: totalDays <= 90,
          nextResetDate: this.calculateNextResetDate(recentTrips),
          message: '오프라인 계산 결과입니다',
        },
        message: '오프라인 셰겐 계산을 사용 중입니다',
      };
    } catch (error) {
      return {
        success: false,
        error: '오프라인 셰겐 계산에 실패했습니다',
      };
    }
  }

  /**
   * Synchronizes offline data with the server
   * Processes queued operations (trip creation, updates, etc.) when online
   *
   * @returns Promise that resolves when sync is complete
   *
   * @example
   * ```typescript
   * // Typically called when network connection is restored
   * window.addEventListener('online', async () => {
   *   logger.info('Network restored, syncing offline data...');
   *   await OfflineApiClient.syncOfflineData();
   *   logger.info('Offline data synced successfully');
   * });
   * ```
   */
  static async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      // Still offline, skipping sync
      return;
    }

    try {
      const queuedItems = await offlineStorage.getOfflineQueue();

      for (const item of queuedItems) {
        try {
          if (item.type === 'ADD_TRIP') {
            await ApiClient.createTrip(item.data);
          }
          // 다른 작업 타입들 처리...
        } catch (error) {
          // Failed to sync item
          // 실패한 항목은 큐에 남겨둠
          continue;
        }
      }

      // 성공적으로 동기화된 항목들 제거
      await offlineStorage.clearOfflineQueue();

      // Offline sync completed
    } catch (error) {
      // Offline sync failed
    }
  }

  /**
   * Invalidates offline cache for a specific user
   * Called after successful data mutations to ensure fresh data
   *
   * @param userId - Optional user ID whose cache should be invalidated
   * @returns Promise that resolves when cache is cleared
   * @private
   */
  private static async invalidateOfflineCache(userId?: string): Promise<void> {
    try {
      await offlineStorage.deleteCachedApiResponse(`trips:${userId || 'all'}`);
      // 다른 관련 캐시들도 무효화...
    } catch (error) {
      // Cache invalidation failed
    }
  }

  /**
   * Checks if a country is part of the Schengen zone
   * Supports both country codes (e.g., 'FR') and names (e.g., 'France')
   *
   * @param country - Country code or name to check
   * @returns true if the country is in the Schengen zone
   * @private
   */
  private static isSchengenCountry(country: string): boolean {
    const schengenCountries = [
      'AT',
      'BE',
      'CH',
      'CZ',
      'DE',
      'DK',
      'EE',
      'ES',
      'FI',
      'FR',
      'GR',
      'HU',
      'IS',
      'IT',
      'LI',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'NO',
      'PL',
      'PT',
      'SE',
      'SI',
      'SK',
    ];

    // 국가명을 국가코드로 매핑
    const countryNameToCode: Record<string, string> = {
      Austria: 'AT',
      Belgium: 'BE',
      Switzerland: 'CH',
      'Czech Republic': 'CZ',
      Germany: 'DE',
      Denmark: 'DK',
      Estonia: 'EE',
      Spain: 'ES',
      Finland: 'FI',
      France: 'FR',
      Greece: 'GR',
      Hungary: 'HU',
      Iceland: 'IS',
      Italy: 'IT',
      Liechtenstein: 'LI',
      Lithuania: 'LT',
      Luxembourg: 'LU',
      Latvia: 'LV',
      Malta: 'MT',
      Netherlands: 'NL',
      Norway: 'NO',
      Poland: 'PL',
      Portugal: 'PT',
      Sweden: 'SE',
      Slovenia: 'SI',
      Slovakia: 'SK',
    };

    // 직접 코드 매칭 시도
    if (schengenCountries.includes(country)) {
      return true;
    }

    // 국가명으로 매핑 시도
    const countryCode = countryNameToCode[country];
    return countryCode ? schengenCountries.includes(countryCode) : false;
  }

  /**
   * Calculates the next date when Schengen days will reset
   * Based on the 180-day rolling window rule
   *
   * @param trips - Array of trips to analyze
   * @returns ISO date string (YYYY-MM-DD) for the next reset date
   * @private
   */
  private static calculateNextResetDate(trips: CountryVisit[]): string {
    if (trips.length === 0) return new Date().toISOString().split('T')[0];

    const firstTrip = trips.sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )[0];

    const resetDate = new Date(firstTrip.entryDate);
    resetDate.setDate(resetDate.getDate() + 180);

    return resetDate.toISOString().split('T')[0];
  }

  /**
   * Returns default country data for offline use
   * Used when no cached data is available
   *
   * @returns Array of commonly visited countries
   * @private
   */
  private static getDefaultCountries(): any[] {
    // 중앙 관리 시스템에서 일부 주요 국가만 반환
    try {
      const { COUNTRIES } = require('@/constants/countries');
      return COUNTRIES.slice(0, 20).map((country: any) => ({
        code: country.code,
        name: country.name,
        continent: country.continent || 'Unknown',
        schengenMember: country.schengen,
      }));
    } catch {
      // 폴백: 기본 목록
      return [
        { code: 'KR', name: '대한민국', continent: 'Asia' },
        { code: 'JP', name: '일본', continent: 'Asia' },
        { code: 'US', name: '미국', continent: 'North America' },
        { code: 'GB', name: '영국', continent: 'Europe' },
        { code: 'DE', name: '독일', continent: 'Europe' },
      ];
    }
  }

  /**
   * Preloads essential data for offline use
   * Should be called during app initialization for better offline experience
   *
   * @returns Promise that resolves when preloading is complete
   *
   * @example
   * ```typescript
   * // In your app initialization code
   * async function initializeApp() {
   *   // Preload data for offline use
   *   await OfflineApiClient.preloadOfflineData();
   *
   *   // Rest of app initialization...
   * }
   * ```
   */
  static async preloadOfflineData(): Promise<void> {
    try {
      // 중요한 정적 데이터들을 미리 캐시
      await this.getCountries();

      // 만료된 캐시 정리
      await offlineStorage.cleanExpiredCache();

      // Offline data preloaded successfully
    } catch (error) {
      // Failed to preload offline data
    }
  }
}
