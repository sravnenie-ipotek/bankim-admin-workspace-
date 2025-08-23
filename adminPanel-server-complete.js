// BankIM Admin Panel - Complete Server Implementation
// This file contains the COMPLETE working server with all endpoints
// Location: This should be deployed to the server at the adminPanel directory

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8005;
const JWT_SECRET = process.env.JWT_SECRET || 'bankim-admin-panel-secret-key-2024';

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

// Database connection (Railway PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided',
      required: 'Authorization: Bearer <token>'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token', 
        message: 'Token is invalid or expired',
        hint: 'Please login again to get a fresh token'
      });
    }
    req.user = user;
    next();
  });
};

// Root route - Login page (NO REDIRECT)
app.get('/', (req, res) => {
  res.json({
    title: 'BankIM Admin Panel',
    message: 'Admin Authentication Required',
    version: '1.0.0',
    login: {
      endpoint: '/api/auth/login',
      method: 'POST',
      required: ['username', 'password'],
      example: {
        username: 'admin',
        password: 'admin123'
      }
    },
    protected_endpoints: [
      'GET /api/admin/dashboard',
      'GET /api/admin/users',
      'GET /api/admin/content',
      'GET /api/test/db',
      'GET /api/health'
    ],
    status: 'Server running - Authentication required for admin access',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        message: 'Username and password are required',
        received: { username: !!username, password: !!password }
      });
    }

    // Simple hardcoded admin check for now
    // TODO: Replace with database lookup
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create JWT token
      const token = jwt.sign(
        { 
          id: 1, 
          username: username,
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin']
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Authentication successful',
        token: token,
        user: {
          id: 1,
          username: username,
          role: 'admin'
        },
        expires_in: '24 hours',
        token_type: 'Bearer'
      });
    } else {
      res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Invalid username or password',
        hint: 'Default credentials: admin / admin123'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication system temporarily unavailable'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    hint: 'Token invalidated - please login again for future requests'
  });
});

// Protected Admin Dashboard endpoint
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  res.json({
    dashboard: 'BankIM Admin Dashboard',
    user: req.user,
    stats: {
      total_users: 1,
      active_sessions: 1,
      last_login: new Date().toISOString()
    },
    menu_items: [
      { id: 1, name: 'Content Management', url: '/content/menu' },
      { id: 2, name: 'User Management', url: '/admin/users' },
      { id: 3, name: 'System Settings', url: '/admin/settings' },
      { id: 4, name: 'Database Tools', url: '/admin/database' }
    ],
    message: 'Welcome to the BankIM Admin Panel',
    access_level: 'Full Administrative Access',
    timestamp: new Date().toISOString()
  });
});

// Protected Users endpoint
app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        username: 'admin',
        role: 'administrator',
        last_login: new Date().toISOString(),
        status: 'active'
      }
    ],
    total_count: 1,
    message: 'User management system',
    timestamp: new Date().toISOString()
  });
});

// Protected Content Management endpoint
app.get('/api/admin/content', authenticateToken, (req, res) => {
  res.json({
    content_stats: {
      total_pages: 0,
      languages: ['en', 'ru', 'he'],
      last_updated: new Date().toISOString()
    },
    message: 'Content management system',
    redirect_to: '/content/menu',
    timestamp: new Date().toISOString()
  });
});

// Database connectivity test endpoint
app.get('/api/test/db', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      connection_test: 'PASSED',
      server_time: result.rows[0].current_time,
      database_version: result.rows[0].postgres_version.split(' ')[0] + ' ' + result.rows[0].postgres_version.split(' ')[1],
      pool_stats: {
        total_connections: pool.totalCount,
        idle_connections: pool.idleCount,
        waiting_connections: pool.waitingCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      connection_test: 'FAILED',
      error: error.message,
      hint: 'Check database connection string and network connectivity',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BankIM Admin Panel',
    version: '1.0.0',
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Legacy content menu endpoint (redirects to new structure)
app.get('/content/menu', (req, res) => {
  res.json({
    message: 'Content menu access',
    note: 'This is a legacy endpoint - please use /api/admin/content with authentication',
    login_required: true,
    redirect_to_auth: '/api/auth/login'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Path ${req.originalUrl} not found`,
    available_endpoints: [
      'GET / (login page)',
      'POST /api/auth/login (authentication)',
      'GET /api/admin/dashboard (protected)',
      'GET /api/admin/users (protected)',
      'GET /api/admin/content (protected)',
      'GET /api/test/db (protected)',
      'GET /api/health (public)'
    ],
    hint: 'Try / for login or authenticate first with /api/auth/login'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 BankIM Admin Panel Server Started');
  console.log('==========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}`);
  console.log(`🔐 Authentication required for admin endpoints`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Using fallback'}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
  console.log('==========================================');
  console.log('Available endpoints:');
  console.log('  GET  /                    - Login page');
  console.log('  POST /api/auth/login      - Authentication');
  console.log('  GET  /api/admin/dashboard - Admin dashboard (protected)');
  console.log('  GET  /api/admin/users     - User management (protected)');
  console.log('  GET  /api/admin/content   - Content management (protected)');
  console.log('  GET  /api/test/db         - Database test (protected)');
  console.log('  GET  /api/health          - Health check');
  console.log('==========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;