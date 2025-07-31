'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error monitoring (Sentry, etc.)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry error logging would go here
      console.log('Sending error to monitoring service...');
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
          <Card className='max-w-2xl w-full'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-6 w-6 text-red-600' />
                <CardTitle className='text-2xl'>
                  Oops! Something went wrong
                </CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Don't worry, we've been
                notified and are working on it.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>

              {errorCount > 2 && (
                <Alert>
                  <AlertTitle>Persistent Issue Detected</AlertTitle>
                  <AlertDescription>
                    This error has occurred multiple times. You may want to try
                    refreshing the page or contacting support.
                  </AlertDescription>
                </Alert>
              )}

              {isDevelopment && error && (
                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900'>
                    Developer Information
                  </summary>
                  <div className='mt-2 space-y-2'>
                    <pre className='text-xs bg-gray-100 p-3 rounded overflow-auto'>
                      {error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className='text-xs bg-gray-100 p-3 rounded overflow-auto'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className='flex gap-2'>
              <Button onClick={this.handleReset} variant='default'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant='outline'>
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant='ghost'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // You can add custom error handling logic here
    // For example, showing a toast notification
    if (typeof window !== 'undefined') {
      // Toast notification would go here
    }
  };
}
