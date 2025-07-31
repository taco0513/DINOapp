export interface APIConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  retry?: RetryConfig
  cache?: CacheConfig
  events?: {
    onRequest?: (config: RequestOptions) => void
    onResponse?: (response: any) => void
    onError?: (error: APIError) => void
  }
}

export interface RetryConfig {
  attempts: number
  delay: number
  backoff?: 'linear' | 'exponential'
  retryCondition?: (error: any) => boolean
}

export interface CacheConfig {
  enabled: boolean
  ttl?: number
  maxSize?: number
  invalidateOn?: string[]
}

export interface RequestOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  signal?: AbortSignal
  cache?: RequestCache
  credentials?: RequestCredentials
  mode?: RequestMode
}

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response?: any,
    public request?: RequestOptions
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'APIError'
  }
}

export class APIClient {
  private config: APIConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private authToken?: string
  private requestInterceptors: Array<(config: any) => any> = []
  private responseInterceptors: Array<(response: any) => any> = []

  constructor(config: APIConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(path, this.config.baseURL)
    
    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v))
        } else {
          url.searchParams.append(key, value)
        }
      })
    }

    // Merge headers
    const headers = {
      ...this.config.headers,
      ...options.headers,
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    // Check cache for GET requests
    const cacheKey = `${method}:${url.toString()}`
    if (method === 'GET' && this.config.cache?.enabled) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        const age = Date.now() - cached.timestamp
        const ttl = this.config.cache.ttl || 300000 // 5 minutes default
        if (age < ttl) {
          return cached.data
        }
      }
    }

    let requestConfig: RequestInit = {
      method,
      headers,
      signal: options.signal,
      credentials: options.credentials,
      mode: options.mode,
    }

    if (options.body && method !== 'GET' && method !== 'HEAD') {
      requestConfig.body = JSON.stringify(options.body)
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig)
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout!
    )

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort())
    }

    requestConfig.signal = controller.signal

    try {
      let attempts = 0
      const maxAttempts = this.config.retry?.attempts || 1

      while (attempts < maxAttempts) {
        try {
          const response = await fetch(url.toString(), requestConfig)
          clearTimeout(timeoutId)

          if (!response.ok) {
            const error = new APIError(
              response.status,
              response.statusText,
              await this.parseResponse(response),
              options
            )

            // Check if we should retry
            if (this.shouldRetry(error, attempts)) {
              attempts++
              await this.delay(attempts)
              continue
            }

            throw error
          }

          let data = await this.parseResponse(response)

          // Apply response interceptors
          for (const interceptor of this.responseInterceptors) {
            data = interceptor(data)
          }

          // Cache successful GET responses
          if (method === 'GET' && this.config.cache?.enabled) {
            this.cache.set(cacheKey, {
              data,
              timestamp: Date.now(),
            })

            // Limit cache size
            if (this.cache.size > (this.config.cache.maxSize || 100)) {
              const firstKey = this.cache.keys().next().value as string
              if (firstKey) {
                this.cache.delete(firstKey)
              }
            }
          }

          // Invalidate cache on mutations
          if (
            this.config.cache?.enabled &&
            this.config.cache.invalidateOn?.includes(method)
          ) {
            this.cache.clear()
          }

          return data

        } catch (error) {
          if (error instanceof APIError) {
            throw error
          }

          if (error instanceof DOMException && error.name === 'AbortError') {
            if (options.signal?.aborted) {
              throw error
            }
            throw new Error('Request timeout')
          }

          // Network or other errors
          if (this.shouldRetry(error, attempts)) {
            attempts++
            await this.delay(attempts)
            continue
          }

          throw error
        }
      }

      throw new Error('Max retry attempts reached')

    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }

    if (contentType?.includes('text/')) {
      return response.text()
    }

    return response.blob()
  }

  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= (this.config.retry?.attempts || 1) - 1) {
      return false
    }

    if (this.config.retry?.retryCondition) {
      return this.config.retry.retryCondition(error)
    }

    // Default retry logic
    if (error instanceof APIError) {
      // Retry on 5xx errors and specific 4xx errors
      return (
        error.status >= 500 ||
        error.status === 408 || // Request Timeout
        error.status === 429 || // Too Many Requests
        error.status === 503    // Service Unavailable
      )
    }

    // Retry on network errors
    return true
  }

  private async delay(attempt: number): Promise<void> {
    const baseDelay = this.config.retry?.delay || 1000
    const backoff = this.config.retry?.backoff || 'linear'

    const delay = backoff === 'exponential' 
      ? baseDelay * Math.pow(2, attempt - 1)
      : baseDelay * attempt

    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Public methods
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options)
  }

  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body })
  }

  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body })
  }

  async patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body })
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options)
  }

  // Auth helpers
  setAuthToken(token: string): void {
    this.authToken = token
  }

  clearAuthToken(): void {
    this.authToken = undefined
  }

  // Interceptors
  addRequestInterceptor(interceptor: (config: any) => any): void {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor)
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }
}