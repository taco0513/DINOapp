'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Mail, 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Database,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  executionTime?: number;
}

export default function VisaAlertsDevPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const runTest = async (testName: string, endpoint: string, method = 'GET', body?: any) => {
    setLoading(testName);
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      const testResult: TestResult = {
        success: response.ok,
        message: result.message || (response.ok ? 'Success' : result.error || 'Failed'),
        data: result.data,
        executionTime
      };

      setResults(prev => ({ ...prev, [testName]: testResult }));

      if (response.ok) {
        toast.success(`${testName} completed successfully`);
      } else {
        toast.error(`${testName} failed: ${result.error}`);
      }

    } catch (error) {
      const testResult: TestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };

      setResults(prev => ({ ...prev, [testName]: testResult }));
      toast.error(`${testName} failed`);
    } finally {
      setLoading(null);
    }
  };

  const TestCard = ({ 
    title, 
    description, 
    testName, 
    endpoint, 
    method = 'GET', 
    body, 
    icon: Icon 
  }: {
    title: string;
    description: string;
    testName: string;
    endpoint: string;
    method?: string;
    body?: any;
    icon: any;
  }) => {
    const result = results[testName];
    const isLoading = loading === testName;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
            {result && (
              <Badge variant={result.success ? "default" : "destructive"} className="ml-auto">
                {result.success ? "PASS" : "FAIL"}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {method} {endpoint}
            </div>
            <Button
              onClick={() => runTest(testName, endpoint, method, body)}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Running...' : 'Run Test'}
            </Button>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{result.message}</p>
                  {result.executionTime && (
                    <p className="text-xs">Execution time: {result.executionTime}ms</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">View Response Data</summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-width-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">비자 알림 시스템 개발자 도구</h1>
          <p className="mt-2 text-gray-600">
            비자 만료 알림 시스템의 각 컴포넌트를 테스트합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 비자 만료 확인 */}
          <TestCard
            title="비자 만료 상태 확인"
            description="사용자의 모든 비자 만료 상태를 실시간으로 확인합니다."
            testName="visa-expiry-check"
            endpoint="/api/visas/check-expiry"
            icon={Clock}
          />

          {/* 실시간 비자 상태 */}
          <TestCard
            title="실시간 비자 상태"
            description="현재 비자 상태와 체류 정보를 포함한 종합 상태를 확인합니다."
            testName="visa-status"
            endpoint="/api/visas/status"
            icon={Database}
          />

          {/* 스케줄러 수동 실행 */}
          <TestCard
            title="비자 만료 스케줄러 실행"
            description="비자 만료 확인 스케줄러를 수동으로 실행합니다."
            testName="scheduler-run"
            endpoint="/api/visas/scheduler"
            icon={Calendar}
          />

          {/* Cron Job 테스트 */}
          <TestCard
            title="Cron Job 테스트"
            description="Vercel Cron Jobs 엔드포인트를 테스트합니다."
            testName="cron-test"
            endpoint="/api/cron/visa-check"
            method="POST"
            body={{ forceRun: true, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }}
            icon={RefreshCw}
          />

          {/* 특정 비자 알림 발송 */}
          <TestCard
            title="비자 알림 발송 테스트"
            description="특정 비자에 대한 알림을 강제로 발송합니다."
            testName="alert-send"
            endpoint="/api/visas/check-expiry"
            method="POST"
            body={{ visaId: 'test-visa-id', forceAlert: true }}
            icon={Bell}
          />

          {/* 이메일 템플릿 테스트 */}
          <TestCard
            title="이메일 템플릿 테스트"
            description="비자 만료 이메일 템플릿을 테스트합니다."
            testName="email-template"
            endpoint="/api/test/email-template"
            icon={Mail}
          />
        </div>

        {/* 통합 테스트 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              통합 테스트 실행
            </CardTitle>
            <p className="text-sm text-gray-600">
              모든 테스트를 순서대로 실행하여 시스템 전체의 동작을 확인합니다.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                const tests = [
                  { name: 'visa-expiry-check', endpoint: '/api/visas/check-expiry' },
                  { name: 'visa-status', endpoint: '/api/visas/status' },
                  { name: 'scheduler-run', endpoint: '/api/visas/scheduler' }
                ];

                for (const test of tests) {
                  await runTest(test.name, test.endpoint);
                  // 테스트 간 1초 대기
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }

                toast.success('통합 테스트 완료');
              }}
              disabled={loading !== null}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              모든 테스트 실행
            </Button>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>시스템 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>환경:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>앱 URL:</strong> {process.env.NEXT_PUBLIC_APP_URL}
              </div>
              <div>
                <strong>마지막 업데이트:</strong> {new Date().toLocaleString('ko-KR')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}