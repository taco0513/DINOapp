# DiNoCal (Digital Nomad Calendar) - Project Brief

## 🎯 Project Overview

**DiNoCal**은 디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼입니다. 복잡한 비자 규정을 자동으로 추적하고, 여행 기록을 체계적으로 관리할 수 있도록 지원합니다.

## 🔍 Problem Statement

현재 디지털 노마드들이 직면하는 주요 문제들:

- **복잡한 비자 규정**: 각국의 다른 비자 정책과 체류 한도를 수동으로 추적하기 어려움
- **셰겐 지역 90/180일 규칙**: 유럽 여행 시 복잡한 계산을 수동으로 해야 함
- **분산된 여행 데이터**: 이메일, 캘린더, 수기 기록 등에 흩어진 여행 정보
- **법적 위험**: 비자 규정 위반으로 인한 입국 거부나 법적 문제 위험

## 👥 Target Users

### Primary Users

- **디지털 노마드**: 원격 근무하며 여러 나라를 이동하는 전문직 종사자
- **백패커**: 장기간 여행하는 모험가들
- **출장족**: 해외 출장이 빈번한 비즈니스 전문가

### Secondary Users

- **휴가족**: 해외 휴가를 자주 가는 일반인
- **글로벌 워커**: 국제적으로 활동하는 프리랜서 및 컨설턴트

## 🎯 Goals and Success Metrics

### Business Goals

1. **사용자 편의성 극대화**: 복잡한 비자 계산을 1클릭으로 해결
2. **법적 준수 지원**: 비자 위반 위험을 90% 이상 감소
3. **시간 절약**: 여행 기록 관리 시간을 80% 단축
4. **데이터 통합**: 흩어진 여행 정보를 하나의 플랫폼으로 통합

### User Goals

- 비자 규정을 자동으로 추적하고 준수
- 셰겐 지역 90/180일 규칙 자동 계산
- Gmail/Calendar와의 원활한 데이터 동기화
- 직관적이고 사용하기 쉬운 인터페이스

### Success Metrics

- **사용자 만족도**: 4.5/5 이상
- **데이터 정확도**: 95% 이상
- **자동화율**: 수동 입력 70% 감소
- **사용자 유지율**: 월 80% 이상

## 🚀 MVP Scope

### Core Features (Phase 1)

1. **여행 기록 관리**
   - 입국/출국 날짜 추적
   - 14가지 비자 유형 지원
   - 78개국 비자 정보

2. **셰겐 계산기**
   - 90/180일 규칙 자동 계산
   - 시각적 캘린더 인터페이스
   - 알림 및 경고 시스템

3. **Google 서비스 연동**
   - Gmail 여행 이메일 자동 스캔
   - Google Calendar 양방향 동기화
   - OAuth 2.0 보안 인증

4. **기본 보안 시스템**
   - 데이터 암호화
   - 로컬 SQLite 저장
   - 기본적인 입력 검증

### Future Features (Phase 2+)

- AI 기반 여행 추천
- 다국어 지원 (한국어, 일본어, 중국어)
- 팀/가족 계정 기능
- 모바일 앱 (PWA)

## ⚙️ Technical Constraints

### Technology Stack

- **Frontend**: Next.js 15+ (React 18, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: SQLite (개발) → PostgreSQL (프로덕션)
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (권장)

### Performance Requirements

- **로딩 시간**: 초기 로딩 3초 이내
- **응답 시간**: API 응답 200ms 이내
- **모바일 지원**: 모든 주요 모바일 브라우저
- **오프라인 기능**: 기본 조회 기능 오프라인 지원

### Security Requirements

- GDPR 및 개인정보보호법 준수
- 데이터 암호화 (전송 및 저장)
- 최소 권한 원칙 (Google API)
- 정기적인 보안 감사

## 💰 Budget and Timeline

### MVP Timeline

- **Phase 1 (Core Features)**: 4-6주
- **Phase 2 (Enhanced Features)**: 6-8주
- **Phase 3 (Mobile & Advanced)**: 8-10주

### Resource Requirements

- **Development**: 1-2 개발자
- **Design**: 1 UX/UI 디자이너 (파트타임)
- **Testing**: 베타 테스터 그룹 (20-30명)

## 🎨 Design Direction

### UI/UX Principles

- **미니멀리즘**: 깔끔하고 직관적인 인터페이스
- **여행 테마**: 따뜻하고 모험적인 색상 팔레트
- **모바일 퍼스트**: 모바일 환경 우선 설계
- **접근성**: WCAG 2.1 AA 준수

### Key Screens

1. **대시보드**: 현재 상태와 통계 요약
2. **여행 기록**: 과거/현재/미래 여행 관리
3. **셰겐 계산기**: 시각적 계산 도구
4. **국가 정보**: 각국 비자 정보
5. **설정**: 계정 및 알림 관리

## 🔄 Change Log

| Date       | Version | Description                    | Author      |
| ---------- | ------- | ------------------------------ | ----------- |
| 2025-07-25 | 1.0     | Initial project brief creation | Claude Code |

---

_이 문서는 DiNoCal 프로젝트의 기초 자료로, 모든 이해관계자가 프로젝트의 목적과 범위를 명확히 이해할 수 있도록 작성되었습니다._
