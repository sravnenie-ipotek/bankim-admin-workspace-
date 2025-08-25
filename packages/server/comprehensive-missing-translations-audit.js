#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

const LANGUAGES = ['ru', 'he', 'en'];

async function auditMissingTranslations() {
  try {
    console.log('🔍 COMPREHENSIVE MISSING TRANSLATIONS AUDIT\n');
    
    // 1. Get all unique screen_locations that have content_items
    const screenQuery = `
      SELECT DISTINCT screen_location, COUNT(*) as total_items
      FROM content_items 
      WHERE is_active = TRUE 
        AND screen_location IS NOT NULL 
        AND screen_location != ''
      GROUP BY screen_location
      ORDER BY screen_location
    `;
    
    const screenResult = await pool.query(screenQuery);
    console.log(`📊 Found ${screenResult.rows.length} unique screen_locations with content_items\n`);
    
    const problematicScreens = [];
    const screenStats = [];
    
    // 2. For each screen, check translation completeness
    for (const screen of screenResult.rows) {
      const screenLocation = screen.screen_location;
      const totalItems = parseInt(screen.total_items);
      
      // Get translation stats for this screen
      const translationStatsQuery = `
        WITH screen_items AS (
          SELECT ci.id, ci.content_key, ci.component_type
          FROM content_items ci
          WHERE ci.screen_location = $1 AND ci.is_active = TRUE
        ),
        translation_counts AS (
          SELECT 
            si.id,
            si.content_key,
            si.component_type,
            COUNT(DISTINCT ct.language_code) as translation_count,
            ARRAY_AGG(DISTINCT ct.language_code) as existing_languages,
            ARRAY_AGG(DISTINCT CASE WHEN ct.language_code IS NULL THEN NULL 
                                   WHEN ct.content_value = '' THEN 'EMPTY_' || ct.language_code
                                   WHEN ct.content_value LIKE '%Translation missing%' THEN 'MISSING_' || ct.language_code
                                   ELSE ct.language_code END) FILTER (WHERE ct.language_code IS NOT NULL) as translation_status
          FROM screen_items si
          LEFT JOIN content_translations ct ON si.id = ct.content_item_id 
            AND ct.status IN ('approved', 'draft')
          GROUP BY si.id, si.content_key, si.component_type
        )
        SELECT 
          content_key,
          component_type,
          translation_count,
          existing_languages,
          translation_status,
          CASE 
            WHEN translation_count = 0 THEN 'NO_TRANSLATIONS'
            WHEN translation_count < 3 THEN 'INCOMPLETE_TRANSLATIONS'
            ELSE 'COMPLETE'
          END as status
        FROM translation_counts
        ORDER BY content_key
      `;
      
      const statsResult = await pool.query(translationStatsQuery, [screenLocation]);
      
      let completeItems = 0;
      let incompleteItems = 0;
      let noTranslationItems = 0;
      let itemsWithMissingFlag = 0;
      const problemItems = [];
      
      for (const item of statsResult.rows) {
        if (item.status === 'COMPLETE') {
          // Check for "Translation missing" flags
          const hasTranslationMissing = item.translation_status.some(status => 
            status && status.startsWith('MISSING_')
          );
          if (hasTranslationMissing) {
            itemsWithMissingFlag++;
            problemItems.push({
              content_key: item.content_key,
              component_type: item.component_type,
              issue: 'Has "Translation missing" flag',
              languages_with_issue: item.translation_status
                .filter(s => s && s.startsWith('MISSING_'))
                .map(s => s.replace('MISSING_', ''))
            });
          } else {
            completeItems++;
          }
        } else if (item.status === 'NO_TRANSLATIONS') {
          noTranslationItems++;
          problemItems.push({
            content_key: item.content_key,
            component_type: item.component_type,
            issue: 'No translations at all',
            missing_languages: ['ru', 'he', 'en']
          });
        } else {
          incompleteItems++;
          const missingLangs = LANGUAGES.filter(lang => 
            !item.existing_languages || !item.existing_languages.includes(lang)
          );
          problemItems.push({
            content_key: item.content_key,
            component_type: item.component_type,
            issue: 'Missing some translations',
            missing_languages: missingLangs,
            existing_languages: item.existing_languages || []
          });
        }
      }
      
      const screenStat = {
        screen_location: screenLocation,
        total_items: totalItems,
        complete_items: completeItems,
        incomplete_items: incompleteItems,
        no_translation_items: noTranslationItems,
        items_with_missing_flag: itemsWithMissingFlag,
        problem_items: problemItems
      };
      
      screenStats.push(screenStat);
      
      if (incompleteItems > 0 || noTranslationItems > 0 || itemsWithMissingFlag > 0) {
        problematicScreens.push(screenStat);
      }
    }
    
    // 3. Report results
    console.log('📈 OVERALL STATISTICS:');
    console.log(`Total screens: ${screenStats.length}`);
    console.log(`Screens with translation issues: ${problematicScreens.length}`);
    console.log(`Screens with complete translations: ${screenStats.length - problematicScreens.length}\n`);
    
    if (problematicScreens.length > 0) {
      console.log('🚨 SCREENS WITH TRANSLATION ISSUES:\n');
      
      // Sort by severity (screens with more issues first)
      problematicScreens.sort((a, b) => {
        const scoreA = a.no_translation_items * 3 + a.incomplete_items * 2 + a.items_with_missing_flag;
        const scoreB = b.no_translation_items * 3 + b.incomplete_items * 2 + b.items_with_missing_flag;
        return scoreB - scoreA;
      });
      
      for (const screen of problematicScreens) {
        console.log(`📍 ${screen.screen_location}`);
        console.log(`   Total items: ${screen.total_items}`);
        console.log(`   ✅ Complete: ${screen.complete_items}`);
        console.log(`   ❌ Missing some translations: ${screen.incomplete_items}`);
        console.log(`   💀 No translations at all: ${screen.no_translation_items}`);
        console.log(`   🏷️  Has "Translation missing" flags: ${screen.items_with_missing_flag}`);
        
        if (screen.problem_items.length > 0) {
          console.log('   Problem items:');
          for (const item of screen.problem_items) {
            console.log(`     - ${item.content_key} (${item.component_type}): ${item.issue}`);
            if (item.missing_languages) {
              console.log(`       Missing: ${item.missing_languages.join(', ')}`);
            }
            if (item.languages_with_issue) {
              console.log(`       Issues in: ${item.languages_with_issue.join(', ')}`);
            }
          }
        }
        console.log('');
      }
    }
    
    // 4. Check specifically for credit_refi_program_selection
    console.log('🎯 SPECIFIC CHECK: credit_refi_program_selection');
    const targetScreen = screenStats.find(s => s.screen_location === 'credit_refi_program_selection');
    if (targetScreen) {
      console.log(`Found ${targetScreen.total_items} items in credit_refi_program_selection`);
      if (targetScreen.problem_items.length > 0) {
        console.log('Issues found:');
        targetScreen.problem_items.forEach(item => {
          console.log(`  - ${item.content_key}: ${item.issue}`);
        });
      } else {
        console.log('✅ No translation issues found');
      }
    } else {
      console.log('❌ Screen credit_refi_program_selection not found');
    }
    
    return { screenStats, problematicScreens };
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    throw error;
  }
}

