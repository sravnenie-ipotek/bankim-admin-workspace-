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

### Development (Turborepo)
```bash
# Start all packages in development mode (client + server)
npm run dev

# Start individual packages
npm run dev --workspace=@bankim/client    # Frontend only (port 3002)
npm run dev --workspace=@bankim/server    # Backend only (port 3001)

# Alternative: navigate to package directories
cd packages/client && npm run dev
cd packages/server && npm run dev
```

### Building & Quality
```bash
# Build all packages
npm run build

# Build specific packages
npm run build --workspace=@bankim/client
npm run build --workspace=@bankim/server

# Lint all packages
npm run lint

# Type checking
npm run type-check
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

## Architecture Overview

This is a **Turborepo monorepo** containing a React TypeScript management portal for a banking system with role-based access control. It operates independently from the main production application.

### Monorepo Structure
- **packages/client**: Frontend React application (`@bankim/client`)
- **packages/server**: Backend Express API (`@bankim/server`) 
- **packages/shared**: Shared TypeScript types and utilities (`@bankim/shared`)
- **Root**: Turborepo configuration and shared tooling

### Tech Stack
- **Monorepo**: Turborepo for build system and task orchestration
- **Frontend**: React 18 + TypeScript + Vite (packages/client)
- **Routing**: React Router v6 (with future flags enabled)
- **Styling**: CSS with dark theme (no CSS-in-JS libraries)
- **Backend**: Express + PostgreSQL (packages/server)
- **API**: RESTful API with content management endpoints
- **Testing**: Cypress for E2E tests
- **Environment**: Node.js >=18.0.0, npm >=8.0.0

### Key Architectural Patterns

1. **Monorepo Architecture**: 
   - Turborepo orchestrates builds, tests, and development across packages
   - Shared types via `@bankim/shared` package used by both client and server
   - Independent versioning and deployment of packages

2. **Component Structure** (packages/client): Components follow `ComponentName.tsx` + `ComponentName.css` pattern. Shared components in `src/components/`, page components in `src/pages/`.

3. **Routing Pattern** (packages/client): 
   - Main routes defined in `src/App.tsx`
   - Protected routes use `ProtectedRoute` component
   - Content management routes follow `/content/{section}` pattern

4. **Layout System** (packages/client): All pages wrapped in `AdminLayout` component providing consistent structure with `SharedHeader` and `SharedMenu`.

5. **API Integration**: 
   - API service centralized in `packages/client/src/services/api.ts`
   - Server runs on port 3001, client on port 3002 with Vite proxy
   - Supports caching with ETag headers (5-minute default TTL)
   - Fallback to mock data when API unavailable
   - Environment-based configuration via Vite env vars
   - Proxy configuration: `/api` routes proxy to `http://localhost:3001`
   - Cache management utilities: `clearContentCache()`, `getContentCacheStats()`

6. **Content Management Architecture**:
   - Multilingual support (RU/HE/EN)
   - Component-based content system (text, dropdown, link types)
   - Real-time editing with ContentEditModals
   - Database-driven content from `bankim_content` PostgreSQL
   - **Application Context System**: Tab navigation for 4 distinct contexts

7. **Tab Navigation System**:
   - Added to all content list pages (CSS selector: `.tab-navigation`)
   - 4 context tabs matching database application contexts
   - Visual design based on `packages/client/devHelp/contentMenu/cssPages/types.md`
   - Active/inactive states with hover effects
   - Responsive mobile stacking layout

## Database Architecture

The system uses multiple PostgreSQL databases:
- **bankim_content**: UI content and translations (primary database for this portal)
- **bankim_core**: Business logic, formulas, permissions, admin users
- **bankim_management**: Portal-specific data

### Environment Variables
Copy `env.template` to `.env` and configure:
```bash
CONTENT_DATABASE_URL=postgresql://...  # Main content database
CORE_DATABASE_URL=postgresql://...     # Core business logic
MANAGEMENT_DATABASE_URL=postgresql://... # Management data
```

### Content Database Schema

**Core Tables:**
- `content_items` - Main content records with metadata
- `content_translations` - Multilingual translations (RU/HE/EN)
- `application_contexts` - **NEW**: Application context definitions
- `languages` - Supported language configurations

**Application Contexts System:**
The database now supports 4 distinct application contexts that correspond to the tab navigation:

1. **Public Website** (`public`) - "До регистрации" content
2. **User Dashboard** (`user_portal`) - "Личный кабинет" content  
3. **Content Management** (`cms`) - "Админ панель для сайтов" content
4. **Banking Operations** (`bank_ops`) - "Админ панель для банков" content

**Key Schema Changes:**
- Added `application_contexts` table with context definitions
- Added `app_context_id` column to `content_items` (foreign key)
- All existing content assigned to 'public' context (ID=1)
- Performance index on `app_context_id` for efficient filtering

**Content Item Structure:**
```sql
content_items:
- id (primary key)
- content_key (unique identifier)
- component_type (text, dropdown, link, etc.)
- category (form, navigation, etc.)
- screen_location (page/section identifier)
- app_context_id (NEW: references application_contexts.id)
- is_active (boolean)
- created_at, updated_at (timestamps)
```

