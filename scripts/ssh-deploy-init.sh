#!/bin/bash

# BankIM SSH Production Server - Initial Deployment Setup
# This script sets up the 4-repository production environment on SSH server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SSH_HOST="185.253.72.80"
SSH_USER="root"
DEPLOY_PATH="/var/www/bankim"
BACKUP_PATH="/var/backups/bankim"
LOG_FILE="/var/log/bankim-deploy.log"

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

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

print_info "🚀 BankIM SSH Production Deployment - Initial Setup"
print_info "=================================================="

# Check if running on server
if [[ "$HOSTNAME" != *"185.253.72.80"* ]] && [[ "$SSH_CLIENT" == "" ]]; then
    print_warning "This script should be run on the SSH server (185.253.72.80)"
    print_info "Copy this script to the server and run it there:"
    print_info "scp ssh-deploy-init.sh root@185.253.72.80:/tmp/"
    print_info "ssh root@185.253.72.80"
    print_info "cd /tmp && chmod +x ssh-deploy-init.sh && ./ssh-deploy-init.sh"
    exit 1
fi

# Create directories and logging
print_status "Setting up directory structure..."
mkdir -p $DEPLOY_PATH
mkdir -p $BACKUP_PATH
mkdir -p $(dirname $LOG_FILE)
cd $DEPLOY_PATH

log "🏗️ Starting BankIM production deployment setup"

# Backup existing setup (if exists)
if [ -d "bankim-admin-api" ] || [ -d "bankim-admin-client" ]; then
    print_status "Creating backup of existing setup..."
    BACKUP_NAME="bankim-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_PATH/$BACKUP_NAME" . --exclude=".git" --exclude="node_modules" 2>/dev/null || true
    print_success "Backup created: $BACKUP_NAME"
    log "✅ Backup created: $BACKUP_NAME"
fi

# Install required packages
print_status "Installing required packages..."
apt update && apt install -y curl git nginx ufw
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
print_success "Required packages installed"
log "✅ Required packages installed"

# Clone 4 repositories
print_status "Cloning BankIM repositories..."

# Remove existing directories
rm -rf workspace dashboard api shared bankim-admin-* 2>/dev/null || true

# Clone repositories
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git workspace
print_success "✅ Workspace repository cloned"

git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git dashboard  
print_success "✅ Dashboard repository cloned"

git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git api
print_success "✅ API repository cloned"

git clone git@github.com:sravnenie-ipotek/bankim-admin-shared.git shared
print_success "✅ Shared repository cloned"

log "✅ All repositories cloned successfully"

# Setup Dashboard
print_status "Setting up Dashboard (Frontend)..."
cd $DEPLOY_PATH/dashboard/
mkdir -p mainapp

# Install dependencies and build
npm install
npm run build

