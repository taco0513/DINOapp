import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { alertManager } from '@/lib/notifications/alert-manager'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'

// GET /api/alerts - 알림 목록 조회
export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
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
    const severity = url.searchParams.get('severity') as any
    const source = url.searchParams.get('source')
    const resolved = url.searchParams.get('resolved')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const alerts = alertManager.getAlerts({
      severity,
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
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST /api/alerts - 새 알림 생성 (테스트용)
export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
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
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// PATCH /api/alerts - 알림 상태 업데이트
export async function PATCH(request: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (process.env.NODE_ENV === 'production' && !adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { alertId, action } = body

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and action are required' },
        { status: 400 }
      )
    }

    let result = false

    switch (action) {
      case 'resolve':
        result = alertManager.resolveAlert(alertId)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Alert ${action}d successfully`
      })
    } else {
      return NextResponse.json(
        { success: false, error: `Failed to ${action} alert` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}