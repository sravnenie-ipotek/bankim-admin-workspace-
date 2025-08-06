# BankIM Database Setup Guide

## 🗄️ Database Configuration

This project uses PostgreSQL databases for content management with multiple environment configurations.

### **Database Architecture**

The BankIM Management Portal uses **multiple PostgreSQL databases**:

- **bankim_content**: UI content and multilingual translations (primary)
- **bankim_core**: Business logic, formulas, user permissions  
- **bankim_management**: Portal-specific administrative data

## 🚀 Quick Start

### Environment Setup
```bash
# Copy environment template
cp .env.template .env

# Configure database connections
nano .env
```

### Required Environment Variables
```bash
# Primary content database
CONTENT_DATABASE_URL=postgresql://user:password@host:port/bankim_content

# Core business logic database  
CORE_DATABASE_URL=postgresql://user:password@host:port/bankim_core

# Management database
MANAGEMENT_DATABASE_URL=postgresql://user:password@host:port/bankim_management

# Fallback for legacy compatibility
DATABASE_URL=postgresql://user:password@host:port/bankim_content
```

## 🔧 Development Commands

### Start Development Server
```bash
# Start all services (client + server)
npm run dev

# Start server only
npm run dev --workspace=@bankim/server

# Start client only  
npm run dev --workspace=@bankim/client
```

### Database Management
```bash
# Run database migrations
npm run db:migrate --workspace=@bankim/server

# Check database status
npm run db:status --workspace=@bankim/server

# Seed database with sample data
npm run seed --workspace=@bankim/server
```

## 🧪 Testing Your Setup

### Health Check
```bash
# Test server health
curl http://localhost:3001/health
# Expected: {"status":"OK","message":"BankIM API Server is running",...}

# Get database info
curl http://localhost:3001/api/db/status
# Expected: {"database":"PostgreSQL","type":"PostgreSQL",...}
```

### API Endpoints
```bash
# Test content endpoints
curl http://localhost:3001/api/content/mortgage
curl http://localhost:3001/api/content/credit

# Test user endpoints (if configured)
curl http://localhost:3001/api/users
```

## 🗂️ File Structure

```
packages/server/
├── server.js                   # Main Express server
├── config/
│   ├── database-content.js     # Content database config
│   ├── database-core.js        # Core database config
│   └── database-management.js  # Management database config
├── scripts/
│   ├── migrate.js              # Database migration script
│   ├── seed-database.js        # Sample data seeder
│   └── db-status.js           # Database status checker
└── routes/
    ├── content.js              # Content management routes
    ├── auth.js                 # Authentication routes
    └── health.js               # Health check routes
```

## 📦 Database Schema

### Content Database (bankim_content)
```sql
-- Main content items
content_items (
  id, content_key, component_type, category, 
  screen_location, app_context_id, is_active,
  created_at, updated_at
)

-- Multilingual translations
content_translations (
  id, content_item_id, language_code, 
  content_value, created_at, updated_at
)

-- Application contexts (4 types)
application_contexts (
  id, context_code, context_name, 
  description, is_active
)

-- Supported languages
languages (
  id, language_code, language_name,
  is_rtl, is_active
)
```

### Core Database (bankim_core)
```sql
-- Business formulas and calculations
formulas (
  id, formula_name, formula_type,
  calculation_logic, parameters
)

-- User permissions and roles
user_permissions (
  id, user_id, permission_type,
  resource_access, role_level
)
```

## 🔄 Migration System

### Running Migrations
```bash
# Check migration status
npm run db:status --workspace=@bankim/server

# Run pending migrations
npm run db:migrate --workspace=@bankim/server

# Seed sample data
npm run seed --workspace=@bankim/server
```

### Migration Files
```
packages/server/migrations/
├── 001_initial_content_schema.sql
├── 002_add_application_contexts.sql  
├── 003_add_language_support.sql
└── 004_add_user_permissions.sql
```

## 🌍 Multilingual Support

### Supported Languages
- **Hebrew (he)**: Primary language with RTL support
- **Russian (ru)**: Cyrillic script support
- **English (en)**: International accessibility

### Translation Management
```bash
# Get content in specific language
curl "http://localhost:3001/api/content/mortgage?lang=he"

# Update translation
curl -X PUT "http://localhost:3001/api/content/123/translations" \
  -H "Content-Type: application/json" \
  -d '{"he":"Hebrew text","ru":"Russian text","en":"English text"}'
```

## 🔐 Security Configuration

### Database Security
- **SSL Connections**: Use `sslmode=require` in production
- **Connection Pooling**: Configured for optimal performance
- **Query Parameterization**: Protection against SQL injection
- **Role-Based Access**: Database-level user permissions

### Environment Security
```bash
# Use strong database passwords
# Enable SSL for all database connections
# Restrict database access by IP (production)
# Regular backup and recovery procedures
```

## 🚦 Deployment

### Production Environment Variables
```bash
# Set in production environment
NODE_ENV=production
CONTENT_DATABASE_URL=postgresql://prod_user:password@prod_host/bankim_content
CORE_DATABASE_URL=postgresql://prod_user:password@prod_host/bankim_core
MANAGEMENT_DATABASE_URL=postgresql://prod_user:password@prod_host/bankim_management
```

### Build and Deploy
```bash
# Build all packages
npm run build

# Deploy to all repositories
npm run push:all
```

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test database connectivity
npm run db:status --workspace=@bankim/server

# Check environment variables
env | grep DATABASE_URL

# Verify PostgreSQL service
pg_isready -h hostname -p port
```

### Port Conflicts
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Use different port
PORT=3002 npm run dev --workspace=@bankim/server
```

### Performance Issues
```bash
# Check database performance
curl http://localhost:3001/api/db/stats

# Monitor connection pool
curl http://localhost:3001/api/db/pool-status
```

## 📊 Monitoring

### Database Health Monitoring
- **Connection Pool Status**: Active/idle connections
- **Query Performance**: Slow query logging
- **Database Size**: Storage usage monitoring
- **Backup Status**: Regular backup verification

### Application Metrics
- **API Response Times**: Endpoint performance tracking
- **Error Rates**: Error monitoring and alerting
- **Content Cache**: Cache hit/miss ratios
- **User Activity**: Access pattern analysis

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                              # Start all services
npm run dev --workspace=@bankim/server   # Server only
npm run dev --workspace=@bankim/client   # Client only

# Database
npm run db:migrate --workspace=@bankim/server   # Run migrations
npm run db:status --workspace=@bankim/server    # Check status
npm run seed --workspace=@bankim/server         # Seed data

# Testing
curl http://localhost:3001/health               # Health check
curl http://localhost:3001/api/content/mortgage # Test API

# Deployment
npm run build           # Build all packages
npm run push:all        # Deploy to repositories
```

**For detailed API documentation, see individual package README files.**