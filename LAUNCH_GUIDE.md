# 🚀 Launch Guide - BankIM Management Portal

## 📋 **Prerequisites**

Make sure you have:
- **Node.js** 18+ installed
- **npm** 8+ installed
- **PostgreSQL** (for backend database)

## 🔧 **Setup**

### **1. Install Dependencies**
```bash
# From root directory
npm install
```

### **2. Environment Variables**
Create `.env` file in root directory:
```bash
# Database
CONTENT_DATABASE_URL=your_postgresql_connection_string

# API
VITE_API_URL=http://localhost:3001
```

## 🚀 **Launch Options**

### **Option 1: Full Stack Development (Recommended)**
```bash
# From root directory
npm run dev
```

**What this starts:**
- ✅ **Frontend**: React app on `http://localhost:3003`
- ✅ **Backend**: Node.js API on `http://localhost:3001`
- ✅ **Shared**: TypeScript compilation in watch mode

### **Option 2: Individual Packages**

**Frontend Only:**
```bash
cd packages/client
npm run dev
# Available at: http://localhost:3003
```

**Backend Only:**
```bash
cd packages/server
npm run dev
# Available at: http://localhost:3001
```

**Shared Package (Development):**
```bash
cd packages/shared
npm run dev
# TypeScript compilation in watch mode
```

### **Option 3: Production**
```bash
# Build all packages
npm run build

# Start production server
cd packages/server
npm start
```

## 🌐 **Access URLs**

### **Frontend (React App)**
- **Development**: http://localhost:3003
- **Features**: Content management, multi-language support

### **Backend (API)**
- **Development**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api

## 🔍 **Troubleshooting**

### **Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if needed
brew services start postgresql
```

### **Node Modules Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Build Issues**
```bash
# Clean build
npm run clean
npm run build
```

## 📊 **Development Workflow**

### **Frontend Development**
```bash
cd packages/client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run cypress:open # Open Cypress tests
```

### **Backend Development**
```bash
cd packages/server
npm run dev          # Start with nodemon
npm start            # Start production server
npm run db:migrate   # Run database migrations
```

### **Shared Package Development**
```bash
cd packages/shared
npm run build        # Build TypeScript
npm run dev          # Watch mode
```

## 🎯 **Quick Commands**

### **From Root Directory**
```bash
npm run dev          # Start all packages
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages
```

### **Package-Specific**
```bash
npm run dev --workspace=@bankim/client    # Frontend only
npm run dev --workspace=@bankim/server    # Backend only
npm run build --workspace=@bankim/shared  # Shared only
```

## ✅ **Verification**

### **Check if Everything is Running**
```bash
# Check frontend
curl http://localhost:3003

# Check backend
curl http://localhost:3001/health

# Check shared package
ls packages/shared/dist/
```

## 🎉 **Success Indicators**

- ✅ **Frontend**: React app loads at http://localhost:3003
- ✅ **Backend**: Health check returns `{"status":"ok"}`
- ✅ **Shared**: TypeScript compiles without errors
- ✅ **Database**: PostgreSQL connection established

**Your BankIM Management Portal is now running!** 🚀 