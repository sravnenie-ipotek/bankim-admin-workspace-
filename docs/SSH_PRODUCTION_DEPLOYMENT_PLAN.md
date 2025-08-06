# 🚀 SSH Production Deployment Plan - BankIM Management Portal

**Complete production deployment strategy using 4-repository architecture on SSH server**

---

## 📋 **Executive Summary**

Deploy the BankIM Management Portal to SSH server (`185.253.72.80`) using our **4-repository hybrid architecture**. The server will run production versions of the dashboard and API, pulling from individual GitHub repositories.

**Strategy**: SSH Server ← 4 GitHub Repositories → Production Applications  
**Hosting**: SSH Server with PM2 process management  
**Deployment**: Git-based automated deployment with GitHub Actions  

---

## 🏗️ **Production Server Architecture**

### **Current SSH Server Structure**
```
/var/www/bankim/
├── bankim-admin-api/         # Backend API (production)
├── bankim-admin-client/      # Frontend Dashboard (production) 
└── [FUTURE] bankim-shared/   # Shared package (if needed)
```

### **Proposed 4-Repository Production Structure** 
```
/var/www/bankim/
├── workspace/                      # 🏠 Complete monorepo (development/backup)
│   ├── packages/client/            # Development source
│   ├── packages/server/            # Development source  
│   ├── packages/shared/            # Development source
│   └── scripts/                    # Deployment automation
├── dashboard/                      # 🎨 Production Frontend
│   ├── mainapp/                    # Built React application
│   │   ├── dist/                   # Production build
│   │   ├── package.json            # Dependencies with git+https://shared
│   │   ├── .env.production         # Production environment
│   │   └── server.js               # Static file server
│   └── .git/                       # Git: bankim-admin-dashboard
├── api/                           # 🔧 Production Backend  
│   ├── mainapp/                    # Node.js API server
│   │   ├── server.js               # Production entry point
│   │   ├── package.json            # Dependencies with git+https://shared
│   │   ├── .env.production         # Production environment
│   │   ├── config/                 # Database configurations
│   │   └── scripts/                # Migration scripts
│   └── .git/                       # Git: bankim-admin-api
└── shared/                        # 📚 Shared Package (if local needed)
    ├── dist/                       # Compiled TypeScript
    ├── package.json                # Package definition
    └── .git/                       # Git: bankim-admin-shared
```

---

## 🎯 **Repository Mapping Strategy**

| Local Path | GitHub Repository | Branch | Purpose |
|------------|------------------|---------|---------|
| `/var/www/bankim/workspace/` | `bankim-admin-workspace-.git` | `main` | **Development backup & scripts** |
| `/var/www/bankim/dashboard/` | `bankim-admin-dashboard.git` | `main` | **Production frontend** |
| `/var/www/bankim/api/` | `bankim-admin-api.git` | `main` | **Production backend** |
| `/var/www/bankim/shared/` | `bankim-admin-shared.git` | `main` | **Shared package (optional)** |

---

## 🔧 **Deployment Workflow Design**

### **Phase 1: Initial Server Setup**
```bash
# 1. Connect to SSH server
ssh root@185.253.72.80

# 2. Navigate to web directory  
cd /var/www/bankim/

# 3. Backup existing structure (if needed)
tar -czf backup-$(date +%Y%m%d).tar.gz bankim-admin-*

# 4. Clone 4 repositories
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git workspace
git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git dashboard  
git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git api
git clone git@github.com:sravnenie-ipotek/bankim-admin-shared.git shared
```

### **Phase 2: Production Configuration**
```bash
# Dashboard setup
cd /var/www/bankim/dashboard/
mkdir -p mainapp
npm install
npm run build
cp -r dist/* mainapp/
cp package.json mainapp/
echo "VITE_API_URL=http://185.253.72.80:3001" > mainapp/.env.production

# API setup  
cd /var/www/bankim/api/
mkdir -p mainapp
cp -r * mainapp/ 2>/dev/null || true
cd mainapp/
npm install
echo "PORT=3001" > .env.production
echo "NODE_ENV=production" >> .env.production
echo "CONTENT_DATABASE_URL=postgresql://..." >> .env.production

# Shared package (if needed locally)
cd /var/www/bankim/shared/
npm install
npm run build
```

### **Phase 3: PM2 Process Management**
```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Create PM2 ecosystem file
cat > /var/www/bankim/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bankim-dashboard',
      cwd: '/var/www/bankim/dashboard/mainapp',
      script: 'npx serve dist -p 3002',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'bankim-api',
      cwd: '/var/www/bankim/api/mainapp', 
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
EOF

# Start applications with PM2
cd /var/www/bankim/
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🤖 **Automated Deployment Scripts**

### **Server-Side Deployment Script**
```bash
# Create deployment script on server
cat > /var/www/bankim/deploy.sh << 'EOF'
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

chmod +x /var/www/bankim/deploy.sh
```

### **Webhook Endpoint for GitHub**
```bash
# Create webhook handler
cat > /var/www/bankim/webhook.js << 'EOF'
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const PORT = 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

app.use(express.json());

function verifySignature(payload, signature) {
    const hash = crypto.createHmac('sha256', WEBHOOK_SECRET)
                      .update(payload)
                      .digest('hex');
    return `sha256=${hash}` === signature;
}

app.post('/webhook/deploy', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);

    if (!verifySignature(payload, signature)) {
        return res.status(401).send('Unauthorized');
    }

    const { repository, ref } = req.body;
    
    if (ref !== 'refs/heads/main') {
        return res.send('Not main branch, skipping deployment');
    }

    console.log(`Deploying ${repository.name}...`);
    
    exec('/var/www/bankim/deploy.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Deployment error: ${error}`);
            return res.status(500).send('Deployment failed');
        }
        
        console.log(`Deployment output: ${stdout}`);
        res.send('Deployment triggered');
    });
});

