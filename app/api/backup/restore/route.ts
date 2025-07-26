import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { backupManager } from '@/lib/backup/backup-manager'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'

// POST /api/backup/restore - 백업에서 복원
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (복원은 매우 resource-intensive한 작업)
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
    const { 
      backupId, 
      dryRun = false, 
      skipUserData = false, 
      skipSessions = true,
      confirmationPhrase
    } = body

    if (!backupId) {
      return NextResponse.json(
        { success: false, error: 'Backup ID is required' },
        { status: 400 }
      )
    }

    // 프로덕션 환경에서는 확인 문구 필요
    if (process.env.NODE_ENV === 'production' && !dryRun) {
      if (confirmationPhrase !== 'RESTORE DATABASE CONFIRM') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Confirmation phrase required for production restore. Please type: RESTORE DATABASE CONFIRM' 
          },
          { status: 400 }
        )
      }
    }

    console.log(`${dryRun ? '🔍 Dry run' : '🔄 Restore'} requested by: ${session.user.email}`)
    console.log(`Backup ID: ${backupId}`)

    const result = await backupManager.restoreBackup({
      backupId,
      dryRun,
      skipUserData,
      skipSessions
    })

    if (result.success) {
      const message = dryRun 
        ? 'Backup validation completed successfully'
        : `Database restored successfully from backup: ${backupId}`
      
      console.log(`✅ ${dryRun ? 'Validation' : 'Restore'} completed: ${backupId}`)
      
      return NextResponse.json({
        success: true,
        message,
        restoredTables: result.restoredTables,
        dryRun
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error during restore operation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore from backup' },
      { status: 500 }
    )
  }
}