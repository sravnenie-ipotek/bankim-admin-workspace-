const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function checkDropdownComponents() {
  try {
    console.log('=== BankIM Content Validation Report ===');
    console.log('Date:', new Date().toISOString());
    console.log('Scope: Dropdown components validation\n');

    // 1. Find all dropdown components
    const dropdownComponents = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ci.category,
        ci.is_active,
        COALESCE(ac.context_name, 'No Context') as app_context
      FROM content_items ci
      LEFT JOIN application_contexts ac ON ci.app_context_id = ac.id
      WHERE ci.component_type = 'dropdown'
      ORDER BY ci.content_key
    `);
    
    console.log('📊 STATISTICS:');
    console.log('- Total dropdown components:', dropdownComponents.rows.length);
    console.log('\nDropdown components found:');
    dropdownComponents.rows.forEach(row => {
      console.log(`  - ${row.content_key} (screen: ${row.screen_location}, context: ${row.app_context})`);
    });

    // 2. Check for missing translations
    console.log('\n❌ MISSING TRANSLATIONS:');
    const missingTranslations = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        l.code as missing_language
      FROM content_items ci
      CROSS JOIN languages l
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND l.id = ct.language_id
      WHERE ci.component_type = 'dropdown' 
        AND ct.id IS NULL
      ORDER BY ci.content_key, l.code
    `);
    
    if (missingTranslations.rows.length > 0) {
      missingTranslations.rows.forEach(row => {
        console.log(`  - ${row.content_key}: Missing ${row.missing_language} translation`);
      });
    } else {
      console.log('  ✅ All dropdown components have translations for all languages');
    }

    // 3. Check for draft status translations
    console.log('\n⚠️ DRAFT STATUS TRANSLATIONS:');
    const draftTranslations = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.status,
        ct.dropdown_options
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.component_type = 'dropdown' 
        AND ct.status = 'draft'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (draftTranslations.rows.length > 0) {
      draftTranslations.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.language_code}): Status = '${row.status}'`);
      });
    } else {
      console.log('  ✅ No draft status translations found');
    }

    // 4. Check dropdown_options structure and content
    console.log('\n🔍 DROPDOWN OPTIONS VALIDATION:');
    const allDropdownTranslations = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.dropdown_options,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'dropdown'
      ORDER BY ci.content_key, ct.language_code
    `);

    let issuesFound = false;
    const dropdownIssues = {};

    allDropdownTranslations.rows.forEach(row => {
      const key = row.content_key;
      if (!dropdownIssues[key]) {
        dropdownIssues[key] = {
          nullOptions: [],
          emptyOptions: [],
          invalidStructure: [],
          placeholderOptions: []
        };
      }

      // Check for null dropdown_options
      if (row.dropdown_options === null) {
        dropdownIssues[key].nullOptions.push(row.language_code);
        issuesFound = true;
      } else {
        try {
          const options = typeof row.dropdown_options === 'string' 
            ? JSON.parse(row.dropdown_options) 
            : row.dropdown_options;
          
          // Check for empty arrays
          if (Array.isArray(options) && options.length === 0) {
            dropdownIssues[key].emptyOptions.push(row.language_code);
            issuesFound = true;
          }
          
          // Check for invalid structure or placeholder content
          if (Array.isArray(options)) {
            options.forEach(opt => {
              if (!opt.value || !opt.label) {
                dropdownIssues[key].invalidStructure.push(`${row.language_code}: Missing value or label`);
                issuesFound = true;
              }
              if (opt.label && (opt.label.includes('TODO') || opt.label.includes('PLACEHOLDER'))) {
                dropdownIssues[key].placeholderOptions.push(`${row.language_code}: '${opt.label}'`);
                issuesFound = true;
              }
            });
          }
        } catch (e) {
          dropdownIssues[key].invalidStructure.push(`${row.language_code}: Invalid JSON`);
          issuesFound = true;
        }
      }
    });

    if (issuesFound) {
      Object.entries(dropdownIssues).forEach(([key, issues]) => {
        const hasIssues = issues.nullOptions.length > 0 || 
                         issues.emptyOptions.length > 0 || 
                         issues.invalidStructure.length > 0 ||
                         issues.placeholderOptions.length > 0;
        
        if (hasIssues) {
          console.log(`\n  ❌ ${key}:`);
          if (issues.nullOptions.length > 0) {
            console.log(`     - NULL options: ${issues.nullOptions.join(', ')}`);
          }
          if (issues.emptyOptions.length > 0) {
            console.log(`     - Empty options array: ${issues.emptyOptions.join(', ')}`);
          }
          if (issues.invalidStructure.length > 0) {
            console.log(`     - Invalid structure: ${issues.invalidStructure.join(', ')}`);
          }
          if (issues.placeholderOptions.length > 0) {
            console.log(`     - Placeholder content: ${issues.placeholderOptions.join(', ')}`);
          }
        }
      });
    } else {
      console.log('  ✅ All dropdown options have valid structure and content');
    }

    // 5. Check specific problematic dropdowns
    console.log('\n📋 DETAILED ANALYSIS OF PROBLEMATIC DROPDOWNS:');
    const problematicDropdowns = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.dropdown_options,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'dropdown'
        AND (
          ct.dropdown_options IS NULL 
          OR ct.dropdown_options = '[]'
          OR ct.status = 'draft'
        )
      ORDER BY ci.content_key, ct.language_code
    `);

    if (problematicDropdowns.rows.length > 0) {
      const groupedByKey = {};
      problematicDropdowns.rows.forEach(row => {
        if (!groupedByKey[row.content_key]) {
          groupedByKey[row.content_key] = [];
        }
        groupedByKey[row.content_key].push(row);
      });

      Object.entries(groupedByKey).forEach(([key, rows]) => {
        console.log(`\n  Component: ${key}`);
        console.log(`  Screen: ${rows[0].screen_location}`);
        rows.forEach(row => {
          console.log(`    - ${row.language_code}: options=${row.dropdown_options}, status=${row.status}`);
        });
      });
    } else {
      console.log('  ✅ No problematic dropdowns found');
    }

    // 6. Show sample of valid dropdown structure
    console.log('\n📄 SAMPLE VALID DROPDOWN STRUCTURES:');
    const validDropdowns = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.dropdown_options
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'dropdown'
        AND ct.dropdown_options IS NOT NULL
        AND ct.dropdown_options != '[]'
        AND ct.status = 'approved'
      LIMIT 3
    `);

    validDropdowns.rows.forEach(row => {
      console.log(`\n  ${row.content_key} (${row.language_code}):`);
      try {
        const options = typeof row.dropdown_options === 'string' 
          ? JSON.parse(row.dropdown_options) 
          : row.dropdown_options;
        console.log(`    ${JSON.stringify(options, null, 2)}`);
      } catch (e) {
        console.log(`    Raw: ${row.dropdown_options}`);
      }
    });

    // Summary and recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Fix all NULL dropdown_options by providing proper option arrays');
    console.log('2. Update all draft status translations to approved');
    console.log('3. Ensure all dropdown options have valid {value, label} structure');
    console.log('4. Replace any placeholder content with actual translations');
    console.log('5. Verify dropdown functionality in the frontend components');
    console.log('6. Run SQL updates to fix identified issues');

    await pool.end();
  } catch (error) {
    console.error('Error checking dropdown components:', error);
    await pool.end();
  }
}

checkDropdownComponents();