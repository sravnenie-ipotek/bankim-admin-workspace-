# 🏦 BankIM Management Portal - Monorepo

**A comprehensive multilingual content management portal for Israeli banking services with advanced mortgage and credit calculation capabilities.**

## 📋 Project Overview

The BankIM Management Portal is a sophisticated financial content management system designed for Israeli banks, providing multilingual support (Hebrew, Russian, English) with advanced calculation engines for mortgages, credits, and refinancing products. The system features role-based access control, dynamic content management, and comprehensive audit trails.

## 🚨 Database Setup (START HERE)

**Before any development work:**
- 📖 **[DATABASE_CONFIGURATION.md](DATABASE_CONFIGURATION.md)** - Complete database setup guide
- ⚡ **[DATABASE_QUICKREF.md](DATABASE_QUICKREF.md)** - 2-minute quick start guide
- 🧪 **Test your database:** `npm run test:db --workspace=@bankim/server`

**Expected content counts:** 32, 20, 4, 6 refinance items. If you see 0s or 1s, you're connected to the wrong database!

## 🏗️ Repository Architecture

This project uses a **multi-repository monorepo structure** where each component has its own repository while being developed together:

```
BankIM Management Portal Ecosystem
├── 🏠 Main Repository (this repo)
│   ├── packages/client/        → Deployed to: bankimOnlineAdmin_client.git
│   ├── packages/server/        → Separate backend deployment
│   └── packages/shared/        → Deployed to: bankimOnlineAdmin_shared.git
│
├── 🖥️ Client Repository        (bankimOnlineAdmin_client.git)
│   └── React/TypeScript Frontend Application
│
├── 🔧 Shared Repository        (bankimOnlineAdmin_shared.git)
│   └── TypeScript Types & Utilities
│
└── ⚙️  Server Deployment       (Separate infrastructure)
    └── Node.js/Express API Backend
```

### Repository Relationships

| Repository | Purpose | Technology Stack | Deployment |
|------------|---------|------------------|------------|
| **Main** | Development coordination, scripts, documentation | Monorepo tools, Git hooks | GitHub: `bankimOnlineAdmin.git` |
| **Client** | Frontend application | React 18, TypeScript, Vite, Cypress | GitHub: `bankimOnlineAdmin_client.git` |
| **Shared** | Common types and utilities | TypeScript, ESM modules | GitHub: `bankimOnlineAdmin_shared.git` |
| **Server** | Backend API services | Node.js, Express, PostgreSQL | Railway/Cloud infrastructure |

## 🔄 Git Branch Strategy

### Main Repository Branches
- **`main`** - Production-ready code, deployed to all repositories
- **`develop`** - Integration branch for new features
- **`feature/*`** - Individual feature development
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Release preparation and testing

### Multi-Repository Synchronization
- All repositories maintain identical branch structures
- **Push automation** ensures changes are synchronized across all repos
- **Version tags** are applied consistently across the ecosystem

## 🚀 Quick Start Guide

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git configured with SSH keys
PostgreSQL 14+ (for server development)
```

### Initial Setup
```bash
# Clone the main repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin

# Install dependencies
npm install

# Initialize all repositories and hooks
./scripts/init-repositories.sh

# Start development environment
npm run dev
```

### Development Workflow
```bash
# Start all services in development mode
npm run dev                    # Starts client (port 3002) and server (port 3001)

# Run tests across all packages
npm run test

# Build all packages
npm run build

# Push changes to all repositories
npm run push:all
```

## 📦 Package Structure

### Client Package (`packages/client/`)
```
packages/client/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Route-level components
│   ├── contexts/            # React contexts (Auth, Language, Navigation)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API communication
│   ├── utils/               # Utility functions
│   ├── locales/             # i18n translation files
│   └── assets/              # Static assets and images
├── cypress/                 # E2E tests
├── public/                  # Public assets
└── dist/                    # Build output
```

**Key Features:**
- **React 18** with modern hooks and concurrent features
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Cypress** for comprehensive E2E testing
- **Multilingual support** (Hebrew RTL, Russian, English)
- **Role-based UI** with 6 admin roles
- **Responsive design** for all device sizes

### Server Package (`packages/server/`)
```
packages/server/
├── server.js               # Main Express application
├── config/                 # Database and app configuration
├── database/               # SQL schema and migrations
├── scripts/                # Database utilities and migration scripts
├── migrations/             # Database migration files
└── logs/                   # Server logs
```

**Key Features:**
- **Express.js** REST API
- **PostgreSQL** with complex financial data models
- **Authentication & Authorization** with role-based permissions
- **Content Management API** with multilingual support
- **Financial Calculation Engine** for mortgages and credits
- **Audit Logging** for all operations
- **Security** with Helmet, rate limiting, and CORS

### Shared Package (`packages/shared/`)
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── api.ts          # API request/response types
│   │   ├── content.ts      # Content management types
│   │   └── index.ts        # Consolidated exports
│   └── index.ts            # Main package export
├── dist/                   # Compiled TypeScript output
└── package.json            # NPM package configuration
```

**Key Features:**
- **TypeScript interfaces** shared across client and server
- **API contract definitions** ensuring type safety
- **Content type definitions** for multilingual content
- **Utility types** for common operations
- **Build system** with automatic type generation

## 🌐 Content Management System

### Content Types Supported
- **Mortgage Content** - Loan parameters, calculators, eligibility criteria
- **Credit Content** - Personal loans, credit cards, application processes  
- **Refinancing Content** - Both mortgage and credit refinancing options
- **General Content** - About pages, policies, help documentation
- **Menu Content** - Navigation structure and menu items

### Multilingual Support
- **Hebrew (he)** - Primary language with RTL support
- **Russian (ru)** - Secondary language with Cyrillic support
- **English (en)** - International language for global access

### Content Workflow
1. **Content Creation** - Authors create content in primary language
2. **Translation** - Professional translation to other languages
3. **Review & Approval** - Content review and approval workflow
4. **Publication** - Controlled content publishing
5. **Analytics** - Usage tracking and content performance

## 👥 User Roles & Permissions

The system supports 6 distinct administrative roles:

| Role | Permissions | Access Level | Primary Functions |
|------|-------------|--------------|-------------------|
| **Director** | 40 permissions | Super Admin | Strategic oversight, calculator configuration |
| **Administration** | 26 permissions | System Admin | User management, system configuration |
| **Content Manager** | 13 permissions | Content Admin | Content creation, media management |
| **Sales Manager** | 18 permissions | Sales Admin | Sales pipeline, customer management |
| **Brokers** | 9 permissions | Partner Access | Partner management, commission tracking |
| **Bank Employee** | 21 permissions | Content Access | Content management, customer support |

## 🔐 Security & Compliance

### Security Features
- **Authentication** - JWT-based with refresh tokens
- **Authorization** - Role-based access control (RBAC)
- **Data Protection** - Encryption at rest and in transit
- **Audit Logging** - Comprehensive activity tracking
- **Rate Limiting** - API abuse protection
- **CORS Configuration** - Secure cross-origin requests

### Compliance Standards
- **GDPR** - European data protection compliance
- **PCI DSS** - Payment card industry security
- **Banking Regulations** - Israeli banking compliance
- **Accessibility** - WCAG 2.1 AA compliance

## 🧪 Testing Strategy

### Frontend Testing (Cypress)
```bash
# Run all E2E tests
npm run test:all

# Run specific test suites
npm run test:mortgage          # Mortgage calculation tests
npm run test:content-errors    # Content validation tests
npm run test:full-drill        # Deep navigation tests

# Interactive test runner
npm run cypress:open
```

### Test Coverage Areas
- **User Authentication** - Login/logout workflows
- **Content Management** - CRUD operations for all content types
- **Financial Calculations** - Mortgage and credit calculation accuracy
- **Multilingual Features** - Language switching and RTL support
- **Responsive Design** - Cross-device compatibility
- **Permission Systems** - Role-based access validation

## 🔧 Development Tools & Scripts

### Automation Scripts
```bash
# Repository management
./scripts/init-repositories.sh      # Initialize all repositories
./scripts/push-all-repos.sh         # Push to all repositories
./scripts/setup-git-hooks.sh        # Install Git hooks

# Development environment
./scripts/start-dev.sh              # Start development servers
./scripts/stop-local-dev.sh         # Stop all services
./scripts/run-project.sh            # Full project startup
```

