import type { CountryVisit, VisaType, PassportCountry } from '@/types/global'
import { withCache, generateCacheKey, CacheKeys, memoryCache } from '@/lib/cache/memory-cache'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

// Trip creation/update data
export interface TripFormData {
  country: string
  entryDate: string
  exitDate?: string | null
  visaType: VisaType
  maxDays: number
  passportCountry: PassportCountry
  notes?: string
}

// Cache configuration
const CACHE_TIMES = {
  USER_DATA: 5 * 60 * 1000,      // 5 minutes for user data
  STATIC_DATA: 60 * 60 * 1000,   // 1 hour for static data
  SYSTEM_DATA: 24 * 60 * 60 * 1000, // 24 hours for system data
} as const

// API client functions
export class ApiClient {
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
      throw error
    }
  }

  private static invalidateUserCache(userId?: string): void {
    if (userId) {
      memoryCache.delete(CacheKeys.USER_TRIPS(userId))
      memoryCache.delete(CacheKeys.USER_SCHENGEN_STATUS(userId))
      memoryCache.delete(CacheKeys.USER_STATS(userId))
    }
  }

  // Trip operations
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

  static async createTrip(data: TripFormData, userId?: string): Promise<ApiResponse<CountryVisit>> {
    const result = await this.request<CountryVisit>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Invalidate relevant caches
    this.invalidateUserCache(userId)
    
    return result
  }

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

  static async deleteTrip(id: string, userId?: string): Promise<ApiResponse<null>> {
    const result = await this.request<null>(`/api/trips/${id}`, {
      method: 'DELETE',
    })
    
    // Invalidate relevant caches
    this.invalidateUserCache(userId)
    memoryCache.delete(`trip:${id}`)
    
    return result
  }

  // Schengen calculations
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

  // Statistics
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

  // Static data operations (heavily cached)
  static async getCountries(): Promise<ApiResponse<any>> {
    return this.request(
      '/api/countries',
      {},
      true,
      CacheKeys.COUNTRIES_DATA,
      CACHE_TIMES.SYSTEM_DATA
    )
  }

  static async getVisaTypes(): Promise<ApiResponse<any>> {
    return this.request(
      '/api/visa-types',
      {},
      true,
      CacheKeys.VISA_TYPES,
      CACHE_TIMES.SYSTEM_DATA
    )
  }

  // Gmail integration (with caching)
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

  // Database test (no caching)
  static async testDatabase(): Promise<ApiResponse<any>> {
    return this.request('/api/test-db')
  }

  // Cache management utilities
  static clearUserCache(userId: string): void {
    this.invalidateUserCache(userId)
  }

  static clearAllCache(): void {
    memoryCache.clear()
  }

  static getCacheStats() {
    return memoryCache.getStats()
  }
}

// Helper functions for common patterns
export async function handleApiError(error: any): Promise<string> {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function formatApiDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0]
}

export function parseApiDate(dateString: string): Date {
  return new Date(dateString)
}