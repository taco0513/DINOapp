# 🎨 UI/UX Design (UI/UX 디자인)

## 🎯 개요

API 위에 **사용자가 실제로 상호작용하는 인터페이스**를 설계합니다. BMAD에서는 빠른 MVP를 위해 실용적이고 효과적인 디자인에 집중합니다.

### 디자인 원칙
1. **사용성 우선**: 예쁜 것보다 쓰기 편한 것
2. **빠른 구현**: 복잡한 것보다 단순한 것
3. **반응형 기본**: 모바일 우선 설계
4. **일관성**: 통일된 디자인 시스템

## 🗺️ 사용자 여정 맵핑

### User Journey Map 작성
```
신규 사용자 여정:
1. 랜딩 페이지 도착
   → 문제 인식
   → 솔루션 이해

2. 회원가입
   → 이메일 입력
   → 비밀번호 설정
   → 이메일 인증

3. 온보딩
   → 기본 설정
   → 튜토리얼
   → 첫 사용

4. 핵심 기능 사용
   → 가치 경험
   → 습관 형성

5. 유료 전환
   → 제한 도달
   → 업그레이드
   → 결제
```

### 핵심 플로우 정의
```
이커머스 핵심 플로우:
1. 상품 탐색
   홈 → 카테고리 → 상품 목록 → 상품 상세

2. 구매 플로우
   장바구니 → 주문서 → 결제 → 완료

3. 사용자 관리
   로그인 → 마이페이지 → 주문 내역
```

## 📐 와이어프레임

### 모바일 우선 설계
```
┌─────────────────┐
│     Header      │ ← 로고, 메뉴
├─────────────────┤
│                 │
│   Hero Section  │ ← 핵심 메시지
│                 │
├─────────────────┤
│   Features      │ ← 주요 기능
├─────────────────┤
│   CTA Button    │ ← 행동 유도
└─────────────────┘
```

### 반응형 그리드
```
Mobile (< 768px):    1 column
Tablet (768-1024px): 2 columns
Desktop (> 1024px):  3-4 columns

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 컨텐츠 -->
</div>
```

## 🎨 디자인 시스템

### 컬러 팔레트
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;  /* 메인 */
--primary-700: #1d4ed8;  /* 호버 */

/* Neutral Colors */
--gray-50: #f9fafb;      /* 배경 */
--gray-900: #111827;     /* 텍스트 */

/* Semantic Colors */
--success: #10b981;      /* 성공 */
--warning: #f59e0b;      /* 경고 */
--error: #ef4444;        /* 에러 */
```

### 타이포그래피
```css
/* Font Scale */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */

/* Font Weight */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 컴포넌트 라이브러리
```jsx
// Button Component
<Button
  variant="primary|secondary|ghost"
  size="sm|md|lg"
  loading={false}
  disabled={false}
>
  Click me
</Button>

// Card Component
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>

// Form Component
<Form onSubmit={handleSubmit}>
  <FormField
    label="이메일"
    name="email"
    type="email"
    required
    error={errors.email}
  />
  <Button type="submit">제출</Button>
</Form>
```

## 🖼️ UI 패턴

### 네비게이션 패턴
```jsx
// 모바일: 하단 네비게이션
<BottomNav>
  <NavItem icon="home" label="홈" />
  <NavItem icon="search" label="검색" />
  <NavItem icon="cart" label="장바구니" />
  <NavItem icon="user" label="마이" />
</BottomNav>

// 데스크톱: 상단 네비게이션
<TopNav>
  <Logo />
  <NavMenu>
    <MenuItem>상품</MenuItem>
    <MenuItem>카테고리</MenuItem>
  </NavMenu>
  <UserMenu />
</TopNav>
```

### 데이터 표시 패턴
```jsx
// 리스트 뷰
<ListView>
  {items.map(item => (
    <ListItem key={item.id}>
      <Thumbnail src={item.image} />
      <ItemInfo>
        <Title>{item.name}</Title>
        <Price>{item.price}</Price>
      </ItemInfo>
    </ListItem>
  ))}
</ListView>

// 그리드 뷰
<GridView>
  {items.map(item => (
    <GridItem key={item.id}>
      <Image src={item.image} />
      <Title>{item.name}</Title>
      <Price>{item.price}</Price>
    </GridItem>
  ))}
</GridView>
```

### 폼 패턴
```jsx
// 단계별 폼
<StepForm>
  <Step title="기본 정보">
    <Input name="name" />
    <Input name="email" />
  </Step>
  <Step title="상세 정보">
    <Select name="category" />
    <Textarea name="description" />
  </Step>
  <Step title="확인">
    <Summary />
    <Submit />
  </Step>
</StepForm>
```

## 🚀 빠른 프로토타이핑

### Tailwind CSS 활용
```html
<!-- 카드 컴포넌트 -->
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-xl font-semibold mb-2">제목</h3>
  <p class="text-gray-600 mb-4">설명 텍스트</p>
  <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
    자세히 보기
  </button>
</div>

<!-- 반응형 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 카드들 -->
</div>
```

### 컴포넌트 라이브러리 활용
```
추천 라이브러리:
1. shadcn/ui - 커스터마이징 가능
2. Headless UI - 스타일 없는 컴포넌트
3. Radix UI - 접근성 보장
4. Material UI - 완성도 높은 디자인
```

## 📱 모바일 최적화

### 터치 친화적 디자인
```css
/* 최소 터치 영역 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* 적절한 간격 */
.touch-spacing {
  margin: 8px;
  padding: 12px;
}

/* 스와이프 제스처 */
.swipeable {
  touch-action: pan-x;
}
```

### 성능 최적화
```jsx
// 이미지 최적화
<Image
  src="/product.jpg"
  alt="상품"
  width={300}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// 무한 스크롤
<InfiniteScroll
  dataLength={items.length}
  next={fetchMoreData}
  hasMore={hasMore}
  loader={<Spinner />}
>
  {items.map(item => <Item key={item.id} />)}
</InfiniteScroll>
```

## 🎯 Day 12-15 실행 계획

### Day 12: UX 설계
```
오전:
- 사용자 여정 맵핑
- 핵심 플로우 정의
- 정보 구조 설계

오후:
- 와이어프레임 작성
- 프로토타입 도구 선택
- 초기 스케치
```

### Day 13: 디자인 시스템
```
오전:
- 컬러 팔레트 정의
- 타이포그래피 설정
- 아이콘 선택

오후:
- 기본 컴포넌트 디자인
- 반응형 규칙 설정
- 스타일 가이드 작성
```

### Day 14: UI 구현
```
오전:
- 개발 환경 설정
- 컴포넌트 라이브러리 선택
- 기본 레이아웃 구현

오후:
- 핵심 페이지 구현
- 반응형 처리
- 인터랙션 추가
```

### Day 15: 통합 및 테스트
```
오전:
- API 연동
- 상태 관리 구현
- 데이터 플로우 확인

오후:
- 사용성 테스트
- 성능 최적화
- 버그 수정
```

## ✅ 체크리스트

### UI/UX 완료 기준
- [ ] 모든 핵심 플로우 구현
- [ ] 모바일/데스크톱 반응형
- [ ] 일관된 디자인 시스템
- [ ] 접근성 기준 충족
- [ ] 3초 이내 로딩
- [ ] 직관적인 네비게이션

## 💡 실전 팁

### Do's ✅
1. **기존 패턴 활용**: 검증된 UI 패턴
2. **점진적 개선**: MVP 먼저, 개선은 나중
3. **실제 데이터**: 더미 데이터 X
4. **빠른 피드백**: 자주 테스트

### Don'ts ❌
1. **과도한 애니메이션**: 성능 저하
2. **복잡한 인터랙션**: 학습 곡선
3. **커스텀 모든 것**: 시간 낭비
4. **완벽주의**: 80%면 충분

## 🎨 디자인 리소스

### 무료 리소스
```
아이콘:
- Heroicons
- Feather Icons
- Phosphor Icons

일러스트:
- unDraw
- Storyset
- Blush

UI 킷:
- Figma Community
- Sketch Resources
```

### 참고 사이트
```
디자인 영감:
- Dribbble
- Behance
- Awwwards

UI 패턴:
- UI Patterns
- Mobbin
- Page Flows
```

---

> 🎨 **"좋은 디자인은 보이지 않는다"**

다음: [통합 구현](05_Integration.md) →