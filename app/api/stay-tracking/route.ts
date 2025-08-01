import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { differenceInDays, format, parseISO, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

// TODO: Remove unused logger import

// Validation schemas
const CreateStaySchema = z.object({
  visaId: z.string(),
  entryDate: z.string().transform(date => parseISO(date)),
  purpose: z.string().optional(),
  expectedExitDate: z.string().transform(date => parseISO(date)).optional(),
  notes: z.string().optional(),
});

const UpdateStaySchema = z.object({
  visaEntryId: z.string(),
  exitDate: z.string().transform(date => parseISO(date)).optional(),
  actualStayDays: z.number().optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
});

interface CurrentStay {
  id: string;
  visaId: string;
  countryName: string;
  visaType: string;
  entryDate: string;
  daysInCountry: number;
  maxStayDays: number | null;
  remainingDays: number | null;
  visaExpiryDate: string;
  visaExpiresInDays: number;
  status: 'active' | 'warning' | 'critical' | 'exceeded';
  alerts: string[];
  recommendations: string[];
}

interface StayStats {
  totalCurrentStays: number;
  countriesStaying: string[];
  totalDaysThisYear: number;
  averageStayDuration: number;
  longestCurrentStay: number;
  criticalStays: number;
  warningStays: number;
}

// GET /api/stay-tracking - 현재 체류 현황 조회
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
    const yearStart = new Date(today.getFullYear(), 0, 1);

    // 현재 체류 중인 기록 조회 (exitDate가 null인 것들)
    const currentStays = await prisma.visaEntry.findMany({
      where: {
        userVisa: {
          userId: session.user.id
        },
        exitDate: null,
        entryDate: {
          lte: today
        }
      },
      include: {
        userVisa: {
          select: {
            id: true,
            countryName: true,
            visaType: true,
            maxStayDays: true,
            expiryDate: true,
            status: true
          }
        }
      },
      orderBy: {
        entryDate: 'desc'
      }
    });

    const currentStayData: CurrentStay[] = [];

    for (const stay of currentStays) {
      const daysInCountry = differenceInDays(today, stay.entryDate) + 1;
      const remainingDays = stay.userVisa.maxStayDays ? stay.userVisa.maxStayDays - daysInCountry : null;
      const visaExpiresInDays = differenceInDays(stay.userVisa.expiryDate, today);
      
      // 상태 결정
      let status: 'active' | 'warning' | 'critical' | 'exceeded' = 'active';
      const alerts: string[] = [];
      const recommendations: string[] = [];

      // 체류 기간 체크
      if (remainingDays !== null) {
        if (remainingDays < 0) {
          status = 'exceeded';
          alerts.push(`🚨 체류 기간 ${Math.abs(remainingDays)}일 초과!`);
          recommendations.push('즉시 출국하거나 체류 연장 신청이 필요합니다');
        } else if (remainingDays <= 3) {
          status = 'critical';
          alerts.push(`⚠️ ${remainingDays}일 후 체류 기간 만료`);
          recommendations.push('출국 계획을 확정하거나 체류 연장을 신청하세요');
        } else if (remainingDays <= 7) {
          status = 'warning';
          alerts.push(`📅 ${remainingDays}일 후 체류 기간 만료`);
          recommendations.push('출국 또는 연장 준비를 시작하세요');
        }
      }

      // 비자 만료 체크
      if (visaExpiresInDays <= 7 && visaExpiresInDays >= 0) {
        if (status === 'active') status = 'critical';
        alerts.push(`🛂 비자가 ${visaExpiresInDays}일 후 만료`);
        recommendations.push('비자 갱신 또는 출국이 필요합니다');
      } else if (visaExpiresInDays < 0) {
        status = 'exceeded';
        alerts.push(`🚨 비자가 ${Math.abs(visaExpiresInDays)}일 전 만료됨`);
        recommendations.push('긴급: 즉시 출국하거나 당국에 문의하세요');
      }

      // 장기 체류 알림 (90일 이상)
      if (daysInCountry >= 90) {
        alerts.push(`📊 ${daysInCountry}일간 장기 체류 중`);
        recommendations.push('세무 및 거주 규정을 확인하세요');
      }

      currentStayData.push({
        id: stay.id,
        visaId: stay.userVisa.id,
        countryName: stay.userVisa.countryName,
        visaType: stay.userVisa.visaType,
        entryDate: format(stay.entryDate, 'yyyy-MM-dd'),
        daysInCountry,
        maxStayDays: stay.userVisa.maxStayDays,
        remainingDays,
        visaExpiryDate: format(stay.userVisa.expiryDate, 'yyyy-MM-dd'),
        visaExpiresInDays,
        status,
        alerts,
        recommendations
      });
    }

    // 통계 계산
    const thisYearStays = await prisma.visaEntry.findMany({
      where: {
        userVisa: {
          userId: session.user.id
        },
        entryDate: {
          gte: yearStart
        }
      }
    });

    const totalDaysThisYear = thisYearStays.reduce((total, stay) => {
      const exitDate = stay.exitDate || today;
      const stayDays = differenceInDays(exitDate, stay.entryDate) + 1;
      return total + stayDays;
    }, 0);

    const averageStayDuration = thisYearStays.length > 0 
      ? Math.round(totalDaysThisYear / thisYearStays.length) 
      : 0;

    const longestCurrentStay = currentStayData.length > 0 
      ? Math.max(...currentStayData.map(stay => stay.daysInCountry))
      : 0;

    const stats: StayStats = {
      totalCurrentStays: currentStayData.length,
      countriesStaying: [...new Set(currentStayData.map(stay => stay.countryName))],
      totalDaysThisYear,
      averageStayDuration,
      longestCurrentStay,
      criticalStays: currentStayData.filter(stay => stay.status === 'critical' || stay.status === 'exceeded').length,
      warningStays: currentStayData.filter(stay => stay.status === 'warning').length
    };

    return NextResponse.json({
      success: true,
      data: {
        currentStays: currentStayData,
        stats,
        lastChecked: today.toISOString(),
        summary: {
          hasActiveStays: currentStayData.length > 0,
          hasCriticalStays: stats.criticalStays > 0,
          hasWarningStays: stats.warningStays > 0,
          needsImmediateAction: currentStayData.some(stay => 
            stay.status === 'exceeded' || 
            (stay.remainingDays !== null && stay.remainingDays <= 3)
          )
        }
      }
    });

  } catch (error) {
    console.error('Error fetching stay tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stay tracking data' },
      { status: 500 }
    );
  }
}

