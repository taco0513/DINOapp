# 개발 환경 설정

## 개요

효율적인 개발을 위한 환경 구축 방법을 다룹니다. 로컬 개발부터 팀 협업까지 모든 단계의 환경 설정을 자동화합니다.

## 로컬 개발 환경

### 자동 환경 설정 스크립트

```bash
#!/bin/bash
# setup-dev-env.sh - 전체 개발 환경 자동 설정

echo "🚀 개발 환경 설정을 시작합니다..."

# 1. 필수 도구 확인 및 설치
echo "📦 필수 도구 확인 중..."

# Node.js 및 Bun 확인
if ! command -v node &> /dev/null; then
    echo "Node.js가 설치되어 있지 않습니다. 설치하기: https://nodejs.org"
    exit 1
fi

# Bun 설치 (빠른 패키지 관리자)
if ! command -v bun &> /dev/null; then
    echo "Bun 설치 중..."
    curl -fsSL https://bun.sh/install | bash
fi

# Git 설정
echo "🔧 Git 설정 중..."
git config --global pull.rebase true
git config --global init.defaultBranch main

# 2. 프로젝트 의존성 설치
echo "📚 의존성 설치 중..."
bun install

# 3. 환경 변수 설정
echo "🔐 환경 변수 설정 중..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "⚠️  .env.local 파일을 생성했습니다. 필요한 값을 입력해주세요."
fi

# 4. 데이터베이스 설정
echo "🗄️  데이터베이스 설정 중..."
npx prisma generate
npx prisma migrate dev

# 5. Git hooks 설정
echo "🪝 Git hooks 설정 중..."
npx husky install

echo "✅ 개발 환경 설정이 완료되었습니다!"
```

### VS Code 설정

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 필수 VS Code 확장

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv",
    "usernamehw.errorlens",
    "aaron-bond.better-comments",
    "wayou.vscode-todo-highlight",
    "github.copilot",
    "eamodio.gitlens"
  ]
}
```

## 컨테이너 기반 개발

### Docker 개발 환경

```dockerfile
# Dockerfile.dev
FROM node:20-alpine AS base

# Bun 설치
RUN npm install -g bun

WORKDIR /app

# 의존성 설치
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 애플리케이션 코드
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 개발 서버 실행
EXPOSE 3000
CMD ["bun", "run", "dev"]
```

### Docker Compose 설정

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 애플리케이션
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
      - redis
    command: bun run dev

  # 데이터베이스
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 캐시
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 메일 테스트 (Mailhog)
  mail:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

volumes:
  postgres_data:
  redis_data:
```

## 환경 변수 관리

### 환경별 설정

```typescript
// src/config/environment.ts
import { z } from 'zod';

// 환경 변수 스키마
const envSchema = z.object({
  // 앱 설정
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().default('3000'),
  APP_URL: z.string().url(),
  
  // 데이터베이스
  DATABASE_URL: z.string(),
  DATABASE_POOL_MIN: z.string().default('2'),
  DATABASE_POOL_MAX: z.string().default('10'),
  
  // 인증
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // 외부 서비스
  STRIPE_SECRET_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // 모니터링
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
});

// 환경 변수 검증 및 로드
export const env = (() => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ 환경 변수 오류:');
    console.error(parsed.error.flatten());
    throw new Error('환경 변수 설정이 올바르지 않습니다.');
  }
  
  return parsed.data;
})();

// 타입 안전 환경 변수 접근
export type Env = z.infer<typeof envSchema>;
```

### .env 템플릿 관리

```bash
# .env.example
# 앱 설정
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# 인증
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars
JWT_EXPIRES_IN=7d

# 외부 서비스 (Optional)
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
OPENAI_API_KEY=

# 모니터링 (Optional)
SENTRY_DSN=
POSTHOG_API_KEY=
```

## 개발 도구 설정

### ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'unused-imports'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 미사용 import 자동 제거
    'unused-imports/no-unused-imports': 'error',
    
    // 일반 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-duplicate-imports': 'error'
  }
};
```

### Prettier 설정

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.js',
};
```

### TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/config/*": ["./src/config/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Git 훅 및 자동화

### Husky 설정

```bash
# Husky 초기화
npx husky-init && npm install

# pre-commit 훅
npx husky add .husky/pre-commit "bun run lint-staged"

# commit-msg 훅
npx husky add .husky/commit-msg "npx commitlint --edit"
```

### Lint-staged 설정

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests'
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

### Commitlint 설정

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새 기능
        'fix',      // 버그 수정
        'docs',     // 문서 변경
        'style',    // 코드 스타일 변경
        'refactor', // 코드 리팩토링
        'perf',     // 성능 개선
        'test',     // 테스트 추가/수정
        'build',    // 빌드 시스템
        'ci',       // CI 설정
        'chore',    // 기타 작업
        'revert'    // 커밋 되돌리기
      ]
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-min-length': [2, 'always', 10],
    'body-max-line-length': [2, 'always', 100]
  }
};
```

## 디버깅 환경

### VS Code 디버깅 설정

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Jest: debug tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--watchAll=false"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 팀 협업 환경

### 공유 개발 환경 설정

```typescript
// scripts/team-setup.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

class TeamEnvironmentSetup {
  async setupForNewMember(memberName: string) {
    console.log(`🎉 ${memberName}님을 위한 환경 설정 시작...`);
    
    // 1. 필수 도구 확인
    this.checkRequiredTools();
    
    // 2. 저장소 클론
    this.cloneRepository();
    
    // 3. 의존성 설치
    this.installDependencies();
    
    // 4. 환경 변수 설정
    this.setupEnvironmentVariables();
    
    // 5. 데이터베이스 초기화
    this.initializeDatabase();
    
    // 6. IDE 설정
    this.configureIDE();
    
    // 7. 팀 규칙 안내
    this.showTeamGuidelines();
    
    console.log('✅ 환경 설정 완료!');
  }
  
  private checkRequiredTools() {
    const tools = [
      { name: 'Node.js', command: 'node --version', minVersion: '18' },
      { name: 'Git', command: 'git --version', minVersion: '2.30' },
      { name: 'Docker', command: 'docker --version', minVersion: '20' },
    ];
    
    tools.forEach(tool => {
      try {
        const version = execSync(tool.command, { encoding: 'utf8' });
        console.log(`✅ ${tool.name}: ${version.trim()}`);
      } catch {
        console.error(`❌ ${tool.name}가 설치되어 있지 않습니다.`);
        process.exit(1);
      }
    });
  }
}
```

### 팀 협업 규칙

```yaml
# .github/CODEOWNERS
# 코드 소유자 설정
* @team-leads

# 프론트엔드
/src/components/ @frontend-team
/src/pages/ @frontend-team
/src/styles/ @frontend-team

# 백엔드
/src/api/ @backend-team
/src/services/ @backend-team
/prisma/ @backend-team

# 인프라
/docker/ @devops-team
/.github/ @devops-team
/scripts/ @devops-team

# 문서
/docs/ @all-developers
README.md @all-developers
```

## SuperClaude 개발 환경 명령어

```bash
# 환경 자동 설정
/setup dev-env --complete --team

# Docker 환경 실행
/docker up --services all --detached

# 환경 변수 검증
/env validate --strict --suggest-fixes

# VS Code 설정 동기화
/sync vscode-settings --team --extensions

# 팀원 온보딩
/onboard new-member --name "John" --role developer

# 의존성 업데이트
/update dependencies --interactive --test

# 환경 문제 진단
/diagnose env --fix-common-issues

# Git hooks 설정
/setup git-hooks --husky --commitlint --lint-staged

# 디버깅 세션 시작
/debug start --full-stack --breakpoints

# 팀 환경 동기화
/sync team-env --branch main --reset-local
```

이 개발 환경 설정 가이드를 통해 모든 팀원이 동일한 환경에서 효율적으로 작업할 수 있습니다.