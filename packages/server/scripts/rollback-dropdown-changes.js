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

async function rollbackDropdownChanges() {
  console.log('🔄 ROLLBACK DROPDOWN CHANGES');
  console.log('============================\n');
  
  try {
    // Step 1: Create backup before rollback
    console.log('📋 STEP 1: Creating backup...\n');
    
    const backupResult = await pool.query(`
      CREATE TABLE IF NOT EXISTS content_translations_backup_${Date.now()} AS
      SELECT * FROM content_translations
      WHERE content_item_id IN (
        SELECT id FROM content_items 
        WHERE component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
          AND is_active = TRUE
      )
    `);
    
    console.log('✅ Backup created successfully');
    
    // Step 2: Analyze current state
    console.log('\n📋 STEP 2: Analyzing current state...\n');
    
    const currentState = await pool.query(`
      SELECT 
        ct.status,
        ci.component_type,
        COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ci.is_active = TRUE
      GROUP BY ct.status, ci.component_type
      ORDER BY ct.status, ci.component_type
    `);
    
    console.log('Current dropdown content status:');
    console.log('Status   | Component Type | Count');
    console.log('---------|----------------|------');
    currentState.rows.forEach(row => {
      console.log(`${(row.status || 'NULL').padEnd(8)} | ${(row.component_type || 'null').padEnd(14)} | ${row.count}`);
    });
    
    // Step 3: Rollback options
    console.log('\n📋 STEP 3: Rollback Options\n');
    console.log('Choose rollback strategy:');
    console.log('1. 🔄 PARTIAL: Revert only status changes (active → approved)');
    console.log('2. 🗑️  AGGRESSIVE: Remove all dropdown content');
    console.log('3. 📊 ANALYSIS: Show what would be affected');
    console.log('4. ❌ CANCEL: Exit without changes');
    
    // For this script, we'll show analysis and provide rollback SQL
    console.log('\n📋 STEP 4: Rollback Analysis...\n');
    
    // Count what would be affected by different rollback strategies
    const statusRollback = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ct.status = 'approved'
        AND ci.is_active = TRUE
    `);
    
    const fullRollback = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ci.is_active = TRUE
    `);
    
    console.log('📊 ROLLBACK IMPACT ANALYSIS:');
    console.log(`   Status rollback would affect: ${statusRollback.rows[0].count} translations`);
    console.log(`   Full rollback would affect: ${fullRollback.rows[0].count} translations`);
    
    // Step 5: Generate rollback SQL
    console.log('\n📋 STEP 5: Rollback SQL Generation...\n');
    
    console.log('-- ROLLBACK OPTION 1: Status Rollback (Recommended)');
    console.log('-- This reverts approved status back to active for dropdown content');
    console.log('');
    console.log('BEGIN;');
    console.log('');
    console.log('-- Revert approved status to active for dropdown content');
    console.log('UPDATE content_translations SET status = \'active\', updated_at = NOW()');
    console.log('WHERE status = \'approved\'');
    console.log('  AND content_item_id IN (');
    console.log('    SELECT id FROM content_items');
    console.log('    WHERE component_type IN (\'dropdown\', \'option\', \'dropdown_option\', \'placeholder\', \'label\')');
    console.log('      AND is_active = TRUE');
    console.log('  );');
    console.log('');
    console.log('-- Verify the rollback');
    console.log('SELECT ');
    console.log('  ct.status,');
    console.log('  ci.component_type,');
    console.log('  COUNT(*) as count');
    console.log('FROM content_translations ct');
    console.log('JOIN content_items ci ON ct.content_item_id = ci.id');
    console.log('WHERE ci.component_type IN (\'dropdown\', \'option\', \'dropdown_option\', \'placeholder\', \'label\')');
    console.log('  AND ci.is_active = TRUE');
    console.log('GROUP BY ct.status, ci.component_type');
    console.log('ORDER BY ct.status, ci.component_type;');
    console.log('');
    console.log('-- If satisfied with results, commit:');
    console.log('COMMIT;');
    console.log('-- If not satisfied, rollback:');
    console.log('-- ROLLBACK;');
    
    console.log('\n-- ROLLBACK OPTION 2: Full Content Removal (DANGEROUS)');
    console.log('-- This removes ALL dropdown content (use with extreme caution)');
    console.log('');
    console.log('-- BEGIN;');
    console.log('');
    console.log('-- Remove all dropdown translations');
    console.log('DELETE FROM content_translations');
    console.log('WHERE content_item_id IN (');
    console.log('  SELECT id FROM content_items');
    console.log('  WHERE component_type IN (\'dropdown\', \'option\', \'dropdown_option\', \'placeholder\', \'label\')');
    console.log('    AND is_active = TRUE');
    console.log(');');
    console.log('');
    console.log('-- Remove all dropdown content items');
    console.log('DELETE FROM content_items');
    console.log('WHERE component_type IN (\'dropdown\', \'option\', \'dropdown_option\', \'placeholder\', \'label\')');
    console.log('  AND is_active = TRUE;');
    console.log('');
    console.log('-- COMMIT; -- UNCOMMENT ONLY IF SURE');
    
    // Step 6: Show specific content that would be affected
    console.log('\n📋 STEP 6: Content Affected by Rollback...\n');
    
    const affectedContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ct.status = 'approved'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY ci.component_type, ci.screen_location, ci.content_key
      LIMIT 20
    `);
    
    console.log('Sample content that would be affected by status rollback:');
    affectedContent.rows.forEach((row, i) => {
      console.log(`   ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.translation_count} translations`);
    });
    
    if (affectedContent.rows.length >= 20) {
      console.log(`   ... and ${statusRollback.rows[0].count - 20} more items`);
    }
    
    // Step 7: Safety checks
    console.log('\n📋 STEP 7: Safety Checks...\n');
    
    // Check for critical content that shouldn't be rolled back
    const criticalContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ct.status = 'approved'
        AND ci.is_active = TRUE
        AND (ci.content_key LIKE '%mortgage_refinance_bank%' OR ci.content_key LIKE '%calculate_mortgage%')
      ORDER BY ci.content_key
      LIMIT 10
    `);
    
    if (criticalContent.rows.length > 0) {
      console.log('⚠️ CRITICAL CONTENT WARNING:');
      console.log('   The following content would be affected by rollback:');
      criticalContent.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location})`);
      });
      console.log('   ⚠️ This could break dropdown functionality!');
    }
    
    // Step 8: Recovery procedures
    console.log('\n📋 STEP 8: Recovery Procedures...\n');
    
    console.log('🔄 RECOVERY OPTIONS:');
    console.log('1. Restore from backup:');
    console.log('   INSERT INTO content_translations SELECT * FROM content_translations_backup_[timestamp]');
    console.log('');
    console.log('2. Re-run migration:');
    console.log('   UPDATE content_translations SET status = \'approved\' WHERE status = \'active\'');
    console.log('');
    console.log('3. Manual restoration:');
    console.log('   - Export backup data');
    console.log('   - Import specific content items');
    console.log('   - Verify data integrity');
    
    // Step 9: Final recommendations
    console.log('\n🎯 ROLLBACK RECOMMENDATIONS');
    console.log('============================\n');
    
    console.log('📊 CURRENT SITUATION:');
    console.log(`   - ${statusRollback.rows[0].count} approved dropdown translations`);
    console.log(`   - ${fullRollback.rows[0].count} total dropdown translations`);
    console.log(`   - ${criticalContent.rows.length} critical content items`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. ✅ STATUS ROLLBACK: Safe option - reverts to previous state');
    console.log('2. ⚠️  FULL ROLLBACK: Dangerous - removes all dropdown content');
    console.log('3. 🔍 ANALYSIS: Review affected content before proceeding');
    console.log('4. 💾 BACKUP: Always backup before rollback operations');
    
    if (criticalContent.rows.length > 0) {
      console.log('\n🚨 CRITICAL WARNING:');
      console.log('   Rolling back will affect critical dropdown functionality!');
      console.log('   Consider the impact on user experience before proceeding.');
    }
    
    console.log('\n🏁 Rollback analysis complete!');
    console.log('   Use the generated SQL above to perform rollback operations.');
    
  } catch (error) {
    console.error('❌ Rollback analysis error:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  rollbackDropdownChanges().catch(console.error);
}

module.exports = { rollbackDropdownChanges }; 