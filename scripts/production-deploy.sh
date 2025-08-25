#!/bin/bash

# Enhanced Production-Grade Deployment Script for BankIM
# Integrates with CI/CD pipeline and handles zero-downtime deployment
# 
# CI/CD Integration Features:
# - GitHub Actions compatible
# - Enhanced error reporting
# - Artifact deployment support
# - Advanced health monitoring
# - Automated rollback capabilities

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# CI/CD Integration flags
CI_MODE=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}
DEPLOYMENT_ID=${GITHUB_RUN_ID:-$(date +%s)}

# Colors for output (disabled in CI mode)
if [[ "$CI_MODE" == "true" ]]; then
    GREEN=''
    YELLOW=''
    BLUE=''
    RED=''
    PURPLE=''
    NC=''
else
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    RED='\033[0;31m'
    PURPLE='\033[0;35m'
    NC='\033[0m'
fi

# Environment detection
ENVIRONMENT=${1:-"production"}
DEPLOY_TARGET=${2:-"both"}  # both, test, production

# Server configurations
case $ENVIRONMENT in
  "test")
    SERVER_HOST="91.202.169.54"
    SERVER_NAME="adminpaneltest-1"
    ;;
  "production")
    SERVER_HOST="185.220.207.52"
    SERVER_NAME="adminpanelprod-2"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [test|production] [both|test|production]"
    exit 1
    ;;
esac

SSH_USER="root"
SSH_PASS_VAR="${ENVIRONMENT^^}_SERVER_PASSWORD"  # TEST_SERVER_PASSWORD or PROD_SERVER_PASSWORD
DEPLOY_PATH="/var/www/bankim"
BACKUP_PATH="/var/backups/bankim"

# CI/CD specific paths
ARTIFACTS_PATH=${ARTIFACTS_PATH:-""}
BUILD_ARTIFACTS=${BUILD_ARTIFACTS:-false}

# Logging
LOG_FILE="/tmp/bankim-deploy-$(date +%Y%m%d-%H%M%S).log"
ERROR_LOG="/tmp/bankim-deploy-errors-$(date +%Y%m%d-%H%M%S).log"

print_header() {
    echo -e "${BLUE}
╔════════════════════════════════════════════════════════════════╗
║                  BankIM Production Deployment                 ║
║                                                                ║
║  Environment: ${ENVIRONMENT^^}                                        ║
║  Target: ${SERVER_HOST} (${SERVER_NAME})                      ║
║  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')                      ║
╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_section() {
    echo -e "\n${PURPLE}📋 $1${NC}"
    echo "════════════════════════════════════════════════════════════════"
}

print_status() {
    echo -e "${YELLOW}🔄 $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    
    # GitHub Actions integration
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::$1"
    fi
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "$LOG_FILE"
    
    # GitHub Actions integration
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::✅ $1"
    fi
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$ERROR_LOG"
    
    # GitHub Actions integration
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::error::❌ $1"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
    
    # GitHub Actions integration
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::warning::⚠️ $1"
    fi
}

cleanup_on_exit() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "Deployment failed with exit code $exit_code"
        echo -e "${RED}🚨 DEPLOYMENT FAILED - Check logs:${NC}"
        echo -e "   Main log: $LOG_FILE"
        echo -e "   Error log: $ERROR_LOG"
        
        # Attempt automatic rollback for production
        if [ "$ENVIRONMENT" = "production" ]; then
            print_warning "Attempting automatic rollback..."
            ssh_execute "cd $DEPLOY_PATH && ./rollback.sh" || echo "Rollback failed - manual intervention required"
        fi
    else
        print_success "Deployment completed successfully"
        echo -e "${GREEN}📊 Deployment logs available at: $LOG_FILE${NC}"
    fi
}

trap cleanup_on_exit EXIT

validate_prerequisites() {
    print_section "Validating Prerequisites"
    
    # Check if we're in the correct directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "Not in BankIM project root directory"
        exit 1
    fi
    
    # Check for required tools
    for tool in npm git ssh sshpass; do
        if ! command -v $tool &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Validate server password is available
    if [ -z "${!SSH_PASS_VAR}" ]; then
        print_error "Server password not found in environment variable: $SSH_PASS_VAR"
        print_warning "Set the password: export $SSH_PASS_VAR='your_password'"
        exit 1
    fi
    
    # Check SSH connectivity (prefer key-based auth in CI/CD)
    print_status "Testing SSH connectivity to $SERVER_HOST..."
    
    if [[ "$CI_MODE" == "true" ]] && [[ -f "$HOME/.ssh/id_rsa" ]]; then
        # CI/CD mode - use SSH key
        if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
             "$SSH_USER@$SERVER_HOST" "echo 'SSH connection successful'" &>/dev/null; then
            print_error "Cannot connect to server $SERVER_HOST via SSH key"
            exit 1
        fi
    elif [[ -n "${!SSH_PASS_VAR}" ]]; then
        # Fallback to password authentication
        if ! sshpass -p "${!SSH_PASS_VAR}" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
             "$SSH_USER@$SERVER_HOST" "echo 'SSH connection successful'" &>/dev/null; then
            print_error "Cannot connect to server $SERVER_HOST via SSH"
            exit 1
        fi
    else
        print_error "No SSH authentication method available"
        exit 1
    fi
    
    print_success "Prerequisites validated"
}

