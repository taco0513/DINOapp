'use client';

import { ReactNode } from 'react';
import { ArrowLeft, HelpCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  showBackButton?: boolean;
  action?: React.ReactNode;
  className?: string;
  showHelp?: boolean;
  onHelpClick?: () => void;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  icon,
  showBackButton = false,
  action,
  className = '',
  showHelp = false,
  onHelpClick,
  breadcrumbs = [],
}: PageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className={`pb-6 mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          className='flex items-center space-x-2 text-sm mb-4'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className='flex items-center'>
              {index > 0 && <span className='mx-2'>/</span>}
              {crumb.href ? (
                <button
                  onClick={() => router.push(crumb.href!)}
                  className='hover:underline'
                  style={{ color: 'var(--color-primary)' }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-medium)',
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div
        className='border-b pb-6'
        style={{
          borderColor: 'var(--color-border)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
          <div className='mb-4 sm:mb-0 flex-1'>
            <div className='flex items-start space-x-4'>
              {/* Back Button */}
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className='mt-2 p-2 rounded-lg hover:bg-muted transition-colors'
                >
                  <ArrowLeft className='h-4 w-4' />
                </button>
              )}

              {/* Icon */}
              {icon && <div className='flex-shrink-0 mt-1'>{icon}</div>}

              {/* Title Section */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center space-x-3'>
                  <h1
                    className='text-3xl font-bold'
                    style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {title}
                  </h1>

                  {/* Help Button */}
                  {showHelp && onHelpClick && (
                    <button
                      onClick={onHelpClick}
                      className='p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground'
                    >
                      <HelpCircle className='h-4 w-4' />
                    </button>
                  )}
                </div>

                {/* Subtitle */}
                {subtitle && (
                  <p
                    className='mt-1'
                    style={{
                      marginTop: 'var(--space-1)',
                      fontSize: 'var(--text-lg)',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 'var(--font-medium)',
                    }}
                  >
                    {subtitle}
                  </p>
                )}

                {/* Description */}
                {description && (
                  <p
                    className='mt-2 max-w-2xl'
                    style={{
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {action && <div className='flex-shrink-0 ml-4'>{action}</div>}
        </div>
      </div>
    </div>
  );
}

// Named export for compatibility
export { PageHeader };

// 미리 정의된 페이지별 아이콘들
export const PageIcons = {
  Dashboard: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      🏠
    </div>
  ),
  Trips: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      ✈️
    </div>
  ),
  Schengen: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      🇪🇺
    </div>
  ),
  Calendar: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      📅
    </div>
  ),
  Gmail: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      📧
    </div>
  ),
  Analytics: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      📊
    </div>
  ),
  Monitoring: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      🖥️
    </div>
  ),
  AI: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      🤖
    </div>
  ),
  Settings: (
    <div className='w-8 h-8 bg-muted rounded-lg flex items-center justify-center'>
      <Settings className='h-4 w-4' />
    </div>
  ),
  Profile: (
    <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg'>
      👤
    </div>
  ),
};
