import { 
  APIClient,
  APIConfig,
  RequestOptions,
  APIError,
  RetryConfig,
  CacheConfig
} from '@/lib/api/api-client'

// Mock fetch
global.fetch = jest.fn()

// Helper function to create mock response
const createMockResponse = (data: any, options: Partial<Response> = {}): Response => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    blob: jest.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    clone: jest.fn().mockImplementation(() => createMockResponse(data, options)),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    ...options
  } as Response
}

describe('APIClient', () => {
  let client: APIClient
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    const config: APIConfig = {
      baseURL: 'https://api.example.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
    }

    client = new APIClient(config)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Request methods', () => {
    it('should make GET request', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request with body', async () => {
      const requestBody = { name: 'John', email: 'john@example.com' }
      const mockResponse = { id: 1, ...requestBody }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse, { status: 201 }))

      const result = await client.post('/users', requestBody)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make PUT request', async () => {
      const updateData = { name: 'Jane' }
      const mockResponse = { id: 1, name: 'Jane', email: 'jane@example.com' }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await client.put('/users/1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make PATCH request', async () => {
      const patchData = { status: 'active' }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(patchData))

      await client.patch('/users/1', patchData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      )
    })

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null, { status: 204 }))

      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('Query parameters', () => {
    it('should append query parameters to URL', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse([]))

      const params = {
        page: 1,
        limit: 10,
        sort: 'name',
        filter: ['active', 'verified'],
      }

      await client.get('/users', { params })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&sort=name&filter=active&filter=verified',
        expect.any(Object)
      )
    })

    it('should handle special characters in query parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse([]))

      const params = {
        search: 'John Doe',
        email: 'john+test@example.com',
      }

      await client.get('/users', { params })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John%20Doe'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('email=john%2Btest%40example.com'),
        expect.any(Object)
      )
    })
  })

  describe('Headers', () => {
    it('should merge custom headers with default headers', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      const customHeaders = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      }

      await client.get('/users', { headers: customHeaders })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'value',
          }),
        })
      )
    })

    it('should handle authorization helper methods', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      client.setAuthToken('my-auth-token')
      await client.get('/protected')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-auth-token',
          }),
        })
      )

      // Clear token
      client.clearAuthToken()
      
      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      await client.get('/public')

      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should throw APIError for non-OK responses', async () => {
      const errorResponse = {
        error: 'Not Found',
        message: 'User not found',
      }

      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, { 
        ok: false, 
        status: 404, 
        statusText: 'Not Found' 
      }))

      await expect(client.get('/users/999')).rejects.toThrow(APIError)
      
      try {
        await client.get('/users/999')
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).status).toBe(404)
        expect((error as APIError).message).toBe('User not found')
        expect((error as APIError).response).toEqual(errorResponse)
      }
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(client.get('/users')).rejects.toThrow('Network error')
    })

    it('should handle timeout', async () => {
      // Create client with short timeout
      const timeoutClient = new APIClient({
        baseURL: 'https://api.example.com',
        timeout: 100, // 100ms
      })

      // Mock slow response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      await expect(timeoutClient.get('/slow')).rejects.toThrow(/timeout/i)
    })

    it('should handle JSON parse errors', async () => {
      const mockResponse = createMockResponse({})
      mockResponse.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(client.get('/bad-json')).rejects.toThrow('Invalid JSON')
    })
  })

  describe('Retry mechanism', () => {
    it('should retry failed requests', async () => {
      // First two attempts fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockResponse({ success: true }))

      const result = await client.get('/flaky-endpoint')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ success: true })
    })

    it('should not retry non-retryable status codes', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(
        { error: 'Invalid input' }, 
        { ok: false, status: 400, statusText: 'Bad Request' }
      ))

      await expect(client.get('/bad-request')).rejects.toThrow(APIError)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No retry
    })

    it('should retry specific status codes', async () => {
      // Mock 503 Service Unavailable twice, then success
      mockFetch
        .mockResolvedValueOnce(createMockResponse(
          { error: 'Service down' }, 
          { ok: false, status: 503, statusText: 'Service Unavailable' }
        ))
        .mockResolvedValueOnce(createMockResponse(
          { error: 'Service down' }, 
          { ok: false, status: 503, statusText: 'Service Unavailable' }
        ))
        .mockResolvedValueOnce(createMockResponse({ data: 'success' }))

      const result = await client.get('/unstable-service')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ data: 'success' })
    })

    it('should use exponential backoff', async () => {
      jest.useFakeTimers()

      const retryClient = new APIClient({
        baseURL: 'https://api.example.com',
        retry: {
          attempts: 3,
          delay: 100,
          backoff: 'exponential',
        },
      })

      // All attempts fail
      mockFetch.mockRejectedValue(new Error('Network error'))

      const promise = retryClient.get('/endpoint')

      // First attempt immediately
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second attempt after 100ms
      jest.advanceTimersByTime(100)
      await Promise.resolve()
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Third attempt after 200ms (exponential)
      jest.advanceTimersByTime(200)
      await Promise.resolve()
      expect(mockFetch).toHaveBeenCalledTimes(3)

      await expect(promise).rejects.toThrow('Network error')

      jest.useRealTimers()
    })
  })

  describe('Request interceptors', () => {
    it('should apply request interceptors', async () => {
      const requestInterceptor = jest.fn((config) => {
        config.headers['X-Request-ID'] = '123'
        return config
      })

      client.addRequestInterceptor(requestInterceptor)

      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      await client.get('/users')

      expect(requestInterceptor).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-ID': '123',
          }),
        })
      )
    })

    it('should apply response interceptors', async () => {
      const responseInterceptor = jest.fn((response) => {
        response.timestamp = Date.now()
        return response
      })

      client.addResponseInterceptor(responseInterceptor)

      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

      const result = await client.get('/users')

      expect(responseInterceptor).toHaveBeenCalled()
      expect(result).toHaveProperty('timestamp')
    })

    it('should handle interceptor errors', async () => {
      const errorInterceptor = jest.fn(() => {
        throw new Error('Interceptor error')
      })

      client.addRequestInterceptor(errorInterceptor)

      await expect(client.get('/users')).rejects.toThrow('Interceptor error')
    })
  })

  describe('Caching', () => {
    it('should cache GET requests', async () => {
      const cacheClient = new APIClient({
        baseURL: 'https://api.example.com',
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
          maxSize: 100,
        },
      })

      const mockData = { id: 1, name: 'Cached User' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      // First request - should hit network
      const result1 = await cacheClient.get('/users/1')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(mockData)

      // Second request - should hit cache
      const result2 = await cacheClient.get('/users/1')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Still 1
      expect(result2).toEqual(mockData)
    })

    it('should not cache non-GET requests', async () => {
      const cacheClient = new APIClient({
        baseURL: 'https://api.example.com',
        cache: {
          enabled: true,
          ttl: 60000,
        },
      })

      mockFetch.mockResolvedValue(createMockResponse({ success: true }))

      await cacheClient.post('/users', { name: 'New User' })
      await cacheClient.post('/users', { name: 'New User' })

      expect(mockFetch).toHaveBeenCalledTimes(2) // Both hit network
    })

    it('should invalidate cache on mutations', async () => {
      const cacheClient = new APIClient({
        baseURL: 'https://api.example.com',
        cache: {
          enabled: true,
          ttl: 60000,
          invalidateOn: ['POST', 'PUT', 'DELETE'],
        },
      })

      // Cache a GET request
      mockFetch.mockResolvedValueOnce(createMockResponse({ users: [] }))

      await cacheClient.get('/users')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Make a POST request - should invalidate cache
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }, { status: 201 }))

      await cacheClient.post('/users', { name: 'New User' })

      // Next GET should hit network (cache invalidated)
      mockFetch.mockResolvedValueOnce(createMockResponse({ users: [{ id: 1 }] }))

      await cacheClient.get('/users')
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Abort and cancellation', () => {
    it('should support request cancellation', async () => {
      const controller = new AbortController()

      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('Aborted')), 100)
        })
      )

      const promise = client.get('/users', { signal: controller.signal })

      // Cancel the request
      controller.abort()

      await expect(promise).rejects.toThrow('Aborted')
    })

    it('should cleanup on abort', async () => {
      const controller = new AbortController()
      
      let cleanupCalled = false
      client.addRequestInterceptor((config) => {
        config.signal?.addEventListener('abort', () => {
          cleanupCalled = true
        })
        return config
      })

      mockFetch.mockRejectedValueOnce(new DOMException('Aborted'))

      const promise = client.get('/users', { signal: controller.signal })
      controller.abort()

      await expect(promise).rejects.toThrow()
      expect(cleanupCalled).toBe(true)
    })
  })
})