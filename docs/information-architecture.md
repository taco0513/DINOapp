# DINO v2.0 Information Architecture

**Last Updated**: 2025-08-02  
**Status**: Comprehensive IA Restructure with Gmail Sync Integration

## 🏗️ Current IA Structure

### Navigation Hierarchy

```
DINO v2.0
├── 🏠 홈 (/)
├── 📬 스마트 동기화 (NEW)
│   ├── Gmail 동기화 (/gmail-sync)
│   ├── 캘린더 연동 (/calendar-sync) [planned]
│   ├── 자동 여행 기록 (/auto-trips) [planned]
│   └── 동기화 설정 (/sync-settings) [planned]
├── 🌍 여행 관리
│   ├── 대시보드 (/dashboard)
│   ├── 여행 기록 (/trips)
│   ├── 샹겐 추적기 (/schengen)
│   ├── 여행 분석 (/analytics)
│   └── 다국가 추적 (/tracker)
├── 🛂 비자 & 입국
│   ├── 비자 체커 (/visa)
│   ├── 비자 추적기 (/visa-tracker)
│   ├── 비자 도우미 (/visa-assistant)
│   ├── 입국 요구사항 (/entry-requirements) [planned]
│   └── 정책 업데이트 (/visa-updates)
├── 📁 내 문서
│   ├── 여권 관리 (/multi-passport)
│   ├── 비자 문서 (/visa-documents) [planned]
│   ├── 여행 서류 (/travel-documents) [planned]
│   └── 문서 스캔 (/document-scanner) [planned]
└── 👤 사용자
    ├── 프로필 (/profile)
    ├── 설정 (/settings) [planned]
    └── 도움말 (/help) [planned]
```

## 🔄 User Flows

### 1. New User Onboarding Flow
```
Landing Page → Sign Up → Gmail Sync Setup → Passport Info → First Trip
     ↓                          ↓                    ↓
   Features               Auto-import         Multi-passport     Dashboard
```

### 2. Gmail Sync Flow
```
Gmail Sync → Email Scan → Flight Detection → Manual Confirmation → Trip Creation
     ↓            ↓              ↓                    ↓                ↓
  Auth Google   Progress    Confidence Score    Edit/Confirm    Update Dashboard
```

### 3. Trip Planning Flow
```
Dashboard → Visa Check → Schengen Calculator → Trip Creation → Analytics
    ↓           ↓              ↓                    ↓             ↓
 Overview   Requirements    Stay Days           Save Trip    Insights
```

## 🔗 Cross-Feature Integration Points

### Gmail Sync Integration
- **→ Dashboard**: Auto-update travel statistics
- **→ Schengen Tracker**: Add flight dates for calculation
- **→ Trip History**: Create trip records from flights
- **→ Analytics**: Include in travel patterns analysis
- **→ Visa Tracker**: Alert for visa requirements

### Dashboard Hub Connections
- **← Gmail Sync**: Real-time flight updates
- **← Schengen**: Current stay status
- **← Visa Tracker**: Expiry alerts
- **← Analytics**: Travel insights
- **→ All Features**: Quick access navigation

### Data Flow Architecture
```
Gmail API → Parser → Flight Data → User Confirmation
                           ↓
                    Travel Period Creator
                           ↓
    ┌──────────────────────┴──────────────────────┐
    ↓                      ↓                      ↓
Dashboard Update    Schengen Calc         Trip History
```

## 📱 Mobile IA Considerations

### Bottom Navigation (Mobile Only)
```
┌─────┬─────┬─────┬─────┬─────┐
│  📈  │  📬  │  🇪🇺  │  ✈️  │  👤  │
│ 대시 │ 동기 │ 샹겐 │ 여행 │ 프로필│
└─────┴─────┴─────┴─────┴─────┘
```

### Progressive Disclosure
- Level 1: Core features in bottom nav
- Level 2: Secondary features in hamburger menu
- Level 3: Advanced settings in profile

## 🎯 IA Principles

### 1. **User-Centric Organization**
- Features grouped by user tasks, not system architecture
- Clear labeling in Korean with intuitive icons
- Progressive disclosure for complex features

### 2. **Scalability**
- Modular structure allows new features without disruption
- Clear parent-child relationships
- Consistent naming conventions

### 3. **Discoverability**
- Gmail Sync prominently placed as new feature
- Visual cues (NEW badges) for recent additions
- Contextual navigation between related features

### 4. **Mobile-First Structure**
- Core features accessible within 2 taps
- Optimized for one-handed operation
- Context-aware navigation

## 🚀 Future IA Enhancements

### Phase 1: Current Implementation
- Add Gmail Sync to main navigation ✅
- Reorganize visa-related features ✅
- Create document management section ✅

### Phase 2: Dashboard Transformation
- Elevate Dashboard as primary landing
- Widget-based customizable layout
- Real-time data integration

### Phase 3: Advanced Features
- AI-powered trip suggestions
- Automated document management
- Social features for travelers

## 📊 IA Success Metrics

### Navigation Efficiency
- **Target**: Find any feature in ≤3 clicks
- **Current**: 2-4 clicks (varies by feature)
- **Goal**: Consistent 2-click access

### User Task Completion
- **Target**: 90% task completion rate
- **Current**: ~75% (estimated)
- **Improvement**: Clearer labeling and grouping

### Feature Discovery
- **Target**: 80% users discover Gmail Sync
- **Method**: Prominent placement + NEW badge
- **Tracking**: Analytics on feature usage

## 🔍 IA Audit Findings

### Strengths
- Clear feature grouping
- Consistent icon usage
- Mobile-responsive design

### Improvements Needed
- Gmail Sync visibility (FIXED)
- Reduce navigation depth
- Better cross-feature connections
- Clearer user journey paths

## 📝 IA Guidelines

### Naming Conventions
- Korean primary, English secondary
- Action-oriented labels
- Consistent terminology

### Icon Selection
- Universal symbols preferred
- Emoji for personality
- Consistent style throughout

### Menu Structure
- Max 5-7 items per level
- Related items grouped
- Most used items first

---

*Information Architecture designed for optimal user experience and scalability*