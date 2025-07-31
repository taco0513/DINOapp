'use client'

import { ReactNode } from 'react'
import { PageHeader, PageIcons } from '@/components/common/PageHeader'

interface StandardPageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  icon?: keyof typeof PageIcons
  breadcrumbs?: Array<{ label: string; href?: string }>
  headerActions?: ReactNode
  className?: string
}

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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header (if provided) */}
          {title && (
            <PageHeader
              title={title}
              description={description}
              icon={icon}
              breadcrumbs={breadcrumbs}
            />
          )}
          
          {/* Header Actions (optional) */}
          {headerActions && (
            <div className="flex justify-end">
              {headerActions}
            </div>
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
interface StandardCardProps {
  children: ReactNode
  title?: string
  className?: string
  titleIcon?: string
}

export function StandardCard({ 
  children, 
  title, 
  className = '',
  titleIcon
}: StandardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {titleIcon && <span className="mr-2">{titleIcon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

/**
 * 통계 카드 컴포넌트 - 대시보드 스타일
 */
interface StatsCardProps {
  value: string | number
  label: string
  color?: 'blue' | 'green' | 'purple' | 'emerald' | 'red' | 'yellow'
  className?: string
}

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
  }
  
  const [bgColor, borderColor, valueColor, labelColor] = colorStyles[color].split(' ')
  
  return (
    <div className={`text-center p-4 ${bgColor} rounded-lg border ${borderColor} ${className}`}>
      <div className={`text-3xl font-bold ${valueColor} mb-2`}>
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
interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  children
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <p className="text-gray-600 mb-4 text-lg">
        {title}
      </p>
      {description && (
        <p className="text-gray-500 mb-4">
          {description}
        </p>
      )}
      {action}
      {children}
    </div>
  )
}

/**
 * 로딩 상태 컴포넌트 - 대시보드 스타일
 */
interface LoadingCardProps {
  rows?: number
  className?: string
  children?: ReactNode
}

export function LoadingCard({ rows = 4, className = '', children }: LoadingCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse ${className}`}>
      <div className="h-6 bg-gray-200 rounded-lg w-32 mx-auto mb-4"></div>
      <div className={`grid grid-cols-2 md:grid-cols-${rows} gap-4`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}