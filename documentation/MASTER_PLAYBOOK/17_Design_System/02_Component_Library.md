# 컴포넌트 라이브러리

## 개요

AI가 생성하고 관리하기 쉬운 컴포넌트 라이브러리를 구축합니다. 일관된 패턴과 명명 규칙을 통해 Claude가 예측 가능하고 재사용 가능한 컴포넌트를 생성할 수 있도록 합니다.

## 컴포넌트 아키텍처

### 기본 컴포넌트 구조

```typescript
// 표준 컴포넌트 인터페이스
interface ComponentProps {
  // 필수 props
  children?: React.ReactNode;
  className?: string;
  
  // 변형 props
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  
  // 상태 props
  disabled?: boolean;
  loading?: boolean;
  
  // 이벤트 핸들러
  onClick?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// 컴포넌트 기본 템플릿
const ComponentTemplate = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}: ComponentProps) => {
  const baseClasses = 'component-base';
  const variantClasses = {
    default: 'variant-default',
    primary: 'variant-primary',
    secondary: 'variant-secondary'
  };
  const sizeClasses = {
    sm: 'size-sm',
    md: 'size-md', 
    lg: 'size-lg'
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'disabled',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};
```

### 컴포넌트 계층 구조

```
Components/
├── Primitives/          # 기본 요소
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   └── Icon/
├── Composed/            # 조합 컴포넌트
│   ├── Card/
│   ├── Modal/
│   ├── Form/
│   └── Navigation/
├── Layout/              # 레이아웃 컴포넌트
│   ├── Container/
│   ├── Grid/
│   ├── Stack/
│   └── Flex/
└── Complex/             # 복합 컴포넌트
    ├── DataTable/
    ├── Calendar/
    ├── Chart/
    └── Editor/
```

## 기본 컴포넌트 (Primitives)

### Button 컴포넌트

```tsx
// Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantClasses = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-dark)]
      focus:ring-[var(--color-primary)]
    `,
    secondary: `
      bg-transparent border border-[var(--color-primary)]
      text-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
      focus:ring-[var(--color-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--text-primary)]
      hover:bg-[var(--bg-secondary)]
      focus:ring-[var(--color-primary)]
    `,
    destructive: `
      bg-[var(--color-error)] text-white
      hover:bg-[var(--color-error-dark)]
      focus:ring-[var(--color-error)]
    `
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ').replace(/\s+/g, ' ').trim();
  
  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
```

### Input 컴포넌트

```tsx
// Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = '',
  variant = 'default',
  ...props
}: InputProps) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = `
    w-full px-3 py-2 
    text-[var(--text-primary)] placeholder-[var(--text-muted)]
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantClasses = {
    default: `
      border border-[var(--border-primary)] rounded-lg
      bg-[var(--bg-primary)]
      focus:border-[var(--color-primary)]
    `,
    filled: `
      border-0 rounded-lg
      bg-[var(--bg-secondary)]
      focus:bg-[var(--bg-primary)]
    `,
    outlined: `
      border-2 border-[var(--border-primary)] rounded-lg
      bg-transparent
      focus:border-[var(--color-primary)]
    `
  };
  
  const errorClasses = error ? `
    border-[var(--color-error)] focus:border-[var(--color-error)]
    focus:ring-[var(--color-error)]
  ` : '';
  
  const inputClasses = [
    baseClasses,
    variantClasses[variant],
    errorClasses,
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  ].join(' ').replace(/\s+/g, ' ').trim();
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-[var(--text-muted)]">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[var(--text-muted)]">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <p className={`text-sm ${error ? 'text-[var(--color-error)]' : 'text-[var(--text-secondary)]'}`}>
          {error || helper}
        </p>
      )}
    </div>
  );
};

export default Input;
```

### Text 컴포넌트

