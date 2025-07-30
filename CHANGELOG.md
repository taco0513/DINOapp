# Changelog

All notable changes to the DINO project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **비자 정보 페이지** (/visa) - 국가별 비자 요구사항 표시
- **프로필 관리 페이지** (/profile) - 사용자 프로필 정보 관리
- **향상된 설정 페이지** (/settings) - 타임존 및 여권 국가 설정 기능
- **Gmail 연동 기능** (/gmail) - 이메일에서 자동으로 여행 정보 추출
  - 항공편, 호텔, 렌터카, 액티비티 예약 정보 인식
  - 일괄 가져오기 및 내보내기 기능
- **캘린더 기능** (/calendar) - 여행 일정 시각화
  - 월간 보기 with 여행 표시
  - 연간 보기 with 통계
  - 셰겐 지역 체류일수 추적
- **향상된 통계 분석** (/analytics) - 여행 패턴 분석
  - 4가지 보기 모드: 전체 요약, 국가별, 시간대별, 패턴 분석
  - 요일별 출발 패턴 분석
  - 계절별 여행 선호도 분석
- **PWA 기능 개선**
  - Service Worker v2 with Workbox 통합
  - 향상된 캐싱 전략 (네트워크 우선, 캐시 우선)
  - 오프라인 지원 강화
  - 푸시 알림 구독 기능
  - 설치 프롬프트 및 업데이트 프롬프트
- **성능 최적화**
  - 코드 스플리팅 설정 강화
  - 지연 로딩 컴포넌트 유틸리티
  - 성능 모니터링 시스템
  - Web Vitals 통합
  - 리소스 힌트 매니저
  - 최적화된 이미지 컴포넌트

### Fixed
- 테스트 커버리지 개선 - 스킵된 테스트들 활성화 및 수정
- MainLayout import/export 불일치 오류 수정
- PWAInstallButton의 usePWA 훅 누락 문제 해결

### Changed
- Tailwind CSS로 전체 스타일링 시스템 통일
- 모든 UI 컴포넌트를 기본 Tailwind 클래스로 재작성

## [0.1.0] - 2024-01-15

### Added
- Initial project setup with Next.js 14 App Router
- Google OAuth authentication
- Basic trip management CRUD
- Schengen 90/180 rule calculator
- SQLite database with Prisma ORM
- Responsive design with Tailwind CSS
- Basic PWA support
- Comprehensive test suite setup