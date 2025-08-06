# 🎯 Production Setup Guide - BankIM SSH Server

**Step-by-step guide to deploy BankIM Management Portal to SSH production server**

---

## 📋 **Prerequisites**

### **Server Requirements**
- **SSH Server**: `185.253.72.80` (root access)
- **Node.js**: 18+ (will be installed by script)
- **PM2**: Process manager (will be installed)
- **Git**: Version control (will be installed)
- **Storage**: Minimum 5GB free space

### **GitHub Requirements**
- Access to 4 BankIM repositories
- SSH key configured for GitHub access on server
- Repository secrets configured for GitHub Actions

---

## 🚀 **Step 1: Initial Server Setup**

### **Connect to Server**
```bash
# Connect via SSH
ssh root@185.253.72.80
```

### **Run Initial Deployment Script**
```bash
# Download and run the setup script
cd /tmp
curl -O https://raw.githubusercontent.com/sravnenie-ipotek/bankim-admin-workspace-/main/scripts/ssh-deploy-init.sh
chmod +x ssh-deploy-init.sh
./ssh-deploy-init.sh
```

**This script will:**
- ✅ Install Node.js 18, PM2, Git, Nginx, UFW
- ✅ Clone all 4 repositories to `/var/www/bankim/`
- ✅ Build and configure dashboard and API
- ✅ Create PM2 ecosystem configuration
- ✅ Set up deployment automation scripts
- ✅ Configure firewall rules
- ✅ Create backup and monitoring scripts

---

## 🔧 **Step 2: Configure Environment Variables**

### **API Environment Configuration**
```bash
# Edit API production environment
nano /var/www/bankim/api/mainapp/.env.production
```

**Required Configuration:**
```bash
NODE_ENV=production
PORT=3001

# Database connections - CONFIGURE THESE WITH YOUR ACTUAL VALUES
CONTENT_DATABASE_URL=postgresql://username:password@host:5432/bankim_content
CORE_DATABASE_URL=postgresql://username:password@host:5432/bankim_core  
MANAGEMENT_DATABASE_URL=postgresql://username:password@host:5432/bankim_management

# Security - CHANGE THESE VALUES
JWT_SECRET=your-secure-jwt-secret-minimum-32-chars
API_RATE_LIMIT=100

# Optional
LOG_LEVEL=info
```

### **Dashboard Environment Configuration**
```bash
# Edit dashboard production environment  
nano /var/www/bankim/dashboard/mainapp/.env.production
```

**Configuration:**
```bash
NODE_ENV=production
VITE_API_URL=http://185.253.72.80:3001
VITE_ENVIRONMENT=production
```

---

## 🏃 **Step 3: Start Applications**

### **Start with PM2**
```bash
cd /var/www/bankim/

# Start applications using ecosystem file
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system reboot
pm2 startup
# Follow the displayed command to complete setup
```

### **Verify Applications**
```bash
# Check PM2 status
pm2 list

# Check logs
pm2 logs bankim-api
pm2 logs bankim-dashboard

# Test applications
curl http://localhost:3001/health     # Should return API health status
curl http://localhost:3002            # Should return dashboard HTML
```

---

## 🌐 **Step 4: Configure GitHub Actions**

### **Repository Secrets Setup**

For each repository, add these secrets in GitHub repository settings:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SSH_HOST` | `185.253.72.80` | Server IP address |
| `SSH_USERNAME` | `root` | SSH username |
| `SSH_PASSWORD` | `PZy3oNaxQLTCvf` | SSH password |

### **Add Workflow Files**

**For `bankim-admin-dashboard` repository:**
```bash
# Create .github/workflows/ directory and add deploy.yml
mkdir -p .github/workflows/
# Copy content from scripts/github-actions/dashboard-deploy.yml
```

**For `bankim-admin-api` repository:**
```bash
# Create .github/workflows/ directory and add deploy.yml  
mkdir -p .github/workflows/
# Copy content from scripts/github-actions/api-deploy.yml
```

**For `bankim-admin-shared` repository:**
```bash
# Create .github/workflows/ directory and add deploy.yml
mkdir -p .github/workflows/
# Copy content from scripts/github-actions/shared-deploy.yml
```

---

## 🔍 **Step 5: Test Deployment**

### **Manual Deployment Test**
```bash
# On the server, test manual deployment
cd /var/www/bankim/
./deploy.sh
```

### **GitHub Actions Test**
```bash
# Make a small change to any repository and push to main branch
# Check GitHub Actions tab to verify deployment workflow runs
```

### **Application Testing**
```bash
# Test API endpoints
curl http://185.253.72.80:3001/health
curl http://185.253.72.80:3001/api/content/test

# Test Dashboard
curl http://185.253.72.80:3002

# Test in browser:
# Dashboard: http://185.253.72.80:3002  
# API: http://185.253.72.80:3001/health
```

---

## 📊 **Step 6: Setup Monitoring & Backups**

### **Setup Health Monitoring**
```bash
# Schedule health checks every 5 minutes
crontab -e

# Add this line:
*/5 * * * * /var/www/bankim/health-check.sh >> /var/log/bankim-health.log 2>&1
```

### **Setup Daily Backups**
```bash
# Schedule daily backups at 2 AM
crontab -e  

# Add this line:
0 2 * * * /var/www/bankim/backup.sh >> /var/log/bankim-backup.log 2>&1
```

### **Setup Log Rotation**
```bash
# Create logrotate configuration
cat > /etc/logrotate.d/bankim << EOF
/var/log/bankim-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}

/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

---

## 🔒 **Step 7: Security Configuration**

### **Firewall Verification**
```bash
# Check firewall status
ufw status

# Should show:
# 22/tcp     ALLOW       SSH
# 80/tcp     ALLOW       HTTP  
# 443/tcp    ALLOW       HTTPS
# 3001/tcp   ALLOW       API
# 3002/tcp   ALLOW       Dashboard
```

### **SSH Key Setup (Recommended)**
```bash
# Generate SSH key for GitHub access (if not already done)
ssh-keygen -t rsa -b 4096 -C "bankim-server@185.253.72.80"

# Add public key to GitHub account
cat ~/.ssh/id_rsa.pub
# Copy output and add to GitHub SSH keys
```

### **Database Security**
- ✅ Use strong database passwords
- ✅ Enable SSL for database connections
- ✅ Restrict database access by IP
- ✅ Regular security updates

---

## 🎯 **Step 8: Production Access URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | `http://185.253.72.80:3002` | React frontend application |
| **API Health** | `http://185.253.72.80:3001/health` | API health check |
| **API Docs** | `http://185.253.72.80:3001/api` | API endpoints |

### **Optional: Custom Domain Setup**
```bash
# If you have a custom domain, configure nginx reverse proxy
apt install nginx

# Configure nginx sites
cat > /etc/nginx/sites-available/bankim << EOF
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bankim /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 🛠️ **Management Commands**

### **Application Management**
```bash
# Check status
pm2 list
pm2 logs
pm2 monit

# Restart applications
pm2 restart bankim-api bankim-dashboard
pm2 reload all

# Stop applications
pm2 stop bankim-api bankim-dashboard
```

### **Deployment Commands**
```bash
# Manual deployment (pulls all repositories)
cd /var/www/bankim && ./deploy.sh

# Deploy specific component
cd /var/www/bankim/api && git pull && pm2 reload bankim-api
cd /var/www/bankim/dashboard && git pull && npm run build && pm2 reload bankim-dashboard
```

### **Monitoring Commands**
```bash
# Health check
/var/www/bankim/health-check.sh

# View logs
tail -f /var/log/pm2/bankim-api.log
tail -f /var/log/pm2/bankim-dashboard.log
tail -f /var/log/bankim-deploy.log

# System resources
htop
df -h
free -h
```

### **Backup Commands**
```bash
# Create backup
/var/www/bankim/backup.sh

# List backups
ls -la /var/backups/bankim/

# Restore backup
cd /var/www/
tar -xzf /var/backups/bankim/bankim-YYYYMMDD.tar.gz
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

**API Not Starting:**
```bash
# Check logs
pm2 logs bankim-api

# Check database connection
cd /var/www/bankim/api/mainapp
node -e "console.log(process.env)" | grep DATABASE

# Test database connectivity
psql $CONTENT_DATABASE_URL -c "SELECT 1;"
```

**Dashboard Not Loading:**
```bash
# Check if built correctly
ls -la /var/www/bankim/dashboard/mainapp/

# Rebuild dashboard
cd /var/www/bankim/dashboard
npm run build
cp -r dist/* mainapp/
pm2 reload bankim-dashboard
```

**GitHub Actions Failing:**
```bash
# Check repository secrets are configured
# Verify SSH access from GitHub Actions
# Check server logs during deployment
tail -f /var/log/bankim-deploy.log
```

### **Emergency Procedures**

**Complete Restart:**
```bash
pm2 stop all
pm2 start ecosystem.config.js
```

**Restore from Backup:**
```bash
cd /var/www/
pm2 stop all
mv bankim bankim-broken
tar -xzf /var/backups/bankim/bankim-latest.tar.gz
pm2 start bankim/ecosystem.config.js
```

**Factory Reset:**
```bash
# Complete reinstallation
rm -rf /var/www/bankim
/tmp/ssh-deploy-init.sh
# Reconfigure environment variables
# Restart applications
```

---

## ✅ **Post-Deployment Checklist**

### **Functional Testing**
- [ ] Dashboard loads at `http://185.253.72.80:3002`
- [ ] API responds at `http://185.253.72.80:3001/health`
- [ ] Database connections working
- [ ] Authentication system functioning
- [ ] Content management features working
- [ ] All API endpoints responding

### **Infrastructure Testing**
- [ ] PM2 processes running and stable
- [ ] Logs being generated properly
- [ ] Health monitoring working
- [ ] Backup system operational
- [ ] Firewall rules active
- [ ] GitHub Actions deploying successfully

### **Performance Testing**
- [ ] Dashboard loads in <3 seconds
- [ ] API responses <500ms
- [ ] Memory usage reasonable (<1GB per service)
- [ ] CPU usage normal (<50% average)

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- **Daily**: Check application health and logs
- **Weekly**: Review backup integrity and disk usage
- **Monthly**: Update system packages and security patches
- **Quarterly**: Review and rotate security credentials

### **Contact Information**
- **Server**: `root@185.253.72.80`
- **Logs**: `/var/log/bankim-*.log` and `/var/log/pm2/*.log`
- **Backups**: `/var/backups/bankim/`
- **Configuration**: `/var/www/bankim/`

---

**🎉 BankIM Production Server is now fully configured and operational!**

**Access your application at:**
- **Dashboard**: http://185.253.72.80:3002
- **API**: http://185.253.72.80:3001/health