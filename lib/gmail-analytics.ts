import { TravelInfo } from './gmail';

// 공항 코드 매핑
const airportCodes: Record<string, string> = {
  ICN: '인천국제공항',
  GMP: '김포국제공항',
  CJU: '제주국제공항',
  PUS: '부산김해국제공항',
  TAE: '대구국제공항',
  NRT: '나리타국제공항',
  HND: '하네다공항',
  KIX: '간사이국제공항',
  PVG: '푸동국제공항',
  TPE: '타오위안국제공항',
  BKK: '수완나품공항',
  SIN: '창이공항',
  LAX: '로스앤젤레스국제공항',
  JFK: '존F케네디국제공항',
  LHR: '히스로공항',
  CDG: '샤를드골공항',
  FRA: '프랑크푸르트공항',
  DXB: '두바이국제공항',
  HKG: '홍콩국제공항',
  KUL: '쿠알라룸푸르국제공항',
  MNL: '니노이아키노국제공항',
  SYD: '킹스포드스미스공항',
  MEL: '멜버른공항',
};

// 항공사 코드 매핑
const airlineCodes: Record<string, string> = {
  KE: '대한항공',
  OZ: '아시아나항공',
  TW: '티웨이항공',
  ZE: '이스타항공',
  LJ: '진에어',
  BX: '에어부산',
  RS: '에어서울',
  JL: '일본항공',
  NH: '전일본공수',
  CA: '중국국제항공',
  MU: '중국동방항공',
  CZ: '중국남방항공',
  TG: '타이항공',
  SQ: '싱가포르항공',
  QF: '콴타스항공',
  UA: '유나이티드항공',
  AA: '아메리칸항공',
  DL: '델타항공',
  LH: '루프트한자',
  AF: '에어프랑스',
  BA: '브리티시에어웨이즈',
  EK: '에미레이트항공',
  QR: '카타르항공',
  TK: '터키항공',
};

export interface TravelStats {
  totalTrips: number;
  totalAirlines: number;
  totalDestinations: number;
  mostVisitedDestinations: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  preferredAirlines: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  travelFrequency: {
    domestic: number;
    international: number;
    averageTripsPerMonth: number;
  };
  upcomingTrips: TravelInfo[];
  recentTrips: TravelInfo[];
  travelPattern: {
    busyMonths: string[];
    quietMonths: string[];
    averageTripDuration: number;
  };
}

export interface TravelInsight {
  type: 'info' | 'tip' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable?: boolean;
  action?: string;
}

/**
 * 여행 통계 생성
 */
