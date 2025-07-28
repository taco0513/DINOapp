# 디자인 토큰 시스템

## 개요

디자인 토큰은 디자인 시스템의 기초가 되는 명명된 엔티티입니다. 색상, 타이포그래피, 간격 등의 디자인 결정을 코드로 저장하여 일관성을 보장하고 AI가 이해할 수 있는 구조화된 디자인 언어를 만듭니다.

## 토큰 아키텍처

### 계층적 토큰 구조

```css
/* 3계층 토큰 시스템 */

/* 1. 원본 토큰 (Primitive Tokens) - 기본 값들 */
:root {
  /* 색상 팔레트 */
  --blue-50: #EFF6FF;
  --blue-100: #DBEAFE;
  --blue-500: #3B82F6;
  --blue-600: #2563EB;
  --blue-900: #1E3A8A;
  
  /* 회색 스케일 */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-500: #6B7280;
  --gray-900: #111827;
  
  /* 간격 단위 */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-4: 1rem;    /* 16px */
  --space-8: 2rem;    /* 32px */
}

/* 2. 의미적 토큰 (Semantic Tokens) - 용도별 별명 */
:root {
  /* 브랜드 색상 */
  --color-primary: var(--blue-600);
  --color-primary-light: var(--blue-500);
  --color-primary-dark: var(--blue-900);
  
  /* 상태 색상 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: var(--blue-500);
  
  /* 텍스트 색상 */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-500);
  --text-inverse: var(--gray-50);
  
  /* 배경 색상 */
  --bg-primary: #FFFFFF;
  --bg-secondary: var(--gray-50);
  --bg-tertiary: var(--gray-100);
}

/* 3. 컴포넌트 토큰 (Component Tokens) - 특정 컴포넌트용 */
:root {
  /* 버튼 토큰 */
  --button-primary-bg: var(--color-primary);
  --button-primary-text: var(--text-inverse);
  --button-primary-border: var(--color-primary);
  --button-padding-x: var(--space-4);
  --button-padding-y: var(--space-2);
  --button-border-radius: 0.375rem;
  
  /* 카드 토큰 */
  --card-bg: var(--bg-primary);
  --card-border: var(--gray-100);
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --card-padding: var(--space-6);
  --card-border-radius: 0.5rem;
}
```

### 토큰 네이밍 컨벤션

```typescript
// 토큰 네이밍 규칙
interface TokenNamingConvention {
  // 구조: [category]-[property]-[variant]-[state]
  pattern: string;
  
  examples: {
    // 색상 토큰
    color: [
      "--color-primary",           // 기본 브랜드 색상
      "--color-primary-light",     // 밝은 변형
      "--color-primary-hover",     // 호버 상태
      "--text-primary",            // 기본 텍스트 색상
      "--bg-secondary"             // 보조 배경 색상
    ],
    
    // 간격 토큰
    spacing: [
      "--space-xs",    // 매우 작은 간격
      "--space-sm",    // 작은 간격
      "--space-md",    // 중간 간격
      "--space-lg",    // 큰 간격
      "--space-xl"     // 매우 큰 간격
    ],
    
    // 타이포그래피 토큰
    typography: [
      "--text-xs",     // 12px
      "--text-sm",     // 14px
      "--text-base",   // 16px
      "--text-lg",     // 18px
      "--text-xl",     // 20px
      "--font-heading", // 제목용 폰트
      "--font-body"    // 본문용 폰트
    ]
  };
}
```

## 색상 시스템

### 브랜드 색상 팔레트

