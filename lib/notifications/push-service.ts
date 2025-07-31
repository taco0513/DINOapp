/**
 * Push Notification Service for DINO App
 * Handles push notification subscriptions, delivery, and management
 */

import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@dinoapp.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationContext {
  userId: string;
  type:
    | 'visa_expiry'
    | 'schengen_warning'
    | 'trip_reminder'
    | 'system_update'
    | 'email_processed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

/**
 * Push Notification Service
 */
export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Send push notification to a single subscription
   */
  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload,
    options?: {
      TTL?: number;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      topic?: string;
    }
  ): Promise<void> {
    try {
      const notificationPayload = JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || Date.now(),
        data: {
          ...payload.data,
          url: payload.data?.url || '/',
          openUrl: payload.data?.openUrl || '/',
        },
      });

      const pushOptions = {
        TTL: options?.TTL || 24 * 60 * 60, // 24 hours default
        urgency: options?.urgency || 'normal',
        topic: options?.topic,
      };

      await webpush.sendNotification(
        subscription,
        notificationPayload,
        pushOptions
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple subscriptions
   */
  async sendBulkNotifications(
    subscriptions: PushSubscription[],
    payload: NotificationPayload,
    options?: {
      TTL?: number;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      topic?: string;
      batchSize?: number;
    }
  ): Promise<{ success: number; failed: number; errors: Error[] }> {
    const batchSize = options?.batchSize || 100;
    const results = { success: 0, failed: 0, errors: [] as Error[] };

    // Process in batches to avoid overwhelming the service
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);

      const promises = batch.map(async subscription => {
        try {
          await this.sendNotification(subscription, payload, options);
          return { success: true };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      });

      const batchResults = await Promise.allSettled(promises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(result.value.error);
          }
        } else {
          results.failed++;
          results.errors.push(new Error(result.reason));
        }
      });

      // Add delay between batches to prevent rate limiting
      if (i + batchSize < subscriptions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Create notification payload for different types
   */
  createNotificationPayload(
    type: NotificationContext['type'],
    context: NotificationContext
  ): NotificationPayload {
    const basePayload = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      timestamp: Date.now(),
      requireInteraction: context.priority === 'critical',
      data: {
        type,
        userId: context.userId,
        priority: context.priority,
        ...context.metadata,
      },
    };

    switch (type) {
      case 'visa_expiry':
        return {
          ...basePayload,
          title: '🛂 비자 만료 알림',
          body: `${context.metadata?.countryName} 비자가 ${context.metadata?.daysUntilExpiry}일 후 만료됩니다.`,
          tag: 'visa-expiry',
          data: {
            ...basePayload.data,
            openUrl: `/visa/${context.metadata?.countryCode}`,
            countryCode: context.metadata?.countryCode,
          },
          actions: [
            {
              action: 'view-visa',
              title: '비자 정보 보기',
            },
            {
              action: 'extend-visa',
              title: '연장 신청',
            },
          ],
        };

      case 'schengen_warning':
        return {
          ...basePayload,
          title: '⚠️ 셰겐 규정 경고',
          body: `셰겐 체류 한도에 접근했습니다. ${context.metadata?.daysRemaining}일 남았습니다.`,
          tag: 'schengen-warning',
          requireInteraction: true,
          data: {
            ...basePayload.data,
            openUrl: '/schengen',
            daysRemaining: context.metadata?.daysRemaining,
          },
          actions: [
            {
              action: 'view-schengen',
              title: '계산기 확인',
            },
            {
              action: 'plan-exit',
              title: '출국 계획',
            },
          ],
        };

      case 'trip_reminder':
        return {
          ...basePayload,
          title: '✈️ 여행 알림',
          body: `${context.metadata?.destination}행 여행이 ${context.metadata?.daysUntilTrip}일 남았습니다.`,
          tag: 'trip-reminder',
          data: {
            ...basePayload.data,
            openUrl: `/trips/${context.metadata?.tripId}`,
            tripId: context.metadata?.tripId,
          },
          actions: [
            {
              action: 'view-trip',
              title: '여행 상세보기',
            },
            {
              action: 'check-documents',
              title: '서류 확인',
            },
          ],
        };

      case 'email_processed':
        return {
          ...basePayload,
          title: '📧 이메일 처리 완료',
          body: `${context.metadata?.emailCount}개의 여행 관련 이메일이 처리되었습니다.`,
          tag: 'email-processed',
          silent: context.priority === 'low',
          data: {
            ...basePayload.data,
            openUrl: '/dashboard',
            emailCount: context.metadata?.emailCount,
          },
          actions: [
            {
              action: 'view-dashboard',
              title: '대시보드 보기',
            },
          ],
        };

      case 'system_update':
        return {
          ...basePayload,
          title: '🔄 시스템 업데이트',
          body: context.metadata?.message || '새로운 기능이 추가되었습니다.',
          tag: 'system-update',
          silent: true,
          data: {
            ...basePayload.data,
            openUrl: '/updates',
            version: context.metadata?.version,
          },
        };

      default:
        return {
          ...basePayload,
          title: 'DINO 알림',
          body: '새로운 알림이 있습니다.',
          tag: 'general',
        };
    }
  }

  /**
   * Schedule notification for future delivery
   */
  async scheduleNotification(
    subscription: PushSubscription,
    payload: NotificationPayload,
    scheduledFor: Date,
    context: NotificationContext
  ): Promise<void> {
    const delay = scheduledFor.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately if scheduled time has passed
      await this.sendNotification(subscription, payload);
      return;
    }

    // Use setTimeout for delays up to 24 hours, otherwise use a job queue
    if (delay <= 24 * 60 * 60 * 1000) {
      setTimeout(async () => {
        try {
          await this.sendNotification(subscription, payload);
        } catch (error) {
          console.error('Scheduled notification failed:', error);
        }
      }, delay);
    } else {
      // For longer delays, store in database and use a cron job
      // This would require a database table for scheduled notifications
      throw new Error(
        'Long-term scheduling not implemented. Use a job queue system.'
      );
    }
  }

  /**
   * Validate push subscription
   */
  validateSubscription(subscription: any): subscription is PushSubscription {
    return (
      subscription &&
      typeof subscription.endpoint === 'string' &&
      subscription.keys &&
      typeof subscription.keys.p256dh === 'string' &&
      typeof subscription.keys.auth === 'string'
    );
  }

  /**
   * Test notification functionality
   */
  async testNotification(subscription: PushSubscription): Promise<void> {
    const testPayload: NotificationPayload = {
      title: '🧪 DINO 테스트 알림',
      body: '푸시 알림이 정상적으로 작동합니다!',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification',
      data: {
        test: true,
        timestamp: Date.now(),
      },
    };

    await this.sendNotification(subscription, testPayload, {
      TTL: 60, // 1 minute TTL for test notifications
      urgency: 'normal',
    });
  }
}

