const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4002', 'http://localhost:4003', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/bankim_content',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Helper function for safe database queries
const safeQuery = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Get mortgage refinancing content
 * GET /api/content/mortgage-refi
 * Returns content for mortgage refinancing screen with dynamic translations from database
 */
app.get('/api/content/mortgage-refi', async (req, res) => {
  try {
    console.log('🔄 Fetching mortgage-refi content from database...');
    
    // Use clean screen_location based approach
    const result = await safeQuery(`
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          -- Get title translations from the main title content for each screen
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Рефинансирование ипотеки'
            WHEN 'refinance_mortgage_2' THEN 'Личная информация'
            WHEN 'refinance_mortgage_3' THEN 'Доходы и занятость'
            WHEN 'refinance_mortgage_4' THEN 'Результаты и выбор'
            ELSE ci.screen_location
          END as title_ru,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'מימון משכנתא'
            WHEN 'refinance_mortgage_2' THEN 'מידע אישי'
            WHEN 'refinance_mortgage_3' THEN 'הכנסות ותעסוקה'
            WHEN 'refinance_mortgage_4' THEN 'תוצאות ובחירה'
            ELSE ci.screen_location
          END as title_he,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Property & mortgage details'
            WHEN 'refinance_mortgage_2' THEN 'Personal information'
            WHEN 'refinance_mortgage_3' THEN 'Income & employment'
            WHEN 'refinance_mortgage_4' THEN 'Results & selection'
            ELSE ci.screen_location
          END as title_en
        FROM content_items ci
        WHERE ci.screen_location LIKE 'refinance_mortgage_%'
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
    
    console.log(`🔍 Mortgage-refi query returned ${result.rows.length} rows`);
    if (result.rows.length > 0) {
      console.log('📋 First row sample:', result.rows[0]);
    }
    
    const mortgageRefiContent = result.rows.map(row => ({
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
      last_modified: row.updated_at,
      lastModified: row.updated_at  // Add both formats for compatibility
    }));

    console.log(`✅ Formatted ${mortgageRefiContent.length} mortgage-refi items`);
    
    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: mortgageRefiContent.length,
        mortgage_refi_items: mortgageRefiContent  // Changed from mortgage_content to mortgage_refi_items
      }
    });
    
    console.log('✅ Successfully returned mortgage-refi content');
  } catch (error) {
    console.error('❌ Get mortgage-refi content error:', error);
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
    
    // Map old step IDs to actual screen_locations if needed (for backwards compatibility)
    const legacyStepMapping = {
      'step.1.calculator': 'refinance_mortgage_1',
      'step.2.personal_data': 'refinance_mortgage_2', 
      'step.3.income_data': 'refinance_mortgage_3',
      'step.4.program_selection': 'refinance_mortgage_4'
    };

    // If it's a legacy step ID, map it to the real screen_location
    if (legacyStepMapping[stepId]) {
      screenLocation = legacyStepMapping[stepId];
    }
    
    // Validate that this screen_location exists in our known refinancing screens
    // Note: Only refinance_mortgage_1 currently exists in the database
    const validScreenLocations = ['refinance_mortgage_1'];
    if (!validScreenLocations.includes(screenLocation) && !screenLocation.startsWith('refinance_mortgage_')) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID or screen location: ${stepId}. Only refinance_mortgage_1 is currently available.`
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
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status = 'approved'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status = 'approved'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status = 'approved'
      WHERE ci.screen_location = $1
        AND ci.is_active = true
        AND ci.component_type != 'option'
      ORDER BY ci.content_key
    `, [screenLocation]);

    if (!contentResult.rows || contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No content found for step: ${stepId}`
      });
    }

    const actions = contentResult.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      is_active: row.is_active,
      updated_at: row.updated_at,
      action_number: row.action_number,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    res.json({
      success: true,
      data: {
        status: 'success',
        step_id: stepId,
        screen_location: screenLocation,
        action_count: actions.length,
        lastModified: new Date().toISOString(),
        actions: actions
      }
    });

  } catch (error) {
    console.error('❌ Get mortgage-refi drill content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get regular mortgage content
 * GET /api/content/mortgage
 * Returns content for regular mortgage screen with dynamic translations from database
 */
app.get('/api/content/mortgage', async (req, res) => {
  try {
    console.log('🔄 Fetching mortgage content from database...');
    
    // Use clean screen_location based approach for regular mortgage content
    const result = await safeQuery(`
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          -- Get title translations from the main title content for each screen
          CASE ci.screen_location
            WHEN 'mortgage_step1' THEN 'Ипотека - Шаг 1'
            WHEN 'mortgage_step2' THEN 'Ипотека - Шаг 2'
            WHEN 'mortgage_step3' THEN 'Ипотека - Шаг 3'
            WHEN 'mortgage_step4' THEN 'Ипотека - Шаг 4'
            ELSE ci.screen_location
          END as title_ru,
          CASE ci.screen_location
            WHEN 'mortgage_step1' THEN 'משכנתא - שלב 1'
            WHEN 'mortgage_step2' THEN 'משכנתא - שלב 2'
            WHEN 'mortgage_step3' THEN 'משכנתא - שלב 3'
            WHEN 'mortgage_step4' THEN 'משכנתא - שלב 4'
            ELSE ci.screen_location
          END as title_he,
          CASE ci.screen_location
            WHEN 'mortgage_step1' THEN 'Mortgage - Step 1'
            WHEN 'mortgage_step2' THEN 'Mortgage - Step 2'
            WHEN 'mortgage_step3' THEN 'Mortgage - Step 3'
            WHEN 'mortgage_step4' THEN 'Mortgage - Step 4'
            ELSE ci.screen_location
          END as title_en
        FROM content_items ci
        WHERE ci.screen_location ~ '^mortgage_step[1-4]$'
          AND ci.is_active = TRUE
          AND ci.component_type != 'option'
        GROUP BY ci.screen_location
        HAVING COUNT(*) > 0
      )
      SELECT 
        ss.representative_id as id,
        ss.screen_location as content_key,
        'step' as component_type,
        'mortgage_steps' as category,
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
    
    console.log(`🔍 Mortgage query returned ${result.rows.length} rows`);
    if (result.rows.length > 0) {
      console.log('📋 First row sample:', result.rows[0]);
    }
    
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
      last_modified: row.updated_at,
      lastModified: row.updated_at  // Add both formats for compatibility
    }));

    console.log(`✅ Formatted ${mortgageContent.length} mortgage items`);
    
    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: mortgageContent.length,
        mortgage_content: mortgageContent
      }
    });
    
    console.log('✅ Successfully returned mortgage content');
  } catch (error) {
    console.error('❌ Get mortgage content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get all mortgage content items
 * GET /api/content/mortgage/all-items
 * Returns all individual content items for mortgage workflow
 */
app.get('/api/content/mortgage/all-items', async (req, res) => {
  try {
    console.log('🔄 Fetching all mortgage content items from database...');
    
    // Get all content items for mortgage steps
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.page_number,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (PARTITION BY ci.screen_location ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status = 'approved'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status = 'approved'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status = 'approved'
      WHERE ci.screen_location ~ '^mortgage_step[1-4]$'
        AND ci.is_active = true
        AND ci.component_type != 'option'
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    console.log(`🔍 All mortgage items query returned ${result.rows.length} rows`);
    
    const allMortgageItems = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      is_active: row.is_active,
      updated_at: row.updated_at,
      action_number: row.action_number,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));

    console.log(`✅ Formatted ${allMortgageItems.length} all mortgage items`);
    
    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: allMortgageItems.length,
        all_items: allMortgageItems
      }
    });
    
    console.log('✅ Successfully returned all mortgage content items');
  } catch (error) {
    console.error('❌ Get all mortgage content items error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, password: password ? '[REDACTED]' : 'MISSING' });
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Mock user validation for development
    // In production, check against your user database
    if (email === 'admin@bankim.com' && password === 'admin123') {
      const user = {
        id: 1,
        email: 'admin@bankim.com',
        name: 'Admin User',
        role: 'administrator'
      };

      req.session.user = user;
      
      console.log('✅ Login successful for:', email);
      res.json({
        success: true,
        data: { user }
      });
    } else {
      console.log('❌ Invalid credentials for:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Could not log out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      data: { user: req.session.user }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});