import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { _dbBackupManager as dbBackupManager } from '@/lib/backup/database-backup'
import { _fileBackupManager as fileBackupManager } from '@/lib/backup/file-backup'
import { backupScheduler } from '@/lib/backup/backup-scheduler'
import { asyncHandler } from '@/lib/error/error-handler'
import { httpMetrics } from '@/lib/monitoring/metrics-collector'

// GET /api/backup - List backups and schedules (admin only)
export async function GET(request: NextRequest) {
  const endTimer = httpMetrics.requestStart('GET', '/api/backup')
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      httpMetrics.requestEnd('GET', '/api/backup', 403)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get backup type from query
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'

    const response: any = {}

    // Get database backups
    if (type === 'all' || type === 'database') {
      response.databaseBackups = await dbBackupManager.listBackups()
    }

    // Get file backups
    if (type === 'all' || type === 'files') {
      response.fileBackups = await fileBackupManager.listBackups()
    }

    // Get schedules
    if (type === 'all' || type === 'schedules') {
      const schedules = backupScheduler.getSchedules()
      response.schedules = schedules.map(schedule => ({
        ...schedule,
        nextRun: backupScheduler.getNextRunTime(schedule.id)
      }))
    }

    // Get status summary
    response.status = backupScheduler.getStatus()

    httpMetrics.requestEnd('GET', '/api/backup', 200)
    endTimer()
    
    return NextResponse.json(response)
    
  } catch (error) {
    httpMetrics.requestEnd('GET', '/api/backup', 500)
    endTimer()
    throw error
  }
}

// POST /api/backup - Create manual backup (admin only)
export async function POST(request: NextRequest) {
  const endTimer = httpMetrics.requestStart('POST', '/api/backup')
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      httpMetrics.requestEnd('POST', '/api/backup', 403)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, options = {} } = body

    let result

    switch (type) {
      case 'database':
        result = await dbBackupManager.createBackup(options)
        break
        
      case 'files':
        result = await fileBackupManager.createBackup(options)
        break
        
      case 'both':
        const dbResult = await dbBackupManager.createBackup(options)
        const fileResult = await fileBackupManager.createBackup(options)
        result = { database: dbResult, files: fileResult }
        break
        
      default:
        httpMetrics.requestEnd('POST', '/api/backup', 400)
        return NextResponse.json(
          { error: 'Invalid backup type' },
          { status: 400 }
        )
    }

    httpMetrics.requestEnd('POST', '/api/backup', 201)
    endTimer()
    
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    httpMetrics.requestEnd('POST', '/api/backup', 500)
    endTimer()
    throw error
  }
}