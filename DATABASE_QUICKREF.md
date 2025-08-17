# Database Quick Reference - BankIM Portal

## 🚀 Quick Start (2 minutes)

```bash
# 1. Test database connection (ALWAYS do this first!)
npm run test:db --workspace=@bankim/server

# 2. Expected output - verify these numbers:
#    refinance_mortgage_1: 32 items ✅
#    refinance_mortgage_2: 20 items ✅ 
#    refinance_mortgage_3: 4 items ✅
#    refinance_mortgage_4: 6 items ✅

# 3. If you see 0s or wrong numbers:
#    Check packages/server/.env file
#    CONTENT_DATABASE_URL should point to shortline Railway database

# 4. Start development
npm run dev
```

## ❌ Common Problems & Quick Fixes

### Problem: All content counts show 0 or 1
**Cause:** Connected to wrong database (usually local instead of Railway)
**Fix:**
```bash
# Update packages/server/.env:
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# Test connection:
npm run test:db --workspace=@bankim/server

# Restart server:
npm run dev --workspace=@bankim/server
```

### Problem: "Cannot connect to database"
**Cause:** Network or SSL issues
**Fix:**
1. Check internet connection
2. Verify server.js has `ssl: { rejectUnauthorized: false }`
3. Try direct connection test

### Problem: Text edit modal shows empty values
**Cause:** API endpoint not returning content properly  
**Fix:**
1. Check database connection first: `npm run test:db`
2. Verify content exists for specific item ID
3. Check server logs for API errors

## 🔧 Critical Files to Check

```bash
packages/server/.env                 # Database connection URLs
packages/server/server.js:22-25      # Pool configuration  
packages/server/test-db-connection.js # Database test script
```

## 📞 Emergency Contact

If database is completely broken or credentials changed:
1. Contact dev team lead immediately
2. Check #database-issues Slack channel
3. Use backup connection string from DATABASE_CONFIGURATION.md

## 🎯 Success Criteria

✅ Database test shows 62 total refinance items  
✅ Server connects without SSL errors  
✅ Frontend shows correct content counts (32, 20, 4, 6)  
✅ Drill pages load content  
✅ Text editing modal loads existing values  

**When all ✅ = Ready to develop!**