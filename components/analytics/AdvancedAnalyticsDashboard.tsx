'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { // TrendingUp, 
  // Users, 
  Clock, 
  MousePointer, 
  // Globe,
  // Smartphone,
  // Monitor,
  BarChart as BarChartIcon } from 'lucide-react'
import { logger } from '@/lib/logger'
// Replaced recharts with Chart.js components
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  convertRechartsData,
  chartColors
} from '@/components/charts/ChartComponents';

interface UserBehaviorData {
  pageViews: Array<{ page: string; views: number; avgTime: number }>;
  userFlow: Array<{ source: string; target: string; value: number }>;
  deviceTypes: Array<{ device: string; count: number }>;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
}

interface ConversionData {
  funnelSteps: Array<{ step: string; users: number; dropoff: number }>;
  conversionRate: number;
  goalCompletions: Array<{ goal: string; completions: number; value: number }>;
}

interface RetentionData {
  cohortRetention: Array<{ cohort: string; day0: number; day7: number; day30: number }>;
  churnRate: number;
  lifetimeValue: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [behavior, conversion, retention] = await Promise.all([
        fetch(`/api/analytics/behavior?range=${dateRange}`).then(r => r.json()),
        fetch(`/api/analytics/conversion?range=${dateRange}`).then(r => r.json()),
        fetch(`/api/analytics/retention?range=${dateRange}`).then(r => r.json()),
      ]);

      setUserBehavior(behavior);
      setConversionData(conversion);
      setRetentionData(retention);
    } catch (error) {
      // Use dynamic import to avoid server-side issues
      import('@/lib/logger').then(({ logger }) => {
        logger.error('Failed to fetch analytics data', { error });
      });
    } finally {
      setLoading(false);
    }
  };

  // Using chartColors from ChartComponents

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 날짜 범위 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">고급 분석</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {range === '7d' && '7일'}
              {range === '30d' && '30일'}
              {range === '90d' && '90일'}
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      {userBehavior && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 세션 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(userBehavior.avgSessionDuration / 60)}분 {userBehavior.avgSessionDuration % 60}초
              </div>
              <p className="text-xs text-muted-foreground">페이지당 평균 체류 시간</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이탈률</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBehavior.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">단일 페이지 세션 비율</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">세션당 페이지</CardTitle>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBehavior.pagesPerSession.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">평균 페이지뷰 수</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 상세 분석 탭 */}
      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList>
          <TabsTrigger value="behavior">사용자 행동</TabsTrigger>
          <TabsTrigger value="conversion">전환 분석</TabsTrigger>
          <TabsTrigger value="retention">리텐션</TabsTrigger>
          <TabsTrigger value="funnel">퍼널 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 페이지별 조회수 */}
            <Card>
              <CardHeader>
                <CardTitle>인기 페이지</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height={320}>
                    <BarChart 
                      data={convertRechartsData(
                        userBehavior?.pageViews.slice(0, 10) || [], 
                        ['views'], 
                        [chartColors.primary[0]]
                      )}
                      height={320}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 디바이스 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>디바이스 유형</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height={320}>
                    <PieChart 
                      data={{
                        labels: userBehavior?.deviceTypes.map(item => item.device) || [],
                        datasets: [{
                          label: '디바이스 수',
                          data: userBehavior?.deviceTypes.map(item => item.count) || [],
                          backgroundColor: chartColors.primary.slice(0, userBehavior?.deviceTypes.length || 0),
                          borderWidth: 2,
                          borderColor: '#ffffff',
                        }]
                      }}
                      height={320}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          {conversionData && (
            <>
              {/* 전환율 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle>전체 전환율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversionData.conversionRate.toFixed(2)}%</div>
                  <p className="text-sm text-muted-foreground">방문자 대비 목표 달성률</p>
                </CardContent>
              </Card>

              {/* 목표별 완료 */}
              <Card>
                <CardHeader>
                  <CardTitle>목표 달성</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer height={320}>
                      <BarChart 
                        data={convertRechartsData(
                          conversionData.goalCompletions, 
                          ['completions', 'value'], 
                          [chartColors.primary[0], chartColors.primary[1]]
                        )}
                        height={320}
                      />
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          {retentionData && (
            <>
              {/* 리텐션 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>이탈률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{retentionData.churnRate.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">월간 사용자 이탈률</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>평생 가치 (LTV)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">₩{retentionData.lifetimeValue.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">사용자당 평균 수익</p>
                  </CardContent>
                </Card>
              </div>

              {/* 코호트 리텐션 */}
              <Card>
                <CardHeader>
                  <CardTitle>코호트 리텐션</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer height={320}>
                      <BarChart 
                        data={convertRechartsData(
                          retentionData.cohortRetention, 
                          ['day0', 'day7', 'day30'], 
                          [chartColors.primary[0], chartColors.primary[1], chartColors.primary[2]]
                        )}
                        height={320}
                      />
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          {conversionData && (
            <Card>
              <CardHeader>
                <CardTitle>전환 퍼널</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer height={384}>
                    <BarChart 
                      data={convertRechartsData(
                        conversionData.funnelSteps, 
                        ['users'], 
                        [chartColors.primary[0]]
                      )}
                      options={{
                        indexAxis: 'y' as const,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context: any) => {
                                const total = conversionData.funnelSteps[0]?.users || 1;
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.raw}명 (${percentage}%)`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                          },
                        },
                      }}
                      height={384}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}