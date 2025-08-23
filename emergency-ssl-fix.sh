#!/bin/bash

# EMERGENCY SSL Certificate Fix for BankIM
# This script completely regenerates SSL certificates from scratch

echo "🚨 EMERGENCY SSL CERTIFICATE FIX"
echo "=================================="
echo "Completely regenerating SSL certificates for:"
echo "  • bankimonline.com (main production site)"
echo "  • admin.bankimonline.com (admin panel)"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 CRITICAL: Production site is DOWN due to SSL certificate issues${NC}"
echo -e "${YELLOW}Current Error: NET::ERR_CERT_COMMON_NAME_INVALID${NC}"
echo -e "${BLUE}Root Cause: Main domain using admin subdomain's certificate${NC}"
echo ""

echo -e "${YELLOW}📋 EMERGENCY DEPLOYMENT COMMANDS (EXECUTE IMMEDIATELY):${NC}"
echo "========================================================="
echo ""

echo -e "${RED}⚠️  IMPORTANT: Execute these commands ONE BY ONE and verify each step${NC}"
echo ""

echo -e "${BLUE}Step 1: EMERGENCY - Stop Apache and Clear Bad Certificates${NC}"
echo "--------------------------------------------------------"
cat << 'EOF'
# Stop Apache immediately to prevent further SSL errors
sudo systemctl stop apache2

# Backup existing (broken) certificates
sudo mkdir -p /root/ssl-emergency-backup-$(date +%Y%m%d-%H%M%S)
sudo cp -r /etc/letsencrypt /root/ssl-emergency-backup-$(date +%Y%m%d-%H%M%S)/

# Remove the problematic certificates completely
sudo rm -rf /etc/letsencrypt/live/bankimonline.com/
sudo rm -rf /etc/letsencrypt/live/admin.bankimonline.com/
sudo rm -rf /etc/letsencrypt/archive/bankimonline.com/
sudo rm -rf /etc/letsencrypt/archive/admin.bankimonline.com/

# Clear renewal configs that are causing issues
sudo rm -f /etc/letsencrypt/renewal/bankimonline.com.conf
sudo rm -f /etc/letsencrypt/renewal/admin.bankimonline.com.conf

EOF

echo -e "${BLUE}Step 2: EMERGENCY - Generate Fresh Multi-Domain Certificate${NC}"
echo "---------------------------------------------------------"
cat << 'EOF'
# Generate a completely fresh certificate covering BOTH domains
# This is the CRITICAL step that fixes the root cause

sudo certbot certonly --standalone \
    --preferred-challenges http \
    -d bankimonline.com \
    -d www.bankimonline.com \
    -d admin.bankimonline.com \
    --agree-tos \
    --no-eff-email \
    --email admin@bankimonline.com \
    --force-renewal \
    --non-interactive

# Verify the certificate was generated correctly
sudo ls -la /etc/letsencrypt/live/bankimonline.com/
sudo openssl x509 -in /etc/letsencrypt/live/bankimonline.com/fullchain.pem -text -noout | grep -A1 "Subject Alternative Name"

EOF

echo -e "${BLUE}Step 3: EMERGENCY - Fix Apache VirtualHost Configuration${NC}"
echo "------------------------------------------------------"
cat << 'EOF'
# Backup current Apache config
sudo cp /etc/apache2/conf/httpd.conf /etc/apache2/conf/httpd.conf.backup-$(date +%Y%m%d-%H%M%S)

# Edit Apache configuration - ADD THIS EXACT CONFIGURATION:
sudo nano /etc/apache2/conf/httpd.conf

# ADD THESE VIRTUALHOSTS AT THE TOP (BEFORE any existing VirtualHost entries):

# === MAIN DOMAIN HTTPS (MOST IMPORTANT - ADD FIRST) ===
<VirtualHost *:443>
    ServerName bankimonline.com
    ServerAlias www.bankimonline.com
    DocumentRoot /mnt/disk2/var/www/bankimOnlineAdmin_client
    
    # CRITICAL: SSL Configuration for MAIN DOMAIN
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bankimonline.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bankimonline.com/privkey.pem
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    # Enable directory browsing and .htaccess
    <Directory "/mnt/disk2/var/www/bankimOnlineAdmin_client">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog /mnt/disk2/var/www/logs/bankimonline_error.log
    CustomLog /mnt/disk2/var/www/logs/bankimonline_access.log combined
</VirtualHost>

# === ADMIN SUBDOMAIN HTTPS ===
<VirtualHost *:443>
    ServerName admin.bankimonline.com
    
    # CRITICAL: SSL Configuration for ADMIN DOMAIN (same certificate)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bankimonline.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bankimonline.com/privkey.pem
    
    # Reverse proxy to admin panel
    ProxyPass / http://localhost:8005/
    ProxyPassReverse / http://localhost:8005/
    ProxyPreserveHost On
    
    # Proxy timeout settings
    ProxyTimeout 300
    ProxyPassReverse / http://localhost:8005/
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    # Logging
    ErrorLog /mnt/disk2/var/www/logs/admin_bankimonline_error.log
    CustomLog /mnt/disk2/var/www/logs/admin_bankimonline_access.log combined
</VirtualHost>

