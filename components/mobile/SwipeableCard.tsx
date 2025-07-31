'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || startX === null) return;

    setCurrentX(clientX);
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging || startX === null || currentX === null) return;

    const diff = currentX - startX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset
    setStartX(null);
    setCurrentX(null);
    setTranslateX(0);
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events for testing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  return (
    <div
      ref={cardRef}
      className={`swipe-item ${className}`}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};
