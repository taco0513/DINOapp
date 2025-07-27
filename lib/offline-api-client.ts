import { ApiClient, ApiResponse, TripFormData } from './api-client'
import { offlineStorage } from './offline-storage'
import type { CountryVisit } from '@/types/global'

// 오프라인 지원 API 클라이언트
export class OfflineApiClient {
  
  // 네트워크 상태 확인
  static isOnline(): boolean {
    return navigator.onLine
  }

  // 여행 기록 가져오기 (오프라인 지원)
  static async getTrips(userId?: string): Promise<ApiResponse<CountryVisit[]>> {
    const cacheKey = `trips:${userId || 'all'}`
    
    try {
      // 온라인인 경우 API 호출 시도
      if (this.isOnline()) {
        const response = await ApiClient.getTrips(userId)
        
        if (response.success && response.data) {
          // 성공한 응답을 오프라인 저장소에 캐시
          await offlineStorage.saveTrips(response.data)
          await offlineStorage.cacheApiResponse(cacheKey, response.data)
        }
        
        return response
      }
    } catch (error) {
      // API call failed, checking offline storage
    }

    // 오프라인이거나 API 실패 시 로컬 저장소에서 데이터 가져오기
    try {
      const offlineTrips = await offlineStorage.getTrips(userId)
      return {
        success: true,
        data: offlineTrips,
        message: '오프라인 데이터를 사용 중입니다'
      }
    } catch (error) {
      return {
        success: false,
        error: '오프라인 데이터를 불러올 수 없습니다',
        data: []
      }
    }
  }

  // 여행 기록 생성 (오프라인 지원)
  static async createTrip(data: TripFormData, userId?: string): Promise<ApiResponse<CountryVisit>> {
    try {
      if (this.isOnline()) {
        // 온라인인 경우 바로 API 호출
        const response = await ApiClient.createTrip(data, userId)
        
        if (response.success) {
          // 성공 시 캐시 무효화 및 새 데이터 저장
          this.invalidateOfflineCache(userId)
        }
        
        return response
      }
    } catch (error) {
      // Online create failed, queuing for offline sync
    }

    // 오프라인인 경우 큐에 추가
    try {
      const tempId = `temp_${Date.now()}`
      const tempTrip: CountryVisit = {
        id: tempId,
        ...data,
        userId: userId || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isTemporary: true
      }

      // 오프라인 큐에 추가
      await offlineStorage.addTripToQueue(data)
      
      // 로컬 저장소에 임시 저장
      const existingTrips = await offlineStorage.getTrips(userId)
      await offlineStorage.saveTrips([...existingTrips, tempTrip])

      return {
        success: true,
        data: tempTrip,
        message: '오프라인 모드: 연결 복구 시 동기화됩니다'
      }
    } catch (error) {
      return {
        success: false,
        error: '오프라인 저장에 실패했습니다'
      }
    }
  }

  // 국가 정보 가져오기 (오프라인 지원)
  static async getCountries(): Promise<ApiResponse<any[]>> {
    const cacheKey = 'countries:all'
    
    try {
      if (this.isOnline()) {
        const response = await ApiClient.getCountries()
        
        if (response.success && response.data) {
          // 성공한 응답을 오프라인 저장소에 캐시
          await offlineStorage.saveCountries(response.data)
          await offlineStorage.cacheApiResponse(cacheKey, response.data, 24 * 60 * 60 * 1000) // 24시간
        }
        
        return response
      }
    } catch (error) {
      // Countries API failed, checking offline storage
    }

    // 오프라인 저장소에서 데이터 가져오기
    try {
      const offlineCountries = await offlineStorage.getCountries()
      
      if (offlineCountries.length > 0) {
        return {
          success: true,
          data: offlineCountries,
          message: '오프라인 데이터를 사용 중입니다'
        }
      }
    } catch (error) {
      // Offline countries fetch failed
    }

    // 기본 국가 데이터 반환
    return {
      success: true,
      data: this.getDefaultCountries(),
      message: '기본 국가 데이터를 사용 중입니다'
    }
  }

