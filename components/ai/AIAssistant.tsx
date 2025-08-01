'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Bug, FileText, 
  CheckCircle,
  Loader2,
  Sparkles,
  Brain,
  Zap } from 'lucide-react'
import { logger } from '@/lib/logger'

interface AIContext {
  task: 'feature_development' | 'bug_fixing' | 'refactoring' | 'testing' | 'documentation';
  complexity: 'simple' | 'moderate' | 'complex';
  technology: string[];
  currentCode?: string;
}

interface AISuggestion {
  type: 'code' | 'explanation' | 'fix' | 'optimization' | 'documentation';
  content: string;
  confidence: number;
  reasoning?: string;
}

export default function AIAssistant() {
  const [context, setContext] = useState<AIContext>({
    task: 'feature_development',
    complexity: 'moderate',
    technology: ['React', 'TypeScript', 'Next.js'],
  });

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'pair' | 'generate' | 'solve' | 'review'>('pair');

  const handleAIQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context,
          mode: activeMode,
        }),
      });

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      logger.error('AI Assistant error:', error);
    } finally {
      setLoading(false);
    }
  };

  // getModeIcon function removed - not used

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'pair':
        return 'AI가 Driver/Navigator 역할을 유연하게 전환하며 최적 협업';
      case 'generate':
        return '의도만 전달하면 완벽한 코드를 즉시 생성';
      case 'solve':
        return '2분 룰 기반으로 문제를 즉시 해결';
      case 'review':
        return '24시간 작동하는 시니어 개발자급 코드 리뷰';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Smart AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            상황을 인식하고 자동으로 최적 솔루션을 제안하는 지능형 개발 파트너
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 모드 선택 */}
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pair" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                페어 프로그래밍
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                코드 생성
              </TabsTrigger>
              <TabsTrigger value="solve" className="flex items-center gap-1">
                <Bug className="h-3 w-3" />
                문제 해결
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                코드 리뷰
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm">{getModeDescription(activeMode)}</p>
            </div>
          </Tabs>

          {/* 컨텍스트 설정 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">작업 유형</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={context.task}
                onChange={(e) => setContext({ ...context, task: e.target.value as any })}
              >
                <option value="feature_development">기능 개발</option>
                <option value="bug_fixing">버그 수정</option>
                <option value="refactoring">리팩토링</option>
                <option value="testing">테스트 작성</option>
                <option value="documentation">문서화</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">복잡도</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={context.complexity}
                onChange={(e) => setContext({ ...context, complexity: e.target.value as any })}
              >
                <option value="simple">간단</option>
                <option value="moderate">보통</option>
                <option value="complex">복잡</option>
              </select>
            </div>
          </div>

          {/* 쿼리 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">질문 또는 요청사항</label>
            <Textarea
              placeholder={
                activeMode === 'pair'
                  ? "예: 'React 컴포넌트에 상태 관리를 추가하고 싶어'"
                  : activeMode === 'generate'
                  ? "예: '사용자 인증 API 엔드포인트를 만들어줘'"
                  : activeMode === 'solve'
                  ? "예: 'TypeError: Cannot read property of undefined 에러가 발생해'"
                  : "예: '이 코드의 성능과 보안을 검토해줘'"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleAIQuery}
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI가 분석 중...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                AI 도움 받기
              </>
            )}
          </Button>

          {/* AI 제안 결과 */}
          {suggestions.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="font-medium">AI 제안사항</h3>
              {suggestions.map((suggestion, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {suggestion.type === 'code' && <Code className="h-4 w-4" />}
                        {suggestion.type === 'fix' && <Bug className="h-4 w-4 text-red-500" />}
                        {suggestion.type === 'optimization' && <Zap className="h-4 w-4 text-yellow-500" />}
                        {suggestion.type === 'documentation' && <FileText className="h-4 w-4 text-blue-500" />}
                        <span className="text-sm font-medium capitalize">{suggestion.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        신뢰도: {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {suggestion.type === 'code' ? (
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code className="text-sm">{suggestion.content}</code>
                      </pre>
                    ) : (
                      <p className="text-sm">{suggestion.content}</p>
                    )}
                    {suggestion.reasoning && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">
                          <strong>AI 추론:</strong> {suggestion.reasoning}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI 사용 통계 - 실제 사용 데이터 기반 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">이번 세션 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{suggestions.length}</div>
              <p className="text-xs text-muted-foreground">제안 생성</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{query.length > 0 ? '1' : '0'}</div>
              <p className="text-xs text-muted-foreground">활성 쿼리</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{activeMode}</div>
              <p className="text-xs text-muted-foreground">현재 모드</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{context.complexity}</div>
              <p className="text-xs text-muted-foreground">복잡도</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}