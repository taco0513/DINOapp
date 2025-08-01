import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Range parameter available if needed
    // const range = request.nextUrl.searchParams.get('range') || '30d';

    // 모의 리텐션 데이터
    const mockData = {
      cohortRetention: [
        { cohort: '2024년 1월', day0: 100, day7: 68, day30: 45 },
        { cohort: '2024년 2월', day0: 100, day7: 72, day30: 48 },
        { cohort: '2024년 3월', day0: 100, day7: 75, day30: 52 },
        { cohort: '2024년 4월', day0: 100, day7: 78, day30: 55 },
        { cohort: '2024년 5월', day0: 100, day7: 80, day30: 58 },
        { cohort: '2024년 6월', day0: 100, day7: 82, day30: 60 },
      ],
      churnRate: 12.5,
      lifetimeValue: 89000,
    };

    return NextResponse.json(mockData);
  } catch (error) {
    logger.error('Failed to fetch retention analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}