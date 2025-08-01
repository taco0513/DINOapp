import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays, differenceInDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

// TODO: Remove unused logger import

interface VisaExpiryCheck {
  id: string;
  countryName: string;
  visaType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'active' | 'expiring_soon' | 'expired';
  urgencyLevel: 'normal' | 'warning' | 'critical';
  alertMessage: string;
}

// GET /api/visas/check-expiry - 사용자의 모든 비자 만료 상태 확인
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 사용자의 모든 활성 비자 조회
    const userVisas = await prisma.userVisa.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['active', 'expiring_soon']
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    const today = new Date();
    const expiryChecks: VisaExpiryCheck[] = [];
    const updates: Promise<any>[] = [];

    for (const visa of userVisas) {
      const daysUntilExpiry = differenceInDays(visa.expiryDate, today);
      
      let status: 'active' | 'expiring_soon' | 'expired' = 'active';
      let urgencyLevel: 'normal' | 'warning' | 'critical' = 'normal';
      let alertMessage = '';

      // 만료 상태 결정
      if (daysUntilExpiry < 0) {
        status = 'expired';
        urgencyLevel = 'critical';
        alertMessage = `${visa.countryName} ${visa.visaType} 비자가 ${Math.abs(daysUntilExpiry)}일 전에 만료되었습니다.`;
      } else if (daysUntilExpiry <= 7) {
        status = 'expiring_soon';
        urgencyLevel = 'critical';
        alertMessage = `🚨 긴급: ${visa.countryName} ${visa.visaType} 비자가 ${daysUntilExpiry}일 후 만료됩니다!`;
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring_soon';
        urgencyLevel = 'warning';
        alertMessage = `⚠️ 주의: ${visa.countryName} ${visa.visaType} 비자가 ${daysUntilExpiry}일 후 만료됩니다.`;
      } else {
        alertMessage = `${visa.countryName} ${visa.visaType} 비자는 ${daysUntilExpiry}일 후 만료됩니다.`;
      }

      expiryChecks.push({
        id: visa.id,
        countryName: visa.countryName,
        visaType: visa.visaType,
        expiryDate: format(visa.expiryDate, 'yyyy-MM-dd'),
        daysUntilExpiry,
        status,
        urgencyLevel,
        alertMessage
      });

      // 비자 상태가 변경된 경우 DB 업데이트
      if (visa.status !== status) {
        updates.push(
          prisma.userVisa.update({
            where: { id: visa.id },
            data: { 
              status,
              lastAlertSent: urgencyLevel === 'critical' ? today : visa.lastAlertSent
            }
          })
        );
      }
    }

    // 상태 변경사항 일괄 적용
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // 통계 계산
    const stats = {
      total: expiryChecks.length,
      active: expiryChecks.filter(v => v.status === 'active').length,
      expiring_soon: expiryChecks.filter(v => v.status === 'expiring_soon').length,
      expired: expiryChecks.filter(v => v.status === 'expired').length,
      critical_alerts: expiryChecks.filter(v => v.urgencyLevel === 'critical').length,
      warning_alerts: expiryChecks.filter(v => v.urgencyLevel === 'warning').length
    };

    return NextResponse.json({
      success: true,
      data: {
        visas: expiryChecks,
        stats,
        lastChecked: today.toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking visa expiry:', error);
    return NextResponse.json(
      { error: 'Failed to check visa expiry' },
      { status: 500 }
    );
  }
}

// POST /api/visas/check-expiry - 특정 비자의 만료 알림 발송
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { visaId, forceAlert } = await request.json();

    if (!visaId) {
      return NextResponse.json(
        { error: 'Visa ID is required' },
        { status: 400 }
      );
    }

    // 비자 정보 조회
    const userVisa = await prisma.userVisa.findFirst({
      where: {
        id: visaId,
        userId: session.user.id
      }
    });

    if (!userVisa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    const today = new Date();
    const daysUntilExpiry = differenceInDays(userVisa.expiryDate, today);

    // 중복 알림 방지 (24시간 내 알림 발송 시 스킵)
    if (!forceAlert && userVisa.lastAlertSent) {
      const hoursSinceLastAlert = (today.getTime() - userVisa.lastAlertSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAlert < 24) {
        return NextResponse.json({
          success: false,
          message: '24시간 내에 이미 알림이 발송되었습니다.',
          lastAlertSent: userVisa.lastAlertSent
        });
      }
    }

    // 알림 메시지 생성
    let alertMessage = '';
    let alertType = 'info';

    if (daysUntilExpiry < 0) {
      alertMessage = `🚨 만료됨: ${userVisa.countryName} ${userVisa.visaType} 비자가 ${Math.abs(daysUntilExpiry)}일 전에 만료되었습니다. 즉시 갱신이 필요합니다!`;
      alertType = 'error';
    } else if (daysUntilExpiry <= 3) {
      alertMessage = `🚨 긴급: ${userVisa.countryName} ${userVisa.visaType} 비자가 ${daysUntilExpiry}일 후 만료됩니다! 즉시 조치가 필요합니다.`;
      alertType = 'error';
    } else if (daysUntilExpiry <= 7) {
      alertMessage = `⚠️ 경고: ${userVisa.countryName} ${userVisa.visaType} 비자가 ${daysUntilExpiry}일 후 만료됩니다. 갱신을 준비하세요.`;
      alertType = 'warning';
    } else if (daysUntilExpiry <= 30) {
      alertMessage = `📅 알림: ${userVisa.countryName} ${userVisa.visaType} 비자가 ${daysUntilExpiry}일 후 만료됩니다. 갱신 계획을 세우세요.`;
      alertType = 'info';
    } else {
      alertMessage = `✅ 안전: ${userVisa.countryName} ${userVisa.visaType} 비자는 ${daysUntilExpiry}일 후 만료됩니다.`;
      alertType = 'success';
    }

    // 마지막 알림 발송 시간 업데이트
    await prisma.userVisa.update({
      where: { id: visaId },
      data: { lastAlertSent: today }
    });

    return NextResponse.json({
      success: true,
      data: {
        visaId,
        countryName: userVisa.countryName,
        visaType: userVisa.visaType,
        expiryDate: format(userVisa.expiryDate, 'yyyy-MM-dd'),
        daysUntilExpiry,
        alertMessage,
        alertType,
        alertSent: today.toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending visa alert:', error);
    return NextResponse.json(
      { error: 'Failed to send visa alert' },
      { status: 500 }
    );
  }
}