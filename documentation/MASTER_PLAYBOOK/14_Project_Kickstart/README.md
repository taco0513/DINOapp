# 🚀 완전한 프로젝트 셋업 가이드

## 🎯 개요

**아이디어에서 베타 테스터가 사용할 수 있는 실제 서비스까지** - 프로토타입도 프로덕션 품질로 만드는 완전한 가이드입니다.

### 3단계 프로젝트 성숙도
- ⚡ **30분 프로토타입**: 빠른 아이디어 검증용
- 🏗️ **1-3일 베타 서비스**: 실제 사용자 테스트 가능
- 🏢 **1-2주 프로덕션**: 확장 가능한 상용 서비스

### 핵심 철학
- 🎯 **처음부터 제대로**: 나중에 갈아엎지 않을 기반
- 👥 **실제 사용자 고려**: 베타 테스터가 실제 사용 가능
- 🔧 **점진적 발전**: 프로토타입 → 베타 → 프로덕션
- 🤖 **AI 기반 자동화**: 모든 단계에서 Claude 활용

---

## 🚀 Level 1: 30분 빠른 프로토타입

> **목표**: 아이디어를 즉시 확인할 수 있는 작동하는 앱

### 📱 모바일 앱이라면? HTML 우선 전략!

**핵심 철학**: HTML로 먼저 디자인하면 모바일 앱 개발이 3배 빠릅니다!

#### 왜 HTML 우선인가?
- ⚡ **즉시 테스트**: 실제 모바일에서 바로 확인 가능
- 🎨 **빠른 시각화**: 5분만에 전체 화면 흐름 완성
- 🔄 **쉬운 수정**: CSS 변경으로 즉시 디자인 업데이트
- 📐 **정확한 설계**: 네이티브 변환 전 UX 완전 검증

### Phase 1A: 웹앱 아이디어 정리 (5분)
```bash
# Claude와 함께 아이디어 구체화
claude

You: "할일 관리 앱을 만들고 싶은데, 
     사용자 인증, CRUD 기능, 실시간 동기화가 필요해.
     어떤 기술 스택이 좋을까?"

AI 추천:
Frontend: Next.js + TypeScript + Tailwind CSS
Backend: Next.js API Routes + Prisma
Database: PostgreSQL (Supabase)
Auth: NextAuth.js
Deployment: Vercel
```

### Phase 1B: 모바일앱 아이디어 정리 (5분)
```bash
# 모바일 앱 전용 아이디어 구체화
claude

You: "소셜 미디어 모바일 앱을 만들고 싶어.
     사진 공유, 팔로우, 실시간 채팅이 필요해.
     HTML 프로토타입부터 시작하고 싶어."

AI 추천 단계별 접근:
1. HTML 프로토타입: 5분 모바일 UI 설계
2. CSS 네이티브 스타일: 터치 인터랙션 구현
3. 네이티브 변환: React Native 또는 Flutter
4. 백엔드: Firebase 또는 Supabase
```

### Phase 2A: 웹앱 프로젝트 생성 (10분)
```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest my-todo-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd my-todo-app

# 2. 필수 패키지 설치
npm install prisma @prisma/client next-auth \
  @next-auth/prisma-adapter \
  @supabase/supabase-js \
  react-hook-form @hookform/resolvers zod

# 3. 개발 패키지 설치
npm install -D @types/node
```

### Phase 2B: 모바일앱 HTML 프로토타입 생성 (10분)

#### 🎨 디자인 시스템 기반 프로토타입 (추천!)

**새로운 접근**: 디자인 토큰을 활용하면 나중에 네이티브 앱으로 변환할 때 3배 빠릅니다!

```bash
# 1. 디자인 시스템 기반 프로토타입 구조 생성
mkdir mobile-prototype
cd mobile-prototype

# 2. 디자인 토큰 기반 파일 구조
touch index.html design-tokens.css components.css script.js

# 3. Claude에게 디자인 시스템 기반 프로토타입 요청
claude

You: "@17_Design_System/README.md
     다음 구조로 모바일 소셜 앱 HTML 프로토타입을 만들어줘:
     - 디자인 토큰 기반 CSS 변수 사용
     - 재사용 가능한 컴포넌트 구조
     - 상단: 헤더 (뒤로가기, 제목, 메뉴)
     - 중앙: 메인 콘텐츠 (피드, 프로필 등)
     - 하단: 탭 네비게이션 (홈, 검색, 프로필)
     - 모바일 뷰포트 크기로 최적화"
```

#### 🚀 기본 프로토타입 (빠른 시작용)
```bash
# 기존 방식 (바로 시작하고 싶다면)
# 1. 간단한 HTML 모바일 프로토타입 구조 생성
mkdir mobile-prototype
cd mobile-prototype

# 2. 기본 파일 구조 생성
touch index.html style.css script.js

# 3. Claude에게 모바일 프로토타입 요청
claude

You: "다음 구조로 모바일 소셜 앱 HTML 프로토타입을 만들어줘:
     - 상단: 헤더 (뒤로가기, 제목, 메뉴)
     - 중앙: 메인 콘텐츠 (피드, 프로필 등)
     - 하단: 탭 네비게이션 (홈, 검색, 프로필)
     - 모바일 뷰포트 크기로 최적화"
```

#### 🎨 디자인 토큰 기반 프로토타입 (향상된 버전)

**💡 혁신적 접근**: 17_Design_System의 플랫폼별 토큰을 활용하면 나중에 네이티브 앱 변환 시 개발 시간이 70% 단축됩니다!

