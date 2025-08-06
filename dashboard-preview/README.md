# 🎨 BankIM Admin Dashboard

**Production-ready React application for the BankIM Management Portal frontend**

## 📋 Repository Overview

This repository contains the frontend client application for the BankIM Management Portal, a sophisticated React-based interface for managing multilingual banking content. The client provides role-based administration interfaces, dynamic content editing, and comprehensive mortgage/credit calculation tools.

## 🏗️ Project Architecture

### Multi-Repository Structure
This client is part of a larger **multi-repository monorepo ecosystem**:

```
🏦 BankIM Management Portal Ecosystem
├── 🏠 Main Repository        (bankimOnlineAdmin.git)
│   └── Development coordination, scripts, documentation
├── 🖥️ Client Repository      (THIS REPO - bankimOnlineAdmin_client.git)
│   └── React/TypeScript Frontend Application
├── 🔧 Shared Repository      (bankimOnlineAdmin_shared.git)
│   └── TypeScript Types & Utilities  
└── ⚙️  Server Infrastructure  (Separate deployment)
    └── Node.js/Express API Backend
```

### Repository Relationships
- **Depends on**: `@bankim/shared` package for TypeScript types
- **Communicates with**: Backend API server for data operations
- **Deployed from**: Main repository via automated push system
- **Synchronized with**: All repositories maintain identical branches

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git with SSH access to GitHub
```

### Development Setup
```bash
# Clone this repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git
cd bankimOnlineAdmin_client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points
- **Development Server**: http://localhost:3002/
- **Content Management**: http://localhost:3002/content-management
- **Director Dashboard**: http://localhost:3002/director
- **Component Showcase**: http://localhost:3002/components

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AdminLayout/      # Main admin layout wrapper
│   ├── AdminLogin/       # Authentication components
│   ├── ContentEditModals/ # Inline content editing
│   ├── ErrorBoundary/    # Error handling components
│   ├── Pagination/       # Data pagination controls
│   ├── ProtectedRoute/   # Route access control
│   ├── QAShowcase/       # QA testing interfaces
│   ├── SharedHeader/     # Common header component
│   ├── SharedMenu/       # Navigation menu system
│   ├── TabNavigation/    # Tab-based navigation
│   ├── Table/            # Data table components
│   └── TopNavigation/    # Top-level navigation
├── pages/                # Route-level page components
│   ├── Chat/             # Content management pages
│   ├── Content*/         # Content type specific pages
│   ├── Mortgage*/        # Mortgage content pages
│   ├── Credit*/          # Credit content pages
│   ├── Menu*/            # Menu management pages
│   └── QA*/              # Quality assurance pages
├── contexts/             # React context providers
│   ├── AuthContext.tsx   # Authentication state
│   ├── LanguageContext.tsx # Multilingual support
│   └── NavigationContext.tsx # Navigation state
├── hooks/                # Custom React hooks
├── services/             # API communication layer
├── utils/                # Utility functions
├── locales/              # i18n translation files
│   ├── en.json           # English translations
│   ├── he.json           # Hebrew translations (RTL)
│   └── ru.json           # Russian translations
├── assets/               # Static assets and images
└── shared/               # Shared components and utilities
```

## 🎯 Key Features

### React 18 Modern Architecture
- **Functional Components** with modern hooks
- **Concurrent Features** for improved performance
- **Suspense** for code splitting and lazy loading
- **Error Boundaries** for robust error handling
- **Context API** for state management

### TypeScript Integration
- **Strict Type Checking** enabled
- **Interface Definitions** for all props and data
- **Type Guards** for runtime validation  
- **Generic Components** for reusability
- **Shared Types** from `@bankim/shared` package

### Multilingual Support (i18n)
- **Hebrew (he)** - Primary language with RTL support
- **Russian (ru)** - Cyrillic script support
- **English (en)** - International accessibility
- **Dynamic Language Switching** without page reload
- **RTL Layout Support** for Hebrew text direction
- **Context-Aware Translations** based on user role

### Role-Based User Interface
The system supports 6 distinct administrative roles with tailored interfaces:

| Role | UI Access | Key Features |
|------|-----------|-------------|
| **Director** | Super Admin Dashboard | Calculator configuration, strategic oversight |
| **Administration** | System Management | User management, system configuration |
| **Content Manager** | Content Tools | Content creation, media management |
| **Sales Manager** | Sales Dashboard | Pipeline management, customer tools |
| **Brokers** | Partner Portal | Commission tracking, partner management |
| **Bank Employee** | Content Access | Content editing, customer support |

### Content Management System
- **Dynamic Content Editing** with real-time preview
- **Multilingual Content** synchronized across languages
- **Content Type Support**:
  - Mortgage content and calculators
  - Credit products and applications
  - Refinancing options (mortgage & credit)
  - General pages and policies
  - Navigation menu structure
- **Drill-Down Navigation** for complex content hierarchies
- **Inline Editing** with modal interfaces
- **Content Validation** and approval workflows

## 🛠️ Technology Stack

### Core Technologies
- **React 18.2** - Modern React with concurrent features
- **TypeScript 5.2** - Type-safe JavaScript development  
- **Vite 5.0** - Fast build tool and development server
- **React Router 6.8** - Client-side routing with modern patterns

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (planned)
- **Cypress 14.5** - End-to-end testing framework
- **Vite Plugin** - React fast refresh and optimization

### UI/UX Features
- **Responsive Design** - Mobile-first approach
- **CSS Modules** - Scoped styling system
- **Accessibility** - WCAG 2.1 AA compliance
- **RTL Support** - Right-to-left text for Hebrew
- **Theme Support** - Consistent design system

## 🧪 Testing Strategy

### Cypress E2E Testing
```bash
# Run all E2E tests
npm run test:all

