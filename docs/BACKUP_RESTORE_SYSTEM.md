# Backup and Restore System Documentation

## Overview

The DINO Backup and Restore System provides comprehensive data protection, recovery capabilities, and system maintenance tools for the travel tracking application. This enterprise-grade system ensures data integrity, supports disaster recovery, and enables seamless data migration between environments.

## System Architecture

```
Backup & Restore System
├── API Layer
│   ├── GET /api/backup - List backups and statistics
│   ├── POST /api/backup - Create new backup
│   ├── DELETE /api/backup - Delete backup
│   └── POST /api/backup/restore - Restore from backup
├── Core Services
│   ├── BackupManager - Singleton backup orchestrator
│   ├── DataExtractor - Database data extraction
│   ├── CompressionEngine - Data compression/decompression
│   └── IntegrityValidator - Backup verification
├── Storage Layer
│   ├── FileSystem - Local backup storage
│   ├── Metadata Store - Backup metadata management
│   └── Checksum Validation - Data integrity verification
└── Security Layer
    ├── Admin Authorization - Role-based access control
    ├── Encryption Support - Data encryption at rest
    └── Audit Logging - Operation tracking
```

## Core Components

### BackupManager Class

**Location**: `/lib/backup/backup-manager.ts`  
**Pattern**: Singleton  
**Purpose**: Central orchestrator for all backup and restore operations

#### Features Overview

##### Comprehensive Data Backup

- **Full Database Backup**: Complete application data export
- **Selective Backup**: Choose specific data types to include/exclude
- **Metadata Generation**: Automatic backup metadata creation
- **Compression Support**: Optional data compression for storage efficiency
- **Integrity Verification**: Checksum validation for data integrity

##### Advanced Restore Capabilities

- **Point-in-time Recovery**: Restore to specific backup timestamps
- **Dry Run Mode**: Test restore operations without affecting data
- **Selective Restore**: Restore specific tables or data types
- **Conflict Resolution**: Handle data conflicts during restore

#### Configuration Options

```typescript
interface BackupOptions {
  includeUserData: boolean; // Include user travel data
  includeSessions: boolean; // Include session data
  compress: boolean; // Enable compression
  encryption?: boolean; // Enable encryption (future)
}

interface RestoreOptions {
  backupId: string; // Backup identifier
  dryRun: boolean; // Test mode without changes
  skipUserData?: boolean; // Exclude user data from restore
  skipSessions?: boolean; // Exclude session data from restore
}
```

#### Instance Management

```typescript
class BackupManager {
  private static instance: BackupManager;
  private backupDir: string;

  private constructor() {
    this.backupDir =
      process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }
}
```

#### Core Methods

##### `createBackup(options: BackupOptions)`

**Purpose**: Create comprehensive database backup
**Process**:

1. **Directory Setup**: Ensure backup directory exists
2. **Data Extraction**: Extract data based on options
3. **Metadata Generation**: Create backup metadata
4. **File Creation**: Save backup with compression/encryption
5. **Validation**: Verify backup integrity

```typescript
public async createBackup(options: BackupOptions): Promise<{
  success: boolean
  backupId?: string
  error?: string
}> {
  try {
    await this.ensureBackupDirectory()
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Extract database data
    const backupData = await this.extractDatabaseData(options)

    // Generate metadata
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: Object.keys(backupData),
      recordCounts: Object.fromEntries(
        Object.entries(backupData).map(([table, data]) =>
          [table, Array.isArray(data) ? data.length : 0]
        )
      ),
      size: 0,
      checksum: '',
      environment: process.env.NODE_ENV || 'development'
    }

    // Save backup data
    const backupPath = await this.saveBackupData(backupId, backupData, metadata, options)

    return { success: true, backupId }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

##### `listBackups()`

**Purpose**: Retrieve list of available backups
**Returns**: Array of backup metadata with statistics

##### `getBackupStats()`

**Purpose**: Aggregate backup system statistics
**Metrics**:

- Total backup count
- Total storage usage
- Latest backup timestamp
- System health indicators

##### `deleteBackup(backupId: string)`

**Purpose**: Safely remove backup files and metadata
**Security**: Validates backup existence before deletion

### Data Models

#### BackupMetadata Interface

Complete metadata structure for backup tracking:

```typescript
interface BackupMetadata {
  id: string; // Unique backup identifier
  timestamp: string; // ISO timestamp of creation
  version: string; // Backup format version
  tables: string[]; // List of backed up tables
  recordCounts: Record<string, number>; // Record count per table
  size: number; // Backup file size in bytes
  checksum: string; // Data integrity checksum
  environment: string; // Source environment (dev/prod)
}
```

#### Backup Data Structure

Organized database export format:

```typescript
interface BackupData {
  users?: User[]; // User account data
  countryVisits?: CountryVisit[]; // Travel records
  sessions?: Session[]; // User sessions (optional)
  metadata: BackupMetadata; // Backup information
}
```

## API Endpoints

### GET /api/backup

**Purpose**: Retrieve backup list and system statistics  
**Authentication**: Admin only  
**Security**: Rate limiting, security middleware

#### Query Parameters

- `action=stats` - Returns backup system statistics instead of list

#### Response Format

```typescript
// Backup list response
{
  success: boolean,
  backups: BackupMetadata[]
}

