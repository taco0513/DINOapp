'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bug,
  Search,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Timer,
  Lightbulb,
  Code,
  FileSearch,
  GitBranch,
  Terminal
} from 'lucide-react';

// interface ProblemContext {
//   type: 'error' | 'bug' | 'performance' | 'logic' | 'setup';
//   description: string;
//   errorMessage?: string;
//   stackTrace?: string;
//   environment?: {
//     os: string;
//     node: string;
//     browser?: string;
//   };
// }

interface Solution {
  id: string;
  type: 'quick_fix' | 'root_cause' | 'workaround' | 'prevention';
  title: string;
  description: string;
  steps: string[];
  confidence: number;
  timeEstimate: string;
  code?: string;
  references?: {
    title: string;
    url: string;
    relevance: number;
  }[];
}

export default function ProblemSolver() {
  const [problem, setProblem] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2분 타이머
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // 2분 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
        setSearchProgress(prev => Math.min(100, prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSearching, timeRemaining]);

  const handleSearch = async () => {
    if (!problem.trim()) return;

    setIsSearching(true);
    setTimeRemaining(120);
    setSearchProgress(0);
    setSolutions([]);

    try {
      // 2분 룰 기반 검색 시뮬레이션
      const response = await fetch('/api/ai/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          errorDetails,
          timeLimit: 120,
        }),
      });

      const data = await response.json();
      setSolutions(data.solutions);
    } catch (error) {
      console.error('Problem solving error:', error);
    } finally {
      setIsSearching(false);
      setSearchProgress(100);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSolutionIcon = (type: Solution['type']) => {
    switch (type) {
      case 'quick_fix': return <Zap className="h-4 w-4" />;
      case 'root_cause': return <Bug className="h-4 w-4" />;
      case 'workaround': return <GitBranch className="h-4 w-4" />;
      case 'prevention': return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            스마트 문제 해결 엔진
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            2분 룰 - 막힌 문제를 2분 안에 해결하는 AI 기반 자동 검색 시스템
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 문제 설명 입력 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              어떤 문제를 겪고 계신가요?
            </label>
            <Textarea
              placeholder="예: 'TypeError: Cannot read property of undefined 에러가 발생해요'"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
            />
          </div>

          {/* 에러 상세 정보 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              에러 메시지나 스택 트레이스 (선택사항)
            </label>
            <Textarea
              placeholder="에러 메시지나 코드를 붙여넣으세요..."
              value={errorDetails}
              onChange={(e) => setErrorDetails(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isSearching || !problem.trim()}
            className="w-full"
            size="lg"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI가 해결책을 찾는 중... ({formatTime(timeRemaining)})
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                2분 안에 해결책 찾기
              </>
            )}
          </Button>

          {/* 검색 진행 상황 */}
          {isSearching && (
            <div className="space-y-3">
              <Progress value={searchProgress} />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span>남은 시간: {formatTime(timeRemaining)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {searchProgress < 30 && (
                    <><FileSearch className="h-4 w-4 animate-pulse" /> Stack Overflow 검색 중...</>
                  )}
                  {searchProgress >= 30 && searchProgress < 60 && (
                    <><Code className="h-4 w-4 animate-pulse" /> GitHub Issues 분석 중...</>
                  )}
                  {searchProgress >= 60 && searchProgress < 90 && (
                    <><Terminal className="h-4 w-4 animate-pulse" /> 공식 문서 확인 중...</>
                  )}
                  {searchProgress >= 90 && (
                    <><Lightbulb className="h-4 w-4 animate-pulse" /> AI 솔루션 생성 중...</>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 해결책 목록 */}
      {solutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">발견된 해결책</CardTitle>
            <p className="text-sm text-muted-foreground">
              총 {solutions.length}개의 해결 방법을 찾았습니다
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {solutions.map((solution) => (
              <Card 
                key={solution.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedSolution(solution)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSolutionIcon(solution.type)}
                      <h4 className="font-medium">{solution.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {solution.timeEstimate}
                      </Badge>
                      <Badge 
                        variant={solution.confidence > 0.8 ? 'default' : 'secondary'}
                      >
                        {Math.round(solution.confidence * 100)}% 확신
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {solution.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 선택된 해결책 상세 */}
      {selectedSolution && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getSolutionIcon(selectedSolution.type)}
                {selectedSolution.title}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedSolution(null)}
              >
                닫기
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">해결 단계</h4>
              <ol className="space-y-2">
                {selectedSolution.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {selectedSolution.code && (
              <div>
                <h4 className="font-medium mb-2">코드 예시</h4>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                  <code className="text-sm">{selectedSolution.code}</code>
                </pre>
              </div>
            )}

            {selectedSolution.references && selectedSolution.references.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">참고 자료</h4>
                <div className="space-y-2">
                  {selectedSolution.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="text-sm text-blue-600">{ref.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(ref.relevance * 100)}% 관련
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2분 룰 설명 */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>2분 룰이란?</strong> 개발 중 막힌 문제는 2분 안에 해결하거나 도움을 요청하는 규칙입니다. 
          AI가 Stack Overflow, GitHub, 공식 문서 등을 자동으로 검색하여 최적의 해결책을 제시합니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}