**design-tokens.css** - 크로스 플랫폼 호환 토큰 시스템:
```css
/* design-tokens.css - 17_Design_System 기반 토큰 */
:root {
  /* Brand Colors */
  --color-primary: #4F46E5;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  
  /* UI Colors */
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-border: #E5E7EB;
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* Spacing (8px grid) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  
  /* Typography */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  
  /* Border & Effects */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem;   /* 8px */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark mode support */
[data-theme="dark"] {
  --color-background: #111827;
  --color-surface: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
}
```

**components.css** - 재사용 가능한 컴포넌트:
```css
/* components.css - 토큰 기반 컴포넌트 */
.mobile-container {
  width: 375px;
  height: 812px;
  margin: var(--space-5) auto;
  background: var(--color-background);
  border-radius: var(--space-6);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Header Component */
.top-bar {
  height: 60px;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.icon-btn {
  background: none;
  border: none;
  font-size: var(--text-xl);
  padding: var(--space-2);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text-primary);
  min-height: 44px; /* 터치 친화적 */
  min-width: 44px;
}

.icon-btn:hover {
  background: var(--color-surface);
}

.title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

/* Content Component */
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
  background: var(--color-surface);
}

/* Post Component */
.post {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.post-header {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  gap: var(--space-2);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--text-base);
}

/* Action Components */
.action-btn {
  background: none;
  border: none;
  font-size: var(--text-xl);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: 50%;
  transition: transform 0.2s;
  min-height: 44px;
  min-width: 44px;
}

.action-btn:active {
  transform: scale(1.2);
}

/* Tab Navigation */
.bottom-tabs {
  height: 70px;
  background: var(--color-background);
  display: flex;
  border-top: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.active {
  background: var(--color-primary);
  color: white;
}

.tab:not(.active) {
  color: var(--text-secondary);
}

.tab:not(.active):hover {
  background: var(--color-surface);
}

/* Responsive */
@media (max-width: 480px) {
  .mobile-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0;
  }
}
```

### 🌍 플랫폼별 진화 로드맵

#### 📊 HTML → 네이티브 앱 전환 전략

| 단계 | Web | iOS | Android | 소요 시간 | 추천 도구 |
|------|-----|-----|---------|----------|-----------|
| **Level 1** | HTML + CSS | WebView 래퍼 | WebView 래퍼 | 30분 | PWA 기술 |
| **Level 2** | React PWA | React Native | React Native | 1-2일 | Expo |
| **Level 3** | Next.js | SwiftUI | Jetpack Compose | 1-2주 | 네이티브 |

#### 🎯 플랫폼별 최적화 Claude 명령어

**iOS 네이티브 변환:**
```bash
# SwiftUI로 변환
/convert @mobile-prototype --platform ios --swiftui --design-tokens @17_Design_System

# Human Interface Guidelines 준수
/optimize-ios @. --hig-compliance --safe-area --dynamic-type
```

**Android 네이티브 변환:**
```bash  
# Jetpack Compose로 변환
/convert @mobile-prototype --platform android --compose --material3 --design-tokens @17_Design_System

# Material Design 준수
/optimize-android @. --material3 --gesture-navigation --adaptive-colors
```

**크로스 플랫폼 진화:**
```bash
# React Native 변환 (둘 다 지원)
/convert @mobile-prototype --platform react-native --expo --design-tokens @17_Design_System

# 플랫폼별 최적화
/optimize-cross-platform @. --ios-styles --android-styles --shared-components
```

#### 🔄 토큰 기반 자동 변환 프로세스

**1단계: 토큰 매핑**
```css
/* HTML/CSS */
--color-primary: #4F46E5;
--space-4: 1rem;
```

**2단계: iOS 변환**
```swift
// SwiftUI DesignTokens
static let colorPrimary = Color(red: 79/255, green: 70/255, blue: 229/255)
static let spacing4: CGFloat = 16
```

**3단계: Android 변환**
```xml
<!-- colors.xml -->
<color name="color_primary">#4F46E5</color>
<!-- dimens.xml -->
<dimen name="spacing_4">16dp</dimen>
```

#### ⚡ 5분만에 완성되는 모바일 프로토타입 (기본 버전)
```html
<!-- index.html - Claude가 생성 -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile App Prototype</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="mobile-container">
        <!-- 상단 헤더 -->
        <header class="top-bar">
            <button class="icon-btn">←</button>
            <h1 class="title">Social</h1>
            <button class="icon-btn">⋮</button>
        </header>
        
        <!-- 메인 콘텐츠 -->
        <main class="content" id="main-content">
            <div class="feed">
                <div class="post">
                    <div class="post-header">
                        <img src="https://via.placeholder.com/40" class="avatar">
                        <span class="username">사용자명</span>
                    </div>
                    <img src="https://via.placeholder.com/300x200" class="post-image">
                    <div class="post-actions">
                        <button class="action-btn">♥</button>
                        <button class="action-btn">💬</button>
                        <button class="action-btn">↗</button>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- 하단 탭 -->
        <nav class="bottom-tabs">
            <button class="tab active" onclick="switchTab('home')">🏠</button>
            <button class="tab" onclick="switchTab('search')">🔍</button>
            <button class="tab" onclick="switchTab('profile')">👤</button>
        </nav>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

```css
/* style.css - 네이티브 느낌의 모바일 스타일 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f5;
    overflow: hidden;
}

.mobile-container {
    width: 375px;  /* iPhone 표준 너비 */
    height: 812px; /* iPhone X 높이 */
    margin: 20px auto;
    background: white;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

/* 상단 헤더 */
.top-bar {
    height: 60px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #eee;
}

