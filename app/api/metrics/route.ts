import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { metrics } from '@/lib/monitoring/metrics-collector'
import { asyncHandler } from '@/lib/error/error-handler'

// GET /api/metrics - Get current metrics (admin only)
export const GET = asyncHandler(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if user is admin (you can implement your own admin check)
  const isAdmin = session.user?.email === process.env.ADMIN_EMAIL
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Get all metric aggregations
  const aggregations = metrics.getAllAggregations()
  
  // Group metrics by category
  const groupedMetrics = {
    http: aggregations.filter(m => m.name.startsWith('http.')),
    db: aggregations.filter(m => m.name.startsWith('db.')),
    business: aggregations.filter(m => 
      m.name.startsWith('trips.') || 
      m.name.startsWith('users.') || 
      m.name.startsWith('schengen.')
    ),
    system: aggregations.filter(m => 
      !m.name.startsWith('http.') && 
      !m.name.startsWith('db.') && 
      !m.name.startsWith('trips.') &&
      !m.name.startsWith('users.') &&
      !m.name.startsWith('schengen.')
    )
  }

  // Calculate summary statistics
  const summary = {
    totalRequests: aggregations
      .filter(m => m.name === 'http.requests.total')
      .reduce((sum, m) => sum + m.sum, 0),
    errorRate: calculateErrorRate(aggregations),
    avgResponseTime: calculateAvgResponseTime(aggregations),
    activeUsers: calculateActiveUsers(aggregations),
    timestamp: new Date().toISOString()
  }

  return NextResponse.json({
    summary,
    metrics: groupedMetrics,
    raw: aggregations
  })
})

function calculateErrorRate(aggregations: any[]): number {
  const totalRequests = aggregations
    .filter(m => m.name === 'http.requests.total')
    .reduce((sum, m) => sum + m.sum, 0)
  
  const totalErrors = aggregations
    .filter(m => m.name === 'http.errors.total')
    .reduce((sum, m) => sum + m.sum, 0)
  
  return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
}

function calculateAvgResponseTime(aggregations: any[]): number {
  const responseTimes = aggregations.filter(m => m.name === 'http.request.duration')
  
  if (responseTimes.length === 0) return 0
  
  const totalTime = responseTimes.reduce((sum, m) => sum + m.sum, 0)
  const totalCount = responseTimes.reduce((sum, m) => sum + m.count, 0)
  
  return totalCount > 0 ? totalTime / totalCount : 0
}

function calculateActiveUsers(aggregations: any[]): number {
  // This is a placeholder - you would implement actual active user tracking
  const signups = aggregations
    .filter(m => m.name === 'users.signup.total')
    .reduce((sum, m) => sum + m.sum, 0)
  
  return signups
}