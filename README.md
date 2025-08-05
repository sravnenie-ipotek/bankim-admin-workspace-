# 🏗️ BankIM Management Portal

A modern monorepo for the BankIM Management Portal with clear separation between frontend, backend, and shared code.

## 📁 Project Structure

```
bankIM_management_portal/
├── packages/
│   ├── client/                 # Frontend React app
│   │   ├── src/               # React components & pages
│   │   ├── public/            # Static assets
│   │   ├── cypress/           # E2E tests
│   │   ├── devHelp/           # Development documentation
│   │   └── package.json       # Frontend dependencies
│   ├── server/                # Backend Node.js API
│   │   ├── server.js          # Main server
│   │   ├── database/          # Database scripts
│   │   ├── logs/              # Server logs
│   │   └── package.json       # Backend dependencies
│   └── shared/                # Shared types & utilities
│       ├── src/types/         # TypeScript interfaces
│       └── package.json       # Shared package config
├── docs/                      # Project documentation
├── scripts/                   # Utility scripts
├── tools/                     # Development tools
├── tests/                     # Test files
├── assets/                    # Images and assets
├── package.json               # Root workspace config
└── turbo.json                 # Build system
```

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start all packages in development
npm run dev

# Or start individual packages
cd packages/client && npm run dev    # Frontend only
cd packages/server && npm run dev    # Backend only
```

### Build
```bash
# Build all packages
npm run build

# Build individual packages
npm run build --workspace=@bankim/client
npm run build --workspace=@bankim/server
npm run build --workspace=@bankim/shared
```

### Testing
```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=@bankim/client
```

## 📦 Packages

### `@bankim/client` - Frontend
- **React 18** + **TypeScript** + **Vite**
- **Multi-language support** (RU, EN, HE)
- **Content management interface**
- **Responsive design**

### `@bankim/server` - Backend
- **Node.js** + **Express** + **PostgreSQL**
- **Content management API**
- **Authentication & authorization**
- **Database migrations**

### `@bankim/shared` - Shared Code
- **TypeScript interfaces** for API contracts
- **Business logic** and calculations
- **Validation schemas**
- **Constants and utilities**

## 🔧 Development

### Team Workflow
- **Frontend Team**: Works in `packages/client/`
- **Backend Team**: Works in `packages/server/`
- **Architecture Team**: Manages `packages/shared/`

### Adding Dependencies
```bash
# Add to specific package
npm install lodash --workspace=@bankim/client
npm install express --workspace=@bankim/server

# Add to shared package
npm install zod --workspace=@bankim/shared
```

### Shared Code Usage
```typescript
// In client or server
import { ApiResponse, ContentItem } from '@bankim/shared';

const response: ApiResponse<ContentItem> = await fetch('/api/content');
```

## 📚 Documentation

- **Setup Guide**: `docs/QUICK_START_GUIDE.md`
- **Deployment**: `docs/RAILWAY_DEPLOYMENT.md`
- **Database**: `docs/DATABASE_SETUP_GUIDE.md`
- **API Documentation**: `docs/REPOSITORIES_README.md`

## 🛠️ Tools

- **Turborepo**: Incremental builds and caching
- **TypeScript**: Type safety across packages
- **ESLint**: Code linting
- **Cypress**: E2E testing

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by the BankIM Development Team** 