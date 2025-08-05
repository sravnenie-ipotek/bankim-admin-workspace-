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

async function validateDropdownStructure() {
  console.log('🔍 VALIDATING DROPDOWN STRUCTURE');
  console.log('================================\n');
  
  try {
    // Test 1: Check for complete dropdown structures
    console.log('📋 TEST 1: Complete Dropdown Structures\n');
    
    const completeStructures = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count,
        STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY ci.screen_location, ci.content_key, ci.component_type
    `);
    
    console.log('Found dropdown components:');
    console.log('Content Key | Component Type | Screen Location | Translations | Languages');
    console.log('------------|----------------|-----------------|-------------|----------');
    completeStructures.rows.forEach(row => {
      console.log(`${row.content_key.padEnd(12)} | ${(row.component_type || 'null').padEnd(14)} | ${(row.screen_location || 'null').padEnd(15)} | ${row.translation_count.toString().padEnd(11)} | ${row.languages}`);
    });
    
    // Test 2: Check for missing translations
    console.log('\n📋 TEST 2: Missing Translations\n');
    
    const missingTranslations = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      HAVING COUNT(ct.id) < 3
      ORDER BY translation_count, ci.content_key
    `);
    
    if (missingTranslations.rows.length > 0) {
      console.log('⚠️ Found content with incomplete translations:');
      missingTranslations.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.translation_count}/3 translations`);
      });
    } else {
      console.log('✅ All dropdown content has complete translations (3/3 languages)');
    }
    
    // Test 3: Check for invalid component types
    console.log('\n📋 TEST 3: Invalid Component Types\n');
    
    const invalidTypes = await pool.query(`
      SELECT 
        content_key,
        component_type,
        screen_location
      FROM content_items
      WHERE screen_location LIKE '%mortgage%' OR screen_location LIKE '%refinance%'
        AND component_type NOT IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label', 'text', 'title', 'button')
        AND is_active = TRUE
      ORDER BY component_type, content_key
    `);
    
    if (invalidTypes.rows.length > 0) {
      console.log('⚠️ Found potentially invalid component types:');
      invalidTypes.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location})`);
      });
    } else {
      console.log('✅ All component types are valid');
    }
    
    // Test 4: Check for duplicate content keys
    console.log('\n📋 TEST 4: Duplicate Content Keys\n');
    
    const duplicateKeys = await pool.query(`
      SELECT 
        content_key,
        COUNT(*) as count,
        STRING_AGG(screen_location, ', ') as locations
      FROM content_items
      WHERE screen_location LIKE '%mortgage%' OR screen_location LIKE '%refinance%'
        AND is_active = TRUE
      GROUP BY content_key
      HAVING COUNT(*) > 1
      ORDER BY count DESC, content_key
    `);
    
    if (duplicateKeys.rows.length > 0) {
      console.log('⚠️ Found duplicate content keys:');
      duplicateKeys.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.content_key} (${row.count} instances) - Locations: ${row.locations}`);
      });
    } else {
      console.log('✅ No duplicate content keys found');
    }
    
    // Test 5: Check for orphaned translations
    console.log('\n📋 TEST 5: Orphaned Translations\n');
    
    const orphanedTranslations = await pool.query(`
      SELECT 
        ct.id,
        ct.content_item_id,
        ct.language_code,
        ct.status
      FROM content_translations ct
      LEFT JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.id IS NULL
      ORDER BY ct.content_item_id
    `);
    
    if (orphanedTranslations.rows.length > 0) {
      console.log('⚠️ Found orphaned translations:');
      console.log(`   ${orphanedTranslations.rows.length} translations without content items`);
    } else {
      console.log('✅ No orphaned translations found');
    }
    
    // Test 6: Check for non-approved status
    console.log('\n📋 TEST 6: Non-Approved Status\n');
    
    const nonApproved = await pool.query(`
      SELECT 
        ct.status,
        COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ci.is_active = TRUE
        AND ct.status != 'approved'
      GROUP BY ct.status
      ORDER BY ct.status
    `);
    
    if (nonApproved.rows.length > 0) {
      console.log('⚠️ Found non-approved translations:');
      nonApproved.rows.forEach(row => {
        console.log(`   Status: ${row.status} - ${row.count} translations`);
      });
    } else {
      console.log('✅ All dropdown translations are approved');
    }
    
    // Test 7: Pattern matching validation
    console.log('\n📋 TEST 7: Pattern Matching Validation\n');
    
    const patternValidation = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        CASE 
          WHEN ci.content_key LIKE '%_option_%' THEN 'numeric'
          WHEN ci.content_key LIKE '%_%' AND ci.content_key NOT LIKE '%_ph' AND ci.content_key NOT LIKE '%_label' THEN 'descriptive'
          ELSE 'other'
        END as pattern_type,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
      WHERE ci.component_type IN ('option', 'dropdown_option')
        AND ci.is_active = TRUE
        AND (ci.content_key LIKE 'mortgage_refinance_bank_%' OR ci.content_key LIKE 'app.refinance.step1.%')
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY pattern_type, ci.content_key
    `);
    
    const numericPatterns = patternValidation.rows.filter(row => row.pattern_type === 'numeric');
    const descriptivePatterns = patternValidation.rows.filter(row => row.pattern_type === 'descriptive');
    
    console.log('Pattern matching results:');
    console.log(`   Numeric patterns: ${numericPatterns.length}`);
    console.log(`   Descriptive patterns: ${descriptivePatterns.length}`);
    console.log(`   Total patterns: ${patternValidation.rows.length}`);
    
    if (numericPatterns.length > 0 && descriptivePatterns.length > 0) {
      console.log('   ✅ Both pattern types are supported');
    } else if (numericPatterns.length > 0) {
      console.log('   ✅ Numeric patterns are supported');
    } else if (descriptivePatterns.length > 0) {
      console.log('   ✅ Descriptive patterns are supported');
    } else {
      console.log('   ⚠️ No clear patterns found');
    }
    
    // Test 8: Screen location consistency
    console.log('\n📋 TEST 8: Screen Location Consistency\n');
    
    const screenLocations = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as item_count,
        STRING_AGG(DISTINCT component_type, ', ' ORDER BY component_type) as component_types
      FROM content_items
      WHERE screen_location LIKE '%mortgage%' OR screen_location LIKE '%refinance%'
        AND is_active = TRUE
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('Screen location distribution:');
    console.log('Screen Location | Item Count | Component Types');
    console.log('----------------|------------|----------------');
    screenLocations.rows.forEach(row => {
      console.log(`${(row.screen_location || 'null').padEnd(15)} | ${row.item_count.toString().padEnd(10)} | ${row.component_types}`);
    });
    
    // Final summary
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('=====================\n');
    
    const totalIssues = missingTranslations.rows.length + 
                       invalidTypes.rows.length + 
                       duplicateKeys.rows.length + 
                       orphanedTranslations.rows.length + 
                       nonApproved.rows.length;
    
    console.log(`📊 VALIDATION RESULTS:`);
    console.log(`   - Complete structures: ${completeStructures.rows.length} components found`);
    console.log(`   - Missing translations: ${missingTranslations.rows.length} issues`);
    console.log(`   - Invalid types: ${invalidTypes.rows.length} issues`);
    console.log(`   - Duplicate keys: ${duplicateKeys.rows.length} issues`);
    console.log(`   - Orphaned translations: ${orphanedTranslations.rows.length} issues`);
    console.log(`   - Non-approved status: ${nonApproved.rows.length} issues`);
    console.log(`   - Pattern types: ${numericPatterns.length} numeric, ${descriptivePatterns.length} descriptive`);
    console.log(`   - Screen locations: ${screenLocations.rows.length} locations`);
    
    if (totalIssues === 0) {
      console.log('\n✅ EXCELLENT: No structural issues found!');
      console.log('   All dropdown structures are valid and complete.');
    } else {
      console.log(`\n⚠️ FOUND ${totalIssues} ISSUES:`);
      console.log('   Review the issues above and address as needed.');
    }
    
    console.log('\n🏁 Validation complete!');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  validateDropdownStructure().catch(console.error);
}

module.exports = { validateDropdownStructure }; 