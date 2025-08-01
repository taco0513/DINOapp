import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity, SecurityPresets } from '@/lib/security/api-security';
import prisma from '@/lib/prisma';
// TODO: Remove unused logger import
import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
} from 'date-fns';

async function businessMetricsHandler(request: NextRequest, _context?: any) {
  try {
    // Authentication and authorization handled by middleware

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';

    // 시간 범위 계산
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (range) {
      case 'week':
        startDate = startOfWeek(now);
        previousStartDate = subWeeks(startDate, 1);
        break;
      case 'month':
        startDate = startOfMonth(now);
        previousStartDate = subMonths(startDate, 1);
        break;
      case 'quarter':
        startDate = startOfQuarter(now);
        previousStartDate = subQuarters(startDate, 1);
        break;
      case 'year':
        startDate = startOfYear(now);
        previousStartDate = subYears(startDate, 1);
        break;
      default:
        startDate = startOfMonth(now);
        previousStartDate = subMonths(startDate, 1);
    }

    // 현재 기간 메트릭
    const [
      currentUsers,
      _previousUsers,
      currentTrips,
      previousTrips,
      currentActiveUsers,
      previousActiveUsers,
    ] = await Promise.all([
      // 현재 기간 총 사용자
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      // 이전 기간 총 사용자
      prisma.user.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      // 현재 기간 여행 수
      prisma.countryVisit.count({
        where: { createdAt: { gte: startDate } },
      }),
      // 이전 기간 여행 수
      prisma.countryVisit.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      // 현재 기간 활성 사용자 (여행을 생성한 사용자)
      prisma.user.count({
        where: {
          countryVisits: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
      }),
      // 이전 기간 활성 사용자
      prisma.user.count({
        where: {
          countryVisits: {
            some: {
              createdAt: { gte: previousStartDate, lt: startDate },
            },
          },
        },
      }),
    ]);

    // 평균 여행 기간 계산
    const tripDurations = await prisma.countryVisit.findMany({
      where: { createdAt: { gte: startDate } },
      select: { entryDate: true, exitDate: true },
    });

    const avgDuration =
      tripDurations.reduce((acc, trip) => {
        if (!trip.exitDate) return acc; // Skip ongoing trips
        const duration =
          (trip.exitDate.getTime() - trip.entryDate.getTime()) /
          (1000 * 60 * 60 * 24);
        return acc + duration;
      }, 0) / (tripDurations.filter(t => t.exitDate).length || 1);

    // 메트릭 계산
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    const metrics = {
      activeUsers: {
        value: currentActiveUsers,
        change: Math.round(
          calculateChange(currentActiveUsers, previousActiveUsers)
        ),
        trend: currentActiveUsers >= previousActiveUsers ? 'up' : 'down',
      },
      revenue: {
        value: 0, // TODO: 실제 수익 데이터 연동
        change: 0,
        trend: 'stable',
      },
      tripCount: {
        value: currentTrips,
        change: Math.round(calculateChange(currentTrips, previousTrips)),
        trend: currentTrips >= previousTrips ? 'up' : 'down',
      },
      retentionRate: {
        value:
          previousActiveUsers > 0
            ? (currentActiveUsers / previousActiveUsers) * 100
            : 0,
        change: 0,
        trend: 'stable',
      },
      avgTripDuration: {
        value: Math.round(avgDuration),
        change: 0,
        trend: 'stable',
      },
      conversionRate: {
        value: currentUsers > 0 ? (currentActiveUsers / currentUsers) * 100 : 0,
        change: 0,
        trend: 'stable',
      },
    };

    // 차트 데이터 생성 (간단한 예시)
    const charts = {
      userGrowth: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        users: Math.floor(Math.random() * 100) + 50,
        active: Math.floor(Math.random() * 50) + 25,
      })),
      revenueGrowth: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        revenue: Math.floor(Math.random() * 1000000) + 500000,
        mrr: Math.floor(Math.random() * 500000) + 250000,
      })),
      tripFrequency: [
        { month: '1월', trips: 45 },
        { month: '2월', trips: 52 },
        { month: '3월', trips: 48 },
        { month: '4월', trips: 65 },
        { month: '5월', trips: 72 },
        { month: '6월', trips: 68 },
      ],
      userSegments: [
        { name: '프리미엄', value: 30 },
        { name: '일반', value: 50 },
        { name: '신규', value: 20 },
      ],
      featureUsage: [
        { feature: 'Gmail 통합', usage: 85 },
        { feature: '쉥겐 계산기', usage: 92 },
        { feature: '여행 통계', usage: 78 },
        { feature: '오프라인 모드', usage: 45 },
        { feature: '알림 설정', usage: 67 },
      ],
    };

    return NextResponse.json({ metrics, charts });
  } catch (error) {
    
    console.error('Failed to fetch business metrics', { error });
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Apply security middleware with admin-only access
export const GET = withApiSecurity(businessMetricsHandler, SecurityPresets.ADMIN_ONLY);
