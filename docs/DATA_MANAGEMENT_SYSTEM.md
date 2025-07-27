# Data Management System Documentation

## Overview

The DINO Data Management System provides comprehensive data import/export functionality, enabling users to backup, migrate, and share their travel data across different platforms. This enterprise-grade system supports multiple file formats, intelligent duplicate detection, and robust error handling to ensure data integrity throughout all operations.

## System Architecture

```
Data Management System
├── Frontend Components
│   ├── DataExportImport - Main data management interface
│   ├── ExportControls - Format selection and configuration
│   ├── ImportWizard - Step-by-step import guidance
│   └── ProgressIndicator - Real-time operation tracking
├── Export Engine
│   ├── JSONExporter - Complete data export with metadata
│   ├── CSVExporter - Travel records in spreadsheet format
│   ├── FormatValidator - Output format validation
│   └── CompressionService - Optional data compression
├── Import Engine
│   ├── FileParser - Multi-format file parsing
│   ├── DataValidator - Input data validation and sanitization
│   ├── DuplicateDetector - Intelligent duplicate identification
│   └── ConflictResolver - Data conflict resolution strategies
├── API Layer
│   ├── GET /api/export - Data export endpoint
│   ├── POST /api/import - Data import endpoint
│   └── GET /api/export/status - Operation status tracking
├── Data Processing
│   ├── SchemaMapping - Format conversion and normalization
│   ├── RelationshipManager - Maintain data relationships
│   ├── IntegrityChecker - Data consistency validation
│   └── BackupManager - Automatic backup creation
└── Storage Layer
    ├── TemporaryStorage - Import file staging
    ├── BackupStorage - Automatic backups
    └── OperationLog - Import/export history
```

## Core Components

### DataExportImport Component

**Location**: `/components/data/DataExportImport.tsx`  
**Purpose**: Unified interface for data import and export operations

#### Features Overview

##### Export Capabilities
- **JSON Format**: Complete data backup with metadata and relationships
- **CSV Format**: Travel records in spreadsheet-compatible format
- **Selective Export**: Choose specific data categories
- **Compressed Archives**: Optional ZIP compression for large datasets

##### Import Capabilities
- **Multi-Format Support**: JSON, CSV, and compressed file imports
- **Duplicate Detection**: Intelligent identification of existing records
- **Conflict Resolution**: User-guided resolution of data conflicts
- **Preview Mode**: Review data before final import

##### Advanced Options
- **Replace vs. Merge**: Choose data integration strategy
- **Validation Rules**: Configurable data quality checks
- **Rollback Support**: Undo recent import operations
- **Progress Tracking**: Real-time operation status updates

#### Data Models

##### ExportConfiguration Interface
```typescript
interface ExportConfiguration {
  format: 'json' | 'csv' | 'xlsx'        // Output format
  includeMetadata: boolean               // Include system metadata
  dateRange?: {                         // Optional date filtering
    start: Date
    end: Date
  }
  categories: {                         // Data category selection
    trips: boolean                      // Travel records
    preferences: boolean                // User preferences
    notifications: boolean              // Notification history
    analytics: boolean                  // Computed statistics
  }
  compression: {                        // Compression options
    enabled: boolean
    algorithm: 'gzip' | 'zip'
    level: 1 | 2 | 3 | 4 | 5           // Compression level
  }
  privacy: {                           // Privacy protection
    excludePersonalData: boolean        // Remove PII
    anonymizeData: boolean             // Anonymize sensitive fields
  }
}
```

##### ImportConfiguration Interface
```typescript
interface ImportConfiguration {
  strategy: 'replace' | 'merge' | 'skipExisting'  // Import strategy
  duplicateHandling: {
    detection: 'strict' | 'fuzzy' | 'off'         // Duplicate detection mode
    resolution: 'skip' | 'update' | 'prompt'      // Resolution strategy
    criteria: string[]                             // Matching criteria
  }
  validation: {
    strict: boolean                               // Strict validation mode
    customRules: ValidationRule[]                 // Additional validation rules
    skipInvalid: boolean                         // Skip invalid records
  }
  preview: {
    enabled: boolean                             // Preview before import
    sampleSize: number                           // Number of preview records
  }
  backup: {
    createBackup: boolean                        // Create automatic backup
    backupFormat: 'json' | 'sql'               // Backup format
  }
}
```

