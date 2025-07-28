# 생산성 도구킷

## 개요

개발 속도를 10배 향상시키는 검증된 도구, 스크립트, 확장프로그램, 단축키 모음입니다. 즉시 적용하여 작업 효율성을 극대화할 수 있습니다.

## VS Code 생산성 확장프로그램

### 필수 확장프로그램 (5분 설치)

```json
// vscode-extensions.json - 한 번에 설치할 확장프로그램 목록
{
  "extensions": [
    // AI 코딩 도우미
    "github.copilot",
    "github.copilot-chat",
    "continue.continue",
    
    // 개발 효율성
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    
    // Git 통합
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "github.vscode-pull-request-github",
    
    // 프로젝트 관리
    "ms-vscode-remote.remote-containers",
    "ms-vscode.remote-repositories",
    "gruntfuggly.todo-tree",
    
    // 언어별 지원
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "graphql.vscode-graphql",
    "ms-python.python",
    
    // 유틸리티
    "wayou.vscode-todo-highlight",
    "alefragnani.bookmarks",
    "aaron-bond.better-comments",
    "oderwat.indent-rainbow"
  ]
}
```

```bash
# 확장프로그램 일괄 설치 스크립트
#!/bin/bash
# install-vscode-extensions.sh

extensions=(
  "github.copilot"
  "github.copilot-chat"
  "continue.continue"
  "bradlc.vscode-tailwindcss"
  "esbenp.prettier-vscode"
  "ms-vscode.vscode-typescript-next"
  "formulahendry.auto-rename-tag"
  "christian-kohler.path-intellisense"
  "eamodio.gitlens"
  "mhutchie.git-graph"
  "github.vscode-pull-request-github"
  "ms-vscode-remote.remote-containers"
  "ms-vscode.remote-repositories"
  "gruntfuggly.todo-tree"
  "prisma.prisma"
  "graphql.vscode-graphql"
  "ms-python.python"
  "wayou.vscode-todo-highlight"
  "alefragnani.bookmarks"
  "aaron-bond.better-comments"
  "oderwat.indent-rainbow"
)

echo "🚀 Installing VS Code extensions..."

for extension in "${extensions[@]}"; do
  echo "Installing: $extension"
  code --install-extension $extension
done

echo "✅ All extensions installed!"
```

### VS Code 설정 최적화

```json
// settings.json - 생산성 최적화 설정
{
  // AI 코딩 도우미 최적화
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": true
  },
  "github.copilot.advanced": {
    "debug.overrideEngine": "codex"
  },
  
  // 편집기 최적화
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  "editor.fontLigatures": true,
  "editor.lineHeight": 1.6,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "editor.minimap.maxColumn": 80,
  
  // 자동 완성 최적화
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
  },
  "editor.acceptSuggestionOnCommitCharacter": false,
  "editor.acceptSuggestionOnEnter": "on",
  "editor.suggestSelection": "first",
  
  // 자동 저장 및 포맷팅
  "files.autoSave": "onFocusChange",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  
  // Git 최적화
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.postCommitCommand": "push",
  
  // 파일 탐색 최적화
  "explorer.confirmDelete": false,
  "explorer.confirmDragAndDrop": false,
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/.DS_Store": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true
  },
  
  // 터미널 최적화
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.fontFamily": "'JetBrains Mono', monospace",
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.cursorBlinking": true,
  
  // 작업영역 최적화
  "workbench.startupEditor": "newUntitledFile",
  "workbench.editor.enablePreview": false,
  "workbench.editor.closeOnFileDelete": true,
  "workbench.activityBar.visible": true,
  "workbench.statusBar.visible": true,
  
  // 언어별 설정
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Tailwind CSS 최적화
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)",
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["classnames\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 개발 자동화 스크립트

### 프로젝트 초기화 스크립트

```bash
#!/bin/bash
# project-init.sh - 새 프로젝트 자동 초기화

set -e

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 정보 입력
echo -e "${YELLOW}🚀 New Project Setup${NC}"
echo "======================"

