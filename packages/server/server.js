const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();
const PORT = 4000; // Force port 4000 for development

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
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

// Language validation utility
const SUPPORTED_LANGUAGES = ['ru', 'he', 'en'];
const DEFAULT_LANGUAGE = 'en';

function validateLanguage(lang) {
  if (!lang) return { isValid: true, language: DEFAULT_LANGUAGE, isValidFormat: true };
  
  if (typeof lang !== 'string' || lang.length > 10) {
    return { isValid: false, error: 'Invalid language parameter format', isValidFormat: false };
  }
  
  const normalizedLang = lang.toLowerCase().trim();
  
  if (!SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    // For unsupported but valid format languages, fall back to default
    return { 
      isValid: true, 
      language: DEFAULT_LANGUAGE,
      isValidFormat: true,
      requestedLanguage: normalizedLang,
      usingFallback: true
    };
  }
  
  return { isValid: true, language: normalizedLang, isValidFormat: true, requestedLanguage: normalizedLang };
}

// Query performance monitoring
function logSlowQuery(queryName, startTime, rowCount = 0) {
  const duration = Date.now() - startTime;
  if (duration > 200) {
    console.warn(`⚠️ SLOW QUERY: ${queryName} took ${duration}ms (returned ${rowCount} rows)`);
  } else {
    console.log(`⚡ ${queryName}: ${duration}ms (${rowCount} rows)`);
  }
  return duration;
}

// Helper function for credit step descriptions
function getCreditStepDescription(screenLocation) {
  const descriptions = {
    'refinance_credit_1': 'Кредитные данные',
    'refinance_credit_2': 'Личная информация', 
    'refinance_credit_3': 'Доходы и занятость',
    'refinance_credit_4': 'Результаты и выбор'
  };
  return descriptions[screenLocation] || screenLocation;
}

// Helper function for credit step translations
function getCreditStepTranslations(screenLocation) {
  const translations = {
    'refinance_credit_1': {
      ru: 'Кредитные данные',
      he: 'נתוני אשראי',
      en: 'Credit details'
    },
    'refinance_credit_2': {
      ru: 'Личная информация',
      he: 'מידע אישי',
      en: 'Personal information'
    },
    'refinance_credit_3': {
      ru: 'Доходы и занятость',
      he: 'הכנסות ותעסוקה',
      en: 'Income & employment'
    },
    'refinance_credit_4': {
      ru: 'Результаты и выбор',
      he: 'תוצאות ובחירה',
      en: 'Results & selection'
    }
  };
  return translations[screenLocation] || {
    ru: screenLocation,
    he: screenLocation,
    en: screenLocation
  };
}

// Feature flags for rollback capability
const FEATURE_FLAGS = {
  ENABLE_IMPROVED_DRILL_ENDPOINTS: process.env.ENABLE_IMPROVED_DRILL_ENDPOINTS !== 'false', // Default enabled
  ENABLE_FALLBACK_LANGUAGE: process.env.ENABLE_FALLBACK_LANGUAGE !== 'false', // Default enabled
  ENABLE_TRANSLATION_STATS: process.env.ENABLE_TRANSLATION_STATS !== 'false' // Default enabled
};

console.log('🏁 Feature flags:', FEATURE_FLAGS);

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
    secure: false, // Allow cookies in development
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

// Import and setup banks endpoints
const setupBanksEndpoints = require('./endpoints/banks-endpoints');
setupBanksEndpoints(app, safeQuery);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Menu Content Endpoints - Must come before generic pattern routes
 */

