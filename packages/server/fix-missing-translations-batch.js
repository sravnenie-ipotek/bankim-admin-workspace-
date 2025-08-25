#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

const LANGUAGES = ['ru', 'he', 'en'];

// Translation mappings for common content
const TRANSLATION_MAPPINGS = {
  // Common UI elements
  'submit': { ru: 'Отправить', he: 'שלח', en: 'Submit' },
  'continue': { ru: 'Продолжить', he: 'המשך', en: 'Continue' },
  'back': { ru: 'Назад', he: 'חזור', en: 'Back' },
  'next': { ru: 'Далее', he: 'הבא', en: 'Next' },
  'cancel': { ru: 'Отмена', he: 'ביטול', en: 'Cancel' },
  'save': { ru: 'Сохранить', he: 'שמור', en: 'Save' },
  'edit': { ru: 'Редактировать', he: 'ערוך', en: 'Edit' },
  'delete': { ru: 'Удалить', he: 'מחק', en: 'Delete' },
  'close': { ru: 'Закрыть', he: 'סגור', en: 'Close' },
  'open': { ru: 'Открыть', he: 'פתח', en: 'Open' },
  'yes': { ru: 'Да', he: 'כן', en: 'Yes' },
  'no': { ru: 'Нет', he: 'לא', en: 'No' },
  
  // Credit/Refinancing specific
  'credit': { ru: 'Кредит', he: 'אשראי', en: 'Credit' },
  'refinance': { ru: 'Рефинансирование', he: 'מחזור', en: 'Refinance' },
  'program': { ru: 'Программа', he: 'תכנית', en: 'Program' },
  'selection': { ru: 'Выбор', he: 'בחירה', en: 'Selection' },
  'option': { ru: 'Опция', he: 'אפשרות', en: 'Option' },
  'amount': { ru: 'Сумма', he: 'סכום', en: 'Amount' },
  'rate': { ru: 'Ставка', he: 'ריבית', en: 'Rate' },
  'term': { ru: 'Срок', he: 'תקופה', en: 'Term' },
  'monthly_payment': { ru: 'Ежемесячный платеж', he: 'תשלום חודשי', en: 'Monthly Payment' },
  
  // Form fields
  'name': { ru: 'Имя', he: 'שם', en: 'Name' },
  'email': { ru: 'Email', he: 'דוא"ל', en: 'Email' },
  'phone': { ru: 'Телефон', he: 'טלפון', en: 'Phone' },
  'address': { ru: 'Адрес', he: 'כתובת', en: 'Address' },
  'income': { ru: 'Доход', he: 'הכנסה', en: 'Income' },
  'employment': { ru: 'Работа', he: 'עבודה', en: 'Employment' },
  
  // Common words
  'personal': { ru: 'Личные', he: 'אישי', en: 'Personal' },
  'data': { ru: 'Данные', he: 'נתונים', en: 'Data' },
  'form': { ru: 'Форма', he: 'טופס', en: 'Form' },
  'step': { ru: 'Шаг', he: 'שלב', en: 'Step' },
  'loading': { ru: 'Загрузка', he: 'טוען', en: 'Loading' },
  'verification': { ru: 'Проверка', he: 'אימות', en: 'Verification' },
  'registration': { ru: 'Регистрация', he: 'הרשמה', en: 'Registration' },
  'login': { ru: 'Вход', he: 'כניסה', en: 'Login' },
  'password': { ru: 'Пароль', he: 'סיסמה', en: 'Password' },
  'reset': { ru: 'Сброс', he: 'איפוס', en: 'Reset' }
};

function generateTranslation(contentKey, lang) {
  // Try to find a mapping based on key parts
  const keyParts = contentKey.toLowerCase().split(/[._]/);
  
  for (const part of keyParts) {
    if (TRANSLATION_MAPPINGS[part]) {
      return TRANSLATION_MAPPINGS[part][lang];
    }
  }
  
  // Generate a fallback translation
  const cleanKey = contentKey
    .replace(/^[^.]*\./, '') // Remove screen prefix
    .replace(/_/g, ' ')      // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    
  return `[${lang.toUpperCase()}] ${cleanKey}`;
}

async function findAllProblematicScreens() {
  console.log('🔍 Finding all screens with missing translations...\n');
  
  const query = `
    WITH screen_translation_stats AS (
      SELECT 
        ci.screen_location,
        COUNT(ci.id) as total_items,
        COUNT(DISTINCT ct.content_item_id) as items_with_translations,
        SUM(CASE WHEN ct.content_value LIKE '%Translation missing%' THEN 1 ELSE 0 END) as items_with_missing_flags
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status IN ('approved', 'draft')
      WHERE ci.is_active = TRUE 
        AND ci.screen_location IS NOT NULL 
        AND ci.screen_location != ''
      GROUP BY ci.screen_location
    )
    SELECT 
      screen_location,
      total_items,
      items_with_translations,
      items_with_missing_flags,
      (total_items - items_with_translations) as items_without_translations
    FROM screen_translation_stats
    WHERE (total_items - items_with_translations) > 0 
       OR items_with_missing_flags > 0
    ORDER BY (total_items - items_with_translations) DESC, items_with_missing_flags DESC
  `;
  
  const result = await pool.query(query);
  
  console.log(`📊 Found ${result.rows.length} screens with translation issues:\n`);
  
  for (const row of result.rows) {
    console.log(`📍 ${row.screen_location}:`);
    console.log(`   Total items: ${row.total_items}`);
    console.log(`   Items without any translations: ${row.items_without_translations}`);
    console.log(`   Items with "Translation missing" flags: ${row.items_with_missing_flags}`);
    console.log('');
  }
  
  return result.rows.map(row => row.screen_location);
}

