import { NextRequest, NextResponse } from 'next/server'
import { getDbHealth, isDbHealthy } from '@/lib/database/connection-manager'
import { checkDatabaseHealth } from '@/lib/database/prisma-client'
import { asyncHandler } from '@/lib/error/error-handler'

// GET /api/health/db - Database health check endpoint
export const GET = asyncHandler(async (request: NextRequest) => {
  // Get connection manager health
  const connectionHealth = getDbHealth()
  
  // Perform query health check
  const queryHealth = await checkDatabaseHealth()
  
  // Determine overall health status
  const isHealthy = isDbHealthy() && queryHealth.isHealthy
  
  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: {
      connection: {
        isHealthy: connectionHealth.isHealthy,
        lastCheck: connectionHealth.lastCheck,
        errorCount: connectionHealth.errorCount,
        latency: connectionHealth.latency,
        details: connectionHealth.details
      },
      query: {
        isHealthy: queryHealth.isHealthy,
        latency: queryHealth.latency,
        error: queryHealth.error
      }
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    }
  }
  
  // Return appropriate status code based on health
  return NextResponse.json(response, { 
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy'
    }
  })
})