# Copy built files to mainapp
cp -r dist/* mainapp/ 2>/dev/null || true
cp package.json mainapp/

# Create production environment
cat > mainapp/.env.production << EOF
NODE_ENV=production
VITE_API_URL=http://185.253.72.80:3001
VITE_ENVIRONMENT=production
EOF

print_success "Dashboard setup complete"
log "✅ Dashboard setup complete"

# Setup API
print_status "Setting up API (Backend)..."
cd $DEPLOY_PATH/api/
mkdir -p mainapp

# Copy API files to mainapp
cp -r * mainapp/ 2>/dev/null || true
cd mainapp/

# Install dependencies
npm install

# Create production environment template
cat > .env.production << EOF
NODE_ENV=production
PORT=3001

# Database connections (CONFIGURE THESE)
CONTENT_DATABASE_URL=postgresql://user:password@host:5432/bankim_content
CORE_DATABASE_URL=postgresql://user:password@host:5432/bankim_core
MANAGEMENT_DATABASE_URL=postgresql://user:password@host:5432/bankim_management

# Security
JWT_SECRET=your-production-jwt-secret-change-this
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info
EOF

print_success "API setup complete"
log "✅ API setup complete"

# Setup Shared Package
print_status "Setting up Shared Package..."
cd $DEPLOY_PATH/shared/
npm install
npm run build
print_success "Shared package built"
log "✅ Shared package setup complete"

# Create PM2 ecosystem configuration
print_status "Creating PM2 ecosystem configuration..."
cd $DEPLOY_PATH/

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bankim-dashboard',
      cwd: '/var/www/bankim/dashboard/mainapp',
      script: 'npx',
      args: 'serve dist -p 3002 -s',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/pm2/bankim-dashboard.log',
      error_file: '/var/log/pm2/bankim-dashboard-error.log',
      out_file: '/var/log/pm2/bankim-dashboard-out.log'
    },
    {
      name: 'bankim-api',
      cwd: '/var/www/bankim/api/mainapp',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/pm2/bankim-api.log',
      error_file: '/var/log/pm2/bankim-api-error.log',
      out_file: '/var/log/pm2/bankim-api-out.log'
    }
  ]
}
EOF

print_success "PM2 ecosystem configuration created"
log "✅ PM2 ecosystem configuration created"

# Install serve for dashboard
print_status "Installing serve for dashboard static files..."
npm install -g serve
print_success "Serve installed"

# Create deployment script
print_status "Creating deployment automation script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

# BankIM Production Deployment Script
# Pulls latest from GitHub repositories and updates production

set -e

DEPLOY_LOG="/var/log/bankim-deploy.log"
BACKUP_DIR="/var/backups/bankim"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $DEPLOY_LOG
}

log "🚀 Starting BankIM deployment..."

# Create backup
mkdir -p $BACKUP_DIR
cd /var/www/bankim/
tar -czf "$BACKUP_DIR/bankim-backup-$(date +%Y%m%d-%H%M%S).tar.gz" . --exclude=".git" --exclude="node_modules"

# Update repositories
log "📦 Updating repositories..."

# Update workspace (development backup)
cd /var/www/bankim/workspace/
git pull origin main
log "✅ Workspace updated"

# Update and build dashboard  
cd /var/www/bankim/dashboard/
git pull origin main
npm install
npm run build
cp -r dist/* mainapp/
pm2 reload bankim-dashboard
log "✅ Dashboard updated and reloaded"

# Update and restart API
cd /var/www/bankim/api/
git pull origin main  
cd mainapp/
npm install
# Run migrations if needed
npm run db:migrate 2>/dev/null || log "⚠️  No migrations to run"
pm2 reload bankim-api  
log "✅ API updated and reloaded"

# Update shared package (if used locally)
cd /var/www/bankim/shared/
git pull origin main
npm install
npm run build
log "✅ Shared package updated"

# Health check
sleep 5
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Health check passed - API is running"
else
    log "❌ Health check failed - API may have issues"
    exit 1
fi

if curl -f http://localhost:3002 > /dev/null 2>&1; then
    log "✅ Health check passed - Dashboard is running"  
else
    log "⚠️  Dashboard health check failed"
fi

log "🎉 Deployment completed successfully!"
EOF

chmod +x deploy.sh
print_success "Deployment script created"
log "✅ Deployment script created"

# Create health monitoring script
print_status "Creating health monitoring script..."
cat > health-check.sh << 'EOF'
#!/bin/bash

API_URL="http://localhost:3001/health"
DASHBOARD_URL="http://localhost:3002"

echo "🔍 Checking BankIM services..."

# Check API
if curl -f $API_URL > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API is down - restarting..."
    pm2 restart bankim-api
fi

# Check Dashboard  
if curl -f $DASHBOARD_URL > /dev/null 2>&1; then
    echo "✅ Dashboard is healthy"
else
    echo "❌ Dashboard is down - restarting..." 
    pm2 restart bankim-dashboard
fi

# Check PM2 status
pm2 list --no-colors
EOF

chmod +x health-check.sh
print_success "Health monitoring script created"
log "✅ Health monitoring script created"

# Create backup script
print_status "Creating backup script..."
cat > backup.sh << 'EOF'  
#!/bin/bash

BACKUP_DIR="/var/backups/bankim"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup
tar -czf "$BACKUP_DIR/bankim-$(date +%Y%m%d).tar.gz" \
    /var/www/bankim \
    --exclude="/var/www/bankim/*/node_modules" \
    --exclude="/var/www/bankim/*/.git"

# Clean old backups
find $BACKUP_DIR -name "bankim-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: bankim-$(date +%Y%m%d).tar.gz"
EOF

chmod +x backup.sh
print_success "Backup script created"
log "✅ Backup script created"

# Configure firewall
print_status "Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP  
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API
ufw allow 3002/tcp  # Dashboard
ufw --force enable
print_success "Firewall configured"
log "✅ Firewall configured"

# Setup PM2 log directory
mkdir -p /var/log/pm2

# Display completion message
print_success "🎉 BankIM Production Setup Complete!"
print_info ""
print_info "📋 Next Steps:"
print_info "1. Configure database connections in /var/www/bankim/api/mainapp/.env.production"
print_info "2. Start applications: cd /var/www/bankim && pm2 start ecosystem.config.js"
print_info "3. Save PM2 configuration: pm2 save && pm2 startup"
print_info "4. Test applications:"
print_info "   - Dashboard: http://185.253.72.80:3002"
print_info "   - API: http://185.253.72.80:3001/health"
print_info ""
print_info "🔧 Management Commands:"
print_info "- Deploy updates: /var/www/bankim/deploy.sh"
print_info "- Health check: /var/www/bankim/health-check.sh"
print_info "- Manual backup: /var/www/bankim/backup.sh"
print_info "- PM2 status: pm2 list"
print_info "- PM2 logs: pm2 logs"
print_info ""
print_warning "⚠️  Remember to:"
print_warning "- Configure database URLs in .env.production"
print_warning "- Set up SSL certificates if using custom domain"
print_warning "- Schedule automated backups with cron"

log "🎉 Initial deployment setup completed successfully"

# Show final structure
print_info "📁 Final directory structure:"
tree -L 3 /var/www/bankim/ 2>/dev/null || ls -la /var/www/bankim/

print_info ""
print_info "🚀 BankIM is ready for production deployment!"