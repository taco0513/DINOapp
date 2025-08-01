import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { externalVisaApiService } from '@/lib/visa/external-visa-api';

// GET /api/visa-requirements - 비자 요구사항 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fromCountry = searchParams.get('from');
    const toCountry = searchParams.get('to');

    // 특정 국가 간 비자 요구사항 조회
    if (fromCountry && toCountry) {
      // 1. 로컬 데이터베이스에서 먼저 조회
      const localRequirement = await prisma.visaRequirement.findUnique({
        where: {
          fromCountry_toCountry: {
            fromCountry: fromCountry.toUpperCase(),
            toCountry: toCountry.toUpperCase(),
          },
        },
      });

      // 2. 외부 API에서 실시간 정보 조회 (백그라운드)
      let externalInfo = null;
      try {
        externalInfo = await externalVisaApiService.getVisaInfoWithFallback(
          fromCountry.toUpperCase(),
          toCountry.toUpperCase()
        );
      } catch (error) {
        console.warn('외부 API 조회 실패:', error);
      }

      // 3. 데이터 통합 및 우선순위 결정
      let finalRequirement = null;

      if (localRequirement) {
        // 로컬 데이터가 있는 경우
        finalRequirement = {
          ...localRequirement,
          visaTypes: JSON.parse(localRequirement.visaTypes || '[]'),
          requirements: localRequirement.requirements
            ? JSON.parse(localRequirement.requirements)
            : [],
          source: 'local',
          isUpToDate: true,
        };

        // 외부 API 정보가 있고 더 최신인 경우 업데이트
        if (
          externalInfo &&
          isExternalDataNewer(localRequirement, externalInfo)
        ) {
          finalRequirement = {
            ...finalRequirement,
            ...externalInfo,
            source: 'external',
            isUpToDate: true,
            externalSource: externalInfo.source,
          };

          // 백그라운드에서 로컬 DB 업데이트
          updateLocalDataInBackground(localRequirement.id, externalInfo);
        }
      } else if (externalInfo) {
        // 로컬 데이터가 없고 외부 API만 있는 경우
        finalRequirement = {
          ...externalInfo,
          source: 'external',
          isUpToDate: true,
          externalSource: externalInfo.source,
        };

        // 백그라운드에서 로컬 DB에 추가
        saveToLocalDataInBackground(externalInfo);
      }

      if (!finalRequirement) {
        return NextResponse.json(
          {
            error: 'Visa requirement not found',
            suggestion:
              'Try checking official government websites for the most up-to-date information',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: finalRequirement,
      });
    }

    // 사용자의 여권 국가 기준 모든 비자 요구사항 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passportCountry: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // fromCountry가 지정되지 않은 경우 사용자의 여권 국가 사용
    const passportCountry = fromCountry || user.passportCountry || 'KR';

    const requirements = await prisma.visaRequirement.findMany({
      where: {
        fromCountry: passportCountry.toUpperCase(),
      },
      orderBy: {
        toCountry: 'asc',
      },
    });

    // JSON 문자열 파싱
    const parsedRequirements = requirements.map(req => ({
      ...req,
      visaTypes: JSON.parse(req.visaTypes || '[]'),
      requirements: req.requirements ? JSON.parse(req.requirements) : [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedRequirements,
      passportCountry,
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      notes,
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
          toCountry: toCountry.toUpperCase(),
        },
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
        notes: notes || null,
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
        notes: notes || null,
      },
    });

    // JSON 문자열 파싱해서 반환
    const parsedRequirement = {
      ...requirement,
      visaTypes: JSON.parse(requirement.visaTypes || '[]'),
      requirements: requirement.requirements
        ? JSON.parse(requirement.requirements)
        : [],
    };

    return NextResponse.json({
      success: true,
      data: parsedRequirement,
    });
  } catch (error) {
    console.error('Error creating/updating visa requirement:', error);
    return NextResponse.json(
      { error: 'Failed to save visa requirement' },
      { status: 500 }
    );
  }
}

// 헬퍼 함수들
function isExternalDataNewer(localData: any, externalData: any): boolean {
  const localDate = new Date(localData.lastUpdated);
  const externalDate = new Date(externalData.lastUpdated);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 로컬 데이터가 24시간 이상 오래되었거나, 외부 데이터가 더 최신인 경우
  return localDate < oneDayAgo || externalDate > localDate;
}

async function updateLocalDataInBackground(
  localId: string,
  externalData: any
): Promise<void> {
  try {
    await prisma.visaRequirement.update({
      where: { id: localId },
      data: {
        visaRequired: externalData.visaRequired,
        visaFreeStay: externalData.visaFreeStay,
        processingTime: externalData.processingTime,
        cost: externalData.cost,
        requirements: JSON.stringify(externalData.requirements || []),
        notes: `Updated from ${externalData.source} API`,
        lastUpdated: new Date(),
      },
    });
    console.log(`로컬 DB 업데이트 완료: ${localId}`);
  } catch (error) {
    console.error('로컬 DB 업데이트 실패:', error);
  }
}

async function saveToLocalDataInBackground(externalData: any): Promise<void> {
  try {
    await prisma.visaRequirement.create({
      data: {
        fromCountry: externalData.fromCountry,
        toCountry: externalData.toCountry,
        visaRequired: externalData.visaRequired,
        visaFreeStay: externalData.visaFreeStay,
        visaTypes: JSON.stringify([]), // 외부 API에서 타입 정보가 없는 경우
        processingTime: externalData.processingTime,
        cost: externalData.cost,
        requirements: JSON.stringify(externalData.requirements || []),
        multipleEntry: false, // 기본값
        notes: `Added from ${externalData.source} API`,
      },
    });
    console.log(
      `새 데이터 로컬 DB 저장 완료: ${externalData.fromCountry}-${externalData.toCountry}`
    );
  } catch (error) {
    console.error('로컬 DB 저장 실패:', error);
  }
}
