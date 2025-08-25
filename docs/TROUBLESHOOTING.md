# 🔧 BankIM CI/CD Troubleshooting Guide

Comprehensive troubleshooting guide for the BankIM Management Portal CI/CD pipeline.

## 📋 Quick Diagnostics

### Health Check Commands

```bash
# Quick server status check
ssh root@<server_ip> "pm2 list && free -h && df -h"

# API health check
curl http://<server_ip>:8003/api/health

# Database connectivity test
cd packages/server && node test-db-connection.js

# Run comprehensive health monitoring
node infrastructure/monitoring/health-monitor.js check
```

### Log Locations

```bash
# GitHub Actions logs
# Available in Actions tab of GitHub repository

# Server application logs
pm2 logs bankim-api
pm2 logs bankim-client

# System logs
tail -f /var/log/bankim-health.log
tail -f /var/log/bankim-deploy.log

# Deployment logs
ls -la /tmp/bankim-deploy-*.log

# Error logs
ls -la /tmp/bankim-deploy-errors-*.log
```

## 🚨 Common Issues & Solutions

### 1. CI/CD Pipeline Failures

#### GitHub Actions Workflow Failed

**Symptoms:**
- Workflow fails with unclear errors
- Steps timeout or hang
- Authentication issues

**Diagnosis:**
```bash
# Check workflow logs in GitHub Actions tab
# Look for specific error messages in each step
# Verify all required secrets are configured
```

**Solutions:**

**SSH Connection Issues:**
```bash
# Regenerate SSH key if needed
ssh-keygen -t ed25519 -f ~/.ssh/bankim-cicd-new -N ""

# Update GitHub secret SSH_PRIVATE_KEY with new private key
cat ~/.ssh/bankim-cicd-new

# Install new public key on servers
cat ~/.ssh/bankim-cicd-new.pub | ssh root@91.202.169.54 'cat >> ~/.ssh/authorized_keys'
cat ~/.ssh/bankim-cicd-new.pub | ssh root@185.220.207.52 'cat >> ~/.ssh/authorized_keys'
```

**Secret Configuration Issues:**
```bash
# Verify all required secrets are set in GitHub:
# Settings → Secrets and variables → Actions

Required secrets:
- SSH_PRIVATE_KEY
- TEST_SERVER_PASSWORD  
- PROD_SERVER_PASSWORD
- CONTENT_DATABASE_URL
- CORE_DATABASE_URL
- SLACK_WEBHOOK_URL (optional)
```

**Environment Permission Issues:**
```bash
# Check GitHub environment settings:
# Settings → Environments

Ensure environments are configured:
- test (no protection rules)
- production-approval (with required reviewers)
- production (with required reviewers)
- test-rollback (no protection rules)
- production-rollback (with critical reviewers)
```

#### Build Failures

**Symptoms:**
- TypeScript compilation errors
- Linting failures
- Test failures

**Solutions:**

**TypeScript Issues:**
```bash
# Fix type errors locally first
npm run type-check

# Update dependencies if needed
npm update

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Linting Issues:**
```bash
# Fix linting errors
npm run lint --fix

# Update ESLint configuration if needed
# Check .eslintrc.js files in packages/
```

**Test Failures:**
```bash
# Run tests locally
npm run test:mortgage --workspace=@bankim/client
npm run test:all --workspace=@bankim/client

# Update test snapshots if UI changed
npm run test:update-snapshots --workspace=@bankim/client
```

### 2. Deployment Failures

#### SSH Authentication Failures

**Symptoms:**
```
❌ Cannot connect to server via SSH
Permission denied (publickey,password)
Host key verification failed
```

**Solutions:**

**Key-based Authentication (CI/CD):**
```bash
# Test SSH key locally
ssh -i ~/.ssh/bankim-cicd root@<server_ip> "echo 'Connection test'"

# Verify SSH key format
head -1 ~/.ssh/bankim-cicd
# Should start with: -----BEGIN OPENSSH PRIVATE KEY-----

