# DiNoCal Product Requirements Document (PRD)

## 📋 Goals and Background Context

### Goals

- 디지털 노마드의 비자 규정 준수를 자동화하여 법적 위험 최소화
- 복잡한 셰겐 지역 90/180일 규칙을 직관적으로 계산하고 시각화
- Gmail/Calendar 연동을 통한 여행 데이터 자동 수집 및 관리
- 78개국 비자 정보를 실시간으로 제공하는 종합 플랫폼 구축

### Background Context

디지털 노마드 인구가 급증하면서 복잡한 국제 비자 규정을 준수해야 하는 여행자들이 늘어나고 있습니다. 특히 셰겐 지역의 90/180일 규칙은 계산이 복잡하여 많은 여행자들이 실수로 규정을 위반하는 경우가 발생하고 있습니다. DiNoCal은 이러한 문제를 해결하기 위해 스마트한 자동화 솔루션을 제공합니다.

### Change Log

| Date       | Version | Description          | Author      |
| ---------- | ------- | -------------------- | ----------- |
| 2025-07-25 | 1.0     | Initial PRD creation | Claude Code |

## 📝 Requirements

### Functional Requirements

**FR1**: 사용자는 Google OAuth 2.0을 통해 안전하게 로그인할 수 있어야 한다.

**FR2**: 시스템은 78개국의 비자 정보와 체류 한도를 지원해야 한다.

**FR3**: 사용자는 14가지 비자 유형(관광, 비즈니스, 학생, 워킹홀리데이, 디지털노마드 등)을 선택할 수 있어야 한다.

**FR4**: 시스템은 여행 기록의 입국일, 출국일, 국가, 비자 유형을 저장하고 관리해야 한다.

**FR5**: 셰겐 지역 90/180일 규칙을 자동으로 계산하고 시각적으로 표시해야 한다.

**FR6**: Gmail에서 여행 관련 이메일(항공권, 호텔 예약)을 자동으로 스캔하고 데이터를 추출해야 한다.

**FR7**: Google Calendar와 양방향 동기화를 통해 여행 일정을 관리해야 한다.

**FR8**: 비자 만료일이나 체류 한도 초과 전에 사용자에게 알림을 제공해야 한다.

**FR9**: 사용자는 여행 기록을 JSON 형식으로 내보내고 가져올 수 있어야 한다.

**FR10**: 시스템은 국가별 비자 정보와 규정을 실시간으로 제공해야 한다.

### Non-Functional Requirements

**NFR1**: 시스템은 초기 로딩 시간 3초 이내, API 응답 시간 200ms 이내를 보장해야 한다.

**NFR2**: 모든 사용자 데이터는 AES-256 암호화로 보호되어야 한다.

**NFR3**: 시스템은 월 99.9% 이상의 가동 시간을 보장해야 한다.

**NFR4**: WCAG 2.1 AA 접근성 표준을 준수해야 한다.

**NFR5**: 모든 주요 모바일 브라우저에서 완전히 반응형으로 작동해야 한다.

**NFR6**: Google API 연동 시 최소 권한 원칙을 적용해야 한다.

**NFR7**: GDPR 및 개인정보보호법을 완전히 준수해야 한다.

**NFR8**: 시스템은 동시 사용자 1,000명까지 안정적으로 지원해야 한다.

## 🎨 User Interface Design Goals

### Overall UX Vision

여행의 자유로움과 모험 정신을 반영하는 따뜻하고 친근한 인터페이스로, 복잡한 비자 규정을 단순하고 직관적으로 관리할 수 있는 경험을 제공합니다.

### Key Interaction Paradigms

- **원클릭 계산**: 복잡한 비자 규정을 버튼 하나로 계산
- **드래그 앤 드롭**: 여행 일정을 캘린더에서 직관적으로 조정
- **스마트 알림**: 중요한 날짜와 기한을 놓치지 않도록 지능형 알림
- **자동 완성**: 국가명, 도시명 입력 시 자동 완성 기능

### Core Screens and Views

- **메인 대시보드**: 현재 상태, 통계, 다음 여행 일정 한눈에 보기
- **여행 기록 페이지**: 과거/현재/미래 여행 기록 관리
- **셰겐 계산기**: 90/180일 규칙 시각적 계산 도구
- **국가 정보 페이지**: 각국 비자 정보 및 규정 상세보기
- **설정 페이지**: 계정, 알림, 연동 서비스 관리

### Accessibility: WCAG AA

- 키보드 네비게이션 완전 지원
- 스크린 리더 호환성
- 고대비 모드 지원
- 폰트 크기 조절 기능

### Branding

여행과 자유를 상징하는 따뜻한 색상 팔레트 (푸른 하늘, 황금빛 모래, 녹색 자연)를 사용하여 모험적이면서도 안정적인 느낌을 전달합니다.