##### ImportResult Interface
```typescript
interface ImportResult {
  success: boolean
  summary: {
    totalRecords: number                 // Total records processed
    imported: number                     // Successfully imported
    updated: number                      // Updated existing records
    skipped: number                      // Skipped due to duplicates
    errors: number                       // Failed imports
  }
  details: {
    newRecords: ImportedRecord[]         // Details of new records
    updatedRecords: UpdatedRecord[]      // Details of updated records
    skippedRecords: SkippedRecord[]      // Details of skipped records
    errorRecords: ErrorRecord[]          // Details of failed records
  }
  metadata: {
    importId: string                     // Unique import identifier
    timestamp: Date                      // Import timestamp
    duration: number                     // Processing time (ms)
    backupId?: string                   // Backup identifier if created
  }
  warnings: string[]                     // Non-fatal warnings
  recommendations: string[]              // Post-import recommendations
}
```

#### UI Implementation

##### Export Interface
```typescript
// Export format selection and configuration
<div className="export-section">
  <h4>📤 데이터 내보내기</h4>
  
  <div className="format-selection">
    <FormatButton
      format="json"
      title="JSON 형식"
      description="완전한 백업 (설정 포함)"
      icon="📄"
      onClick={() => handleExport('json')}
      loading={exportLoading}
    />
    
    <FormatButton
      format="csv"
      title="CSV 형식"
      description="여행 기록만 (엑셀 호환)"
      icon="📊"
      onClick={() => handleExport('csv')}
      loading={exportLoading}
    />
  </div>
  
  <ExportOptions
    configuration={exportConfig}
    onChange={setExportConfig}
    visible={showExportOptions}
  />
</div>
```

##### Import Interface with Drag-and-Drop
```typescript
// File upload with drag-and-drop support
<div className="import-section">
  <h4>📥 데이터 가져오기</h4>
  
  <FileDropZone
    accept=".json,.csv,.xlsx,.zip"
    onFileSelect={handleFileSelect}
    onDrop={handleFileDrop}
    loading={importLoading}
  >
    <div className="drop-zone-content">
      <UploadIcon />
      <p>파일을 드래그하거나 클릭하여 선택하세요</p>
      <p className="file-types">JSON, CSV, XLSX, ZIP 파일 지원</p>
    </div>
  </FileDropZone>
  
  {selectedFile && (
    <ImportPreview
      file={selectedFile}
      onConfigChange={setImportConfig}
      onImport={handleImport}
      loading={importLoading}
    />
  )}
</div>
```

##### Progress and Results Display
```typescript
// Real-time import progress and results
{importLoading && (
  <ProgressIndicator
    phase={currentPhase}
    progress={importProgress}
    message={progressMessage}
  />
)}

{importResult && (
  <ImportResultPanel
    result={importResult}
    onViewDetails={() => setShowDetails(true)}
    onUndo={importResult.metadata.backupId ? handleUndo : undefined}
  />
)}
```

## Export Engine

### JSONExporter Class

**Purpose**: Complete data export with full metadata preservation

