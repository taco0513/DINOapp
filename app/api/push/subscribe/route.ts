import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const subscription = await request.json();

    // In production, save this subscription to database
    // For now, we'll just log it
    console.log('Push subscription received:', {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    // Here you would typically:
    // 1. Save the subscription to your database
    // 2. Associate it with the user
    // 3. Use it later to send push notifications

    return NextResponse.json({
      success: true,
      message: '푸시 알림 구독이 완료되었습니다',
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
