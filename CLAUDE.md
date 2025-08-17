# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Initial Setup
```bash
# Install all dependencies (monorepo with Turborepo)
npm install

# Database migration (server package)
npm run db:migrate --workspace=@bankim/server
```

### Database Testing & Verification
```bash
# 🚨 CRITICAL: Test database connection before development
npm run test:db --workspace=@bankim/server    # Verify correct database connection
npm run db:test --workspace=@bankim/server    # Alternative command

# Expected output: 32, 20, 4, 6 content items for refinance steps
# If you see all 0s or 1s, you're connected to wrong database!
```

### Development (Turborepo)
```bash
# Start all packages in development mode (client + server)
npm run dev

# Start individual packages
npm run dev --workspace=@bankim/client    # Frontend only (port 3002)
npm run dev --workspace=@bankim/server    # Backend only (port 4000)

# Alternative: navigate to package directories
cd packages/client && npm run dev
cd packages/server && npm run dev
```

### Building & Quality
```bash
# Build all packages
npm run build

# Lint all packages
npm run lint

# Type checking
npm run type-check

# Clean all build artifacts
npm run clean
```

### Testing
```bash
# Run all tests across packages
npm run test

# Client-specific Cypress E2E tests
npm run test:mortgage --workspace=@bankim/client        # Mortgage drill navigation tests
npm run test:content-errors --workspace=@bankim/client  # Content not found checks
npm run test:full-drill --workspace=@bankim/client      # Full drill depth tests
npm run test:all --workspace=@bankim/client             # All Cypress tests

# Open Cypress interactive mode
npm run cypress:open --workspace=@bankim/client

# Server tests
npm run test --workspace=@bankim/server
```

### Multi-Repository Deployment
```bash
# Deploy to all repositories (workspace, client, server, shared)
npm run push:all

# Deploy to specific repositories
npm run push:workspace     # Main monorepo
npm run push:dashboard     # Client repository  
npm run push:api          # Server deployment
npm run push:shared       # Shared types repository

# Dry run (preview without pushing)
npm run push:dry-run

# Automated sync with custom message
npm run sync -- -m "Feature update"
```

## Architecture Overview

This is a **multi-repository Turborepo monorepo** containing a React TypeScript management portal for a banking system with role-based access control and sophisticated content management capabilities.

### Multi-Repository Structure

The project uses a unique **multi-repository monorepo** approach where development happens in a single monorepo but deployment occurs to separate repositories:

```
BankIM Management Portal Ecosystem
├── 🏠 Main Repository (this repo - bankIM_management_portal)
│   ├── packages/client/        → Deployed to: bankimOnlineAdmin_client.git
│   ├── packages/server/        → Deployed to: server infrastructure
│   ├── packages/shared/        → Deployed to: bankimOnlineAdmin_shared.git
│   └── dashboard-preview/      → Live dashboard preview environment
├── 🖥️ Client Repository        (React TypeScript frontend)
├── 🔧 Shared Repository        (TypeScript types & utilities)
└── ⚙️ Server Deployment       (Node.js Express API)
```

### Tech Stack

- **Monorepo**: Turborepo for build system and task orchestration
- **Frontend**: React 18 + TypeScript + Vite (packages/client)
- **Routing**: React Router v6 with future flags enabled
- **Styling**: CSS with component-scoped styling (no CSS-in-JS libraries)
- **Backend**: Express + PostgreSQL (packages/server)
- **Database**: Multiple PostgreSQL databases (content, core, management)
- **API**: RESTful with content management, caching, and ETag support
- **Testing**: Cypress for comprehensive E2E testing
- **Environment**: Node.js >=18.0.0, npm >=8.0.0

### Key Architectural Patterns

1. **Multi-Repository Deployment**: 
   - Single monorepo for development with automated deployment to separate repositories
   - Custom push scripts (`scripts/push-4repos.sh`) handle repository synchronization
   - Each component can be deployed independently while maintaining version consistency

2. **Turborepo Orchestration**: 
   - Centralized build system with dependency-aware task execution
   - Shared types via `@bankim/shared` package used by both client and server
   - Parallel development with hot reloading across packages

3. **Component Architecture** (packages/client): 
   - Components follow `ComponentName/ComponentName.tsx` + `ComponentName.css` pattern
   - Shared components in `src/components/`, page components in `src/pages/`
   - Barrel exports via `index.ts` files for clean imports

