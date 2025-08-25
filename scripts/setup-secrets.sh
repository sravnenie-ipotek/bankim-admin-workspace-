#!/bin/bash

# Production Secrets Setup Script
# Sets up GitHub Secrets and environment configuration

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}
╔════════════════════════════════════════╗
║     BankIM Secrets Configuration      ║
║         Production Setup               ║
╚════════════════════════════════════════╝${NC}"
}

print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "════════════════════════════════════════"
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

check_requirements() {
    print_section "Checking Requirements"
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) not installed. Please install: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI not authenticated. Please run: gh auth login"
        exit 1
    fi
    
    print_success "All requirements met"
}

setup_github_secrets() {
    print_section "Setting up GitHub Repository Secrets"
    
    echo "Please provide the following information:"
    echo ""
    
    # Server credentials
    read -p "🔑 SSH Username (root): " SSH_USERNAME
    SSH_USERNAME=${SSH_USERNAME:-root}
    
    echo "🔑 TEST Server Password (91.202.169.54):"
    read -s TEST_SERVER_PASSWORD
    echo ""
    
    echo "🔑 PROD Server Password (185.220.207.52):"
    read -s PROD_SERVER_PASSWORD
    echo ""
    
    # Database URLs
    echo "📊 Database Configuration:"
    read -p "CONTENT_DATABASE_URL (Railway): " CONTENT_DB_URL
    read -p "CORE_DATABASE_URL (Railway): " CORE_DB_URL
    read -p "MANAGEMENT_DATABASE_URL (Railway): " MANAGEMENT_DB_URL
    
    # Security tokens
    echo "🛡️  Security Configuration:"
    read -p "SNYK_TOKEN (optional): " SNYK_TOKEN
    read -p "JWT_SECRET (will generate if empty): " JWT_SECRET
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        print_success "Generated JWT_SECRET"
    fi
    
    # Approval settings
    echo "👥 Deployment Approvers:"
    read -p "Production Approvers (GitHub usernames, comma-separated): " PROD_APPROVERS
    read -p "Emergency Approvers (GitHub usernames, comma-separated): " EMERGENCY_APPROVERS
    
    # Notification settings
    echo "📢 Notifications:"
    read -p "Slack Webhook URL (optional): " SLACK_WEBHOOK
    
    print_section "Setting GitHub Secrets"
    
    # Server Configuration
    gh secret set SSH_USERNAME --body "$SSH_USERNAME"
    gh secret set TEST_SERVER_HOST --body "91.202.169.54"
    gh secret set PROD_SERVER_HOST --body "185.220.207.52"
    gh secret set TEST_SERVER_PASSWORD --body "$TEST_SERVER_PASSWORD"
    gh secret set PROD_SERVER_PASSWORD --body "$PROD_SERVER_PASSWORD"
    
    # Database Configuration
    gh secret set CONTENT_DATABASE_URL --body "$CONTENT_DB_URL"
    gh secret set CORE_DATABASE_URL --body "$CORE_DB_URL"
    gh secret set MANAGEMENT_DATABASE_URL --body "$MANAGEMENT_DB_URL"
    
    # Security Configuration
    gh secret set JWT_SECRET --body "$JWT_SECRET"
    if [ -n "$SNYK_TOKEN" ]; then
        gh secret set SNYK_TOKEN --body "$SNYK_TOKEN"
    fi
    
    # Approval Configuration
    gh secret set PROD_APPROVERS --body "$PROD_APPROVERS"
    gh secret set EMERGENCY_APPROVERS --body "$EMERGENCY_APPROVERS"
    
    # Notification Configuration
    if [ -n "$SLACK_WEBHOOK" ]; then
        gh secret set SLACK_WEBHOOK_URL --body "$SLACK_WEBHOOK"
    fi
    
    print_success "GitHub secrets configured successfully"
}

setup_environments() {
    print_section "Setting up GitHub Environments"
    
    # Create environments
    gh api -X PUT "/repos/:owner/:repo/environments/test" \
        --field wait_timer=0 \
        --field reviewers='[]' || true
    
    gh api -X PUT "/repos/:owner/:repo/environments/production" \
        --field wait_timer=5 \
        --field reviewers='[{"type":"User","id":null}]' || true
    
    gh api -X PUT "/repos/:owner/:repo/environments/production-hotfix" \
        --field wait_timer=0 \
        --field reviewers='[{"type":"User","id":null}]' || true
    
    print_success "GitHub environments configured"
}

generate_env_templates() {
    print_section "Generating Environment Templates"
    
    # Test environment
    cat > packages/server/.env.test << EOF
# BankIM Test Environment Configuration
NODE_ENV=test
PORT=8003

# Database URLs - Test/Staging
CONTENT_DATABASE_URL=${CONTENT_DB_URL}
CORE_DATABASE_URL=${CORE_DB_URL}
MANAGEMENT_DATABASE_URL=${MANAGEMENT_DB_URL}

# Security
JWT_SECRET=${JWT_SECRET}
API_RATE_LIMIT=1000

# Logging
LOG_LEVEL=debug

# Redis (if applicable)
REDIS_URL=redis://localhost:6379/1

# Feature Flags
ENABLE_DEBUG_ROUTES=true
ENABLE_VERBOSE_LOGGING=true
EOF
    
    # Production environment
    cat > packages/server/.env.production << EOF
# BankIM Production Environment Configuration
NODE_ENV=production
PORT=8003

# Database URLs - Production
CONTENT_DATABASE_URL=${CONTENT_DB_URL}
CORE_DATABASE_URL=${CORE_DB_URL}
MANAGEMENT_DATABASE_URL=${MANAGEMENT_DB_URL}

# Security
JWT_SECRET=${JWT_SECRET}
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info

# Redis (if applicable)
REDIS_URL=redis://localhost:6379/0

# Feature Flags
ENABLE_DEBUG_ROUTES=false
ENABLE_VERBOSE_LOGGING=false

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
    
    # Client environments
    cat > packages/client/.env.test << EOF
# BankIM Client Test Environment
VITE_API_URL=http://91.202.169.54:8003/api
VITE_ENVIRONMENT=test
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
EOF
    
    cat > packages/client/.env.production << EOF
# BankIM Client Production Environment
VITE_API_URL=http://185.220.207.52:8003/api
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=info
EOF
    
    print_success "Environment templates generated"
    print_warning "Review and customize .env files before deployment"
}

