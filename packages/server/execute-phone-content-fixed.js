const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function addPhoneVerificationContent() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'add-phone-verification-content-fixed.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('📱 Adding phone verification modal content...');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Phone verification content added successfully!');
    
    // Verify the data
    const result = await pool.query(`
      SELECT 
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.screen_location,
        nm.sort_order,
        COUNT(ci.id) as content_items_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON ci.screen_location = nm.screen_location AND ci.is_active = true
      WHERE nm.parent_section = '3.1'
      GROUP BY nm.confluence_num, nm.confluence_title_ru, nm.screen_location, nm.sort_order
      ORDER BY nm.sort_order
    `);
    
    console.log('\n📋 Updated content counts:');
    console.log('==========================================');
    result.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`     Screen: ${row.screen_location}`);
      console.log(`     Content items: ${row.content_items_count}`);
    });
    
    // Show specific items for phone verification
    const phoneItems = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as title_ru
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'ru'
      WHERE ci.screen_location = 'mortgage_phone'
      ORDER BY ci.content_key
      LIMIT 5
    `);
    
    console.log('\n📱 Sample phone verification content:');
    console.log('==========================================');
    phoneItems.rows.forEach(item => {
      console.log(`  ${item.content_key} (${item.component_type})`);
      console.log(`     RU: ${item.title_ru || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addPhoneVerificationContent();