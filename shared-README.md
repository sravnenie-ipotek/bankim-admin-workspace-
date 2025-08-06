# 📚 BankIM Admin Shared - Package Distribution Repository

**Shared TypeScript types and utilities for the BankIM Management Portal ecosystem**

---

## 🎯 Repository Overview

**Repository**: `bankim-admin-shared`  
**URL**: `git@github.com:sravnenie-ipotek/bankim-admin-shared.git`  
**Type**: Package Distribution Repository  
**Purpose**: Git-based NPM package providing shared TypeScript types and utilities  
**Role**: Dependency for both frontend and backend deployment repositories  

---

## 🏗️ Architecture Position

This repository serves as the **shared dependency hub** in our 4-repository hybrid architecture:

```
DEVELOPMENT LAYER
┌─────────────────────────────────────────────────────────┐
│  🏠 bankim-admin-workspace (Development Monorepo)      │
│  Contains: packages/shared + client + server + docs    │
└─────────────────────┬───────────────────────────────────┘
                      │ Automated Deployment
                      ▼
DISTRIBUTION LAYER
┌─────────────────────────────────────────────────────────┐
│  📚 bankim-admin-shared (THIS REPOSITORY)              │
│  Contains: TypeScript types + utilities + compiled JS  │
│  Purpose: Git-based NPM package distribution           │
└───────────────────┬─────────────────┬───────────────────┘
                    │                 │
         Git Dependency        Git Dependency
                    ▼                 ▼
DEPLOYMENT LAYER
┌─────────────────────────────────────────────────────────┐
│  🎨 Dashboard              🔧 API Server                │
│  Uses: @bankim/shared      Uses: @bankim/shared         │
│  Types: ContentItem        Types: ContentItem (JSDoc)   │
│  Utils: getTranslation     Utils: getTranslation        │
└─────────────────────────────────────────────────────────┘
```

### Distribution Strategy
- **Source**: Receives filtered content from `packages/shared/` in workspace
- **Versioning**: Semantic versioning with git tags (`v1.0.0`, `v1.1.0`, etc.)
- **Distribution**: Git-based NPM package (no registry publishing)
- **Consumption**: Frontend and backend import via git+https URLs

---

## 📦 Repository Contents

This repository contains **only** the shared package with optimized distribution:

```
bankim-admin-shared/
├── 📁 src/                         # TypeScript source code
│   ├── types/                      # Type definitions
│   │   ├── content.ts              # Content management interfaces
│   │   ├── api.ts                  # API response interfaces
│   │   └── index.ts                # Type exports
│   │
│   ├── utils/                      # Utility functions
│   │   ├── contentUtils.ts         # Content helper functions
│   │   ├── typeUtils.ts            # Type guard utilities
│   │   └── index.ts                # Utility exports
│   │
│   └── index.ts                    # Main package exports
│
├── 📁 dist/                        # Compiled distribution
│   ├── types/                      # Compiled type definitions
│   │   ├── content.js              # Compiled content types
│   │   ├── content.d.ts            # TypeScript declarations
│   │   ├── api.js                  # Compiled API types
│   │   ├── api.d.ts                # TypeScript declarations
│   │   └── index.js, index.d.ts    # Compiled exports
│   │
│   ├── utils/                      # Compiled utilities
│   │   ├── contentUtils.js         # Compiled helper functions
│   │   ├── contentUtils.d.ts       # TypeScript declarations
│   │   ├── typeUtils.js            # Compiled type guards
│   │   ├── typeUtils.d.ts          # TypeScript declarations
│   │   └── index.js, index.d.ts    # Compiled exports
│   │
│   └── index.js, index.d.ts        # Main compiled exports
│
├── ⚙️ Configuration Files
│   ├── package.json                # Package metadata & dependencies
│   ├── tsconfig.json               # TypeScript compilation config
│   └── .gitignore                  # Git exclusions
│
├── 📄 Documentation
│   ├── README.md                   # This documentation
│   └── CHANGELOG.md                # Version change history
│
└── 🏷️ Version Tags                 # Git tags for versioning
    ├── v1.0.0                      # Initial release
    ├── v1.1.0                      # Feature additions
    └── v1.x.x                      # Future versions
```

---

## 🔗 Package Architecture

### Core Type Definitions

#### **Content Management Types**
```typescript
// src/types/content.ts
export interface ContentItem {
  id: string | number;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: Record<string, string> | ContentTranslation[];
  page_number?: number;
  action_count?: number;
  drill_action_count?: number;
}

export interface ContentTranslation {
  id?: number;
  content_id?: number;
  language_code: string;
  content_value: string;
  status?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DropdownOption {
  id: number;
  content_id: number;
  option_value: string;
  option_key: string;
  display_text: Record<string, string>;
  created_at: string;
  updated_at: string;
}
```

#### **API Response Types**
```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ContentApiResponse {
  count: number;
  totalCount: number;
  status: string;
  message?: string;
  data: any[];
  error?: string;
  actions?: any[];
  dropdownOptions?: any[];
}

export interface ContentPageAction {
  id: string;
  title: string;
  button_text: string;
  action_type: 'drill' | 'text' | 'dropdown' | 'calculate';
  component_type: string;
  category: string;
  screen_location: string;
  page_number?: number;
  url?: string;
  is_active: boolean;
}
```

### Utility Functions

#### **Content Helper Functions**
```typescript
// src/utils/contentUtils.ts
/**
 * Extract translation value for a specific language
 */
export function getTranslation(
  translations: Record<string, string> | ContentTranslation[],
  language: string,
  fallback = ''
): string {
  if (Array.isArray(translations)) {
    const translation = translations.find(t => t.language_code === language);
    return translation?.content_value || fallback;
  }
  return translations[language] || fallback;
}

/**
 * Check if content item is valid and active
 */
export function isValidContent(item: ContentItem | null | undefined): item is ContentItem {
  return !!(item && item.id && item.is_active);
}

/**
 * Format content key for display purposes
 */
export function formatContentKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}
```

#### **Type Guard Utilities**
```typescript
// src/utils/typeUtils.ts
/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): value is string {
  return isDefined(value) && value.trim().length > 0;
}

/**
 * Safe number parsing that returns undefined for invalid numbers
 */
export function safeParseInt(value: string | number | null | undefined): number | undefined {
  if (!isDefined(value)) return undefined;
  
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(parsed) ? undefined : parsed;
}
```

---

## 🚀 Distribution Strategy

### Git-Based NPM Package
This repository functions as a **git-based NPM package** without registry publishing:

```json
// How it's consumed in deployment repositories
{
  "dependencies": {
    "@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git"
  }
}
```

### Version Management
```bash
# Semantic versioning with git tags
v1.0.0    # Initial release - basic types
v1.1.0    # Feature additions - utility functions
v1.1.1    # Bug fixes - type corrections
v1.2.0    # New features - additional interfaces
```

### Automated Deployment Process
```bash
# From bankim-admin-workspace repository:
npm run push:shared                 # Deploy shared package only
npm run push:all                    # Deploy all repositories including shared
```

### What Happens During Deployment
1. **Content Filtering**: Extracts `packages/shared/` from workspace
2. **TypeScript Compilation**: Builds distribution with `tsc`
3. **Package Optimization**: Creates production-ready package.json
4. **Version Tagging**: Creates semantic version tags for releases
5. **Git Operations**: Commits and pushes compiled distribution
6. **Registry Update**: Updates git-based package availability

---

## 📦 Package Consumption

### Frontend Usage (React + TypeScript)
```typescript
// In dashboard repository (bankim-admin-dashboard)
import { 
  ContentItem, 
  ContentTranslation, 
  ApiResponse,
  getTranslation,
  isValidContent 
} from '@bankim/shared';

// Type-safe API responses
interface ContentResponse extends ApiResponse<ContentItem[]> {}

// Using utility functions
const russianText = getTranslation(item.translations, 'ru', 'Default text');
if (isValidContent(contentItem)) {
  // TypeScript knows contentItem is valid and active
  console.log(contentItem.content_key);
}
```

### Backend Usage (Node.js + JavaScript with JSDoc)
```javascript
// In api repository (bankim-admin-api)
/**
 * @typedef {import('@bankim/shared').ContentItem} ContentItem
 * @typedef {import('@bankim/shared').ApiResponse} ApiResponse
 */

const { getTranslation, isValidContent } = require('@bankim/shared');

/**
 * Get content with type safety
 * @param {string} screenLocation 
 * @param {string} language 
 * @returns {Promise<ApiResponse<ContentItem[]>>}
 */
async function getContentByScreen(screenLocation, language) {
  const results = await db.query(/* SQL query */);
  
  return {
    success: true,
    data: results.rows.filter(isValidContent) // Type-safe filtering
  };
}
```