### Target Device and Platforms: Web Responsive

모바일 퍼스트 설계로 스마트폰에서 데스크톱까지 모든 디바이스에서 최적의 경험을 제공합니다.

## ⚙️ Technical Assumptions

### Repository Structure: Monorepo

단일 저장소에서 프론트엔드와 백엔드를 함께 관리하여 개발 효율성을 극대화합니다.

### Service Architecture

Next.js 풀스택 애플리케이션으로 API Routes를 활용한 통합 아키텍처를 채택합니다.

### Testing Requirements

- **Unit Tests**: 핵심 비즈니스 로직 (비자 계산, 데이터 검증)
- **Integration Tests**: Google API 연동, 데이터베이스 작업
- **E2E Tests**: 주요 사용자 플로우 (로그인, 여행 기록 추가, 셰겐 계산)

### Additional Technical Assumptions and Requests

- TypeScript 엄격 모드 사용으로 타입 안정성 보장
- SQLite (개발) → PostgreSQL (프로덕션) 마이그레이션 경로
- Vercel 배포 환경 최적화
- 5분 TTL 캐싱 시스템으로 성능 최적화

## 📊 Epic List

### Epic 1: Foundation & Authentication

사용자 인증 시스템과 기본 프로젝트 인프라를 구축하고, Google OAuth 연동을 통한 안전한 로그인 기능을 제공합니다.

### Epic 2: Core Travel Management

여행 기록의 핵심 CRUD 기능을 구현하고, 사용자가 직관적으로 여행 데이터를 관리할 수 있는 기본 시스템을 제공합니다.

### Epic 3: Schengen Calculation Engine

복잡한 셰겐 지역 90/180일 규칙을 자동으로 계산하고 시각화하는 전용 계산기를 구현합니다.

### Epic 4: Google Services Integration

Gmail과 Google Calendar 연동을 통해 여행 데이터를 자동으로 수집하고 동기화하는 기능을 구현합니다.

### Epic 5: Advanced Features & Optimization

알림 시스템, 데이터 내보내기/가져오기, 성능 최적화, 모바일 최적화 등 고급 기능을 추가합니다.

## 📋 Epic Details

### Epic 1: Foundation & Authentication

**Goal**: 안전하고 확장 가능한 인증 시스템과 기본 프로젝트 인프라를 구축하여 사용자가 Google 계정으로 안전하게 로그인하고 기본적인 앱 네비게이션을 할 수 있도록 합니다.

#### Story 1.1: Project Setup and Infrastructure

As a developer,
I want to set up the Next.js project with TypeScript and essential configurations,
so that we have a solid foundation for development.

**Acceptance Criteria**:

1. Next.js 15+ 프로젝트가 TypeScript와 함께 설정되어 있다
2. Tailwind CSS가 설치되고 기본 스타일이 적용되어 있다
3. ESLint와 Prettier가 구성되어 코드 품질이 보장된다
4. 기본 폴더 구조 (/app, /components, /lib, /types)가 생성되어 있다
5. 개발 서버가 정상적으로 실행된다

#### Story 1.2: Google OAuth Authentication Setup

As a user,
I want to log in with my Google account,
so that I can securely access the application.

**Acceptance Criteria**:

1. NextAuth.js가 Google OAuth 2.0 제공자와 함께 설정되어 있다
2. 로그인 페이지에서 "Google로 로그인" 버튼이 작동한다
3. 성공적인 인증 후 사용자가 대시보드로 리디렉션된다
4. 세션 관리가 적절히 구현되어 있다
5. 로그아웃 기능이 정상적으로 작동한다

#### Story 1.3: Basic Layout and Navigation

As a user,
I want to navigate between different sections of the app,
so that I can access all available features.

**Acceptance Criteria**:

1. 반응형 네비게이션 바가 구현되어 있다
2. 주요 섹션(대시보드, 여행기록, 셰겐계산기, 국가정보)으로의 링크가 있다
3. 모바일에서는 햄버거 메뉴가 제공된다
4. 현재 페이지가 네비게이션에서 하이라이트된다
5. 사용자 프로필 드롭다운에 로그아웃 옵션이 있다

### Epic 2: Core Travel Management

**Goal**: 사용자가 여행 기록을 효율적으로 생성, 조회, 수정, 삭제할 수 있는 핵심 데이터 관리 시스템을 제공하여 모든 여행 정보를 중앙에서 관리할 수 있도록 합니다.

#### Story 2.1: Database Schema and Models

As a developer,
I want to create the database schema for travel records,
so that we can store and manage user travel data.

**Acceptance Criteria**:

