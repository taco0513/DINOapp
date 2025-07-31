import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Stripe 가격 ID 매핑 (실제 환경에서는 환경 변수로 관리)
const PRICE_IDS = {
  'pro-monthly':
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly_test',
  'pro-yearly':
    process.env.STRIPE_PRICE_ID_PRO_YEARLY || 'price_pro_yearly_test',
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    // 무료 플랜은 결제 불필요
    if (planId === 'free') {
      return NextResponse.json({
        success: true,
        message: '무료 플랜으로 변경되었습니다.',
      });
    }

    // 플랜 ID 유효성 검사
    if (!PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다.' },
        { status: 400 }
      );
    }

    // Stripe 미설정 시 모의 결제 페이지
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe 미설정 - 모의 결제 처리:', {
        planId,
        user: session.user.email,
        priceId: PRICE_IDS[planId as keyof typeof PRICE_IDS],
      });

      // 개발 환경에서는 성공 페이지로 바로 이동
      const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
      return NextResponse.json({
        url: `${baseUrl}/billing/success?plan=${planId}&mock=true`,
      });
    }

    // 실제 Stripe 구현
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: PRICE_IDS[planId as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/billing/cancel`,
      metadata: {
        userId: session.user.id || session.user.email,
        planId: planId,
      },
      subscription_data: {
        trial_period_days: 7, // 7일 무료 평가판
        metadata: {
          planId: planId,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('결제 페이지 생성 오류:', error);

    return NextResponse.json(
      {
        error: '결제 페이지 생성에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
