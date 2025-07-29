/**
 * API Cache Performance Module Tests
 * Tests for caching, deduplication, and optimization utilities
 */

import {
  PerformanceCache,
  apiCache,
  CacheResponse,
  requestDeduplicator,
  rateLimiter,
  optimizedFetch,
  compressResponse,
  decompressResponse,
  APIPerformanceMonitor,
  apiMonitor
} from '@/lib/performance/api-cache'

// Mock global fetch
global.fetch = jest.fn()

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now())
} as any

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

describe('API Cache Performance Module', () => {
  let originalBlob: any
  let originalAbortController: any

  beforeAll(() => {
    // Mock Blob constructor
    originalBlob = global.Blob
    global.Blob = jest.fn().mockImplementation((parts) => ({
      size: JSON.stringify(parts[0] || '').length
    })) as any

    // Mock AbortController
    originalAbortController = global.AbortController
    global.AbortController = jest.fn().mockImplementation(() => ({
      signal: {},
      abort: jest.fn()
    })) as any
  })

  afterAll(() => {
    // Restore original implementations
    global.Blob = originalBlob
    global.AbortController = originalAbortController
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    // Mock current time for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('PerformanceCache', () => {
    let cache: PerformanceCache<string>

    beforeEach(() => {
      cache = new PerformanceCache<string>(1024, 10)
    })

    describe('basic operations', () => {
      it('should set and get values', () => {
        cache.set('test', 'value')
        expect(cache.get('test')).toBe('value')
      })

      it('should return null for non-existent keys', () => {
        expect(cache.get('nonexistent')).toBeNull()
      })

      it('should check if key exists', () => {
        cache.set('test', 'value')
        expect(cache.has('test')).toBe(true)
        expect(cache.has('nonexistent')).toBe(false)
      })

      it('should delete entries', () => {
        cache.set('test', 'value')
        expect(cache.has('test')).toBe(true)
        
        const deleted = cache.delete('test')
        expect(deleted).toBe(true)
        expect(cache.has('test')).toBe(false)
      })

      it('should clear all entries', () => {
        cache.set('test1', 'value1')
        cache.set('test2', 'value2')
        
        cache.clear()
        expect(cache.get('test1')).toBeNull()
        expect(cache.get('test2')).toBeNull()
      })
    })

    describe('TTL (Time To Live)', () => {
      it('should respect TTL and expire entries', () => {
        const shortTtl = 1000 // 1 second
        cache.set('test', 'value', shortTtl)
        
        // Should be available immediately
        expect(cache.get('test')).toBe('value')
        
        // Advance time past TTL
        jest.spyOn(Date, 'now').mockReturnValue(1000000 + shortTtl + 1)
        
        // Should be expired and return null
        expect(cache.get('test')).toBeNull()
        expect(cache.has('test')).toBe(false)
      })

      it('should use default TTL when not specified', () => {
        cache.set('test', 'value')
        
        // Should be available after 30 minutes (less than default 1 hour)
        jest.spyOn(Date, 'now').mockReturnValue(1000000 + 30 * 60 * 1000)
        expect(cache.get('test')).toBe('value')
        
        // Should be expired after 2 hours
        jest.spyOn(Date, 'now').mockReturnValue(1000000 + 2 * 60 * 60 * 1000)
        expect(cache.get('test')).toBeNull()
      })
    })

    describe('statistics', () => {
      it('should track hits and misses', () => {
        cache.set('test', 'value')
        
        // Hit
        cache.get('test')
        cache.get('test')
        
        // Miss
        cache.get('nonexistent')
        
        const stats = cache.getStats()
        expect(stats.hits).toBe(2)
        expect(stats.misses).toBe(1)
        expect(stats.entries).toBe(1)
        expect(stats.hitRate).toBe(0.67) // 2/3 rounded
      })

      it('should calculate hit rate correctly', () => {
        // No requests yet
        expect(cache.getStats().hitRate).toBe(0)
        
        cache.set('test', 'value')
        cache.get('test') // Hit
        cache.get('miss') // Miss
        
        const stats = cache.getStats()
        expect(stats.hitRate).toBe(0.5) // 1/2
      })

      it('should track entry count and estimated size', () => {
        cache.set('test1', 'value1')
        cache.set('test2', 'value2')
        
        const stats = cache.getStats()
        expect(stats.entries).toBe(2)
        expect(stats.size).toBeGreaterThan(0)
      })
    })

    describe('capacity management', () => {
      it('should reject entries that are too large', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
        
        // Mock Blob to return large size
        ;(global.Blob as jest.Mock).mockImplementationOnce(() => ({
          size: 2000 // Larger than maxSize (1024)
        }))
        
        cache.set('large', 'very large value')
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache entry too large'))
        expect(cache.get('large')).toBeNull()
        
        consoleSpy.mockRestore()
      })

      it('should evict entries when max entries exceeded', () => {
        // Fill cache to capacity (maxEntries = 10)
        for (let i = 0; i < 12; i++) {
          cache.set(`key${i}`, `value${i}`)
        }
        
        const stats = cache.getStats()
        expect(stats.entries).toBeLessThanOrEqual(10)
      })
    })

    describe('LRU eviction', () => {
      it('should evict entries when capacity is exceeded', () => {
        // Fill cache to capacity (maxEntries = 10)
        for (let i = 0; i < 10; i++) {
          cache.set(`key${i}`, `value${i}`)
        }
        
        // Add one more to trigger eviction
        cache.set('new', 'newvalue')
        
        // Should not exceed max entries
        const stats = cache.getStats()
        expect(stats.entries).toBeLessThanOrEqual(10)
        
        // The new entry should be present
        expect(cache.get('new')).toBe('newvalue')
      })
    })

    describe('cleanup', () => {
      it('should clean up expired entries periodically', () => {
        const shortTtl = 1000
        cache.set('test1', 'value1', shortTtl)
        cache.set('test2', 'value2', shortTtl * 2)
        
        // Advance time to expire first entry
        jest.spyOn(Date, 'now').mockReturnValue(1000000 + shortTtl + 1)
        
        // Trigger cleanup by advancing timers
        jest.advanceTimersByTime(5 * 60 * 1000) // 5 minutes
        
        expect(cache.get('test1')).toBeNull()
        expect(cache.get('test2')).toBe('value2')
      })
    })
  })

  describe('CacheResponse decorator', () => {
    it('should be importable and callable', () => {
      expect(CacheResponse).toBeDefined()
      expect(typeof CacheResponse).toBe('function')
      
      // Test that decorator function returns a decorator
      const decorator = CacheResponse(1000)
      expect(typeof decorator).toBe('function')
    })

    it('should create cache decorator with custom TTL', () => {
      const decorator = CacheResponse(5000)
      expect(typeof decorator).toBe('function')
    })

    it('should handle descriptor modification', () => {
      const mockDescriptor = {
        value: jest.fn().mockResolvedValue('test-result')
      }
      
      const decorator = CacheResponse(1000)
      const result = decorator({}, 'testMethod', mockDescriptor)
      
      expect(result).toBe(mockDescriptor)
      expect(typeof mockDescriptor.value).toBe('function')
    })
  })

  describe('RequestDeduplicator', () => {
    it('should deduplicate concurrent requests', async () => {
      let callCount = 0
      const slowRequest = async () => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'result'
      }

      // Start multiple concurrent requests
      const promises = [
        requestDeduplicator.deduplicate('test', slowRequest),
        requestDeduplicator.deduplicate('test', slowRequest),
        requestDeduplicator.deduplicate('test', slowRequest)
      ]

      jest.advanceTimersByTime(100)
      const results = await Promise.all(promises)
      
      // All should return same result
      expect(results).toEqual(['result', 'result', 'result'])
      
      // Function should only be called once
      expect(callCount).toBe(1)
    })

    it('should allow different keys to execute separately', async () => {
      let callCount = 0
      const request = async () => {
        callCount++
        return 'result'
      }

      await Promise.all([
        requestDeduplicator.deduplicate('key1', request),
        requestDeduplicator.deduplicate('key2', request)
      ])
      
      // Different keys should execute separately
      expect(callCount).toBe(2)
    })
  })

  describe('RateLimiter', () => {
    it('should allow requests within limit', () => {
      const limit = 5
      const windowMs = 1000

      for (let i = 0; i < limit; i++) {
        expect(rateLimiter.isAllowed('test', limit, windowMs)).toBe(true)
      }
    })

    it('should reject requests exceeding limit', () => {
      const limit = 3
      const windowMs = 1000

      // Fill up the limit
      for (let i = 0; i < limit; i++) {
        rateLimiter.isAllowed('test', limit, windowMs)
      }

      // Next request should be rejected
      expect(rateLimiter.isAllowed('test', limit, windowMs)).toBe(false)
    })

    it('should reset limits after time window', () => {
      const limit = 2
      const windowMs = 1000

      // Fill up the limit
      rateLimiter.isAllowed('test', limit, windowMs)
      rateLimiter.isAllowed('test', limit, windowMs)
      
      expect(rateLimiter.isAllowed('test', limit, windowMs)).toBe(false)

      // Advance time past window
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + windowMs + 1)
      
      // Should allow requests again
      expect(rateLimiter.isAllowed('test', limit, windowMs)).toBe(true)
    })

    it('should reset specific key', () => {
      rateLimiter.isAllowed('test', 1, 1000)
      expect(rateLimiter.isAllowed('test', 1, 1000)).toBe(false)
      
      rateLimiter.reset('test')
      expect(rateLimiter.isAllowed('test', 1, 1000)).toBe(true)
    })
  })

  describe('optimizedFetch', () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      clone: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue({ data: 'test' })
    }

    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockResponse.clone.mockReturnValue(mockResponse)
    })

    it('should make basic fetch request', async () => {
      const response = await optimizedFetch('https://api.test.com/data')
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        expect.objectContaining({ signal: expect.any(Object) })
      )
      expect(response).toBe(mockResponse)
    })

    it('should respect rate limits', async () => {
      const rateLimit = { key: 'api', limit: 1, windowMs: 1000 }
      
      // First request should succeed
      await optimizedFetch('https://api.test.com/data', { rateLimit })
      
      // Second request should fail
      await expect(
        optimizedFetch('https://api.test.com/data', { rateLimit })
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('should implement timeout', async () => {
      const controller = { abort: jest.fn(), signal: {} }
      ;(global.AbortController as jest.Mock).mockReturnValue(controller)
      
      // Mock fetch to hang indefinitely
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      // Start the request
      const promise = optimizedFetch('https://api.test.com/data', { timeout: 1000 })
      
      // Advance timers to trigger timeout
      jest.advanceTimersByTime(1000)
      
      // Controller abort should have been called
      expect(controller.abort).toHaveBeenCalled()
    })

    it('should retry on failure', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse)

      const response = await optimizedFetch('https://api.test.com/data', {
        retries: 3,
        retryDelay: 100
      })

      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(response).toBe(mockResponse)
    })

    it('should throw after max retries', async () => {
      const error = new Error('Persistent error')
      ;(global.fetch as jest.Mock).mockRejectedValue(error)

      await expect(
        optimizedFetch('https://api.test.com/data', { retries: 2 })
      ).rejects.toThrow('Persistent error')

      expect(global.fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('compression utilities', () => {
    const testData = {
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      userId: 'user123',
      travelRecord: { country: 'France' },
      active: true,
      deleted: false,
      notes: null
    }

    it('should compress and decompress data correctly', () => {
      const simpleData = {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        userId: 'user123',
        active: true,
        deleted: false,
        notes: null
      }
      
      const compressed = compressResponse(simpleData)
      const decompressed = decompressResponse(compressed)
      
      // Check that key fields are preserved
      expect(decompressed).toHaveProperty('createdAt', '2024-01-01')
      expect(decompressed).toHaveProperty('updatedAt', '2024-01-02')
      expect(decompressed).toHaveProperty('userId', 'user123')
    })

    it('should reduce data size through compression', () => {
      const original = JSON.stringify(testData)
      const compressed = compressResponse(testData)
      
      expect(compressed.length).toBeLessThan(original.length)
    })

    it('should handle edge cases in compression', () => {
      const edgeData = {
        text: 'This contains words like true and false and null as strings',
        values: [true, false, null],
        description: 'A test object'
      }
      
      const compressed = compressResponse(edgeData)
      const decompressed = decompressResponse(compressed)
      
      // Check structure is preserved
      expect(decompressed).toHaveProperty('text')
      expect(decompressed).toHaveProperty('values')
      expect(decompressed).toHaveProperty('description')
      expect(Array.isArray(decompressed.values)).toBe(true)
    })
  })

  describe('APIPerformanceMonitor', () => {
    let monitor: APIPerformanceMonitor

    beforeEach(() => {
      monitor = new APIPerformanceMonitor()
      jest.spyOn(global.performance, 'now').mockReturnValue(1000)
    })

    it('should time API calls', () => {
      ;(global.performance.now as jest.Mock)
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1500) // End time

      const endTiming = monitor.startTiming('/api/users')
      endTiming()

      const metrics = monitor.getMetrics()
      expect(metrics['/api/users']).toEqual({
        count: 1,
        totalTime: 500,
        errors: 0,
        averageTime: 500
      })
    })

    it('should record errors', () => {
      monitor.recordError('/api/users')

      const metrics = monitor.getMetrics()
      expect(metrics['/api/users'].errors).toBe(1)
    })

    it('should calculate average time correctly', () => {
      ;(global.performance.now as jest.Mock)
        .mockReturnValueOnce(1000).mockReturnValueOnce(1300) // First call: 300ms
        .mockReturnValueOnce(2000).mockReturnValueOnce(2700) // Second call: 700ms

      const end1 = monitor.startTiming('/api/users')
      end1()

      const end2 = monitor.startTiming('/api/users')
      end2()

      const metrics = monitor.getMetrics()
      expect(metrics['/api/users'].averageTime).toBe(500) // (300 + 700) / 2
    })

    it('should reset metrics', () => {
      monitor.recordError('/api/users')
      expect(Object.keys(monitor.getMetrics())).toHaveLength(1)

      monitor.reset()
      expect(Object.keys(monitor.getMetrics())).toHaveLength(0)
    })

    it('should integrate with global metrics collector', () => {
      const mockCollector = {
        histogram: jest.fn(),
        increment: jest.fn()
      }

      // Mock window with metrics collector
      const originalWindow = global.window
      global.window = { metricsCollector: mockCollector } as any

      ;(global.performance.now as jest.Mock)
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200)

      const endTiming = monitor.startTiming('/api/test')
      endTiming()

      expect(mockCollector.histogram).toHaveBeenCalledWith(
        'api_response_time',
        200,
        { endpoint: '/api/test' }
      )

      monitor.recordError('/api/test')
      expect(mockCollector.increment).toHaveBeenCalledWith(
        'api_errors',
        1,
        { endpoint: '/api/test' }
      )

      // Restore window
      global.window = originalWindow
    })
  })

  describe('global instances', () => {
    it('should export global cache instance', () => {
      expect(apiCache).toBeInstanceOf(PerformanceCache)
    })

    it('should export global monitor instance', () => {
      expect(apiMonitor).toBeInstanceOf(APIPerformanceMonitor)
    })
  })
})