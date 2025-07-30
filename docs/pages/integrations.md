# 통합 페이지 (/integrations)

## 개요

Gmail과 Google Calendar를 통합하여 여행 정보를 자동으로 추출하고 동기화하는 페이지입니다. 사용자는 이메일에서 항공권, 호텔 예약 등의 여행 정보를 자동으로 추출하고 캘린더에 동기화할 수 있습니다.

## 주요 기능

### 1. 서비스 연결 상태

- Gmail 연결 상태 표시
- Google Calendar 연결 상태 표시
- 연결 상태 자동 확인 및 업데이트
- 필수 연결 경고 메시지

### 2. 통합 워크플로우

- 4단계 프로세스: 연결 → 분석 → 동기화 → 완료
- 단계별 진행 상황 표시
- 자동 다음 단계 이동

### 3. Gmail 이메일 분석

- 여행 관련 이메일 자동 감지
- 항공권, 호텔, 렌터카 예약 정보 추출
- 목적지, 날짜 등 핵심 정보 파싱
- 스캔된 이메일 수 통계

### 4. Google Calendar 동기화

- 추출된 여행 정보를 캘린더 이벤트로 생성
- 동기화할 이벤트 미리보기
- 생성된 이벤트 수 통계
- 마지막 동기화 시간 표시

### 5. 탭 네비게이션

- 통합 워크플로우: 전체 프로세스 보기
- Gmail 분석: 이메일 분석 전용 뷰
- Calendar 동기화: 캘린더 동기화 전용 뷰

## 기술적 구현

### 컴포넌트 구조

```typescript
- IntegrationsPage (메인 페이지)
  - WireframeGmailAnalyzer (Gmail 분석 컴포넌트)
  - WireframeCalendarSync (Calendar 동기화 컴포넌트)
```

### 상태 관리

```typescript
// 연결 상태
interface ConnectionStatus {
  gmail: boolean;
  calendar: boolean;
  loading: boolean;
}

// 통합 통계
interface IntegrationStats {
  emailsScanned: number;
  travelInfosExtracted: number;
  eventsCreated: number;
  lastSync: string | null;
}
```

### API 통신

- `/api/gmail/check` - Gmail 연결 상태 확인
- `/api/calendar/check` - Calendar 연결 상태 확인

## 사용자 경험 (UX)

### 워크플로우 흐름

1. **서비스 연결**: 필수 서비스 연결 확인
2. **이메일 분석**: Gmail에서 여행 정보 추출
3. **동기화**: 추출된 정보를 Calendar에 저장
4. **완료**: 성공 메시지 및 재시작 옵션

### 시각적 피드백

- 연결 상태 배지 (연결됨/연결 안됨)
- 진행 단계 인디케이터
- 로딩 상태 표시
- 통계 카드 (스캔/추출/생성 수)

### 에러 처리

- 연결 실패 시 명확한 안내
- 비어있는 결과에 대한 설명
- 재시도 옵션 제공

## 접근성 및 보안

### 접근성

- 명확한 단계별 안내
- 키보드 네비게이션 지원
- 스크린 리더 호환

### 보안

- NextAuth 세션 필수
- OAuth 기반 인증
- API 엔드포인트 보호

## 개선 가능 사항

1. **실제 API 통합**
   - 현재 모의 구현 → 실제 Gmail/Calendar API 연동
   - OAuth 2.0 흐름 구현

2. **고급 분석 기능**
   - 더 많은 여행 서비스 지원 (Airbnb, Uber 등)
   - 머신러닝 기반 패턴 인식
   - 다국어 이메일 지원

3. **자동화 확장**
   - 주기적 자동 동기화
   - 백그라운드 동기화
   - 충돌 감지 및 해결

4. **다른 서비스 통합**
   - Outlook 메일 지원
   - Apple Calendar 지원
   - 여행 앱 API 연동

## 관련 페이지

- `/trips` - 여행 관리 (추출된 정보 표시)
- `/settings` - 설정 (Gmail 연동 관리)
- `/calendar` - 캘린더 뷰 (동기화된 이벤트 표시)

## API 엔드포인트

- `GET /api/gmail/check` - Gmail 연결 상태 확인
- `GET /api/calendar/check` - Calendar 연결 상태 확인
- `POST /api/gmail/analyze` - 이메일 분석 (구현 예정)
- `POST /api/calendar/sync` - 캘린더 동기화 (구현 예정)
