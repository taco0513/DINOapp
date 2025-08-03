# 🧩 컴포넌트 라이브러리 구축

> 재사용 가능한 UI 블록을 체계적으로 구축하여 개발 속도를 10배 향상시키는 방법

## 🎯 컴포넌트 라이브러리란?

레고 블록처럼 조합 가능한 UI 요소들의 모음입니다. 한 번 만들면 어디서든 재사용할 수 있습니다.

### 핵심 이점
- **일관성**: 모든 곳에서 동일한 UI
- **속도**: 복사-붙여넣기로 빠른 개발
- **유지보수**: 한 곳 수정으로 전체 반영
- **협업**: 디자이너-개발자 공통 언어

## 🚀 MVP 필수 컴포넌트

### 우선순위별 컴포넌트 목록

```yaml
필수_컴포넌트_Tier1:
  - Button: "모든 액션의 기본"
  - Input: "텍스트 입력"
  - Card: "콘텐츠 컨테이너"
  - Typography: "텍스트 스타일"
  - Layout: "페이지 구조"

권장_컴포넌트_Tier2:
  - Modal: "팝업 다이얼로그"
  - Dropdown: "선택 메뉴"
  - Table: "데이터 표시"
  - Alert: "알림 메시지"
  - Badge: "상태 표시"

선택_컴포넌트_Tier3:
  - Tabs: "콘텐츠 전환"
  - Accordion: "접이식 콘텐츠"
  - Tooltip: "도움말"
  - Progress: "진행 상태"
  - Avatar: "프로필 이미지"
```

## 📦 기본 컴포넌트 구현

### 1. Button 컴포넌트

```tsx
// Button.tsx
import React from 'react';
import { tokens } from '@/design-tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  // 베이스 스타일
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  // 변형별 스타일
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };
  
  // 크기별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };
  
  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
  `;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// 사용 예시
<Button variant="primary" size="lg" onClick={handleSubmit}>
  시작하기
</Button>
```

### 2. Input 컴포넌트

```tsx
// Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  ...props
}) => {
  const inputClasses = `
    block w-full px-3 py-2 
    border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${icon ? 'pl-10' : ''}
  `;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          className={`${inputClasses} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

// 사용 예시
<Input
  label="이메일"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  icon={<MailIcon className="h-5 w-5 text-gray-400" />}
/>
```

### 3. Card 컴포넌트

```tsx
// Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  hoverable = false,
  onClick,
}) => {
  const cardClasses = `
    bg-white rounded-lg shadow-sm border border-gray-200
    ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
  `;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};
```

## 🤖 AI 컴포넌트 생성

### v0.dev를 활용한 빠른 생성

```bash
# 프롬프트 예시
"Create a responsive pricing card component with:
- 3 tiers (Basic, Pro, Enterprise)
- Feature list with checkmarks
- CTA button for each tier
- Highlight the Pro tier
- Mobile responsive
- Using Tailwind CSS"

# 결과: 완성된 React 컴포넌트 코드
```

### Copilot을 활용한 변형 생성

```tsx
// 기본 컴포넌트를 만든 후 주석으로 요청
// TODO: Create dark mode variant of this button
// TODO: Add icon support (left and right positions)
// TODO: Create button group component
```

## 📱 반응형 컴포넌트 패턴

### 모바일 우선 설계

```tsx
// ResponsiveGrid.tsx
export const ResponsiveGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      grid grid-cols-1 gap-4
      sm:grid-cols-2 sm:gap-6
      lg:grid-cols-3 lg:gap-8
      xl:grid-cols-4
    ">
      {children}
    </div>
  );
};

// Container.tsx
export const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      container mx-auto px-4
      sm:px-6
      lg:px-8
      max-w-7xl
    ">
      {children}
    </div>
  );
};
```

## 🎨 컴포넌트 조합 패턴

### 복합 컴포넌트

```tsx
// Form 복합 컴포넌트
export const Form = {
  Root: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
    </form>
  ),
  
  Field: ({ children }) => (
    <div className="space-y-1">
      {children}
    </div>
  ),
  
  Actions: ({ children }) => (
    <div className="flex gap-3 justify-end pt-4">
      {children}
    </div>
  ),
};

// 사용 예시
<Form.Root onSubmit={handleSubmit}>
  <Form.Field>
    <Input label="이름" name="name" required />
  </Form.Field>
  
  <Form.Field>
    <Input label="이메일" name="email" type="email" required />
  </Form.Field>
  
  <Form.Actions>
    <Button variant="ghost">취소</Button>
    <Button type="submit">저장</Button>
  </Form.Actions>
</Form.Root>
```

## 🚀 빠른 프로토타이핑 키트

### 30분 스타터 팩

```typescript
// quick-kit.ts
export const QuickKit = {
  // 레이아웃
  Page: ({ children }) => <div className="min-h-screen bg-gray-50">{children}</div>,
  Header: ({ children }) => <header className="bg-white shadow-sm">{children}</header>,
  Main: ({ children }) => <main className="py-8">{children}</main>,
  
  // 타이포그래피
  H1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900">{children}</h1>,
  H2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-900">{children}</h2>,
  P: ({ children }) => <p className="text-gray-600">{children}</p>,
  
  // 유틸리티
  Spacer: ({ size = 'md' }) => {
    const sizes = { sm: 'h-4', md: 'h-8', lg: 'h-12' };
    return <div className={sizes[size]} />;
  },
  
  Divider: () => <hr className="border-gray-200" />,
  
  // 피드백
  Loading: () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  ),
  
  Empty: ({ message = '데이터가 없습니다' }) => (
    <div className="text-center py-12 text-gray-500">{message}</div>
  ),
};
```

## 📚 컴포넌트 문서화

### Storybook 없이 문서화

```tsx
// ComponentDocs.tsx
export const ComponentDocs = () => {
  return (
    <div className="space-y-12 p-8">
      {/* Button 문서 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Variants</h3>
            <div className="flex gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Sizes</h3>
            <div className="flex gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">States</h3>
            <div className="flex gap-4">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
        
        {/* 코드 예시 */}
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto">
          <code>{`<Button variant="primary" size="lg" onClick={handleClick}>
  Click me
</Button>`}</code>
        </pre>
      </section>
    </div>
  );
};
```

## ✅ MVP 컴포넌트 체크리스트

### 최소 요구사항
- [ ] Button (primary, secondary)
- [ ] Input (text, email, password)
- [ ] Select/Dropdown
- [ ] Card/Container
- [ ] Typography (H1-H3, P)
- [ ] Layout (Container, Grid)
- [ ] Loading 상태
- [ ] Error 상태

### 다음 단계
- [ ] Modal/Dialog
- [ ] Table
- [ ] Form validation
- [ ] Toast/Notification
- [ ] Navigation/Menu

## 🎯 컴포넌트별 MVP 템플릿

### 1. 로그인 폼 조합

```tsx
const LoginForm = () => {
  return (
    <Card title="로그인" subtitle="계정에 로그인하세요">
      <Form.Root onSubmit={handleLogin}>
        <Form.Field>
          <Input
            label="이메일"
            type="email"
            name="email"
            placeholder="your@email.com"
            required
          />
        </Form.Field>
        
        <Form.Field>
          <Input
            label="비밀번호"
            type="password"
            name="password"
            required
          />
        </Form.Field>
        
        <Form.Actions>
          <Button type="submit" fullWidth>
            로그인
          </Button>
        </Form.Actions>
      </Form.Root>
    </Card>
  );
};
```

### 2. 대시보드 레이아웃

```tsx
const Dashboard = () => {
  return (
    <QuickKit.Page>
      <QuickKit.Header>
        <Container>
          <div className="flex justify-between items-center py-4">
            <QuickKit.H1>대시보드</QuickKit.H1>
            <Button variant="primary">새 프로젝트</Button>
          </div>
        </Container>
      </QuickKit.Header>
      
      <QuickKit.Main>
        <Container>
          <ResponsiveGrid>
            <Card title="총 사용자" subtitle="전체 가입자 수">
              <p className="text-3xl font-bold">1,234</p>
            </Card>
            
            <Card title="활성 사용자" subtitle="오늘 접속자">
              <p className="text-3xl font-bold">234</p>
            </Card>
            
            <Card title="매출" subtitle="이번 달">
              <p className="text-3xl font-bold">$12,345</p>
            </Card>
          </ResponsiveGrid>
        </Container>
      </QuickKit.Main>
    </QuickKit.Page>
  );
};
```

## 🚀 컴포넌트 개발 가속화 팁

1. **복사-붙여넣기 우선**: 완벽한 추상화보다 동작하는 코드
2. **Tailwind UI**: 유료지만 시간 절약 효과 큼
3. **Headless UI**: 스타일 없는 기능성 컴포넌트
4. **AI 도구 활용**: v0, Copilot, ChatGPT
5. **점진적 개선**: MVP 먼저, 리팩토링은 나중에

## 다음 단계

컴포넌트 라이브러리가 준비되면 **[디자인 시스템 자동화](05_Design_Automation.md)**를 통해 개발 효율을 극대화합니다.