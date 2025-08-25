#!/bin/bash

# check-github-before-push.sh
# Safety script to check GitHub status before pushing changes
# Prevents accidental overwrites and ensures safe deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 GitHub Pre-Push Safety Check${NC}"
echo "================================================"

# Function to check if a remote has changes
check_remote() {
    local remote=$1
    local remote_url=$2
    
    echo -e "\n${YELLOW}Checking remote: ${remote}${NC}"
    echo "URL: ${remote_url}"
    
    # Fetch latest from remote without merging
    git fetch ${remote} --quiet 2>/dev/null || {
        echo -e "${RED}❌ Failed to fetch from ${remote}${NC}"
        return 1
    }
    
    # Get current branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Check if remote branch exists
    if ! git ls-remote --heads ${remote} ${current_branch} | grep -q ${current_branch}; then
        echo -e "${GREEN}✅ Remote branch doesn't exist yet - safe to push${NC}"
        return 0
    fi
    
    # Compare local and remote
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse ${remote}/${current_branch} 2>/dev/null || echo "none")
    
    if [ "$remote_commit" = "none" ]; then
        echo -e "${GREEN}✅ No remote branch found - safe to push${NC}"
        return 0
    fi
    
    if [ "$local_commit" = "$remote_commit" ]; then
        echo -e "${GREEN}✅ Local and remote are in sync${NC}"
        return 0
    fi
    
    # Check if local is ahead
    local ahead=$(git rev-list --count ${remote}/${current_branch}..HEAD)
    local behind=$(git rev-list --count HEAD..${remote}/${current_branch})
    
    if [ "$behind" -gt 0 ]; then
        echo -e "${RED}⚠️  WARNING: Local is ${behind} commits behind remote!${NC}"
        echo -e "${RED}Remote has changes that are not in local.${NC}"
        
        # Show the commits we're behind
        echo -e "\n${YELLOW}Remote commits not in local:${NC}"
        git log --oneline HEAD..${remote}/${current_branch} | head -5
        
        return 2
    fi
    
    if [ "$ahead" -gt 0 ]; then
        echo -e "${GREEN}✅ Local is ${ahead} commits ahead - safe to push${NC}"
        return 0
    fi
    
    return 0
}

# Function to check all remotes
check_all_remotes() {
    local has_conflicts=false
    
    # Check main repository
    if git remote get-url origin &>/dev/null; then
        check_remote "origin" "$(git remote get-url origin)"
        if [ $? -eq 2 ]; then
            has_conflicts=true
        fi
    fi
    
    # Check client repository
    if git remote get-url client &>/dev/null; then
        check_remote "client" "$(git remote get-url client)"
        if [ $? -eq 2 ]; then
            has_conflicts=true
        fi
    fi
    
    # Check shared repository
    if git remote get-url shared &>/dev/null; then
        check_remote "shared" "$(git remote get-url shared)"
        if [ $? -eq 2 ]; then
            has_conflicts=true
        fi
    fi
    
    return $([ "$has_conflicts" = true ] && echo 1 || echo 0)
}

# Main execution
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        echo "Please commit or stash them before checking remote status"
        exit 1
    fi
    
    # Check all remotes
    check_all_remotes
    
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}⛔ SAFETY CHECK FAILED!${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "\n${YELLOW}Remote repositories have changes not in local.${NC}"
        echo -e "${YELLOW}Options:${NC}"
        echo -e "  1. Pull changes first: ${GREEN}git pull${NC}"
        echo -e "  2. Force push (DANGEROUS): ${RED}git push --force${NC}"
        echo -e "  3. Review changes: ${GREEN}git diff origin/main HEAD${NC}"
        echo ""
        echo -e "${YELLOW}To override this check (NOT RECOMMENDED):${NC}"
        echo -e "  ${RED}SKIP_GITHUB_CHECK=1 npm run push:all${NC}"
        exit 1
    else
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ ALL SAFETY CHECKS PASSED!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}Safe to proceed with push to all repositories${NC}"
        exit 0
    fi
}

# Run main function
main "$@"