```typescript
export class JSONExporter {
  // Export all user data with metadata and relationships
  public async exportUserData(
    userId: string,
    config: ExportConfiguration
  ): Promise<ExportedData> {
    const exportData: ExportedData = {
      metadata: {
        exportId: generateExportId(),
        exportDate: new Date(),
        version: '1.0',
        source: 'DINO Travel Tracker',
        userId: config.privacy.excludePersonalData ? 'anonymous' : userId
      },
      data: {}
    }
    
    // Export travel records
    if (config.categories.trips) {
      exportData.data.trips = await this.exportTrips(userId, config)
    }
    
    // Export user preferences
    if (config.categories.preferences) {
      exportData.data.preferences = await this.exportPreferences(userId, config)
    }
    
    // Export notification settings
    if (config.categories.notifications) {
      exportData.data.notifications = await this.exportNotifications(userId, config)
    }
    
    // Export analytics data
    if (config.categories.analytics) {
      exportData.data.analytics = await this.exportAnalytics(userId, config)
    }
    
    // Apply privacy filters
    if (config.privacy.excludePersonalData) {
      exportData = this.applyPrivacyFilters(exportData)
    }
    
    // Validate export data
    this.validateExportData(exportData)
    
    return exportData
  }
  
  private async exportTrips(
    userId: string,
    config: ExportConfiguration
  ): Promise<ExportedTrip[]> {
    let query = this.tripRepository.createQueryBuilder()
      .where('userId = :userId', { userId })
      .orderBy('entryDate', 'DESC')
    
    // Apply date range filter if specified
    if (config.dateRange) {
      query = query.andWhere('entryDate BETWEEN :start AND :end', {
        start: config.dateRange.start,
        end: config.dateRange.end
      })
    }
    
    const trips = await query.getMany()
    
    return trips.map(trip => ({
      id: trip.id,
      country: trip.country,
      entryDate: trip.entryDate.toISOString(),
      exitDate: trip.exitDate?.toISOString(),
      visaType: trip.visaType,
      maxDays: trip.maxDays,
      passportCountry: trip.passportCountry,
      notes: trip.notes,
      ...(config.includeMetadata && {
        metadata: {
          createdAt: trip.createdAt.toISOString(),
          updatedAt: trip.updatedAt.toISOString(),
          source: trip.source || 'manual'
        }
      })
    }))
  }
}
```

### CSVExporter Class

**Purpose**: Travel records export in spreadsheet-compatible format

```typescript
export class CSVExporter {
  private readonly CSV_HEADERS = [
    'Country',
    'Entry Date',
    'Exit Date',
    'Visa Type',
    'Max Days',
    'Passport Country',
    'Duration',
    'Notes'
  ]
  
  public async exportToCSV(
    userId: string,
    config: ExportConfiguration
  ): Promise<string> {
    const trips = await this.getTripData(userId, config)
    
    // Generate CSV header
    let csvContent = this.CSV_HEADERS.join(',') + '\n'
    
    // Add data rows
    for (const trip of trips) {
      const row = [
        this.escapeCSVValue(trip.country),
        this.formatDate(trip.entryDate),
        trip.exitDate ? this.formatDate(trip.exitDate) : '',
        this.escapeCSVValue(trip.visaType),
        trip.maxDays?.toString() || '',
        this.escapeCSVValue(trip.passportCountry),
        trip.duration?.toString() || '',
        this.escapeCSVValue(trip.notes || '')
      ]
      
      csvContent += row.join(',') + '\n'
    }
    
    return csvContent
  }
  
  private escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }
}
```

## Import Engine

### FileParser Class

**Purpose**: Multi-format file parsing with validation

