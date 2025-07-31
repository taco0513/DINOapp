import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIServiceFactory } from '@/lib/ai/factory';
import { prisma } from '@/lib/prisma';

interface AIContext {
  task:
    | 'feature_development'
    | 'bug_fixing'
    | 'refactoring'
    | 'testing'
    | 'documentation';
  complexity: 'simple' | 'moderate' | 'complex';
  technology: string[];
  currentCode?: string;
}

interface AISuggestion {
  type: 'code' | 'explanation' | 'fix' | 'optimization' | 'documentation';
  content: string;
  confidence: number;
  reasoning?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, context, mode } = await request.json();

    // AI 서비스 선택 (프리미엄 사용자 확인)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    // TODO: 실제 프리미엄 사용자 체크 로직 구현
    const isPremium = false; // 임시로 false

    const aiService = isPremium
      ? AIServiceFactory.createPremium()
      : AIServiceFactory.createFromEnv();

    // AI 응답 생성
    const response = await aiService.generateResponse(query, { context, mode });

    // 사용량 추적
    if (response.usage) {
      await prisma.aIUsage.create({
        data: {
          userId: user!.id,
          service: isPremium ? 'premium' : 'basic',
          tokens: response.usage.totalTokens,
          cost: 0, // TODO: 실제 비용 계산
          feature: 'assistant',
          success: true,
        },
      });
    }

    const suggestions = [
      {
        type: 'ai_response' as const,
        content: response.content,
        confidence: response.confidence,
        reasoning: response.metadata?.reasoning,
      },
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// 이전 시뮬레이션 함수들은 제거하고 AI 서비스로 대체됨
// generatePairProgrammingSuggestions, generateMentoringSuggestions 등은
// 이제 AIService 내부에서 처리됨