1. SQLite 데이터베이스가 설정되어 있다
2. CountryVisit 테이블이 필요한 모든 필드와 함께 생성되어 있다
3. TypeScript 타입 정의가 데이터베이스 스키마와 일치한다
4. 기본 데이터베이스 연결 및 쿼리 함수가 구현되어 있다
5. 데이터베이스 마이그레이션 시스템이 설정되어 있다

#### Story 2.2: Add New Travel Record

As a user,
I want to add a new travel record,
so that I can track my visits to different countries.

**Acceptance Criteria**:

1. "새 여행 추가" 폼이 모든 필수 필드와 함께 제공된다
2. 국가 선택은 78개 지원 국가 목록에서 자동완성으로 가능하다
3. 비자 유형을 14가지 옵션 중에서 선택할 수 있다
4. 날짜 입력은 사용자 친화적인 날짜 선택기를 사용한다
5. 폼 검증이 적절히 구현되어 있고 오류 메시지가 명확하다
6. 성공적인 추가 후 여행 기록 목록이 업데이트된다

#### Story 2.3: View Travel Records List

As a user,
I want to view all my travel records in a organized list,
so that I can see my travel history at a glance.

**Acceptance Criteria**:

1. 여행 기록이 시간순(최신순)으로 정렬되어 표시된다
2. 각 기록에는 국가, 날짜, 비자 유형, 체류일이 표시된다
3. 페이지네이션이나 무한 스크롤이 구현되어 있다
4. 국가별, 비자 유형별 필터링이 가능하다
5. 검색 기능으로 특정 국가나 기간을 찾을 수 있다
6. 모바일에서도 가독성이 좋게 표시된다

#### Story 2.4: Edit and Delete Travel Records

As a user,
I want to modify or remove existing travel records,
so that I can correct mistakes or update information.

**Acceptance Criteria**:

1. 각 여행 기록에 편집/삭제 버튼이 있다
2. 편집 모드에서 기존 데이터가 폼에 미리 채워진다
3. 삭제 전에 확인 다이얼로그가 표시된다
4. 변경사항이 즉시 목록에 반영된다
5. 편집/삭제 권한은 본인의 기록에만 적용된다

### Epic 3: Schengen Calculation Engine

**Goal**: 복잡한 셰겐 지역 90/180일 규칙을 자동으로 계산하고 사용자에게 직관적인 시각적 인터페이스를 제공하여 유럽 여행 계획을 안전하게 수립할 수 있도록 지원합니다.

#### Story 3.1: Schengen Rule Calculation Logic

As a developer,
I want to implement the 90/180 day Schengen rule calculation,
so that users can get accurate visa compliance information.

**Acceptance Criteria**:

1. 90/180일 규칙 계산 알고리즘이 정확히 구현되어 있다
2. 사용자의 과거 셰겐 지역 방문 기록을 분석한다
3. 현재 시점에서 사용 가능한 잔여 일수를 계산한다
4. 다음 재설정 날짜를 정확히 계산한다
5. 단위 테스트로 다양한 시나리오가 검증되어 있다

#### Story 3.2: Visual Schengen Calculator Interface

As a user,
I want to see my Schengen visa status in a clear visual format,
so that I can easily understand my remaining days and restrictions.

**Acceptance Criteria**:

1. 180일 기간을 시각적으로 표현하는 캘린더/차트가 있다
2. 사용된 일수와 남은 일수가 색상으로 구분되어 표시된다
3. 현재 상태(몇 일 사용/90일 중)가 명확히 표시된다
4. 다음 재설정 날짜가 하이라이트되어 있다
5. 모바일에서도 차트가 읽기 쉽게 최적화되어 있다

#### Story 3.3: Future Trip Planning with Schengen Rules

As a user,
I want to plan future trips while respecting Schengen rules,
so that I can avoid visa violations.

**Acceptance Criteria**:

1. 가상의 미래 여행 날짜를 입력할 수 있다
2. 시스템이 해당 여행이 90/180일 규칙에 위반되는지 확인한다
3. 위반 시 명확한 경고 메시지와 대안 제안이 표시된다
4. 안전한 여행 기간 추천 기능이 제공된다
5. 계산 결과를 저장하고 나중에 참조할 수 있다

### Epic 4: Google Services Integration

**Goal**: Gmail과 Google Calendar 서비스와의 연동을 통해 사용자의 여행 관련 이메일에서 자동으로 데이터를 추출하고, 캘린더와 양방향 동기화하여 수동 입력을 최소화합니다.

#### Story 4.1: Gmail API Integration Setup

As a developer,
I want to set up Gmail API integration with proper permissions,
so that we can scan travel-related emails safely.

**Acceptance Criteria**:

