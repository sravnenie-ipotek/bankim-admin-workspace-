const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkItem745() {
  try {
    console.log('🔍 Checking item ID 745...\n');

    // Check if item 745 exists
    const item = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active,
        page_number,
        updated_at
      FROM content_items 
      WHERE id = 745
    `);
    
    if (item.rows.length > 0) {
      console.log('✅ Item 745 found:');
      const row = item.rows[0];
      console.log(`  - ID: ${row.id}`);
      console.log(`  - Content Key: ${row.content_key}`);
      console.log(`  - Component Type: ${row.component_type}`);
      console.log(`  - Screen Location: ${row.screen_location}`);
      console.log(`  - Active: ${row.is_active}`);
      console.log(`  - Page Number: ${row.page_number}`);
      console.log(`  - Updated At: ${row.updated_at}`);
    } else {
      console.log('❌ Item 745 not found');
    }

    // Check all items with ID around 745
    console.log('\n🔍 Checking items around ID 745:');
    const nearbyItems = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active
      FROM content_items 
      WHERE id BETWEEN 740 AND 750
      ORDER BY id
    `);
    
    console.log(`Found ${nearbyItems.rows.length} items around ID 745:`);
    nearbyItems.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}`);
    });

    // Check if there are any items with refinance_mortgage_ pattern
    console.log('\n🔍 Checking for any refinance_mortgage_ items:');
    const refinanceItems = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active
      FROM content_items 
      WHERE screen_location LIKE 'refinance_mortgage_%'
      ORDER BY id
    `);
    
    console.log(`Found ${refinanceItems.rows.length} items with refinance_mortgage_ pattern:`);
    refinanceItems.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}`);
    });

  } catch (error) {
    console.error('❌ Error checking item 745:', error);
  } finally {
    await pool.end();
  }
}

checkItem745(); 