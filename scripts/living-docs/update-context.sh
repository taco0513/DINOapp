#\!/bin/bash

# Living Documentation 컨텍스트 업데이트 스크립트

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE_DIR="$PROJECT_ROOT/.claude"

echo "🔄 DINOapp 컨텍스트 업데이트 중..."

# 1. 프로젝트 상태 분석
echo "📊 프로젝트 현재 상태 분석..."

# Git 상태 확인
git_status=$(cd "$PROJECT_ROOT" && git status --porcelain 2>/dev/null || echo "No git repo")
recent_commits=$(cd "$PROJECT_ROOT" && git log --oneline -5 2>/dev/null || echo "No recent commits")

# 파일 통계
total_files=$(find "$PROJECT_ROOT" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
component_files=$(find "$PROJECT_ROOT/components" -name "*.tsx" 2>/dev/null | wc -l)
api_files=$(find "$PROJECT_ROOT/app/api" -name "*.ts" 2>/dev/null | wc -l)
lib_files=$(find "$PROJECT_ROOT/lib" -name "*.ts" 2>/dev/null | wc -l)

# 2. 현재 작업 포커스 업데이트
echo "🎯 현재 작업 포커스 업데이트..."

# 최근 변경된 파일들 찾기
recently_changed=$(cd "$PROJECT_ROOT" && git diff --name-only HEAD~1 2>/dev/null | head -5 || echo "No recent changes")

# current-focus.md 업데이트
if [ -f "$CLAUDE_DIR/current-focus.md" ]; then
    # 백업 생성
    cp "$CLAUDE_DIR/current-focus.md" "$CLAUDE_DIR/current-focus.md.bak"
    
    # 통계 정보 추가
    cat >> "$CLAUDE_DIR/current-focus.md" << ENDUPDATE

## 📊 Project Statistics (Updated: $(date))
- **Total Code Files**: $total_files
- **Components**: $component_files
- **API Routes**: $api_files  
- **Library Files**: $lib_files

## 🔄 Recent Activity
**Git Status**: 
$git_status

**Recent Commits**:
$recent_commits

**Recently Changed Files**:
$recently_changed

## 📈 Progress Indicators
- Documentation Quality: $(cat "$CLAUDE_DIR/last-quality-score.txt" 2>/dev/null || echo "Not checked")%
- Last Updated: $(date)
ENDUPDATE

    echo "✅ Current focus updated with latest statistics"
else
    echo "⚠️  current-focus.md not found. Run setup-context.sh first."
fi

# 3. 학습된 패턴 자동 업데이트
echo "🧠 학습된 패턴 분석 중..."

if [ -f "$CLAUDE_DIR/learned-patterns.md" ]; then
    # 새로운 패턴 찾기 (TODO, FIXME, NOTE 주석들)
    new_todos=$(grep -r "// TODO\|// FIXME\|// NOTE" --include="*.ts" --include="*.tsx" "$PROJECT_ROOT/app" "$PROJECT_ROOT/lib" "$PROJECT_ROOT/components" 2>/dev/null | wc -l)
    
    # 에러 패턴 분석
    current_month=$(date +%Y-%m)
    error_file="$PROJECT_ROOT/docs/errors/$current_month.md"
    recent_errors=0
    if [ -f "$error_file" ]; then
        recent_errors=$(grep -c "##.*$(date +%Y)" "$error_file" 2>/dev/null || echo 0)
    fi
    
    # 패턴 파일에 자동 업데이트 추가
    cat >> "$CLAUDE_DIR/learned-patterns.md" << ENDPATTERN

## 📊 Auto-Generated Insights ($(date))

### Current Code Health
- **Active TODOs/FIXMEs**: $new_todos items need attention
- **Recent Errors**: $recent_errors documented this month
- **Code Files**: $total_files total files in project

### Recent Pattern Analysis
**Most Changed Areas**: 
$recently_changed

**Code Quality Indicators**:
- Components: $component_files (UI layer)
- API Routes: $api_files (Backend layer)  
- Libraries: $lib_files (Business logic)

### Development Velocity
**Recent Development Activity**:
$recent_commits

**Files Under Active Development**:
$git_status
ENDPATTERN

    echo "✅ Learned patterns updated with auto-generated insights"
fi

# 4. 관련 파일들 동기화 체크
echo "🔗 파일 관계 분석 중..."

# Import/export 관계 분석
echo "Analyzing file dependencies..." > "$CLAUDE_DIR/file-relationships.tmp"

# TypeScript 파일들의 import 관계 추출
if command -v grep >/dev/null 2>&1; then
    echo "## File Import Relationships ($(date))" >> "$CLAUDE_DIR/file-relationships.tmp"
    echo "" >> "$CLAUDE_DIR/file-relationships.tmp"
    
    # 주요 디렉토리별 import 관계
    for dir in "lib" "components" "app/api"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            echo "### $dir/" >> "$CLAUDE_DIR/file-relationships.tmp"
            find "$PROJECT_ROOT/$dir" -name "*.ts" -o -name "*.tsx" | head -10 | while read -r file; do
                imports=$(grep "^import.*from" "$file" 2>/dev/null | wc -l)
                relative_path=${file#$PROJECT_ROOT/}
                echo "- **$relative_path**: $imports imports" >> "$CLAUDE_DIR/file-relationships.tmp"
            done
            echo "" >> "$CLAUDE_DIR/file-relationships.tmp"
        fi
    done
fi

# 5. 프로젝트 컨텍스트 자동 업데이트
echo "📝 프로젝트 컨텍스트 업데이트..."

if [ -f "$CLAUDE_DIR/project-context.md" ]; then
    # 마지막 업데이트 시간 추가
    if \! grep -q "Last Updated:" "$CLAUDE_DIR/project-context.md"; then
        echo "" >> "$CLAUDE_DIR/project-context.md"
        echo "## Last Updated" >> "$CLAUDE_DIR/project-context.md"
        echo "$(date) - Automatic context update" >> "$CLAUDE_DIR/project-context.md"
    else
        # 기존 업데이트 시간 교체
        sed -i.bak "s/Last Updated:.*/Last Updated: $(date) - Automatic context update/" "$CLAUDE_DIR/project-context.md" && rm "$CLAUDE_DIR/project-context.md.bak"
    fi
    
    echo "✅ Project context timestamp updated"
fi

# 6. 임시 파일 정리
if [ -f "$CLAUDE_DIR/file-relationships.tmp" ]; then
    mv "$CLAUDE_DIR/file-relationships.tmp" "$CLAUDE_DIR/file-relationships.md"
    echo "✅ File relationships documented"
fi

# 7. 업데이트 완료 리포트
echo ""
echo "🎉 컨텍스트 업데이트 완료\!"
echo "=================================================="
echo "📊 Updated Files:"
echo "  - .claude/current-focus.md (with latest stats)"
echo "  - .claude/learned-patterns.md (with insights)" 
echo "  - .claude/project-context.md (with timestamp)"
echo "  - .claude/file-relationships.md (new/updated)"
echo ""
echo "📈 Project Overview:"
echo "  - Total Files: $total_files"
echo "  - Components: $component_files | APIs: $api_files | Libraries: $lib_files"
echo "  - Recent Changes: $(echo "$recently_changed" | wc -l) files"
echo ""
echo "🚀 Claude is now up-to-date with your project\!"
echo "   Use: cat .claude/*.md to load full context"
echo ""

# 품질 체크 자동 실행 (옵션)
if [ -f "$PROJECT_ROOT/scripts/living-docs/quality-check.sh" ]; then
    echo "🔍 Running automatic quality check..."
    bash "$PROJECT_ROOT/scripts/living-docs/quality-check.sh" | tail -5
fi
EOF < /dev/null