1. Gmail API가 읽기 전용 권한으로 설정되어 있다
2. OAuth 스코프가 최소 권한 원칙에 따라 구성되어 있다
3. API 요청 제한 및 에러 처리가 구현되어 있다
4. 사용자 동의 플로우가 명확하게 안내된다
5. API 키와 설정이 안전하게 관리된다

#### Story 4.2: Travel Email Detection and Parsing

As a user,
I want the system to automatically find and extract travel information from my emails,
so that I don't have to manually enter all my trip details.

**Acceptance Criteria**:

1. 시스템이 항공사, 여행사 이메일을 자동으로 감지한다
2. 이메일에서 날짜, 출발지, 도착지 정보를 정확히 추출한다
3. 여러 이메일 형식 (항공권, 호텔, 렌터카)을 지원한다
4. 추출된 정보는 사용자 승인 후 여행 기록에 추가된다
5. 개인정보는 로컬에서만 처리되고 외부로 전송되지 않는다

#### Story 4.3: Google Calendar Synchronization

As a user,
I want my travel records to sync with Google Calendar,
so that I can see my trips in my regular calendar.

**Acceptance Criteria**:

1. 여행 기록이 Google Calendar에 이벤트로 생성된다
2. 캘린더 이벤트와 여행 기록 간 양방향 동기화가 된다
3. 이벤트 제목과 설명에 여행 정보가 포함된다
4. 캘린더에서 수정된 내용이 앱에 반영된다
5. 동기화 충돌 시 적절한 해결 방법이 제공된다

### Epic 5: Advanced Features & Optimization

**Goal**: 알림 시스템, 데이터 관리 기능, 성능 최적화를 통해 완성도 높은 사용자 경험을 제공하고, 앱의 전반적인 안정성과 사용성을 향상시킵니다.

#### Story 5.1: Notification and Alert System

As a user,
I want to receive timely notifications about visa deadlines and travel restrictions,
so that I can avoid compliance issues.

**Acceptance Criteria**:

1. 비자 만료 30일, 7일, 1일 전 알림이 제공된다
2. 셰겐 지역 체류 한도 접근 시 경고가 표시된다
3. 사용자가 알림 설정을 커스터마이즈할 수 있다
4. 이메일 및 브라우저 푸시 알림을 지원한다
5. 알림 히스토리를 확인할 수 있다

#### Story 5.2: Data Import and Export

As a user,
I want to backup and restore my travel data,
so that I can migrate between devices or keep my data safe.

**Acceptance Criteria**:

1. 모든 여행 기록을 JSON 형식으로 내보낼 수 있다
2. JSON 파일에서 데이터를 가져올 수 있다
3. 가져오기 시 중복 데이터 감지 및 처리가 된다
4. 내보낸 데이터에는 개인 식별 정보가 제외된다
5. 대용량 데이터도 안정적으로 처리된다

#### Story 5.3: Performance Optimization and Mobile Enhancement

As a user,
I want the app to load quickly and work smoothly on my mobile device,
so that I can use it efficiently while traveling.

**Acceptance Criteria**:

1. 초기 로딩 시간이 3초 이내이다
2. 모든 페이지 전환이 1초 이내에 완료된다
3. 모바일에서 터치 인터페이스가 완벽하게 작동한다
4. 오프라인에서도 기본 조회 기능이 가능하다
5. 이미지와 리소스가 최적화되어 있다
6. Progressive Web App (PWA) 기능이 구현되어 있다

## 📋 Checklist Results Report

본 PRD는 BMAD 방법론에 따라 체계적으로 작성되었으며, 다음 사항들이 확인되었습니다:

✅ **요구사항 완전성**: 기능적 요구사항 10개, 비기능적 요구사항 8개가 명확히 정의됨
✅ **에픽-스토리 연계**: 5개 에픽, 15개 스토리가 논리적 순서로 구성됨
✅ **수용 기준 구체성**: 모든 스토리에 테스트 가능한 수용 기준 포함
✅ **기술적 실현 가능성**: 제안된 기술 스택으로 구현 가능
✅ **사용자 중심 설계**: 타겟 사용자의 니즈가 반영된 기능 설계

## 📋 Next Steps

### UX Expert Prompt

UI/UX 전문가는 이 PRD를 기반으로 디지털 노마드를 위한 직관적이고 모바일 친화적인 인터페이스를 설계해주세요. 특히 복잡한 비자 정보를 단순하게 시각화하는 방안에 중점을 두어 주세요.

### Architect Prompt

시스템 아키텍트는 이 PRD의 요구사항을 바탕으로 확장 가능하고 보안이 강화된 풀스택 아키텍처를 설계해주세요. Google API 연동, 실시간 알림, 성능 최적화를 고려한 기술적 설계가 필요합니다.