.icon-btn {
    background: none;
    border: none;
    font-size: 20px;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
}

.icon-btn:hover {
    background: #f0f0f0;
}

.title {
    font-size: 18px;
    font-weight: 600;
}

/* 메인 콘텐츠 */
.content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.post {
    background: white;
    border-radius: 12px;
    margin-bottom: 15px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-header {
    display: flex;
    align-items: center;
    padding: 15px;
    gap: 10px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.username {
    font-weight: 600;
}

.post-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.post-actions {
    display: flex;
    gap: 15px;
    padding: 15px;
}

.action-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: transform 0.2s;
}

.action-btn:active {
    transform: scale(1.2);
}

/* 하단 탭 */
.bottom-tabs {
    height: 70px;
    background: white;
    display: flex;
    border-top: 1px solid #eee;
}

.tab {
    flex: 1;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.tab.active {
    background: #007AFF;
    color: white;
}

.tab:not(.active):hover {
    background: #f0f0f0;
}

/* 터치 친화적 크기 */
.tab, .icon-btn, .action-btn {
    min-height: 44px;
    min-width: 44px;
}

/* 모바일 제스처 시뮬레이션 */
.content {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* 모바일 디바이스에서 실제 전체 화면 */
@media (max-width: 480px) {
    .mobile-container {
        width: 100vw;
        height: 100vh;
        margin: 0;
        border-radius: 0;
    }
}
```

```javascript
// script.js - 기본 인터랙션
function switchTab(tabName) {
    // 탭 활성화 상태 변경
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 콘텐츠 변경 (시뮬레이션)
    const content = document.getElementById('main-content');
    
    switch(tabName) {
        case 'home':
            content.innerHTML = generateHomeFeed();
            break;
        case 'search':
            content.innerHTML = '<div class="search-page"><h2>검색</h2><input type="text" placeholder="검색어 입력..."></div>';
            break;
        case 'profile':
            content.innerHTML = '<div class="profile-page"><h2>프로필</h2><p>사용자 프로필 페이지</p></div>';
            break;
    }
}

function generateHomeFeed() {
    return `
        <div class="feed">
            <div class="post">
                <div class="post-header">
                    <img src="https://via.placeholder.com/40" class="avatar">
                    <span class="username">친구1</span>
                </div>
                <img src="https://via.placeholder.com/300x200" class="post-image">
                <div class="post-actions">
                    <button class="action-btn">♥</button>
                    <button class="action-btn">💬</button>
                    <button class="action-btn">↗</button>
                </div>
            </div>
            <div class="post">
                <div class="post-header">
                    <img src="https://via.placeholder.com/40" class="avatar">
                    <span class="username">친구2</span>
                </div>
                <img src="https://via.placeholder.com/300x200" class="post-image">
                <div class="post-actions">
                    <button class="action-btn">♥</button>
                    <button class="action-btn">💬</button>
                    <button class="action-btn">↗</button>
                </div>
            </div>
        </div>
    `;
}

// 터치 제스처 시뮬레이션
let startY = 0;
document.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
});

document.addEventListener('touchmove', function(e) {
    // 스크롤 제스처 처리
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (Math.abs(diff) > 10) {
        // 스크롤 방향에 따른 처리
        if (diff > 0) {
            // 위로 스크롤
        } else {
            // 아래로 스크롤
        }
    }
});
```

### Phase 3: AI 기반 빠른 설정 (10분)
```bash
# Claude Code로 전체 설정 자동화
claude

You: "방금 생성한 Next.js 프로젝트에 다음을 설정해줘:
     1. Prisma with PostgreSQL
     2. NextAuth.js with Google OAuth
     3. 기본 Todo CRUD API
     4. Tailwind 컴포넌트
     5. 환경 변수 설정"

# AI가 자동으로 생성:
# - prisma/schema.prisma
# - pages/api/auth/[...nextauth].ts
# - pages/api/todos/*.ts
# - components/TodoList.tsx, TodoForm.tsx
# - .env.local.example
```

### Phase 4: 데이터베이스 & 배포 (5분)
```bash
# 1. Supabase 프로젝트 생성 (30초)
# https://supabase.com/dashboard

# 2. 환경 변수 설정
cp .env.local.example .env.local
# DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID 설정

# 3. 데이터베이스 마이그레이션
npx prisma migrate dev --name init
npx prisma generate

# 4. Vercel 배포
npx vercel --prod
```

#### ⚡ 모바일 HTML 프로토타입 테스트 (5분)
```bash
# 1. 브라우저에서 테스트
open index.html  # 또는 브라우저에서 파일 열기

# 2. 모바일 디바이스에서 테스트
# Chrome DevTools > Device Mode 또는
# 실제 폰에서 파일 열어보기

# 3. 개선 사항 Claude에게 요청
claude "이 HTML 프로토타입에서 터치 반응성을 더 좋게 해줘"
claude "iOS/Android 네이티브 느낌으로 스타일 개선해줘"
```

### 🚀 Phase 3: 네이티브 앱으로 변환 (선택사항)

HTML 프로토타입이 완벽하다면, 이제 진짜 모바일 앱으로 만들어보세요!

#### React Native 변환 (15분)
```bash
# 1. React Native 프로젝트 생성
npx create-expo-app SocialApp --template blank-typescript
cd SocialApp

# 2. Claude에게 HTML을 React Native로 변환 요청
claude "위의 HTML/CSS 구조를 React Native로 변환해줘:
      - HTML div → View
      - CSS 스타일 → StyleSheet
      - 터치 이벤트 → TouchableOpacity
      - 탭 네비게이션 → React Navigation"
```

#### React Native 컴포넌트 예시
```typescript
// App.tsx - Claude가 생성
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView style={styles.content}>
        <View style={styles.feed}>
          <View style={styles.post}>
            <View style={styles.postHeader}>
              <Image 
                source={{uri: 'https://via.placeholder.com/40'}} 
                style={styles.avatar} 
              />
              <Text style={styles.username}>사용자명</Text>
            </View>
            <Image 
              source={{uri: 'https://via.placeholder.com/300x200'}} 
              style={styles.postImage} 
            />
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>♥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 탭 */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={styles.tabText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 40, // Status bar 고려
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
  },
  iconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  feed: {
    // feed styles
  },
  post: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postActions: {
    flexDirection: 'row',
    padding: 15,
  },
  actionBtn: {
    marginRight: 15,
    padding: 8,
  },
  actionText: {
    fontSize: 20,
  },
  bottomTabs: {
    height: 70,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 24,
  },
});
```

#### Flutter 변환 (선택사항)
```bash
# Flutter 프로젝트 생성
flutter create social_app
cd social_app

