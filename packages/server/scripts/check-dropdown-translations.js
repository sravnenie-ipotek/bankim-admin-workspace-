/**
 * Check Dropdown Translations Script
 * Identifies dropdown components with missing translations
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkDropdownTranslations() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking dropdown components for missing translations...\n');
    
    // 1. Find all dropdown components
    console.log('📊 All Dropdown Components:');
    const dropdownsResult = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.category,
        ci.is_active,
        ci.created_at
      FROM content_items ci
      WHERE ci.component_type = 'dropdown'
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    console.log(`   Found ${dropdownsResult.rows.length} dropdown components\n`);
    
    if (dropdownsResult.rows.length === 0) {
      console.log('   ℹ️ No dropdown components found in database\n');
      return;
    }
    
    // Display all dropdown components
    dropdownsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id} | Key: ${row.content_key}`);
      console.log(`      Screen: ${row.screen_location} | Category: ${row.category}`);
      console.log(`      Active: ${row.is_active}\n`);
    });
    
    // 2. Check translation completeness for dropdown components
    console.log('🌍 Translation Completeness Analysis:');
    const translationAnalysisResult = await client.query(`
      WITH dropdown_components AS (
        SELECT id, content_key, screen_location, category
        FROM content_items 
        WHERE component_type = 'dropdown' AND is_active = true
      ),
      expected_translations AS (
        SELECT 
          dc.id,
          dc.content_key,
          dc.screen_location,
          dc.category,
          l.code as language_code,
          l.name as language_name
        FROM dropdown_components dc
        CROSS JOIN languages l
        WHERE l.is_active = true
      ),
      actual_translations AS (
        SELECT 
          ct.content_item_id,
          ct.language_code,
          ct.status,
          ct.content_value,
          LENGTH(ct.content_value) as content_length
        FROM content_translations ct
        WHERE ct.content_item_id IN (
          SELECT id FROM dropdown_components
        )
      )
      SELECT 
        et.id,
        et.content_key,
        et.screen_location,
        et.category,
        et.language_code,
        et.language_name,
        CASE 
          WHEN at.content_item_id IS NULL THEN 'MISSING'
          WHEN at.status = 'draft' THEN 'DRAFT'
          WHEN at.status = 'approved' AND (at.content_value IS NULL OR LENGTH(TRIM(at.content_value)) = 0) THEN 'EMPTY'
          WHEN at.status = 'approved' THEN 'COMPLETE'
          ELSE 'UNKNOWN'
        END as translation_status,
        at.content_value,
        at.content_length
      FROM expected_translations et
      LEFT JOIN actual_translations at ON et.id = at.content_item_id AND et.language_code = at.language_code
      ORDER BY et.content_key, et.language_code
    `);
    
    // Group results by dropdown component
    const dropdownTranslations = {};
    translationAnalysisResult.rows.forEach(row => {
      if (!dropdownTranslations[row.content_key]) {
        dropdownTranslations[row.content_key] = {
          id: row.id,
          screen_location: row.screen_location,
          category: row.category,
          translations: {}
        };
      }
      dropdownTranslations[row.content_key].translations[row.language_code] = {
        language_name: row.language_name,
        status: row.translation_status,
        content_value: row.content_value,
        content_length: row.content_length
      };
    });
    
    // 3. Identify components with missing or incomplete translations
    console.log('❌ Dropdown Components with Missing/Incomplete Translations:\n');
    
    let hasIssues = false;
    Object.entries(dropdownTranslations).forEach(([contentKey, data]) => {
      const translations = data.translations;
      const issues = [];
      
      // Check for missing, empty, or draft translations
      Object.entries(translations).forEach(([langCode, trans]) => {
        if (trans.status === 'MISSING') {
          issues.push(`${langCode}: MISSING`);
        } else if (trans.status === 'EMPTY') {
          issues.push(`${langCode}: EMPTY`);
        } else if (trans.status === 'DRAFT') {
          issues.push(`${langCode}: DRAFT`);
        }
      });
      
      if (issues.length > 0) {
        hasIssues = true;
        console.log(`   🚨 ${contentKey} (ID: ${data.id})`);
        console.log(`      Screen: ${data.screen_location} | Category: ${data.category}`);
        console.log(`      Issues: ${issues.join(', ')}`);
        
        // Show current content values
        Object.entries(translations).forEach(([langCode, trans]) => {
          const statusIcon = trans.status === 'COMPLETE' ? '✅' : 
                           trans.status === 'DRAFT' ? '⏳' : 
                           trans.status === 'EMPTY' ? '📝' : '❌';
          const preview = trans.content_value ? 
                         `"${trans.content_value.substring(0, 50)}${trans.content_value.length > 50 ? '...' : ''}"` : 
                         'N/A';
          console.log(`         ${statusIcon} ${langCode}: ${preview}`);
        });
        console.log('');
      }
    });
    
    if (!hasIssues) {
      console.log('   ✅ All dropdown components have complete approved translations!\n');
    }
    
    // 4. Summary statistics
    console.log('📈 Summary Statistics:');
    const totalDropdowns = Object.keys(dropdownTranslations).length;
    const languageCount = translationAnalysisResult.rows.length > 0 ? 
                         Object.keys(dropdownTranslations[Object.keys(dropdownTranslations)[0]].translations).length : 0;
    
    const statusCounts = {
      COMPLETE: 0,
      DRAFT: 0,
      EMPTY: 0,
      MISSING: 0
    };
    
    translationAnalysisResult.rows.forEach(row => {
      statusCounts[row.translation_status]++;
    });
    
    console.log(`   📊 Total dropdown components: ${totalDropdowns}`);
    console.log(`   🌐 Languages supported: ${languageCount}`);
    console.log(`   📝 Expected translations: ${totalDropdowns * languageCount}`);
    console.log(`   ✅ Complete translations: ${statusCounts.COMPLETE}`);
    console.log(`   ⏳ Draft translations: ${statusCounts.DRAFT}`);
    console.log(`   📝 Empty translations: ${statusCounts.EMPTY}`);
    console.log(`   ❌ Missing translations: ${statusCounts.MISSING}`);
    
    const completionRate = totalDropdowns > 0 ? 
                          ((statusCounts.COMPLETE / (totalDropdowns * languageCount)) * 100).toFixed(1) : 0;
    console.log(`   📊 Completion rate: ${completionRate}%`);
    
  } catch (error) {
    console.error('❌ Translation check failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run translation check if called directly
if (require.main === module) {
  checkDropdownTranslations()
    .then(() => {
      console.log('\n✨ Translation check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Translation check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDropdownTranslations };