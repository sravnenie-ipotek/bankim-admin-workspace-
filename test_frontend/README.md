# BankIM Management Portal - Frontend Client

React TypeScript application for the BankIM banking management portal with role-based access control and multilingual content management.

## 🚀 Quick Start

### Prerequisites
- Node.js >=18.0.0
- npm >=8.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/MichaelMishaev/bankimOnlineAdmin_client.git
cd bankimOnlineAdmin_client

# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env file with your backend API URL

# Start development server
npm run dev
```

The application will be available at `http://localhost:3002`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing
npm run test:all            # Run all Cypress E2E tests
npm run test:mortgage       # Run mortgage navigation tests
npm run test:content-errors # Run content error tests
npm run test:full-drill     # Run full drill depth tests
npm run cypress:open        # Open Cypress interactive mode
```

### Environment Configuration

Copy `.env.template` to `.env` and configure:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001

# Development options
VITE_USE_REAL_CONTENT_DATA=true
VITE_CONTENT_CACHE_TTL=300000

# Application settings
VITE_APP_TITLE=BankIM Management Portal
VITE_APP_VERSION=1.0.0
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM v6 (with future flags)
- **Styling**: CSS3 with CSS variables (no CSS-in-JS)
- **Testing**: Cypress E2E testing
- **Language Support**: Multilingual (RU/HE/EN) with RTL support

### Key Features
- **Role-based Access Control**: 6 user roles with granular permissions
- **Multilingual Support**: Russian, Hebrew, English with RTL layout support
- **Content Management**: Real-time editing of multilingual content
- **Application Contexts**: 4 distinct application contexts with tab navigation
- **Caching Strategy**: Intelligent API caching with ETag support
- **Responsive Design**: Mobile-first approach with desktop optimization

### Project Structure
```
src/
├── components/        # Reusable UI components
├── pages/            # Page-specific components
├── contexts/         # React Context providers
├── services/         # API service layer
├── shared/           # Shared utilities and components
├── locales/          # Language files
└── utils/            # Utility functions

cypress/
├── e2e/              # End-to-end test suites
└── support/          # Test utilities and helpers

public/
└── assets/           # Static assets
```

## 🔌 Backend Integration

This frontend application requires the BankIM backend API server.

### Backend Repository
- **GitHub**: https://github.com/MichaelMishaev/bankimOnlineAdmin
- **Local Development**: Backend should run on `http://localhost:3001`
- **API Endpoints**: All requests to `/api/*` are proxied to the backend

### API Communication
- **Base URL**: Configured via `VITE_API_URL` environment variable
- **Proxy Setup**: Vite dev server proxies `/api` requests to backend
- **Caching**: ETag-based caching with 5-minute TTL
- **Fallback**: Graceful degradation when backend unavailable

## 🧪 Testing

### Cypress E2E Testing
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:mortgage        # Mortgage drill navigation
npm run test:content-errors  # Content not found scenarios
npm run test:full-drill     # Full depth navigation tests

# Interactive testing
npm run cypress:open
```

### Test Coverage
- **Mortgage Content Navigation**: Full drill-down navigation patterns
- **Content Management**: CRUD operations on multilingual content
- **Error Handling**: Content not found and error boundary testing
- **Language Switching**: Multilingual interface testing
- **Responsive Design**: Mobile and desktop viewport testing

## 🌐 Deployment

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Deployment Options
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Drag and drop deployment
- **Railway**: Static site deployment
- **GitHub Pages**: Free hosting option

### Environment Variables for Production
```bash
VITE_API_URL=https://your-backend-domain.railway.app
VITE_USE_REAL_CONTENT_DATA=true
NODE_ENV=production
```

## 🔧 Development Notes

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Component Pattern**: `ComponentName.tsx` + `ComponentName.css`
- **Shared Components**: Located in `src/components/`
- **Page Components**: Located in `src/pages/`

### State Management
- **React Context**: Used for auth, navigation, and language state
- **Local State**: Preferred over external state management libraries
- **Error Boundaries**: Route-level error handling implemented

### Multilingual Implementation
- **Language Codes**: 'ru' (default), 'he', 'en'
- **RTL Support**: Hebrew language with right-to-left layout
- **Content Management**: Database-driven translations with real-time editing
- **Fallback Strategy**: Automatic fallback to Russian for missing translations

## 📚 Related Documentation

- **Backend Repository**: https://github.com/MichaelMishaev/bankimOnlineAdmin
- **Repository Architecture**: See `REPOSITORIES_README.md` in main project
- **API Documentation**: Available in backend repository
- **Deployment Guide**: See backend repository for full-stack deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📞 Support

- **Frontend Issues**: Create issues in this repository
- **Backend Issues**: Create issues in backend repository
- **API Integration**: Coordinate between frontend and backend teams

---

**License**: MIT
**Author**: Michael Mishayev
**Version**: 1.0.0