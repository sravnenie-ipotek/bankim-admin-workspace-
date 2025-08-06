# 🔧 BankIM Admin API - Backend Deployment Repository

**Production-ready Node.js API server for the BankIM Management Portal backend**

---

## 🎯 Repository Overview

**Repository**: `bankim-admin-api`  
**URL**: `git@github.com:sravnenie-ipotek/bankim-admin-api.git`  
**Type**: Backend Deployment Repository  
**Purpose**: Standalone Node.js API server optimized for production deployment  
**Role**: Backend hosting target - receives filtered content from development workspace  

---

## 🏗️ Architecture Position

This repository serves as the **backend deployment target** in our 4-repository hybrid architecture:

```
DEVELOPMENT LAYER
┌─────────────────────────────────────────────────────────┐
│  🏠 bankim-admin-workspace (Development Monorepo)      │
│  Contains: packages/server + packages/client + docs    │
└─────────────────────┬───────────────────────────────────┘
                      │ Automated Deployment
                      ▼
DEPLOYMENT LAYER
┌─────────────────────────────────────────────────────────┐
│  🔧 bankim-admin-api (THIS REPOSITORY)                 │
│  Contains: Express server + database logic + config    │
│  Purpose: Backend deployment to hosting platforms      │
└─────────────────────┬───────────────────────────────────┘
                      │ Deploy to Production
                      ▼
HOSTING LAYER  
┌─────────────────────────────────────────────────────────┐
│  ☁️ Production Hosting (Railway/Heroku/AWS)            │
│  Serves: REST API + database connections + auth        │
└─────────────────────────────────────────────────────────┘
```

### Connection Strategy
- **Source**: Receives filtered content from `packages/server/` in workspace
- **Dependencies**: Links to `bankim-admin-shared` via git reference
- **Database**: Connects to PostgreSQL databases (content, core, management)
- **Updates**: Automated via `npm run push:api` from workspace

---

## 📦 Repository Contents

This repository contains **only** the backend API server with production optimizations:

```
bankim-admin-api/
├── 📁 config/                      # Database configurations
│   ├── database-content.js         # Content database connection
│   ├── database-core.js             # Core business logic DB
│   └── database-management.js       # Management portal DB
│
├── 📁 database/                     # SQL schemas & migrations
│   ├── bankim_content_schema.sql    # Content management schema
│   ├── session-audit-tables.sql    # Session tracking tables
│   ├── add_dropdown_options.sql    # Feature-specific migrations
│   ├── add_missing_actions.sql     # Data correction scripts
│   └── *.sql                       # Additional schema files
│
├── 📁 scripts/                      # Database & utility scripts
│   ├── migrate.js                  # Database migration runner
│   ├── db-status.js                # Database health checker
│   ├── seed-database.js            # Initial data seeding
│   ├── check-dropdown-translations.js # Data validation
│   └── *.js                        # Additional utility scripts
│
├── 📁 migrations/                   # Versioned database changes
│   ├── add-menu-items.sql          # Menu structure updates
│   ├── fix_mortgage_dropdowns.sql  # Bug fix migrations
│   ├── restore-credit-refi-data.sql # Data recovery scripts
│   └── *.sql                       # Version-controlled changes
│
├── 📁 logs/                         # Application logging
│   ├── backend.log                 # Main application log
│   ├── dev.log                     # Development logging
│   └── *.log                       # Additional log files
│
├── 📁 node_modules/                 # Production dependencies
│
├── ⚙️ Core Application Files
│   ├── server.js                   # Main Express server
│   ├── auth-middleware.js          # Authentication handling
│   ├── database-railway.js         # Railway-specific DB config
│   └── *.js                        # Additional server modules
│
├── ⚙️ Configuration Files
│   ├── package.json                # Production dependencies
│   ├── railway.json                # Railway deployment config
│   ├── Dockerfile                  # Container deployment
│   ├── .env.template              # Environment variables template
│   └── *.json                      # Additional configurations
│
├── 🧪 Testing & Validation
│   ├── test-all-endpoints.sh       # API endpoint testing
│   ├── verify-database.js          # Database integrity checks
│   ├── test-drill-comprehensive.js # Feature testing
│   └── verify-*.js                 # Validation scripts
│
└── 📄 README.md                    # This documentation
```

---

## 🔗 Dependency Strategy

### Production Dependencies
```json
{
  "name": "@bankim/server",
  "dependencies": {
    "@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git",
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "express-session": "^1.17.3",
    "connect-pg-simple": "^9.0.1",
    "bcrypt": "^5.1.1"
  }
}
```

