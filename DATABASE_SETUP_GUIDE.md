# BankIM Database Setup Guide

## 🗄️ Database Options

This project supports multiple database configurations for different environments:

### 1. **Local SQLite Testing** (Recommended for development)
- **File**: `server/database-local.js` + `server/server-local.js`
- **Database**: SQLite file (`bankim_local_test.db`)
- **Use Case**: Local development and testing
- **Pros**: No setup required, fast, lightweight
- **Cons**: SQLite only, not for production

### 2. **Railway PostgreSQL** (Production)
- **File**: `server/database-railway.js` + `server/server-railway.js`
- **Database**: PostgreSQL on Railway cloud
- **Use Case**: Production deployment
- **Pros**: Cloud database, scalable, production-ready
- **Cons**: Requires Railway setup

### 3. **Legacy SQLite** (Original)
- **File**: `server/database.js` + `server/server.js`
- **Database**: SQLite file (`bankim_test.db`)
- **Use Case**: Original development setup
- **Status**: Kept for backward compatibility

## 🚀 Quick Start

### Option 1: Local SQLite Testing (Fastest)
```bash
# Run local SQLite test server (auto-installs SQLite dependencies)
npm run test:server

# Test it
curl http://localhost:3001/health
curl http://localhost:3001/api/users

# Restore production package (removes SQLite dependencies)
npm run restore:production
```

### Option 2: Railway PostgreSQL (Production)
```bash
# Deploy to Railway (automatic on git push)
# No local command needed - uses Railway deployment

# Test after deployment
curl https://your-railway-url.railway.app/health
curl https://your-railway-url.railway.app/api/users
```

### Option 3: Legacy SQLite (Original)
```bash
# Run original SQLite server
npm run server

# Test it
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

## 📋 Database Comparison

| Feature | Local SQLite | Railway PostgreSQL | Legacy SQLite |
|---------|-------------|-------------------|---------------|
| **Setup** | ✅ Zero setup | ⚠️ Requires Railway | ✅ Zero setup |
| **Speed** | ✅ Very fast | ⚠️ Network dependent | ✅ Very fast |
| **Scalability** | ❌ Single user | ✅ Highly scalable | ❌ Single user |
| **Production** | ❌ Not suitable | ✅ Production ready | ❌ Not suitable |
| **Testing** | ✅ Perfect | ⚠️ Requires cloud | ✅ Good |
| **Sample Data** | ✅ 6 users (Local) | ✅ 5 users (Railway) | ✅ 5 users (Original) |

## 🔧 Commands Summary

```bash
# Local SQLite Testing (NEW)
npm run test:server          # Start local SQLite test server

# Railway PostgreSQL (Production)
npm start                    # Used by Railway deployment only

# Legacy SQLite (Original)
npm run server               # Original SQLite server
npm run dev:server           # Same as above

# Frontend Development
npm run dev                  # Start React frontend (port 3002)
```

## 📦 Package Management System

**Important**: This project uses a dynamic package management system to avoid Railway deployment issues with SQLite:

### How it works:
1. **Main package.json**: Production-ready (no SQLite dependencies)
2. **Auto-generated files**:
   - `package-local.json`: Includes SQLite for local development
   - `package-production.json`: Backup of production package.json

### Scripts:
- `npm run test:server`: Auto-installs SQLite dependencies and runs local server
- `npm run restore:production`: Restores production package.json (removes SQLite)

### Why this approach:
- **Railway deployment**: No SQLite compilation issues
- **Local development**: Full SQLite support when needed
- **Git safety**: Only tracks the production package.json

## 🗂️ File Structure

```
server/
├── database-local.js        # 🆕 Local SQLite for testing
├── server-local.js          # 🆕 Local SQLite server
├── database-railway.js      # 🌐 Railway PostgreSQL
├── server-railway.js        # 🌐 Railway PostgreSQL server
├── database.js              # 📦 Legacy SQLite
├── server.js                # 📦 Legacy SQLite server
├── bankim_local_test.db     # 🗄️ Local test database (auto-generated)
├── bankim_test.db           # 🗄️ Legacy database (auto-generated)
└── README.md                # Documentation

