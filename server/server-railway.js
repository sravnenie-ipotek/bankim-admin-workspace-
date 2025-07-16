import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { dbOperations, initializeDatabase } from './database-railway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Health check - Railway requires this
// This endpoint should always respond quickly, regardless of database status
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'BankIM Railway API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Initialize database on startup (non-blocking)
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialization completed');
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Server will continue running without database');
  });

// Routes

// Database info
app.get('/api/db-info', async (req, res) => {
  try {
    const info = await dbOperations.getDbInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Database info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbOperations.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await dbOperations.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const userId = await dbOperations.createUser({ name, email, role, status });
    const newUser = await dbOperations.getUserById(userId);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const updated = await dbOperations.updateUser(userId, { name, email, role, status });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const updatedUser = await dbOperations.getUserById(userId);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const deleted = await dbOperations.deleteUser(userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
// Catch-all handler: send back React's index.html file for all non-API routes
app.get('*', (req, res) => {
  // Only serve React app for non-API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }
  
  // Serve React app
  res.sendFile(join(distPath, 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BankIM Railway Database API Server Starting...');
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 Database info: http://0.0.0.0:${PORT}/api/db-info`);
  console.log(`👥 Users API: http://0.0.0.0:${PORT}/api/users`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=====================================');
});

export default app; 