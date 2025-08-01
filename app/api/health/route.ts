import { NextRequest, NextResponse } from 'next/server'
import { metrics } from '@/lib/monitoring/metrics-collector'
import { dbManager, getDbHealth, isDbHealthy } from '@/lib/database/connection-manager'
// TODO: Remove unused loggers import

// TODO: Remove unused logger import
// GET /api/health - Comprehensive health check
export async function GET(_request: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, any>
  }

  // Database health using connection manager
  // TODO: Remove unused logger variable
  try {
    const startTime = Date.now()
    const dbHealth = getDbHealth()
    
    if (!isDbHealthy()) {
      // Try to get a fresh health check
      try {
        const client = await dbManager.getClient()
        await client.$queryRaw`SELECT 1 as health_check`
        const latency = Date.now() - startTime
        
        checks.checks.database = {
          status: 'healthy',
          latency: `${latency}ms`,
          connection: 'active',
          type: process.env.DATABASE_URL?.includes('sqlite') ? 'sqlite' : 'postgresql',
          lastCheck: dbHealth.lastCheck,
          errorCount: dbHealth.errorCount,
          details: dbHealth.details
        }
      } catch (reconnectError) {
        checks.checks.database = {
          status: 'unhealthy',
          error: reconnectError instanceof Error ? reconnectError.message : 'Database connection failed',
          lastCheck: dbHealth.lastCheck,
          errorCount: dbHealth.errorCount,
          connectionAttempts: 'Failed to reconnect'
        }
        checks.status = 'unhealthy'
      }
    } else {
      // Database is healthy according to connection manager
      const latency = dbHealth.latency || 0
      
      checks.checks.database = {
        status: 'healthy',
        latency: `${latency}ms`,
        connection: 'active',
        type: process.env.DATABASE_URL?.includes('sqlite') ? 'sqlite' : 'postgresql',
        lastCheck: dbHealth.lastCheck,
        errorCount: dbHealth.errorCount,
        details: dbHealth.details
      }
      
      // Mark as degraded if latency is high
      if (latency > 1000) {
        checks.checks.database.warning = 'High database latency'
        checks.status = 'degraded'
      }
    }
  } catch (error) {
    console.error('Health check database error', {
      error: error instanceof Error ? error.message : error
    })
    
    checks.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database health check failed'
    }
    checks.status = 'unhealthy'
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
  try {
    const metricsAggregations = metrics.getAllAggregations()
    const requestMetrics = metricsAggregations.filter(m => m.name === 'http.requests.total')
    const errorMetrics = metricsAggregations.filter(m => m.name === 'http.errors.total')
    
    const totalRequests = requestMetrics.reduce((sum, m) => sum + m.sum, 0)
    const totalErrors = errorMetrics.reduce((sum, m) => sum + m.sum, 0)
    const errorRate = calculateErrorRate(requestMetrics, errorMetrics)
    
    checks.checks.metrics = {
      status: 'healthy',
      totalRequests,
      totalErrors,
      errorRate
    }
    
    // Mark as degraded if error rate is high
    const errorRateNum = parseFloat(errorRate.replace('%', ''))
    if (errorRateNum > 5) {
      checks.checks.metrics.status = 'degraded'
      checks.checks.metrics.warning = 'High error rate'
      if (checks.status === 'healthy') {
        checks.status = 'degraded'
      }
    }
  } catch (error) {
    checks.checks.metrics = {
      status: 'unhealthy',
      error: 'Failed to collect metrics'
    }
  }
  
  // External services health (if any)
  checks.checks.services = {
    status: 'healthy',
    gmail: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not-configured',
    analytics: process.env.NEXT_PUBLIC_GA_ID ? 'configured' : 'not-configured',
    monitoring: process.env.SENTRY_DSN ? 'configured' : 'not-configured'
  }

  // Log health check results
  console.info('Health check completed', {
    status: checks.status,
    databaseHealthy: checks.checks.database?.status === 'healthy',
    memoryUsage: checks.checks.memory?.heapUsed,
    uptime: checks.checks.uptime?.seconds
  })

  // Response headers
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Health-Status': checks.status,
    'X-Health-Timestamp': checks.timestamp
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