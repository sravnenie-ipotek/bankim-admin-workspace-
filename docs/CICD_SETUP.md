# 🚀 BankIM CI/CD Pipeline Setup Guide

Complete setup guide for the BankIM Management Portal enterprise-grade CI/CD pipeline.

## 📋 Overview

The BankIM CI/CD pipeline provides:

- **Multi-environment deployment** (TEST → PROD)
- **Quality gates** with security scanning
- **Zero-downtime deployments**
- **Automated rollback capabilities**
- **Comprehensive monitoring**
- **Multi-repository coordination**

## 🔧 Initial Setup

### 1. GitHub Repository Settings

#### Required GitHub Environments

Create the following environments in your GitHub repository settings:

```bash
# Navigate to: Settings → Environments → New environment

1. test
   - No protection rules needed
   - Deployment target: 91.202.169.54 (adminpaneltest-1)

2. production-approval
   - Required reviewers: Add your production approvers
   - Wait timer: 5 minutes (optional)
   - Restrict pushes to protected branches: main

3. production
   - Required reviewers: Same as production-approval
   - Deployment target: 185.220.207.52 (adminpanelprod-2)

4. test-rollback
   - No protection rules needed

5. production-rollback  
   - Required reviewers: Critical team members only
   - Immediate response required for emergency situations
```

### 2. SSH Key Configuration

#### Generate SSH Key Pair

```bash
# Generate a new SSH key pair for CI/CD
ssh-keygen -t ed25519 -f ~/.ssh/bankim-cicd -N ""

# View the private key (for GitHub Secrets)
cat ~/.ssh/bankim-cicd

# View the public key (for server installation)
cat ~/.ssh/bankim-cicd.pub
```

#### Install Public Key on Servers

```bash
# For TEST server (91.202.169.54)
ssh root@91.202.169.54 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/bankim-cicd.pub

# For PROD server (185.220.207.52)  
ssh root@185.220.207.52 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/bankim-cicd.pub

# Verify SSH key access
ssh -i ~/.ssh/bankim-cicd root@91.202.169.54 "echo 'Test server SSH access confirmed'"
ssh -i ~/.ssh/bankim-cicd root@185.220.207.52 "echo 'Prod server SSH access confirmed'"
```

## 🔐 GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

### Required Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

```bash
# SSH Authentication
SSH_PRIVATE_KEY
# Value: Contents of ~/.ssh/bankim-cicd (private key file)

# Server Passwords (fallback authentication)
TEST_SERVER_PASSWORD
# Value: V3sQm9pLxKz7Tf (TEST server password)

PROD_SERVER_PASSWORD  
# Value: 6Oz8AdEePUnbn8 (PROD server password)

# Database Configuration (for testing)
CONTENT_DATABASE_URL
# Value: postgresql://username:password@host:port/database

CORE_DATABASE_URL
# Value: postgresql://username:password@host:port/database

MANAGEMENT_DATABASE_URL
# Value: postgresql://username:password@host:port/database
```

### Optional Secrets (Enhanced Features)

```bash
# Slack Integration
SLACK_WEBHOOK_URL
# Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email Notifications
NOTIFICATION_EMAIL
# Value: team@yourcompany.com

# Security Scanning
SECURITY_SCAN_TOKEN
# Value: Token for enhanced security scanning services
```

### Environment Variables (Repository Level)

Navigate to: **Settings → Secrets and variables → Actions → Variables tab**

```bash
# Deployment Configuration
NODE_VERSION = 18.x
DEPLOYMENT_TIMEOUT = 1800
HEALTH_CHECK_TIMEOUT = 300

# Server Configuration
TEST_SERVER_HOST = 91.202.169.54
TEST_SERVER_NAME = adminpaneltest-1
PROD_SERVER_HOST = 185.220.207.52  
PROD_SERVER_NAME = adminpanelprod-2

# Application Ports
API_PORT = 8003
CLIENT_PORT = 8004
```

