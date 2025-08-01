'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { Icon } from '@/components/icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static override getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging system
    logger.error('React Error Boundary caught an error', error, 'react-boundary')
    
    // Log additional error info
    logger.debug('Error component stack', { componentStack: errorInfo.componentStack }, 'react-boundary')
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Update state with error info
    this.setState({ errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg border border-border p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
              <Icon name="alert-triangle" size="xl" className="text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              앗! 문제가 발생했습니다
            </h1>
            
            <p className="text-muted-foreground mb-6">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                  개발자 정보 (개발 모드에서만 표시)
                </summary>
                <div className="bg-muted/50 p-4 rounded-lg text-xs font-mono text-foreground overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                다시 시도
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full px-4 py-3 bg-muted text-muted-foreground border border-border rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                페이지 새로고침
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-3 bg-card text-card-foreground border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC version for easier wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specific error boundary for different sections
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, _errorInfo) => {
        // Report page-level errors to monitoring
        logger.error('Page-level error occurred', error, 'page-boundary')
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode
  componentName?: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
          <Icon name="alert-circle" size="lg" className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {componentName ? `${componentName} 컴포넌트` : '이 섹션'}에서 오류가 발생했습니다.
          </p>
        </div>
      }
      onError={(error, _errorInfo) => {
        logger.error(`Component error in ${componentName || 'unknown'}`, error, 'component-boundary')
      }}
    >
      {children}
    </ErrorBoundary>
  )
}