```tsx
// Text.tsx
interface TextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  variant?: 'display-lg' | 'display-md' | 'display-sm' | 
           'heading-xl' | 'heading-lg' | 'heading-md' | 
           'body-lg' | 'body' | 'body-sm' | 
           'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'error' | 'success' | 'warning';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Text = ({
  as: Component = 'p',
  variant = 'body',
  color = 'primary',
  weight,
  align,
  truncate = false,
  children,
  className = '',
  ...props
}: TextProps) => {
  const variantClasses = {
    'display-lg': 'text-6xl font-bold leading-tight',
    'display-md': 'text-4xl font-bold leading-tight',
    'display-sm': 'text-3xl font-semibold leading-snug',
    'heading-xl': 'text-2xl font-semibold leading-snug',
    'heading-lg': 'text-xl font-semibold leading-snug',
    'heading-md': 'text-lg font-medium leading-normal',
    'body-lg': 'text-lg font-normal leading-relaxed',
    'body': 'text-base font-normal leading-normal',
    'body-sm': 'text-sm font-normal leading-normal',
    'caption': 'text-sm font-medium leading-snug',
    'overline': 'text-xs font-medium leading-normal uppercase tracking-wider'
  };
  
  const colorClasses = {
    primary: 'text-[var(--text-primary)]',
    secondary: 'text-[var(--text-secondary)]',
    muted: 'text-[var(--text-muted)]',
    inverse: 'text-[var(--text-inverse)]',
    error: 'text-[var(--color-error)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]'
  };
  
  const weightClasses = weight ? {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[weight] : '';
  
  const alignClasses = align ? {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }[align] : '';
  
  const combinedClasses = [
    variantClasses[variant],
    colorClasses[color],
    weightClasses,
    alignClasses,
    truncate && 'truncate',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
};

export default Text;
```

### Icon 컴포넌트

```tsx
// Icon.tsx
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'current' | 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  className?: string;
}

const Icon = ({
  name,
  size = 'md',
  color = 'current',
  className = ''
}: IconProps) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  const colorClasses = {
    current: 'text-current',
    primary: 'text-[var(--color-primary)]',
    secondary: 'text-[var(--text-secondary)]',
    muted: 'text-[var(--text-muted)]',
    error: 'text-[var(--color-error)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]'
  };
  
  const combinedClasses = [
    sizeClasses[size],
    colorClasses[color],
    className
  ].join(' ');
  
  // 아이콘 매핑 (Heroicons 또는 다른 아이콘 라이브러리 사용)
  const iconPaths = {
    'check': 'M5 13l4 4L19 7',
    'x': 'M6 18L18 6M6 6l12 12',
    'arrow-right': 'M13 7l5 5m0 0l-5 5m5-5H6',
    'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'mail': 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    'loading': 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
  };
  
  return (
    <svg
      className={combinedClasses}
      fill="none"
      strokeWidth="2"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={iconPaths[name] || iconPaths['x']}
      />
    </svg>
  );
};

export default Icon;
```

## 조합 컴포넌트 (Composed)

### Card 컴포넌트

```tsx
// Card.tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  actions?: boolean;
  className?: string;
}

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = ''
}: CardProps) => {
  const baseClasses = 'rounded-[var(--radius-card)] transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-[var(--bg-primary)] border border-[var(--border-primary)]',
    outlined: 'bg-[var(--bg-primary)] border-2 border-[var(--border-primary)]',
    elevated: 'bg-[var(--bg-primary)] shadow-[var(--shadow-md)]'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    padding !== 'none' && paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`border-b border-[var(--border-primary)] pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  actions = false, 
  className = '' 
}: CardFooterProps) => {
  const baseClasses = 'border-t border-[var(--border-primary)] pt-4 mt-4';
  const actionClasses = actions ? 'flex items-center justify-end gap-3' : '';
  
  return (
    <div className={`${baseClasses} ${actionClasses} ${className}`}>
      {children}
    </div>
  );
};

