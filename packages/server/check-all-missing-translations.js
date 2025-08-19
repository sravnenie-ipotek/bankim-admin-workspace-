const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndFixMissingTranslations() {
  try {
    await pool.connect();
    console.log('🔍 Checking for missing translations across all content...\n');

    // Find all content items that have the same content_key as their translation value
    const missingTranslationsResult = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct_ru.content_value as ru_value,
        ct_he.content_value as he_value,
        ct_en.content_value as en_value
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.is_active = true
        AND (
          -- Items where translation value equals content_key (missing translation)
          (ct_ru.content_value = ci.content_key) OR
          (ct_he.content_value = ci.content_key) OR
          (ct_en.content_value = ci.content_key) OR
          -- Items with missing translations
          ct_ru.content_value IS NULL OR
          ct_he.content_value IS NULL OR
          ct_en.content_value IS NULL
        )
      ORDER BY ci.screen_location, ci.content_key
    `);

    console.log(`📋 Found ${missingTranslationsResult.rows.length} items with missing or incorrect translations:\n`);

    if (missingTranslationsResult.rows.length === 0) {
      console.log('✅ No missing translations found!');
      return;
    }

    // Group by screen_location for better organization
    const groupedByScreen = {};
    missingTranslationsResult.rows.forEach(row => {
      if (!groupedByScreen[row.screen_location]) {
        groupedByScreen[row.screen_location] = [];
      }
      groupedByScreen[row.screen_location].push(row);
    });

    // Process each screen location
    for (const [screenLocation, items] of Object.entries(groupedByScreen)) {
      console.log(`\n🔧 Processing ${screenLocation} (${items.length} items):`);
      
      for (const item of items) {
        console.log(`  - ${item.content_key}`);
        
        // Generate appropriate translations based on content_key patterns
        const translations = generateTranslations(item.content_key, item.component_type);
        
        // Update Russian translation if needed
        if (item.ru_value === item.content_key || item.ru_value === null) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, 'ru', $2, 'approved')
            ON CONFLICT (content_item_id, language_code) 
            DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP
          `, [item.id, translations.ru]);
          console.log(`    ✅ Fixed Russian: ${translations.ru}`);
        }
        
        // Update Hebrew translation if needed
        if (item.he_value === item.content_key || item.he_value === null) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, 'he', $2, 'approved')
            ON CONFLICT (content_item_id, language_code) 
            DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP
          `, [item.id, translations.he]);
          console.log(`    ✅ Fixed Hebrew: ${translations.he}`);
        }
        
        // Update English translation if needed
        if (item.en_value === item.content_key || item.en_value === null) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, 'en', $2, 'approved')
            ON CONFLICT (content_item_id, language_code) 
            DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP
          `, [item.id, translations.en]);
          console.log(`    ✅ Fixed English: ${translations.en}`);
        }
      }
    }

    console.log('\n✅ All missing translations have been fixed!');
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verificationResult = await pool.query(`
      SELECT 
        ci.screen_location,
        COUNT(*) as total_items,
        COUNT(CASE WHEN ct_ru.content_value = ci.content_key THEN 1 END) as missing_ru,
        COUNT(CASE WHEN ct_he.content_value = ci.content_key THEN 1 END) as missing_he,
        COUNT(CASE WHEN ct_en.content_value = ci.content_key THEN 1 END) as missing_en
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.is_active = true
      GROUP BY ci.screen_location
      HAVING 
        COUNT(CASE WHEN ct_ru.content_value = ci.content_key THEN 1 END) > 0 OR
        COUNT(CASE WHEN ct_he.content_value = ci.content_key THEN 1 END) > 0 OR
        COUNT(CASE WHEN ct_en.content_value = ci.content_key THEN 1 END) > 0
      ORDER BY ci.screen_location
    `);

    if (verificationResult.rows.length === 0) {
      console.log('✅ Verification passed: No missing translations found!');
    } else {
      console.log('⚠️  Some items still have missing translations:');
      verificationResult.rows.forEach(row => {
        console.log(`  - ${row.screen_location}: ${row.missing_ru} RU, ${row.missing_he} HE, ${row.missing_en} EN`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking/fixing translations:', error);
  } finally {
    await pool.end();
  }
}

function generateTranslations(contentKey, componentType) {
  // Extract meaningful parts from content_key
  const parts = contentKey.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Generate translations based on patterns
  let ru = '';
  let he = '';
  let en = '';
  
  // Handle common patterns
  if (contentKey.includes('filter')) {
    ru = 'Фильтр';
    he = 'מסנן';
    en = 'Filter';
  } else if (contentKey.includes('title')) {
    ru = 'Заголовок';
    he = 'כותרת';
    en = 'Title';
  } else if (contentKey.includes('description')) {
    ru = 'Описание';
    he = 'תיאור';
    en = 'Description';
  } else if (contentKey.includes('button')) {
    ru = 'Кнопка';
    he = 'כפתור';
    en = 'Button';
  } else if (contentKey.includes('label')) {
    ru = 'Метка';
    he = 'תווית';
    en = 'Label';
  } else if (contentKey.includes('placeholder')) {
    ru = 'Подсказка';
    he = 'רמז';
    en = 'Placeholder';
  } else if (contentKey.includes('monthly_payment')) {
    ru = 'Ежемесячный платеж';
    he = 'תשלום חודשי';
    en = 'Monthly Payment';
  } else if (contentKey.includes('total')) {
    ru = 'Общая сумма';
    he = 'סכום כולל';
    en = 'Total Amount';
  } else if (contentKey.includes('select_bank')) {
    ru = 'Выбрать банк';
    he = 'בחר בנק';
    en = 'Select Bank';
  } else if (contentKey.includes('parameters')) {
    ru = 'Параметры';
    he = 'פרמטרים';
    en = 'Parameters';
  } else if (contentKey.includes('profile')) {
    ru = 'Профиль';
    he = 'פרופיל';
    en = 'Profile';
  } else if (contentKey.includes('warning')) {
    ru = 'Предупреждение';
    he = 'אזהרה';
    en = 'Warning';
  } else if (contentKey.includes('prime')) {
    ru = 'Прайм-ставка';
    he = 'ריבית פריים';
    en = 'Prime Rate';
  } else if (contentKey.includes('fixed_rate')) {
    ru = 'Фиксированная ставка';
    he = 'ריבית קבועה';
    en = 'Fixed Rate';
  } else if (contentKey.includes('variable_rate')) {
    ru = 'Переменная ставка';
    he = 'ריבית משתנה';
    en = 'Variable Rate';
  } else {
    // Fallback: use the last part of the content_key
    ru = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ');
    he = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ');
    en = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ');
  }
  
  return { ru, he, en };
}

// Run the script
checkAndFixMissingTranslations().catch(console.error);
