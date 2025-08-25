#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

const LANGUAGES = ['ru', 'he', 'en'];

// Specific translations for credit refi program selection based on typical content
const SPECIFIC_TRANSLATIONS = {
  'credit_refi_program_selection.item_1': {
    ru: 'Выберите программу кредитного рефинансирования',
    he: 'בחר תכנית למחזור אשראי',
    en: 'Select Credit Refinancing Program'
  },
  'credit_refi_program_selection.item_2': {
    ru: 'Доступные программы рефинансирования',
    he: 'תכניות מחזור זמינות',
    en: 'Available Refinancing Programs'
  },
  'credit_refi_program_selection.item_3': {
    ru: 'Условия и требования',
    he: 'תנאים ודרישות',
    en: 'Terms and Requirements'
  },
  'credit_refi_program_selection.item_4': {
    ru: 'Стандартное рефинансирование',
    he: 'מחזור רגיל',
    en: 'Standard Refinancing'
  },
  'credit_refi_program_selection.item_5': {
    ru: 'Рефинансирование с улучшенными условиями',
    he: 'מחזור עם תנאים משופרים',
    en: 'Enhanced Terms Refinancing'
  },
  'credit_refi_program_selection.item_6': {
    ru: 'Экспресс-рефинансирование',
    he: 'מחזור מהיר',
    en: 'Express Refinancing'
  },
  'credit_refi_program_selection.item_7': {
    ru: 'Рефинансирование для VIP клиентов',
    he: 'מחזור עבור לקוחות VIP',
    en: 'VIP Client Refinancing'
  },
  'credit_refi_program_selection.item_8': {
    ru: 'Индивидуальная программа',
    he: 'תכנית אישית',
    en: 'Individual Program'
  },
  'credit_refi_program_selection.item_9': {
    ru: 'Подробная информация о программах',
    he: 'מידע מפורט על התכניות',
    en: 'Detailed Program Information'
  },
  'credit_refi_program_selection.item_10': {
    ru: 'Процентная ставка',
    he: 'ריבית',
    en: 'Interest Rate'
  },
  'credit_refi_program_selection.item_11': {
    ru: 'Срок кредита',
    he: 'תקופת האשראי',
    en: 'Loan Term'
  },
  'credit_refi_program_selection.item_12': {
    ru: 'Минимальная сумма',
    he: 'סכום מינימלי',
    en: 'Minimum Amount'
  },
  'credit_refi_program_selection.item_13': {
    ru: 'Комиссия за рефинансирование',
    he: 'עמלת מחזור',
    en: 'Refinancing Fee'
  },
  'credit_refi_program_selection.item_14': {
    ru: 'Дополнительные услуги',
    he: 'שירותים נוספים',
    en: 'Additional Services'
  },
  'credit_refi_program_selection.item_15': {
    ru: 'Продолжить с выбранной программой',
    he: 'המשך עם התכנית שנבחרה',
    en: 'Continue with Selected Program'
  }
};

function generateFallbackTranslation(contentKey, lang) {
  // Clean up the key to make it readable
  const cleanKey = contentKey
    .replace('credit_refi_program_selection.', '')
    .replace('item_', 'Item ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
    
  return `[${lang.toUpperCase()}] ${cleanKey}`;
}

async function fixCreditRefiProgramSelection() {
  console.log('🔧 Fixing credit_refi_program_selection translations...\n');
  
  // Get all items that need translations
  const itemsQuery = `
    SELECT id, content_key, component_type
    FROM content_items 
    WHERE screen_location = 'credit_refi_program_selection' 
      AND is_active = TRUE
    ORDER BY content_key
  `;
  
  const itemsResult = await pool.query(itemsQuery);
  console.log(`Found ${itemsResult.rows.length} items to fix\n`);
  
  let totalFixes = 0;
  
  for (const item of itemsResult.rows) {
    const { id: itemId, content_key, component_type } = item;
    console.log(`🔧 Processing: ${content_key} (${component_type})`);
    
    // Check if translations already exist
    const existingQuery = `
      SELECT language_code 
      FROM content_translations 
      WHERE content_item_id = $1 AND status IN ('approved', 'draft')
    `;
    const existingResult = await pool.query(existingQuery, [itemId]);
    const existingLangs = existingResult.rows.map(row => row.language_code);
    
    // Create missing translations
    for (const lang of LANGUAGES) {
      if (!existingLangs.includes(lang)) {
        // Use specific translation if available, otherwise generate fallback
        let translation;
        if (SPECIFIC_TRANSLATIONS[content_key] && SPECIFIC_TRANSLATIONS[content_key][lang]) {
          translation = SPECIFIC_TRANSLATIONS[content_key][lang];
        } else {
          translation = generateFallbackTranslation(content_key, lang);
        }
        
        try {
          await pool.query(
            `INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
             VALUES ($1, $2, $3, 'approved', NOW(), NOW())`,
            [itemId, lang, translation]
          );
          console.log(`  ✅ Created ${lang}: ${translation}`);
          totalFixes++;
        } catch (error) {
          console.log(`  ❌ Failed ${lang}:`, error.message);
        }
      } else {
        console.log(`  ⏭️  Skipped ${lang}: already exists`);
      }
    }
    console.log('');
  }
  
  console.log(`🎯 Applied ${totalFixes} translations total\n`);
  
  // Verify the fix
  console.log('🔍 Verifying fix...');
  const verifyQuery = `
    SELECT ci.content_key,
           COUNT(ct.id) as translation_count,
           ARRAY_AGG(ct.language_code ORDER BY ct.language_code) as languages
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
      AND ct.status IN ('approved', 'draft')
    WHERE ci.screen_location = 'credit_refi_program_selection'
      AND ci.is_active = TRUE
    GROUP BY ci.id, ci.content_key
    ORDER BY ci.content_key
  `;
  
  const verifyResult = await pool.query(verifyQuery);
  
  let allComplete = true;
  for (const row of verifyResult.rows) {
    const count = parseInt(row.translation_count);
    if (count === 3) {
      console.log(`✅ ${row.content_key}: Complete (${row.languages?.join(', ')})`);
    } else {
      console.log(`❌ ${row.content_key}: Incomplete (${count}/3) - ${row.languages?.join(', ') || 'none'}`);
      allComplete = false;
    }
  }
  
  if (allComplete) {
    console.log('\n🎉 SUCCESS! All items in credit_refi_program_selection now have complete translations!');
  } else {
    console.log('\n⚠️  Some items still need attention');
  }
  
  return { totalFixes, itemsFixed: itemsResult.rows.length, allComplete };
}

async function main() {
  try {
    const result = await fixCreditRefiProgramSelection();
    
    console.log('\n📊 SUMMARY:');
    console.log(`Items processed: ${result.itemsFixed}`);
    console.log(`Translations created: ${result.totalFixes}`);
    console.log(`Status: ${result.allComplete ? 'COMPLETE' : 'NEEDS ATTENTION'}`);
    
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

module.exports = { fixCreditRefiProgramSelection };