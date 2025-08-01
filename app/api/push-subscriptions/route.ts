import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

// Validation schemas
const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

const UnsubscribeSchema = z.object({
  endpoint: z.string().url()
});

// POST /api/push-subscriptions - Save push subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const subscription = SubscriptionSchema.parse(body);

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: {
        endpoint: subscription.endpoint
      }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: {
          endpoint: subscription.endpoint
        },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: request.headers.get('user-agent') || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/push-subscriptions - Remove push subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint } = UnsubscribeSchema.parse(body);

    // Delete subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove push subscription' },
      { status: 500 }
    );
  }
}

// GET /api/push-subscriptions - Get user's push subscriptions
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    logger.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch push subscriptions' },
      { status: 500 }
    );
  }
}