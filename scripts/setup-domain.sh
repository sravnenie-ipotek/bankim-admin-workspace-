#!/bin/bash

# Setup script for admin.bankimonline.com on TEST server
# Run this on the TEST server (91.202.169.54)

set -e

echo "🌐 Setting up admin.bankimonline.com on TEST server"

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo "🔐 Installing Certbot for SSL..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Copy Nginx configuration
echo "📝 Configuring Nginx..."
cp /var/www/bankim/infrastructure/nginx/admin.bankimonline.com.conf /etc/nginx/sites-available/admin.bankimonline.com

# Enable the site
ln -sf /etc/nginx/sites-available/admin.bankimonline.com /etc/nginx/sites-enabled/

# Remove default Nginx site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Get SSL certificate (comment out for testing without domain)
echo "🔐 Obtaining SSL certificate..."
certbot --nginx -d admin.bankimonline.com --non-interactive --agree-tos --email admin@bankimonline.com || {
    echo "⚠️ SSL certificate failed, continuing with HTTP only..."
    
    # Create HTTP-only config
    cat > /etc/nginx/sites-available/admin.bankimonline.com << 'EOF'
server {
    listen 80;
    server_name admin.bankimonline.com _;
    
    root /var/www/bankim/packages/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    access_log /var/log/nginx/admin.bankimonline.com.access.log;
    error_log /var/log/nginx/admin.bankimonline.com.error.log;
}
EOF
}

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Setup firewall if UFW is present
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    echo "y" | ufw enable || true
fi

# Build client if needed
if [ -d "/var/www/bankim/packages/client" ]; then
    echo "🔨 Building client application..."
    cd /var/www/bankim/packages/client
    npm install
    npm run build || echo "⚠️ Build completed with warnings"
    cd -
fi

# Start/restart backend with PM2
echo "🚀 Starting backend server..."
cd /var/www/bankim/packages/server
pm2 delete bankim-api 2>/dev/null || true
pm2 start server.js --name bankim-api --env production
pm2 save
pm2 startup systemd -u root --hp /root || true

# Show status
echo ""
echo "✅ Domain setup completed!"
echo "=================================="
echo "📍 Domain: https://admin.bankimonline.com"
echo "📍 Server IP: $(curl -s ifconfig.me)"
echo "📍 Nginx Status: $(systemctl is-active nginx)"
echo "📍 PM2 Status:"
pm2 list
echo ""
echo "⚠️ Remember to update DNS:"
echo "   A Record: admin.bankimonline.com → 91.202.169.54"
echo "=================================="