read -p "Project name: " PROJECT_NAME
read -p "Project type (nextjs/react/node/python): " PROJECT_TYPE
read -p "Package manager (npm/yarn/pnpm/bun): " PACKAGE_MANAGER

if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}❌ Project name is required${NC}"
    exit 1
fi

# 프로젝트 디렉토리 생성
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo -e "${GREEN}📁 Created project directory: $PROJECT_NAME${NC}"

# 프로젝트 타입별 초기화
case $PROJECT_TYPE in
  "nextjs")
    echo -e "${YELLOW}🔧 Setting up Next.js project...${NC}"
    npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    
    # 추가 패키지 설치
    if command -v bun &> /dev/null && [ "$PACKAGE_MANAGER" = "bun" ]; then
      bun add @radix-ui/react-slot lucide-react clsx tailwind-merge
      bun add -d @types/node
    else
      npm install @radix-ui/react-slot lucide-react clsx tailwind-merge
      npm install -D @types/node
    fi
    ;;
    
  "react")
    echo -e "${YELLOW}🔧 Setting up React project...${NC}"
    npx create-react-app . --template typescript
    
    # Tailwind CSS 설정
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ;;
    
  "node")
    echo -e "${YELLOW}🔧 Setting up Node.js project...${NC}"
    npm init -y
    
    # TypeScript 및 필수 패키지 설정
    npm install express cors helmet morgan dotenv
    npm install -D typescript @types/node @types/express nodemon ts-node
    
    # tsconfig.json 생성
    npx tsc --init
    ;;
    
  "python")
    echo -e "${YELLOW}🔧 Setting up Python project...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    
    # requirements.txt 생성
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
sqlalchemy==2.0.23
alembic==1.13.0
EOF
    
    pip install -r requirements.txt
    ;;
    
  *)
    echo -e "${RED}❌ Unknown project type: $PROJECT_TYPE${NC}"
    exit 1
    ;;
esac

# Git 초기화
echo -e "${YELLOW}📝 Initializing Git repository...${NC}"
git init
git add .
git commit -m "Initial commit: Setup $PROJECT_TYPE project"

# 기본 디렉토리 구조 생성
mkdir -p docs tests scripts

# README.md 생성
cat > README.md << EOF
# $PROJECT_NAME

## Description
A $PROJECT_TYPE project created with automated setup.

## Getting Started

### Prerequisites
- Node.js 18+
- $PACKAGE_MANAGER

### Installation
\`\`\`bash
$PACKAGE_MANAGER install
\`\`\`

### Development
\`\`\`bash
$PACKAGE_MANAGER run dev
\`\`\`

### Build
\`\`\`bash
$PACKAGE_MANAGER run build
\`\`\`

## Project Structure
\`\`\`
$PROJECT_NAME/
├── src/                 # Source code
├── docs/                # Documentation
├── tests/               # Test files
├── scripts/             # Build and deployment scripts
└── README.md           # This file
\`\`\`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT
EOF

# .env.example 생성
cat > .env.example << EOF
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Authentication
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EOF

# .gitignore 업데이트 (언어별)
echo -e "${YELLOW}📝 Setting up .gitignore...${NC}"
case $PROJECT_TYPE in
  "nextjs"|"react"|"node")
    cat >> .gitignore << EOF

# Development
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history
EOF
    ;;
    
  "python")
    cat >> .gitignore << EOF

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Virtual environments
venv/
ENV/
env/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
EOF
    ;;
esac

# 개발 도구 설정 파일들 생성
echo -e "${YELLOW}🔧 Creating development configuration files...${NC}"

# Prettier 설정
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# ESLint 설정 (JavaScript/TypeScript 프로젝트만)
if [ "$PROJECT_TYPE" = "nextjs" ] || [ "$PROJECT_TYPE" = "react" ] || [ "$PROJECT_TYPE" = "node" ]; then
  cat > .eslintrc.json << EOF
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
EOF
fi

# VS Code 설정
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
EOF

cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "github.copilot",
    "eamodio.gitlens"
  ]
}
EOF

echo -e "${GREEN}✅ Project setup completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "  1. cd $PROJECT_NAME"
echo "  2. Copy .env.example to .env and fill in your values"
echo "  3. $PACKAGE_MANAGER run dev"
echo -e "${GREEN}🚀 Happy coding!${NC}"
```

### 일일 개발 자동화 스크립트

```bash
#!/bin/bash
# daily-dev.sh - 일일 개발 루틴 자동화

set -e

echo "🌅 Good morning! Starting your dev environment..."

# 1. Git 상태 확인 및 업데이트
echo "📦 Checking Git status..."
if [ -d ".git" ]; then
    git fetch origin
    
    # 현재 브랜치 확인
    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"
    
    # 업스트림 변경사항 확인
    BEHIND=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count)
    if [ "$BEHIND" -gt 0 ]; then
        echo "⚠️ Your branch is $BEHIND commits behind. Pulling latest changes..."
        git pull origin $CURRENT_BRANCH
    else
        echo "✅ Your branch is up to date"
    fi
else
    echo "ℹ️ Not a Git repository"
fi

# 2. 의존성 업데이트 확인
echo "📦 Checking for dependency updates..."
if [ -f "package.json" ]; then
    if command -v bun &> /dev/null; then
        echo "Using Bun..."
        bun install
        
        # 보안 취약점 체크
        if command -v bunx &> /dev/null; then
            bunx audit
        fi
    elif command -v npm &> /dev/null; then
        echo "Using npm..."
        npm install
        npm audit fix --audit-level moderate
    fi
elif [ -f "requirements.txt" ]; then
    echo "Using pip..."
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    pip install -r requirements.txt --upgrade
fi

# 3. 개발 서버 상태 확인
echo "🖥️ Checking development servers..."

# 포트 사용 현황 확인
COMMON_PORTS=(3000 3001 8000 8080 5000 5173 4173)
for port in "${COMMON_PORTS[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        PROCESS=$(lsof -i :$port | tail -n 1 | awk '{print $1, $2}')
        echo "⚠️ Port $port is in use by: $PROCESS"
    fi
done

# 4. 데이터베이스 연결 확인
echo "🗄️ Checking database connections..."
if [ -f ".env" ] || [ -f ".env.local" ]; then
    # PostgreSQL 연결 테스트
    if grep -q "postgresql://" .env* 2>/dev/null; then
        echo "📊 PostgreSQL database detected"
        # 실제 연결 테스트는 프로젝트에 따라 다름
    fi
    
    # MongoDB 연결 테스트
    if grep -q "mongodb://" .env* 2>/dev/null; then
        echo "📊 MongoDB database detected"
    fi
fi

# 5. 테스트 실행
echo "🧪 Running tests..."
if [ -f "package.json" ]; then
    if grep -q '"test"' package.json; then
        if command -v bun &> /dev/null; then
            bun test 2>/dev/null || echo "⚠️ Some tests failed - check later"
        else
            npm test 2>/dev/null || echo "⚠️ Some tests failed - check later"
        fi
    fi
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
    if command -v pytest &> /dev/null; then
        pytest --tb=short 2>/dev/null || echo "⚠️ Some tests failed - check later"
    fi
fi

# 6. 코드 품질 체크
echo "🔍 Running code quality checks..."
if [ -f "package.json" ]; then
    # ESLint
    if grep -q "eslint" package.json; then
        if command -v bun &> /dev/null; then
            bunx eslint . --ext .ts,.tsx,.js,.jsx --fix 2>/dev/null || echo "⚠️ ESLint issues found"
        else
            npx eslint . --ext .ts,.tsx,.js,.jsx --fix 2>/dev/null || echo "⚠️ ESLint issues found"
        fi
    fi
    
    # Prettier
    if grep -q "prettier" package.json; then
        if command -v bun &> /dev/null; then
            bunx prettier --write . 2>/dev/null || echo "⚠️ Prettier formatting applied"
        else
            npx prettier --write . 2>/dev/null || echo "⚠️ Prettier formatting applied"
        fi
    fi
elif [ -f "pyproject.toml" ]; then
    # Black (Python formatter)
    if command -v black &> /dev/null; then
        black . 2>/dev/null || echo "⚠️ Black formatting applied"
    fi
    
    # isort (Python import sorter)
    if command -v isort &> /dev/null; then
        isort . 2>/dev/null || echo "⚠️ Import sorting applied"
    fi
fi

# 7. TODO 아이템 확인
echo "📝 Checking TODO items..."
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" . 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    echo "📋 Found $TODO_COUNT TODO/FIXME items"
    echo "   Use 'grep -r \"TODO\\|FIXME\\|HACK\" --include=\"*.ts\" --include=\"*.tsx\" .' to see them"
fi

# 8. 브랜치 정리 제안
echo "🌿 Checking branch cleanup opportunities..."
if [ -d ".git" ]; then
    MERGED_BRANCHES=$(git branch --merged | grep -v "\*\|main\|master\|develop" | wc -l)
    if [ "$MERGED_BRANCHES" -gt 0 ]; then
        echo "🧹 You have $MERGED_BRANCHES merged branches that can be cleaned up"
        echo "   Run 'git branch --merged | grep -v \"\\*\\|main\\|master\\|develop\" | xargs -n 1 git branch -d'"
    fi
fi

# 9. 시스템 리소스 확인
echo "💻 System resource check..."
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo "💾 Memory usage: ${MEMORY_USAGE}%"
fi

if command -v df &> /dev/null; then
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "💿 Disk usage: ${DISK_USAGE}%"
    
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo "⚠️ Disk usage is high. Consider cleaning up:"
        echo "   - node_modules: find . -name 'node_modules' -type d -prune -exec du -sh {} +"
        echo "   - Build artifacts: rm -rf dist build .next"
    fi
fi

# 10. 개발 환경 시작
echo "🚀 Starting development environment..."

# package.json에서 dev 스크립트 확인
if [ -f "package.json" ] && grep -q '"dev"' package.json; then
    echo "Ready to start development server:"
    if command -v bun &> /dev/null; then
        echo "  Run: bun run dev"
    else
        echo "  Run: npm run dev"
    fi
elif [ -f "main.py" ] || [ -f "app.py" ]; then
    echo "Ready to start Python development:"
    echo "  Run: python main.py or uvicorn app:app --reload"
fi

echo ""
echo "✅ Development environment is ready!"
echo "🎯 Today's focus: Check your project roadmap and prioritize tasks"
echo "⏰ Remember to take breaks every 90 minutes"
```

