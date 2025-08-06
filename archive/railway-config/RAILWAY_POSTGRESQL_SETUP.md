# Railway PostgreSQL Database Setup Guide

## 🎯 Goal
Create a PostgreSQL database on Railway and connect it to your BankIM Management Portal deployment.

## ✅ Prerequisites
- Railway account and project deployed
- BankIM project already pushed to Railway
- Access to Railway dashboard

## 📋 Step-by-Step Setup

### 1. **Access Railway Dashboard**
1. Go to [railway.app](https://railway.app)
2. Sign in to your account
3. Open your **bankimOnlineAdmin** project

### 2. **Create PostgreSQL Database**
1. In your project dashboard, click **"+ New"** or **"Add Service"**
2. Select **"Database"** from the dropdown
3. Choose **"PostgreSQL"** from the database options
4. Railway will automatically:
   - Create a new PostgreSQL instance
   - Generate connection credentials
   - Provide a `DATABASE_URL` environment variable

### 3. **Connect Database to Your App**
1. In the Railway dashboard, click on your **main service** (bankimOnlineAdmin)
2. Go to **"Variables"** tab
3. Railway should have automatically added `DATABASE_URL` variable
4. If not, manually add it:
   - Click **"+ New Variable"**
   - Name: `DATABASE_URL`
   - Value: Copy from the PostgreSQL service's "Connect" tab

### 4. **Verify Environment Variables**
Your service should have these variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000 (or assigned by Railway)
```

### 5. **Deploy and Test**
1. Railway will automatically redeploy your service
2. Wait for deployment to complete
3. Check deployment logs for success messages

## 🔧 Manual Setup (Alternative)

If automatic connection doesn't work:

### 1. **Get PostgreSQL Connection Details**
1. Click on your **PostgreSQL service** in Railway
2. Go to **"Connect"** tab
3. Copy the connection details:
   - Host
   - Port
   - Database
   - Username
   - Password

### 2. **Set Environment Variables**
1. Go to your **main service** → **"Variables"**
2. Add these variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   PGHOST=your-postgres-host
   PGPORT=5432
   PGDATABASE=railway
   PGUSER=postgres
   PGPASSWORD=your-password
   ```

## 🧪 Testing Your Setup

### 1. **Check Deployment Logs**
1. Go to your main service
2. Click **"Deployments"** tab
3. Click latest deployment
4. Check logs for these success messages:
   ```
   ✅ Connected to PostgreSQL database
   ✅ Test table "test_users" created successfully
   ✅ Inserted 5 sample users
   ✅ Database initialization complete
   ```

### 2. **Test API Endpoints**
Replace `YOUR_RAILWAY_URL` with your actual Railway URL:

```bash
# Health check
curl https://YOUR_RAILWAY_URL/health

# Database info
curl https://YOUR_RAILWAY_URL/api/db-info

# Get users
curl https://YOUR_RAILWAY_URL/api/users
```

### 3. **Expected Responses**

**Health Check:**
```json
{
  "status": "OK",
  "message": "BankIM Railway Database API is running - Test Deploy",
  "timestamp": "2025-07-15T05:30:00.000Z",
  "environment": "production"
}
```

**Database Info:**
```json
{
  "success": true,
  "data": {
    "database": "PostgreSQL on Railway",
    "tables": ["test_users"],
    "userCount": 5,
    "environment": "production"
  }
}
```

**Users API:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@bankim.com",
      "role": "admin",
      "status": "active",
      "created_at": "2025-07-15T05:30:00.000Z",
      "updated_at": "2025-07-15T05:30:00.000Z"
    }
  ],
  "count": 5
}
```

## 🔍 Troubleshooting

### Common Issues:

**1. Database Connection Failed**
- Check if `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running
- Check deployment logs for connection errors

**2. Table Creation Failed**
- Check PostgreSQL service has started
- Verify database permissions
- Look for SQL errors in logs

**3. Environment Variables Missing**
- Go to Variables tab and add `DATABASE_URL`
- Ensure no typos in variable names
- Redeploy after adding variables

### Debug Commands:
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

## 🎯 What Your Code Does

Your existing code will automatically:
1. **Connect** to PostgreSQL using `DATABASE_URL`
2. **Create** `test_users` table if it doesn't exist
3. **Insert** 5 sample users on first run
4. **Provide** full CRUD API endpoints
5. **Handle** SSL connections for production

## 📊 Database Schema

Your PostgreSQL database includes:

### Table: `test_users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (Primary Key) | Auto-increment ID |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) | Unique email address |
| `role` | VARCHAR(50) | User role (admin, manager, user) |
| `status` | VARCHAR(50) | User status (active, inactive, pending) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Sample Data:
- **John Doe** (admin)
- **Jane Smith** (manager)
- **Bob Johnson** (user - inactive)
- **Alice Brown** (user)
- **Charlie Wilson** (manager - pending)

## 🚀 Next Steps

1. **Create PostgreSQL database** in Railway dashboard
2. **Wait for automatic deployment** (2-3 minutes)
3. **Test endpoints** using your Railway URL
4. **Start developing** your admin interface

---

**Your code is ready!** 🎉 Just create the PostgreSQL database in Railway and it will work automatically. 
 
 