import { prisma } from '@/lib/prisma';
import { 
  differenceInDays, 
  addDays, 
  isAfter, 
  isBefore,
  subDays,
  startOfDay,
  endOfDay
} from 'date-fns';

export interface OverstayWarning {
  id: string;
  visaId: string;
  entryId: string;
  countryName: string;
  countryCode: string;
  warningType: 'approaching' | 'exceeded' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentStayDays: number;
  maxStayDays: number;
  daysRemaining: number;
  entryDate: Date;
  expectedExitDate: Date;
  visaExpiryDate?: Date;
  message: string;
  recommendations: string[];
}

export interface SchengenOverstayWarning extends OverstayWarning {
  schengenDaysUsed: number;
  schengenDaysRemaining: number;
  rollingPeriodEnd: Date;
}

// 체류 초과 경고 확인
export async function checkOverstayWarnings(
  userId: string,
  checkDate: Date = new Date()
): Promise<{
  warnings: OverstayWarning[];
  schengenWarnings: SchengenOverstayWarning[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}> {
  const warnings: OverstayWarning[] = [];
  const schengenWarnings: SchengenOverstayWarning[] = [];

  // 활성 비자와 현재 체류 중인 입국 기록 조회
  const activeVisas = await prisma.userVisa.findMany({
    where: {
      userId,
      status: 'active',
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: checkDate } }
      ]
    },
    include: {
      entries: {
        where: {
          entryDate: { lte: checkDate },
          OR: [
            { exitDate: null }, // 아직 출국하지 않음
            { exitDate: { gte: checkDate } } // 현재 체류 중
          ]
        },
        orderBy: { entryDate: 'desc' }
      }
    }
  });

  // 각 비자별로 체류 초과 확인
  for (const visa of activeVisas) {
    // 현재 체류 중인 입국 기록 확인
    const currentStay = visa.entries.find(entry => 
      !entry.exitDate || isAfter(entry.exitDate, checkDate)
    );

    if (currentStay) {
      const stayDays = differenceInDays(checkDate, currentStay.entryDate) + 1;
      const daysRemaining = visa.maxStayDays - stayDays;
      const expectedExitDate = addDays(currentStay.entryDate, visa.maxStayDays - 1);

      // 셰겐 지역인지 확인
      if (isSchengenCountry(visa.countryCode)) {
        // 셰겐 지역은 별도 로직으로 처리
        const schengenWarning = await checkSchengenOverstay(
          userId,
          visa,
          currentStay,
          checkDate
        );
        if (schengenWarning) {
          schengenWarnings.push(schengenWarning);
        }
      } else {
        // 일반 비자 체류 초과 확인
        let warning: OverstayWarning | null = null;

        if (daysRemaining < 0) {
          // 이미 초과
          warning = {
            id: `${visa.id}-${currentStay.id}`,
            visaId: visa.id,
            entryId: currentStay.id,
            countryName: visa.countryName,
            countryCode: visa.countryCode,
            warningType: 'exceeded',
            severity: 'critical',
            currentStayDays: stayDays,
            maxStayDays: visa.maxStayDays,
            daysRemaining: daysRemaining,
            entryDate: currentStay.entryDate,
            expectedExitDate,
            visaExpiryDate: visa.expiryDate || undefined,
            message: `${visa.countryName} 체류 기간을 ${Math.abs(daysRemaining)}일 초과했습니다!`,
            recommendations: [
              '즉시 출국 계획을 세우세요',
              '현지 이민국에 연락하여 상황을 설명하세요',
              '벌금이나 추가 조치가 필요할 수 있습니다',
              '향후 입국이 거부될 수 있으니 주의하세요'
            ]
          };
        } else if (daysRemaining <= 3) {
          // 3일 이내 초과 예정
          warning = {
            id: `${visa.id}-${currentStay.id}`,
            visaId: visa.id,
            entryId: currentStay.id,
            countryName: visa.countryName,
            countryCode: visa.countryCode,
            warningType: 'critical',
            severity: 'high',
            currentStayDays: stayDays,
            maxStayDays: visa.maxStayDays,
            daysRemaining: daysRemaining,
            entryDate: currentStay.entryDate,
            expectedExitDate,
            visaExpiryDate: visa.expiryDate || undefined,
            message: `${visa.countryName} 체류 기간이 ${daysRemaining}일 남았습니다!`,
            recommendations: [
              '즉시 출국 준비를 시작하세요',
              '항공권을 예약하세요',
              '필요한 서류를 준비하세요',
              '체류 연장이 가능한지 확인하세요'
            ]
          };
        } else if (daysRemaining <= 7) {
          // 7일 이내 초과 예정
          warning = {
            id: `${visa.id}-${currentStay.id}`,
            visaId: visa.id,
            entryId: currentStay.id,
            countryName: visa.countryName,
            countryCode: visa.countryCode,
            warningType: 'approaching',
            severity: 'medium',
            currentStayDays: stayDays,
            maxStayDays: visa.maxStayDays,
            daysRemaining: daysRemaining,
            entryDate: currentStay.entryDate,
            expectedExitDate,
            visaExpiryDate: visa.expiryDate || undefined,
            message: `${visa.countryName} 체류 기간이 ${daysRemaining}일 남았습니다.`,
            recommendations: [
              '출국 계획을 세우세요',
              '항공권 예약을 고려하세요',
              '체류 연장이 필요한 경우 신청하세요'
            ]
          };
        } else if (daysRemaining <= 14) {
          // 14일 이내 초과 예정
          warning = {
            id: `${visa.id}-${currentStay.id}`,
            visaId: visa.id,
            entryId: currentStay.id,
            countryName: visa.countryName,
            countryCode: visa.countryCode,
            warningType: 'approaching',
            severity: 'low',
            currentStayDays: stayDays,
            maxStayDays: visa.maxStayDays,
            daysRemaining: daysRemaining,
            entryDate: currentStay.entryDate,
            expectedExitDate,
            visaExpiryDate: visa.expiryDate || undefined,
            message: `${visa.countryName} 체류 기간이 ${daysRemaining}일 남았습니다.`,
            recommendations: [
              '출국 일정을 계획하세요',
              '다음 여행 목적지를 정하세요'
            ]
          };
        }

        if (warning) {
          // 비자 만료일도 체크
          if (visa.expiryDate && isBefore(visa.expiryDate, expectedExitDate)) {
            warning.severity = 'critical';
            warning.message += ` (비자가 ${visa.expiryDate.toLocaleDateString()}에 만료됩니다)`;
            warning.recommendations.unshift('비자 만료 전에 출국해야 합니다');
          }

          warnings.push(warning);
        }
      }
    }

    // 비자 만료 임박 확인 (체류 중이 아니더라도)
    if (visa.expiryDate) {
      const daysUntilExpiry = differenceInDays(visa.expiryDate, checkDate);
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        const expiryWarning: OverstayWarning = {
          id: `${visa.id}-expiry`,
          visaId: visa.id,
          entryId: '',
          countryName: visa.countryName,
          countryCode: visa.countryCode,
          warningType: 'approaching',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          currentStayDays: 0,
          maxStayDays: visa.maxStayDays,
          daysRemaining: daysUntilExpiry,
          entryDate: checkDate,
          expectedExitDate: visa.expiryDate,
          visaExpiryDate: visa.expiryDate,
          message: `${visa.countryName} 비자가 ${daysUntilExpiry}일 후 만료됩니다.`,
          recommendations: [
            '비자 갱신을 고려하세요',
            '만료 전 여행 계획을 완료하세요',
            '필요한 서류를 미리 준비하세요'
          ]
        };
        warnings.push(expiryWarning);
      }
    }
  }

  // 요약 정보 생성
  const summary = {
    total: warnings.length + schengenWarnings.length,
    critical: [...warnings, ...schengenWarnings].filter(w => w.severity === 'critical').length,
    high: [...warnings, ...schengenWarnings].filter(w => w.severity === 'high').length,
    medium: [...warnings, ...schengenWarnings].filter(w => w.severity === 'medium').length,
    low: [...warnings, ...schengenWarnings].filter(w => w.severity === 'low').length,
  };

  return {
    warnings,
    schengenWarnings,
    summary
  };
}

