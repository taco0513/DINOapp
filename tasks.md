# DINO Development Tasks

## 🚀 High Priority - Epic 1: Foundation & Authentication

- [x] **story_1_1**: Project Setup and Infrastructure
  - Next.js 15+ 프로젝트 TypeScript 설정
  - Tailwind CSS 설치 및 기본 스타일 적용
  - ESLint, Prettier 코드 품질 도구 구성
  - 기본 폴더 구조 생성 (/app, /components, /lib, /types)

- [x] **story_1_2**: Google OAuth Authentication Setup
  - NextAuth.js Google OAuth 2.0 제공자 설정
  - 로그인 페이지 "Google로 로그인" 버튼 구현
  - 성공적인 인증 후 대시보드 리디렉션
  - 세션 관리 및 로그아웃 기능 구현

- [x] **story_1_3**: Basic Layout and Navigation
  - 반응형 네비게이션 바 구현
  - 주요 섹션(대시보드, 여행기록, 셰겐계산기, 국가정보) 링크
  - 모바일 햄버거 메뉴 제공
  - 사용자 프로필 드롭다운 및 로그아웃 옵션

## 🏗️ High Priority - Epic 2: Core Travel Management

- [x] **story_2_1**: Database Schema and Models
  - SQLite 데이터베이스 설정
  - CountryVisit 테이블 생성 (필수 필드 포함)
  - TypeScript 타입 정의와 데이터베이스 스키마 일치
  - 기본 데이터베이스 연결 및 쿼리 함수 구현

- [x] **story_2_2**: Add New Travel Record (UI 완성, API 구현 완료)
  - "새 여행 추가" 폼 구현 (모든 필수 필드)
  - 78개 지원 국가 목록 자동완성 기능
  - 14가지 비자 유형 선택 옵션
  - 사용자 친화적인 날짜 선택기 구현
  - 폼 검증 및 명확한 오류 메시지

- [x] **story_2_3**: View Travel Records List (UI 완성, API 구현 완료)
  - 여행 기록 시간순(최신순) 정렬 표시
  - 국가, 날짜, 비자 유형, 체류일 정보 표시
  - 페이지네이션 또는 무한 스크롤 구현
  - 국가별, 비자 유형별 필터링 기능
  - 검색 기능 (국가명, 기간 검색)

- [x] **story_2_4**: Edit and Delete Travel Records (UI 완성, API 구현 완료)
  - 각 여행 기록에 편집/삭제 버튼 구현
  - 편집 모드에서 기존 데이터 미리 채움
  - 삭제 전 확인 다이얼로그 표시
  - 변경사항 즉시 목록 반영
  - 본인 기록에만 편집/삭제 권한 적용

## 🧮 Medium Priority - Epic 3: Schengen Calculation Engine

- [x] **story_3_1**: Schengen Rule Calculation Logic
  - 90/180일 규칙 계산 알고리즘 구현
  - 과거 셰겐 지역 방문 기록 분석
  - 현재 시점 잔여 일수 계산
  - 다음 재설정 날짜 정확한 계산
  - 다양한 시나리오 단위 테스트

- [x] **story_3_2**: Visual Schengen Calculator Interface
  - 180일 기간 시각적 캘린더/차트 구현
  - 사용된 일수와 남은 일수 색상 구분 표시
  - 현재 상태(사용일/90일 중) 명확 표시
  - 다음 재설정 날짜 하이라이트
  - 모바일 최적화된 차트 구현

- [x] **story_3_3**: Future Trip Planning with Schengen Rules
  - 가상 미래 여행 날짜 입력 기능
  - 90/180일 규칙 위반 여부 자동 확인
  - 위반 시 경고 메시지 및 대안 제안
  - 안전한 여행 기간 추천 기능
  - 계산 결과 저장 및 참조 기능

## 🔌 Medium Priority - Epic 4: Google Services Integration

