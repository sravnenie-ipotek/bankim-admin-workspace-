# @bankim/shared

Shared TypeScript types and utility functions used by both the **bankimOnlineAdmin_client** (frontend) and **bankimOnlineAdmin** (backend) repositories.

## Structure

```
shared/
├── src/
│   ├── types/
│   │   ├── api.ts          # Generic API response/request interfaces
│   │   ├── content.ts      # Content-management types
│   │   └── index.ts        # Types barrel
│   └── index.ts            # Package barrel
├── package.json            # npm workspace package configuration
└── tsconfig.json           # TypeScript compiler settings
```

## Usage

Install via a workspace link (monorepo) or as a Git dependency in external repos:

```bash
# inside client or server repository
npm install ../shared         # when using workspaces
# or
npm install git+ssh://git@github.com:MichaelMishaev/bankim-shared.git
```

Then import shared contracts:

```ts
import { ApiResponse, ContentItem } from '@bankim/shared';
```
