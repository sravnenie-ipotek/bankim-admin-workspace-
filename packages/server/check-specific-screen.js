#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkScreen(screenLocation) {
  try {
    console.log(`🔍 Checking translations for: ${screenLocation}\n`);
    
    const query = `
      SELECT ci.id, ci.content_key, ci.component_type,
             ct_ru.content_value as ru_content,
             ct_he.content_value as he_content,
             ct_en.content_value as en_content
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status IN ('approved', 'draft')
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1 
        AND ci.is_active = TRUE
      ORDER BY ci.content_key
    `;
    
    const result = await pool.query(query, [screenLocation]);
    
    if (result.rows.length === 0) {
      console.log(`❌ No content items found for screen: ${screenLocation}`);
      return;
    }
    
    console.log(`📊 Found ${result.rows.length} content items\n`);
    
    let completeItems = 0;
    let incompleteItems = 0;
    let issuesFound = false;
    
    for (const row of result.rows) {
      const translations = {
        ru: row.ru_content,
        he: row.he_content,
        en: row.en_content
      };
      
      const missingLanguages = [];
      const issueLanguages = [];
      
      for (const [lang, content] of Object.entries(translations)) {
        if (!content) {
          missingLanguages.push(lang);
        } else if (content.includes('Translation missing')) {
          issueLanguages.push(lang);
        }
      }
      
      if (missingLanguages.length > 0 || issueLanguages.length > 0) {
        if (!issuesFound) {
          console.log('🚨 ISSUES FOUND:\n');
          issuesFound = true;
        }
        
        console.log(`❌ ${row.content_key} (${row.component_type}):`);
        if (missingLanguages.length > 0) {
          console.log(`   Missing translations: ${missingLanguages.join(', ')}`);
        }
        if (issueLanguages.length > 0) {
          console.log(`   "Translation missing" flags: ${issueLanguages.join(', ')}`);
          issueLanguages.forEach(lang => {
            console.log(`     ${lang}: "${translations[lang]}"`);
          });
        }
        console.log('');
        incompleteItems++;
      } else {
        completeItems++;
      }
    }
    
    if (!issuesFound) {
      console.log('✅ All translations are complete!');
    }
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`✅ Complete items: ${completeItems}`);
    console.log(`❌ Items with issues: ${incompleteItems}`);
    console.log(`📊 Total items: ${result.rows.length}`);
    
    return { completeItems, incompleteItems, totalItems: result.rows.length, issues: issuesFound };
    
  } catch (error) {
    console.error('❌ Error checking screen:', error);
    throw error;
  }
}

async function main() {
  try {
    const screens = [
      'credit_refi_program_selection',
      'mortgage_step1',
      'mortgage_step2', 
      'mortgage_step3',
      'mortgage_step4'
    ];
    
    for (const screen of screens) {
      await checkScreen(screen);
      console.log('\n' + '='.repeat(60) + '\n');
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

module.exports = { checkScreen };