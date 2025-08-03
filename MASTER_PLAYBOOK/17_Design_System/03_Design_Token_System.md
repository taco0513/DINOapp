# 🎨 디자인 토큰 시스템

> 일관된 디자인을 위한 변수 시스템 - 색상, 타이포그래피, 간격을 체계적으로 관리

## 🎯 디자인 토큰이란?

디자인 토큰은 디자인 시스템의 가장 작은 단위로, 재사용 가능한 디자인 결정값입니다.

### 왜 중요한가?
- **일관성**: 모든 곳에서 동일한 값 사용
- **유지보수**: 한 곳에서 변경하면 전체 적용
- **확장성**: 다크모드, 테마 변경 쉬움
- **협업**: 디자이너-개발자 공통 언어

## 🚀 30분 디자인 토큰 설정

### 1단계: 색상 토큰 (10분)

```typescript
// colors.tokens.ts
export const colors = {
  // 기본 색상 (Primitive Tokens)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 의미론적 색상 (Semantic Tokens)
  semantic: {
    primary: '$blue.500',
    primaryHover: '$blue.600',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // 텍스트
    textPrimary: '$gray.900',
    textSecondary: '$gray.600',
    textDisabled: '$gray.400',
    
    // 배경
    bgPrimary: '#ffffff',
    bgSecondary: '$gray.50',
    bgTertiary: '$gray.100',
    
    // 테두리
    border: '$gray.200',
    borderHover: '$gray.300',
  }
};
```

### 2단계: 타이포그래피 토큰 (10분)

```typescript
// typography.tokens.ts
export const typography = {
  // 폰트 패밀리
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  
  // 폰트 크기
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // 폰트 굵기
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 줄 높이
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // 타입 스케일 (조합)
  heading: {
    h1: {
      fontSize: '$fontSize.4xl',
      fontWeight: '$fontWeight.bold',
      lineHeight: '$lineHeight.tight',
    },
    h2: {
      fontSize: '$fontSize.3xl',
      fontWeight: '$fontWeight.bold',
      lineHeight: '$lineHeight.tight',
    },
    h3: {
      fontSize: '$fontSize.2xl',
      fontWeight: '$fontWeight.semibold',
      lineHeight: '$lineHeight.normal',
    },
  },
  
  body: {
    large: {
      fontSize: '$fontSize.lg',
      lineHeight: '$lineHeight.relaxed',
    },
    base: {
      fontSize: '$fontSize.base',
      lineHeight: '$lineHeight.normal',
    },
    small: {
      fontSize: '$fontSize.sm',
      lineHeight: '$lineHeight.normal',
    },
  }
};
```

### 3단계: 간격 토큰 (5분)

```typescript
// spacing.tokens.ts
export const spacing = {
  // 기본 간격 (4px 기반)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  
  // 컴포넌트별 간격
  component: {
    buttonPadding: {
      sm: '$spacing.2 $spacing.3',
      md: '$spacing.3 $spacing.4',
      lg: '$spacing.4 $spacing.6',
    },
    
    cardPadding: '$spacing.4',
    
    sectionGap: '$spacing.8',
    
    formGap: '$spacing.4',
  }
};
```

### 4단계: 기타 토큰 (5분)

```typescript
// other.tokens.ts
export const tokens = {
  // 반경
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },
  
  // 그림자
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // 트랜지션
  transition: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  
  // 브레이크포인트
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // z-index
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,      // 일반 요소
    20: 20,      // 드롭다운
    30: 30,      // 고정 헤더
    40: 40,      // 오버레이
    50: 50,      // 모달
    9999: 9999,  // 토스트
  }
};
```

## 🎨 CSS 변수로 변환

### CSS Custom Properties
```css
/* tokens.css */
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Typography */
  --font-sans: Inter, system-ui, -apple-system, sans-serif;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Border Radius */
  --radius-base: 0.25rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark mode */
[data-theme="dark"] {
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-border: #374151;
}
```

## 🤖 AI 기반 토큰 생성

### 브랜드 색상에서 팔레트 생성
```typescript
// AI 색상 팔레트 생성
async function generateColorPalette(brandColor: string) {
  const palette = await ai.generatePalette({
    baseColor: brandColor,
    mode: "complementary", // or "analogous", "triadic"
    variations: 10,
    includeSemantic: true
  });
  
  return {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    semantic: palette.semantic,
    grays: palette.neutrals
  };
}

// 사용 예시
const myPalette = await generateColorPalette("#FF6B6B");
```

