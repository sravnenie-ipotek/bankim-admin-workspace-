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

async function migrateDraftContent() {
  console.log('🔄 Draft Content Migration Script');
  console.log('=================================\n');
  
  try {
    // 1. Analyze current state
    console.log('📋 STEP 1: Analyzing current content status...\n');
    
    const statusAnalysis = await pool.query(`
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
    statusAnalysis.rows.forEach(row => {
      console.log(`${(row.status || 'NULL').padEnd(8)} | ${(row.component_type || 'null').padEnd(14)} | ${row.count}`);
    });
    
    // 2. Identify specific 'active' content that should be approved
    console.log('\n📋 STEP 2: Identifying active content for migration...\n');
    
    const activeContent = await pool.query(`
      SELECT 
        ci.id as content_item_id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count,
        STRING_AGG(ct.language_code, ', ' ORDER BY ct.language_code) as languages
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY ci.component_type, ci.screen_location, ci.content_key
    `);
    
    console.log(`Found ${activeContent.rows.length} content items with 'active' translations:`);
    
    // Group by component type for better analysis
    const byComponentType = {};
    activeContent.rows.forEach(row => {
      if (!byComponentType[row.component_type]) {
        byComponentType[row.component_type] = [];
      }
      byComponentType[row.component_type].push(row);
    });
    
    Object.keys(byComponentType).forEach(componentType => {
      console.log(`\n   ${componentType.toUpperCase()} (${byComponentType[componentType].length} items):`);
      byComponentType[componentType].slice(0, 5).forEach((row, i) => {
        console.log(`      ${i+1}. ${row.content_key} (${row.screen_location}) - ${row.languages}`);
      });
      if (byComponentType[componentType].length > 5) {
        console.log(`      ... and ${byComponentType[componentType].length - 5} more`);
      }
    });
    
    // 3. Check for potential issues before migration
    console.log('\n📋 STEP 3: Pre-migration validation...\n');
    
    // Check for content with mixed status (some approved, some active)
    const mixedStatus = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        STRING_AGG(DISTINCT ct.status, ', ') as statuses,
        COUNT(*) as total_translations
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type
      HAVING COUNT(DISTINCT ct.status) > 1
      ORDER BY ci.content_key
    `);
    
    if (mixedStatus.rows.length > 0) {
      console.log('⚠️ Found content with mixed translation statuses:');
      mixedStatus.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type}) - Statuses: ${row.statuses}`);
      });
    } else {
      console.log('✅ No mixed status content found');
    }
    
    // Check for incomplete translations (missing languages)
    const incompleteTranslations = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        COUNT(ct.id) as translation_count,
        STRING_AGG(ct.language_code, ', ' ORDER BY ct.language_code) as available_languages
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type
      HAVING COUNT(ct.id) < 3  -- Expecting en, he, ru
      ORDER BY translation_count, ci.content_key
    `);
    
    if (incompleteTranslations.rows.length > 0) {
      console.log('\n⚠️ Found active content with incomplete translations:');
      incompleteTranslations.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type}) - Only: ${row.available_languages}`);
      });
    } else {
      console.log('\n✅ All active content has complete translations');
    }
    
    // 4. Migration decision and execution
    console.log('\n📋 STEP 4: Migration Strategy...\n');
    
    const totalActiveTranslations = await pool.query(`
      SELECT COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
    `);
    
    const activeCount = parseInt(totalActiveTranslations.rows[0].count);
    
    console.log(`Total 'active' translations to migrate: ${activeCount}`);
    
    if (activeCount === 0) {
      console.log('✅ No migration needed - all content is already approved!');
      return;
    }
    
    // Migration options
    console.log('\n🔧 MIGRATION OPTIONS:');
    console.log('1. SAFE MIGRATION: Migrate all "active" to "approved" (recommended)');
    console.log('2. SELECTIVE: Only migrate dropdown-related content');
    console.log('3. ANALYSIS ONLY: Generate detailed report without changes');
    
    // For this script, we'll do ANALYSIS + provide migration SQL
    console.log('\n📋 STEP 5: Generating migration SQL...\n');
    
    // Generate SQL for safe migration
    console.log('-- SQL to migrate all "active" status to "approved":');
    console.log('-- ⚠️ REVIEW CAREFULLY before executing!');
    console.log('');
    console.log('BEGIN;');
    console.log('');
    console.log('-- Update all active translations to approved status');
    console.log('UPDATE content_translations SET status = \'approved\'');
    console.log('WHERE status = \'active\'');
    console.log('  AND content_item_id IN (');
    console.log('    SELECT id FROM content_items WHERE is_active = TRUE');
    console.log('  );');
    console.log('');
    console.log('-- Verify the update');
    console.log('SELECT ');
    console.log('  ct.status,');
    console.log('  ci.component_type,');
    console.log('  COUNT(*) as count');
    console.log('FROM content_translations ct');
    console.log('JOIN content_items ci ON ct.content_item_id = ci.id');
    console.log('WHERE ci.is_active = TRUE');
    console.log('GROUP BY ct.status, ci.component_type');
    console.log('ORDER BY ct.status, ci.component_type;');
    console.log('');
    console.log('-- If satisfied with results, commit:');
    console.log('COMMIT;');
    console.log('-- If not satisfied, rollback:');
    console.log('-- ROLLBACK;');
    
    // Generate detailed report
    console.log('\n📋 STEP 6: Detailed Content Report...\n');
    
    const detailedReport = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct.language_code,
        ct.status,
        CASE 
          WHEN LENGTH(ct.content_value) > 50 
          THEN LEFT(ct.content_value, 50) || '...'
          ELSE ct.content_value
        END as content_preview
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.status = 'active'
        AND ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      ORDER BY ci.component_type, ci.screen_location, ci.content_key, ct.language_code
    `);
    
    if (detailedReport.rows.length > 0) {
      console.log('🔍 DROPDOWN-RELATED ACTIVE CONTENT TO MIGRATE:');
      console.log('');
      
      let currentKey = '';
      detailedReport.rows.forEach(row => {
        if (row.content_key !== currentKey) {
          currentKey = row.content_key;
          console.log(`📄 ${row.content_key} (${row.component_type}, ${row.screen_location}):`);
        }
        console.log(`   ${row.language_code}: "${row.content_preview}"`);
      });
    }
    
    // 7. Post-migration verification plan
    console.log('\n📋 STEP 7: Post-Migration Verification Plan...\n');
    
    console.log('After running the migration SQL, verify with these queries:');
    console.log('');
    console.log('-- 1. Check that no "active" status remains:');
    console.log('SELECT COUNT(*) as remaining_active FROM content_translations WHERE status = \'active\';');
    console.log('-- Expected result: 0');
    console.log('');
    console.log('-- 2. Test dropdown queries work:');
    console.log('SELECT COUNT(*) as mortgage_refi_options');
    console.log('FROM content_items ci');
    console.log('JOIN content_translations ct ON ci.id = ct.content_item_id');
    console.log('WHERE ci.content_key LIKE \'mortgage_refinance_bank_%\'');
    console.log('  AND ci.component_type IN (\'option\', \'dropdown_option\')');
    console.log('  AND ct.status = \'approved\'');
    console.log('  AND ci.is_active = TRUE;');
    console.log('-- Expected result: > 0 (should find options)');
    console.log('');
    console.log('-- 3. Test API endpoints return more data:');
    console.log('-- curl "http://localhost:3001/api/content/mortgage-refi/mortgage_refinance_bank/options"');
    
    // 8. Summary and recommendations
    console.log('\n📊 MIGRATION SUMMARY & RECOMMENDATIONS');
    console.log('=====================================\n');
    
    console.log(`✅ Analysis complete:`);
    console.log(`   - Found ${activeCount} 'active' translations`);
    console.log(`   - ${activeContent.rows.length} content items affected`);
    console.log(`   - ${mixedStatus.rows.length} items with mixed status`);
    console.log(`   - ${incompleteTranslations.rows.length} items with incomplete translations`);
    
    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('1. 🔍 REVIEW: Check the generated SQL above');
    console.log('2. 🧪 TEST: Run in development environment first');
    console.log('3. 🚀 MIGRATE: Execute the SQL in production');
    console.log('4. ✅ VERIFY: Run post-migration verification queries');
    console.log('5. 📈 TEST: Verify dropdown endpoints return more options');
    
    console.log('\n💡 EXPECTED IMPROVEMENTS:');
    console.log('   - Dropdown options will appear in production');
    console.log('   - All content follows consistent "approved" status');
    console.log('   - Production queries will find all intended content');
    console.log('   - No more missing translations in dropdowns');
    
    if (mixedStatus.rows.length > 0 || incompleteTranslations.rows.length > 0) {
      console.log('\n⚠️ CONSIDERATIONS:');
      if (mixedStatus.rows.length > 0) {
        console.log(`   - ${mixedStatus.rows.length} items have mixed status - review individually`);
      }
      if (incompleteTranslations.rows.length > 0) {
        console.log(`   - ${incompleteTranslations.rows.length} items need translation completion`);
      }
    }
    
    console.log('\n🏁 Migration analysis complete!');
    
  } catch (error) {
    console.error('❌ Migration script error:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  migrateDraftContent().catch(console.error);
}

module.exports = { migrateDraftContent };