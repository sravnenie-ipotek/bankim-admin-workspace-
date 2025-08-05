# 🚀 BankIM Management Portal - Quick Start Guide

## 🎯 Development Setup with Real Data

This guide will help you get the BankIM Management Portal running with **real data from the bankim_content PostgreSQL database**.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

---

## 🏃‍♂️ Quick Start (One Command)

```bash
# Start both backend and frontend servers
./start-dev.sh
```

This will:
- ✅ Start the backend API server on port 3001
- ✅ Start the frontend development server on port 3002
- ✅ Connect to the real bankim_content database
- ✅ Display real multilingual content (Russian, Hebrew, English)

---

## 🔧 Manual Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment Configuration

The `.env` file is already configured with:
```bash
VITE_API_URL=http://localhost:3001
VITE_CONTENT_API_URL=http://localhost:3001
VITE_USE_REAL_CONTENT_DATA=true
```

### 3. Start Backend Server

```bash
cd backend
node server.js
```

The backend will:
- Connect to PostgreSQL database on Railway
- Serve content API on `http://localhost:3001`
- Provide UI settings and content endpoints

### 4. Start Frontend Server

In a new terminal:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3002`

---

## 🌐 Available Endpoints

### Backend API (http://localhost:3001)
- `/health` - API health check
- `/api/content/main_page/{language}` - Content by language (ru/he/en)
- `/api/ui-settings` - UI configuration settings
- `/api/languages` - Available languages
- `/api/content-categories` - Content categories

### Frontend Routes (http://localhost:3002)
- `/content/main` - Main content management page with real data
- `/content-management` - Content management dashboard
- Other admin routes...

---

## 🗄️ Database Information

**Database**: bankim_content (PostgreSQL on Railway)
- **Content Items**: 254 total (10 for main page)
- **Languages**: Russian, Hebrew, English
- **Translations**: 729 approved translations

---

## 🧪 Testing the Integration

### Test Backend API
```bash
# Test health
curl http://localhost:3001/health

# Test content
curl http://localhost:3001/api/content/main_page/ru | jq
```

### Test Full Integration
```bash
node test-api-integration.cjs
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Kill existing process: `pkill -f "node server.js"`
- Check logs: `tail -f backend/server.log`

### Frontend shows connection errors
- Ensure backend is running: `curl http://localhost:3001/health`
- Clear browser cache and reload
- Check browser console for specific errors

### CORS errors
- Backend is configured to accept requests from localhost ports 3000-3004
- Make sure you're accessing frontend via `http://localhost:3002`

---

## 📦 Project Structure

```
bankIM_management_portal/
├── backend/              # Express API server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── scripts/         # Database utilities
├── src/                 # Frontend React app
│   ├── services/        
│   │   └── api.ts       # API integration
│   └── pages/
│       └── ContentMain/ # Content management UI
├── database/
│   └── bankim_content_schema.sql  # Database schema
└── start-dev.sh         # Development startup script
```

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Backend Console**: 
   ```
   BankIM Content API server running on port 3001
   Database: Connected to bankim_content
   ```

2. **Frontend Console**:
   ```
   VITE v5.x.x ready in XXX ms
   ➜  Local:   http://localhost:3002/
   ```

3. **Browser (http://localhost:3002/content/main)**:
   - Page loads without errors
   - Shows 8 content items in Russian
   - No CORS errors in console
   - Real data from database displayed

---

## 💡 Tips

- Use `./start-dev.sh` for the easiest development experience
- The backend caches content for 5 minutes (configurable via `VITE_CONTENT_CACHE_TTL`)
- All API calls include ETag support for efficient caching
- Frontend gracefully falls back to mock data if API is unavailable

---

## 🚀 Next Steps

1. Navigate to `http://localhost:3002/content/main`
2. You should see real content from the database
3. The content is multilingual - data exists for Russian, Hebrew, and English
4. Try editing content through the UI (requires backend implementation)

---

**Happy Coding! 🎨**