## 단축키 및 스니펫 모음

### VS Code 키보드 단축키 설정

```json
// keybindings.json - 생산성 향상 단축키
[
  // 빠른 파일 생성
  {
    "key": "ctrl+alt+n",
    "command": "explorer.newFile"
  },
  {
    "key": "ctrl+alt+shift+n",
    "command": "explorer.newFolder"
  },
  
  // 터미널 관리
  {
    "key": "ctrl+`",
    "command": "workbench.action.terminal.toggleTerminal"
  },
  {
    "key": "ctrl+shift+`",
    "command": "workbench.action.terminal.new"
  },
  
  // 코드 네비게이션
  {
    "key": "ctrl+shift+f",
    "command": "workbench.action.findInFiles"
  },
  {
    "key": "ctrl+shift+h",
    "command": "workbench.action.replaceInFiles"
  },
  
  // AI 도우미
  {
    "key": "ctrl+shift+a",
    "command": "github.copilot.generate"
  },
  {
    "key": "ctrl+shift+c",
    "command": "workbench.panel.chatSidebar.copilot"
  },
  
  // Git 작업
  {
    "key": "ctrl+shift+g",
    "command": "workbench.view.scm"
  },
  {
    "key": "ctrl+k ctrl+c",
    "command": "git.commitAll"
  },
  
  // 레이아웃 관리
  {
    "key": "ctrl+\\",
    "command": "workbench.action.splitEditor"
  },
  {
    "key": "ctrl+1",
    "command": "workbench.action.focusFirstEditorGroup"
  },
  {
    "key": "ctrl+2",
    "command": "workbench.action.focusSecondEditorGroup"
  },
  
  // 빠른 리팩토링
  {
    "key": "f2",
    "command": "editor.action.rename"
  },
  {
    "key": "ctrl+shift+r",
    "command": "editor.action.refactor"
  }
]
```

### 코드 스니펫 모음

```json
// typescript.json - TypeScript 스니펫
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export default function ${1:ComponentName}({ $3 }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Create a React functional component with TypeScript"
  },
  
  "API Route Handler": {
    "prefix": "api",
    "body": [
      "import { NextRequest, NextResponse } from 'next/server';",
      "",
      "export async function ${1:GET}(request: NextRequest) {",
      "  try {",
      "    $2",
      "    ",
      "    return NextResponse.json({ success: true });",
      "  } catch (error) {",
      "    console.error('API Error:', error);",
      "    return NextResponse.json(",
      "      { error: 'Internal Server Error' },",
      "      { status: 500 }",
      "    );",
      "  }",
      "}"
    ],
    "description": "Create a Next.js API route handler"
  },
  
  "Async Function with Error Handling": {
    "prefix": "asyncfn",
    "body": [
      "const ${1:functionName} = async (${2:params}) => {",
      "  try {",
      "    $3",
      "  } catch (error) {",
      "    console.error('Error in ${1:functionName}:', error);",
      "    throw error;",
      "  }",
      "};"
    ],
    "description": "Create an async function with error handling"
  },
  
  "Custom Hook": {
    "prefix": "hook",
    "body": [
      "import { useState, useEffect } from 'react';",
      "",
      "interface Use${1:HookName}Return {",
      "  $2",
      "}",
      "",
      "export function use${1:HookName}(): Use${1:HookName}Return {",
      "  const [${3:state}, set${3/(.*)/${3:/capitalize}/}] = useState$4();",
      "",
      "  useEffect(() => {",
      "    $5",
      "  }, []);",
      "",
      "  return {",
      "    ${3:state},",
      "    set${3/(.*)/${3:/capitalize}/},",
      "    $0",
      "  };",
      "}"
    ],
    "description": "Create a custom React hook"
  },
  
  "Zustand Store": {
    "prefix": "zustand",
    "body": [
      "import { create } from 'zustand';",
      "import { devtools } from 'zustand/middleware';",
      "",
      "interface ${1:Store}State {",
      "  $2",
      "}",
      "",
      "interface ${1:Store}Actions {",
      "  $3",
      "}",
      "",
      "export const use${1:Store} = create<${1:Store}State & ${1:Store}Actions>()(",
      "  devtools(",
      "    (set, get) => ({",
      "      // State",
      "      $4",
      "",
      "      // Actions",
      "      $0",
      "    }),",
      "    { name: '${1/(.*)/${1:/downcase}/}-store' }",
      "  )",
      ");"
    ],
    "description": "Create a Zustand store with TypeScript"
  }
}
```

## SuperClaude 생산성 명령어

```bash
# 개발 환경 최적화
/optimize-dev-env --vscode-extensions --shortcuts --snippets