# Claude에게 HTML을 Flutter로 변환 요청
claude "위의 HTML 구조를 Flutter로 변환해줘:
      - HTML div → Container/Column/Row
      - CSS → TextStyle/BoxDecoration
      - 터치 이벤트 → GestureDetector/InkWell
      - 탭 네비게이션 → BottomNavigationBar"
```

### 🎨 디자인 시스템과의 연결성

#### ✅ 얻은 것들 (디자인 시스템 Level 1 완성!)
- **일관된 토큰 시스템**: 색상, 간격, 타이포그래피 표준화
- **재사용 가능한 컴포넌트**: 버튼, 카드, 탭 등 기본 UI 블록
- **확장 가능한 구조**: Level 2, 3으로 자연스럽게 진화 가능
- **AI 친화적 패턴**: Claude가 이해하고 활용하기 쉬운 구조

🎉 **30분 완성!** 이제 작동하는 앱이 있지만, 실제 사용자에게 보여주려면 다음 단계로!

### 📱 모바일 HTML 우선 개발의 장점 요약

#### ✅ 얻은 것들
- **5분만에** 전체 앱 플로우 확인
- **실제 모바일**에서 터치 테스트 완료
- **UX 검증** 완료 (네이티브 변환 전)
- **스테이크홀더 데모** 가능
- **개발 방향성** 확정

#### 🚀 다음 단계
- **Level 2 베타**에서 실제 기능 구현
- **React Native/Flutter** 네이티브 변환
- **백엔드 API** 연동
- **앱스토어** 배포

---

## 🏗️ Level 2: 1-3일 베타 서비스

> **목표**: 실제 베타 테스터가 사용할 수 있는 품질의 서비스

### 🎨 디자인 시스템 Level 2로 진화

**Level 1 → Level 2 변화점:**
- ✅ **브랜드 적용**: 기본 토큰 → 브랜드 컬러 시스템
- ✅ **반응형 강화**: 다양한 디바이스 지원
- ✅ **다크모드 지원**: 사용자 선호도 대응
- ✅ **접근성 향상**: WCAG 2.1 AA 준수
- ✅ **컴포넌트 확장**: 15개 재사용 컴포넌트 구축

**Claude 명령어 예시:**
```bash
/upgrade-design-system @design-tokens.css 
  --level 2 
  --features "brand-colors,dark-mode,responsive,accessibility"
  --components "navigation,forms,feedback,modals"
```

### 왜 베타 서비스가 중요한가?
- 📊 **실제 사용자 피드백**: 진짜 문제점 발견
- 🔧 **실용성 검증**: 아이디어의 실제 가치 확인
- 💡 **개선 방향**: 어떤 기능이 정말 필요한지 파악
- 🚀 **초기 고객**: 론칭 전 사용자 기반 구축
- 🎨 **디자인 검증**: 디자인 시스템 실전 테스트

### Day 1: 기반 강화 (프로토타입 → 베타)

#### 1.1: 환경 설정 업그레이드
```bash
# 프로덕션급 환경 변수 설정
cat > .env.example << 'EOF'
# Core
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Database  
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Monitoring (베타부터 필요!)
SENTRY_DSN=https://...
VERCEL_ANALYTICS_ID=...

# Email (사용자 소통용)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=hello@yourapp.com
EOF

# 개발 도구 추가
npm install -D @types/node tsx husky lint-staged
npm install @sentry/nextjs @vercel/analytics
```

#### 1.2: 에러 처리 및 모니터링
```bash
# Sentry 에러 추적 설정
claude setup-error-tracking @. --provider sentry --include "api,components,pages"

# 기본 모니터링 설정
claude add-monitoring @. --include "performance,errors,usage"

You: "베타 테스터용 에러 처리를 강화해줘:
1. 사용자 친화적 에러 메시지
2. 자동 에러 리포팅
3. 복구 가능한 에러는 자동 재시도
4. 크리티컬 에러 즉시 알림"
```

#### 1.3: 사용자 피드백 시스템
```bash
# 피드백 수집 컴포넌트 추가
claude create-feedback-system @. --include "bug-report,feature-request,satisfaction-survey"

You: "베타 테스터 피드백 수집 시스템을 만들어줘:
1. 앱 내 피드백 버튼 (모든 페이지)
2. 스크린샷 자동 첨부
3. 사용자 컨텍스트 정보 포함
4. 피드백 관리 대시보드"
```

### Day 2: 품질 및 사용성 개선

#### 2.1: 사용자 경험 최적화
```bash
# UX 개선
claude improve-ux @components --focus "onboarding,navigation,feedback,mobile"

