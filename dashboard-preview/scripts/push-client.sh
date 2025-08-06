#!/bin/bash

# Client Package Push Script
# Pushes the client package to its dedicated repository

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}🔄 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }

# Check if we're in the client directory
if [ ! -f "package.json" ] || ! grep -q "@bankim/client" package.json; then
    print_error "Not in client package directory"
    exit 1
fi

print_info "🎨 BankIM Client Package Publisher"
print_info "=================================="

# Build the client package
print_status "Building client package..."
npm run build

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    COMMIT_MESSAGE="Build client package: $(date '+%Y-%m-%d %H:%M:%S')"
    print_status "Committing changes..."
    git add .
    git commit -m "$COMMIT_MESSAGE"
fi

# Push to client repository
print_status "Pushing to client repository..."
git push client main

# Create version tag
CLIENT_VERSION=$(node -p "require('./package.json').version")
TAG_NAME="client-v${CLIENT_VERSION}"

if ! git tag -l | grep -q "^${TAG_NAME}$"; then
    print_status "Creating tag $TAG_NAME..."
    git tag $TAG_NAME
    git push client $TAG_NAME
else
    print_info "Tag $TAG_NAME already exists"
fi

print_success "Client package published successfully!"
print_info "🔗 Repository: https://github.com/MichaelMishaev/bankimOnlineAdmin_client"
print_info "📦 Version: $CLIENT_VERSION"