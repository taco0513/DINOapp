import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseISO, subMonths } from 'date-fns';
import { detectEntriesFromGmail, saveAutoDetectedEntries } from '@/lib/gmail/auto-entry-detector';

// TODO: Remove unused logger import

// Validation schema
const DetectEntriesSchema = z.object({
  accessToken: z.string(),
  dateRange: z.object({
    start: z.string().transform(date => parseISO(date)),
    end: z.string().transform(date => parseISO(date)),
  }).optional(),
  autoConfirm: z.boolean().default(false),
  saveDirectly: z.boolean().default(false),
});

// POST /api/auto-entries/detect - Gmail에서 입출국 기록 자동 감지
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
    const { accessToken, dateRange, autoConfirm, saveDirectly } = DetectEntriesSchema.parse(body);

    // 기본 날짜 범위 설정 (최근 6개월)
    const effectiveDateRange = dateRange || {
      start: subMonths(new Date(), 6),
      end: new Date()
    };

    // Gmail에서 입출국 기록 감지
    const detectedEntries = await detectEntriesFromGmail(
      session.user.id,
      accessToken,
      effectiveDateRange
    );

    // 직접 저장 옵션이 활성화된 경우
    if (saveDirectly) {
      const saveResult = await saveAutoDetectedEntries(
        session.user.id,
        detectedEntries,
        autoConfirm
      );

      return NextResponse.json({
        success: true,
        data: {
          detected: detectedEntries.length,
          saved: saveResult.saved,
          skipped: saveResult.skipped,
          errors: saveResult.errors,
          message: `${saveResult.saved}개의 입출국 기록이 저장되었습니다.`
        }
      });
    }

    // 미리보기만 반환 (저장하지 않음)
    return NextResponse.json({
      success: true,
      data: {
        entries: detectedEntries,
        total: detectedEntries.length,
        dateRange: {
          start: effectiveDateRange.start.toISOString(),
          end: effectiveDateRange.end.toISOString()
        },
        summary: {
          highConfidence: detectedEntries.filter(e => e.confidence >= 0.8).length,
          mediumConfidence: detectedEntries.filter(e => e.confidence >= 0.6 && e.confidence < 0.8).length,
          lowConfidence: detectedEntries.filter(e => e.confidence < 0.6).length,
          countries: [...new Set(detectedEntries.map(e => e.countryName))],
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error detecting auto entries:', error);
    return NextResponse.json(
      { error: 'Failed to detect entries from Gmail' },
      { status: 500 }
    );
  }
}

// GET /api/auto-entries/detect - 저장된 자동 감지 기록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // URL 파라미터에서 상태 필터 가져오기
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // 사용자의 자동 감지된 입출국 기록 조회
    const whereClause: any = {
      userVisa: {
        userId: session.user.id
      },
      purpose: 'auto_detected'
    };

    // 상태 필터 적용
    if (status !== 'all') {
      if (status === 'pending') {
        whereClause.notes = {
          contains: 'auto_flight'
        };
      } else if (status === 'confirmed') {
        whereClause.notes = {
          not: {
            contains: '⚠️'
          }
        };
      }
    }

    const autoEntries = await prisma.visaEntry.findMany({
      where: whereClause,
      include: {
        userVisa: {
          select: {
            countryName: true,
            countryCode: true,
            visaType: true,
            maxStayDays: true,
            expiryDate: true
          }
        }
      },
      orderBy: {
        entryDate: 'desc'
      }
    });

    const formattedEntries = autoEntries.map(entry => ({
      id: entry.id,
      countryCode: entry.userVisa.countryCode,
      countryName: entry.userVisa.countryName,
      visaType: entry.userVisa.visaType,
      entryDate: entry.entryDate.toISOString(),
      exitDate: entry.exitDate?.toISOString() || null,
      stayDays: entry.stayDays,
      maxStayDays: entry.userVisa.maxStayDays,
      purpose: entry.purpose,
      notes: entry.notes,
      createdAt: entry.createdAt.toISOString(),
      status: entry.notes?.includes('⚠️') ? 'warning' : 'confirmed'
    }));

    return NextResponse.json({
      success: true,
      data: {
        entries: formattedEntries,
        total: formattedEntries.length,
        summary: {
          confirmed: formattedEntries.filter(e => e.status === 'confirmed').length,
          warning: formattedEntries.filter(e => e.status === 'warning').length,
          countries: [...new Set(formattedEntries.map(e => e.countryName))]
        }
      }
    });

  } catch (error) {
    console.error('Error fetching auto entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-detected entries' },
      { status: 500 }
    );
  }
}