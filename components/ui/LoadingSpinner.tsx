interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)'
      }}
    />
  )
}