# BankIM Management Portal - Launch Commands
./scripts/kill-port-4000.sh
## 🏗️ **Architecture Overview**

# Terminal 1 - Backend Server
cd /Users/michaelmishayev/Projects/bankIM_management_portal/packages/server/
npm run dev

# Terminal 2 - Frontend Client  
cd /Users/michaelmishayev/Projects/bankIM_management_portal/packages/client/
npm run dev



The BankIM Management Portal uses a **hybrid 4-repository architecture**:
- **Development**: Monorepo (single repository)
- **Deployment**: 4 separate repositories

## 🚀 **Quick Start (Recommended)**
```bash
cd /Users/michaelmishayev/Projects/bankIM_management_portal
npm run dev
```

## 🔧 **Manual Launch Commands**

### Terminal 1 - Backend Server:
```bash
cd /Users/michaelmishayev/Projects/bankIM_management_portal/packages/server/
npm run dev
```

### Terminal 2 - Frontend Client:
```bash
cd /Users/michaelmishayev/Projects/bankIM_management_portal/packages/client/
npm run dev
```

## 📋 **Full Setup Sequence**
```bash
# 1. Navigate to project root
cd /Users/michaelmishayev/Projects/bankIM_management_portal

# 2. Install dependencies
npm install

# 3. Build shared package
cd packages/shared && npm run build && cd ../..

# 4. Start all services
npm run dev
```

## 🌐 **Access URLs**
- **Frontend**: http://localhost:4002
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🔑 **Login Credentials**
- **Email**: admin@bankim.com
- **Password**: Admin123!
- **Role**: director (super_admin)

## 📦 **Available Scripts**
```bash
npm run dev          # Start all development servers
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages
npm run clean        # Clean build artifacts
npm run type-check   # TypeScript validation
npm run push:all     # Deploy to all 4 repositories
```

## ⚠️ **Prerequisites**
- Node.js >= 18.0.0
- npm >= 8.0.0
- Ports 4000 and 4002 should be free
- Database connections configured

## 🗄️ **Database Connections**
- **Core DB**: bankim_core (yamanote.proxy.rlwy.net:53119)
- **Content DB**: bankim_content (shortline.proxy.rlwy.net:33452)
- **Management DB**: bankim_management (yamanote.proxy.rlwy.net:53119)

## 🏗️ **Development Structure (Monorepo)**
```
bankIM_management_portal/          (Development Repository)
├── packages/
│   ├── client/     (React frontend - port 4002)
│   ├── server/     (Express backend - port 4000)
│   └── shared/     (TypeScript utilities)
├── docs/           (Documentation)
├── scripts/        (Deployment scripts)
└── package.json    (Monorepo root)
```

## 🚀 **Deployment Structure (3 Repositories)**
```
1. bankim-admin-workspace-        (Development monorepo - DISABLED)
2. bankim-admin-dashboard         (Frontend deployment)
3. bankim-admin-api              (Backend deployment)
4. bankim-admin-shared           (Shared package deployment)
```

## 📋 **Repository Mapping**
| **Source** | **Target Repository** | **Purpose** | **Status** |
|------------|----------------------|-------------|------------|
| `packages/client/` | `bankim-admin-dashboard` | Frontend deployment | ✅ Active |
| `packages/server/` | `bankim-admin-api` | Backend deployment | ✅ Active |
| `packages/shared/` | `bankim-admin-shared` | Package distribution | ✅ Active |
| **Complete monorepo** | `bankim-admin-workspace-` | Development repository | ⚠️ Disabled |

## 🎯 **Development Workflow**
1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit code in packages/
3. **Test**: `npm run test`
4. **Build**: `npm run build`
5. **Deploy**: `npm run push:all` (pushes to 3 repositories, workspace disabled)

## 🔄 **Deployment Commands**
```bash
npm run push:all         # Deploy to 3 repositories (workspace disabled)
npm run push:dashboard   # Deploy frontend only
npm run push:api         # Deploy backend only
npm run push:shared      # Deploy shared package only
npm run push:workspace   # Deploy development repo only (DISABLED)
```

## 🔧 **Troubleshooting**
- **Port Issues**: Use `lsof -ti:PORT` and `kill -9 PID`
- **Build Issues**: `npm run clean && npm install`
- **Database Issues**: Check connection strings in config/
- **Deployment Issues**: Check git remotes with `git remote -v`