#!/bin/bash

# BankIM SSL Certificate Fix Script
# Comprehensive solution for SSL certificate issues

echo "🔧 BankIM SSL Certificate Fix"
echo "=============================="
echo "Fixing SSL certificate configuration for:"
echo "  • bankimonline.com (main domain)"
echo "  • admin.bankimonline.com (admin subdomain)"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 CRITICAL SSL CERTIFICATE ISSUE DETECTED:${NC}"
echo "=============================================="
echo "❌ Main domain bankimonline.com is using wrong SSL certificate"
echo "❌ Certificate CN: admin.bankimonline.com (should cover main domain)"
echo "❌ Certificate SAN only includes: admin.bankimonline.com"
echo "❌ Port 443 connectivity issues (Apache configuration problem)"
echo ""

echo -e "${YELLOW}📋 DEPLOYMENT COMMANDS (Execute on Server):${NC}"
echo "=============================================="
echo ""

echo -e "${BLUE}Step 1: Backup Current Configuration${NC}"
echo "-----------------------------------"
cat << 'EOF'
# Create backup directory
sudo mkdir -p /root/ssl-backup-$(date +%Y%m%d-%H%M%S)

# Backup Apache configuration
sudo cp /etc/apache2/conf/httpd.conf /root/ssl-backup-$(date +%Y%m%d-%H%M%S)/
sudo cp -r /etc/letsencrypt/ /root/ssl-backup-$(date +%Y%m%d-%H%M%S)/

EOF

echo -e "${BLUE}Step 2: Stop Apache Service${NC}"
echo "----------------------------"
cat << 'EOF'
# Stop Apache to avoid conflicts during certificate generation
sudo systemctl stop apache2
sudo systemctl status apache2

EOF

echo -e "${BLUE}Step 3: Generate New SSL Certificate (Multi-Domain)${NC}"
echo "-------------------------------------------------"
cat << 'EOF'
# Option A: Generate certificate covering both domains
sudo certbot certonly --standalone \
    -d bankimonline.com \
    -d admin.bankimonline.com \
    --agree-tos \
    --no-eff-email \
    --email admin@bankimonline.com

# Option B: If Option A fails, generate wildcard certificate
# sudo certbot certonly --manual \
#     --preferred-challenges=dns \
#     -d bankimonline.com \
#     -d "*.bankimonline.com" \
#     --agree-tos \
#     --email admin@bankimonline.com

EOF

echo -e "${BLUE}Step 4: Update Apache VirtualHost Configuration${NC}"
echo "----------------------------------------------"
cat << 'EOF'
# Edit Apache configuration
sudo nano /etc/apache2/conf/httpd.conf

# Add/Update these VirtualHost configurations:

# Main domain VirtualHost (ADD THIS FIRST)
<VirtualHost *:443>
    ServerName bankimonline.com
    DocumentRoot /mnt/disk2/var/www/bankimOnlineAdmin_client
    
    # SSL Configuration for Main Domain
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bankimonline.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bankimonline.com/privkey.pem
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    # Logging
    ErrorLog /mnt/disk2/var/www/logs/bankimonline_error.log
    CustomLog /mnt/disk2/var/www/logs/bankimonline_access.log combined
</VirtualHost>

# Admin subdomain VirtualHost (UPDATE THIS)
<VirtualHost *:443>
    ServerName admin.bankimonline.com
    
    # SSL Configuration for Admin Domain  
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bankimonline.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bankimonline.com/privkey.pem
    
    # Reverse proxy to admin panel
    ProxyPass / http://localhost:8005/
    ProxyPassReverse / http://localhost:8005/
    ProxyPreserveHost On
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    # Logging
    ErrorLog /mnt/disk2/var/www/logs/admin_bankimonline_error.log
    CustomLog /mnt/disk2/var/www/logs/admin_bankimonline_access.log combined
</VirtualHost>

# HTTP to HTTPS Redirect for Main Domain
<VirtualHost *:80>
    ServerName bankimonline.com
    Redirect permanent / https://bankimonline.com/
</VirtualHost>

# HTTP to HTTPS Redirect for Admin Domain  
<VirtualHost *:80>
    ServerName admin.bankimonline.com
    Redirect permanent / https://admin.bankimonline.com/
