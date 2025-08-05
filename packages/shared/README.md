# 🔧 BankIM Management Portal - Shared Package

**TypeScript types and utilities shared across the BankIM Management Portal ecosystem.**

## 📋 Package Overview

This package provides the foundational TypeScript interfaces, types, and utilities that ensure type safety and consistency across the entire BankIM Management Portal ecosystem. It serves as the single source of truth for data structures, API contracts, and common utility functions used by both client and server applications.

## 🏗️ Multi-Repository Architecture

This shared package is part of a **multi-repository monorepo ecosystem**:

```
🏦 BankIM Management Portal Ecosystem  
├── 🏠 Main Repository        (bankimOnlineAdmin.git)
│   └── Development coordination, scripts, documentation
├── 🖥️ Client Repository      (bankimOnlineAdmin_client.git)
│   └── React/TypeScript Frontend → Uses @bankim/shared
├── 🔧 Shared Repository      (THIS REPO - bankimOnlineAdmin_shared.git) 
│   └── TypeScript Types & Utilities → Consumed by all packages
└── ⚙️  Server Infrastructure  (Separate deployment)
    └── Node.js/Express API → Uses @bankim/shared
```

### Package Relationships
- **Consumed by**: Client application and server API
- **Provides**: TypeScript interfaces, utility types, validation schemas
- **Versioned**: Semantic versioning with automated publishing
- **Synchronized**: Maintained in sync with main repository

## 🚀 Installation & Usage

### Package Installation
```bash
# Install as dependency in client/server projects
npm install @bankim/shared

# For development/contribution
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_shared.git
cd bankimOnlineAdmin_shared
npm install
```

### Basic Usage
```typescript
// Import shared types
import { ContentItem, APIResponse, UserRole } from '@bankim/shared';

// Use in your application
const content: ContentItem = {
  id: 'mortgage-1',
  type: 'mortgage', 
  title: { ru: 'Ипотека', he: 'משכנתא', en: 'Mortgage' },
  content: { /* mortgage-specific data */ },
  status: 'published',
  metadata: { /* content metadata */ },
  createdAt: new Date(),
  updatedAt: new Date()
};

// API response typing
const response: APIResponse<ContentItem[]> = {
  success: true,
  data: [content],
  metadata: { total: 1, page: 1, limit: 10 }
};
```

## 📦 Package Structure

```
src/
├── types/
│   ├── api.ts          # API request/response interfaces
│   ├── content.ts      # Content management types  
│   └── index.ts        # Consolidated type exports
├── utils/              # Utility functions (planned)
└── index.ts            # Main package entry point

dist/                   # Compiled TypeScript output
├── types/
│   ├── api.d.ts        # API type declarations
│   ├── api.js          # API type implementations
│   ├── content.d.ts    # Content type declarations
│   ├── content.js      # Content type implementations
│   └── index.d.ts      # Main type declarations
└── index.js            # Main package export
```

## 🎯 Type System Architecture

### Core Type Categories

#### 1. Content Management Types (`content.ts`)
Defines the structure for all content in the BankIM system:

```typescript
// Content type enumeration
export type ContentType = 
  | 'mortgage' 
  | 'credit' 
  | 'general' 
  | 'menu' 
  | 'mortgage-refi' 
  | 'credit-refi';

// Content status lifecycle
export type ContentStatus = 'draft' | 'published' | 'archived';

// Supported locales
export type SupportedLocale = 'ru' | 'he' | 'en';

// Localized string structure for multilingual content
export type LocalizedString = {
  [K in SupportedLocale]: string;
};

// Core content item interface
export interface ContentItem<T = Record<string, any>> {
  id: string;
  type: ContentType;
  title: LocalizedString;
  content: T;
  status: ContentStatus;
  metadata: ContentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Content metadata for tracking and SEO
export interface ContentMetadata {
  author: string;
  tags: string[];
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  lastModifiedBy: string;
  version: number;
}
```

#### 2. API Contract Types (`api.ts`)
Standardizes all API communication across the system:

```typescript
// Standard API response wrapper
export interface APIResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  error?: APIError;
  metadata?: ResponseMetadata;
}

// Error structure for consistent error handling
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;  // For validation errors
}

// Pagination and metadata
export interface ResponseMetadata {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// User authentication and roles
export type UserRole = 
  | 'director'
  | 'administration'
  | 'content-manager'
  | 'sales-manager'
  | 'brokers'
  | 'employee';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date;
}
```

### Advanced Type Patterns