You: "베타 테스터가 헷갈리지 않도록 UX를 개선해줘:
1. 명확한 온보딩 플로우 (3단계 이내)
2. 직관적인 네비게이션
3. 로딩 상태 표시
4. 성공/실패 피드백 명확화
5. 모바일 최적화"
```

#### 2.2: 성능 최적화
```bash
# 기본 성능 최적화
claude optimize-performance @. --focus "loading,bundling,images,api"

# 성능 측정 설정
claude add-performance-monitoring @. --metrics "core-web-vitals,api-response-time"

You: "베타 테스터가 답답함을 느끼지 않도록 성능을 최적화해줘:
1. 페이지 로딩 시간 < 2초
2. API 응답 시간 < 500ms
3. 이미지 최적화
4. 번들 크기 최적화"
```

#### 2.3: 접근성 및 호환성
```bash
# 접근성 개선
claude improve-accessibility @components --wcag-level AA

# 브라우저 호환성 확인
claude test-compatibility @. --browsers "chrome,firefox,safari,edge" --mobile

You: "다양한 사용자가 접근할 수 있도록 개선해줘:
1. 키보드 네비게이션 지원
2. 스크린 리더 호환
3. 색상 대비 확보
4. 모든 주요 브라우저 지원"
```

### Day 3: 베타 런칭 준비

#### 3.1: 베타 사용자 관리 시스템
```bash
# 베타 사용자 초대 시스템
claude create-beta-system @. --features "invite-codes,user-roles,feedback-tracking"

You: "베타 테스터 관리 시스템을 만들어줘:
1. 초대 코드 생성/관리
2. 베타 사용자 전용 기능
3. 사용량 추적
4. 피드백 히스토리
5. 베타 그룹별 A/B 테스트"
```

#### 3.2: 사용자 지원 체계
```bash
# 도움말 및 가이드
claude create-user-guide @. --include "getting-started,faq,troubleshooting"

# 실시간 지원 (선택)
claude add-support-chat @. --provider "intercom" --or "simple-contact-form"

You: "베타 테스터가 막히지 않도록 지원 체계를 구축해줘:
1. 인터랙티브 튜토리얼
2. 상황별 도움말
3. FAQ 페이지
4. 연락 방법 (이메일/채팅)
5. 알려진 이슈 페이지"
```

#### 3.3: 베타 런칭
```bash
# 베타 런칭 체크리스트 생성
claude create-beta-checklist @. --comprehensive

You: "베타 런칭 전 체크리스트를 만들어줘:
1. 기능 테스트 (핵심 플로우)
2. 성능 테스트 (로드 테스트)
3. 보안 기본 체크
4. 사용자 가이드 완성
5. 피드백 수집 준비
6. 모니터링 시스템 동작 확인
7. 롤백 계획 준비"
```

---

## 🏢 Level 3: 1-2주 프로덕션 서비스

> **목표**: 확장 가능하고 안정적인 상용 서비스

### 🎨 디자인 시스템 Level 3 완성

**Level 2 → Level 3 변화점:**
- 🔧 **자동화 파이프라인**: Style Dictionary, 토큰 자동 배포
- 📚 **Storybook 문서화**: 30+ 컴포넌트 체계적 관리
- 🧪 **Visual Regression 테스트**: 디자인 일관성 자동 검증
- 📦 **NPM 패키지화**: 재사용 가능한 디자인 시스템 배포
- 🔄 **CI/CD 통합**: 디자인 변경사항 자동 배포

**Claude 명령어 예시:**
```bash
/production-design-system @design-tokens.css 
  --level 3 
  --automation "style-dictionary,storybook,visual-testing"
  --package-name "@company/design-system"
  --cicd-integration vercel
```

### 베타 → 프로덕션 전환 시점
- ✅ 베타 테스터 만족도 80% 이상
- ✅ 주요 버그 해결 완료
- ✅ 핵심 기능 안정화
- ✅ 성능 기준 만족
- ✅ 비즈니스 모델 검증
- ✅ **디자인 시스템 완성도 95% 이상**

### Week 1: 시스템 강화

#### 시스템 아키텍처 업그레이드
```bash
# 확장 가능한 아키텍처 설계
claude redesign-architecture @. --focus "scalability,maintainability,security"

You: "베타에서 얻은 인사이트를 바탕으로 프로덕션 아키텍처를 설계해줘:
1. 예상 사용자 수: [베타 데이터 기반]
2. 트래픽 패턴: [베타에서 관찰된 패턴]
3. 핵심 병목 지점: [베타에서 발견된 이슈]
4. 확장 계획: [6개월, 1년 목표]
5. 예산 제약: [현실적 비용 고려]"
```

#### 데이터베이스 최적화
```bash
# 베타 데이터 분석 후 DB 최적화
claude optimize-database @prisma --based-on-usage-data

You: "베타 사용 패턴을 분석해서 데이터베이스를 최적화해줘:
1. 자주 사용되는 쿼리 최적화
2. 필요한 인덱스 추가
3. 데이터 정합성 강화
4. 백업 및 복구 계획
5. 성능 모니터링 설정"
```

#### 보안 강화
```bash
# 프로덕션급 보안 설정
claude security-audit @. --level production

You: "프로덕션 런칭을 위한 보안을 강화해줘:
1. API 보안 (rate limiting, validation)
2. 인증 보안 (2FA, session 관리)
3. 데이터 보호 (암호화, GDPR 준수)
4. 인프라 보안 (HTTPS, headers)
5. 취약점 스캔 자동화"
```

### Week 2: 운영 체계 구축

#### 모니터링 및 알럿
```bash
# 포괄적 모니터링 시스템
claude setup-monitoring @. --level production