# Regenerate key if corrupted
ssh-keygen -t ed25519 -f ~/.ssh/bankim-cicd-new -N ""
```

**Password Authentication (Fallback):**
```bash
# Test password authentication
sshpass -p "$PASSWORD" ssh root@<server_ip> "echo 'Password test'"

# Verify password in GitHub secrets matches server
# TEST_SERVER_PASSWORD: V3sQm9pLxKz7Tf
# PROD_SERVER_PASSWORD: 6Oz8AdEePUnbn8
```

**Host Key Issues:**
```bash
# Clear known hosts if needed
rm ~/.ssh/known_hosts

# Add server to known hosts
ssh-keyscan -H <server_ip> >> ~/.ssh/known_hosts
```

#### Server Resource Issues

**Symptoms:**
```
❌ Insufficient disk space
❌ Out of memory errors
Connection timeout during deployment
```

**Solutions:**

**Disk Space Issues:**
```bash
# Check disk usage
ssh root@<server_ip> "df -h"

# Clean up old deployments
ssh root@<server_ip> "find /var/backups/bankim -name '*.tar.gz' -mtime +30 -delete"

# Clean PM2 logs
ssh root@<server_ip> "pm2 flush"

# Clean system logs
ssh root@<server_ip> "journalctl --vacuum-size=100M"
```

**Memory Issues:**
```bash
# Check memory usage
ssh root@<server_ip> "free -h && ps aux --sort=-%mem | head -10"

# Restart services to free memory
ssh root@<server_ip> "pm2 restart all"

# Increase swap if needed (temporary fix)
ssh root@<server_ip> "fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
```

#### Package Installation Failures

**Symptoms:**
```
npm ERR! network timeout
npm ERR! package not found
npm ERR! peer dependency warnings
```

**Solutions:**

**Network Issues:**
```bash
# Test NPM connectivity
ssh root@<server_ip> "npm config get registry"

# Clear NPM cache
ssh root@<server_ip> "npm cache clean --force"

# Use alternative registry if needed
ssh root@<server_ip> "npm config set registry https://registry.npmjs.org/"
```

**Dependency Issues:**
```bash
# Clean install
ssh root@<server_ip> "cd /var/www/bankim && rm -rf node_modules package-lock.json && npm install"

# Fix peer dependency warnings
npm install --legacy-peer-deps
```

### 3. Service Startup Failures

#### PM2 Service Issues

**Symptoms:**
```
PM2 services not starting
Services starting but immediately crashing
Port already in use errors
```

**Solutions:**

**PM2 Configuration Issues:**
```bash
# Check PM2 status
ssh root@<server_ip> "pm2 list"

# View detailed service info
ssh root@<server_ip> "pm2 show bankim-api"

# Check PM2 logs
ssh root@<server_ip> "pm2 logs --lines 50"

# Restart PM2 daemon
ssh root@<server_ip> "pm2 kill && pm2 resurrect"
```

**Port Conflicts:**
```bash
# Check what's using ports
ssh root@<server_ip> "netstat -tlnp | grep -E '(8003|8004)'"

# Kill processes on ports
ssh root@<server_ip> "pkill -f 'node.*server.js' && pkill -f 'serve.*dist'"

# Restart services
ssh root@<server_ip> "pm2 restart all"
```

**Ecosystem Configuration:**
```bash
# Verify ecosystem.config.js exists and is valid
ssh root@<server_ip> "cd /var/www/bankim && node -c ecosystem.config.js"

# Manually create ecosystem file if missing
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bankim-api',
      cwd: '/var/www/bankim/packages/server',
      script: 'server.js',
      env: { NODE_ENV: 'production', PORT: 8003 },
      instances: 1,
      autorestart: true,
      watch: false
    },
    {
      name: 'bankim-client',
      cwd: '/var/www/bankim/packages/client',
      script: 'npx',
      args: 'serve dist -p 8004 -s',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
}
EOF
```

### 4. Database Connection Issues

#### Database Connectivity Failures

**Symptoms:**
```
❌ Database connection failed
Connection timeout
Authentication failed for user
```

**Solutions:**

**Connection String Issues:**
```bash
# Test database connection manually
psql "$CONTENT_DATABASE_URL" -c "SELECT version();"

