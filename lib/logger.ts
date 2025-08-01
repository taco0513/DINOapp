import { logger } from '@/lib/logger';
// TODO: Remove unused logger import

/**
 * Unified logging system for DINO app
 * Provides structured logging with different levels and proper error handling
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  source?: string
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDev) {
      return level === 'warn' || level === 'error'
    }
    return true
  }

  private logToConsole(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return

    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`
    const sourceInfo = entry.source ? ` [${entry.source}]` : ''
    const message = `${prefix}${sourceInfo}: ${entry.message}`

    switch (entry.level) {
      case 'debug':
        logger.debug(message, entry.data || '')
        break
      case 'info':
        logger.info(message, entry.data || '')
        break
      case 'warn':
        logger.warn(message, entry.data || '')
        break
      case 'error':
        logger.error(message, entry.data || '')
        break
    }
  }

  private logToSentry(entry: LogEntry) {
    // Only log errors to Sentry in production
    if (entry.level === 'error' && !this.isDev && this.isClient) {
      try {
        // Import Sentry dynamically to avoid SSR issues
        import('@sentry/nextjs').then(({ captureException, addBreadcrumb }) => {
          addBreadcrumb({
            message: entry.message,
            level: entry.level as any, // Cast to avoid Sentry type conflicts
            data: entry.data,
            category: entry.source || 'general'
          })

          if (entry.data instanceof Error) {
            captureException(entry.data)
          } else {
            captureException(new Error(entry.message))
          }
        }).catch(() => {
          // Fallback to console if Sentry is not available
          logger.error('Sentry logging failed:', entry)
        })
      } catch {
        // Silent fail - don't break the app if logging fails
      }
    }
  }

  debug(message: string, data?: any, source?: string) {
    const entry = this.formatMessage('debug', message, data, source)
    this.logToConsole(entry)
  }

  info(message: string, data?: any, source?: string) {
    const entry = this.formatMessage('info', message, data, source)
    this.logToConsole(entry)
  }

  warn(message: string, data?: any, source?: string) {
    const entry = this.formatMessage('warn', message, data, source)
    this.logToConsole(entry)
    // Could add other warning destinations here
  }

  error(message: string, error?: Error | any, source?: string) {
    const entry = this.formatMessage('error', message, error, source)
    this.logToConsole(entry)
    this.logToSentry(entry)
  }

  // Convenience methods for common use cases
  apiError(message: string, error: Error, endpoint?: string) {
    this.error(`API Error${endpoint ? ` at ${endpoint}` : ''}: ${message}`, error, 'api')
  }

  dbError(message: string, error: Error, query?: string) {
    this.error(`Database Error${query ? ` in query "${query}"` : ''}: ${message}`, error, 'database')
  }

  authError(message: string, error?: Error) {
    this.error(`Auth Error: ${message}`, error, 'auth')
  }

  validationError(message: string, data?: any) {
    this.warn(`Validation Error: ${message}`, data, 'validation')
  }

  performanceWarn(message: string, metrics?: any) {
    this.warn(`Performance Warning: ${message}`, metrics, 'performance')
  }

  // Method to create a scoped logger for specific modules
  scope(source: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, source),
      info: (message: string, data?: any) => this.info(message, data, source),
      warn: (message: string, data?: any) => this.warn(message, data, source),
      error: (message: string, error?: Error | any) => this.error(message, error, source),
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export scoped loggers for common modules
export const apiLogger = console.scope('api')
export const dbLogger = console.scope('database')
export const authLogger = console.scope('auth')
export const perfLogger = console.scope('performance')
export const uiLogger = console.scope('ui')

// Export helper function for component-level logging
export function createComponentLogger(componentName: string) {
  return console.scope(`component:${componentName}`)
}