You: "프로덕션 서비스 모니터링 체계를 구축해줘:
1. 서비스 상태 모니터링 (uptime, response time)
2. 비즈니스 메트릭 (사용자, 전환율, 수익)
3. 기술 메트릭 (성능, 에러, 리소스)
4. 알럿 설정 (임계값, 알림 채널)
5. 대시보드 구성 (경영진용, 개발팀용)"
```

#### 배포 및 운영 자동화
```bash
# CI/CD 파이프라인 구축
claude setup-cicd @. --include "testing,security,deployment,rollback"

You: "안전하고 효율적인 배포 시스템을 구축해줘:
1. 자동화된 테스트 (unit, integration, e2e)
2. 보안 스캔 자동화
3. 단계별 배포 (dev → staging → prod)
4. 자동 롤백 시스템
5. 배포 승인 프로세스"
```

#### 고객 지원 및 운영
```bash
# 고객 지원 시스템
claude setup-customer-support @. --include "ticketing,knowledge-base,analytics"

You: "프로덕션 고객 지원 체계를 구축해줘:
1. 티켓 시스템 (버그 리포트, 기능 요청)
2. 지식 베이스 (FAQ, 가이드, 튜토리얼)
3. 사용자 분석 (행동 패턴, 이탈 지점)
4. 고객 소통 (이메일, 인앱 메시지)
5. 피드백 수집 및 분석"
```

---

## 📊 각 단계별 성공 지표

### Level 1: 30분 프로토타입
```yaml
성공 지표:
- 작동하는 앱 완성: ✅
- 핵심 기능 3개 구현: ✅
- 배포 완료: ✅
- 첫 사용자 테스트: 1-2명

디자인 시스템 지표:
- 기본 토큰 정의: 20개 (색상, 간격, 타이포그래피)
- 재사용 컴포넌트: 5개 (버튼, 카드, 입력, 탭)
- 일관성 점수: > 80%
- Claude 생성 정확도: > 85%

검증 목표:
- 아이디어 실현 가능성
- 기술 스택 적합성
- 기본 사용성
- 디자인 패턴 적합성
```

### Level 2: 1-3일 베타 서비스
```yaml
성공 지표:
- 베타 사용자 확보: 10-50명
- 평균 세션 시간: > 5분
- 버그 리포트: < 1개/일/사용자
- 사용자 만족도: > 70%

디자인 시스템 지표:
- 확장 토큰: 50개 (브랜드 컬러, 반응형, 다크모드)
- 컴포넌트 라이브러리: 15개
- 접근성 준수: WCAG 2.1 AA (90%+)
- 일관성 점수: > 90%
- Claude 생성 정확도: > 95%

검증 목표:
- 실제 사용자 니즈 확인
- 주요 사용 패턴 파악
- 기능 우선순위 검증
- 수익 모델 가능성
- 브랜드 디자인 적합성
```

### Level 3: 1-2주 프로덕션 서비스
```yaml
성공 지표:
- 시스템 가용성: > 99.9%
- 응답 시간: < 200ms (API)
- 에러율: < 1%
- 고객 지원 응답: < 24시간

디자인 시스템 지표:
- 완전한 토큰 시스템: 100+개
- 프로덕션 컴포넌트: 30+개
- Storybook 문서화: 100%
- Visual Regression 테스트: 자동화
- NPM 패키지 배포: 완료
- 일관성 점수: > 95%

확장 목표:
- 월간 활성 사용자: 100-1000명
- 수익 달성: 첫 $100-1000
- 투자자 관심: 피치덱 준비
- 팀 확장: 개발자 채용 고려
- 디자인 시스템 재사용: 다른 프로젝트 적용
```

---

## 🔧 실전 활용 시나리오

### 시나리오 1: 개인 개발자
```bash
# Week 1: 프로토타입 (개인 검증)
# Week 2: 베타 (친구, 지인 10명 테스트)
# Week 3-4: 프로덕션 (소셜미디어 런칭)

목표: 사이드 프로젝트 → 수익 창출
```

### 시나리오 2: 스타트업 팀
```bash
# Day 1: 프로토타입 (팀 내부 검증)
# Week 1: 베타 (타겟 고객 50명 테스트)  
# Month 1: 프로덕션 (정식 서비스 런칭)

목표: MVP 검증 → 투자 유치
```

### 시나리오 3: 기업 내부 프로젝트
```bash
# Day 1: 프로토타입 (스테이크홀더 데모)
# Week 1: 베타 (부서 내 파일럿)
# Month 1: 프로덕션 (전사 배포)

목표: 업무 효율화 → 내부 도구 정착
```

---

## 🎯 프로젝트 유형별 빠른 시작

### 1. SaaS 앱 템플릿
```bash
# SaaS 스타터킷 복제
npx create-next-app my-saas \
  --example "https://github.com/steven-tey/precedent"

# Claude로 커스터마이징
claude customize-saas @. \
  --business-model subscription \
  --features "user-dashboard, billing, analytics"
```

### 2. 전자상거래 앱
```bash
# Commerce 템플릿 사용
npx create-next-app my-shop \
  --example "https://github.com/vercel/commerce"

# AI 기반 상품 카탈로그 설정
claude setup-ecommerce @. \
  --payment-provider stripe \
  --inventory-system basic
