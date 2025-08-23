#!/bin/bash

# BankIM Admin Panel Deployment Fix Script
# This script safely deploys the fixed server code

echo "🔧 BankIM Admin Panel - Regression Bug Fix Deployment"
echo "====================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Server details (update these to match your actual server)
SERVER_PATH="/mnt/disk2/var/www/bankim/adminPanel/api"
BACKUP_PATH="/mnt/disk2/var/www/bankim/adminPanel/backups"
PM2_PROCESS="bankim-admin-panel"

echo -e "${YELLOW}🚨 CRITICAL BUG FIX DEPLOYMENT${NC}"
echo "Fixing missing endpoints that caused 404 errors:"
echo "  • /api/admin/dashboard (was 404, should be protected)"
echo "  • /api/test/db (was 404, should be protected)" 
echo "  • Port 8005 accessibility issue"
echo ""

# Simulate server deployment (since we're running locally)
echo -e "${YELLOW}📋 DEPLOYMENT STEPS (to be executed on server):${NC}"
echo ""

echo "1. Create backup of current server.js:"
echo "   sudo cp $SERVER_PATH/server.js $BACKUP_PATH/server-backup-$(date +%Y%m%d-%H%M%S).js"
echo ""

echo "2. Upload new complete server.js file:"
echo "   (Copy adminPanel-server-complete.js to $SERVER_PATH/server.js)"
echo ""

echo "3. Install missing dependencies:"
echo "   cd $SERVER_PATH && npm install express-rate-limit helmet"
echo ""

echo "4. Restart PM2 process:"
echo "   pm2 restart $PM2_PROCESS"
echo "   pm2 status"
echo ""

echo "5. Test endpoints:"
echo "   curl https://admin.bankimonline.com/api/health"
echo "   curl -X POST https://admin.bankimonline.com/api/auth/login -d '{\"username\":\"admin\",\"password\":\"admin123\"}' -H 'Content-Type: application/json'"
echo ""

# Create the actual deployment commands that can be copy-pasted
echo -e "${GREEN}📋 COPY-PASTE DEPLOYMENT COMMANDS:${NC}"
echo "=================================="
cat << 'EOF'

# 1. Backup current server
sudo mkdir -p /mnt/disk2/var/www/bankim/adminPanel/backups
sudo cp /mnt/disk2/var/www/bankim/adminPanel/api/server.js /mnt/disk2/var/www/bankim/adminPanel/backups/server-backup-$(date +%Y%m%d-%H%M%S).js

# 2. Update server.js with complete implementation
# (Upload the adminPanel-server-complete.js content to server.js)

# 3. Install additional dependencies
cd /mnt/disk2/var/www/bankim/adminPanel/api
npm install express-rate-limit helmet

# 4. Restart the service
pm2 restart bankim-admin-panel
pm2 status

# 5. Verify the fix
curl -s https://admin.bankimonline.com/api/health | head -5
curl -s https://admin.bankimonline.com/api/admin/dashboard | head -5

EOF

echo ""
echo -e "${GREEN}🧪 VERIFICATION COMMANDS:${NC}"
echo "========================="
echo "After deployment, run these to verify the fix:"
echo ""
echo "# Test authentication"
echo 'TOKEN=$(curl -s -X POST https://admin.bankimonline.com/api/auth/login -H "Content-Type: application/json" -d '"'"'{"username":"admin","password":"admin123"}'"'"' | grep -o '"'"'"token":"[^"]*"'"'"' | cut -d'"'"'":'"'"' -f2 | tr -d '"'"'"'"'"')'
echo ""
echo "# Test protected dashboard (should return 200 with content)"
echo 'curl -s -H "Authorization: Bearer $TOKEN" https://admin.bankimonline.com/api/admin/dashboard | head -10'
echo ""
echo "# Test database connectivity (should return connection successful)"
echo 'curl -s -H "Authorization: Bearer $TOKEN" https://admin.bankimonline.com/api/test/db | head -10'
echo ""
echo "# Test port 8005 (should work)"
echo 'curl -s http://admin.bankimonline.com:8005/ | head -5'
echo ""

echo -e "${RED}🚨 CRITICAL FIXES IN THIS DEPLOYMENT:${NC}"
echo "======================================"
echo "1. ✅ Added missing protected route: /api/admin/dashboard"
echo "2. ✅ Added missing database test route: /api/test/db"
echo "3. ✅ Added proper 401/403 responses for unauthorized access"
echo "4. ✅ Added rate limiting and security middleware"
echo "5. ✅ Added comprehensive error handling"
echo "6. ✅ Added health check endpoint"
echo "7. ✅ Fixed JWT authentication middleware"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo "=================="
echo "• The server must be restarted for changes to take effect"
echo "• Test all endpoints after deployment"
echo "• Port 8005 accessibility depends on server firewall settings"
echo "• Default credentials remain: admin / admin123"
echo ""

echo -e "${GREEN}✅ Deployment script ready!${NC}"
echo "Copy the commands above and execute them on the server."