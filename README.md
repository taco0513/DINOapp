# 🦕 DINO v3.0 - Dashboard Platform

> Real-time dashboard application for digital nomads

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ v3.0 New Features

### 🔄 Real-time Dashboard
- **Live Data Updates**: WebSocket-powered real-time information
- **Interactive Widgets**: Customizable dashboard components
- **Smart Insights**: AI-powered travel recommendations
- **Real-time Alerts**: Instant notifications for important events

### 🎨 Customizable Widget System  
- **Drag & Drop**: Rearrange dashboard widgets freely
- **Widget Library**: Choose from 15+ specialized widgets
- **Personal Layouts**: Save and switch between custom layouts
- **Responsive Design**: Optimal experience on all devices

### 📱 PWA with Offline Support
- **Progressive Enhancement**: Works seamlessly offline
- **Push Notifications**: Stay informed even when closed
- **Home Screen Install**: Native app-like experience
- **Background Sync**: Automatic data synchronization

### ⚡ Lightning-fast Interactions
- **<100ms Response**: Instant UI feedback
- **Optimistic Updates**: Immediate visual responses
- **Smart Caching**: Reduced loading times
- **Parallel Processing**: Efficient data handling

### 🧮 Advanced Analytics
- **Travel Patterns**: Comprehensive travel behavior analysis
- **Predictive Insights**: Forecast travel needs and compliance
- **Visual Reports**: Beautiful charts and interactive maps
- **Export Options**: PDF reports and data export

## 📈 Version History
- **v3.0** (In Development): Dashboard Platform
- **v2.0** (Archived): Travel Management Tools
- **v1.0** (Legacy): Basic Visa Checker

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.17 이상
- npm 또는 bun (권장)

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/dino-v2.git
cd dino-v2
```

2. 의존성 설치
```bash
# npm 사용
npm install

# 또는 bun 사용 (더 빠름)
bun install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

필수 환경 변수:
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

4. 데이터베이스 설정
```bash
# Prisma 마이그레이션 실행
npx prisma generate
npx prisma db push
```

5. 개발 서버 실행
```bash
npm run dev
# 또는
bun dev
```

http://localhost:3000 에서 확인하세요

## 📱 PWA 설치

DINO는 Progressive Web App으로 설치 가능합니다:
1. Chrome/Edge에서 사이트 방문
2. 주소창의 설치 아이콘 클릭
3. "설치" 클릭

## 🛠️ 기술 스택

### Frontend
- **Next.js 14**: App Router, Server Components
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **React Hook Form**: 폼 관리
- **Chart.js**: 데이터 시각화

### Backend
- **Next.js API Routes**: RESTful API
- **Prisma ORM**: 데이터베이스 관리
- **NextAuth.js**: 인증 시스템
- **SQLite** (개발) / **PostgreSQL** (프로덕션)

### 개발 도구
- **ESLint & Prettier**: 코드 품질
- **Jest & Playwright**: 테스트
- **TypeScript Strict Mode**: 타입 안전성

## 📚 API 문서

### 인증
```bash
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

### 비자 체크
```bash
# 비자 요구사항 확인
GET  /api/visa/check?passport=KR&destination=US
POST /api/visa/check
```

### 샹겐 계산
```bash
# 샹겐 체류 일수 계산
POST /api/schengen
```

### 여행 관리
```bash
# 여행 기록 CRUD
GET    /api/trips
POST   /api/trips
PUT    /api/trips/:id
DELETE /api/trips/:id
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 📦 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **Project Lead**: AI-Driven Development with Claude
- **Design**: Zero Technical Debt Principle
- **Architecture**: Clean Code & SOLID Principles

## 📞 문의

- 이슈: [GitHub Issues](https://github.com/yourusername/dino-v2/issues)
- 이메일: contact@dino-travel.com

---

**DINO v2.0** - 스마트한 여행의 시작 🦕