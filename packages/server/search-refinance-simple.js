const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/bankim_content',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchRefinanceContent() {
  try {
    console.log('🔍 Simple Search for Refinance Content');
    console.log('=====================================');

    // Search 1: All content with 'refin' anywhere
    console.log('\n📋 All content with "refin" or "mortgage"');
    const refinSearch = await pool.query(`
      SELECT 
        id, content_key, screen_location, component_type, 
        page_number, is_active, app_context_id
      FROM content_items 
      WHERE content_key ILIKE '%refin%' 
         OR screen_location ILIKE '%refin%'
         OR content_key ILIKE '%mortgage%'
         OR screen_location ILIKE '%mortgage%'
      ORDER BY screen_location, page_number
    `);
    
    console.log(`Found ${refinSearch.rows.length} items:`);
    refinSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location} | ${row.content_key} | active: ${row.is_active} | context: ${row.app_context_id || 'null'} | page: ${row.page_number || 'null'}`);
    });

    // Search 2: Count by screen_location
    console.log('\n📋 Count by screen_location');
    const countSearch = await pool.query(`
      SELECT 
        screen_location, 
        COUNT(*) as count,
        STRING_AGG(DISTINCT CAST(app_context_id AS TEXT), ', ') as contexts
      FROM content_items 
      WHERE screen_location ILIKE '%mortgage%' OR screen_location ILIKE '%refin%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log(`Found ${countSearch.rows.length} screen_locations:`);
    countSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.count} items (contexts: ${row.contexts})`);
    });

    // Search 3: Look for any step 2-4 patterns regardless of context
    console.log('\n📋 Looking for step 2-4 anywhere');
    const stepSearch = await pool.query(`
      SELECT 
        screen_location, content_key, component_type, is_active,
        app_context_id, page_number
      FROM content_items 
      WHERE page_number IN (2, 3, 4)
         OR screen_location ~ '.*[234].*'
         OR content_key ~ '.*[234].*'
      ORDER BY screen_location, page_number
      LIMIT 50
    `);
    
    console.log(`Found ${stepSearch.rows.length} potential step items:`);
    stepSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location} | ${row.content_key} | page: ${row.page_number} | context: ${row.app_context_id || 'null'}`);
    });

  } catch (error) {
    console.error('❌ Database search error:', error);
  } finally {
    await pool.end();
  }
}

searchRefinanceContent();