- [x] **story_4_1**: Gmail API Integration Setup
  - Gmail API 읽기 전용 권한 설정
  - OAuth 스코프 최소 권한 원칙 구성
  - API 요청 제한 및 에러 처리 구현
  - 사용자 동의 플로우 명확한 안내
  - API 키와 설정 안전한 관리

- [x] **story_4_2**: Travel Email Detection and Parsing
  - 항공사, 여행사 이메일 자동 감지
  - 이메일에서 날짜, 출발지, 도착지 정보 추출
  - 다양한 이메일 형식 지원 (항공권, 호텔, 렌터카)
  - 추출 정보 사용자 승인 후 여행 기록 추가
  - 개인정보 로컬 처리, 외부 전송 방지

- [x] **story_4_3**: Google Calendar Synchronization
  - 여행 기록을 Google Calendar 이벤트로 생성
  - 캘린더 이벤트와 여행 기록 간 양방향 동기화
  - 이벤트 제목과 설명에 여행 정보 포함
  - 캘린더 수정 내용 앱에 반영
  - 동기화 충돌 시 적절한 해결 방법 제공

## ⚡ Low Priority - Epic 5: Advanced Features

- [x] **story_5_1**: Notification and Alert System
  - 비자 만료 30일, 7일, 1일 전 알림
  - 셰겐 지역 체류 한도 접근 시 경고
  - 사용자 알림 설정 커스터마이즈
  - 이메일 및 브라우저 푸시 알림 지원
  - 알림 히스토리 확인 기능

- [x] **story_5_2**: Data Import and Export
  - 모든 여행 기록 JSON 형식 내보내기
  - JSON 파일에서 데이터 가져오기
  - 가져오기 시 중복 데이터 감지 및 처리
  - 개인 식별 정보 제외한 데이터 내보내기
  - 대용량 데이터 안정적 처리

- [x] **story_5_3**: Performance Optimization and Mobile Enhancement
  - Next.js 성능 최적화 설정 (코드 스플리팅, 번들 최적화)
  - PWA 구현 완료 (Service Worker, 오프라인 기능, 앱 설치)
  - 모바일 터치 인터페이스 완벽 구현 (제스처, 햅틱 피드백)
  - 오프라인 기본 조회 기능 제공 (IndexedDB, 캐싱)
  - 성능 모니터링 시스템 구축 (Core Web Vitals 추적)

## 🧪 Quality Assurance Tasks

- [x] **testing_unit**: Core Logic Unit Tests
  - 셰겐 계산 알고리즘 테스트
  - 데이터 검증 함수 테스트
  - 날짜 계산 유틸리티 테스트

- [x] **testing_integration**: API Integration Tests
  - Google API 연동 테스트
  - 데이터베이스 작업 테스트
  - 인증 플로우 테스트

- [x] **testing_e2e**: End-to-End Tests
  - 로그인부터 여행 기록 추가까지 전체 플로우
  - 셰겐 계산기 사용 시나리오
  - 모바일 환경 터치 인터랙션 테스트

## 🚀 Deployment & DevOps

- [x] **deployment_setup**: Production Deployment Setup
  - Vercel 배포 환경 구성
  - 환경 변수 설정
  - 도메인 및 SSL 구성
  - GitHub Actions CI/CD 파이프라인 설정
  - Docker 컨테이너화 및 docker-compose 구성
  - 배포 문서 및 가이드 작성

- [x] **monitoring_setup**: Monitoring and Analytics
  - 에러 추적 시스템 설정 (Sentry 통합 완료)
  - 사용 통계 분석 구현 (Google Analytics, Vercel Analytics 통합)
  - 성능 모니터링 설정 (Core Web Vitals 대시보드 구현)
  - 알림 및 경고 시스템 구축

## Notes

- 각 스토리는 1-3일 내 완료 가능하도록 설계
- 의존성이 없는 스토리들은 병렬 작업 가능
- UI 컴포넌트는 기존 디자인 시스템 준수
- 모든 기능은 보안 및 성능 검토 필수
