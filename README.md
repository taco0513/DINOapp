# 🦕 DINO - Digital Nomad Travel Manager

**복잡한 비자 걱정 없이, 오직 여행의 즐거움만 생각할 수 있는** 디지털 노마드 전용 여행 관리 플랫폼

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12-2d3748)](https://prisma.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)

## ✨ 주요 기능

### 🌍 **스마트 여행 추적**
- **78개국 비자 규정** 자동 추적 및 체류 한도 관리
- **14가지 비자 유형** 지원 (관광, 비즈니스, 워킹홀리데이 등)
- **실시간 알림** - 비자 만료, 체류 한도 초과 경고

### 🇪🇺 **셰겐 계산기**
- **90/180일 규칙** 자동 계산 및 시각화
- **미래 여행 계획** - 언제 다시 입국할 수 있는지 정확한 날짜 제공
- **대화형 차트** - 체류 현황을 직관적으로 확인

### 📧 **Google 서비스 통합**
- **Gmail 자동 스캔** - 항공권, 호텔 예약 정보 자동 추출
- **Calendar 동기화** - 여행 일정 양방향 동기화
- **최소 권한** - 필요한 데이터만 안전하게 접근

### 📱 **모바일 최적화**
- **PWA 지원** - 앱처럼 설치하여 사용 가능
- **오프라인 기능** - 인터넷 없이도 기본 기능 사용
- **반응형 디자인** - 모든 기기에서 완벽한 사용자 경험

## 🚀 빠른 시작

> 📚 **전체 가이드**: [개발환경 설정 가이드](docs/development/setup.md) | [사용자 가이드](docs/user/getting-started.md)

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn
- PostgreSQL 15+
- Google OAuth 2.0 앱 등록

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/dinoapp.git
cd dinoapp

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 정보 입력

# 4. 데이터베이스 설정
npx prisma generate
npx prisma migrate dev

# 5. 개발 서버 시작
npm run dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

> 💡 **온보딩**: 첫 방문 시 자동으로 온보딩 플로우가 시작됩니다.

### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 데이터베이스
DATABASE_URL="file:./dev.db"

# 관리자 설정 (쉼표로 구분된 관리자 이메일 목록)
ADMIN_EMAILS="admin@example.com,admin2@example.com"
```

자세한 설정 가이드는 [.env.example](.env.example) 파일을 참조하세요.

## 🏗️ 프로젝트 구조

```
/DINO
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 메인 애플리케이션
│   └── api/               # API Routes
├── components/            # 재사용 가능한 UI 컴포넌트
│   ├── schengen/         # 셰겐 계산기 컴포넌트
│   ├── trips/            # 여행 관리 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트
├── lib/                   # 핵심 비즈니스 로직
│   ├── schengen/         # 셰겐 계산 엔진
│   ├── gmail/            # Gmail API 연동
│   └── security/         # 보안 미들웨어
├── types/                 # TypeScript 타입 정의
├── prisma/               # 데이터베이스 스키마
└── docs/                 # 프로젝트 문서
```

## 🛠️ 사용 가능한 스크립트

```bash
# 개발
npm run dev              # 개발 서버 시작
npm run build           # 프로덕션 빌드
npm run start           # 프로덕션 서버 시작

# 코드 품질
npm run lint            # ESLint 실행
npm run type-check      # TypeScript 타입 체크
npm run check:all       # 모든 품질 검사

# 테스트
npm run test            # 모든 테스트 실행
npm run test:unit       # 단위 테스트
npm run test:integration # 통합 테스트
npm run test:e2e        # E2E 테스트
npm run test:coverage   # 테스트 커버리지

# 데이터베이스
npm run db:generate     # Prisma 클라이언트 생성
npm run db:migrate      # 데이터베이스 마이그레이션
npm run db:studio       # Prisma Studio 실행

# 백업 & 복구
npm run backup:db       # 데이터베이스 백업
npm run backup:files    # 파일 시스템 백업
npm run backup:test-recovery # 복구 테스트

# 배포 & 모니터링
npm run deploy:health-check  # 배포 상태 확인
npm run deploy:monitor      # 배포 모니터링
npm run deploy:rollback     # 긴급 롤백
```

## 📊 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크, App Router 사용
- **TypeScript** - 타입 안전성 및 개발 생산성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Radix UI** - 접근성을 고려한 헤드리스 UI 컴포넌트

### Backend
- **Next.js API Routes** - 서버리스 API 엔드포인트
- **Prisma ORM** - 타입 안전한 데이터베이스 클라이언트
- **NextAuth.js** - 인증 및 세션 관리
- **SQLite/PostgreSQL** - 개발/프로덕션 데이터베이스

### 개발 도구
- **Jest + Testing Library** - 단위 및 통합 테스트
- **Playwright** - E2E 테스트 및 브라우저 자동화
- **ESLint + Prettier** - 코드 품질 및 포맷팅

## 📈 로드맵

### ✅ 완료된 기능
- [x] Google OAuth 인증 시스템
- [x] 여행 기록 CRUD 작업
- [x] 셰겐 90/180일 규칙 계산기
- [x] Gmail 이메일 자동 분석
- [x] PWA 및 오프라인 지원
- [x] 포괄적인 테스트 스위트

### 🚧 개발 중
- [ ] Calendar 양방향 동기화
- [ ] 고급 데이터 시각화
- [ ] 다국어 지원 (i18n)

### 🎯 계획된 기능
- [ ] 모바일 앱 (React Native)
- [ ] 팀 여행 관리
- [ ] 비자 신청 가이드
- [ ] 여행 비용 추적

## 🧪 테스트

프로젝트는 포괄적인 테스트 스위트를 포함합니다:

```bash
# 모든 테스트 실행
npm run test:all

# 특정 테스트 실행
npm run test:unit        # 단위 테스트
npm run test:integration # 통합 테스트  
npm run test:e2e         # E2E 테스트

# 테스트 커버리지 확인
npm run test:coverage
```

현재 테스트 커버리지: **484개 테스트**, 11개 테스트 파일

## 🔒 보안

DINO는 사용자 데이터 보안을 최우선으로 합니다:

- **최소 권한 원칙** - 필요한 Google API 권한만 요청
- **데이터 암호화** - AES-256 암호화로 민감한 정보 보호
- **CSRF 보호** - 모든 폼에 CSRF 토큰 적용
- **보안 헤더** - CSP, HSTS 등 다층 보안 설정
- **정기적인 보안 감사** - 의존성 취약점 모니터링

## 📝 기여하기

DINO 프로젝트에 기여해주셔서 감사합니다! 

### 개발 환경 설정
1. 저장소를 포크하고 클론합니다
2. 의존성을 설치합니다: `npm install`
3. 환경 변수를 설정합니다: `cp .env.example .env.local`
4. 데이터베이스를 설정합니다: `npm run db:push`

### 코드 기여 가이드라인
- TypeScript strict 모드 사용
- 모든 새 기능에 테스트 추가
- ESLint 및 Prettier 규칙 준수
- 의미있는 커밋 메시지 작성

자세한 내용은 [CLAUDE.md](CLAUDE.md)를 참조하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 훌륭한 React 프레임워크
- [Vercel](https://vercel.com/) - 간편한 배포 플랫폼  
- [Prisma](https://prisma.io/) - 개발자 친화적인 ORM
- [Google APIs](https://developers.google.com/) - Gmail/Calendar 통합

---

**🌍 복잡한 비자 걱정 없이, 오직 여행의 즐거움만 생각하세요!**

문의사항이나 버그 신고는 [이슈](https://github.com/yourusername/dinoapp/issues)를 통해 알려주세요.