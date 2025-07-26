import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseMaintenance, dbPerformanceMonitor, OptimizedQueries } from '@/lib/db-performance'
import { checkRateLimit, STRICT_RATE_LIMIT, logSecurityEvent, securityHeaders } from '@/lib/security'

// Admin-only database management endpoint
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting
    if (!checkRateLimit(request, STRICT_RATE_LIMIT)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { 
        status: 429,
        headers: securityHeaders 
      })
    }

    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      logSecurityEvent('unauthorized_database_access', { ip: request.ip }, request)
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: securityHeaders 
      })
    }

    // Admin check (you might want to add admin role to your user model)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes(session.user.email)) {
      logSecurityEvent('non_admin_database_access', { 
        email: session.user.email,
        ip: request.ip 
      }, request)
      return NextResponse.json({ error: 'Admin access required' }, { 
        status: 403,
        headers: securityHeaders 
      })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health'

    let result

    switch (action) {
      case 'health':
        result = await DatabaseMaintenance.checkDatabaseHealth(prisma)
        break

      case 'performance':
        result = {
          performanceReport: dbPerformanceMonitor.getPerformanceReport(),
          queryAnalysis: await DatabaseMaintenance.analyzeQueryPerformance(prisma)
        }
        break

      case 'optimize':
        result = await DatabaseMaintenance.optimizeDatabase(prisma)
        break

      case 'cache-stats':
        result = {
          cacheSize: OptimizedQueries['cache']?.size || 0,
          performanceMetrics: dbPerformanceMonitor.getPerformanceReport()
        }
        break

      case 'slow-queries':
        result = {
          slowQueries: dbPerformanceMonitor.getSlowQueries(100), // queries > 100ms
          threshold: 100
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { 
          status: 400,
          headers: securityHeaders 
        })
    }

    const duration = Date.now() - startTime
    console.log(`[DB Admin] ${action} completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      action,
      data: result,
      executionTime: duration,
      timestamp: new Date().toISOString()
    }, {
      headers: securityHeaders
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[DB Admin] Error:', error)
    
    logSecurityEvent('database_admin_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    }, request)

    return NextResponse.json({
      error: 'Database operation failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: securityHeaders 
    })
  }
}

// Database maintenance operations
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting
    if (!checkRateLimit(request, STRICT_RATE_LIMIT)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { 
        status: 429,
        headers: securityHeaders 
      })
    }

    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: securityHeaders 
      })
    }

    // Admin check
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { 
        status: 403,
        headers: securityHeaders 
      })
    }

    const body = await request.json()
    const { action, params } = body

    let result

    switch (action) {
      case 'clear-cache':
        if (params?.userId) {
          OptimizedQueries.clearUserCache(params.userId)
          result = { message: `Cache cleared for user ${params.userId}` }
        } else {
          OptimizedQueries.clearAllCache()
          result = { message: 'All cache cleared' }
        }
        break

      case 'analyze-performance':
        result = await DatabaseMaintenance.analyzeQueryPerformance(prisma)
        break

      case 'vacuum':
        result = await DatabaseMaintenance.optimizeDatabase(prisma)
        break

      case 'reset-performance-stats':
        // Reset performance monitoring stats
        dbPerformanceMonitor['queryMetrics'] = []
        result = { message: 'Performance statistics reset' }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { 
          status: 400,
          headers: securityHeaders 
        })
    }

    const duration = Date.now() - startTime
    console.log(`[DB Maintenance] ${action} completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      action,
      data: result,
      executionTime: duration,
      timestamp: new Date().toISOString()
    }, {
      headers: securityHeaders
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[DB Maintenance] Error:', error)
    
    logSecurityEvent('database_maintenance_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    }, request)

    return NextResponse.json({
      error: 'Database maintenance failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: securityHeaders 
    })
  }
}