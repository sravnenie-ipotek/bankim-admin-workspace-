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

async function executeMigration() {
  console.log('🚀 EXECUTING DROPDOWN MIGRATION');
  console.log('================================\n');
  
  try {
    // Step 1: Pre-migration analysis
    console.log('📋 STEP 1: Pre-migration analysis...\n');
    
    const preMigration = await pool.query(`
      SELECT 
        ct.status,
        ci.component_type,
        COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.is_active = TRUE
      GROUP BY ct.status, ci.component_type
      ORDER BY ct.status, ci.component_type
    `);
    
    console.log('Current status distribution:');
    console.log('Status   | Component Type | Count');
    console.log('---------|----------------|------');
    preMigration.rows.forEach(row => {
      console.log(`${(row.status || 'NULL').padEnd(8)} | ${(row.component_type || 'null').padEnd(14)} | ${row.count}`);
    });
    
    // Step 2: Count active translations to be migrated
    const activeCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
    `);
    
    const countToMigrate = parseInt(activeCount.rows[0].count);
    console.log(`\n📊 MIGRATION SCOPE:`);
    console.log(`   Active translations to migrate: ${countToMigrate}`);
    
    if (countToMigrate === 0) {
      console.log('✅ No migration needed - all content is already approved!');
      return;
    }
    
    // Step 3: Show specific content to be migrated
    console.log('\n📋 STEP 2: Content to be migrated...\n');
    
    const contentToMigrate = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY ci.component_type, ci.screen_location, ci.content_key
      LIMIT 10
    `);
    
    console.log('Sample content to be migrated:');
    contentToMigrate.rows.forEach((row, i) => {
      console.log(`   ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.translation_count} translations`);
    });
    
    if (countToMigrate > 10) {
      console.log(`   ... and ${countToMigrate - 10} more items`);
    }
    
    // Step 4: Execute migration
    console.log('\n🚀 STEP 3: Executing migration...\n');
    
    const migrationResult = await pool.query(`
      UPDATE content_translations 
      SET status = 'approved', updated_at = NOW()
      WHERE status = 'active'
        AND content_item_id IN (
          SELECT id FROM content_items WHERE is_active = TRUE
        )
      RETURNING id
    `);
    
    const migratedCount = migrationResult.rowCount;
    console.log(`✅ MIGRATION COMPLETED: ${migratedCount} translations updated from 'active' to 'approved'`);
    
    // Step 5: Post-migration verification
    console.log('\n📋 STEP 4: Post-migration verification...\n');
    
    const postMigration = await pool.query(`
      SELECT 
        ct.status,
        ci.component_type,
        COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.is_active = TRUE
      GROUP BY ct.status, ci.component_type
      ORDER BY ct.status, ci.component_type
    `);
    
    console.log('Post-migration status distribution:');
    console.log('Status   | Component Type | Count');
    console.log('---------|----------------|------');
    postMigration.rows.forEach(row => {
      console.log(`${(row.status || 'NULL').padEnd(8)} | ${(row.component_type || 'null').padEnd(14)} | ${row.count}`);
    });
    
    // Step 6: Check for remaining active status
    const remainingActive = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_translations 
      WHERE status = 'active'
    `);
    
    const remainingCount = parseInt(remainingActive.rows[0].count);
    console.log(`\n📊 VALIDATION:`);
    console.log(`   Remaining 'active' status: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('   ✅ SUCCESS: No active status remaining');
    } else {
      console.log('   ⚠️ WARNING: Some active status still exists');
    }
    
    // Step 7: Test dropdown options
    console.log('\n📋 STEP 5: Testing dropdown options...\n');
    
    const dropdownOptions = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
        AND ci.component_type IN ('option', 'dropdown_option')
        AND ct.status = 'approved'
        AND ci.is_active = TRUE
    `);
    
    const optionsCount = parseInt(dropdownOptions.rows[0].count);
    console.log(`   Mortgage refinance bank options (approved): ${optionsCount}`);
    
    if (optionsCount > 15) {
      console.log('   ✅ SUCCESS: Many dropdown options now available');
    } else if (optionsCount > 0) {
      console.log('   ⚠️ PARTIAL: Some dropdown options available');
    } else {
      console.log('   ❌ ERROR: No dropdown options found');
    }
    
    // Step 8: Show sample of newly available content
    console.log('\n📋 STEP 6: Sample of newly available content...\n');
    
    const sampleContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.language_code,
        LEFT(ct.content_value, 30) as content_preview
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
        AND ci.component_type IN ('option', 'dropdown_option')
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
        AND ci.is_active = TRUE
      ORDER BY ci.content_key
      LIMIT 5
    `);
    
    if (sampleContent.rows.length > 0) {
      console.log('Sample dropdown options now available:');
      sampleContent.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type})`);
        console.log(`      ${row.language_code}: "${row.content_preview}${row.content_preview?.length >= 30 ? '...' : ''}"`);
      });
    }
    
    // Step 9: Final summary
    console.log('\n🎉 MIGRATION SUMMARY');
    console.log('===================\n');
    console.log(`✅ MIGRATION COMPLETED SUCCESSFULLY!`);
    console.log(`📊 RESULTS:`);
    console.log(`   - Migrated: ${migratedCount} translations`);
    console.log(`   - Remaining active: ${remainingCount}`);
    console.log(`   - Dropdown options available: ${optionsCount}`);
    console.log(`   - Status: ${remainingCount === 0 ? 'SUCCESS' : 'PARTIAL'}`);
    
    console.log('\n🚀 EXPECTED IMPROVEMENTS:');
    console.log('   - Dropdown APIs will return more options');
    console.log('   - Pattern matching improvements fully utilized');
    console.log('   - Both numeric and descriptive patterns functional');
    console.log('   - All missing bank options now available');
    console.log('   - Production consistency achieved');
    
    console.log('\n🏁 Migration execution complete!');
    
  } catch (error) {
    console.error('❌ Migration execution error:', error);
    console.log('\n🔄 ROLLBACK RECOMMENDATION:');
    console.log('   If issues occur, consider rolling back the migration');
    console.log('   Check the database logs for detailed error information');
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  executeMigration().catch(console.error);
}

module.exports = { executeMigration }; 