import { NextRequest, NextResponse } from 'next/server';
import { notificationScheduler } from '@/lib/scheduled-jobs/notification-scheduler';

// This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, etc.)
// Or can be called manually for testing
export async function GET(request: NextRequest) {
  try {
    // Optional: Add security check for cron job authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Run scheduled notification checks
    await notificationScheduler.runScheduledChecks();
    
    return NextResponse.json({
      success: true,
      message: 'Notification checks completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in notification cron job:', error);
    return NextResponse.json(
      { error: 'Failed to run notification checks' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}