```typescript
export class FileParser {
  // Parse uploaded file based on format
  public async parseFile(file: File): Promise<ParsedData> {
    const fileExtension = this.getFileExtension(file.name)
    
    switch (fileExtension) {
      case 'json':
        return this.parseJSON(file)
      case 'csv':
        return this.parseCSV(file)
      case 'xlsx':
        return this.parseExcel(file)
      case 'zip':
        return this.parseZip(file)
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`)
    }
  }
  
  private async parseJSON(file: File): Promise<ParsedData> {
    const content = await file.text()
    
    try {
      const data = JSON.parse(content)
      
      // Validate JSON structure
      if (this.isLegacyFormat(data)) {
        return this.convertLegacyFormat(data)
      }
      
      if (this.isDINOFormat(data)) {
        return this.parseDINOFormat(data)
      }
      
      // Try to infer format
      return this.inferJSONFormat(data)
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`)
    }
  }
  
  private async parseCSV(file: File): Promise<ParsedData> {
    const content = await file.text()
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row')
    }
    
    const headers = this.parseCSVRow(lines[0])
    const trips: Partial<CountryVisit>[] = []
    const errors: string[] = []
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVRow(lines[i])
        const trip = this.mapCSVRowToTrip(headers, values)
        trips.push(trip)
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }
    
    return {
      trips,
      errors,
      format: 'csv',
      metadata: {
        totalRows: lines.length - 1,
        headerRow: headers
      }
    }
  }
  
  private mapCSVRowToTrip(headers: string[], values: string[]): Partial<CountryVisit> {
    const trip: Partial<CountryVisit> = {}
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim()
      if (!value) return
      
      switch (header.toLowerCase()) {
        case 'country':
          trip.country = value
          break
        case 'entry date':
        case 'entrydate':
          trip.entryDate = new Date(value)
          if (isNaN(trip.entryDate.getTime())) {
            throw new Error(`Invalid entry date: ${value}`)
          }
          break
        case 'exit date':
        case 'exitdate':
          if (value.toLowerCase() !== 'current' && value !== '') {
            trip.exitDate = new Date(value)
            if (isNaN(trip.exitDate.getTime())) {
              throw new Error(`Invalid exit date: ${value}`)
            }
          }
          break
        case 'visa type':
        case 'visatype':
          trip.visaType = value
          break
        case 'max days':
        case 'maxdays':
          trip.maxDays = parseInt(value)
          break
        case 'passport country':
        case 'passportcountry':
          trip.passportCountry = value
          break
        case 'notes':
          trip.notes = value
          break
      }
    })
    
    // Validate required fields
    if (!trip.country) {
      throw new Error('Country is required')
    }
    if (!trip.entryDate) {
      throw new Error('Entry date is required')
    }
    if (!trip.visaType) {
      throw new Error('Visa type is required')
    }
    
    return trip
  }
}
```

### DuplicateDetector Class

**Purpose**: Intelligent duplicate identification and resolution

```typescript
export class DuplicateDetector {
  // Detect duplicates using configurable criteria
  public async detectDuplicates(
    newTrips: Partial<CountryVisit>[],
    existingTrips: CountryVisit[],
    criteria: DuplicateDetectionCriteria
  ): Promise<DuplicateAnalysis> {
    const duplicates: DuplicateMatch[] = []
    const unique: Partial<CountryVisit>[] = []
    
    for (const newTrip of newTrips) {
      const matches = this.findMatches(newTrip, existingTrips, criteria)
      
      if (matches.length > 0) {
        duplicates.push({
          newRecord: newTrip,
          existingMatches: matches,
          confidence: this.calculateMatchConfidence(newTrip, matches[0]),
          suggestedAction: this.suggestAction(newTrip, matches[0], criteria)
        })
      } else {
        unique.push(newTrip)
      }
    }
    
    return {
      duplicates,
      unique,
      summary: {
        totalNewRecords: newTrips.length,
        duplicateCount: duplicates.length,
        uniqueCount: unique.length
      }
    }
  }
  
  private findMatches(
    newTrip: Partial<CountryVisit>,
    existingTrips: CountryVisit[],
    criteria: DuplicateDetectionCriteria
  ): CountryVisit[] {
    return existingTrips.filter(existing => {
      switch (criteria.mode) {
        case 'strict':
          return this.strictMatch(newTrip, existing)
        case 'fuzzy':
          return this.fuzzyMatch(newTrip, existing, criteria.threshold || 0.8)
        default:
          return false
      }
    })
  }
  
  private strictMatch(
    newTrip: Partial<CountryVisit>,
    existing: CountryVisit
  ): boolean {
    return (
      newTrip.country === existing.country &&
      this.datesEqual(newTrip.entryDate, existing.entryDate) &&
      this.datesEqual(newTrip.exitDate, existing.exitDate) &&
      newTrip.visaType === existing.visaType
    )
  }
  
  private fuzzyMatch(
    newTrip: Partial<CountryVisit>,
    existing: CountryVisit,
    threshold: number
  ): boolean {
    let score = 0
    let maxScore = 0
    
    // Country match (required)
    maxScore += 0.4
    if (newTrip.country === existing.country) {
      score += 0.4
    } else {
      return false // Country must match
    }
    
    // Entry date match
    maxScore += 0.3
    if (this.datesEqual(newTrip.entryDate, existing.entryDate)) {
      score += 0.3
    } else if (this.datesNear(newTrip.entryDate, existing.entryDate, 1)) {
      score += 0.15 // Partial credit for dates within 1 day
    }
    
    // Exit date match
    maxScore += 0.2
    if (this.datesEqual(newTrip.exitDate, existing.exitDate)) {
      score += 0.2
    } else if (this.datesNear(newTrip.exitDate, existing.exitDate, 1)) {
      score += 0.1
    }
    
    // Visa type match
    maxScore += 0.1
    if (newTrip.visaType === existing.visaType) {
      score += 0.1
    }
    
    return (score / maxScore) >= threshold
  }
  
  private calculateMatchConfidence(
    newTrip: Partial<CountryVisit>,
    match: CountryVisit
  ): number {
    // Calculate confidence score between 0 and 1
    let confidence = 0
    
    if (newTrip.country === match.country) confidence += 0.3
    if (this.datesEqual(newTrip.entryDate, match.entryDate)) confidence += 0.3
    if (this.datesEqual(newTrip.exitDate, match.exitDate)) confidence += 0.2
    if (newTrip.visaType === match.visaType) confidence += 0.1
    if (newTrip.passportCountry === match.passportCountry) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
  
  private suggestAction(
    newTrip: Partial<CountryVisit>,
    match: CountryVisit,
    criteria: DuplicateDetectionCriteria
  ): 'skip' | 'update' | 'prompt' {
    const confidence = this.calculateMatchConfidence(newTrip, match)
    
    if (confidence >= 0.9) {
      return criteria.highConfidenceAction || 'skip'
    } else if (confidence >= 0.7) {
      return criteria.mediumConfidenceAction || 'prompt'
    } else {
      return criteria.lowConfidenceAction || 'update'
    }
  }
}
```

## API Endpoints

### GET /api/export

**Purpose**: Export user data in specified format  
**Authentication**: Required  
**Rate Limiting**: 5 requests per minute

#### Query Parameters
- `format` - Export format ('json' | 'csv')
- `categories` - Data categories to include (comma-separated)
- `dateRange` - Optional date range filter
- `compress` - Enable compression (boolean)

#### Implementation
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const categories = searchParams.get('categories')?.split(',') || ['trips']
  const compress = searchParams.get('compress') === 'true'
  
  // Get authenticated user
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Configure export
    const config: ExportConfiguration = {
      format: format as 'json' | 'csv',
      categories: {
        trips: categories.includes('trips'),
        preferences: categories.includes('preferences'),
        notifications: categories.includes('notifications'),
        analytics: categories.includes('analytics')
      },
      compression: {
        enabled: compress,
        algorithm: 'gzip',
        level: 3
      },
      includeMetadata: true,
      privacy: {
        excludePersonalData: false,
        anonymizeData: false
      }
    }
    
    // Export data
    const exporter = format === 'json' ? new JSONExporter() : new CSVExporter()
    const exportData = await exporter.exportUserData(session.user.id, config)
    
    // Prepare response
    const filename = `dinocal-${format}-${new Date().toISOString().split('T')[0]}`
    const contentType = format === 'json' ? 'application/json' : 'text/csv'
    
    const response = new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${format}"`,
        'Cache-Control': 'no-cache'
      }
    })
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Export failed', details: error.message },
      { status: 500 }
    )
  }
}
```

### POST /api/import

**Purpose**: Import user data from uploaded file  
**Authentication**: Required  
**Rate Limiting**: 3 requests per minute  
**File Size Limit**: 10MB

#### Request Body
- File content (JSON/CSV)
- Import configuration options

#### Implementation
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { data, config } = body
    
    // Validate import configuration
    const importConfig: ImportConfiguration = {
      strategy: config.strategy || 'merge',
      duplicateHandling: {
        detection: config.duplicateHandling?.detection || 'fuzzy',
        resolution: config.duplicateHandling?.resolution || 'prompt',
        criteria: config.duplicateHandling?.criteria || ['country', 'entryDate']
      },
      validation: {
        strict: config.validation?.strict || false,
        customRules: config.validation?.customRules || [],
        skipInvalid: config.validation?.skipInvalid || true
      },
      backup: {
        createBackup: config.backup?.createBackup !== false,
        backupFormat: config.backup?.backupFormat || 'json'
      }
    }
    
    // Create backup if requested
    let backupId: string | undefined
    if (importConfig.backup.createBackup) {
      backupId = await createUserBackup(session.user.id, importConfig.backup.backupFormat)
    }
    
    // Process import
    const importer = new DataImporter()
    const result = await importer.importData(session.user.id, data, importConfig)
    
    // Add backup information to result
    if (backupId) {
      result.metadata.backupId = backupId
    }
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Import failed', details: error.message },
      { status: 500 }
    )
  }
}
```