```

### 3. 블로그/CMS
```bash
# 블로그 템플릿
npx create-next-app my-blog \
  --example blog-starter-typescript

# 헤드리스 CMS 연동
claude integrate-cms @. \
  --cms-provider contentful \
  --features "seo, comments, newsletter"
```

### 4. AI 앱
```bash
# AI 앱 템플릿
npx create-next-app my-ai-app \
  --example "https://github.com/vercel-labs/ai-chatbot"

# Claude 통합 설정
claude setup-ai-features @. \
  --ai-provider anthropic \
  --features "chat, embeddings, image-analysis"
```

### 5. 모바일 앱 (React Native)
```bash
# Expo 프로젝트 생성
npx create-expo-app MyApp --template blank-typescript

# Claude로 네이티브 기능 설정
claude setup-mobile @. \
  --features "navigation, auth, push-notifications" \
  --state-management zustand
```

---

## 🛠️ 기술 스택 조합 가이드

### 🥇 추천 스택 (안정성 우선)
```yaml
Frontend: Next.js + TypeScript + Tailwind CSS
Backend: Next.js API Routes + Prisma
Database: PostgreSQL (Supabase/PlanetScale)
Auth: NextAuth.js
Deployment: Vercel
Monitoring: Vercel Analytics

장점: 학습 곡선 낮음, 안정적, 빠른 배포
단점: 확장성 제한
적합한 프로젝트: MVP, 소규모 앱, 프로토타입
```

### 🚀 성능 중심 스택
```yaml
Frontend: Next.js + TypeScript + Tailwind CSS
Backend: Fastify + Prisma + TypeScript
Database: PostgreSQL + Redis
Auth: JWT + Refresh Token
Deployment: Railway + Cloudflare
Monitoring: Grafana + Prometheus

장점: 고성능, 확장 가능
단점: 복잡한 설정
적합한 프로젝트: 고트래픽 앱, 실시간 앱
```

### ⚡ 최신 기술 스택
```yaml
Frontend: Next.js 14 + Server Components + TypeScript
Backend: tRPC + Prisma + TypeScript
Database: PostgreSQL + Drizzle ORM
Auth: Auth.js (NextAuth v5)
Deployment: Vercel + Neon
State: Zustand + React Query

장점: 최신 기술, 타입 안전성
단점: 러닝 커브
적합한 프로젝트: 모던 앱, 복잡한 상태 관리
```

### 🔋 풀스택 TypeScript
```yaml
Frontend: Next.js + TypeScript
Backend: Nest.js + TypeScript + Prisma
Database: PostgreSQL + TypeScript
Auth: Passport.js + JWT
Deployment: Docker + AWS/GCP
Testing: Jest + Supertest + Playwright

장점: 완전한 타입 안전성, 엔터프라이즈급
단점: 높은 복잡도
적합한 프로젝트: 대규모 팀, 복잡한 비즈니스 로직
```

---

## 🤖 AI 기반 자동 설정

### 스마트 프로젝트 생성기
```bash
# Claude에게 모든 것을 맡기기
claude create-project \
  --idea "소셜 미디어 앱" \
  --features "실시간 채팅, 사진 공유, 팔로우" \
  --scale "중간 규모" \
  --timeline "2주"

# AI가 자동으로:
# 1. 최적 기술 스택 선택
# 2. 프로젝트 구조 생성
# 3. 필수 패키지 설치
# 4. 환경 설정 파일 생성
# 5. 기본 컴포넌트 구현
# 6. API 엔드포인트 설정
# 7. 데이터베이스 스키마 생성
```

### 커스텀 템플릿 생성
```bash
# 자주 사용하는 패턴을 템플릿으로 저장
claude save-template \
  --name "my-saas-starter" \
  --from @current-project \
  --include "auth, billing, dashboard, api"

# 나중에 재사용
claude use-template my-saas-starter \
  --project-name "new-project" \
  --customize "결제 시스템, 사용자 대시보드"
```

---

## 📋 프로젝트 셋업 체크리스트

### ✅ 개발 환경 체크리스트
```bash
기본 설정:
□ Node.js 18+ 설치 확인
□ Git 설정 및 첫 커밋
□ .gitignore 설정
□ README.md 작성
□ 라이선스 파일 추가

개발 도구:
□ ESLint + Prettier 설정
□ TypeScript 설정
□ Husky pre-commit hooks
□ 코드 포맷팅 자동화
□ VS Code 설정 동기화
```

### 🔧 기술 스택 체크리스트
```bash
Frontend:
□ 프레임워크 설치 (Next.js/React)
□ 스타일링 도구 (Tailwind CSS)
□ 상태 관리 (Zustand/Redux)
□ 폼 관리 (React Hook Form)
□ UI 컴포넌트 라이브러리

Backend:
□ API 프레임워크 설정
□ 데이터베이스 연결
□ ORM 설정 (Prisma)
□ 인증 시스템 (NextAuth.js)
□ 환경 변수 관리

배포:
□ 호스팅 플랫폼 선택 (Vercel)
□ 도메인 연결
□ SSL 인증서 설정
□ 환경별 배포 파이프라인
□ 모니터링 설정
```

### 🚀 빠른 검증 체크리스트
```bash
기능 검증:
□ 사용자 가입/로그인 테스트
□ 핵심 기능 동작 확인
□ 모바일 반응형 테스트
□ 성능 기본 측정
□ 보안 기본 검사

