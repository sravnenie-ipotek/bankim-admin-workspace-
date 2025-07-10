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
```

## Architecture Overview

This is a standalone React TypeScript management portal for a banking system with role-based access control. It operates independently from the main production application (which runs on port 5173).

### Key Architectural Decisions

1. **Component Structure**: Components follow a pattern of `ComponentName.tsx` + `ComponentName.css` in the same directory. Shared components live in `src/components/` while page components are in `src/pages/`.

2. **Routing**: Uses React Router v6 with routes defined in `src/App.tsx`. The application has role-specific routes corresponding to 6 user roles:
   - Director (`/director`)
   - Administration (`/administration`)
   - Sales Manager (`/sales-manager`)
   - Bank Employee (`/bank-employee`)
   - Content Manager (`/content-manager`)
   - Brokers (`/brokers`)

3. **Layout Pattern**: All pages use the `AdminLayout` wrapper component which provides consistent structure with `SharedHeader` and `SharedMenu` components.

4. **TypeScript Usage**: Strict mode is enabled. All components should have typed props using interfaces. The project targets ES2020.

5. **Styling**: Uses plain CSS files with a dark theme. The application follows a color scheme with primary colors like `#6366F1` (purple) and dark backgrounds.

## Development Notes

- The application is configured to be accessible on the network (`host: true` in Vite config)
- No test framework is currently set up
- Axios is installed for API calls but not yet implemented
- No state management library is in use
- ESLint is configured with TypeScript support but no explicit config file exists