/**
 * Database Backup and Recovery System
 * 데이터베이스 백업 및 복구 시스템
 */

import { prisma } from '../database/connection-pool'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { gzip, gunzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

interface BackupMetadata {
  id: string
  timestamp: string
  version: string
  tables: string[]
  recordCounts: Record<string, number>
  size: number
  checksum: string
  environment: string
}

interface BackupOptions {
  includeUserData: boolean
  includeSessions: boolean
  compress: boolean
  encryption?: boolean
}

interface RestoreOptions {
  backupId: string
  dryRun: boolean
  skipUserData?: boolean
  skipSessions?: boolean
}

class BackupManager {
  private static instance: BackupManager
  private backupDir: string
  
  private constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups')
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager()
    }
    return BackupManager.instance
  }

  /**
   * 전체 데이터베이스 백업 생성
   */
  public async createBackup(options: BackupOptions = {
    includeUserData: true,
    includeSessions: false,
    compress: true
  }): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      // 백업 디렉토리 확인/생성
      await this.ensureBackupDirectory()

      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()

      console.log(`🔄 Starting backup: ${backupId}`)

      // 데이터 추출
      const backupData = await this.extractDatabaseData(options)
      
      // 메타데이터 생성
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        version: '1.0',
        tables: Object.keys(backupData),
        recordCounts: Object.fromEntries(
          Object.entries(backupData).map(([table, data]) => [table, Array.isArray(data) ? data.length : 0])
        ),
        size: 0, // 압축 전 크기로 업데이트될 예정
        checksum: '', // 체크섬은 나중에 계산
        environment: process.env.NODE_ENV || 'development'
      }

      // 백업 파일 생성
      const backupPath = await this.saveBackupData(backupId, backupData, metadata, options)
      
      console.log(`✅ Backup completed: ${backupId}`)
      console.log(`📁 Backup saved to: ${backupPath}`)

      return { success: true, backupId }
    } catch (error) {
      console.error('❌ Backup failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown backup error' 
      }
    }
  }

  /**
   * 백업에서 데이터베이스 복원
   */
  public async restoreBackup(options: RestoreOptions): Promise<{ 
    success: boolean; 
    restoredTables?: string[]; 
    error?: string 
  }> {
    try {
      if (options.dryRun) {
        console.log(`🔍 Dry run mode: Analyzing backup ${options.backupId}`)
      } else {
        console.log(`🔄 Starting restore from backup: ${options.backupId}`)
      }

      // 백업 파일 로드
      const { data: backupData, metadata } = await this.loadBackupData(options.backupId)
      
      console.log(`📊 Backup info:`)
      console.log(`  - Timestamp: ${metadata.timestamp}`)
      console.log(`  - Tables: ${metadata.tables.join(', ')}`)
      console.log(`  - Records: ${JSON.stringify(metadata.recordCounts)}`)

      if (options.dryRun) {
        console.log(`✅ Dry run completed. Backup is valid and ready for restore.`)
        return { success: true, restoredTables: metadata.tables }
      }

      // 실제 복원 실행
      const restoredTables = await this.performRestore(backupData, metadata, options)

      console.log(`✅ Restore completed from backup: ${options.backupId}`)
      return { success: true, restoredTables }
    } catch (error) {
      console.error('❌ Restore failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown restore error' 
      }
    }
  }

  /**
   * 백업 목록 조회
   */
  public async listBackups(): Promise<BackupMetadata[]> {
    try {
      await this.ensureBackupDirectory()
      const fs = await import('fs/promises')
      const files = await fs.readdir(this.backupDir)
      
      const backups: BackupMetadata[] = []
      
      for (const file of files) {
        if (file.endsWith('.metadata.json')) {
          const metadataPath = path.join(this.backupDir, file)
          const metadataContent = await readFile(metadataPath, 'utf-8')
          backups.push(JSON.parse(metadataContent))
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('Error listing backups:', error)
      return []
    }
  }

  /**
   * 백업 삭제
   */
  public async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const backupPath = path.join(this.backupDir, `${backupId}.backup.json`)
      const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`)
      
      const fs = await import('fs/promises')
      
      if (existsSync(backupPath)) {
        await fs.unlink(backupPath)
      }
      
      if (existsSync(metadataPath)) {
        await fs.unlink(metadataPath)
      }

      console.log(`🗑️ Backup deleted: ${backupId}`)
      return { success: true }
    } catch (error) {
      console.error('Error deleting backup:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown deletion error' 
      }
    }
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!existsSync(this.backupDir)) {
      await mkdir(this.backupDir, { recursive: true })
    }
  }

  private async extractDatabaseData(options: BackupOptions): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {}

    // Users 데이터 (개인정보 제외 옵션)
    if (options.includeUserData) {
      data.users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: options.includeUserData,
          passportCountry: true,
          timezone: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    // CountryVisits 데이터
    data.countryVisits = await prisma.countryVisit.findMany()

    // NotificationSettings
    data.notificationSettings = await prisma.notificationSettings.findMany()

    // Accounts (OAuth 정보는 보안상 제외)
    data.accounts = await prisma.account.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        provider: true,
        providerAccountId: true
        // access_token, refresh_token 등 민감한 정보 제외
      }
    })

    // Sessions (옵션)
    if (options.includeSessions) {
      data.sessions = await prisma.session.findMany({
        where: {
          expires: {
            gt: new Date() // 만료되지 않은 세션만
          }
        }
      })
    }

    return data
  }

  private async saveBackupData(
    backupId: string, 
    data: Record<string, any[]>, 
    metadata: BackupMetadata, 
    options: BackupOptions
  ): Promise<string> {
    let jsonData = JSON.stringify(data, null, 2)
    
    // 압축 옵션
    if (options.compress) {
      const compressed = await gzipAsync(Buffer.from(jsonData))
      jsonData = compressed.toString('base64')
    }

    // 체크섬 계산
    const crypto = await import('crypto')
    metadata.checksum = crypto.createHash('sha256').update(jsonData).digest('hex')
    metadata.size = jsonData.length

    const backupPath = path.join(this.backupDir, `${backupId}.backup.json`)
    const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`)

    // 파일 저장
    await writeFile(backupPath, jsonData)
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return backupPath
  }

  private async loadBackupData(backupId: string): Promise<{
    data: Record<string, any[]>
    metadata: BackupMetadata
  }> {
    const backupPath = path.join(this.backupDir, `${backupId}.backup.json`)
    const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`)

    if (!existsSync(backupPath) || !existsSync(metadataPath)) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    // 메타데이터 로드
    const metadataContent = await readFile(metadataPath, 'utf-8')
    const metadata: BackupMetadata = JSON.parse(metadataContent)

    // 백업 데이터 로드
    let backupContent = await readFile(backupPath, 'utf-8')
    
    // 압축 해제 (base64 감지)
    try {
      const compressed = Buffer.from(backupContent, 'base64')
      const decompressed = await gunzipAsync(compressed)
      backupContent = decompressed.toString()
    } catch {
      // 압축되지 않은 경우 그대로 사용
    }

    const data = JSON.parse(backupContent)

    // 체크섬 검증
    const crypto = await import('crypto')
    const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    
    if (calculatedChecksum !== metadata.checksum) {
      console.warn('⚠️ Backup checksum mismatch - data may be corrupted')
    }

    return { data, metadata }
  }

  private async performRestore(
    backupData: Record<string, any[]>, 
    metadata: BackupMetadata,
    options: RestoreOptions
  ): Promise<string[]> {
    const restoredTables: string[] = []

    // 트랜잭션으로 복원 작업 수행
    await prisma.$transaction(async (tx) => {
      // Users 복원
      if (backupData.users && !options.skipUserData) {
        await tx.user.deleteMany() // 기존 데이터 삭제
        await tx.user.createMany({ data: backupData.users })
        restoredTables.push('users')
      }

      // CountryVisits 복원
      if (backupData.countryVisits) {
        await tx.countryVisit.deleteMany()
        await tx.countryVisit.createMany({ data: backupData.countryVisits })
        restoredTables.push('countryVisits')
      }

      // NotificationSettings 복원
      if (backupData.notificationSettings) {
        await tx.notificationSettings.deleteMany()
        await tx.notificationSettings.createMany({ data: backupData.notificationSettings })
        restoredTables.push('notificationSettings')
      }

      // Accounts 복원
      if (backupData.accounts && !options.skipUserData) {
        await tx.account.deleteMany()
        await tx.account.createMany({ data: backupData.accounts })
        restoredTables.push('accounts')
      }

      // Sessions 복원 (옵션)
      if (backupData.sessions && !options.skipSessions) {
        await tx.session.deleteMany()
        await tx.session.createMany({ data: backupData.sessions })
        restoredTables.push('sessions')
      }
    })

    return restoredTables
  }

  /**
   * 백업 상태 및 통계
   */
  public async getBackupStats(): Promise<{
    totalBackups: number
    totalSize: number
    latestBackup?: BackupMetadata
    oldestBackup?: BackupMetadata
  }> {
    const backups = await this.listBackups()
    
    if (backups.length === 0) {
      return { totalBackups: 0, totalSize: 0 }
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0)
    
    return {
      totalBackups: backups.length,
      totalSize,
      latestBackup: backups[0],
      oldestBackup: backups[backups.length - 1]
    }
  }
}

export const backupManager = BackupManager.getInstance()
export type { BackupMetadata, BackupOptions, RestoreOptions }