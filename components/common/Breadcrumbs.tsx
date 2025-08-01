'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`flex items-center ${className}`}
      style={{ 
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)' 
      }}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <Icon 
              name="chevron-right"
              size="sm"
              className="mx-2" 
              color="var(--color-text-secondary)"
            />
          )}
          {item.href ? (
            <button
              onClick={() => router.push(item.href!)}
              className="hover:underline transition-colors"
              style={{ 
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              {item.label}
            </button>
          ) : (
            <span
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: '500'
              }}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}