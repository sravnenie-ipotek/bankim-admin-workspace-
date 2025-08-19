const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

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

async function findPersonalDataScreens() {
  try {
    console.log('🔍 Searching for personal data related screen locations...');
    
    // Search for screens with "personal", "data", "borrower" in their names
    const personalDataScreens = await safeQuery(`
      SELECT DISTINCT screen_location, COUNT(*) as content_count
      FROM content_items 
      WHERE (
        screen_location ILIKE '%personal%' OR
        screen_location ILIKE '%data%' OR
        screen_location ILIKE '%borrower%' OR
        screen_location ILIKE '%step2%' OR
        screen_location ILIKE '%анкет%'
      )
      AND is_active = true
      GROUP BY screen_location
      ORDER BY screen_location;
    `);
    
    if (personalDataScreens.rows.length === 0) {
      console.log('❌ No personal data related screen locations found');
    } else {
      console.log(`✅ Found ${personalDataScreens.rows.length} personal data related screen locations:`);
      personalDataScreens.rows.forEach(row => {
        console.log(`  - ${row.screen_location} (${row.content_count} content items)`);
      });
    }
    
    // Look at mortgage_step2 specifically since that's mapped to "Анкета личных данных"
    console.log('\n🔍 Examining mortgage_step2 content (current "Анкета личных данных"):');
    const step2Content = await safeQuery(`
      SELECT 
        id,
        content_key,
        component_type,
        category
      FROM content_items 
      WHERE screen_location = 'mortgage_step2'
      AND is_active = true
      ORDER BY content_key
      LIMIT 10;
    `);
    
    if (step2Content.rows.length > 0) {
      console.log(`  Found ${step2Content.rows.length} content items in mortgage_step2:`);
      step2Content.rows.forEach(row => {
        console.log(`    - ${row.content_key} (${row.component_type})`);
      });
    }
    
    // Check if there are any variations of mortgage step screens
    console.log('\n🔍 All mortgage step screens:');
    const mortgageSteps = await safeQuery(`
      SELECT DISTINCT screen_location, COUNT(*) as content_count
      FROM content_items 
      WHERE screen_location LIKE 'mortgage_step%'
      AND is_active = true
      GROUP BY screen_location
      ORDER BY screen_location;
    `);
    
    mortgageSteps.rows.forEach(row => {
      console.log(`  - ${row.screen_location} (${row.content_count} content items)`);
    });
    
    // Check current navigation mapping for context
    console.log('\n🔍 Current navigation mapping context:');
    const context = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location
      FROM navigation_mapping 
      WHERE parent_section = '3.1'
      AND confluence_num::int BETWEEN 4 AND 8
      ORDER BY sort_order;
    `);
    
    context.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru} -> ${row.screen_location}`);
    });
    
  } catch (error) {
    console.error('❌ Error searching for personal data screens:', error);
  } finally {
    await pool.end();
  }
}

// Run the search
findPersonalDataScreens();