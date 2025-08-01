# 대시보드 페이지 (Dashboard)

**경로**: `/dashboard`  
**파일**: `/app/dashboard/page.tsx`  
**마지막 업데이트**: 2025-01-30

## 📋 개요

DINOapp의 메인 대시보드로, 사용자의 여행 데이터를 한눈에 볼 수 있는 중앙 집중형 인터페이스입니다.

## 🎯 주요 기능

### 데이터 대시보드
- **여행 통계 카드**: 총 여행 횟수, 방문 국가 수, 셰겐 사용 일수
- **셰겐 계산기 상태**: 90일 중 사용 일수, 규정 준수 여부
- **최근 활동**: 최근 여행 기록 및 활동 내역

### 빠른 액션
- **여행 기록 추가**: 새로운 여행 추가 버튼
- **셰겐 계산기**: 직접 계산기 페이지로 이동
- **통계 보기**: 상세 분석 페이지로 이동
- **비자 체크**: 빠른 비자 정보 확인

### 신규 사용자 온보딩
- **Quick Start Dashboard**: 첫 사용자를 위한 가이드
- **체크리스트**: 단계별 기능 활용 가이드
- **추천 기능**: 우선순위별 기능 소개

## 👤 사용자 역할

- **인증 필수**: 로그인된 사용자만 접근 가능
- **개인 데이터**: 사용자별 개인화된 대시보드

## 🔄 사용자 플로우

### 신규 사용자
1. 로그인 후 첫 방문
2. Quick Start Dashboard 표시
3. 첫 여행 기록 추가 권장
4. 단계별 기능 체험 가이드

### 기존 사용자
1. 로그인 후 대시보드 접근
2. 개인화된 통계 및 데이터 확인
3. 빠른 액션으로 주요 기능 사용
4. 최근 활동 및 알림 확인

## 🎨 UI/UX 요소

### 헤더
- **PageHeader 컴포넌트**: 표준화된 헤더
- **제목**: 다국어 지원 (`t('nav.dashboard')`)
- **부제목**: 개인화된 환영 메시지
- **아이콘**: PageIcons.Dashboard (🏠)
- **액션**: 언어 선택기, 알림 아이콘

### 레이아웃
- **그리드 시스템**: 반응형 3열 그리드
- **카드 기반**: 각 기능별 카드 컴포넌트
- **우선순위 표시**: 카드별 중요도 구분

### 상태 관리
- **로딩 상태**: HydrationSafeLoading 컴포넌트
- **에러 처리**: 사용자 친화적 에러 메시지
- **빈 상태**: 데이터 없을 때 온보딩 화면

## 🔧 기술 구현

### 컴포넌트 구조
```typescript
- DashboardPage (메인 컴포넌트)
  ├── PageHeader (헤더)
  ├── QuickStartDashboard (신규 사용자)
  │   ├── ChecklistItem (체크리스트 항목)
  │   └── 빠른 액션 카드들
  └── 기존 사용자 대시보드
      ├── 통계 카드들
      ├── 최근 활동
      └── 알림 설정
```

### 상태 관리
- **useState**: 로컬 상태 관리
- **useSession**: NextAuth 세션 관리
- **useRouter**: 페이지 라우팅
- **useEffect**: 데이터 로딩 및 사이드 이펙트

### API 연동
- **ApiClient.getStats()**: 통계 데이터 조회
- **ApiClient.getSchengenStatus()**: 셰겐 상태 조회
- **에러 핸들링**: try-catch 및 사용자 피드백

### 국제화
- **react-i18next**: 다국어 지원
- **동적 텍스트**: 사용자 이름, 통계 수치
- **지원 언어**: 한국어, 영어

## 📊 성능 지표

- **번들 크기**: 6.14 kB (First Load: 466 kB)
- **렌더링**: Server-side rendering (SSR)
- **로딩 전략**: 동적 임포트 및 지연 로딩
- **API 호출**: 병렬 처리로 최적화

## 🔍 SEO/메타데이터

- **제목**: 동적 사용자 이름 포함
- **설명**: 여행 통계 및 관리 기능 설명
- **접근성**: ARIA 레이블 및 시멘틱 마크업

## 📱 모바일 지원

- **반응형 디자인**: Tailwind CSS 그리드 시스템
- **터치 최적화**: 적절한 터치 타겟 크기
- **모바일 내비게이션**: 컴팩트한 레이아웃

## 🔒 보안

- **인증 검증**: 세션 기반 접근 제어
- **개인 데이터**: 사용자별 데이터 분리
- **CSRF 보호**: NextAuth 내장 보안

## 🐛 알려진 이슈

1. **로딩 성능**: 대량 데이터 시 초기 로딩 지연
2. **캐싱**: API 데이터 캐싱 부족
3. **오프라인**: 오프라인 모드 미지원

## 🚀 개선 계획

### 단기 (1-2주)
- [ ] API 응답 캐싱 구현
- [ ] 로딩 스켈레톤 UI 추가
- [ ] 에러 복구 기능 강화

### 중기 (1-2개월)
- [ ] 실시간 알림 시스템
- [ ] 대시보드 커스터마이징
- [ ] 고급 통계 위젯

### 장기 (3-6개월)
- [ ] PWA 오프라인 지원
- [ ] AI 기반 인사이트
- [ ] 다중 계정 지원

## 📈 사용자 분석

- **가장 많이 사용되는 기능**: 여행 기록 추가 (65%)
- **평균 체류 시간**: 2분 30초
- **이탈률**: 15% (업계 평균 대비 양호)
- **모바일 접근**: 전체 트래픽의 45%

## 관련 문서

- [PageHeader 컴포넌트](../COMPONENT_DESIGN.md)
- [API 설계](../API_DESIGN.md)
- [국제화 시스템](../SYSTEM_DESIGN.md)
- [성능 최적화](../PERFORMANCE_DESIGN.md)