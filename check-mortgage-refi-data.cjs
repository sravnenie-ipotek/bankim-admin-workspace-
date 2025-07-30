const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkMortgageRefiData() {
  try {
    console.log('🔍 Checking mortgage-refi data in database...\n');

    // Check all content_items with refinance_mortgage_ pattern
    console.log('1. All content_items with refinance_mortgage_ pattern:');
    const allItems = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active,
        page_number,
        updated_at
      FROM content_items 
      WHERE screen_location LIKE 'refinance_mortgage_%'
      ORDER BY screen_location, id
    `);
    
    console.log(`Found ${allItems.rows.length} items:`);
    allItems.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}`);
    });

    // Check the exact query used by the API
    console.log('\n2. Testing the exact API query:');
    const apiQuery = `
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Рефинансирование ипотеки'
            WHEN 'refinance_mortgage_2' THEN 'Банк текущей ипотеки'
            ELSE ci.screen_location
          END as title_ru,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'מחזור משכנתא'
            WHEN 'refinance_mortgage_2' THEN 'בנק המשכנתא הנוכחית'
            ELSE ci.screen_location
          END as title_he,
          CASE ci.screen_location
            WHEN 'refinance_mortgage_1' THEN 'Mortgage Refinance'
            WHEN 'refinance_mortgage_2' THEN 'Current Bank'
            ELSE ci.screen_location
          END as title_en
        FROM content_items ci
        WHERE ci.screen_location LIKE 'refinance_mortgage_%'
          AND ci.is_active = TRUE
          AND ci.component_type != 'option'
          AND ci.component_type != 'dropdown_option'
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
    `;
    
    const apiResult = await pool.query(apiQuery);
    console.log(`API query returns ${apiResult.rows.length} steps:`);
    apiResult.rows.forEach(row => {
      console.log(`  - Screen: ${row.screen_location}, Actions: ${row.action_count}, Title: ${row.title_ru}`);
    });

    // Check what's being filtered out
    console.log('\n3. Items that are being filtered out:');
    const filteredOut = await pool.query(`
      SELECT 
        screen_location,
        component_type,
        is_active,
        COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE 'refinance_mortgage_%'
        AND (
          is_active = FALSE 
          OR component_type = 'option' 
          OR component_type = 'dropdown_option'
        )
      GROUP BY screen_location, component_type, is_active
      ORDER BY screen_location
    `);
    
    console.log(`Found ${filteredOut.rows.length} filtered groups:`);
    filteredOut.rows.forEach(row => {
      console.log(`  - Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}, Count: ${row.count}`);
    });

    // Check if there are any screen_locations that should exist
    console.log('\n4. Expected screen_locations vs actual:');
    const expectedScreens = ['refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4'];
    const actualScreens = allItems.rows.map(row => row.screen_location);
    const uniqueScreens = [...new Set(actualScreens)];
    
    console.log('Expected screens:', expectedScreens);
    console.log('Actual screens found:', uniqueScreens);
    
    const missingScreens = expectedScreens.filter(screen => !uniqueScreens.includes(screen));
    if (missingScreens.length > 0) {
      console.log('Missing screens:', missingScreens);
    }

    // Check translations
    console.log('\n5. Checking translations for mortgage-refi content:');
    const translations = await pool.query(`
      SELECT 
        ci.screen_location,
        ct.language_code,
        COUNT(ct.content_value) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_mortgage_%'
        AND ci.is_active = TRUE
        AND ci.component_type != 'option'
        AND ci.component_type != 'dropdown_option'
      GROUP BY ci.screen_location, ct.language_code
      ORDER BY ci.screen_location, ct.language_code
    `);
    
    console.log(`Found ${translations.rows.length} translation groups:`);
    translations.rows.forEach(row => {
      console.log(`  - Screen: ${row.screen_location}, Lang: ${row.language_code}, Count: ${row.translation_count}`);
    });

  } catch (error) {
    console.error('❌ Error checking mortgage-refi data:', error);
  } finally {
    await pool.end();
  }
}

checkMortgageRefiData(); 