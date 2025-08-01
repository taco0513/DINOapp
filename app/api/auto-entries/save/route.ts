import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseISO, differenceInDays } from 'date-fns';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

// Validation schema
const SaveEntriesSchema = z.object({
  entries: z.array(z.object({
    visaId: z.string().optional(),
    countryCode: z.string(),
    countryName: z.string(),
    entryDate: z.string(),
    exitDate: z.string().optional(),
    entryType: z.enum(['auto_flight', 'auto_hotel', 'manual']),
    source: z.object({
      type: z.enum(['gmail_flight', 'gmail_hotel', 'manual']),
      emailId: z.string().optional(),
      flightNumber: z.string().optional(),
      bookingReference: z.string().optional(),
    }),
    confidence: z.number(),
    status: z.enum(['pending', 'confirmed', 'rejected']),
    notes: z.string().optional(),
  })),
  autoConfirm: z.boolean().default(true),
});

// POST /api/auto-entries/save - 선택된 입출국 기록 저장
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
    const { entries, autoConfirm: _autoConfirm } = SaveEntriesSchema.parse(body);

    let saved = 0;
    let skipped = 0;
    let errors = 0;
    const savedEntries = [];

    for (const entry of entries) {
      try {
        // 비자 ID가 없으면 스킵
        if (!entry.visaId) {
          skipped++;
          continue;
        }

        // 비자 소유권 확인
        const userVisa = await prisma.userVisa.findFirst({
          where: {
            id: entry.visaId,
            userId: session.user.id
          }
        });

        if (!userVisa) {
          skipped++;
          continue;
        }

        // 중복 확인 (같은 날짜에 같은 국가 입국 기록)
        const existingEntry = await prisma.visaEntry.findFirst({
          where: {
            userVisaId: entry.visaId,
            entryDate: parseISO(entry.entryDate),
          }
        });

        if (existingEntry) {
          skipped++;
          continue;
        }

        // 체류일수 계산
        let stayDays = null;
        if (entry.exitDate) {
          stayDays = differenceInDays(
            parseISO(entry.exitDate),
            parseISO(entry.entryDate)
          ) + 1;
        }

        // 입국 기록 생성
        const createdEntry = await prisma.visaEntry.create({
          data: {
            userVisaId: entry.visaId,
            entryDate: parseISO(entry.entryDate),
            exitDate: entry.exitDate ? parseISO(entry.exitDate) : null,
            stayDays,
            purpose: entry.source.type === 'gmail_flight' ? 'tourism' : 'other',
            notes: `${entry.notes || ''}\n[자동 감지: ${entry.source.type}${entry.source.flightNumber ? ` - ${entry.source.flightNumber}` : ''}]`.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            userVisa: {
              select: {
                countryName: true,
                countryCode: true,
                visaType: true,
                maxStayDays: true
              }
            }
          }
        });

        savedEntries.push({
          id: createdEntry.id,
          countryName: createdEntry.userVisa.countryName,
          entryDate: createdEntry.entryDate.toISOString(),
          exitDate: createdEntry.exitDate?.toISOString(),
          stayDays: createdEntry.stayDays
        });

        saved++;

        // 체류 기간 초과 확인
        if (stayDays && userVisa.maxStayDays && stayDays > userVisa.maxStayDays) {
          // 경고 알림 생성 (추후 구현)
          logger.warn(`Stay duration exceeded for visa ${userVisa.id}: ${stayDays} days > ${userVisa.maxStayDays} days`);
        }

      } catch (error) {
        logger.error('Error saving entry:', error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        saved,
        skipped,
        errors,
        savedEntries,
        message: `${saved}개의 입출국 기록이 저장되었습니다.`
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Error saving auto entries:', error);
    return NextResponse.json(
      { error: 'Failed to save entries' },
      { status: 500 }
    );
  }
}