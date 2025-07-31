import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import {
  checkVisaExpiry,
  checkSchengenWarnings,
  checkUpcomingTrips,
  DEFAULT_PREFERENCES,
} from '@/lib/notifications';
import type { NotificationPreferences } from '@/types/notification';
import { calculateSchengenStatus } from '@/lib/schengen-calculator';
import {
  createErrorResponse,
  ErrorCode,
  generateRequestId,
  handleApiError,
} from '@/lib/api/error-handler';

// GET /api/notifications - Get all notifications for authenticated user
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        countryVisits: {
          orderBy: { entryDate: 'desc' },
        },
      },
    });

    if (!user) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'User not found',
        undefined,
        requestId
      );
    }

    // Get user notification preferences (use defaults if not set)
    const preferences: NotificationPreferences = {
      ...DEFAULT_PREFERENCES,
      userId: user.id,
    };
    try {
      // TODO: Get from database when preferences table is implemented
      // For now, using defaults with userId
    } catch (error) {
      // Use defaults if no preferences found
    }

    const visits = user.countryVisits.map(visit => ({
      id: visit.id,
      userId: user.id,
      country: visit.country,
      entryDate: visit.entryDate.toISOString(),
      exitDate: visit.exitDate?.toISOString() || null,
      visaType: visit.visaType as any,
      maxDays: visit.maxDays,
      passportCountry: visit.passportCountry as any,
      notes: visit.notes || undefined,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
    }));

    // Generate all types of notifications
    const notifications: any[] = [];

    // Check visa expiry notifications
    notifications.push(...checkVisaExpiry(visits, preferences));

    // Check Schengen warnings
    const schengenStatus = calculateSchengenStatus(visits);
    notifications.push(...checkSchengenWarnings(schengenStatus, preferences));

    // Check upcoming trip reminders
    notifications.push(...checkUpcomingTrips(visits, preferences));

    // Add metadata and IDs
    const enrichedNotifications = notifications.map((notif, index) => ({
      id: `notif_${Date.now()}_${index}`,
      userId: user.id,
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: enrichedNotifications,
        unreadCount: enrichedNotifications.length,
        preferences,
      },
    });
  } catch (error) {
    console.error('[API] Notifications error:', error);
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

// POST /api/notifications/mark-read - Mark notification as read
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return createErrorResponse(
        ErrorCode.BAD_REQUEST,
        'Notification ID required',
        undefined,
        requestId
      );
    }

    // TODO: Implement mark as read when notifications table is added
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('[API] Mark notification read error:', error);
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}