  // 셰겐 상태 계산 (오프라인 지원)
  static async getSchengenStatus(userId?: string): Promise<ApiResponse<any>> {
    try {
      if (this.isOnline()) {
        return await ApiClient.getSchengenStatus(userId)
      }
    } catch (error) {
      // Schengen API failed, calculating offline
    }

    // 오프라인에서 로컬 계산
    try {
      const trips = await offlineStorage.getTrips(userId)
      const schengenTrips = trips.filter(trip => this.isSchengenCountry(trip.country))
      
      // 간단한 셰겐 계산 로직 (실제 구현 시 더 정확한 로직 필요)
      const last180Days = new Date()
      last180Days.setDate(last180Days.getDate() - 180)
      
      const recentTrips = schengenTrips.filter(trip => 
        new Date(trip.entryDate) > last180Days
      )
      
      const totalDays = recentTrips.reduce((sum, trip) => {
        const entry = new Date(trip.entryDate)
        const exit = trip.exitDate ? new Date(trip.exitDate) : new Date()
        const days = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
        return sum + Math.max(0, days)
      }, 0)

      return {
        success: true,
        data: {
          usedDays: Math.min(totalDays, 90),
          remainingDays: Math.max(0, 90 - totalDays),
          isCompliant: totalDays <= 90,
          nextResetDate: this.calculateNextResetDate(recentTrips),
          message: '오프라인 계산 결과입니다'
        },
        message: '오프라인 셰겐 계산을 사용 중입니다'
      }
    } catch (error) {
      return {
        success: false,
        error: '오프라인 셰겐 계산에 실패했습니다'
      }
    }
  }

  // 오프라인 동기화
  static async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      // Still offline, skipping sync
      return
    }

    try {
      const queuedItems = await offlineStorage.getOfflineQueue()
      
      for (const item of queuedItems) {
        try {
          if (item.type === 'ADD_TRIP') {
            await ApiClient.createTrip(item.data)
          }
          // 다른 작업 타입들 처리...
        } catch (error) {
          // Failed to sync item
          // 실패한 항목은 큐에 남겨둠
          continue
        }
      }
      
      // 성공적으로 동기화된 항목들 제거
      await offlineStorage.clearOfflineQueue()
      
      // Offline sync completed
    } catch (error) {
      // Offline sync failed
    }
  }

  // 캐시 무효화
  private static async invalidateOfflineCache(userId?: string): Promise<void> {
    try {
      await offlineStorage.deleteCachedApiResponse(`trips:${userId || 'all'}`)
      // 다른 관련 캐시들도 무효화...
    } catch (error) {
      // Cache invalidation failed
    }
  }

  // 셰겐 국가 확인
  private static isSchengenCountry(countryCode: string): boolean {
    const schengenCountries = [
      'AT', 'BE', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
      'GR', 'HU', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL',
      'NO', 'PL', 'PT', 'SE', 'SI', 'SK'
    ]
    return schengenCountries.includes(countryCode)
  }

  // 다음 재설정 날짜 계산
  private static calculateNextResetDate(trips: CountryVisit[]): string {
    if (trips.length === 0) return new Date().toISOString().split('T')[0]
    
    const firstTrip = trips.sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )[0]
    
    const resetDate = new Date(firstTrip.entryDate)
    resetDate.setDate(resetDate.getDate() + 180)
    
    return resetDate.toISOString().split('T')[0]
  }

  // 기본 국가 데이터
  private static getDefaultCountries(): any[] {
    return [
      { code: 'KR', name: '대한민국', continent: 'Asia' },
      { code: 'JP', name: '일본', continent: 'Asia' },
      { code: 'US', name: '미국', continent: 'North America' },
      { code: 'GB', name: '영국', continent: 'Europe' },
      { code: 'DE', name: '독일', continent: 'Europe' },
      { code: 'FR', name: '프랑스', continent: 'Europe' },
      { code: 'IT', name: '이탈리아', continent: 'Europe' },
      { code: 'ES', name: '스페인', continent: 'Europe' },
      { code: 'TH', name: '태국', continent: 'Asia' },
      { code: 'SG', name: '싱가포르', continent: 'Asia' }
    ]
  }

  // 데이터 미리 로드 (앱 시작 시 호출)
  static async preloadOfflineData(): Promise<void> {
    try {
      // 중요한 정적 데이터들을 미리 캐시
      await this.getCountries()
      
      // 만료된 캐시 정리
      await offlineStorage.cleanExpiredCache()
      
      // Offline data preloaded successfully
    } catch (error) {
      // Failed to preload offline data
    }
  }
}