export function generateTravelStats(travelInfos: TravelInfo[]): TravelStats {
  const now = new Date();
  const oneMonthFromNow = new Date(now);
  oneMonthFromNow.setMonth(now.getMonth() + 1);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const _totalTrips = travelInfos.length;
  const destinations = new Map<string, number>();
  const airlines = new Map<string, number>();
  const upcomingTrips: TravelInfo[] = [];
  const recentTrips: TravelInfo[] = [];
  const monthlyTrips = new Map<string, number>();

  for (const trip of travelInfos) {
    // 목적지 카운트
    if (trip.destination) {
      destinations.set(
        trip.destination,
        (destinations.get(trip.destination) || 0) + 1
      );
    }

    // 항공사 카운트
    if (trip.flightNumber) {
      const airlineCode = trip.flightNumber.substring(0, 2);
      airlines.set(airlineCode, (airlines.get(airlineCode) || 0) + 1);
    }

    if (trip.departureDate) {
      try {
        const departureDate = new Date(trip.departureDate);

        // 예정된 여행
        if (departureDate > now && departureDate <= oneMonthFromNow) {
          upcomingTrips.push(trip);
        }

        // 최근 여행
        if (departureDate >= sixMonthsAgo && departureDate <= now) {
          recentTrips.push(trip);
        }

        // 월별 통계
        const monthKey = `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyTrips.set(monthKey, (monthlyTrips.get(monthKey) || 0) + 1);
      } catch (__error) {
        // Invalid date format
      }
    }
  }

  // 상위 목적지
  const _mostVisitedDestinations = Array.from(destinations.entries())
    .map(([code, count]) => ({
      code,
      name: airportCodes[code as keyof typeof airportCodes] || code,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 선호 항공사
  const _preferredAirlines = Array.from(airlines.entries())
    .map(([code, count]) => ({
      code,
      name: airlineCodes[code as keyof typeof airlineCodes] || code,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 여행 빈도
  const domesticAirports = ['ICN', 'GMP', 'CJU', 'PUS', 'TAE']; // 한국 주요 공항
  const domesticTrips = travelInfos.filter(
    trip => trip.destination && domesticAirports.includes(trip.destination)
  ).length;
  const _internationalTrips = totalTrips - domesticTrips;

  const _averageTripsPerMonth =
    monthlyTrips.size > 0
      ? Array.from(monthlyTrips.values()).reduce(
          (sum, count) => sum + count,
          0
        ) / monthlyTrips.size
      : 0;

  // 여행 패턴 분석
  const monthCounts = new Map<number, number>();
  for (const trip of travelInfos) {
    if (trip.departureDate) {
      try {
        const date = new Date(trip.departureDate);
        const month = date.getMonth();
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      } catch (__error) {
        // 잘못된 날짜 형식 무시
      }
    }
  }

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const sortedMonths = Array.from(monthCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const _busyMonths = sortedMonths
    .slice(0, 3)
    .map(([month]) => monthNames[month]);
  const _quietMonths = sortedMonths
    .slice(-3)
    .map(([month]) => monthNames[month]);

  // 평균 여행 기간 계산 (왕복 여행 기준)
  let totalDuration = 0;
  let tripWithDuration = 0;

  for (const trip of travelInfos) {
    if (trip.departureDate && trip.returnDate) {
      try {
        const depDate = new Date(trip.departureDate);
        const retDate = new Date(trip.returnDate);
        const duration =
          (retDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24);

        if (duration > 0 && duration < 365) {
          // 유효한 기간만
          totalDuration += duration;
          tripWithDuration++;
        }
      } catch (__error) {
        // 잘못된 날짜 형식 무시
      }
    }
  }

  const averageTripDuration =
    tripWithDuration > 0 ? Math.round(totalDuration / tripWithDuration) : 0;

  return {
    totalTrips,
    totalAirlines: airlines.size,
    totalDestinations: destinations.size,
    mostVisitedDestinations,
    preferredAirlines,
    travelFrequency: {
      domestic: domesticTrips,
      international: internationalTrips,
      averageTripsPerMonth: Math.round(averageTripsPerMonth * 10) / 10,
    },
    upcomingTrips: upcomingTrips.sort(
      (a, b) =>
        new Date(a.departureDate || '').getTime() -
        new Date(b.departureDate || '').getTime()
    ),
    recentTrips: recentTrips
      .sort(
        (a, b) =>
          new Date(b.departureDate || '').getTime() -
          new Date(a.departureDate || '').getTime()
      )
      .slice(0, 5),
    travelPattern: {
      busyMonths,
      quietMonths,
      averageTripDuration,
    },
  };
}

/**
 * 개인화된 여행 인사이트 생성
 */
export function generateTravelInsights(
  stats: TravelStats,
  travelInfos: TravelInfo[]
): TravelInsight[] {
  const insights: TravelInsight[] = [];
  const now = new Date();

  // 예정된 여행 알림
  if (stats.upcomingTrips.length > 0) {
    const nextTrip = stats.upcomingTrips[0];
    const daysUntilTrip = Math.ceil(
      (new Date(nextTrip.departureDate || '').getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    insights.push({
      type: 'info',
      title: '다가오는 여행',
      description: `${daysUntilTrip}일 후 ${nextTrip.destination ? airportCodes[nextTrip.destination as keyof typeof airportCodes] || nextTrip.destination : '목적지'}로 출발 예정입니다.`,
      actionable: true,
      action: '체크인 준비하기',
    });
  }

  // 여행 빈도 분석
  if (stats.travelFrequency.averageTripsPerMonth > 2) {
    insights.push({
      type: 'achievement',
      title: '여행 애호가',
      description: `월평균 ${stats.travelFrequency.averageTripsPerMonth}회 여행을 다니시는 활발한 여행자입니다!`,
    });
  }

  // 선호 항공사 분석
  if (stats.preferredAirlines.length > 0) {
    const topAirline = stats.preferredAirlines[0];
    if (topAirline.count >= 3) {
      insights.push({
        type: 'tip',
        title: '마일리지 최적화',
        description: `${topAirline.name}을(를) 자주 이용하시네요. 마일리지 프로그램을 확인해보세요.`,
        actionable: true,
        action: '마일리지 조회하기',
      });
    }
  }

  // 목적지 다양성 분석
  if (stats.totalDestinations >= 10) {
    insights.push({
      type: 'achievement',
      title: '세계 여행가',
      description: `${stats.totalDestinations}개 도시를 방문하셨습니다. 정말 다양한 경험을 쌓고 계시네요!`,
    });
  }

  // 계절별 여행 패턴
  if (stats.travelPattern.busyMonths.length > 0) {
    insights.push({
      type: 'info',
      title: '여행 패턴 분석',
      description: `${stats.travelPattern.busyMonths.join(', ')}에 주로 여행을 다니시는 경향이 있습니다.`,
    });
  }

  // 평균 여행 기간 분석
  if (stats.travelPattern.averageTripDuration > 0) {
    let tripTypeDescription = '';
    if (stats.travelPattern.averageTripDuration <= 3) {
      tripTypeDescription = '주로 단기 여행을 선호하시네요.';
    } else if (stats.travelPattern.averageTripDuration <= 7) {
      tripTypeDescription = '일주일 내외의 적당한 길이 여행을 즐기시네요.';
    } else {
      tripTypeDescription = '장기 여행을 즐기는 여유로운 여행자시네요.';
    }

    insights.push({
      type: 'info',
      title: '여행 스타일',
      description: `평균 ${stats.travelPattern.averageTripDuration}일간 여행하시며, ${tripTypeDescription}`,
    });
  }

  // 국내/해외 여행 비율
  const totalTrips =
    stats.travelFrequency.domestic + stats.travelFrequency.international;
  if (totalTrips > 0) {
    const internationalRatio = Math.round(
      (stats.travelFrequency.international / totalTrips) * 100
    );

    if (internationalRatio >= 70) {
      insights.push({
        type: 'tip',
        title: '해외여행 전문가',
        description: `해외여행 비율이 ${internationalRatio}%입니다. 여행자 보험과 비자 관리에 신경쓰세요.`,
        actionable: true,
        action: '비자 현황 확인하기',
      });
    } else if (internationalRatio <= 30) {
      insights.push({
        type: 'tip',
        title: '국내여행 마니아',
        description: `국내여행을 많이 다니시네요. 숨겨진 국내 명소를 더 탐험해보세요!`,
      });
    }
  }

  // 데이터 품질 경고
  const lowConfidenceTrips = travelInfos.filter(
    trip => trip.confidence < 0.5
  ).length;
  if (lowConfidenceTrips > 0) {
    insights.push({
      type: 'warning',
      title: '데이터 정확성',
      description: `${lowConfidenceTrips}개의 여행 정보가 불완전합니다. 수동으로 확인해보세요.`,
      actionable: true,
      action: '데이터 검토하기',
    });
  }

  return insights;
}

/**
 * 여행 달력 데이터 생성 (월별 뷰)
 */
export function generateTravelCalendar(
  travelInfos: TravelInfo[],
  year?: number,
  month?: number
) {
  const targetDate = new Date(
    year || new Date().getFullYear(),
    month || new Date().getMonth()
  );
  const startOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  );

  const calendarEvents = [];

  for (const trip of travelInfos) {
    if (trip.departureDate) {
      try {
        const depDate = new Date(trip.departureDate);

        // 해당 월에 포함되는 여행만 필터링
        if (depDate >= startOfMonth && depDate <= endOfMonth) {
          calendarEvents.push({
            date: depDate.toISOString().split('T')[0],
            type: 'departure',
            title: `출발: ${trip.destination ? airportCodes[trip.destination as keyof typeof airportCodes] || trip.destination : '목적지 미상'}`,
            flightNumber: trip.flightNumber,
            confidence: trip.confidence,
            trip,
          });
        }

        // 귀국 날짜도 추가
        if (trip.returnDate) {
          const retDate = new Date(trip.returnDate);
          if (retDate >= startOfMonth && retDate <= endOfMonth) {
            calendarEvents.push({
              date: retDate.toISOString().split('T')[0],
              type: 'return',
              title: `귀국: ${trip.departure ? airportCodes[trip.departure as keyof typeof airportCodes] || trip.departure : '출발지 미상'}`,
              flightNumber: trip.flightNumber,
              confidence: trip.confidence,
              trip,
            });
          }
        }
      } catch (__error) {
        // Invalid date in trip
      }
    }
  }

  return calendarEvents.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 여행 비용 예측 (기본적인 추정)
 */
export function estimateTravelCosts(stats: TravelStats) {
  // 매우 기본적인 비용 추정 (실제 비용은 매우 다를 수 있음)
  const domesticAvgCost = 300000; // 원
  const internationalAvgCost = 1200000; // 원

  const estimatedDomesticCost =
    stats.travelFrequency.domestic * domesticAvgCost;
  const estimatedInternationalCost =
    stats.travelFrequency.international * internationalAvgCost;

  return {
    domestic: estimatedDomesticCost,
    international: estimatedInternationalCost,
    total: estimatedDomesticCost + estimatedInternationalCost,
    disclaimer:
      '이 비용은 매우 기본적인 추정치이며, 실제 비용과 차이가 클 수 있습니다.',
  };
}
