import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// TODO: Remove unused logger import

// Validation schema
const PreferencesSchema = z.object({
  visaExpiry: z.boolean().optional(),
  overstayWarning: z.boolean().optional(),
  stayReminder: z.boolean().optional(),
  travelAlerts: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional()
});

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          visaExpiryDays: '7,14,30',
          schengenWarningDays: 10,
          travelAlerts: true,
          budgetAlerts: false,
          documentReminders: true,
          emailEnabled: true,
          pushEnabled: false,
          smsEnabled: false,
          timezone: session.user.timezone || 'UTC'
        }
      });
    }

    // Transform to response format
    const response = {
      visaExpiry: true, // Always enabled if visaExpiryDays is set
      overstayWarning: settings.schengenWarningDays > 0,
      stayReminder: settings.documentReminders,
      travelAlerts: settings.travelAlerts,
      emailEnabled: settings.emailEnabled,
      pushEnabled: settings.pushEnabled,
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
      visaExpiryDays: settings.visaExpiryDays.split(',').map(d => parseInt(d)),
      schengenWarningDays: settings.schengenWarningDays
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const preferences = PreferencesSchema.parse(body);

    // Update notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        schengenWarningDays: preferences.overstayWarning !== false ? 10 : 0,
        travelAlerts: preferences.travelAlerts ?? true,
        documentReminders: preferences.stayReminder ?? false,
        emailEnabled: preferences.emailEnabled ?? true,
        pushEnabled: preferences.pushEnabled ?? false,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        visaExpiryDays: '7,14,30',
        schengenWarningDays: preferences.overstayWarning !== false ? 10 : 0,
        travelAlerts: preferences.travelAlerts ?? true,
        budgetAlerts: false,
        documentReminders: preferences.stayReminder ?? false,
        emailEnabled: preferences.emailEnabled ?? true,
        pushEnabled: preferences.pushEnabled ?? false,
        smsEnabled: false,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        timezone: session.user.timezone || 'UTC'
      }
    });

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}