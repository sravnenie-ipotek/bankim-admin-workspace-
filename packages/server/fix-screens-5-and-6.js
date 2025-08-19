const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixScreenMappings() {
  try {
    console.log('🔍 Checking current mappings for screens 5 and 6...\n');
    
    // Check current mappings
    const currentMappings = await pool.query(`
      SELECT 
        confluence_num, 
        confluence_title_ru, 
        screen_location,
        (SELECT COUNT(*) FROM content_items ci WHERE ci.screen_location = nm.screen_location) as content_count
      FROM navigation_mapping nm
      WHERE confluence_num IN ('5', '6') 
        AND parent_section = '3.1'
      ORDER BY confluence_num
    `);
    
    console.log('Current mappings:');
    console.log('==========================================');
    currentMappings.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`     Screen: ${row.screen_location}`);
      console.log(`     Content items: ${row.content_count}`);
    });
    
    console.log('\n🔧 Fixing the mappings...\n');
    
    // Fix screen 5: Should point to borrowers_personal_data_step1 (Personal data)
    await pool.query(`
      UPDATE navigation_mapping 
      SET 
        screen_location = 'borrowers_personal_data_step1',
        updated_at = CURRENT_TIMESTAMP
      WHERE confluence_num = '5' 
        AND parent_section = '3.1'
    `);
    console.log('✅ Screen 5 "Анкета партнера. Личные данные" -> borrowers_personal_data_step1');
    
    // Fix screen 6: Should point to borrowers_income (Income data)
    await pool.query(`
      UPDATE navigation_mapping 
      SET 
        screen_location = 'borrowers_income',
        updated_at = CURRENT_TIMESTAMP
      WHERE confluence_num = '6' 
        AND parent_section = '3.1'
    `);
    console.log('✅ Screen 6 "Анкета партнера. Доходы" -> borrowers_income');
    
    console.log('\n📋 Updated mappings:');
    console.log('==========================================');
    
    // Verify the updates
    const updatedMappings = await pool.query(`
      SELECT 
        confluence_num, 
        confluence_title_ru, 
        screen_location,
        (SELECT COUNT(*) FROM content_items ci WHERE ci.screen_location = nm.screen_location) as content_count
      FROM navigation_mapping nm
      WHERE confluence_num IN ('5', '6') 
        AND parent_section = '3.1'
      ORDER BY confluence_num
    `);
    
    updatedMappings.rows.forEach(row => {
      const status = row.content_count > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`      Screen: ${row.screen_location}`);
      console.log(`      Content items: ${row.content_count}`);
    });
    
    // Show what content is where
    console.log('\n📝 Content summary:');
    console.log('==========================================');
    
    const personalDataContent = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location = 'borrowers_personal_data_step1'
    `);
    
    const incomeContent = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location = 'borrowers_income'
    `);
    
    console.log(`  borrowers_personal_data_step1: ${personalDataContent.rows[0].count} items`);
    console.log(`    -> Should be linked to Screen 5 (Personal Data)`);
    console.log(`  borrowers_income: ${incomeContent.rows[0].count} items`);
    console.log(`    -> Should be linked to Screen 6 (Income)`);
    
    if (incomeContent.rows[0].count === 0) {
      console.log('\n⚠️  Note: Screen 6 (Income) has no content yet.');
      console.log('    You may need to create content for the income form.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixScreenMappings();