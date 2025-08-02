# DINO v2.0 Navigation Structure

**Last Updated**: 2025-08-02  
**Status**: Comprehensive navigation redesign with Gmail Sync integration

## 🧭 Navigation Philosophy

### Principles
1. **Discoverability**: New features prominently displayed
2. **Efficiency**: Core features within 2 clicks
3. **Clarity**: Clear labels and visual hierarchy
4. **Flexibility**: Desktop mega-menu, mobile bottom nav
5. **Context**: Smart navigation based on user state

## 📱 Navigation Components

### 1. Global Navigation Bar (Desktop)

```tsx
const navigation: NavItem[] = [
  { 
    name: '홈', 
    href: '/', 
    icon: '🏠' 
  },
  {
    name: '스마트 동기화',
    icon: '📬',
    badge: 'NEW', // Visual indicator for new feature
    submenu: [
      { 
        name: 'Gmail 동기화', 
        href: '/gmail-sync', 
        icon: '✉️',
        description: '이메일에서 항공편 자동 추출',
        badge: 'NEW'
      },
      { 
        name: '캘린더 연동', 
        href: '/calendar-sync', 
        icon: '📅',
        description: '구글 캘린더 일정 동기화',
        badge: 'SOON'
      },
      { 
        name: '자동 여행 기록', 
        href: '/auto-trips', 
        icon: '🤖',
        description: '여행 기록 자동 생성'
      },
      { 
        name: '동기화 설정', 
        href: '/sync-settings', 
        icon: '⚙️',
        description: '동기화 옵션 관리'
      },
    ]
  },
  {
    name: '여행 관리',
    icon: '🌍',
    submenu: [
      { 
        name: '대시보드', 
        href: '/dashboard', 
        icon: '📈',
        description: '여행 현황 한눈에 보기'
      },
      { 
        name: '여행 기록', 
        href: '/trips', 
        icon: '📅',
        description: '모든 여행 기록 관리'
      },
      { 
        name: '샹겐 추적기', 
        href: '/schengen', 
        icon: '🇪🇺',
        description: '90/180일 규칙 계산'
      },
      { 
        name: '여행 분석', 
        href: '/analytics', 
        icon: '📊',
        description: '통계 및 인사이트'
      },
    ]
  },
  {
    name: '비자 & 입국',
    icon: '🛂',
    submenu: [
      { 
        name: '비자 체커', 
        href: '/visa', 
        icon: '🔍',
        description: '국가별 비자 요구사항'
      },
      { 
        name: '비자 추적기', 
        href: '/visa-tracker', 
        icon: '⏰',
        description: '비자 만료일 관리'
      },
      { 
        name: '비자 도우미', 
        href: '/visa-assistant', 
        icon: '📋',
        description: '비자 신청 가이드'
      },
      { 
        name: '정책 업데이트', 
        href: '/visa-updates', 
        icon: '🔔',
        description: '실시간 정책 변경 알림'
      },
    ]
  },
  {
    name: '내 문서',
    icon: '📁',
    submenu: [
      { 
        name: '여권 관리', 
        href: '/multi-passport', 
        icon: '📔',
        description: '복수 여권 정보 관리'
      },
      { 
        name: '비자 문서', 
        href: '/visa-documents', 
        icon: '📄',
        description: '비자 서류 보관함',
        badge: 'SOON'
      },
      { 
        name: '여행 서류', 
        href: '/travel-documents', 
        icon: '🗂️',
        description: '항공권, 호텔 예약 등',
        badge: 'SOON'
      },
      { 
        name: '문서 스캔', 
        href: '/document-scanner', 
        icon: '📷',
        description: '서류 스캔 및 보관',
        badge: 'SOON'
      },
    ]
  },
];
```

### 2. Mobile Bottom Navigation

```tsx
const mobileQuickAccess = [
  { href: '/dashboard', icon: '📈', label: '대시보드' },
  { href: '/gmail-sync', icon: '📬', label: '동기화', badge: 'NEW' },
  { href: '/schengen', icon: '🇪🇺', label: '샹겐' },
  { href: '/trips', icon: '✈️', label: '여행' },
  { href: '/profile', icon: '👤', label: '프로필' },
];
```

### 3. Breadcrumb Navigation

```tsx
// Example breadcrumb structure
<Breadcrumb>
  <BreadcrumbItem href="/">홈</BreadcrumbItem>
  <BreadcrumbItem href="/gmail-sync">스마트 동기화</BreadcrumbItem>
  <BreadcrumbItem current>Gmail 동기화</BreadcrumbItem>
</Breadcrumb>
```

### 4. Contextual Navigation

```tsx
// Related features sidebar
<RelatedFeatures currentPage="/gmail-sync">
  <FeatureLink href="/trips" icon="📅">
    동기화된 항공편으로 여행 기록 만들기
  </FeatureLink>
  <FeatureLink href="/schengen" icon="🇪🇺">
    샹겐 체류 일수 확인하기
  </FeatureLink>
  <FeatureLink href="/analytics" icon="📊">
    여행 통계 보기
  </FeatureLink>
</RelatedFeatures>
```

## 🎨 Visual Design

### Navigation States
```scss
// Default state
.nav-item {
  color: $gray-700;
  &:hover {
    color: $blue-600;
    background: $gray-50;
  }
}

// Active state
.nav-item.active {
  color: $blue-700;
  background: $blue-50;
  font-weight: 500;
}

// New feature badge
.badge-new {
  background: $purple-100;
  color: $purple-800;
  animation: pulse 2s infinite;
}
```

### Mega Menu Design
```tsx
<MegaMenu>
  <MenuHeader>
    <Icon>{category.icon}</Icon>
    <Title>{category.name}</Title>
  </MenuHeader>
  <MenuGrid columns={2}>
    {items.map(item => (
      <MenuItem>
        <ItemIcon>{item.icon}</ItemIcon>
        <ItemContent>
          <ItemTitle>
            {item.name}
            {item.badge && <Badge type={item.badge} />}
          </ItemTitle>
          <ItemDescription>{item.description}</ItemDescription>
        </ItemContent>
      </MenuItem>
    ))}
  </MenuGrid>
</MegaMenu>
```

## 🔄 User Journey Flows

### New User Journey
```
1. Landing → See "NEW" Gmail Sync
2. Click Gmail Sync → Authorization
3. Import flights → Manual confirmation
4. View Dashboard → See integrated data
5. Explore related features
```

### Returning User Journey
```
1. Dashboard (default landing)
2. Quick access to frequent features
3. Notifications for new flights
4. One-click sync updates
```

### Power User Journey
```
1. Keyboard shortcuts (⌘K for search)
2. Direct URL navigation
3. Customized quick links
4. Batch operations
```

## 📊 Navigation Analytics

### Tracking Points
- Click-through rates per menu item
- Time to find features
- Navigation path analysis
- Mobile vs desktop patterns
- New feature discovery rate

### Success Metrics
- **Gmail Sync Discovery**: >80% users find within first visit
- **Average Clicks to Feature**: ≤2 clicks
- **Mobile Navigation Usage**: >60% on mobile
- **Breadcrumb Usage**: >40% for orientation

## 🚀 Implementation Guidelines

### Progressive Enhancement
1. **Phase 1**: Add Gmail Sync to main nav
2. **Phase 2**: Implement mega menu
3. **Phase 3**: Add breadcrumbs
4. **Phase 4**: Mobile bottom nav
5. **Phase 5**: Contextual navigation

### Accessibility Requirements
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader optimization
- High contrast support

### Performance Considerations
- Lazy load mega menu content
- Preload critical navigation paths
- Cache navigation state
- Optimize for mobile data

## 🔧 Technical Implementation

### Navigation State Management
```typescript
interface NavigationState {
  activeItem: string;
  expandedMenus: string[];
  mobileMenuOpen: boolean;
  userPreferences: NavPreferences;
}

const useNavigation = create<NavigationState>((set) => ({
  activeItem: '',
  expandedMenus: [],
  mobileMenuOpen: false,
  userPreferences: loadUserPreferences(),
  
  setActiveItem: (item) => set({ activeItem: item }),
  toggleMenu: (menu) => set((state) => ({
    expandedMenus: state.expandedMenus.includes(menu)
      ? state.expandedMenus.filter(m => m !== menu)
      : [...state.expandedMenus, menu]
  })),
}));
```

### Smart Navigation Features
- Auto-highlight based on current route
- Remember expanded menus
- Predictive navigation preloading
- Search integration
- Recent items tracking

## 🎯 Future Enhancements

### AI-Powered Navigation
- Personalized menu ordering
- Predictive feature suggestions
- Voice navigation
- Natural language search

### Advanced Features
- Customizable navigation
- Role-based menu items
- A/B testing different structures
- Multi-language support

---

*Navigation structure designed for optimal user experience and feature discovery*