# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3002)
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Backend commands (when backend is needed)
npm run backend:dev      # Start backend dev server on port 3001
npm run backend:migrate  # Run database migrations
npm run full-dev        # Run both frontend and backend concurrently
```

## Architecture Overview

This is a React TypeScript management portal for a banking system with role-based access control. It operates independently from the main production application.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Styling**: CSS with dark theme (no CSS-in-JS libraries)
- **Backend**: Express + PostgreSQL (in `/backend` directory)
- **API**: RESTful API with content management endpoints

### Key Architectural Patterns

1. **Component Structure**: Components follow `ComponentName.tsx` + `ComponentName.css` pattern. Shared components in `src/components/`, page components in `src/pages/`.

2. **Routing Pattern**: 
   - Main routes defined in `src/App.tsx`
   - Protected routes use `ProtectedRoute` component
   - Content management routes follow `/content/{section}` pattern

3. **Layout System**: All pages wrapped in `AdminLayout` component providing consistent structure with `SharedHeader` and `SharedMenu`.

4. **API Integration**: 
   - API service centralized in `src/services/api.ts`
   - Supports caching with ETag headers
   - Fallback to mock data when API unavailable
   - Environment-based configuration via Vite env vars

5. **Content Management Architecture**:
   - Multilingual support (RU/HE/EN)
   - Component-based content system (text, dropdown, link types)
   - Real-time editing with ContentEditModals
   - Database-driven content from `bankim_content` PostgreSQL
   - **Application Context System**: Tab navigation for 4 distinct contexts

6. **Tab Navigation System**:
   - Added to all content list pages (CSS selector: `.tab-navigation`)
   - 4 context tabs matching database application contexts
   - Visual design based on `devHelp/contentMenu/cssPages/types.md`
   - Active/inactive states with hover effects
   - Responsive mobile stacking layout

## Database Architecture

The system uses multiple PostgreSQL databases:
- **bankim_content**: UI content and translations (see detailed schema below)
- **bankim_core**: Business logic, formulas, permissions
- **bankim_management**: Portal-specific data

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

- TypeScript strict mode enabled
- No test framework currently configured
- API URL configuration via environment variables (see env.template)
- Content caching implemented with 5-minute TTL
- Mock data fallback for offline development
- Port 3002 for frontend, 3001 for backend API

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
1. Create component in `src/pages/Content{Name}/`
2. Add route in `App.tsx` with ProtectedRoute wrapper
3. Update SharedMenu with navigation item
4. Implement API calls using `apiService`

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