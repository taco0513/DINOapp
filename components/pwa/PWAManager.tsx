'use client';

import React, { useEffect, useState } from 'react';
import { 
  useInstallPrompt, 
  useOnlineStatus, 
  useServiceWorkerUpdate,
  registerServiceWorker,
  subscribeToPushNotifications,
  getCacheSize,
  clearAppCache,
  saveForOffline,
  getOfflineData
} from '@/lib/pwa/pwa-utils';
import { toast } from 'sonner';
import { Download, RefreshCw, Wifi, WifiOff, HardDrive, Bell, BellOff } from 'lucide-react';

interface PWAManagerProps {
  showInstallPrompt?: boolean;
  enableNotifications?: boolean;
  showOfflineIndicator?: boolean;
  showUpdateNotifications?: boolean;
}

export default function PWAManager({
  showInstallPrompt = true,
  enableNotifications = true,
  showOfflineIndicator = true,
  showUpdateNotifications = true
}: PWAManagerProps) {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const isOnline = useOnlineStatus();
  const { updateAvailable, updateApp, isUpdating } = useServiceWorkerUpdate();
  
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isRegistered, setIsRegistered] = useState(false);

  // Initialize PWA features
  useEffect(() => {
    const initPWA = async () => {
      // Register service worker
      const registration = await registerServiceWorker();
      if (registration) {
        setIsRegistered(true);
        
        // Subscribe to push notifications if enabled
        if (enableNotifications && 'Notification' in window) {
          setNotificationPermission(Notification.permission);
          if (Notification.permission === 'granted') {
            await subscribeToPushNotifications(registration);
          }
        }
      }

      // Get cache information
      const cache = await getCacheSize();
      setCacheInfo(cache);
    };

    initPWA();
  }, [enableNotifications]);

  // Show offline notification
  useEffect(() => {
    if (!isOnline && showOfflineIndicator) {
      toast.error('오프라인 상태입니다', {
        description: '인터넷 연결을 확인해주세요. 기본 기능은 오프라인에서도 사용 가능합니다.',
        duration: 5000,
        icon: <WifiOff className="w-4 h-4" />
      });
    } else if (isOnline && showOfflineIndicator) {
      toast.success('온라인 상태로 복구되었습니다', {
        description: '모든 기능을 정상적으로 사용할 수 있습니다.',
        duration: 3000,
        icon: <Wifi className="w-4 h-4" />
      });
    }
  }, [isOnline, showOfflineIndicator]);

  // Show update notification
  useEffect(() => {
    if (updateAvailable && showUpdateNotifications) {
      toast.info('앱 업데이트가 있습니다', {
        description: '새로운 기능과 개선사항이 포함되어 있습니다.',
        action: {
          label: '업데이트',
          onClick: () => updateApp()
        },
        duration: 10000,
        icon: <RefreshCw className="w-4 h-4" />
      });
    }
  }, [updateAvailable, showUpdateNotifications, updateApp]);

  // Show install prompt
  useEffect(() => {
    if (isInstallable && showInstallPrompt) {
      const timer = setTimeout(() => {
        toast.info('DINO 앱을 설치하세요', {
          description: '홈 화면에 추가하여 더 빠르고 편리하게 사용하세요.',
          action: {
            label: '설치',
            onClick: () => promptInstall()
          },
          duration: 8000,
          icon: <Download className="w-4 h-4" />
        });
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isInstallable, showInstallPrompt, promptInstall]);

  // Request notification permission
  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await subscribeToPushNotifications(registration);
          toast.success('알림이 활성화되었습니다', {
            description: '여행 알림과 앱 업데이트를 받을 수 있습니다.',
            icon: <Bell className="w-4 h-4" />
          });
        }
      } else {
        toast.error('알림 권한이 거부되었습니다', {
          description: '브라우저 설정에서 알림을 허용해주세요.',
          icon: <BellOff className="w-4 h-4" />
        });
      }
    }
  };

  // Clear app cache
  const handleClearCache = async () => {
    try {
      await clearAppCache();
      const newCacheInfo = await getCacheSize();
      setCacheInfo(newCacheInfo);
      
      toast.success('캐시가 정리되었습니다', {
        description: '앱 성능이 향상될 수 있습니다.',
        icon: <HardDrive className="w-4 h-4" />
      });
    } catch (error) {
      toast.error('캐시 정리 실패', {
        description: '다시 시도해주세요.',
      });
    }
  };

  return (
    <div className="pwa-manager">
      {/* PWA Status Indicator */}
      {isRegistered && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2">
            {/* Online/Offline indicator */}
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            
            {/* Update indicator */}
            {updateAvailable && (
              <button
                onClick={updateApp}
                disabled={isUpdating}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="앱 업데이트"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Install indicator */}
            {isInstallable && (
              <button
                onClick={promptInstall}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                title="앱 설치"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Notification indicator */}
            {enableNotifications && 'Notification' in window && (
              <button
                onClick={handleNotificationPermission}
                className={`p-1 transition-colors ${
                  notificationPermission === 'granted' 
                    ? 'text-green-600 hover:text-green-800' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="알림 설정"
              >
                {notificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Cache info */}
            {cacheInfo && (
              <button
                onClick={handleClearCache}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors text-xs"
                title={`캐시: ${cacheInfo.usageInMB}MB`}
              >
                <HardDrive className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for offline data management
export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    // Load offline queue from cache
    const loadOfflineQueue = async () => {
      const queue = await getOfflineData('sync-queue') || [];
      setOfflineQueue(queue);
    };

    loadOfflineQueue();
  }, []);

  useEffect(() => {
    // Process offline queue when online
    if (isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOnline, offlineQueue]);

  const addToOfflineQueue = async (action: any) => {
    const newQueue = [...offlineQueue, { ...action, timestamp: Date.now() }];
    setOfflineQueue(newQueue);
    await saveForOffline('sync-queue', newQueue);
  };

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    toast.info('오프라인 데이터 동기화 중...', {
      description: `${offlineQueue.length}개 항목을 처리하고 있습니다.`,
      duration: 3000
    });

    try {
      // Process each queued action
      for (const action of offlineQueue) {
        // Process the action based on type
        switch (action.type) {
          case 'CREATE_TRIP':
            await fetch('/api/trips', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            });
            break;
          case 'UPDATE_TRIP':
            await fetch(`/api/trips/${action.data.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            });
            break;
          // Add more action types as needed
        }
      }

      // Clear the queue
      setOfflineQueue([]);
      await saveForOffline('sync-queue', []);

      toast.success('오프라인 데이터 동기화 완료', {
        description: '모든 변경사항이 서버에 저장되었습니다.',
      });
    } catch (error) {
      toast.error('동기화 실패', {
        description: '네트워크 연결을 확인하고 다시 시도해주세요.',
      });
    }
  };

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
    processOfflineQueue
  };
}