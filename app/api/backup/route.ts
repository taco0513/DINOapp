import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { backupManager } from '@/lib/backup/backup-manager'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { csrfProtection } from '@/lib/security/csrf-protection'

// GET /api/backup - 백업 목록 조회
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
      const stats = await backupManager.getBackupStats()
      return NextResponse.json({
        success: true,
        stats
      })
    }

    // 백업 목록 조회
    const backups = await backupManager.listBackups()
    
    return NextResponse.json({
      success: true,
      backups
    })

  } catch (error) {
    // Error fetching backups
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}

// POST /api/backup - 새 백업 생성
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (백업은 resource-intensive 작업)
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
    const { 
      includeUserData = true, 
      includeSessions = false, 
      compress = true 
    } = body

    // Backup requested

    const result = await backupManager.createBackup({
      includeUserData,
      includeSessions,
      compress
    })

    if (result.success) {
      // Backup created successfully
      return NextResponse.json({
        success: true,
        backupId: result.backupId,
        message: 'Backup created successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    // Error creating backup
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

// DELETE /api/backup - 백업 삭제
export async function DELETE(request: NextRequest) {
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
    const backupId = url.searchParams.get('id')

    if (!backupId) {
      return NextResponse.json(
        { success: false, error: 'Backup ID required' },
        { status: 400 }
      )
    }

    // Backup deletion requested

    const result = await backupManager.deleteBackup(backupId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Backup deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    // Error deleting backup
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}