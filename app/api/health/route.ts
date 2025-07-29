import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { metrics } from '@/lib/monitoring/metrics-collector'

// GET /api/health - Comprehensive health check
export async function GET(request: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, any>
  }

  // Database health
  let dbClient: PrismaClient | null = null
  try {
    const startTime = Date.now()
    
    // Create a simple Prisma client for health check
    dbClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
      }
    })
    
    // Try a simple query
    await dbClient.$queryRaw`SELECT 1`
    
    const latency = Date.now() - startTime
    
    checks.checks.database = {
      status: 'healthy',
      latency: `${latency}ms`,
      connection: 'active',
      type: process.env.DATABASE_URL?.includes('sqlite') ? 'sqlite' : 'postgresql',
      url: process.env.DATABASE_URL || 'default'
    }
  } catch (error) {
    checks.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database operation failed',
      url: process.env.DATABASE_URL || 'default'
    }
    checks.status = 'unhealthy'
  } finally {
    // Clean up the connection
    if (dbClient) {
      await dbClient.$disconnect().catch(() => {})
    }
  }

  // Memory usage
  const memoryUsage = process.memoryUsage()
  checks.checks.memory = {
    status: 'healthy',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
    external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
  }

  // Check if memory usage is too high
  const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  if (heapUsedPercentage > 90) {
    checks.checks.memory.status = 'unhealthy'
    checks.checks.memory.warning = 'High memory usage'
    checks.status = 'degraded'
  }

  // Uptime
  checks.checks.uptime = {
    status: 'healthy',
    seconds: Math.floor(process.uptime()),
    formatted: formatUptime(process.uptime())
  }

  // Metrics summary
  const metricsAggregations = metrics.getAllAggregations()
  const requestMetrics = metricsAggregations.filter(m => m.name === 'http.requests.total')
  const errorMetrics = metricsAggregations.filter(m => m.name === 'http.errors.total')
  
  checks.checks.metrics = {
    status: 'healthy',
    totalRequests: requestMetrics.reduce((sum, m) => sum + m.sum, 0),
    totalErrors: errorMetrics.reduce((sum, m) => sum + m.sum, 0),
    errorRate: calculateErrorRate(requestMetrics, errorMetrics)
  }

  // Response headers
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Health-Status': checks.status
  }

  // Return appropriate status code
  const statusCode = 
    checks.status === 'healthy' ? 200 :
    checks.status === 'degraded' ? 200 :
    503

  return NextResponse.json(checks, { status: statusCode, headers })
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${secs}s`)
  
  return parts.join(' ')
}

function calculateErrorRate(
  requestMetrics: any[],
  errorMetrics: any[]
): string {
  const totalRequests = requestMetrics.reduce((sum, m) => sum + m.sum, 0)
  const totalErrors = errorMetrics.reduce((sum, m) => sum + m.sum, 0)
  
  if (totalRequests === 0) return '0%'
  
  const rate = (totalErrors / totalRequests) * 100
  return `${rate.toFixed(2)}%`
}