// Menu content endpoint
app.get('/api/content/menu', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Fetching menu content...');
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location IN ('menu_navigation', 'navigation_menu', 'main_menu')
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
      ORDER BY ci.screen_location, ci.page_number, ci.id
    `);
    
    console.log(`🔍 Menu query returned ${result.rows.length} rows`);
    
    const menuContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru || 'Translation missing',
        he: row.text_he || 'Translation missing',
        en: row.text_en || 'Translation missing'
      },
      updated_at: row.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        status: 'success',
        items: menuContent,
        menu_content: menuContent,  // Add menu_content for frontend compatibility
        content_count: menuContent.length,  // Add content_count for frontend
        total_items: menuContent.length,
        screen_locations: ['menu_navigation', 'navigation_menu', 'main_menu']
      }
    });
    
    logSlowQuery(`menu-content`, startTime, menuContent.length);
    console.log(`✅ Successfully returned menu content (${menuContent.length} items)`);
  } catch (error) {
    logSlowQuery(`menu-content-ERROR`, startTime, 0);
    console.error('❌ Get menu content error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Menu translations endpoint 
app.get('/api/content/menu/translations', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Fetching menu translations...');
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.content_value,
        ct.status,
        ct.updated_at
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN ('menu_navigation', 'navigation_menu', 'main_menu')
        AND ci.is_active = TRUE
        AND ct.status IN ('approved', 'draft')
      ORDER BY ci.screen_location, ci.page_number, ci.id, ct.language_code
    `);
    
    console.log(`🔍 Menu translations query returned ${result.rows.length} rows`);
    
    const translationsMap = {};
    result.rows.forEach(row => {
      const key = `${row.screen_location}_${row.content_key}`;
      if (!translationsMap[key]) {
        translationsMap[key] = {
          id: row.id,
          content_key: row.content_key,
          screen_location: row.screen_location,
          translations: {}
        };
      }
      translationsMap[key].translations[row.language_code] = {
        value: row.content_value,
        status: row.status,
        updated_at: row.updated_at
      };
    });
    
    const menuTranslations = Object.values(translationsMap);
    
    res.json({
      success: true,
      data: {
        status: 'success',
        items: menuTranslations,
        total_items: menuTranslations.length,
        languages: ['ru', 'he', 'en']
      }
    });
    
    logSlowQuery(`menu-translations`, startTime, menuTranslations.length);
    console.log(`✅ Successfully returned menu translations (${menuTranslations.length} items)`);
  } catch (error) {
    logSlowQuery(`menu-translations-ERROR`, startTime, 0);
    console.error('❌ Get menu translations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Menu drill endpoint - for viewing items in a specific menu location or content_key
app.get('/api/content/menu/drill/:identifier', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { identifier } = req.params;
    const decodedIdentifier = decodeURIComponent(identifier);
    console.log(`🔄 Fetching menu drill content for: ${decodedIdentifier}`);
    
    // First, try to find if this is a content_key
    // If it starts with "menu.", it's likely a content_key
    const isContentKey = decodedIdentifier.startsWith('menu.');
    
    let result;
    if (isContentKey) {
      // For individual menu items, we should return empty or placeholder content
      // since these are menu items without drill-down content
      console.log(`📋 This is a menu item (${decodedIdentifier}), returning item details`);
      
      result = await pool.query(`
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.category,
          ci.screen_location,
          ci.is_active,
          ci.page_number,
          ci.updated_at,
          MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
          MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          AND ct.status IN ('approved', 'draft')
        WHERE ci.content_key = $1
          AND ci.is_active = TRUE
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
                 ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
        ORDER BY ci.page_number, ci.id
      `, [decodedIdentifier]);
    } else {
      // Original logic for screen_location
      result = await pool.query(`
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.category,
          ci.screen_location,
          ci.is_active,
          ci.page_number,
          ci.updated_at,
          MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
          MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          AND ct.status IN ('approved', 'draft')
        WHERE ci.screen_location = $1
          AND ci.is_active = TRUE
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
                 ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
        ORDER BY ci.page_number, ci.id
      `, [decodedIdentifier]);
    }
    
    console.log(`🔍 Menu drill query returned ${result.rows.length} rows for ${decodedIdentifier}`);
    
    const drillContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru || 'Translation missing',
        he: row.text_he || 'Translation missing',
        en: row.text_en || 'Translation missing'
      },
      updated_at: row.updated_at
    }));
    
    // Add action numbers to each item
    const drillContentWithNumbers = drillContent.map((item, index) => ({
      ...item,
      actionNumber: index + 1
    }));
    
    // Get page title from the first item's translation or use identifier
    const pageTitle = drillContent.length > 0 && drillContent[0].translations?.ru 
      ? drillContent[0].translations.ru 
      : `Menu: ${decodedIdentifier}`;
    
    res.json({
      success: true,
      data: {
        status: 'success',
        screen_location: decodedIdentifier,
        pageTitle: pageTitle,
        actionCount: drillContentWithNumbers.length,
        actions: drillContentWithNumbers,  // Frontend expects 'actions' not 'items'
        items: drillContentWithNumbers,  // Keep for backward compatibility
        total_items: drillContentWithNumbers.length
      }
    });
    
    logSlowQuery(`menu-drill-${decodedIdentifier}`, startTime, drillContent.length);
    console.log(`✅ Successfully returned menu drill content for ${decodedIdentifier} (${drillContent.length} items)`);
  } catch (error) {
    logSlowQuery(`menu-drill-ERROR`, startTime, 0);
    console.error('❌ Get menu drill content error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get mortgage refinancing content
 * GET /api/content/mortgage-refi
 * Returns content for mortgage refinancing screen with comprehensive step detection and fallback
 */
app.get('/api/content/mortgage-refi', async (req, res) => {
  try {
    console.log('🔄 Fetching mortgage-refi content from database with comprehensive step detection...');
    
    // Step 1: Try to find existing steps with relaxed filters
    console.log('📋 Step 1: Searching for existing refinance steps with relaxed filters...');
    const existingStepsResult = await safeQuery(`
      SELECT DISTINCT
        ci.screen_location,
        ci.component_type,
        COUNT(*) FILTER (WHERE ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')) OVER (PARTITION BY ci.screen_location) as action_count,
        MAX(ci.updated_at) OVER (PARTITION BY ci.screen_location) as last_modified,
        MIN(ci.id) OVER (PARTITION BY ci.screen_location) as representative_id,
        MIN(ci.page_number) OVER (PARTITION BY ci.screen_location) as page_number,
        ci.is_active
      FROM content_items ci
      WHERE (
        -- Current naming pattern
        ci.screen_location LIKE 'refinance_mortgage_%' OR
        -- Alternative naming patterns
        ci.screen_location LIKE 'refinance_step%' OR
        ci.screen_location LIKE 'mortgage_refi_%' OR
        ci.screen_location LIKE 'refi_step%' OR
        -- Legacy patterns
        ci.content_key LIKE '%refinance%' OR
        ci.content_key LIKE '%refi%'
      )
      -- Remove component_type filter to find steps that might be stored as 'option' or other types
      -- Remove is_active filter to find inactive steps
      ORDER BY ci.screen_location
    `);
    
    console.log(`🔍 Found ${existingStepsResult.rows.length} potential refinance step records`);
    if (existingStepsResult.rows.length > 0) {
      console.log('📋 Existing steps found:', existingStepsResult.rows.map(r => ({
        screen_location: r.screen_location,
        component_type: r.component_type,
        is_active: r.is_active,
        action_count: r.action_count
      })));
    }

    // Step 2: Check specifically for the expected 4 steps
    console.log('📋 Step 2: Checking for expected refinance_mortgage_1-4 steps...');
    const expectedSteps = ['refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4'];
    const stepCheckResult = await safeQuery(`
      SELECT 
        expected_step,
        EXISTS(SELECT 1 FROM content_items WHERE screen_location = expected_step) as exists_in_db,
        (SELECT COUNT(*) FROM content_items WHERE screen_location = expected_step) as item_count,
        (SELECT component_type FROM content_items WHERE screen_location = expected_step LIMIT 1) as sample_component_type,
        (SELECT is_active FROM content_items WHERE screen_location = expected_step LIMIT 1) as sample_is_active
      FROM (
        SELECT 'refinance_mortgage_1' as expected_step
        UNION ALL SELECT 'refinance_mortgage_2'
        UNION ALL SELECT 'refinance_mortgage_3'
        UNION ALL SELECT 'refinance_mortgage_4'
      ) steps
    `);
    
    console.log('📋 Step existence check:', stepCheckResult.rows.map(r => ({
      step: r.expected_step,
      exists: r.exists_in_db,
      count: r.item_count,
      type: r.sample_component_type,
      active: r.sample_is_active
    })));

    // Step 3: Try to get valid steps with comprehensive query
    console.log('📋 Step 3: Attempting to retrieve valid steps...');
    const validStepsResult = await safeQuery(`
      WITH step_data AS (
        SELECT 
          ci.screen_location,
          COUNT(*) FILTER (WHERE ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          -- Enhanced step titles with more descriptive content
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Рефинансирование ипотеки'
            WHEN 'refinance_mortgage_2' THEN 'Личная информация'
            WHEN 'refinance_mortgage_3' THEN 'Доходы и занятость'
            WHEN 'refinance_mortgage_4' THEN 'Результаты и выбор'
            ELSE COALESCE(INITCAP(REPLACE(REPLACE(ci.screen_location, '_', ' '), 'refinance', 'Рефинансирование')), 'Unnamed Step')
          END as title_ru,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'מימון משכנתא'
            WHEN 'refinance_mortgage_2' THEN 'מידע אישי'
            WHEN 'refinance_mortgage_3' THEN 'הכנסות ותעסוקה'
            WHEN 'refinance_mortgage_4' THEN 'תוצאות ובחירה'
            ELSE COALESCE(INITCAP(REPLACE(REPLACE(ci.screen_location, '_', ' '), 'refinance', 'מימון')), 'Unnamed Step')
          END as title_he,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Property & mortgage details'
            WHEN 'refinance_mortgage_2' THEN 'Personal information'
            WHEN 'refinance_mortgage_3' THEN 'Income & employment'
            WHEN 'refinance_mortgage_4' THEN 'Results & selection'
            ELSE COALESCE(INITCAP(REPLACE(REPLACE(ci.screen_location, '_', ' '), 'refinance', 'Refinance')), 'Unnamed Step')
          END as title_en
        FROM content_items ci
        WHERE ci.screen_location = ANY($1)
          -- Try with relaxed filters first
          AND (ci.is_active = TRUE OR ci.is_active IS NULL)
        GROUP BY ci.screen_location
        HAVING COUNT(*) > 0
      )
      SELECT 
        sd.representative_id as id,
        sd.screen_location as content_key,
        'step' as component_type,
        'mortgage_refi_steps' as category,
        sd.screen_location,
        sd.page_number,
        sd.title_ru as description,
        true as is_active,
        sd.action_count,
        sd.title_ru,
        sd.title_he,
        sd.title_en,
        sd.last_modified as updated_at
      FROM step_data sd
      ORDER BY sd.screen_location
    `, [expectedSteps]);
    
    console.log(`🔍 Valid steps query returned ${validStepsResult.rows.length} rows`);
    
    // Step 4: Create missing steps as placeholders if needed
    let finalSteps = [];
    const foundSteps = new Set(validStepsResult.rows.map(r => r.screen_location));
    
    // Add found steps
    finalSteps = [...validStepsResult.rows];
    
    // Add placeholder steps for missing ones
    const missingSteps = expectedSteps.filter(step => !foundSteps.has(step));
    console.log(`📋 Missing steps that need placeholders: ${missingSteps.join(', ')}`);
    
    if (missingSteps.length > 0) {
      console.log('📋 Step 4: Creating placeholder steps for missing ones...');
      
      const stepTitles = {
        'refinance_mortgage_1': {
          ru: 'Рефинансирование ипотеки',
          he: 'מימון משכנתא',
          en: 'Property & mortgage details'
        },
        'refinance_mortgage_2': {
          ru: 'Личная информация',
          he: 'מידע אישי',
          en: 'Personal information'
        },
        'refinance_mortgage_3': {
          ru: 'Доходы и занятость',
          he: 'הכנסות ותעסוקה',
          en: 'Income & employment'
        },
        'refinance_mortgage_4': {
          ru: 'Результаты и выбор',
          he: 'תוצאות ובחירה',
          en: 'Results & selection'
        }
      };
      
      missingSteps.forEach((step, _) => {
        const stepNumber = parseInt(step.replace('refinance_mortgage_', ''));
        const titles = stepTitles[step];
        
        finalSteps.push({
          id: 9000 + stepNumber, // Use high ID to avoid conflicts
          content_key: step,
          component_type: 'step',
          category: 'mortgage_refi_steps',
          screen_location: step,
          page_number: stepNumber,
          description: titles.ru,
          is_active: true,
          action_count: 0, // Placeholder has no actions yet
          title_ru: titles.ru,
          title_he: titles.he,
          title_en: titles.en,
          updated_at: new Date().toISOString()
        });
      });
      
      console.log(`📋 Added ${missingSteps.length} placeholder steps`);
    }
    
    // Sort final steps by screen_location to ensure correct order
    finalSteps.sort((a, b) => a.screen_location.localeCompare(b.screen_location));
    
    console.log(`📋 Final steps count: ${finalSteps.length}`);
    console.log('📋 Final steps:', finalSteps.map(s => ({
      screen_location: s.screen_location,
      title_en: s.title_en,
      action_count: s.action_count
    })));
    
    const mortgageRefiContent = finalSteps.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      actionCount: parseInt(row.action_count) || 0,
      page_number: row.page_number,
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      },
      last_modified: row.updated_at,
      lastModified: row.updated_at,
      // Add metadata to indicate if this is a placeholder
      is_placeholder: row.action_count === 0 && row.id >= 9000
    }));

    console.log(`✅ Formatted ${mortgageRefiContent.length} mortgage-refi items`);
    
    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: mortgageRefiContent.length,
        mortgage_refi_items: mortgageRefiContent,
        // Add diagnostic information
        diagnostics: {
          found_existing_steps: foundSteps.size,
          created_placeholder_steps: missingSteps.length,
          total_steps_returned: mortgageRefiContent.length,
          missing_steps: missingSteps,
          found_steps: Array.from(foundSteps)
        }
      }
    });
    
    console.log('✅ Successfully returned mortgage-refi content with comprehensive fallback');
  } catch (error) {
    console.error('❌ Get mortgage-refi content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get all individual mortgage refinancing content items
 * GET /api/content/mortgage-refi/all-items
 * Returns all individual content items for the refinance sections 4.1.2-4.1.14
 */
app.get('/api/content/mortgage-refi/all-items', async (req, res) => {
  try {
    console.log('🔄 Fetching all mortgage-refi content items from database...');
    
    // Query all content items for our refinance sections
    const refinanceItemsQuery = `
      SELECT DISTINCT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.page_number,
        ci.created_at,
        ci.updated_at,
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.confluence_title_he,
        nm.confluence_title_en,
        COUNT(ci.id) OVER (PARTITION BY ci.screen_location) as action_count,
        string_agg(ct.language_code || ':' || ct.content_value, '|||') as translations_data
      FROM content_items ci
      LEFT JOIN navigation_mapping nm ON ci.screen_location = nm.screen_location
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'refinance_step2', 'phone_verification_modal', 'personal_data_form', 'partner_personal_data',
        'partner_income_form', 'income_form_employed', 'co_borrower_personal_data', 'co_borrower_income',
        'loading_screen', 'program_selection', 'signup_form', 'login_page', 'password_reset'
      )
      AND ci.is_active = true
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location, 
               ci.description, ci.is_active, ci.page_number, ci.created_at, ci.updated_at,
               nm.confluence_num, nm.confluence_title_ru, nm.confluence_title_he, nm.confluence_title_en
      ORDER BY nm.confluence_num, ci.screen_location, ci.page_number, ci.content_key;
    `;
    
    const itemsResult = await safeQuery(refinanceItemsQuery);
    console.log(`🔍 Found ${itemsResult.rows.length} refinance content items`);
    
    // Process the results and group by screen_location to create the structure expected by frontend
    const screenLocationGroups = {};
    
    itemsResult.rows.forEach(row => {
      if (!screenLocationGroups[row.screen_location]) {
        screenLocationGroups[row.screen_location] = {
          screen_location: row.screen_location,
          confluence_num: row.confluence_num,
          confluence_title_ru: row.confluence_title_ru,
          confluence_title_he: row.confluence_title_he,
          confluence_title_en: row.confluence_title_en,
          action_count: row.action_count,
          last_modified: row.updated_at,
          items: []
        };
      }
      
      // Parse translations
      const translations = { ru: '', he: '', en: '' };
      if (row.translations_data) {
        row.translations_data.split('|||').forEach(trans => {
          const [lang, value] = trans.split(':');
          if (lang && value && Object.prototype.hasOwnProperty.call(translations, lang)) {
            translations[lang] = value;
          }
        });
      }
      
      screenLocationGroups[row.screen_location].items.push({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        category: row.category,
        screen_location: row.screen_location,
        description: row.description,
        is_active: row.is_active,
        page_number: row.page_number,
        created_at: row.created_at,
        updated_at: row.updated_at,
        translations: translations
      });
    });
    
    // Convert grouped data to the format expected by the frontend
    const formattedItems = Object.values(screenLocationGroups).map(group => ({
      id: group.items[0]?.id || group.screen_location,
      confluence_num: group.confluence_num,
      content_key: group.screen_location,
      component_type: 'section',
      category: 'refinance',
      screen_location: group.screen_location,
      description: group.confluence_title_ru || group.screen_location,
      is_active: true,
      page_number: parseInt(group.confluence_num?.replace(/\D/g, '') || '0'),
      actionCount: parseInt(group.action_count) || 0,
      contentType: 'section',
      translations: {
        ru: group.confluence_title_ru || '',
        he: group.confluence_title_he || '',
        en: group.confluence_title_en || ''
      },
      lastModified: group.last_modified,
      last_modified: group.last_modified,
      updated_at: group.last_modified
    }));
    
    console.log(`✅ Formatted ${formattedItems.length} refinance sections`);
    console.log('📋 Sections:', formattedItems.map(item => ({
      confluence_num: item.confluence_num,
      screen_location: item.screen_location,
      title: item.translations.ru,
      actionCount: item.actionCount
    })));
    
    res.json({
      success: true,
      data: formattedItems
    });
    
  } catch (error) {
    console.error('❌ Get mortgage-refi all-items error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all credit-refi items endpoint (all 14 pages - 6.1 through 6.1.14)
app.get('/api/content/credit-refi/all-items', async (req, res) => {
  try {
    console.log('🔄 Fetching all credit-refi content items from database...');
    
    // Query all content items for our credit-refi sections
    const creditRefiItemsQuery = `
      SELECT DISTINCT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.page_number,
        ci.created_at,
        ci.updated_at,
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.confluence_title_he,
        nm.confluence_title_en,
        COUNT(ci.id) OVER (PARTITION BY ci.screen_location) as action_count,
        string_agg(ct.language_code || ':' || ct.content_value, '|||') as translations_data
      FROM content_items ci
      LEFT JOIN navigation_mapping nm ON ci.screen_location = nm.screen_location
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'credit_refi_step1', 'credit_refi_step2', 'credit_refi_phone_verification', 
        'credit_refi_personal_data', 'credit_refi_partner_personal', 'credit_refi_partner_income', 
        'credit_refi_income_form', 'credit_refi_coborrower_personal', 'credit_refi_coborrower_income',
        'credit_refi_loading', 'credit_refi_program_selection', 'credit_refi_registration',
        'credit_refi_login', 'credit_refi_password_reset',
        -- Child pages
        'credit_refi_income_source_modal_1', 'credit_refi_income_source_modal_2', 
        'credit_refi_obligation_modal_1', 'credit_refi_registration_success_toast',
        'credit_refi_wrong_password_modal', 'credit_refi_account_locked_modal'
      )
      AND ci.is_active = true
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location, 
               ci.description, ci.is_active, ci.page_number, ci.created_at, ci.updated_at,
               nm.confluence_num, nm.confluence_title_ru, nm.confluence_title_he, nm.confluence_title_en
      ORDER BY nm.confluence_num, ci.screen_location, ci.page_number, ci.content_key;
    `;
    
    const itemsResult = await safeQuery(creditRefiItemsQuery);
    console.log(`🔍 Found ${itemsResult.rows.length} credit-refi content items`);
    
    // Process the results and group by screen_location to create the structure expected by frontend
    const screenLocationGroups = {};
    
    itemsResult.rows.forEach(row => {
      if (!screenLocationGroups[row.screen_location]) {
        screenLocationGroups[row.screen_location] = {
          screen_location: row.screen_location,
          confluence_num: row.confluence_num,
          confluence_title_ru: row.confluence_title_ru,
          confluence_title_he: row.confluence_title_he,
          confluence_title_en: row.confluence_title_en,
          action_count: row.action_count,
          last_modified: row.updated_at,
          items: []
        };
      }
      
      // Parse translations
      const translations = { ru: '', he: '', en: '' };
      if (row.translations_data) {
        row.translations_data.split('|||').forEach(trans => {
          const [lang, value] = trans.split(':');
          if (lang && value && Object.prototype.hasOwnProperty.call(translations, lang)) {
            translations[lang] = value;
          }
        });
      }
      
      screenLocationGroups[row.screen_location].items.push({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        category: row.category,
        screen_location: row.screen_location,
        description: row.description,
        is_active: row.is_active,
        page_number: row.page_number,
        created_at: row.created_at,
        updated_at: row.updated_at,
        translations: translations
      });
    });
    
    // Convert grouped data to the format expected by the frontend
    const formattedItems = Object.values(screenLocationGroups).map(group => ({
      id: group.items[0]?.id || group.screen_location,
      confluence_num: group.confluence_num,
      content_key: group.screen_location,
      component_type: 'section',
      category: 'credit_refi',
      screen_location: group.screen_location,
      description: group.confluence_title_ru || group.screen_location,
      is_active: true,
      page_number: parseInt(group.confluence_num?.replace(/\D/g, '') || '0'),
      actionCount: parseInt(group.action_count) || 0,  // Convert to number
      contentType: 'section',
      translations: {
        ru: group.confluence_title_ru || '',
        he: group.confluence_title_he || '',
        en: group.confluence_title_en || ''
      },
      lastModified: group.last_modified,
      last_modified: group.last_modified,
      updated_at: group.last_modified
    }));
    
    // Sort by confluence_num to ensure proper order (6.1, 6.1.2, ..., 6.1.14)
    formattedItems.sort((a, b) => {
      const numA = a.confluence_num === '6.1' ? 0 : parseFloat(a.confluence_num?.replace('6.1.', '') || '99');
      const numB = b.confluence_num === '6.1' ? 0 : parseFloat(b.confluence_num?.replace('6.1.', '') || '99');
      return numA - numB;
    });
    
    console.log(`✅ Formatted ${formattedItems.length} credit-refi sections`);
    console.log('📋 Sections:', formattedItems.map(item => ({
      confluence_num: item.confluence_num,
      screen_location: item.screen_location,
      title: item.translations.ru,
      actionCount: item.actionCount
    })));
    
    res.json({
      success: true,
      data: formattedItems
    });
    
  } catch (error) {
    console.error('❌ Get credit-refi all-items error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all credit items endpoint (all 14 pages - 5.1 through 5.1.14)
app.get('/api/content/credit/all-items', async (req, res) => {
  try {
    console.log('🔄 Fetching all credit content items from database...');
    
    // Query all content items for our credit sections
    const creditItemsQuery = `
      SELECT DISTINCT
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.description,
        ci.is_active,
        ci.page_number,
        ci.created_at,
        ci.updated_at,
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.confluence_title_he,
        nm.confluence_title_en,
        COUNT(ci.id) OVER (PARTITION BY ci.screen_location) as action_count,
        string_agg(ct.language_code || ':' || ct.content_value, '|||') as translations_data
      FROM content_items ci
      LEFT JOIN navigation_mapping nm ON ci.screen_location = nm.screen_location
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'credit_step1', 'credit_phone_verification', 'credit_personal_data', 'credit_partner_personal',
        'credit_partner_income', 'credit_income_employed', 'credit_coborrower_personal', 'credit_coborrower_income',
        'credit_loading_screen', 'credit_program_selection', 'credit_summary', 'credit_registration_page',
        'credit_login_page', 'reset_password_page'
      )
      AND ci.is_active = true
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location, 
               ci.description, ci.is_active, ci.page_number, ci.created_at, ci.updated_at,
               nm.confluence_num, nm.confluence_title_ru, nm.confluence_title_he, nm.confluence_title_en
      ORDER BY nm.confluence_num, ci.screen_location, ci.page_number, ci.content_key;
    `;
    
    const itemsResult = await safeQuery(creditItemsQuery);
    console.log(`🔍 Found ${itemsResult.rows.length} credit content items`);
    
    // Process the results and group by screen_location to create the structure expected by frontend
    const screenLocationGroups = {};
    
    itemsResult.rows.forEach(row => {
      if (!screenLocationGroups[row.screen_location]) {
        screenLocationGroups[row.screen_location] = {
          screen_location: row.screen_location,
          confluence_num: row.confluence_num,
          confluence_title_ru: row.confluence_title_ru,
          confluence_title_he: row.confluence_title_he,
          confluence_title_en: row.confluence_title_en,
          action_count: row.action_count,
          last_modified: row.updated_at,
          items: []
        };
      }
      
      // Parse translations
      const translations = { ru: '', he: '', en: '' };
      if (row.translations_data) {
        row.translations_data.split('|||').forEach(trans => {
          const [lang, value] = trans.split(':');
          if (lang && value && Object.prototype.hasOwnProperty.call(translations, lang)) {
            translations[lang] = value;
          }
        });
      }
      
      screenLocationGroups[row.screen_location].items.push({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        category: row.category,
        screen_location: row.screen_location,
        description: row.description,
        is_active: row.is_active,
        page_number: row.page_number,
        created_at: row.created_at,
        updated_at: row.updated_at,
        translations: translations
      });
    });
    
    // Convert grouped data to the format expected by the frontend
    const formattedItems = Object.values(screenLocationGroups).map(group => ({
      id: group.items[0]?.id || group.screen_location,
      confluence_num: group.confluence_num,
      content_key: group.screen_location,
      component_type: 'section',
      category: 'credit',
      screen_location: group.screen_location,
      description: group.confluence_title_ru || group.screen_location,
      is_active: true,
      page_number: parseInt(group.confluence_num?.replace(/\D/g, '') || '0'),
      actionCount: parseInt(group.action_count) || 0,
      contentType: 'section',
      translations: {
        ru: group.confluence_title_ru || '',
        he: group.confluence_title_he || '',
        en: group.confluence_title_en || ''
      },
      lastModified: group.last_modified,
      last_modified: group.last_modified,
      updated_at: group.last_modified
    }));
    
    console.log(`✅ Formatted ${formattedItems.length} credit sections`);
    console.log('📋 Sections:', formattedItems.map(item => ({
      confluence_num: item.confluence_num,
      screen_location: item.screen_location,
      title: item.translations.ru,
      actionCount: item.actionCount
    })));
    
    res.json({
      success: true,
      data: formattedItems
    });
    
  } catch (error) {
    console.error('❌ Get credit all-items error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get credit refinancing content
 * GET /api/content/credit-refi
 * Returns content for credit refinancing screen with comprehensive step detection and fallback
 */
app.get('/api/content/credit-refi', async (req, res) => {
  try {
    console.log('🔄 Fetching credit-refi content from database with comprehensive step detection...');
    
    // Step 1: Try to find existing steps with relaxed filters
    console.log('📋 Step 1: Searching for existing refinance credit steps...');
    const existingStepsResult = await safeQuery(`
      SELECT 
        ci.screen_location,
        COUNT(*) FILTER (WHERE ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')) as action_count,
        MAX(ci.updated_at) as last_modified,
        MIN(ci.id) as representative_id,
        MIN(ci.page_number) as page_number,
        MAX(ci.is_active::int)::boolean as is_active
      FROM content_items ci
      WHERE (
        -- Primary naming pattern found in your database
        ci.screen_location LIKE 'refinance_credit_%' OR
        -- Alternative patterns
        ci.screen_location LIKE 'credit_refi_%' OR
        ci.screen_location LIKE 'refinance_credit_step%'
      )
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `);

    console.log(`🔍 Found ${existingStepsResult.rows.length} potential credit refinance step records`);


    // Format the response exactly like mortgage-refi
    const creditRefiContent = existingStepsResult.rows.map(row => ({
      id: row.representative_id?.toString(),
      content_key: row.screen_location,
      component_type: 'step',
      category: 'credit_refi_steps',
      screen_location: row.screen_location,
      description: getCreditStepDescription(row.screen_location),
      is_active: row.is_active,
      actionCount: parseInt(row.action_count) || 0,
      page_number: row.page_number?.toString() || "1.0",
      translations: getCreditStepTranslations(row.screen_location),
      last_modified: row.last_modified,
      lastModified: row.last_modified,
      is_placeholder: false
    }));

    console.log(`✅ Formatted ${creditRefiContent.length} credit-refi items`);

    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: creditRefiContent.length,
        credit_refi_items: creditRefiContent,
        diagnostics: {
          found_existing_steps: creditRefiContent.length,
          created_placeholder_steps: 0,
          total_steps_returned: creditRefiContent.length,
          missing_steps: [],
          found_steps: creditRefiContent.map(item => item.screen_location)
        }
      }
    });

    console.log('✅ Successfully returned credit-refi content');

  } catch (error) {
    console.error('❌ Get credit-refi content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get credit dropdown options by content key
 * GET /api/content/credit/:contentKey/options
 * Returns dropdown options for a specific credit content item
 */
app.get('/api/content/credit/:contentKey/options', async (req, res) => {
  try {
    const { contentKey } = req.params;
    console.log(`🔄 Fetching dropdown options for credit content key: ${contentKey}`);

    // Query for ONLY dropdown options related to this specific dropdown
    // Credit uses dot notation: credit_step1.field.loan_purpose
    // Options are: credit_step1.field.loan_purpose.option_name
    const basePattern = contentKey; // Use the key as-is for credit
    
    const optionsResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as titleRu,
        ct_he.content_value as titleHe,
        ct_en.content_value as titleEn,
        jsonb_build_object(
          'ru', COALESCE(ct_ru.content_value, ''),
          'he', COALESCE(ct_he.content_value, ''),
          'en', COALESCE(ct_en.content_value, '')
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.component_type IN ('option', 'dropdown_option', 'field_option')
        AND ci.content_key LIKE $1 || '.%'
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [basePattern]);

    console.log(`📋 Found ${optionsResult.rows.length} potential dropdown options for content key: ${contentKey}`);

    if (optionsResult.rows.length > 0) {
      // Format the response to match expected API format
      const options = optionsResult.rows.map(row => ({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        titleRu: row.titleru || '',
        titleHe: row.titlehe || '',
        titleEn: row.titleen || '',
        translations: row.translations,
        is_active: row.is_active,
        updated_at: row.updated_at
      }));

      console.log(`✅ Returning ${options.length} dropdown options for credit content`);
      res.json({
        success: true,
        data: options
      });
    } else {
      // Return empty array but successful response - frontend will handle fallback
      console.log(`⚠️ No dropdown options found for content key: ${contentKey}, returning empty array`);
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Get credit dropdown options error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get credit-refi dropdown options by content key
 * GET /api/content/credit-refi/:contentKey/options
 * Returns dropdown options for a specific credit-refi content item
 */
app.get('/api/content/credit-refi/:contentKey/options', async (req, res) => {
  const { contentKey } = req.params;
  
  try {
    console.log(`🔄 Fetching credit-refi dropdown options for contentKey: ${contentKey}`);
    
    // Extract base pattern (remove _label or _ph suffix if present) 
    const basePattern = contentKey.replace(/_label$|_ph$/, '');
    console.log(`🔍 Searching for options with base pattern: ${basePattern}`);

    // Query for dropdown options with flexible pattern matching
    const optionsResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as titleRu,
        ct_he.content_value as titleHe,
        ct_en.content_value as titleEn,
        jsonb_build_object(
          'ru', COALESCE(ct_ru.content_value, ''),
          'he', COALESCE(ct_he.content_value, ''),
          'en', COALESCE(ct_en.content_value, '')
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.component_type = 'option'
        AND ci.content_key LIKE $1 || '%'
        AND ci.is_active = true
        AND ci.content_key != $1
      ORDER BY ci.content_key
    `, [basePattern]);

    if (optionsResult.rows.length > 0) {
      const options = optionsResult.rows.map(row => ({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        ru: row.titleru || row.translations?.ru || '',
        he: row.titlehe || row.translations?.he || '',
        en: row.titleen || row.translations?.en || '',
        titleRu: row.titleru || '',
        titleHe: row.titlehe || '',
        titleEn: row.titleen || '',
        translations: row.translations,
        is_active: row.is_active,
        updated_at: row.updated_at
      }));

      console.log(`✅ Returning ${options.length} dropdown options for credit-refi content`);
      res.json({
        success: true,
        data: options
      });
    } else {
      // Return empty array but successful response - frontend will handle fallback
      console.log(`⚠️ No dropdown options found for content key: ${contentKey}, returning empty array`);
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Get credit-refi dropdown options error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get regular credit content
 * GET /api/content/credit
 */
app.get('/api/content/credit', async (req, res) => {
  try {
    console.log('🔄 Fetching credit content from database...');

    const result = await safeQuery(`
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          CASE ci.screen_location
            WHEN 'credit_step1' THEN 'Кредит - Шаг 1'
            WHEN 'credit_step2' THEN 'Кредит - Шаг 2'
            WHEN 'credit_step3' THEN 'Кредит - Шаг 3'
            ELSE ci.screen_location
          END as title_ru,
          CASE ci.screen_location
            WHEN 'credit_step1' THEN 'אשראי - שלב 1'
            WHEN 'credit_step2' THEN 'אשראי - שלב 2'
            WHEN 'credit_step3' THEN 'אשראי - שלב 3'
            ELSE ci.screen_location
          END as title_he,
          CASE ci.screen_location
            WHEN 'credit_step1' THEN 'Credit - Step 1'
            WHEN 'credit_step2' THEN 'Credit - Step 2'
            WHEN 'credit_step3' THEN 'Credit - Step 3'
            ELSE ci.screen_location
          END as title_en
        FROM content_items ci
        WHERE ci.screen_location ~ '^credit_step[1-3]$'
          AND ci.is_active = TRUE
          AND ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')
        GROUP BY ci.screen_location
      )
      SELECT * FROM screen_summaries ORDER BY screen_location;
    `);

    const creditContent = result.rows.map(row => ({
      id: row.representative_id?.toString(),
      content_key: row.screen_location,
      translations: {
        ru: row.title_ru,
        he: row.title_he,
        en: row.title_en
      },
      actionCount: parseInt(row.action_count) || 0,
      last_modified: row.last_modified,
      page_number: row.page_number?.toString() || "1.0"
    }));

    console.log(`✅ Formatted ${creditContent.length} credit items`);

    res.json({
      success: true,
      data: {
        status: 'success',
        content_count: creditContent.length,
        credit_items: creditContent
      }
    });

  } catch (error) {
    console.error('❌ Get credit content error:', error);
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
    
    // Validate that this screen_location is a valid refinancing screen
    // Supporting both old refinance_mortgage_ and new refinance_ patterns from 4.1.x series
    const validScreenLocations = [
      'refinance_step2', 'phone_verification_modal', 'personal_data_form', 'partner_personal_data',
      'partner_income_form', 'income_form_employed', 'co_borrower_personal_data', 'co_borrower_income',
      'loading_screen', 'program_selection', 'signup_form', 'login_page', 'password_reset',
      'refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4'
    ];
    
    // Allow any screen that starts with refinance_ or is in the valid list
    if (!validScreenLocations.includes(screenLocation) && 
        !screenLocation.startsWith('refinance_') && 
        !screenLocation.startsWith('phone_') && 
        !screenLocation.startsWith('personal_') &&
        !screenLocation.startsWith('partner_') &&
        !screenLocation.startsWith('income_') &&
        !screenLocation.startsWith('co_borrower_') &&
        !screenLocation.startsWith('loading_') &&
        !screenLocation.startsWith('program_') &&
        !screenLocation.startsWith('signup_') &&
        !screenLocation.startsWith('login_') &&
        !screenLocation.startsWith('password_')) {
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
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1
        AND ci.is_active = true
      ORDER BY ci.content_key
    `, [screenLocation]);

    // Handle case where no content exists for this step yet
    if (!contentResult.rows || contentResult.rows.length === 0) {
      console.log(`⚠️ No content found for step: ${stepId}, returning placeholder response`);
      
      // Create placeholder step information
      const stepTitles = {
        'refinance_mortgage_1': { ru: 'Рефинансирование ипотеки', he: 'מימון משכנתא', en: 'Property & mortgage details' },
        'refinance_mortgage_2': { ru: 'Личная информация', he: 'מידע אישי', en: 'Personal information' },
        'refinance_mortgage_3': { ru: 'Доходы и занятость', he: 'הכנסות ותעסוקה', en: 'Income & employment' },
        'refinance_mortgage_4': { ru: 'Результаты и выбор', he: 'תוצאות ובחירה', en: 'Results & selection' }
      };
      
      const stepTitle = stepTitles[screenLocation] || { ru: 'Не настроено', he: 'לא מוגדר', en: 'Not configured' };
      
      return res.json({
        success: true,
        data: {
          status: 'success',
          step_id: stepId,
          screen_location: screenLocation,
          action_count: 0,
          lastModified: new Date().toISOString(),
          actions: [],
          is_placeholder: true,
          step_info: {
            title: stepTitle,
            message: 'This step is not yet configured in the database. Content will be available once added.'
          }
        }
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
 * Get mortgage dropdown options by content key
 * GET /api/content/mortgage/:contentKey/options
 * Returns dropdown options for a specific mortgage content item
 */
app.get('/api/content/mortgage/:contentKey/options', async (req, res) => {
  try {
    const { contentKey } = req.params;
    console.log(`🔄 Fetching dropdown options for mortgage content key: ${contentKey}`);

    // Query for ONLY dropdown options related to this specific dropdown
    // First get the base content key pattern to find related options
    const basePattern = contentKey.replace(/_label$|_ph$/, ''); // Remove _label or _ph suffixes
    
    const optionsResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as titleRu,
        ct_he.content_value as titleHe,
        ct_en.content_value as titleEn,
        jsonb_build_object(
          'ru', COALESCE(ct_ru.content_value, ''),
          'he', COALESCE(ct_he.content_value, ''),
          'en', COALESCE(ct_en.content_value, '')
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.component_type = 'option'
        AND ci.content_key LIKE $1 || '%'
        AND ci.is_active = true
        AND ci.content_key != $1
      ORDER BY ci.content_key
    `, [basePattern]);

    console.log(`📋 Found ${optionsResult.rows.length} potential dropdown options for content key: ${contentKey}`);

    if (optionsResult.rows.length > 0) {
      // Format the response to match expected API format
      const options = optionsResult.rows.map(row => ({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        titleRu: row.titleru || '',
        titleHe: row.titlehe || '',
        titleEn: row.titleen || '',
        translations: row.translations,
        is_active: row.is_active,
        updated_at: row.updated_at
      }));

      console.log(`✅ Returning ${options.length} dropdown options for mortgage content`);
      res.json({
        success: true,
        data: options
      });
    } else {
      // Return empty array but successful response - frontend will handle fallback
      console.log(`⚠️ No dropdown options found for content key: ${contentKey}, returning empty array`);
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Get mortgage dropdown options error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get mortgage-refi dropdown options by content key
 * GET /api/content/mortgage-refi/:contentKey/options
 * Returns dropdown options for a specific mortgage refinancing content item
 */
app.get('/api/content/mortgage-refi/:contentKey/options', async (req, res) => {
  try {
    const { contentKey } = req.params;
    console.log(`🔄 Fetching dropdown options for mortgage-refi content key: ${contentKey}`);

    // Query for ONLY dropdown options related to this specific dropdown
    // First get the base content key pattern to find related options
    const basePattern = contentKey.replace(/_label$|_ph$/, ''); // Remove _label or _ph suffixes
    
    const optionsResult = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as titleRu,
        ct_he.content_value as titleHe,
        ct_en.content_value as titleEn,
        -- Create translations object for compatibility
        json_build_object(
          'ru', COALESCE(ct_ru.content_value, ''),
          'he', COALESCE(ct_he.content_value, ''),
          'en', COALESCE(ct_en.content_value, '')
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.component_type = 'option'
        AND ci.content_key LIKE $1 || '%'
        AND ci.is_active = true
        AND ci.content_key != $1
      ORDER BY ci.content_key
    `, [basePattern]);

    console.log(`📋 Found ${optionsResult.rows.length} potential dropdown options for content key: ${contentKey}`);

    if (optionsResult.rows.length > 0) {
      // Format the response to match expected API format
      const options = optionsResult.rows.map(row => ({
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        titleRu: row.titleru || '',
        titleHe: row.titlehe || '',
        titleEn: row.titleen || '',
        translations: row.translations,
        is_active: row.is_active,
        updated_at: row.updated_at
      }));

      console.log(`✅ Returning ${options.length} dropdown options for mortgage-refi content`);
      res.json({
        success: true,
        data: options
      });
    } else {
      // Return empty array but successful response - frontend will handle fallback
      console.log(`⚠️ No dropdown options found for content key: ${contentKey}, returning empty array`);
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Get mortgage-refi dropdown options error:', error);
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
    console.log('🔄 Fetching mortgage content with Confluence navigation structure...');
    
    // Use navigation_mapping table to get Confluence-ordered screens
    const result = await safeQuery(`
      SELECT 
        nm.confluence_num,
        nm.confluence_title_ru as title_ru,
        nm.confluence_title_he as title_he,
        nm.confluence_title_en as title_en,
        nm.screen_location,
        nm.screen_location as content_key,
        nm.sort_order,
        'step' as component_type,
        'mortgage_steps' as category,
        true as is_active,
        COUNT(ci.id) as action_count,
        MAX(ci.updated_at) as last_modified,
        MIN(ci.id) as representative_id,
        MIN(ci.page_number) as page_number,
        nm.confluence_title_ru as description,
        MAX(ci.updated_at) as updated_at
      FROM navigation_mapping nm
      LEFT JOIN content_items ci 
        ON ci.screen_location = nm.screen_location
        AND ci.is_active = TRUE
        AND ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')
      WHERE nm.parent_section = '3.1'
        AND nm.is_active = TRUE
        AND nm.screen_location NOT LIKE 'refinance%'
      GROUP BY 
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.confluence_title_he,
        nm.confluence_title_en,
        nm.screen_location,
        nm.sort_order
      ORDER BY nm.sort_order
    `);
    
    console.log(`🔍 Mortgage query returned ${result.rows.length} rows`);
    if (result.rows.length > 0) {
      console.log('📋 First row sample:', result.rows[0]);
    }
    
    const mortgageContent = result.rows.map(row => ({
      id: row.representative_id || row.confluence_num,
      confluence_num: row.confluence_num,  // Add Confluence number
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      description: row.description,
      is_active: row.is_active,
      actionCount: row.action_count || 0,
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
        AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status IN ('approved', 'draft')
      WHERE ci.screen_location ~ '^mortgage_step[1-4]$'
        AND ci.is_active = true
        AND ci.component_type NOT IN ('option', 'dropdown_option', 'radio_option', 'field_option')
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

/**
 * Get main content summary with actual counts
 * GET /api/content/main-summary
 * Returns summary of content sections with real item counts from database
 */
app.get('/api/content/main-summary', async (req, res) => {
  try {
    console.log('🔄 Fetching main content summary with actual counts...');
    
    // Get actual counts for each section from database
    const result = await safeQuery(`
      WITH section_counts AS (
        SELECT 
          CASE 
            WHEN screen_location LIKE 'menu%' THEN 'menu'
            WHEN screen_location LIKE 'mortgage_refi%' OR screen_location LIKE 'refinance_%' THEN 'mortgage-refi'
            WHEN screen_location LIKE 'mortgage%' THEN 'mortgage'
            WHEN screen_location LIKE 'credit_refi%' THEN 'credit-refi'
            WHEN screen_location LIKE 'credit%' THEN 'credit'
            WHEN screen_location IN ('home_page', 'login_page', 'registration_page', 
                                    'personal_data_management', 'account_settings',
                                    'privacy_policy', 'terms_of_service', 'help_center',
                                    'contact_us', 'about_us', 'faq') THEN 'general'
            ELSE 'main'
          END as section,
          COUNT(DISTINCT ci.id) as item_count
        FROM content_items ci
        WHERE ci.is_active = true
        GROUP BY section
      )
      SELECT 
        section,
        item_count
      FROM section_counts
      ORDER BY 
        CASE section
          WHEN 'main' THEN 1
          WHEN 'menu' THEN 2
          WHEN 'mortgage' THEN 3
          WHEN 'mortgage-refi' THEN 4
          WHEN 'credit' THEN 5
          WHEN 'credit-refi' THEN 6
          WHEN 'general' THEN 7
          ELSE 8
        END
    `);

    console.log(`✅ Found counts for ${result.rows.length} sections`);

    // Create summary object with actual counts
    const summary = {
      main: 0,
      menu: 0,
      mortgage: 0,
      'mortgage-refi': 0,
      credit: 0,
      'credit-refi': 0,
      general: 0
    };

    // Fill in actual counts from database
    result.rows.forEach(row => {
      if (Object.prototype.hasOwnProperty.call(summary, row.section)) {
        summary[row.section] = parseInt(row.item_count);
      }
    });

    res.json({
      status: 'success',
      summary: summary,
      total_sections: Object.keys(summary).length,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching main content summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get general content items
 * GET /api/content/general
 * Returns general content items that don't belong to specific workflows
 */
app.get('/api/content/general', async (req, res) => {
  try {
    console.log('🔄 Fetching general content from database...');
    
    // Query for general content items (non-workflow specific)
    const result = await safeQuery(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        COALESCE(
          MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END),
          'Translation missing'
        ) as text_ru,
        COALESCE(
          MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END),
          'Translation missing'
        ) as text_he,
        COALESCE(
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END),
          'Translation missing'
        ) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = true
        AND (
          ci.category = 'general'
          OR ci.screen_location IN (
            'home_page', 'login_page', 'registration_page', 
            'personal_data_management', 'account_settings',
            'privacy_policy', 'terms_of_service', 'help_center',
            'contact_us', 'about_us', 'faq'
          )
        )
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location, ci.is_active, ci.page_number
      ORDER BY ci.screen_location, ci.id
    `);

    console.log(`✅ Found ${result.rows.length} general content items`);

    // Format the response to match expected structure
    const contentItems = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru,
        he: row.text_he,
        en: row.text_en
      }
    }));

    res.json({
      status: 'success',
      content_count: contentItems.length,
      content_items: contentItems
    });
  } catch (error) {
    console.error('❌ Error fetching general content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get individual content item by ID with all translations
 * GET /api/content/item/:id
 * Returns a specific content item with translations for text editing
 * MUST BE BEFORE generic content endpoint to avoid conflicts
 */
app.get('/api/content/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Fetching content item by ID: ${id}`);
    
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
        ci.created_at,
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status = 'approved'
      WHERE ci.id = $1
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.page_number, ci.is_active, ci.updated_at, ci.created_at
    `, [id]);
    
    console.log(`🔍 Content item query returned ${result.rows.length} rows for ID ${id}`);
    
    if (result.rows.length === 0) {
      console.log(`❌ Content item not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: `Content item with ID ${id} not found`
      });
    }
    
    const row = result.rows[0];
    const contentItem = {
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      is_active: row.is_active,
      updated_at: row.updated_at,
      created_at: row.created_at,
      translations: {
        ru: row.text_ru || '',
        he: row.text_he || '',
        en: row.text_en || ''
      }
    };
    
    console.log(`✅ Successfully found content item: ${contentItem.content_key}`);
    
    res.json({
      success: true,
      data: contentItem
    });
    
  } catch (error) {
    console.error('❌ Get content item by ID error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generic content endpoint by screen and language
app.get('/api/content/:screenLocation/:languageCode', async (req, res) => {
  try {
    const { screenLocation, languageCode } = req.params;
    console.log(`🔄 Fetching content for screen: ${screenLocation}, language: ${languageCode}`);
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = $2
      WHERE ci.screen_location = $1
        AND ci.is_active = TRUE
      ORDER BY ci.page_number, ci.id
    `, [screenLocation, languageCode]);
    
    console.log(`🔍 Content query returned ${result.rows.length} rows for ${screenLocation}/${languageCode}`);
    
    // Transform content into key-value pairs
    const content = {};
    result.rows.forEach(row => {
      content[row.content_key] = {
        id: row.id,
        value: row.content_value || '',
        component_type: row.component_type,
        category: row.category,
        page_number: row.page_number
      };
    });
    
    res.json({
      success: true,
      data: {
        screen_location: screenLocation,
        language: languageCode,
        content: content,
        content_count: result.rows.length
      }
    });
    
    console.log(`✅ Successfully returned content for ${screenLocation}/${languageCode}`);
  } catch (error) {
    console.error('❌ Get content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mortgage drill endpoint - fetch specific content for a mortgage step
app.get('/api/content/mortgage/drill/:screenLocation', async (req, res) => {
  try {
    const { screenLocation } = req.params;
    console.log(`🔄 Fetching drill content for: ${screenLocation}`);
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = $1
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
      ORDER BY ci.page_number, ci.id
    `, [screenLocation]);
    
    console.log(`🔍 Drill query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const drillContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru || 'Translation missing',
        he: row.text_he || 'Translation missing',
        en: row.text_en || 'Translation missing'
      },
      updated_at: row.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        status: 'success',
        pageTitle: `Mortgage Step ${screenLocation.replace('mortgage_step', '')}`,
        actionCount: drillContent.length,
        actions: drillContent.map((item, index) => ({
          ...item,
          actionNumber: index + 1
        })),
        screen_location: screenLocation
      }
    });
    
    console.log(`✅ Successfully returned drill content for ${screenLocation}`);
  } catch (error) {
    console.error('❌ Get drill content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Credit drill endpoint - fetch specific content for a credit step
app.get('/api/content/credit/drill/:screenLocation', async (req, res) => {
  const startTime = Date.now();
  const { screenLocation } = req.params;
  
  try {
    
    // Validate language parameter
    const langValidation = validateLanguage(req.query.lang);
    if (!langValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: langValidation.error,
        supported_languages: SUPPORTED_LANGUAGES
      });
    }
    
    const requestedLang = langValidation.language; // Language to use for query
    const userRequestedLang = langValidation.requestedLanguage || langValidation.language; // Language user asked for
    console.log(`🔄 Fetching credit drill content for: ${screenLocation}, requested: ${userRequestedLang}, using: ${requestedLang}`);
    
    // Use feature flag to determine query format
    const useImprovedQuery = FEATURE_FLAGS.ENABLE_IMPROVED_DRILL_ENDPOINTS;
    const useFallbackLanguage = FEATURE_FLAGS.ENABLE_FALLBACK_LANGUAGE;
    
    let query, queryParams;
    
    if (useImprovedQuery) {
      query = `
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.category,
          ci.screen_location,
          ci.is_active,
          ci.page_number,
          ci.updated_at,
          -- Primary language with optional English fallback
          ${useFallbackLanguage ? `
          COALESCE(
            MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END),  -- requested language
            MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END), -- fallback to English
            NULL                                                             -- nothing
          ) AS text_value,
          ` : `
          MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) AS text_value,
          `}
          -- Check if translation exists in requested language
          MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NOT NULL AS has_translation_requested,
          -- Check if fallback was used (has EN but not requested language)
          ${useFallbackLanguage ? `
          (MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NULL 
           AND MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) IS NOT NULL) AS fallback_used,
          ` : `
          false AS fallback_used,
          `}
          -- Keep legacy format for backward compatibility
          MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
          MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          AND ct.status IN ('approved', 'draft')
        WHERE ci.screen_location = $1
          AND ci.is_active = TRUE
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
                 ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
        ORDER BY ci.page_number, ci.id
      `;
      queryParams = [screenLocation, requestedLang];
    } else {
      // Legacy query format
      query = `
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.category,
          ci.screen_location,
          ci.is_active,
          ci.page_number,
          ci.updated_at,
          MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
          MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          AND ct.status IN ('approved', 'draft')
        WHERE ci.screen_location = $1
          AND ci.is_active = TRUE
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
                 ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
        ORDER BY ci.page_number, ci.id
      `;
      queryParams = [screenLocation];
    }
    
    const result = await pool.query(query, queryParams);
    
    console.log(`🔍 Credit drill query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const drillContent = result.rows.map(row => {
      const baseItem = {
        id: row.id,
        content_key: row.content_key,
        component_type: row.component_type,
        category: row.category,
        screen_location: row.screen_location,
        is_active: row.is_active,
        page_number: row.page_number,
        updated_at: row.updated_at
      };
      
      if (useImprovedQuery) {
        // New format with feature flags
        return {
          ...baseItem,
          value: row.text_value || '',
          has_translation: row.has_translation_requested,
          fallback_used: row.fallback_used,
          // Legacy format for backward compatibility
          translations: {
            ru: row.text_ru || 'Translation missing',
            he: row.text_he || 'Translation missing',
            en: row.text_en || 'Translation missing'
          }
        };
      } else {
        // Legacy format only
        return {
          ...baseItem,
          translations: {
            ru: row.text_ru || 'Translation missing',
            he: row.text_he || 'Translation missing',
            en: row.text_en || 'Translation missing'
          }
        };
      }
    });
    
    // Calculate statistics (only if improved query enabled)
    let stats = {};
    if (useImprovedQuery && FEATURE_FLAGS.ENABLE_TRANSLATION_STATS) {
      stats = {
        total_items: drillContent.length,
        items_with_translation: drillContent.filter(item => item.has_translation).length,
        items_using_fallback: drillContent.filter(item => item.fallback_used).length,
        items_missing_translation: drillContent.filter(item => !item.has_translation && !item.fallback_used).length
      };
      stats.translation_coverage = stats.total_items > 0 ? 
        Math.round((stats.items_with_translation / stats.total_items) * 100) : 0;
    }
    
    const responseData = {
      status: 'success',
      pageTitle: `Credit - ${screenLocation.replace('credit_', '').replace(/_/g, ' ')}`,
      actionCount: drillContent.length,
      actions: drillContent.map((item, index) => ({
        ...item,
        actionNumber: index + 1
      })),
      screen_location: screenLocation // Legacy field
    };
    
    // Add new fields only if improved endpoints enabled
    if (useImprovedQuery) {
      responseData.screenLocation = screenLocation;
      responseData.requestedLanguage = userRequestedLang;
      
      if (FEATURE_FLAGS.ENABLE_TRANSLATION_STATS) {
        responseData.stats = stats;
      }
    }
    
    res.json({
      success: true,
      data: responseData
    });
    
    logSlowQuery(`credit-drill-${screenLocation}`, startTime, drillContent.length);
    const coverageInfo = stats.translation_coverage !== undefined ? ` (${stats.translation_coverage}% coverage)` : '';
    console.log(`✅ Successfully returned credit drill content for ${screenLocation}${coverageInfo}`);
  } catch (error) {
    logSlowQuery(`credit-drill-${screenLocation}-ERROR`, startTime, 0);
    console.error('❌ Get credit drill content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Credit-refi drill endpoint - fetch specific content for a credit-refi step
app.get('/api/content/credit-refi/drill/:screenLocation', async (req, res) => {
  const startTime = Date.now();
  const { screenLocation } = req.params;
  
  try {
    
    // Validate language parameter
    const langValidation = validateLanguage(req.query.lang);
    if (!langValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: langValidation.error,
        supported_languages: SUPPORTED_LANGUAGES
      });
    }
    
    const requestedLang = langValidation.language;
    console.log(`🔄 Fetching credit-refi drill content for: ${screenLocation}, language: ${requestedLang}`);
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        -- Primary language with English fallback
        COALESCE(
          MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END),  -- requested language
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END), -- fallback to English
          NULL                                                             -- nothing
        ) AS text_value,
        -- Check if translation exists in requested language
        MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NOT NULL AS has_translation_requested,
        -- Check if fallback was used (has EN but not requested language)
        (MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NULL 
         AND MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) IS NOT NULL) AS fallback_used,
        -- Keep legacy format for backward compatibility
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
      ORDER BY ci.page_number, ci.id
    `, [screenLocation, requestedLang]);
    
    console.log(`🔍 Credit-refi drill query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const drillContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      // New format
      value: row.text_value || '',
      has_translation: row.has_translation_requested,
      fallback_used: row.fallback_used,
      // Legacy format for backward compatibility
      translations: {
        ru: row.text_ru || 'Translation missing',
        he: row.text_he || 'Translation missing',
        en: row.text_en || 'Translation missing'
      },
      updated_at: row.updated_at
    }));
    
    // Calculate statistics
    const stats = {
      total_items: drillContent.length,
      items_with_translation: drillContent.filter(item => item.has_translation).length,
      items_using_fallback: drillContent.filter(item => item.fallback_used).length,
      items_missing_translation: drillContent.filter(item => !item.has_translation && !item.fallback_used).length
    };
    stats.translation_coverage = stats.total_items > 0 ? 
      Math.round((stats.items_with_translation / stats.total_items) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        status: 'success',
        pageTitle: `Credit Refinancing - ${screenLocation.replace('credit_refi_', '').replace(/_/g, ' ')}`,
        screenLocation,
        requestedLanguage: requestedLang,
        stats,
        actionCount: drillContent.length,
        actions: drillContent.map((item, index) => ({
          ...item,
          actionNumber: index + 1
        })),
        screen_location: screenLocation // Legacy field
      }
    });
    
    logSlowQuery(`credit-refi-drill-${screenLocation}`, startTime, drillContent.length);
    console.log(`✅ Successfully returned credit-refi drill content for ${screenLocation} (${stats.translation_coverage}% coverage)`);
  } catch (error) {
    logSlowQuery(`credit-refi-drill-${screenLocation}-ERROR`, startTime, 0);
    console.error('❌ Get credit-refi drill content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// UI Settings endpoint
app.get('/api/ui-settings', async (req, res) => {
  try {
    console.log('🔄 Fetching UI settings...');
    
    // Return default UI settings for now
    // In production, this would come from database
    const uiSettings = {
      font_settings: {
        font_family: 'Arial, sans-serif',
        font_size: '16px',
        line_height: '1.5'
      },
      theme: 'light',
      language: 'ru',
      rtl_languages: ['he'],
      supported_languages: ['ru', 'he', 'en']
    };
    
    res.json({
      success: true,
      data: uiSettings
    });
    
    console.log('✅ Successfully returned UI settings');
  } catch (error) {
    console.error('❌ Get UI settings error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: {
        // Fallback settings
        font_settings: {
          font_family: 'Arial, sans-serif',
          font_size: '16px',
          line_height: '1.5'
        }
      }
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

// ============================================
// JSONB Dropdown Management Routes
// ============================================

// Import dropdown service
const dropdownService = require('./services/dropdownService.js');
const { requireAuth } = require('./auth-middleware.js');

// Get all available screens with dropdowns
app.get('/api/admin/dropdown-screens', requireAuth, async (req, res) => {
  try {
    const screens = await dropdownService.getAvailableScreens();
    res.json({
      success: true,
      data: screens,
      jsonb_source: true
    });
  } catch (error) {
    console.error('Error fetching dropdown screens:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all dropdowns for a specific screen
app.get('/api/admin/dropdowns/:screen/:language', requireAuth, async (req, res) => {
  try {
    const { screen, language } = req.params;
    const dropdowns = await dropdownService.getScreenDropdowns(screen, language);
    
    res.json({
      success: true,
      screen_location: screen,
      language_code: language,
      jsonb_source: true,
      data: dropdowns,
      performance: {
        query_count: 1,
        source: 'jsonb'
      }
    });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single dropdown configuration
app.get('/api/admin/dropdown/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const dropdown = await dropdownService.getDropdownByKey(key);
    
    if (!dropdown) {
      return res.status(404).json({
        success: false,
        error: `Dropdown not found: ${key}`
      });
    }
    
    res.json({
      success: true,
      data: dropdown
    });
  } catch (error) {
    console.error('Error fetching dropdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update content translation
app.put('/api/content-items/:contentItemId/translations/:languageCode', async (req, res) => {
  try {
    const { contentItemId, languageCode } = req.params;
    const { content_value } = req.body;

    console.log(`📝 Updating translation for content item ${contentItemId}, language: ${languageCode}`);

    // Validate language code
    const validLanguages = ['ru', 'he', 'en'];
    if (!validLanguages.includes(languageCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    // Update the translation in content_translations table
    // First check if a translation exists for this content item and language
    const checkQuery = `
      SELECT * FROM content_translations 
      WHERE content_item_id = $1 AND language_code = $2
    `;
    
    const existing = await safeQuery(checkQuery, [contentItemId, languageCode]);
    
    if (existing.rows.length > 0) {
      // Update existing translation
      const updateQuery = `
        UPDATE content_translations 
        SET content_value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE content_item_id = $2 AND language_code = $3
        RETURNING *
      `;
      
      const result = await safeQuery(updateQuery, [content_value, contentItemId, languageCode]);
      
      console.log(`✅ Updated translation for content item ${contentItemId}, language: ${languageCode}`);
      return res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Create new translation
      const insertQuery = `
        INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const insertResult = await safeQuery(insertQuery, [contentItemId, languageCode, content_value]);
      
      console.log(`✅ Created new translation for content item ${contentItemId}, language: ${languageCode}`);
      return res.json({
        success: true,
        data: insertResult.rows[0]
      });
    }
  } catch (error) {
    console.error('❌ Error updating translation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update translation'
    });
  }
});

// Update dropdown configuration
app.put('/api/admin/dropdown/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { dropdown_data } = req.body;
    
    // Validate the data structure
    const validation = dropdownService.validateDropdownData(dropdown_data);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Update with user info from session
    const updated = await dropdownService.updateDropdown(
      key,
      dropdown_data,
      req.session.user
    );
    
    res.json({
      success: true,
      message: 'Dropdown updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating dropdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new dropdown
app.post('/api/admin/dropdown', requireAuth, async (req, res) => {
  try {
    const { screen_location, field_name, dropdown_data } = req.body;
    
    // Validate required fields
    if (!screen_location || !field_name || !dropdown_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: screen_location, field_name, dropdown_data'
      });
    }
    
    // Validate the data structure
    const validation = dropdownService.validateDropdownData(dropdown_data);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Create with user info from session
    const created = await dropdownService.createDropdown(
      screen_location,
      field_name,
      dropdown_data,
      req.session.user
    );
    
    res.json({
      success: true,
      message: 'Dropdown created successfully',
      data: created
    });
  } catch (error) {
    console.error('Error creating dropdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete dropdown (soft delete)
app.delete('/api/admin/dropdown/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    
    await dropdownService.deleteDropdown(key, req.session.user);
    
    res.json({
      success: true,
      message: `Dropdown ${key} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting dropdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate dropdown data structure
app.post('/api/admin/dropdown/validate', requireAuth, async (req, res) => {
  try {
    const { dropdown_data } = req.body;
    
    const validation = dropdownService.validateDropdownData(dropdown_data);
    
    res.json({
      success: validation.isValid,
      errors: validation.errors
    });
  } catch (error) {
    console.error('Error validating dropdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Start server
const actualPort = PORT || 4000;
app.listen(actualPort, () => {
  console.log(`🚀 Server running on port ${actualPort}`);
  console.log(`📊 Health check: http://localhost:${actualPort}/api/health`);
  console.log(`📡 Content API: http://localhost:${actualPort}/api/content/mortgage`);
  console.log(`🍔 Menu API: http://localhost:${actualPort}/api/content/menu`);
  console.log(`🔧 Improved drill endpoints with COALESCE fallback enabled`);
});