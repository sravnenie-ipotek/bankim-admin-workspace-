# BankIM Management Portal - Backend API Server

Express.js API server for the BankIM banking management portal with PostgreSQL database support, multilingual content management, and role-based authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js >=18.0.0
- npm >=8.0.0
- PostgreSQL 12+ (Railway or local)

### Installation
```bash
# Clone the repository
git clone https://github.com/MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin

# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env file with your database URLs and secrets

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The API server will be available at `http://localhost:3001`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:status    # Check database connection status

# Testing
npm test             # Run Jest tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database Management
npm run seed         # Seed database with initial data
```

### Environment Configuration

Copy `.env.template` to `.env` and configure:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Database URLs
CORE_DATABASE_URL=postgresql://username:password@host:port/bankim_core
CONTENT_DATABASE_URL=postgresql://username:password@host:port/bankim_content
MANAGEMENT_DATABASE_URL=postgresql://username:password@host:port/bankim_management

# Authentication
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3002
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT + Express Sessions
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: Node.js >=18.0.0

### Multi-Database Architecture

The system uses 3 separate PostgreSQL databases:

#### 1. **bankim_content** (Primary)
- **Purpose**: UI content and translations
- **Tables**: 
  - `content_items` - Main content records
  - `content_translations` - Multilingual translations (RU/HE/EN)
  - `application_contexts` - 4 application contexts
  - `languages` - Supported language configurations

#### 2. **bankim_core**
- **Purpose**: Business logic and permissions
- **Contents**: Calculator formulas, admin users, role permissions

#### 3. **bankim_management**
- **Purpose**: Portal-specific management data
- **Contents**: Administrative operations and portal settings

### API Endpoints

#### Content Management
```bash
# Content by type
GET    /api/content/{type}                    # List content by type
GET    /api/content/{type}/all-items          # All items for content type
GET    /api/content/{screen}/{language}       # Content by screen and language
GET    /api/content/item/{id}                 # Get specific content item

# Content updates
PUT    /api/content/{type}/{id}               # Update content item
PUT    /api/content-items/{id}/translations/{lang}  # Update translation

# Specialized endpoints
GET    /api/content/mortgage/{key}/options     # Mortgage dropdown options
GET    /api/content/menu/translations         # Menu translations
```

#### System Endpoints
```bash
GET    /health                               # Health check
GET    /api/db-info                          # Database information
GET    /api/languages                        # Supported languages
```

#### User Management (Future)
```bash
GET    /api/users                           # List users
POST   /api/users                           # Create user
PUT    /api/users/{id}                      # Update user
DELETE /api/users/{id}                      # Delete user
```

### Database Schema Highlights

#### Content Items Structure
```sql
content_items:
- id (primary key)
- content_key (unique identifier)
- component_type (text, dropdown, link, etc.)
- category (form, navigation, etc.)
- screen_location (page/section identifier)
- app_context_id (references application_contexts.id)
- is_active (boolean)
- created_at, updated_at (timestamps)
```

#### Application Contexts
1. **Public Website** (`public`) - "До регистрации" content
2. **User Dashboard** (`user_portal`) - "Личный кабинет" content  
3. **Content Management** (`cms`) - "Админ панель для сайтов" content
4. **Banking Operations** (`bank_ops`) - "Админ панель для банков" content

### Caching Strategy
- **ETag Support**: Automatic ETag generation for content responses
- **Cache Headers**: Proper cache control headers for frontend optimization
- **TTL Configuration**: 5-minute default cache TTL
- **Invalidation**: Automatic cache invalidation on content updates

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication for API access
- **Express Sessions**: Session management with PostgreSQL store
- **Role-based Access**: 6 user roles with granular permissions
- **Password Hashing**: bcrypt for secure password storage

### Security Middleware
- **Helmet**: Security headers and XSS protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Validation**: Request validation and sanitization

## 🌐 Deployment

### Railway Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Environment Variables**: Configure in Railway dashboard
3. **Database Setup**: Use Railway PostgreSQL addon
4. **Deploy**: Automatic deployment on git push

```bash
# Railway configuration (railway.json)
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@railway:5432/railway
CONTENT_DATABASE_URL=postgresql://username:password@railway:5432/content_db
CORE_DATABASE_URL=postgresql://username:password@railway:5432/core_db
MANAGEMENT_DATABASE_URL=postgresql://username:password@railway:5432/mgmt_db
JWT_SECRET=your_strong_production_jwt_secret
SESSION_SECRET=your_strong_production_session_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Alternative Deployment Options
- **Heroku**: Container deployment with PostgreSQL addon
- **AWS**: EC2 or Lambda deployment with RDS
- **DigitalOcean**: Droplet deployment with managed PostgreSQL

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all Jest tests
npm test -- --watch        # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage report
```

### Test Categories
- **Unit Tests**: Individual function and module testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Database operation validation
- **Authentication Tests**: JWT and session testing

## 🗄️ Database Management

### Migrations
```bash
npm run db:migrate          # Run all pending migrations
npm run db:status           # Check migration status
```

### Migration Files Location
- `migrations/` - SQL migration files
- `scripts/migrate.js` - Migration runner script

### Database Scripts
- `scripts/db-status.js` - Database connection testing
- `scripts/seed-database.js` - Initial data seeding
- Database utilities and maintenance scripts

## 🔧 Development Notes

### Code Standards
- **ESLint**: JavaScript linting with Node.js rules
- **Prettier**: Code formatting for consistency
- **Environment Separation**: Development, staging, production configs
- **Error Handling**: Comprehensive error handling and logging

### API Design Principles
- **RESTful**: Following REST conventions for API design
- **Consistent Responses**: Standardized response format
- **Error Messages**: Descriptive error messages with proper HTTP codes
- **Versioning**: API versioning strategy for backward compatibility

### Performance Optimizations
- **Connection Pooling**: PostgreSQL connection pooling
- **Query Optimization**: Efficient database queries with proper indexing
- **Caching**: ETag-based caching for content responses
- **Compression**: Response compression for bandwidth optimization

## 🔗 Frontend Integration

This backend API serves the BankIM frontend client application.

### Frontend Repository
- **GitHub**: https://github.com/MichaelMishaev/bankimOnlineAdmin_client
- **Local Development**: Frontend runs on `http://localhost:3002`
- **API Integration**: Frontend proxies `/api/*` requests to this backend

### CORS Configuration
```javascript
// Configure CORS for frontend domain
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  credentials: true
}));
```

## 📊 Monitoring & Logs

### Health Monitoring
- **Health Endpoint**: `/health` for uptime monitoring
- **Database Health**: Connection status validation
- **Response Times**: Automatic response time logging

### Logging
- **Request Logging**: HTTP request/response logging
- **Error Logging**: Comprehensive error tracking
- **Database Logging**: Query logging for debugging
- **Security Logging**: Authentication and authorization events

## 📚 Related Documentation

- **Frontend Repository**: https://github.com/MichaelMishaev/bankimOnlineAdmin_client
- **Repository Architecture**: See `REPOSITORIES_README.md` in main project
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`
- **Railway Deployment**: See `RAILWAY_DEPLOYMENT.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📞 Support

- **Backend Issues**: Create issues in this repository
- **Frontend Issues**: Create issues in frontend repository
- **API Integration**: Coordinate between frontend and backend teams

---

**License**: UNLICENSED (Private)
**Author**: BankIM Development Team
**Version**: 1.0.0