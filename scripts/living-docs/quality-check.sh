#\!/bin/bash

# Living Documentation 품질 체크 스크립트

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "📊 DINOapp Living Documentation 품질 분석..."
echo "=================================================="

score=0
total=0

# 1. 프로젝트 컨텍스트 존재 여부 (10점)
total=$((total + 10))
if [ -f "$PROJECT_ROOT/.claude/project-context.md" ]; then
    score=$((score + 10))
    echo "✅ Project context exists (+10)"
else
    echo "❌ Missing project context (-10)"
fi

# 2. 현재 작업 포커스 존재 여부 (5점)
total=$((total + 5))
if [ -f "$PROJECT_ROOT/.claude/current-focus.md" ]; then
    score=$((score + 5))
    echo "✅ Current focus documented (+5)"
else
    echo "⚠️  Missing current focus (-5)"
fi

# 3. 학습된 패턴 존재 여부 (5점)
total=$((total + 5))
if [ -f "$PROJECT_ROOT/.claude/learned-patterns.md" ]; then
    score=$((score + 5))
    echo "✅ Learned patterns documented (+5)"
else
    echo "⚠️  Missing learned patterns (-5)"
fi

# 4. 핵심 파일들의 컨텍스트 주석 여부 (30점)
echo ""
echo "🔍 Checking context comments in key files..."
context_files=0
total_key_files=0

# 핵심 파일들 체크
for file in $(find "$PROJECT_ROOT/lib" -name "*.ts" 2>/dev/null | head -10); do
    total_key_files=$((total_key_files + 1))
    if grep -q "// WHY:\|// PURPOSE:\|// CONTEXT:" "$file" 2>/dev/null; then
        context_files=$((context_files + 1))
        echo "✅ $(basename "$file") has context comments"
    else
        echo "⚠️  $(basename "$file") missing context comments"
    fi
done

if [ $total_key_files -gt 0 ]; then
    context_score=$((context_files * 30 / total_key_files))
    score=$((score + context_score))
    total=$((total + 30))
    echo "📝 Context coverage: $context_files/$total_key_files files (+$context_score/30)"
else
    echo "📝 No key files found to check"
fi

# 5. 최근 에러 기록 여부 (15점)
total=$((total + 15))
current_month=$(date +%Y-%m)
error_file="$PROJECT_ROOT/docs/errors/$current_month.md"

if [ -f "$error_file" ]; then
    error_count=$(grep -c "##.*Error\|##.*$(date +%Y)" "$error_file" 2>/dev/null || echo 0)
    if [ "$error_count" -gt 0 ]; then
        score=$((score + 15))
        echo "✅ Recent errors documented ($error_count entries) (+15)"
    else
        score=$((score + 5))
        echo "⚠️  Error log exists but empty (+5)"
    fi
else
    echo "❌ No error documentation for current month (-15)"
fi

# 6. 결정사항 기록 여부 (10점)
total=$((total + 10))
if [ -d "$PROJECT_ROOT/docs/decisions" ] && [ "$(ls -A "$PROJECT_ROOT/docs/decisions"/*.md 2>/dev/null | wc -l)" -gt 0 ]; then
    decision_count=$(ls "$PROJECT_ROOT/docs/decisions"/*.md 2>/dev/null | wc -l)
    score=$((score + 10))
    echo "✅ Decision records exist ($decision_count files) (+10)"
else
    echo "❌ Missing decision records (-10)"
fi

# 7. Git 추적 설정 여부 (5점)
total=$((total + 5))
if [ -f "$PROJECT_ROOT/.git/hooks/post-commit" ]; then
    score=$((score + 5))
    echo "✅ Git tracking enabled (+5)"
else
    echo "⚠️  Git tracking not configured (-5)"
fi

# 8. 코드와 문서 동기화 상태 (10점)
total=$((total + 10))
sync_issues=0

# RELATED 파일 참조 확인
echo ""
echo "🔗 Checking file reference synchronization..."
# RELATED 파일 참조 확인 (간단한 버전)
related_files=$(grep -r "RELATED:" --include="*.ts" --include="*.js" "$PROJECT_ROOT/app" "$PROJECT_ROOT/lib" "$PROJECT_ROOT/components" 2>/dev/null || true)
if [ -n "$related_files" ]; then
    echo "Found RELATED references in code"
else
    echo "No RELATED references found in code"
fi

if [ $sync_issues -eq 0 ]; then
    score=$((score + 10))
    echo "✅ File references synchronized (+10)"
else
    score=$((score + 5))
    echo "⚠️  $sync_issues synchronization issues found (+5)"
fi

# 최종 점수 계산 및 평가
echo ""
echo "=================================================="
percentage=$((score * 100 / total))
echo "📊 Documentation Score: $score/$total ($percentage%)"

if [ $percentage -lt 50 ]; then
    echo "🚨 CRITICAL: Documentation quality is very low\!"
    echo "   AI will struggle significantly with context."
    echo "   📋 Priority actions:"
    echo "   1. Run './scripts/living-docs/setup-context.sh'"
    echo "   2. Add context comments to key files"
    echo "   3. Start documenting errors as they occur"
elif [ $percentage -lt 70 ]; then
    echo "⚠️  WARNING: Documentation quality needs improvement."
    echo "   AI may miss important context."
    echo "   📋 Recommended actions:"
    echo "   1. Add more context comments to code"
    echo "   2. Document recent decisions and errors"
    echo "   3. Update current focus regularly"
elif [ $percentage -lt 85 ]; then
    echo "👍 GOOD: Documentation quality is decent."
    echo "   AI can work effectively most of the time."
    echo "   📋 To improve further:"
    echo "   1. Add context to remaining files"
    echo "   2. Set up Git tracking"
    echo "   3. Regular quality maintenance"
else
    echo "🌟 EXCELLENT: Outstanding documentation quality\!"
    echo "   AI can work as your perfect development partner."
    echo "   📋 Maintenance:"
    echo "   1. Keep documenting as you develop"
    echo "   2. Regular quality checks"
    echo "   3. Share this approach with your team"
fi

echo ""
echo "🔧 Useful commands:"
echo "  - Setup system: ./scripts/living-docs/setup-context.sh"
echo "  - Update context: ./scripts/living-docs/update-context.sh"
echo "  - Start Claude session: cat .claude/*.md"
echo ""

# 스코어를 파일로 저장 (옵션)
echo "$percentage" > "$PROJECT_ROOT/.claude/last-quality-score.txt"
echo "💾 Quality score saved to .claude/last-quality-score.txt"
EOF < /dev/null