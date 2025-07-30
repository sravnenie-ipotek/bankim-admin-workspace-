const { Pool } = require('pg');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

async function testMigrationImpact() {
  console.log('🧪 Testing Migration Impact - Before vs After Simulation');
  console.log('=======================================================\n');
  
  try {
    // 1. Test current state (with status = 'approved' only)
    console.log('📋 CURRENT STATE (status = approved only):');
    console.log('------------------------------------------');
    
    const currentApproved = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
        AND ci.component_type IN ('option', 'dropdown_option')
        AND ct.status = 'approved'
        AND ci.is_active = TRUE
    `);
    
    console.log(`   Mortgage refinance bank options (approved): ${currentApproved.rows[0].count}`);
    
    // 2. Test simulated post-migration state (with both approved and active)
    console.log('\n📋 POST-MIGRATION SIMULATION (approved + active):');
    console.log('------------------------------------------------');
    
    const postMigrationSimulation = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
        AND ci.component_type IN ('option', 'dropdown_option')
        AND ct.status IN ('approved', 'active')
        AND ci.is_active = TRUE
    `);
    
    console.log(`   Mortgage refinance bank options (approved + active): ${postMigrationSimulation.rows[0].count}`);
    
    // 3. Show the difference
    const currentCount = parseInt(currentApproved.rows[0].count);
    const futureCount = parseInt(postMigrationSimulation.rows[0].count);
    const difference = futureCount - currentCount;
    
    console.log('\n📊 MIGRATION IMPACT:');
    console.log('===================');
    console.log(`   Before migration: ${currentCount} options`);
    console.log(`   After migration:  ${futureCount} options`);
    console.log(`   Difference:       +${difference} options (${((difference/currentCount)*100).toFixed(1)}% increase)`);
    
    if (difference > 0) {
      console.log('   🎯 IMPACT: Migration will SIGNIFICANTLY increase available options!');
    } else {
      console.log('   ⚠️ IMPACT: Migration may not increase options as expected');
    }
    
    // 4. Test API endpoint impact simulation
    console.log('\n🌐 API ENDPOINT IMPACT TEST:');
    console.log('============================');
    
    try {
      // Test current API endpoint
      const apiResponse = await fetch('http://localhost:3001/api/content/mortgage-refi/mortgage_refinance_bank/options');
      const apiData = await apiResponse.json();
      
      if (apiData.success && apiData.data) {
        console.log(`   Current API returns: ${apiData.data.length} options`);
        console.log(`   Expected after migration: ${futureCount} options`);
        console.log(`   API improvement: +${futureCount - apiData.data.length} options`);
        
        if (futureCount > apiData.data.length) {
          console.log('   ✅ Migration will improve API responses');
        } else {
          console.log('   ⚠️ Migration may not affect API responses as expected');
        }
      } else {
        console.log('   ⚠️ API test failed - server may not be running');
        console.log(`   Expected API to return: ${futureCount} options after migration`);
      }
    } catch (error) {
      console.log('   ⚠️ API test error - server may not be running');
      console.log(`   Expected API to return: ${futureCount} options after migration`);
    }
    
    // 5. Show detailed breakdown
    console.log('\n📋 DETAILED CONTENT BREAKDOWN:');
    console.log('==============================');
    
    const detailedBreakdown = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.status,
        COUNT(*) as translation_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
        AND ci.component_type IN ('option', 'dropdown_option')
        AND ci.is_active = TRUE
      GROUP BY ci.content_key, ci.component_type, ct.status
      ORDER BY ci.content_key
    `);
    
    const approvedContent = detailedBreakdown.rows.filter(row => row.status === 'approved');
    const activeContent = detailedBreakdown.rows.filter(row => row.status === 'active');
    
    console.log(`\n   APPROVED content (${approvedContent.length} items):`);
    approvedContent.slice(0, 5).forEach((row, i) => {
      console.log(`      ${i+1}. ${row.content_key} (${row.translation_count} translations)`);
    });
    if (approvedContent.length > 5) {
      console.log(`      ... and ${approvedContent.length - 5} more approved items`);
    }
    
    console.log(`\n   ACTIVE content (${activeContent.length} items - will be migrated):`);
    activeContent.slice(0, 5).forEach((row, i) => {
      console.log(`      ${i+1}. ${row.content_key} (${row.translation_count} translations)`);
    });
    if (activeContent.length > 5) {
      console.log(`      ... and ${activeContent.length - 5} more active items`);
    }
    
    // 6. Pattern matching validation
    console.log('\n🔍 PATTERN MATCHING VALIDATION:');
    console.log('===============================');
    
    const numericPattern = activeContent.filter(row => row.content_key.includes('_option_'));
    const descriptivePattern = activeContent.filter(row => !row.content_key.includes('_option_'));
    
    console.log(`   Numeric patterns to be unlocked: ${numericPattern.length}`);
    console.log(`   Descriptive patterns to be unlocked: ${descriptivePattern.length}`);
    console.log(`   Total patterns to be unlocked: ${activeContent.length}`);
    
    if (numericPattern.length > 0 && descriptivePattern.length > 0) {
      console.log('   ✅ Migration will unlock BOTH numeric and descriptive patterns!');
    } else if (numericPattern.length > 0) {
      console.log('   ✅ Migration will unlock numeric patterns');
    } else if (descriptivePattern.length > 0) {
      console.log('   ✅ Migration will unlock descriptive patterns');
    }
    
    // 7. Final recommendation
    console.log('\n🎯 MIGRATION RECOMMENDATION:');
    console.log('============================');
    
    if (difference > 5) {
      console.log('   ✅ STRONGLY RECOMMENDED: Migration will significantly improve functionality');
      console.log('   📈 Expected benefits:');
      console.log(`      - ${difference} additional dropdown options available`);
      console.log('      - Better user experience with more choices');
      console.log('      - Pattern matching improvements fully utilized');
      console.log('      - Production consistency (all content approved)');
    } else if (difference > 0) {
      console.log('   ✅ RECOMMENDED: Migration will provide some improvements');
    } else {
      console.log('   ⚠️ REVIEW NEEDED: Migration impact unclear');
    }
    
    console.log('\n🏁 Migration impact test complete!');
    
  } catch (error) {
    console.error('❌ Migration impact test error:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  testMigrationImpact().catch(console.error);
}

module.exports = { testMigrationImpact };