```css
/* 브랜드 색상 - 50부터 950까지 11단계 */
:root {
  /* Primary 브랜드 색상 */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-300: #A5B4FC;
  --primary-400: #818CF8;
  --primary-500: #6366F1;  /* 기본 브랜드 색상 */
  --primary-600: #4F46E5;
  --primary-700: #4338CA;
  --primary-800: #3730A3;
  --primary-900: #312E81;
  --primary-950: #1E1B4B;
  
  /* Secondary 보조 색상 */
  --secondary-50: #F8FAFC;
  --secondary-100: #F1F5F9;
  --secondary-200: #E2E8F0;
  --secondary-300: #CBD5E1;
  --secondary-400: #94A3B8;
  --secondary-500: #64748B;  /* 기본 보조 색상 */
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1E293B;
  --secondary-900: #0F172A;
  --secondary-950: #020617;
}
```

### 의미적 색상 시스템

```css
/* 상태별 색상 정의 */
:root {
  /* 성공 상태 */
  --color-success-50: #ECFDF5;
  --color-success-500: #10B981;
  --color-success-600: #059669;
  --color-success-900: #064E3B;
  
  /* 경고 상태 */
  --color-warning-50: #FFFBEB;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-900: #78350F;
  
  /* 오류 상태 */
  --color-error-50: #FEF2F2;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-error-900: #7F1D1D;
  
  /* 정보 상태 */
  --color-info-50: #EFF6FF;
  --color-info-500: #3B82F6;
  --color-info-600: #2563EB;
  --color-info-900: #1E3A8A;
}

/* 의미적 별명 적용 */
:root {
  --color-success: var(--color-success-500);
  --color-warning: var(--color-warning-500);
  --color-error: var(--color-error-500);
  --color-info: var(--color-info-500);
  
  --color-success-bg: var(--color-success-50);
  --color-success-border: var(--color-success-200);
  --color-success-text: var(--color-success-800);
}
```

### 다크모드 지원

```css
/* 라이트 모드 (기본) */
:root {
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  --border-primary: #E5E7EB;
  --border-secondary: #D1D5DB;
}

/* 다크 모드 */
[data-theme="dark"] {
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-muted: #9CA3AF;
  
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  
  --border-primary: #374151;
  --border-secondary: #4B5563;
}

/* 자동 다크모드 감지 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
    --text-muted: #9CA3AF;
    
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --bg-tertiary: #374151;
    
    --border-primary: #374151;
    --border-secondary: #4B5563;
  }
}
```

## 타이포그래피 시스템

### 타입 스케일과 폰트 정의

```css
/* 폰트 패밀리 */
:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
               "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", 
               sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", 
               "Noto Color Emoji";
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, 
               "Liberation Mono", Menlo, monospace;
  
  /* 브랜드 폰트 (선택사항) */
  --font-heading: "Inter", var(--font-sans);
  --font-body: var(--font-sans);
}

/* 타입 스케일 - Modular Scale 사용 */
:root {
  /* 폰트 크기 */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px - 기준 크기 */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
  
  /* 라인 하이트 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* 폰트 웨이트 */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### 텍스트 스타일 컴포넌트

```css
/* 제목 스타일 */
.text-display-lg {
  font-family: var(--font-heading);
  font-size: var(--text-6xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.text-display-md {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.text-display-sm {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* 제목 스타일 */
.text-heading-xl {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-heading-lg {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-heading-md {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

/* 본문 스타일 */
.text-body-lg {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

.text-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-body-sm {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* 캡션 및 라벨 */
.text-caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
}

.text-overline {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

## 간격 시스템

### 8px 그리드 기반 간격

```css
/* 간격 토큰 - 8px 그리드 시스템 */
:root {
  /* 기본 간격 단위 */
  --space-0: 0;
  --space-px: 1px;
  --space-0_5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1_5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2_5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3_5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-28: 7rem;       /* 112px */
  --space-32: 8rem;       /* 128px */
  --space-36: 9rem;       /* 144px */
  --space-40: 10rem;      /* 160px */
  --space-44: 11rem;      /* 176px */
  --space-48: 12rem;      /* 192px */
  --space-52: 13rem;      /* 208px */
  --space-56: 14rem;      /* 224px */
  --space-60: 15rem;      /* 240px */
  --space-64: 16rem;      /* 256px */
  --space-72: 18rem;      /* 288px */
  --space-80: 20rem;      /* 320px */
  --space-96: 24rem;      /* 384px */
}

/* 의미적 간격 별명 */
:root {
  /* 컴포넌트 내부 간격 */
  --space-xs: var(--space-1);    /* 4px */
  --space-sm: var(--space-2);    /* 8px */
  --space-md: var(--space-4);    /* 16px */
  --space-lg: var(--space-6);    /* 24px */
  --space-xl: var(--space-8);    /* 32px */
  --space-2xl: var(--space-12);  /* 48px */
  --space-3xl: var(--space-16);  /* 64px */
  --space-4xl: var(--space-24);  /* 96px */
  
  /* 레이아웃 간격 */
  --space-section: var(--space-16);    /* 섹션 간 간격 */
  --space-component: var(--space-8);   /* 컴포넌트 간 간격 */
  --space-element: var(--space-4);     /* 요소 간 간격 */
  --space-inline: var(--space-2);      /* 인라인 요소 간격 */
}
```

### 반응형 간격

```css
/* 반응형 간격 토큰 */
:root {
  /* 적응형 간격 - clamp() 사용 */
  --space-fluid-xs: clamp(0.25rem, 1vw, 0.5rem);      /* 4px - 8px */
  --space-fluid-sm: clamp(0.5rem, 2vw, 1rem);         /* 8px - 16px */
  --space-fluid-md: clamp(1rem, 4vw, 2rem);           /* 16px - 32px */
  --space-fluid-lg: clamp(1.5rem, 6vw, 3rem);         /* 24px - 48px */
  --space-fluid-xl: clamp(2rem, 8vw, 4rem);           /* 32px - 64px */
  --space-fluid-2xl: clamp(3rem, 12vw, 6rem);         /* 48px - 96px */
  
  /* 컨테이너 간격 */
  --container-padding: clamp(1rem, 4vw, 2rem);
  --container-margin: clamp(2rem, 8vw, 4rem);
}

/* 브레이크포인트별 간격 */
@media (min-width: 640px) {
  :root {
    --space-section: var(--space-20);
    --space-component: var(--space-12);
  }
}

@media (min-width: 1024px) {
  :root {
    --space-section: var(--space-24);
    --space-component: var(--space-16);
  }
}
```

## 그림자와 elevation

### 그림자 시스템

```css
/* 그림자 토큰 */
:root {
  /* 기본 그림자 */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  
  /* 컬러 그림자 */
  --shadow-primary: 0 4px 14px 0 rgb(79 70 229 / 0.25);
  --shadow-success: 0 4px 14px 0 rgb(16 185 129 / 0.25);
  --shadow-warning: 0 4px 14px 0 rgb(245 158 11 / 0.25);
  --shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.25);
}

/* Elevation 레벨 */
:root {
  /* Material Design 영감 elevation */
  --elevation-0: none;                    /* Surface */
  --elevation-1: var(--shadow-sm);        /* Card */
  --elevation-2: var(--shadow-md);        /* Button */
  --elevation-3: var(--shadow-lg);        /* Modal, Dropdown */
  --elevation-4: var(--shadow-xl);        /* Navigation */
  --elevation-5: var(--shadow-2xl);       /* Tooltip */
}
```

### 둥근 모서리 시스템

```css
/* 보더 radius 토큰 */
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;      /* 2px */
  --radius-md: 0.25rem;       /* 4px */
  --radius-lg: 0.375rem;      /* 6px */
  --radius-xl: 0.5rem;        /* 8px */
  --radius-2xl: 0.75rem;      /* 12px */
  --radius-3xl: 1rem;         /* 16px */
  --radius-4xl: 1.5rem;       /* 24px */
  --radius-full: 9999px;      /* 완전한 원형 */
  
  /* 의미적 radius */
  --radius-button: var(--radius-lg);
  --radius-card: var(--radius-xl);
  --radius-input: var(--radius-lg);
  --radius-modal: var(--radius-2xl);
  --radius-avatar: var(--radius-full);
}
```

## 토큰 관리 시스템

### Style Dictionary 설정

```javascript
// style-dictionary.config.js
const StyleDictionary = require('style-dictionary');

// 커스텀 변환 함수
StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: function(token) {
    return token.attributes.category === 'size';
  },
  transformer: function(token) {
    return parseFloat(token.original.value) + 'px';
  }
});

// CSS 변수 포맷
StyleDictionary.registerFormat({
  name: 'css/variables',
  formatter: function(dictionary) {
    return `:root {\n${dictionary.allTokens
      .map(token => `  --${token.name}: ${token.value};`)
      .join('\n')}\n}`;
  }
});

// TypeScript 타입 생성
StyleDictionary.registerFormat({
  name: 'typescript/tokens',
  formatter: function(dictionary) {
    const tokens = dictionary.allTokens
      .map(token => `  '${token.name}': '${token.value}'`)
      .join(',\n');
    
    return `export const tokens = {\n${tokens}\n} as const;\n\nexport type TokenName = keyof typeof tokens;`;
  }
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    typescript: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [{
        destination: 'tokens.ts',
        format: 'typescript/tokens'
      }]
    }
  }
};
```

### JSON 토큰 정의

```json
{
  "color": {
    "primary": {
      "50": { "value": "#EEF2FF" },
      "100": { "value": "#E0E7FF" },
      "500": { "value": "#6366F1" },
      "600": { "value": "#4F46E5" },
      "900": { "value": "#312E81" }
    },
    "semantic": {
      "success": { "value": "#10B981" },
      "warning": { "value": "#F59E0B" },
      "error": { "value": "#EF4444" }
    }
  },
  "size": {
    "space": {
      "xs": { "value": "4" },
      "sm": { "value": "8" },
      "md": { "value": "16" },
      "lg": { "value": "24" },
      "xl": { "value": "32" }
    }
  },
  "font": {
    "size": {
      "xs": { "value": "12" },
      "sm": { "value": "14" },
      "base": { "value": "16" },
      "lg": { "value": "18" },
      "xl": { "value": "20" }
    }
  }
}
```

## SuperClaude 토큰 활용

### AI 친화적 토큰 명명

```css
/* AI가 이해하기 쉬운 토큰 이름 */
:root {
  /* 직관적인 크기 명명 */
  --size-tiny: var(--space-1);
  --size-small: var(--space-2);
  --size-medium: var(--space-4);
  --size-large: var(--space-6);
  --size-huge: var(--space-8);
  
  /* 상황별 토큰 */
  --padding-button: var(--space-3) var(--space-4);
  --padding-card: var(--space-6);
  --padding-input: var(--space-3);
  --margin-section: var(--space-16);
  --gap-grid: var(--space-4);
  
  /* 상태별 색상 */
  --color-interactive: var(--primary-600);
  --color-interactive-hover: var(--primary-700);
  --color-interactive-active: var(--primary-800);
  --color-interactive-disabled: var(--gray-300);
}
```

### Claude 명령어 최적화

```bash
# 토큰 기반 컴포넌트 생성
/create button component --use-tokens --variants "primary,secondary,ghost" --sizes "sm,md,lg"

# 토큰 적용 스타일링
/style @components/Card --apply-tokens "card-padding,card-bg,card-border,card-shadow"

# 반응형 토큰 적용
/make-responsive @components --use-fluid-tokens --breakpoints "mobile,tablet,desktop"

# 다크모드 토큰 적용
/add-dark-mode @styles --token-mapping --preserve-contrast

# 토큰 검증
/validate-tokens @design-tokens.css --usage-report --unused-tokens
```

이 토큰 시스템을 통해 일관된 디자인과 AI 친화적 개발 환경을 구축할 수 있습니다.