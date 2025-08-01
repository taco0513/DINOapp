import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { differenceInDays, format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// TODO: Remove unused logger import

// Validation schemas
const TripValidationSchema = z.object({
  destinations: z.array(z.object({
    countryCode: z.string(),
    countryName: z.string(),
    startDate: z.string().transform(date => parseISO(date)),
    endDate: z.string().transform(date => parseISO(date)),
    purpose: z.string().optional(),
  })),
  travelerInfo: z.object({
    nationality: z.string().optional(),
    passportExpiry: z.string().transform(date => parseISO(date)).optional(),
  }).optional(),
});

interface TripDestination {
  countryCode: string;
  countryName: string;
  startDate: Date;
  endDate: Date;
  purpose?: string;
}

interface VisaRequirement {
  countryCode: string;
  countryName: string;
  hasValidVisa: boolean;
  visaRequired: boolean;
  visaInfo: {
    id?: string;
    visaType?: string;
    expiryDate?: string;
    maxStayDays?: number | null;
    remainingDays?: number | null;
  } | null;
  stayDuration: number;
  issues: string[];
  recommendations: string[];
  status: 'valid' | 'warning' | 'invalid' | 'visa_required';
}

interface TripValidationResult {
  tripId: string;
  overallStatus: 'valid' | 'warning' | 'invalid';
  totalDuration: number;
  destinations: VisaRequirement[];
  schengenAnalysis?: {
    totalSchengenDays: number;
    remainingDays: number;
    periodStart: string;
    periodEnd: string;
    violations: string[];
  };
  recommendations: string[];
  actionItems: string[];
}

// POST /api/trip-planning/validate - 여행 계획 비자 검증
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
    const { destinations, travelerInfo } = TripValidationSchema.parse(body);

    // 사용자의 모든 활성 비자 조회
    const userVisas = await prisma.userVisa.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['active', 'expiring_soon']
        },
        expiryDate: {
          gte: new Date()
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    // 기존 체류 기록 조회 (셰겐 계산용)
    const existingVisits = await prisma.countryVisit.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        entryDate: 'desc'
      }
    });

    const tripId = `trip_${Date.now()}`;
    const validationResults: VisaRequirement[] = [];
    const overallIssues: string[] = [];
    const overallRecommendations: string[] = [];

    // 셰겐 국가 목록 (간단한 예시)
    const schengenCountries = [
      'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'GR', 'LU',
      'SE', 'FI', 'DK', 'NO', 'IS', 'CH', 'LI', 'CZ', 'SK', 'HU',
      'PL', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY'
    ];

    let totalSchengenDays = 0;
    const schengenDestinations: TripDestination[] = [];

    // 각 목적지별 검증
    for (const destination of destinations) {
      const stayDuration = differenceInDays(destination.endDate, destination.startDate) + 1;
      
      // 해당 국가의 유효한 비자 찾기
      const availableVisas = userVisas.filter(visa => 
        visa.countryCode === destination.countryCode &&
        new Date(visa.expiryDate) > destination.endDate
      );

      const bestVisa = availableVisas.length > 0 ? availableVisas[0] : null;
      
      const issues: string[] = [];
      const recommendations: string[] = [];
      let status: 'valid' | 'warning' | 'invalid' | 'visa_required' = 'valid';

      // 비자 요구사항 체크
      if (!bestVisa) {
        status = 'visa_required';
        issues.push(`${destination.countryName} 비자가 필요합니다`);
        recommendations.push(`${destination.countryName} 비자를 신청하세요`);
      } else {
        // 비자 만료일 체크
        const daysUntilVisaExpiry = differenceInDays(new Date(bestVisa.expiryDate), destination.endDate);
        if (daysUntilVisaExpiry < 7) {
          status = 'warning';
          issues.push(`비자가 여행 종료 ${daysUntilVisaExpiry}일 후 만료됩니다`);
          recommendations.push('비자 갱신을 고려하세요');
        }

        // 체류 기간 체크
        if (bestVisa.maxStayDays && stayDuration > bestVisa.maxStayDays) {
          status = 'invalid';
          issues.push(`최대 체류기간(${bestVisa.maxStayDays}일) 초과: ${stayDuration}일`);
          recommendations.push('체류 기간을 단축하거나 다른 비자 타입을 고려하세요');
        } else if (bestVisa.maxStayDays && stayDuration > (bestVisa.maxStayDays * 0.8)) {
          status = status === 'valid' ? 'warning' : status;
          issues.push(`체류 기간이 허용 한도의 80%를 초과합니다`);
          recommendations.push('체류 기간을 여유있게 계획하세요');
        }
      }

      // 셰겐 국가인 경우 별도 추적
      if (schengenCountries.includes(destination.countryCode)) {
        totalSchengenDays += stayDuration;
        schengenDestinations.push(destination);
      }

      // 여권 만료일 체크 (제공된 경우)
      if (travelerInfo?.passportExpiry) {
        const daysUntilPassportExpiry = differenceInDays(travelerInfo.passportExpiry, destination.endDate);
        if (daysUntilPassportExpiry < 90) {
          status = 'warning';
          issues.push('여권이 여행 종료 90일 이내에 만료됩니다');
          recommendations.push('여권 갱신을 고려하세요');
        }
      }

      validationResults.push({
        countryCode: destination.countryCode,
        countryName: destination.countryName,
        hasValidVisa: !!bestVisa,
        visaRequired: !bestVisa,
        visaInfo: bestVisa ? {
          id: bestVisa.id,
          visaType: bestVisa.visaType,
          expiryDate: format(new Date(bestVisa.expiryDate), 'yyyy-MM-dd'),
          maxStayDays: bestVisa.maxStayDays,
          remainingDays: bestVisa.maxStayDays ? bestVisa.maxStayDays - stayDuration : null,
        } : null,
        stayDuration,
        issues,
        recommendations,
        status
      });
    }

    // 셰겐 90/180일 규칙 검증
    let schengenAnalysis = null;
    if (schengenDestinations.length > 0) {
      // 간단한 셰겐 분석 (실제로는 더 복잡한 로직 필요)
      const firstSchengenEntry = schengenDestinations[0].startDate;
      const lastSchengenExit = schengenDestinations[schengenDestinations.length - 1].endDate;
      const periodDays = differenceInDays(lastSchengenExit, firstSchengenEntry) + 1;
      
      const violations: string[] = [];
      
      if (totalSchengenDays > 90) {
        violations.push(`셰겐 지역 90일 한도 초과: ${totalSchengenDays}일`);
      }
      
      if (periodDays > 180) {
        violations.push(`셰겐 180일 기간 초과: ${periodDays}일`);
      }

      schengenAnalysis = {
        totalSchengenDays,
        remainingDays: Math.max(0, 90 - totalSchengenDays),
        periodStart: format(firstSchengenEntry, 'yyyy-MM-dd'),
        periodEnd: format(lastSchengenExit, 'yyyy-MM-dd'),
        violations
      };

      if (violations.length > 0) {
        overallIssues.push(...violations);
        overallRecommendations.push('셰겐 여행 계획을 조정하세요');
      }
    }

    // 전체 상태 결정
    const hasInvalidDestinations = validationResults.some(d => d.status === 'invalid');
    const hasWarningDestinations = validationResults.some(d => d.status === 'warning');
    const hasVisaRequiredDestinations = validationResults.some(d => d.status === 'visa_required');
    
    let overallStatus: 'valid' | 'warning' | 'invalid' = 'valid';
    if (hasInvalidDestinations || (schengenAnalysis && schengenAnalysis.violations.length > 0)) {
      overallStatus = 'invalid';
    } else if (hasWarningDestinations || hasVisaRequiredDestinations) {
      overallStatus = 'warning';
    }

    // 액션 아이템 생성
    const actionItems: string[] = [];
    validationResults.forEach(dest => {
      if (dest.status === 'visa_required') {
        actionItems.push(`${dest.countryName} 비자 신청`);
      } else if (dest.status === 'invalid') {
        actionItems.push(`${dest.countryName} 여행 계획 수정`);
      }
    });

    if (schengenAnalysis && schengenAnalysis.violations.length > 0) {
      actionItems.push('셰겐 여행 일정 조정');
    }

    const totalDuration = destinations.reduce((sum, dest) => 
      sum + differenceInDays(dest.endDate, dest.startDate) + 1, 0
    );

    const result: TripValidationResult = {
      tripId,
      overallStatus,
      totalDuration,
      destinations: validationResults,
      schengenAnalysis: schengenAnalysis || undefined,
      recommendations: overallRecommendations,
      actionItems
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid trip data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error validating trip plan:', error);
    return NextResponse.json(
      { error: 'Failed to validate trip plan' },
      { status: 500 }
    );
  }
}