// AI 서비스 기본 추상 클래스

import { 
  AIResponse, 
  AIError, 
  CodeSpec, 
  GeneratedCode, 
  TravelAnalysis, 
  AIServiceConfig 
} from '../types';

export abstract class BaseAIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  // 기본 텍스트 생성
  abstract generateResponse(
    prompt: string, 
    context?: Record<string, any>
  ): Promise<AIResponse>;

  // 코드 생성
  abstract generateCode(
    spec: CodeSpec
  ): Promise<GeneratedCode>;

  // 여행 분석
  abstract analyzeTravel(
    tripData: any
  ): Promise<TravelAnalysis>;

  // 스트리밍 응답 (선택적)
  async *streamResponse(
    prompt: string,
    context?: Record<string, any>
  ): AsyncGenerator<string, void, unknown> {
    // 기본 구현: 전체 응답을 한 번에 반환
    const response = await this.generateResponse(prompt, context);
    yield response.content;
  }

  // 토큰 수 추정
  protected estimateTokens(text: string): number {
    // 간단한 추정: 4자 = 1토큰 (영어 기준)
    // 한국어는 약 2-3자 = 1토큰
    const koreanRatio = (text.match(/[\u3131-\uD79D]/g) || []).length / text.length;
    const avgCharsPerToken = koreanRatio > 0.5 ? 2.5 : 4;
    return Math.ceil(text.length / avgCharsPerToken);
  }

  // 비용 계산
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    // 각 서비스별로 오버라이드
    return 0;
  }

  // 에러 처리
  protected handleError(error: any): AIError {
    if (error.response) {
      return {
        code: error.response.status?.toString() || 'UNKNOWN',
        message: error.response.data?.error?.message || error.message,
        details: error.response.data
      };
    }
    
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error
    };
  }

  // 프롬프트 빌더 유틸리티
  protected buildSystemPrompt(): string {
    return `You are DINO AI Assistant, a helpful AI that assists with both software development and travel planning.
    
For development tasks:
- Generate clean, maintainable code
- Follow best practices and design patterns
- Provide clear explanations
- Consider security and performance

For travel planning:
- Analyze Schengen area regulations
- Optimize travel itineraries
- Provide visa requirements
- Consider cost and convenience

Always be helpful, accurate, and concise.`;
  }

  // 컨텍스트 포맷팅
  protected formatContext(context: Record<string, any>): string {
    return Object.entries(context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
  }
}