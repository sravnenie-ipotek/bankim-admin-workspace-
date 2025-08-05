#\!/bin/bash

# Setup Git Hooks for Automated Repository Synchronization
# This script installs git hooks to automate multi-repository pushes

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

print_info "🔧 Setting up Git Hooks for Multi-Repository Sync"
print_info "================================================="

# Check if we're in the right directory
if [ \! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Go to root if we're in scripts directory
if [ -f "../package.json" ] && [ -d "../packages" ]; then
    cd ..
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-push hook
print_status "Creating pre-push hook..."
cat > .git/hooks/pre-push << 'HOOKEOF'
#\!/bin/bash

# Pre-push hook for BankIM Management Portal
# Automatically synchronizes all repositories before pushing

set -e

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 BankIM: Running pre-push synchronization...${NC}"

# Check if push-all-repos script exists
if [ -f "./scripts/push-all-repos.sh" ]; then
    # Run dry-run first to check for issues
    if ./scripts/push-all-repos.sh --dry-run --no-auto-commit; then
        echo -e "${GREEN}✅ Pre-push checks passed${NC}"
    else
        echo -e "${RED}❌ Pre-push checks failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Push automation script not found, skipping sync${NC}"
fi

echo -e "${GREEN}✅ Pre-push hook completed${NC}"
HOOKEOF

# Make pre-push hook executable
chmod +x .git/hooks/pre-push

# Create post-commit hook for automatic tagging
print_status "Creating post-commit hook..."
cat > .git/hooks/post-commit << 'HOOKEOF'
#\!/bin/bash

# Post-commit hook for BankIM Management Portal
# Automatically creates tags for significant commits

# Get the commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Check if this is a release commit
if echo "$COMMIT_MSG" | grep -qE "(release|version|v[0-9]+\.[0-9]+\.[0-9]+)"; then
    echo "🏷️  Release commit detected, consider creating a tag"
    echo "   Run: git tag v<version> && git push --tags"
fi
HOOKEOF

chmod +x .git/hooks/post-commit

print_success "Git hooks installed successfully\!"
print_info "📋 Installed hooks:"
print_info "   • pre-push: Validates sync before pushing"
print_info "   • post-commit: Suggests tagging for releases"

print_info "\n💡 Usage:"
print_info "   • Hooks run automatically on git operations"
print_info "   • To bypass hooks: git push --no-verify"
print_info "   • To test hooks: ./scripts/push-all-repos.sh --dry-run"
EOF < /dev/null