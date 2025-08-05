# 🚀 Clean Launch Guide - BankIM Management Portal

## 🛑 **Step 1: Kill All Running Processes**

```bash
# Kill any processes on development ports
lsof -ti:3001,3002,3003 | xargs kill -9 2>/dev/null || echo "No processes found"
```

## 🔧 **Step 2: Install Dependencies**

```bash
# From root directory
npm install
```

## 🌐 **Step 3: Launch Options**

### **Option A: Launch Everything (Recommended)**
```bash
# From root directory
npm run dev
```

**This will start:**
- ✅ **Frontend**: React app on http://localhost:3003
- ✅ **Backend**: Node.js API on http://localhost:3001
- ✅ **Shared**: TypeScript compilation in watch mode

### **Option B: Launch Individual Packages**

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

## 🌐 **Access URLs**

### **Frontend (React App)**
```
http://localhost:3003
```

### **Backend (API)**
```
http://localhost:3001
Health Check: http://localhost:3001/health
```

## ✅ **Verification Commands**

### **Check if Everything is Running**
```bash
# Check backend
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3003
```

### **Expected Responses**
- **Backend Health**: `{"status":"healthy","message":"bankim_content API is running"}`
- **Frontend**: HTML page (React app)

## 🔍 **Troubleshooting**

### **If Ports are Still in Use**
```bash
# Find processes using ports
lsof -i :3001
lsof -i :3003

# Kill specific process
kill -9 <PID>
```

### **If Dependencies are Broken**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **If Server Won't Start**
```bash
cd packages/server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **If Frontend Won't Start**
```bash
cd packages/client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 **Package Structure**

```
bankIM_management_portal/
├── packages/
│   ├── client/     # Frontend React app
│   ├── server/     # Backend Node.js API
│   └── shared/     # Shared types & utilities
├── package.json    # Root workspace
└── turbo.json      # Build system
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

## 🎉 **Success Indicators**

- ✅ **Frontend**: React app loads at http://localhost:3003
- ✅ **Backend**: Health check returns `{"status":"healthy"}`
- ✅ **Shared**: TypeScript compiles without errors
- ✅ **No port conflicts**: All services start cleanly

## 🚀 **Ready to Launch!**

**Your BankIM Management Portal is ready to launch!**

1. **Kill any running processes** (Step 1)
2. **Install dependencies** (Step 2)
3. **Choose your launch option** (Step 3)
4. **Access your application** at the URLs above

**Happy coding!** 🎉 