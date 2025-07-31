# DINO 스타일가이드

## 🎨 디자인 철학

"Less is More" - 미니멀리즘으로 본질에 집중

### 기술 스택

- **UI Framework**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v3.4
- **Theme System**: CSS Variables
- **Component Pattern**: Copy-paste components

### 핵심 원칙

1. **Simplicity**: 불필요한 장식 제거
2. **Clarity**: 명확한 정보 전달
3. **Consistency**: 일관된 디자인 언어
4. **Accessibility**: 모든 사용자를 위한 디자인 (Radix UI)

## 🎯 디자인 토큰 사용법

### 색상 시스템 (shadcn/ui + Tailwind)

#### Tailwind CSS Classes 사용

```tsx
/* 올바른 사용법 - Tailwind 클래스 ✅ */
<div className="bg-background text-foreground">
  <h1 className="text-primary">제목</h1>
  <p className="text-muted-foreground">설명</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    버튼
  </button>
</div>

/* 잘못된 예 - 하드코딩된 색상 ❌ */
<div className="bg-white text-black">
  <h1 className="text-blue-600">제목</h1>
  <p className="text-gray-600">설명</p>
  <button className="bg-blue-500 text-white">버튼</button>
</div>
```

#### CSS Variables (테마 토큰)

```css
/* shadcn/ui 디자인 토큰 */
:root {
  --background: 0 0% 100%; /* hsl(0 0% 100%) */
  --foreground: 0 0% 3.9%; /* hsl(0 0% 3.9%) */
  --primary: 221.2 83.2% 53.3%; /* hsl(221.2 83.2% 53.3%) */
  --muted: 240 4.8% 95.9%; /* hsl(240 4.8% 95.9%) */
  --muted-foreground: 240 3.8% 46.1%; /* hsl(240 3.8% 46.1%) */
  --border: 240 5.9% 90%; /* hsl(240 5.9% 90%) */
  --ring: 221.2 83.2% 53.3%; /* hsl(221.2 83.2% 53.3%) */
}

/* Tailwind 클래스로 사용 */
.text-primary {
  color: hsl(var(--primary));
}
.bg-background {
  background-color: hsl(var(--background));
}
.border-border {
  border-color: hsl(var(--border));
}
```

#### 색상 팔레트

```tsx
/* 주요 색상 클래스 */
// 배경
bg-background       // 기본 배경
bg-card            // 카드 배경
bg-muted           // 보조 배경

// 텍스트
text-foreground    // 기본 텍스트
text-muted-foreground // 보조 텍스트
text-primary       // 강조 텍스트

// 테두리
border-border      // 기본 테두리
border-input       // 입력 필드 테두리

// 버튼
bg-primary         // 주요 버튼
bg-secondary       // 보조 버튼
bg-destructive     // 위험 액션

/* 올바른 예 ✅ */
color: var(--color-text-secondary);
```

#### Background & Surface

```css
/* 배경 색상 */
background: var(--color-background); /* #ffffff */
background: var(--color-surface); /* #fafafa */
background: var(--color-surface-hover); /* #f5f5f5 */

/* 잘못된 예 ❌ */
background: #fff;
background: white;
background-color: #f5f5f5;

/* 올바른 예 ✅ */
background: var(--color-background);
```

### 타이포그래피

#### Font Sizes

```css
/* 폰트 크기 - rem 단위 사용 */
font-size: var(--text-xs); /* 0.75rem (12px) */
font-size: var(--text-sm); /* 0.875rem (14px) */
font-size: var(--text-base); /* 1rem (16px) */
font-size: var(--text-lg); /* 1.125rem (18px) */
font-size: var(--text-xl); /* 1.25rem (20px) */
font-size: var(--text-2xl); /* 1.5rem (24px) */
font-size: var(--text-3xl); /* 2rem (32px) */
font-size: var(--text-4xl); /* 2.5rem (40px) */

/* 잘못된 예 ❌ */
font-size: 16px;
font-size: 1.5em;
font-size: 24px;

/* 올바른 예 ✅ */
font-size: var(--text-base);
```

#### Font Weights

```css
/* 폰트 굵기 */
font-weight: var(--font-normal); /* 400 */
font-weight: var(--font-medium); /* 500 */
font-weight: var(--font-semibold); /* 600 */
font-weight: var(--font-bold); /* 700 */

/* 잘못된 예 ❌ */
font-weight: 600;
font-weight: bold;

/* 올바른 예 ✅ */
font-weight: var(--font-semibold);
```

### 간격 시스템

#### Spacing

```css
/* 간격 - 일관된 리듬 유지 */
padding: var(--space-1); /* 0.25rem (4px) */
padding: var(--space-2); /* 0.5rem (8px) */
padding: var(--space-3); /* 0.75rem (12px) */
padding: var(--space-4); /* 1rem (16px) */
padding: var(--space-5); /* 1.25rem (20px) */
padding: var(--space-6); /* 1.5rem (24px) */
padding: var(--space-8); /* 2rem (32px) */

/* 잘못된 예 ❌ */
padding: 20px;
margin: 1.5rem;
gap: 16px;

/* 올바른 예 ✅ */
padding: var(--space-5);
margin: var(--space-6);
gap: var(--space-4);
```

### Border Radius

```css
/* 모서리 둥글기 */
border-radius: var(--radius-sm); /* 0.25rem (4px) */
border-radius: var(--radius-base); /* 0.5rem (8px) */
border-radius: var(--radius-md); /* 0.75rem (12px) */
border-radius: var(--radius-lg); /* 1rem (16px) */
border-radius: var(--radius-xl); /* 1.5rem (24px) */
border-radius: var(--radius-full); /* 9999px */

/* 잘못된 예 ❌ */
border-radius: 8px;
border-radius: 50%;

/* 올바른 예 ✅ */
border-radius: var(--radius-base);
border-radius: var(--radius-full);
```

### 그림자 시스템

```css
/* 그림자 - 미묘하고 부드럽게 */
box-shadow: var(--shadow-sm);
box-shadow: var(--shadow-base);
box-shadow: var(--shadow-md);
box-shadow: var(--shadow-lg);
box-shadow: var(--shadow-xl);

/* 잘못된 예 ❌ */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

/* 올바른 예 ✅ */
box-shadow: var(--shadow-base);
```

## 🧩 컴포넌트 패턴

### 버튼

```jsx
/* Primary Button */
<button className="px-8 py-4 text-base font-medium text-white bg-black hover:bg-gray-900 rounded-lg transition-colors duration-200">
  시작하기
</button>

/* Secondary Button */
<button className="px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-200">
  더 알아보기
</button>

/* 스타일 통일을 위한 클래스명 규칙 */
- px-8 py-4: 버튼 패딩
- text-base: 기본 폰트 크기
- font-medium: 중간 굵기
- rounded-lg: 둥근 모서리
- transition-colors duration-200: 부드러운 전환
```

### 카드

```jsx
<div className='bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg'>
  {/* 카드 내용 */}
</div>
```

### 제목 계층 구조

```jsx
/* Page Title */
<h1 className="text-6xl lg:text-7xl font-bold text-black">
  DINO
</h1>

/* Section Title */
<h2 className="text-3xl lg:text-4xl font-bold text-black">
  섹션 제목
</h2>

/* Component Title */
<h3 className="text-xl font-semibold text-black">
  컴포넌트 제목
</h3>
```

## 🚫 피해야 할 패턴

### 1. 하드코딩된 색상

```jsx
/* 잘못된 예 ❌ */
<div style={{ color: '#666' }}>
<p className="text-gray-600">
<span style={{ background: '#f5f5f5' }}>

/* 올바른 예 ✅ */
<div style={{ color: 'var(--color-text-secondary)' }}>
<p className="text-gray-600"> /* Tailwind 사용 시 */
<span style={{ background: 'var(--color-surface-hover)' }}>
```

### 2. 일관성 없는 간격

```jsx
/* 잘못된 예 ❌ */
<div style={{ padding: '20px', margin: '15px' }}>
<div className="p-5 m-3.5">

/* 올바른 예 ✅ */
<div style={{ padding: 'var(--space-5)', margin: 'var(--space-4)' }}>
<div className="p-5 m-4"> /* Tailwind의 경우 4의 배수 사용 */
```

### 3. 임의의 스타일

```jsx
/* 잘못된 예 ❌ */
<div style={{ fontSize: '18px', lineHeight: '1.7' }}>

/* 올바른 예 ✅ */
<div className="text-lg leading-relaxed">
```

## 📱 반응형 디자인

### Breakpoints

```css
/* 모바일 우선 접근법 */
@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
```

### Tailwind 반응형 클래스

```jsx
<div className="px-4 md:px-6 lg:px-8">
<h1 className="text-4xl md:text-5xl lg:text-6xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## ✅ 체크리스트

### 새 컴포넌트 만들 때

- [ ] CSS 변수 사용했나? (색상, 간격, 폰트)
- [ ] 하드코딩된 값 없나?
- [ ] 반응형 고려했나?
- [ ] 다크모드 지원되나?
- [ ] 접근성 확인했나?

### 기존 컴포넌트 수정할 때

- [ ] 디자인 토큰으로 교체했나?
- [ ] 스타일 일관성 확인했나?
- [ ] 다른 컴포넌트와 어울리나?

## 🔄 마이그레이션 가이드

### 하드코딩된 색상 → CSS 변수

```jsx
/* Before */
color: '#000'        → color: 'var(--color-primary)'
color: '#666'        → color: 'var(--color-text-secondary)'
color: '#999'        → color: 'var(--color-text-tertiary)'
background: '#fff'   → background: 'var(--color-background)'
background: '#f5f5f5'→ background: 'var(--color-surface-hover)'
border: '1px solid #eee' → border: '1px solid var(--color-border)'
```

### 픽셀 값 → rem 단위

```jsx
/* Before */
font-size: '14px'    → font-size: 'var(--text-sm)'
font-size: '16px'    → font-size: 'var(--text-base)'
font-size: '24px'    → font-size: 'var(--text-2xl)'
padding: '16px'      → padding: 'var(--space-4)'
margin: '20px'       → margin: 'var(--space-5)'
```

## 📚 참고 자료

- Design Tokens: `/styles/design-tokens.css`
- Component Styles: `/styles/components.css`
- Tailwind Config: `/tailwind.config.js`