#### Generic Content Types
```typescript
// Type-safe content data based on content type
export type ContentFormData<T extends ContentType> = 
  T extends 'mortgage' ? MortgageContentData :
  T extends 'credit' ? CreditContentData :
  T extends 'general' ? GeneralContentData :
  T extends 'menu' ? MenuContentData :
  T extends 'mortgage-refi' ? MortgageRefiContentData :
  T extends 'credit-refi' ? CreditRefiContentData :
  never;

// Utility type for making specific fields required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial for nested object updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

#### Financial Calculation Types
```typescript
// Mortgage calculation parameters
export interface MortgageCalculationParams {
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  propertyTax?: number;
  homeInsurance?: number;
  pmi?: number;
}

// Calculation results with detailed breakdown
export interface MortgageCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  paymentBreakdown: PaymentBreakdown;
  amortizationSchedule: AmortizationEntry[];
}

// Number range for configuration
export type NumberRange = {
  min: number;
  max: number;
  default: number;
  step?: number;
};
```

## 🛠️ Development Workflow

### Building the Package
```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npm run dev

# Type checking without compilation
npm run type-check

# Clean build artifacts
npm run clean
```

### Package Scripts
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json", 
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist",
    "test": "echo 'No tests yet'",
    "lint": "echo 'No linting yet'"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 📚 Type Documentation

### Content Management Types

#### ContentItem Interface
The core interface for all content in the system:

```typescript
interface ContentItem<T = Record<string, any>> {
  id: string;                    // Unique identifier
  type: ContentType;             // Content category  
  title: LocalizedString;        // Multilingual title
  content: T;                    // Type-specific content data
  status: ContentStatus;         // Publication status
  metadata: ContentMetadata;     // SEO and tracking data
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last modification timestamp
}
```

**Usage Examples:**
```typescript
// Mortgage content with type-safe data
const mortgageContent: ContentItem<MortgageContentData> = {
  id: 'mortgage-calc-1',
  type: 'mortgage',
  title: {
    ru: 'Калькулятор ипотеки',
    he: 'מחשבון משכנתא', 
    en: 'Mortgage Calculator'
  },
  content: {
    loanAmount: { min: 100000, max: 2000000, default: 500000 },
    interestRate: { min: 2.5, max: 15.0, default: 4.5 },
    termYears: [15, 20, 25, 30]
  },
  status: 'published',
  metadata: {
    author: 'content-admin',
    tags: ['mortgage', 'calculator', 'loan'],
    version: 1,
    lastModifiedBy: 'system'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};
```

### API Response Types

#### APIResponse Interface
Standardized response wrapper for all API endpoints:

```typescript
interface APIResponse<TData = unknown> {
  success: boolean;              // Operation success indicator
  data?: TData;                 // Response payload (if successful)
  error?: APIError;             // Error details (if failed)
  metadata?: ResponseMetadata;   // Pagination and additional info
}
```

**Usage Examples:**
```typescript
// Successful response with data
const successResponse: APIResponse<ContentItem[]> = {
  success: true,
  data: [mortgageContent],
  metadata: {
    total: 25,
    page: 1, 
    limit: 10,
    hasMore: true
  }
};

// Error response
const errorResponse: APIResponse = {
  success: false,
  error: {
    code: 'CONTENT_NOT_FOUND',
    message: 'The requested content item was not found',
    details: { contentId: 'invalid-id' }
  }
};
```

## 🔧 Utility Types

### Common Utility Types
```typescript
// Make specific fields required
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial for nested updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract keys of specific type
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Non-empty array type
type NonEmptyArray<T> = [T, ...T[]];
```

### Domain-Specific Utilities
```typescript
// Content creation payload (omit system fields)  
type CreateContentRequest<T extends ContentType> = Omit<
  ContentItem<ContentFormData<T>>, 
  'id' | 'createdAt' | 'updatedAt' | 'metadata'
> & {
  metadata?: Partial<ContentMetadata>;
};

// Content update payload (partial with required ID)
type UpdateContentRequest<T extends ContentType> = RequiredFields<
  DeepPartial<ContentItem<ContentFormData<T>>>,
  'id'
>;
```

## 🧪 Type Validation

### Runtime Type Guards
```typescript
// Content type validation
export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && 
    ['mortgage', 'credit', 'general', 'menu', 'mortgage-refi', 'credit-refi']
      .includes(value);
}

// Localized string validation
export function isLocalizedString(value: unknown): value is LocalizedString {
  if (!value || typeof value !== 'object') return false;
  
  const supportedLocales: SupportedLocale[] = ['ru', 'he', 'en'];
  return supportedLocales.every(locale => 
    locale in value && typeof (value as any)[locale] === 'string'
  );
}

// API response validation
export function isAPIResponse<T>(
  value: unknown,
  dataValidator?: (data: unknown) => data is T
): value is APIResponse<T> {
  if (!value || typeof value !== 'object') return false;
  
  const response = value as any;
  if (typeof response.success !== 'boolean') return false;
  
  if (response.success && response.data !== undefined) {
    return !dataValidator || dataValidator(response.data);
  }
  
  if (!response.success && response.error) {
    return typeof response.error.code === 'string' &&
           typeof response.error.message === 'string';
  }
  
  return true;
}
```

## 📦 Package Publishing

### Version Management
```bash
# Update version (follows semantic versioning)
npm version patch    # Bug fixes
npm version minor    # New features
npm version major    # Breaking changes

