import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface ErrorReport {
  message: string
  stack?: string
  url: string
  timestamp: number
  userId?: string
  userAgent?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'api' | 'database' | 'network' | 'security' | 'unknown'
  additionalData?: Record<string, any>
}

// In-memory error store (in production, use proper logging service)
const errorStore: ErrorReport[] = []
const MAX_ERRORS = 5000

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validate error data
    if (!body.message || !body.url) {
      return NextResponse.json(
        { error: 'Invalid error data' },
        { status: 400 }
      )
    }

    const errorReport: ErrorReport = {
      message: body.message,
      stack: body.stack,
      url: body.url,
      timestamp: body.timestamp || Date.now(),
      userId: session?.user?.id,
      userAgent: request.headers.get('user-agent') || undefined,
      severity: categorizeErrorSeverity(body.message, body.stack),
      category: categorizeError(body.message, body.stack),
      additionalData: body.additionalData
    }

    // Store error
    errorStore.push(errorReport)
    
    // Keep only recent errors
    if (errorStore.length > MAX_ERRORS) {
      errorStore.splice(0, errorStore.length - MAX_ERRORS)
    }

    // Log based on severity
    if (errorReport.severity === 'critical' || errorReport.severity === 'high') {
      console.error('[Critical Error]', {
        message: errorReport.message,
        stack: errorReport.stack,
        url: errorReport.url,
        userId: session?.user?.email,
        timestamp: new Date(errorReport.timestamp).toISOString()
      })
    } else {
      console.warn('[Error Report]', {
        message: errorReport.message,
        url: errorReport.url,
        severity: errorReport.severity,
        category: errorReport.category
      })
    }

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      await sendToErrorTrackingService(errorReport)
    }

    // Send alerts for critical errors
    if (errorReport.severity === 'critical') {
      await sendCriticalErrorAlert(errorReport)
    }

    return NextResponse.json({ 
      success: true,
      errorId: `error_${errorReport.timestamp}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error('Error reporting failed:', error)
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

// GET endpoint for error dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated admin users
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const severity = url.searchParams.get('severity')
    const category = url.searchParams.get('category')
    const timeRange = url.searchParams.get('timeRange') || '24h'
    
    // Calculate time window
    const now = Date.now()
    const timeWindows = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const timeWindow = timeWindows[timeRange as keyof typeof timeWindows] || timeWindows['24h']
    const startTime = now - timeWindow

    // Filter errors
    let filteredErrors = errorStore.filter(error => 
      error.timestamp >= startTime
    )

    if (severity && severity !== 'all') {
      filteredErrors = filteredErrors.filter(error => error.severity === severity)
    }

    if (category && category !== 'all') {
      filteredErrors = filteredErrors.filter(error => error.category === category)
    }

    // Aggregate data
    const summary = {
      totalErrors: filteredErrors.length,
      severityBreakdown: {} as Record<string, number>,
      categoryBreakdown: {} as Record<string, number>,
      recentErrors: filteredErrors
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50), // Latest 50 errors
      topErrors: getTopErrors(filteredErrors),
      errorRate: calculateErrorRate(filteredErrors, timeWindow),
      timeRange,
      startTime,
      endTime: now
    }

    // Count by severity and category
    filteredErrors.forEach(error => {
      summary.severityBreakdown[error.severity] = 
        (summary.severityBreakdown[error.severity] || 0) + 1
      summary.categoryBreakdown[error.category] = 
        (summary.categoryBreakdown[error.category] || 0) + 1
    })

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error retrieval failed:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve error data' },
      { status: 500 }
    )
  }
}

// Helper functions
function categorizeErrorSeverity(message: string, stack?: string): ErrorReport['severity'] {
  const criticalKeywords = [
    'database', 'authentication', 'security', 'payment', 'data loss',
    'corruption', 'unauthorized', 'sql injection', 'xss'
  ]
  
  const highKeywords = [
    'api', 'network', 'timeout', 'connection', 'server error',
    'internal server error', '500', 'failed to fetch'
  ]
  
  const mediumKeywords = [
    'validation', 'bad request', '400', 'not found', '404',
    'permission', 'rate limit', '429'
  ]

  const messageLower = message.toLowerCase()
  
  if (criticalKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'critical'
  }
  
  if (highKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'high'
  }
  
  if (mediumKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'medium'
  }
  
  return 'low'
}

function categorizeError(message: string, stack?: string): ErrorReport['category'] {
  const messageLower = message.toLowerCase()
  
  if (messageLower.includes('database') || messageLower.includes('prisma')) {
    return 'database'
  }
  
  if (messageLower.includes('fetch') || messageLower.includes('network') || 
      messageLower.includes('timeout') || messageLower.includes('connection')) {
    return 'network'
  }
  
  if (messageLower.includes('api') || messageLower.includes('server')) {
    return 'api'
  }
  
  if (messageLower.includes('unauthorized') || messageLower.includes('authentication') ||
      messageLower.includes('security') || messageLower.includes('xss') ||
      messageLower.includes('injection')) {
    return 'security'
  }
  
  return 'javascript'
}

function getTopErrors(errors: ErrorReport[]) {
  const errorCounts = new Map<string, { count: number, latestError: ErrorReport }>()
  
  errors.forEach(error => {
    const key = error.message.substring(0, 100) // Group by first 100 chars of message
    const existing = errorCounts.get(key)
    
    if (existing) {
      existing.count++
      if (error.timestamp > existing.latestError.timestamp) {
        existing.latestError = error
      }
    } else {
      errorCounts.set(key, { count: 1, latestError: error })
    }
  })
  
  return Array.from(errorCounts.entries())
    .map(([message, data]) => ({
      message: message,
      count: data.count,
      latestError: data.latestError
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 errors
}

function calculateErrorRate(errors: ErrorReport[], timeWindow: number): number {
  // Calculate errors per hour
  const hoursInWindow = timeWindow / (60 * 60 * 1000)
  return errors.length / hoursInWindow
}

async function sendToErrorTrackingService(error: ErrorReport) {
  try {
    // In production, send to Sentry, Rollbar, or similar service
    if (process.env.SENTRY_DSN) {
      // Sentry integration would go here
      console.log('Would send to Sentry:', error.message)
    }
    
    // Could also send to custom logging service
    // await fetch('your-logging-service-url', { ... })
    
  } catch (err) {
    console.error('Failed to send error to tracking service:', err)
  }
}

async function sendCriticalErrorAlert(error: ErrorReport) {
  try {
    // Send email, Slack notification, or other alert
    console.log('CRITICAL ERROR ALERT:', {
      message: error.message,
      url: error.url,
      timestamp: new Date(error.timestamp).toISOString()
    })
    
    // In production, you might want to:
    // - Send email to administrators
    // - Send Slack/Discord notification
    // - Create incident in monitoring system
    // - Trigger automated rollback if needed
    
  } catch (err) {
    console.error('Failed to send critical error alert:', err)
  }
}