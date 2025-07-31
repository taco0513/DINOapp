import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CodeGenerationRequest {
  prompt: string;
  type: 'component' | 'api' | 'database' | 'test' | 'config';
  framework: string;
  includeTests: boolean;
  includeDocs: boolean;
}

interface GeneratedCode {
  id: string;
  type: string;
  name: string;
  description: string;
  code: string;
  language: string;
  framework?: string;
  dependencies?: string[];
  testCode?: string;
  documentation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CodeGenerationRequest = await request.json();
    const generatedCode = await generateCode(body);

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}

async function generateCode(
  request: CodeGenerationRequest
): Promise<GeneratedCode> {
  // AI 코드 생성 시뮬레이션 - 향후 실제 AI 서비스로 교체 예정
  // TODO: OpenAI Codex, GitHub Copilot API, 또는 기타 코드 생성 AI 연동
  const { prompt, type, framework, includeTests, includeDocs } = request;

  // 타입별 코드 생성
  switch (type) {
    case 'component':
      return generateComponentCode(
        prompt,
        framework,
        includeTests,
        includeDocs
      );
    case 'api':
      return generateAPICode(prompt, framework, includeTests, includeDocs);
    case 'database':
      return generateDatabaseCode(prompt, framework, includeTests, includeDocs);
    case 'test':
      return generateTestCode(prompt, framework);
    default:
      return generateConfigCode(prompt, framework);
  }
}

function generateComponentCode(
  _prompt: string,
  _framework: string,
  _includeTests: boolean,
  _includeDocs: boolean
): GeneratedCode {
  const componentName = 'UserProfileCard';

  const code = `import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    followers: number;
    following: number;
    bio?: string;
    isFollowing?: boolean;
  };
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export default function UserProfileCard({ 
  user, 
  onFollow, 
  onUnfollow 
}: UserProfileCardProps) {
  const handleFollowClick = () => {
    if (user.isFollowing) {
      onUnfollow?.(user.id);
    } else {
      onFollow?.(user.id);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button 
          onClick={handleFollowClick}
          variant={user.isFollowing ? "outline" : "default"}
        >
          {user.isFollowing ? '언팔로우' : '팔로우'}
        </Button>
      </CardHeader>
      <CardContent>
        {user.bio && (
          <p className="text-sm mb-4">{user.bio}</p>
        )}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.followers}</div>
            <p className="text-sm text-muted-foreground">팔로워</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.following}</div>
            <p className="text-sm text-muted-foreground">팔로잉</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}`;

  const testCode = _includeTests
    ? `import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileCard from './UserProfileCard';

describe('UserProfileCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    followers: 150,
    following: 75,
    bio: 'Software Developer',
    isFollowing: false
  };

  it('renders user information correctly', () => {
    render(<UserProfileCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('calls onFollow when follow button is clicked', () => {
    const mockOnFollow = jest.fn();
    render(
      <UserProfileCard 
        user={mockUser} 
        onFollow={mockOnFollow}
      />
    );
    
    fireEvent.click(screen.getByText('팔로우'));
    expect(mockOnFollow).toHaveBeenCalledWith('1');
  });
});`
    : undefined;

  const documentation = _includeDocs
    ? `
# UserProfileCard 컴포넌트

## 개요
사용자 프로필 정보를 표시하는 카드 컴포넌트입니다.

## Props

| Prop | Type | Description |
|------|------|-------------|
| user | UserProfile | 표시할 사용자 정보 |
| onFollow | (userId: string) => void | 팔로우 버튼 클릭 핸들러 |
| onUnfollow | (userId: string) => void | 언팔로우 버튼 클릭 핸들러 |

## 사용 예시

\`\`\`tsx
<UserProfileCard 
  user={userInfo}
  onFollow={handleFollow}
  onUnfollow={handleUnfollow}
/>
\`\`\`
`
    : undefined;

  return {
    id: `comp_${Date.now()}`,
    type: 'component',
    name: componentName,
    description:
      '사용자 프로필을 표시하는 카드 컴포넌트 - 아바타, 이름, 이메일, 팔로워/팔로잉 수 표시',
    code,
    language: 'typescript',
    framework: _framework,
    dependencies: ['@radix-ui/react-avatar', '@radix-ui/react-button'],
    testCode,
    documentation,
  };
}