// 복합 컴포넌트로 내보내기
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
```

### Modal 컴포넌트

```tsx
// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = ''
}: ModalProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };
  
  // 키보드 이벤트 처리
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          className={`
            relative transform overflow-hidden rounded-[var(--radius-modal)]
            bg-[var(--bg-primary)] px-4 pb-4 pt-5 text-left shadow-xl
            transition-all sm:my-8 sm:w-full sm:p-6
            ${sizeClasses[size]}
            ${className}
          `}
        >
          {/* 헤더 */}
          {title && (
            <div className="flex items-center justify-between mb-4">
              <Text variant="heading-lg" as="h2">
                {title}
              </Text>
              <button
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icon name="x" size="lg" />
              </button>
            </div>
          )}
          
          {/* 컨텐츠 */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

## 레이아웃 컴포넌트

### Container 컴포넌트

```tsx
// Container.tsx
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

const Container = ({
  children,
  maxWidth = 'lg',
  padding = true,
  className = ''
}: ContainerProps) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',     // 640px
    md: 'max-w-screen-md',     // 768px
    lg: 'max-w-screen-lg',     // 1024px
    xl: 'max-w-screen-xl',     // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    full: 'max-w-none'
  };
  
  const combinedClasses = [
    'mx-auto',
    maxWidthClasses[maxWidth],
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default Container;
```

### Grid 컴포넌트

```tsx
// Grid.tsx
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
  className?: string;
}

const Grid = ({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  className = ''
}: GridProps) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };
  
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`
  ].filter(Boolean) : [];
  
  const combinedClasses = [
    'grid',
    colsClasses[cols],
    gapClasses[gap],
    ...responsiveClasses,
    className
  ].join(' ');
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default Grid;
```

### Stack 컴포넌트

```tsx
// Stack.tsx
interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

const Stack = ({
  children,
  direction = 'column',
  gap = 'md',
  align,
  justify,
  wrap = false,
  className = ''
}: StackProps) => {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col'
  };
  
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  const alignClasses = align ? {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }[align] : '';
  
  const justifyClasses = justify ? {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }[justify] : '';
  
  const combinedClasses = [
    'flex',
    directionClasses[direction],
    gapClasses[gap],
    alignClasses,
    justifyClasses,
    wrap && 'flex-wrap',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default Stack;
```

## 컴포넌트 문서화

### Storybook 설정

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import Icon from '../Icon/Icon';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const WithIcons: Story = {
  args: {
    variant: 'primary',
    children: 'Save Changes',
    leftIcon: <Icon name="check" size="sm" />,
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Loading...',
    loading: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

### TypeScript 타입 정의

```typescript
// types/components.ts
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export interface VariantProps {
  variant?: string;
}

export interface SizeProps {
  size?: 'sm' | 'md' | 'lg';
}

export interface StateProps {
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}

export interface ColorProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

// 컴포넌트별 특화 타입들
export type ButtonVariants = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type InputVariants = 'default' | 'filled' | 'outlined';
export type CardVariants = 'default' | 'outlined' | 'elevated';

export interface ComponentStyleProps {
  baseClasses: string;
  variantClasses: Record<string, string>;
  sizeClasses: Record<string, string>;
  stateClasses: Record<string, string>;
}
```

## SuperClaude 컴포넌트 생성

### AI 친화적 컴포넌트 패턴

```bash
# 기본 컴포넌트 생성
/create component Button --primitive --variants "primary,secondary,ghost" --sizes "sm,md,lg" --with-icons

# 조합 컴포넌트 생성  
/create component Card --composed --subcomponents "Header,Body,Footer" --variants "default,outlined,elevated"

# 폼 컴포넌트 생성
/create component Form --complex --fields "input,textarea,select,checkbox,radio" --validation

# 레이아웃 컴포넌트 생성
/create component Grid --layout --responsive --breakpoints "sm,md,lg,xl"

# 컴포넌트 확장
/extend component Button --add-variant "destructive" --add-size "xs" --add-prop "loading"

# 컴포넌트 스타일 업데이트
/update component @Button --apply-tokens --add-animations --improve-accessibility
```

### 컴포넌트 테스트 자동 생성

```typescript
// Button.test.tsx (자동 생성 예시)
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('variant-primary', 'size-md');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Loading icon
  });

  it('applies all variants correctly', () => {
    const variants = ['primary', 'secondary', 'ghost', 'destructive'];
    
    variants.forEach(variant => {
      const { rerender } = render(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass(`variant-${variant}`);
      rerender(<></>);
    });
  });
});
```

이 컴포넌트 라이브러리를 통해 일관되고 확장 가능한 UI 컴포넌트를 구축하고 AI가 효율적으로 활용할 수 있습니다.