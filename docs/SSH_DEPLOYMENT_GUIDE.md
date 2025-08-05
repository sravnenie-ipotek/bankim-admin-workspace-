# 🚀 BankIM Client Deployment Guide

## 📋 **Overview**

This guide explains how to deploy the BankIM Management Portal client application to the SSH server, keeping it completely separate from the existing `bankimOnline` API server.

## 🏗️ **Server Structure After Deployment**

```
/var/www/bankim/
├── bankimonlineapi/          # Existing API Server (Port 8003)
│   ├── server-db.js
│   ├── package.json
│   └── .env.production
├── bankim-admin-client/      # NEW: Client Application (Port 3000)
│   ├── build/               # React build output
│   ├── package.json
│   ├── .env.production
│   └── nginx.conf
└── nginx/                   # Nginx configuration
    └── sites-available/
        ├── bankim-api.conf  # API server config
        └── bankim-admin-client.conf # Client app config
```

## 🚀 **Step-by-Step Deployment**

### **1. SSH into Server**
```bash
ssh root@your-server-ip
```

### **2. Create Client Directory**
```bash
# Navigate to the bankim directory
cd /var/www/bankim

# Create client directory
mkdir bankim-admin-client
cd bankim-admin-client
```

### **3. Clone Client Repository**
```bash
# Clone the client repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git .

# Or if using HTTPS
git clone https://github.com/MichaelMishaev/bankimOnlineAdmin_client.git .
```

### **4. Install Dependencies**
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm run build
```

### **5. Create Production Environment**
```bash
# Create production environment file
cat > .env.production << 'EOF'
VITE_API_URL=http://your-server-ip:8003/api
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
EOF

# Build for production
npm run build
```

### **6. Install PM2 for Process Management**
```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bankim-admin-client',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/bankim/bankim-admin-client',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/bankim-admin-client-error.log',
    out_file: '/var/log/bankim-admin-client-out.log',
    log_file: '/var/log/bankim-admin-client-combined.log'
  }]
};
EOF
```

### **7. Start Client Application**
```bash
# Start the client application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

## 🌐 **Nginx Configuration**

### **1. Install Nginx (if not installed)**
```bash
sudo apt update
sudo apt install nginx
```

### **2. Create Nginx Configuration for Client**
```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/bankim-admin-client << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (you'll need to set up SSL certificates)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Root directory
    root /var/www/bankim/bankim-admin-client/dist;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy to backend server
    location /api/ {
        proxy_pass http://localhost:8003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF
```

### **3. Enable Site and Restart Nginx**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/bankim-admin-client /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🔧 **SSL Certificate Setup (Optional but Recommended)**

### **1. Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

### **2. Get SSL Certificate**
```bash
# Replace with your actual domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### **3. Auto-renewal**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 **Deployment Scripts**

### **1. Create Deployment Script**
```bash
# Create deployment script
cat > /var/www/bankim/deploy-client.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting BankIM Client Deployment..."

# Navigate to client directory
cd /var/www/bankim/bankim-admin-client

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart bankim-admin-client

echo "✅ Deployment completed successfully!"
echo "🌐 Application available at: https://your-domain.com"
EOF

# Make script executable
chmod +x /var/www/bankim/deploy-client.sh
```

### **2. Create Backup Script**
```bash
# Create backup script
cat > /var/www/bankim/backup-client.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/bankim/backups/client"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup client build
tar -czf $BACKUP_DIR/client_backup_$DATE.tar.gz -C /var/www/bankim/bankim-admin-client dist/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "client_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Client backup completed: client_backup_$DATE.tar.gz"
EOF

# Make script executable
chmod +x /var/www/bankim/backup-client.sh
```

## 📊 **Monitoring and Maintenance**

### **1. PM2 Commands**
```bash
# Check status
pm2 status

# View logs
pm2 logs bankim-admin-client

# Monitor resources
pm2 monit

# Restart application
pm2 restart bankim-admin-client

# Stop application
pm2 stop bankim-admin-client

# Delete application from PM2
pm2 delete bankim-admin-client
```

### **2. Nginx Commands**
```bash
# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# Reload nginx configuration
sudo systemctl reload nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# View nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### **3. Application Logs**
```bash
# View PM2 logs
pm2 logs bankim-admin-client

# View specific log files
tail -f /var/log/bankim-admin-client-error.log
tail -f /var/log/bankim-admin-client-out.log
```

## 🔒 **Security Configuration**

### **1. Firewall Setup**
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

### **2. Security Headers**
The nginx configuration already includes security headers, but you can enhance them:

```nginx
# Additional security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Download-Options "noopen" always;
add_header X-Permitted-Cross-Domain-Policies "none" always;
```

## 🚨 **Troubleshooting**

### **1. Common Issues**

**Application Not Starting:**
```bash
# Check PM2 logs
pm2 logs bankim-admin-client

# Check if port is in use
netstat -tulpn | grep 3000

# Restart PM2
pm2 restart bankim-admin-client
```

**Nginx Not Serving Files:**
```bash
# Check nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/bankim/bankim-admin-client/dist/

# Fix permissions if needed
sudo chown -R www-data:www-data /var/www/bankim/bankim-admin-client/dist/
```

**SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

### **2. Performance Optimization**

**Enable Gzip Compression:**
```nginx
# Already included in nginx config, but verify
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

**Enable Browser Caching:**
```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📈 **Performance Monitoring**

### **1. Install Monitoring Tools**
```bash
# Install htop for system monitoring
sudo apt install htop

# Install nginx status module
sudo apt install nginx-module-status
```

### **2. Monitor Application Performance**
```bash
# Monitor system resources
htop

# Monitor PM2 processes
pm2 monit

# Check nginx status
sudo systemctl status nginx
```

## 🔄 **Update Process**

### **1. Manual Update**
```bash
# Run deployment script
/var/www/bankim/deploy-client.sh
```

### **2. Automated Updates (Optional)**
```bash
# Add to crontab for daily updates
crontab -e
# Add: 0 2 * * * /var/www/bankim/deploy-client.sh
```

## 📞 **Support Information**

### **Important Paths**
- **Client Application**: `/var/www/bankim/bankim-admin-client/`
- **PM2 Process**: `bankim-admin-client`
- **Nginx Config**: `/etc/nginx/sites-available/bankim-admin-client`
- **Logs**: `/var/log/bankim-admin-client-*.log`

### **Contact Information**
- **Repository**: `git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git`
- **Server**: SSH server at `/var/www/bankim/bankim-admin-client`
- **PM2 Process**: `bankim-admin-client`
- **Port**: 3000 (internal), 80/443 (external via nginx)

---

## ✅ **Deployment Checklist**

- [ ] SSH into server
- [ ] Create client directory
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Create production environment
- [ ] Build application
- [ ] Configure PM2
- [ ] Start application
- [ ] Configure nginx
- [ ] Set up SSL (optional)
- [ ] Configure firewall
- [ ] Test application
- [ ] Set up monitoring
- [ ] Create backup scripts

**Last Updated**: January 2025
**Version**: 1.0.0 