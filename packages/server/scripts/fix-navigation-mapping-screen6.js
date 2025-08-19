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

async function fixNavigationMappingScreen6() {
  try {
    console.log('🔍 Step 1: Check current navigation mapping for confluence_num 6...');
    
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
      WHERE confluence_num = '6';
    `);
    
    if (currentMapping.rows.length === 0) {
      console.log('❌ No navigation mapping found for confluence_num 6');
      return;
    }
    
    const current = currentMapping.rows[0];
    console.log(`✅ Current mapping: "${current.confluence_title_ru}" -> ${current.screen_location}`);
    
    console.log('\n🔍 Step 2: Analyzing the mapping issue...');
    console.log('According to the user research:');
    console.log('- Screen #6 "Анкета партнера. Доходы" is showing wrong info');
    console.log('- It should map to borrowers personal data page (after calculator and phone verification)');
    console.log('- This is where users enter personal details like name, birthday, education, citizenship');
    
    // Based on the navigation sequence and content analysis, the most likely correct mapping is mortgage_step2
    // Let's verify this by looking at the sequence
    console.log('\n🔍 Step 3: Current navigation sequence around screen 6:');
    const sequence = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location
      FROM navigation_mapping 
      WHERE parent_section = '3.1'
      AND confluence_num IN ('2', '3', '4', '5', '6', '7')
      ORDER BY sort_order;
    `);
    
    sequence.rows.forEach(row => {
      console.log(`  ${row.confluence_num}. ${row.confluence_title_ru} -> ${row.screen_location}`);
    });
    
    // Check mortgage_step2 content to verify it's personal data
    console.log('\n🔍 Step 4: Verifying mortgage_step2 contains personal data fields...');
    const step2Personal = await safeQuery(`
      SELECT content_key, component_type
      FROM content_items 
      WHERE screen_location = 'mortgage_step2'
      AND (
        content_key ILIKE '%name%' OR
        content_key ILIKE '%birth%' OR
        content_key ILIKE '%citizenship%' OR
        content_key ILIKE '%personal%' OR
        content_key ILIKE '%education%' OR
        content_key ILIKE '%gender%' OR
        content_key ILIKE '%first%' OR
        content_key ILIKE '%last%'
      )
      AND is_active = true
      ORDER BY content_key;
    `);
    
    if (step2Personal.rows.length > 0) {
      console.log(`✅ Found ${step2Personal.rows.length} personal data fields in mortgage_step2:`);
      step2Personal.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.component_type})`);
      });
    }
    
    // The logical flow should be:
    // 2. Calculator -> 3. Phone -> 4. Personal Data -> 5. Partner Personal -> 6. Partner Income
    // But currently: 6 points to mortgage_step4 (results page)
    // It should point to: borrowers_personal_data_step1 OR create this screen OR point to existing personal data
    
    console.log('\n🔍 Step 5: Determining correct fix...');
    
    // Check if borrowers_personal_data_step1 exists in navigation_mapping
    const borrowersMapping = await safeQuery(`
      SELECT * FROM navigation_mapping 
      WHERE screen_location = 'borrowers_personal_data_step1';
    `);
    
    if (borrowersMapping.rows.length === 0) {
      console.log('❌ borrowers_personal_data_step1 does not exist in navigation_mapping');
      console.log('🔧 We need to either:');
      console.log('   1. Create borrowers_personal_data_step1 screen location with content');
      console.log('   2. Map to existing mortgage_step2 (which contains personal data)');
      console.log('');
      console.log('📋 Recommended solution: Map screen 6 to borrowers_personal_data_step1');
      console.log('   and create this as a new screen for borrower personal data input');
      
      // Let's create the fix
      console.log('\n🔧 Step 6: Executing the fix...');
      
      const updateResult = await safeQuery(`
        UPDATE navigation_mapping 
        SET 
          screen_location = 'borrowers_personal_data_step1',
          updated_at = CURRENT_TIMESTAMP
        WHERE confluence_num = '6'
        RETURNING *;
      `);
      
      if (updateResult.rows.length > 0) {
        console.log('✅ Successfully updated navigation mapping for screen 6');
        console.log(`   Old screen_location: ${current.screen_location}`);
        console.log(`   New screen_location: borrowers_personal_data_step1`);
        
        // Verify the update
        const verifyResult = await safeQuery(`
          SELECT confluence_num, confluence_title_ru, screen_location
          FROM navigation_mapping 
          WHERE confluence_num = '6';
        `);
        
        console.log('\n✅ Verification - Updated mapping:');
        console.log(`   ${verifyResult.rows[0].confluence_num}. ${verifyResult.rows[0].confluence_title_ru} -> ${verifyResult.rows[0].screen_location}`);
        
        console.log('\n📝 Next steps needed:');
        console.log('1. Create content items for screen_location: borrowers_personal_data_step1');
        console.log('2. Add personal data fields like:');
        console.log('   - First name, Last name');
        console.log('   - Birthday/Date of birth');
        console.log('   - Education level');
        console.log('   - Citizenship status');
        console.log('   - Gender');
        console.log('   - Other personal information fields');
        console.log('3. Test the frontend navigation to ensure proper flow');
        
      } else {
        console.log('❌ Failed to update navigation mapping');
      }
      
    } else {
      console.log('✅ borrowers_personal_data_step1 already exists in navigation_mapping');
      const existing = borrowersMapping.rows[0];
      console.log(`   Currently mapped to confluence_num: ${existing.confluence_num}`);
      
      // Still update screen 6 to point to it
      const updateResult = await safeQuery(`
        UPDATE navigation_mapping 
        SET 
          screen_location = 'borrowers_personal_data_step1',
          updated_at = CURRENT_TIMESTAMP
        WHERE confluence_num = '6'
        RETURNING *;
      `);
      
      if (updateResult.rows.length > 0) {
        console.log('✅ Successfully updated navigation mapping for screen 6');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing navigation mapping:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
console.log('🚀 Starting Navigation Mapping Fix for Screen #6');
console.log('===============================================');
fixNavigationMappingScreen6();