사용자 테스트:
□ 첫 5명 베타 테스터 확보
□ 사용성 피드백 수집
□ 버그 신고 시스템 구축
□ 개선사항 우선순위 정리
□ 다음 버전 계획 수립
```

---

## 🔧 문제 해결 가이드

### 자주 발생하는 셋업 문제

#### 1. 패키지 설치 실패
```bash
문제: npm install 오류
해결:
1. Node.js 버전 확인 (18+ 필요)
2. npm cache clean --force
3. package-lock.json 삭제 후 재설치
4. .npmrc 파일 확인

Claude 활용:
You: "npm install 시 이런 에러가 나는데..."
→ AI가 즉시 원인 분석 및 해결책 제공
```

#### 2. 데이터베이스 연결 오류
```bash
문제: Database connection failed
해결:
1. .env 파일 DATABASE_URL 확인
2. 데이터베이스 서버 상태 확인
3. 방화벽 설정 검토
4. SSL 연결 옵션 확인

빠른 해결:
/troubleshoot @prisma --focus database-connection
```

#### 3. 빌드 에러
```bash
문제: Next.js build failed
해결:
1. TypeScript 타입 오류 수정
2. 환경 변수 누락 확인
3. import 경로 검증
4. 의존성 버전 충돌 해결

AI 디버깅:
/debug @build-logs --analyze-error --suggest-fixes
```

#### 4. 배포 실패
```bash
문제: Vercel deployment failed
해결:
1. 빌드 명령어 확인
2. 환경 변수 Vercel에 설정
3. Node.js 버전 명시
4. .vercelignore 설정

자동 해결:
/deploy-fix @vercel-logs --auto-configure
```

---

## 🎯 프로젝트 유형별 빠른 가이드

### 스타트업 MVP (2주 목표)
```bash
1주차:
□ 핵심 기능 3개 정의
□ 기술 스택 결정
□ 프로젝트 셋업
□ 사용자 인증 구현
□ 기본 CRUD API

2주차:
□ Frontend UI 구현
□ API 연동
□ 배포 및 도메인 설정
□ 기본 테스트
□ 베타 테스터 확보

사용 명령어:
/plan-mvp "아이디어 설명" --timeline 2weeks
/generate-roadmap --features core --focus speed
```

### 사이드 프로젝트 (주말)
```bash
토요일:
□ 아이디어 구체화 (1시간)
□ 프로젝트 셋업 (2시간)
□ 기본 기능 구현 (4시간)

일요일:
□ UI 구현 (3시간)
□ 배포 및 테스트 (2시간)
□ 소셜미디어 공유 (1시간)

빠른 시작:
/weekend-project "아이디어" --template simple
/quick-deploy --platform vercel
```

### 학습 프로젝트 (1개월)
```bash
1주차: 기초 설정 및 계획
2주차: 핵심 기능 구현
3주차: 고급 기능 및 최적화
4주차: 테스트, 배포, 문서화

학습 중심 설정:
/learning-project "기술 스택" --tutorial-mode
/add-examples --focus best-practices
/create-documentation --for-learning
```

---

## 💡 프로 팁

### 시간 절약 꿀팁
```bash
# 1. 템플릿 미리 준비
git clone https://github.com/your-org/project-template
cd project-template && npm install

# 2. 환경 변수 템플릿
cp .env.example .env.local
# 자주 사용하는 값들 미리 설정

# 3. 코드 스니펫 활용
# VS Code snippets 또는 Claude 커스텀 명령어

# 4. 자동화 스크립트
cat > setup.sh << 'EOF'
#!/bin/bash
npm install
npx prisma generate
npm run dev
EOF
```

### AI 활용 극대화
```bash
# 한 번에 모든 설정 요청
You: "Next.js + TypeScript + Prisma + NextAuth + Tailwind로
     할일 관리 앱 전체 설정을 한 번에 해줘.
     Google OAuth, PostgreSQL, Vercel 배포까지 포함해서."

# 구체적인 요구사항 전달
You: "사용자는 할일을 추가/수정/삭제할 수 있고,
     카테고리별 분류, 마감일 설정, 완료 표시가 가능해야 해.
     모바일 친화적이고 다크모드도 지원해줘."
```

---

## 🚀 다음 단계

프로젝트 셋업 완료 후:
1. **[17_Design_System](../17_Design_System/README.md)** - 디자인 시스템 완전 마스터 🎨
2. **[05_17Day_Journey](../05_17Day_Journey/README.md)** - 체계적 개발 진행
3. **[12_Smart_Assistant](../12_Smart_Assistant/README.md)** - 자동화 워크플로우 활용
4. **[11_Quick_Wins](../11_Quick_Wins/README.md)** - 빠른 기능 추가
5. **[15_Living_Documentation](../15_Living_Documentation/README.md)** - 실시간 문서화
6. **[09_Testing_QA](../09_Testing_QA/README.md)** - 품질 보장

### 🎨 디자인 시스템 심화 학습

**완전한 디자인 시스템 구축을 위해 꼭 확인하세요:**

- **Level 1 → Level 2**: 브랜드 적용과 반응형 디자인
- **Level 2 → Level 3**: 자동화와 팀 협업 시스템
- **Claude 최적화**: AI 친화적 토큰과 컴포넌트 패턴
- **실전 템플릿**: 즉시 사용 가능한 토큰과 컴포넌트

> 📖 **핵심 연계**: 이 가이드의 HTML-first 접근법과 17_Design_System이 완벽하게 연결됩니다!

---

> 🚀 **"빠른 시작이 성공의 절반이다"**

**30분 만에 완벽한 프로젝트 기반을 구축하고 바로 개발에 집중하세요!**

> 🎨 **디자인 시스템과 함께라면**: "30분 프로토타입이 2주 프로덕션으로 자연스럽게 진화합니다!"