# 🏗️ BankIM Repository Structure

## 📋 **Overview**

The BankIM Management Portal has been split into separate repositories to support multiple developers and independent deployment.

## 🏗️ **Repository Architecture**

### **📁 Client Repository (Frontend)**
```
📁 bankimOnlineAdmin_client
├── 🎨 React Application
├── 📱 TypeScript + Vite
├── 🎨 UI Components & Pages
├── 🌐 API Integration
└── 📦 Frontend Dependencies
```

**GitHub**: `https://github.com/MichaelMishaev/bankimOnlineAdmin_client`

**Technology Stack**:
- React 18 + TypeScript
- Vite (Build Tool)
- React Router DOM
- CSS3 with CSS Variables
- Multi-language Support (RU, EN, HE)

### **📁 Server Repository (Backend)**
```
📁 bankimOnlineAdmin (Original - Now Server Only)
├── 🔧 Node.js API
├── 🗄️ Database Layer
├── 🔐 Authentication
├── 📊 Business Logic
└── 📦 Backend Dependencies
```

**GitHub**: `https://github.com/MichaelMishaev/bankimOnlineAdmin`

**Technology Stack**:
- Node.js + Express
- PostgreSQL (Railway)
- JWT Authentication
- Content Management API
- Multi-database Architecture

## 🚀 **Quick Start**

### **Frontend Development**
```bash
# Clone client repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git
cd bankimOnlineAdmin_client

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Backend Development**
```bash
# Clone server repository
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin

# Install dependencies
npm install

# Start development server
npm run backend:dev
```

### **Full Stack Development**
```bash
# Terminal 1: Frontend
cd bankimOnlineAdmin_client
npm run dev

# Terminal 2: Backend
cd bankimOnlineAdmin
npm run backend:dev
```

## 🔗 **Repository Connections**

### **Current Remote Configuration**
```bash
# Original Repository (Server)
origin: git@github.com:MichaelMishaev/bankimOnlineAdmin.git

# Client Repository
client: git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git
```

### **Development Workflow**
```bash
# Frontend Team
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git
cd bankimOnlineAdmin_client
npm install
npm run dev

# Backend Team
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin
npm install
npm run backend:dev
```

## 📊 **Repository Split Benefits**

### **✅ For Multiple Developers**
- **Independent Development**: Teams can work separately
- **Reduced Conflicts**: No more merge conflicts between frontend/backend
- **Clear Ownership**: Each team owns their repository
- **Faster CI/CD**: Separate build and test pipelines

### **✅ For Deployment**
- **Independent Scaling**: Frontend on CDN, Backend on servers
- **Different Technologies**: Different hosting solutions
- **Rollback Capability**: Deploy frontend/backend independently
- **Environment Management**: Separate staging/production

### **✅ For Maintenance**
- **Clear Dependencies**: No shared dependency conflicts
- **Version Management**: Independent versioning
- **Security**: Separate security policies
- **Monitoring**: Separate monitoring and logging

## 🌐 **API Integration**

### **Environment Configuration**
```bash
# Client (.env)
VITE_API_URL=http://localhost:3001/api

# Server (.env)
PORT=3001
DATABASE_URL=postgresql://...
```

### **API Communication**
```typescript
// Client API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiService = {
  getContent: (contentType: string) => 
    fetch(`${API_BASE_URL}/content/${contentType}`),
  // ... other API methods
};
```

## 🗄️ **Database Architecture**

### **Multi-Database Setup**
```
📊 Database Structure:
├── bankim_content (Content Management)
├── bankim_core (Business Logic)
└── bankim_management (Admin Operations)
```

### **Database Connections**
```javascript
// Server Configuration
const databases = {
  content: process.env.CONTENT_DATABASE_URL,
  core: process.env.CORE_DATABASE_URL,
  management: process.env.MANAGEMENT_DATABASE_URL
};
```

## 🚀 **Deployment**

### **Frontend Deployment**
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Drag and drop deployment
- **Railway**: Static site deployment
- **GitHub Pages**: Free hosting

### **Backend Deployment**
- **Railway**: Full-stack deployment
- **Heroku**: Container deployment
- **AWS**: EC2 or Lambda deployment
- **DigitalOcean**: Droplet deployment

## 📚 **Documentation**

### **Repository-Specific Documentation**
- **Client**: See `README.md` in `bankimOnlineAdmin_client`
- **Server**: See `README.md` in `bankimOnlineAdmin`

### **API Documentation**
- **Endpoints**: `/api/content/*`, `/api/auth/*`
- **Authentication**: JWT-based
- **Content Management**: CRUD operations
- **Database**: PostgreSQL with connection pooling

## 🔧 **Development Tools**

### **Frontend Tools**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Code linting

# Testing
npm run test:all     # Run all tests
npm run cypress:open # Open Cypress
```

### **Backend Tools**
```bash
# Development
npm run backend:dev  # Start backend server
npm run backend:test # Run backend tests

# Database
npm run db:migrate   # Run database migrations
npm run db:status    # Check database status
```

## 🚨 **Important Notes**

### **Repository Split Status**
- ✅ **Client Repository**: Created and populated
- ✅ **Server Repository**: Contains backend code
- ⏳ **Cleanup**: Remove frontend from server repo
- ⏳ **API Integration**: Configure communication

### **Migration Timeline**
1. **Phase 1**: ✅ Create client repository
2. **Phase 2**: 🔄 Clean up server repository
3. **Phase 3**: ⏳ Configure API integration
4. **Phase 4**: ⏳ Set up deployment

### **Team Guidelines**
- **Frontend Team**: Work in `bankimOnlineAdmin_client`
- **Backend Team**: Work in `bankimOnlineAdmin`
- **Communication**: Regular sync meetings
- **API Changes**: Coordinate between teams

## 📞 **Support & Contact**

### **Repository Access**
- **Client**: `git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git`
- **Server**: `git@github.com:MichaelMishaev/bankimOnlineAdmin.git`

### **Team Communication**
- **Frontend Issues**: Create issues in client repository
- **Backend Issues**: Create issues in server repository
- **API Issues**: Coordinate between repositories

---

## 🎯 **Quick Reference**

| Repository | Purpose | Technology | Status |
|------------|---------|------------|--------|
| `bankimOnlineAdmin_client` | Frontend | React + TypeScript | ✅ Ready |
| `bankimOnlineAdmin` | Backend | Node.js + Express | 🔄 In Progress |

**Last Updated**: August 2025
**Version**: 1.0.0 