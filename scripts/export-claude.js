// scripts/export-claude.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// PRD + Architecture 요약 → planning.md
const createPlanningFile = () => {
  const planningContent = `# DiNoCal (Digital Nomad Calendar) - Planning Document

## 🌍 Project Overview
**DiNoCal**은 디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼으로, 복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리할 수 있도록 지원합니다.

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
\`\`\`
/DiNoCal
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
\`\`\`

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
`;

  fs.writeFileSync(path.join(projectRoot, 'planning.md'), planningContent);
  console.log('✓ planning.md created');
};

// Stories → tasks.md (실행 가능한 작업들)
const createTasksFile = () => {
  const tasksContent = `# DiNoCal Development Tasks

## 🚀 High Priority - Epic 1: Foundation & Authentication

- [ ] **story_1_1**: Project Setup and Infrastructure
  - Next.js 15+ 프로젝트 TypeScript 설정
  - Tailwind CSS 설치 및 기본 스타일 적용
  - ESLint, Prettier 코드 품질 도구 구성
  - 기본 폴더 구조 생성 (/app, /components, /lib, /types)

- [ ] **story_1_2**: Google OAuth Authentication Setup
  - NextAuth.js Google OAuth 2.0 제공자 설정
  - 로그인 페이지 "Google로 로그인" 버튼 구현
  - 성공적인 인증 후 대시보드 리디렉션
  - 세션 관리 및 로그아웃 기능 구현

- [ ] **story_1_3**: Basic Layout and Navigation
  - 반응형 네비게이션 바 구현
  - 주요 섹션(대시보드, 여행기록, 셰겐계산기, 국가정보) 링크
  - 모바일 햄버거 메뉴 제공
  - 사용자 프로필 드롭다운 및 로그아웃 옵션

## 🏗️ High Priority - Epic 2: Core Travel Management

- [ ] **story_2_1**: Database Schema and Models
  - SQLite 데이터베이스 설정
  - CountryVisit 테이블 생성 (필수 필드 포함)
  - TypeScript 타입 정의와 데이터베이스 스키마 일치
  - 기본 데이터베이스 연결 및 쿼리 함수 구현

- [ ] **story_2_2**: Add New Travel Record
  - "새 여행 추가" 폼 구현 (모든 필수 필드)
  - 78개 지원 국가 목록 자동완성 기능
  - 14가지 비자 유형 선택 옵션
  - 사용자 친화적인 날짜 선택기 구현
  - 폼 검증 및 명확한 오류 메시지

- [ ] **story_2_3**: View Travel Records List
  - 여행 기록 시간순(최신순) 정렬 표시
  - 국가, 날짜, 비자 유형, 체류일 정보 표시
  - 페이지네이션 또는 무한 스크롤 구현
  - 국가별, 비자 유형별 필터링 기능
  - 검색 기능 (국가명, 기간 검색)

- [ ] **story_2_4**: Edit and Delete Travel Records
  - 각 여행 기록에 편집/삭제 버튼 구현
  - 편집 모드에서 기존 데이터 미리 채움
  - 삭제 전 확인 다이얼로그 표시
  - 변경사항 즉시 목록 반영
  - 본인 기록에만 편집/삭제 권한 적용

## 🧮 Medium Priority - Epic 3: Schengen Calculation Engine

- [ ] **story_3_1**: Schengen Rule Calculation Logic
  - 90/180일 규칙 계산 알고리즘 구현
  - 과거 셰겐 지역 방문 기록 분석
  - 현재 시점 잔여 일수 계산
  - 다음 재설정 날짜 정확한 계산
  - 다양한 시나리오 단위 테스트

- [ ] **story_3_2**: Visual Schengen Calculator Interface
  - 180일 기간 시각적 캘린더/차트 구현
  - 사용된 일수와 남은 일수 색상 구분 표시
  - 현재 상태(사용일/90일 중) 명확 표시
  - 다음 재설정 날짜 하이라이트
  - 모바일 최적화된 차트 구현

- [ ] **story_3_3**: Future Trip Planning with Schengen Rules
  - 가상 미래 여행 날짜 입력 기능
  - 90/180일 규칙 위반 여부 자동 확인
  - 위반 시 경고 메시지 및 대안 제안
  - 안전한 여행 기간 추천 기능
  - 계산 결과 저장 및 참조 기능

## 🔌 Medium Priority - Epic 4: Google Services Integration

- [ ] **story_4_1**: Gmail API Integration Setup
  - Gmail API 읽기 전용 권한 설정
  - OAuth 스코프 최소 권한 원칙 구성
  - API 요청 제한 및 에러 처리 구현
  - 사용자 동의 플로우 명확한 안내
  - API 키와 설정 안전한 관리

- [ ] **story_4_2**: Travel Email Detection and Parsing
  - 항공사, 여행사 이메일 자동 감지
  - 이메일에서 날짜, 출발지, 도착지 정보 추출
  - 다양한 이메일 형식 지원 (항공권, 호텔, 렌터카)
  - 추출 정보 사용자 승인 후 여행 기록 추가
  - 개인정보 로컬 처리, 외부 전송 방지

- [ ] **story_4_3**: Google Calendar Synchronization
  - 여행 기록을 Google Calendar 이벤트로 생성
  - 캘린더 이벤트와 여행 기록 간 양방향 동기화
  - 이벤트 제목과 설명에 여행 정보 포함
  - 캘린더 수정 내용 앱에 반영
  - 동기화 충돌 시 적절한 해결 방법 제공

## ⚡ Low Priority - Epic 5: Advanced Features

- [ ] **story_5_1**: Notification and Alert System
  - 비자 만료 30일, 7일, 1일 전 알림
  - 셰겐 지역 체류 한도 접근 시 경고
  - 사용자 알림 설정 커스터마이즈
  - 이메일 및 브라우저 푸시 알림 지원
  - 알림 히스토리 확인 기능

- [ ] **story_5_2**: Data Import and Export
  - 모든 여행 기록 JSON 형식 내보내기
  - JSON 파일에서 데이터 가져오기
  - 가져오기 시 중복 데이터 감지 및 처리
  - 개인 식별 정보 제외한 데이터 내보내기
  - 대용량 데이터 안정적 처리

- [ ] **story_5_3**: Performance Optimization and Mobile Enhancement
  - 초기 로딩 시간 3초 이내 달성
  - 모든 페이지 전환 1초 이내 완료
  - 모바일 터치 인터페이스 완벽 작동
  - 오프라인 기본 조회 기능 제공
  - Progressive Web App (PWA) 기능 구현

## 🧪 Quality Assurance Tasks

- [ ] **testing_unit**: Core Logic Unit Tests
  - 셰겐 계산 알고리즘 테스트
  - 데이터 검증 함수 테스트
  - 날짜 계산 유틸리티 테스트

- [ ] **testing_integration**: API Integration Tests
  - Google API 연동 테스트
  - 데이터베이스 작업 테스트
  - 인증 플로우 테스트

- [ ] **testing_e2e**: End-to-End Tests
  - 로그인부터 여행 기록 추가까지 전체 플로우
  - 셰겐 계산기 사용 시나리오
  - 모바일 환경 터치 인터랙션 테스트

## 🚀 Deployment & DevOps

- [ ] **deployment_setup**: Production Deployment Setup
  - Vercel 배포 환경 구성
  - 환경 변수 설정
  - 도메인 및 SSL 구성

- [ ] **monitoring_setup**: Monitoring and Analytics
  - 에러 추적 시스템 설정
  - 사용 통계 분석 구현
  - 성능 모니터링 설정

## Notes
- 각 스토리는 1-3일 내 완료 가능하도록 설계
- 의존성이 없는 스토리들은 병렬 작업 가능  
- UI 컴포넌트는 기존 디자인 시스템 준수
- 모든 기능은 보안 및 성능 검토 필수
`;

  fs.writeFileSync(path.join(projectRoot, 'tasks.md'), tasksContent);
  console.log('✓ tasks.md created');
};

