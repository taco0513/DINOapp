'use client';

import { useEffect, useState } from 'react';

interface ActionSheetOption {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  destructive?: boolean;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  title,
  options,
}: MobileActionSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isAnimating && !isOpen) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* 액션 시트 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          zIndex: 1001,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition:
            'transform var(--transition-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          paddingBottom: 'env(safe-area-inset-bottom, var(--space-5))',
        }}
      >
        {/* 핸들 */}
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--color-border-strong)',
            borderRadius: 'var(--radius-sm)',
            margin: 'var(--space-3) auto var(--space-5) auto',
          }}
        />

        {/* 제목 */}
        {title && (
          <div
            style={{
              padding: '0 var(--space-5) var(--space-4) var(--space-5)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {title}
          </div>
        )}

        {/* 옵션들 */}
        <div>
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => {
                option.action();
                onClose();
              }}
              style={{
                width: '100%',
                padding: 'var(--space-4) var(--space-5)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom:
                  index < options.length - 1
                    ? '1px solid var(--color-border)'
                    : 'none',
                fontSize: 'var(--text-base)',
                color: option.destructive
                  ? 'var(--color-error)'
                  : 'var(--color-text-primary)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
              onTouchStart={e => {
                e.currentTarget.style.backgroundColor =
                  'var(--color-surface-hover)';
              }}
              onTouchEnd={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>

        {/* 취소 버튼 */}
        <div
          style={{ padding: 'var(--space-2) var(--space-5) 0 var(--space-5)' }}
        >
          <button
            onClick={onClose}
            className='btn btn-full'
            style={{
              padding: 'var(--space-4)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
            }}
            onTouchStart={e => {
              e.currentTarget.style.backgroundColor =
                'var(--color-surface-hover)';
            }}
            onTouchEnd={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-background)';
            }}
          >
            취소
          </button>
        </div>
      </div>
    </>
  );
}