### Key Dependency Design
- **Shared Package**: Git-based reference to shared types repository
- **Database**: PostgreSQL with connection pooling
- **Security**: Helmet, CORS, rate limiting, bcrypt password hashing
- **Sessions**: Express sessions with PostgreSQL store
- **Environment**: dotenv for configuration management

### Database Architecture
```mermaid
graph TD
    A[API Server] --> B[bankim_content<br/>Content & Translations]
    A --> C[bankim_core<br/>Business Logic & Formulas]
    A --> D[bankim_management<br/>Portal Administration]
    B --> E[Content Items]
    B --> F[Translations]
    B --> G[Application Contexts]
    C --> H[User Permissions]
    C --> I[Bank Configurations]
    D --> J[Admin Sessions]
    D --> K[Audit Logs]
```

---

## 🚀 Deployment Workflow

### Automated Deployment from Workspace
This repository **should not be directly modified**. All changes come from the workspace:

```bash
# From bankim-admin-workspace repository:
npm run push:api                    # Deploy backend changes only
npm run push:all                    # Deploy all repositories including API
```

### What Happens During Deployment
1. **Content Filtering**: Extracts `packages/server/` from workspace
2. **Dependency Transformation**: Changes shared reference from `file:../shared` to git URL
3. **Configuration Swap**: Uses `package.deploy.json` for production dependencies  
4. **Environment Setup**: Maintains production environment configurations
5. **Git Operations**: Commits and pushes filtered content to this repository
6. **Restoration**: Restores original development configuration in workspace

### Production Startup Process
```bash
# These commands run automatically in hosting environment:
npm install                         # Install production dependencies
npm start                          # Start Express server (node server.js)

# Alternative startup commands:
npm run dev                        # Development mode with nodemon
npm run seed                       # Seed database with initial data
npm run db:migrate                 # Run database migrations
```

---

## 🌐 Hosting Strategy

### Recommended Hosting Platforms
This repository is optimized for **server hosting** platforms:

#### **🚀 Railway (Recommended)**
```yaml
Framework: Node.js
Start Command: npm start
Port: $PORT (auto-assigned)
Node.js Version: 18.x
Database: PostgreSQL (managed)
Environment Variables:
  CONTENT_DATABASE_URL: postgresql://user:pass@host:port/bankim_content
  CORE_DATABASE_URL: postgresql://user:pass@host:port/bankim_core
  MANAGEMENT_DATABASE_URL: postgresql://user:pass@host:port/bankim_management
  SESSION_SECRET: your-secure-session-secret
  NODE_ENV: production
```

#### **🔧 Heroku**
```yaml
Buildpack: Node.js
Procfile: web: node server.js
Database: Heroku PostgreSQL addon
Config Vars:
  CONTENT_DATABASE_URL: $DATABASE_URL (from addon)
  NODE_ENV: production
  SESSION_SECRET: generated-secret
```

#### **☁️ AWS (ECS/Elastic Beanstalk)**
```yaml
Platform: Node.js 18 running on Amazon Linux
Application Bundle: Uploaded via CLI or GitHub integration
Database: RDS PostgreSQL instance
Load Balancer: Application Load Balancer
Scaling: Auto-scaling groups
```

#### **🐳 Docker Deployment**
```dockerfile
# Dockerfile included in repository
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Environment Configuration
```env
# Production environment variables (configure in hosting platform)
CONTENT_DATABASE_URL=postgresql://user:password@host:port/bankim_content
CORE_DATABASE_URL=postgresql://user:password@host:port/bankim_core
MANAGEMENT_DATABASE_URL=postgresql://user:password@host:port/bankim_management
SESSION_SECRET=your-very-secure-session-secret
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 🎯 Technical Architecture

### Backend Technology Stack
```yaml
Runtime: Node.js 18.x
Framework: Express 4.18.2
Database: PostgreSQL 8.11.3
Language: JavaScript (with JSDoc types)
Session Store: connect-pg-simple
Security: Helmet + CORS + Rate Limiting
Authentication: Express sessions + bcrypt
```

### API Architecture Patterns

#### **RESTful API Design**
```javascript
// API endpoint structure
GET    /api/content/{screenLocation}     # Get content by screen
GET    /api/content/item/{id}           # Get specific content item
PUT    /api/content/{id}                # Update content item
GET    /api/content/{type}/actions      # Get actions for content type
POST   /api/content/{id}/translations   # Update translations

GET    /api/formulas                    # Get calculation formulas
PUT    /api/formulas/{id}               # Update formula
GET    /api/settings                    # Get UI settings
PUT    /api/settings/{key}              # Update setting
```

