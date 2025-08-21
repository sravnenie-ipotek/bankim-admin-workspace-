require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixCreditTranslations() {
  try {
    console.log('🚀 Fixing credit page translations...');
    
    // Check what credit items exist and what translations they have
    const creditItemsQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        COUNT(ct.id) as translation_count,
        STRING_AGG(DISTINCT ct.language_code, ',') as languages,
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit_%'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.screen_location, ci.component_type
      ORDER BY ci.screen_location, ci.page_number, ci.id
      LIMIT 20
    `;
    
    const creditItems = await pool.query(creditItemsQuery);
    console.log(`🔍 Found ${creditItems.rows.length} credit items (first 20 shown)`);
    
    console.log('\n📋 Sample credit items:');
    creditItems.rows.forEach((item, index) => {
      if (index < 10) {
        console.log(`  ${item.screen_location}: ${item.content_key} - ${item.translation_count} translations (${item.languages || 'none'}) - "${item.text_ru || 'empty'}"`);
      }
    });
    
    // Let's focus on credit_summary since that's what the user showed
    console.log('\n🎯 Focusing on credit_summary screen...');
    
    const creditSummaryQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.page_number,
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_summary'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.page_number
      ORDER BY ci.page_number, ci.id
    `;
    
    const creditSummaryItems = await pool.query(creditSummaryQuery);
    console.log(`📊 Credit summary has ${creditSummaryItems.rows.length} items`);
    
    if (creditSummaryItems.rows.length > 0) {
      console.log('\n📋 Credit summary items:');
      creditSummaryItems.rows.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.content_key} - "${item.text_ru || 'NO RU'}" / "${item.text_he || 'NO HE'}" / "${item.text_en || 'NO EN'}"`);
      });
      
      // Count how many have translations
      const withTranslations = creditSummaryItems.rows.filter(item => 
        item.text_ru || item.text_he || item.text_en
      );
      console.log(`\n📊 ${withTranslations.length}/${creditSummaryItems.rows.length} items have translations`);
      
      if (withTranslations.length === 0) {
        console.log('\n🔧 Adding meaningful translations for credit_summary items...');
        
        // Add meaningful translations for credit summary
        const summaryTranslations = [
          { key: 'credit_summary.item_1', ru: 'Сводка по кредиту', he: 'סיכום האשראי', en: 'Credit Summary' },
          { key: 'credit_summary.item_2', ru: 'Сумма кредита', he: 'סכום האשראי', en: 'Loan Amount' },
          { key: 'credit_summary.item_3', ru: 'Процентная ставка', he: 'ריבית', en: 'Interest Rate' },
          { key: 'credit_summary.item_4', ru: 'Срок кредита', he: 'משך האשראי', en: 'Loan Term' },
          { key: 'credit_summary.item_5', ru: 'Ежемесячный платеж', he: 'תשלום חודשי', en: 'Monthly Payment' },
          { key: 'credit_summary.item_6', ru: 'Общая сумма к выплате', he: 'סך הכל לתשלום', en: 'Total Amount to Pay' },
          { key: 'credit_summary.item_7', ru: 'Первоначальный взнос', he: 'מקדמה', en: 'Down Payment' },
          { key: 'credit_summary.item_8', ru: 'Цель кредита', he: 'מטרת האשראי', en: 'Loan Purpose' },
          { key: 'credit_summary.item_9', ru: 'Статус заявки', he: 'סטטוס הבקשה', en: 'Application Status' },
          { key: 'credit_summary.item_10', ru: 'Дата подачи', he: 'תאריך הגשה', en: 'Application Date' },
          { key: 'credit_summary.item_11', ru: 'Одобрено банком', he: 'אושר בבנק', en: 'Bank Approved' },
          { key: 'credit_summary.item_12', ru: 'Следующий шаг', he: 'השלב הבא', en: 'Next Step' }
        ];
        
        let addedCount = 0;
        for (const item of creditSummaryItems.rows) {
          const itemNumber = parseInt(item.content_key.match(/item_(\d+)/)?.[1] || '1');
          const translation = summaryTranslations[itemNumber - 1];
          
          if (translation && !item.text_ru) {
            // Add translations for this item
            const languages = [
              { code: 'ru', text: translation.ru },
              { code: 'he', text: translation.he },
              { code: 'en', text: translation.en }
            ];
            
            for (const lang of languages) {
              await pool.query(`
                INSERT INTO content_translations (
                  content_item_id,
                  language_code,
                  content_value,
                  status,
                  created_at,
                  updated_at
                ) VALUES ($1, $2, $3, 'draft', NOW(), NOW())
                ON CONFLICT (content_item_id, language_code) DO UPDATE SET
                  content_value = EXCLUDED.content_value,
                  updated_at = NOW()
              `, [item.id, lang.code, lang.text]);
            }
            addedCount++;
          }
        }
        
        console.log(`✅ Added translations for ${addedCount} credit_summary items`);
      }
    }
    
    console.log('\n✅ Credit translations analysis complete!');
    await pool.end();
  } catch (error) {
    console.error('Error fixing credit translations:', error);
    await pool.end();
    process.exit(1);
  }
}

fixCreditTranslations();