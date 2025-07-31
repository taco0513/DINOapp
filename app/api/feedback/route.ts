import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  screenshot?: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body: FeedbackData = await request.json();

    // 기본 유효성 검사
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: '메시지는 필수입니다.' },
        { status: 400 }
      );
    }

    // 피드백 데이터 구조화
    const feedbackEntry = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session?.user?.email || 'anonymous',
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null,
      type: body.type,
      priority: body.priority,
      message: body.message,
      screenshot: body.screenshot || null,
      context: {
        userAgent: body.userAgent,
        url: body.url,
        timestamp: body.timestamp,
        sessionId: session?.user?.id || null,
      },
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // 실제 환경에서는 데이터베이스에 저장
    // 현재는 콘솔에 로그로 출력
    console.log('💬 새 피드백 접수:', {
      id: feedbackEntry.id,
      type: feedbackEntry.type,
      priority: feedbackEntry.priority,
      user: feedbackEntry.userEmail,
      message: feedbackEntry.message.substring(0, 100) + '...',
    });

    // 슬랙/이메일 알림 (실제 환경에서 활성화)
    if (body.priority === 'high' || body.type === 'bug') {
      // await notifyTeam(feedbackEntry);
    }

    // 개발 환경에서는 파일로 저장 (선택적)
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs').promises;
      const path = require('path');

      try {
        const feedbackDir = path.join(process.cwd(), 'data', 'feedback');
        await fs.mkdir(feedbackDir, { recursive: true });

        const filename = `${feedbackEntry.id}.json`;
        const filepath = path.join(feedbackDir, filename);

        await fs.writeFile(filepath, JSON.stringify(feedbackEntry, null, 2));
      } catch (fileError) {
        console.warn('피드백 파일 저장 실패:', fileError);
      }
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '피드백이 성공적으로 접수되었습니다.',
      feedbackId: feedbackEntry.id,
    });
  } catch (error) {
    console.error('피드백 처리 오류:', error);

    return NextResponse.json(
      {
        error: '피드백 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// 피드백 조회 (관리자용)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인 (실제로는 더 정교한 권한 체크 필요)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 개발 환경에서 파일 기반 피드백 목록 반환
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs').promises;
      const path = require('path');

      try {
        const feedbackDir = path.join(process.cwd(), 'data', 'feedback');
        const files = await fs.readdir(feedbackDir);

        const feedbacks = await Promise.all(
          files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
              const content = await fs.readFile(
                path.join(feedbackDir, file),
                'utf-8'
              );
              return JSON.parse(content);
            })
        );

        // 최신순 정렬
        feedbacks.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
          feedbacks,
          total: feedbacks.length,
        });
      } catch (__error) {
        return NextResponse.json({ feedbacks: [], total: 0 });
      }
    }

    // 프로덕션에서는 데이터베이스에서 조회
    return NextResponse.json({
      feedbacks: [],
      total: 0,
      message: '프로덕션 환경에서는 데이터베이스 연결이 필요합니다.',
    });
  } catch (error) {
    console.error('피드백 조회 오류:', error);
    return NextResponse.json(
      { error: '피드백 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 간단한 관리자 확인 함수 (실제로는 더 정교하게 구현)
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

// 팀 알림 함수 (실제 구현 시 활성화)
// async function notifyTeam(feedback: any) {
//   // Slack 알림
//   if (process.env.SLACK_WEBHOOK_URL) {
//     await fetch(process.env.SLACK_WEBHOOK_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         text: `🚨 ${feedback.priority.toUpperCase()} 피드백 접수`,
//         blocks: [
//           {
//             type: 'section',
//             text: {
//               type: 'mrkdwn',
//               text: `*유형:* ${feedback.type}\n*우선순위:* ${feedback.priority}\n*사용자:* ${feedback.userEmail}\n*메시지:* ${feedback.message.substring(0, 200)}...`
//             }
//           }
//         ]
//       })
//     });
//   }
// }
