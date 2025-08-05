# ⚙️ BankIM Management Portal - Server API

**Node.js/Express backend API service for the BankIM multilingual content management system.**

## 📋 Server Overview

This package contains the backend API server for the BankIM Management Portal, providing secure, scalable REST endpoints for content management, user authentication, and financial calculations. The server handles multilingual content, role-based permissions, and complex business logic for Israeli banking services.

## 🏗️ Multi-Repository Architecture

This server is part of a **multi-repository monorepo ecosystem**:

```
🏦 BankIM Management Portal Ecosystem
├── 🏠 Main Repository        (bankimOnlineAdmin.git)
│   └── Development coordination, scripts, documentation
├── 🖥️ Client Repository      (bankimOnlineAdmin_client.git)
│   └── React/TypeScript Frontend → Consumes Server API
├── 🔧 Shared Repository      (bankimOnlineAdmin_shared.git)
│   └── TypeScript Types & Utilities → Used by Server
└── ⚙️  Server Package        (THIS PACKAGE - Deployed separately)
    └── Node.js/Express API → Uses @bankim/shared types
```

### Package Relationships
- **Serves**: Client application via REST API
- **Uses**: `@bankim/shared` package for TypeScript types
- **Connects to**: PostgreSQL database for data persistence
- **Deployed to**: Railway/Cloud infrastructure
- **Synchronized with**: Main repository for development

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
PostgreSQL 14+
Environment configuration
```

### Development Setup
```bash
# Install dependencies
npm install

# Configure environment
cp env.template .env
# Edit .env with your database and API configuration

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Configuration
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bankim_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bankim_content
DB_USER=bankim_admin
DB_PASSWORD=secure_password

# Server Configuration
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3002
ALLOWED_ORIGINS=http://localhost:3002,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📦 Server Architecture

```
packages/server/
├── server.js              # Main Express application entry point
├── config/                # Configuration modules
│   ├── database-core.js    # Core database connection
│   ├── database-content.js # Content-specific database queries
│   └── database-management.js # Management operations
├── database/               # Database schema and migrations
│   ├── bankim_content_schema.sql # Main database schema
│   ├── session-audit-tables.sql # Session and audit tables
│   └── *.sql              # Various migration scripts
├── scripts/                # Database utilities and scripts
│   ├── migrate.js          # Database migration runner
│   ├── db-status.js        # Database health check
│   └── *.js               # Various maintenance scripts
├── migrations/             # Database migration files
│   └── *.sql              # Schema evolution scripts
├── logs/                   # Application logs
│   ├── backend.log         # Main application log
│   └── dev.log            # Development log
└── railway.json           # Railway deployment configuration
```

## 🎯 API Architecture

### Core API Endpoints

#### Content Management API
```
GET    /api/content/:type                 # List content by type
GET    /api/content/:type/:id             # Get specific content item
POST   /api/content/:type                 # Create new content
PUT    /api/content/:type/:id             # Update existing content
DELETE /api/content/:type/:id             # Delete content item

GET    /api/content/:type/:id/drill       # Get drill-down content
GET    /api/content/:type/:id/actions     # Get available actions
PUT    /api/content/:type/:id/actions/:actionId # Update action content
```

#### Authentication API
```
POST   /api/auth/login                    # User authentication
POST   /api/auth/logout                   # User logout
POST   /api/auth/refresh                  # Token refresh
GET    /api/auth/profile                  # Get user profile
PUT    /api/auth/profile                  # Update user profile
```

#### Financial Calculation API
```
POST   /api/calculate/mortgage            # Mortgage calculations
POST   /api/calculate/credit              # Credit calculations
POST   /api/calculate/refinance           # Refinancing calculations
GET    /api/calculate/rates               # Current interest rates
```

#### System API
```
GET    /api/health                        # Health check endpoint
GET    /api/status                        # System status
GET    /api/version                       # API version info
```

### Response Format
All API endpoints follow a consistent response format using shared types:

```javascript
// Successful Response
{
  "success": true,
  "data": { /* response data */ },
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}

// Error Response  
{
  "success": false,
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "The requested content item was not found",
    "details": { "contentId": "invalid-id" },
    "field": "id"  // For validation errors
  }
}
```

## 🛠️ Technology Stack

### Core Technologies
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18** - Web application framework
- **PostgreSQL 14+** - Primary database for content and user data
- **bcrypt** - Password hashing and authentication
- **express-session** - Session management

### Security & Performance
- **Helmet** - Security headers and protection
- **CORS** - Cross-origin resource sharing configuration
- **express-rate-limit** - API rate limiting
- **connect-pg-simple** - PostgreSQL session store
- **dotenv** - Environment variable management

