'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from './Breadcrumbs';
import { Icon, PageIconPresets } from '@/components/icons';
import type { PageHeaderProps, PageIconName } from '@/types/layout';

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
    <div className={className} style={{ paddingBottom: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
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
                  className='hover:bg-muted transition-colors'
                  style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius)' }}
                >
                  <Icon name="arrow-left" size="sm" />
                </button>
              )}

              {/* Icon */}
              {icon && (
                <div className='flex-shrink-0 mt-1'>
                  {typeof icon === 'string' && icon in PageIconPresets ? PageIconPresets[icon as PageIconName] : icon}
                </div>
              )}

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
                      className='hover:bg-muted transition-colors text-muted-foreground'
                      style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius)' }}
                    >
                      <Icon name="help-circle" size="sm" />
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