---

## 🔧 Development & Maintenance

### Local Development (Not Recommended)
While possible, development should happen in the workspace repository:

```bash
# If you must develop locally (not recommended):
git clone git@github.com:sravnenie-ipotek/bankim-admin-shared.git
cd bankim-admin-shared
npm install
npm run build                   # Compile TypeScript
npm run dev                     # Watch mode for development
```

### Build Process
```bash
# TypeScript compilation (happens automatically during deployment)
npm run build                   # Compile src/ to dist/ with type definitions
npm run dev                     # Watch mode - rebuilds on file changes

# Manual testing
npm run type-check              # TypeScript validation without compilation
npm run clean                   # Remove dist/ folder
```

### Testing Integration
```bash
# Test package in dependent projects
cd ../bankim-admin-dashboard
npm install                     # Should pull from git repository
npm run type-check              # Should pass with shared types

cd ../bankim-admin-api  
npm install                     # Should pull from git repository
node -e "console.log(require('@bankim/shared'))" # Should load successfully
```

---

## 🔄 Version Management

### Semantic Versioning Strategy
```yaml
Major Version (v2.0.0): Breaking changes - interface modifications, removed functions
Minor Version (v1.1.0): New features - additional types, new utility functions  
Patch Version (v1.0.1): Bug fixes - type corrections, utility improvements
```

### Release Process
```bash
# Automated during deployment from workspace
npm run push:shared             # Automatically increments version and creates tags

# Version is determined by:
# - MAJOR: Breaking changes to existing interfaces
# - MINOR: New interfaces or utility functions added
# - PATCH: Bug fixes or improvements to existing code
```

### Version History Tracking
```bash
# View version history
git tag --list                  # List all version tags
git log --oneline --decorate    # Commit history with version tags
git show v1.1.0                 # Show specific version changes

# Compare versions
git diff v1.0.0..v1.1.0        # Changes between versions
git log v1.0.0..v1.1.0 --oneline # Commits between versions
```

### Dependency Version Pinning
```json
// In consuming repositories, you can pin to specific versions:
{
  "dependencies": {
    "@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git#v1.1.0"
  }
}

// Or use branch/tag references:
{
  "dependencies": {
    "@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git#main"
  }
}
```

---

## 🚨 Critical Usage Guidelines

### ✅ **Correct Usage**

#### **For Frontend Developers**
- **Import types and utilities** using ES6 import syntax
- **Use type guards** for runtime type checking
- **Leverage utility functions** for common operations
- **Keep TypeScript strict mode** enabled for maximum type safety

#### **For Backend Developers**
- **Use JSDoc type imports** for JavaScript projects
- **Import utility functions** using CommonJS require
- **Apply type guards** for data validation
- **Document function parameters** with imported types

#### **For Package Consumers**
- **Pin to specific versions** in production environments
- **Update regularly** to get latest type definitions
- **Test after updates** to ensure compatibility
- **Report issues** if types don't match runtime behavior

### ❌ **Incorrect Usage**

#### **Don't Develop Here Directly**
- **❌ Don't make direct changes** to this repository
- **❌ Don't add new features** without workspace integration
- **❌ Don't modify package.json** or build configuration
- **❌ Don't create manual releases** or version tags

#### **Don't Break Compatibility**
- **❌ Don't modify existing interfaces** without considering impact
- **❌ Don't remove utility functions** that other packages depend on
- **❌ Don't change function signatures** without major version bump
- **❌ Don't introduce runtime dependencies** without careful consideration

### 🔄 **If You Need Changes**
1. **Make changes in workspace**: `bankim-admin-workspace/packages/shared/`
2. **Test thoroughly**: Ensure TypeScript compilation and runtime behavior
3. **Validate consumers**: Check that frontend and backend still work
4. **Deploy from workspace**: `npm run push:shared`
5. **Update consumers**: Ensure dependent repositories get updates
6. **Test integration**: Validate that all packages work together

---

## 🔍 Monitoring & Health

### Package Health Monitoring
```bash
# Check package integrity
npm install                     # Should install without errors
npm run build                   # Should compile successfully
npm run type-check              # Should pass TypeScript validation

# Validate exports
node -e "console.log(Object.keys(require('./dist')))" # Should show all exports
node -e "console.log(require('./package.json').version)" # Show current version
```

### Consumer Health Monitoring
```bash
# Check how package is being used
npm ls @bankim/shared           # Show where package is installed
npm outdated @bankim/shared     # Check if updates available (won't apply to git packages)

# Test consumer integration
cd ../bankim-admin-dashboard
npm run type-check              # Should pass with shared types
cd ../bankim-admin-api
node -c server.js               # Should syntax-check with shared imports
```

### Performance Considerations
- **Bundle Size**: Monitor dist/ folder size - keep minimal
- **Compilation Time**: Track TypeScript build duration
- **Type Check Performance**: Monitor how package affects consumer build times
- **Runtime Performance**: Ensure utility functions are optimized

---

## 📊 Repository Metrics

```yaml
Repository Type: Package Distribution (Git-based NPM)
Primary Purpose: Shared TypeScript types and utilities
Source Repository: bankim-admin-workspace
Update Frequency: As needed with semantic versioning

Technical Specifications:
  Language: TypeScript (compiled to JavaScript + .d.ts)
  Distribution: Git-based package (no NPM registry)
  Versioning: Semantic versioning with git tags
  Dependencies: Zero runtime dependencies
  Output: ES modules + CommonJS + TypeScript declarations

Package Specifications:  
  Build Output: dist/ folder with compiled code and type definitions
  Consumer Support: Both TypeScript and JavaScript projects
  Type Safety: Full TypeScript support with strict mode
  Runtime: Node.js 18+ and modern browsers
  Bundle Size: <50KB (estimated, types and utilities only)
```

---

## 🔗 Related Repositories

| Repository | Relationship | Usage |
|------------|-------------|-------|
| **bankim-admin-workspace** | 📤 Source | Development environment and deployment trigger |
| **bankim-admin-dashboard** | 📥 Consumer | Imports types and utilities for React frontend |
| **bankim-admin-api** | 📥 Consumer | Imports types and utilities for Node.js backend |

### Consumer Integration Matrix
```yaml
Frontend Consumer (React + TypeScript):
  Import Style: ES6 imports
  Type Usage: Full TypeScript interface support  
  Utilities: Direct function imports
  Build Integration: Vite bundles automatically

Backend Consumer (Node.js + JavaScript):
  Import Style: CommonJS require or ES6 imports
  Type Usage: JSDoc type imports for documentation
  Utilities: Direct function imports
  Runtime: Node.js modules loaded at runtime
```

---

## 📞 Quick Reference

### Essential Information
```yaml
Repository URL: git@github.com:sravnenie-ipotek/bankim-admin-shared.git
Primary Purpose: Shared TypeScript types and utilities distribution
Update Method: Automated from bankim-admin-workspace
Development Location: bankim-admin-workspace/packages/shared/
Distribution: Git-based NPM package (no registry)
Consumption: git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git
```

### Package Installation
```bash
# In consuming projects (dashboard/api repositories):
npm install git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git

# Or specify in package.json:
"@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git"
```

### Common Imports
```typescript
// TypeScript/JavaScript imports
import { ContentItem, ApiResponse, getTranslation, isValidContent } from '@bankim/shared';

// JavaScript with JSDoc types
/** @typedef {import('@bankim/shared').ContentItem} ContentItem */
const { getTranslation } = require('@bankim/shared');
```

### Emergency Procedures
```bash
# Rollback to previous version
git reset --hard v1.0.0
git push --force-with-lease origin main

# Re-deploy from workspace (if this repo gets corrupted)
# From bankim-admin-workspace:
npm run push:shared --force

# Test package integrity
npm run build                   # Should compile without errors
npm run type-check              # Should pass TypeScript validation
```

---

**🎯 Bottom Line**: This repository provides shared TypeScript types and utilities that both the frontend and backend depend on. It's automatically maintained from the workspace repository and distributed as a git-based NPM package. Don't develop here directly - all changes should come from the workspace. Consumer projects reference this via git URLs in their package.json dependencies.

---

_**Architecture**: Package Distribution Repository in 4-Repository Strategy_  
_**Role**: Shared dependency providing types and utilities_  
_**Status**: Production-ready with automated versioning and deployment_