# 빠른 시작 템플릿

## 개요

프로젝트 유형별로 최적화된 템플릿과 보일러플레이트 코드를 제공합니다. 30분 안에 작동하는 프로토타입을 만들 수 있도록 설계되었습니다.

## 웹 애플리케이션 템플릿

### Next.js 풀스택 템플릿

```bash
# 기본 Next.js 프로젝트 생성
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd my-app

# 필수 패키지 설치
npm install prisma @prisma/client next-auth \
  @next-auth/prisma-adapter \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-query axios \
  lucide-react clsx tailwind-merge

# 개발 도구 설치
npm install -D @types/node prettier prettier-plugin-tailwindcss
```

#### 프로젝트 구조

```typescript
// src/lib/project-structure.ts
export const projectStructure = {
  src: {
    app: {
      api: {
        auth: ["[...nextauth]/route.ts"],
        users: ["route.ts", "[id]/route.ts"],
        posts: ["route.ts", "[id]/route.ts"]
      },
      "(auth)": {
        login: ["page.tsx", "layout.tsx"],
        register: ["page.tsx"],
        "forgot-password": ["page.tsx"]
      },
      "(dashboard)": {
        dashboard: ["page.tsx", "layout.tsx"],
        profile: ["page.tsx"],
        settings: ["page.tsx"]
      },
      layout: ["page.tsx", "error.tsx", "loading.tsx", "not-found.tsx"]
    },
    components: {
      ui: ["button.tsx", "input.tsx", "card.tsx", "dialog.tsx"],
      forms: ["login-form.tsx", "register-form.tsx", "user-form.tsx"],
      layouts: ["header.tsx", "footer.tsx", "sidebar.tsx", "nav.tsx"]
    },
    lib: {
      api: ["client.ts", "errors.ts"],
      auth: ["config.ts", "session.ts"],
      db: ["prisma.ts", "queries.ts"],
      utils: ["cn.ts", "validators.ts", "formatters.ts"]
    },
    hooks: ["use-auth.ts", "use-user.ts", "use-toast.ts"],
    types: ["index.d.ts", "api.d.ts", "db.d.ts"],
    config: ["site.ts", "navigation.ts"]
  },
  prisma: ["schema.prisma", "seed.ts"],
  public: ["favicon.ico", "images/", "fonts/"]
};
```

#### 환경 변수 템플릿

```bash
# .env.local
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@myapp.com"

# External APIs
OPENAI_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Analytics (optional)
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
```

### SaaS 스타터 템플릿

```typescript
// src/templates/saas-starter.ts
import { createProject } from '@/lib/project-generator';

export const saasTemplate = {
  name: "SaaS Starter",
  description: "Production-ready SaaS with auth, billing, and dashboard",

  features: [
    "Multi-tenant architecture",
    "Stripe subscription billing",
    "Role-based access control",
    "Admin dashboard",
    "Email notifications",
    "API rate limiting",
    "Webhook handling"
  ],

  structure: {
    // 인증 및 온보딩
    auth: {
      components: ["SignInForm", "SignUpForm", "OAuthButtons", "MagicLink"],
      pages: ["signin", "signup", "verify-email", "onboarding"],
      api: ["auth/[...nextauth]", "auth/magic-link", "auth/verify"]
    },

    // 결제 시스템
    billing: {
      components: ["PricingTable", "CheckoutForm", "BillingPortal"],
      pages: ["pricing", "checkout", "billing"],
      api: ["stripe/webhook", "stripe/checkout", "stripe/portal"]
    },

    // 대시보드
    dashboard: {
      components: ["StatsCard", "UsageChart", "ActivityFeed"],
      pages: ["dashboard", "analytics", "team", "settings"],
      api: ["stats", "usage", "team/invite", "team/members"]
    },

    // 관리자 패널
    admin: {
      components: ["UserTable", "SubscriptionManager", "SystemHealth"],
      pages: ["admin/users", "admin/subscriptions", "admin/logs"],
      api: ["admin/users", "admin/metrics", "admin/system"]
    }
  },

  dependencies: {
    core: [
      "next@14", "react@18", "typescript@5",
      "tailwindcss@3", "@prisma/client@5"
    ],
    auth: [
      "next-auth@4", "@next-auth/prisma-adapter",
      "bcryptjs", "jsonwebtoken"
    ],
    billing: [
      "stripe@14", "@stripe/stripe-js",
      "react-stripe-js"
    ],
    ui: [
      "@radix-ui/react-*", "lucide-react",
      "react-hook-form", "zod"
    ],
    utils: [
      "date-fns", "clsx", "tailwind-merge",
      "@tanstack/react-query", "axios"
    ]
  }
};
```

## 모바일 앱 템플릿

### React Native (Expo) 템플릿