# Run specific test suites  
npm run test:mortgage          # Mortgage calculation tests
npm run test:content-errors    # Content validation tests
npm run test:full-drill        # Deep navigation tests

# Interactive test runner
npm run cypress:open

# Headless test execution
npm run cypress:run
```

### Test Coverage Areas
- **Authentication Workflows** - Login/logout and session management
- **Content Management** - CRUD operations for all content types
- **Navigation Systems** - Drill-down and breadcrumb navigation
- **Multilingual Features** - Language switching and RTL rendering
- **Role-Based Access** - Permission validation across roles
- **Responsive Design** - Cross-device compatibility testing
- **Financial Calculations** - Mortgage and credit calculator accuracy

### Test Files Structure
```
cypress/
├── e2e/                  # End-to-end test specifications
│   ├── basic-load-test.cy.ts
│   ├── comprehensive-drill-test.cy.ts
│   ├── content-not-found-check.cy.ts
│   ├── mortgage-calculation.cy.ts
│   ├── mortgage-drill-navigation.cy.ts
│   └── navigation.cy.ts
├── support/              # Test utilities and helpers
│   ├── commands.ts       # Custom Cypress commands
│   ├── e2e.ts           # Global test configuration
│   └── mortgage-helpers.ts # Domain-specific helpers
└── screenshots/          # Test failure screenshots
```

## 🔧 Development Scripts

### Core Development
```bash
npm run dev              # Start development server (port 3002)
npm run build            # Build for production
npm run preview          # Preview production build
npm run clean            # Clean build artifacts
```

### Code Quality
```bash
npm run lint             # ESLint code quality checks
npm run type-check       # TypeScript type validation
```

### Testing
```bash
npm run cypress:open     # Interactive test runner
npm run cypress:run      # Headless test execution
npm run test:mortgage    # Mortgage-specific tests
npm run test:content-errors # Content validation tests
npm run test:full-drill  # Deep navigation tests
npm run test:all         # Complete test suite
```

## 🌐 API Integration

### Service Layer
The client communicates with the backend through a dedicated service layer:

```typescript
// src/services/api.ts
export class ApiService {
  // Content management endpoints
  async getContent(type: string, locale?: string): Promise<ContentItem[]>
  async updateContent(id: string, data: ContentData): Promise<void>
  async createContent(type: string, data: ContentData): Promise<ContentItem>
  
  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  async logout(): Promise<void>
  async refreshToken(): Promise<TokenResponse>
  
  // Financial calculation endpoints
  async calculateMortgage(params: MortgageParams): Promise<MortgageResult>
  async calculateCredit(params: CreditParams): Promise<CreditResult>
}
```

### Error Handling
- **Network Error Recovery** - Automatic retry with exponential backoff
- **Authentication Errors** - Automatic token refresh and re-authentication
- **Validation Errors** - User-friendly error messages
- **Service Unavailable** - Graceful degradation with cached data

## 🎨 UI Components

### Component Architecture
- **Functional Components** with TypeScript props
- **Custom Hooks** for reusable logic
- **Context Providers** for global state
- **Higher-Order Components** for common functionality
- **Render Props** for flexible component composition

### Shared Components
```typescript
// AdminLayout - Main admin interface wrapper
interface AdminLayoutProps {
  title: string;
  activeMenuItem: string;
  children: React.ReactNode;
}

