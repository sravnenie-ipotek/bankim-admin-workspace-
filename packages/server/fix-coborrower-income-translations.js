const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;

// Meaningful business translations for co-borrower income fields
const COBORROWER_INCOME_TRANSLATIONS = {
  'credit_refi_coborrower_income.item_1': {
    en: 'Co-borrower Employment Status',
    he: 'סטטוס תעסוקה של לווה משותף',
    ru: 'Статус занятости созаемщика'
  },
  'credit_refi_coborrower_income.item_2': {
    en: 'Co-borrower Employer Name',
    he: 'שם המעסיק של לווה משותף',
    ru: 'Название работодателя созаемщика'
  },
  'credit_refi_coborrower_income.item_3': {
    en: 'Co-borrower Position/Title',
    he: 'תפקיד של לווה משותף',
    ru: 'Должность созаемщика'
  },
  'credit_refi_coborrower_income.item_4': {
    en: 'Co-borrower Monthly Salary',
    he: 'משכורת חודשית של לווה משותף',
    ru: 'Месячная зарплата созаемщика'
  },
  'credit_refi_coborrower_income.item_5': {
    en: 'Co-borrower Years of Employment',
    he: 'שנות ותק של לווה משותף',
    ru: 'Стаж работы созаемщика'
  },
  'credit_refi_coborrower_income.item_6': {
    en: 'Co-borrower Additional Income',
    he: 'הכנסה נוספת של לווה משותף',
    ru: 'Дополнительный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_7': {
    en: 'Co-borrower Income Type',
    he: 'סוג הכנסה של לווה משותף',
    ru: 'Тип дохода созаемщика'
  },
  'credit_refi_coborrower_income.item_8': {
    en: 'Co-borrower Tax Deductions',
    he: 'ניכויי מס של לווה משותף',
    ru: 'Налоговые вычеты созаемщика'
  },
  'credit_refi_coborrower_income.item_9': {
    en: 'Co-borrower Net Income',
    he: 'הכנסה נטו של לווה משותף',
    ru: 'Чистый доход созаемщика'
  },
  'credit_refi_coborrower_income.item_10': {
    en: 'Co-borrower Bonus Income',
    he: 'בונוסים של לווה משותף',
    ru: 'Бонусный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_11': {
    en: 'Co-borrower Commission Income',
    he: 'עמלות של לווה משותף',
    ru: 'Комиссионный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_12': {
    en: 'Co-borrower Self-Employment Income',
    he: 'הכנסה מעסק עצמאי של לווה משותף',
    ru: 'Доход от самозанятости созаемщика'
  },
  'credit_refi_coborrower_income.item_13': {
    en: 'Co-borrower Pension Income',
    he: 'פנסיה של לווה משותף',
    ru: 'Пенсионный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_14': {
    en: 'Co-borrower Investment Income',
    he: 'הכנסה מהשקעות של לווה משותף',
    ru: 'Инвестиционный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_15': {
    en: 'Co-borrower Rental Income',
    he: 'הכנסה משכירות של לווה משותף',
    ru: 'Доход от аренды созаемщика'
  },
  'credit_refi_coborrower_income.item_16': {
    en: 'Co-borrower Government Benefits',
    he: 'קצבאות ממשלתיות של לווה משותף',
    ru: 'Государственные пособия созаемщика'
  },
  'credit_refi_coborrower_income.item_17': {
    en: 'Co-borrower Alimony Income',
    he: 'דמי מזונות של לווה משותף',
    ru: 'Алименты созаемщика'
  },
  'credit_refi_coborrower_income.item_18': {
    en: 'Co-borrower Freelance Income',
    he: 'הכנסה מפרילנס של לווה משותף',
    ru: 'Доход от фриланса созаемщика'
  },
  'credit_refi_coborrower_income.item_19': {
    en: 'Co-borrower Part-Time Income',
    he: 'הכנסה מעבודה חלקית של לווה משותף',
    ru: 'Доход от частичной занятости созаемщика'
  },
  'credit_refi_coborrower_income.item_20': {
    en: 'Co-borrower Seasonal Income',
    he: 'הכנסה עונתית של לווה משותף',
    ru: 'Сезонный доход созаемщика'
  },
  'credit_refi_coborrower_income.item_21': {
    en: 'Co-borrower Income Verification',
    he: 'אימות הכנסה של לווה משותף',
    ru: 'Подтверждение дохода созаемщика'
  },
  'credit_refi_coborrower_income.item_22': {
    en: 'Co-borrower Income Documents',
    he: 'מסמכי הכנסה של לווה משותף',
    ru: 'Документы о доходах созаемщика'
  },
  'credit_refi_coborrower_income.item_23': {
    en: 'Co-borrower Income History',
    he: 'היסטוריית הכנסה של לווה משותף',
    ru: 'История доходов созаемщика'
  },
  'credit_refi_coborrower_income.item_24': {
    en: 'Co-borrower Total Monthly Income',
    he: 'סך הכנסה חודשית של לווה משותף',
    ru: 'Общий месячный доход созаемщика'
  }
};

async function fixCoborrowerIncomeTranslations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Fixing placeholder translations for credit_refi_coborrower_income\n');

    // Begin transaction
    await client.query('BEGIN');

    let updatedCount = 0;
    let errors = [];

    for (const [contentKey, translations] of Object.entries(COBORROWER_INCOME_TRANSLATIONS)) {
      // Get the content_item_id for this content_key
      const itemResult = await client.query(
        'SELECT id FROM content_items WHERE content_key = $1',
        [contentKey]
      );

      if (itemResult.rows.length === 0) {
        console.log(`⚠️  Content key not found: ${contentKey}`);
        continue;
      }

      const contentItemId = itemResult.rows[0].id;

      // Update translations for each language
      for (const [lang, translation] of Object.entries(translations)) {
        try {
          const result = await client.query(`
            UPDATE content_translations
            SET content_value = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE content_item_id = $2 
              AND language_code = $3
              AND status = 'approved'
          `, [translation, contentItemId, lang]);

          if (result.rowCount > 0) {
            updatedCount++;
            console.log(`✅ Updated ${lang} for ${contentKey}`);
          } else {
            // Try to insert if update didn't find the row
            const insertResult = await client.query(`
              INSERT INTO content_translations (content_item_id, language_code, content_value, status)
              VALUES ($1, $2, $3, 'approved')
              ON CONFLICT (content_item_id, language_code) 
              DO UPDATE SET content_value = $3, updated_at = CURRENT_TIMESTAMP
            `, [contentItemId, lang, translation]);
            
            if (insertResult.rowCount > 0) {
              updatedCount++;
              console.log(`✅ Inserted ${lang} for ${contentKey}`);
            }
          }
        } catch (err) {
          errors.push(`Error updating ${contentKey} (${lang}): ${err.message}`);
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated ${updatedCount} translations`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    // Verify the fix
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN content_value LIKE '%Field %' THEN 1 END) as placeholders
      FROM content_translations ct
      JOIN content_items ci ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_refi_coborrower_income'
    `);

    const stats = verifyResult.rows[0];
    console.log('\n📋 Verification:');
    console.log(`   Total translations: ${stats.total}`);
    console.log(`   Remaining placeholders: ${stats.placeholders}`);
    
    if (stats.placeholders === '0') {
      console.log('\n✅ SUCCESS: All placeholder translations have been replaced with meaningful content!');
    } else {
      console.log('\n⚠️  Some placeholders may still remain');
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixCoborrowerIncomeTranslations();