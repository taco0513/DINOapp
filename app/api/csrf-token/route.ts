import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCSRFResponse } from '@/lib/security/csrf-protection';
import { applyRateLimit } from '@/lib/security/rate-limiter';

// CSRF 토큰 생성 엔드포인트
export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = await applyRateLimit(request, 'auth');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 세션 확인 (선택적)
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.email || undefined;

    // CSRF 토큰 생성 및 응답
    return generateCSRFResponse(sessionId);
  } catch (error) {
    // CSRF token generation failed

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate CSRF token',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST() {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Method Not Allowed',
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'GET',
      },
    }
  );
}
