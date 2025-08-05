const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkAllContent() {
  try {
    console.log('🔍 Checking all content in database...\n');

    // Check all screen_locations
    console.log('1. All unique screen_locations:');
    const screenLocations = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as item_count,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count
      FROM content_items 
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log(`Found ${screenLocations.rows.length} unique screen_locations:`);
    screenLocations.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.item_count} items (${row.active_count} active)`);
    });

    // Check component_types
    console.log('\n2. All component_types:');
    const componentTypes = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count
      FROM content_items 
      GROUP BY component_type
      ORDER BY count DESC
    `);
    
    console.log(`Found ${componentTypes.rows.length} component_types:`);
    componentTypes.rows.forEach(row => {
      console.log(`  - ${row.component_type}: ${row.count} items`);
    });

    // Check for any mortgage-related content
    console.log('\n3. All mortgage-related content:');
    const mortgageContent = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active,
        page_number
      FROM content_items 
      WHERE screen_location LIKE '%mortgage%'
         OR content_key LIKE '%mortgage%'
         OR component_type LIKE '%mortgage%'
      ORDER BY screen_location, id
    `);
    
    console.log(`Found ${mortgageContent.rows.length} mortgage-related items:`);
    mortgageContent.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}`);
    });

    // Check for any refinance-related content
    console.log('\n4. All refinance-related content:');
    const refinanceContent = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        is_active,
        page_number
      FROM content_items 
      WHERE screen_location LIKE '%refinance%'
         OR content_key LIKE '%refinance%'
         OR component_type LIKE '%refinance%'
      ORDER BY screen_location, id
    `);
    
    console.log(`Found ${refinanceContent.rows.length} refinance-related items:`);
    refinanceContent.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Screen: ${row.screen_location}, Type: ${row.component_type}, Active: ${row.is_active}`);
    });

    // Check total content count
    console.log('\n5. Total content statistics:');
    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_items,
        COUNT(DISTINCT screen_location) as unique_screens
      FROM content_items
    `);
    
    const stats = totalStats.rows[0];
    console.log(`  - Total items: ${stats.total_items}`);
    console.log(`  - Active items: ${stats.active_items}`);
    console.log(`  - Unique screens: ${stats.unique_screens}`);

  } catch (error) {
    console.error('❌ Error checking content:', error);
  } finally {
    await pool.end();
  }
}

checkAllContent(); 