# === HTTP TO HTTPS REDIRECTS ===
<VirtualHost *:80>
    ServerName bankimonline.com
    ServerAlias www.bankimonline.com
    Redirect permanent / https://bankimonline.com/
</VirtualHost>

<VirtualHost *:80>
    ServerName admin.bankimonline.com
    Redirect permanent / https://admin.bankimonline.com/
</VirtualHost>

EOF

echo -e "${BLUE}Step 4: EMERGENCY - Verify and Start Apache${NC}"
echo "-------------------------------------------"
cat << 'EOF'
# Test Apache configuration
sudo apache2ctl configtest

# If config test passes, start Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Check Apache status
sudo systemctl status apache2

# Check if Apache is listening on correct ports
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :80

EOF

echo -e "${BLUE}Step 5: EMERGENCY - Verify SSL Certificate Fix${NC}"
echo "---------------------------------------------"
cat << 'EOF'
# Test SSL certificate from server
openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1 | head -20

# Test certificate covers both domains
openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1 | openssl x509 -text -noout | grep -A5 "Subject Alternative Name"

# Test both domains with curl
curl -I https://bankimonline.com/ 2>&1 | head -5
curl -I https://admin.bankimonline.com/ 2>&1 | head -5

EOF

echo -e "${BLUE}Step 6: EMERGENCY - Verify Admin Panel Working${NC}"
echo "---------------------------------------------"
cat << 'EOF'
# Check PM2 admin panel status
pm2 status bankim-admin-panel

# If not running, start it
pm2 restart bankim-admin-panel || pm2 start bankim-admin-panel

# Test admin panel authentication
curl -X POST https://admin.bankimonline.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' 2>/dev/null | head -5

EOF

echo ""
echo -e "${RED}🚨 CRITICAL ALTERNATIVE: If Let's Encrypt Fails${NC}"
echo "==============================================="
echo "If the Let's Encrypt certificate generation fails, here are alternatives:"
echo ""

echo -e "${YELLOW}Option A: Use Cloudflare SSL (FREE)${NC}"
echo "-----------------------------------"
cat << 'EOF'
# 1. Sign up for Cloudflare account (free)
# 2. Add bankimonline.com domain to Cloudflare
# 3. Change DNS nameservers to Cloudflare's
# 4. Enable "Full (strict)" SSL in Cloudflare dashboard
# 5. Cloudflare will provide SSL certificates automatically

Benefits:
✅ Free SSL certificates
✅ Automatic renewal
✅ DDoS protection
✅ CDN acceleration
✅ Works with both main domain and subdomains

Setup time: 15-30 minutes
EOF

echo ""
echo -e "${YELLOW}Option B: Purchase Commercial SSL Certificate${NC}"
echo "--------------------------------------------"
cat << 'EOF'
Recommended SSL Certificate Providers:

1. **DigiCert** (~$200/year)
   - Wildcard SSL covers *.bankimonline.com
   - Highest browser compatibility
   - 24/7 support

2. **Sectigo/Comodo** (~$100/year)
   - Multi-domain SSL
   - Good price/performance ratio

3. **GoDaddy SSL** (~$80/year)
   - Easy integration
   - Good for small businesses

4. **Namecheap SSL** (~$60/year)
   - Most affordable option
   - Still reliable

For IMMEDIATE fix: Choose DigiCert or use Cloudflare (free)
EOF

echo ""
echo -e "${YELLOW}Option C: Temporary Fix - Self-Signed Certificate${NC}"
echo "------------------------------------------------"
cat << 'EOF'
# Generate temporary self-signed certificate (browsers will warn but site works)
sudo openssl req -x509 -nodes -days 90 -newkey rsa:2048 \
    -keyout /etc/ssl/private/bankimonline-temp.key \
    -out /etc/ssl/certs/bankimonline-temp.crt \
    -subj "/C=US/ST=State/L=City/O=BankIM/CN=bankimonline.com" \
    -extensions v3_req -config <(cat /etc/ssl/openssl.cnf <(printf "\n[v3_req]\nsubjectAltName=DNS:bankimonline.com,DNS:www.bankimonline.com,DNS:admin.bankimonline.com"))

# Update Apache to use temporary certificate
# SSLCertificateFile /etc/ssl/certs/bankimonline-temp.crt
# SSLCertificateKeyFile /etc/ssl/private/bankimonline-temp.key

WARNING: Browsers will show security warning, but site will be accessible
EOF

echo ""
echo -e "${GREEN}📋 RECOMMENDED IMMEDIATE ACTION PLAN:${NC}"
echo "====================================="
echo "1. 🚨 Execute Steps 1-6 above to fix Let's Encrypt certificate"
echo "2. 🔄 If Step 2 fails, immediately set up Cloudflare (free, 15 minutes)"
echo "3. 🛒 For long-term: Purchase DigiCert wildcard certificate"
echo "4. 🧪 Run Playwright tests to verify fix"
echo ""

echo -e "${RED}⏰ TIME CRITICAL:${NC}"
echo "=================="
echo "Production site is currently DOWN - execute fix IMMEDIATELY"
echo "Expected fix time: 30-60 minutes depending on certificate method"
echo ""

echo -e "${GREEN}✅ This script provides 4 different solutions to fix SSL certificates${NC}"
echo "Choose the method that works best for your situation."