```bash
# Expo 프로젝트 생성
npx create-expo-app MyMobileApp --template blank-typescript
cd MyMobileApp

# 필수 패키지 설치
npx expo install \
  expo-router \
  expo-auth-session expo-crypto \
  @react-navigation/native @react-navigation/stack \
  react-native-safe-area-context react-native-screens \
  expo-secure-store \
  react-native-gesture-handler \
  react-native-reanimated

# UI 및 상태 관리
npm install \
  nativewind \
  zustand \
  @tanstack/react-query \
  react-hook-form
```

#### 앱 구조

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/auth';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Flutter 템플릿

```bash
# Flutter 프로젝트 생성
flutter create my_app --org com.example --platforms ios,android
cd my_app

# 의존성 추가 (pubspec.yaml)
dependencies:
  flutter:
    sdk: flutter
  # 상태 관리
  provider: ^6.0.0
  riverpod: ^2.4.0
  # 네트워킹
  dio: ^5.3.0
  retrofit: ^4.0.0
  # 로컬 저장소
  shared_preferences: ^2.2.0
  hive: ^2.2.0
  # UI
  flutter_screenutil: ^5.9.0
  cached_network_image: ^3.3.0
  # 라우팅
  go_router: ^12.0.0

# 패키지 설치
flutter pub get
```

## AI/ML 프로젝트 템플릿

### AI 챗봇 템플릿

```typescript
// src/templates/ai-chatbot.ts
export const aiChatbotTemplate = {
  name: "AI Chatbot",
  stack: ["Next.js", "OpenAI", "Vercel AI SDK", "Prisma"],

  structure: {
    api: {
      chat: {
        "route.ts": `
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const stream = OpenAIStream(response, {
    onStart: async () => {
      // 대화 시작 로깅
    },
    onToken: async (token) => {
      // 토큰별 처리
    },
    onCompletion: async (completion) => {
      // 대화 저장
      await saveConversation(messages, completion);
    },
  });

  return new StreamingTextResponse(stream);
}
        `
      },
      embeddings: {
        "route.ts": `
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';

export async function POST(req: Request) {
  const { text, namespace } = await req.json();

  // 임베딩 생성
  const embeddings = new OpenAIEmbeddings();
  const vectors = await embeddings.embedQuery(text);

  // 벡터 DB에 저장
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENV!,
  });

  const index = pinecone.Index('knowledge-base');
  await index.upsert({
    vectors: [{
      id: generateId(),
      values: vectors,
      metadata: { text, namespace }
    }]
  });

  return Response.json({ success: true });
}
        `
      }
    },

    components: {
      chat: {
        "ChatInterface.tsx": `
'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageList } from './MessageList';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            전송
          </Button>
        </div>
      </form>
    </div>
  );
}
        `
      }
    }
  }
};
```

## API 서버 템플릿

### Express.js API 템플릿

```typescript
// server-template/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes/api';

const app = express();
const prisma = new PrismaClient();

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: 'Too many requests from this IP',
});
app.use('/api', limiter);

// 라우트
app.use('/api/auth', authRouter);
app.use('/api/v1', apiRouter);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 에러 핸들링
app.use(errorHandler);

// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### FastAPI 템플릿 (Python)

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from database import get_db, engine
from models import Base
from schemas import UserCreate, User
from auth import get_current_user, create_access_token
import crud

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="My API",
    description="Production-ready API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.post("/auth/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

## CLI 도구 템플릿

### Node.js CLI 템플릿

```typescript
// cli-template/src/index.ts
#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { version } from '../package.json';

const program = new Command();

program
  .name('mycli')
  .description('My awesome CLI tool')
  .version(version);

// 초기화 명령어
program
  .command('init')
  .description('Initialize a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(async (options) => {
    const spinner = ora('Initializing project...').start();

    try {
      // 프로젝트 이름 묻기
      if (!options.name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is your project name?',
            default: 'my-project',
          },
        ]);
        options.name = answers.name;
      }

      // 프로젝트 생성 로직
      await createProject(options);

      spinner.succeed(chalk.green('Project initialized successfully!'));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(chalk.gray(`  cd ${options.name}`));
      console.log(chalk.gray(`  npm install`));
      console.log(chalk.gray(`  npm run dev`));

    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize project'));
      console.error(error);
      process.exit(1);
    }
  });