### Build & Deployment
```bash
# Development
npm run dev                          # Start dev environment
npm run build                        # Build all packages
npm run clean                        # Clean build artifacts

# Testing
npm run test                         # Run all tests
npm run lint                         # Code quality checks
npm run type-check                   # TypeScript validation

# Deployment
npm run deploy:all                   # Build and deploy to all repos
npm run push:dry-run                 # Test deployment without changes
```

## 📊 Performance & Monitoring

### Performance Targets
- **Frontend Load Time** - < 3 seconds on 3G networks
- **API Response Time** - < 200ms for standard operations
- **Database Query Time** - < 100ms for content retrieval
- **Test Suite Execution** - < 5 minutes for full suite

### Monitoring Stack
- **Application Logs** - Structured logging with Winston
- **Database Monitoring** - PostgreSQL performance metrics
- **Frontend Monitoring** - User experience and performance metrics
- **Security Monitoring** - Authentication and authorization events

## 🚦 Deployment Process

### Automated Push System
The project includes a sophisticated push automation system that synchronizes changes across all repositories:

```bash
npm run push:all    # Full automation with build and deploy
```

**Push Workflow:**
1. **Auto-commit** - Automatically commit any uncommitted changes
2. **Build Shared** - Build the shared package (dependency for others)
3. **Push Main** - Push to the main repository
4. **Push Shared** - Push shared package with version tagging
5. **Push Client** - Build and push client application
6. **Verification** - Verify all operations completed successfully

### Environment Management
- **Development** - Local development with hot reload
- **Staging** - Testing environment with production data
- **Production** - Live environment with monitoring and backups

## 🌐 Access Points

- **Main Application**: http://localhost:3002/
- **Content Management**: http://localhost:3002/content-management
- **Director Dashboard**: http://localhost:3002/director
- **Component Showcase**: http://localhost:3002/components
- **API Health Check**: http://localhost:3001/health

## 📚 Documentation

### Available Documentation
- **[Launch Guide](LAUNCH_GUIDE.md)** - Step-by-step setup instructions
- **[Clean Launch Guide](CLEAN_LAUNCH_GUIDE.md)** - Fresh installation process
- **[Project Organization](PROJECT_ORGANIZATION_COMPLETE.md)** - Detailed architecture
- **[Shared Package Guide](SHARED_PACKAGE_GUIDE.md)** - Package usage and development
- **[Database Setup Guide](docs/DATABASE_SETUP_GUIDE.md)** - Database configuration
- **[Railway Deployment](docs/RAILWAY_DEPLOYMENT.md)** - Cloud deployment guide

### API Documentation
- **REST API Endpoints** - Comprehensive API documentation
- **TypeScript Interfaces** - Shared type definitions
- **Database Schema** - Complete data model documentation
- **Integration Examples** - Usage examples and patterns

## 🤝 Contributing

### Development Workflow
1. **Fork & Clone** - Fork the repository and clone locally
2. **Branch Creation** - Create feature branch from `develop`
3. **Development** - Make changes with comprehensive tests
4. **Testing** - Run full test suite including E2E tests
5. **Documentation** - Update documentation for changes
6. **Pull Request** - Submit PR with detailed description

### Code Standards
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Conventional Commits** - Standardized commit messages
- **Test Coverage** - Minimum 80% test coverage

## 📞 Support & Contact

### Development Team
- **Project Lead** - System architecture and coordination
- **Frontend Team** - React/TypeScript development
- **Backend Team** - Node.js/PostgreSQL development
- **QA Team** - Testing and quality assurance
- **DevOps Team** - Infrastructure and deployment

### Getting Help
- **Issues** - GitHub issues for bug reports and feature requests
- **Documentation** - Comprehensive guides in `/docs` directory
- **Code Comments** - Inline documentation throughout codebase
- **Test Examples** - Reference implementations in test files

## 📄 License

This project is proprietary software developed for BankIM services. All rights reserved.

**Copyright © 2024 BankIM Development Team**

---

## 🔗 Repository Links

- **Main Repository** - [bankimOnlineAdmin](https://github.com/MichaelMishaev/bankimOnlineAdmin)
- **Client Repository** - [bankimOnlineAdmin_client](https://github.com/MichaelMishaev/bankimOnlineAdmin_client)  
- **Shared Repository** - [bankimOnlineAdmin_shared](https://github.com/MichaelMishaev/bankimOnlineAdmin_shared)

**🚀 Ready to start developing? Run `npm run dev` and visit `http://localhost:3002`**