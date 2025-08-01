// TODO: Remove unused logger import

// Mock AI 서비스 (개발/테스트용)

import { BaseAIService } from './base';
import { 
import { logger } from '@/lib/logger';
  AIResponse, 
  CodeSpec, 
  GeneratedCode, 
  TravelAnalysis,
  AIServiceConfig 
} from '../types';

export class MockAIService extends BaseAIService {
  constructor(config: AIServiceConfig) {
    super(config);
  }

  async generateResponse(
    prompt: string, 
    context?: Record<string, any>
  ): Promise<AIResponse> {
    // 시뮬레이션된 응답
    const responses = [
      "여행 일정을 분석한 결과, 셰겐 지역 체류 기간이 규정을 준수합니다.",
      "코드를 검토한 결과, 다음과 같은 개선사항을 제안합니다.",
      "해당 기능을 구현하기 위한 최적의 방법은 다음과 같습니다.",
      "비자 요구사항을 확인한 결과, 추가 서류가 필요합니다."
    ];

    const content = responses[Math.floor(Math.random() * responses.length)];
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = this.estimateTokens(content);

    return {
      content,
      confidence: 0.85,
      model: 'mock-v1',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      },
      metadata: {
        mock: true,
        context
      }
    };
  }

  async generateCode(spec: CodeSpec): Promise<GeneratedCode> {
    // 언어별 샘플 코드
    const sampleCode: Record<string, string> = {
      typescript: `// ${spec.description}
export function processData(input: any): any {
  // TODO: Implement ${spec.description}
  logger.debug('Processing:', input);
  return {
    success: true,
    data: input
  };
}`,
      python: `# ${spec.description}
def process_data(input_data):
    """
    TODO: Implement ${spec.description}
    """
    print(f"Processing: {input_data}")
    return {
        "success": True,
        "data": input_data
    }`,
      javascript: `// ${spec.description}
function processData(input) {
  // TODO: Implement ${spec.description}
  logger.debug('Processing:', input);
  return {
    success: true,
    data: input
  };
}`
    };

    const code = sampleCode[spec.language] || `// ${spec.description}\n// Language: ${spec.language}`;

    return {
      code,
      language: spec.language,
      confidence: 0.75,
      explanation: "이것은 시뮬레이션된 코드 생성입니다. 실제 AI 서비스 연동 시 더 정확한 코드가 생성됩니다.",
      warnings: ["Mock 서비스를 사용 중입니다."],
      dependencies: []
    };
  }

  async analyzeTravel(_tripData: any): Promise<TravelAnalysis> {
    return {
      recommendations: [
        {
          type: 'visa',
          title: '비자 확인 필요',
          description: '목적지 국가의 비자 요구사항을 확인하세요.',
          priority: 'high',
          actionable: true
        },
        {
          type: 'itinerary',
          title: '일정 최적화 가능',
          description: '이동 경로를 조정하면 시간과 비용을 절약할 수 있습니다.',
          priority: 'medium',
          actionable: true
        }
      ],
      warnings: ['Mock 데이터를 사용한 분석입니다.'],
      schengenCompliance: {
        isCompliant: true,
        suggestions: ['셰겐 지역 체류 기간을 주의깊게 모니터링하세요.']
      },
      optimizations: {
        cost: 0.15,
        time: 0.20,
        convenience: 0.85
      }
    };
  }

  protected override calculateCost(_inputTokens: number, _outputTokens: number): number {
    // Mock 서비스는 무료
    return 0;
  }
}