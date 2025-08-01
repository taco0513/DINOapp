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

    // 모의 전환 데이터
    const mockData = {
      funnelSteps: [
        { step: '홈페이지 방문', users: 10000, dropoff: 0 },
        { step: '회원가입 시작', users: 3500, dropoff: 65 },
        { step: '이메일 인증', users: 2800, dropoff: 20 },
        { step: '프로필 완성', users: 2100, dropoff: 25 },
        { step: '첫 여행 등록', users: 1680, dropoff: 20 },
        { step: '프리미엄 가입', users: 420, dropoff: 75 },
      ],
      conversionRate: 4.2,
      goalCompletions: [
        { goal: '회원가입', completions: 2800, value: 0 },
        { goal: '첫 여행 등록', completions: 1680, value: 0 },
        { goal: 'Gmail 연동', completions: 950, value: 0 },
        { goal: '프리미엄 가입', completions: 420, value: 1260000 },
        { goal: '친구 초대', completions: 180, value: 0 },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    logger.error('Failed to fetch conversion analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}