#!/bin/bash

# Auto-Docs 설치 스크립트
# AI Workflow Playbook 자동 문서화 시스템

set -e

# 색깔 출력을 위한 함수들
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 현재 스크립트 위치 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTO_DOCS_SOURCE="$SCRIPT_DIR/auto-docs"

# 도움말 출력
show_help() {
    echo "Auto-Docs 설치 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0 [프로젝트 경로]"
    echo ""
    echo "예시:"
    echo "  $0                           # 현재 디렉토리에 설치"
    echo "  $0 /path/to/my/project      # 특정 프로젝트에 설치"
    echo ""
    echo "옵션:"
    echo "  -h, --help                   # 이 도움말 출력"
    echo "  --global                     # 전역 설치 (npm -g)"
    echo ""
}

# 인수 처리
TARGET_DIR="${1:-$(pwd)}"
GLOBAL_INSTALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --global)
            GLOBAL_INSTALL=true
            shift
            ;;
        *)
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

print_status "🚀 Auto-Docs 자동 문서화 시스템 설치 시작..."

# 전제 조건 확인
print_status "📋 전제 조건 확인 중..."

# Node.js 확인
if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되어 있지 않습니다."
    print_error "https://nodejs.org 에서 Node.js를 설치해주세요."
    exit 1
fi

# npm 확인
if ! command -v npm &> /dev/null; then
    print_error "npm이 설치되어 있지 않습니다."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js 버전: $NODE_VERSION"

# Auto-Docs 소스 확인
if [[ ! -d "$AUTO_DOCS_SOURCE" ]]; then
    print_error "Auto-Docs 소스를 찾을 수 없습니다: $AUTO_DOCS_SOURCE"
    exit 1
fi

# 전역 설치
if [[ "$GLOBAL_INSTALL" == true ]]; then
    print_status "🌍 전역 설치 진행 중..."
    
    cd "$AUTO_DOCS_SOURCE"
    npm install -g .
    
    print_success "✅ Auto-Docs가 전역으로 설치되었습니다!"
    print_status "이제 어디서든 'auto-docs' 명령어를 사용할 수 있습니다."
    
    echo ""
    echo "사용법:"
    echo "  auto-docs init                # 현재 프로젝트 초기화"
    echo "  auto-docs watch              # 파일 변경 모니터링"
    echo "  auto-docs status             # 상태 확인"
    
    exit 0
fi

# 대상 디렉토리 확인 및 생성
if [[ ! -d "$TARGET_DIR" ]]; then
    print_warning "대상 디렉토리가 존재하지 않습니다: $TARGET_DIR"
    read -p "디렉토리를 생성하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$TARGET_DIR"
        print_success "디렉토리가 생성되었습니다: $TARGET_DIR"
    else
        print_error "설치가 취소되었습니다."
        exit 1
    fi
fi

print_status "📁 대상 디렉토리: $TARGET_DIR"

# Auto-Docs 복사
AUTO_DOCS_TARGET="$TARGET_DIR/auto-docs"

if [[ -d "$AUTO_DOCS_TARGET" ]]; then
    print_warning "Auto-Docs가 이미 설치되어 있습니다: $AUTO_DOCS_TARGET"
    read -p "덮어쓰시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$AUTO_DOCS_TARGET"
        print_status "기존 설치를 제거했습니다."
    else
        print_error "설치가 취소되었습니다."
        exit 1
    fi
fi

print_status "📦 Auto-Docs 복사 중..."
cp -r "$AUTO_DOCS_SOURCE" "$AUTO_DOCS_TARGET"

# 실행 권한 설정
chmod +x "$AUTO_DOCS_TARGET/cli.js"
chmod +x "$AUTO_DOCS_TARGET/index.js"

# 의존성 설치
print_status "📥 의존성 설치 중..."
cd "$AUTO_DOCS_TARGET"
npm install

# 초기화
print_status "⚙️ Auto-Docs 초기화 중..."
node cli.js init --path "$TARGET_DIR"

print_success "🎉 Auto-Docs 설치가 완료되었습니다!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 빠른 시작 가이드"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣ 파일 변경 모니터링 시작:"
echo "   cd '$TARGET_DIR'"
echo "   ./auto-docs/cli.js watch"
echo ""
echo "2️⃣ 백그라운드에서 실행:"
echo "   nohup ./auto-docs/cli.js watch &"
echo ""
echo "3️⃣ 상태 확인:"
echo "   ./auto-docs/cli.js status"
echo ""
echo "4️⃣ 수동 문서 생성:"
echo "   ./auto-docs/cli.js generate"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 생성된 파일들"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ .auto-docs.yml        # 설정 파일"
echo "✅ README.md            # 자동 생성된 프로젝트 문서"
echo "✅ PROGRESS.md          # SuperClaude 연동 진행 상황"
echo "✅ CHANGELOG.md         # 자동 변경 로그"
echo "✅ docs/                # 문서 폴더"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 SuperClaude 연동"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 /checkpoint 명령어 사용 시 자동으로:"
echo "   • checkpoints/ 폴더 변경 감지"
echo "   • PROGRESS.md 자동 업데이트"
echo "   • CHANGELOG.md 변경 사항 추가"
echo "   • README.md 최신 정보 반영"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_success "설치 완료! 자동 문서화를 시작하세요! 🎉"