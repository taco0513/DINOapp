# 로그인 페이지 (/auth/signin)

## 개요

NextAuth.js를 사용하여 Google OAuth 로그인을 제공하는 인증 페이지입니다. DINO 앱의 메인 인증 진입점입니다.

## 주요 기능

### 1. Google OAuth 로그인

- NextAuth.js 통합
- Google 계정을 통한 안전한 로그인
- 자동 계정 생성

### 2. 사용자 경험

- 깨끗한 로그인 UI
- 로딩 상태 표시
- 에러 처리 및 리다이렉트

### 3. 보안 기능

- CSRF 보호
- OAuth 2.0 표준 준수
- 세션 관리

## 기술적 구현

### NextAuth.js 통합

- Google OAuth 프로바이더 설정
- JWT 기반 세션 관리
- 콜백 URL 리다이렉트

### 에러 처리

- 인증 실패 시 `/auth/error`로 리다이렉트
- 에러 코드 기반 메시지 표시

## 접근성 및 보안

### 접근성

- 모바일 최적화
- 키보드 네비게이션
- 스크린 리더 지원

### 보안

- OAuth 2.0 표준
- HTTPS 필수
- 세셈 보안

## 관련 페이지

- `/auth/error` - 인증 에러 페이지
- `/logout` - 로그아웃 페이지
- `/dashboard` - 로그인 후 대시보드
