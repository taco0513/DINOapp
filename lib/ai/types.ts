// AI 서비스 공통 타입 정의

export interface AIResponse {
  content: string;
  confidence: number;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}

export interface CodeSpec {
  description: string;
  language: string;
  framework?: string;
  context?: string;
  requirements?: string[];
  constraints?: string[];
}

export interface GeneratedCode {
  code: string;
  language: string;
  confidence: number;
  explanation?: string;
  warnings?: string[];
  dependencies?: string[];
}

export interface TravelAnalysis {
  recommendations: TravelRecommendation[];
  warnings: string[];
  schengenCompliance: {
    isCompliant: boolean;
    issues?: string[];
    suggestions?: string[];
  };
  optimizations: {
    cost?: number;
    time?: number;
    convenience?: number;
  };
}

export interface TravelRecommendation {
  type: 'visa' | 'itinerary' | 'accommodation' | 'transport' | 'activity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  metadata?: Record<string, any>;
}

export type AIServiceType = 'gemini' | 'openai' | 'claude' | 'mock';

export interface AIServiceConfig {
  type: AIServiceType;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIUsageTracking {
  userId: string;
  service: AIServiceType;
  tokens: number;
  cost: number;
  timestamp: Date;
  feature: string;
  success: boolean;
}