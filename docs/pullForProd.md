# 🏭 Production Pull Guide

**Simple guide: Where production servers should pull code from**

---

## 🎯 **PRODUCTION REPOSITORY MAP**

| Production Server | Pull From | Command |
|------------------|-----------|---------|
| **Frontend** | `bankim-admin-dashboard` | `git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git` |
| **Backend** | `bankim-admin-api` | `git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git` |
| **Shared** | ❌ **DON'T CLONE** | Auto-downloaded via `npm install` |

---

## 🚨 **CRITICAL RULES**

### ✅ **DO THIS**
```bash
# Frontend Production Server
git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git
cd bankim-admin-dashboard
npm install  # ← This automatically gets shared package
npm run build

# Backend Production Server  
git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git
cd bankim-admin-api
npm install  # ← This automatically gets shared package
npm run db:migrate
npm start
```

### ❌ **DON'T DO THIS**
```bash
# ❌ NEVER pull from workspace in production
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git

# ❌ NEVER manually clone shared repository
git clone git@github.com:sravnenie-ipotek/bankim-admin-shared.git
```

---

## 🔄 **UPDATE WORKFLOW**

### Frontend Updates
```bash
cd bankim-admin-dashboard
git pull origin main
npm install
npm run build
# Deploy new build
```

### Backend Updates  
```bash
cd bankim-admin-api
git pull origin main
npm install
npm run db:migrate
# Restart server
```

---

## 🆘 **QUICK FIX FOR DROPDOWN ISSUE**

```bash
# Frontend server (fix broken dropdowns)
cd bankim-admin-dashboard
git pull origin main  # ← Gets fixed React components
npm install
npm run build
# Deploy → Dropdowns should work
```

---

**🎯 REMEMBER**: 
- Frontend pulls from **dashboard** repo
- Backend pulls from **api** repo  
- Shared is **automatic** (never manual clone)
- Workspace is **development only** (never production)