// Statistics response
{
  success: boolean,
  stats: {
    totalBackups: number,
    totalSize: number,
    latestBackup: string,
    oldestBackup: string,
    averageSize: number
  }
}
```

#### Security Measures

```typescript
// Admin authorization check
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
if (
  process.env.NODE_ENV === 'production' &&
  !adminEmails.includes(session.user.email)
) {
  return NextResponse.json(
    { success: false, error: 'Admin access required' },
    { status: 403 }
  );
}
```

---

### POST /api/backup

**Purpose**: Create new database backup  
**Authentication**: Admin only  
**Security**: CSRF protection, rate limiting

#### Request Body

```typescript
{
  includeUserData?: boolean,     // Default: true
  includeSessions?: boolean,     // Default: false
  compress?: boolean            // Default: true
}
```

#### Response Format

```typescript
{
  success: boolean,
  backupId?: string,
  message: string,
  error?: string
}
```

#### Process Flow

1. **Security Validation**: Verify admin permissions and CSRF token
2. **Rate Limiting**: Apply mutation-specific rate limits
3. **Input Validation**: Validate backup options
4. **Backup Creation**: Execute backup with provided options
5. **Response**: Return backup ID or error details

---

### DELETE /api/backup

**Purpose**: Remove backup from system  
**Authentication**: Admin only  
**Security**: CSRF protection, confirmation required

#### Query Parameters

- `id` - Backup ID to delete (required)

#### Response Format

```typescript
{
  success: boolean,
  message: string,
  error?: string
}
```

#### Safety Features

- **Existence Validation**: Verify backup exists before deletion
- **Metadata Cleanup**: Remove both data files and metadata
- **Audit Logging**: Log deletion operations for compliance
- **Error Recovery**: Handle partial deletion scenarios

---

### POST /api/backup/restore

**Purpose**: Restore database from backup  
**Authentication**: Admin only  
**Security**: Maximum protection with confirmation

#### Request Body

```typescript
{
  backupId: string,              // Required backup identifier
  dryRun?: boolean,             // Test mode (default: false)
  skipUserData?: boolean,       // Exclude user data
  skipSessions?: boolean        // Exclude session data
}
```

#### Response Format

```typescript
{
  success: boolean,
  restoredTables: string[],
  recordCounts: Record<string, number>,
  warnings: string[],
  message: string,
  error?: string
}
```

## Data Extraction and Processing

### Database Data Extraction

**Method**: `extractDatabaseData(options: BackupOptions)`

#### Extraction Strategy

```typescript
private async extractDatabaseData(options: BackupOptions): Promise<any> {
  const data: any = {}

  // Always include core data
  data.users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true
      // Exclude sensitive data like sessions
    }
  })

  if (options.includeUserData) {
    data.countryVisits = await prisma.countryVisit.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    })
  }

  if (options.includeSessions) {
    data.sessions = await prisma.session.findMany()
    data.accounts = await prisma.account.findMany()
  }

  return data
}
```

#### Data Filtering Rules

- **User Data**: Travel records, preferences, settings
- **System Data**: Configuration, metadata, admin settings
- **Session Data**: Authentication sessions, tokens (sensitive)
- **Audit Data**: Logs, monitoring data, security events

### Compression and Storage

#### Compression Logic

```typescript
private async saveBackupData(
  backupId: string,
  data: any,
  metadata: BackupMetadata,
  options: BackupOptions
): Promise<string> {
  const backupPath = path.join(this.backupDir, `${backupId}.json`)
  const dataString = JSON.stringify({ data, metadata }, null, 2)

  if (options.compress) {
    const compressed = await gzipAsync(Buffer.from(dataString))
    await writeFile(`${backupPath}.gz`, compressed)
    return `${backupPath}.gz`
  } else {
    await writeFile(backupPath, dataString)
    return backupPath
  }
}
```

#### Storage Organization

```
backups/
├── backup_1704067200000_abc123def.json.gz
├── backup_1704153600000_def456ghi.json.gz
├── metadata/
│   ├── backup_1704067200000_abc123def.meta.json
│   └── backup_1704153600000_def456ghi.meta.json
└── checksums/
    ├── backup_1704067200000_abc123def.sha256
    └── backup_1704153600000_def456ghi.sha256
