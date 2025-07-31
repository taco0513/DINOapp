/**
 * API Client 단순 테스트 - 순환 참조 완전 해결 버전
 */

import { APIClient, APIConfig, APIError } from '@/lib/api/api-client';

// Extremely simple mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('APIClient - Simple Tests', () => {
  let client: APIClient;

  beforeEach(() => {
    jest.clearAllMocks();

    client = new APIClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
      retry: {
        attempts: 2,
        delay: 10,
        backoff: 'linear',
      },
    });
  });

  describe('Basic HTTP Methods', () => {
    it('should make GET request', async () => {
      const responseData = { id: 1, name: 'John' };

      // Simple mock without circular references
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue(responseData),
      });

      const result = await client.get('/users');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(responseData);
    });

    it('should make POST request', async () => {
      const requestBody = { name: 'John', email: 'john@example.com' };
      const responseData = { id: 1, ...requestBody };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue(responseData),
      });

      const result = await client.post('/users', requestBody);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(responseData);
    });

    it('should make PUT request', async () => {
      const updateData = { name: 'Jane' };
      const responseData = { id: 1, name: 'Jane', email: 'jane@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue(responseData),
      });

      const result = await client.put('/users/1', updateData);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(responseData);
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: { get: jest.fn().mockReturnValue(null) },
        text: jest.fn().mockResolvedValue(''),
        json: jest.fn().mockResolvedValue(null),
        blob: jest.fn().mockResolvedValue(new Blob()),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      });

      await client.delete('/users/1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw APIError for HTTP errors', async () => {
      const errorResponse = { error: 'Not Found', message: 'User not found' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue(errorResponse),
      });

      await expect(client.get('/users/999')).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      // Mock network error that should be caught and rethrown by retry mechanism
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error')); // Retry also fails

      await expect(client.get('/users')).rejects.toThrow('Network error');
    });
  });

  describe('Authentication', () => {
    it('should add auth token to headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue({}),
      });

      client.setAuthToken('my-token');
      await client.get('/protected');

      const [, requestConfig] = mockFetch.mock.calls[0];
      expect(requestConfig.headers.Authorization).toBe('Bearer my-token');
    });

    it('should clear auth token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue({}),
      });

      client.setAuthToken('my-token');
      client.clearAuthToken();
      await client.get('/public');

      const [, requestConfig] = mockFetch.mock.calls[0];
      expect(requestConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry on network failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: { get: jest.fn().mockReturnValue('application/json') },
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      const result = await client.get('/flaky');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          headers: { get: jest.fn().mockReturnValue('application/json') },
          json: jest.fn().mockResolvedValue({ error: 'Service down' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: { get: jest.fn().mockReturnValue('application/json') },
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      const result = await client.get('/unstable');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should not retry 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue({ error: 'Invalid input' }),
      });

      await expect(client.get('/bad-request')).rejects.toThrow(APIError);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retry
    });
  });

  describe('Caching', () => {
    it('should cache GET requests', async () => {
      const cacheClient = new APIClient({
        baseURL: 'https://api.example.com',
        cache: {
          enabled: true,
          ttl: 60000,
        },
      });

      const mockData = { id: 1, name: 'Cached User' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue(mockData),
      });

      // First request
      const result1 = await cacheClient.get('/users/1');
      expect(result1).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const result2 = await cacheClient.get('/users/1');
      expect(result2).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, cached
    });
  });

  describe('Request Interceptors', () => {
    it('should apply request interceptors', async () => {
      const interceptor = jest.fn(config => {
        config.headers['X-Custom'] = 'test';
        return config;
      });

      client.addRequestInterceptor(interceptor);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue({}),
      });

      await client.get('/users');

      expect(interceptor).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Interceptors', () => {
    it('should apply response interceptors', async () => {
      const interceptor = jest.fn(response => {
        response.processed = true;
        return response;
      });

      client.addResponseInterceptor(interceptor);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      });

      const result = await client.get('/users');

      expect(interceptor).toHaveBeenCalled();
      expect(result).toHaveProperty('processed', true);
    });
  });
});