// POST /api/stay-tracking - 새로운 입국 기록 생성
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
    const { visaId, entryDate, purpose, expectedExitDate, notes } = CreateStaySchema.parse(body);

    // 비자 존재 확인
    const userVisa = await prisma.userVisa.findFirst({
      where: {
        id: visaId,
        userId: session.user.id,
        status: {
          in: ['active', 'expiring_soon']
        }
      }
    });

    if (!userVisa) {
      return NextResponse.json(
        { error: 'Valid visa not found' },
        { status: 404 }
      );
    }

    // 이미 해당 비자로 입국 중인지 확인
    const existingEntry = await prisma.visaEntry.findFirst({
      where: {
        userVisaId: visaId,
        exitDate: null
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Already have an active entry for this visa' },
        { status: 400 }
      );
    }

    // 입국 기록 생성
    const visaEntry = await prisma.visaEntry.create({
      data: {
        userVisaId: visaId,
        entryDate,
        purpose,
        notes,
        // expectedExitDate는 참고용이므로 별도 필드 추가 시 사용
      },
      include: {
        userVisa: {
          select: {
            countryName: true,
            visaType: true,
            maxStayDays: true,
            expiryDate: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        entryId: visaEntry.id,
        countryName: visaEntry.userVisa.countryName,
        visaType: visaEntry.userVisa.visaType,
        entryDate: format(visaEntry.entryDate, 'yyyy-MM-dd'),
        maxStayDays: visaEntry.userVisa.maxStayDays,
        visaExpiryDate: format(visaEntry.userVisa.expiryDate, 'yyyy-MM-dd'),
        message: `${visaEntry.userVisa.countryName} 입국이 기록되었습니다`
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating stay entry:', error);
    return NextResponse.json(
      { error: 'Failed to create stay entry' },
      { status: 500 }
    );
  }
}

// PUT /api/stay-tracking - 출국 기록 업데이트
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
    const { visaEntryId, exitDate, actualStayDays, purpose, notes } = UpdateStaySchema.parse(body);

    // 입국 기록 확인
    const visaEntry = await prisma.visaEntry.findFirst({
      where: {
        id: visaEntryId,
        userVisa: {
          userId: session.user.id
        }
      },
      include: {
        userVisa: {
          select: {
            countryName: true,
            visaType: true,
            maxStayDays: true
          }
        }
      }
    });

    if (!visaEntry) {
      return NextResponse.json(
        { error: 'Stay entry not found' },
        { status: 404 }
      );
    }

    // 출국일 검증
    if (exitDate && isBefore(exitDate, visaEntry.entryDate)) {
      return NextResponse.json(
        { error: 'Exit date cannot be before entry date' },
        { status: 400 }
      );
    }

    // 실제 체류일수 계산
    const calculatedStayDays = exitDate 
      ? differenceInDays(exitDate, visaEntry.entryDate) + 1 
      : null;

    // 출국 기록 업데이트
    const updatedEntry = await prisma.visaEntry.update({
      where: { id: visaEntryId },
      data: {
        exitDate,
        stayDays: actualStayDays || calculatedStayDays,
        purpose: purpose || visaEntry.purpose,
        notes: notes || visaEntry.notes,
      },
      include: {
        userVisa: {
          select: {
            countryName: true,
            visaType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        entryId: updatedEntry.id,
        countryName: updatedEntry.userVisa.countryName,
        visaType: updatedEntry.userVisa.visaType,
        entryDate: format(updatedEntry.entryDate, 'yyyy-MM-dd'),
        exitDate: updatedEntry.exitDate ? format(updatedEntry.exitDate, 'yyyy-MM-dd') : null,
        totalStayDays: updatedEntry.stayDays,
        message: exitDate 
          ? `${updatedEntry.userVisa.countryName} 출국이 기록되었습니다`
          : '체류 정보가 업데이트되었습니다'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating stay entry:', error);
    return NextResponse.json(
      { error: 'Failed to update stay entry' },
      { status: 500 }
    );
  }
}