## Error Handling and Recovery

### Validation and Error Recovery
```typescript
export class ImportErrorHandler {
  // Handle various import errors with appropriate recovery strategies
  public handleImportError(
    error: ImportError,
    context: ImportContext
  ): ErrorRecoveryAction {
    switch (error.type) {
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context)
      case 'DUPLICATE_ERROR':
        return this.handleDuplicateError(error, context)
      case 'FORMAT_ERROR':
        return this.handleFormatError(error, context)
      case 'CONSTRAINT_ERROR':
        return this.handleConstraintError(error, context)
      default:
        return {
          action: 'skip',
          message: `Unknown error: ${error.message}`,
          severity: 'error'
        }
    }
  }
  
  private handleValidationError(
    error: ImportError,
    context: ImportContext
  ): ErrorRecoveryAction {
    if (context.config.validation.skipInvalid) {
      return {
        action: 'skip',
        message: `Skipped invalid record: ${error.field} - ${error.message}`,
        severity: 'warning'
      }
    }
    
    // Attempt auto-correction for common issues
    const corrected = this.attemptAutoCorrection(error, context.record)
    if (corrected) {
      return {
        action: 'correct',
        data: corrected,
        message: `Auto-corrected ${error.field}`,
        severity: 'info'
      }
    }
    
    return {
      action: 'error',
      message: `Validation failed: ${error.message}`,
      severity: 'error'
    }
  }
}
```

