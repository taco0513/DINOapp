# PROJECT_CONTEXT.md - DINO 프로젝트 컨텍스트

## 📋 프로젝트 개요

**프로젝트명**: DINO (Digital Nomad Travel Manager)  
**시작일**: 2024년 1월  
**현재 단계**: MVP 완성, 베타 테스트 준비  
**목표 사용자**: 디지털 노마드, 장기 여행자, 원격 근무자

## 🎯 비즈니스 목표

### 핵심 문제 해결

1. **비자 관리의 복잡성**: 여러 국가의 비자 규정을 수동으로 추적하는 어려움
2. **셰겐 규칙 계산**: 90/180일 규칙을 머릿속으로 계산하는 불편함
3. **여행 정보 분산**: 이메일, 캘린더, 문서에 흩어진 여행 정보

### 가치 제안

- ✅ 자동화된 비자 추적으로 오버스테이 방지
- ✅ 정확한 셰겐 계산으로 안심하고 여행
- ✅ Gmail 통합으로 여행 정보 자동 수집
- ✅ 모바일 최적화로 언제 어디서나 확인

## 🏛️ 기술 아키텍처

### 아키텍처 결정 사항

#### 1. **Next.js App Router 선택 이유**

- SEO 최적화 필요
- 서버 컴포넌트로 초기 로딩 속도 개선
- API Routes로 백엔드 통합 간소화
- Vercel 배포 최적화

#### 2. **SQLite → PostgreSQL 전환 계획**

- 개발: SQLite (간단한 설정)
- 프로덕션: PostgreSQL (확장성, 동시성)
- Prisma ORM으로 전환 용이

#### 3. **Google OAuth 전용 인증**

- 타겟 사용자 대부분 Gmail 사용
- Gmail API 통합 위해 필수
- 소셜 로그인으로 가입 장벽 최소화

#### 4. **PWA 우선 접근**

- 앱스토어 배포 없이 앱 경험 제공
- 오프라인 기능으로 해외 여행 시 유용
- 설치 가능한 웹앱으로 사용자 리텐션 향상

### 기술 스택 선택 근거

**Frontend**

- TypeScript: 타입 안전성으로 버그 감소
- Tailwind CSS: 빠른 프로토타이핑과 일관된 디자인
- iOS Components: 친숙한 모바일 UX 제공

**Backend**

- Prisma: 타입 안전한 데이터베이스 접근
- NextAuth: 검증된 인증 솔루션
- Node.js: JavaScript 풀스택 개발

**인프라**

- Vercel: Next.js 최적화 배포
- GitHub Actions: CI/CD 자동화
- Sentry: 에러 모니터링

## 📊 데이터 모델

### 핵심 엔티티

1. **User**: 사용자 정보 및 설정
2. **Trip**: 여행 기록 (국가, 날짜, 비자 타입)
3. **Country**: 국가별 비자 규정
4. **VisaRequirement**: 국적별 비자 요구사항
5. **EmailSync**: Gmail 동기화 기록

### 데이터 흐름

```
Gmail API → Email Parser → Trip Creator → Database → UI
     ↓                                          ↑
Calendar API ← → Sync Service ← → Notification System
```

## 🚀 개발 로드맵

### ✅ Phase 1: MVP (완료)

- [x] 기본 여행 CRUD
- [x] 셰겐 계산기
- [x] Google 인증
- [x] 기본 UI/UX

### 🔄 Phase 2: Gmail 통합 (진행중)

- [x] Gmail API 연동
- [x] 이메일 파싱
- [ ] 자동 여행 생성
- [ ] 실시간 동기화

### 📅 Phase 3: 고급 기능

- [ ] Calendar 양방향 동기화
- [ ] 비자 알림 시스템
- [ ] 여행 통계 대시보드
- [ ] 다국어 지원

### 🎯 Phase 4: 확장

- [ ] 팀/가족 여행 관리
- [ ] 비자 신청 가이드
- [ ] 여행 비용 추적
- [ ] 커뮤니티 기능

## 💡 핵심 기능 상세

### 1. 셰겐 계산기

- **알고리즘**: 180일 슬라이딩 윈도우
- **정확도**: 입국/출국 시간 단위 계산
- **시각화**: 차트로 남은 일수 표시
- **예측**: 미래 여행 가능 날짜 계산

### 2. Gmail 통합

- **권한**: 읽기 전용, 여행 관련 이메일만
- **파싱**: 항공권, 호텔, 비자 정보 추출
- **보안**: 토큰 암호화, 자동 만료
- **프라이버시**: 처리 후 즉시 삭제

### 3. 비자 추적

- **데이터**: 78개국 비자 규정
- **업데이트**: 월 1회 수동 검증
- **알림**: 만료 30/14/7일 전 알림
- **정확도**: 공식 정부 사이트 기준

## 🔒 보안 고려사항

### 데이터 보호

- 민감 정보 AES-256 암호화
- HTTPS 전용 통신
- 세션 타임아웃 설정
- CSRF 토큰 적용

### 프라이버시

- 최소 권한 원칙
- 개인정보 처리 최소화
- 사용자 데이터 삭제 권한
- GDPR 준수 (향후)

## 📈 성공 지표

### 기술적 KPI

- 페이지 로드 시간 < 3초
- Lighthouse 점수 > 90
- 테스트 커버리지 > 80%
- 월 다운타임 < 1시간

### 비즈니스 KPI

- MAU (Monthly Active Users)
- 여행 기록 생성 수
- Gmail 연동 사용자 비율
- 사용자 리텐션 (30일)

## 🤝 팀 & 역할

### 현재 팀 구성

- **개발**: 1명 (풀스택)
- **디자인**: AI 지원 (Claude)
- **QA**: 자동화 테스트 + AI

### 협업 도구

- GitHub: 코드 관리
- Linear: 이슈 트래킹
- Figma: 디자인 (향후)
- Slack: 커뮤니케이션 (향후)

## 📝 개발 규칙

### 코드 스타일

- ESLint + Prettier 설정 준수
- TypeScript strict 모드
- 함수형 프로그래밍 선호
- 명확한 변수명 사용

### Git 컨벤션

- Conventional Commits 사용
- PR 전 코드 리뷰 필수
- 기능별 브랜치 전략
- 메인 브랜치 보호

### 테스트 전략

- TDD 권장
- 단위 테스트 필수
- E2E 주요 플로우 커버
- 시각적 회귀 테스트

## 🔍 기술 부채

### 현재 인식된 부채

1. 타입 정의 일부 누락
2. 에러 핸들링 개선 필요
3. 성능 최적화 미완
4. 문서화 부족

### 해결 계획

- 매 스프린트 20% 기술 부채 할당
- 리팩토링 데이 운영
- 코드 리뷰 강화
- 자동화 도구 도입

## 💭 향후 고려사항

### 기술적 고려

- React Native 모바일 앱
- 실시간 동기화 (WebSocket)
- AI 기반 여행 추천
- 블록체인 비자 검증 (장기)

### 비즈니스 고려

- 수익 모델 (프리미엄 기능)
- B2B 확장 (기업 출장)
- 파트너십 (비자 대행사)
- 글로벌 확장 전략

---

**Last Updated**: 2024-01-30  
**Next Review**: 2024-02-15
