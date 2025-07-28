interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`pb-8 mb-8 ${className}`}
      style={{
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 'var(--space-8)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='mb-4 sm:mb-0'>
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
          {description && (
            <p
              className='mt-2'
              style={{
                marginTop: 'var(--space-2)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className='flex-shrink-0'>{action}</div>}
      </div>
    </div>
  );
}