setup_branch_protection() {
    print_section "Setting up Branch Protection Rules"
    
    # Main branch protection
    gh api -X PUT "/repos/:owner/:repo/branches/main/protection" \
        --field required_status_checks='{"strict":true,"contexts":["quality-gates","multi-repo-build","database-validation","security-scan"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
        --field restrictions=null || true
    
    # Develop branch protection
    gh api -X PUT "/repos/:owner/:repo/branches/develop/protection" \
        --field required_status_checks='{"strict":true,"contexts":["quality-gates","multi-repo-build"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        --field restrictions=null || true
    
    print_success "Branch protection rules configured"
}

create_deployment_docs() {
    print_section "Creating Deployment Documentation"
    
    mkdir -p docs/deployment
    
    cat > docs/deployment/README.md << 'EOF'
# BankIM Deployment Guide

## Environments

### Test Environment (91.202.169.54)
- **Purpose**: Integration testing, QA validation
- **Auto-deploys**: `develop` branch
- **Access**: http://91.202.169.54:8003
- **Database**: Railway test instance

### Production Environment (185.220.207.52)
- **Purpose**: Live production
- **Auto-deploys**: `main` branch (with approval)
- **Access**: http://185.220.207.52:8003
- **Database**: Railway production instance

## Deployment Process

### Regular Deployment
1. Feature development on `feature/*` branches
2. Pull request to `develop` → auto-deploy to TEST
3. Testing and QA validation on TEST
4. Pull request from `develop` to `main`
5. Approval required → deploy to PRODUCTION

### Emergency Hotfix
1. Create `hotfix/*` branch from `main`
2. Make critical fixes
3. Emergency approval → direct deploy to PRODUCTION
4. Auto-merge to `main` and `develop`

## Manual Commands

```bash
# Check deployment status
gh workflow run "CI Pipeline" --ref main

# View deployment logs
gh run list --workflow="CI Pipeline"

# Emergency rollback (on server)
ssh root@185.220.207.52
cd /var/www/bankim
./rollback.sh
```

## Monitoring

- **Health Checks**: /api/health endpoint
- **Logs**: PM2 logs on servers
- **Backups**: Automated daily backups
- **Alerts**: Slack notifications for failures

## Security

- All secrets managed via GitHub Secrets
- Database access via Railway connections
- SSH access with password authentication
- Firewall configured for minimal surface area
EOF
    
    cat > docs/deployment/TROUBLESHOOTING.md << 'EOF'
# Deployment Troubleshooting

## Common Issues

### 1. Deployment Failures
- Check GitHub Actions logs
- Verify server SSH connectivity
- Ensure database connectivity
- Check disk space on servers

### 2. Database Issues
- Verify Railway database connectivity
- Check migration status
- Review database logs
- Validate connection strings

### 3. Service Issues
- Check PM2 status: `pm2 list`
- Review service logs: `pm2 logs`
- Restart services: `pm2 restart all`
- Check health endpoints

### 4. Emergency Procedures
- Immediate rollback: Use GitHub Actions rollback
- Manual rollback: SSH to server, run rollback script
- Database rollback: Use migration rollback feature
- Incident communication: Update team via Slack

## Useful Commands

```bash
# Server health check
ssh root@185.220.207.52 'cd /var/www/bankim && ./health-check.sh'

# Manual deployment
ssh root@185.220.207.52 'cd /var/www/bankim && ./deploy.sh'

# View real-time logs
ssh root@185.220.207.52 'pm2 logs --lines 100'

# Database status
ssh root@185.220.207.52 'cd /var/www/bankim/api && node migrations/migration-runner.js status'
```
EOF
    
    print_success "Deployment documentation created"
}

main() {
    print_header
    
    echo "This script will configure production-grade CI/CD for BankIM"
    echo "Make sure you have admin access to the GitHub repository"
    echo ""
    read -p "Continue? (y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
    
    check_requirements
    setup_github_secrets
    setup_environments
    generate_env_templates
    setup_branch_protection
    create_deployment_docs
    
    print_section "Setup Complete!"
    print_success "🎉 CI/CD pipeline configured successfully"
    echo ""
    print_warning "Next steps:"
    echo "1. Review generated .env files in packages/"
    echo "2. Test the pipeline with a feature branch"
    echo "3. Configure Slack webhooks if desired"
    echo "4. Review branch protection rules in GitHub"
    echo "5. Test emergency hotfix process"
    echo ""
    print_success "Your production-grade CI/CD pipeline is ready! 🚀"
}

main "$@"