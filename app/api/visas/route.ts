import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// TODO: Remove unused logger import

// Validation schemas
const CreateVisaSchema = z.object({
  countryCode: z.string().min(2).max(2),
  countryName: z.string().min(1),
  visaType: z.enum(['tourist', 'business', 'student', 'work', 'transit', 'digital-nomad']),
  visaNumber: z.string().optional(),
  issueDate: z.string().transform(date => new Date(date)),
  expiryDate: z.string().transform(date => new Date(date)),
  entryType: z.enum(['single', 'multiple']).default('multiple'),
  maxStayDays: z.number().optional(),
  totalStayDays: z.number().optional(),
  issuingCountry: z.string().optional(),
  fee: z.string().optional(),
  processingTime: z.string().optional(),
  applicationDate: z.string().transform(date => new Date(date)).optional(),
  notes: z.string().optional(),
  isAutoRenewal: z.boolean().default(false),
  renewalEligible: z.boolean().default(false),
  renewalDeadline: z.string().transform(date => new Date(date)).optional(),
  alertDays: z.string().default('1,3,7,14,30,60'),
});

const UpdateVisaSchema = CreateVisaSchema.partial();

// GET /api/visas - 사용자의 모든 비자 조회
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
    const status = searchParams.get('status');
    const countryCode = searchParams.get('countryCode');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    const visas = await prisma.userVisa.findMany({
      where,
      include: {
        visaEntries: {
          orderBy: { entryDate: 'desc' },
          take: 5, // 최근 5개 입국 기록만
        },
        _count: {
          select: {
            visaEntries: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // active가 먼저
        { expiryDate: 'asc' }, // 만료일 가까운 순
      ],
    });

    // 각 비자의 상태 업데이트 (만료된 비자 체크)
    const now = new Date();
    const visasWithUpdatedStatus = await Promise.all(
      visas.map(async (visa) => {
        if (visa.status === 'active' && visa.expiryDate < now) {
          await prisma.userVisa.update({
            where: { id: visa.id },
            data: { status: 'expired' },
          });
          return { ...visa, status: 'expired' };
        }
        return visa;
      })
    );

    return NextResponse.json({
      success: true,
      data: visasWithUpdatedStatus,
    });
  } catch (error) {
    console.error('Error fetching visas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visas' },
      { status: 500 }
    );
  }
}

// POST /api/visas - 새 비자 추가
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
    const validatedData = CreateVisaSchema.parse(body);

    // 중복 비자 체크 (같은 국가, 같은 유형, 활성 상태)
    const existingVisa = await prisma.userVisa.findFirst({
      where: {
        userId: session.user.id,
        countryCode: validatedData.countryCode,
        visaType: validatedData.visaType,
        status: 'active',
      },
    });

    if (existingVisa) {
      return NextResponse.json(
        { error: 'Active visa for this country and type already exists' },
        { status: 400 }
      );
    }

    const newVisa = await prisma.userVisa.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        visaEntries: true,
        _count: {
          select: {
            visaEntries: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newVisa,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating visa:', error);
    return NextResponse.json(
      { error: 'Failed to create visa' },
      { status: 500 }
    );
  }
}

// PUT /api/visas - 비자 정보 업데이트
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
        { error: 'Visa ID is required' },
        { status: 400 }
      );
    }

    const validatedData = UpdateVisaSchema.parse(updateData);

    // 사용자의 비자인지 확인
    const existingVisa = await prisma.userVisa.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingVisa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    const updatedVisa = await prisma.userVisa.update({
      where: { id },
      data: validatedData,
      include: {
        visaEntries: {
          orderBy: { entryDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            visaEntries: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedVisa,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating visa:', error);
    return NextResponse.json(
      { error: 'Failed to update visa' },
      { status: 500 }
    );
  }
}

// DELETE /api/visas - 비자 삭제 (실제로는 cancelled 상태로 변경)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Visa ID is required' },
        { status: 400 }
      );
    }

    // 사용자의 비자인지 확인
    const existingVisa = await prisma.userVisa.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingVisa) {
      return NextResponse.json(
        { error: 'Visa not found' },
        { status: 404 }
      );
    }

    // 비자를 완전히 삭제하지 않고 cancelled 상태로 변경
    const cancelledVisa = await prisma.userVisa.update({
      where: { id },
      data: { 
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: cancelledVisa,
    });
  } catch (error) {
    console.error('Error deleting visa:', error);
    return NextResponse.json(
      { error: 'Failed to delete visa' },
      { status: 500 }
    );
  }
}