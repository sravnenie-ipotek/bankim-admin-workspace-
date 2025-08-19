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

async function checkNavigationMapping() {
  try {
    console.log('🔍 Checking navigation_mapping table for confluence_num 6...');
    
    // Check if navigation_mapping table exists
    const tableExists = await safeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'navigation_mapping'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ navigation_mapping table does not exist');
      return;
    }
    
    console.log('✅ navigation_mapping table exists');
    
    // Check current mapping for confluence_num 6
    const currentMapping = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        confluence_title_he,
        confluence_title_en,
        screen_location,
        parent_section,
        sort_order,
        is_active
      FROM navigation_mapping 
      WHERE confluence_num = '6'
      ORDER BY sort_order;
    `);
    
    if (currentMapping.rows.length === 0) {
      console.log('❌ No navigation mapping found for confluence_num 6');
    } else {
      console.log('\n📋 Current navigation mapping for confluence_num 6:');
      currentMapping.rows.forEach(row => {
        console.log(`  - Confluence #${row.confluence_num}: "${row.confluence_title_ru}"`);
        console.log(`    Screen Location: ${row.screen_location}`);
        console.log(`    Parent Section: ${row.parent_section}`);
        console.log(`    Sort Order: ${row.sort_order}`);
        console.log(`    Active: ${row.is_active}`);
        console.log('');
      });
    }
    
    // Check what content exists for borrowers_personal_data_step1
    console.log('🔍 Checking content for borrowers_personal_data_step1...');
    const borrowersContent = await safeQuery(`
      SELECT 
        id,
        content_key,
        component_type,
        category,
        screen_location,
        is_active,
        page_number
      FROM content_items 
      WHERE screen_location = 'borrowers_personal_data_step1'
      ORDER BY content_key;
    `);
    
    if (borrowersContent.rows.length === 0) {
      console.log('❌ No content found for screen_location: borrowers_personal_data_step1');
    } else {
      console.log(`✅ Found ${borrowersContent.rows.length} content items for borrowers_personal_data_step1:`);
      borrowersContent.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Key: ${row.content_key}, Type: ${row.component_type}, Active: ${row.is_active}`);
      });
    }
    
    // Check what the current mapping points to and what content exists there
    if (currentMapping.rows.length > 0) {
      const currentScreenLocation = currentMapping.rows[0].screen_location;
      console.log(`\n🔍 Checking content for current screen_location: ${currentScreenLocation}...`);
      
      const currentContent = await safeQuery(`
        SELECT 
          id,
          content_key,
          component_type,
          category,
          screen_location,
          is_active,
          page_number
        FROM content_items 
        WHERE screen_location = $1
        ORDER BY content_key;
      `, [currentScreenLocation]);
      
      if (currentContent.rows.length === 0) {
        console.log(`❌ No content found for current screen_location: ${currentScreenLocation}`);
      } else {
        console.log(`✅ Found ${currentContent.rows.length} content items for current screen_location (${currentScreenLocation}):`);
        currentContent.rows.forEach(row => {
          console.log(`  - ID: ${row.id}, Key: ${row.content_key}, Type: ${row.component_type}, Active: ${row.is_active}`);
        });
      }
    }
    
    // Check all mortgage-related navigation mappings
    console.log('\n🔍 All mortgage navigation mappings (parent_section = 3.1):');
    const allMortgageMappings = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location,
        sort_order,
        is_active
      FROM navigation_mapping 
      WHERE parent_section = '3.1'
      ORDER BY sort_order;
    `);
    
    allMortgageMappings.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru} -> ${row.screen_location} (Order: ${row.sort_order}, Active: ${row.is_active})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking navigation mapping:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkNavigationMapping();