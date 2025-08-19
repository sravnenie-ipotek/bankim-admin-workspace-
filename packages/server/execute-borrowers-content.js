const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function addBorrowersPersonalDataContent() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'add-borrowers-personal-data-content.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('📝 Adding borrowers personal data content (Screen #6)...');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Borrowers personal data content added successfully!');
    
    // Verify the navigation mapping
    const mappingResult = await pool.query(`
      SELECT 
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.screen_location,
        nm.sort_order,
        COUNT(ci.id) as content_items_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON ci.screen_location = nm.screen_location AND ci.is_active = true
      WHERE nm.confluence_num = '6'
      GROUP BY nm.confluence_num, nm.confluence_title_ru, nm.screen_location, nm.sort_order
    `);
    
    console.log('\n📋 Screen #6 - Updated mapping and content:');
    console.log('==========================================');
    if (mappingResult.rows.length > 0) {
      const row = mappingResult.rows[0];
      console.log(`  Number: ${row.confluence_num}`);
      console.log(`  Title: ${row.confluence_title_ru}`);
      console.log(`  Screen Location: ${row.screen_location}`);
      console.log(`  Content Items: ${row.content_items_count}`);
    }
    
    // Show sample items for borrowers personal data
    const sampleItems = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as title_ru
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'ru'
      WHERE ci.screen_location = 'borrowers_personal_data_step1'
      ORDER BY ci.content_key
      LIMIT 5
    `);
    
    console.log('\n📝 Sample borrowers personal data content:');
    console.log('==========================================');
    sampleItems.rows.forEach(item => {
      console.log(`  ${item.content_key} (${item.component_type})`);
      console.log(`     RU: ${item.title_ru || 'N/A'}`);
    });
    
    // Verify all mortgage screens
    const allScreens = await pool.query(`
      SELECT 
        nm.confluence_num,
        nm.confluence_title_ru,
        nm.screen_location,
        COUNT(ci.id) as content_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON ci.screen_location = nm.screen_location AND ci.is_active = true
      WHERE nm.parent_section = '3.1'
      GROUP BY nm.confluence_num, nm.confluence_title_ru, nm.screen_location
      ORDER BY nm.sort_order
    `);
    
    console.log('\n📊 All mortgage screens content summary:');
    console.log('==========================================');
    allScreens.rows.forEach(row => {
      const status = row.content_count > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`      Screen: ${row.screen_location}`);
      console.log(`      Items: ${row.content_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addBorrowersPersonalDataContent();