import type { CountryVisit, VisaType, PassportCountry } from '@/types/global'
import { CacheKeys, memoryCache } from '@/lib/cache/memory-cache'
import { toast } from 'sonner'

/**
 * Standard API response wrapper for all API endpoints
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = any> {
  /** Indicates if the request was successful */
  success: boolean
  /** The response data if successful */
  data?: T
  /** Error message if the request failed */
  error?: string
  /** Additional message for the user */
  message?: string
  /** Additional error details for debugging */
  details?: any
}

/**
 * Form data structure for creating or updating trip records
 */
export interface TripFormData {
  /** Country code or name for the trip destination */
  country: string
  /** ISO date string for entry date (YYYY-MM-DD) */
  entryDate: string
  /** ISO date string for exit date (YYYY-MM-DD), optional for current trips */
  exitDate?: string | null
  /** Type of visa used for entry */
  visaType: VisaType
  /** Maximum days allowed for this visa type */
  maxDays: number
  /** User's passport country */
  passportCountry: PassportCountry
  /** Optional notes about the trip */
  notes?: string
}

/**
 * Cache TTL configuration for different data types
 * Ensures optimal performance while maintaining data freshness
 */
const CACHE_TIMES = {
  /** 5 minutes for user-specific data that may change frequently */
  USER_DATA: 5 * 60 * 1000,
  /** 1 hour for semi-static data like analyzed emails */
  STATIC_DATA: 60 * 60 * 1000,
  /** 24 hours for system data like countries and visa types */
  SYSTEM_DATA: 24 * 60 * 60 * 1000,
} as const

/**
 * Main API client for DINO app
 * Handles all API communication with built-in caching, CSRF protection, and offline support
 * 
 * @example
 * ```typescript
 * // Get all trips for the current user
 * const response = await ApiClient.getTrips('user123');
 * if (response.success) {
 *   console.log('Trips:', response.data);
 * }
 * ```
 */
export class ApiClient {
  /**
   * Retrieves CSRF token for secure API operations
   * @returns The CSRF token string or empty string if failed
   * @private
   */
  private static async getCSRFToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'same-origin'
      })
      const data = await response.json()
      return data.token || data.csrfToken
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      return ''
    }
  }

  /**
   * Core request method with caching, CSRF protection, and error handling
   * @template T - The expected response data type
   * @param url - The API endpoint URL
   * @param options - Fetch API options
   * @param useCache - Whether to use caching for this request
   * @param cacheKey - Cache key for storing/retrieving cached data
   * @param cacheTTL - Cache time-to-live in milliseconds
   * @returns Promise resolving to ApiResponse with data or error
   * @private
   */
  private static async request<T>(
    url: string, 
    options: RequestInit = {},
    useCache = false,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    // Use cache for GET requests if specified
    if (useCache && cacheKey && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = memoryCache.get<ApiResponse<T>>(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      // Get CSRF token for non-GET requests
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }
      
      if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
        try {
          const csrfToken = await this.getCSRFToken()
          if (csrfToken) {
            headers = {
              ...headers,
              'X-CSRF-Token': csrfToken,
            }
          }
        } catch (csrfError) {
          console.error('Failed to get CSRF token:', csrfError)
          // Continue without CSRF token in development
        }
      }

      const response = await fetch(url, {
        headers,
        credentials: 'same-origin',
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      // Cache successful GET responses
      if (useCache && cacheKey && response.ok && (!options.method || options.method === 'GET')) {
        memoryCache.set(cacheKey, data, cacheTTL || CACHE_TIMES.USER_DATA)
      }

      return data
    } catch (error) {
      // API request failed
      console.error('API request failed:', error)
      
      // 오프라인 상태 처리
      if (!navigator.onLine) {
        // 오프라인일 때 localStorage에서 데이터 가져오기
        const offlineData = localStorage.getItem('dinoapp-offline-data')
        if (offlineData && options.method === 'GET') {
          const cached = JSON.parse(offlineData)
          
          // URL에 따른 캐시 데이터 반환
          if (url.includes('/api/trips') && cached.trips) {
            toast.info('오프라인 모드: 캐시된 데이터를 표시합니다')
            return { success: true, data: cached.trips }
          } else if (url.includes('/api/schengen-status') && cached.schengenStatus) {
            return { success: true, data: cached.schengenStatus }
          } else if (url.includes('/api/user/stats') && cached.stats) {
            return { success: true, data: cached.stats }
          }
        }
      }
      
      // Return a proper error response instead of throwing
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Invalidates all cached data for a specific user
   * Called after any data mutation to ensure fresh data on next request
   * @param userId - The user ID whose cache should be invalidated
   * @private
   */
  private static invalidateUserCache(userId?: string): void {
    if (userId) {
      memoryCache.delete(CacheKeys.USER_TRIPS(userId))
      memoryCache.delete(CacheKeys.USER_SCHENGEN_STATUS(userId))
      memoryCache.delete(CacheKeys.USER_STATS(userId))
    }
    // Also invalidate the general trips cache
    memoryCache.delete('trips:all')
  }

  /**
   * Retrieves all trips for a user or all trips if no userId provided
   * @param userId - Optional user ID to filter trips
   * @returns Promise resolving to array of CountryVisit records
   * 
   * @example
   * ```typescript
   * const { success, data } = await ApiClient.getTrips('user123');
   * if (success) {
   *   console.log(`User has ${data.length} trips`);
   * }
   * ```
   */
  static async getTrips(userId?: string): Promise<ApiResponse<CountryVisit[]>> {
    const cacheKey = userId ? CacheKeys.USER_TRIPS(userId) : 'trips:all'
    return this.request<CountryVisit[]>(
      '/api/trips',
      {},
      true,
      cacheKey,
      CACHE_TIMES.USER_DATA
    )
  }

  /**
   * Retrieves a single trip by ID
   * @param id - The trip ID to retrieve
   * @returns Promise resolving to CountryVisit record
   */
  static async getTrip(id: string): Promise<ApiResponse<CountryVisit>> {
    const cacheKey = `trip:${id}`
    return this.request<CountryVisit>(
      `/api/trips/${id}`,
      {},
      true,
      cacheKey,
      CACHE_TIMES.USER_DATA
    )
  }

  /**
   * Creates a new trip record
   * @param data - Trip form data containing country, dates, visa info
   * @param userId - Optional user ID for cache invalidation
   * @returns Promise resolving to the created CountryVisit record
   * 
   * @example
   * ```typescript
   * const newTrip = await ApiClient.createTrip({
   *   country: 'FR',
   *   entryDate: '2024-01-01',
   *   exitDate: '2024-01-15',
   *   visaType: 'TOURIST',
   *   maxDays: 90,
   *   passportCountry: 'KR'
   * });
   * ```
   */
  static async createTrip(data: TripFormData, userId?: string): Promise<ApiResponse<CountryVisit>> {
    const result = await this.request<CountryVisit>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Invalidate relevant caches
    this.invalidateUserCache(userId)
    
    return result
  }

  /**
   * Updates an existing trip record
   * @param id - The trip ID to update
   * @param data - Partial trip data to update
   * @param userId - Optional user ID for cache invalidation
   * @returns Promise resolving to the updated CountryVisit record
   */
  static async updateTrip(id: string, data: Partial<TripFormData>, userId?: string): Promise<ApiResponse<CountryVisit>> {
    const result = await this.request<CountryVisit>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    // Invalidate relevant caches
    this.invalidateUserCache(userId)
    memoryCache.delete(`trip:${id}`)
    
    return result
  }

  /**
   * Deletes a trip record
   * @param id - The trip ID to delete
   * @param userId - Optional user ID for cache invalidation
   * @returns Promise resolving to null on successful deletion
   */
  static async deleteTrip(id: string, userId?: string): Promise<ApiResponse<null>> {
    const result = await this.request<null>(`/api/trips/${id}`, {
      method: 'DELETE',
    })
    
    // Invalidate relevant caches
    this.invalidateUserCache(userId)
    memoryCache.delete(`trip:${id}`)
    
    return result
  }

  /**
   * Calculates Schengen zone status for a user
   * @param userId - Optional user ID to calculate status for
   * @returns Promise resolving to Schengen status including used/remaining days
   * 
   * @example
   * ```typescript
   * const { data } = await ApiClient.getSchengenStatus('user123');
   * console.log(`Days used: ${data.usedDays}/90`);
   * ```
   */
  static async getSchengenStatus(userId?: string): Promise<ApiResponse<any>> {
    const cacheKey = userId ? CacheKeys.USER_SCHENGEN_STATUS(userId) : 'schengen:status'
    return this.request(
      '/api/schengen',
      {},
      true,
      cacheKey,
      CACHE_TIMES.USER_DATA
    )
  }

  /**
   * Retrieves notifications for the current user
   * @returns Promise resolving to array of notifications
   */
  static async getNotifications(): Promise<ApiResponse<any>> {
    return this.request('/api/notifications')
  }

  /**
   * Marks a notification as read
   * @param notificationId - The notification ID to mark as read
   * @returns Promise resolving to success status
   */
  static async markNotificationRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.request('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationId })
    })
  }

  /**
   * Retrieves statistics for a user or system-wide stats
   * @param userId - Optional user ID for user-specific stats
   * @returns Promise resolving to statistics data
   */
  static async getStats(userId?: string): Promise<ApiResponse<any>> {
    const cacheKey = userId ? CacheKeys.USER_STATS(userId) : CacheKeys.SYSTEM_STATS
    return this.request(
      '/api/stats',
      {},
      true,
      cacheKey,
      CACHE_TIMES.USER_DATA
    )
  }

  /**
   * Retrieves list of all countries with visa requirements
   * Heavily cached (24h) as this data rarely changes
   * @returns Promise resolving to array of country data
   */
  static async getCountries(): Promise<ApiResponse<any>> {
    return this.request(
      '/api/countries',
      {},
      true,
      CacheKeys.COUNTRIES_DATA,
      CACHE_TIMES.SYSTEM_DATA
    )
  }

  /**
   * Retrieves list of all available visa types
   * Heavily cached (24h) as this data rarely changes
   * @returns Promise resolving to array of visa types
   */
  static async getVisaTypes(): Promise<ApiResponse<any>> {
    return this.request(
      '/api/visa-types',
      {},
      true,
      CacheKeys.VISA_TYPES,
      CACHE_TIMES.SYSTEM_DATA
    )
  }

  /**
   * Searches Gmail messages for travel-related emails
   * @param userId - The user ID for Gmail access
   * @param query - Optional search query to filter messages
   * @returns Promise resolving to array of Gmail messages
   */
  static async getGmailMessages(userId: string, query?: string): Promise<ApiResponse<any>> {
    const cacheKey = CacheKeys.GMAIL_MESSAGES(userId, query)
    return this.request(
      `/api/gmail/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      {},
      true,
      cacheKey,
      CACHE_TIMES.USER_DATA
    )
  }

  /**
   * Analyzes a Gmail message to extract travel information
   * Results are cached longer (1h) as analysis doesn't change
   * @param userId - The user ID for Gmail access
   * @param messageId - The Gmail message ID to analyze
   * @returns Promise resolving to extracted travel data
   */
  static async analyzeGmailMessage(userId: string, messageId: string): Promise<ApiResponse<any>> {
    const cacheKey = CacheKeys.GMAIL_ANALYSIS(userId, messageId)
    return this.request(
      `/api/gmail/analyze`,
      {
        method: 'POST',
        body: JSON.stringify({ messageId })
      },
      true,
      cacheKey,
      CACHE_TIMES.STATIC_DATA // Longer cache for analyzed emails
    )
  }

  /**
   * Tests database connectivity (no caching)
   * Used for health checks and diagnostics
   * @returns Promise resolving to database test results
   */
  static async testDatabase(): Promise<ApiResponse<any>> {
    return this.request('/api/test-db')
  }

  /**
   * Clears all cached data for a specific user
   * @param userId - The user ID whose cache should be cleared
   */
  static clearUserCache(userId: string): void {
    this.invalidateUserCache(userId)
  }

  /**
   * Clears the entire API cache
   * Use sparingly as it will force all data to be re-fetched
   */
  static clearAllCache(): void {
    memoryCache.clear()
  }

  /**
   * Retrieves cache statistics for monitoring and debugging
   * @returns Cache statistics including hit rate, size, etc.
   */
  static getCacheStats() {
    return memoryCache.getStats()
  }
}

/**
 * Handles API errors and extracts user-friendly error messages
 * @param error - The error object from API calls
 * @returns A user-friendly error message string
 */
export async function handleApiError(error: any): Promise<string> {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Formats a date for API consumption (YYYY-MM-DD)
 * @param date - Date object or date string to format
 * @returns ISO date string in YYYY-MM-DD format
 */
export function formatApiDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Parses an API date string into a Date object
 * @param dateString - ISO date string from API
 * @returns JavaScript Date object
 */
export function parseApiDate(dateString: string): Date {
  return new Date(dateString)
}