/**
 * Notification Template Builder
 */
export class NotificationTemplates {
  static visaExpiry(
    countryName: string,
    daysUntilExpiry: number,
    countryCode: string
  ): NotificationContext {
    return {
      userId: '', // Will be set by the caller
      type: 'visa_expiry',
      priority:
        daysUntilExpiry <= 7
          ? 'critical'
          : daysUntilExpiry <= 30
            ? 'high'
            : 'normal',
      metadata: {
        countryName,
        daysUntilExpiry,
        countryCode,
      },
    };
  }

  static schengenWarning(
    daysRemaining: number,
    totalDaysUsed: number
  ): NotificationContext {
    return {
      userId: '', // Will be set by the caller
      type: 'schengen_warning',
      priority:
        daysRemaining <= 7
          ? 'critical'
          : daysRemaining <= 14
            ? 'high'
            : 'normal',
      metadata: {
        daysRemaining,
        totalDaysUsed,
        warningLevel:
          daysRemaining <= 7
            ? 'critical'
            : daysRemaining <= 14
              ? 'warning'
              : 'info',
      },
    };
  }

  static tripReminder(
    destination: string,
    daysUntilTrip: number,
    tripId: string
  ): NotificationContext {
    return {
      userId: '', // Will be set by the caller
      type: 'trip_reminder',
      priority: 'normal',
      metadata: {
        destination,
        daysUntilTrip,
        tripId,
      },
    };
  }

  static emailProcessed(
    emailCount: number,
    newTripsFound: number
  ): NotificationContext {
    return {
      userId: '', // Will be set by the caller
      type: 'email_processed',
      priority: newTripsFound > 0 ? 'normal' : 'low',
      metadata: {
        emailCount,
        newTripsFound,
      },
    };
  }

  static systemUpdate(message: string, version?: string): NotificationContext {
    return {
      userId: '', // Will be set by the caller
      type: 'system_update',
      priority: 'low',
      metadata: {
        message,
        version,
      },
    };
  }
}

// Export singleton instance
export const _pushNotificationService = PushNotificationService.getInstance();