# Verify connection string format
echo "$CONTENT_DATABASE_URL"
# Should be: postgresql://user:password@host:port/database
```

**Database Server Issues:**
```bash
# Check PostgreSQL status
ssh root@<db_server> "systemctl status postgresql"

# Check PostgreSQL logs
ssh root@<db_server> "tail -f /var/log/postgresql/postgresql-*.log"

# Restart PostgreSQL if needed
ssh root@<db_server> "systemctl restart postgresql"
```

**Network Connectivity:**
```bash
# Test network connection to database
telnet <db_host> 5432

# Check firewall rules
ssh root@<db_server> "ufw status"
```

### 5. Health Check Failures

#### API Health Check Failing

**Symptoms:**
```
❌ API health check failed
curl: (7) Failed to connect to localhost:8003
HTTP 500 Internal Server Error
```

**Solutions:**

**Service Status Check:**
```bash
# Check if API service is running
ssh root@<server_ip> "pm2 show bankim-api"

# Check API logs
ssh root@<server_ip> "pm2 logs bankim-api --lines 50"

# Test API directly
ssh root@<server_ip> "curl -v http://localhost:8003/api/health"
```

**Port and Firewall Issues:**
```bash
# Verify port is open
ssh root@<server_ip> "netstat -tlnp | grep 8003"

# Check firewall
ssh root@<server_ip> "ufw status | grep 8003"

# Test from external
curl -v http://<server_ip>:8003/api/health
```

#### Client Health Check Failing

**Symptoms:**
```
❌ Client health check failed  
curl: (7) Failed to connect to localhost:8004
```

**Solutions:**

**Client Service Issues:**
```bash
# Check client service
ssh root@<server_ip> "pm2 show bankim-client"

# Verify build exists
ssh root@<server_ip> "ls -la /var/www/bankim/packages/client/dist/"

# Rebuild client if needed
ssh root@<server_ip> "cd /var/www/bankim/packages/client && npm run build"
```

### 6. Rollback Issues

#### Rollback Failures

**Symptoms:**
```
❌ Rollback failed
No backups found
Backup extraction failed
Services failed to start after rollback
```

**Solutions:**

**Missing Backups:**
```bash
# Check backup directory
ssh root@<server_ip> "ls -la /var/backups/bankim/"

# Create emergency backup manually
ssh root@<server_ip> "cd /var/www/bankim && tar -czf /var/backups/bankim/emergency-$(date +%Y%m%d-%H%M%S).tar.gz ."
```

**Backup Extraction Issues:**
```bash
# Test backup integrity
ssh root@<server_ip> "tar -tzf /var/backups/bankim/latest-backup.tar.gz | head -10"

# Extract backup manually
ssh root@<server_ip> "cd /var/www/bankim && tar -xzf /var/backups/bankim/latest-backup.tar.gz"
```

## 🛠️ Advanced Diagnostics

### Server Performance Analysis

```bash
# Comprehensive system check
ssh root@<server_ip> "
echo '=== System Information ==='
uname -a
uptime
free -h
df -h

echo -e '\n=== Network Connectivity ==='
ping -c 3 google.com
netstat -tlnp | grep -E '(8003|8004)'

echo -e '\n=== Process Information ==='
ps aux --sort=-%cpu | head -10
ps aux --sort=-%mem | head -10

echo -e '\n=== PM2 Status ==='
pm2 list
pm2 monit --no-colors

echo -e '\n=== Application Logs ==='
pm2 logs --lines 20 --raw
"
```

### Database Performance Analysis

```bash
# Database connection and performance test
cd packages/server

# Test all databases
node -e "
const { Pool } = require('pg');
const databases = {
  content: process.env.CONTENT_DATABASE_URL,
  core: process.env.CORE_DATABASE_URL,
  management: process.env.MANAGEMENT_DATABASE_URL
};

