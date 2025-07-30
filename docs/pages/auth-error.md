# 인증 에러 페이지 (/auth/error)

## 개요

인증 과정에서 발생하는 다양한 에러를 처리하고 사용자에게 명확한 안내를 제공하는 페이지입니다.

## 주요 기능

### 1. 포괄적 에러 처리

- 13가지 에러 유형 지원
- 에러별 맞춤형 메시지
- 에러 코드 표시

### 2. 사용자 친화적 UI

- 시각적 에러 아이콘
- 명확한 에러 메시지
- 적절한 다음 단계 안내

### 3. 복구 옵션

- 다시 시도 버튼
- 홈으로 돌아가기
- 고객지원 연락처

## 에러 유형

### 설정 관련

- **Configuration**: 인증 설정 문제

### 접근 관련

- **AccessDenied**: 계정 접근 거부
- **SessionRequired**: 로그인 필요

### OAuth 관련

- **OAuthSignin**: OAuth 로그인 요청 오류
- **OAuthCallback**: OAuth 콜백 오류
- **OAuthCreateAccount**: OAuth 계정 생성 오류
- **OAuthAccountNotLinked**: 계정 연결 오류

### 이메일 관련

- **EmailCreateAccount**: 이메일 계정 생성 오류
- **EmailSignin**: 이메일 로그인 오류

### 기타

- **Verification**: 인증 오류
- **Callback**: 콜백 처리 오류
- **CredentialsSignin**: 로그인 실패

## 기술적 구현

### 에러 조회 및 처리

```typescript
const error = searchParams.get('error');
const errorInfo = getErrorMessage(error);
```

### Suspense 경계

- 서버 사이드를 위한 Suspense 경계
- 로딩 상태 표시

### 사용자 경험

- 중앙 정렬 레이아웃
- 에러 아이콘 및 젼 표시
- CTA 버튼 배치

## 접근성 및 보안

### 접근성

- 명확한 에러 메시지
- 키보드 네비게이션
- 스크린 리더 지원

### 보안

- 에러 정보 노출 최소화
- 민감한 시스템 정보 보호

## 개선 가능 사항

1. **다국어 지원**
   - 에러 메시지 국제화
   - 언어별 맞춤 메시지

2. **에러 로깅**
   - 에러 발생 빈도 추적
   - 에러 패턴 분석

3. **사용자 지원**
   - 라이브 채팅 연동
   - FAQ 링크

## 관련 페이지

- `/auth/signin` - 로그인 페이지
- `/logout` - 로그아웃 페이지
- `/` - 홈페이지
