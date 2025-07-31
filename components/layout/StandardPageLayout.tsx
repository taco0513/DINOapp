'use client';

import { ReactNode } from 'react';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';

// Re-export for convenience
export { PageIcons };

interface StandardPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: keyof typeof PageIcons;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  headerActions?: ReactNode;
  className?: string;
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
    <div className={`min-h-screen bg-muted ${className}`}>
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-8'>
          {/* Page Header (if provided) */}
          {title && (
            <PageHeader
              title={title}
              description={description}
              icon={icon ? PageIcons[icon] : undefined}
              breadcrumbs={breadcrumbs}
            />
          )}

          {/* Header Actions (optional) */}
          {headerActions && (
            <div className='flex justify-end'>{headerActions}</div>
          )}

          {/* Main Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 표준 카드 컴포넌트 - 대시보드와 일관된 스타일
 */
interface StandardCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  titleIcon?: string;
}

export function StandardCard({
  children,
  title,
  className = '',
  titleIcon,
}: StandardCardProps) {
  return (
    <div
      className={`bg-card rounded-xl shadow-sm border border-border p-6 ${className}`}
    >
      {title && (
        <h2 className='text-xl font-bold text-foreground mb-6 text-center'>
          {titleIcon && <span className='mr-2'>{titleIcon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/**
 * 통계 카드 컴포넌트 - 대시보드 스타일
 */
interface StatsCardProps {
  value: string | number;
  label: string;
  color?: 'blue' | 'green' | 'purple' | 'emerald' | 'red' | 'yellow';
  className?: string;
}

export function StatsCard({
  value,
  label,
  color = 'blue',
  className = '',
}: StatsCardProps) {
  const colorStyles = {
    blue: 'bg-primary/10 border-primary/20 text-primary text-primary',
    green:
      'bg-secondary/10 border-secondary/20 text-secondary-foreground text-secondary-foreground',
    purple:
      'bg-accent/10 border-accent/20 text-accent-foreground text-accent-foreground',
    emerald: 'bg-muted border-border text-foreground text-foreground',
    red: 'bg-destructive/10 border-destructive/20 text-destructive text-destructive',
    yellow: 'bg-primary/5 border-primary/10 text-primary text-primary',
  };

  const [bgColor, borderColor, valueColor, labelColor] =
    colorStyles[color].split(' ');

  return (
    <div
      className={`text-center p-4 ${bgColor} rounded-lg border ${borderColor} ${className}`}
    >
      <div className={`text-3xl font-bold ${valueColor} mb-2`}>{value}</div>
      <div className={`text-sm font-medium ${labelColor}`}>{label}</div>
    </div>
  );
}

/**
 * 빈 상태 컴포넌트 - 대시보드 스타일
 */
interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className='w-20 h-20 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center mx-auto mb-4'>
        <span className='text-4xl'>{icon}</span>
      </div>
      <p className='text-muted-foreground mb-4 text-lg'>{title}</p>
      {description && (
        <p className='text-muted-foreground/70 mb-4'>{description}</p>
      )}
      {action}
    </div>
  );
}

/**
 * 로딩 상태 컴포넌트 - 대시보드 스타일
 */
interface LoadingCardProps {
  rows?: number;
  className?: string;
}

export function LoadingCard({ rows = 4, className = '' }: LoadingCardProps) {
  return (
    <div
      className={`bg-card p-6 rounded-xl shadow-sm border border-border animate-pulse ${className}`}
    >
      <div className='h-6 bg-muted rounded-lg w-32 mx-auto mb-4'></div>
      <div className={`grid grid-cols-2 md:grid-cols-${rows} gap-4`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className='p-4 bg-muted/50 rounded-lg'>
            <div className='h-8 bg-muted rounded w-16 mx-auto mb-2'></div>
            <div className='h-4 bg-muted rounded w-20 mx-auto'></div>
          </div>
        ))}
      </div>
    </div>
  );
}
