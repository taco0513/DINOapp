'use client';

import React, { useRef, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

import { logger } from '@/lib/logger'

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Only start pull-to-refresh if we're at the top of the scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(touch.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === null || isRefreshing) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - startY;
    
    // Only handle downward pull
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff, threshold * 1.5));
    }
  }, [startY, threshold, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        
        await onRefresh();
      } catch (error) {
        logger.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setStartY(null);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const opacity = Math.min(pullDistance / threshold, 1);
  const scale = 0.8 + (0.2 * opacity);
  const rotation = pullDistance * 2;

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        className={`pull-indicator ${pullDistance > 0 || isRefreshing ? 'visible' : ''}`}
        style={{
          position: 'absolute',
          top: `${pullDistance - 60}px`,
          left: '50%',
          transform: `translateX(-50%)`,
          transition: isRefreshing ? 'none' : 'top 0.3s ease',
          zIndex: 10
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale}) rotate(${isRefreshing ? 0 : rotation}deg)`,
            transition: 'transform 0.2s ease'
          }}
        >
          <RefreshCw
            className={`h-8 w-8 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
      </div>
      
      <div
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
          transition: isRefreshing ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};