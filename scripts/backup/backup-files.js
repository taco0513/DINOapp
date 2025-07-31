#!/usr/bin/env node

/**
 * Manual File Backup Script
 * Can be run via npm run backup:files
 */

const { fileBackupManager } = require('../../lib/backup/file-backup');

async function runBackup() {
  console.log('🔄 Starting file backup...');

  try {
    const result = await fileBackupManager.createBackup({
      compress: true,
      encrypt: true,
      excludePatterns: ['.git', 'node_modules', '.next', 'backups'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    if (result.status === 'success') {
      console.log('✅ File backup completed successfully!');
      console.log(`📁 Backup saved to: ${result.backupPath}`);
      console.log(`📊 Total files: ${result.totalFiles}`);
      console.log(
        `📊 Total size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `⏱️  Duration: ${(result.duration / 1000).toFixed(2)} seconds`
      );
    } else {
      console.error('❌ File backup failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Backup error:', error.message);
    process.exit(1);
  }
}

// Run backup
runBackup().catch(console.error);