</VirtualHost>

EOF

echo -e "${BLUE}Step 5: Verify Certificate Installation${NC}"
echo "--------------------------------------"
cat << 'EOF'
# Check that certificates were generated properly
sudo ls -la /etc/letsencrypt/live/bankimonline.com/
sudo ls -la /etc/letsencrypt/live/admin.bankimonline.com/ 2>/dev/null || echo "Using main domain cert"

# Verify certificate contents
sudo openssl x509 -in /etc/letsencrypt/live/bankimonline.com/fullchain.pem -text -noout | grep -E "Subject:|DNS:"

EOF

echo -e "${BLUE}Step 6: Test Apache Configuration${NC}"
echo "--------------------------------"
cat << 'EOF'
# Test Apache configuration syntax
sudo apache2ctl configtest

# If configuration is OK, start Apache
sudo systemctl start apache2
sudo systemctl enable apache2
sudo systemctl status apache2

EOF

echo -e "${BLUE}Step 7: Verify SSL Certificate Fix${NC}"
echo "---------------------------------"
cat << 'EOF'
# Test SSL certificates from command line
openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1 | grep -E "subject:|issuer:|verify return code"

openssl s_client -servername admin.bankimonline.com -connect admin.bankimonline.com:443 </dev/null 2>&1 | grep -E "subject:|issuer:|verify return code"

# Test with curl
curl -I https://bankimonline.com/
curl -I https://admin.bankimonline.com/

EOF

echo -e "${BLUE}Step 8: Update Admin Panel Server (if needed)${NC}"
echo "--------------------------------------------"
cat << 'EOF'
# Make sure admin panel server is running  
pm2 status bankim-admin-panel
pm2 restart bankim-admin-panel

# Test admin panel authentication
curl -X POST https://admin.bankimonline.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' | head -5

EOF

echo ""
echo -e "${GREEN}🧪 VERIFICATION COMMANDS:${NC}"
echo "============================"
echo "After executing the fix commands above, run these to verify:"
echo ""

echo -e "${YELLOW}1. Test SSL Certificate Coverage:${NC}"
echo 'openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1 | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"'
echo ""

echo -e "${YELLOW}2. Test Main Domain Access:${NC}"
echo 'curl -I https://bankimonline.com/'
echo ""

echo -e "${YELLOW}3. Test Admin Domain Access:${NC}"  
echo 'curl -I https://admin.bankimonline.com/'
echo ""

echo -e "${YELLOW}4. Test Admin Authentication:${NC}"
echo 'TOKEN=$(curl -s -X POST https://admin.bankimonline.com/api/auth/login -H "Content-Type: application/json" -d '"'"'{"username":"admin","password":"admin123"}'"'"' | jq -r ".token")'
echo 'curl -s -H "Authorization: Bearer $TOKEN" https://admin.bankimonline.com/api/admin/dashboard | head -5'
echo ""

echo -e "${YELLOW}5. Run Playwright Test to Confirm Fix:${NC}"
echo 'node playwright-ssl-diagnosis.js'
echo ""

echo -e "${RED}⚠️  CRITICAL NOTES:${NC}"
echo "==================="
echo "• Execute commands in order - don't skip steps"
echo "• Apache must be stopped before certificate generation"
echo "• VirtualHost order matters - main domain BEFORE wildcard"
echo "• Test each step before proceeding to next"
echo "• If certificate generation fails, try the wildcard option"
echo ""

echo -e "${GREEN}✅ SSL Fix Script Ready!${NC}"
echo ""
echo -e "${BLUE}📋 ROOT CAUSE SUMMARY:${NC}"
echo "======================="
echo "❌ Main domain was using admin subdomain's SSL certificate"
echo "❌ Certificate CN and SAN didn't cover main domain"
echo "❌ Apache VirtualHost configuration was incorrect"
echo "❌ Missing proper certificate for main domain"
echo ""
echo -e "${GREEN}🔧 SOLUTION:${NC}"
echo "============"
echo "✅ Generate multi-domain certificate covering both domains"
echo "✅ Update Apache VirtualHost configuration properly"
echo "✅ Ensure correct certificate paths for each domain"
echo "✅ Add proper HTTP to HTTPS redirects"
echo "✅ Test all endpoints after deployment"