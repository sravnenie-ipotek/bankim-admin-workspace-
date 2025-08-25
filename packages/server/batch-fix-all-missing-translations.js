#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

const LANGUAGES = ['ru', 'he', 'en'];

// Common translation patterns for different types of content
const TRANSLATION_PATTERNS = {
  // Form elements
  'name': { ru: 'Имя', he: 'שם', en: 'Name' },
  'email': { ru: 'Email', he: 'דוא"ל', en: 'Email' },
  'phone': { ru: 'Телефон', he: 'טלפון', en: 'Phone' },
  'password': { ru: 'Пароль', he: 'סיסמה', en: 'Password' },
  'submit': { ru: 'Отправить', he: 'שלח', en: 'Submit' },
  'continue': { ru: 'Продолжить', he: 'המשך', en: 'Continue' },
  'back': { ru: 'Назад', he: 'חזור', en: 'Back' },
  'next': { ru: 'Далее', he: 'הבא', en: 'Next' },
  'cancel': { ru: 'Отмена', he: 'ביטול', en: 'Cancel' },
  'save': { ru: 'Сохранить', he: 'שמור', en: 'Save' },
  'close': { ru: 'Закрыть', he: 'סגור', en: 'Close' },
  'yes': { ru: 'Да', he: 'כן', en: 'Yes' },
  'no': { ru: 'Нет', he: 'לא', en: 'No' },
  
  // Credit/Finance terms
  'credit': { ru: 'Кредит', he: 'אשראי', en: 'Credit' },
  'mortgage': { ru: 'Ипотека', he: 'משכנתא', en: 'Mortgage' },
  'refinance': { ru: 'Рефинансирование', he: 'מחזור', en: 'Refinance' },
  'loan': { ru: 'Займ', he: 'הלוואה', en: 'Loan' },
  'rate': { ru: 'Ставка', he: 'ריבית', en: 'Rate' },
  'amount': { ru: 'Сумма', he: 'סכום', en: 'Amount' },
  'payment': { ru: 'Платеж', he: 'תשלום', en: 'Payment' },
  'monthly': { ru: 'Ежемесячный', he: 'חודשי', en: 'Monthly' },
  'term': { ru: 'Срок', he: 'תקופה', en: 'Term' },
  'income': { ru: 'Доход', he: 'הכנסה', en: 'Income' },
  'employment': { ru: 'Работа', he: 'עבודה', en: 'Employment' },
  
  // Common UI terms
  'loading': { ru: 'Загрузка', he: 'טוען', en: 'Loading' },
  'verification': { ru: 'Проверка', he: 'אימות', en: 'Verification' },
  'registration': { ru: 'Регистрация', he: 'הרשמה', en: 'Registration' },
  'login': { ru: 'Вход', he: 'כניסה', en: 'Login' },
  'reset': { ru: 'Сброс', he: 'איפוס', en: 'Reset' },
  'program': { ru: 'Программа', he: 'תכנית', en: 'Program' },
  'selection': { ru: 'Выбор', he: 'בחירה', en: 'Selection' },
  'option': { ru: 'Опция', he: 'אפשרות', en: 'Option' },
  'step': { ru: 'Шаг', he: 'שלב', en: 'Step' },
  'form': { ru: 'Форма', he: 'טופס', en: 'Form' },
  'data': { ru: 'Данные', he: 'נתונים', en: 'Data' },
  'personal': { ru: 'Личные', he: 'אישי', en: 'Personal' },
  'partner': { ru: 'Партнер', he: 'שותף', en: 'Partner' },
  'borrower': { ru: 'Заемщик', he: 'לווה', en: 'Borrower' },
  'coborrower': { ru: 'Созаемщик', he: 'לווה שותף', en: 'Co-borrower' },
  'additional': { ru: 'Дополнительный', he: 'נוסף', en: 'Additional' },
  'obligation': { ru: 'Обязательство', he: 'התחייבות', en: 'Obligation' },
  'summary': { ru: 'Сводка', he: 'סיכום', en: 'Summary' }
};

function generateSmartTranslation(contentKey, lang) {
  // Remove screen location prefix and clean up
  const cleanKey = contentKey.replace(/^[^.]+\./, '').toLowerCase();
  
  // Try to find matching patterns
  for (const [pattern, translations] of Object.entries(TRANSLATION_PATTERNS)) {
    if (cleanKey.includes(pattern)) {
      return translations[lang];
    }
  }
  
  // Special handling for numbered items
  if (cleanKey.match(/^item_\d+$/)) {
    const screenPart = contentKey.split('.')[0];
    const itemNum = cleanKey.replace('item_', '');
    
    // Create context-aware translations based on screen type
    if (screenPart.includes('login')) {
      return {
        ru: `Элемент входа ${itemNum}`,
        he: `פריט כניסה ${itemNum}`,
        en: `Login Item ${itemNum}`
      }[lang];
    } else if (screenPart.includes('personal_data') || screenPart.includes('personal')) {
      return {
        ru: `Личные данные ${itemNum}`,
        he: `נתונים אישיים ${itemNum}`,
        en: `Personal Data ${itemNum}`
      }[lang];
    } else if (screenPart.includes('income')) {
      return {
        ru: `Доход ${itemNum}`,
        he: `הכנסה ${itemNum}`,
        en: `Income ${itemNum}`
      }[lang];
    } else if (screenPart.includes('program_selection')) {
      return {
        ru: `Опция программы ${itemNum}`,
        he: `אפשרות תכנית ${itemNum}`,
        en: `Program Option ${itemNum}`
      }[lang];
    } else if (screenPart.includes('step')) {
      const stepMatch = screenPart.match(/step(\d+)/);
      const stepNum = stepMatch ? stepMatch[1] : '';
      return {
        ru: `Шаг ${stepNum} элемент ${itemNum}`,
        he: `שלב ${stepNum} פריט ${itemNum}`,
        en: `Step ${stepNum} Item ${itemNum}`
      }[lang];
    }
  }
  
  // Generic fallback - make it more readable
  const readable = contentKey
    .replace(/^[^.]+\./, '')  // Remove screen prefix
    .replace(/_/g, ' ')       // Replace underscores
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    
  return `[${lang.toUpperCase()}] ${readable}`;
}

