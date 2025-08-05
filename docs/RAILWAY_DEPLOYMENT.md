# Railway Deployment Guide - BankIM Test Database

## 🚀 Deploy to Railway with PostgreSQL

Follow these steps to create a new database and API service on Railway:

### Step 1: Create Railway Project

1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Choose **"Deploy from GitHub repo"**
5. Select your `bankIM_management_portal` repository

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click **"+ New Service"**
3. Select **"Database"**
4. Choose **"PostgreSQL"**
5. Wait for the database to deploy (takes 1-2 minutes)

### Step 3: Configure Environment Variables

1. Click on your **main service** (not the database)
2. Go to **"Variables"** tab
3. Railway will automatically add `DATABASE_URL` - this connects to your PostgreSQL
4. Add additional variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```

### Step 4: Deploy the Application

1. Go to **"Settings"** tab in your main service
2. Under **"Build & Deploy"**, verify:
   - Build Command: (leave empty - uses railway.json)
   - Start Command: `node server/server-railway.js`
3. Click **"Deploy"** or push to your GitHub repo

### Step 5: Verify Deployment

1. Wait for deployment to complete (2-3 minutes)
2. Click on your service URL (e.g., `https://your-app.railway.app`)
3. Test endpoints:
   - Health: `https://your-app.railway.app/health`
   - Database Info: `https://your-app.railway.app/api/db-info`
   - Users: `https://your-app.railway.app/api/users`

## 📊 What Gets Created

### PostgreSQL Database
- **Type**: PostgreSQL 13+
- **Location**: Railway cloud
- **Table**: `test_users` (automatically created)
- **Sample Data**: 5 test users

### API Service
- **Framework**: Express.js with PostgreSQL
- **Endpoints**: Full CRUD API for users
- **Health Check**: `/health` endpoint
- **CORS**: Enabled for frontend integration

## 🔗 API Endpoints

Once deployed, your API will be available at your Railway URL:

```
GET    /health              - Health check
GET    /api/db-info         - Database information
GET    /api/users           - Get all users
GET    /api/users/:id       - Get specific user
POST   /api/users           - Create new user
PUT    /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user
```

## 🧪 Test Your Deployment

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL

# Health check
curl https://YOUR_RAILWAY_URL/health

# Get all users
curl https://YOUR_RAILWAY_URL/api/users

# Create new user
curl -X POST https://YOUR_RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Railway Test User","email":"railway@bankim.com","role":"user","status":"active"}'
```

## 📁 Project Structure

```
bankIM_management_portal/
├── server/
│   ├── database-railway.js    # PostgreSQL configuration
│   ├── server-railway.js      # Railway-optimized server
│   ├── database.js           # Local SQLite (for development)
│   └── server.js             # Local server
├── railway.json              # Railway deployment config
└── RAILWAY_DEPLOYMENT.md     # This guide
```

## 🔧 Local vs Railway Development

### Local Development (SQLite)
```bash
npm run server
# Uses: server/server.js + server/database.js
# Database: Local SQLite file
```

### Railway Production (PostgreSQL)
```bash
# Deployed automatically via railway.json
# Uses: server/server-railway.js + server/database-railway.js
# Database: PostgreSQL on Railway
```

## 🎯 Next Steps

After successful deployment:

1. ✅ **Database Created**: PostgreSQL with test_users table
2. ✅ **API Deployed**: Full CRUD operations available
3. ✅ **Sample Data**: 5 test users inserted
4. 🔄 **Add More Tables**: Extend database-railway.js
5. 🔄 **Connect Frontend**: Update React app to use Railway API
6. 🔄 **Add Authentication**: Implement JWT tokens
7. 🔄 **Add More Features**: Following your administrator module plan

## 🚨 Important Notes

- **DATABASE_URL**: Automatically provided by Railway PostgreSQL
- **Port**: Railway assigns port automatically via `process.env.PORT`
- **CORS**: Configured to allow frontend connections
- **SSL**: Automatically handled by Railway
- **Environment**: Set `NODE_ENV=production` for optimal performance

## 🔍 Troubleshooting

### Deployment Fails
1. Check logs in Railway dashboard
2. Verify `railway.json` configuration
3. Ensure all dependencies in `package.json`

### Database Connection Issues
1. Verify PostgreSQL service is running
2. Check `DATABASE_URL` environment variable
3. Review database logs in Railway

### API Not Responding
1. Check health endpoint first: `/health`
2. Verify start command in railway.json
3. Review application logs

---

**Ready to deploy?** Follow the steps above and your test database will be live on Railway! 🚀 