Railway deployment files:
├── railway.json             # 🚀 Railway deployment configuration
└── RAILWAY_DEPLOYMENT.md    # 📖 Railway deployment guide

Package management files:
├── package-local.json       # 🧪 Local development package (includes SQLite)
├── package-production.json  # 🏭 Production package backup (no SQLite)
└── .gitignore               # 🔒 Excludes local package files
```

## 🧪 Testing Your Setup

### Local SQLite Testing
```bash
# Start server
npm run test:server

# Test health
curl http://localhost:3001/health
# Expected: {"status":"OK","message":"BankIM Local SQLite Test API is running",...}

# Get database info
curl http://localhost:3001/api/db-info
# Expected: {"database":"SQLite Local Test Database","type":"SQLite",...}

# Get all users
curl http://localhost:3001/api/users
# Expected: 6 users with "(Local)" in names

# Create new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"user","status":"active"}'
```

### Railway PostgreSQL
```bash
# Test after Railway deployment
curl https://your-railway-url.railway.app/health
# Expected: {"status":"OK","message":"BankIM Railway Database API is running - Test Deploy",...}

curl https://your-railway-url.railway.app/api/db-info
# Expected: {"database":"PostgreSQL on Railway","type":"PostgreSQL",...}

curl https://your-railway-url.railway.app/api/users
# Expected: 5 users with Railway emails
```

## 🔄 Switching Between Databases

### For Development Work:
```bash
# Stop any running servers (Ctrl+C)
npm run test:server    # Use local SQLite
```

### For Production Testing:
```bash
# Push to git (triggers Railway deployment)
git push origin main

# Test Railway URL after deployment
```

### For Legacy Testing:
```bash
# Stop any running servers (Ctrl+C)
npm run server         # Use original SQLite
```

## 🎯 Recommended Workflow

1. **Local Development**: Use `npm run test:server` (SQLite)
2. **Feature Testing**: Test with local SQLite first
3. **Pre-deployment**: Push to Railway for PostgreSQL testing
4. **Production**: Railway automatically uses PostgreSQL

## 🆕 What's New in Local SQLite Testing

### Enhanced Sample Data
- **6 test users** (vs 5 in other setups)
- **"(Local)" suffix** in names for easy identification
- **Local email domains** (e.g., `john.local@bankim.com`)

### Improved Database Info
- **Environment detection** (`local`)
- **Database type** clearly marked (`SQLite`)
- **File path** shown for debugging

### Better Console Output
- **Clear server type** identification
- **Database type** in startup message
- **Local-specific** messaging

## 🚨 Important Notes

### Local SQLite Testing
- ✅ **Perfect for development** - no external dependencies
- ✅ **Fast and reliable** - no network issues
- ✅ **Isolated testing** - your own database file
- ⚠️ **Not for production** - use Railway for production

### Railway PostgreSQL
- ✅ **Production ready** - scalable cloud database
- ✅ **Automatic deployment** - via git push
- ✅ **SSL encryption** - secure connections
- ✅ **No SQLite dependencies** - uses package.railway.json and nixpacks.toml
- ⚠️ **Requires setup** - Railway account needed

### Database Files
- `bankim_local_test.db` - Local SQLite testing
- `bankim_test.db` - Legacy SQLite
- Both are auto-generated and can be deleted safely

## 🛠️ Troubleshooting

### Local SQLite Issues
```bash
# Delete database file and restart
rm server/bankim_local_test.db
npm run test:server
```

### Railway PostgreSQL Issues
```bash
# Check Railway logs in dashboard
# Verify DATABASE_URL environment variable
```

### Port Conflicts
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

---

**Choose your database setup based on your needs:**
- **🧪 Testing**: `npm run test:server` (Local SQLite)
- **🚀 Production**: Push to Railway (PostgreSQL)
- **📦 Legacy**: `npm run server` (Original SQLite)