// 셰겐 지역 체류 초과 확인
async function checkSchengenOverstay(
  userId: string,
  visa: any,
  currentStay: any,
  checkDate: Date
): Promise<SchengenOverstayWarning | null> {
  // 180일 기간 계산
  const periodEnd = checkDate;
  const periodStart = subDays(periodEnd, 179);

  // 해당 기간 동안의 모든 셰겐 지역 입국 기록 조회
  const schengenEntries = await prisma.visaEntry.findMany({
    where: {
      userVisa: {
        userId,
        countryCode: { in: SCHENGEN_COUNTRIES }
      },
      OR: [
        {
          entryDate: { gte: periodStart, lte: periodEnd }
        },
        {
          exitDate: { gte: periodStart, lte: periodEnd }
        },
        {
          entryDate: { lte: periodStart },
          OR: [
            { exitDate: { gte: periodEnd } },
            { exitDate: null }
          ]
        }
      ]
    },
    include: {
      userVisa: {
        select: {
          countryName: true,
          countryCode: true
        }
      }
    },
    orderBy: { entryDate: 'asc' }
  });

  // 셰겐 지역 총 체류일 계산
  let totalDays = 0;
  for (const entry of schengenEntries) {
    const entryDate = entry.entryDate > periodStart ? entry.entryDate : periodStart;
    const exitDate = entry.exitDate && entry.exitDate < periodEnd ? entry.exitDate : periodEnd;
    
    if (!entry.exitDate || isAfter(entry.exitDate, checkDate)) {
      // 현재 체류 중
      totalDays += differenceInDays(checkDate, entryDate) + 1;
    } else {
      totalDays += differenceInDays(exitDate, entryDate) + 1;
    }
  }

  const daysRemaining = 90 - totalDays;
  const currentStayDays = differenceInDays(checkDate, currentStay.entryDate) + 1;

  if (daysRemaining < 14) {
    return {
      id: `schengen-${visa.id}-${currentStay.id}`,
      visaId: visa.id,
      entryId: currentStay.id,
      countryName: visa.countryName,
      countryCode: visa.countryCode,
      warningType: daysRemaining < 0 ? 'exceeded' : (daysRemaining <= 3 ? 'critical' : 'approaching'),
      severity: daysRemaining < 0 ? 'critical' : (daysRemaining <= 3 ? 'high' : (daysRemaining <= 7 ? 'medium' : 'low')),
      currentStayDays,
      maxStayDays: 90,
      daysRemaining,
      entryDate: currentStay.entryDate,
      expectedExitDate: addDays(checkDate, daysRemaining - 1),
      visaExpiryDate: visa.expiryDate || undefined,
      message: daysRemaining < 0 
        ? `셰겐 지역 90/180일 규칙을 ${Math.abs(daysRemaining)}일 초과했습니다!`
        : `셰겐 지역 체류 가능 일수가 ${daysRemaining}일 남았습니다.`,
      recommendations: daysRemaining < 0
        ? [
            '즉시 셰겐 지역을 떠나세요',
            '벌금이나 입국 금지 조치를 받을 수 있습니다',
            '현지 이민국에 상황을 설명하세요'
          ]
        : [
            '셰겐 지역 외 국가로의 여행을 계획하세요',
            '180일 기간이 리셋되는 날짜를 확인하세요',
            '체류 일수를 신중히 관리하세요'
          ],
      schengenDaysUsed: totalDays,
      schengenDaysRemaining: daysRemaining,
      rollingPeriodEnd: periodEnd
    };
  }

  return null;
}

