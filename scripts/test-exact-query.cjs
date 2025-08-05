const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testExactQuery() {
  try {
    console.log('🔍 Testing the exact mortgage-refi API query...\n');

    // Test the exact query from the API
    const apiQuery = `
      WITH screen_summaries AS (
        SELECT 
          ci.screen_location,
          COUNT(*) as action_count,
          MAX(ci.updated_at) as last_modified,
          MIN(ci.id) as representative_id,
          MIN(ci.page_number) as page_number,
          -- Use specific names for mortgage-refi
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
    
    console.log('Executing query...');
    const result = await pool.query(apiQuery);
    
    console.log(`Query returned ${result.rows.length} rows:`);
    result.rows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`);
      console.log(`  - ID: ${row.id}`);
      console.log(`  - Screen Location: ${row.screen_location}`);
      console.log(`  - Content Key: ${row.content_key}`);
      console.log(`  - Action Count: ${row.action_count}`);
      console.log(`  - Title RU: ${row.title_ru}`);
      console.log(`  - Title HE: ${row.title_he}`);
      console.log(`  - Title EN: ${row.title_en}`);
      console.log(`  - Last Modified: ${row.last_modified}`);
      console.log('');
    });

    // Also test the inner query separately
    console.log('🔍 Testing the inner query (screen_summaries):');
    const innerQuery = `
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
        END as title_ru
      FROM content_items ci
      WHERE ci.screen_location LIKE 'refinance_mortgage_%'
        AND ci.is_active = TRUE
        AND ci.component_type != 'option'
        AND ci.component_type != 'dropdown_option'
      GROUP BY ci.screen_location
      HAVING COUNT(*) > 0
    `;
    
    const innerResult = await pool.query(innerQuery);
    console.log(`Inner query returned ${innerResult.rows.length} rows:`);
    innerResult.rows.forEach((row, index) => {
      console.log(`  Row ${index + 1}: Screen=${row.screen_location}, ID=${row.representative_id}, Count=${row.action_count}`);
    });

  } catch (error) {
    console.error('❌ Error testing query:', error);
  } finally {
    await pool.end();
  }
}

testExactQuery(); 