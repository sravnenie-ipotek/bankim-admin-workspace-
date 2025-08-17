const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/bankim_content',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchAllRefinanceContent() {
  try {
    console.log('🔍 Comprehensive Search for ALL Refinance Content');
    console.log('================================================');

    // Search 1: All content with 'refin' anywhere
    console.log('\n📋 Search 1: Content with "refin" in any field');
    const refinSearch = await pool.query(`
      SELECT 
        id, content_key, screen_location, component_type, 
        page_number, is_active,
        app_context_id
      FROM content_items 
      WHERE content_key ILIKE '%refin%' 
         OR screen_location ILIKE '%refin%'
         OR description ILIKE '%refin%'
      ORDER BY screen_location, page_number
    `);
    
    console.log(`Found ${refinSearch.rows.length} items with "refin":`);
    refinSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location} | ${row.content_key} | active: ${row.is_active} | context: ${row.app_context_id || 'null'}`);
    });

    // Search 2: All mortgage-related content
    console.log('\n📋 Search 2: All mortgage-related content');
    const mortgageSearch = await pool.query(`
      SELECT 
        screen_location, 
        COUNT(*) as count,
        MIN(app_context_id) as context_id,
        STRING_AGG(DISTINCT component_type, ', ') as types
      FROM content_items 
      WHERE screen_location LIKE '%mortgage%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log(`Found ${mortgageSearch.rows.length} mortgage screen_locations:`);
    mortgageSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.count} items (context: ${row.context_id}, types: ${row.types})`);
    });

    // Search 3: Steps 2-4 with ANY name pattern
    console.log('\n📋 Search 3: Looking for step 2-4 patterns');
    const stepSearch = await pool.query(`
      SELECT 
        screen_location, content_key, component_type, is_active,
        app_context_id, page_number
      FROM content_items 
      WHERE (
        screen_location ~ '.*(_|-)?(step|шаг)?(_|-)?[234].*' OR
        content_key ~ '.*(_|-)?(step|шаг)?(_|-)?[234].*' OR
        screen_location ~ '.*(два|три|четыре|two|three|four).*' OR
        page_number IN (2, 3, 4)
      )
      AND (
        screen_location ILIKE '%mortgage%' OR 
        screen_location ILIKE '%refin%' OR
        screen_location ILIKE '%ипот%'
      )
      ORDER BY screen_location, page_number
    `);
    
    console.log(`Found ${stepSearch.rows.length} potential step 2-4 items:`);
    stepSearch.rows.forEach(row => {
      console.log(`  - ${row.screen_location} | ${row.content_key} | page: ${row.page_number} | active: ${row.is_active} | context: ${row.app_context_id || 'null'}`);
    });

    // Search 4: Check application contexts
    console.log('\n📋 Search 4: Application contexts');
    const contextSearch = await pool.query(`
      SELECT id, context_code, context_name_ru, context_name_en 
      FROM application_contexts 
      ORDER BY id
    `);
    
    console.log(`Found ${contextSearch.rows.length} application contexts:`);
    contextSearch.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.context_code} (${row.context_name_en})`);
    });

    console.log('\n🎯 Summary & Recommendations:');
    console.log('============================');
    
    if (refinSearch.rows.length === 0) {
      console.log('❌ No refinance content found in database');
      console.log('💡 This confirms steps 2-4 truly don\'t exist');
    } else {
      console.log(`✅ Found ${refinSearch.rows.length} refinance items`);
      const activeCount = refinSearch.rows.filter(r => r.is_active).length;
      console.log(`✅ ${activeCount} active refinance items`);
    }

  } catch (error) {
    console.error('❌ Database search error:', error);
  } finally {
    await pool.end();
  }
}

searchAllRefinanceContent();