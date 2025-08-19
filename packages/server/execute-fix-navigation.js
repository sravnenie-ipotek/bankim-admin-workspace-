const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixNavigationMapping() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'fix-navigation-mapping-final.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('📊 Fixing navigation_mapping to match Confluence exactly...');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Navigation mapping fixed!');
    
    // Verify the data
    const result = await pool.query(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location
      FROM navigation_mapping
      WHERE parent_section = '3.1'
      ORDER BY sort_order
    `);
    
    console.log('\n📋 Fixed navigation mapping:');
    console.log('==========================================');
    result.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`     → ${row.screen_location}`);
    });
    
    console.log(`\n✅ Total screens: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixNavigationMapping();