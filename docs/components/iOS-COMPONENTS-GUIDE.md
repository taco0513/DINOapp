# iOS 컴포넌트 가이드

## 🎨 통합 디자인 시스템

iOS Human Interface Guidelines와 기존 디자인 토큰을 통합한 시스템입니다.

## 사용 가능한 컴포넌트

### 1. 버튼 (Buttons)

```jsx
// Primary Button - iOS 스타일
<button className="ios-button">
  시작하기
</button>

// Secondary Button
<button className="ios-button ios-button-secondary">
  더 알아보기
</button>

// Destructive Button
<button className="ios-button ios-button-destructive">
  삭제
</button>

// 통합 시스템 사용
<button className="btn-primary">
  확인
</button>
```

### 2. 리스트 (Lists)

```jsx
// iOS 스타일 리스트
<div className="ios-list">
  <div className="ios-list-item">
    <span>대시보드</span>
    <span>→</span>
  </div>
  <div className="ios-list-item">
    <span>여행 기록</span>
    <span>→</span>
  </div>
</div>

// 통합 시스템 리스트
<div className="list">
  <div className="list-item">
    <span>설정</span>
    <ChevronRight className="w-4 h-4" />
  </div>
</div>
```

### 3. 카드 (Cards)

```jsx
// iOS 스타일 카드
<div className="ios-card">
  <h3 className="text-title-1">제목</h3>
  <p className="text-body">내용</p>
</div>

// 통합 시스템 카드
<div className="card">
  <h3 className="text-lg font-semibold">제목</h3>
  <p className="text-base text-secondary">내용</p>
</div>
```

### 4. 스위치 (Switch)

```jsx
// iOS 스위치
<div className={`ios-switch ${isActive ? 'active' : ''}`} onClick={toggle}>
  <div className='ios-switch-thumb' />
</div>
```

### 5. 세그먼트 컨트롤 (Segmented Control)

```jsx
<div className='ios-segment'>
  <div className='ios-segment-item active'>전체</div>
  <div className='ios-segment-item'>예정</div>
  <div className='ios-segment-item'>완료</div>
</div>
```

### 6. 탭 바 (Tab Bar)

```jsx
<div className='ios-tabbar'>
  <div className='ios-tab-item active'>
    <div className='ios-tab-icon'>🏠</div>
    <div className='ios-tab-label'>홈</div>
  </div>
  <div className='ios-tab-item'>
    <div className='ios-tab-icon'>✈️</div>
    <div className='ios-tab-label'>여행</div>
  </div>
</div>
```

## 타이포그래피

### iOS 텍스트 스타일

```jsx
// Large Title (34px)
<h1 className="ios-large-title">제목</h1>
<h1 className="text-large-title">제목</h1>

// Title 1 (28px)
<h2 className="text-title-1">제목 1</h2>

// Body (17px)
<p className="text-body">본문 텍스트</p>

// Caption (13px)
<span className="text-caption">캡션</span>
```

## 색상 사용법

### 통합 색상 변수

```css
/* Primary */
color: var(--color-primary); /* iOS Blue */
background: var(--color-primary);

/* Text */
color: var(--color-text-primary); /* 주요 텍스트 */
color: var(--color-text-secondary); /* 보조 텍스트 */

/* Semantic */
color: var(--color-success); /* 성공 - iOS Green */
color: var(--color-error); /* 에러 - iOS Red */
color: var(--color-warning); /* 경고 - iOS Orange */
```

## 반응형 디자인

### 모바일 우선 접근

```jsx
// 기본: 모바일
// md: 태블릿 (768px+)
// lg: 데스크톱 (1024px+)

<div className='px-4 md:px-6 lg:px-8'>
  <h1 className='text-2xl md:text-3xl lg:text-4xl'>반응형 제목</h1>
</div>
```

## 애니메이션

### iOS 스타일 전환

```css
/* 부드러운 전환 */
transition: all var(--duration-base) var(--easing);

/* 빠른 전환 */
transition: opacity var(--duration-fast) ease;

/* 탭 애니메이션 */
.tap-animation:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

## 접근성

### 최소 탭 영역

- 모든 인터랙티브 요소는 최소 44x44px
- 터치 영역 확보를 위한 padding 사용

### 색상 대비

- 텍스트와 배경 간 충분한 대비
- WCAG 2.1 AA 기준 준수

## 마이그레이션 가이드

### 기존 코드 → iOS 스타일

```jsx
// Before
<button className="px-8 py-4 bg-black text-white rounded-lg">
  버튼
</button>

// After
<button className="ios-button">
  버튼
</button>

// Or using unified system
<button className="btn-primary">
  버튼
</button>
```

### Tailwind → 디자인 토큰

```jsx
// Before
<div className="p-4 bg-gray-100 rounded-lg">

// After
<div style={{
  padding: 'var(--space-4)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)'
}}>
```

## 베스트 프랙티스

1. **일관성**: 한 페이지에서는 하나의 스타일 시스템 사용
2. **성능**: CSS 변수 사용으로 다크모드 전환 최적화
3. **접근성**: 모든 인터랙티브 요소에 적절한 피드백 제공
4. **반응형**: 모바일 우선으로 디자인하고 확장

## 체크리스트

새 컴포넌트 만들 때:

- [ ] iOS 가이드라인 확인
- [ ] 디자인 토큰 사용
- [ ] 다크모드 지원
- [ ] 터치 피드백 추가
- [ ] 접근성 테스트
