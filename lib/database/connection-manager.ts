// TODO: Remove unused logger import

/**
 * Database Connection Manager
 * Handles connection pooling, retry logic, and health monitoring
 */

import { PrismaClient } from '@prisma/client'
import { errors } from '@/lib/error/error-handler'
import { loggers } from '@/lib/monitoring/logger'

export interface ConnectionOptions {
  maxRetries?: number
  retryDelay?: number
  connectionTimeout?: number
  queryTimeout?: number
  poolSize?: number
  enableHealthChecks?: boolean
  healthCheckInterval?: number
}

export interface ConnectionHealth {
  isHealthy: boolean
  lastCheck: Date
  errorCount: number
  latency?: number
  details?: any
}

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private prisma: PrismaClient | null = null
  private retryAttempts = 0
  private health: ConnectionHealth = {
    isHealthy: false,
    lastCheck: new Date(),
    errorCount: 0
  }
  private healthCheckTimer?: NodeJS.Timeout
  private reconnectTimer?: NodeJS.Timeout
  
  private readonly options: Required<ConnectionOptions> = {
    maxRetries: 3,
    retryDelay: 1000,
    connectionTimeout: 5000,
    queryTimeout: 30000,
    poolSize: 10,
    enableHealthChecks: true,
    healthCheckInterval: 30000 // 30 seconds
  }

  private constructor(options?: ConnectionOptions) {
    this.options = { ...this.options, ...options }
    this.initialize()
  }

  static getInstance(options?: ConnectionOptions): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager(options)
    }
    return DatabaseConnectionManager.instance
  }

  private async initialize() {
    try {
      await this.connect()
      
      if (this.options.enableHealthChecks) {
        this.startHealthChecks()
      }
    } catch (error) {
      console.error('Failed to initialize database connection:', error)
      this.scheduleReconnect()
    }
  }

  private async connect(): Promise<void> {
    const logger = loggers.db
    
    try {
      console.info('Attempting database connection', {
        attempt: this.retryAttempts + 1,
        maxRetries: this.options.maxRetries
      })

      // Create new PrismaClient with optimized settings
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        errorFormat: 'pretty'
      })

      // Add query timeout and retry middleware
      this.prisma.$use(async (params, next) => {
        const before = Date.now()
        
        try {
          const result = await Promise.race([
            next(params),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), this.options.queryTimeout)
            )
          ])
          
          const after = Date.now()
          const duration = after - before
          
          if (duration > 5000) { // Log slow queries
            console.warn('Slow query detected', {
              model: params.model,
              action: params.action,
              duration
            })
          }
          
          return result
        } catch (error) {
          const after = Date.now()
          console.error('Query failed', {
            model: params.model,
            action: params.action,
            duration: after - before,
            error: error instanceof Error ? error.message : error
          })
          throw error
        }
      })

      // Set connection pool size (PostgreSQL only, skip for SQLite)
      const databaseUrl = process.env.DATABASE_URL || ''
      const isSQLite = databaseUrl.includes('sqlite') || databaseUrl.startsWith('file:')
      
      if (!isSQLite) {
        try {
          // Try to optimize connection settings for PostgreSQL
          await this.prisma.$executeRaw`SELECT set_config('max_connections', ${this.options.poolSize}::text, false)`
        } catch (configError) {
          // Ignore configuration errors - we might not have permissions
          console.warn('Could not optimize connection settings', {
            error: configError instanceof Error ? configError.message : configError
          })
        }
      }

      // Test connection with timeout
      const connectionPromise = this.prisma.$connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), this.options.connectionTimeout)
      )
      
      await Promise.race([connectionPromise, timeoutPromise])
      
      // Verify connection with a simple query
      await this.prisma.$queryRaw`SELECT 1 as test`
      
      this.health.isHealthy = true
      this.health.errorCount = 0
      this.health.lastCheck = new Date()
      this.retryAttempts = 0
      
      console.info('Database connection established successfully', {
        poolSize: this.options.poolSize,
        databaseType: isSQLite ? 'sqlite' : 'postgresql'
      })
      
    } catch (error) {
      this.health.isHealthy = false
      this.health.errorCount++
      this.health.lastCheck = new Date()
      
      console.error('Database connection failed', {
        attempt: this.retryAttempts + 1,
        errorCount: this.health.errorCount,
        error: error instanceof Error ? error.message : error
      })
      
      throw errors.database(
        'Failed to connect to database',
        { 
          error: error instanceof Error ? error.message : error,
          attempt: this.retryAttempts + 1,
          maxRetries: this.options.maxRetries
        }
      )
    }
  }

  async getClient(): Promise<PrismaClient> {
    const logger = loggers.db
    
    // Check if we have a healthy connection
    if (!this.prisma || !this.health.isHealthy) {
      console.warn('Database connection unhealthy, attempting reconnection')
      await this.reconnect()
    }

    if (!this.prisma) {
      console.error('Database client unavailable after reconnection attempt')
      throw errors.database(
        'Database connection not available',
        { 
          health: this.health,
          retryAttempts: this.retryAttempts
        }
      )
    }

    return this.prisma
  }

  private async reconnect(): Promise<void> {
    const logger = loggers.db
    
    if (this.retryAttempts >= this.options.maxRetries) {
      console.error('Maximum reconnection attempts exceeded', {
        maxRetries: this.options.maxRetries,
        errorCount: this.health.errorCount
      })
      
      throw errors.database(
        `Failed to reconnect after ${this.options.maxRetries} attempts`,
        { 
          attempts: this.retryAttempts,
          maxRetries: this.options.maxRetries,
          health: this.health
        }
      )
    }

    this.retryAttempts++
    console.info('Attempting database reconnection', {
      attempt: this.retryAttempts,
      maxRetries: this.options.maxRetries
    })

    try {
      // Disconnect existing connection gracefully
      if (this.prisma) {
        try {
          await Promise.race([
            this.prisma.$disconnect(),
            new Promise(resolve => setTimeout(resolve, 5000)) // 5s timeout for disconnect
          ])
        } catch (disconnectError) {
          console.warn('Error during disconnect', {
            error: disconnectError instanceof Error ? disconnectError.message : disconnectError
          })
        }
        this.prisma = null
      }

      // Exponential backoff with jitter
      const baseDelay = this.options.retryDelay * Math.pow(2, this.retryAttempts - 1)
      const jitter = Math.random() * 1000 // Add up to 1s jitter
      const delay = Math.min(baseDelay + jitter, 30000) // Cap at 30s
      
      console.info('Waiting before reconnection attempt', { delay: Math.round(delay) })
      await this.delay(delay)

      // Attempt to connect
      await this.connect()
      
      console.info('Database reconnection successful')
      
    } catch (error) {
      console.error('Reconnection attempt failed', {
        attempt: this.retryAttempts,
        error: error instanceof Error ? error.message : error
      })
      
      if (this.retryAttempts < this.options.maxRetries) {
        // Schedule another reconnect
        this.scheduleReconnect()
      } else {
        throw error
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = this.options.retryDelay * Math.pow(2, this.retryAttempts)
    this.reconnectTimer = setTimeout(() => {
      this.reconnect().catch(error => {
        console.error('Scheduled reconnection failed:', error)
      })
    }, delay)
  }

  private startHealthChecks() {
    this.healthCheckTimer = setInterval(async () => {
      await this.checkHealth()
    }, this.options.healthCheckInterval)
  }

  private async checkHealth(): Promise<ConnectionHealth> {
    const startTime = Date.now()
    
    try {
      if (!this.prisma) {
        throw new Error('No database connection')
      }

      // Simple health check query
      await this.prisma.$queryRaw`SELECT 1`
      
      const latency = Date.now() - startTime
      
      this.health = {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        latency,
        details: {
          connectionPool: await this.getPoolStats()
        }
      }
    } catch (error) {
      this.health = {
        isHealthy: false,
        lastCheck: new Date(),
        errorCount: this.health.errorCount + 1,
        details: {
          error: error instanceof Error ? error.message : error
        }
      }
      
      // Attempt reconnection if unhealthy
      if (!this.health.isHealthy) {
        this.scheduleReconnect()
      }
    }

    return this.health
  }

  private async getPoolStats() {
    try {
      if (!this.prisma) return null
      
      // PostgreSQL specific pool stats
      const databaseUrl = process.env.DATABASE_URL || ''
      const isSQLite = databaseUrl.includes('sqlite') || databaseUrl.startsWith('file:')
      
      if (!isSQLite) {
        const result = await this.prisma.$queryRaw<any[]>`
          SELECT 
            count(*) as total_connections,
            count(*) filter (where state = 'active') as active_connections,
            count(*) filter (where state = 'idle') as idle_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        `
        
        return result[0]
      } else {
        // SQLite doesn't have connection pooling stats, return basic info
        return {
          total_connections: 1,
          active_connections: 1,
          idle_connections: 0,
          database_type: 'sqlite'
        }
      }
    } catch {
      return null
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number
      retryDelay?: number
      onRetry?: (attempt: number, error: Error) => void
      operationName?: string
    }
  ): Promise<T> {
    const logger = loggers.db
    const maxRetries = options?.maxRetries ?? this.options.maxRetries
    const retryDelay = options?.retryDelay ?? this.options.retryDelay
    const operationName = options?.operationName || 'Database operation'
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now()
        const result = await operation()
        const duration = Date.now() - startTime
        
        if (attempt > 0) {
          console.info('Database operation succeeded after retry', {
            operationName,
            attempt: attempt + 1,
            duration
          })
        }
        
        return result
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        console.warn('Database operation failed', {
          operationName,
          attempt: attempt + 1,
          totalAttempts: maxRetries + 1,
          error: lastError.message
        })
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          console.error('Non-retryable database error', {
            operationName,
            error: lastError.message
          })
          throw lastError
        }

        // Check if this is a connection issue and attempt reconnection
        if (this.isConnectionError(lastError)) {
          console.warn('Connection error detected, marking connection as unhealthy')
          this.health.isHealthy = false
          this.health.errorCount++
        }

        if (attempt < maxRetries) {
          if (options?.onRetry) {
            options.onRetry(attempt + 1, lastError)
          }
          
          const delay = retryDelay * Math.pow(2, attempt)
          console.info('Retrying database operation', {
            operationName,
            nextAttempt: attempt + 2,
            delay
          })
          
          await this.delay(delay)
        }
      }
    }

    console.error('Database operation failed after all retry attempts', {
      operationName,
      attempts: maxRetries + 1,
      lastError: lastError?.message
    })

    throw errors.database(
      `${operationName} failed after ${maxRetries + 1} attempts`,
      { 
        lastError: lastError?.message,
        attempts: maxRetries + 1
      }
    )
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // Don't retry on these errors - they indicate data/logic issues, not infrastructure
    const nonRetryablePatterns = [
      'unique constraint',
      'foreign key constraint', 
      'check constraint',
      'invalid input syntax',
      'permission denied',
      'does not exist',
      'validation failed',
      'p2002', // Prisma unique constraint
      'p2003', // Prisma foreign key constraint
      'p2025'  // Prisma record not found
    ]
    
    return nonRetryablePatterns.some(pattern => message.includes(pattern))
  }

  private isConnectionError(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // These errors indicate connection issues that might be resolved with retry
    const connectionErrorPatterns = [
      'connection refused',
      'connection reset',
      'connection timeout',
      'server closed the connection',
      'connection lost',
      'connection aborted',
      'enotfound',
      'econnrefused',
      'econnreset',
      'timeout'
    ]
    
    return connectionErrorPatterns.some(pattern => message.includes(pattern))
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async disconnect(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
    }
    
    console.info('🔌 Database connection closed')
  }

  getHealth(): ConnectionHealth {
    return { ...this.health }
  }

  isHealthy(): boolean {
    return this.health.isHealthy
  }

  async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    options?: {
      maxWait?: number
      timeout?: number
    }
  ): Promise<T> {
    const client = await this.getClient()
    
    return client.$transaction(fn as any, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? this.options.queryTimeout
    }) as Promise<T>
  }
}

// Export convenience functions
export const dbManager = DatabaseConnectionManager.getInstance()

export async function getPrismaClient(): Promise<PrismaClient> {
  return dbManager.getClient()
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options?: Parameters<typeof dbManager.executeWithRetry>[1]
): Promise<T> {
  return dbManager.executeWithRetry(operation, options)
}

export function getDbHealth(): ConnectionHealth {
  return dbManager.getHealth()
}

export function isDbHealthy(): boolean {
  return dbManager.isHealthy()
}