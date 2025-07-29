/**
 * Database Connection Manager
 * Handles connection pooling, retry logic, and health monitoring
 */

import { PrismaClient } from '@prisma/client'
import { AppError, ErrorCode, ErrorSeverity } from '@/lib/error/error-handler'

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
    try {
      // Create new PrismaClient with optimized settings
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      })

      // Set connection pool size (PostgreSQL only, skip for SQLite)
      const databaseUrl = process.env.DATABASE_URL || ''
      const isSQLite = databaseUrl.includes('sqlite') || databaseUrl.startsWith('file:')
      
      if (!isSQLite) {
        await this.prisma.$executeRawUnsafe(`
          ALTER SYSTEM SET max_connections = ${this.options.poolSize};
        `).catch(() => {
          // Ignore if we don't have permissions
        })
      }

      // Test connection
      await this.prisma.$connect()
      
      // Verify connection with a simple query
      await this.prisma.$queryRaw`SELECT 1`
      
      this.health.isHealthy = true
      this.health.errorCount = 0
      this.retryAttempts = 0
      
      console.log('✅ Database connection established')
    } catch (error) {
      this.health.isHealthy = false
      this.health.errorCount++
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to connect to database',
        500,
        ErrorSeverity.CRITICAL,
        { error: error instanceof Error ? error.message : error }
      )
    }
  }

  async getClient(): Promise<PrismaClient> {
    // Check if we have a healthy connection
    if (!this.prisma || !this.health.isHealthy) {
      await this.reconnect()
    }

    if (!this.prisma) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Database connection not available',
        500,
        ErrorSeverity.CRITICAL
      )
    }

    return this.prisma
  }

  private async reconnect(): Promise<void> {
    if (this.retryAttempts >= this.options.maxRetries) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Failed to reconnect after ${this.options.maxRetries} attempts`,
        500,
        ErrorSeverity.CRITICAL
      )
    }

    this.retryAttempts++
    console.log(`🔄 Attempting to reconnect (${this.retryAttempts}/${this.options.maxRetries})...`)

    try {
      // Disconnect existing connection
      if (this.prisma) {
        await this.prisma.$disconnect().catch(() => {})
        this.prisma = null
      }

      // Wait before reconnecting
      await this.delay(this.options.retryDelay * this.retryAttempts)

      // Attempt to connect
      await this.connect()
    } catch (error) {
      console.error(`Reconnection attempt ${this.retryAttempts} failed:`, error)
      
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
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.options.maxRetries
    const retryDelay = options?.retryDelay ?? this.options.retryDelay
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError
        }

        if (attempt < maxRetries) {
          if (options?.onRetry) {
            options.onRetry(attempt + 1, lastError)
          }
          
          console.warn(
            `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`,
            lastError.message
          )
          
          await this.delay(retryDelay * Math.pow(2, attempt))
        }
      }
    }

    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      `Operation failed after ${maxRetries + 1} attempts`,
      500,
      ErrorSeverity.HIGH,
      { lastError: lastError?.message }
    )
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // Don't retry on these errors
    const nonRetryablePatterns = [
      'unique constraint',
      'foreign key constraint',
      'check constraint',
      'invalid input syntax',
      'permission denied',
      'does not exist'
    ]
    
    return nonRetryablePatterns.some(pattern => message.includes(pattern))
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
    
    console.log('🔌 Database connection closed')
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
    
    return client.$transaction(fn, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? this.options.queryTimeout
    })
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