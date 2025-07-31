# DINO (Digital Nomad) - Planning Document

## 🌍 Project Overview

**DINO**는 디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼으로, 복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리할 수 있도록 지원합니다.

### 🎯 Core Goals

- **비자 준수 자동화**: 78개국 비자 규정과 체류 한도를 자동 추적
- **셰겐 지역 90/180일 규칙**: 복잡한 유럽 여행 규정 자동 계산
- **Google 서비스 통합**: Gmail/Calendar를 통한 자동 여행 데이터 수집
- **직관적인 UX**: 모바일 친화적이고 사용하기 쉬운 인터페이스

### 👥 Target Users

- **디지털 노마드**: 원격 근무하며 여러 나라를 이동하는 전문직
- **백패커**: 장기간 여행하는 모험가들
- **출장족**: 해외 출장이 빈번한 비즈니스 전문가
- **글로벌 워커**: 국제적으로 활동하는 프리랜서 및 컨설턴트

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend**: Next.js 15.4.4 (React 18, TypeScript)
- **Backend**: Next.js API Routes with Node.js
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + React Query
- **Deployment**: Vercel platform with Edge Functions

### Core Features

1. **여행 기록 관리**: 입국/출국 날짜, 14가지 비자 유형, 78개국 지원
2. **셰겐 계산기**: 90/180일 규칙 자동 계산 및 시각화
3. **Google 연동**: Gmail 자동 스캔, Calendar 양방향 동기화
4. **알림 시스템**: 비자 만료, 체류 한도 초과 경고
5. **데이터 관리**: JSON 백업/복원, 성능 최적화된 캐싱

### Security & Performance

- **보안**: AES-256 암호화, GDPR 준수, 최소 권한 원칙
- **성능**: 3초 이내 로딩, 200ms API 응답, 다중 캐싱 전략
- **모바일**: PWA 지원, 오프라인 기능, 반응형 디자인

## 📊 Project Structure

```
/DINO
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application
│   └── api/               # API Routes
├── components/            # Reusable UI components
├── lib/                   # Core business logic
│   ├── schengen/         # Calculation engine
│   ├── google/           # API integrations
│   └── database/         # Data layer
├── types/                 # TypeScript definitions
└── docs/                  # Documentation
```

## 🎨 User Interface Design

- **디자인 철학**: 미니멀하고 직관적인 여행 테마
- **주요 화면**: 대시보드, 여행기록, 셰겐계산기, 국가정보, 설정
- **모바일 퍼스트**: 터치 친화적 인터페이스
- **접근성**: WCAG 2.1 AA 준수

## 📈 Success Metrics

- **사용자 만족도**: 4.5/5 이상
- **데이터 정확도**: 95% 이상
- **자동화율**: 수동 입력 70% 감소
- **성능**: 3초 이내 로딩, 99.9% 가동시간
