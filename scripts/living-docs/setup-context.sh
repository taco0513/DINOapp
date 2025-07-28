#\!/bin/bash

# Living Documentation 시스템 초기 설정 스크립트

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE_DIR="$PROJECT_ROOT/.claude"
DOCS_DIR="$PROJECT_ROOT/docs"

echo "🚀 DINOapp Living Documentation 시스템 설정 시작..."

# 1. 필요한 디렉토리 생성
echo "📁 디렉토리 구조 생성 중..."
mkdir -p "$CLAUDE_DIR"
mkdir -p "$DOCS_DIR"/{decisions,errors,patterns,context,trace}
mkdir -p "$PROJECT_ROOT/scripts/living-docs"

# 2. Git hooks 설정 (선택사항)
echo "Git hooks를 설정하여 자동 추적을 활성화하시겠습니까? (y/N):"
read -r REPLY
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Git hooks 설정 중..."
    
    # Post-commit hook: 커밋할 때마다 변경사항 자동 기록
    cat > "$PROJECT_ROOT/.git/hooks/post-commit" << 'ENDHOOK'
#\!/bin/sh
# Living Documentation: 커밋 추적 자동화

COMMIT_MSG=$(git log -1 --pretty=%B)
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)
DATE=$(date)
MONTH=$(date +%Y-%m)

# 변경 사항을 trace 파일에 기록
cat >> "docs/trace/$MONTH.md" << ENDLOG

## $DATE: $COMMIT_MSG
**Files Changed**: $CHANGED_FILES

**Commit Hash**: $(git rev-parse --short HEAD)

**Context**: $COMMIT_MSG

---
ENDLOG

echo "📝 Changes tracked in docs/trace/$MONTH.md"
ENDHOOK
    
    chmod +x "$PROJECT_ROOT/.git/hooks/post-commit"
    echo "✅ Git hooks 설정 완료"
else
    echo "⏭️  Git hooks 설정 건너뜀"
fi

# 3. 현재 월의 에러 로그 파일 생성 (비어있으면)
CURRENT_MONTH=$(date +%Y-%m)
ERROR_FILE="$DOCS_DIR/errors/$CURRENT_MONTH.md"
if [ \! -f "$ERROR_FILE" ]; then
    cat > "$ERROR_FILE" << 'ENDERROR'
# Error Log - CURRENT_MONTH_PLACEHOLDER

이 파일은 해당 월의 에러와 해결 과정을 기록합니다.

## 에러 로그 작성 방법
```bash
# 에러 발생시 즉시 실행
echo "$(date): [에러 설명] in [파일명]:[라인]" >> docs/errors/$(date +%Y-%m).md
echo "CONTEXT: [무엇을 하려고 했는지]" >> docs/errors/$(date +%Y-%m).md
echo "TRIED: " >> docs/errors/$(date +%Y-%m).md
echo "SOLUTION: " >> docs/errors/$(date +%Y-%m).md
```

---
ENDERROR
    
    # 현재 월로 교체
    sed -i.bak "s/CURRENT_MONTH_PLACEHOLDER/$CURRENT_MONTH/g" "$ERROR_FILE" && rm "$ERROR_FILE.bak"
    echo "📝 에러 로그 파일 생성: $ERROR_FILE"
fi

# 4. 설정 완료 메시지 및 사용법 안내
echo ""
echo "🎉 Living Documentation 시스템 설정 완료\!"
echo ""
echo "📚 사용 방법:"
echo "  1. 복잡한 로직 작성시: // WHY: // TRIED: // CONTEXT: 주석 추가"
echo "  2. 에러 발생시: docs/errors/ 에 즉시 기록"
echo "  3. Claude와 작업시: '@.claude/project-context.md' 항상 포함"
echo ""
echo "🔧 유용한 명령어:"
echo "  - 문서 품질 체크: ./scripts/living-docs/quality-check.sh"
echo "  - 컨텍스트 업데이트: ./scripts/living-docs/update-context.sh"
echo ""
echo "✨ 이제 Claude가 프로젝트를 완벽히 이해할 수 있습니다\!"
EOF < /dev/null