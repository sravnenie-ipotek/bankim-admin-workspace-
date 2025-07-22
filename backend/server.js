/**
 * BankIM Content API Server
 * Connects to bankim_content PostgreSQL database
 * Serves multilingual content for the management portal
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('CONTENT_DATABASE_URL present:', !!process.env.CONTENT_DATABASE_URL);

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || [
    'http://localhost:3000', 
    'http://localhost:3002', 
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',
    'https://bankim-management-portal.railway.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      message: 'bankim_content API is running',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Database info endpoint
app.get('/api/db-info', async (req, res) => {
  try {
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const contentCountResult = await pool.query(`
      SELECT 
        COUNT(*) as total_content_items,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_items
      FROM content_items
    `);
    
    const translationsResult = await pool.query(`
      SELECT 
        language_code,
        COUNT(*) as translation_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.is_active = true
      GROUP BY language_code
      ORDER BY language_code
    `);

    res.json({
      success: true,
      data: {
        tables: tablesResult.rows.map(row => row.table_name),
        content_stats: contentCountResult.rows[0],
        language_stats: translationsResult.rows
      }
    });
  } catch (error) {
    console.error('Database info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get menu translations for menu components
 * GET /api/content/menu/translations
 */
app.get('/api/content/menu/translations', async (req, res) => {
  try {
    // Get navigation menu translations - these are the main site navigation items
    // Based on the content structure, we look for headings and titles that represent navigation
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ci.updated_at
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE (
        -- Main navigation items like "О нас", "Контакты", etc.
        (ci.component_type = 'text' AND ci.content_key LIKE '%footer_%') OR
        -- Service navigation from home page
        (ci.component_type = 'service_card' AND ci.screen_location = 'home_page') OR
        -- Main page navigation
        (ci.component_type = 'nav_link' AND ci.screen_location = 'home_page') OR
        -- Cooperation and partnership navigation
        (ci.component_type IN ('heading', 'title') AND ci.screen_location IN ('cooperation', 'tenders_for_brokers', 'tenders_for_lawyers')) OR
        -- Menu navigation items
        (ci.screen_location = 'menu_navigation' AND ci.component_type = 'menu_item') OR
        -- Sidebar items
        (ci.content_key LIKE 'sidebar_%')
      )
        AND ci.is_active = TRUE
        AND ct_ru.content_value IS NOT NULL
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    const menuItems = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      },
      last_modified: row.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: menuItems.length,
        menu_items: menuItems
      }
    });
    
  } catch (error) {
    console.error('Get menu translations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get content by screen location and language
 * GET /api/content/{screen_location}/{language_code}
 * Returns all approved content for the specified screen and language
 */
app.get('/api/content/:screen_location/:language_code', async (req, res) => {
  const { screen_location, language_code } = req.params;
  
  try {
    // Get content using the database function
    const result = await pool.query(
      'SELECT * FROM get_content_by_screen($1, $2)',
      [screen_location, language_code]
    );
    
    // Transform the result into the expected API response format
    const content = {};
    let contentCount = 0;
    
    result.rows.forEach(row => {
      content[row.content_key] = {
        value: row.value,
        component_type: row.component_type,
        category: row.category,
        language: row.language,
        status: row.status
      };
      contentCount++;
    });
    
    // Set ETag header for caching
    const etag = `"${screen_location}-${language_code}-${contentCount}-${Date.now()}"`;
    res.set('ETag', etag);
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    res.set('Bankim-Content-Version', '1.0.0');
    
    // Handle If-None-Match header for 304 responses
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    
    res.json({
      success: true,
      data: {
        status: 'success',
        screen_location,
        language_code,
        content_count: contentCount,
        content
      }
    });
    
  } catch (error) {
    console.error('Get content by screen error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get specific content by key and language with fallback
 * GET /api/content/{content_key}/{language_code}
 * Returns content for specific key with language fallback
 */
app.get('/api/content/:content_key/:language_code', async (req, res) => {
  const { content_key, language_code } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM get_content_with_fallback($1, $2)',
      [content_key, language_code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }
    
    const contentData = result.rows[0];
    
    // Set appropriate cache headers
    const etag = `"${content_key}-${contentData.language}-${Date.now()}"`;
    res.set('ETag', etag);
    res.set('Cache-Control', 'public, max-age=300');
    
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    
    res.json({
      success: true,
      data: contentData
    });
    
  } catch (error) {
    console.error('Get content by key error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all supported languages
 * GET /api/languages
 */
app.get('/api/languages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, code, name, native_name, direction, is_active, is_default
      FROM languages 
      WHERE is_active = true 
      ORDER BY is_default DESC, code ASC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get content categories
 * GET /api/content-categories
 */
app.get('/api/content-categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, display_name, description, parent_id, sort_order, is_active
      FROM content_categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get content statistics
 * GET /api/content/stats
 */
app.get('/api/content/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        screen_location,
        language_code,
        content_count,
        last_updated
      FROM v_content_stats
      ORDER BY screen_location, language_code
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Get content stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get dropdown options for a specific action
 * GET /api/content/main_page/action/{actionNumber}/options
 */
app.get('/api/content/main_page/action/:actionNumber/options', async (req, res) => {
  const { actionNumber } = req.params;
  
  try {
    // Get all options for this action
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        CAST(
          SUBSTRING(ci.content_key FROM 'option\\.([0-9]+)\\.')
          AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location = 'main_page'
        AND ci.component_type = 'option'
        AND ci.content_key LIKE $1
        AND ci.is_active = TRUE
      ORDER BY option_order
    `, [`app.main.action.${actionNumber}.option.%`]);
    
    // Transform to expected format
    const options = result.rows.map((row, index) => ({
      id: row.id.toString(),
      order: row.option_order || (index + 1),
      titleRu: row.title_ru || '',
      titleHe: row.title_he || ''
    }));
    
    res.json({
      success: true,
      data: options
    });
    
  } catch (error) {
    console.error('Get dropdown options error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update content translation
 * PUT /api/content-items/{content_item_id}/translations/{language_code}
 */
app.put('/api/content-items/:content_item_id/translations/:language_code', async (req, res) => {
  const { content_item_id, language_code } = req.params;
  const { content_value } = req.body;
  
  if (!content_value) {
    return res.status(400).json({
      success: false,
      error: 'content_value is required'
    });
  }
  
  try {
    const result = await pool.query(`
      UPDATE content_translations 
      SET content_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE content_item_id = $2 AND language_code = $3
      RETURNING *
    `, [content_value, content_item_id, language_code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Translation not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * UI Settings endpoints - Mock implementation for development
 * These would normally connect to a separate UI settings database
 */

// Get all UI settings
app.get('/api/ui-settings', async (req, res) => {
  try {
    // Mock UI settings data
    const mockSettings = [
      {
        id: 1,
        settingKey: 'font-size',
        settingValue: '16px',
        description: 'Default font size for the application',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        settingKey: 'theme',
        settingValue: 'dark',
        description: 'Application theme',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        settingKey: 'language',
        settingValue: 'ru',
        description: 'Default application language',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockSettings
    });
  } catch (error) {
    console.error('Get UI settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get UI setting by key
app.get('/api/ui-settings/:key', async (req, res) => {
  const { key } = req.params;
  
  try {
    // Mock implementation
    const mockSettings = {
      'font-size': {
        id: 1,
        settingKey: 'font-size',
        settingValue: '16px',
        description: 'Default font size for the application',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'theme': {
        id: 2,
        settingKey: 'theme',
        settingValue: 'dark',
        description: 'Application theme',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'language': {
        id: 3,
        settingKey: 'language',
        settingValue: 'ru',
        description: 'Default application language',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const setting = mockSettings[key];
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Get UI setting error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update UI setting
app.put('/api/ui-settings/:key', async (req, res) => {
  const { key } = req.params;
  const { settingValue } = req.body;
  
  if (!settingValue) {
    return res.status(400).json({
      success: false,
      error: 'settingValue is required'
    });
  }
  
  try {
    // Mock implementation - in real implementation this would update database
    const mockResponse = {
      id: Math.floor(Math.random() * 1000),
      settingKey: key,
      settingValue: settingValue,
      description: `Updated setting for ${key}`,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('Update UI setting error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

// Start server
app.listen(port, () => {
  console.log(`BankIM Content API server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.CONTENT_DATABASE_URL ? 'Connected to bankim_content' : 'Using default DATABASE_URL'}`);
});

module.exports = app;