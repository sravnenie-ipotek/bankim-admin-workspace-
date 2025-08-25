require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixCreditIncomeEmployedTranslations() {
  try {
    console.log('🚀 Adding translations for credit_income_employed...');
    
    // First, let's check what items exist for this screen
    const itemsQuery = `
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
      WHERE ci.screen_location = 'credit_income_employed'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.page_number
      ORDER BY ci.page_number, ci.id
    `;
    
    const items = await pool.query(itemsQuery);
    console.log(`📋 Found ${items.rows.length} items for credit_income_employed`);
    
    // Check how many already have translations
    const withTranslations = items.rows.filter(item => 
      item.text_ru || item.text_he || item.text_en
    );
    console.log(`📊 ${withTranslations.length}/${items.rows.length} items have translations`);
    
    if (withTranslations.length < items.rows.length) {
      console.log('\n🔧 Adding meaningful translations for credit income employed form...');
      
      // Define meaningful translations for income employed form
      const translations = [
        { key: 'credit_income_employed.item_1', ru: 'Данные о доходах', he: 'פרטי הכנסה', en: 'Income Information' },
        { key: 'credit_income_employed.item_2', ru: 'Основное место работы', he: 'מקום עבודה עיקרי', en: 'Primary Workplace' },
        { key: 'credit_income_employed.item_3', ru: 'Наименование работодателя', he: 'שם המעסיק', en: 'Employer Name' },
        { key: 'credit_income_employed.item_4', ru: 'Должность', he: 'תפקיד', en: 'Position' },
        { key: 'credit_income_employed.item_5', ru: 'Стаж работы', he: 'ותק בעבודה', en: 'Work Experience' },
        { key: 'credit_income_employed.item_6', ru: 'Месячный доход (брутто)', he: 'הכנסה חודשית (ברוטו)', en: 'Monthly Income (Gross)' },
        { key: 'credit_income_employed.item_7', ru: 'Месячный доход (нетто)', he: 'הכנסה חודשית (נטו)', en: 'Monthly Income (Net)' },
        { key: 'credit_income_employed.item_8', ru: 'Дополнительные доходы', he: 'הכנסות נוספות', en: 'Additional Income' },
        { key: 'credit_income_employed.item_9', ru: 'Источник дополнительных доходов', he: 'מקור הכנסות נוספות', en: 'Source of Additional Income' },
        { key: 'credit_income_employed.item_10', ru: 'Тип трудоустройства', he: 'סוג העסקה', en: 'Employment Type' },
        { key: 'credit_income_employed.item_11', ru: 'Полная занятость', he: 'משרה מלאה', en: 'Full-time Employment' },
        { key: 'credit_income_employed.item_12', ru: 'Частичная занятость', he: 'משרה חלקית', en: 'Part-time Employment' },
        { key: 'credit_income_employed.item_13', ru: 'Контракт', he: 'חוזה', en: 'Contract' },
        { key: 'credit_income_employed.item_14', ru: 'Индивидуальный предприниматель', he: 'עוסק מורשה', en: 'Self-employed' },
        { key: 'credit_income_employed.item_15', ru: 'Телефон работодателя', he: 'טלפון המעסיק', en: 'Employer Phone' },
        { key: 'credit_income_employed.item_16', ru: 'Адрес работы', he: 'כתובת העבודה', en: 'Work Address' },
        { key: 'credit_income_employed.item_17', ru: 'Город', he: 'עיר', en: 'City' },
        { key: 'credit_income_employed.item_18', ru: 'Индекс', he: 'מיקוד', en: 'Postal Code' },
        { key: 'credit_income_employed.item_19', ru: 'Справка о доходах', he: 'אישור הכנסה', en: 'Income Certificate' },
        { key: 'credit_income_employed.item_20', ru: 'Прикрепить документ', he: 'צרף מסמך', en: 'Attach Document' },
        { key: 'credit_income_employed.item_21', ru: 'Сохранить изменения', he: 'שמור שינויים', en: 'Save Changes' },
        { key: 'credit_income_employed.item_22', ru: 'Продолжить', he: 'המשך', en: 'Continue' }
      ];
      
      let addedCount = 0;
      for (const item of items.rows) {
        const itemNumber = parseInt(item.content_key.match(/item_(\d+)/)?.[1] || '1');
        const translation = translations[itemNumber - 1];
        
        if (translation && (!item.text_ru || !item.text_he || !item.text_en)) {
          console.log(`  Adding translations for ${item.content_key}...`);
          
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
              ) VALUES ($1, $2, $3, 'approved', NOW(), NOW())
              ON CONFLICT (content_item_id, language_code) DO UPDATE SET
                content_value = EXCLUDED.content_value,
                status = 'approved',
                updated_at = NOW()
            `, [item.id, lang.code, lang.text]);
          }
          addedCount++;
        }
      }
      
      console.log(`✅ Added translations for ${addedCount} items`);
      
      // Verify the translations were added
      console.log('\n🔍 Verifying translations...');
      const verifyQuery = await pool.query(itemsQuery);
      const nowWithTranslations = verifyQuery.rows.filter(item => 
        item.text_ru && item.text_he && item.text_en
      );
      console.log(`📊 Now ${nowWithTranslations.length}/${verifyQuery.rows.length} items have complete translations`);
      
      if (nowWithTranslations.length > 0) {
        console.log('\n✨ Sample translations added:');
        nowWithTranslations.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.content_key}:`);
          console.log(`     RU: "${item.text_ru}"`);
          console.log(`     HE: "${item.text_he}"`);
          console.log(`     EN: "${item.text_en}"`);
        });
      }
    }
    
    console.log('\n✅ Credit income employed translations complete!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error fixing credit income employed translations:', error);
    await pool.end();
    process.exit(1);
  }
}

fixCreditIncomeEmployedTranslations();