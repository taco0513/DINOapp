'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // 초기 상태
    setIsOnline(navigator.onLine);

    // 오프라인일 때만 표시
    setShowIndicator(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // 온라인 복구 시 3초 후 숨김
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

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isOnline ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          isOnline ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className='h-4 w-4' />
            <span className='text-sm font-medium'>온라인 복구됨</span>
          </>
        ) : (
          <>
            <WifiOff className='h-4 w-4' />
            <span className='text-sm font-medium'>오프라인 모드</span>
          </>
        )}
      </div>
    </div>
  );
}