### Development Tools
- **nodemon** - Development server with auto-restart
- **Jest** - Testing framework (planned)
- **ESLint** - Code quality and linting (planned)
- **Prettier** - Code formatting (planned)

## 🗄️ Database Architecture

### Core Tables Structure
```sql
-- Content Management Tables
content_items (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title_ru TEXT,
  title_he TEXT, 
  title_en TEXT,
  content JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Management
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Session Management
sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Audit Trail
audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Multilingual Content Support
- **title_ru**, **title_he**, **title_en** - Localized titles
- **content JSONB** - Flexible multilingual content storage
- **Indexed queries** for efficient language-specific retrieval
- **Content versioning** for tracking changes

## 🔐 Security Features

### Authentication & Authorization
- **JWT Token** based authentication with refresh tokens
- **bcrypt Password** hashing with configurable rounds
- **Session Management** with PostgreSQL persistence
- **Role-Based Access Control** (RBAC) with 6 user roles
- **Permission System** with granular resource access

### API Security
- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate Limiting** to prevent API abuse
- **Input Validation** and sanitization
- **SQL Injection Protection** via parameterized queries

### Data Protection
- **Environment Variables** for sensitive configuration
- **Password Complexity** requirements
- **Session Expiration** and timeout handling
- **Audit Logging** for all administrative actions
- **IP Address Tracking** for security monitoring

## 📊 Content Management Features

### Multilingual Content Support
- **Russian (ru)** - Primary language with Cyrillic support
- **Hebrew (he)** - RTL language with proper Unicode handling
- **English (en)** - International language support
- **Dynamic Language** switching and content retrieval
- **Content Synchronization** across languages

### Content Types
```javascript
// Supported content types
const CONTENT_TYPES = [
  'mortgage',      // Mortgage products and calculators
  'credit',        // Credit products and applications
  'general',       // General pages and policies  
  'menu',          // Navigation and menu items
  'mortgage-refi', // Mortgage refinancing options
  'credit-refi'    // Credit refinancing products
];
```

### Content Operations
- **CRUD Operations** - Create, Read, Update, Delete content
- **Drill-Down Navigation** - Hierarchical content structure
- **Action Management** - Dynamic content actions and workflows
- **Content Validation** - Data integrity and business rules
- **Version Control** - Content change tracking and history

## 💰 Financial Calculations

### Mortgage Calculations
```javascript
// Mortgage calculation parameters
{
  loanAmount: 500000,     // Loan principal amount
  downPayment: 100000,    // Down payment amount
  interestRate: 4.5,      // Annual interest rate (%)
  termYears: 30,          // Loan term in years
  propertyTax: 12000,     // Annual property tax (optional)
  homeInsurance: 2400,    // Annual home insurance (optional)
  pmi: 0                  // Private mortgage insurance (optional)
}

// Calculation results
{
  monthlyPayment: 2533.43,           // Monthly payment amount
  totalInterest: 412035.94,          // Total interest over loan term
  totalPayment: 912035.94,           // Total amount paid
  paymentBreakdown: {
    principal: 1388.89,              // Monthly principal payment
    interest: 1875.00,               // Monthly interest payment
    propertyTax: 1000.00,            // Monthly property tax
    insurance: 200.00,               // Monthly insurance
    pmi: 0                          // Monthly PMI
  },
  amortizationSchedule: [...]        // Monthly payment schedule
}
```

### Credit Calculations
- **Personal Loan** calculations with various terms
- **Credit Card** payment schedules and interest
- **Business Credit** calculations for commercial loans
- **Refinancing Analysis** comparing current vs. new loans

## 🧪 API Testing & Monitoring

### Health Monitoring
```bash
# Health check endpoint
curl http://localhost:3001/api/health

# Response
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": "2h 15m 30s",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### Testing Scripts
```bash
# Test all API endpoints
./test-all-endpoints.sh

# Test specific content type
./test-drill-endpoints.sh mortgage

# Database connection test
npm run db:status

# Run comprehensive tests
npm test
```

## 📝 Development Scripts

### Core Scripts
```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run build          # Prepare for production (no-op for JS)
npm run clean          # Clean temporary files
```

### Database Scripts
```bash
npm run db:migrate     # Run database migrations
npm run db:status      # Check database connection and status
npm run seed           # Seed database with initial data (planned)
```

### Maintenance Scripts  
```bash
node scripts/migrate.js                    # Database migration
node scripts/db-status.js                  # Database health check
node verify-database.js                    # Verify database integrity
node check-dropdown-data.js                # Validate dropdown data
```

## 🚦 Deployment

