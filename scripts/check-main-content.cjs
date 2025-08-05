const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMainContent() {
  try {
    console.log('🔍 Checking main page content in database...\n');
    
    // Check all screen_locations that might be for main page
    const result = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as item_count
      FROM content_items
      WHERE screen_location LIKE '%main%' 
         OR content_key LIKE '%main%'
         OR content_key LIKE 'app.main.%'
      GROUP BY screen_location
      ORDER BY item_count DESC, screen_location
    `);
    
    console.log('📊 Screen locations with main-related content:');
    result.rows.forEach(row => {
      console.log(`   ${row.screen_location}: ${row.item_count} items`);
    });
    
    // Check specific content for main page patterns
    const mainContent = await pool.query(`
      SELECT id, content_key, component_type, screen_location
      FROM content_items
      WHERE content_key LIKE 'app.main.%'
      ORDER BY content_key
      LIMIT 20
    `);
    
    console.log('\n📄 Sample main page content items:');
    mainContent.rows.forEach(item => {
      console.log(`   ID: ${item.id}, Key: ${item.content_key}, Type: ${item.component_type}, Screen: ${item.screen_location}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMainContent();