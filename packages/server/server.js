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
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
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
        COUNT(*) OVER (PARTITION BY ci.screen_location) as action_count,
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
          COUNT(*) FILTER (WHERE ci.component_type != 'option') as action_count,
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
      
      missingSteps.forEach((step, index) => {
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
      SELECT DISTINCT
        ci.screen_location,
        ci.component_type,
        COUNT(*) OVER (PARTITION BY ci.screen_location) as action_count,
        MAX(ci.updated_at) OVER (PARTITION BY ci.screen_location) as last_modified,
        MIN(ci.id) OVER (PARTITION BY ci.screen_location) as representative_id,
        MIN(ci.page_number) OVER (PARTITION BY ci.screen_location) as page_number,
        ci.is_active
      FROM content_items ci
      WHERE (
        -- Primary naming pattern found in your database
        ci.screen_location LIKE 'refinance_credit_%' OR
        -- Alternative patterns
        ci.screen_location LIKE 'credit_refi_%' OR
        ci.screen_location LIKE 'refinance_credit_step%'
      )
      ORDER BY ci.screen_location
    `);

    console.log(`🔍 Found ${existingStepsResult.rows.length} potential credit refinance step records`);

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
    const validScreenLocations = ['refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4'];
    if (!validScreenLocations.includes(screenLocation) && !screenLocation.startsWith('refinance_mortgage_')) {
      return res.status(404).json({
        success: false,
        error: `Invalid step ID or screen location: ${stepId}. Valid steps are: ${validScreenLocations.join(', ')}`
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
        AND ct_ru.status = 'approved'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status = 'approved'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status = 'approved'
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
        ru: row.text_ru || '',
        he: row.text_he || '',
        en: row.text_en || ''
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
  try {
    const { screenLocation } = req.params;
    console.log(`🔄 Fetching credit drill content for: ${screenLocation}`);
    
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
    
    console.log(`🔍 Credit drill query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const drillContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru || '',
        he: row.text_he || '',
        en: row.text_en || ''
      },
      updated_at: row.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        status: 'success',
        pageTitle: `Credit Step ${screenLocation.replace('credit_step', '')}`,
        actionCount: drillContent.length,
        actions: drillContent.map((item, index) => ({
          ...item,
          actionNumber: index + 1
        })),
        screen_location: screenLocation
      }
    });
    
    console.log(`✅ Successfully returned credit drill content for ${screenLocation}`);
  } catch (error) {
    console.error('❌ Get credit drill content error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Credit-refi drill endpoint - fetch specific content for a credit-refi step
app.get('/api/content/credit-refi/drill/:screenLocation', async (req, res) => {
  try {
    const { screenLocation } = req.params;
    console.log(`🔄 Fetching credit-refi drill content for: ${screenLocation}`);
    
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
    
    console.log(`🔍 Credit-refi drill query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const drillContent = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      is_active: row.is_active,
      page_number: row.page_number,
      translations: {
        ru: row.text_ru || '',
        he: row.text_he || '',
        en: row.text_en || ''
      },
      updated_at: row.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        status: 'success',
        pageTitle: `Credit Refinancing Step ${screenLocation.replace('refinance_credit_', '').replace('credit_refi_', '')}`,
        actionCount: drillContent.length,
        actions: drillContent.map((item, index) => ({
          ...item,
          actionNumber: index + 1
        })),
        screen_location: screenLocation
      }
    });
    
    console.log(`✅ Successfully returned credit-refi drill content for ${screenLocation}`);
  } catch (error) {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});