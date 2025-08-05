#!/bin/bash

# Server Package Push Script
# Pushes the server package to the main repository (origin)

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

# Check if we're in the server directory
if [ ! -f "package.json" ] || ! grep -q "@bankim/server" package.json; then
    print_error "Not in server package directory"
    exit 1
fi

print_info "🔧 BankIM Server Package Publisher"
print_info "=================================="

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    COMMIT_MESSAGE="Update server package: $(date '+%Y-%m-%d %H:%M:%S')"
    print_status "Committing changes..."
    git add .
    git commit -m "$COMMIT_MESSAGE"
fi

# Push to main repository (server code stays in origin)
print_status "Pushing to main repository..."
git push origin main

# Create version tag
SERVER_VERSION=$(node -p "require('./package.json').version")
TAG_NAME="server-v${SERVER_VERSION}"

if ! git tag -l | grep -q "^${TAG_NAME}$"; then
    print_status "Creating tag $TAG_NAME..."
    git tag $TAG_NAME
    git push origin $TAG_NAME
else
    print_info "Tag $TAG_NAME already exists"
fi

print_success "Server package published successfully!"
print_info "🔗 Repository: https://github.com/MichaelMishaev/bankimOnlineAdmin"
print_info "📦 Version: $SERVER_VERSION"