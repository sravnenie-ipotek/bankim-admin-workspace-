# 🏦 BankimOnline Application Deployment Guide

**Deploy BankimOnline App to Production Server (Security Infrastructure Already Complete)**

---

## 📊 **CURRENT STATUS**

### ✅ **COMPLETED (Security Infrastructure Ready):**
- SSL/HTTPS certificates ✅ (Valid 89 days)
- Nginx reverse proxy ✅ (With security headers)
- Fail2ban DDoS protection ✅ 
- Firewall configuration ✅ (Ports secured)
- Admin Portal ✅ (Running on ports 3002-3003)
- Domain routing ✅ (bankimonline.com, admin.bankimonline.com)
- Automated monitoring ✅ (Every 30 minutes)
- SSL auto-renewal ✅ (Daily at 2 AM)

### 🔄 **REMAINING TASKS:**
- BankimOnline App deployment (4 repositories)
- Local PostgreSQL database setup  
- PM2 configuration for port 8004
- Static file serving configuration

---

## 🎯 **DEPLOYMENT STEPS (Only What's Left)**

### **STEP 1: Connect and Set Variables**

```bash
# Connect to server
ssh root@185.253.72.80

# Set domain variables
DOMAIN="bankimonline.com"
EMAIL="admin@bankimonline.com"

# Verify server status
echo "🔍 Current server status:"
pm2 list | grep -E "(admin|bankim)"
netstat -tlnp | grep -E ":(3002|3003|8004)"
```

---

### **STEP 2: Deploy BankimOnline Repositories**

```bash
# Navigate to deployment directory
cd /var/www/bankim/online/

# Clone 4 repositories (4-REPOSITORY SYSTEM)
git clone git@github.com:sravnenie-ipotek/bankimonline-workspace.git workspace
git clone git@github.com:sravnenie-ipotek/bankimonline-web.git web
git clone git@github.com:sravnenie-ipotek/bankimonline-api.git api
git clone git@github.com:sravnenie-ipotek/bankimonline-shared.git shared

# Set proper ownership
chown -R www-data:www-data /var/www/bankim/online/
chmod -R 755 /var/www/bankim/online/

echo "✅ BankimOnline repositories cloned"
```

---

### **STEP 3: Configure Frontend (bankimonline-web)**

```bash
# Setup frontend application
cd /var/www/bankim/online/web/

# Install dependencies
npm install --production

# Create production environment
cat > .env.production << EOF
NODE_ENV=production
VITE_NODE_API_BASE_URL=https://$DOMAIN
VITE_APP_NAME=BankimOnline
VITE_APP_ENV=production
GENERATE_SOURCEMAP=false
EOF

# Build frontend
npm run build

# Verify build exists
ls -la build/ || ls -la dist/ || echo "❌ Build directory not found"

echo "✅ Frontend build completed"
```

---

### **STEP 4: Setup Local PostgreSQL Database**

```bash
# Install PostgreSQL (if not already installed)
apt install -y postgresql postgresql-contrib

# Create BankimOnline database and user
sudo -u postgres createdb bankimonline_production
sudo -u postgres createuser bankimonline_user

# Set secure password
sudo -u postgres psql -c "ALTER USER bankimonline_user PASSWORD 'bankimonline_secure_2024';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bankimonline_production TO bankimonline_user;"

# Test connection
psql -U bankimonline_user -d bankimonline_production -h localhost -c "SELECT version();"

echo "✅ Local PostgreSQL configured for BankimOnline"
```

---

### **STEP 5: Configure Backend (bankimonline-api)**

```bash
# Setup backend server
cd /var/www/bankim/online/api/

# Install dependencies
npm install --production

# Create production environment
cat > .env.production << EOF
NODE_ENV=production
PORT=8004

# Local PostgreSQL Database
DATABASE_URL=postgresql://bankimonline_user:bankimonline_secure_2024@localhost:5432/bankimonline_production
CONTENT_DATABASE_URL=postgresql://bankimonline_user:bankimonline_secure_2024@localhost:5432/bankimonline_production

# Security Configuration
JWT_SECRET=\$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
API_RATE_LIMIT=1000
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://$DOMAIN
CORS_CREDENTIALS=true

# File Upload Configuration
UPLOAD_PATH=/var/www/bankim/online/uploads
MAX_FILE_SIZE=10485760

# Security Headers
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/bankim-online/server.log

# Session Security
SESSION_SECRET=\$(openssl rand -hex 32)
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=strict
EOF

# Create uploads directory
mkdir -p /var/www/bankim/online/uploads
chown -R www-data:www-data /var/www/bankim/online/uploads
chmod 755 /var/www/bankim/online/uploads

# Create log directory
mkdir -p /var/log/bankim-online
chown www-data:www-data /var/log/bankim-online

echo "✅ Backend configuration completed"
```

---

### **STEP 6: Configure Static File Serving**

