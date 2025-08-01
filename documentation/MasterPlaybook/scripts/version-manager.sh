#!/bin/bash

# 🔄 AI Workflow Playbook 버전 관리 스크립트
# 사용법: ./scripts/version-manager.sh [major|minor|patch] "변경사항 설명"

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
echo -e "${BLUE}"
echo "🚀 AI Workflow Playbook Version Manager"
echo "======================================="
echo -e "${NC}"

# 파라미터 검증
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ 사용법: $0 [major|minor|patch] \"변경사항 설명\"${NC}"
    echo -e "${YELLOW}예시: $0 minor \"새로운 템플릿 추가\"${NC}"
    exit 1
fi

VERSION_TYPE=$1
CHANGE_DESCRIPTION=$2

# 현재 버전 읽기
if [ -f "VERSION.md" ]; then
    CURRENT_VERSION=$(grep -m 1 "**v" VERSION.md | sed 's/.*v\([0-9]\+\.[0-9]\+\.[0-9]\+\).*/\1/')
else
    CURRENT_VERSION="2.0.0"
    echo -e "${YELLOW}⚠️  VERSION.md를 찾을 수 없습니다. 기본값 v2.0.0 사용${NC}"
fi

echo -e "${BLUE}📋 현재 버전: v$CURRENT_VERSION${NC}"

# 버전 증가 계산
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

case $VERSION_TYPE in
    "major")
        NEW_VERSION="$((major + 1)).0.0"
        ;;
    "minor")
        NEW_VERSION="$major.$((minor + 1)).0"
        ;;
    "patch")
        NEW_VERSION="$major.$minor.$((patch + 1))"
        ;;
    *)
        echo -e "${RED}❌ 버전 타입은 major, minor, patch 중 하나여야 합니다.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎯 새 버전: v$NEW_VERSION${NC}"
echo -e "${YELLOW}📝 변경사항: $CHANGE_DESCRIPTION${NC}"

# 사용자 확인
read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  취소되었습니다.${NC}"
    exit 1
fi

# 날짜 생성
DATE=$(date +"%Y-%m-%d")

# VERSION.md 업데이트
echo -e "${BLUE}📄 VERSION.md 업데이트 중...${NC}"
sed -i.bak "s/\*\*v[0-9]\+\.[0-9]\+\.[0-9]\+\*\*/\*\*v$NEW_VERSION\*\*/g" VERSION.md
rm VERSION.md.bak

# CHANGELOG.md 업데이트
echo -e "${BLUE}📝 CHANGELOG.md 업데이트 중...${NC}"

# 새 버전 정보를 CHANGELOG 맨 위에 추가
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << EOF
# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [$NEW_VERSION] - $DATE

### 🔄 Changed
- $CHANGE_DESCRIPTION

EOF

# 기존 내용에서 헤더 제거하고 새 버전 정보 다음에 추가
tail -n +8 CHANGELOG.md >> "$TEMP_FILE"
mv "$TEMP_FILE" CHANGELOG.md

# Git 태그 생성
echo -e "${BLUE}🏷️  Git 태그 생성 중...${NC}"
git add VERSION.md CHANGELOG.md
git commit -m "🔖 Release v$NEW_VERSION

$CHANGE_DESCRIPTION

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION: $CHANGE_DESCRIPTION"

echo -e "${GREEN}✅ 버전 업데이트 완료!${NC}"
echo -e "${BLUE}📦 새 버전: v$NEW_VERSION${NC}"
echo -e "${YELLOW}🚀 배포하려면: git push origin main --tags${NC}"

# ROADMAP_TRACKER.md 업데이트
if [ -f "ROADMAP_TRACKER.md" ]; then
    echo -e "${BLUE}🗺️  ROADMAP_TRACKER.md 업데이트 중...${NC}"
    sed -i.bak "s/- \*\*마지막 업데이트\*\*:.*/- **마지막 업데이트**: $DATE v$NEW_VERSION/g" ROADMAP_TRACKER.md
    rm ROADMAP_TRACKER.md.bak
fi

echo -e "${GREEN}🎉 버전 관리 완료! 모든 파일이 업데이트되었습니다.${NC}"