// Claude 운영 수칙
const createClaudeFile = () => {
  const claudeContent = `# Claude Code Rules for DiNoCal Project

## 📋 Core Rules
- 코딩 전 반드시 planning.md를 읽고 프로젝트 컨텍스트 이해
- 완료된 작업은 tasks.md에서 [ ]를 [x]로 변경하여 표시
- 기술 스택 준수: Next.js 15, TypeScript, Tailwind CSS, SQLite
- 보안 우선 접근: 적절한 검증 및 데이터 보호 실시
- 기존 프로젝트 패턴 및 컨벤션 사용

## 🏗️ Development Guidelines

### Code Standards
- TypeScript strict 모드 사용하여 타입 안전성 보장
- Next.js 15 app router 컨벤션 준수
- 적절한 에러 처리 및 사용자 피드백 구현
- Zod를 사용한 입력 검증
- 반응형 디자인 원칙 유지

### Security Requirements
- 모든 사용자 입력을 Zod 스키마로 검증
- 모든 폼에 CSRF 보호 구현
- API 엔드포인트에 속도 제한 적용
- 데이터베이스 작업 전 데이터 정제
- 보안 이벤트 적절한 로깅

### Performance Optimization
- 적절한 곳에 5분 TTL 캐싱 사용
- 적절한 인덱싱으로 데이터베이스 쿼리 최적화
- 대용량 컴포넌트에 지연 로딩 구현
- 번들 크기 최소화 및 이미지 최적화

### Testing Approach
- 비즈니스 로직에 대한 단위 테스트 작성
- API 엔드포인트에 대한 통합 테스트 추가
- 모바일 반응성 테스트
- 보안 조치 검증

## 🎯 Project Priorities

### Phase 1: Core Foundation (Epic 1-2)
1. Google OAuth 통합 설정
2. 여행 기록 CRUD 작업 완료
3. 기본 모바일 반응성 구현
4. 핵심 데이터베이스 스키마 설정

### Phase 2: Advanced Features (Epic 3-4)
1. 셰겐 계산기 구현
2. Gmail/Calendar 통합
3. 데이터 시각화 대시보드
4. 향상된 보안 테스트

### Phase 3: Enhancement (Epic 5)
1. 알림 시스템 구현
2. 다국어 지원
3. PWA 기능 구현
4. 성능 최적화

## 🚀 Workflow Instructions

### 새 작업 시작 시
1. tasks.md에서 다음 우선순위 항목 확인
2. docs/ 폴더의 관련 문서 검토
3. 기존 코드 패턴 검토
4. 구현 접근 방식 계획

### 개발 중
- 기존 컴포넌트 구조 준수
- 확립된 상태 관리 패턴 사용
- 적절한 에러 경계 구현
- 적절한 로딩 상태 추가

### 완료 전
- 기능을 철저히 테스트
- 모바일 반응성 확인
- 보안 영향 검토
- 필요 시 문서 업데이트
- tasks.md에서 작업 완료로 표시

## 📁 Project Structure Guide
- \`/app\` - Next.js app router 페이지 및 레이아웃
- \`/components\` - 재사용 가능한 UI 컴포넌트
- \`/lib\` - 유틸리티 함수 및 구성
- \`/types\` - TypeScript 타입 정의
- \`/docs\` - 프로젝트 문서
- \`/data\` - 정적 데이터 (국가 정보, 비자 유형)

## 🔧 Available Commands
- \`npm run dev\` - 개발 서버 시작
- \`npm run build\` - 프로덕션 빌드
- \`npm run test\` - 테스트 실행
- \`npm run lint\` - ESLint 실행
- \`npm run type-check\` - TypeScript 검사

## 🌍 DiNoCal Specific Guidelines

### Visa & Travel Logic
- 셰겐 90/180일 규칙 계산 시 정확성 최우선
- 비자 유형별 특별 규정 고려
- 날짜 계산 시 시간대 인식
- 사용자에게 법적 자문이 아님을 명확히 안내

### Google API Integration
- 최소 권한 원칙 엄격 적용
- 사용자 데이터 로컬 처리 우선
- API 호출 실패에 대한 견고한 에러 처리
- 사용자 동의 및 개인정보 보호 투명성

### Data Management
- 사용자 여행 데이터의 정확성과 일관성 보장
- 중복 데이터 방지 메커니즘 구현
- 데이터 백업 및 복원 기능 제공
- GDPR 및 개인정보보호법 준수

### Mobile Experience
- 터치 친화적 인터페이스 설계
- 네트워크 연결 불안정 상황 고려
- 오프라인 기능 점진적 향상
- 배터리 및 데이터 사용량 최적화

Remember: DiNoCal은 실제 사용자의 법적 준수를 돕는 프로덕션 애플리케이션입니다. 
코드 품질, 보안, 사용자 경험에 대한 높은 기준을 유지하세요.

**최종 목표**: "복잡한 비자 걱정 없이, 오직 여행의 즐거움만 생각할 수 있는" 플랫폼 구축
`;

  fs.writeFileSync(path.join(projectRoot, 'claude.md'), claudeContent);
  console.log('✓ claude.md created');
};

// package.json에 type: "module" 추가
const updatePackageJson = () => {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.type = 'module';
  packageJson.scripts = {
    ...packageJson.scripts,
    'export-claude': 'node scripts/export-claude.js'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✓ package.json updated with ES module support');
};

// 메인 실행 함수
const main = () => {
  console.log('🚀 Generating Claude Code files for DiNoCal project...\n');
  
  try {
    updatePackageJson();
    createPlanningFile();
    createTasksFile();
    createClaudeFile();
    
    console.log('\n✅ All files generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Files are ready for Claude Code CLI');
    console.log('2. Load files: planning.md, claude.md, tasks.md');
    console.log('3. Start development with first task from Epic 1');
    
  } catch (error) {
    console.error('❌ Error generating files:', error);
    process.exit(1);
  }
};

// ES 모듈에서 직접 실행 확인
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createPlanningFile, createTasksFile, createClaudeFile, updatePackageJson };