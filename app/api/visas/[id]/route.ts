import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/visas/[id] - 특정 비자 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const visa = await prisma.userVisa.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        visaEntries: {
          include: {
            countryVisit: true,
          },
          orderBy: { entryDate: 'desc' },
        },
        _count: {
          select: {
            visaEntries: true,
          },
        },
      },
    });

    if (!visa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    // 비자 사용 통계 계산
    const stats = {
      totalEntries: visa.visaEntries.length,
      totalDaysUsed: visa.totalUsedDays,
      currentStay: visa.currentStayDays,
      isCurrentlyInCountry: visa.visaEntries.some(entry => !entry.exitDate),
      lastEntry: visa.lastEntryDate,
      daysUntilExpiry: Math.ceil(
        (visa.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
      isExpiringSoon: Math.ceil(
        (visa.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ) <= 30,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...visa,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching visa:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa' },
      { status: 500 }
    );
  }
}