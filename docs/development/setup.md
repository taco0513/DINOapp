# 개발 환경 설정 가이드

DINOapp 개발을 위한 완전한 개발 환경 설정 가이드입니다.

## 📋 필수 요구사항

### 시스템 요구사항
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상 (또는 yarn, pnpm)
- **PostgreSQL**: 15.x 이상
- **Git**: 2.30 이상

### 필수 계정
- **Google Cloud Console**: Gmail, Calendar API 사용
- **Vercel**: 배포용 (선택사항)

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/dinoapp.git
cd dinoapp
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 환경 변수를 설정하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/dinoapp"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (선택사항)
OPENAI_API_KEY="your-openai-api-key"
```

### 4. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 시드 데이터 삽입 (선택사항)
npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🛠️ 개발 도구 설정

### VSCode 설정

권장 확장 프로그램:
- **TypeScript**: TypeScript 지원
- **Prisma**: 데이터베이스 스키마 하이라이팅
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Tailwind CSS IntelliSense**: Tailwind 자동완성

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Git 훅 설정

프로젝트는 Husky를 사용한 Git 훅이 설정되어 있습니다:

```bash
npm run prepare
```

커밋 전 자동으로 실행되는 검사:
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Type Check**: TypeScript 타입 검사

## 📁 프로젝트 구조

```
dinoapp/
├── app/                    # Next.js 13 App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── api/               # API 라우트
│   ├── dashboard/         # 대시보드 페이지
│   └── globals.css        # 글로벌 스타일
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   └── features/          # 기능별 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts            # NextAuth 설정
│   ├── db.ts              # Prisma 클라이언트
│   └── utils.ts           # 공통 유틸리티
├── hooks/                 # React 커스텀 훅
├── types/                 # TypeScript 타입 정의
├── prisma/                # 데이터베이스 스키마
├── docs/                  # 문서
└── scripts/               # 유틸리티 스크립트
```

## 🧪 테스트 실행

### 단위 테스트
```bash
npm run test
npm run test:watch     # watch 모드
npm run test:coverage  # 커버리지 포함
```

### E2E 테스트
```bash
npm run test:e2e
npm run test:e2e:ui    # UI 모드
```

### 전체 테스트
```bash
npm run test:all
```

## 🔍 코드 품질 검사

### 린트 검사
```bash
npm run lint
npm run lint:fix       # 자동 수정
```

### 타입 검사
```bash
npm run type-check
```

### 전체 검사
```bash
npm run check:all
```

## 🚀 빌드 및 배포

### 개발 빌드
```bash
npm run build
npm run start          # 프로덕션 모드로 실행
```

### 배포
```bash
npm run deploy         # Vercel 배포
```

## 🐛 문제 해결

### 자주 발생하는 문제

#### 1. 데이터베이스 연결 오류
```bash
# PostgreSQL 서비스 상태 확인
sudo service postgresql status

# 데이터베이스 재시작
sudo service postgresql restart
```

#### 2. Node.js 버전 불일치
```bash
# nvm 사용 (권장)
nvm use 18
nvm install 18.x.x
```

#### 3. 패키지 설치 오류
```bash
# 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma 스키마 동기화 오류
```bash
# 스키마 재설정
npx prisma migrate reset
npx prisma generate
```

## 📞 도움 요청

문제가 해결되지 않는 경우:

1. **GitHub Issues**: 버그 리포트 및 기능 요청
2. **팀 채널**: 내부 개발팀 문의
3. **문서**: 추가 문서는 `docs/` 폴더 참조

## 🔄 개발 워크플로우

### 기능 개발 프로세스
1. **브랜치 생성**: `git checkout -b feature/your-feature`
2. **개발 및 테스트**: 기능 구현 및 테스트 작성
3. **코드 검토**: 자동 품질 검사 통과 확인
4. **풀 리퀘스트**: 코드 리뷰 요청
5. **배포**: 승인 후 메인 브랜치 병합

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 과정 또는 보조 도구 변경
```

---

**다음 문서**: [API 문서](../api/README.md) | [아키텍처 가이드](./architecture.md)