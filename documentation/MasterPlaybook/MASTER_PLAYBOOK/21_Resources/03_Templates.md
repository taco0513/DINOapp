# 📋 즉시 사용 템플릿

바로 복사해서 사용할 수 있는 템플릿 모음입니다.

## 🚀 프로젝트 시작 템플릿

### Next.js + TypeScript + Tailwind

```bash
# 프로젝트 생성
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# SuperClaude 설정
/setup-project "Next.js SaaS" --framework nextjs --ui tailwind
```

### React + Vite + TypeScript

```bash
# 프로젝트 생성
npm create vite@latest my-app -- --template react-ts

# 개발 환경 설정
/setup-dev-env --fast --modern
```

## 📝 문서 템플릿

### README.md 템플릿

```markdown
# 프로젝트 이름

## 🎯 개요

[프로젝트 설명]

## 🚀 빠른 시작

\`\`\`bash
git clone [repo-url]
cd [project-name]
npm install
npm run dev
\`\`\`

## 📚 기능

- [ ] 기능 1
- [ ] 기능 2
- [ ] 기능 3

## 🛠️ 기술 스택

- Frontend: React/Next.js
- Backend: Node.js
- Database: PostgreSQL
- Styling: Tailwind CSS

## 📞 문의

- Email: [email]
- GitHub: [github-url]
```

### API 문서 템플릿

```markdown
# API 문서

## 인증

\`\`\`http
Authorization: Bearer [token]
\`\`\`

## 엔드포인트

### GET /api/users

사용자 목록 조회

**Response:**
\`\`\`json
{
"users": [
{
"id": 1,
"name": "홍길동",
"email": "hong@example.com"
}
]
}
\`\`\`
```

## 🎨 컴포넌트 템플릿

### React 컴포넌트

```tsx
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const Component: React.FC<Props> = ({ title, children }) => {
  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>{title}</h2>
      {children}
    </div>
  );
};
```

### API 핸들러 (Next.js)

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 로직 구현
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 🔧 설정 파일 템플릿

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },
  },
  plugins: [],
};
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## 📊 데이터베이스 스키마

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 배포 설정

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Vercel vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```
