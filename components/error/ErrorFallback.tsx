'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorFallback:', error);
    }
  }, [error]);

  const _handleEmailSupport = () => {
    const subject = encodeURIComponent('Error Report - DINO App');
    const body = encodeURIComponent(`
I encountered an error in the DINO app:

Error: ${error.message}
Time: ${new Date().toISOString()}
Page: ${window.location.href}

Please help!
    `);
    window.location.href = `mailto:support@dinoapp.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className='min-h-[400px] flex items-center justify-center p-4'>
      <Card className='max-w-md w-full'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 text-red-600'>
            <AlertCircle className='h-full w-full' />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We're sorry for the inconvenience. The error has been logged and
            we'll look into it.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='rounded-lg bg-red-50 p-4 text-sm text-red-800'>
            <p className='font-medium'>Error message:</p>
            <p className='mt-1'>{error.message}</p>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-2'>
          <Button
            onClick={resetErrorBoundary}
            className='w-full'
            variant='default'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Try again
          </Button>

          <div className='flex gap-2 w-full'>
            <Button
              onClick={() => (window.location.href = '/')}
              variant='outline'
              className='flex-1'
            >
              <Home className='mr-2 h-4 w-4' />
              Go home
            </Button>

            <Button
              onClick={handleEmailSupport}
              variant='outline'
              className='flex-1'
            >
              <Mail className='mr-2 h-4 w-4' />
              Contact support
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