## 🏗️ Server Infrastructure Preparation

### 1. Server Prerequisites

Both TEST and PROD servers need the following setup:

```bash
# Connect to each server and run:

# 1. Install required system packages
apt update && apt upgrade -y
apt install -y curl wget git nginx certbot

# 2. Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 3. Install PM2 globally
npm install -g pm2

# 4. Setup PM2 startup
pm2 startup
# Follow the instructions provided by the command

# 5. Create application directories
mkdir -p /var/www/bankim
mkdir -p /var/backups/bankim
mkdir -p /var/log/bankim

# 6. Set proper permissions
chown -R root:root /var/www/bankim
chmod -R 755 /var/www/bankim

# 7. Create log directories for PM2
mkdir -p /var/log/pm2
chown -R root:root /var/log/pm2
```

### 2. Nginx Configuration

```bash
# Create Nginx configuration for BankIM
cat > /etc/nginx/sites-available/bankim << 'EOF'
server {
    listen 80;
    server_name _;

    # API Proxy
    location /api {
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

    # Client Application
    location / {
        proxy_pass http://localhost:8004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bankim /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
```

### 3. Firewall Configuration

```bash
# Configure UFW firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 8003/tcp  # API port
ufw allow 8004/tcp  # Client port
ufw --force enable

# Verify firewall status
ufw status
```

## 🌊 Branch and Deployment Strategy

### Branch Strategy

```
main branch (production)
├── Direct deployment to PROD server (185.220.207.52)
├── Requires approval gate
├── Full quality gates and security scanning
└── Zero-downtime deployment

develop branch (testing)
├── Direct deployment to TEST server (91.202.169.54)  
├── No approval required
├── Full quality gates for validation
└── Fast deployment for testing

feature/* branches
├── No automatic deployment
├── Quality gates only (build, test, lint)
├── Pull request validation
└── Merge to develop for testing
```

### Deployment Flow

```mermaid
graph TD
    A[Feature Branch] --> B[Create PR]
    B --> C[Quality Gates]
    C --> D{PR Approved?}
    D -->|Yes| E[Merge to develop]
    D -->|No| F[Fix Issues]
    F --> B
    E --> G[Deploy to TEST]
    G --> H[Test Validation]
    H --> I{Tests Pass?}
    I -->|Yes| J[Merge to main]
    I -->|No| K[Fix Issues]
    K --> E
    J --> L[Approval Gate]
    L --> M[Deploy to PROD]
    M --> N[Health Checks]
    N --> O{Healthy?}
    O -->|Yes| P[Success]
    O -->|No| Q[Auto Rollback]
```

## 🚀 Pipeline Usage

### Automatic Deployments

```bash
# Deploy to TEST server
git push origin develop

# Deploy to PROD server (requires approval)
git push origin main
```

### Manual Deployments

```bash
# Manual deployment to specific environment
# Navigate to: Actions → CI/CD Pipeline → Run workflow

1. Select environment (test/production)
2. Configure options:
   - Skip tests (emergency only)
   - Force deploy (skip health checks)
3. Click "Run workflow"
```

### Emergency Rollback

```bash
# Emergency rollback procedure
# Navigate to: Actions → Emergency Rollback → Run workflow

1. Select environment (test/production)
2. Enter rollback reason (required)
3. Optional: Specify backup timestamp
4. Optional: Skip health checks (emergency only)
5. Click "Run workflow"

# Production rollbacks require immediate approval
```

## 📊 Monitoring and Alerts

### Health Monitoring

The pipeline includes comprehensive health monitoring:

```bash
# API health check
curl http://server:8003/api/health

# Client health check  
curl http://server:8004

# System health monitoring
node infrastructure/monitoring/health-monitor.js check
```

### Slack Integration

Configure Slack notifications:

