# 🏦 BankIM Management Portal

**Modern React-based management portal for multilingual banking content administration**

## 🏗️ **Architecture Overview**

This project implements a **4-Repository Hybrid Strategy** combining unified development with independent deployment:

### **📁 Repository Structure**

| Repository | Purpose | Technology Stack |
|------------|---------|------------------|
| **🏠 [bankim-admin-workspace](https://github.com/sravnenie-ipotek/bankim-admin-workspace-)** | Complete monorepo for development | Turborepo + npm workspaces |
| **🎨 [bankim-admin-dashboard](https://github.com/sravnenie-ipotek/bankim-admin-dashboard)** | React frontend application | React 18 + TypeScript + Vite |
| **🔧 [bankim-admin-api](https://github.com/sravnenie-ipotek/bankim-admin-api)** | Node.js backend API | Express + PostgreSQL |
| **📚 [bankim-admin-shared](https://github.com/sravnenie-ipotek/bankim-admin-shared)** | Shared TypeScript types & utilities | TypeScript library |

## 🚀 **Quick Start**

### **Development Setup (Monorepo)**

```bash
# Clone the complete workspace
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git
cd bankim-admin-workspace-

# Install all dependencies
npm install

# Start all services in development mode
npm run dev
```

**Access Points:**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **Content Management**: http://localhost:3002/content-management

### **Individual Repository Development**

```bash
# Frontend only
git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git
cd bankim-admin-dashboard
npm install && npm run dev

# Backend only
git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git
cd bankim-admin-api
npm install && npm run dev
```

## 📦 **Technology Stack**

### **Frontend (Dashboard)**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.0
- **Routing**: React Router 6.8
- **Testing**: Cypress 14.5
- **Styling**: CSS3 with CSS Variables

### **Backend (API)**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

### **Shared Package**
- **TypeScript Types**: Content interfaces, API responses
- **Utilities**: Content validation, translation helpers
- **Distribution**: Git-based package distribution

### **Development Tools**
- **Monorepo**: Turborepo for build orchestration
- **Package Manager**: npm workspaces
- **Code Quality**: ESLint + TypeScript strict mode
- **Deployment**: Automated 4-repository push system

## 🎯 **Key Features**

### **Multilingual Content Management**
- **Languages**: Hebrew (RTL), Russian (Cyrillic), English
- **Content Types**: Text, dropdowns, links, formulas
- **Real-time Editing**: Inline content editing with modals
- **Database-driven**: PostgreSQL content storage

### **Role-Based Access Control**
- **Director**: Super admin dashboard
- **Administration**: System management
- **Content Manager**: Content creation tools
- **Sales Manager**: Sales dashboard
- **Bank Employee**: Content editing
- **Brokers**: Partner portal

### **Financial Calculation Tools**
- **Mortgage Calculator**: Interest rates, payment schedules
- **Credit Products**: Application workflows
- **Refinancing**: Mortgage and credit refinancing options

## 🗄️ **Database Architecture**

The system uses multiple PostgreSQL databases:

- **bankim_content**: UI content and multilingual translations
- **bankim_core**: Business logic, formulas, user permissions
- **bankim_management**: Portal-specific administrative data

### **Environment Configuration**
```bash
# Copy template and configure
cp env.template .env

# Required environment variables
CONTENT_DATABASE_URL=postgresql://...
CORE_DATABASE_URL=postgresql://...
MANAGEMENT_DATABASE_URL=postgresql://...
```

## 🔧 **Development Scripts**

### **Monorepo Commands**
```bash
# Development
npm run dev              # Start all packages in parallel
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all packages

# Deployment
npm run push:all         # Deploy to all 4 repositories
npm run push:workspace   # Push workspace only
npm run push:dashboard   # Push dashboard only
npm run push:api         # Push API only
npm run push:shared      # Push shared package only
```

### **Package-Specific Commands**
```bash
# Client package (Frontend)
npm run dev --workspace=@bankim/client
npm run build --workspace=@bankim/client
npm run test:all --workspace=@bankim/client

# Server package (Backend)
npm run dev --workspace=@bankim/server
npm run db:migrate --workspace=@bankim/server
npm run test --workspace=@bankim/server

# Shared package (Types)
npm run build --workspace=@bankim/shared
npm run dev --workspace=@bankim/shared
```

## 🧪 **Testing Strategy**

### **End-to-End Testing (Cypress)**
```bash
# Interactive test runner
npm run cypress:open --workspace=@bankim/client

# Specific test suites
npm run test:mortgage --workspace=@bankim/client
npm run test:content-errors --workspace=@bankim/client
npm run test:full-drill --workspace=@bankim/client
```

### **Test Coverage Areas**
- Authentication workflows
- Content management CRUD operations
- Multilingual content switching
- Financial calculator accuracy
- Role-based access control
- Responsive design validation

## 🚦 **Deployment Strategy**

### **4-Repository Deployment System**

The deployment system automatically filters and transforms content for each target repository:

```bash
# Deploy to all repositories
npm run push:all

# Deploy with custom message
npm run push:all -m "Feature: Add new calculator"

# Dry run (preview changes)
npm run push:dry-run
```

**Deployment Process:**
1. **Workspace**: Complete monorepo pushed for development
2. **Dashboard**: Client package filtered with git-based shared dependency
3. **API**: Server package filtered with git-based shared dependency
4. **Shared**: Types package with semantic versioning

### **Dependency Transformation**
- **Development**: `file:../shared` for local package linking
- **Deployment**: `git+https://github.com/.../bankim-admin-shared.git` for remote access

## 📚 **Documentation**

### **Available Guides**
- **[REPOSITORIES_README.md](./REPOSITORIES_README.md)** - Complete 4-repository architecture guide
- **[CLAUDE.md](./CLAUDE.md)** - Development instructions for AI assistance
- **[DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)** - Database configuration
- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - Fast development setup
- **[MONOREPO_SETUP_COMPLETE.md](./MONOREPO_SETUP_COMPLETE.md)** - Monorepo configuration

### **Architecture Documentation**
- **[systemTranslationLogic.md](./systemTranslationLogic.md)** - Translation system
- **[SSH_SERVER_HIERARCHY.md](./SSH_SERVER_HIERARCHY.md)** - Server architecture
- **[CHECK_BANKIM_ONLINE.md](./CHECK_BANKIM_ONLINE.md)** - Health monitoring

## 🔐 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **CORS Protection**: Cross-origin request security
- **Helmet Integration**: Security headers and protection
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Data sanitization and validation

## 🌍 **Internationalization**

### **Language Support**
- **Hebrew (he)**: Primary language with RTL support
- **Russian (ru)**: Cyrillic script support  
- **English (en)**: International accessibility

### **RTL (Right-to-Left) Features**
- Automatic layout mirroring for Hebrew
- Direction-aware CSS styling
- Text alignment based on language direction
- Form layout adaptation for RTL languages

## 📊 **Performance Optimization**

- **Code Splitting**: React lazy loading and Suspense
- **Bundle Analysis**: Vite bundle optimization
- **API Caching**: 5-minute TTL with ETag validation
- **Tree Shaking**: Unused code elimination
- **Responsive Images**: Optimized asset loading

## 🤝 **Contributing**

### **Development Workflow**
1. Clone workspace repository
2. Create feature branch from `main`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Run tests: `npm run test`
6. Deploy: `npm run push:all`

### **Code Standards**
- TypeScript strict mode required
- ESLint for code quality
- Functional components with hooks
- Comprehensive type definitions
- E2E test coverage for new features

## 📞 **Support**

- **Issues**: Create issues in respective repositories
- **Documentation**: Comprehensive inline documentation
- **Type Safety**: Full TypeScript interface coverage
- **Testing**: Cypress E2E test examples

---

## 🔗 **Repository Links**

- **[🏠 Workspace](https://github.com/sravnenie-ipotek/bankim-admin-workspace-)** - Complete development environment
- **[🎨 Dashboard](https://github.com/sravnenie-ipotek/bankim-admin-dashboard)** - React frontend application
- **[🔧 API](https://github.com/sravnenie-ipotek/bankim-admin-api)** - Node.js backend service
- **[📚 Shared](https://github.com/sravnenie-ipotek/bankim-admin-shared)** - TypeScript types & utilities

**Copyright © 2024 BankIM Development Team**

---

**🚀 Ready to develop? Run `npm install && npm run dev` and visit `http://localhost:3002`**