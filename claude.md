# Claude Code Rules for DiNoCal Project

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
- `/app` - Next.js app router 페이지 및 레이아웃
- `/components` - 재사용 가능한 UI 컴포넌트
- `/lib` - 유틸리티 함수 및 구성
- `/types` - TypeScript 타입 정의
- `/docs` - 프로젝트 문서
- `/data` - 정적 데이터 (국가 정보, 비자 유형)

## 🔧 Available Commands
- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run test` - 테스트 실행
- `npm run lint` - ESLint 실행
- `npm run type-check` - TypeScript 검사

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
