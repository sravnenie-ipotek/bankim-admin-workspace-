import express from 'express';
import cors from 'cors';
import { dbOperations, initializeDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BankIM Test Database API is running',
    timestamp: new Date().toISOString()
  });
});

// Database info
app.get('/api/db-info', (req, res) => {
  try {
    const info = dbOperations.getDbInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = dbOperations.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = dbOperations.getUserById(userId);
    
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new user
app.post('/api/users', (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const userId = dbOperations.createUser({ name, email, role, status });
    const newUser = dbOperations.getUserById(userId);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user
app.put('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const updated = dbOperations.updateUser(userId, { name, email, role, status });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const updatedUser = dbOperations.getUserById(userId);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const deleted = dbOperations.deleteUser(userId);
    
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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 BankIM Test Database API Server Starting...');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database info: http://localhost:${PORT}/api/db-info`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log('=====================================');
});

export default app; 