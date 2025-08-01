'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Loading } from '@/components/ui/loading'
import { Error } from '@/components/ui/error'
// import { Icon } from '@/components/icons' // Unused import
import type { StandardPageLayoutProps, StandardCardProps, StatsCardProps, EmptyStateProps, LoadingCardProps } from '@/types/layout'

export function StandardPageLayout({
  children,
  title,
  description,
  icon,
  breadcrumbs,
  headerActions,
  className = '',
}: StandardPageLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto" style={{ paddingLeft: 'var(--space-4)', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Page Header (if provided) */}
          {title && (
            <PageHeader
              title={title}
              description={description}
              icon={icon}
              breadcrumbs={breadcrumbs}
              action={headerActions}
            />
          )}
          
          {/* Main Content */}
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * 표준 카드 컴포넌트 - 대시보드와 일관된 스타일
 */
export function StandardCard({ 
  children, 
  title, 
  className = '',
  titleIcon,
  action
}: StandardCardProps) {
  return (
    <div className={`${className}`} style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-6)' }}>
      {title && (
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            {titleIcon && <span className="mr-2">{titleIcon}</span>}
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * 통계 카드 컴포넌트 - 대시보드 스타일
 */
export function StatsCard({ 
  value, 
  label, 
  color = 'blue',
  className = '' 
}: StatsCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-600 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-600 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 text-emerald-700',
    red: 'bg-red-50 border-red-100 text-red-600 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600 text-yellow-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-600 text-orange-700',
  }
  
  const [bgColor, borderColor, valueColor, labelColor] = colorStyles[color].split(' ')
  
  return (
    <div 
      className={`text-center rounded-lg border ${bgColor} ${borderColor} ${className}`}
      style={{ padding: 'var(--space-4)' }}
    >
      <div className={`text-3xl font-bold ${valueColor}`} style={{ marginBottom: 'var(--space-2)' }}>
        {value}
      </div>
      <div className={`text-sm font-medium ${labelColor}`}>
        {label}
      </div>
    </div>
  )
}

/**
 * 빈 상태 컴포넌트 - 대시보드 스타일
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  children
}: EmptyStateProps) {
  // Convert emoji to icon name if possible
  const iconName = typeof icon === 'string' && icon.length > 2 ? 'file-text' : icon
  
  return (
    <Error.Empty
      icon={iconName as string}
      title={title}
      message={description}
      action={
        <>
          {action}
          {children}
        </>
      }
      className={className}
    />
  )
}

/**
 * 로딩 상태 컴포넌트 - 대시보드 스타일
 */
export function LoadingCard({ rows = 4, className = '', children }: LoadingCardProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      style={{ padding: 'var(--space-6)' }}
    >
      <Loading.Skeleton height={24} width="128px" className="mx-auto mb-4" />
      <div className={`grid grid-cols-2 md:grid-cols-${rows}`} style={{ gap: 'var(--space-4)' }}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg" style={{ padding: 'var(--space-4)' }}>
            <Loading.Skeleton height={32} width="64px" className="mx-auto mb-2" />
            <Loading.Skeleton height={16} width="80px" className="mx-auto" />
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}