4. **Advanced Routing System** (packages/client): 
   - Complex nested routing in `src/App.tsx` with 1000+ lines of route definitions
   - Protected routes using `ProtectedRoute` component with permission-based access
   - Content management follows `/content/{section}/{action}` pattern
   - Drill-down navigation for mortgage, credit, and refinancing workflows

5. **Layout System** (packages/client): 
   - `AdminLayout` component provides consistent structure across all admin pages
   - Role-based navigation via `SharedMenu` with 6 distinct user roles
   - Responsive design with mobile-optimized layouts

6. **API Architecture**: 
   - Centralized API service in `packages/client/src/services/api.ts`
   - Server runs on port 4000, client on port 3002 with Vite proxy configuration
   - Advanced caching with ETag headers and 5-minute TTL
   - Graceful degradation with mock data fallback
   - Environment-based configuration with multiple database connections

7. **Content Management System**:
   - **Multilingual Support**: Full support for Hebrew (RTL), Russian, and English
   - **Component-Based Content**: Text, dropdown, link, and complex component types
   - **Real-Time Editing**: Modal-based editing with immediate preview
   - **Application Context System**: 4 distinct contexts (public, user portal, CMS, bank ops)
   - **Database-Driven**: Content served from `bankim_content` PostgreSQL database

8. **Role-Based Access Control**:
   - 6 user roles: Director, Administration, Content Manager, Sales Manager, Bank Employee, Brokers
   - Permission-based route protection and UI component visibility
   - Granular permissions system with action-resource combinations

## Database Architecture

**🚨 CRITICAL: Before any database work, see [DATABASE_CONFIGURATION.md](DATABASE_CONFIGURATION.md) for bulletproof setup instructions and troubleshooting.**

The system integrates with multiple PostgreSQL databases:

### Primary Databases
- **bankim_content**: UI content, translations, and application contexts
- **bankim_core**: Business logic, calculation formulas, user permissions
- **bankim_management**: Portal-specific administrative data

### Environment Configuration
```bash
# Copy env.template to .env and configure:
CONTENT_DATABASE_URL=postgresql://...     # Main content database
CORE_DATABASE_URL=postgresql://...        # Core business logic  
MANAGEMENT_DATABASE_URL=postgresql://...  # Management data
```

### Application Context System

The database supports 4 distinct application contexts with tab-based navigation:

1. **Public Website** (`public`) - Pre-registration content
2. **User Dashboard** (`user_portal`) - Personal account content  
3. **Content Management** (`cms`) - Website admin panel content
4. **Banking Operations** (`bank_ops`) - Banking admin panel content

**Schema Structure:**
```sql
content_items:
- id (primary key)
- content_key (unique identifier)
- component_type (text, dropdown, link, etc.)
- category (form, navigation, etc.)
- screen_location (page/section identifier)
- app_context_id (references application_contexts.id)
- is_active (boolean)
- page_number (for pagination/ordering)
- created_at, updated_at (timestamps)

application_contexts:
- id (primary key)
- context_code (public, user_portal, cms, bank_ops)
- context_name_ru, context_name_he, context_name_en
- description, is_active
```

## Package Development Patterns

### Working with Shared Types
```typescript
// In packages/shared/src/types/content.ts
export interface ContentItem {
  id: number;
  content_key: string;
  component_type: string;
  app_context_id: number;
  // ... other fields
}

// In packages/client/src/services/api.ts
import { ContentItem } from '@bankim/shared';

// In packages/server/server.js  
/** @typedef {import('@bankim/shared').ContentItem} ContentItem */
```

### Package-Specific Development
```bash
# Work on client with hot reloading
cd packages/client && npm run dev

# Work on server with nodemon  
cd packages/server && npm run dev

# Build shared types
cd packages/shared && npm run build
```

### Adding Dependencies
```bash
# Add to specific packages
npm install lodash --workspace=@bankim/client
npm install express-validator --workspace=@bankim/server
npm install zod --workspace=@bankim/shared
```

## Content Management Workflows

### Multilingual Content Editing
1. **Content Discovery**: Navigate via `SharedMenu` to content sections
2. **List View**: Content displayed with pagination and filtering
3. **Drill Navigation**: Deep linking to specific content items
4. **Edit Modals**: 
   - `TextEditModal` for simple text content
   - `DropdownEditModal` for dropdown options
   - `LinkEditModal` for navigation links
