/**
 * DINO v2.0 - Notification Service
 * Handle visa expiry and travel notifications
 */

import { prisma } from '@/lib/prisma';
import type { Notification } from '@prisma/client';
// import type { User, Visa, Trip } from '@prisma/client';

interface NotificationPayload {
  readonly userId: string;
  readonly type: 'visa_expiry' | 'schengen_warning' | 'trip_reminder' | 'passport_expiry';
  readonly title: string;
  readonly message: string;
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
  readonly actionUrl?: string;
  readonly metadata?: Record<string, unknown>;
  readonly scheduledFor?: Date;
}

/**
 * Create a notification
 */
export async function createNotification(payload: NotificationPayload): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      priority: payload.priority || 'medium',
      actionUrl: payload.actionUrl,
      metadata: payload.metadata || {},
      scheduledFor: payload.scheduledFor,
    },
  });
}

/**
 * Check and create visa expiry notifications
 */
export async function checkVisaExpiryNotifications(userId: string): Promise<void> {
  // Get user's active visas
  const visas = await prisma.visa.findMany({
    where: {
      userId,
      status: 'active',
      expiryDate: {
        gte: new Date(),
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const visa of visas) {
    const daysUntilExpiry = Math.ceil(
      (visa.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if notification already exists for this visa
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'visa_expiry',
        metadata: {
          path: ['visaId'],
          equals: visa.id,
        },
        createdAt: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (existingNotification) continue;

    // Create notifications based on days until expiry
    let notification: NotificationPayload | null = null;

    if (daysUntilExpiry === 90) {
      notification = {
        userId,
        type: 'visa_expiry',
        title: `${visa.countryName} 비자 만료 90일 전`,
        message: `${visa.countryName} ${visa.visaType} 비자가 90일 후 만료됩니다.`,
        priority: 'low',
        actionUrl: '/visa',
        metadata: { visaId: visa.id, country: visa.country, daysRemaining: 90 },
      };
    } else if (daysUntilExpiry === 60) {
      notification = {
        userId,
        type: 'visa_expiry',
        title: `${visa.countryName} 비자 만료 60일 전`,
        message: `${visa.countryName} ${visa.visaType} 비자가 60일 후 만료됩니다. 갱신을 준비하세요.`,
        priority: 'medium',
        actionUrl: '/visa',
        metadata: { visaId: visa.id, country: visa.country, daysRemaining: 60 },
      };
    } else if (daysUntilExpiry === 30) {
      notification = {
        userId,
        type: 'visa_expiry',
        title: `${visa.countryName} 비자 만료 30일 전`,
        message: `${visa.countryName} ${visa.visaType} 비자가 30일 후 만료됩니다. 즉시 갱신 절차를 시작하세요.`,
        priority: 'high',
        actionUrl: '/visa',
        metadata: { visaId: visa.id, country: visa.country, daysRemaining: 30 },
      };
    } else if (daysUntilExpiry === 14) {
      notification = {
        userId,
        type: 'visa_expiry',
        title: `⚠️ ${visa.countryName} 비자 만료 2주 전`,
        message: `${visa.countryName} ${visa.visaType} 비자가 14일 후 만료됩니다. 긴급히 조치가 필요합니다.`,
        priority: 'urgent',
        actionUrl: '/visa',
        metadata: { visaId: visa.id, country: visa.country, daysRemaining: 14 },
      };
    } else if (daysUntilExpiry === 7) {
      notification = {
        userId,
        type: 'visa_expiry',
        title: `🚨 ${visa.countryName} 비자 만료 1주 전`,
        message: `${visa.countryName} ${visa.visaType} 비자가 7일 후 만료됩니다. 즉시 행동하세요!`,
        priority: 'urgent',
        actionUrl: '/visa',
        metadata: { visaId: visa.id, country: visa.country, daysRemaining: 7 },
      };
    }

    if (notification) {
      await createNotification(notification);
    }
  }
}

/**
 * Check and create Schengen warning notifications
 */
export async function checkSchengenNotifications(userId: string): Promise<void> {
  const { calculateSchengenDays } = await import('@/lib/schengen/calculator');
  
  // Get user's recent trips
  const trips = await prisma.trip.findMany({
    where: {
      userId,
      entryDate: {
        gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { entryDate: 'desc' },
  });

  const schengenDays = calculateSchengenDays(trips);
  const remainingDays = 90 - schengenDays;

  // Check if notification already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingNotification = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'schengen_warning',
      createdAt: {
        gte: today,
      },
    },
  });

  if (existingNotification) return;

  let notification: NotificationPayload | null = null;

  if (schengenDays >= 90) {
    notification = {
      userId,
      type: 'schengen_warning',
      title: '🚨 셰겐 체류 한도 초과!',
      message: `현재 180일 중 ${schengenDays}일을 사용했습니다. 즉시 출국이 필요합니다!`,
      priority: 'urgent',
      actionUrl: '/schengen',
      metadata: { daysUsed: schengenDays, daysRemaining: 0 },
    };
  } else if (remainingDays <= 7) {
    notification = {
      userId,
      type: 'schengen_warning',
      title: '⚠️ 셰겐 체류 한도 임박',
      message: `셰겐 지역 체류 가능일이 ${remainingDays}일 남았습니다. 출국 계획을 세우세요.`,
      priority: 'high',
      actionUrl: '/schengen',
      metadata: { daysUsed: schengenDays, daysRemaining: remainingDays },
    };
  } else if (remainingDays <= 14) {
    notification = {
      userId,
      type: 'schengen_warning',
      title: '셰겐 체류 일수 주의',
      message: `셰겐 지역 체류 가능일이 ${remainingDays}일 남았습니다.`,
      priority: 'medium',
      actionUrl: '/schengen',
      metadata: { daysUsed: schengenDays, daysRemaining: remainingDays },
    };
  }

  if (notification) {
    await createNotification(notification);
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 10,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Run daily notification checks for all users
 */
export async function runDailyNotificationChecks(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  for (const user of users) {
    await checkVisaExpiryNotifications(user.id);
    await checkSchengenNotifications(user.id);
  }
}