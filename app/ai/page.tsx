'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Dynamic imports for heavy AI components
const AIAssistant = dynamic(() => import('@/components/ai/AIAssistant'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const AIPairProgramming = dynamic(() => import('@/components/ai/AIPairProgramming'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const CodeGenerator = dynamic(() => import('@/components/ai/CodeGenerator'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const ProblemSolver = dynamic(() => import('@/components/ai/ProblemSolver'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
import { 
  Sparkles,
  Users,
  Code,
  Bug,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

export default function AIPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="AI 개발 도구"
        description="AI와 함께 개발 생산성을 10배 향상시키세요 (데모 버전)"
        icon={PageIcons.AI}
        breadcrumbs={[
          { label: '대시보드', href: '/dashboard' },
          { label: 'AI 개발 도구' }
        ]}
      />

      {/* 데모 알림 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <p className="text-sm text-yellow-800">
            <strong>데모 버전:</strong> 현재 AI 기능은 시뮬레이션으로 작동합니다. 
            실제 AI 서비스 연동은 준비 중입니다.
          </p>
        </div>
      </div>

      {/* AI 도구 기능 소개 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              AI 어시스턴트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">💬</div>
            <p className="text-xs text-muted-foreground">질문과 답변</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              페어 프로그래밍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">👥</div>
            <p className="text-xs text-muted-foreground">협업 코딩</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              코드 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">⚡</div>
            <p className="text-xs text-muted-foreground">자동 생성</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              문제 해결
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🔧</div>
            <p className="text-xs text-muted-foreground">버그 수정</p>
          </CardContent>
        </Card>
      </div>

      {/* AI 도구 탭 */}
      <Tabs defaultValue="assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assistant" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI 어시스턴트</span>
            <span className="sm:hidden">Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="pair" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">페어 프로그래밍</span>
            <span className="sm:hidden">Pair</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">코드 생성</span>
            <span className="sm:hidden">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="solve" className="flex items-center gap-1">
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">문제 해결</span>
            <span className="sm:hidden">Solve</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <AIAssistant />
          </Suspense>
        </TabsContent>

        <TabsContent value="pair" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <AIPairProgramming />
          </Suspense>
        </TabsContent>

        <TabsContent value="generate" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <CodeGenerator />
          </Suspense>
        </TabsContent>

        <TabsContent value="solve" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <ProblemSolver />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}