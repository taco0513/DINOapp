'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Users, DollarSign, Activity, Target, AlertCircle } from 'lucide-react';
// Replaced recharts with Chart.js components
import {
  AreaChart,
  LineChart,
  BarChart,
  PieChart,
  ResponsiveContainer,
  convertRechartsData,
  chartColors
} from '@/components/charts/ChartComponents';

interface Metric {
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface BusinessMetrics {
  activeUsers: Metric;
  revenue: Metric;
  tripCount: Metric;
  retentionRate: Metric;
  avgTripDuration: Metric;
  conversionRate: Metric;
}

interface ChartData {
  userGrowth: Array<{ date: string; users: number; active: number }>;
  revenueGrowth: Array<{ date: string; revenue: number; mrr: number }>;
  tripFrequency: Array<{ month: string; trips: number }>;
  userSegments: Array<{ name: string; value: number }>;
  featureUsage: Array<{ feature: string; usage: number }>;
}

export default function BusinessMetricsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/business?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data.metrics);
      setChartData(data.charts);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Using chartColors from ChartComponents

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics || !chartData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">메트릭 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 시간 범위 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">비즈니스 메트릭</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'week' && '주간'}
              {range === 'month' && '월간'}
              {range === 'quarter' && '분기'}
              {range === 'year' && '연간'}
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.value}</div>
            <p className={`text-xs ${metrics.activeUsers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.activeUsers.trend === 'up' ? '↑' : '↓'} {metrics.activeUsers.change}% 이전 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(metrics.revenue.value))}</div>
            <p className={`text-xs ${metrics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.revenue.trend === 'up' ? '↑' : '↓'} {metrics.revenue.change}% 이전 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">여행 횟수</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tripCount.value}</div>
            <p className={`text-xs ${metrics.tripCount.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.tripCount.trend === 'up' ? '↑' : '↓'} {metrics.tripCount.change}% 이전 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">유지율</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(Number(metrics.retentionRate.value))}</div>
            <p className={`text-xs ${metrics.retentionRate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.retentionRate.trend === 'up' ? '↑' : '↓'} {metrics.retentionRate.change}% 이전 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 여행 기간</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgTripDuration.value}일</div>
            <p className={`text-xs ${metrics.avgTripDuration.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.avgTripDuration.trend === 'up' ? '↑' : '↓'} {metrics.avgTripDuration.change}% 이전 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전환율</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(Number(metrics.conversionRate.value))}</div>
            <p className={`text-xs ${metrics.conversionRate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.conversionRate.trend === 'up' ? '↑' : '↓'} {metrics.conversionRate.change}% 이전 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">성장 지표</TabsTrigger>
          <TabsTrigger value="revenue">수익 분석</TabsTrigger>
          <TabsTrigger value="usage">사용 패턴</TabsTrigger>
          <TabsTrigger value="segments">사용자 세그먼트</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 성장</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer height={320}>
                  <AreaChart 
                    data={convertRechartsData(
                      chartData.userGrowth, 
                      ['users', 'active'], 
                      [chartColors.primary[0], chartColors.primary[1]]
                    )}
                    height={320}
                  />
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>수익 성장</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer height={320}>
                  <LineChart 
                    data={convertRechartsData(
                      chartData.revenueGrowth, 
                      ['revenue', 'mrr'], 
                      [chartColors.primary[0], chartColors.primary[1]]
                    )}
                    height={320}
                  />
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>월별 여행 빈도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height={320}>
                    <BarChart 
                      data={convertRechartsData(
                        chartData.tripFrequency, 
                        ['trips'], 
                        [chartColors.primary[0]]
                      )}
                      height={320}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>기능별 사용률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height={320}>
                    <BarChart 
                      data={convertRechartsData(
                        chartData.featureUsage, 
                        ['usage'], 
                        [chartColors.primary[1]]
                      )}
                      options={{
                        indexAxis: 'y' as const,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                          },
                        },
                      }}
                      height={320}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 세그먼트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer height={320}>
                  <PieChart 
                    data={{
                      labels: chartData.userSegments.map(item => item.name),
                      datasets: [{
                        label: '사용자 수',
                        data: chartData.userSegments.map(item => item.value),
                        backgroundColor: chartColors.primary.slice(0, chartData.userSegments.length),
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
        </TabsContent>
      </Tabs>
    </div>
  );
}