#!/usr/bin/env node

/**
 * Manual Database Backup Script
 * Can be run via npm run backup:db
 */

const { dbBackupManager } = require('../../lib/backup/database-backup')

async function runBackup() {
  console.log('🔄 Starting database backup...')
  
  try {
    const result = await dbBackupManager.createBackup({
      type: 'full',
      compress: true,
      encrypt: true,
      retentionDays: 30
    })
    
    if (result.status === 'success') {
      console.log('✅ Database backup completed successfully!')
      console.log(`📁 Backup saved to: ${result.path}`)
      console.log(`📊 Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)} seconds`)
    } else {
      console.error('❌ Database backup failed:', result.error)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Backup error:', error.message)
    process.exit(1)
  }
}

// Run backup
runBackup().catch(console.error)