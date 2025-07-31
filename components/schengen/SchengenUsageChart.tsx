'use client';

interface SchengenDay {
  date: string;
  days: number;
  isSchengen: boolean;
  country?: string;
}

interface SchengenUsageChartProps {
  visits?: Array<{
    id: string;
    country: string;
    entryDate: string;
    exitDate: string | null;
    visaType: string;
  }>;
}

export default function SchengenUsageChart({
  visits = [],
}: SchengenUsageChartProps) {
  // 셰겐 국가 목록
  const schengenCountries = [
    'Austria',
    'Belgium',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Netherlands',
    'Norway',
    'Poland',
    'Portugal',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
  ];

  // 180일간의 데이터 계산
  const calculateUsageData = () => {
    const today = new Date();
    const data: SchengenDay[] = [];

    // 180일간의 날짜 생성 (과거 90일 + 오늘 + 미래 89일)
    for (let i = -90; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // 해당 날짜의 셰겐 사용일수 계산
      let usedDays = 0;
      const windowStart = new Date(date);
      windowStart.setDate(date.getDate() - 180);

      visits.forEach(visit => {
        if (!schengenCountries.includes(visit.country)) return;

        const entryDate = new Date(visit.entryDate);
        const exitDate = visit.exitDate ? new Date(visit.exitDate) : new Date();

        // 180일 윈도우와 여행 기간의 교집합 계산
        const overlapStart = new Date(
          Math.max(windowStart.getTime(), entryDate.getTime())
        );
        const overlapEnd = new Date(
          Math.min(date.getTime(), exitDate.getTime())
        );

        if (overlapStart <= overlapEnd) {
          const days =
            Math.ceil(
              (overlapEnd.getTime() - overlapStart.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
          usedDays += Math.max(0, days);
        }
      });

      data.push({
        date: date.toISOString().split('T')[0],
        days: Math.min(usedDays, 90), // 90일 최대값
        isSchengen: usedDays > 0,
        country: visits.find(v => {
          const entryDate = new Date(v.entryDate);
          const exitDate = v.exitDate ? new Date(v.exitDate) : new Date();
          return (
            date >= entryDate &&
            date <= exitDate &&
            schengenCountries.includes(v.country)
          );
        })?.country,
      });
    }

    return data;
  };

  const usageData = calculateUsageData();
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = usageData.find(d => d.date === today)?.days || 0;

  return (
    <div>
      {/* 차트 헤더 */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='font-medium'>180일 롤링 윈도우</h4>
          <p className='text-sm text-secondary'>
            현재 사용:{' '}
            <span
              className='font-medium'
              style={{
                color:
                  currentUsage > 75
                    ? 'var(--color-error)'
                    : currentUsage > 60
                      ? 'var(--color-warning)'
                      : 'var(--color-success)',
              }}
            >
              {currentUsage}/90일
            </span>
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm text-secondary'>안전 여유분</div>
          <div
            className='font-medium'
            style={{
              color:
                90 - currentUsage > 15
                  ? 'var(--color-success)'
                  : 'var(--color-warning)',
            }}
          >
            {90 - currentUsage}일
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div
        style={{
          height: '200px',
          position: 'relative',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Y축 레이블 */}
        <div
          style={{
            position: 'absolute',
            left: '0',
            top: '16px',
            bottom: '32px',
            width: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>90</span>
          <span>60</span>
          <span>30</span>
          <span>0</span>
        </div>

        {/* 차트 그래프 */}
        <div
          style={{
            marginLeft: '50px',
            height: 'calc(100% - 32px)',
            position: 'relative',
            display: 'flex',
            alignItems: 'end',
            gap: '1px',
          }}
        >
          {usageData.map((day, index) => {
            const isToday = day.date === today;
            const height = (day.days / 90) * 100;
            const isPast = new Date(day.date) < new Date(today);

            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  backgroundColor: isToday
                    ? 'var(--color-primary)'
                    : day.days > 75
                      ? 'var(--color-error)'
                      : day.days > 60
                        ? 'var(--color-warning)'
                        : day.days > 0
                          ? 'var(--color-success)'
                          : 'var(--color-border)',
                  opacity: isPast ? 0.7 : 1,
                  borderRadius: '1px',
                  position: 'relative',
                  minHeight: '2px',
                }}
                title={`${day.date}: ${day.days}일 사용${day.country ? ` (${day.country})` : ''}`}
              >
                {isToday && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: 'var(--color-primary)',
                      fontWeight: 'bold',
                    }}
                  >
                    오늘
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* X축 레이블 */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50px',
            right: '16px',
            height: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>-90일</span>
          <span>-30일</span>
          <span>오늘</span>
          <span>+30일</span>
          <span>+90일</span>
        </div>
      </div>

      {/* 범례 */}
      <div className='flex flex-wrap gap-4 mt-4 text-sm'>
        <div className='flex items-center gap-2'>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--color-success)',
              borderRadius: '2px',
            }}
          />
          <span>안전 (0-60일)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--color-warning)',
              borderRadius: '2px',
            }}
          />
          <span>주의 (61-75일)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--color-error)',
              borderRadius: '2px',
            }}
          />
          <span>위험 (76-90일)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '2px',
            }}
          />
          <span>오늘</span>
        </div>
      </div>

      {/* 경고 메시지 */}
      {currentUsage > 75 && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
            border: '1px solid var(--color-error)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          ⚠️ <strong>주의:</strong> 셰겐 지역 체류일수가 한계에 근접했습니다.
          향후 여행 계획을 신중히 검토하세요.
        </div>
      )}

      {visits.length === 0 && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '8px',
            border: '1px dashed var(--color-border)',
          }}
        >
          <p className='text-secondary'>
            여행 기록을 추가하면 실제 셰겐 사용 현황을 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
