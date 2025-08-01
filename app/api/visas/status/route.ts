import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { differenceInDays, format, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

interface VisaStatusSummary {
  id: string;
  countryName: string;
  visaType: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'inactive';
  expiryDate: string;
  daysUntilExpiry: number;
  urgencyLevel: 'normal' | 'warning' | 'critical';
  alerts: string[];
  recommendations: string[];
  currentStay?: {
    isCurrentlyInCountry: boolean;
    entryDate?: string;
    daysInCountry?: number;
    maxStayDays?: number;
    remainingDays?: number;
  };
}

interface OverallVisaStatus {
  totalVisas: number;
  activeVisas: number;
  expiringVisas: number;
  expiredVisas: number;
  criticalAlerts: number;
  currentStays: number;
  nextExpiryDate?: string;
  nextExpiryCountry?: string;
  nextExpiryDays?: number;
}

// GET /api/visas/status - 실시간 비자 상태 확인
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date();

    // 사용자의 모든 비자 조회
    const userVisas = await prisma.userVisa.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        visaEntries: {
          where: {
            exitDate: null // 현재 체류 중인 기록
          },
          orderBy: {
            entryDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    const visaStatuses: VisaStatusSummary[] = [];
    let criticalAlerts = 0;
    let currentStays = 0;

    for (const visa of userVisas) {
      const daysUntilExpiry = differenceInDays(visa.expiryDate, today);
      
      // 상태 결정
      let status: 'active' | 'expiring_soon' | 'expired' | 'inactive' = 'active';
      let urgencyLevel: 'normal' | 'warning' | 'critical' = 'normal';
      
      if (daysUntilExpiry < 0) {
        status = 'expired';
        urgencyLevel = 'critical';
      } else if (daysUntilExpiry <= 7) {
        status = 'expiring_soon';
        urgencyLevel = 'critical';
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring_soon';
        urgencyLevel = 'warning';
      } else if (visa.status === 'inactive') {
        status = 'inactive';
      }

      // 알림 및 권장사항 생성
      const alerts: string[] = [];
      const recommendations: string[] = [];

      if (status === 'expired') {
        alerts.push(`🚨 만료됨: ${Math.abs(daysUntilExpiry)}일 전에 만료되었습니다`);
        recommendations.push('즉시 비자 갱신 또는 출국이 필요합니다');
        criticalAlerts++;
      } else if (urgencyLevel === 'critical') {
        alerts.push(`⚠️ 긴급: ${daysUntilExpiry}일 후 만료됩니다`);
        recommendations.push('즉시 갱신 절차를 시작하거나 출국 계획을 세우세요');
        criticalAlerts++;
      } else if (urgencyLevel === 'warning') {
        alerts.push(`📅 주의: ${daysUntilExpiry}일 후 만료됩니다`);
        recommendations.push('갱신 절차를 준비하거나 출국 계획을 검토하세요');
      }

      // 현재 체류 정보
      let currentStay;
      if (visa.visaEntries.length > 0) {
        const entry = visa.visaEntries[0];
        const daysInCountry = differenceInDays(today, entry.entryDate) + 1;
        const remainingDays = visa.maxStayDays ? visa.maxStayDays - daysInCountry : null;
        
        currentStay = {
          isCurrentlyInCountry: true,
          entryDate: format(entry.entryDate, 'yyyy-MM-dd'),
          daysInCountry,
          maxStayDays: visa.maxStayDays || undefined,
          remainingDays: remainingDays || undefined
        };
        
        currentStays++;

        // 체류 기간 초과 경고
        if (remainingDays !== null && remainingDays <= 0) {
          alerts.push(`🚨 체류 기간 초과: ${Math.abs(remainingDays)}일 초과`);
          recommendations.push('즉시 출국하거나 체류 연장 신청이 필요합니다');
          criticalAlerts++;
        } else if (remainingDays !== null && remainingDays <= 7) {
          alerts.push(`⚠️ 체류 기간 만료 임박: ${remainingDays}일 남음`);
          recommendations.push('출국 계획을 확정하거나 체류 연장을 신청하세요');
        }
      }

      visaStatuses.push({
        id: visa.id,
        countryName: visa.countryName,
        visaType: visa.visaType,
        status,
        expiryDate: format(visa.expiryDate, 'yyyy-MM-dd'),
        daysUntilExpiry,
        urgencyLevel,
        alerts,
        recommendations,
        currentStay
      });
    }

    // 전체 상태 요약
    const activeVisas = visaStatuses.filter(v => v.status === 'active').length;
    const expiringVisas = visaStatuses.filter(v => v.status === 'expiring_soon').length;
    const expiredVisas = visaStatuses.filter(v => v.status === 'expired').length;

    // 다음 만료 비자 찾기
    const nextExpiring = visaStatuses
      .filter(v => v.daysUntilExpiry >= 0)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];

    const overallStatus: OverallVisaStatus = {
      totalVisas: visaStatuses.length,
      activeVisas,
      expiringVisas,
      expiredVisas,
      criticalAlerts,
      currentStays,
      nextExpiryDate: nextExpiring?.expiryDate,
      nextExpiryCountry: nextExpiring?.countryName,
      nextExpiryDays: nextExpiring?.daysUntilExpiry
    };

    // 전체 시스템 권장사항
    const systemRecommendations: string[] = [];
    
    if (criticalAlerts > 0) {
      systemRecommendations.push(`🚨 ${criticalAlerts}개의 긴급 상황이 있습니다`);
    }
    
    if (currentStays > 0) {
      systemRecommendations.push(`📍 현재 ${currentStays}개국에서 체류 중입니다`);
    }
    
    if (expiringVisas > 0) {
      systemRecommendations.push(`⏰ ${expiringVisas}개의 비자가 곧 만료됩니다`);
    }
    
    if (nextExpiring && nextExpiring.daysUntilExpiry <= 60) {
      systemRecommendations.push(
        `📅 ${nextExpiring.countryName} 비자가 ${nextExpiring.daysUntilExpiry}일 후 가장 먼저 만료됩니다`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        visas: visaStatuses,
        overall: overallStatus,
        systemRecommendations,
        lastChecked: today.toISOString(),
        summary: {
          hasActiveCriticalAlerts: criticalAlerts > 0,
          hasCurrentStays: currentStays > 0,
          hasExpiringVisas: expiringVisas > 0,
          needsAttention: criticalAlerts > 0 || (expiringVisas > 0 && nextExpiring && nextExpiring.daysUntilExpiry <= 30)
        }
      }
    });

  } catch (error) {
    console.error('Error checking visa status:', error);
    return NextResponse.json(
      { error: 'Failed to check visa status' },
      { status: 500 }
    );
  }
}

// POST /api/visas/status - 특정 비자의 상태 업데이트
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { visaId, newStatus, notes } = await request.json();

    if (!visaId || !newStatus) {
      return NextResponse.json(
        { error: 'Visa ID and new status are required' },
        { status: 400 }
      );
    }

    // 비자 존재 확인
    const visa = await prisma.userVisa.findFirst({
      where: {
        id: visaId,
        userId: session.user.id
      }
    });

    if (!visa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    // 상태 업데이트
    const updatedVisa = await prisma.userVisa.update({
      where: { id: visaId },
      data: {
        status: newStatus,
        notes: notes || visa.notes,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        visaId: updatedVisa.id,
        newStatus: updatedVisa.status,
        updatedAt: updatedVisa.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating visa status:', error);
    return NextResponse.json(
      { error: 'Failed to update visa status' },
      { status: 500 }
    );
  }
}