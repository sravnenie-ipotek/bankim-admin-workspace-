#!/bin/bash

# BankIM Management Portal - Shared Package Repository Push
# This script pushes only the shared package to the shared repository

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
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -m, --message MSG    Commit message"
            echo "  --force             Force push"
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

# Check if we're in the right directory
if [ -f "../package.json" ] && [ -d "../packages" ]; then
    cd ..
fi

if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Not in BankIM Management Portal root directory"
    exit 1
fi

print_info "📚 BankIM Shared Package Push"
print_info "=============================="

# Ensure workspace is committed
if [ -n "$(git status --porcelain)" ]; then
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Update shared package: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Committing workspace changes..."
    git add .
    git commit -m "$COMMIT_MESSAGE"
fi

# Build and push shared package
print_status "Entering shared package directory..."
cd packages/shared

print_status "Building shared package..."
npm run build

print_status "Pushing to shared repository..."
if [ "$FORCE_PUSH" = true ]; then
    git push shared $MAIN_BRANCH --force
else
    git push shared $MAIN_BRANCH
fi

# Create and push version tag
SHARED_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
TAG_NAME="v${SHARED_VERSION}"

if ! git tag -l | grep -q "^${TAG_NAME}$"; then
    print_status "Creating version tag $TAG_NAME..."
    git tag $TAG_NAME
    git push shared $TAG_NAME
    print_success "Version tag $TAG_NAME created and pushed"
else
    print_info "Tag $TAG_NAME already exists"
fi

cd ../..

print_success "Shared package repository updated successfully!"
print_info "📋 Repository: https://github.com/sravnenie-ipotek/bankim-admin-shared"
print_info "📦 Version: $SHARED_VERSION"