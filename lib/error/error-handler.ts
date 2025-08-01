// TODO: Remove unused logger import

/**
 * Centralized Error Handling System
 * Provides consistent error handling across the application
 */

import { NextResponse, NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Error types
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Custom error class
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public details?: any,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId?: string
  }
}

// Create standardized error response
export function createErrorResponse(
  error: AppError | Error,
  requestId?: string
): NextResponse<ErrorResponse> {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Determine error details
  let code = ErrorCode.INTERNAL_ERROR
  let statusCode = 500
  let message = isProduction ? 'An error occurred' : error.message
  let details = undefined
  
  if (error instanceof AppError) {
    code = error.code
    statusCode = error.statusCode
    message = error.message
    details = isProduction ? undefined : error.details
  }
  
  const response: ErrorResponse = {
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId
    }
  }
  
  if (details && !isProduction) {
    response.error.details = details
  }
  
  // Log error
  logError(error, requestId)
  
  return NextResponse.json(response, { status: statusCode })
}

// Error logging
function logError(error: Error, requestId?: string) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }
  
  if (error instanceof AppError) {
    Object.assign(errorLog, {
      code: error.code,
      severity: error.severity,
      isOperational: error.isOperational
    })
  }
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry logging would go here
  }
  
  // Always log to console
  console.error('Error Log:', JSON.stringify(errorLog, null, 2))
}

// Error factory functions
export const errors = {
  badRequest: (message = 'Bad request', details?: any) =>
    new AppError(ErrorCode.BAD_REQUEST, message, 400, ErrorSeverity.LOW, details),
  
  unauthorized: (message = 'Unauthorized') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401, ErrorSeverity.MEDIUM),
  
  forbidden: (message = 'Forbidden') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403, ErrorSeverity.MEDIUM),
  
  notFound: (resource = 'Resource') =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404, ErrorSeverity.LOW),
  
  conflict: (message = 'Conflict', details?: any) =>
    new AppError(ErrorCode.CONFLICT, message, 409, ErrorSeverity.MEDIUM, details),
  
  validation: (details: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, ErrorSeverity.LOW, details),
  
  rateLimit: () =>
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, 'Too many requests', 429, ErrorSeverity.LOW),
  
  internal: (message = 'Internal server error', details?: any) =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500, ErrorSeverity.HIGH, details),
  
  database: (message = 'Database error', details?: any) =>
    new AppError(ErrorCode.DATABASE_ERROR, message, 500, ErrorSeverity.HIGH, details),
  
  external: (service: string, details?: any) =>
    new AppError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}`,
      503,
      ErrorSeverity.MEDIUM,
      details
    ),
  
  configuration: (message = 'Configuration error') =>
    new AppError(ErrorCode.CONFIGURATION_ERROR, message, 500, ErrorSeverity.CRITICAL)
}

// Handle different error types
export function handleError(error: unknown, requestId?: string): NextResponse {
  // Already an AppError
  if (error instanceof AppError) {
    return createErrorResponse(error, requestId)
  }
  
  // Zod validation error
  if (error instanceof ZodError) {
    const validationErrors = (error as any).errors.reduce((acc: Record<string, string>, curr: any) => {
      const path = curr.path.join('.')
      acc[path] = curr.message
      return acc
    }, {} as Record<string, string>)
    
    return createErrorResponse(
      errors.validation(validationErrors),
      requestId
    )
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return createErrorResponse(
          errors.conflict('Duplicate entry', { field: error.meta?.target }),
          requestId
        )
      case 'P2025':
        return createErrorResponse(
          errors.notFound('Record'),
          requestId
        )
      default:
        return createErrorResponse(
          errors.database('Database operation failed', { code: error.code }),
          requestId
        )
    }
  }
  
  // Generic Error
  if (error instanceof Error) {
    return createErrorResponse(error, requestId)
  }
  
  // Unknown error
  return createErrorResponse(
    errors.internal('An unexpected error occurred'),
    requestId
  )
}

// Async error wrapper for route handlers
export function asyncHandler<T = any>(
  handler: (req: Request | NextRequest, context?: any) => Promise<T>
) {
  return async (req: Request | NextRequest, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID()
      return handleError(error, requestId)
    }
  }
}

// Client-side error handler
export function handleClientError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unexpected error occurred'
}