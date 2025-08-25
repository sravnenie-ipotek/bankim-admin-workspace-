#!/bin/bash

# BankIM Emergency Rollback Script
# Fast rollback mechanism for production issues
# Compatible with both manual and CI/CD usage

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# CI/CD Integration
CI_MODE=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}

# Colors (disabled in CI mode)
if [[ "$CI_MODE" == "true" ]]; then
    RED='' GREEN='' YELLOW='' BLUE='' NC=''
else
    RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' BLUE='\033[0;34m' NC='\033[0m'
fi

# Parameters
ENVIRONMENT=${1:-"production"}
ROLLBACK_REASON=${2:-"Emergency rollback"}
BACKUP_TIMESTAMP=${3:-""}

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
        echo "Usage: $0 [test|production] [reason] [backup_timestamp]"
        exit 1
        ;;
esac

DEPLOY_PATH="/var/www/bankim"
BACKUP_PATH="/var/backups/bankim"
SSH_USER="root"

# Logging
ROLLBACK_LOG="/tmp/bankim-rollback-$(date +%Y%m%d-%H%M%S).log"

print_header() {
    echo -e "${BLUE}
╔════════════════════════════════════════════════════════════════╗
║                    BankIM Emergency Rollback                  ║
║                                                                ║
║  Environment: ${ENVIRONMENT^^}                                        ║
║  Target: ${SERVER_HOST} (${SERVER_NAME})                      ║
║  Reason: ${ROLLBACK_REASON}                                    ║
║  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')                      ║
╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${YELLOW}🔄 $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$ROLLBACK_LOG"
    
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::$1"
    fi
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "$ROLLBACK_LOG"
    
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::✅ $1"
    fi
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$ROLLBACK_LOG"
    
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::error::❌ $1"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$ROLLBACK_LOG"
    
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::warning::⚠️ $1"
    fi
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
        local SSH_PASS_VAR="${ENVIRONMENT^^}_SERVER_PASSWORD"
        if [ "$suppress_output" = "true" ]; then
            sshpass -p "${!SSH_PASS_VAR}" ssh -o StrictHostKeyChecking=no \
                "$SSH_USER@$SERVER_HOST" "$command" &>/dev/null
        else
            sshpass -p "${!SSH_PASS_VAR}" ssh -o StrictHostKeyChecking=no \
                "$SSH_USER@$SERVER_HOST" "$command"
        fi
    fi
}

validate_prerequisites() {
    print_status "Validating rollback prerequisites..."
    
    # Test SSH connectivity
    if ! ssh_execute "echo 'SSH connection successful'" true; then
        print_error "Cannot connect to server $SERVER_HOST"
        exit 1
    fi
    
    # Verify backup availability
    ssh_execute "
        if [[ ! -d '$BACKUP_PATH' ]]; then
            echo '❌ Backup directory not found: $BACKUP_PATH'
            exit 1
        fi
        
        if [[ -n '$BACKUP_TIMESTAMP' ]]; then
            BACKUP_FILE=\$(ls $BACKUP_PATH/ | grep '$BACKUP_TIMESTAMP' | head -1)
            if [[ -z \"\$BACKUP_FILE\" ]]; then
                echo '❌ Specified backup timestamp not found: $BACKUP_TIMESTAMP'
                exit 1
            fi
        else
            BACKUP_FILE=\$(ls -t $BACKUP_PATH/pre-deploy-*.tar.gz 2>/dev/null | head -1)
            if [[ -z \"\$BACKUP_FILE\" ]]; then
                echo '❌ No pre-deployment backups found'
                exit 1
            fi
        fi
        
        echo \"✅ Using backup: \$BACKUP_FILE\"
        echo \"TARGET_BACKUP=\$BACKUP_FILE\" > /tmp/rollback-vars
    "
    
    print_success "Prerequisites validated"
}

capture_current_state() {
    print_status "Capturing current system state..."
    
    ssh_execute "
        echo '📊 System State Before Rollback:' > /tmp/pre-rollback-state.log
        echo '=================================' >> /tmp/pre-rollback-state.log
        echo 'Timestamp: \$(date)' >> /tmp/pre-rollback-state.log
        echo 'Reason: $ROLLBACK_REASON' >> /tmp/pre-rollback-state.log
        echo '' >> /tmp/pre-rollback-state.log
        
        echo '🔧 PM2 Process Status:' >> /tmp/pre-rollback-state.log
        pm2 list >> /tmp/pre-rollback-state.log 2>&1 || echo 'PM2 not available' >> /tmp/pre-rollback-state.log
        echo '' >> /tmp/pre-rollback-state.log
        
        echo '📊 System Resources:' >> /tmp/pre-rollback-state.log
        free -h >> /tmp/pre-rollback-state.log
        df -h >> /tmp/pre-rollback-state.log
        uptime >> /tmp/pre-rollback-state.log
        echo '' >> /tmp/pre-rollback-state.log
        
        echo '🔍 Current Version:' >> /tmp/pre-rollback-state.log
        cd $DEPLOY_PATH 2>/dev/null || echo 'Deployment directory not found'
        git rev-parse HEAD >> /tmp/pre-rollback-state.log 2>&1 || echo 'Git not available' >> /tmp/pre-rollback-state.log
        git log --oneline -3 >> /tmp/pre-rollback-state.log 2>&1 || echo 'Git log not available' >> /tmp/pre-rollback-state.log
        
        # Copy to backup location for future reference
        cp /tmp/pre-rollback-state.log $BACKUP_PATH/pre-rollback-state-\$(date +%Y%m%d-%H%M%S).log
    "
    
    print_success "Current state captured"
}

stop_services() {
    print_status "Stopping current services..."
    
    ssh_execute "
        echo '🛑 Stopping BankIM services...'
        
        # Graceful PM2 shutdown
        pm2 stop all || echo 'Services may not be running'
        sleep 3
        
        # Ensure processes are stopped
        pkill -f 'node.*server.js' || true
        pkill -f 'serve.*dist' || true
        
        echo '✅ Services stopped'
    "
    
    print_success "Services stopped"
}

execute_rollback() {
    print_status "Executing rollback..."
    
    ssh_execute "
        set -e
        source /tmp/rollback-vars
        
        echo '🔄 Starting rollback process...'
        ROLLBACK_LOG_REMOTE=\"/var/log/bankim-rollback-\$(date +%Y%m%d-%H%M%S).log\"
        
        # Create emergency backup of current state
        echo '💾 Creating emergency backup...'
        cd $DEPLOY_PATH
        tar -czf \"$BACKUP_PATH/emergency-backup-\$(date +%Y%m%d-%H%M%S).tar.gz\" . 2>/dev/null || true
        
        # Extract target backup
        echo '📦 Extracting backup: \$TARGET_BACKUP'
        tar -xzf \"$BACKUP_PATH/\$TARGET_BACKUP\" 2>&1 | tee -a \"\$ROLLBACK_LOG_REMOTE\"
        
        # Restore file permissions
        chown -R root:root $DEPLOY_PATH
        chmod -R 755 $DEPLOY_PATH
        
        # Install dependencies
        echo '🔧 Installing dependencies...'
        cd $DEPLOY_PATH/packages/server
        npm install --production --silent 2>&1 | tee -a \"\$ROLLBACK_LOG_REMOTE\"
        
        cd $DEPLOY_PATH/packages/client  
        npm install --production --silent 2>&1 | tee -a \"\$ROLLBACK_LOG_REMOTE\"
        
        # Rebuild client if needed
        if [[ -f 'package.json' ]] && grep -q '\"build\"' package.json; then
            echo '🏗️ Rebuilding client...'
            npm run build 2>&1 | tee -a \"\$ROLLBACK_LOG_REMOTE\"
        fi
        
        echo '✅ Rollback extraction completed' | tee -a \"\$ROLLBACK_LOG_REMOTE\"
    "
    
    print_success "Rollback executed"
}

start_services() {
    print_status "Starting services..."
    
    ssh_execute "
        cd $DEPLOY_PATH
        
        echo '🚀 Starting BankIM services...'
        
        # Use PM2 ecosystem if available
        if [[ -f 'ecosystem.config.js' ]]; then
            pm2 start ecosystem.config.js 2>&1 || {
                echo '⚠️ PM2 ecosystem failed, using manual startup'
                
                # Fallback manual startup
                cd packages/server
                pm2 start server.js --name bankim-api --env $ENVIRONMENT
                
                cd ../client
                pm2 start 'npx serve dist -p 8004 -s' --name bankim-client
            }
        else
            echo '⚠️ No PM2 ecosystem file found, using manual startup'
            
            cd packages/server
            pm2 start server.js --name bankim-api --env $ENVIRONMENT
            
            cd ../client
            pm2 start 'npx serve dist -p 8004 -s' --name bankim-client
        fi
        
        # Save PM2 configuration
        pm2 save || echo 'PM2 save failed - continuing'
        
        echo '✅ Services started'
        pm2 list
    "
    
    print_success "Services started"
}

verify_rollback() {
    print_status "Verifying rollback success..."
    
    # Wait for services to stabilize
    print_status "Waiting for services to initialize..."
    sleep 20
    
    # Health checks
    print_status "Running health checks..."
    
    # API health check
    for i in {1..6}; do
        if ssh_execute "curl -f -m 10 http://localhost:8003/api/health" true; then
            print_success "API health check passed"
            break
        else
            if [[ $i -eq 6 ]]; then
                print_error "API health check failed after rollback"
                ssh_execute "pm2 logs bankim-api --lines 20" || echo "Could not retrieve logs"
                return 1
            fi
            print_status "API not ready, waiting... (attempt $i/6)"
            sleep 10
        fi
    done
    
    # Client health check
    if ssh_execute "curl -f -m 10 http://localhost:8004" true; then
        print_success "Client health check passed"
    else
        print_warning "Client health check failed - may require manual intervention"
    fi
    
    # Service status
    ssh_execute "
        echo '📊 Final Service Status:'
        pm2 list
        
        echo -e '\\n📝 Recent Logs:'
        pm2 logs --lines 10 --raw 2>/dev/null || echo 'No recent logs available'
    "
    
    print_success "Rollback verification completed"
}

send_notification() {
    local status="$1"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local emoji="✅"
        local color="good"
        
        if [[ "$status" != "success" ]]; then
            emoji="❌"
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"🚨 BankIM Emergency Rollback $emoji\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [
                        {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                        {\"title\": \"Server\", \"value\": \"$SERVER_HOST\", \"short\": true},
                        {\"title\": \"Reason\", \"value\": \"$ROLLBACK_REASON\", \"short\": true},
                        {\"title\": \"Status\", \"value\": \"$status\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": false}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || echo "Slack notification failed"
    fi
}

cleanup() {
    print_status "Cleaning up temporary files..."
    
    ssh_execute "rm -f /tmp/rollback-vars /tmp/pre-rollback-state.log" true
    
    print_success "Cleanup completed"
}

main() {
    print_header
    
    # Production confirmation
    if [[ "$ENVIRONMENT" == "production" ]] && [[ "$CI_MODE" != "true" ]]; then
        echo -e "${RED}⚠️  You are about to rollback PRODUCTION environment${NC}"
        echo -e "   Server: $SERVER_HOST ($SERVER_NAME)"
        echo -e "   Reason: $ROLLBACK_REASON"
        echo ""
        read -p "Are you sure you want to continue? (type 'ROLLBACK' to confirm): " confirm
        
        if [[ "$confirm" != "ROLLBACK" ]]; then
            echo "Rollback cancelled"
            exit 0
        fi
    fi
    
    local rollback_status="success"
    
    # Execute rollback pipeline
    validate_prerequisites || rollback_status="failed"
    
    if [[ "$rollback_status" == "success" ]]; then
        capture_current_state || rollback_status="failed"
    fi
    
    if [[ "$rollback_status" == "success" ]]; then
        stop_services || rollback_status="failed"
    fi
    
    if [[ "$rollback_status" == "success" ]]; then
        execute_rollback || rollback_status="failed"
    fi
    
    if [[ "$rollback_status" == "success" ]]; then
        start_services || rollback_status="failed"
    fi
    
    if [[ "$rollback_status" == "success" ]]; then
        verify_rollback || rollback_status="partial"
    fi
    
    cleanup
    
    # Send notification
    send_notification "$rollback_status"
    
    # Final status
    if [[ "$rollback_status" == "success" ]]; then
        echo -e "\n${GREEN}🎉 Emergency rollback completed successfully!${NC}"
        echo -e "   Environment: $ENVIRONMENT"
        echo -e "   Server: $SERVER_HOST ($SERVER_NAME)"  
        echo -e "   API: http://$SERVER_HOST:8003/api/health"
        echo -e "   Client: http://$SERVER_HOST:8004"
        echo -e "   Log: $ROLLBACK_LOG"
    elif [[ "$rollback_status" == "partial" ]]; then
        echo -e "\n${YELLOW}⚠️  Rollback completed with warnings${NC}"
        echo -e "   Manual verification may be required"
        echo -e "   Check server status manually"
    else
        echo -e "\n${RED}❌ Rollback failed${NC}"
        echo -e "   Manual intervention required"
        echo -e "   Check logs: $ROLLBACK_LOG"
        exit 1
    fi
}

# Script execution
main "$@"