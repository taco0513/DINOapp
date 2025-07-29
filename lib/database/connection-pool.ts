/**
 * Database Connection Pool Management for Production
 * 프로덕션 환경을 위한 데이터베이스 연결 풀 관리
 */

import { PrismaClient } from '@prisma/client'

// Global declaration for Prisma client
declare global {
  var __prisma: PrismaClient | undefined
}

interface ConnectionPoolConfig {
  maxConnections: number
  connectionTimeout: number
  idleTimeout: number
  queryTimeout: number
}

class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool
  private client: PrismaClient | null = null
  private config: ConnectionPoolConfig

  private constructor() {
    this.config = {
      maxConnections: parseInt(process.env.DB_POOL_MAX_CONNECTIONS || '10'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'), // 30s
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '600000'), // 10m
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30s
    }
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool()
    }
    return DatabaseConnectionPool.instance
  }

  public getClient(): PrismaClient {
    if (!this.client) {
      this.client = this.createClient()
    }
    return this.client
  }

  private createClient(): PrismaClient {
    const databaseUrl = process.env.DATABASE_URL || ''
    const isSQLite = databaseUrl.includes('sqlite') || databaseUrl.startsWith('file:')
    
    // Development 환경에서는 글로벌 클라이언트 재사용
    if (process.env.NODE_ENV !== 'production') {
      if (!global.__prisma) {
        global.__prisma = new PrismaClient({
          log: ['error', 'warn'],
          datasources: {
            db: {
              url: process.env.DATABASE_URL
            }
          }
        })
      }
      return global.__prisma
    }

    // Production 환경을 위한 최적화된 클라이언트
    const clientConfig: any = {
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }

    // PostgreSQL에만 connection pool 설정 적용
    if (!isSQLite) {
      clientConfig.__internal = {
        engine: {
          connectionLimit: this.config.maxConnections,
          pool_timeout: this.config.connectionTimeout,
          socket_timeout: this.config.queryTimeout
        }
      }
    }

    return new PrismaClient(clientConfig)
  }

  public async connect(): Promise<void> {
    try {
      await this.getClient().$connect()
      // Database connected successfully
    } catch (error) {
      // Database connection failed
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect()
      this.client = null
      // Database disconnected
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    timestamp: string
  }> {
    const startTime = Date.now()
    
    try {
      await this.getClient().$queryRaw`SELECT 1 as health_check`
      const latency = Date.now() - startTime
      
      return {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      // Database health check failed
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  public async getConnectionInfo(): Promise<{
    activeConnections: number
    maxConnections: number
    poolStatus: string
  }> {
    try {
      // Check if using SQLite or PostgreSQL
      const databaseUrl = process.env.DATABASE_URL || ''
      const isSQLite = databaseUrl.includes('sqlite') || databaseUrl.startsWith('file:')
      
      if (isSQLite) {
        // For SQLite, connection pooling is simpler
        await this.getClient().$queryRaw`SELECT 1 as test`
        return {
          activeConnections: 1,
          maxConnections: 1, // SQLite only supports single connection
          poolStatus: 'healthy'
        }
      } else {
        // PostgreSQL 연결 정보 조회
        const result = await this.getClient().$queryRaw<Array<{
          active: bigint
          idle: bigint
          total: bigint
        }>>`
          SELECT 
            count(*) FILTER (WHERE state = 'active') as active,
            count(*) FILTER (WHERE state = 'idle') as idle,
            count(*) as total
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `

        if (result.length > 0) {
          const stats = result[0]
          return {
            activeConnections: Number(stats.active),
            maxConnections: this.config.maxConnections,
            poolStatus: Number(stats.active) < this.config.maxConnections ? 'healthy' : 'warning'
          }
        }
      }

      return {
        activeConnections: 0,
        maxConnections: this.config.maxConnections,
        poolStatus: 'unknown'
      }
    } catch (error) {
      // Failed to get connection info
      return {
        activeConnections: -1,
        maxConnections: this.config.maxConnections,
        poolStatus: 'error'
      }
    }
  }

  public getMetrics() {
    return {
      config: this.config,
      isConnected: this.client !== null,
      environment: process.env.NODE_ENV
    }
  }
}

// Export singleton instance
export const dbPool = DatabaseConnectionPool.getInstance()

// Export enhanced Prisma client
export const prisma = dbPool.getClient()

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await dbPool.disconnect()
})

process.on('SIGINT', async () => {
  await dbPool.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await dbPool.disconnect()
  process.exit(0)
})