Backend API connects to these databases and provides context-aware content filtering.

## Package Development Patterns

### Working with Shared Types
```typescript
// In packages/shared/src/types/content.ts
export interface ContentItem {
  id: number;
  content_key: string;
  component_type: string;
  // ... other fields
}

// In packages/client/src/services/api.ts
import { ContentItem } from '@bankim/shared';

// In packages/server/server.js  
// Use JSDoc for type hints in JavaScript
/** @typedef {import('@bankim/shared').ContentItem} ContentItem */
```

### Adding Dependencies to Specific Packages
```bash
# Add to client package
npm install lodash --workspace=@bankim/client

# Add to server package  
npm install express-validator --workspace=@bankim/server

# Add to shared package
npm install zod --workspace=@bankim/shared
```

### Package-Specific Development
```bash
# Work on client only
cd packages/client
npm run dev

# Work on server only
cd packages/server  
npm run dev

# Work on shared types
cd packages/shared
npm run build    # Build types
npm run dev      # Watch mode for type changes
```

## Role-Based Access Control

Six user roles with different permissions:
- Director (super-admin)
- Administration
- Content Manager
- Sales Manager
- Bank Employee
- Brokers

Each role has specific routes and UI components based on permissions.

## Development Notes

- TypeScript strict mode enabled (see `tsconfig.json`)
- Cypress E2E testing framework configured
- API URL configuration via environment variables (see `env.template`)
- Content caching implemented with 5-minute TTL (configurable via `VITE_CONTENT_CACHE_TTL`)
- Mock data fallback for offline development
- Port 3002 for frontend, 3001 for backend API
- Vite proxy configured to forward `/api` requests to backend
- Authentication temporarily disabled for testing (see line 357 in `App.tsx`)

### Current Implementation Status

**✅ Completed:**
- Tab navigation UI added to all content list pages
- Database schema updated with application contexts
- All existing content migrated to 'public' context
- Foreign key relationships established
- Performance indexes added

**🔄 In Progress:**
- Tab functionality (currently visual-only, not functional)
- Context-aware API filtering
- Content management by application context

**📋 Future Enhancements:**
- Click handling for tab switching
- Context-specific content creation
- Role-based context access control
- Content migration tools between contexts

## Common Patterns

### Adding New Content Pages
1. Create component in `packages/client/src/pages/Content{Name}/`
2. Add route in `packages/client/src/App.tsx` with ProtectedRoute wrapper
3. Update SharedMenu with navigation item
4. Implement API calls using `apiService`
5. Add corresponding API endpoint in `packages/server/server.js`
6. Update shared types in `packages/shared/src/types/` if needed

### Working with Multilingual Content
- Content stored with language codes: 'ru', 'he', 'en'
- Use `apiService.getContentByScreen()` for fetching
- Edit modals handle all three languages simultaneously

### Working with Application Contexts
- **Database Level**: Content filtered by `app_context_id` column
- **Frontend Level**: Tab navigation shows 4 application contexts
- **API Level**: Context-aware endpoints for content filtering
- **Current State**: All existing content assigned to 'public' context (ID=1)
- **Future Enhancement**: Tab functionality to switch between contexts

**Context Mapping:**
```javascript
const contexts = {
  1: { code: 'public', name: 'До регистрации' },
  2: { code: 'user_portal', name: 'Личный кабинет' },
  3: { code: 'cms', name: 'Админ панель для сайтов' },
  4: { code: 'bank_ops', name: 'Админ панель для банков' }
};
```

### State Management
- Using React Context for auth (`AuthContext`)
- Navigation state via `NavigationContext`
- No Redux/MobX - local component state preferred
- Error boundaries implemented for route-level error handling

## Important Files & Locations

### Configuration Files
- `packages/client/vite.config.ts` - Vite configuration with proxy setup
- `packages/client/tsconfig.json` - Client TypeScript configuration (strict mode)  
- `packages/client/cypress.config.ts` - E2E test configuration
- `packages/server/package.json` - Server dependencies and scripts
- `packages/shared/tsconfig.json` - Shared types TypeScript configuration
- `turbo.json` - Turborepo pipeline configuration
- `package.json` - Root workspace configuration

### Key Source Files
- `packages/client/src/App.tsx` - Main routing and layout configuration
- `packages/client/src/services/api.ts` - Centralized API service with caching
- `packages/client/src/components/AdminLayout/` - Main layout wrapper
- `packages/client/src/contexts/` - React Context providers
- `packages/server/server.js` - Express API server
- `packages/server/scripts/migrate.js` - Database migration script
- `packages/shared/src/types/` - Shared TypeScript interfaces
- `turbo.json` - Turborepo build configuration

### Content Management Flow
1. Content stored in `bankim_content` database
2. API endpoints serve content with language support
3. Frontend caches responses with ETag validation
4. Edit modals update all language translations simultaneously
5. Cache automatically cleared on successful updates