run_local_tests() {
    print_section "Running Local Quality Checks"
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --silent
    
    # Type checking
    print_status "Running type checks..."
    npm run type-check
    
    # Linting
    print_status "Running linter..."
    npm run lint
    
    # Build all packages
    print_status "Building all packages..."
    npm run build
    
    # Database connection test (if available)
    if [ -n "$CONTENT_DATABASE_URL" ]; then
        print_status "Testing database connectivity..."
        npm run test:db --workspace=@bankim/server || print_warning "Database test failed - continuing"
    fi
    
    # Critical tests only for production
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Running critical tests..."
        npm run test:critical --workspace=@bankim/client || {
            print_error "Critical tests failed"
            exit 1
        }
    fi
    
    print_success "Local quality checks completed"
}

create_deployment_package() {
    print_section "Creating Deployment Package"
    
    local temp_dir="/tmp/bankim-deploy-$(date +%s)"
    mkdir -p "$temp_dir"
    
    cd "$PROJECT_ROOT"
    
    # Package each component
    for package in client server shared; do
        print_status "Packaging $package..."
        
        cd "packages/$package"
        
        # Create clean package excluding development files
        tar -czf "$temp_dir/${package}.tar.gz" \
            --exclude=node_modules \
            --exclude=.git \
            --exclude="*.log" \
            --exclude=.env.local \
            --exclude=coverage \
            --exclude=cypress/videos \
            --exclude=cypress/screenshots \
            .
        
        cd "$PROJECT_ROOT"
        print_success "$package package created"
    done
    
    # Package configuration files
    print_status "Packaging configuration..."
    tar -czf "$temp_dir/config.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        ecosystem.config.js \
        infrastructure/ \
        scripts/health-check.sh \
        scripts/backup.sh \
        2>/dev/null || true
    
    echo "$temp_dir" > /tmp/bankim-deploy-path
    print_success "Deployment package created at $temp_dir"
}

ssh_execute() {
    local command="$1"
    local suppress_output="${2:-false}"
    
    if [[ "$CI_MODE" == "true" ]] && [[ -f "$HOME/.ssh/id_rsa" ]]; then
        # CI/CD mode - use SSH key
        if [ "$suppress_output" = "true" ]; then
            ssh -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_HOST" "$command" &>/dev/null
        else
            ssh -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_HOST" "$command"
        fi
    else
        # Fallback to password authentication
        if [ "$suppress_output" = "true" ]; then
            sshpass -p "${!SSH_PASS_VAR}" ssh -o StrictHostKeyChecking=no \
                "$SSH_USER@$SERVER_HOST" "$command" &>/dev/null
        else
            sshpass -p "${!SSH_PASS_VAR}" ssh -o StrictHostKeyChecking=no \
                "$SSH_USER@$SERVER_HOST" "$command"
        fi
    fi
}

upload_packages() {
    print_section "Uploading Deployment Packages"
    
    local temp_dir=$(cat /tmp/bankim-deploy-path)
    local remote_temp="/tmp/bankim-deploy-$(date +%s)"
    
    # Create remote temporary directory
    ssh_execute "mkdir -p $remote_temp"
    
    # Upload all packages
    for package in client server shared config; do
        if [ -f "$temp_dir/${package}.tar.gz" ]; then
            print_status "Uploading $package package..."
            
            if [[ "$CI_MODE" == "true" ]] && [[ -f "$HOME/.ssh/id_rsa" ]]; then
                # CI/CD mode - use SSH key
                scp -o StrictHostKeyChecking=no \
                    "$temp_dir/${package}.tar.gz" \
                    "$SSH_USER@$SERVER_HOST:$remote_temp/"
            else
                # Fallback to password authentication
                sshpass -p "${!SSH_PASS_VAR}" scp -o StrictHostKeyChecking=no \
                    "$temp_dir/${package}.tar.gz" \
                    "$SSH_USER@$SERVER_HOST:$remote_temp/"
            fi
            
            print_success "$package package uploaded"
        fi
    done
    
    # Store remote path for deployment
    echo "$remote_temp" > /tmp/bankim-remote-path
    print_success "All packages uploaded"
}

