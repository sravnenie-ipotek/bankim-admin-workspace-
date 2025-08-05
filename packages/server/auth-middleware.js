const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Session store setup
function setupSessionStore(pool) {
  return new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false
  });
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      redirect: '/login'
    });
  }
}

// Optional auth (don't fail if not logged in, but add user to req if available)
function optionalAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
}

// Audit logging function
async function logContentChange(pool, changeData) {
  try {
    await pool.query(`
      INSERT INTO content_audit_log (
        user_id, user_email, user_name, user_role, session_id,
        content_item_id, content_key, screen_location, language_code,
        action_type, field_changed, old_value, new_value,
        source_page, user_agent, ip_address, referer_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      changeData.user_id,
      changeData.user_email,
      changeData.user_name,
      changeData.user_role,
      changeData.session_id,
      changeData.content_item_id,
      changeData.content_key,
      changeData.screen_location,
      changeData.language_code,
      changeData.action_type,
      changeData.field_changed || 'content_value',
      changeData.old_value,
      changeData.new_value,
      changeData.source_page,
      changeData.user_agent,
      changeData.ip_address,
      changeData.referer_url
    ]);
    
    console.log(`✅ Content change logged: ${changeData.action_type} on ${changeData.content_key} by ${changeData.user_email}`);
  } catch (error) {
    console.error('❌ Failed to log content change:', error);
    // Don't fail the main operation if logging fails
  }
}

// Login audit logging
async function logLoginAttempt(pool, loginData) {
  try {
    await pool.query(`
      INSERT INTO login_audit_log (
        email, user_id, session_id, success, failure_reason,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      loginData.email,
      loginData.user_id,
      loginData.session_id,
      loginData.success,
      loginData.failure_reason,
      loginData.ip_address,
      loginData.user_agent
    ]);
  } catch (error) {
    console.error('❌ Failed to log login attempt:', error);
  }
}

// Setup authentication routes
function setupAuthRoutes(app, pool) {
  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    try {
      // Find user in database
      const userResult = await pool.query(
        'SELECT * FROM admin_users WHERE email = $1 AND is_active = TRUE',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        await logLoginAttempt(pool, {
          email,
          user_id: null,
          session_id: req.sessionID,
          success: false,
          failure_reason: 'User not found',
          ip_address,
          user_agent
        });
        
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      const user = userResult.rows[0];
      
      // Check password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordValid) {
        await logLoginAttempt(pool, {
          email,
          user_id: user.id,
          session_id: req.sessionID,
          success: false,
          failure_reason: 'Invalid password',
          ip_address,
          user_agent
        });
        
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Successful login - create session
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      // Update last login
      await pool.query(
        'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
      
      // Log successful login
      await logLoginAttempt(pool, {
        email,
        user_id: user.id,
        session_id: req.sessionID,
        success: true,
        failure_reason: null,
        ip_address,
        user_agent
      });
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Could not log out'
        });
      }
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
  
  // Check authentication status
  app.get('/api/auth/me', (req, res) => {
    if (req.session && req.session.user) {
      res.json({
        success: true,
        user: req.session.user
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
  });
}

module.exports = {
  setupSessionStore,
  requireAuth,
  optionalAuth,
  logContentChange,
  logLoginAttempt,
  setupAuthRoutes
}; 