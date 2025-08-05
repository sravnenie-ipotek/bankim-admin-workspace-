# Shared Package Guide

## 🎯 Overview

The `@bankim/shared` package contains shared TypeScript types and utilities used across the BankIM Management Portal ecosystem. It's published to GitHub and can be used in any project.

## 📦 Package Information

- **Package Name**: `@bankim/shared`
- **GitHub Repository**: https://github.com/MichaelMishaev/bankimOnlineAdmin_shared
- **Current Version**: `0.1.0`
- **Published**: ✅ Yes

## 🚀 Installation

### In Local Development (Monorepo)
The shared package is already linked in your monorepo:
```bash
# No installation needed - already linked
npm list @bankim/shared
```

### In External Projects
```bash
npm install git+https://github.com/MichaelMishaev/bankimOnlineAdmin_shared.git
```

## 📋 Available Types

### API Types (`src/types/api.ts`)
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}
```

### Content Types (`src/types/content.ts`)
```typescript
export interface ContentTranslation {
  language_code: string;
  content_value: string;
  status: string;
  is_default: boolean;
}

export interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: Record<string, string> | ContentTranslation[];
}
```

## 💻 Usage Examples

### In Frontend (Client)
```typescript
// packages/client/src/services/api.ts
import { ApiResponse, ContentItem } from '@bankim/shared';

export const fetchMenuContent = async (): Promise<ApiResponse<ContentItem[]>> => {
  const response = await fetch('/api/content/menu');
  return response.json();
};
```

### In Backend (Server)
```typescript
// packages/server/routes/content.ts
import { ApiResponse, ContentItem } from '@bankim/shared';

app.get('/api/content/menu', async (req, res) => {
  const response: ApiResponse<ContentItem[]> = {
    success: true,
    data: menuItems,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});
```

## 🔧 Development Workflow

### 1. Making Changes to Shared Types
```bash
cd packages/shared
# Edit files in src/types/
code src/types/api.ts
code src/types/content.ts
```

### 2. Building the Package
```bash
cd packages/shared
npm run build
```

### 3. Publishing to GitHub
```bash
cd packages/shared
./scripts/publish.sh
```

### 4. Using Updated Types
After publishing, other projects can update:
```bash
npm update @bankim/shared
```

## 📁 File Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── api.ts          # API response/request interfaces
│   │   ├── content.ts      # Content management types
│   │   └── index.ts        # Type exports
│   └── index.ts            # Main package exports
├── dist/                   # Built JavaScript files
├── scripts/
│   └── publish.sh          # Publish script
├── package.json            # Package configuration
└── README.md              # Package documentation
```

## 🔄 Version Management

### Current Version
- **Version**: `0.1.0`
- **Tag**: `v0.1.0`
- **Status**: Published to GitHub

### Updating Version
```bash
cd packages/shared
# Edit package.json version
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

### Publishing New Version
```bash
cd packages/shared
./scripts/publish.sh
```

## 🛠️ Scripts

### Available Scripts
```bash
npm run build        # Build TypeScript to JavaScript
npm run dev          # Watch mode for development
npm run test         # Run tests (placeholder)
npm run lint         # Run linting (placeholder)
npm run type-check   # TypeScript type checking
npm run clean        # Clean dist directory
```

### Publish Script
```bash
./scripts/publish.sh  # Build and publish to GitHub
```

## 🔗 Integration with Local Development

### Hot Reload
The shared package is included in your local development environment:

1. **Frontend**: http://localhost:4002 (uses shared types)
2. **Backend**: http://localhost:4000 (uses shared types)
3. **Shared**: Automatically built and linked

### Development Flow
```bash
# 1. Start local development
./scripts/start-local-dev.sh

# 2. Make changes to shared types
code packages/shared/src/types/api.ts

# 3. Build shared package
cd packages/shared && npm run build

# 4. See changes immediately in frontend/backend
# (Hot reload will pick up the changes)
```

## 🎯 Best Practices

### 1. Type Safety
- Always use shared types for API responses
- Keep types consistent across frontend and backend
- Use TypeScript strict mode

### 2. Version Management
- Increment version when adding new types
- Use semantic versioning
- Tag releases on GitHub

### 3. Documentation
- Document new types with JSDoc comments
- Update README.md when adding features
- Include usage examples

### 4. Testing
- Test types with real data
- Ensure backward compatibility
- Validate API responses match types

## 🚨 Troubleshooting

### Common Issues

**1. Types not updating in other packages**
```bash
# Rebuild shared package
cd packages/shared && npm run build

# Restart development servers
./scripts/stop-local-dev.sh
./scripts/start-local-dev.sh
```

**2. GitHub repository not found**
```bash
# Check remote configuration
cd packages/shared
git remote -v

# Add remote if missing
git remote add shared git@github.com:MichaelMishaev/bankimOnlineAdmin_shared.git
```

**3. Build errors**
```bash
# Clean and rebuild
cd packages/shared
npm run clean
npm run build
```

## 📞 Support

- **Repository**: https://github.com/MichaelMishaev/bankimOnlineAdmin_shared
- **Issues**: Create issues in the GitHub repository
- **Documentation**: See README.md in the shared package 