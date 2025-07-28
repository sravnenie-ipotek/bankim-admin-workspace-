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

// Database connection configuration with fallback
let pool;
let isConnected = false;
let connectionAttempts = 0;
const maxRetries = 3;

// Railway database configuration
const primaryConfig = {
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
};



// Initialize database connection
async function initializeDatabase() {
  console.log('🔌 Attempting Railway database connection...');
  
  try {
    // Connect to Railway database
    pool = new Pool(primaryConfig);
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    isConnected = true;
    console.log('✅ Connected to Railway database');
    return true;
    
  } catch (primaryError) {
    console.log('❌ Railway database connection failed:', primaryError.message);
    console.log('🔧 Please check your Railway database credentials and connection');
    
    isConnected = false;
    return false;
  }
}

// Graceful database query wrapper
async function safeQuery(query, params = []) {
  if (!isConnected || !pool) {
    throw new Error('Database not available - running in offline mode');
  }
  
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    
    // Try to reconnect on connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'EADDRNOTAVAIL') {
      console.log('🔄 Attempting to reconnect...');
      isConnected = false;
      await initializeDatabase();
    }
    
    throw error;
  }
}

// Handle database connection errors gracefully
process.on('unhandledRejection', (error) => {
  if (error.code === 'EADDRNOTAVAIL' || error.code === 'ECONNREFUSED') {
    console.log('🔌 Database connection lost, will attempt reconnection on next request');
    isConnected = false;
  } else {
    console.error('Unhandled promise rejection:', error);
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3002', 
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:5173',
    'https://bankim-management-portal.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // increased limit to 5000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

app.use(limiter);

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  const status = {
    status: 'healthy',
    message: 'bankim_content API is running',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'offline'
  };
  
  // Try to test database if it's supposed to be connected
  if (isConnected && pool) {
    try {
      await pool.query('SELECT NOW()');
      status.database = 'connected';
    } catch (error) {
      status.database = 'error';
      status.database_error = error.message;
      isConnected = false;
    }
  }
  
  res.json(status);
});

// Database status endpoint
app.get('/api/database-status', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        message: 'Running in offline mode',
        canRetry: true
      });
    }

    const result = await safeQuery('SELECT NOW() as current_time');
    res.json({
      success: true,
      status: 'connected',
      timestamp: result.rows[0].current_time,
      message: 'Database connection healthy'
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message,
      canRetry: true
    });
  }
});

