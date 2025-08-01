/**
 * Error Recovery Middleware
 * Provides automatic recovery mechanisms for common errors
 */

import { NextRequest, NextResponse } from 'next/server'
import { isDbHealthy } from '@/lib/database/connection-manager'

export interface RecoveryOptions {
  enableDbHealthCheck?: boolean
  enableCircuitBreaker?: boolean
  enableGracefulDegradation?: boolean
  maintenanceMode?: boolean
}

interface CircuitBreakerState {
  isOpen: boolean
  failures: number
  lastFailure?: Date
  nextRetry?: Date
}

// Circuit breaker states for different services
const circuitBreakers: Map<string, CircuitBreakerState> = new Map()

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  halfOpenRequests: 3
}

export async function errorRecoveryMiddleware(
  request: NextRequest,
  options: RecoveryOptions = {}
): Promise<NextResponse | null> {
  const {
    enableDbHealthCheck = true,
    enableCircuitBreaker = true,
    enableGracefulDegradation = true,
    maintenanceMode = false
  } = options

  // Check if in maintenance mode
  if (maintenanceMode) {
    return createMaintenanceResponse()
  }

  // Skip health check endpoints to avoid circular dependency
  if (request.nextUrl.pathname.startsWith('/api/health')) {
    return null
  }

  // Database health check
  if (enableDbHealthCheck && request.nextUrl.pathname.startsWith('/api/')) {
    const dbHealthy = await checkDatabaseHealth()
    
    if (!dbHealthy) {
      // Check if we can serve from cache or provide degraded service
      if (enableGracefulDegradation) {
        return handleDegradedService(request)
      }
      
      return createServiceUnavailableResponse('Database connection unavailable')
    }
  }

  // Circuit breaker check for external services
  if (enableCircuitBreaker) {
    const service = getServiceFromPath(request.nextUrl.pathname)
    
    if (service && isCircuitOpen(service)) {
      return createServiceUnavailableResponse(
        `Service temporarily unavailable. Please try again later.`
      )
    }
  }

  return null
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    return isDbHealthy()
  } catch {
    return false
  }
}

function getServiceFromPath(pathname: string): string | null {
  // Map paths to services
  const serviceMap: Record<string, string> = {
    '/api/auth': 'auth',
    '/api/trips': 'trips',
    '/api/users': 'users',
    '/api/notifications': 'notifications',
    '/api/billing': 'billing'
  }

  for (const [path, service] of Object.entries(serviceMap)) {
    if (pathname.startsWith(path)) {
      return service
    }
  }

  return null
}

function isCircuitOpen(service: string): boolean {
  const breaker = circuitBreakers.get(service)
  
  if (!breaker) {
    return false
  }

  // Check if circuit is open
  if (breaker.isOpen) {
    // Check if we should try half-open
    if (breaker.nextRetry && new Date() >= breaker.nextRetry) {
      // Move to half-open state
      breaker.isOpen = false
      breaker.failures = Math.floor(CIRCUIT_BREAKER_CONFIG.failureThreshold / 2)
    }
  }

  return breaker.isOpen
}

export function recordServiceFailure(service: string) {
  let breaker = circuitBreakers.get(service)
  
  if (!breaker) {
    breaker = {
      isOpen: false,
      failures: 0
    }
    circuitBreakers.set(service, breaker)
  }

  breaker.failures++
  breaker.lastFailure = new Date()

  // Open circuit if threshold reached
  if (breaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    breaker.isOpen = true
    breaker.nextRetry = new Date(
      Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeout
    )
    
    // Log circuit breaker activation via structured logger
    import('@/lib/logger').then(({ logger }) => {
      logger.error('Circuit breaker opened', { 
        service, 
        failures: breaker.failures,
        threshold: CIRCUIT_BREAKER_CONFIG.failureThreshold 
      });
    });
  }
}

export function recordServiceSuccess(service: string) {
  const breaker = circuitBreakers.get(service)
  
  if (breaker) {
    // Reset on success
    breaker.failures = 0
    breaker.isOpen = false
    breaker.lastFailure = undefined
    breaker.nextRetry = undefined
  }
}

function handleDegradedService(request: NextRequest): NextResponse {
  // Implement graceful degradation strategies
  // const pathname = request.nextUrl.pathname

  // For read operations, try to serve from cache
  if (request.method === 'GET') {
    // Add cache headers to encourage browser caching
    const response = createDegradedResponse({
      message: 'Service operating in degraded mode. Some features may be limited.',
      cached: true
    })
    
    response.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes
    response.headers.set('X-Degraded-Mode', 'true')
    
    return response
  }

  // For write operations, queue for later or reject
  return createServiceUnavailableResponse(
    'Service temporarily unavailable for modifications. Please try again later.'
  )
}

function createMaintenanceResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'MAINTENANCE_MODE',
        message: 'Service is under maintenance. Please check back later.',
        estimatedReturnTime: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }
    },
    {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'X-Maintenance-Mode': 'true'
      }
    }
  )
}

function createServiceUnavailableResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message,
        timestamp: new Date().toISOString()
      }
    },
    {
      status: 503,
      headers: {
        'Retry-After': '60',
        'X-Service-Status': 'unavailable'
      }
    }
  )
}

function createDegradedResponse(data: any): NextResponse {
  return NextResponse.json(
    {
      warning: 'Service operating in degraded mode',
      data
    },
    {
      status: 200,
      headers: {
        'X-Degraded-Mode': 'true'
      }
    }
  )
}

// Export circuit breaker controls
export const circuitBreaker = {
  recordFailure: recordServiceFailure,
  recordSuccess: recordServiceSuccess,
  isOpen: isCircuitOpen,
  reset: (service: string) => {
    circuitBreakers.delete(service)
  },
  resetAll: () => {
    circuitBreakers.clear()
  }
}