async function testDatabases() {
  for (const [name, url] of Object.entries(databases)) {
    if (!url) {
      console.log(\`\${name}: Not configured\`);
      continue;
    }
    
    const pool = new Pool({ connectionString: url });
    try {
      const start = Date.now();
      const result = await pool.query('SELECT version(), NOW()');
      const duration = Date.now() - start;
      console.log(\`\${name}: Connected ✅ (\${duration}ms)\`);
      console.log(\`  Version: \${result.rows[0].version.split(' ')[0]}\`);
    } catch (error) {
      console.log(\`\${name}: Failed ❌\`);
      console.log(\`  Error: \${error.message}\`);
    } finally {
      await pool.end();
    }
  }
}

testDatabases().catch(console.error);
"
```

### Network Diagnostics

```bash
# Complete network connectivity test
ssh root@<server_ip> "
echo '=== Network Interface ==='
ip addr show

echo -e '\n=== Routing Table ==='
ip route show

echo -e '\n=== DNS Resolution ==='
nslookup google.com

echo -e '\n=== External Connectivity ==='
curl -I --connect-timeout 5 https://www.google.com

echo -e '\n=== Port Connectivity ==='
for port in 22 80 443 8003 8004; do
  if nc -z localhost \$port 2>/dev/null; then
    echo \"Port \$port: Open ✅\"
  else
    echo \"Port \$port: Closed ❌\"
  fi
done
"
```

## 🚨 Emergency Procedures

### Complete System Recovery

If all else fails, follow these steps for complete system recovery:

**1. Emergency Backup:**
```bash
# Create emergency backup of current state
ssh root@<server_ip> "cd /var/www && tar -czf /tmp/emergency-backup-$(date +%Y%m%d-%H%M%S).tar.gz bankim/"
```

**2. Clean Deployment:**
```bash
# Stop all services
ssh root@<server_ip> "pm2 stop all && pm2 delete all"

# Clean deployment directory
ssh root@<server_ip> "rm -rf /var/www/bankim/*"

# Re-deploy from latest backup or fresh deployment
# Use GitHub Actions manual deployment or run production-deploy.sh manually
```

**3. Service Recovery:**
```bash
# Ensure PM2 is working
ssh root@<server_ip> "pm2 ping"

# Restore PM2 processes
ssh root@<server_ip> "cd /var/www/bankim && pm2 start ecosystem.config.js && pm2 save"

# Verify services
ssh root@<server_ip> "pm2 list && curl http://localhost:8003/api/health"
```

### Emergency Contacts

When manual intervention fails:

1. **Critical Issues**: Contact DevOps team immediately
2. **Database Issues**: Contact Database Administrator
3. **Network Issues**: Contact Network Administrator
4. **Security Issues**: Contact Security Team

### Escalation Matrix

```
Level 1: Self-Service (This guide)
├── Check logs and common solutions
├── Use automated rollback if available
└── Follow diagnostic procedures

Level 2: Team Support
├── Consult with development team
├── Review recent changes
└── Consider emergency rollback

Level 3: Infrastructure Support  
├── Contact server administrators
├── Check infrastructure status
└── Coordinate with external vendors

Level 4: Executive Escalation
├── Critical business impact
├── Extended downtime
└── Security incidents
```

## 📚 Additional Resources

### Monitoring Dashboards

- **GitHub Actions**: [Repository Actions Tab](../../actions)
- **Health Monitoring**: `node infrastructure/monitoring/health-monitor.js report`
- **Server Metrics**: `pm2 monit`

### Documentation Links

- [CI/CD Setup Guide](CICD_SETUP.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Process Manager](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Support Scripts

```bash
# Generate diagnostic report
scripts/generate-diagnostic-report.sh

# Test full deployment pipeline
scripts/test-deployment-pipeline.sh

# Validate server configuration
scripts/validate-server-config.sh
```

---

**Last Updated:** $(date)  
**Version:** 1.0.0  
**Maintainer:** BankIM DevOps Team

For additional support, create an issue in the repository or contact the DevOps team via Slack.