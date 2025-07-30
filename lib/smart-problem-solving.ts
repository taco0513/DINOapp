/**
 * Smart Problem Solving System
 * 2분 룰: 막히면 자동으로 웹 검색 트리거
 */

interface ProblemContext {
  error: Error | string;
  context: string;
  attemptCount: number;
  startTime: Date;
}

interface Solution {
  source: 'cache' | 'web' | 'documentation' | 'ai';
  content: string;
  confidence: number;
  tokenUsed: number;
}

export class SmartProblemSolver {
  private static instance: SmartProblemSolver;
  private solutionCache: Map<string, Solution> = new Map();
  private readonly TWO_MINUTE_RULE = 120000; // 2분 in ms

  private constructor() {}

  static getInstance(): SmartProblemSolver {
    if (!SmartProblemSolver.instance) {
      SmartProblemSolver.instance = new SmartProblemSolver();
    }
    return SmartProblemSolver.instance;
  }

  /**
   * 문제 해결 파이프라인
   */
  async solve(problem: ProblemContext): Promise<Solution> {
    const cacheKey = this.generateCacheKey(problem);

    // 1단계: 캐시 확인 (토큰 0)
    const cached = this.solutionCache.get(cacheKey);
    if (cached) {
      console.log('💚 캐시에서 해결책 발견! (토큰: 0)');
      return cached;
    }

    // 2단계: 2분 룰 체크
    const timeElapsed = Date.now() - problem.startTime.getTime();
    if (timeElapsed > this.TWO_MINUTE_RULE || problem.attemptCount > 3) {
      console.log('🔍 2분 룰 발동! 웹 검색 시작...');
      return await this.webSearch(problem);
    }

    // 3단계: 로컬 문서 검색 (토큰 ~200)
    const docSolution = await this.searchDocumentation(problem);
    if (docSolution.confidence > 0.8) {
      this.solutionCache.set(cacheKey, docSolution);
      return docSolution;
    }

    // 4단계: AI 분석 (토큰 ~1000)
    const aiSolution = await this.aiAnalysis(problem);
    if (aiSolution.confidence > 0.7) {
      this.solutionCache.set(cacheKey, aiSolution);
      return aiSolution;
    }

    // 5단계: 웹 검색 (토큰 ~200)
    return await this.webSearch(problem);
  }

  /**
   * 웹 검색을 통한 해결책 찾기
   */
  private async webSearch(problem: ProblemContext): Promise<Solution> {
    const searchQuery = this.generateSearchQuery(problem);

    // 실제 구현에서는 웹 검색 API 호출
    console.log(`🌐 검색 쿼리: ${searchQuery}`);

    return {
      source: 'web',
      content: `웹 검색 결과: ${searchQuery}에 대한 해결책...`,
      confidence: 0.85,
      tokenUsed: 200,
    };
  }

  /**
   * 로컬 문서에서 해결책 검색
   */
  private async searchDocumentation(
    problem: ProblemContext
  ): Promise<Solution> {
    // ERROR_PATTERNS.md, LIVING_DOCS.md 등에서 검색
    const errorType = this.extractErrorType(problem.error);

    return {
      source: 'documentation',
      content: `문서에서 찾은 해결책: ${errorType}...`,
      confidence: 0.75,
      tokenUsed: 150,
    };
  }

  /**
   * AI 분석을 통한 해결책 생성
   */
  private async aiAnalysis(problem: ProblemContext): Promise<Solution> {
    // 복잡한 문제에 대한 AI 분석
    return {
      source: 'ai',
      content: 'AI 분석 결과...',
      confidence: 0.8,
      tokenUsed: 1000,
    };
  }

  /**
   * 검색 쿼리 생성
   */
  private generateSearchQuery(problem: ProblemContext): string {
    const error =
      typeof problem.error === 'string' ? problem.error : problem.error.message;

    const keywords = [
      'Next.js',
      'TypeScript',
      problem.context,
      this.extractErrorType(problem.error),
    ]
      .filter(Boolean)
      .join(' ');

    return `${error} ${keywords} solution`;
  }

  /**
   * 에러 타입 추출
   */
  private extractErrorType(error: Error | string): string {
    if (typeof error === 'string') {
      return error.split(':')[0].trim();
    }
    return error.name || 'UnknownError';
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(problem: ProblemContext): string {
    const error =
      typeof problem.error === 'string' ? problem.error : problem.error.message;
    return `${problem.context}:${error}`.toLowerCase();
  }

  /**
   * 통계 및 분석
   */
  getStats() {
    const stats = {
      cacheHitRate: 0,
      averageTokenUsage: 0,
      solutionSources: {
        cache: 0,
        web: 0,
        documentation: 0,
        ai: 0,
      },
    };

    // 실제 구현에서는 통계 계산
    return stats;
  }
}

// 사용 예시
export function useProblemSolver() {
  const solver = SmartProblemSolver.getInstance();

  const solveProblem = async (error: Error | string, context: string) => {
    const problem: ProblemContext = {
      error,
      context,
      attemptCount: 1,
      startTime: new Date(),
    };

    return await solver.solve(problem);
  };

  return { solveProblem, getStats: () => solver.getStats() };
}
