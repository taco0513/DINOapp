import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// TODO: Remove unused logger import

// Configure web-push with VAPID details
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@dino.app'
};

// Initialize web-push
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Send push notification to a specific user
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Get user's active push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      if (subscriptions.length === 0) {
        console.info('No active push subscriptions found for user ${userId}');
        return false;
      }

      // Check user's notification preferences
      const notificationSettings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      if (!notificationSettings?.pushEnabled) {
        console.info('Push notifications disabled for user ${userId}');
        return false;
      }

      // Check quiet hours
      if (this.isInQuietHours(notificationSettings)) {
        console.info('User ${userId} is in quiet hours');
        return false;
      }

      // Send to all user's subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      );

      // Log notification
      await this.logNotification(userId, payload);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.info('Sent push notification to ${successCount}/${subscriptions.length} devices for user ${userId}');

      return successCount > 0;
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      return false;
    }
  }

  // Send notification to a specific subscription
  private async sendNotification(
    subscription: any,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      console.info('Push notification sent to ${subscription.endpoint}');
    } catch (error: any) {
      console.error('Failed to send push notification to ${subscription.endpoint}:', error);

      // Handle subscription errors
      if (error.statusCode === 410) {
        // Subscription expired, remove it
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { isActive: false }
        });
      }

      throw error;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      const success = await this.sendToUser(userId, payload);
      if (success) successCount++;
    }

    return successCount;
  }

  // Send visa expiry notification
  async sendVisaExpiryNotification(userId: string, visa: any, daysUntilExpiry: number): Promise<boolean> {
    const payload: PushNotificationPayload = {
      title: '비자 만료 알림',
      body: `${visa.countryName} 비자가 ${daysUntilExpiry}일 후 만료됩니다.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `visa-expiry-${visa.id}`,
      data: {
        type: 'visa_expiry',
        visaId: visa.id,
        countryName: visa.countryName,
        expiryDate: visa.expiryDate,
        daysUntilExpiry
      }
    };

    return this.sendToUser(userId, payload);
  }

  // Send overstay warning notification
  async sendOverstayWarning(userId: string, warning: any): Promise<boolean> {
    const payload: PushNotificationPayload = {
      title: '체류 기간 경고',
      body: warning.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `overstay-${warning.id}`,
      data: {
        type: 'overstay_warning',
        warningId: warning.id,
        countryName: warning.countryName,
        severity: warning.severity,
        daysRemaining: warning.daysRemaining
      }
    };

    return this.sendToUser(userId, payload);
  }

  // Send stay reminder notification
  async sendStayReminder(userId: string, countryName: string): Promise<boolean> {
    const payload: PushNotificationPayload = {
      title: '체류 기록 업데이트',
      body: `${countryName}에서의 체류 기록을 업데이트해주세요.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'stay-reminder',
      data: {
        type: 'stay_reminder',
        countryName
      }
    };

    return this.sendToUser(userId, payload);
  }

  // Check if current time is in user's quiet hours
  private isInQuietHours(settings: any): boolean {
    if (!settings.quietHoursStart || !settings.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: settings.timezone }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Normal case: quiet hours don't cross midnight
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // Log notification in database
  private async logNotification(userId: string, payload: PushNotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: payload.data?.type || 'general',
          title: payload.title,
          message: payload.body,
          priority: payload.data?.severity === 'critical' ? 'high' : 
                   payload.data?.severity === 'high' ? 'high' : 'medium',
          metadata: payload.data || {},
          pushedAt: new Date(),
          read: false,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }
}

// Singleton instance
export const pushNotificationService = PushNotificationService.getInstance();