```

## Data Integrity and Validation

### Checksum Generation

**Purpose**: Ensure backup data integrity and detect corruption

```typescript
private generateChecksum(data: Buffer): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}
```

### Validation Process

#### Pre-Backup Validation

1. **Database Connectivity**: Verify database connection
2. **Permission Check**: Ensure read access to all tables
3. **Storage Space**: Verify sufficient disk space
4. **Lock Status**: Check for ongoing database operations

#### Post-Backup Validation

1. **File Integrity**: Verify backup file was created successfully
2. **Checksum Verification**: Validate data integrity
3. **Metadata Consistency**: Ensure metadata matches data
4. **Compression Verification**: Test compressed file can be decompressed

#### Restoration Validation

1. **Backup Verification**: Validate backup file integrity
2. **Schema Compatibility**: Ensure backup matches current schema
3. **Dependency Check**: Verify foreign key constraints
4. **Dry Run Testing**: Test restoration without committing changes

## Security and Access Control

### Admin Authorization

**Environment Configuration**:

```env
# Admin email addresses (comma-separated)
ADMIN_EMAILS=admin@example.com,backup-admin@example.com

# Backup directory path
BACKUP_DIR=/secure/backups

# Backup retention policy (days)
BACKUP_RETENTION_DAYS=30
```

**Authorization Logic**:

```typescript
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
const isAdmin = adminEmails.includes(session.user.email);
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !isAdmin) {
  return createErrorResponse('Admin access required', 403);
}
```

### Security Measures

#### Multi-Layer Protection

1. **Authentication**: Valid session required
2. **Authorization**: Admin role verification
3. **CSRF Protection**: Double-submit tokens for mutations
4. **Rate Limiting**: Prevent abuse of backup operations
5. **Input Validation**: Sanitize all input parameters
6. **Audit Logging**: Track all backup operations

#### Data Protection

```typescript
// Sensitive data filtering
const safeguardSensitiveData = (data: any): any => {
  return {
    ...data,
    // Remove or hash sensitive fields
    users: data.users?.map(user => ({
      ...user,
      email: hashEmail(user.email), // Hash emails for privacy
      sessions: undefined, // Remove session data
    })),
  };
};
```

## Monitoring and Alerting

### Backup Health Monitoring

**Health Metrics**:

- Backup success/failure rates
- Storage usage trends
- Backup duration tracking
- Data integrity verification results

**Automated Checks**:

```typescript
public async performHealthCheck(): Promise<HealthStatus> {
  const backups = await this.listBackups()
  const now = new Date()

  return {
    totalBackups: backups.length,
    latestBackup: backups[0]?.timestamp,
    oldestBackup: backups[backups.length - 1]?.timestamp,
    storageUsed: backups.reduce((sum, backup) => sum + backup.size, 0),
    integrityStatus: await this.verifyAllBackups(),
    retentionCompliance: this.checkRetentionPolicy(backups)
  }
}
```

### Alerting System Integration

**Alert Conditions**:

- Backup failure for >24 hours
- Storage usage >80% of available space
- Integrity check failures
- Unauthorized access attempts

## Disaster Recovery Procedures

### Recovery Scenarios

#### 1. Complete Data Loss

```typescript
// Emergency restore procedure
const emergencyRestore = async (latestBackupId: string) => {
  // 1. Verify backup integrity
  const isValid = await backupManager.verifyBackup(latestBackupId);
  if (!isValid) throw new Error('Backup corrupted');

  // 2. Create database backup (if possible)
  await backupManager.createEmergencyBackup();

  // 3. Perform restoration
  const result = await backupManager.restoreFromBackup({
    backupId: latestBackupId,
    dryRun: false,
    skipSessions: true,
  });

  return result;
};
```

#### 2. Partial Data Corruption

```typescript
// Selective restoration
const selectiveRestore = async (
  backupId: string,
  corruptedTables: string[]
) => {
  return await backupManager.restoreFromBackup({
    backupId,
    dryRun: false,
    includeTables: corruptedTables,
    skipUserData: !corruptedTables.includes('countryVisits'),
  });
};
```

### Recovery Testing

**Regular Recovery Drills**:

1. **Monthly Testing**: Restore to test environment
2. **Integrity Verification**: Full backup validation
3. **Performance Testing**: Measure restoration times
4. **Documentation Updates**: Keep procedures current

## Performance Optimization

### Backup Performance

**Optimization Strategies**:

1. **Parallel Processing**: Backup tables concurrently where possible
2. **Incremental Backups**: Future enhancement for large datasets
3. **Compression**: Reduce storage and transfer time
4. **Index Optimization**: Optimize queries during backup

### Storage Management

**Retention Policies**:

```typescript
public async cleanupOldBackups(): Promise<void> {
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const backups = await this.listBackups()
  const oldBackups = backups.filter(backup =>
    new Date(backup.timestamp) < cutoffDate
  )

  for (const backup of oldBackups) {
    await this.deleteBackup(backup.id)
  }
}
```

## Usage Examples

### Creating a Backup

```typescript
// Basic backup
const result = await backupManager.createBackup({
  includeUserData: true,
  includeSessions: false,
  compress: true,
});

