'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  Brain,
  Code,
  // MessageSquare,
  Zap,
  GitBranch,
  Eye,
  Keyboard,
  // AlertCircle,
  CheckCircle,
  Timer,
  // TrendingUp
} from 'lucide-react';

interface PairSession {
  id: string;
  startTime: Date;
  duration: number;
  mode: 'driver' | 'navigator';
  context: {
    file: string;
    language: string;
    task: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  metrics: {
    linesWritten: number;
    suggestionsAccepted: number;
    errorsDetected: number;
    productivityScore: number;
  };
}

interface AINavigation {
  type: 'architecture' | 'implementation' | 'optimization' | 'testing';
  suggestion: string;
  confidence: number;
  reasoning: string;
}

export default function AIPairProgramming() {
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'driver' | 'navigator'>('navigator');
  const [session, setSession] = useState<PairSession | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AINavigation[]>([]);
  const [codeContext, setCodeContext] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  // 세션 타이머
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const startPairSession = async () => {
    const newSession: PairSession = {
      id: `pair_${Date.now()}`,
      startTime: new Date(),
      duration: 0,
      mode: currentMode,
      context: {
        file: 'app/components/NewFeature.tsx',
        language: 'typescript',
        task: '새로운 사용자 대시보드 구현',
        complexity: 'moderate'
      },
      metrics: {
        linesWritten: 0,
        suggestionsAccepted: 0,
        errorsDetected: 0,
        productivityScore: 100
      }
    };

    setSession(newSession);
    setIsActive(true);
    setSessionTime(0);

    // AI Navigator 활성화
    if (currentMode === 'navigator') {
      activateAINavigator();
    }
  };

  const activateAINavigator = () => {
    // 초기 AI 제안 생성
    const initialSuggestions: AINavigation[] = [
      {
        type: 'architecture',
        suggestion: '컴포넌트를 Container/Presentation 패턴으로 분리하면 테스트와 재사용성이 향상됩니다.',
        confidence: 0.95,
        reasoning: 'React 베스트 프랙티스에 따른 구조화'
      },
      {
        type: 'implementation',
        suggestion: 'useMemo를 사용해서 expensive calculation을 최적화하세요.',
        confidence: 0.88,
        reasoning: '대시보드의 데이터 처리 성능 개선'
      }
    ];
    setAiSuggestions(initialSuggestions);
  };

  const switchRole = () => {
    const newMode = currentMode === 'driver' ? 'navigator' : 'driver';
    setCurrentMode(newMode);
    if (session) {
      setSession({ ...session, mode: newMode });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endSession = () => {
    setIsActive(false);
    if (session) {
      setSession({
        ...session,
        duration: sessionTime,
        metrics: {
          ...session.metrics,
          linesWritten: 145,
          suggestionsAccepted: 23,
          errorsDetected: 5,
          productivityScore: 285
        }
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* 메인 페어 프로그래밍 인터페이스 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              AI 페어 프로그래밍
            </CardTitle>
            {isActive && (
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatTime(sessionTime)}
                </Badge>
                <Badge 
                  variant={currentMode === 'driver' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {currentMode === 'driver' ? (
                    <><Keyboard className="h-3 w-3" /> Driver</>                    
                  ) : (
                    <><Eye className="h-3 w-3" /> Navigator</>
                  )}
                </Badge>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            AI와 함께 Driver/Navigator 역할을 번갈아가며 효율적인 코딩
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isActive ? (
            // 세션 시작 화면
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    currentMode === 'driver' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentMode('driver')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Keyboard className="h-4 w-4" />
                      <h4 className="font-medium">Driver 모드</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      당신이 코드를 작성하고 AI가 실시간으로 가이드
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    currentMode === 'navigator' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentMode('navigator')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4" />
                      <h4 className="font-medium">Navigator 모드</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI가 전략을 제시하고 당신이 방향을 결정
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={startPairSession} className="w-full" size="lg">
                <Users className="mr-2 h-4 w-4" />
                페어 프로그래밍 시작
              </Button>
            </div>
          ) : (
            // 활성 세션 화면
            <div className="space-y-4">
              {/* AI Navigator 제안 */}
              {currentMode === 'navigator' && aiSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">AI Navigator 제안</h4>
                  {aiSuggestions.map((suggestion, idx) => (
                    <Card key={idx} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">
                            {suggestion.type === 'architecture' && <GitBranch className="h-3 w-3 mr-1" />}
                            {suggestion.type === 'implementation' && <Code className="h-3 w-3 mr-1" />}
                            {suggestion.type === 'optimization' && <Zap className="h-3 w-3 mr-1" />}
                            {suggestion.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            신뢰도 {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm mb-2">{suggestion.suggestion}</p>
                        <p className="text-xs text-muted-foreground">
                          💡 {suggestion.reasoning}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            적용
                          </Button>
                          <Button size="sm" variant="ghost">
                            다른 방법 제안
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* 코드 컨텍스트 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  현재 작업 중인 코드 또는 의도
                </label>
                <Textarea
                  placeholder={currentMode === 'driver' 
                    ? "코드를 작성하면 AI가 실시간으로 피드백을 제공합니다..."
                    : "구현하려는 기능이나 해결하려는 문제를 설명하세요..."
                  }
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              {/* 실시간 메트릭 */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-3">세션 메트릭</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">145</div>
                      <p className="text-xs text-muted-foreground">라인 작성</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">23</div>
                      <p className="text-xs text-muted-foreground">제안 수락</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">5</div>
                      <p className="text-xs text-muted-foreground">오류 방지</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">285%</div>
                      <p className="text-xs text-muted-foreground">생산성</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 세션 컨트롤 */}
              <div className="flex gap-2">
                <Button onClick={switchRole} variant="outline" className="flex-1">
                  <Users className="mr-2 h-4 w-4" />
                  역할 전환
                </Button>
                <Button onClick={endSession} variant="destructive" className="flex-1">
                  세션 종료
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페어 프로그래밍 팁 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-4 w-4" />
            효과적인 AI 페어 프로그래밍 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">역할 전환하기</p>
                <p className="text-xs text-muted-foreground">
                  15-20분마다 Driver/Navigator 역할을 전환하여 집중력 유지
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium">명확한 의도 전달</p>
                <p className="text-xs text-muted-foreground">
                  AI에게 구현 의도와 목표를 명확히 설명하면 더 나은 제안을 받을 수 있음
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
              <div>
                <p className="text-sm font-medium">제안 검증하기</p>
                <p className="text-xs text-muted-foreground">
                  AI 제안을 무조건 따르지 말고 프로젝트 컨텍스트에 맞는지 검토
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세션 히스토리 */}
      {session && !isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">세션 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 시간</span>
                <span className="font-medium">{formatTime(session.duration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">작성된 코드</span>
                <span className="font-medium">{session.metrics.linesWritten} 라인</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">수락된 제안</span>
                <span className="font-medium">{session.metrics.suggestionsAccepted}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">방지된 오류</span>
                <span className="font-medium">{session.metrics.errorsDetected}개</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">생산성 향상</span>
                  <span className="text-lg font-bold text-green-600">
                    {session.metrics.productivityScore}%
                  </span>
                </div>
                <Progress value={Math.min(session.metrics.productivityScore / 3, 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}