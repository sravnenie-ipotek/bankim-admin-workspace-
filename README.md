# 🏗️ BankIM Management Portal

## 📋 **Repository Structure**

This project has been split into separate repositories for better development workflow:

### **📁 Client Repository (Frontend)**
- **Repository**: `bankimOnlineAdmin_client`
- **GitHub**: https://github.com/MichaelMishaev/bankimOnlineAdmin_client
- **Technology**: React 18 + TypeScript + Vite

### **📁 Server Repository (Backend)**
- **Repository**: `bankimOnlineAdmin` (this repository)
- **GitHub**: https://github.com/MichaelMishaev/bankimOnlineAdmin
- **Technology**: Node.js + Express + PostgreSQL

## 📚 **Documentation**

For complete repository information and setup instructions, see:
- **[REPOSITORIES_README.md](./REPOSITORIES_README.md)** - Complete repository structure and setup guide

## 🚀 **Quick Start**

### **Backend Development (This Repository)**
```bash
# Install dependencies
npm install

# Start development server
npm run backend:dev

# Run database migrations
npm run backend:migrate
```

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

## 🗄️ **Database Architecture**

This repository contains the backend API and database management:

- **Content Database**: Multi-language content management
- **Core Database**: Business logic and calculations
- **Management Database**: Admin operations and user management

## 🔧 **Available Scripts**

```bash
# Backend Development
npm run backend:dev      # Start backend server
npm run backend:start    # Start production server
npm run backend:test     # Run backend tests

# Database Management
npm run backend:migrate  # Run database migrations
npm run backend:status   # Check database status

# Full Stack Development
npm run full-dev         # Start both frontend and backend
```

## 📊 **Technology Stack**

### **Backend (This Repository)**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway)
- **Authentication**: JWT
- **API**: RESTful endpoints

### **Frontend (Client Repository)**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: CSS3 with CSS Variables
- **Languages**: Russian, English, Hebrew (RTL)

## 🌐 **API Endpoints**

### **Content Management**
- `GET /api/content/:contentType` - Get content by type
- `POST /api/content/:contentType` - Create new content
- `PUT /api/content/:contentType/:id` - Update content
- `DELETE /api/content/:contentType/:id` - Delete content

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### **Health & Status**
- `GET /health` - Server health check
- `GET /api/db/status` - Database status

## 🚀 **Deployment**

### **Backend Deployment**
This repository is configured for Railway deployment:
- **Railway**: Automatic deployment from GitHub
- **Environment**: Production-ready configuration
- **Database**: PostgreSQL on Railway

### **Frontend Deployment**
The client repository supports multiple deployment options:
- **Vercel**: Automatic deployment
- **Netlify**: Drag and drop deployment
- **Railway**: Static site deployment

## 📞 **Support**

- **Backend Issues**: Create issues in this repository
- **Frontend Issues**: Create issues in `bankimOnlineAdmin_client`
- **API Documentation**: See `REPOSITORIES_README.md`

---

**Last Updated**: August 2025
**Version**: 1.0.0 