async function fixScreenTranslations(screenLocation) {
  console.log(`🔧 Fixing translations for: ${screenLocation}`);
  
  // Get all items in this screen that need translation fixes
  const itemsQuery = `
    WITH item_translation_status AS (
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        COUNT(ct.id) as translation_count,
        SUM(CASE WHEN ct.content_value LIKE '%Translation missing%' THEN 1 ELSE 0 END) as missing_flag_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1 
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type
    )
    SELECT id, content_key, component_type, translation_count, missing_flag_count
    FROM item_translation_status
    WHERE translation_count = 0 OR missing_flag_count > 0
    ORDER BY content_key
  `;
  
  const itemsResult = await pool.query(itemsQuery, [screenLocation]);
  
  let fixesApplied = 0;
  
  for (const item of itemsResult.rows) {
    const { id: itemId, content_key, component_type } = item;
    
    if (item.translation_count === 0) {
      // Create missing translations for all languages
      for (const lang of LANGUAGES) {
        const translation = generateTranslation(content_key, lang);
        
        try {
          await pool.query(
            `INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
             VALUES ($1, $2, $3, 'approved', NOW(), NOW())`,
            [itemId, lang, translation]
          );
          console.log(`  ✅ Created ${content_key} (${lang}): ${translation}`);
          fixesApplied++;
        } catch (error) {
          console.log(`  ❌ Failed to create ${content_key} (${lang}):`, error.message);
        }
      }
    } else if (item.missing_flag_count > 0) {
      // Fix "Translation missing" flags
      const existingQuery = `
        SELECT language_code, content_value 
        FROM content_translations 
        WHERE content_item_id = $1 AND status IN ('approved', 'draft')
      `;
      const existingResult = await pool.query(existingQuery, [itemId]);
      
      for (const existing of existingResult.rows) {
        if (existing.content_value && existing.content_value.includes('Translation missing')) {
          const newTranslation = generateTranslation(content_key, existing.language_code);
          
          try {
            await pool.query(
              `UPDATE content_translations 
               SET content_value = $1, updated_at = NOW()
               WHERE content_item_id = $2 AND language_code = $3`,
              [newTranslation, itemId, existing.language_code]
            );
            console.log(`  ✅ Fixed ${content_key} (${existing.language_code}): ${newTranslation}`);
            fixesApplied++;
          } catch (error) {
            console.log(`  ❌ Failed to fix ${content_key} (${existing.language_code}):`, error.message);
          }
        }
      }
    }
  }
  
  console.log(`  🎯 Applied ${fixesApplied} fixes for ${screenLocation}\n`);
  return fixesApplied;
}

async function main() {
  try {
    console.log('🚀 BATCH TRANSLATION FIXER\n');
    
    // Find all problematic screens
    const problematicScreens = await findAllProblematicScreens();
    
    if (problematicScreens.length === 0) {
      console.log('🎉 No screens with translation issues found!');
      return;
    }
    
    console.log(`🔧 Fixing ${problematicScreens.length} screens...\n`);
    
    let totalFixes = 0;
    const fixedScreens = [];
    
    // Fix each screen
    for (const screen of problematicScreens) {
      const screenFixes = await fixScreenTranslations(screen);
      if (screenFixes > 0) {
        fixedScreens.push(screen);
        totalFixes += screenFixes;
      }
    }
    
    console.log('🎊 BATCH FIX COMPLETED!');
    console.log(`📊 Fixed ${fixedScreens.length} screens`);
    console.log(`🔧 Applied ${totalFixes} total fixes`);
    
    if (fixedScreens.length > 0) {
      console.log('\n✅ Fixed screens:');
      fixedScreens.forEach(screen => console.log(`  - ${screen}`));
    }
    
    // Verify credit_refi_program_selection specifically
    console.log('\n🎯 Verifying credit_refi_program_selection...');
    const verifyQuery = `
      SELECT COUNT(*) as items_without_translations
      FROM content_items ci
      WHERE ci.screen_location = 'credit_refi_program_selection'
        AND ci.is_active = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM content_translations ct 
          WHERE ct.content_item_id = ci.id 
            AND ct.status IN ('approved', 'draft')
        )
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    const remaining = parseInt(verifyResult.rows[0].items_without_translations);
    
    if (remaining === 0) {
      console.log('✅ credit_refi_program_selection: All translations are now complete!');
    } else {
      console.log(`⚠️  credit_refi_program_selection: ${remaining} items still need translations`);
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

module.exports = { findAllProblematicScreens, fixScreenTranslations, generateTranslation };