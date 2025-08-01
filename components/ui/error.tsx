'use client'

import { Icon } from '@/components/icons'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

// Base error alert component
export function ErrorAlert({
  severity = 'error',
  title,
  message,
  action,
  onDismiss,
  className = ''
}: {
  severity?: ErrorSeverity
  title?: string
  message: string
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}) {
  const severityConfig = {
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-400',
      icon: 'info' as const
    },
    warning: {
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-800 dark:text-amber-400',
      icon: 'alert-triangle' as const
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-400',
      icon: 'alert-circle' as const
    },
    critical: {
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-700',
      textColor: 'text-red-900 dark:text-red-300',
      icon: 'x-circle' as const
    }
  }

  const config = severityConfig[severity]

  return (
    <div
      className={`rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
      style={{ padding: 'var(--space-4)' }}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon
            name={config.icon}
            size="md"
            className={config.textColor}
          />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`} style={{ marginBottom: 'var(--space-1)' }}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {message}
          </div>
          {action && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              {action}
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-primary`}
            >
              <span className="sr-only">Dismiss</span>
              <Icon name="x" size="sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Error boundary fallback component
export function ErrorBoundaryFallback({
  error,
  resetError,
  className = ''
}: {
  error: Error
  resetError: () => void
  className?: string
}) {
  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto" style={{ padding: 'var(--space-4)' }}>
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="alert-triangle" size="xl" className="text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-muted-foreground mb-4">
          예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              오류 세부사항
            </summary>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        <Button onClick={resetError}>
          다시 시도
        </Button>
      </div>
    </div>
  )
}

// Empty state error component
export function ErrorEmpty({
  icon = 'file-text',
  title = '데이터가 없습니다',
  message,
  action,
  className = ''
}: {
  icon?: string
  title?: string
  message?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div 
        className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <Icon name={icon as any} size="xl" className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-foreground" style={{ marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      {message && (
        <p className="text-muted-foreground" style={{ marginBottom: 'var(--space-4)' }}>
          {message}
        </p>
      )}
      {action}
    </div>
  )
}

// Form field error component
export function ErrorField({
  error,
  className = ''
}: {
  error?: string
  className?: string
}) {
  if (!error) return null

  return (
    <p className={`text-sm text-destructive mt-1 ${className}`}>
      <Icon name="alert-circle" size="xs" className="inline mr-1" />
      {error}
    </p>
  )
}

// Network error component
export function ErrorNetwork({
  onRetry,
  className = ''
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorEmpty
      icon="globe"
      title="네트워크 연결 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요."
      action={
        onRetry && (
          <Button onClick={onRetry} variant="outline">
            <Icon name="refresh" size="sm" className="mr-2" />
            다시 시도
          </Button>
        )
      }
      className={className}
    />
  )
}

// 404 error component
export function Error404({
  onGoHome,
  className = ''
}: {
  onGoHome?: () => void
  className?: string
}) {
  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        {onGoHome && (
          <Button onClick={onGoHome}>
            <Icon name="home" size="sm" className="mr-2" />
            홈으로 돌아가기
          </Button>
        )}
      </div>
    </div>
  )
}

// Permission error component
export function ErrorPermission({
  message = '이 페이지에 접근할 권한이 없습니다.',
  onGoBack,
  className = ''
}: {
  message?: string
  onGoBack?: () => void
  className?: string
}) {
  return (
    <ErrorEmpty
      icon="lock"
      title="접근 권한 없음"
      message={message}
      action={
        onGoBack && (
          <Button onClick={onGoBack} variant="outline">
            <Icon name="arrow-left" size="sm" className="mr-2" />
            뒤로 가기
          </Button>
        )
      }
      className={className}
    />
  )
}

// Validation error summary
export function ErrorSummary({
  errors,
  title = '입력 오류가 있습니다',
  className = ''
}: {
  errors: Record<string, string | string[]>
  title?: string
  className?: string
}) {
  const errorList = Object.entries(errors).flatMap(([field, error]) => {
    if (Array.isArray(error)) {
      return error.map(e => ({ field, message: e }))
    }
    return [{ field, message: error }]
  })

  if (errorList.length === 0) return null

  return (
    <ErrorAlert
      severity="error"
      title={title}
      message={errorList.map(error => `${error.field}: ${error.message}`).join(', ')}
      className={className}
    />
  )
}

// Export all components
export const Error = {
  Alert: ErrorAlert,
  Boundary: ErrorBoundaryFallback,
  Empty: ErrorEmpty,
  Field: ErrorField,
  Network: ErrorNetwork,
  NotFound: Error404,
  Permission: ErrorPermission,
  Summary: ErrorSummary
}