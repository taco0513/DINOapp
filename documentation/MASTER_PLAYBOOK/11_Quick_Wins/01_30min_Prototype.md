# 30분 프로토타입

## 개요

아이디어에서 작동하는 프로토타입까지 30분 만에 구현하는 전략입니다. 빠른 검증과 즉각적인 피드백을 통해 올바른 방향을 찾을 수 있습니다.

## 30분 프로토타입 전략

### 시간 분배 전략

```typescript
// 30분 최적 시간 배분
interface TimeAllocation {
  setup: 5, // 환경 설정 및 템플릿 선택
  core: 15, // 핵심 기능 구현
  ui: 7,    // 기본 UI/UX 적용
  deploy: 3 // 배포 및 공유
}

// 성공률 최대화 규칙
const prototypingRules = {
  rule1: "완벽함보다 작동성 우선",
  rule2: "기존 템플릿과 라이브러리 최대 활용",
  rule3: "핵심 기능 1개에만 집중",
  rule4: "UI는 최소한으로, 기능은 확실하게"
};
```

### 빠른 프로토타입 스택

```typescript
// 웹 애플리케이션 스택 (추천)
const webStack = {
  framework: "Next.js 14",
  ui: "Tailwind CSS + shadcn/ui",
  backend: "Next.js API Routes",
  database: "Supabase (즉시 설정)",
  auth: "NextAuth.js",
  deployment: "Vercel (1분 배포)"
};

// 모바일 앱 스택
const mobileStack = {
  framework: "Expo + React Native",
  ui: "NativeWind + Expo Components",
  backend: "Expo Router API",
  database: "Expo SQLite",
  deployment: "Expo Development Build"
};

// API 서버 스택
const apiStack = {
  framework: "Express.js + TypeScript",
  database: "Railway PostgreSQL",
  auth: "JWT + bcrypt",
  documentation: "Swagger 자동 생성",
  deployment: "Railway (1분 배포)"
};
```

## 프로토타입 템플릿

### 1. SaaS 대시보드 (30분)

```bash
# 1단계: 프로젝트 생성 (2분)
npx create-next-app saas-prototype --typescript --tailwind --app --eslint
cd saas-prototype

# 2단계: 필수 패키지 설치 (2분)
npm install @supabase/supabase-js next-auth @next-auth/supabase-adapter
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu lucide-react
npm install recharts date-fns clsx

# 3단계: 환경 설정 (1분)
echo "NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key" > .env.local
```

```typescript
// app/dashboard/page.tsx - 핵심 대시보드 (10분 구현)
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface DashboardStats {
  users: number;
  revenue: number;
  growth: number;
  active: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 1234,
    revenue: 5678,
    growth: 12.5,
    active: 89
  });

  const chartData = [
    { name: '1월', value: 400 },
    { name: '2월', value: 300 },
    { name: '3월', value: 600 },
    { name: '4월', value: 800 },
    { name: '5월', value: 700 },
    { name: '6월', value: 900 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="총 사용자"
            value={stats.users.toLocaleString()}
            change="+12%"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            title="수익"
            value={`$${stats.revenue.toLocaleString()}`}
            change="+8%"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="성장률"
            value={`${stats.growth}%`}
            change="+2.1%"
          />
          <StatCard
            icon={<Activity className="h-6 w-6" />}
            title="활성 사용자"
            value={`${stats.active}%`}
            change="+5%"
          />
        </div>

        {/* 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">월별 성장</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            새 프로젝트 생성
          </button>
          <button className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-50">
            설정
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="text-gray-600">{icon}</div>
        <div className="text-green-600 text-sm font-medium">{change}</div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-600 text-sm">{title}</div>
      </div>
    </div>
  );
}
```

### 2. 전자상거래 프로토타입 (30분)

