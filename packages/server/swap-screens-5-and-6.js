const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function swapScreenMappings() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Current state before swap:\n');
    
    // Check current mappings
    const before = await client.query(`
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
    
    console.log('Before swap:');
    console.log('==========================================');
    before.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`     Screen: ${row.screen_location}`);
      console.log(`     Content items: ${row.content_count}`);
    });
    
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('\n🔄 Swapping screen locations...\n');
    
    // Step 1: Temporarily set screen 6 to a temp value
    await client.query(`
      UPDATE navigation_mapping 
      SET screen_location = 'temp_swap_location'
      WHERE confluence_num = '6' AND parent_section = '3.1'
    `);
    
    // Step 2: Set screen 5 to borrowers_personal_data_step1
    await client.query(`
      UPDATE navigation_mapping 
      SET screen_location = 'borrowers_personal_data_step1'
      WHERE confluence_num = '5' AND parent_section = '3.1'
    `);
    
    // Step 3: Set screen 6 to the old screen 5 location (mortgage_step3)
    await client.query(`
      UPDATE navigation_mapping 
      SET screen_location = 'mortgage_step3'
      WHERE confluence_num = '6' AND parent_section = '3.1'
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Successfully swapped screen locations!');
    
    // Verify the swap
    const after = await client.query(`
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
    
    console.log('\n📋 After swap:');
    console.log('==========================================');
    after.rows.forEach(row => {
      const status = row.content_count > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${row.confluence_num}. ${row.confluence_title_ru}`);
      console.log(`      Screen: ${row.screen_location}`);
      console.log(`      Content items: ${row.content_count}`);
    });
    
    console.log('\n📊 Summary:');
    console.log('==========================================');
    console.log('  Screen 5 "Личные данные" now correctly points to:');
    console.log('    -> borrowers_personal_data_step1 (33 personal data fields)');
    console.log('  Screen 6 "Доходы" now points to:');
    console.log('    -> mortgage_step3 (109 items - needs income content)');
    console.log('\n✅ The personal data form is now correctly mapped to Screen 5!');
    console.log('⚠️  Note: Screen 6 (Income) still needs proper income-related content.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error('Transaction rolled back.');
  } finally {
    client.release();
    await pool.end();
  }
}

swapScreenMappings();