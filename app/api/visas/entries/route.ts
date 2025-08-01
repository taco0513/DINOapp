import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const CreateVisaEntrySchema = z.object({
  userVisaId: z.string(),
  entryDate: z.string().transform(date => new Date(date)),
  exitDate: z.string().transform(date => new Date(date)).optional(),
  entryPoint: z.string().optional(),
  exitPoint: z.string().optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
  countryVisitId: z.string().optional(), // 기존 CountryVisit과 연결
});

const UpdateVisaEntrySchema = CreateVisaEntrySchema.partial();

// GET /api/visas/entries - 비자 입국 기록 조회
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
    const userVisaId = searchParams.get('userVisaId');
    const countryCode = searchParams.get('countryCode');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 사용자의 비자인지 확인
    const userVisaWhere: any = {
      userId: session.user.id,
    };

    if (userVisaId) {
      userVisaWhere.id = userVisaId;
    }

    if (countryCode) {
      userVisaWhere.countryCode = countryCode;
    }

    const entries = await prisma.visaEntry.findMany({
      where: {
        userVisa: userVisaWhere,
      },
      include: {
        userVisa: {
          select: {
            id: true,
            countryCode: true,
            countryName: true,
            visaType: true,
          },
        },
        countryVisit: {
          select: {
            id: true,
            country: true,
            purpose: true,
            accommodation: true,
            cost: true,
            rating: true,
          },
        },
      },
      orderBy: { entryDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Error fetching visa entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa entries' },
      { status: 500 }
    );
  }
}

// POST /api/visas/entries - 새 입국 기록 추가
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
    const validatedData = CreateVisaEntrySchema.parse(body);

    // 사용자의 비자인지 확인
    const userVisa = await prisma.userVisa.findFirst({
      where: {
        id: validatedData.userVisaId,
        userId: session.user.id,
      },
    });

    if (!userVisa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    // 현재 입국 중인 기록이 있는지 확인 (exitDate가 null인 기록)
    const currentEntry = await prisma.visaEntry.findFirst({
      where: {
        userVisaId: validatedData.userVisaId,
        exitDate: null,
      },
    });

    if (currentEntry && !validatedData.exitDate) {
      return NextResponse.json(
        { error: 'Already have an active entry. Please exit first.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 입국 기록 생성 및 비자 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 입국 기록 생성
      const entry = await tx.visaEntry.create({
        data: {
          ...validatedData,
          stayDays: validatedData.exitDate 
            ? Math.ceil(
                (validatedData.exitDate.getTime() - validatedData.entryDate.getTime()) 
                / (1000 * 60 * 60 * 24)
              ) + 1
            : null,
        },
        include: {
          userVisa: true,
          countryVisit: true,
        },
      });

      // 비자 상태 업데이트
      const updateData: any = {
        lastEntryDate: validatedData.entryDate,
      };

      if (validatedData.exitDate) {
        // 출국한 경우: 총 사용일수 업데이트, 현재 체류일수 리셋
        const stayDays = entry.stayDays || 0;
        updateData.totalUsedDays = userVisa.totalUsedDays + stayDays;
        updateData.currentStayDays = 0;
      } else {
        // 입국만 한 경우: 현재 체류일수 시작
        updateData.currentStayDays = 1;
      }

      await tx.userVisa.update({
        where: { id: validatedData.userVisaId },
        data: updateData,
      });

      return entry;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating visa entry:', error);
    return NextResponse.json(
      { error: 'Failed to create visa entry' },
      { status: 500 }
    );
  }
}

// PUT /api/visas/entries - 입국 기록 업데이트 (주로 출국일 추가)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const validatedData = UpdateVisaEntrySchema.parse(updateData);

    // 사용자의 입국 기록인지 확인
    const existingEntry = await prisma.visaEntry.findFirst({
      where: {
        id,
        userVisa: {
          userId: session.user.id,
        },
      },
      include: {
        userVisa: true,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 입국 기록 업데이트 및 비자 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 체류일수 계산
      const entryDate = validatedData.entryDate || existingEntry.entryDate;
      const exitDate = validatedData.exitDate;
      const stayDays = exitDate 
        ? Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : null;

      // 입국 기록 업데이트
      const updatedEntry = await tx.visaEntry.update({
        where: { id },
        data: {
          ...validatedData,
          stayDays,
        },
        include: {
          userVisa: true,
          countryVisit: true,
        },
      });

      // 출국일이 새로 추가된 경우 비자 상태 업데이트
      if (exitDate && !existingEntry.exitDate) {
        const visa = existingEntry.userVisa;
        await tx.userVisa.update({
          where: { id: visa.id },
          data: {
            totalUsedDays: visa.totalUsedDays + (stayDays || 0),
            currentStayDays: 0, // 출국했으므로 현재 체류일수 리셋
          },
        });
      }

      return updatedEntry;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating visa entry:', error);
    return NextResponse.json(
      { error: 'Failed to update visa entry' },
      { status: 500 }
    );
  }
}