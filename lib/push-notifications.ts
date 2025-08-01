// TODO: Remove unused logger import

// Web Push Notifications Management
import { toast } from 'sonner';

// VAPID public key (should be in environment variable)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Initialize service worker and get registration
  async initialize(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.info('Push notifications not supported');
      return null;
    }

    try {
      // Register service worker if not already registered
      this.registration = await navigator.serviceWorker.ready;
      console.info('Service worker ready');
      return this.registration;
    } catch (error) {
      console.error('Failed to initialize service worker:', error);
      return null;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      toast.error('브라우저가 알림을 지원하지 않습니다.');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success('알림이 활성화되었습니다.');
      } else if (permission === 'denied') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.');
      }
      
      return permission;
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast.error('알림 권한 요청에 실패했습니다.');
      return 'denied';
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('No service worker registration');
      return null;
    }

    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    try {
      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      // Extract subscription data
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      // Save subscription to server
      await this.saveSubscriptionToServer(subscriptionData);

      toast.success('푸시 알림이 구독되었습니다.');
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('푸시 알림 구독에 실패했습니다.');
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription.endpoint);
        toast.success('푸시 알림이 해제되었습니다.');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('푸시 알림 해제에 실패했습니다.');
      return false;
    }
  }

  // Check if currently subscribed
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }

  // Show local notification (for testing)
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (!this.registration) {
      // Fallback to regular notification
      new Notification(title, options);
      return;
    }

    // Use service worker to show notification
    await this.registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }

  // Save subscription to server
  private async saveSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Failed to save subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(endpoint: string): Promise<void> {
    try {
      const response = await fetch('/api/push-subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Utility: Convert URL-safe base64 to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Utility: Convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  }
}

// Singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();