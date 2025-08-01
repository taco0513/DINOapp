'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// TODO: Remove unused logger import

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, JSON.stringify(errorInfo))
    
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Enhanced error reporting
    this.reportError(error, errorInfo)
    
    // Attempt recovery after critical errors
    if (this.state.errorCount > 2) {
      this.attemptRecovery()
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      errorCount: this.state.errorCount + 1
    }

    // Send to monitoring service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Store in localStorage as fallback
      try {
        const existingErrors = JSON.parse(localStorage.getItem('dino-errors') || '[]')
        existingErrors.push(errorReport)
        // Keep only last 10 errors
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10)
        }
        localStorage.setItem('dino-errors', JSON.stringify(existingErrors))
      } catch (e) {
        console.warn('Failed to store error report:', e)
      }

      // Send to API endpoint for server-side logging
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    }
  }

  private attemptRecovery() {
    // Clear potentially corrupted localStorage data
    if (typeof window !== 'undefined') {
      try {
        const keysToPreserve = ['dino-auth-token', 'dino-user-preferences']
        const preservedData = keysToPreserve.reduce((acc, key) => {
          const value = localStorage.getItem(key)
          if (value) acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        localStorage.clear()
        
        // Restore preserved data
        Object.entries(preservedData).forEach(([key, value]) => {
          localStorage.setItem(key, value)
        })
        
        // Attempted recovery: cleared corrupted localStorage data
      } catch (e) {
        console.warn('Recovery attempt failed:', e)
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      const { error, errorCount } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Don't worry, we've been notified and are working on it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
              
              {errorCount > 2 && (
                <Alert variant="destructive">
                  <AlertTitle>Persistent Issue Detected</AlertTitle>
                  <AlertDescription>
                    This error has occurred {errorCount} times. The app has attempted automatic recovery. 
                    If the issue persists, please refresh the page or contact support.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert>
                <AlertTitle>What you can do:</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>• Try the "Try Again" button to reload just this component</p>
                  <p>• Use "Reload Page" if the error persists</p>
                  <p>• Your data is automatically saved and will be preserved</p>
                  <p>• Contact support if you continue experiencing issues</p>
                </AlertDescription>
              </Alert>
              
              {isDevelopment && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                    Developer Information
                  </summary>
                  <div className="mt-2 space-y-2">
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo ? JSON.stringify(errorInfo) : undefined)
    
    // You can add custom error handling logic here
    // For example, showing a toast notification
    if (typeof window !== 'undefined') {
      // Toast notification would go here
    }
  }
}