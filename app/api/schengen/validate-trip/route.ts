import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { validateFutureTrip } from '@/lib/schengen-calculator';
import { validateFutureTripWithVisas } from '@/lib/schengen/enhanced-calculator';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

// Validation schema
const ValidateTripSchema = z.object({
  plannedEntry: z.string().transform(date => new Date(date)),
  plannedExit: z.string().transform(date => new Date(date)),
  plannedCountry: z.string(),
  visaId: z.string().optional(),
});

// POST /api/schengen/validate-trip - 미래 여행 유효성 검증
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
    const { plannedEntry, plannedExit, plannedCountry, visaId } = ValidateTripSchema.parse(body);

    // 날짜 유효성 검증
    if (plannedExit <= plannedEntry) {
      return NextResponse.json(
        { error: 'Exit date must be after entry date' },
        { status: 400 }
      );
    }

    if (plannedEntry < new Date()) {
      return NextResponse.json(
        { error: 'Entry date must be in the future' },
        { status: 400 }
      );
    }

    // 사용자 데이터 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        countryVisits: {
          orderBy: { entryDate: 'desc' },
        },
        userVisas: {
          where: {
            status: 'active',
          },
          include: {
            visaEntries: {
              orderBy: { entryDate: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // CountryVisit 데이터 포맷팅
    const countryVisits = user.countryVisits.map(visit => ({
      id: visit.id,
      userId: visit.userId,
      country: visit.country,
      entryDate: visit.entryDate.toISOString().split('T')[0],
      exitDate: visit.exitDate?.toISOString().split('T')[0] || null,
      visaType: visit.visaType as any,
      maxDays: visit.maxDays,
      passportCountry: visit.passportCountry as any,
      notes: visit.notes || undefined,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
    }));

    // VisaEntry 데이터 포맷팅
    const visaEntries = user.userVisas.flatMap(visa => 
      visa.visaEntries.map(entry => ({
        id: entry.id,
        userVisaId: entry.userVisaId,
        entryDate: entry.entryDate,
        exitDate: entry.exitDate || undefined,
        stayDays: entry.stayDays || undefined,
        purpose: entry.purpose || undefined,
        userVisa: {
          countryCode: visa.countryCode,
          countryName: visa.countryName,
          visaType: visa.visaType,
          maxStayDays: visa.maxStayDays || undefined,
          expiryDate: visa.expiryDate,
        },
      }))
    );

    let validation;

    if (visaId) {
      // 비자 ID가 제공된 경우 - 비자별 상세 검증
      const userVisa = user.userVisas.find(v => v.id === visaId);
      
      if (!userVisa) {
        return NextResponse.json(
          { error: 'Specified visa not found' },
          { status: 404 }
        );
      }

      // 비자 국가 일치 확인
      if (userVisa.countryName !== plannedCountry) {
        return NextResponse.json(
          { 
            error: `Visa is for ${userVisa.countryName}, but planned destination is ${plannedCountry}`,
            suggestions: ['Select the correct visa for your destination country']
          },
          { status: 400 }
        );
      }

      validation = validateFutureTripWithVisas(
        countryVisits,
        visaEntries,
        plannedEntry,
        plannedExit,
        plannedCountry,
        visaId
      );
    } else {
      // 기본 셰겐 규칙만 검증
      const schengenValidation = validateFutureTrip(
        countryVisits,
        plannedEntry,
        plannedExit,
        plannedCountry
      );

      validation = {
        schengenValidation,
        visaValidation: {
          hasValidVisa: false,
          warnings: ['비자가 선택되지 않았습니다.'],
          suggestions: ['해당 국가의 비자를 선택하여 더 정확한 검증을 받으세요.'],
        },
      };
    }

    // 응답 데이터 구성
    const response = {
      success: true,
      data: {
        plannedTrip: {
          country: plannedCountry,
          entryDate: plannedEntry.toISOString().split('T')[0],
          exitDate: plannedExit.toISOString().split('T')[0],
          duration: Math.ceil(
            (plannedExit.getTime() - plannedEntry.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1,
        },
        schengenValidation: validation.schengenValidation,
        visaValidation: validation.visaValidation,
        overall: {
          canTravel: validation.schengenValidation.canTravel && 
                    (validation.visaValidation.hasValidVisa || !visaId),
          criticalWarnings: [
            ...validation.schengenValidation.warnings.filter(w => w.includes('🚫')),
            ...validation.visaValidation.warnings.filter(w => w.includes('🚨')),
          ],
          recommendations: [
            ...validation.schengenValidation.suggestions,
            ...validation.visaValidation.suggestions,
          ],
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Error validating trip:', error);
    return NextResponse.json(
      { error: 'Failed to validate trip' },
      { status: 500 }
    );
  }
}