#### **Database Connection Strategy**
```javascript
// Multi-database connection management
const contentDB = require('./config/database-content');
const coreDB = require('./config/database-core');
const managementDB = require('./config/database-management');

// Connection pooling and error handling
app.use(async (req, res, next) => {
  try {
    req.contentDB = await contentDB.getConnection();
    req.coreDB = await coreDB.getConnection();
    req.managementDB = await managementDB.getConnection();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});
```

#### **Content Management Pattern**
```javascript
// Content serving with caching and translations
app.get('/api/content/:screenLocation', async (req, res) => {
  const { screenLocation } = req.params;
  const { language = 'ru', app_context = 'public' } = req.query;
  
  try {
    const content = await getContentByScreen(screenLocation, language, app_context);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🔧 Database Management

### Database Schemas
This API connects to **three PostgreSQL databases**:

#### **1. bankim_content (Primary)**
```sql
-- Core content management tables
content_items           -- Main content records
content_translations    -- Multilingual translations  
application_contexts    -- App context definitions
languages              -- Supported languages
content_categories     -- Content organization

-- Content relationship tables
dropdown_options       -- Dropdown option data
content_metadata       -- Additional content properties
audit_logs            -- Content change tracking
```

#### **2. bankim_core (Business Logic)**
```sql
-- Business logic and configuration
user_permissions       -- Role-based access control
bank_configurations   -- Bank-specific settings
calculation_formulas  -- Mortgage/credit calculation rules
ui_settings          -- User interface configurations
session_data         -- User session management
```

#### **3. bankim_management (Portal-Specific)**
```sql
-- Management portal specific data
admin_users           -- Portal administrator accounts
system_settings       -- Portal configuration
feature_flags         -- Feature toggle management
performance_metrics   -- System performance data
```

### Migration Strategy
```bash
# Database migration commands
npm run db:migrate                  # Run pending migrations
npm run db:status                   # Check migration status
npm run seed                        # Seed initial data

# Specific migration scripts
node scripts/migrate.js             # Run custom migrations
node scripts/db-status.js           # Database health check
```

### Data Validation & Testing
```bash
# Validation scripts included
node verify-database.js             # Database integrity check
node verify-mortgage-dropdowns.js   # Feature-specific validation
node test-drill-comprehensive.js    # End-to-end API testing
./test-all-endpoints.sh             # Complete API testing
```

---

## 🔒 Security Architecture

### Security Layers
```javascript
// Multi-layer security implementation
app.use(helmet());                   // Security headers
app.use(cors({ origin: allowedOrigins })); // CORS protection
app.use(rateLimit({                  // Rate limiting
  windowMs: 15 * 60 * 1000,         // 15 minutes
  max: 100                          // limit each IP to 100 requests per windowMs
}));

// Session security
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new (require('connect-pg-simple')(session))({
    pool: pgPool,                    // PostgreSQL session store
    tableName: 'user_sessions'
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 30 * 60 * 1000          // 30 minutes
  }
}));
```

### Authentication Strategy
```javascript
// JWT-less session-based authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Role-based authorization
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.session.userRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
```

### Data Validation
```javascript
// Input validation and sanitization
const validateContentUpdate = (req, res, next) => {
  const { content_key, translations } = req.body;
  
  if (!content_key || typeof content_key !== 'string') {
    return res.status(400).json({ error: 'Invalid content_key' });
  }
  
  if (!translations || typeof translations !== 'object') {
    return res.status(400).json({ error: 'Invalid translations object' });
  }
  
  next();
};
```

---

## 🚨 Critical Usage Guidelines

### ✅ **Correct Usage**

#### **For Hosting Platforms**
- **Clone this repository** for production deployment
- **Configure environment variables** with database URLs and secrets
- **Set start command** to `npm start` or `node server.js`
- **Monitor application logs** for errors and performance metrics

#### **For DevOps/CI/CD**
- **Use this repository** as deployment source
- **Configure health checks** on `/api/health` endpoint
- **Set up database backups** for all three PostgreSQL instances
- **Implement monitoring** for API response times and error rates

#### **For Database Management**
- **Run migrations** using provided scripts before deployment
- **Monitor database connections** and connection pool usage
- **Set up regular backups** of all three databases
- **Use provided validation scripts** to ensure data integrity

### ❌ **Incorrect Usage**

#### **Don't Develop Here**
- **❌ Don't make direct changes** to server.js or API endpoints
- **❌ Don't add new features** or modify business logic
- **❌ Don't change database schemas** without proper migrations
- **❌ Don't modify package.json** or dependency configurations

#### **Don't Manual Operations**
- **❌ Don't manually copy files** from workspace
- **❌ Don't run database operations** without testing
- **❌ Don't modify environment variables** in production without coordination
- **❌ Don't bypass authentication** or security middleware

### 🔄 **If You Need Changes**
1. **Make changes in workspace**: `bankim-admin-workspace/packages/server/`
2. **Test thoroughly**: Database operations, API endpoints, security
3. **Run validations**: `npm run test`, database integrity checks
4. **Deploy from workspace**: `npm run push:api`
5. **Verify deployment**: Check this repository and production server
6. **Monitor production**: Watch logs and performance metrics

---

## 🔍 Monitoring & Maintenance

### Application Health Monitoring
```bash
# Health check endpoints (available in production)
GET /api/health                     # Basic health check
GET /api/health/database            # Database connection status
GET /api/health/detailed            # Full system status