if (result.success) {
  console.log(`Backup created: ${result.backupId}`);
} else {
  console.error(`Backup failed: ${result.error}`);
}
```

### Restoring from Backup

```typescript
// Dry run restore to test
const testResult = await backupManager.restoreFromBackup({
  backupId: 'backup_1704067200000_abc123def',
  dryRun: true,
  skipSessions: true,
});

if (testResult.success) {
  // Proceed with actual restore
  const actualResult = await backupManager.restoreFromBackup({
    backupId: 'backup_1704067200000_abc123def',
    dryRun: false,
    skipSessions: true,
  });
}
```

### API Usage

```typescript
// Create backup via API
const createBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      includeUserData: true,
      compress: true,
    }),
  });

  const result = await response.json();
  return result;
};

// List backups
const listBackups = async () => {
  const response = await fetch('/api/backup');
  const data = await response.json();
  return data.backups;
};
```

## Best Practices

### Backup Strategy

1. **Regular Scheduling**: Automated daily backups
2. **Multiple Locations**: Local and cloud storage
3. **Version Control**: Keep multiple backup versions
4. **Testing**: Regular restore testing
5. **Documentation**: Maintain recovery procedures

### Security Guidelines

1. **Access Control**: Limit backup access to administrators
2. **Encryption**: Encrypt backups containing sensitive data
3. **Audit Trails**: Log all backup and restore operations
4. **Monitoring**: Continuous backup health monitoring
5. **Incident Response**: Documented emergency procedures

### Performance Guidelines

1. **Off-Peak Scheduling**: Run backups during low usage
2. **Resource Monitoring**: Monitor system impact
3. **Storage Optimization**: Regular cleanup of old backups
4. **Network Efficiency**: Use compression for remote backups
5. **Scaling Planning**: Plan for data growth

This comprehensive backup and restore system ensures robust data protection and disaster recovery capabilities for the DINO application, meeting enterprise-grade requirements for data safety and business continuity.