function generateAPICode(
  _prompt: string,
  _framework: string,
  _includeTests: boolean,
  _includeDocs: boolean
): GeneratedCode {
  const code = `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users - 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - 새 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    // 입력 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 중복 이메일 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}`;

  return {
    id: `api_${Date.now()}`,
    type: 'api',
    name: 'users-api',
    description:
      'RESTful API - 사용자 CRUD 엔드포인트, JWT 인증, 페이지네이션 포함',
    code,
    language: 'typescript',
    framework: _framework,
    dependencies: ['bcryptjs', '@prisma/client', 'next-auth'],
    testCode: _includeTests ? '// API 테스트 코드' : undefined,
    documentation: _includeDocs ? '# Users API Documentation' : undefined,
  };
}

function generateDatabaseCode(
  _prompt: string,
  _framework: string,
  _includeTests: boolean,
  _includeDocs: boolean
): GeneratedCode {
  const code = `// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  password        String
  image           String?
  bio             String?
  emailVerified   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  posts           Post[]
  comments        Comment[]
  likes           Like[]
  followers       Follow[]  @relation("followers")
  following       Follow[]  @relation("following")

  @@map("users")
}

model Post {
  id              String    @id @default(cuid())
  title           String
  content         String
  published       Boolean   @default(false)
  authorId        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments        Comment[]
  likes           Like[]
  tags            Tag[]

  @@index([authorId])
  @@map("posts")
}

model Comment {
  id              String    @id @default(cuid())
  content         String
  postId          String
  authorId        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
  @@map("comments")
}

model Follow {
  id              String    @id @default(cuid())
  followerId      String
  followingId     String
  createdAt       DateTime  @default(now())

  // Relations
  follower        User      @relation("followers", fields: [followerId], references: [id], onDelete: Cascade)
  following       User      @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}

model Like {
  id              String    @id @default(cuid())
  postId          String
  userId          String
  createdAt       DateTime  @default(now())

  // Relations
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
  @@map("likes")
}

model Tag {
  id              String    @id @default(cuid())
  name            String    @unique
  posts           Post[]
  createdAt       DateTime  @default(now())

  @@map("tags")
}`;

  return {
    id: `db_${Date.now()}`,
    type: 'database',
    name: 'social-media-schema',
    description:
      'Prisma 스키마 - User, Post, Comment, Follow, Like 모델 관계 설정',
    code,
    language: 'prisma',
    framework: 'prisma',
    dependencies: ['@prisma/client', 'prisma'],
    testCode: undefined,
    documentation: _includeDocs ? '# Database Schema Documentation' : undefined,
  };
}

function generateTestCode(_prompt: string, _framework: string): GeneratedCode {
  const code = `import { test, expect } from '@playwright/test';

test.describe('로그인 기능 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('성공적인 로그인', async ({ page }) => {
    // 이메일과 비밀번호 입력
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
    
    // 환영 메시지 확인
    await expect(page.locator('text="Welcome back"')).toBeVisible();
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    // 잘못된 비밀번호 입력
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('text="Invalid credentials"')).toBeVisible();
    
    // 여전히 로그인 페이지에 있는지 확인
    await expect(page).toHaveURL('/login');
  });

  test('필수 필드 비어있을 때 유효성 검사', async ({ page }) => {
    // 비밀번호 없이 로그인 시도
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // 유효성 검사 메시지 확인
    await expect(page.locator('text="Password is required"')).toBeVisible();
  });

  test('비밀번호 찾기 링크 작동 확인', async ({ page }) => {
    // 비밀번호 찾기 링크 클릭
    await page.click('text="Forgot password?"');
    
    // 비밀번호 재설정 페이지로 이동 확인
    await expect(page).toHaveURL('/reset-password');
  });
});`;

  return {
    id: `test_${Date.now()}`,
    type: 'test',
    name: 'login-e2e-test',
    description: '로그인 기능 E2E 테스트 - 성공/실패 케이스 포함',
    code,
    language: 'typescript',
    framework: 'playwright',
    dependencies: ['@playwright/test'],
    testCode: undefined,
    documentation: undefined,
  };
}

function generateConfigCode(
  _prompt: string,
  _framework: string
): GeneratedCode {
  const code = `// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          'jest.config.js',
        ],
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}`;

  return {
    id: `config_${Date.now()}`,
    type: 'config',
    name: 'eslint-prettier-config',
    description: 'ESLint + Prettier 설정 - Airbnb 스타일 가이드 기반',
    code,
    language: 'javascript',
    framework: 'eslint',
    dependencies: [
      'eslint',
      'prettier',
      'eslint-config-airbnb',
      'eslint-config-airbnb-typescript',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks',
      'eslint-plugin-prettier',
      'eslint-config-prettier',
    ],
    testCode: undefined,
    documentation: undefined,
  };
}