```typescript
// 상품 목록 + 장바구니 (15분 구현)
'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function EcommercePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const products: Product[] = [
    {
      id: 1,
      name: "무선 이어폰",
      price: 99000,
      image: "/placeholder-product.jpg",
      description: "고품질 무선 이어폰"
    },
    {
      id: 2,
      name: "스마트워치",
      price: 299000,
      image: "/placeholder-product.jpg",
      description: "건강 관리 스마트워치"
    },
    {
      id: 3,
      name: "노트북 스탠드",
      price: 49000,
      image: "/placeholder-product.jpg",
      description: "인체공학적 노트북 스탠드"
    }
  ];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ShopPrototype</h1>
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 상품 목록 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">상품 목록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                  <span className="text-gray-500">상품 이미지</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">
                    ₩{product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    장바구니 추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 장바구니 */}
        <div>
          <h2 className="text-xl font-semibold mb-6">장바구니</h2>
          <div className="bg-white rounded-lg shadow p-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">장바구니가 비어있습니다</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-600">₩{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="text-xl font-bold mb-4">
                    총합: ₩{total.toLocaleString()}
                  </div>
                  <button className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium">
                    결제하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. AI 챗봇 프로토타입 (30분)

```typescript
// 간단한 AI 챗봇 인터페이스 (20분 구현)
'use client';

import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕하세요! 무엇을 도와드릴까요?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 간단한 챗봇 응답 로직 (실제로는 AI API 연동)
  const getBotResponse = (userMessage: string): string => {
    const responses = {
      '안녕': '안녕하세요! 좋은 하루 보내세요.',
      '도움': '무엇을 도와드릴까요? 질문해 주세요.',
      '시간': `현재 시간은 ${new Date().toLocaleTimeString()}입니다.`,
      '날씨': '죄송합니다. 날씨 정보는 아직 제공하지 않습니다.',
      '기본': '흥미로운 질문이네요! 더 자세히 설명해 주시겠어요?'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (userMessage.includes(key)) {
        return response;
      }
    }
    return responses['기본'];
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 봇 응답 시뮬레이션 (1초 지연)
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold text-center">AI 챗봇 프로토타입</h1>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow h-96 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.sender === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 질문 버튼 */}
      <div className="max-w-2xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-3">빠른 질문:</p>
          <div className="flex flex-wrap gap-2">
            {['안녕하세요', '도움이 필요해요', '현재 시간이 궁금해요', '날씨는 어때요?'].map(question => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 배포 및 공유 (3분)

### Vercel 배포

```bash
# 1. Vercel CLI 설치 (1분)
npm i -g vercel

# 2. 배포 (1분)
vercel

# 3. 도메인 설정 (1분)
vercel --prod
```

### 피드백 수집 설정

```typescript
// components/FeedbackButton.tsx - 빠른 피드백 수집
'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submitFeedback = async () => {
    // 간단한 피드백 전송 (실제로는 이메일 또는 API로)
    console.log('피드백:', feedback);
    alert('피드백이 전송되었습니다!');
    setFeedback('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">피드백</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="이 프로토타입에 대한 의견을 알려주세요..."
              className="w-full h-32 border border-gray-300 rounded-md p-3 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={submitFeedback}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                전송
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## SuperClaude 30분 프로토타입 명령어

```bash
# 프로토타입 생성
/create-prototype --type "saas-dashboard" --time-limit 30min

# 빠른 UI 생성
/generate-ui --component dashboard --style minimal --responsive

# 즉시 배포
/deploy-prototype --platform vercel --domain auto

# 피드백 시스템 추가
/add-feedback --type popup --storage simple

# 성능 최적화
/optimize-prototype --lighthouse-score 90+ --bundle-size minimal

# 보안 기본 설정
/secure-prototype --https --basic-validation --cors

# 분석 추가
/add-analytics --platform "google-analytics" --events basic

# 공유 준비
/prepare-sharing --demo-data --user-guide --feedback-form
```

## 성공 체크리스트

### 30분 완료 기준
- [ ] **기능**: 핵심 기능 1개가 완전히 작동
- [ ] **UI**: 기본적인 사용자 인터페이스 완성  
- [ ] **반응형**: 모바일에서도 사용 가능
- [ ] **배포**: 공개 URL로 접근 가능
- [ ] **피드백**: 사용자 의견 수집 방법 준비

### 즉시 개선 방향
1. **사용자 테스트**: 최소 3명에게 사용해보라고 요청
2. **피드백 분석**: 30분 내 주요 문제점 파악
3. **우선순위**: 가장 많이 언급된 문제부터 해결
4. **다음 스프린트**: 다음 30분 개선 계획 수립

30분 프로토타입은 완벽함이 아닌 **빠른 학습과 검증**이 목표입니다. 작동하는 것을 만들어서 실제 사용자 반응을 확인하는 것이 핵심입니다.