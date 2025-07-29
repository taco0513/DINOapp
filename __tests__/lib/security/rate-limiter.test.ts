import { RateLimiter, applyRateLimit, logSecurityEvent } from '@/lib/security/rate-limiter'
import { NextRequest } from 'next/server'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5, // Low limit for testing
    })
    mockRequest = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    })
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimiter.checkLimit(mockRequest)
      
      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(4)
      expect(result.resetTime).toBeDefined()
    })

    it('should track multiple requests from same client', async () => {
      // First request
      let result = await rateLimiter.checkLimit(mockRequest)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)

      // Second request
      result = await rateLimiter.checkLimit(mockRequest)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(3)

      // Third request
      result = await rateLimiter.checkLimit(mockRequest)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('should block requests exceeding limit', async () => {
      // Make 5 requests to reach the limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(mockRequest)
      }

      // 6th request should be blocked
      const result = await rateLimiter.checkLimit(mockRequest)
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should handle different clients separately', async () => {
      // Request from first client
      await rateLimiter.checkLimit(mockRequest)

      // Request from different client
      const differentRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.2',
          'user-agent': 'Mozilla/5.0',
        },
      })

      const result = await rateLimiter.checkLimit(differentRequest)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4) // Fresh limit for new client
    })

    it('should differentiate clients by user agent', async () => {
      // Same IP but different user agent
      const differentUARequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Different-Agent/1.0',
        },
      })

      await rateLimiter.checkLimit(mockRequest)
      const result = await rateLimiter.checkLimit(differentUARequest)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4) // Fresh limit for different UA
    })
  })

  describe('IP extraction', () => {
    it('should handle x-forwarded-for header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '10.0.0.1, 192.168.1.1',
        },
      })

      const result = await rateLimiter.checkLimit(request)
      expect(result.allowed).toBe(true)
    })

    it('should handle x-real-ip header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '10.0.0.1',
        },
      })

      const result = await rateLimiter.checkLimit(request)
      expect(result.allowed).toBe(true)
    })

    it('should handle Vercel forwarded header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-vercel-forwarded-for': '10.0.0.1',
        },
      })

      const result = await rateLimiter.checkLimit(request)
      expect(result.allowed).toBe(true)
    })

    it('should handle Cloudflare header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'cf-connecting-ip': '10.0.0.1',
        },
      })

      const result = await rateLimiter.checkLimit(request)
      expect(result.allowed).toBe(true)
    })

    it('should fallback to localhost when no IP headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = await rateLimiter.checkLimit(request)
      expect(result.allowed).toBe(true)
    })
  })

  describe('applyRateLimit middleware', () => {
    it('should return null for allowed requests', async () => {
      const response = await applyRateLimit(mockRequest, 'general')
      
      expect(response).toBeNull()
    })

    it('should return 429 response for exceeded limit', async () => {
      // Use auth limiter with lower limit
      const authRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      })

      // Exceed the auth limit (10 requests)
      for (let i = 0; i < 10; i++) {
        await applyRateLimit(authRequest, 'auth')
      }

      const response = await applyRateLimit(authRequest, 'auth')
      
      expect(response).not.toBeNull()
      expect(response?.status).toBe(429)
      
      const body = await response?.json()
      expect(body.error).toBe('Too Many Requests')
      expect(body.retryAfter).toBeDefined()
    })

    it('should include rate limit headers', async () => {
      const response = await applyRateLimit(mockRequest, 'general')
      
      // For allowed requests, headers are not included in the response
      // but would be added by middleware
      expect(response).toBeNull()

      // Test blocked response headers
      for (let i = 0; i < 100; i++) {
        await applyRateLimit(mockRequest, 'general')
      }

      const blockedResponse = await applyRateLimit(mockRequest, 'general')
      
      expect(blockedResponse?.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(blockedResponse?.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(blockedResponse?.headers.get('X-RateLimit-Reset')).toBeDefined()
      expect(blockedResponse?.headers.get('Retry-After')).toBeDefined()
    })

    it('should handle different limiter types', async () => {
      const endpoints = ['general', 'auth', 'mutation', 'upload', 'notification'] as const

      for (const endpoint of endpoints) {
        const request = new NextRequest(`http://localhost:3000/api/${endpoint}`, {
          headers: {
            'x-forwarded-for': `192.168.1.${Math.random() * 255}`,
          },
        })

        const response = await applyRateLimit(request, endpoint)
        expect(response).toBeNull() // First request should always pass
      }
    })
  })

  describe('RateLimiter.configs', () => {
    it('should have predefined configurations', () => {
      expect(RateLimiter.configs.general).toBeDefined()
      expect(RateLimiter.configs.auth).toBeDefined()
      expect(RateLimiter.configs.mutation).toBeDefined()
      expect(RateLimiter.configs.upload).toBeDefined()
      expect(RateLimiter.configs.notification).toBeDefined()
    })

    it('should have different limits for different endpoints', async () => {
      const authLimiter = RateLimiter.configs.auth
      const generalLimiter = RateLimiter.configs.general

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.200',
        },
      })

      const authResult = await authLimiter.checkLimit(request)
      const generalResult = await generalLimiter.checkLimit(request)

      expect(authResult.limit).toBe(10) // Auth is more restrictive
      expect(generalResult.limit).toBe(100) // General is more permissive
    })
  })

  describe('logSecurityEvent', () => {
    it('should log security events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      logSecurityEvent(mockRequest, 'rate_limit_exceeded', {
        limit: 100,
        requests: 101,
      })

      // Function executes without errors
      expect(() => logSecurityEvent(mockRequest, 'rate_limit_exceeded')).not.toThrow()

      consoleSpy.mockRestore()
    })

    it('should handle missing headers gracefully', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      expect(() => logSecurityEvent(request, 'suspicious_activity')).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle concurrent requests', async () => {
      const promises = []
      
      // Simulate 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(rateLimiter.checkLimit(mockRequest))
      }

      const results = await Promise.all(promises)
      
      // Count allowed requests
      const allowedCount = results.filter(r => r.allowed).length
      expect(allowedCount).toBe(5) // Should respect the limit
    })

    it('should reset after time window', async () => {
      jest.useFakeTimers()

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(mockRequest)
      }

      let result = await rateLimiter.checkLimit(mockRequest)
      expect(result.allowed).toBe(false)

      // Fast forward past the window
      jest.advanceTimersByTime(61000) // 61 seconds

      // Should be allowed again
      result = await rateLimiter.checkLimit(mockRequest)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)

      jest.useRealTimers()
    })
  })
})