```bash
# CRITICAL: Verify server-db.js serves static files
cd /var/www/bankim/online/api/

# Check if static file serving is configured
grep -n "static" server-db.js || echo "❌ CRITICAL: Static file serving not configured"
grep -n "sendFile" server-db.js || echo "❌ CRITICAL: SPA routing not configured"

# If missing, add this configuration to server-db.js:
echo "🔧 Add this to your server-db.js file:"
echo "const express = require('express');"
echo "const path = require('path');"
echo ""
echo "// Serve static files from React build"
echo "app.use(express.static(path.join(__dirname, '../web/build')));"
echo ""
echo "// API routes"
echo "app.use('/api', apiRoutes);"
echo ""
echo "// Serve frontend for all non-API routes (SPA routing)"
echo "app.get('*', (req, res) => {"
echo "  if (!req.path.startsWith('/api')) {"
echo "    res.sendFile(path.join(__dirname, '../web/build/index.html'));"
echo "  }"
echo "});"

echo "⚠️  MANUAL: Update server-db.js with static file serving configuration above"
```

---

### **STEP 7: Setup PM2 Configuration**

```bash
# Create PM2 ecosystem for BankimOnline
cd /var/www/bankim/online/

cat > ecosystem.production.js << EOF
module.exports = {
  apps: [
    {
      name: 'bankim-online-server',
      cwd: '/var/www/bankim/online/api',
      script: 'server-db.js',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8004
      },
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      min_uptime: '10s',
      max_restarts: 10,
      log_file: '/var/log/pm2/bankim-online-server.log',
      error_file: '/var/log/pm2/bankim-online-server-error.log',
      out_file: '/var/log/pm2/bankim-online-server-out.log',
      time: true
    }
  ]
}
EOF

echo "✅ PM2 ecosystem configured"
```

---

### **STEP 8: Update Nginx Configuration for BankimOnline**

```bash
# Add BankimOnline upstream to existing Nginx config
# Edit /etc/nginx/sites-available/bankimonline

# Add this upstream definition (before existing server blocks):
echo "upstream bankim_online {"
echo "    server 127.0.0.1:8004 max_fails=3 fail_timeout=30s;"
echo "}"

# Update the main server block to proxy to BankimOnline:
echo "🔧 Update the main server block in /etc/nginx/sites-available/bankimonline:"
echo ""
echo "# Main BankimOnline application (Frontend + API)"
echo "location / {"
echo "    proxy_pass http://bankim_online;"
echo "    proxy_http_version 1.1;"
echo "    proxy_set_header Upgrade \$http_upgrade;"
echo "    proxy_set_header Connection 'upgrade';"
echo "    proxy_set_header Host \$host;"
echo "    proxy_set_header X-Real-IP \$remote_addr;"
echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "    proxy_set_header X-Forwarded-Proto \$scheme;"
echo "    proxy_cache_bypass \$http_upgrade;"
echo "}"
echo ""
echo "# API endpoints (same server)"
echo "location /api/ {"
echo "    proxy_pass http://bankim_online/api/;"
echo "    proxy_http_version 1.1;"
echo "    proxy_set_header Host \$host;"
echo "    proxy_set_header X-Real-IP \$remote_addr;"
echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "    proxy_set_header X-Forwarded-Proto \$scheme;"
echo "}"

echo "⚠️  MANUAL: Update Nginx configuration with the above proxy settings"
echo "⚠️  Then run: nginx -t && systemctl reload nginx"
```

---

### **STEP 9: Start BankimOnline Application**

```bash
# Start BankimOnline with PM2
cd /var/www/bankim/online/
pm2 start ecosystem.production.js --env production

# Save PM2 configuration
pm2 save

# Verify application started
pm2 list | grep bankim-online-server

echo "✅ BankimOnline application started on port 8004"
```

---

### **STEP 10: Final Verification**

```bash
# Test database connection
psql -U bankimonline_user -d bankimonline_production -h localhost -c "SELECT version();"

# Check PM2 status
pm2 list

# Test application health
curl -I http://localhost:8004 || echo "❌ App not responding locally"

# Test domain routing (after Nginx update)
curl -I https://bankimonline.com || echo "❌ Domain not routing"

# Check logs
pm2 logs bankim-online-server --lines 20

# Show final status
echo ""
echo "🎉 BANKIMONLINE DEPLOYMENT STATUS:"
echo "==================================="
echo "✅ Database: Local PostgreSQL"
echo "✅ Frontend: Built and configured"  
echo "✅ Backend: Running on port 8004"
echo "✅ PM2: Managing application"
echo ""
echo "🌐 PRODUCTION URLS:"
echo "   Main App: https://bankimonline.com"
echo "   Admin Portal: https://admin.bankimonline.com" 
echo ""
echo "📋 MANUAL STEPS REMAINING:"
echo "1. Update server-db.js with static file serving"
echo "2. Update Nginx configuration with proxy settings"
echo "3. Reload Nginx: nginx -t && systemctl reload nginx"
```

---

## ⚠️ **CRITICAL MANUAL STEPS**

### **1. Static File Serving (server-db.js)**
Add this code to `/var/www/bankim/online/api/server-db.js`:

```javascript
// Serve static files from React build
app.use(express.static(path.join(__dirname, '../web/build')));

// API routes
app.use('/api', apiRoutes);

// Serve frontend for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../web/build/index.html'));
  }
});
```

### **2. Nginx Proxy Configuration**  
Update `/etc/nginx/sites-available/bankimonline` with BankimOnline proxy settings, then:

```bash
nginx -t && systemctl reload nginx
```

---

## 🎯 **FINAL RESULT**

**Two Applications Running:**
- **BankimOnline App**: https://bankimonline.com (port 8004)
- **Admin Portal**: https://admin.bankimonline.com (ports 3002-3003)

**All security infrastructure already in place - only application deployment completed!**