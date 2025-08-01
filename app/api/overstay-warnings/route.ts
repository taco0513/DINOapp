import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkOverstayWarnings, predictOverstayForTrip } from '@/lib/visa/overstay-checker';
import { z } from 'zod';
import { parseISO } from 'date-fns';

// GET /api/overstay-warnings - 현재 체류 초과 경고 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const checkDateParam = searchParams.get('date');
    const checkDate = checkDateParam ? parseISO(checkDateParam) : new Date();

    // 체류 초과 경고 확인
    const result = await checkOverstayWarnings(session.user.id, checkDate);

    // 경고가 있는 경우 알림 기록 생성 (중복 방지)
    if (result.warnings.length > 0 || result.schengenWarnings.length > 0) {
      const allWarnings = [...result.warnings, ...result.schengenWarnings];
      
      for (const warning of allWarnings) {
        if (warning.severity === 'critical' || warning.severity === 'high') {
          // 기존 알림 확인
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: session.user.id,
              type: 'overstay_warning',
              metadata: {
                path: ['warningId'],
                equals: warning.id
              }
            }
          });

          if (!existingNotification) {
            // 새 알림 생성
            await prisma.notification.create({
              data: {
                userId: session.user.id,
                type: 'overstay_warning',
                title: '체류 기간 경고',
                message: warning.message,
                priority: warning.severity === 'critical' ? 'high' : 'medium',
                metadata: {
                  warningId: warning.id,
                  visaId: warning.visaId,
                  countryName: warning.countryName,
                  severity: warning.severity,
                  daysRemaining: warning.daysRemaining
                },
                read: false,
                createdAt: new Date()
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error checking overstay warnings:', error);
    return NextResponse.json(
      { error: 'Failed to check overstay warnings' },
      { status: 500 }
    );
  }
}

// POST /api/overstay-warnings/predict - 여행 계획에 대한 체류 초과 예측
const PredictSchema = z.object({
  countryCode: z.string().length(2),
  entryDate: z.string().transform(date => parseISO(date)),
  exitDate: z.string().transform(date => parseISO(date))
});

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
    const tripPlan = PredictSchema.parse(body);

    // 체류 초과 예측
    const prediction = await predictOverstayForTrip(
      session.user.id,
      tripPlan
    );

    return NextResponse.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error predicting overstay:', error);
    return NextResponse.json(
      { error: 'Failed to predict overstay' },
      { status: 500 }
    );
  }
}

// DELETE /api/overstay-warnings/:id/dismiss - 경고 해제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const warningId = url.pathname.split('/').pop();

    if (!warningId || warningId === 'dismiss') {
      return NextResponse.json(
        { error: 'Warning ID is required' },
        { status: 400 }
      );
    }

    // 해당 경고와 관련된 알림을 읽음 처리
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        type: 'overstay_warning',
        metadata: {
          path: ['warningId'],
          equals: warningId
        }
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Warning dismissed'
    });

  } catch (error) {
    console.error('Error dismissing warning:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss warning' },
      { status: 500 }
    );
  }
}