# Build and prepare for publishing
npm run build

# Publish to npm (automated via CI/CD)
npm publish
```

### Automated Publishing
The package is automatically published when:
1. **Version tag** is created in the main repository
2. **CI/CD pipeline** builds and tests the package
3. **Automated publish** to npm registry
4. **Dependent packages** are notified of updates

## 🔄 Integration with Client/Server

### Client Integration (React/TypeScript)
```typescript
// In client application
import { ContentItem, APIResponse } from '@bankim/shared';

// Component props with shared types
interface ContentTableProps {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string) => void;
}

// API service with type safety
class ContentService {
  async getContent(): Promise<APIResponse<ContentItem[]>> {
    const response = await fetch('/api/content');
    return response.json();
  }
}
```

### Server Integration (Node.js/Express)
```typescript
// In server application
import { ContentItem, APIResponse, CreateContentRequest } from '@bankim/shared';

// Express route handlers with shared types
app.get('/api/content', async (req, res): Promise<APIResponse<ContentItem[]>> => {
  try {
    const content = await ContentRepository.findAll();
    return res.json({
      success: true,
      data: content,
      metadata: { total: content.length }
    });
  } catch (error) {
    return res.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
});
```

## 🔐 Type Safety Best Practices

### Strict TypeScript Configuration
- **Strict mode** enabled for maximum type safety
- **No implicit any** to prevent type holes
- **Strict null checks** for null/undefined safety
- **No unchecked indexed access** for array/object safety

### Interface Design Principles
- **Composition over inheritance** for type reusability
- **Generic constraints** for flexible but safe types
- **Discriminated unions** for type narrowing
- **Branded types** for domain-specific primitives

### Backward Compatibility
- **Semantic versioning** for breaking changes
- **Deprecated fields** marked with JSDoc @deprecated
- **Migration guides** for major version updates
- **Runtime checks** for data validation

## 🚦 Quality Assurance

### Type Testing
```typescript
// Compile-time type tests
type TestContentItem = ContentItem extends { id: string } ? true : false;
type TestAPIResponse = APIResponse<string> extends { success: boolean } ? true : false;

// Runtime validation tests
describe('Type Guards', () => {
  test('isContentType validates correctly', () => {
    expect(isContentType('mortgage')).toBe(true);
    expect(isContentType('invalid')).toBe(false);
  });
});
```

### Documentation Standards
- **JSDoc comments** for all public interfaces
- **Usage examples** in interface documentation
- **Type constraints** clearly documented
- **Breaking changes** highlighted in changelogs

## 🤝 Contributing

### Development Setup
```bash
# Clone the repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_shared.git
cd bankimOnlineAdmin_shared

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Adding New Types
1. **Define interface** in appropriate type file
2. **Export from index** to make publicly available
3. **Add type guards** for runtime validation
4. **Update documentation** with usage examples
5. **Add tests** for type validation
6. **Update version** following semantic versioning

### Code Standards
- **TypeScript strict mode** compliance
- **Interface documentation** with JSDoc
- **Consistent naming** following project conventions
- **Export organization** through index files
- **Backward compatibility** for existing interfaces

## 📞 Support

### Getting Help
- **GitHub Issues** - Type definition bugs and feature requests
- **Main Repository** - Project-wide questions and coordination
- **Type Documentation** - Comprehensive JSDoc comments
- **Usage Examples** - Reference implementations in dependent packages

### Common Issues
- **Type Conflicts** - Ensure consistent package versions across projects
- **Missing Types** - Check if types are properly exported from index files
- **Build Errors** - Verify TypeScript configuration compatibility
- **Runtime Validation** - Use provided type guards for external data

## 📄 License

This package is proprietary software developed for BankIM services. All rights reserved.

**Copyright © 2024 BankIM Development Team**

---

## 🔗 Related Repositories

- **[Main Repository](https://github.com/MichaelMishaev/bankimOnlineAdmin)** - Complete project coordination
- **[Client Application](https://github.com/MichaelMishaev/bankimOnlineAdmin_client)** - React/TypeScript frontend
- **Server Infrastructure** - Backend API services (separate deployment)

**💡 Note**: This package provides the type foundation for the entire BankIM ecosystem. Changes here affect all dependent packages, so maintain backward compatibility and follow semantic versioning strictly.

---

**📋 Current Version**: 0.1.0 | **📦 Package Name**: @bankim/shared | **🔄 Auto-sync**: Enabled