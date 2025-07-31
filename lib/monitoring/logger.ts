/**
 * Structured Logging System
 * Provides consistent logging with different levels and structured data
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  error?: any;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
}

export class Logger {
  private name: string;
  private minLevel: LogLevel;
  private buffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor(name: string) {
    this.name = name;
    this.minLevel = this.getMinLevel();
  }

  private getMinLevel(): LogLevel {
    const env = process.env.NODE_ENV;
    const configLevel = process.env.LOG_LEVEL;

    if (configLevel) {
      return configLevel as LogLevel;
    }

    return env === 'production' ? 'info' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const minIndex = levels.indexOf(this.minLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex >= minIndex;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.name}]`;

    if (process.env.NODE_ENV === 'development') {
      // Pretty print in development
      let log = `${prefix} ${message}`;
      if (context) {
        log += '\n' + JSON.stringify(context, null, 2);
      }
      return log;
    } else {
      // JSON format in production
      return JSON.stringify({
        ...entry,
        logger: this.name,
        environment: process.env.NODE_ENV,
      });
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    // Add stack trace for errors
    if (context?.error && context.error instanceof Error) {
      entry.stack = context.error.stack;
    }

    // Store in memory for API access (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Dynamic import to avoid circular dependency
        import('@/app/api/logs/route')
          .then(module => {
            module.storeLog(entry);
          })
          .catch(() => {
            // Ignore if module not available
          });
      } catch (__error) {
        // Ignore errors
      }
    }

    // Output to console
    const formatted = this.formatLog(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
      case 'fatal':
        console.error(formatted);
        break;
    }

    // Buffer for batch sending
    this.buffer.push(entry);
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context);
    // Fatal errors should flush immediately
    this.flush();
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger(`${this.name}:child`);
    childLogger.minLevel = this.minLevel;

    // Override log method to include parent context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (
      level: LogLevel,
      message: string,
      childContext?: LogContext
    ) => {
      originalLog(level, message, { ...context, ...childContext });
    };

    return childLogger;
  }

  // Flush buffered logs
  private flush(): void {
    if (this.buffer.length === 0) return;

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production' && process.env.LOG_ENDPOINT) {
      // Send logs to external service
      this.sendLogs(this.buffer);
    }

    this.buffer = [];
  }

  private async sendLogs(logs: LogEntry[]): Promise<void> {
    try {
      // Implement sending to logging service
      // await fetch(process.env.LOG_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs })
      // })
    } catch (error) {
      console.error('Failed to send logs:', error);
    }
  }
}

// Create loggers for different modules
export const _loggers = {
  api: new Logger('api'),
  auth: new Logger('auth'),
  db: new Logger('db'),
  business: new Logger('business'),
  security: new Logger('security'),
  performance: new Logger('performance'),
  error: new Logger('error'),
};

// Request logger middleware helper
export function createRequestLogger(logger: Logger) {
  return (req: Request, context?: any) => {
    const requestId = crypto.randomUUID();
    const start = Date.now();

    const childLogger = logger.child({
      requestId,
      method: req.method,
      path: new URL(req.url).pathname,
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    // Log request
    childLogger.info('Request received');

    // Return logger and timing function
    return {
      logger: childLogger,
      end: (statusCode: number, error?: Error) => {
        const duration = Date.now() - start;

        if (error) {
          childLogger.error('Request failed', {
            statusCode,
            duration,
            error: {
              message: error.message,
              name: error.name,
            },
          });
        } else {
          childLogger.info('Request completed', {
            statusCode,
            duration,
          });
        }
      },
    };
  };
}
