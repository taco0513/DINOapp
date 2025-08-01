import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/visa-requirements - 비자 요구사항 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const fromCountry = searchParams.get('from');
    const toCountry = searchParams.get('to');

    // 특정 국가 간 비자 요구사항 조회
    if (fromCountry && toCountry) {
      const requirement = await prisma.visaRequirement.findUnique({
        where: {
          fromCountry_toCountry: {
            fromCountry: fromCountry.toUpperCase(),
            toCountry: toCountry.toUpperCase()
          }
        }
      });

      if (!requirement) {
        return NextResponse.json(
          { error: 'Visa requirement not found' },
          { status: 404 }
        );
      }

      // JSON 문자열 파싱
      const parsedRequirement = {
        ...requirement,
        visaTypes: JSON.parse(requirement.visaTypes || '[]'),
        requirements: requirement.requirements ? JSON.parse(requirement.requirements) : []
      };

      return NextResponse.json({
        success: true,
        data: parsedRequirement
      });
    }

    // 사용자의 여권 국가 기준 모든 비자 요구사항 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passportCountry: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // fromCountry가 지정되지 않은 경우 사용자의 여권 국가 사용
    const passportCountry = fromCountry || user.passportCountry || 'KR';

    const requirements = await prisma.visaRequirement.findMany({
      where: {
        fromCountry: passportCountry.toUpperCase()
      },
      orderBy: {
        toCountry: 'asc'
      }
    });

    // JSON 문자열 파싱
    const parsedRequirements = requirements.map(req => ({
      ...req,
      visaTypes: JSON.parse(req.visaTypes || '[]'),
      requirements: req.requirements ? JSON.parse(req.requirements) : []
    }));

    return NextResponse.json({
      success: true,
      data: parsedRequirements,
      passportCountry
    });

  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa requirements' },
      { status: 500 }
    );
  }
}

// POST /api/visa-requirements - 비자 요구사항 추가/업데이트 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: 관리자 권한 체크
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Forbidden' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const {
      fromCountry,
      toCountry,
      visaRequired,
      visaFreeStay,
      visaTypes,
      processingTime,
      cost,
      requirements,
      validityPeriod,
      multipleEntry,
      notes
    } = body;

    // 필수 필드 검증
    if (!fromCountry || !toCountry || visaRequired === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 비자 요구사항 생성 또는 업데이트
    const requirement = await prisma.visaRequirement.upsert({
      where: {
        fromCountry_toCountry: {
          fromCountry: fromCountry.toUpperCase(),
          toCountry: toCountry.toUpperCase()
        }
      },
      update: {
        visaRequired,
        visaFreeStay: visaFreeStay || null,
        visaTypes: JSON.stringify(visaTypes || []),
        processingTime: processingTime || null,
        cost: cost || null,
        requirements: JSON.stringify(requirements || []),
        validityPeriod: validityPeriod || null,
        multipleEntry: multipleEntry || false,
        notes: notes || null
      },
      create: {
        fromCountry: fromCountry.toUpperCase(),
        toCountry: toCountry.toUpperCase(),
        visaRequired,
        visaFreeStay: visaFreeStay || null,
        visaTypes: JSON.stringify(visaTypes || []),
        processingTime: processingTime || null,
        cost: cost || null,
        requirements: JSON.stringify(requirements || []),
        validityPeriod: validityPeriod || null,
        multipleEntry: multipleEntry || false,
        notes: notes || null
      }
    });

    // JSON 문자열 파싱해서 반환
    const parsedRequirement = {
      ...requirement,
      visaTypes: JSON.parse(requirement.visaTypes || '[]'),
      requirements: requirement.requirements ? JSON.parse(requirement.requirements) : []
    };

    return NextResponse.json({
      success: true,
      data: parsedRequirement
    });

  } catch (error) {
    console.error('Error creating/updating visa requirement:', error);
    return NextResponse.json(
      { error: 'Failed to save visa requirement' },
      { status: 500 }
    );
  }
}