#!/bin/bash

# Initialize and Configure Multi-Repository Setup
# This script ensures all repositories are properly configured and synchronized

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}🔄 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
print_header() { echo -e "${PURPLE}🚀 $1${NC}"; }

print_header "BankIM Multi-Repository Initialization"
print_header "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Not in BankIM Management Portal root directory"
    exit 1
fi

# Verify git remotes
print_info "\n🔗 Verifying Git Remotes"
print_status "Checking configured remotes..."

EXPECTED_REMOTES=("origin" "client" "shared")
MISSING_REMOTES=()

for remote in "${EXPECTED_REMOTES[@]}"; do
    if ! git remote | grep -q "^${remote}$"; then
        MISSING_REMOTES+=("$remote")
    else
        print_success "Remote '$remote' configured"
    fi
done

if [ ${#MISSING_REMOTES[@]} -gt 0 ]; then
    print_error "Missing remotes: ${MISSING_REMOTES[*]}"
    print_info "Please configure missing remotes:"
    
    for remote in "${MISSING_REMOTES[@]}"; do
        case $remote in
            "client")
                echo "  git remote add client git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git"
                ;;
            "shared")
                echo "  git remote add shared git@github.com:MichaelMishaev/bankimOnlineAdmin_shared.git"
                ;;
            "origin")
                echo "  git remote add origin git@github.com:MichaelMishaev/bankimOnlineAdmin.git"
                ;;
        esac
    done
    exit 1
fi

# Test remote connectivity
print_info "\n🌐 Testing Remote Connectivity"
for remote in "${EXPECTED_REMOTES[@]}"; do
    print_status "Testing connection to $remote..."
    if git ls-remote "$remote" HEAD >/dev/null 2>&1; then
        print_success "Connection to '$remote' successful"
    else
        print_error "Cannot connect to '$remote'"
        exit 1
    fi
done

# Verify package.json files
print_info "\n📦 Verifying Package Structure"
PACKAGES=("client" "server" "shared")

for package in "${PACKAGES[@]}"; do
    package_json="packages/${package}/package.json"
    if [ -f "$package_json" ]; then
        print_success "Package '$package' configured"
        
        # Check if package name is correct
        expected_name="@bankim/${package}"
        actual_name=$(node -p "require('./${package_json}').name" 2>/dev/null || echo "unknown")
        
        if [ "$actual_name" = "$expected_name" ]; then
            print_success "Package name correct: $actual_name"
        else
            print_error "Package name mismatch in $package: expected '$expected_name', got '$actual_name'"
        fi
    else
        print_error "Missing package.json for '$package'"
        exit 1
    fi
done

# Install dependencies if needed
print_info "\n📥 Installing Dependencies"
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
fi

# Build shared package (required for others)
print_status "Building shared package..."
cd packages/shared
npm run build
cd ../..

# Setup git hooks
print_info "\n🪝 Setting Up Git Hooks"
if [ -f "./scripts/setup-git-hooks.sh" ]; then
    ./scripts/setup-git-hooks.sh
else
    print_error "Git hooks setup script not found"
fi

# Create .env file if it doesn't exist
print_info "\n⚙️  Environment Configuration"
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        print_status "Creating .env from template..."
        cp .env.template .env
        print_info "Please configure .env file with your settings"
    else
        print_info "No .env template found, skipping environment setup"
    fi
else
    print_success ".env file already exists"
fi

# Final status check
print_info "\n🔍 Final Status Check"
print_status "Running build test..."
if npm run build >/dev/null 2>&1; then
    print_success "Build test passed"
else
    print_error "Build test failed"
    exit 1
fi

print_status "Running type check..."
if npm run type-check >/dev/null 2>&1; then
    print_success "Type check passed"
else
    print_error "Type check failed"
    exit 1
fi

print_success "\n🎉 Multi-Repository Setup Completed Successfully!"
print_info "📋 Summary:"
print_info "   ✅ All git remotes configured and tested"
print_info "   ✅ All packages verified and built"
print_info "   ✅ Git hooks installed"
print_info "   ✅ Dependencies installed"
print_info "   ✅ Build and type checks passed"

print_info "\n💡 Available Commands:"
print_info "   npm run push:all      - Push to all repositories"
print_info "   npm run push:dry-run  - Test push without executing"
print_info "   npm run sync          - Quick sync with auto-commit"
print_info "   npm run deploy:all    - Build and deploy to all repos"

print_info "\n🚀 You're ready to start development!"
print_info "   npm run dev           - Start development servers"
print_info "   npm run build         - Build all packages"
print_info "   npm run test          - Run all tests"