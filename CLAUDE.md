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

## Database Architecture

The system uses multiple PostgreSQL databases:
- **bankim_content**: UI content and translations
- **bankim_core**: Business logic, formulas, permissions
- **bankim_management**: Portal-specific data

Backend API connects to these databases and provides endpoints for content management.

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

### State Management
- Using React Context for auth (`AuthContext`)
- Navigation state via `NavigationContext`
- No Redux/MobX - local component state preferred