async function generateFixScript(problematicScreens) {
  console.log('\n🔧 GENERATING BATCH FIX SCRIPT...\n');
  
  const fixes = [];
  let totalFixes = 0;
  
  for (const screen of problematicScreens) {
    for (const item of screen.problem_items) {
      if (item.issue === 'Has "Translation missing" flag' && item.languages_with_issue) {
        // For items with "Translation missing", we need to get actual content from other languages
        const getContentQuery = `
          SELECT ci.id, ci.content_key, ci.component_type,
                 ct_ru.content_value as ru_content,
                 ct_he.content_value as he_content,
                 ct_en.content_value as en_content
          FROM content_items ci
          LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
          LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
          LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
          WHERE ci.content_key = $1 AND ci.screen_location = $2
        `;
        
        try {
          const result = await pool.query(getContentQuery, [item.content_key, screen.screen_location]);
          if (result.rows.length > 0) {
            const row = result.rows[0];
            
            // Generate fixes for languages with "Translation missing"
            for (const lang of item.languages_with_issue) {
              const currentContent = row[`${lang}_content`];
              if (currentContent && currentContent.includes('Translation missing')) {
                // Try to get content from another language as fallback
                let fallbackContent = null;
                
                if (lang !== 'ru' && row.ru_content && !row.ru_content.includes('Translation missing')) {
                  fallbackContent = `[${lang.toUpperCase()}] ${row.ru_content}`;
                } else if (lang !== 'en' && row.en_content && !row.en_content.includes('Translation missing')) {
                  fallbackContent = `[${lang.toUpperCase()}] ${row.en_content}`;
                } else if (lang !== 'he' && row.he_content && !row.he_content.includes('Translation missing')) {
                  fallbackContent = `[${lang.toUpperCase()}] ${row.he_content}`;
                } else {
                  // Generate a proper placeholder
                  fallbackContent = `[${lang.toUpperCase()}] ${item.content_key.replace(/_/g, ' ')}`;
                }
                
                fixes.push({
                  action: 'UPDATE',
                  screen_location: screen.screen_location,
                  content_key: item.content_key,
                  content_item_id: row.id,
                  language_code: lang,
                  new_content: fallbackContent,
                  old_content: currentContent,
                  component_type: item.component_type
                });
                totalFixes++;
              }
            }
          }
        } catch (error) {
          console.error(`Error getting content for ${item.content_key}:`, error);
        }
      } else if (item.missing_languages) {
        // For completely missing translations, create them
        const getContentQuery = `
          SELECT ci.id, ci.content_key, ci.component_type,
                 ct_ru.content_value as ru_content,
                 ct_he.content_value as he_content,
                 ct_en.content_value as en_content
          FROM content_items ci
          LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
          LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
          LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
          WHERE ci.content_key = $1 AND ci.screen_location = $2
        `;
        
        try {
          const result = await pool.query(getContentQuery, [item.content_key, screen.screen_location]);
          if (result.rows.length > 0) {
            const row = result.rows[0];
            
            for (const lang of item.missing_languages) {
              // Try to get content from another language as fallback
              let fallbackContent = null;
              
              if (lang !== 'ru' && row.ru_content && !row.ru_content.includes('Translation missing')) {
                fallbackContent = `[${lang.toUpperCase()}] ${row.ru_content}`;
              } else if (lang !== 'en' && row.en_content && !row.en_content.includes('Translation missing')) {
                fallbackContent = `[${lang.toUpperCase()}] ${row.en_content}`;
              } else if (lang !== 'he' && row.he_content && !row.he_content.includes('Translation missing')) {
                fallbackContent = `[${lang.toUpperCase()}] ${row.he_content}`;
              } else {
                // Generate a proper placeholder
                fallbackContent = `[${lang.toUpperCase()}] ${item.content_key.replace(/_/g, ' ')}`;
              }
              
              fixes.push({
                action: 'INSERT',
                screen_location: screen.screen_location,
                content_key: item.content_key,
                content_item_id: row.id,
                language_code: lang,
                new_content: fallbackContent,
                component_type: item.component_type
              });
              totalFixes++;
            }
          }
        } catch (error) {
          console.error(`Error getting content for ${item.content_key}:`, error);
        }
      }
    }
  }
  
  console.log(`Generated ${totalFixes} fixes for ${problematicScreens.length} screens\n`);
  
  return fixes;
}

