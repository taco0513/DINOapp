/**
 * Error Logging and Monitoring System
 * Centralizes error logging with different severity levels and monitoring integration
 */

import { AppError, ErrorCode, ErrorSeverity } from './error-handler'

export interface ErrorLogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info'
  code?: ErrorCode
  message: string
  severity?: ErrorSeverity
  stack?: string
  context?: {
    userId?: string
    requestId?: string
    url?: string
    method?: string
    userAgent?: string
    ip?: string
  }
  metadata?: any
}

export interface ErrorLogger {
  error(error: Error | AppError, context?: ErrorLogEntry['context']): void
  warn(message: string, metadata?: any): void
  info(message: string, metadata?: any): void
  flush(): Promise<void>
}

class ConsoleErrorLogger implements ErrorLogger {
  private buffer: ErrorLogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly maxBufferSize = 100
  private readonly flushIntervalMs = 5000

  constructor() {
    // Start periodic flush
    this.flushInterval = setInterval(() => {
      this.flush().catch(console.error)
    }, this.flushIntervalMs)
  }

  error(error: Error | AppError, context?: ErrorLogEntry['context']): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context
    }

    if (error instanceof AppError) {
      entry.code = error.code
      entry.severity = error.severity
      entry.metadata = error.details
    }

    this.addToBuffer(entry)
    
    // Immediately log critical errors
    if (error instanceof AppError && error.severity === ErrorSeverity.CRITICAL) {
      console.error('🚨 CRITICAL ERROR:', JSON.stringify(entry, null, 2))
    }
  }

  warn(message: string, metadata?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      metadata
    }

    this.addToBuffer(entry)
  }

  info(message: string, metadata?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      metadata
    }

    this.addToBuffer(entry)
  }

  private addToBuffer(entry: ErrorLogEntry): void {
    this.buffer.push(entry)

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush().catch(console.error)
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entriesToFlush = [...this.buffer]
    this.buffer = []

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      entriesToFlush.forEach(entry => {
        const emoji = this.getEmoji(entry.level, entry.severity)
        console.log(`${emoji} [${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`)
        
        if (entry.context) {
          console.log('  Context:', entry.context)
        }
        
        if (entry.metadata) {
          console.log('  Metadata:', entry.metadata)
        }
        
        if (entry.stack && entry.level === 'error') {
          console.log('  Stack:', entry.stack)
        }
      })
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Batch send to Sentry or other monitoring service
      await this.sendToMonitoring(entriesToFlush)
    }
  }

  private getEmoji(level: string, severity?: ErrorSeverity): string {
    if (severity === ErrorSeverity.CRITICAL) return '🚨'
    if (severity === ErrorSeverity.HIGH) return '❗'
    
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  private async sendToMonitoring(entries: ErrorLogEntry[]): Promise<void> {
    // Implementation for sending to Sentry, DataDog, etc.
    // This is a placeholder for actual monitoring integration
    
    try {
      // Group by severity
      const critical = entries.filter(e => e.severity === ErrorSeverity.CRITICAL)
      const high = entries.filter(e => e.severity === ErrorSeverity.HIGH)
      const others = entries.filter(e => !critical.includes(e) && !high.includes(e))

      // Send critical errors immediately
      if (critical.length > 0) {
        // await sendToSentry(critical, { level: 'fatal' })
      }

      // Send high severity errors
      if (high.length > 0) {
        // await sendToSentry(high, { level: 'error' })
      }

      // Batch send other errors
      if (others.length > 0) {
        // await sendToSentry(others, { level: 'warning' })
      }
    } catch (error) {
      // Don't throw if monitoring fails
      console.error('Failed to send logs to monitoring:', error)
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Final flush
    this.flush().catch(console.error)
  }
}

// Create singleton logger
let logger: ErrorLogger | null = null

export function getErrorLogger(): ErrorLogger {
  if (!logger) {
    logger = new ConsoleErrorLogger()
  }
  return logger
}

// Convenience functions
export function logError(error: Error | AppError, context?: ErrorLogEntry['context']): void {
  getErrorLogger().error(error, context)
}

export function logWarn(message: string, metadata?: any): void {
  getErrorLogger().warn(message, metadata)
}

export function logInfo(message: string, metadata?: any): void {
  getErrorLogger().info(message, metadata)
}

// Error tracking utilities
export function trackErrorRate(): { rate: number; window: string } {
  // This would connect to your metrics system
  // For now, return a placeholder
  return {
    rate: 0.01, // 1% error rate
    window: '5m'
  }
}

export function getErrorTrends(): { 
  trend: 'increasing' | 'decreasing' | 'stable'
  change: number 
} {
  // This would analyze error patterns
  // For now, return a placeholder
  return {
    trend: 'stable',
    change: 0
  }
}