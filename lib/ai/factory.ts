// AI 서비스 팩토리

import { BaseAIService } from './services/base';
import { MockAIService } from './services/mock';
// import { GeminiAIService } from './services/gemini';
// import { OpenAIService } from './services/openai';
// import { ClaudeAIService } from './services/claude';
import { AIServiceType, AIServiceConfig } from './types';

export class AIServiceFactory {
  private static instances: Map<string, BaseAIService> = new Map();

  static create(
    type: AIServiceType,
    config?: Partial<AIServiceConfig>
  ): BaseAIService {
    const key = `${type}-${JSON.stringify(config)}`;

    // 캐시된 인스턴스 확인
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    // 기본 설정
    const defaultConfig: AIServiceConfig = {
      type,
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      ...config,
    };

    let service: BaseAIService;

    switch (type) {
      case 'gemini':
        // TODO: Gemini 서비스 구현
        console.warn('Gemini service not implemented yet, using mock');
        service = new MockAIService(defaultConfig);
        break;

      case 'openai':
        // TODO: OpenAI 서비스 구현
        console.warn('OpenAI service not implemented yet, using mock');
        service = new MockAIService(defaultConfig);
        break;

      case 'claude':
        // TODO: Claude 서비스 구현
        console.warn('Claude service not implemented yet, using mock');
        service = new MockAIService(defaultConfig);
        break;

      case 'mock':
      default:
        service = new MockAIService(defaultConfig);
        break;
    }

    // 인스턴스 캐싱
    this.instances.set(key, service);
    return service;
  }

  // 환경변수 기반 자동 선택
  static createFromEnv(): BaseAIService {
    const aiService =
      (process.env.AI_SERVICE_PRIMARY as AIServiceType) || 'mock';
    const config: Partial<AIServiceConfig> = {
      apiKey: process.env[`${aiService.toUpperCase()}_API_KEY`],
      model: process.env[`${aiService.toUpperCase()}_MODEL`],
    };

    return this.create(aiService, config);
  }

  // 프리미엄 서비스 생성
  static createPremium(): BaseAIService {
    const aiService =
      (process.env.AI_SERVICE_PREMIUM as AIServiceType) || 'mock';
    const config: Partial<AIServiceConfig> = {
      apiKey: process.env[`${aiService.toUpperCase()}_API_KEY`],
      model: process.env[`${aiService.toUpperCase()}_MODEL`],
      maxTokens: 4000,
      temperature: 0.8,
    };

    return this.create(aiService, config);
  }

  // 캐시 클리어
  static clearCache(): void {
    this.instances.clear();
  }
}