### Railway Deployment
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Railway.DATABASE_URL}}
JWT_SECRET=${{Railway.JWT_SECRET}}
SESSION_SECRET=${{Railway.SESSION_SECRET}}
```

### Health Checks
- **Endpoint Monitoring** - `/api/health` for uptime monitoring
- **Database Connectivity** - Automatic connection health checks
- **Memory Usage** - Process memory monitoring
- **Response Times** - API performance tracking

## 📊 Performance Optimization

### Database Optimization
- **Indexing Strategy** - Optimized indexes for content queries
- **Connection Pooling** - Efficient database connection management
- **Query Optimization** - Parameterized queries for performance
- **JSONB Indexing** - Efficient multilingual content queries

### API Performance
- **Response Caching** - Strategic caching for frequently accessed data
- **Compression** - Gzip compression for API responses
- **Pagination** - Efficient data pagination for large datasets
- **Rate Limiting** - API abuse prevention and fair usage

### Monitoring & Logging
```javascript
// Structured logging
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Content updated successfully",
  "userId": "user-123",
  "contentType": "mortgage",
  "contentId": "mortgage-calc-1",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "duration": 45
}
```

## 🔄 Integration with Client

### API Communication
The server provides REST endpoints consumed by the React client:

```javascript
// Client-side API integration
import { APIResponse, ContentItem } from '@bankim/shared';

class ApiService {
  async getContent(type: string): Promise<APIResponse<ContentItem[]>> {
    const response = await fetch(`/api/content/${type}`);
    return response.json();
  }
  
  async updateContent(type: string, id: string, data: any): Promise<APIResponse<void>> {
    const response = await fetch(`/api/content/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

### Error Handling
- **Consistent Error Format** - Standardized error responses
- **HTTP Status Codes** - Appropriate status codes for different scenarios
- **Error Logging** - Comprehensive error tracking and monitoring
- **Client-Friendly Messages** - User-friendly error descriptions

## 🔧 Configuration Management

### Database Configuration
```javascript
// config/database-core.js
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,   // Connection idle timeout
  connectionTimeoutMillis: 2000 // Connection timeout
};
```

### Security Configuration
```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📚 API Documentation

### Content API Examples
```bash
# Get all mortgage content
GET /api/content/mortgage

# Get specific mortgage item
GET /api/content/mortgage/123

# Get mortgage drill-down data
GET /api/content/mortgage/123/drill

# Update mortgage content
PUT /api/content/mortgage/123
Content-Type: application/json
{
  "title_en": "Updated Mortgage Calculator",
  "content": { "loanAmount": { "min": 50000, "max": 1000000 } }
}
```

### Authentication Examples
```bash
# User login
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@bankim.com",
  "password": "secure_password"
}

# Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "admin@bankim.com", "role": "director" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

## 🤝 Contributing

### Development Workflow
1. **Setup Environment** - Configure database and environment variables
2. **Install Dependencies** - Run `npm install`
3. **Database Setup** - Run migrations and seed data
4. **Start Development** - Run `npm run dev`
5. **Make Changes** - Implement features with proper testing
6. **Test API** - Use provided test scripts
7. **Submit Changes** - Follow pull request process

### Code Standards
- **JavaScript ES6+** - Modern JavaScript features
- **Async/Await** - Promise-based asynchronous code
- **Error Handling** - Comprehensive try-catch blocks
- **Logging** - Structured logging for debugging
- **Security** - Input validation and sanitization

## 📞 Support

### Getting Help
- **GitHub Issues** - API bugs and feature requests
- **Logs Directory** - Check `/logs` for error details
- **Health Endpoint** - Use `/api/health` for status
- **Database Status** - Run `npm run db:status`

### Common Issues
- **Database Connection** - Check PostgreSQL service and credentials
- **Port Conflicts** - Ensure port 3001 is available
- **Environment Variables** - Verify `.env` file configuration
- **CORS Errors** - Check allowed origins configuration

### Debug Commands
```bash
# Check server process
lsof -i :3001

# View server logs
tail -f logs/backend.log

# Test database connection
npm run db:status

# Verify API endpoints
./test-all-endpoints.sh
```

## 📄 License

This package is proprietary software developed for BankIM services. All rights reserved.

**Copyright © 2024 BankIM Development Team**

---

## 🔗 Related Repositories

- **[Main Repository](https://github.com/MichaelMishaev/bankimOnlineAdmin)** - Complete project coordination
- **[Client Application](https://github.com/MichaelMishaev/bankimOnlineAdmin_client)** - React/TypeScript frontend
- **[Shared Package](https://github.com/MichaelMishaev/bankimOnlineAdmin_shared)** - TypeScript types and utilities

**🚀 Ready to develop? Run `npm run dev` and visit `http://localhost:3001/api/health`**

---

**📋 Current Version**: 1.0.0 | **🌐 Default Port**: 3001 | **🔄 Auto-sync**: Enabled