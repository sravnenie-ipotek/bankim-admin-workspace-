#!/bin/bash

echo "🔐 Installing PositiveSSL Certificate for bankimonline.com"
echo "========================================================"

# Certificate files location
CERT_DIR="/Users/michaelmishayev/Projects/bankIM_management_portal/docs/ssl/bankimonline_com"

# Server paths
SSL_DIR="/etc/ssl"
APACHE_CERT_DIR="/etc/apache2/ssl"

echo "📋 Step 1: Copy certificate files to server"
echo "-------------------------------------------"
echo "You'll need to upload these files to your server:"
echo ""
echo "1. Upload certificate files:"
echo "   scp $CERT_DIR/bankimonline_com.crt root@YOUR_SERVER_IP:/tmp/"
echo "   scp $CERT_DIR/bankimonline_com.ca-bundle root@YOUR_SERVER_IP:/tmp/"
echo ""

echo "📦 Step 2: On the server, install certificates"
echo "----------------------------------------------"
cat << 'SERVER_COMMANDS'
# SSH to your server first, then run:

# Create directories if needed
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

# Move certificate files to proper locations
sudo cp /tmp/bankimonline_com.crt /etc/ssl/certs/
sudo cp /tmp/bankimonline_com.ca-bundle /etc/ssl/certs/

# Combine certificate with CA bundle for Apache
sudo cat /etc/ssl/certs/bankimonline_com.crt /etc/ssl/certs/bankimonline_com.ca-bundle > /etc/ssl/certs/bankimonline_com_combined.crt

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/bankimonline_com.crt
sudo chmod 644 /etc/ssl/certs/bankimonline_com.ca-bundle
sudo chmod 644 /etc/ssl/certs/bankimonline_com_combined.crt

# The private key should already exist from CSR generation
sudo chmod 600 /etc/ssl/private/bankimonline.com.key

SERVER_COMMANDS

echo ""
echo "🔧 Step 3: Update Apache Configuration"
echo "--------------------------------------"
cat << 'APACHE_CONFIG'
# Edit Apache configuration:
sudo nano /etc/apache2/conf/httpd.conf

# Update the VirtualHost for HTTPS (port 443) with these SSL directives:

<VirtualHost *:443>
    ServerName bankimonline.com
    ServerAlias www.bankimonline.com
    DocumentRoot /mnt/disk2/var/www/bankimOnlineAdmin_client
    
    # SSL Configuration - UPDATE THESE LINES:
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/bankimonline_com.crt
    SSLCertificateKeyFile /etc/ssl/private/bankimonline.com.key
    SSLCertificateChainFile /etc/ssl/certs/bankimonline_com.ca-bundle
    
    # OR use the combined certificate:
    # SSLCertificateFile /etc/ssl/certs/bankimonline_com_combined.crt
    # SSLCertificateKeyFile /etc/ssl/private/bankimonline.com.key
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    <Directory "/mnt/disk2/var/www/bankimOnlineAdmin_client">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog /mnt/disk2/var/www/logs/bankimonline_ssl_error.log
    CustomLog /mnt/disk2/var/www/logs/bankimonline_ssl_access.log combined
</VirtualHost>

APACHE_CONFIG

echo ""
echo "✅ Step 4: Test and Restart Apache"
echo "-----------------------------------"
cat << 'RESTART_COMMANDS'
# Test Apache configuration
sudo apache2ctl configtest

# If test passes, restart Apache
sudo systemctl restart apache2

# Verify Apache is running
sudo systemctl status apache2

# Test SSL certificate
openssl s_client -connect bankimonline.com:443 -servername bankimonline.com < /dev/null | head -20

RESTART_COMMANDS

echo ""
echo "🧪 Step 5: Verify SSL is Working"
echo "---------------------------------"
echo "Test URLs:"
echo "  • https://bankimonline.com"
echo "  • https://www.bankimonline.com"
echo "  • https://admin.bankimonline.com"
echo ""
echo "Check for:"
echo "  ✅ Green padlock in browser"
echo "  ✅ No certificate warnings"
echo "  ✅ Certificate shows 'Sectigo Limited' as issuer"
echo ""