# 프로젝트 자동 설정
/auto-setup-project --type nextjs --tools "prettier,eslint,husky" --ai-integration

# 코드 스니펫 생성
/create-snippets --framework react --patterns "components,hooks,utils,types"

# 자동화 스크립트 생성
/generate-scripts --daily-routine --git-automation --testing-pipeline

# 생산성 측정
/measure-productivity --time-tracking --commit-analysis --focus-metrics

# 개발 도구 동기화
/sync-dev-tools --settings --extensions --configurations --team-standards

# 워크플로우 최적화
/optimize-workflow --bottleneck-analysis --automation-opportunities --time-savings

# 키보드 단축키 최적화
/setup-shortcuts --ide vscode --patterns frequent-actions --muscle-memory

# 코드 품질 자동화
/automate-quality --linting --formatting --testing --security-checks

# 팀 표준화
/standardize-team --tools --configurations --practices --onboarding
```

## 생산성 측정 및 개선

### 개발 생산성 지표

```typescript
// productivity-tracker.ts - 생산성 측정 도구
interface ProductivityMetrics {
  codeMetrics: {
    linesWritten: number;
    filesModified: number;
    functionsCreated: number;
    testsWritten: number;
    bugsFixed: number;
  };
  
  timeMetrics: {
    codingTime: number;        // 실제 코딩 시간
    debuggingTime: number;     // 디버깅 시간
    meetingTime: number;       // 회의 시간
    learningTime: number;      // 학습 시간
    breakTime: number;         // 휴식 시간
  };
  