app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
EOF

# Install webhook as PM2 service
pm2 start /var/www/bankim/webhook.js --name bankim-webhook
```

---

## 🔄 **GitHub Actions Integration**

### **Repository-Specific Actions**

**For `bankim-admin-dashboard` repository:**
```yaml
# .github/workflows/deploy.yml
name: Deploy Dashboard to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Trigger Production Deployment
      run: |
        curl -X POST \
          -H "X-Hub-Signature-256: sha256=${{ secrets.WEBHOOK_SIGNATURE }}" \
          -H "Content-Type: application/json" \
          -d '{"repository":{"name":"bankim-admin-dashboard"},"ref":"refs/heads/main"}' \
          http://185.253.72.80:9000/webhook/deploy
```

**For `bankim-admin-api` repository:**
```yaml  
# .github/workflows/deploy.yml
name: Deploy API to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Trigger Production Deployment  
      run: |
        curl -X POST \
          -H "X-Hub-Signature-256: sha256=${{ secrets.WEBHOOK_SIGNATURE }}" \
          -H "Content-Type: application/json" \
          -d '{"repository":{"name":"bankim-admin-api"},"ref":"refs/heads/main"}' \
          http://185.253.72.80:9000/webhook/deploy
```

---

## 🌐 **Environment Configuration**

### **Dashboard Environment** (`/var/www/bankim/dashboard/mainapp/.env.production`)
```bash
NODE_ENV=production
VITE_API_URL=http://185.253.72.80:3001
VITE_ENVIRONMENT=production
```

### **API Environment** (`/var/www/bankim/api/mainapp/.env.production`)
```bash
NODE_ENV=production
PORT=3001

# Database connections
CONTENT_DATABASE_URL=postgresql://user:password@host:5432/bankim_content
CORE_DATABASE_URL=postgresql://user:password@host:5432/bankim_core  
MANAGEMENT_DATABASE_URL=postgresql://user:password@host:5432/bankim_management

# Security
JWT_SECRET=your-production-jwt-secret
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info
```

---

## 🔒 **Security Configuration**

### **Firewall Rules**
```bash
# Allow SSH, HTTP, HTTPS, and API
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP  
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API
ufw allow 3002/tcp  # Dashboard
ufw allow 9000/tcp  # Webhook (internal)
ufw enable
```

### **SSL Certificate Setup**
```bash
# Install Certbot
apt update && apt install certbot

# Generate SSL certificates
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Configure nginx reverse proxy (optional)
# Dashboard: yourdomain.com → localhost:3002  
# API: api.yourdomain.com → localhost:3001
```

---

## 📊 **Monitoring & Maintenance**

### **Health Checks**
```bash
# Create health monitoring script
cat > /var/www/bankim/health-check.sh << 'EOF'
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

chmod +x /var/www/bankim/health-check.sh

# Schedule health checks every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/bankim/health-check.sh >> /var/log/bankim-health.log 2>&1") | crontab -
```

### **Backup Strategy**
```bash
# Daily backup script
cat > /var/www/bankim/backup.sh << 'EOF'  
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

chmod +x /var/www/bankim/backup.sh

# Schedule daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/bankim/backup.sh >> /var/log/bankim-backup.log 2>&1") | crontab -
```

---

## 🚀 **Deployment Commands Reference**

### **Initial Setup** 
```bash
# 1. Server preparation
ssh root@185.253.72.80
cd /var/www/bankim/

# 2. Run initial deployment
curl -O https://raw.githubusercontent.com/sravnenie-ipotek/bankim-admin-workspace-/main/scripts/ssh-deploy-init.sh
chmod +x ssh-deploy-init.sh  
./ssh-deploy-init.sh

# 3. Configure environment files
nano /var/www/bankim/api/mainapp/.env.production
nano /var/www/bankim/dashboard/mainapp/.env.production
```

### **Manual Deployment**
```bash
# Deploy all services
/var/www/bankim/deploy.sh

# Deploy specific service  
cd /var/www/bankim/api && git pull && pm2 reload bankim-api
cd /var/www/bankim/dashboard && git pull && npm run build && pm2 reload bankim-dashboard
```

### **Service Management**
```bash
# Check status
pm2 list
pm2 logs bankim-api
pm2 logs bankim-dashboard

# Restart services
pm2 restart bankim-api bankim-dashboard

# Monitor resources
pm2 monit
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] SSH server access confirmed (`root@185.253.72.80`)
- [ ] GitHub repository access configured
- [ ] Database connections tested
- [ ] Environment variables configured
- [ ] SSL certificates ready (if using custom domain)

### **Initial Setup**
- [ ] 4 repositories cloned to server
- [ ] Node.js and PM2 installed
- [ ] Applications built and configured  
- [ ] PM2 processes started
- [ ] Health checks passing
- [ ] Webhook endpoint configured

### **Post-Deployment**
- [ ] Applications accessible via IP/domain
- [ ] API endpoints responding correctly
- [ ] Dashboard loading and functioning
- [ ] Database connections working
- [ ] Logs showing normal operation
- [ ] Backup system operational

---

## 🎯 **Production URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | `http://185.253.72.80:3002` | React frontend application |
| **API** | `http://185.253.72.80:3001` | Node.js backend API |
| **Health Check** | `http://185.253.72.80:3001/health` | API health endpoint |
| **Webhook** | `http://185.253.72.80:9000/webhook/deploy` | GitHub deployment webhook |

**With Custom Domain (if configured):**
- Dashboard: `https://yourdomain.com`
- API: `https://api.yourdomain.com`

---

**This deployment plan provides a complete, automated production setup using the 4-repository architecture with GitHub-based deployment! 🚀**