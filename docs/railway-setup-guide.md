# Railway Setup Guide - BankIM Management Portal

## 🚀 Project Structure

### Create New Railway Project: `bankim-management-portal`

## 📦 Services to Add

### 1. Frontend Service (React)
**Service Name**: `admin-portal-frontend`
**Build Command**: `npm run build`
**Start Command**: `npm run preview`

### 2. Backend Service (Node.js)
**Service Name**: `admin-portal-api`  
**Build Command**: `npm install`
**Start Command**: `npm start`

### 3. Database Service (PostgreSQL)
**Service Type**: PostgreSQL
**Database Name**: `bankim_admin_db`

## 🔧 Environment Variables

### Frontend Service Variables:
```bash
NODE_ENV=production
VITE_API_URL=https://admin-portal-api-production.up.railway.app
VITE_APP_NAME=BankIM Admin Portal
```

### Backend Service Variables:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_secure_session_secret_here
CORS_ORIGIN=https://admin-portal-frontend-production.up.railway.app
```

### Database Configuration:
```bash
POSTGRES_DB=bankim_admin_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=auto_generated_by_railway
```

## 🔄 Deployment Process

### Phase 1: Database + Backend
1. Deploy PostgreSQL first
2. Note the DATABASE_URL
3. Deploy backend with database connection
4. Test API endpoints

### Phase 2: Frontend
1. Update VITE_API_URL with backend domain
2. Deploy frontend
3. Test full integration

## 📊 Expected Domains:
- **Frontend**: `admin-portal-frontend-production.up.railway.app`
- **Backend**: `admin-portal-api-production.up.railway.app`
- **Database**: Internal Railway connection

## 🎯 Next Steps:
1. Create empty Railway project
2. Add PostgreSQL service
3. Set up backend repository/deployment
4. Configure this frontend for deployment
5. Connect all services with environment variables 