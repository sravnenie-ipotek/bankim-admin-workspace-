#!/bin/bash

# Publish Shared Package to GitHub
# This script builds and publishes the shared package to the GitHub repository

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Publishing Shared Package to GitHub${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in shared package directory${NC}"
    exit 1
fi

# Build the package
echo -e "${YELLOW}🔧 Building shared package...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected. Committing them...${NC}"
    git add .
    git commit -m "Build shared package v${CURRENT_VERSION}"
fi

# Push to shared repository
echo -e "${YELLOW}📤 Pushing to shared repository...${NC}"
git push shared main

# Create and push tag if it doesn't exist
TAG_NAME="v${CURRENT_VERSION}"
if ! git tag -l | grep -q "^${TAG_NAME}$"; then
    echo -e "${YELLOW}🏷️  Creating tag ${TAG_NAME}...${NC}"
    git tag ${TAG_NAME}
    git push shared ${TAG_NAME}
else
    echo -e "${YELLOW}🏷️  Tag ${TAG_NAME} already exists${NC}"
fi

echo -e "${GREEN}✅ Shared package published successfully!${NC}"
echo -e "${BLUE}📋 Package: @bankim/shared@${CURRENT_VERSION}${NC}"
echo -e "${BLUE}🔗 Repository: https://github.com/MichaelMishaev/bankimOnlineAdmin_shared${NC}"
echo -e ""
echo -e "${YELLOW}💡 To use this package in other projects:${NC}"
echo -e "   npm install git+https://github.com/MichaelMishaev/bankimOnlineAdmin_shared.git" 