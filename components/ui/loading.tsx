'use client'

import { Icon } from '@/components/icons'
import { CSSProperties, ReactNode } from 'react'

// Loading spinner component
export function Spinner({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string 
}) {
  return (
    <Icon 
      name="loader" 
      size={size} 
      className={`animate-spin ${className}`} 
    />
  )
}

// Loading skeleton component
export function Skeleton({ 
  className = '',
  width,
  height,
  rounded = 'md'
}: { 
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}) {
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const style: CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  )
}

// Loading text component
export function LoadingText({ 
  lines = 3,
  className = ''
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          height={16} 
          width={i === lines - 1 ? '80%' : '100%'} 
        />
      ))}
    </div>
  )
}

// Loading card component
export function LoadingCard({ 
  showImage = false,
  showTitle = true,
  showDescription = true,
  className = ''
}: { 
  showImage?: boolean
  showTitle?: boolean
  showDescription?: boolean
  className?: string 
}) {
  return (
    <div 
      className={`bg-card rounded-lg border border-border ${className}`}
      style={{ padding: 'var(--space-4)' }}
    >
      {showImage && (
        <Skeleton 
          height={200} 
          className="mb-4" 
        />
      )}
      {showTitle && (
        <Skeleton 
          height={24} 
          width="60%" 
          className="mb-2" 
        />
      )}
      {showDescription && (
        <LoadingText lines={2} />
      )}
    </div>
  )
}

// Loading page component
export function LoadingPage({ 
  message = '로딩 중...',
  showSpinner = true,
  children
}: { 
  message?: string
  showSpinner?: boolean
  children?: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {showSpinner && (
          <Spinner size="xl" className="mx-auto mb-4 text-primary" />
        )}
        <p className="text-lg text-muted-foreground">{message}</p>
        {children}
      </div>
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({ 
  isLoading,
  message,
  children
}: { 
  isLoading: boolean
  message?: string
  children: ReactNode
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-2 text-primary" />
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Loading button component
export function LoadingButton({ 
  isLoading,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: { 
  isLoading: boolean
  loadingText?: string
  children: ReactNode
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`relative ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="inline-block mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Loading state for data grids
export function LoadingGrid({ 
  columns = 3,
  rows = 4,
  className = ''
}: { 
  columns?: number
  rows?: number
  className?: string 
}) {
  return (
    <div 
      className={`grid grid-cols-${columns} ${className}`}
      style={{ gap: 'var(--space-4)' }}
    >
      {[...Array(columns * rows)].map((_, i) => (
        <LoadingCard 
          key={i} 
          showTitle={true}
          showDescription={false}
        />
      ))}
    </div>
  )
}

// Loading state for lists
export function LoadingList({ 
  items = 5,
  showAvatar = true,
  className = ''
}: { 
  items?: number
  showAvatar?: boolean
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showAvatar && (
            <Skeleton 
              width={40} 
              height={40} 
              rounded="full" 
            />
          )}
          <div className="flex-1">
            <Skeleton height={20} width="40%" className="mb-1" />
            <Skeleton height={16} width="60%" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Export all components
export const Loading = {
  Spinner,
  Skeleton,
  Text: LoadingText,
  Card: LoadingCard,
  Page: LoadingPage,
  Overlay: LoadingOverlay,
  Button: LoadingButton,
  Grid: LoadingGrid,
  List: LoadingList
}