// Database info endpoint
app.get('/api/db-info', async (req, res) => {
  try {
    const tablesResult = await safeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const contentCountResult = await safeQuery(`
      SELECT 
        COUNT(*) as total_content_items,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_items
      FROM content_items
    `);
    
    const translationsResult = await safeQuery(`
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
    const result = await safeQuery(`
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
      WHERE ci.is_active = TRUE
        AND ci.category = 'navigation'
        AND ci.screen_location = 'sidebar'
        AND (ct_he.content_value IS NOT NULL OR ct_en.content_value IS NOT NULL OR ct_ru.content_value IS NOT NULL)
      ORDER BY ci.content_key
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
 * Get menu content
 * GET /api/content/menu
 * Returns content for menu screen with dynamic translations from database
 */
app.get('/api/content/menu', async (req, res) => {
  try {
    // Dynamic query that gets actual menu content from database
    const result = await safeQuery(`
      WITH menu_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          (SELECT DISTINCT page_number FROM content_items WHERE screen_location = ci.screen_location AND is_active = TRUE LIMIT 1) as page_number,
          -- Get title translations from the main title content for each screen
          COALESCE(
            (SELECT ct_ru.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_ru ON title_ci.id = ct_ru.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_ru.language_code = 'ru'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available Russian translation
            (SELECT ct_ru.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_ru ON fallback_ci.id = ct_ru.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_ru.language_code = 'ru'
               AND ct_ru.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1),
            'Sidebar Menu'
          ) as title_ru,
          COALESCE(
            (SELECT ct_he.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_he ON title_ci.id = ct_he.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_he.language_code = 'he'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available Hebrew translation
            (SELECT ct_he.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_he ON fallback_ci.id = ct_he.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_he.language_code = 'he'
               AND ct_he.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1),
            'תפריט צדדי'
          ) as title_he,
          COALESCE(
            (SELECT ct_en.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_en ON title_ci.id = ct_en.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_en.language_code = 'en'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available English translation
            (SELECT ct_en.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_en ON fallback_ci.id = ct_en.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_en.language_code = 'en'
               AND ct_en.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1),
            'Sidebar Menu'
          ) as title_en
        FROM content_items ci
        WHERE ci.screen_location IN ('sidebar', 'navigation', 'menu_navigation')
          AND ci.is_active = TRUE
          AND ci.component_type != 'option'
        GROUP BY ci.screen_location
        HAVING COUNT(*) > 0
      )
      SELECT 
        ms.representative_id as id,
        ms.screen_location as content_key,
        'menu' as component_type,
        'menu_sections' as category,
        ms.screen_location,
        COALESCE(ms.title_ru, ms.title_en, 'Unnamed Menu') as description,
        true as is_active,
        ms.action_count,
        ms.page_number,
        ms.title_ru,
        ms.title_he,
        ms.title_en,
        ms.last_modified as updated_at
      FROM menu_summaries ms
      ORDER BY ms.screen_location
    `);
    
    const menuContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      actionCount: row.action_count || 1,
      page_number: row.page_number,
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
        content_count: menuContent.length,
        menu_content: menuContent
      }
    });

  } catch (error) {
    console.error('Get menu content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get detailed content items for a specific menu section
 * GET /api/content/menu/drill/:sectionId
 * Returns individual content items that belong to a specific menu section
 */
app.get('/api/content/menu/drill/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    console.log(`Fetching menu drill content for section ID: ${sectionId}`);
    
    // Validate that this screen_location exists in our known menu sections
    const validScreenLocations = ['sidebar', 'navigation', 'menu_navigation'];
    if (!validScreenLocations.includes(sectionId)) {
      return res.status(404).json({
        success: false,
        error: `Invalid menu section ID: ${sectionId}`
      });
    }

    // Get section title mapping
    const sectionTitles = {
      'sidebar': 'Панель управления',
      'navigation': 'Навигация',
      'menu_navigation': 'Навигация меню'
    };

    // Get individual content items for this menu section
    const contentResult = await safeQuery(`
      SELECT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.page_number,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [sectionId]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this menu section'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: sectionTitles[sectionId],
        stepGroup: sectionId,
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get menu drill content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get text content by action ID
 * GET /api/content/text/{actionId}
 * Returns text content for a specific action with translations
 */
app.get('/api/content/text/:actionId', async (req, res) => {
  const { actionId } = req.params;
  
  try {
    // First, let's get some real content from the database to show the structure
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ct_ru.content_value as content_ru,
        ct_he.content_value as content_he,
        ct_en.content_value as content_en,
        ci.updated_at as last_modified
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.is_active = TRUE
        AND (ct_ru.content_value IS NOT NULL OR ct_he.content_value IS NOT NULL)
      ORDER BY ci.content_key
      LIMIT 10
    `);
    
    console.log('Database query result:', result.rows);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found in database'
      });
    }
    
    // Transform the real database data to match the expected format
    const textContent = {
      id: actionId,
      actionNumber: parseInt(actionId) || 1,
      titleRu: 'Заголовок страницы',
      titleHe: 'כותרת העמוד',
      titleEn: 'Page Title',
      contentType: 'text',
      textContent: {
        ru: result.rows[0]?.content_ru || 'Рассчитать Ипотеку',
        he: result.rows[0]?.content_he || 'חשב את המשכנתא שלך',
        en: result.rows[0]?.content_en || 'Calculate Mortgage'
      },
      additionalText: result.rows.map(row => ({
        id: row.id.toString(),
        contentKey: row.content_key,
        translations: {
          ru: row.content_ru || '',
          he: row.content_he || '',
          en: row.content_en || ''
        }
      })),
      styling: {
        font: 'Arimo',
        size: 16,
        color: '#FFFFFF',
        weight: '600',
        alignment: 'left'
      },
      position: {
        x: 0,
        y: 0
      },
      lastModified: new Date(result.rows[0]?.last_modified || Date.now()),
      status: 'published'
    };
    
    res.json({
      success: true,
      data: textContent
    });
    
  } catch (error) {
    console.error('Get text content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get a specific content item by ID
 * Used for editing individual content items
 */
app.get('/api/content/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log(`Fetching content item with ID: ${itemId}`);
    
    const contentResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (
          PARTITION BY CASE 
            WHEN ci.screen_location LIKE 'mortgage_step%' THEN 'mortgage'
            ELSE ci.screen_location 
          END
          ORDER BY ci.screen_location, ci.content_key
        ) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.id = $1
    `, [itemId]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found'
      });
    }

    const row = contentResult.rows[0];
    const contentItem = {
      id: row.id,
      action_number: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      updated_at: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    };

    res.json({
      success: true,
      data: contentItem
    });
  } catch (error) {
    console.error('Error fetching content item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content item' 
    });
  }
});

/**
 * Get all individual mortgage content items across all steps
 * GET /api/content/mortgage/all-items
 * Returns all content items from all mortgage steps for drill page fallback
 * NOTE: This route must be defined BEFORE the general /api/content/:screen_location/:language_code route
 */
app.get('/api/content/mortgage/all-items', async (req, res) => {
  try {
    console.log('Fetching all mortgage content items across all steps...');
    
    // Get all individual content items from all mortgage steps
    const contentResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.screen_location, ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4')
        AND ci.is_active = true
      ORDER BY ci.screen_location, ci.content_key
    `);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No mortgage content items found'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    console.log(`✅ Found ${actions.length} total mortgage content items across all steps`);

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: 'Калькулятор ипотеки',
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get all mortgage items error:', error);
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
    const result = await safeQuery(
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
    const result = await safeQuery(
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
    const result = await safeQuery(`
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
    const result = await safeQuery(`
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
    const result = await safeQuery(`
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
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        CAST(
          SUBSTRING(ci.content_key FROM '\\.option\\.([0-9]+)$')
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
 * Get dropdown options for mortgage content
 * GET /api/content/mortgage/{contentKey}/options
 */
app.get('/api/content/mortgage/:contentKey/options', async (req, res) => {
  const { contentKey } = req.params;
  
  try {
    console.log('Fetching options for content key:', contentKey);
    
    // Build the pattern for options based on the content key
    // If contentKey is an ID, we need to first get the actual content_key
    let actualContentKey = contentKey;
    
    // Check if contentKey is numeric (ID)
    if (!isNaN(contentKey)) {
      const keyResult = await safeQuery(`
        SELECT content_key 
        FROM content_items 
        WHERE id = $1
      `, [contentKey]);
      
      if (keyResult.rows.length > 0) {
        actualContentKey = keyResult.rows[0].content_key;
      }
    }
    
    console.log('Using content key pattern:', `${actualContentKey}.option.%`);
    
    // Get all options for this mortgage dropdown
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        CAST(
          SUBSTRING(ci.content_key FROM '\\.option\\.([0-9]+)$')
          AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.component_type = 'option'
        AND ci.content_key LIKE $1
        AND ci.is_active = TRUE
      ORDER BY option_order NULLS LAST, ci.content_key
    `, [`${actualContentKey}.option.%`]);
    
    // Transform to expected format
    const options = result.rows.map((row, index) => ({
      id: row.id.toString(),
      order: row.option_order || (index + 1),
      titleRu: row.title_ru || '',
      titleHe: row.title_he || '',
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));
    
    res.json({
      success: true,
      data: options
    });
    
  } catch (error) {
    console.error('Get mortgage dropdown options error:', error);
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
    const result = await safeQuery(`
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
    
    // Also update the main content item's updated_at timestamp
    // This ensures step-level summaries show the correct last modified time
    console.log(`🔄 Updating content_items.updated_at for item ${content_item_id}`);
    const itemUpdateResult = await safeQuery(`
      UPDATE content_items 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING id, updated_at
    `, [content_item_id]);
    
    if (itemUpdateResult.rows.length > 0) {
      console.log(`✅ Updated content item ${content_item_id} updated_at:`, itemUpdateResult.rows[0].updated_at);
    } else {
      console.log(`⚠️ No content item found with id ${content_item_id}`);
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
 * Get UI settings
 * GET /api/ui-settings
 * Returns UI configuration settings
 */
app.get('/api/ui-settings', async (req, res) => {
  try {
    // Return basic UI settings - can be expanded later
    const uiSettings = {
      theme: 'dark',
      language: 'ru',
      dateFormat: 'dd/mm/yyyy',
      currency: 'ILS',
      timezone: 'Asia/Jerusalem'
    };

    res.json({
      success: true,
      data: uiSettings
    });
  } catch (error) {
    console.error('Get UI settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get text content by action ID
 * GET /api/content/text/{actionId}
 * Returns text content for a specific action with translations
 */
app.get('/api/content/text/:actionId', async (req, res) => {
  const { actionId } = req.params;
  
  try {
    // First, let's get some real content from the database to show the structure
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ct_ru.content_value as content_ru,
        ct_he.content_value as content_he,
        ct_en.content_value as content_en,
        ci.updated_at as last_modified
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.is_active = TRUE
        AND (ct_ru.content_value IS NOT NULL OR ct_he.content_value IS NOT NULL)
      ORDER BY ci.content_key
      LIMIT 10
    `);
    
    console.log('Database query result:', result.rows);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found in database'
      });
    }
    
    // Transform the real database data to match the expected format
    const textContent = {
      id: actionId,
      actionNumber: parseInt(actionId) || 1,
      titleRu: 'Заголовок страницы',
      titleHe: 'כותרת העמוד',
      titleEn: 'Page Title',
      contentType: 'text',
      textContent: {
        ru: result.rows[0]?.content_ru || 'Рассчитать Ипотеку',
        he: result.rows[0]?.content_he || 'חשב את המשכנתא שלך',
        en: result.rows[0]?.content_en || 'Calculate Mortgage'
      },
      additionalText: result.rows.map(row => ({
        id: row.id.toString(),
        contentKey: row.content_key,
        translations: {
          ru: row.content_ru || '',
          he: row.content_he || '',
          en: row.content_en || ''
        }
      })),
      styling: {
        font: 'Arimo',
        size: 16,
        color: '#FFFFFF',
        weight: '600',
        alignment: 'left'
      },
      position: {
        x: 0,
        y: 0
      },
      lastModified: new Date(result.rows[0]?.last_modified || Date.now()),
      status: 'published'
    };
    
    res.json({
      success: true,
      data: textContent
    });
    
  } catch (error) {
    console.error('Get text content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get mortgage calculation content
 * GET /api/content/mortgage
 * Returns content for mortgage calculation screen with translations
 */
app.get('/api/content/mortgage', async (req, res) => {
  try {
    // Use clean screen_location based approach - much simpler!
    const result = await safeQuery(`
      WITH step_counts AS (
        SELECT 
          'step.1.calculator' as step_group,
          'Калькулятор ипотеки' as title_ru,
          'משכנתא מחשבון' as title_he,
          'Mortgage Calculator' as title_en,
          (SELECT COUNT(*) FROM content_items WHERE screen_location = 'mortgage_calculation' AND is_active = TRUE AND component_type != 'option') as action_count,
          (SELECT MAX(updated_at) FROM content_items WHERE screen_location = 'mortgage_calculation' AND is_active = TRUE) as last_modified,
          (SELECT MIN(id) FROM content_items WHERE screen_location = 'mortgage_calculation' AND is_active = TRUE) as representative_id,
          (SELECT DISTINCT page_number FROM content_items WHERE screen_location = 'mortgage_calculation' AND is_active = TRUE LIMIT 1) as page_number
        UNION ALL
        SELECT 
          'step.2.personal_data' as step_group,
          'Анкета личных данных' as title_ru,
          'טופס נתונים אישיים' as title_he,
          'Personal Data Form' as title_en,
          (SELECT COUNT(*) FROM content_items WHERE screen_location = 'mortgage_step2' AND is_active = TRUE AND component_type != 'option') as action_count,
          (SELECT MAX(updated_at) FROM content_items WHERE screen_location = 'mortgage_step2' AND is_active = TRUE) as last_modified,
          (SELECT MIN(id) FROM content_items WHERE screen_location = 'mortgage_step2' AND is_active = TRUE) as representative_id,
          (SELECT DISTINCT page_number FROM content_items WHERE screen_location = 'mortgage_step2' AND is_active = TRUE LIMIT 1) as page_number
        UNION ALL
        SELECT 
          'step.3.income_data' as step_group,
          'Анкета доходов' as title_ru,
          'טופס הכנסות' as title_he,
          'Income Data Form' as title_en,
          (SELECT COUNT(*) FROM content_items WHERE screen_location = 'mortgage_step3' AND is_active = TRUE AND component_type != 'option') as action_count,
          (SELECT MAX(updated_at) FROM content_items WHERE screen_location = 'mortgage_step3' AND is_active = TRUE) as last_modified,
          (SELECT MIN(id) FROM content_items WHERE screen_location = 'mortgage_step3' AND is_active = TRUE) as representative_id,
          (SELECT DISTINCT page_number FROM content_items WHERE screen_location = 'mortgage_step3' AND is_active = TRUE LIMIT 1) as page_number
        UNION ALL
        SELECT 
          'step.4.program_selection' as step_group,
          'Выбор программ ипотеки' as title_ru,
          'בחירת תוכניות משכנתא' as title_he,
          'Mortgage Program Selection' as title_en,
          (SELECT COUNT(*) FROM content_items WHERE screen_location = 'mortgage_step4' AND is_active = TRUE AND component_type != 'option') as action_count,
          (SELECT MAX(updated_at) FROM content_items WHERE screen_location = 'mortgage_step4' AND is_active = TRUE) as last_modified,
          (SELECT MIN(id) FROM content_items WHERE screen_location = 'mortgage_step4' AND is_active = TRUE) as representative_id,
          (SELECT DISTINCT page_number FROM content_items WHERE screen_location = 'mortgage_step4' AND is_active = TRUE LIMIT 1) as page_number
      )
      SELECT 
        sc.representative_id as id,
        sc.step_group as content_key,
        'step' as component_type,
        'mortgage_steps' as category,
        'mortgage_calculation' as screen_location,
        sc.title_ru as description,
        true as is_active,
        sc.action_count,
        sc.title_ru,
        sc.title_he,  
        sc.title_en,
        sc.last_modified as updated_at,
        sc.page_number
      FROM step_counts sc
      ORDER BY sc.step_group
    `);
    
    const mortgageContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      actionCount: row.action_count || 1,
      page_number: row.page_number,
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
        content_count: mortgageContent.length,
        mortgage_content: mortgageContent
      }
    });

  } catch (error) {
    console.error('Get mortgage content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get detailed content items for a specific mortgage step
 * GET /api/content/mortgage/drill/:stepId
 * Returns individual content items that belong to a specific step
 */
app.get('/api/content/mortgage/drill/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    
    console.log(`Fetching drill content for step ID: ${stepId}`);
    
    // Map step IDs to screen_locations - much cleaner!
    const stepMapping = {
      'step.1.calculator': 'mortgage_calculation',
      'step.2.personal_data': 'mortgage_step2', 
      'step.3.income_data': 'mortgage_step3',
      'step.4.program_selection': 'mortgage_step4'
    };

    const screenLocation = stepMapping[stepId];
    if (!screenLocation) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID: ${stepId}`
      });
    }

    // Get step title mapping
    const stepTitles = {
      'mortgage_calculation': 'Калькулятор ипотеки',
      'mortgage_step2': 'Анкета личных данных',  
      'mortgage_step3': 'Анкета доходов',
      'mortgage_step4': 'Выбор программ ипотеки'
    };

    // Use your suggested WHERE statement pattern with proper translation handling
    const contentResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [screenLocation]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this step'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: stepTitles[screenLocation],
        stepGroup: stepId,
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get drill content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * Update mortgage content item
 * PUT /api/content/mortgage/:id
 * Updates translations and dropdown options for a mortgage content item
 */
app.put('/api/content/mortgage/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { translations, dropdown_options } = req.body;
    
    console.log(`Updating mortgage content item ${id}`, { translations, dropdown_options });
    
    // Start transaction
    await safeQuery('BEGIN');
    
    try {
      // Update translations
      if (translations) {
        for (const [lang, value] of Object.entries(translations)) {
          await safeQuery(`
            INSERT INTO content_translations (content_item_id, language_code, content_value)
            VALUES ($1, $2, $3)
            ON CONFLICT (content_item_id, language_code)
            DO UPDATE SET content_value = $3, updated_at = CURRENT_TIMESTAMP
          `, [id, lang, value]);
        }
      }
      
      // Update dropdown options if provided
      if (dropdown_options && Array.isArray(dropdown_options)) {
        // First, get the content_key for this item
        const itemResult = await safeQuery(
          'SELECT content_key FROM content_items WHERE id = $1',
          [id]
        );
        
        if (itemResult.rows.length > 0) {
          const contentKey = itemResult.rows[0].content_key;
          
          // Delete existing options
          await safeQuery(`
            DELETE FROM content_translations 
            WHERE content_item_id IN (
              SELECT id FROM content_items 
              WHERE content_key LIKE $1 || '.option.%'
            )
          `, [contentKey]);
          
          await safeQuery(`
            DELETE FROM content_items 
            WHERE content_key LIKE $1 || '.option.%'
          `, [contentKey]);
          
          // Insert new options
          for (const option of dropdown_options) {
            const optionKey = `${contentKey}.option.${option.order}`;
            
            // Create content item for option
            const optionResult = await safeQuery(`
              INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
              VALUES ($1, 'option', 'mortgage', 'mortgage_calculation', true)
              RETURNING id
            `, [optionKey]);
            
            const optionId = optionResult.rows[0].id;
            
            // Insert translations for option
            if (option.titleRu) {
              await safeQuery(`
                INSERT INTO content_translations (content_item_id, language_code, content_value)
                VALUES ($1, 'ru', $2)
              `, [optionId, option.titleRu]);
            }
            
            if (option.titleHe) {
              await safeQuery(`
                INSERT INTO content_translations (content_item_id, language_code, content_value)
                VALUES ($1, 'he', $2)
              `, [optionId, option.titleHe]);
            }
          }
        }
      }
      
      // Update the main item's updated_at timestamp
      await safeQuery(
        'UPDATE content_items SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      
      // Commit transaction
      await safeQuery('COMMIT');
      
      res.json({
        success: true,
        message: 'Mortgage content updated successfully'
      });
      
    } catch (error) {
      // Rollback on error
      await safeQuery('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Update mortgage content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get mortgage refinancing content
 * GET /api/content/mortgage-refi
 * Returns content for mortgage refinancing screen with dynamic translations from database
 */
app.get('/api/content/mortgage-refi', async (req, res) => {
  try {
    // Dynamic query that gets actual content from database instead of hard-coded titles
    const result = await safeQuery(`
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          -- Get title translations from the main title content for each screen
          COALESCE(
            (SELECT ct_ru.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_ru ON title_ci.id = ct_ru.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_ru.language_code = 'ru'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available Russian translation
            (SELECT ct_ru.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_ru ON fallback_ci.id = ct_ru.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_ru.language_code = 'ru'
               AND ct_ru.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1)
          ) as title_ru,
          COALESCE(
            (SELECT ct_he.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_he ON title_ci.id = ct_he.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_he.language_code = 'he'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available Hebrew translation
            (SELECT ct_he.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_he ON fallback_ci.id = ct_he.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_he.language_code = 'he'
               AND ct_he.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1)
          ) as title_he,
          COALESCE(
            (SELECT ct_en.content_value 
             FROM content_items title_ci 
             JOIN content_translations ct_en ON title_ci.id = ct_en.content_item_id
             WHERE title_ci.screen_location = ci.screen_location 
               AND title_ci.content_key LIKE '%.title'
               AND ct_en.language_code = 'en'
               AND title_ci.is_active = TRUE
             LIMIT 1),
            -- Fallback to first available English translation
            (SELECT ct_en.content_value 
             FROM content_items fallback_ci 
             JOIN content_translations ct_en ON fallback_ci.id = ct_en.content_item_id
             WHERE fallback_ci.screen_location = ci.screen_location
               AND ct_en.language_code = 'en'
               AND ct_en.content_value IS NOT NULL
               AND fallback_ci.is_active = TRUE
             LIMIT 1)
          ) as title_en
        FROM content_items ci
        WHERE ci.screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
          AND ci.is_active = TRUE
          AND ci.component_type != 'option'
        GROUP BY ci.screen_location
        HAVING COUNT(*) > 0
      )
      SELECT 
        ss.representative_id as id,
        ss.screen_location as content_key,
        'step' as component_type,
        'mortgage_refi_steps' as category,
        ss.screen_location,
        ss.page_number,
        COALESCE(ss.title_ru, ss.title_en, 'Unnamed Step') as description,
        true as is_active,
        ss.action_count,
        COALESCE(ss.title_ru, ss.title_en, 'Unnamed Step') as title_ru,
        COALESCE(ss.title_he, ss.title_en, 'Unnamed Step') as title_he,
        COALESCE(ss.title_en, ss.title_ru, 'Unnamed Step') as title_en,
        ss.last_modified as updated_at
      FROM screen_summaries ss
      ORDER BY ss.screen_location
    `);
    
    const mortgageRefiContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      actionCount: row.action_count || 1,
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
        content_count: mortgageRefiContent.length,
        mortgage_content: mortgageRefiContent
      }
    });

  } catch (error) {
    console.error('Get mortgage refi content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get detailed content items for a specific mortgage refinancing step
 * GET /api/content/mortgage-refi/drill/:stepId
 * Returns individual content items that belong to a specific refinancing step
 */
app.get('/api/content/mortgage-refi/drill/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    
    console.log(`Fetching mortgage-refi drill content for step ID: ${stepId}`);
    
    // Handle both old step IDs and new screen_location directly
    let screenLocation = stepId;
    
    // Map step IDs to actual screen_locations (keep original credit refinancing content)
    const stepMapping = {
      'step.1.calculator': 'refinance_credit_1',
      'step.2.personal_data': 'refinance_credit_2', 
      'step.3.income_data': 'refinance_credit_3',
      'step.4.program_selection': 'refinance_credit_4',
      'refinance_credit_1': 'refinance_credit_1',
      'refinance_credit_2': 'refinance_credit_2',
      'refinance_credit_3': 'refinance_credit_3',
      'refinance_credit_4': 'refinance_credit_4'
    };

    // Map step ID to the real screen_location with approved content
    if (stepMapping[stepId]) {
      screenLocation = stepMapping[stepId];
    }
    
    // Validate that this screen_location exists in our known refinancing screens
    const validScreenLocations = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
    if (!validScreenLocations.includes(screenLocation)) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID or screen location: ${stepId}`
      });
    }

    // Get individual content items for this refinancing step
    const contentResult = await safeQuery(`
      SELECT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.page_number,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en'
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [screenLocation]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this refinancing step'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    // Get the page title from the first available title translation or use a fallback
    let pageTitle = 'Unnamed Step';
    if (contentResult.rows.length > 0) {
      const firstTitle = contentResult.rows.find(row => 
        row.content_key && row.content_key.includes('.title') && row.title_ru
      );
      if (firstTitle) {
        pageTitle = firstTitle.title_ru;
      } else {
        // Fallback: use first available Russian translation
        const fallback = contentResult.rows.find(row => row.title_ru);
        if (fallback) {
          pageTitle = fallback.title_ru;
        }
      }
    }

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: pageTitle,
        stepGroup: stepId,
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get mortgage-refi drill content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Credit drill endpoint - get detailed content for specific credit step
 * GET /api/content/credit/drill/:stepId
 */
app.get('/api/content/credit/drill/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    
    console.log(`Fetching credit drill content for step ID: ${stepId}`);
    
    // Handle both old step IDs and new screen_location directly
    let screenLocation = stepId;
    
    // Map step IDs to actual screen_locations for credit content
    const stepMapping = {
      'step.1.calculator': 'refinance_credit_1',
      'step.2.personal_data': 'refinance_credit_2', 
      'step.3.income_data': 'refinance_credit_3',
      'step.4.program_selection': 'refinance_credit_4',
      'refinance_credit_1': 'refinance_credit_1',
      'refinance_credit_2': 'refinance_credit_2',
      'refinance_credit_3': 'refinance_credit_3',
      'refinance_credit_4': 'refinance_credit_4'
    };

    // Map step ID to the real screen_location
    if (stepMapping[stepId]) {
      screenLocation = stepMapping[stepId];
    }
    
    // Validate that this screen_location exists in our known credit screens
    const validScreenLocations = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
    if (!validScreenLocations.includes(screenLocation)) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID or screen location: ${stepId}`
      });
    }

    // Get individual content items for this credit step
    const contentResult = await safeQuery(`
      SELECT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.page_number,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en'
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [screenLocation]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this credit step'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    // Get the page title from the first available title translation or use a fallback
    let pageTitle = 'Unnamed Step';
    if (contentResult.rows.length > 0) {
      const firstTitle = contentResult.rows.find(row => 
        row.content_key && row.content_key.includes('.title') && row.title_ru
      );
      if (firstTitle) {
        pageTitle = firstTitle.title_ru;
      } else {
        // Fallback: use first available Russian translation
        const fallback = contentResult.rows.find(row => row.title_ru);
        if (fallback) {
          pageTitle = fallback.title_ru;
        }
      }
    }

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: pageTitle,
        stepGroup: stepId,
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get credit drill content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Credit-refi drill endpoint - get detailed content for specific credit refinancing step
 * GET /api/content/credit-refi/drill/:stepId
 */
app.get('/api/content/credit-refi/drill/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    
    console.log(`Fetching credit-refi drill content for step ID: ${stepId}`);
    
    // Handle both old step IDs and new screen_location directly
    let screenLocation = stepId;
    
    // Map step IDs to actual screen_locations for credit-refi content
    const stepMapping = {
      'step.1.calculator': 'refinance_credit_1',
      'step.2.personal_data': 'refinance_credit_2', 
      'step.3.income_data': 'refinance_credit_3',
      'step.4.program_selection': 'refinance_credit_4',
      'refinance_credit_1': 'refinance_credit_1',
      'refinance_credit_2': 'refinance_credit_2',
      'refinance_credit_3': 'refinance_credit_3',
      'refinance_credit_4': 'refinance_credit_4'
    };

    // Map step ID to the real screen_location
    if (stepMapping[stepId]) {
      screenLocation = stepMapping[stepId];
    }
    
    // Validate that this screen_location exists in our known credit-refi screens
    const validScreenLocations = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
    if (!validScreenLocations.includes(screenLocation)) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID or screen location: ${stepId}`
      });
    }

    // Get individual content items for this credit-refi step
    const contentResult = await safeQuery(`
      SELECT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.page_number,
        ci.description,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en'
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [screenLocation]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this credit-refi step'
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      actionNumber: row.action_number,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      description: row.description,
      is_active: row.is_active,
      last_modified: row.updated_at,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    // Get the page title from the first available title translation or use a fallback
    let pageTitle = 'Unnamed Step';
    if (contentResult.rows.length > 0) {
      const firstTitle = contentResult.rows.find(row => 
        row.content_key && row.content_key.includes('.title') && row.title_ru
      );
      if (firstTitle) {
        pageTitle = firstTitle.title_ru;
      } else {
        // Fallback: use first available Russian translation
        const fallback = contentResult.rows.find(row => row.title_ru);
        if (fallback) {
          pageTitle = fallback.title_ru;
        }
      }
    }

    // Count visible actions (excluding options like frontend does)
    const visibleActionCount = actions.filter(action => action.component_type !== 'option').length;

    res.json({
      success: true,
      data: {
        pageTitle: pageTitle,
        stepGroup: stepId,
        actionCount: visibleActionCount,
        actions: actions
      }
    });

  } catch (error) {
    console.error('Get credit-refi drill content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get dropdown options for mortgage-refi content
 * GET /api/content/mortgage-refi/{contentKey}/options
 */
app.get('/api/content/mortgage-refi/:contentKey/options', async (req, res) => {
  const { contentKey } = req.params;
  
  try {
    console.log('Fetching options for mortgage-refi content key:', contentKey);
    
    // Build the pattern for options based on the content key
    // If contentKey is an ID, we need to first get the actual content_key
    let actualContentKey = contentKey;
    
    // Check if contentKey is numeric (ID)
    if (!isNaN(contentKey)) {
      const keyResult = await safeQuery(`
        SELECT content_key 
        FROM content_items 
        WHERE id = $1
      `, [contentKey]);
      
      if (keyResult.rows.length > 0) {
        actualContentKey = keyResult.rows[0].content_key;
      }
    }
    
    console.log('Using mortgage-refi content key pattern:', `${actualContentKey}.option.%`);
    
    // Get all options for this mortgage-refi dropdown
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        CAST(
          SUBSTRING(ci.content_key FROM '\\.option\\.([0-9]+)$')
          AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location IN ('refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4')
        AND ci.component_type = 'option'
        AND ci.content_key LIKE $1
        AND ci.is_active = TRUE
      ORDER BY option_order NULLS LAST, ci.content_key
    `, [`${actualContentKey}.option.%`]);

    const options = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      option_order: row.option_order,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    res.json({
      success: true,
      data: {
        content_key: actualContentKey,
        options: options
      }
    });

  } catch (error) {
    console.error('Get mortgage-refi options error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Debug endpoint to check credit data
 * GET /api/debug/credit-data
 */
app.get('/api/debug/credit-data', async (req, res) => {
  try {
    // Check all credit-related screen locations
    const allCreditLocations = await safeQuery(`
      SELECT DISTINCT screen_location, COUNT(*) as count, 
             COUNT(DISTINCT CASE WHEN is_active = true THEN id END) as active_count
      FROM content_items 
      WHERE screen_location LIKE '%credit%' OR screen_location LIKE '%calculate%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    // Check specifically for credit_step locations
    const creditSteps = await safeQuery(`
      SELECT screen_location, content_key, component_type, is_active
      FROM content_items 
      WHERE screen_location IN ('credit_step1', 'credit_step2', 'credit_step3', 'credit_step4')
      ORDER BY screen_location, content_key
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        all_credit_locations: allCreditLocations.rows,
        credit_step_samples: creditSteps.rows,
        total_credit_steps: creditSteps.rowCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get credit calculation content
 * GET /api/content/credit
 * Returns content for credit calculation screen with translations
 */
app.get('/api/content/credit', async (req, res) => {
  try {
    console.log('🔍 Credit endpoint called');
    const result = await safeQuery(`
      SELECT DISTINCT
        ci.screen_location,
        COUNT(DISTINCT ci.id) as actionCount,
        MAX(ci.updated_at) as lastModified,
        -- Get titles for each language
        MAX(CASE WHEN ct.language_code = 'ru' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_ru,
        MAX(CASE WHEN ct.language_code = 'he' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_he,
        MAX(CASE WHEN ct.language_code = 'en' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
        AND ci.is_active = true
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `);

    console.log('📊 Query result rows:', result.rows.length);
    console.log('📋 First few rows:', result.rows.slice(0, 3));

    // Map the aggregated results to the expected format
    const creditContent = result.rows.map((row, index) => ({
      id: index + 1,
      content_key: `${row.screen_location}_aggregated`,
      component_type: 'page',
      category: 'page',
      screen_location: row.screen_location,
      description: `Aggregated content for ${row.screen_location}`,
      is_active: true,
      actionCount: parseInt(row.actioncount) || 0,
      translations: {
        ru: row.title_ru || `Кредит - ${row.screen_location}`,
        he: row.title_he || `אשראי - ${row.screen_location}`,
        en: row.title_en || `Credit - ${row.screen_location}`
      },
      last_modified: row.lastmodified || new Date().toISOString()
    }));

    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: creditContent.length,
        credit_content: creditContent
      }
    });
  } catch (error) {
    console.error('Get credit content error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get credit refinancing content
 * GET /api/content/credit-refi
 * Returns content for credit refinancing screens with translations
 */
app.get('/api/content/credit-refi', async (req, res) => {
  try {
    const result = await safeQuery(`
      SELECT DISTINCT
        ci.screen_location,
        COUNT(DISTINCT ci.id) as actionCount,
        MAX(ci.updated_at) as lastModified,
        -- Get titles for each language
        MAX(CASE WHEN ct.language_code = 'ru' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_ru,
        MAX(CASE WHEN ct.language_code = 'he' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_he,
        MAX(CASE WHEN ct.language_code = 'en' AND ci.content_key LIKE '%title%' THEN ct.content_value END) as title_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'refinance_credit_1',
        'refinance_credit_2',
        'refinance_credit_3',
        'refinance_credit_4'
      )
        AND ci.is_active = true
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `);

    const creditRefiContent = result.rows.map(row => ({
      id: row.screen_location, // Using screen_location as unique identifier
      content_key: row.screen_location,
      component_type: 'step',
      category: 'credit_refi_steps',
      screen_location: row.screen_location,
      description: row.title_ru || row.title_en || row.title_he || 'Credit Refi Step',
      is_active: true,
      action_count: row.actioncount,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      },
      last_modified: row.lastmodified
    }));

    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: creditRefiContent.length,
        credit_refi_items: creditRefiContent
      }
    });
  } catch (error) {
    console.error('Get credit-refi content error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get site pages summary for ContentMain dashboard
 * GET /api/content/site-pages
 * Returns aggregated page data with action counts and last modified dates
 */
app.get('/api/content/site-pages', async (req, res) => {
  try {
    console.log('🔄 Fetching site pages summary...');
    
    // Define the page mapping based on Confluence documentation
    const pageMapping = {
      'main': { title: 'Главная', pageNumber: 1, path: '/content/main' },
      'menu': { title: 'Меню', pageNumber: 2, path: '/content/menu' },
      'mortgage': { title: 'Рассчитать ипотеку', pageNumber: 3, path: '/content/mortgage' },
      'mortgage_refi': { title: 'Рефинансирование ипотеки', pageNumber: 4, path: '/content/mortgage-refi' },
      'credit': { title: 'Расчет кредита', pageNumber: 5, path: '/content/credit' },
      'credit_refi': { title: 'Рефинансирование кредита', pageNumber: 6, path: '/content/credit-refi' },
      'general': { title: 'Общие страницы', pageNumber: 7, path: '/content/general' }
    };

    // Query to get aggregated data per screen_location
    const result = await safeQuery(`
      SELECT 
        CASE 
          WHEN ci.screen_location LIKE 'mortgage_step%' THEN 'mortgage'
          WHEN ci.screen_location LIKE 'mortgage_refi%' THEN 'mortgage_refi'
          WHEN ci.screen_location LIKE 'credit_step%' THEN 'credit'
          WHEN ci.screen_location LIKE 'credit_refi%' THEN 'credit_refi'
          WHEN ci.screen_location LIKE 'menu%' THEN 'menu'
          WHEN ci.screen_location LIKE 'main%' THEN 'main'
          ELSE 'general'
        END as screen_group,
        COUNT(DISTINCT ci.id) as action_count,
        MAX(GREATEST(ci.updated_at, ct.updated_at)) as last_modified
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
      GROUP BY screen_group
      ORDER BY screen_group
    `);

    // Transform the results into the expected format
    const sitePages = [];
    
    // Add pages from database results
    result.rows.forEach(row => {
      const pageInfo = pageMapping[row.screen_group];
      if (pageInfo) {
        sitePages.push({
          id: row.screen_group,
          title: pageInfo.title,
          pageNumber: pageInfo.pageNumber,
          actionCount: parseInt(row.action_count) || 0,
          lastModified: row.last_modified ? 
            new Date(row.last_modified).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            }) : 
            new Date().toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric', 
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            }),
          path: pageInfo.path
        });
      }
    });

    // Add any missing pages with zero counts
    Object.keys(pageMapping).forEach(screenGroup => {
      if (!sitePages.find(page => page.id === screenGroup)) {
        const pageInfo = pageMapping[screenGroup];
        sitePages.push({
          id: screenGroup,
          title: pageInfo.title,
          pageNumber: pageInfo.pageNumber,
          actionCount: 0,
          lastModified: new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
          }),
          path: pageInfo.path
        });
      }
    });

    // Sort by page number
    sitePages.sort((a, b) => a.pageNumber - b.pageNumber);

    console.log(`✅ Found ${sitePages.length} site pages`);

    res.json({
      success: true,
      data: sitePages
    });

  } catch (error) {
    console.error('❌ Error fetching site pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site pages'
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
  if (pool) {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  } else {
    console.log('Database pool not initialized, skipping close.');
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (pool) {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  } else {
    console.log('Database pool not initialized, skipping close.');
    process.exit(0);
  }
});

// Start server with database initialization
async function startServer() {
  console.log(`🚀 Starting BankIM Content API server...`);
  
  // Initialize database connection
  await initializeDatabase();
  
  app.listen(port, () => {
    console.log(`BankIM Content API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${isConnected ? 'Connected' : 'Offline mode'}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;