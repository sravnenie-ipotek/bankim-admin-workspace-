#!/bin/bash

# BankIM Management Portal - API (Server) Repository Push  
# This script pushes only the server package to the api repository

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

print_info "🔧 BankIM API (Server) Push"
print_info "============================"

# Ensure workspace is committed
if [ -n "$(git status --porcelain)" ]; then
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Update API: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Committing workspace changes..."
    git add .
    git commit -m "$COMMIT_MESSAGE"
fi

# Build shared package (dependency)
print_status "Building shared package dependency..."
cd packages/shared && npm run build && cd ../..

# Push to api repository
print_status "Entering server package directory..."
cd packages/server

# Backup original package.json and use deployment version
cp package.json package.json.backup
cp package.deploy.json package.json

print_status "Pushing to api repository..."
if [ "$FORCE_PUSH" = true ]; then
    git push api $MAIN_BRANCH --force
else
    git push api $MAIN_BRANCH
fi

# Restore original package.json
mv package.json.backup package.json
cd ../..

print_success "API repository updated successfully!"
print_info "📋 Repository: https://github.com/sravnenie-ipotek/bankim-admin-api"