// 셰겐 국가 코드
const SCHENGEN_COUNTRIES = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH'
];

function isSchengenCountry(countryCode: string): boolean {
  return SCHENGEN_COUNTRIES.includes(countryCode.toUpperCase());
}

// 예정된 여행에 대한 체류 초과 예측
export async function predictOverstayForTrip(
  userId: string,
  tripPlan: {
    countryCode: string;
    entryDate: Date;
    exitDate: Date;
  }
): Promise<{
  willExceed: boolean;
  predictedStayDays: number;
  maxAllowedDays: number;
  warnings: string[];
}> {
  const stayDays = differenceInDays(tripPlan.exitDate, tripPlan.entryDate) + 1;

  // 해당 국가의 비자 정보 조회
  const visa = await prisma.userVisa.findFirst({
    where: {
      userId,
      countryCode: tripPlan.countryCode,
      status: 'active'
    }
  });

  if (!visa) {
    return {
      willExceed: true,
      predictedStayDays: stayDays,
      maxAllowedDays: 0,
      warnings: ['해당 국가의 유효한 비자가 없습니다']
    };
  }

  const warnings: string[] = [];
  let willExceed = false;
  let maxAllowedDays = visa.maxStayDays;

  // 기본 체류 기간 확인
  if (stayDays > visa.maxStayDays) {
    willExceed = true;
    warnings.push(`계획된 체류 기간(${stayDays}일)이 비자 허용 기간(${visa.maxStayDays}일)을 초과합니다`);
  }

  // 비자 만료일 확인
  if (visa.expiryDate && isAfter(tripPlan.exitDate, visa.expiryDate)) {
    willExceed = true;
    warnings.push(`출국 예정일이 비자 만료일(${visa.expiryDate.toLocaleDateString()})을 초과합니다`);
  }

  // 셰겐 지역인 경우 90/180 규칙 확인
  if (isSchengenCountry(tripPlan.countryCode)) {
    const periodEnd = tripPlan.exitDate;
    const periodStart = subDays(periodEnd, 179);

    const schengenEntries = await prisma.visaEntry.findMany({
      where: {
        userVisa: {
          userId,
          countryCode: { in: SCHENGEN_COUNTRIES }
        },
        OR: [
          {
            entryDate: { gte: periodStart, lte: periodEnd }
          },
          {
            exitDate: { gte: periodStart, lte: periodEnd }
          }
        ]
      }
    });

    let totalDays = stayDays;
    for (const entry of schengenEntries) {
      const entryDate = entry.entryDate > periodStart ? entry.entryDate : periodStart;
      const exitDate = entry.exitDate && entry.exitDate < periodEnd ? entry.exitDate : periodEnd;
      totalDays += differenceInDays(exitDate, entryDate) + 1;
    }

    if (totalDays > 90) {
      willExceed = true;
      warnings.push(`셰겐 지역 90/180일 규칙을 위반합니다 (예상 총 체류: ${totalDays}일)`);
      maxAllowedDays = Math.min(maxAllowedDays, 90 - (totalDays - stayDays));
    }
  }

  return {
    willExceed,
    predictedStayDays: stayDays,
    maxAllowedDays,
    warnings
  };
}