  qualityMetrics: {
    testCoverage: number;      // 테스트 커버리지
    codeReviewScore: number;   // 코드 리뷰 점수
    bugRate: number;           // 버그 발생률
    refactoringRate: number;   // 리팩토링 비율
  };
  
  collaborationMetrics: {
    pullRequests: number;      // PR 수
    codeReviews: number;       // 리뷰한 코드 수
    commentsGiven: number;     // 남긴 코멘트 수
    commentsReceived: number;  // 받은 코멘트 수
  };
}

class ProductivityTracker {
  private metrics: ProductivityMetrics;
  
  constructor() {
    this.metrics = this.initializeMetrics();
  }
  
  // Git 데이터에서 메트릭 추출
  async analyzeGitActivity(days: number = 30): Promise<GitMetrics> {
    const commits = await this.getRecentCommits(days);
    const diffStats = await this.analyzeDiffs(commits);
    
    return {
      commitsCount: commits.length,
      linesAdded: diffStats.additions,
      linesDeleted: diffStats.deletions,
      filesChanged: diffStats.changedFiles.length,
      averageCommitSize: diffStats.additions / commits.length,
      commitFrequency: commits.length / days
    };
  }
  
  // VS Code 활동 분석
  analyzeCodeActivity(): CodeActivityMetrics {
    // VS Code 확장프로그램을 통한 활동 데이터 수집
    return {
      activeHours: this.calculateActiveHours(),
      keystrokes: this.getKeystrokeCount(),
      commandsUsed: this.getCommandUsage(),
      extensionsUsed: this.getExtensionUsage(),
      focusTime: this.calculateFocusTime()
    };
  }
  
  // 생산성 개선 제안
  generateImprovementSuggestions(): ProductivitySuggestion[] {
    const suggestions: ProductivitySuggestion[] = [];
    
    // 코딩 시간 분석
    if (this.metrics.timeMetrics.debuggingTime > this.metrics.timeMetrics.codingTime * 0.5) {
      suggestions.push({
        category: 'debugging',
        title: '디버깅 시간 최적화',
        description: '디버깅 시간이 코딩 시간의 50%를 초과합니다.',
        actions: [
          '더 많은 단위 테스트 작성',  
          '타입 안전성 강화',
          '로깅 시스템 개선',
          'IDE 디버거 활용도 증가'
        ],
        expectedImprovement: '20-30% 디버깅 시간 단축'
      });
    }
    
    // 테스트 커버리지 분석
    if (this.metrics.qualityMetrics.testCoverage < 80) {
      suggestions.push({
        category: 'testing',
        title: '테스트 커버리지 향상',
        description: `현재 테스트 커버리지: ${this.metrics.qualityMetrics.testCoverage}%`,
        actions: [
          'TDD 방법론 적용',
          '자동 테스트 생성 도구 활용',
          '테스트 코드 리뷰 강화'
        ],
        expectedImprovement: '버그 발생률 40% 감소'
      });
    }
    
    return suggestions;
  }
  