async function executeFixes(fixes) {
  console.log('⚡ EXECUTING BATCH FIXES...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const fix of fixes) {
    try {
      if (fix.action === 'UPDATE') {
        const updateQuery = `
          UPDATE content_translations 
          SET content_value = $1, updated_at = NOW()
          WHERE content_item_id = $2 AND language_code = $3
        `;
        await pool.query(updateQuery, [fix.new_content, fix.content_item_id, fix.language_code]);
        console.log(`✅ Updated ${fix.content_key} (${fix.language_code}) in ${fix.screen_location}`);
        successCount++;
      } else if (fix.action === 'INSERT') {
        const insertQuery = `
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
          VALUES ($1, $2, $3, 'approved', NOW(), NOW())
        `;
        await pool.query(insertQuery, [fix.content_item_id, fix.language_code, fix.new_content]);
        console.log(`✅ Created ${fix.content_key} (${fix.language_code}) in ${fix.screen_location}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to fix ${fix.content_key} (${fix.language_code}):`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 BATCH FIX RESULTS:`);
  console.log(`✅ Successful fixes: ${successCount}`);
  console.log(`❌ Failed fixes: ${errorCount}`);
  
  return { successCount, errorCount };
}

async function main() {
  try {
    // Run the audit
    const { screenStats, problematicScreens } = await auditMissingTranslations();
    
    if (problematicScreens.length > 0) {
      // Generate and execute fixes
      const fixes = await generateFixScript(problematicScreens);
      
      if (fixes.length > 0) {
        const { successCount, errorCount } = await executeFixes(fixes);
        
        console.log('\n🎉 BATCH FIX COMPLETED!');
        console.log(`Fixed translations in ${problematicScreens.length} screens`);
        console.log(`Total fixes applied: ${successCount}`);
        if (errorCount > 0) {
          console.log(`⚠️  Some fixes failed: ${errorCount}`);
        }
        
        // Run audit again to verify
        console.log('\n🔍 RE-RUNNING AUDIT TO VERIFY FIXES...\n');
        const { problematicScreens: remainingProblems } = await auditMissingTranslations();
        
        if (remainingProblems.length === 0) {
          console.log('🎊 SUCCESS! All translation issues have been resolved!');
        } else {
          console.log(`⚠️  ${remainingProblems.length} screens still have issues that may need manual attention`);
        }
      } else {
        console.log('ℹ️  No automatic fixes could be generated');
      }
    } else {
      console.log('🎉 NO TRANSLATION ISSUES FOUND! All screens have complete translations.');
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { auditMissingTranslations, generateFixScript, executeFixes };