5. **Language Management**: All three languages (RU/HE/EN) edited simultaneously
6. **Cache Invalidation**: Automatic cache clearing on successful updates

### Content Types and Components
- **Text Components**: Simple text fields with rich text support
- **Dropdown Components**: Multi-option selectors with conditional logic
- **Link Components**: Navigation elements with internal/external URL support
- **Complex Components**: Calculator formulas and interactive elements

### Application Context Management
- **Context Filtering**: Content filtered by application context in database queries
- **Tab Navigation**: Visual tabs for switching between contexts (UI implemented, functionality pending)
- **Context-Aware APIs**: Endpoints support context filtering via query parameters
- **Migration Tools**: Scripts for moving content between contexts

## Testing Strategy

### Cypress E2E Testing
```bash
# Comprehensive test suites
npm run test:mortgage --workspace=@bankim/client        # Mortgage workflow testing
npm run test:content-errors --workspace=@bankim/client  # Error detection
npm run test:full-drill --workspace=@bankim/client      # Complete drill navigation
npm run test:all --workspace=@bankim/client             # Full test suite
```

### Test Coverage
- **Navigation Testing**: Complete routing and menu navigation
- **Content Management**: CRUD operations for all content types
- **Multilingual Support**: Language switching and translation validation
- **Error Handling**: Content not found scenarios and graceful degradation
- **Permission System**: Role-based access control validation

## Important Files & Locations

### Configuration Files
- `turbo.json` - Turborepo pipeline configuration and task dependencies
- `packages/client/vite.config.ts` - Vite configuration with API proxy setup
- `packages/client/cypress.config.ts` - E2E testing configuration
- `packages/server/config/database-*.js` - Database connection configurations
- `scripts/push-4repos.sh` - Multi-repository deployment automation

### Key Source Files
- `packages/client/src/App.tsx` - Main application routing (1000+ lines)
- `packages/client/src/services/api.ts` - Centralized API service with caching
- `packages/client/src/components/AdminLayout/` - Main layout system
- `packages/client/src/contexts/` - React Context providers (Auth, Navigation, Language)
- `packages/server/server.js` - Express API server with database integrations
- `packages/shared/src/types/` - Shared TypeScript interfaces

### Content Management Components
- `packages/client/src/components/ContentEditModals/` - Modal editing components
- `packages/client/src/shared/components/` - Reusable content management components
- `packages/client/src/utils/` - Content type utilities and configurations
- `packages/client/src/pages/` - Content-specific page components

## Development Workflows

### Feature Development
1. Create feature branch from `main`
2. Develop in monorepo with hot reloading across packages
3. Test with Cypress E2E suite
4. Use `npm run push:dry-run` to preview deployment
5. Deploy with `npm run push:all` to synchronize all repositories

### Content Management Development
1. **Database Changes**: Update schema in `packages/server/database/`
2. **API Updates**: Modify endpoints in `packages/server/server.js`
3. **Type Updates**: Update interfaces in `packages/shared/src/types/`
4. **Frontend Changes**: Update components in `packages/client/src/`
5. **Testing**: Validate with content-specific Cypress tests

### Multi-Repository Synchronization
- **Automated Push**: Custom scripts handle deployment to 4 separate repositories
- **Version Consistency**: All repositories maintain synchronized versions
- **Rollback Capability**: Individual repository rollbacks supported
- **Branch Strategy**: Main branch deploys to production, develop branch for integration

## Production Deployment

### Environment Setup
- **Frontend**: Vite production build with optimized assets
- **Backend**: Express server with production database connections
- **Caching**: Redis caching layer for production performance
- **Monitoring**: Comprehensive logging and error tracking

### Performance Considerations
- **Bundle Optimization**: Vite code splitting and tree shaking
- **Database Indexing**: Optimized indexes on frequently queried columns
- **API Caching**: ETag-based caching with configurable TTL
- **Lazy Loading**: Route-based code splitting for optimal loading

## Security & Access Control

### Authentication & Authorization
- **Role-Based Permissions**: 6 user roles with granular permissions
- **Route Protection**: `ProtectedRoute` component guards sensitive routes
- **API Security**: Helmet middleware and rate limiting
- **Database Security**: Prepared statements and input validation

### Content Security
- **Input Sanitization**: XSS prevention for user-generated content
- **CSRF Protection**: Token-based protection for state-changing operations
- **Audit Trails**: Comprehensive logging of content changes
- **Access Logging**: User action tracking for security audits