  // 주간 생산성 리포트
  generateWeeklyReport(): ProductivityReport {
    return {
      period: this.getWeekRange(),
      summary: {
        totalCodingHours: this.metrics.timeMetrics.codingTime,
        linesWritten: this.metrics.codeMetrics.linesWritten,
        featuresCompleted: this.calculateFeaturesCompleted(),
        bugsFixed: this.metrics.codeMetrics.bugsFixed
      },
      trends: this.analyzeTrends(),
      achievements: this.identifyAchievements(),
      areasForImprovement: this.generateImprovementSuggestions(),
      nextWeekGoals: this.suggestNextWeekGoals()
    };
  }
}
```

### 자동 시간 추적

```bash
#!/bin/bash
# time-tracker.sh - 자동 시간 추적 스크립트

# 작업 시간 추적 시작
start_tracking() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Work started" >> ~/.time_tracker.log
    echo "WORK_START=$(date +%s)" > ~/.current_session
    echo "⏰ Time tracking started at $(date '+%H:%M')"
}

# 작업 시간 추적 종료
stop_tracking() {
    if [ -f ~/.current_session ]; then
        source ~/.current_session
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - WORK_START))
        HOURS=$((DURATION / 3600))
        MINUTES=$(((DURATION % 3600) / 60))
        
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Work ended - Duration: ${HOURS}h ${MINUTES}m" >> ~/.time_tracker.log
        rm ~/.current_session
        
        echo "⏰ Session ended. Duration: ${HOURS}h ${MINUTES}m"
    else
        echo "❌ No active session found"
    fi
}

# 오늘의 총 작업 시간
today_total() {
    TODAY=$(date '+%Y-%m-%d')
    if [ -f ~/.time_tracker.log ]; then
        grep "$TODAY.*Work ended" ~/.time_tracker.log | \
        awk -F'Duration: ' '{print $2}' | \
        awk -F'h ' '{hours+=$1; minutes+=$2} END {
            total_minutes = hours*60 + minutes;
            printf "📊 Today total: %dh %dm\n", total_minutes/60, total_minutes%60
        }'
    else
        echo "📊 No time data for today"
    fi
}

# 포모도로 타이머
pomodoro() {
    WORK_TIME=${1:-25}  # 기본 25분
    BREAK_TIME=${2:-5}  # 기본 5분
    
    echo "🍅 Starting Pomodoro: ${WORK_TIME}min work, ${BREAK_TIME}min break"
    
    # 작업 시간
    echo "💼 Work time started!"
    sleep $((WORK_TIME * 60))
    
    # 알림
    echo "🔔 Work time finished! Take a ${BREAK_TIME} minute break."
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"Work session completed!\" with title \"Pomodoro Timer\""
    fi
    
    # 휴식 시간
    sleep $((BREAK_TIME * 60))
    echo "🔔 Break time finished! Ready for next session."
}

case "$1" in
    "start")
        start_tracking
        ;;
    "stop")
        stop_tracking
        ;;
    "status")
        if [ -f ~/.current_session ]; then
            source ~/.current_session
            CURRENT_TIME=$(date +%s)
            ELAPSED=$((CURRENT_TIME - WORK_START))
            HOURS=$((ELAPSED / 3600))
            MINUTES=$(((ELAPSED % 3600) / 60))
            echo "⏰ Session running: ${HOURS}h ${MINUTES}m"
        else
            echo "⏸️ No active session"
        fi
        today_total
        ;;
    "today")
        today_total
        ;;
    "pomodoro")
        pomodoro $2 $3
        ;;
    *)
        echo "Usage: $0 {start|stop|status|today|pomodoro [work_minutes] [break_minutes]}"
        ;;
esac
```

이 생산성 도구킷을 통해 개발 효율성을 극대화하고, 반복적인 작업을 자동화하여 더 중요한 문제 해결에 집중할 수 있습니다.