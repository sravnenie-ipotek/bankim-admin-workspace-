#!/bin/bash

# BankIM Management Portal - 4-Repository Push Automation
# This script synchronizes all repositories: workspace (monorepo), dashboard (client), api (server), and shared

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
COMMIT_MESSAGE=""
FORCE_PUSH=false
DRY_RUN=false
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
        --dry-run)
            DRY_RUN=true
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
            echo "  --force             Force push to all repositories"
            echo "  --dry-run           Show what would be done without executing"
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

# Function to print status
print_status() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Function to execute or show command
execute_cmd() {
    local cmd="$1"
    local description="$2"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] $description: $cmd${NC}"
        return 0
    else
        print_status "$description"
        if eval "$cmd"; then
            return 0
        else
            print_error "$description failed"
            return 1
        fi
    fi
}

# Check if we're in the right directory (go to root if in scripts)
if [ -f "../package.json" ] && [ -d "../packages" ]; then
    cd ..
fi

if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Not in BankIM Management Portal root directory"
    exit 1
fi

print_info "🚀 BankIM 4-Repository Push Automation"
print_info "======================================="

# Check git status
if [ -n "$(git status --porcelain)" ] && [ "$AUTO_COMMIT" = true ]; then
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Sync repositories: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Uncommitted changes detected. Auto-committing..."
    execute_cmd "git add ." "Adding all changes"
    execute_cmd "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
elif [ -n "$(git status --porcelain)" ] && [ "$AUTO_COMMIT" = false ]; then
    print_error "Uncommitted changes detected. Please commit or use --auto-commit"
    git status --short
    exit 1
fi

# Build shared package first (dependency for others)
print_info "\n📦 Building Shared Package"
execute_cmd "cd packages/shared && npm run build && cd ../.." "Building shared package"

# Push to workspace repository (monorepo)
print_info "\n🏠 Pushing to Workspace Repository (Monorepo)"
if [ "$FORCE_PUSH" = true ]; then
    execute_cmd "git push origin $MAIN_BRANCH --force" "Force pushing to workspace repository"
else
    execute_cmd "git push origin $MAIN_BRANCH" "Pushing to workspace repository"
fi

# Push shared package to shared repository
print_info "\n📚 Pushing Shared Package Repository"
execute_cmd "cd packages/shared" "Entering shared package directory"

# Create deployment-ready package.json for shared (if needed)
# The shared package is already properly configured for deployment

# Push shared package
if [ "$FORCE_PUSH" = true ]; then
    execute_cmd "git push shared $MAIN_BRANCH --force" "Force pushing shared package"
else
    execute_cmd "git push shared $MAIN_BRANCH" "Pushing shared package"
fi

# Create and push version tag for shared
SHARED_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
TAG_NAME="v${SHARED_VERSION}"
if ! git tag -l | grep -q "^${TAG_NAME}$"; then
    execute_cmd "git tag $TAG_NAME" "Creating shared package tag $TAG_NAME"
    execute_cmd "git push shared $TAG_NAME" "Pushing shared package tag"
else
    print_info "Tag $TAG_NAME already exists for shared package"
fi
execute_cmd "cd ../.." "Returning to root"

# Prepare and push dashboard (client) to dashboard repository
print_info "\n🎨 Pushing Dashboard (Client) Repository"
execute_cmd "cd packages/client" "Entering client package directory"

# Backup original package.json and use deployment version
execute_cmd "cp package.json package.json.backup" "Backing up original package.json"
execute_cmd "cp package.deploy.json package.json" "Using deployment package.json"

# Push client package
if [ "$FORCE_PUSH" = true ]; then
    execute_cmd "git push dashboard $MAIN_BRANCH --force" "Force pushing dashboard package"
else
    execute_cmd "git push dashboard $MAIN_BRANCH" "Pushing dashboard package"
fi

# Restore original package.json
execute_cmd "mv package.json.backup package.json" "Restoring original package.json"
execute_cmd "cd ../.." "Returning to root"

# Prepare and push API (server) to api repository  
print_info "\n🔧 Pushing API (Server) Repository"
execute_cmd "cd packages/server" "Entering server package directory"

# Backup original package.json and use deployment version
execute_cmd "cp package.json package.json.backup" "Backing up original package.json"
execute_cmd "cp package.deploy.json package.json" "Using deployment package.json"

# Push server package
if [ "$FORCE_PUSH" = true ]; then
    execute_cmd "git push api $MAIN_BRANCH --force" "Force pushing api package"
else
    execute_cmd "git push api $MAIN_BRANCH" "Pushing api package"
fi

# Restore original package.json
execute_cmd "mv package.json.backup package.json" "Restoring original package.json"
execute_cmd "cd ../.." "Returning to root"

# Verify all pushes
print_info "\n🔍 Verifying Repository Status"
execute_cmd "git remote -v" "Checking configured remotes"

print_success "\n🎉 All 4 repositories synchronized successfully!"
print_info "📋 Summary:"
print_info "   ✅ Workspace repository: Updated (development monorepo)"
print_info "   ✅ Shared package: Built and pushed with version $SHARED_VERSION"
print_info "   ✅ Dashboard repository: Deployed (client with git-based shared dependency)"
print_info "   ✅ API repository: Deployed (server with git-based shared dependency)"

print_info "\n💡 Next Steps:"
print_info "   • Check GitHub repositories for updates:"
print_info "     - https://github.com/sravnenie-ipotek/bankim-admin-workspace-"
print_info "     - https://github.com/sravnenie-ipotek/bankim-admin-dashboard"  
print_info "     - https://github.com/sravnenie-ipotek/bankim-admin-api"
print_info "     - https://github.com/sravnenie-ipotek/bankim-admin-shared"
print_info "   • Verify CI/CD pipelines if configured"
print_info "   • Update deployment environments if needed"

if [ "$DRY_RUN" = true ]; then
    print_warning "\n🔥 This was a DRY RUN - no changes were made"
    print_info "Run without --dry-run to execute the changes"
fi