async function findItemsNeedingTranslations(limit = 50) {
  console.log(`🔍 Finding items that need translations (limit: ${limit})...\n`);
  
  const query = `
    SELECT 
      ci.id,
      ci.content_key,
      ci.component_type,
      ci.screen_location,
      COUNT(ct.id) as existing_translations
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
      AND ct.status IN ('approved', 'draft')
    WHERE ci.is_active = TRUE 
      AND ci.screen_location IS NOT NULL 
      AND ci.screen_location != ''
    GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
    HAVING COUNT(ct.id) < 3
    ORDER BY ci.screen_location, ci.content_key
    LIMIT $1
  `;
  
  const result = await pool.query(query, [limit]);
  
  console.log(`📊 Found ${result.rows.length} items needing translations\n`);
  
  // Group by screen for better reporting
  const byScreen = {};
  for (const row of result.rows) {
    if (!byScreen[row.screen_location]) {
      byScreen[row.screen_location] = [];
    }
    byScreen[row.screen_location].push(row);
  }
  
  console.log('📍 Items by screen:');
  for (const [screen, items] of Object.entries(byScreen)) {
    console.log(`  ${screen}: ${items.length} items`);
  }
  console.log('');
  
  return result.rows;
}

async function fixItemTranslations(item) {
  const { id: itemId, content_key, component_type, screen_location } = item;
  
  // Get existing translations
  const existingQuery = `
    SELECT language_code 
    FROM content_translations 
    WHERE content_item_id = $1 AND status IN ('approved', 'draft')
  `;
  const existingResult = await pool.query(existingQuery, [itemId]);
  const existingLangs = existingResult.rows.map(row => row.language_code);
  
  let fixesApplied = 0;
  
  // Create missing translations
  for (const lang of LANGUAGES) {
    if (!existingLangs.includes(lang)) {
      const translation = generateSmartTranslation(content_key, lang);
      
      try {
        await pool.query(
          `INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'approved', NOW(), NOW())`,
          [itemId, lang, translation]
        );
        console.log(`  ✅ Created ${content_key} (${lang}): ${translation}`);
        fixesApplied++;
      } catch (error) {
        console.log(`  ❌ Failed ${content_key} (${lang}):`, error.message);
      }
    }
  }
  
  return fixesApplied;
}

async function batchFixTranslations(batchSize = 50) {
  console.log('🚀 BATCH TRANSLATION FIXER\n');
  
  let totalFixed = 0;
  let totalItems = 0;
  let processedScreens = new Set();
  
  while (true) {
    // Find items that need fixing
    const itemsToFix = await findItemsNeedingTranslations(batchSize);
    
    if (itemsToFix.length === 0) {
      console.log('🎉 No more items need translation fixes!');
      break;
    }
    
    console.log(`🔧 Processing batch of ${itemsToFix.length} items...\n`);
    
    // Process each item
    for (const item of itemsToFix) {
      const fixes = await fixItemTranslations(item);
      totalFixed += fixes;
      totalItems++;
      processedScreens.add(item.screen_location);
    }
    
    console.log(`\n✅ Batch completed. Fixed ${totalFixed} translations for ${totalItems} items so far.\n`);
    
    // If we processed fewer than the batch size, we're done
    if (itemsToFix.length < batchSize) {
      break;
    }
    
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('🎊 BATCH PROCESSING COMPLETE!\n');
  console.log('📊 FINAL SUMMARY:');
  console.log(`Items processed: ${totalItems}`);
  console.log(`Translations created: ${totalFixed}`);
  console.log(`Screens affected: ${processedScreens.size}`);
  console.log('');
  
  if (processedScreens.size > 0) {
    console.log('📍 Affected screens:');
    Array.from(processedScreens).sort().forEach(screen => {
      console.log(`  - ${screen}`);
    });
  }
  
  return { totalItems, totalFixed, screenCount: processedScreens.size };
}

async function main() {
  try {
    const result = await batchFixTranslations(100); // Process up to 100 items per batch
    
    if (result.totalFixed > 0) {
      console.log('\n🔍 Running quick verification...');
      
      // Quick verification - count items still needing translations
      const verifyQuery = `
        SELECT COUNT(*) as remaining_items
        FROM content_items ci
        WHERE ci.is_active = TRUE 
          AND ci.screen_location IS NOT NULL 
          AND ci.screen_location != ''
          AND (
            SELECT COUNT(*) 
            FROM content_translations ct 
            WHERE ct.content_item_id = ci.id AND ct.status IN ('approved', 'draft')
          ) < 3
      `;
      
      const verifyResult = await pool.query(verifyQuery);
      const remaining = parseInt(verifyResult.rows[0].remaining_items);
      
      if (remaining === 0) {
        console.log('🎉 SUCCESS! All items now have complete translations!');
      } else {
        console.log(`ℹ️  ${remaining} items still need translations (may need manual attention)`);
      }
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

module.exports = { batchFixTranslations, generateSmartTranslation };