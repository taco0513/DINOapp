/**
 * In-memory cache implementation with TTL support
 * Optimized for DiNoCal's 5-minute caching strategy
 */

interface CacheItem<T> {
  data: T
  expiry: number
  created: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, {
      data,
      expiry,
      created: Date.now()
    })
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredItems++
      } else {
        validItems++
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      hitRate: validItems / (validItems + expiredItems) || 0
    }
  }

  /**
   * Remove expired items
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Cleanup interval when done
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Singleton instance
export const memoryCache = new MemoryCache()

/**
 * Cache wrapper function for async operations
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = memoryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch data and cache it
  const data = await fetcher()
  memoryCache.set(key, data, ttl)
  
  return data
}

/**
 * Generate cache key for API calls
 */
export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  const baseKey = `api:${endpoint}`
  
  if (!params) {
    return baseKey
  }

  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {} as Record<string, any>)

  const paramString = JSON.stringify(sortedParams)
  return `${baseKey}:${Buffer.from(paramString).toString('base64')}`
}

/**
 * Cache keys for DiNoCal specific data
 */
export const CacheKeys = {
  // User data
  USER_TRIPS: (userId: string) => `user:${userId}:trips`,
  USER_SCHENGEN_STATUS: (userId: string) => `user:${userId}:schengen`,
  USER_NOTIFICATIONS: (userId: string) => `user:${userId}:notifications`,
  
  // System data
  COUNTRIES_DATA: 'system:countries',
  VISA_TYPES: 'system:visa-types',
  
  // Gmail integration
  GMAIL_MESSAGES: (userId: string, query?: string) => 
    `gmail:${userId}:messages${query ? `:${Buffer.from(query).toString('base64')}` : ''}`,
  GMAIL_ANALYSIS: (userId: string, messageId: string) => 
    `gmail:${userId}:analysis:${messageId}`,
    
  // Analytics
  USER_STATS: (userId: string) => `stats:${userId}`,
  SYSTEM_STATS: 'stats:system'
} as const

export type CacheKeyType = keyof typeof CacheKeys