# Manual health checks
node scripts/db-status.js           # Database connectivity
./test-all-endpoints.sh            # API endpoint validation
node verify-database.js            # Data integrity check
```

### Performance Monitoring
```javascript
// Built-in performance tracking
app.use('/api/*', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

### Log Management
```bash
# Log file locations and monitoring
tail -f logs/backend.log            # Real-time application logs
tail -f logs/dev.log               # Development/debug logs

# Log rotation (configure in production)
# Use logrotate or similar for production log management
```

### Database Maintenance
```bash
# Regular maintenance tasks
npm run db:migrate                  # Keep schema up to date
node scripts/db-status.js          # Monitor connection health
node verify-database.js            # Validate data integrity

# Performance optimization
ANALYZE;                           # PostgreSQL query optimization
VACUUM;                           # Database cleanup and optimization
```

---

## 📊 Repository Metrics

```yaml
Repository Type: Backend Deployment (Production)
Primary Purpose: REST API server hosting
Source Repository: bankim-admin-workspace
Update Frequency: On-demand via deployment scripts

Technical Specifications:
  Runtime: Node.js 18.x + Express 4.x
  Database: PostgreSQL (3 instances)
  Authentication: Session-based + bcrypt
  Security: Helmet + CORS + Rate limiting
  Performance: Connection pooling + caching

Deployment Specifications:  
  Hosting: Server hosting platforms (Railway/Heroku/AWS)
  Environment: Production
  Dependencies: Git-based (@bankim/shared)
  Startup: node server.js (production) / nodemon server.js (dev)
  Monitoring: Health endpoints + application logs
```

---

## 🔗 Related Repositories

| Repository | Relationship | Purpose |
|------------|-------------|---------|
| **bankim-admin-workspace** | 📤 Source | Development environment and deployment trigger |
| **bankim-admin-dashboard** | 🔗 API Client | Consumes this API via HTTP requests |
| **bankim-admin-shared** | 📦 Dependency | Shared TypeScript types and utilities |

### Integration Points
- **Frontend Communication**: Serves data to dashboard via REST API
- **Shared Types**: Uses git-based dependency for TypeScript interfaces (JSDoc)
- **Database Integration**: Connects to three PostgreSQL databases
- **Session Management**: Maintains user sessions across API calls

---

## 📞 Quick Reference

### Essential Information
```yaml
Repository URL: git@github.com:sravnenie-ipotek/bankim-admin-api.git
Primary Purpose: Backend API server deployment
Update Method: Automated from bankim-admin-workspace
Development Location: bankim-admin-workspace/packages/server/
Hosting Type: Server hosting (Railway/Heroku recommended)
Main Process: node server.js (port 3001)
```

### Critical Environment Variables
```env
# Required for production
CONTENT_DATABASE_URL=postgresql://...
CORE_DATABASE_URL=postgresql://...
MANAGEMENT_DATABASE_URL=postgresql://...
SESSION_SECRET=secure-random-string
NODE_ENV=production

# Optional but recommended
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Emergency Procedures
```bash
# Rollback to previous version
git reset --hard HEAD~1
git push --force-with-lease origin main

# Re-deploy from workspace (if this repo gets corrupted)
# From bankim-admin-workspace:
npm run push:api --force

# Database emergency procedures
node scripts/db-status.js          # Check database health
npm run db:migrate                 # Ensure schema is current
node verify-database.js           # Validate data integrity
```

---

**🎯 Bottom Line**: This repository contains the production-ready Node.js API server for the BankIM Management Portal backend. It's automatically maintained from the workspace repository and optimized for server hosting platforms. Don't develop here - use the workspace. For hosting platforms, configure environment variables with database URLs and start with `node server.js`.

---

_**Architecture**: Backend Deployment Repository in 4-Repository Strategy_  
_**Role**: Production API server hosting target_  
_**Status**: Production-ready with automated deployment pipeline_