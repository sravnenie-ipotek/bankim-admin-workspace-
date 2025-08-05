# BankIM Database Configuration

## Overview
This directory contains database configuration for the BankIM Management Portal project.

## Database Details
- **Database Type**: PostgreSQL
- **Local Development**: PostgreSQL (localhost)
- **Production**: Railway PostgreSQL
- **Configuration**: Located in `backend/server.js`

## Available Configurations

### 1. Local PostgreSQL (Development)
- **Host**: localhost
- **Port**: 5432  
- **Database**: bankim_content_local
- **Configuration**: `localConfig` in `backend/server.js`

### 2. Railway PostgreSQL (Production)
- **Host**: Railway-provided endpoint
- **Configuration**: `primaryConfig` in `backend/server.js`
- **Connection**: Via `CONTENT_DATABASE_URL` environment variable

## Server Files

- `server.js` - Main backend server with PostgreSQL connection
- `server-railway.js` - Railway-specific server configuration
- `database-railway.js` - Railway database utilities
- `config/` - Additional configuration files

## Database Schema

The database schema is defined in:
- `database/bankim_content_schema.sql` - Complete schema with tables, functions, and test data

## Setup Instructions

### Local Development
1. Install PostgreSQL locally
2. Create database: `createdb bankim_content_local`
3. Load schema: `psql -d bankim_content_local -f database/bankim_content_schema.sql`
4. Start server: `cd backend && node server.js`

### Production (Railway)
1. Database is automatically provisioned by Railway
2. Schema is loaded via Railway deployment process
3. Connection managed via environment variables

## Features

### Database Connection
- ✅ PostgreSQL with connection pooling
- ✅ Automatic fallback between Railway and local databases
- ✅ Graceful error handling and reconnection
- ✅ Health checks and monitoring endpoints

### Content Management
- ✅ Multi-language content support (EN, RU, HE)
- ✅ Content versioning and approval workflow
- ✅ Category-based content organization
- ✅ Real-time content updates

### API Endpoints
- `/health` - Server health check
- `/api/database-status` - Database connection status
- `/api/content/*` - Content management endpoints
- `/api/ui-settings` - UI configuration endpoints

## Migration Notes

**Previous SQLite setup has been removed:**
- All SQLite dependencies and files have been cleaned up
- Project now uses PostgreSQL exclusively for better production compatibility
- Local development mirrors production database structure

## Troubleshooting

### Database Connection Issues
1. Check PostgreSQL service is running: `brew services list | grep postgresql`
2. Verify database exists: `psql -l | grep bankim_content_local`
3. Check server logs for connection details
4. Use health endpoint: `curl http://localhost:3001/health`

### Schema Issues
1. Reload schema: `psql -d bankim_content_local -f database/bankim_content_schema.sql`
2. Check table structure: `psql -d bankim_content_local -c "\dt"`
3. Verify functions: `psql -d bankim_content_local -c "\df"` 