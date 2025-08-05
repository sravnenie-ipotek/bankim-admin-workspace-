const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function checkDropdownData() {
  try {
    console.log('=== BankIM Content Validation Report ===');
    console.log('Date:', new Date().toISOString());
    console.log('Scope: Dropdown components validation\n');
    
    // Check dropdown components and their translations
    const result = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct.language_code,
        ct.content_value,
        ct.status,
        ac.context_name
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      LEFT JOIN application_contexts ac ON ci.app_context_id = ac.id
      WHERE ci.component_type = 'dropdown'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    console.log('📊 STATISTICS:');
    console.log('- Total dropdown translations found:', result.rows.length);
    
    // Group by content_key
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.content_key]) {
        grouped[row.content_key] = [];
      }
      grouped[row.content_key].push(row);
    });
    
    console.log('- Unique dropdown components:', Object.keys(grouped).length);
    console.log('\n📋 DETAILED ANALYSIS:\n');
    
    let totalIssues = 0;
    const issues = {
      missingTranslations: [],
      draftStatus: [],
      nullContent: [],
      invalidJson: []
    };
    
    Object.entries(grouped).forEach(([key, translations]) => {
      console.log(`=== ${key} ===`);
      console.log(`Screen: ${translations[0].screen_location}`);
      console.log(`Context: ${translations[0].context_name}`);
      
      // Check language coverage
      const languages = translations.map(t => t.language_code);
      const expectedLanguages = ['ru', 'he', 'en'];
      const missingLanguages = expectedLanguages.filter(lang => !languages.includes(lang));
      
      if (missingLanguages.length > 0) {
        console.log(`  ❌ Missing languages: ${missingLanguages.join(', ')}`);
        issues.missingTranslations.push(`${key}: ${missingLanguages.join(', ')}`);
        totalIssues++;
      }
      
      translations.forEach(t => {
        console.log(`  ${t.language_code}: status=${t.status}`);
        
        // Check for draft status
        if (t.status === 'draft') {
          console.log(`    ⚠️ Draft status`);
          issues.draftStatus.push(`${key} (${t.language_code})`);
          totalIssues++;
        }
        
        // Check for null content
        if (!t.content_value) {
          console.log(`    ❌ NULL content`);
          issues.nullContent.push(`${key} (${t.language_code})`);
          totalIssues++;
        } else {
          // Try to parse as JSON for dropdown options
          try {
            const parsed = JSON.parse(t.content_value);
            if (Array.isArray(parsed)) {
              console.log(`    ✅ Valid JSON array with ${parsed.length} options`);
              // Show first few options
              if (parsed.length > 0) {
                const sample = parsed.slice(0, 2);
                sample.forEach(opt => {
                  if (opt.value && opt.label) {
                    console.log(`      - ${opt.value}: ${opt.label}`);
                  } else {
                    console.log(`      ❌ Invalid option structure: ${JSON.stringify(opt)}`);
                    totalIssues++;
                  }
                });
                if (parsed.length > 2) {
                  console.log(`      ... and ${parsed.length - 2} more`);
                }
              } else {
                console.log(`    ⚠️ Empty options array`);
                totalIssues++;
              }
            } else {
              console.log(`    ❌ Not an array: ${typeof parsed}`);
              issues.invalidJson.push(`${key} (${t.language_code}): Not an array`);
              totalIssues++;
            }
          } catch (e) {
            console.log(`    ❌ Invalid JSON: ${e.message}`);
            console.log(`    Raw value: ${t.content_value.substring(0, 100)}${t.content_value.length > 100 ? '...' : ''}`);
            issues.invalidJson.push(`${key} (${t.language_code}): ${e.message}`);
            totalIssues++;
          }
        }
      });
      console.log('');
    });
    
    // Summary
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`Total issues found: ${totalIssues}`);
    
    if (issues.missingTranslations.length > 0) {
      console.log(`\n❌ Missing Translations (${issues.missingTranslations.length}):`);
      issues.missingTranslations.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (issues.draftStatus.length > 0) {
      console.log(`\n⚠️ Draft Status (${issues.draftStatus.length}):`);
      issues.draftStatus.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (issues.nullContent.length > 0) {
      console.log(`\n❌ NULL Content (${issues.nullContent.length}):`);
      issues.nullContent.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (issues.invalidJson.length > 0) {
      console.log(`\n❌ Invalid JSON (${issues.invalidJson.length}):`);
      issues.invalidJson.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (totalIssues === 0) {
      console.log('\n✅ All dropdown components passed validation!');
    }
    
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Fix NULL content values by providing proper dropdown option arrays');
    console.log('2. Update draft status translations to approved');
    console.log('3. Ensure all dropdown options have {value, label} structure');
    console.log('4. Add missing language translations');
    console.log('5. Validate JSON structure for all dropdown content');
    
    await pool.end();
  } catch (error) {
    console.error('Error checking dropdown data:', error);
    await pool.end();
  }
}

checkDropdownData();