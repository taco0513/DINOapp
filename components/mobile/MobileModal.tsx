'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const modalY = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Focus trap
      modalRef.current?.focus();

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // Only allow downward swipe
    if (diff > 0 && modalRef.current) {
      modalY.current = diff;
      modalRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === null || currentY.current === null) return;

    const diff = currentY.current - startY.current;

    // Close modal if swiped down more than 100px
    if (diff > 100) {
      onClose();
    } else if (modalRef.current) {
      // Snap back
      modalRef.current.style.transform = 'translateY(0)';
    }

    startY.current = null;
    currentY.current = null;
    modalY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 z-40 transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`mobile-modal open ${className}`}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className='mobile-modal-handle' aria-hidden='true' />

        {/* Header */}
        {title && (
          <div className='flex items-center justify-between mb-4'>
            <h2 id='modal-title' className='text-lg font-semibold'>
              {title}
            </h2>
            <button
              onClick={onClose}
              className='p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors'
              aria-label='닫기'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        )}

        {/* Content */}
        <div className='overflow-y-auto'>{children}</div>
      </div>
    </>
  );
};
