import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pushNotificationService } from '@/lib/notifications/push-service';

/**
 * Subscribe to push notifications
 * POST /api/notifications/subscribe
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { subscription, preferences } = await request.json();

    // Validate subscription format
    if (!pushNotificationService.validateSubscription(subscription)) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image
      }
    });

    // Store subscription in database
    const pushSubscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint: subscription.endpoint
        }
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        preferences: preferences || {},
        isActive: true,
        lastUsed: new Date()
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        preferences: preferences || {
          visaExpiry: true,
          schengenWarning: true,
          tripReminders: true,
          emailProcessing: false,
          systemUpdates: false
        },
        isActive: true,
        lastUsed: new Date()
      }
    });

    // Send test notification if requested
    if (preferences?.sendTestNotification) {
      try {
        await pushNotificationService.testNotification(subscription);
      } catch (error) {
        console.warn('Test notification failed:', error);
        // Don't fail the subscription if test notification fails
      }
    }

    return NextResponse.json({
      success: true,
      subscriptionId: pushSubscription.id,
      message: 'Successfully subscribed to push notifications'
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}

/**
 * Update push notification preferences
 * PUT /api/notifications/subscribe
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { subscriptionId, preferences } = await request.json();

    if (!subscriptionId || !preferences) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or preferences' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update subscription preferences
    const updatedSubscription = await prisma.pushSubscription.update({
      where: {
        id: subscriptionId,
        userId: user.id
      },
      data: {
        preferences,
        lastUsed: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Notification preferences updated'
    });

  } catch (error) {
    console.error('Preference update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe from push notifications
 * DELETE /api/notifications/subscribe
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const endpoint = searchParams.get('endpoint');

    if (!subscriptionId && !endpoint) {
      return NextResponse.json(
        { error: 'Either subscriptionId or endpoint is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete subscription
    const whereClause = subscriptionId 
      ? { id: subscriptionId, userId: user.id }
      : { endpoint: endpoint!, userId: user.id };

    await prisma.pushSubscription.delete({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

/**
 * Get user's push subscriptions
 * GET /api/notifications/subscribe
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pushSubscriptions: {
          where: { isActive: true },
          select: {
            id: true,
            endpoint: true,
            preferences: true,
            createdAt: true,
            lastUsed: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptions: user.pushSubscriptions,
      count: user.pushSubscriptions.length
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}