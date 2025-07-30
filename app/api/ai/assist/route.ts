import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIServiceFactory } from '@/lib/ai/factory';
import { prisma } from '@/lib/prisma';

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, context, mode } = await request.json();

    // AI 서비스 선택 (프리미엄 사용자 확인)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    // TODO: 실제 프리미엄 사용자 체크 로직 구현
    const isPremium = false; // 임시로 false
    
    const aiService = isPremium 
      ? AIServiceFactory.createPremium()
      : AIServiceFactory.createFromEnv();
    
    // AI 응답 생성
    const response = await aiService.generateResponse(query, { context, mode });
    
    // 사용량 추적
    if (response.usage) {
      await prisma.aIUsage.create({
        data: {
          userId: user.id,
          service: isPremium ? 'premium' : 'basic',
          tokens: response.usage.totalTokens,
          cost: 0, // TODO: 실제 비용 계산
          feature: 'assistant',
          success: true
        }
      });
    }
    
    const suggestions = [{
      type: 'ai_response' as const,
      content: response.content,
      confidence: response.confidence,
      reasoning: response.metadata?.reasoning
    }];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// 이전 시뮬레이션 함수들은 제거하고 AI 서비스로 대체됨
// generatePairProgrammingSuggestions, generateMentoringSuggestions 등은
// 이제 AIService 내부에서 처리됨
    case 'generate':
      return generateCodeSuggestions(query, context);
    case 'solve':
      return generateProblemSolutions(query, context);
    case 'review':
      return generateCodeReview(query, context);
    default:
      return [];
  }
}

function generatePairProgrammingSuggestions(query: string, context: AIContext): AISuggestion[] {
  // 페어 프로그래밍 모드: Navigator 역할로 가이드
  const suggestions: AISuggestion[] = [];

  if (query.toLowerCase().includes('상태 관리')) {
    suggestions.push({
      type: 'explanation',
      content: 'React 컴포넌트에 상태 관리를 추가하는 방법으로는 useState, useReducer, 또는 전역 상태 관리 라이브러리를 사용할 수 있습니다.',
      confidence: 0.95,
      reasoning: '현재 React와 TypeScript를 사용 중이므로 훅 기반 상태 관리가 적합합니다.',
    });

    suggestions.push({
      type: 'code',
      content: `// useState를 사용한 로컬 상태 관리
import { useState } from 'react';

interface UserState {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export function UserComponent() {
  const [user, setUser] = useState<UserState>({
    name: '',
    email: '',
    isLoggedIn: false,
  });

  const handleLogin = (name: string, email: string) => {
    setUser({
      name,
      email,
      isLoggedIn: true,
    });
  };

  return (
    <div>
      {user.isLoggedIn ? (
        <p>안녕하세요, {user.name}님!</p>
      ) : (
        <button onClick={() => handleLogin('사용자', 'user@example.com')}>
          로그인
        </button>
      )}
    </div>
  );
}`,
      confidence: 0.9,
    });

    if (context.complexity === 'complex') {
      suggestions.push({
        type: 'optimization',
        content: '복잡한 상태 관리가 필요한 경우 useReducer 또는 Zustand/Redux Toolkit 같은 전역 상태 관리 라이브러리를 고려해보세요.',
        confidence: 0.85,
        reasoning: '프로젝트 복잡도가 높을 때는 더 체계적인 상태 관리가 필요합니다.',
      });
    }
  }

  return suggestions;
}

function generateCodeSuggestions(query: string, context: AIContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (query.toLowerCase().includes('인증') && query.toLowerCase().includes('api')) {
    suggestions.push({
      type: 'code',
      content: `// Next.js API 라우트: 사용자 인증 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '잘못된 이메일 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '잘못된 이메일 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 응답
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}`,
      confidence: 0.95,
      reasoning: 'Next.js 13+ App Router와 Prisma를 사용한 보안적으로 안전한 인증 구현입니다.',
    });

    suggestions.push({
      type: 'documentation',
      content: `## 사용자 인증 API

### 엔드포인트
POST /api/auth/login

### 요청 본문
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

### 응답
성공 (200):
\`\`\`json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "사용자"
  },
  "token": "jwt-token-here"
}
\`\`\`

### 보안 고려사항
- bcrypt를 사용한 비밀번호 해싱
- JWT 토큰 기반 인증
- 환경 변수로 시크릿 키 관리
- HTTPS 필수`,
      confidence: 0.9,
    });
  }

  return suggestions;
}

function generateProblemSolutions(query: string, context: AIContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (query.toLowerCase().includes('cannot read property') && query.toLowerCase().includes('undefined')) {
    suggestions.push({
      type: 'fix',
      content: `이 에러는 undefined 객체의 속성에 접근하려 할 때 발생합니다. 

해결 방법:
1. Optional Chaining (?.) 사용
2. Nullish Coalescing (??) 사용
3. 조건부 렌더링
4. 기본값 설정`,
      confidence: 0.95,
      reasoning: 'JavaScript/TypeScript에서 가장 흔한 런타임 에러 중 하나입니다.',
    });

    suggestions.push({
      type: 'code',
      content: `// 해결 방법 1: Optional Chaining
const value = user?.profile?.name; // undefined 대신 안전하게 처리

// 해결 방법 2: Nullish Coalescing
const displayName = user?.name ?? '게스트';

// 해결 방법 3: 조건부 체크
if (user && user.profile) {
  console.log(user.profile.name);
}

// 해결 방법 4: 기본값 설정
const { name = '이름 없음' } = user || {};

// TypeScript에서 타입 가드 사용
function isValidUser(user: any): user is User {
  return user && typeof user.id === 'string';
}

if (isValidUser(user)) {
  // 여기서는 user가 확실히 존재함
  console.log(user.name);
}`,
      confidence: 0.9,
    });

    suggestions.push({
      type: 'optimization',
      content: 'TypeScript를 사용 중이라면 strict 모드를 활성화하여 이런 에러를 컴파일 타임에 잡을 수 있습니다.',
      confidence: 0.85,
    });
  }

  return suggestions;
}

function generateCodeReview(query: string, context: AIContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // 코드 리뷰 예시
  suggestions.push({
    type: 'explanation',
    content: '코드 리뷰 결과: 전반적으로 좋은 구조를 가지고 있지만 몇 가지 개선사항이 있습니다.',
    confidence: 0.9,
  });

  suggestions.push({
    type: 'optimization',
    content: `성능 개선 제안:
1. 불필요한 리렌더링 방지를 위해 React.memo 사용
2. 무거운 계산은 useMemo로 최적화
3. 이벤트 핸들러는 useCallback으로 메모이제이션`,
    confidence: 0.85,
    reasoning: 'React 컴포넌트 성능 최적화 모범 사례입니다.',
  });

  suggestions.push({
    type: 'fix',
    content: `보안 취약점 발견:
- SQL 인젝션 위험: 파라미터화된 쿼리 사용 필요
- XSS 방지: 사용자 입력 sanitize 필요
- 환경 변수: 민감한 정보는 .env 파일로 이동`,
    confidence: 0.95,
  });

  return suggestions;
}