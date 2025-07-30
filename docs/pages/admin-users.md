# 사용자 관리 (/admin/users)

## 개요

시스템 관리자를 위한 사용자 계정 관리 페이지입니다. 사용자 목록 조회, 계정 상태 관리, 권한 설정 등을 수행할 수 있습니다.

## 주요 기능

### 1. 사용자 목록 관리

- 전체 사용자 목록 조회
- 검색 및 필터링
- 정렬 및 페이지네이션
- 일괄 작업 지원

### 2. 계정 상태 관리

- 계정 활성화/비활성화
- 계정 잠금/해제
- 비밀번호 재설정
- 계정 삭제 및 복구

### 3. 사용자 정보 조회

- 상세 프로필 정보
- 로그인 이력
- 활동 통계
- 여행 기록 요약

### 4. 권한 및 역할 관리

- 사용자 역할 할당
- 권한 그룹 관리
- 접근 제어 설정
- 관리자 권한 부여

## 기술적 구현

### 페이지 구조

```typescript
- AdminUsersPage (서버 컴포넌트)
  - 관리자 권한 검증
  - UserManagementTable 컴포넌트
  - 검색 및 필터 UI
  - 사용자 상세 모달
```

### 데이터 관리

- 서버 사이드 페이지네이션
- 실시간 검색 및 필터링
- 일괄 작업 처리
- 데이터 내보내기

### 보안

- 관리자 권한 필수
- 민감 정보 마스킹
- 작업 감사 로그
- GDPR 준수

## 사용자 관리 기능

### 1. 검색 및 필터링

```typescript
interface UserFilter {
  search: string; // 이름, 이메일 검색
  status: 'all' | 'active' | 'inactive' | 'locked';
  role: 'all' | 'user' | 'admin';
  registrationDate: DateRange;
  lastLogin: DateRange;
  travelActivity: 'active' | 'inactive';
}
```

### 2. 사용자 정보 표시

- 기본 정보: 이름, 이메일, 가입일
- 상태: 활성/비활성, 로그인 상태
- 통계: 여행 수, 최근 활동일
- 권한: 역할, 특수 권한

### 3. 관리 작업

- 단일 사용자 작업
  - 상세 정보 조회
  - 계정 상태 변경
  - 권한 수정
  - 데이터 내보내기
- 일괄 작업
  - 여러 사용자 선택
  - 상태 일괄 변경
  - 이메일 일괄 발송
  - 데이터 일괄 내보내기

### 4. 사용자 통계

- 총 사용자 수
- 활성 사용자 비율
- 신규 가입자 추이
- 지역별 분포

## 데이터 구조

### 사용자 정보

```typescript
interface AdminUserView {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  status: 'active' | 'inactive' | 'locked';
  role: 'user' | 'admin';
  registrationDate: Date;
  lastLoginDate?: Date;
  emailVerified: boolean;
  travelStats: {
    totalTrips: number;
    totalCountries: number;
    lastTripDate?: Date;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}
```

### 관리 액션

```typescript
interface UserManagementAction {
  type: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'delete' | 'restore';
  userId: string | string[];
  reason?: string;
  adminId: string;
  timestamp: Date;
}
```

## 접근성 및 보안

### 접근성

- 관리자 전용 페이지
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 명확한 액션 확인

### 보안

- 민감 정보 보호
- 작업 승인 프로세스
- 감사 로그 기록
- 데이터 익명화 옵션

## 개선 가능 사항

1. **고급 분석**
   - 사용자 행동 패턴 분석
   - 이탈 위험 사용자 식별
   - 사용량 기반 세그멘테이션

2. **자동화**
   - 자동 계정 정리
   - 위험 행동 자동 감지
   - 알림 자동 발송

3. **통합 기능**
   - 고객 지원 시스템 연동
   - 결제 시스템 연동
   - 마케팅 도구 연동

## 관련 페이지

- `/admin/settings` - 시스템 설정
- `/admin/metrics` - 사용자 메트릭
- `/admin/analytics` - 사용자 분석

## API 엔드포인트

- `GET /api/admin/users` - 사용자 목록 조회
- `GET /api/admin/users/:id` - 사용자 상세 조회
- `PUT /api/admin/users/:id` - 사용자 정보 수정
- `POST /api/admin/users/bulk-action` - 일괄 작업
