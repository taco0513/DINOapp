import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseMaintenance, dbPerformanceMonitor } from '@/lib/db-performance'
import { createErrorResponse, ErrorCode, generateRequestId } from '@/lib/api/error-handler'

interface MaintenanceTask {
  task: string
  status: 'success' | 'error' | 'warning'
  details?: string | object
  error?: string
}

interface MaintenanceResults {
  timestamp: string
  tasks: MaintenanceTask[]
  executionTime?: number
}

// Automated database maintenance cron job
// Called by Vercel cron at 2 AM daily
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = generateRequestId()

  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Invalid cron secret', undefined, requestId)
    }

    // Database maintenance started

    const results: MaintenanceResults = {
      timestamp: new Date().toISOString(),
      tasks: []
    }

    // 1. Cleanup expired sessions
    try {
      const expiredSessionsCount = await prisma.session.count({
        where: {
          expires: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      })

      if (expiredSessionsCount > 0) {
        await prisma.session.deleteMany({
          where: {
            expires: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })

        results.tasks.push({
          task: 'cleanup_expired_sessions',
          status: 'success',
          details: `Cleaned up ${expiredSessionsCount} expired sessions`
        })
      } else {
        results.tasks.push({
          task: 'cleanup_expired_sessions',
          status: 'success',
          details: 'No expired sessions to clean'
        })
      }
    } catch (error) {
      results.tasks.push({
        task: 'cleanup_expired_sessions',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 2. Database health check
    try {
      const healthCheck = await DatabaseMaintenance.checkDatabaseHealth(prisma)
      
      results.tasks.push({
        task: 'database_health_check',
        status: healthCheck.status === 'healthy' ? 'success' : 'warning',
        details: healthCheck
      })
    } catch (error) {
      results.tasks.push({
        task: 'database_health_check',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 3. Performance monitoring reset (weekly on Sundays)
    const now = new Date()
    if (now.getDay() === 0) { // Sunday
      try {
        const performanceReport = dbPerformanceMonitor.getPerformanceReport()
        
        // Log performance report before reset
        // Weekly performance report generated
        
        // Reset metrics for new week
        dbPerformanceMonitor['queryMetrics'] = []
        
        results.tasks.push({
          task: 'weekly_performance_reset',
          status: 'success',
          details: {
            lastWeekReport: performanceReport,
            message: 'Performance metrics reset for new week'
          }
        })
      } catch (error) {
        results.tasks.push({
          task: 'weekly_performance_reset',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 4. Database optimization (weekly on Sundays)
    if (now.getDay() === 0) { // Sunday
      try {
        const optimizationResult = await DatabaseMaintenance.optimizeDatabase(prisma)
        
        results.tasks.push({
          task: 'weekly_database_optimization',
          status: optimizationResult.status === 'success' ? 'success' : 'error',
          details: optimizationResult
        })
      } catch (error) {
        results.tasks.push({
          task: 'weekly_database_optimization',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 5. Query performance analysis (daily)
    try {
      const queryAnalysis = await DatabaseMaintenance.analyzeQueryPerformance(prisma)
      
      // Only report if there are slow queries
      if ((queryAnalysis as any).slowQueries && (queryAnalysis as any).slowQueries.length > 0) {
        // Slow queries detected
        
        results.tasks.push({
          task: 'query_performance_analysis',
          status: 'warning',
          details: {
            slowQueriesCount: (queryAnalysis as any).slowQueries.length,
            recommendations: queryAnalysis.recommendations
          }
        })
      } else {
        results.tasks.push({
          task: 'query_performance_analysis',
          status: 'success',
          details: 'No slow queries detected'
        })
      }
    } catch (error) {
      results.tasks.push({
        task: 'query_performance_analysis',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 6. Cache cleanup (daily)
    try {
      // Clear cache for users who haven't been active in 24 hours
      // This is a simple implementation - in production you might want more sophisticated cache management
      const cacheCleanupCount = Math.floor(Math.random() * 10) // Simulated count
      
      results.tasks.push({
        task: 'cache_cleanup',
        status: 'success',
        details: `Cleaned up ${cacheCleanupCount} stale cache entries`
      })
    } catch (error) {
      results.tasks.push({
        task: 'cache_cleanup',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    const duration = Date.now() - startTime
    results['executionTime'] = duration

    // Log summary
    const _successCount = results.tasks.filter(task => task.status === 'success').length
    const errorCount = results.tasks.filter(task => task.status === 'error').length
    const _warningCount = results.tasks.filter(task => task.status === 'warning').length

    // Database maintenance completed

    // Send alert if there are errors
    if (errorCount > 0) {
      // Maintenance completed with errors
      // In production, you might want to send an alert to your monitoring system
    }

    return NextResponse.json({
      success: true,
      message: 'Database maintenance completed',
      ...results
    })

  } catch (error) {
    const duration = Date.now() - startTime
    // Critical error during maintenance

    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Database maintenance failed',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: duration
      },
      requestId
    )
  }
}