### 타입 스케일 자동 생성
```typescript
// 황금비 기반 타입 스케일
function generateTypeScale(baseSize: number = 16) {
  const ratio = 1.618; // 황금비
  const scale = {};
  
  const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
  let currentSize = baseSize / (ratio * ratio); // xs부터 시작
  
  sizes.forEach(size => {
    scale[size] = `${(currentSize / 16).toFixed(3)}rem`;
    currentSize *= ratio;
  });
  
  return scale;
}
```

## 💅 Tailwind CSS 통합

### Tailwind 설정에 토큰 적용
```javascript
// tailwind.config.js
const { colors, spacing, typography } = require('./design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.semantic.primary,
        secondary: colors.semantic.secondary,
        success: colors.semantic.success,
        // ... 나머지 색상
      },
      
      spacing: spacing,
      
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
    }
  }
}
```

## 🚀 컴포넌트에 토큰 적용

### React 컴포넌트 예시
```tsx
// Button.tsx
import { tokens } from '@/design-tokens';

const buttonStyles = {
  base: {
    padding: tokens.spacing.component.buttonPadding.md,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: tokens.transition.base,
  },
  
  primary: {
    backgroundColor: tokens.colors.semantic.primary,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: tokens.colors.semantic.primaryHover,
    }
  },
  
  secondary: {
    backgroundColor: tokens.colors.semantic.bgSecondary,
    color: tokens.colors.semantic.textPrimary,
    border: `1px solid ${tokens.colors.semantic.border}`,
  }
};
```

## 📱 반응형 토큰

### 적응형 토큰 시스템
```typescript
// 화면 크기별 토큰
const responsiveTokens = {
  spacing: {
    section: {
      mobile: '$spacing.4',   // 16px
      tablet: '$spacing.8',   // 32px
      desktop: '$spacing.12', // 48px
    }
  },
  
  typography: {
    h1: {
      mobile: {
        fontSize: '$fontSize.2xl',
        lineHeight: '$lineHeight.tight',
      },
      desktop: {
        fontSize: '$fontSize.5xl',
        lineHeight: '$lineHeight.tight',
      }
    }
  }
};

// CSS-in-JS 적용
const styles = {
  section: {
    padding: responsiveTokens.spacing.section.mobile,
    
    '@media (min-width: 768px)': {
      padding: responsiveTokens.spacing.section.tablet,
    },
    
    '@media (min-width: 1024px)': {
      padding: responsiveTokens.spacing.section.desktop,
    }
  }
};
```

## 🎨 테마 시스템

### 다중 테마 지원
```typescript
// themes.ts
export const themes = {
  light: {
    colors: {
      background: '#ffffff',
      foreground: '#111827',
      primary: '#3b82f6',
      // ...
    }
  },
  
  dark: {
    colors: {
      background: '#111827',
      foreground: '#f9fafb',
      primary: '#60a5fa',
      // ...
    }
  },
  
  // 커스텀 테마
  brand: {
    colors: {
      background: '#fef3c7',
      foreground: '#78350f',
      primary: '#f59e0b',
      // ...
    }
  }
};
```

## 📋 토큰 문서화

### 자동 문서 생성
```typescript
// 토큰 문서 생성기
function generateTokenDocs(tokens) {
  const docs = {
    colors: Object.entries(tokens.colors).map(([name, value]) => ({
      name,
      value,
      preview: `<div style="background: ${value}; width: 50px; height: 50px;"></div>`,
      usage: `color: tokens.colors.${name};`
    })),
    
    spacing: Object.entries(tokens.spacing).map(([name, value]) => ({
      name,
      value,
      pixels: parseInt(value) * 16 + 'px',
      usage: `padding: tokens.spacing.${name};`
    }))
  };
  
  return docs;
}
```

## ✅ 토큰 체크리스트

### MVP 필수 토큰
- [ ] Primary 색상 (브랜드 색상)
- [ ] 텍스트 색상 (3단계: primary, secondary, disabled)
- [ ] 배경 색상 (2-3개)
- [ ] 기본 폰트 크기 (5-7개)
- [ ] 기본 간격 (8-10개)
- [ ] 버튼/카드 반경

### 확장 토큰
- [ ] 시맨틱 색상 (success, warning, error)
- [ ] 그림자 시스템
- [ ] 애니메이션 타이밍
- [ ] 브레이크포인트
- [ ] z-index 시스템

## 다음 단계

디자인 토큰이 정의되면 **[컴포넌트 라이브러리](04_Component_Library.md)**를 구축하여 재사용 가능한 UI 블록을 만듭니다.