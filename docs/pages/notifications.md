# 알림 페이지 (/notifications)

## 개요

알림 센터 페이지는 사용자가 앱의 모든 알림을 확인하고 알림 설정을 관리할 수 있는 중앙 허브입니다.

## 주요 기능

### 1. 알림 목록

- 모든 알림을 시간순으로 표시
- 읽음/읽지 않음 필터링
- 알림 유형별 아이콘 표시 (⚠️ 셰겐 경고, 📄 비자 만료, ✈️ 여행 알림)
- 개별 알림 읽음 표시 및 삭제
- 전체 읽음으로 표시 기능
- 알림별 액션 링크 제공

### 2. 알림 설정

- 알림 채널 설정 (이메일, 브라우저 푸시)
- 알림 타이밍 설정
  - 비자 만료 알림 (일 단위)
  - 셰겐 경고 기준 (일)
  - 여행 알림 (일 단위)
- 방해 금지 시간 설정
- 브라우저 알림 권한 요청

## 기술적 구현

### 컴포넌트 구조

```typescript
- NotificationsPage (메인 페이지)
  - WireframeNotificationList (알림 목록)
  - WireframeNotificationSettings (알림 설정)
```

### 상태 관리

- `localStorage` 기반 알림 저장
- 사용자별 알림 분리 (`notifications-${userId}`)
- 알림 설정 별도 저장 (`notification-prefs-${userId}`)

### 주요 데이터 구조

```typescript
// 알림 데이터
interface Notification {
  id: string;
  userId: string;
  type: 'schengen_warning' | 'visa_expiry' | 'trip_reminder';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// 알림 설정
interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  visaExpiryDays: number[];
  schengenWarningThreshold: number;
  tripReminderDays: number[];
  quiet: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}
```

## 사용자 경험 (UX)

### 알림 목록 뷰

1. 읽지 않은 알림 개수를 배지로 표시
2. 알림 유형별 시각적 구분 (아이콘, 색상)
3. 시간 표시를 상대적으로 표현 (예: "2시간 전")
4. 우선순위가 높은 알림은 빨간색으로 강조

### 알림 설정 뷰

1. 섹션별로 구분된 설정 그룹
2. 토글 스위치로 간단한 켜기/끄기
3. 시각적 피드백 (저장 완료 메시지)
4. 브라우저 권한 상태에 따른 조건부 UI

## 접근성 및 보안

### 접근성

- 명확한 레이블과 설명 텍스트
- 키보드 네비게이션 지원
- 스크린 리더 호환 구조

### 보안

- 로그인 필수 (NextAuth 세션 확인)
- 사용자별 데이터 격리
- 클라이언트 사이드 저장 (민감한 정보 제외)

## 개선 가능 사항

1. **서버 사이드 알림 시스템**
   - 현재 localStorage 기반 → API 기반으로 전환
   - 실시간 알림 푸시 구현

2. **알림 카테고리 확장**
   - 시스템 알림
   - 프로모션 알림
   - 커뮤니티 알림

3. **고급 필터링**
   - 날짜 범위 필터
   - 알림 유형별 필터
   - 검색 기능

4. **알림 액션**
   - 알림에서 직접 작업 수행
   - 일괄 작업 지원

## 관련 페이지

- `/dashboard` - 대시보드 (알림 요약 표시)
- `/trips` - 여행 관리 (여행 알림 관련)
- `/schengen` - 셰겐 계산기 (셰겐 경고 관련)

## API 엔드포인트

현재 클라이언트 사이드 구현으로 API 없음. 향후 구현 예정:

- `GET /api/notifications` - 알림 목록 조회
- `POST /api/notifications/read` - 읽음 표시
- `DELETE /api/notifications/:id` - 알림 삭제
- `PUT /api/notifications/settings` - 설정 저장