### Rollback and Recovery
```typescript
export class ImportRollbackManager {
  // Rollback recent import operation
  public async rollbackImport(importId: string): Promise<RollbackResult> {
    const importOperation = await this.getImportOperation(importId)
    if (!importOperation) {
      throw new Error('Import operation not found')
    }
    
    if (!importOperation.backupId) {
      throw new Error('No backup available for rollback')
    }
    
    // Restore from backup
    const backup = await this.getBackup(importOperation.backupId)
    const restoreResult = await this.restoreFromBackup(backup)
    
    // Mark import as rolled back
    await this.markImportRolledBack(importId)
    
    return {
      success: true,
      restoredRecords: restoreResult.recordCount,
      rollbackTimestamp: new Date()
    }
  }
}
```

## Performance Optimization

### Streaming Import for Large Files
```typescript
export class StreamingImporter {
  // Process large files in chunks to avoid memory issues
  public async importLargeFile(
    file: File,
    chunkSize: number = 1000
  ): Promise<void> {
    const stream = file.stream()
    const reader = stream.getReader()
    
    let buffer = ''
    let recordCount = 0
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += new TextDecoder().decode(value)
        
        // Process complete records
        const records = this.extractCompleteRecords(buffer)
        buffer = this.getRemainingBuffer(buffer, records.length)
        
        if (records.length >= chunkSize) {
          await this.processRecordChunk(records.slice(0, chunkSize))
          recordCount += chunkSize
          
          // Update progress
          this.updateProgress(recordCount)
        }
      }
      
      // Process remaining records
      if (buffer.trim()) {
        const finalRecords = this.extractCompleteRecords(buffer)
        await this.processRecordChunk(finalRecords)
      }
    } finally {
      reader.releaseLock()
    }
  }
}
```

### Parallel Processing
```typescript
// Process multiple import operations in parallel
export class ParallelImportProcessor {
  private async processInParallel<T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    concurrency: number = 5
  ): Promise<any[]> {
    const results: any[] = []
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      const batchResults = await Promise.allSettled(
        batch.map(item => processor(item))
      )
      
      results.push(...batchResults)
    }
    
    return results
  }
}
```

This comprehensive data management system ensures reliable, efficient, and user-friendly data import/export capabilities while maintaining data integrity and providing robust error handling throughout all operations.