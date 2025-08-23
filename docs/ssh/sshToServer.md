# SSH Connection Instructions for Test Server

## =� Quick Connection

Connect to the test/production server at `45.83.42.74` as root user:

```bash
ssh root@45.83.42.74
```

## =� Server Directory Structure

Once connected, navigate to the application directory:

```bash
cd /var/www/bank-dev2
```

**Key Directories:**
- `/var/www/bank-dev2/` - Main application root
- `/var/www/bank-dev2/server/` - Backend Node.js server
- `/var/www/bank-dev2/mainapp/build/` - Frontend build files
- `/var/www/bank-dev2/uploads/` - File uploads storage
- `/var/www/bank-dev2/server/config/` - Server configuration files

## =' Common Server Operations

### Check Application Status
```bash
# Check PM2 process status
pm2 status

# View server logs
pm2 logs bankim-api

# Restart the application
pm2 restart bankim-api
```

### Test Database Connectivity
```bash
# Quick database connection test
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'}); pool.query('SELECT NOW()').then(r => console.log(' Connected:', r.rows[0])).catch(e => console.log('L Error:', e.message))"
```

### Check API Health
```bash
# Test API endpoint
curl http://localhost:8003/api/health

# Test specific endpoint
curl "http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage"
```

## =� Quick Deployment Methods

### Method 1: Single File Deployment (Fastest - 1-2 seconds)
From your local machine:
```bash
# Deploy single changed file
rsync -avz --exclude 'node_modules' --exclude '.git' /Users/michaelmishayev/Projects/bankDev2_standalone/server/config/database-core.js root@45.83.42.74:/var/www/bank-dev2/server/config/

# Restart server
ssh root@45.83.42.74 "cd /var/www/bank-dev2 && pm2 restart bankim-api"
```

### Method 2: Full Project Sync (2-5 minutes)
```bash
# Deploy entire project (use when multiple files changed)
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'mainapp/node_modules' /Users/michaelmishayev/Projects/bankDev2_standalone/ root@45.83.42.74:/var/www/bank-dev2/

# Install dependencies and restart
ssh root@45.83.42.74 "cd /var/www/bank-dev2 && npm install && pm2 restart bankim-api"
```

### Method 3: Frontend Build Deployment
```bash
# Build frontend locally first
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
npm run build

# Deploy built frontend
rsync -avz --delete /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/build/ root@45.83.42.74:/var/www/bank-dev2/mainapp/build/
```

## =
 Debugging & Troubleshooting

### Check Server Logs
```bash
# Real-time logs
pm2 logs bankim-api --lines 50

# Error logs only
pm2 logs bankim-api --err

# Application-specific logs
tail -f /var/www/bank-dev2/server.log
```

### Process Management
```bash
# Kill and restart PM2
pm2 kill
pm2 start ecosystem.config.js

# Check system resources
htop
df -h
```

### Network Testing
```bash
# Test external connectivity
curl https://dev2.bankimonline.com/api/health

# Check open ports
netstat -tlnp | grep :8003

# Test internal API
curl http://localhost:8003/api/health
```

## =� Security & Environment

### Environment Variables
```bash
# Check current environment
echo $NODE_ENV
echo $DATABASE_URL

# View all environment variables
env | grep -E "(NODE_ENV|DATABASE|PORT|JWT)"
```

### File Permissions
```bash
# Check application permissions
ls -la /var/www/bank-dev2/

# Fix permissions if needed
chown -R root:root /var/www/bank-dev2/
chmod -R 755 /var/www/bank-dev2/
```

## =� Emergency Procedures

### Emergency Rollback
```bash
# Quick rollback to previous working state
cd /var/www/bank-dev2
git log --oneline -5
git checkout HEAD~1 -- server/config/database-core.js
pm2 restart bankim-api
```

### Service Recovery
```bash
# If PM2 is not running
npm install -g pm2
cd /var/www/bank-dev2
pm2 start server/server-db.js --name bankim-api

# If database connection fails
# Check Railway database status and credentials
curl -X GET "https://railway.app/api/v2/projects" -H "Authorization: Bearer $RAILWAY_TOKEN"
```

### Critical Health Check
```bash
# Complete system health check
echo "=== PM2 Status ==="
pm2 status

echo "=== API Health ==="
curl -s http://localhost:8003/api/health | jq '.'

echo "=== Database Test ==="
curl -s "http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage" | head -100

echo "=== System Resources ==="
free -h
df -h
```

## =� Notes for Claude Code AI

- **Server IP**: `45.83.42.74`
- **Application Path**: `/var/www/bank-dev2/`
- **Process Name**: `bankim-api`
- **Database**: Railway PostgreSQL (two databases - main and content)
- **Fastest Deployment**: Target file sync + PM2 restart (1-2 seconds)
- **Full Deployment**: Complete rsync + npm install (2-5 minutes)

### Recent Fixes Applied
-  Database configuration now uses Railway in production
-  Family status dropdown issue resolved
-  SSL certificate domain mismatch fixed
-  Railway warning system completely removed
