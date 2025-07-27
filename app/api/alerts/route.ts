import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { alertManager } from '@/lib/notifications/alert-manager'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { csrfProtection } from '@/lib/security/csrf-protection'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError } from '@/lib/api/error-handler'

// GET /api/alerts - 알림 목록 조회
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'general')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Security middleware
    const securityResult = await securityMiddleware(request)
    if (!securityResult.proceed) {
      return securityResult.response!
    }

    // 관리자 권한 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Admin access required', undefined, requestId)
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'stats') {
      const stats = alertManager.getAlertStats()
      return NextResponse.json({
        success: true,
        stats
      })
    }

    // 쿼리 파라미터 파싱
    const severity = url.searchParams.get('severity') as 'info' | 'warning' | 'error' | 'critical' | null
    const source = url.searchParams.get('source')
    const resolved = url.searchParams.get('resolved')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const alerts = alertManager.getAlerts({
      severity: severity || undefined,
      source: source || undefined,
      resolved: resolved ? resolved === 'true' : undefined,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      alerts,
      pagination: {
        limit,
        offset,
        total: alertManager.getAlerts().length
      }
    })

  } catch (error) {
    // Error fetching alerts
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}

// POST /api/alerts - 새 알림 생성 (테스트용)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true
    })
    if (!csrfResult.protected) {
      return csrfResult.response!
    }

    // Security middleware
    const securityResult = await securityMiddleware(request)
    if (!securityResult.proceed) {
      return securityResult.response!
    }

    // 관리자 권한 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Admin access required', undefined, requestId)
    }

    const body = await request.json()
    const { type, title, message, severity = 'info', source = 'manual' } = body

    if (type === 'template') {
      // 템플릿 기반 알림
      const { templateId, variables, overrides } = body
      await alertManager.sendAlert(templateId, variables, overrides)
    } else {
      // 직접 알림
      await alertManager.sendDirectAlert({
        title,
        message,
        severity,
        source
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Alert sent successfully'
    })

  } catch (error) {
    // Error creating alert
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}

// PATCH /api/alerts - 알림 상태 업데이트
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Security middleware
    const securityResult = await securityMiddleware(request)
    if (!securityResult.proceed) {
      return securityResult.response!
    }

    // 관리자 권한 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Admin access required', undefined, requestId)
    }

    const body = await request.json()
    const { alertId, action } = body

    if (!alertId || !action) {
      return createErrorResponse(ErrorCode.BAD_REQUEST, 'Alert ID and action are required', undefined, requestId)
    }

    let result = false

    switch (action) {
      case 'resolve':
        result = alertManager.resolveAlert(alertId)
        break
      default:
        return createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid action', { validActions: ['resolve'] }, requestId)
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Alert ${action}d successfully`
      })
    } else {
      return createErrorResponse(ErrorCode.NOT_FOUND, `Failed to ${action} alert`, undefined, requestId)
    }

  } catch (error) {
    // Error updating alert
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}