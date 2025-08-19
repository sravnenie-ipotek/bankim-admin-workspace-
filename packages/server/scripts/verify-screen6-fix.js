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

async function verifyScreen6Fix() {
  try {
    console.log('🔍 Verifying Screen #6 Navigation Fix');
    console.log('=====================================');
    
    // Check the updated mapping
    console.log('\n✅ Step 1: Verify navigation mapping update...');
    const mapping = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location,
        updated_at
      FROM navigation_mapping 
      WHERE confluence_num = '6';
    `);
    
    if (mapping.rows.length > 0) {
      const row = mapping.rows[0];
      console.log(`   Screen ${row.confluence_num}: "${row.confluence_title_ru}"`);
      console.log(`   Maps to: ${row.screen_location}`);
      console.log(`   Updated: ${row.updated_at}`);
      
      if (row.screen_location === 'borrowers_personal_data_step1') {
        console.log('   ✅ SUCCESS: Screen 6 now points to borrowers_personal_data_step1');
      } else {
        console.log('   ❌ ERROR: Screen 6 does not point to expected location');
      }
    } else {
      console.log('   ❌ ERROR: Screen 6 mapping not found');
    }
    
    // Check content existence
    console.log('\n🔍 Step 2: Check content for borrowers_personal_data_step1...');
    const content = await safeQuery(`
      SELECT COUNT(*) as count
      FROM content_items 
      WHERE screen_location = 'borrowers_personal_data_step1'
      AND is_active = true;
    `);
    
    const contentCount = parseInt(content.rows[0].count);
    if (contentCount === 0) {
      console.log('   ⚠️  WARNING: No content found for borrowers_personal_data_step1');
      console.log('   📝 Next step: Create content items for this screen location');
    } else {
      console.log(`   ✅ Found ${contentCount} content items for borrowers_personal_data_step1`);
    }
    
    // Show complete navigation flow
    console.log('\n📋 Step 3: Current navigation flow for mortgage section...');
    const flow = await safeQuery(`
      SELECT 
        confluence_num,
        confluence_title_ru,
        screen_location
      FROM navigation_mapping 
      WHERE parent_section = '3.1'
      ORDER BY sort_order;
    `);
    
    flow.rows.forEach(row => {
      const isFixed = row.confluence_num === '6' && row.screen_location === 'borrowers_personal_data_step1';
      const marker = isFixed ? ' 🔧 [FIXED]' : '';
      console.log(`   ${row.confluence_num}. ${row.confluence_title_ru} -> ${row.screen_location}${marker}`);
    });
    
    // Test API endpoint behavior
    console.log('\n🌐 Step 4: Test API endpoint response...');
    console.log('   Note: The /api/content/mortgage endpoint should now show:');
    console.log('   Screen 6 pointing to borrowers_personal_data_step1');
    console.log('   You can test this at: http://localhost:4000/api/content/mortgage');
    
    // Recommendations
    console.log('\n📝 Step 5: Recommendations for next actions...');
    
    if (contentCount === 0) {
      console.log('   🔧 IMMEDIATE ACTION NEEDED:');
      console.log('   1. Create content items for borrowers_personal_data_step1');
      console.log('   2. Include personal data fields like:');
      console.log('      - First name / Last name');
      console.log('      - Date of birth');
      console.log('      - Education level');
      console.log('      - Citizenship status');
      console.log('      - Gender');
      console.log('      - ID document information');
      console.log('      - Address');
      console.log('      - Property ownership status');
      console.log('');
      console.log('   3. Test frontend navigation flow');
      console.log('   4. Verify user experience matches expectations');
    } else {
      console.log('   ✅ Content exists - verify it matches user expectations');
      console.log('   🧪 Test the complete user flow:');
      console.log('      Calculator → Phone → Personal Data → ...');
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await pool.end();
  }
}

// Run verification
verifyScreen6Fix();