'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  errorRate: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface WebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export default function PerformanceMetricsDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>(
    '24h'
  );

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(
        `/api/metrics/performance?range=${timeRange}`
      );
      const data = await response.json();
      setPerformanceData(data.metrics);
      setWebVitals(data.webVitals);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (
    metric: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (metric <= thresholds.good)
      return { color: 'text-green-600', icon: CheckCircle };
    if (metric <= thresholds.warning)
      return { color: 'text-yellow-600', icon: AlertTriangle };
    return { color: 'text-red-600', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 시간 범위 선택 */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>성능 모니터링</h2>
        <div className='flex gap-2'>
          {(['1h', '24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '1h' && '1시간'}
              {range === '24h' && '24시간'}
              {range === '7d' && '7일'}
              {range === '30d' && '30일'}
            </button>
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      {webVitals && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                LCP (Largest Contentful Paint)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-2xl font-bold'>
                    {webVitals.lcp.toFixed(2)}s
                  </div>
                  <p className='text-xs text-gray-600'>목표: &lt; 2.5s</p>
                </div>
                {(() => {
                  const status = getHealthStatus(webVitals.lcp, {
                    good: 2.5,
                    warning: 4.0,
                  });
                  const Icon = status.icon;
                  return <Icon className={`h-5 w-5 ${status.color}`} />;
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                FID (First Input Delay)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-2xl font-bold'>
                    {webVitals.fid.toFixed(0)}ms
                  </div>
                  <p className='text-xs text-gray-600'>목표: &lt; 100ms</p>
                </div>
                {(() => {
                  const status = getHealthStatus(webVitals.fid, {
                    good: 100,
                    warning: 300,
                  });
                  const Icon = status.icon;
                  return <Icon className={`h-5 w-5 ${status.color}`} />;
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                CLS (Cumulative Layout Shift)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-2xl font-bold'>
                    {webVitals.cls.toFixed(3)}
                  </div>
                  <p className='text-xs text-gray-600'>목표: &lt; 0.1</p>
                </div>
                {(() => {
                  const status = getHealthStatus(webVitals.cls, {
                    good: 0.1,
                    warning: 0.25,
                  });
                  const Icon = status.icon;
                  return <Icon className={`h-5 w-5 ${status.color}`} />;
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                TTFB (Time to First Byte)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-2xl font-bold'>
                    {webVitals.ttfb.toFixed(0)}ms
                  </div>
                  <p className='text-xs text-gray-600'>목표: &lt; 800ms</p>
                </div>
                {(() => {
                  const status = getHealthStatus(webVitals.ttfb, {
                    good: 800,
                    warning: 1800,
                  });
                  const Icon = status.icon;
                  return <Icon className={`h-5 w-5 ${status.color}`} />;
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 성능 차트 */}
      <Tabs defaultValue='response' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='response'>응답 시간</TabsTrigger>
          <TabsTrigger value='throughput'>처리량</TabsTrigger>
          <TabsTrigger value='errors'>에러율</TabsTrigger>
          <TabsTrigger value='resources'>리소스 사용량</TabsTrigger>
        </TabsList>

        <TabsContent value='response' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>API 응답 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='timestamp' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='responseTime'
                      stroke='#000000'
                      strokeWidth={2}
                      name='응답 시간 (ms)'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='throughput' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>요청 처리량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient
                        id='colorThroughput'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#4f46e5'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#4f46e5'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='timestamp' />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='throughput'
                      stroke='#4f46e5'
                      fillOpacity={1}
                      fill='url(#colorThroughput)'
                      name='요청/초'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='errors' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>에러율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='timestamp' />
                    <YAxis />
                    <Tooltip formatter={value => `${value}%`} />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='errorRate'
                      stroke='#ef4444'
                      strokeWidth={2}
                      name='에러율 (%)'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='resources' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>CPU 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient
                          id='colorCPU'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#22c55e'
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor='#22c55e'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='timestamp' />
                      <YAxis />
                      <Tooltip formatter={value => `${value}%`} />
                      <Area
                        type='monotone'
                        dataKey='cpuUsage'
                        stroke='#22c55e'
                        fillOpacity={1}
                        fill='url(#colorCPU)'
                        name='CPU (%)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>메모리 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient
                          id='colorMemory'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#f59e0b'
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor='#f59e0b'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='timestamp' />
                      <YAxis />
                      <Tooltip formatter={value => `${value}%`} />
                      <Area
                        type='monotone'
                        dataKey='memoryUsage'
                        stroke='#f59e0b'
                        fillOpacity={1}
                        fill='url(#colorMemory)'
                        name='메모리 (%)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
