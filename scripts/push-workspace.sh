#!/bin/bash

# BankIM Management Portal - Workspace (Monorepo) Repository Push
# This script pushes the complete monorepo to the workspace repository

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

MAIN_BRANCH="main"
COMMIT_MESSAGE=""
FORCE_PUSH=false
AUTO_COMMIT=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        --force)
            FORCE_PUSH=true
            shift
            ;;
        --no-auto-commit)
            AUTO_COMMIT=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -m, --message MSG    Commit message"
            echo "  --force             Force push"
            echo "  --no-auto-commit    Don't auto-commit changes"
            echo "  -h, --help          Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_status() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ -f "../package.json" ] && [ -d "../packages" ]; then
    cd ..
fi

if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Not in BankIM Management Portal root directory"
    exit 1
fi

print_info "🏠 BankIM Workspace (Monorepo) Push"
print_info "==================================="

# Check git status and commit if needed
if [ -n "$(git status --porcelain)" ] && [ "$AUTO_COMMIT" = true ]; then
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Workspace update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Uncommitted changes detected. Auto-committing..."
    git add .
    git commit -m "$COMMIT_MESSAGE"
elif [ -n "$(git status --porcelain)" ] && [ "$AUTO_COMMIT" = false ]; then
    print_error "Uncommitted changes detected. Please commit or use --auto-commit"
    git status --short
    exit 1
fi

# Build shared package (good practice before pushing workspace)
print_status "Building shared package..."
cd packages/shared && npm run build && cd ../..

# Push to workspace repository
print_status "Pushing to workspace repository..."
if [ "$FORCE_PUSH" = true ]; then
    git push origin $MAIN_BRANCH --force
else
    git push origin $MAIN_BRANCH
fi

print_success "Workspace repository updated successfully!"
print_info "📋 Repository: https://github.com/sravnenie-ipotek/bankim-admin-workspace-"
print_info "💡 This repository contains the complete monorepo for development"