// ContentTable - Dynamic content listing
interface ContentTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// InlineEdit - Live content editing
interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
}
```

## 🌍 Internationalization (i18n)

### Language Support
The application provides comprehensive multilingual support:

```typescript
// Translation structure
interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
  };
  navigation: {
    dashboard: string;
    content: string;
    settings: string;
  };
  mortgage: {
    title: string;
    calculator: string;
    parameters: string;
  };
}
```

### RTL Support
- **Automatic Layout Mirroring** for Hebrew content
- **Direction-Aware Styling** with CSS logical properties
- **Icon Mirroring** for directional elements
- **Text Alignment** based on text direction
- **Form Layout** adapted for RTL languages

### Translation Management
- **JSON-based** translation files for each locale
- **Hierarchical** translation key organization
- **Context-aware** translations based on user role
- **Missing Translation** fallback to English
- **Dynamic Loading** for performance optimization

## 📊 Performance Optimization

### Build Optimization
- **Code Splitting** with React.lazy and Suspense
- **Tree Shaking** to eliminate unused code
- **Bundle Analysis** with Vite bundle analyzer
- **Asset Optimization** for images and static files
- **Caching Strategy** for API responses and static assets

### Runtime Performance
- **React.memo** for expensive component re-renders
- **useMemo** and **useCallback** for computation optimization
- **Virtual Scrolling** for large data sets
- **Lazy Loading** for images and non-critical components
- **Service Worker** for offline functionality (planned)

### Performance Targets
- **First Contentful Paint** < 1.5 seconds
- **Largest Contentful Paint** < 2.5 seconds
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms
- **Bundle Size** < 500KB initial, < 2MB total

## 🔐 Security Features

### Client-Side Security
- **JWT Token** secure storage and handling
- **XSS Protection** through React's built-in escaping
- **CSRF Protection** with token validation
- **Content Security Policy** headers
- **Secure HTTP** communications only

### Authentication Flow
- **Token-based** authentication with JWT
- **Automatic Refresh** for expired tokens
- **Secure Storage** in httpOnly cookies (planned)
- **Session Management** with automatic logout
- **Role-based** route protection

## 🚦 Deployment

### Build Process
```bash
npm run build            # Production build
npm run preview          # Test production build locally
```

### Deployment Targets
- **Development**: Local development server (port 3002)
- **Staging**: Testing environment with production data
- **Production**: Live environment with monitoring

### Environment Configuration
```typescript
// Environment variables
VITE_API_URL=http://localhost:3001    # Backend API URL
VITE_ENVIRONMENT=development          # Environment name
VITE_SENTRY_DSN=                     # Error tracking (optional)
```

## 🔄 Git Workflow

### Branch Strategy
- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - Feature development branches
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Release preparation

### Multi-Repository Synchronization
This repository is automatically synchronized with the main repository:
- **Push automation** from main repository
- **Branch consistency** across all repositories
- **Version tagging** applied uniformly
- **Automated deployment** triggered from main repo

## 📚 Documentation

### Available Documentation
- **[Main Repository README](https://github.com/MichaelMishaev/bankimOnlineAdmin)** - Complete project overview
- **[Shared Package Docs](https://github.com/MichaelMishaev/bankimOnlineAdmin_shared)** - TypeScript types and utilities
- **Component Documentation** - Inline JSDoc comments
- **API Integration** - Service layer documentation
- **Testing Guide** - Cypress test patterns and examples

### Code Documentation
- **JSDoc Comments** for all public APIs
- **TypeScript Interfaces** for comprehensive type information
- **README Files** in complex component directories
- **Inline Comments** for business logic explanations

## 🤝 Contributing

### Development Workflow
1. **Clone Repository** - Clone this client repository
2. **Create Branch** - Create feature branch from `develop`
3. **Install Dependencies** - Run `npm install`
4. **Start Development** - Run `npm run dev`
5. **Make Changes** - Implement features with tests
6. **Run Tests** - Execute full Cypress test suite
7. **Type Check** - Ensure TypeScript compilation
8. **Submit PR** - Create pull request with description

### Code Standards
- **TypeScript** - Strict type checking required
- **ESLint** - Code quality and consistency
- **Functional Components** - Use hooks over class components
- **Props Interfaces** - Define TypeScript interfaces for all props
- **Test Coverage** - Include Cypress tests for new features

### Commit Guidelines
- **Conventional Commits** format for standardized messages
- **Descriptive Messages** explaining the change purpose
- **Small Commits** focused on single concerns
- **No Direct Commits** to main branch

## 📞 Support

### Getting Help
- **GitHub Issues** - Bug reports and feature requests
- **Code Comments** - Inline documentation throughout codebase  
- **Test Examples** - Reference implementations in Cypress tests
- **Type Definitions** - Comprehensive TypeScript interfaces

### Common Issues
- **Port Conflicts** - Ensure port 3002 is available
- **API Connection** - Verify backend server is running on port 3001
- **Cache Issues** - Clear browser cache or use hard refresh
- **Type Errors** - Ensure `@bankim/shared` package is up to date

### Debug Commands
```bash
# Check running processes
lsof -i :3002

# Clear npm cache
npm cache clean --force

# Rebuild dependencies
rm -rf node_modules package-lock.json && npm install

# Check bundle size
npm run build && ls -la dist/
```

## 📄 License

This project is proprietary software developed for BankIM services. All rights reserved.

**Copyright © 2024 BankIM Development Team**

---

## 🔗 Related Repositories

- **[Main Repository](https://github.com/MichaelMishaev/bankimOnlineAdmin)** - Complete project coordination
- **[Shared Package](https://github.com/MichaelMishaev/bankimOnlineAdmin_shared)** - TypeScript types and utilities
- **Server Infrastructure** - Backend API services (separate deployment)

**🚀 Ready to develop? Run `npm run dev` and visit `http://localhost:3002`**

---

**Note**: This repository is automatically synchronized with the main repository. Direct commits to main branch are not recommended. All development should go through the main repository's workflow.