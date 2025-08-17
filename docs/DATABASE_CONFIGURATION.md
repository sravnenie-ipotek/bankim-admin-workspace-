# Database Configuration Guide - BankIM Management Portal

## 🚨 CRITICAL: Database Environment Configuration

This document prevents database configuration issues that can cause inconsistent content counts, missing data, and broken functionality.

## Problem Prevention

**BEFORE any development work:**
1. ✅ Verify which database the server is actually using
2. ✅ Confirm environment variables are loaded correctly  
3. ✅ Test database connectivity and table access
4. ✅ Validate content counts match expected values

## Database Architecture Overview

The BankIM Management Portal uses **multiple PostgreSQL databases** with specific purposes:

### Database Types
```yaml
CONTENT_DATABASE_URL:     # bankim_content - UI content, translations, CMS data
CORE_DATABASE_URL:        # bankim_core - Business logic, calculations, permissions  
MANAGEMENT_DATABASE_URL:  # bankim_management - Portal-specific admin data
DATABASE_URL:            # Legacy Railway database (backward compatibility)
```

### Railway Production Database (Primary)
```bash
Host: shortline.proxy.rlwy.net
Port: 33452
Database: railway
Connection: postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
SSL: { rejectUnauthorized: false }
```

## Configuration Verification Checklist

### 1. Environment File Setup (.env)
```bash
# Copy the template and configure
cp packages/server/env.template packages/server/.env

# REQUIRED: Set the primary content database
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# OPTIONAL: Other databases (if available)
CORE_DATABASE_URL=postgresql://...
MANAGEMENT_DATABASE_URL=postgresql://...

# NODE environment
NODE_ENV=development
PORT=4000
```

### 2. Server Configuration Verification (packages/server/server.js)

**CRITICAL CHECK**: Verify the database connection string:
```javascript
// Line 22-25 in server.js - MUST use shortline Railway database
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});
```

**❌ WRONG (causes 0 counts):**
```javascript
connectionString: 'postgresql://localhost:5432/bankim_content'  // Local database
```

**✅ CORRECT (shows real content):**
```javascript
connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
```

### 3. Database Connection Test Script

**Create test script: `packages/server/test-db-connection.js`**
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test content count by screen_location
    const result = await client.query(`
      SELECT 
        screen_location,
        COUNT(*) as count
      FROM content_items 
      WHERE screen_location IN ('refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('📊 Content counts by step:');
    result.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.count} items`);
    });
    
    // Expected values (from shortline database):
    // refinance_mortgage_1: 32 items
    // refinance_mortgage_2: 20 items  
    // refinance_mortgage_3: 4 items
    // refinance_mortgage_4: 6 items
    
    const totalCount = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`📋 Total refinance content items: ${totalCount}`);
    
    if (totalCount < 60) {
      console.log('❌ LOW CONTENT COUNT - You may be connected to wrong database!');
      console.log('Expected: ~62 items (32+20+4+6)');
      console.log('Check CONTENT_DATABASE_URL in .env file');
    } else {
      console.log('✅ Content count looks correct - using production database');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
```

**Run test:**
```bash
cd packages/server
node test-db-connection.js
```

### 4. Expected Content Counts (Validation Reference)

When connected to the **correct shortline Railway database**:
```
refinance_mortgage_1: 32 actions
refinance_mortgage_2: 20 actions  
refinance_mortgage_3: 4 actions
refinance_mortgage_4: 6 actions
Total: 62 refinance content items
```

When connected to **wrong/local database**:
```
refinance_mortgage_1: 0 actions
refinance_mortgage_2: 0 actions
refinance_mortgage_3: 0 actions  
refinance_mortgage_4: 0 actions
Total: 0 refinance content items (or very low numbers)
```

## Troubleshooting Database Issues

### Issue: Frontend Shows Wrong Content Counts

**Symptoms:**
- Mortgage refinancing shows "1" for all steps instead of real counts (32, 20, 4, 6)
- Content pages show empty or minimal data
- Drill pages show "No content found"

**Root Cause Analysis:**
1. Check server logs for database connection details
2. Verify `.env` file contains correct `CONTENT_DATABASE_URL`
3. Run database test script to validate connection
4. Check `packages/server/server.js` line 22-25 for connection string

**Resolution Steps:**
1. **Update .env file:**
```bash
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
```

2. **Verify server.js connection:**
```javascript
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});
```

3. **Restart server and test:**
```bash
npm run dev --workspace=@bankim/server
```

4. **Validate with test script:**
```bash
node test-db-connection.js
```

### Issue: SSL Connection Problems

**Error:** `SSL connection failed` or `self signed certificate`

**Solution:**
```javascript
ssl: { rejectUnauthorized: false }  // Required for Railway databases
```

### Issue: Environment Variables Not Loading

**Symptoms:**
- Server connects to default/fallback database
- Environment variables show as `undefined`

**Solution:**
1. Ensure `.env` file is in `packages/server/` directory
2. Verify `require('dotenv').config();` is at top of server.js
3. Check file permissions on `.env` file
4. Restart the server completely

## Development Workflow

### Before Starting Development
```bash
# 1. Check environment setup
cd packages/server
cat .env | grep CONTENT_DATABASE_URL

# 2. Test database connection
node test-db-connection.js

# 3. Start server and verify logs
npm run dev

# 4. Check frontend content counts
# Navigate to http://localhost:4002/content/mortgage-refi
# Verify action counts: 32, 20, 4, 6 (not all 1s)
```

### During Development
- Monitor server logs for database connection messages
- If content counts suddenly drop to 0 or 1, immediately check database connection
- Use test script to validate database connectivity after any configuration changes

### Before Deployment
1. ✅ Run database connection test
2. ✅ Verify all content counts are correct  
3. ✅ Test drill navigation works
4. ✅ Validate text editing functionality
5. ✅ Check all environment variables are set

## Emergency Recovery

If you suspect database misconfiguration:

1. **Immediate Check:**
```bash
# Check what database server is actually using
curl http://localhost:4000/api/content/mortgage-refi | jq '.data.diagnostics'
```

2. **Quick Fix:**
```bash
# Update server.js directly if needed
# Line 23: Replace connection string with Railway URL
connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
```

3. **Restart and Validate:**
```bash
npm run dev --workspace=@bankim/server
node test-db-connection.js
```

## Security Notes

- The Railway database credentials are included in this doc for development purposes
- In production, use environment variables only
- Never commit database credentials to version control
- Rotate credentials periodically

## Contact

For database access issues or credential changes, contact the development team lead.

---

**Last Updated:** 2025-08-17  
**Version:** 1.0  
**Critical Priority:** Database misconfiguration can break entire application functionality