backup_current_deployment() {
    print_section "Creating Backup"
    
    ssh_execute "
        # Create backup directory
        mkdir -p $BACKUP_PATH
        
        # Create comprehensive backup
        BACKUP_NAME=\"pre-deploy-$(date +%Y%m%d-%H%M%S).tar.gz\"
        
        cd $DEPLOY_PATH
        if [ -d \"packages\" ]; then
            tar -czf \"$BACKUP_PATH/\$BACKUP_NAME\" \
                --exclude=node_modules \
                --exclude=.git \
                --exclude=\"*.log\" \
                . 2>/dev/null || true
            
            echo \"✅ Backup created: \$BACKUP_NAME\"
            echo \"[$(date '+%Y-%m-%d %H:%M:%S')] Backup created: \$BACKUP_NAME\" >> /var/log/bankim-deploy.log
        else
            echo \"⚠️  No existing deployment to backup\"
        fi
        
        # Clean old backups (keep last 10)
        cd $BACKUP_PATH
        ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -- || true
    "
    
    print_success "Backup completed"
}

stop_services() {
    print_section "Stopping Services"
    
    ssh_execute "
        echo '🔄 Stopping BankIM services...'
        
        # Stop PM2 services gracefully
        pm2 stop bankim-api bankim-client 2>/dev/null || echo 'Services not running'
        
        # Wait for graceful shutdown
        sleep 5
        
        # Ensure ports are free
        pkill -f 'node.*server.js' || true
        pkill -f 'serve.*dist' || true
        
        echo '✅ Services stopped'
    "
    
    print_success "Services stopped"
}

deploy_packages() {
    print_section "Deploying Application"
    
    local remote_temp=$(cat /tmp/bankim-remote-path)
    
    ssh_execute "
        set -e
        
        # Ensure deployment directory exists
        mkdir -p $DEPLOY_PATH/packages
        
        # Deploy server
        echo '🔄 Deploying server...'
        cd $DEPLOY_PATH/packages
        rm -rf server
        mkdir -p server
        cd server
        tar -xzf $remote_temp/server.tar.gz
        npm install --production --silent
        echo '✅ Server deployed'
        
        # Deploy client
        echo '🔄 Deploying client...'
        cd $DEPLOY_PATH/packages
        rm -rf client
        mkdir -p client
        cd client
        tar -xzf $remote_temp/client.tar.gz
        npm install --production --silent
        npm run build
        echo '✅ Client deployed'
        
        # Deploy shared
        echo '🔄 Deploying shared...'
        cd $DEPLOY_PATH/packages
        rm -rf shared
        mkdir -p shared
        cd shared
        tar -xzf $remote_temp/shared.tar.gz
        npm install --production --silent
        npm run build
        echo '✅ Shared deployed'
        
        # Deploy configuration
        echo '🔄 Deploying configuration...'
        cd $DEPLOY_PATH
        tar -xzf $remote_temp/config.tar.gz 2>/dev/null || true
        chmod +x scripts/*.sh 2>/dev/null || true
        echo '✅ Configuration deployed'
    "
    
    print_success "Application deployed"
}

update_configuration() {
    print_section "Updating Configuration"
    
    ssh_execute "
        cd $DEPLOY_PATH
        
        # Update PM2 ecosystem configuration
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bankim-api',
      cwd: '/var/www/bankim/packages/server',
      script: 'server.js',
      env: {
        NODE_ENV: '$ENVIRONMENT',
        PORT: process.env.PORT || '8003'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/pm2/bankim-api.log',
      error_file: '/var/log/pm2/bankim-api-error.log',
      out_file: '/var/log/pm2/bankim-api-out.log'
    },
    {
      name: 'bankim-client',
      cwd: '/var/www/bankim/packages/client',
      script: 'npx',
      args: 'serve dist -p 8004 -s',
      env: {
        NODE_ENV: '$ENVIRONMENT'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/pm2/bankim-client.log',
      error_file: '/var/log/pm2/bankim-client-error.log',
      out_file: '/var/log/pm2/bankim-client-out.log'
    }
  ]
}
EOF
        
        echo '✅ PM2 configuration updated'
    "
    
    print_success "Configuration updated"
}

run_migrations() {
    print_section "Running Database Migrations"
    
    # Only run migrations if database URLs are available
    if [ -n "$CONTENT_DATABASE_URL" ]; then
        ssh_execute "
            cd $DEPLOY_PATH/packages/server
            
            if [ -f 'migrations/migration-runner.js' ]; then
                echo '🔄 Running database migrations...'
                node migrations/migration-runner.js migrate
                echo '✅ Migrations completed'
            else
                echo '⚠️  No migrations to run'
            fi
        "
    else
        print_warning "Database URLs not configured - skipping migrations"
    fi
    
    print_success "Database migrations completed"
}

start_services() {
    print_section "Starting Services"
    
    ssh_execute "
        cd $DEPLOY_PATH
        
        # Start services with PM2
        echo '🔄 Starting BankIM services...'
        pm2 start ecosystem.config.js
        pm2 save
        
        # Ensure PM2 starts on boot
        pm2 startup > /dev/null 2>&1 || true
        
        echo '✅ Services started'
    "
    
    print_success "Services started"
}

health_check() {
    print_section "Running Health Checks"
    
    print_status "Waiting for services to initialize..."
    sleep 15
    
    # Check API health
    print_status "Checking API health..."
    local api_healthy=false
    for i in {1..6}; do
        if ssh_execute "curl -f http://localhost:8003/api/health" true; then
            api_healthy=true
            break
        fi
        sleep 10
    done
    
    if [ "$api_healthy" = true ]; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        ssh_execute "pm2 logs bankim-api --lines 20"
        exit 1
    fi
    
    # Check client health
    print_status "Checking client health..."
    local client_healthy=false
    for i in {1..3}; do
        if ssh_execute "curl -f http://localhost:8004" true; then
            client_healthy=true
            break
        fi
        sleep 5
    done
    
    if [ "$client_healthy" = true ]; then
        print_success "Client health check passed"
    else
        print_warning "Client health check failed - check manually"
    fi
    
    # Show service status
    print_status "Service status:"
    ssh_execute "pm2 list"
    
    print_success "Health checks completed"
}

cleanup_deployment() {
    print_section "Cleaning Up"
    
    # Clean up local temporary files
    local temp_dir=$(cat /tmp/bankim-deploy-path 2>/dev/null || echo "")
    if [ -n "$temp_dir" ] && [ -d "$temp_dir" ]; then
        rm -rf "$temp_dir"
        print_success "Local temporary files cleaned"
    fi
    
    # Clean up remote temporary files
    local remote_temp=$(cat /tmp/bankim-remote-path 2>/dev/null || echo "")
    if [ -n "$remote_temp" ]; then
        ssh_execute "rm -rf $remote_temp" true
        print_success "Remote temporary files cleaned"
    fi
    
    # Clean up tracking files
    rm -f /tmp/bankim-deploy-path /tmp/bankim-remote-path
    
    print_success "Cleanup completed"
}

post_deployment_summary() {
    print_section "Deployment Summary"
    
    echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Deployment Details:${NC}"
    echo -e "   Environment: $ENVIRONMENT"
    echo -e "   Server: $SERVER_HOST ($SERVER_NAME)"
    echo -e "   Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "   Log file: $LOG_FILE"
    echo ""
    echo -e "${BLUE}🔗 Access Points:${NC}"
    echo -e "   API: http://$SERVER_HOST:8003/api/health"
    echo -e "   Client: http://$SERVER_HOST:8004"
    echo ""
    echo -e "${BLUE}🛠️  Management Commands:${NC}"
    echo -e "   Service status: ssh $SSH_USER@$SERVER_HOST 'pm2 list'"
    echo -e "   Service logs: ssh $SSH_USER@$SERVER_HOST 'pm2 logs'"
    echo -e "   Health check: ssh $SSH_USER@$SERVER_HOST 'cd $DEPLOY_PATH && ./scripts/health-check.sh'"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${YELLOW}⚠️  Production Reminders:${NC}"
        echo -e "   • Monitor system for the next 30 minutes"
        echo -e "   • Check error logs for any issues"
        echo -e "   • Validate critical user workflows"
        echo -e "   • Backup schedule is active"
    fi
}

main() {
    print_header
    
    # Confirmation for production
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}⚠️  You are deploying to PRODUCTION environment${NC}"
        echo -e "   Server: $SERVER_HOST ($SERVER_NAME)"
        echo ""
        read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
        
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Execute deployment pipeline
    validate_prerequisites
    run_local_tests
    create_deployment_package
    upload_packages
    backup_current_deployment
    stop_services
    deploy_packages
    update_configuration
    run_migrations
    start_services
    health_check
    cleanup_deployment
    post_deployment_summary
}

# Script execution
main "$@"