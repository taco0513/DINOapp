import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

// GET /api/visas/stats - 사용자의 비자 통계 조회
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const countryCode = searchParams.get('countryCode');

    // 기본 비자 통계
    const visaStats = await prisma.userVisa.groupBy({
      by: ['status', 'visaType'],
      where: {
        userId: session.user.id,
        ...(countryCode && { countryCode }),
      },
      _count: {
        id: true,
      },
    });

    // 만료 예정 비자 (30일 이내)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringVisas = await prisma.userVisa.findMany({
      where: {
        userId: session.user.id,
        status: 'active',
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
        ...(countryCode && { countryCode }),
      },
      select: {
        id: true,
        countryCode: true,
        countryName: true,
        visaType: true,
        expiryDate: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    // 월별 입국 통계 (지정된 연도)
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const monthlyEntries = await prisma.visaEntry.groupBy({
      by: ['entryDate'],
      where: {
        userVisa: {
          userId: session.user.id,
          ...(countryCode && { countryCode }),
        },
        entryDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // 월별 데이터 포맷팅
    const monthlyStats = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const entriesInMonth = monthlyEntries.filter(entry => 
        entry.entryDate.getMonth() === index
      ).reduce((sum, entry) => sum + entry._count.id, 0);

      return {
        month,
        monthName: new Date(year, index).toLocaleDateString('ko-KR', { month: 'long' }),
        entries: entriesInMonth,
      };
    });

    // 국가별 통계
    const countryStats = await prisma.userVisa.groupBy({
      by: ['countryCode', 'countryName'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalUsedDays: true,
      },
    });

    // 현재 활성 체류
    const currentStays = await prisma.visaEntry.findMany({
      where: {
        userVisa: {
          userId: session.user.id,
        },
        exitDate: null, // 아직 출국하지 않은 기록
      },
      include: {
        userVisa: {
          select: {
            countryCode: true,
            countryName: true,
            visaType: true,
            maxStayDays: true,
            expiryDate: true,
          },
        },
      },
    });

    // 체류일수 계산
    const currentStaysWithDays = currentStays.map(stay => ({
      ...stay,
      daysInCountry: Math.ceil(
        (new Date().getTime() - stay.entryDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1,
      remainingDays: stay.userVisa.maxStayDays 
        ? stay.userVisa.maxStayDays - Math.ceil(
            (new Date().getTime() - stay.entryDate.getTime()) / (1000 * 60 * 60 * 24)
          ) - 1
        : null,
    }));

    // 비자 타입별 통계 포맷팅
    const visaTypeStats = visaStats.reduce((acc, stat) => {
      if (!acc[stat.visaType]) {
        acc[stat.visaType] = {
          total: 0,
          byStatus: {},
        };
      }
      acc[stat.visaType].total += stat._count.id;
      acc[stat.visaType].byStatus[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVisas: visaStats.reduce((sum, stat) => sum + stat._count.id, 0),
          activeVisas: visaStats
            .filter(stat => stat.status === 'active')
            .reduce((sum, stat) => sum + stat._count.id, 0),
          expiredVisas: visaStats
            .filter(stat => stat.status === 'expired')
            .reduce((sum, stat) => sum + stat._count.id, 0),
          expiringVisas: expiringVisas.length,
          countriesVisited: countryStats.length,
          currentStays: currentStays.length,
        },
        expiringVisas,
        monthlyStats,
        countryStats: countryStats.map(stat => ({
          countryCode: stat.countryCode,
          countryName: stat.countryName,
          visaCount: stat._count.id,
          totalDaysUsed: stat._sum.totalUsedDays || 0,
        })),
        visaTypeStats,
        currentStays: currentStaysWithDays,
      },
    });
  } catch (error) {
    logger.error('Error fetching visa stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa stats' },
      { status: 500 }
    );
  }
}