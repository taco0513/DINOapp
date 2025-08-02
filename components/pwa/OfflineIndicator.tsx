/**
 * DINO v2.0 - Offline Indicator Component
 * Shows offline status and cached content availability
 */

'use client';

import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);
    setShowIndicator(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Keep showing for 3 seconds to notify user
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 text-center transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center space-x-2 text-sm font-medium">
        {isOnline ? (
          <>
            <span>✅</span>
            <span>다시 온라인 상태입니다</span>
          </>
        ) : (
          <>
            <span>📵</span>
            <span>오프라인 모드 - 캐시된 데이터 사용 중</span>
          </>
        )}
      </div>
    </div>
  );
}