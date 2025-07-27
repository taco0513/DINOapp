import { NextResponse } from 'next/server'

/**
 * Standard API Error Response
 * Provides consistent error handling across all API routes
 */

export interface APIError {
  error: string
  details?: string | object
  code?: string
  timestamp?: string
  requestId?: string
}

export interface APIErrorResponse {
  success: false
  error: APIError
}

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  
  // Custom errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CSRF_ERROR = 'CSRF_ERROR'
}

const ErrorStatusMap: Record<ErrorCode, number> = {
  // Client errors
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.UNPROCESSABLE_ENTITY]: 422,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  
  // Server errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
  [ErrorCode.BAD_GATEWAY]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.GATEWAY_TIMEOUT]: 504,
  
  // Custom errors mapped to appropriate status codes
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.AUTHENTICATION_ERROR]: 401,
  [ErrorCode.AUTHORIZATION_ERROR]: 403,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.CSRF_ERROR]: 403
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: string | object,
  requestId?: string
): NextResponse<APIErrorResponse> {
  const status = ErrorStatusMap[code] || 500
  const timestamp = new Date().toISOString()
  
  const errorResponse: APIErrorResponse = {
    success: false,
    error: {
      error: message || getDefaultErrorMessage(code),
      code,
      timestamp,
      ...(details && { details }),
      ...(requestId && { requestId })
    }
  }
  
  // Log server errors
  if (status >= 500) {
    // Server error detected
  }
  
  return NextResponse.json(errorResponse, { status })
}

/**
 * Handle unknown errors and convert them to standardized responses
 */
export function handleApiError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
  requestId?: string
): NextResponse<APIErrorResponse> {
  // Handle known error types
  if (error instanceof Error) {
    // Prisma errors
    if (error.message.includes('P2002')) {
      return createErrorResponse(
        ErrorCode.CONFLICT,
        'Resource already exists',
        error.message,
        requestId
      )
    }
    
    if (error.message.includes('P2025')) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'Resource not found',
        error.message,
        requestId
      )
    }
    
    // Database connection errors
    if (error.message.includes('database') || error.message.includes('prisma')) {
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        'Database operation failed',
        process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      )
    }
    
    // Default error response
    return createErrorResponse(
      defaultCode,
      error.message,
      process.env.NODE_ENV === 'development' ? error.stack : undefined,
      requestId
    )
  }
  
  // Handle non-Error objects
  return createErrorResponse(
    defaultCode,
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error : undefined,
    requestId
  )
}

/**
 * Get default error message for error code
 */
function getDefaultErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.BAD_REQUEST]: 'Invalid request',
    [ErrorCode.UNAUTHORIZED]: 'Authentication required',
    [ErrorCode.FORBIDDEN]: 'Access denied',
    [ErrorCode.NOT_FOUND]: 'Resource not found',
    [ErrorCode.METHOD_NOT_ALLOWED]: 'Method not allowed',
    [ErrorCode.CONFLICT]: 'Resource conflict',
    [ErrorCode.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
    [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
    [ErrorCode.NOT_IMPLEMENTED]: 'Not implemented',
    [ErrorCode.BAD_GATEWAY]: 'Bad gateway',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service unavailable',
    [ErrorCode.GATEWAY_TIMEOUT]: 'Gateway timeout',
    [ErrorCode.DATABASE_ERROR]: 'Database error',
    [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
    [ErrorCode.AUTHENTICATION_ERROR]: 'Authentication failed',
    [ErrorCode.AUTHORIZATION_ERROR]: 'Authorization failed',
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
    [ErrorCode.RATE_LIMIT_ERROR]: 'Rate limit exceeded',
    [ErrorCode.CSRF_ERROR]: 'CSRF validation failed'
  }
  
  return messages[code] || 'An error occurred'
}

/**
 * Validation error helper
 */
export function createValidationError(
  errors: Record<string, string[]> | string,
  requestId?: string
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Validation failed',
    errors,
    requestId
  )
}

/**
 * Generate request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}