1. Create a Slack webhook URL
2. Add `SLACK_WEBHOOK_URL` secret in GitHub
3. Notifications sent for:
   - Deployment success/failure
   - Security alerts
   - Emergency rollbacks
   - Health check failures

### Log Monitoring

```bash
# Application logs
pm2 logs bankim-api
pm2 logs bankim-client

# Deployment logs
ls -la /tmp/bankim-deploy-*.log

# Health monitoring logs
tail -f /var/log/bankim-health.log
```

## 🔒 Security Features

### Security Scanning

- **Dependency vulnerability scanning** (npm audit)
- **Secret detection** (prevent credential exposure)
- **Code security analysis** (SQL injection, XSS detection)
- **Infrastructure security** (Docker, GitHub Actions)

### Access Control

- **SSH key-based authentication**
- **Environment-specific approvals**
- **Audit logging** for all deployments
- **Role-based access** via GitHub teams

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSH Connection Failures

```bash
# Test SSH connectivity
ssh -i ~/.ssh/bankim-cicd root@server_ip "echo 'Connection test'"

# Check SSH key permissions
chmod 600 ~/.ssh/bankim-cicd
chmod 644 ~/.ssh/bankim-cicd.pub

# Verify authorized_keys on server
cat ~/.ssh/authorized_keys | grep "bankim-cicd"
```

#### 2. Deployment Failures

```bash
# Check server resources
df -h  # Disk space
free -h  # Memory
uptime  # Load average

# Check PM2 processes
pm2 list
pm2 logs --lines 50

# Check Nginx status
systemctl status nginx
nginx -t
```

#### 3. Health Check Failures

```bash
# Manual health checks
curl -v http://localhost:8003/api/health
curl -v http://localhost:8004

# Check service logs
pm2 logs bankim-api --lines 20
pm2 logs bankim-client --lines 20

# Check database connectivity
node packages/server/test-db-connection.js
```

### Recovery Procedures

#### Service Recovery

```bash
# Restart services
pm2 restart all

# Rebuild and restart
cd /var/www/bankim
npm run build
pm2 restart all
```

#### Complete System Recovery

```bash
# Emergency recovery procedure
cd /var/www/bankim

# Stop all services
pm2 stop all

# Restore from latest backup
tar -xzf /var/backups/bankim/pre-deploy-$(date +%Y%m%d)-*.tar.gz

# Reinstall dependencies
npm ci

# Restart services
pm2 start ecosystem.config.js
```

## 📈 Performance Optimization

### Build Optimization

```bash
# Enable build caching
# Already configured in GitHub Actions workflows

# Parallel builds for packages
# Implemented via matrix strategy

# Artifact reuse between jobs
# Configured with upload/download artifacts
```

### Deployment Optimization

```bash
# Zero-downtime deployment
# Implemented in production-deploy.sh

# Health check optimization
# Fast health checks with timeout controls

# Resource monitoring
# Automated resource validation before deployment
```

## 🔄 Maintenance

### Regular Maintenance Tasks

```bash
# Weekly security audit (automated)
# Scheduled in security-audit.yml workflow

# Backup cleanup (automated)
# Implemented in deployment scripts

# Log rotation (system level)
logrotate -f /etc/logrotate.conf

# Dependency updates
npm audit fix
```

### Pipeline Updates

```bash
# Update workflow files
# Edit .github/workflows/*.yml files

# Test changes in feature branch
git checkout -b update/cicd-pipeline
# Make changes
git push origin update/cicd-pipeline
# Test via PR to develop branch

# Apply to production
git checkout main
git merge update/cicd-pipeline
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Process Management](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## 🆘 Support

For issues with the CI/CD pipeline:

1. **Check GitHub Actions logs** in the Actions tab
2. **Review server logs** via SSH
3. **Consult troubleshooting section** above
4. **Use emergency rollback** if needed
5. **Contact DevOps team** for critical issues

---

**Last Updated:** $(date)  
**Version:** 1.0.0  
**Maintainer:** BankIM DevOps Team