// 빌드 명령어
program
  .command('build')
  .description('Build the project')
  .option('-p, --production', 'Production build')
  .action(async (options) => {
    const spinner = ora('Building project...').start();

    try {
      await buildProject(options);
      spinner.succeed(chalk.green('Build completed!'));
    } catch (error) {
      spinner.fail(chalk.red('Build failed'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
```

## 마이크로서비스 템플릿

### Docker Compose 기반 템플릿

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AUTH_SERVICE_URL=http://auth:4001
      - USER_SERVICE_URL=http://users:4002
      - PRODUCT_SERVICE_URL=http://products:4003
    depends_on:
      - auth
      - users
      - products
    networks:
      - app-network

  # 인증 서비스
  auth:
    build: ./services/auth
    environment:
      - DATABASE_URL=postgresql://user:pass@auth-db:5432/auth
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - auth-db
      - redis
    networks:
      - app-network

  # 사용자 서비스
  users:
    build: ./services/users
    environment:
      - DATABASE_URL=postgresql://user:pass@users-db:5432/users
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - users-db
      - kafka
    networks:
      - app-network

  # 상품 서비스
  products:
    build: ./services/products
    environment:
      - DATABASE_URL=postgresql://user:pass@products-db:5432/products
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      - products-db
      - elasticsearch
    networks:
      - app-network

  # 데이터베이스들
  auth-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=auth
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - auth-db-data:/var/lib/postgresql/data
    networks:
      - app-network

  users-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=users
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - users-db-data:/var/lib/postgresql/data
    networks:
      - app-network

  products-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=products
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - products-db-data:/var/lib/postgresql/data
    networks:
      - app-network

  # 캐시 및 메시지 큐
  redis:
    image: redis:7-alpine
    networks:
      - app-network

  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    depends_on:
      - zookeeper
    networks:
      - app-network

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
    networks:
      - app-network

  # 검색 엔진
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  auth-db-data:
  users-db-data:
  products-db-data:
```

## SuperClaude 빠른 시작 명령어

```bash
# 프로젝트 생성
/create-project --type webapp --stack nextjs --features "auth,db,api"

# 템플릿 적용
/apply-template saas --customize "billing,admin-panel"

# 모바일 앱 생성
/create-mobile --platform "react-native" --features "auth,push,offline"

# API 서버 생성
/create-api --framework express --features "auth,rate-limit,swagger"

# 마이크로서비스 설정
/setup-microservices --services "auth,users,products" --infra "docker,k8s"

# CLI 도구 생성
/create-cli --name mycli --commands "init,build,deploy"

# 풀스택 프로젝트
/fullstack-setup --frontend nextjs --backend express --db postgres

# AI 프로젝트
/ai-project --type chatbot --model gpt-4 --features "rag,memory"

# 템플릿 커스터마이징
/customize-template @current --add-features "analytics,monitoring"

# 빠른 배포
/quick-deploy --platform vercel --env-setup --domain-config
```

## 프로젝트별 초기 설정 스크립트

### 자동 설정 스크립트

```bash
#!/bin/bash
# setup.sh - 프로젝트 자동 설정 스크립트

echo "🚀 프로젝트 설정을 시작합니다..."

# 프로젝트 타입 선택
echo "프로젝트 타입을 선택하세요:"
echo "1) 웹 애플리케이션 (Next.js)"
echo "2) 모바일 앱 (React Native)"
echo "3) API 서버 (Express)"
echo "4) 풀스택 (Next.js + API)"
read -p "선택 (1-4): " PROJECT_TYPE

# 프로젝트 이름 입력
read -p "프로젝트 이름: " PROJECT_NAME

# 프로젝트 생성 및 설정
case $PROJECT_TYPE in
  1)
    npx create-next-app@latest $PROJECT_NAME --typescript --tailwind --eslint --app
    cd $PROJECT_NAME
    npm install prisma @prisma/client next-auth
    npx prisma init
    ;;
  2)
    npx create-expo-app $PROJECT_NAME --template blank-typescript
    cd $PROJECT_NAME
    npx expo install expo-router react-native-safe-area-context
    ;;
  3)
    mkdir $PROJECT_NAME && cd $PROJECT_NAME
    npm init -y
    npm install express cors helmet morgan
    npm install -D typescript @types/node @types/express nodemon
    ;;
  4)
    # 풀스택 설정
    mkdir $PROJECT_NAME && cd $PROJECT_NAME
    mkdir frontend backend
    # Frontend 설정
    cd frontend
    npx create-next-app@latest . --typescript --tailwind --eslint --app
    cd ../backend
    npm init -y
    npm install express cors prisma @prisma/client
    cd ..
    ;;
esac

# Git 초기화
git init
git add .
git commit -m "Initial commit"

echo "✅ 프로젝트 설정이 완료되었습니다!"
echo "📁 cd $PROJECT_NAME"
echo "🚀 npm run dev"
```

이 템플릿들을 사용하면 다양한 프로젝트 타입에 대해 빠르게 시작할 수 있으며, SuperClaude 명령어를 통해 추가적인 커스터마이징도 쉽게 할 수 있습니다.